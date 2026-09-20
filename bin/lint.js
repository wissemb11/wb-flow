#!/usr/bin/env node
/**
 * bin/lint.js — `wb-flow lint <plan.md>`
 *
 * Enforces the 7-point self-correct checklist from /wbPlan's Consolidate &
 * Structure Repair Mode.  Each check maps to one of the template's numbered
 * steps (0–6) and gates on the ADR's per-point checkability classification.
 *
 * Exit code: count of failed steps.  0 = everything that can be enforced
 * passes.  Non-zero = at least one step failed — the output maps 1:1 onto the
 * template's own steps.
 *
 * Calls sync_check.sh as its step-5 backend, unchanged.
 *
 * Zero dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
// step-7 reads the roster the DISPATCHER would resolve — never its own copy.
// Two resolvers is A15 ("model --show and wave resolve the roster by two
// different algorithms and read two different files"), closed 2026-08-15.
const WV = require('./wave_parser');
const MODEL = require('./model.js');
const { ROLES } = require('./wave_constants');
const MATRIX_HEADING_TEXT = '## \u{1F30A} Next Executable Sequence';

const PKG_ROOT = path.resolve(__dirname, '..');
const SYNC_CHECK = path.join(PKG_ROOT, 'templates', 'commands', '_shared', 'sync_check.sh');

const HELP = `
  wb-flow lint — enforce the 7-point self-correct checklist on a plan file

  Usage: wb-flow lint <plan.md> [options]
         wb-flow lint --all [<scope-dir>]

  Runs each checkable point from /wbPlan's Consolidate & Structure Repair Mode
  against the plan and reports pass / fail per step.  A red output maps 1:1
  onto the template's own numbered steps so you know exactly what to fix.

  Steps:
    0 · open-task absorption  (⚠️ partial — Dep chain + ID contiguity)
    1 · link & href repair     (✅ full — four-rule detection + resolution)
    2 · structural alignment   (✅ full — mandatory sections in canonical order)
    3 · wave externalization   (✅ full — no inline wave notes)
    4 · cell batching          (⚠️ partial — D4 self-validation + <placeholder>)
    5 · derived-block sync     (✅ full — shells out to sync_check.sh)
    6 · archive sweep          (❌ not enforceable — invocation state)
    7 · roster freshness       (✅ full — §10 rule 5b drift + rule 12 Multi-ID batching)
    8 · task-table column count (✅ full — unescaped pipe check)
    9 · vacuous Verify clauses (✅ full — V1-V9 structural oracle checks)
    10 · budget consistency  (✅ full — Plan Budget task count vs table rows)

  Options:
    --include-closed       Include already-closed task rows in step 9
    --check-open-oracles   Execute open rows' Verify cells and fail if they already pass
    --help, -h             Show this message
`;

function findScopeDir(planPath) {
  let dir = path.resolve(path.dirname(planPath));
  for (;;) {
    if (fs.existsSync(path.join(dir, '.wb'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

// Keep this in the same shape as wave.js: matrix command targets are resolved
// from the outermost repo root, with `.wb` only as a fallback.
function findRepoRoot(from) {
  let dir = path.resolve(from);
  let git = null;
  let wb = null;
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) git = dir;
    if (fs.existsSync(path.join(dir, '.wb')) && !wb) wb = dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return git || wb || path.resolve(from);
}

function scopeName(planPath) {
  const m = path.basename(planPath).match(/^plan_(.+)_\d{8}\.md$/);
  return m ? m[1] : path.basename(planPath, '.md');
}

// Is this file a PLAN (as opposed to a report — an audit, review, task report or
// loop log)? The discriminator is the front-matter `type:` field: a plan names the
// 🧠 Planner role (or the plain `plan`); a report names its own role (`🔍 Auditor`,
// `🔨 Worker`, `🚀 Release`, …). This is the C60 discriminator: everything that
// ships a 🌊 matrix is *linted*, but only a plan gets the full plan schema (steps
// 0-4, 8-11). The plan schema was being run over report files and producing
// failures ("no task rows found", "missing section Task Table", …) that describe
// no defect in a document that is not a plan.
//
// The DEFAULT is "plan": a file with no typed front-matter (or an unknown type) is
// linted with the full schema — exactly the pre-C60 behaviour. Only a file whose
// `type:` explicitly names a report role is downgraded to matrix-checks-only, so a
// legacy/minimal plan without front-matter still fails its schema lint.
function isPlanFile(content) {
  const m = String(content || '').match(/^type:\s*(.+?)\s*$/m);
  if (!m) return true; // no type field → assume a plan (historical default)
  const type = m[1].trim();
  if (/\bPlanner\b/i.test(type) || type.toLowerCase() === 'plan') return true;
  if (/\b(Auditor|audit|review|Worker|Mechanical|Validator|Release|Loop|report|findings|trace)\b/i.test(type)) return false;
  return true; // unknown type → assume a plan
}

// ── table parsing (minimal — lifted from wave.js splitRow logic) ──────────────

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  let unescapedBackticks = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '`' && (i === 0 || trimmed[i - 1] !== '\\')) unescapedBackticks++;
  }
  if (unescapedBackticks % 2 === 1) {
    const fallback = [];
    let fallbackCur = '';
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '|' && (i === 0 || trimmed[i - 1] !== '\\')) {
        fallback.push(fallbackCur.trim());
        fallbackCur = '';
      } else {
        fallbackCur += trimmed[i];
      }
    }
    fallback.push(fallbackCur.trim());
    return fallback;
  }

  const parts = [];
  let cur = '';
  let inBacktick = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '`' && (i === 0 || trimmed[i - 1] !== '\\')) {
      inBacktick = !inBacktick;
      cur += ch;
    } else if (ch === '|' && !inBacktick) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur.trim());
  return parts;
}

function isTaskTableHeading(line) {
  return /^##\s+.*Task\s+(Table|List)\b/i.test(line.trim());
}

function normalizeHeaderCell(cell) {
  return String(cell || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function columnIndex(headers, names) {
  const normalized = headers.map(normalizeHeaderCell);
  for (let i = 0; i < normalized.length; i++) {
    if (names.indexOf(normalized[i]) !== -1) return i;
  }
  for (let i = 0; i < headers.length; i++) {
    const h = normalized[i];
    for (const name of names) {
      if (name === '#') continue;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('(^|\\s)' + escaped + '($|\\s)').test(h)) return i;
    }
  }
  return -1;
}

function extractTaskId(cell) {
  const value = String(cell || '').trim();
  const linked = value.match(/^\[([A-Za-z]?\d+(?:\.\d+)*)\]/);
  if (linked) return linked[1];
  const plain = value.match(/^([A-Za-z]?\d+(?:\.\d+)*)\b/);
  return plain ? plain[1] : null;
}

function normalizeTaskText(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[*_`#]|📄/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse plan table → [{id, done, valid, dep, task}] */
function parseTaskTable(content) {
  const rows = [];
  const lines = content.split('\n');

  let inTable = false;
  let columns = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) {
      inTable = false;
      columns = null;
      continue;
    }

    const cells = splitRow(line);
    if (cells.length < 4) continue;

    const maybeColumns = {
      id: columnIndex(cells, ['#']),
      dep: columnIndex(cells, ['dep', 'depends']),
      task: columnIndex(cells, ['task']),
      done: columnIndex(cells, ['done']),
      valid: columnIndex(cells, ['valid'])
    };
    if (maybeColumns.id >= 0 && maybeColumns.task >= 0 && maybeColumns.done >= 0 && maybeColumns.valid >= 0) {
      inTable = true;
      columns = maybeColumns;
      continue;
    }

    if (!inTable || !columns) continue;

    if (/^\s*:?-{2,}:?\s*$/.test(cells[0] || '')) continue;

    const id = extractTaskId(cells[columns.id]);
    if (!id) continue;

    rows.push({
      id: id,
      done: (cells[columns.done] || '').trim(),
      valid: (cells[columns.valid] || '').trim(),
      dep: columns.dep >= 0 ? (cells[columns.dep] || '').replace(/—/g, '').trim() : '',
      task: (cells[columns.task] || '').trim(),
    });
  }
  return rows;
}

function isDone(doneCell) {
  return /✅/.test(doneCell);
}

function isOpen(doneCell, validCell) {
  if (doneCell && typeof doneCell === 'object') {
    validCell = doneCell.valid;
    doneCell = doneCell.done;
  }
  // Cancelled and Deferred rows are decided, not open work (§13.2).
  const done = String(doneCell || '');
  const valid = String(validCell || '');
  if (/🚫|Cancelled|⏸️|Deferred/i.test(done) || /🚫|Cancelled|⏸️|Deferred|n\/a/i.test(valid)) {
    return false;
  }
  return /⬜|🔨/.test(done) || /⬜|🔨/.test(valid);
}

function openColumns(row) {
  const cols = [];
  if (/⬜|🔨/.test(row.done || '')) cols.push('Done');
  if (/⬜|🔨/.test(row.valid || '')) cols.push('Valid');
  return cols.join('+') || 'unknown';
}

// ── step 0 — open-task absorption check ───────────────────────────────────────

function checkStep0(content, planPath, scopeDir) {
  const fails = [];

  const rows = parseTaskTable(content);
  if (rows.length === 0) {
    fails.push('no task rows found — cannot check ID contiguity or Dep chain');
    return fails;
  }

  const ids = rows.map((r) => r.id).filter((id) => /^\d+$/.test(id)).map(Number);
  if (ids.length > 0) {
    const min = Math.min.apply(null, ids);
    const max = Math.max.apply(null, ids);
    if (min !== 1) fails.push('step-0: first task id is not 1');
    const present = new Set(ids);
    for (let i = min; i <= max; i++) {
      if (!present.has(i)) fails.push('step-0: id ' + i + ' is missing (ids must be contiguous)');
    }
  }

  const idSet = new Set(rows.map(function (r) { return r.id; }));
  for (const r of rows) {
    const dep = r.dep;
    if (!dep || dep === '—' || dep === '-') continue;
    for (const token of dep.split(/[, ]+/)) {
      const d = token.trim();
      if (!d) continue;
      if (!idSet.has(d)) {
        fails.push('step-0: Dep ' + d + ' (from id ' + r.id + ') does not reference an existing task');
      }
    }
  }

  if (scopeDir) {
    const reportsDir = path.join(scopeDir, '.wb', 'workflows', 'reports');
    if (fs.existsSync(reportsDir)) {
      const thisFileName = path.basename(planPath);
      const thisDate = (thisFileName.match(/_(\d{8})\.md$/) || [])[1] || '';

      function walkReports(dir, depth) {
        if (depth > 6) return [];
        const results = [];
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_e) { return results; }
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory() && !/^(tasks|waves|explanations|ideas_reports)$/.test(e.name)) {
            results.push.apply(results, walkReports(full, depth + 1));
          } else if (e.isFile() && /^plan_.+_\d{8}\.md$/.test(e.name) && e.name !== thisFileName) {
            results.push(full);
          }
        }
        return results;
      }

      const olderPlans = walkReports(reportsDir, 0)
        .filter(function (p) {
          const m = path.basename(p).match(/_(\d{8})\.md$/);
          return m && m[1] < thisDate;
        })
        .sort(); // oldest first

      for (const op of olderPlans) {
        let opContent;
        try { opContent = fs.readFileSync(op, 'utf-8'); } catch (_e) { continue; }
        const opRows = parseTaskTable(opContent);
        const openRows = opRows.filter(function (r) { return isOpen(r.done, r.valid); });
        for (const or of openRows) {
          const taskText = normalizeTaskText(or.task).slice(0, 80);
          const foundInCurrent = rows.some(function (cr) {
            const ct = normalizeTaskText(cr.task).slice(0, 80);
            return ct === taskText;
          });
          if (!foundInCurrent) {
            const shortName = path.basename(op);
            fails.push('step-0: open row ' + or.id + ' (' + openColumns(or) + ' open: ' + taskText.slice(0, 60) + '…) from ' + shortName + ' is not absorbed into this plan');
          }
        }
      }
    }
  }

  return fails;
}

// ── step 1 — link & href repair ───────────────────────────────────────────────

function maskMarkdownCode(content) {
  const lines = content.split('\n');
  let inFence = false;
  const masked = [];

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      masked.push(' '.repeat(line.length));
      continue;
    }
    if (inFence) {
      masked.push(' '.repeat(line.length));
      continue;
    }
    masked.push(line.replace(/`[^`\n]*`/g, function (s) { return ' '.repeat(s.length); }));
  }

  return masked.join('\n');
}

function normalizeMarkdownHref(href) {
  let out = href.trim();

  // CommonMark permits an optional title after the destination:
  //   [label](file.md "title")
  // Strip that title before resolving the filesystem path.
  const titled = out.match(/^(\S+)\s+(?:"[^"]*"?|'[^']*'?|\([^)]*\)?)\s*$/);
  if (titled) out = titled[1];

  if (out.charAt(0) === '<' && out.charAt(out.length - 1) === '>') {
    out = out.slice(1, -1);
  }

  return out.split('#')[0];
}

function checkStep1(content, planPath) {
  const fails = [];
  const planDir = path.dirname(planPath);

  // Collect ALL markdown links: [label](href) — but NOT inside inline code.
  //
  // A `Verify` oracle is a backticked shell/JS command, and JS regularly writes
  // `[...]` immediately followed by `(`. Row 5's oracle contains
  //   ['claude-pro'/.test(src))throw new Error(…)
  // which the naive scan read as a link with a "slash in label" and failed a
  // perfectly valid plan. A gate that cries wolf on its own task table is a gate
  // people learn to ignore, so code spans are masked out before scanning.
  const masked = maskMarkdownCode(content);
  const linkRe = /\[([^\]]*)\]\(([^()]*(?:\([^)]*\)[^()]*)*)\)/g;
  let m;
  const links = [];
  while ((m = linkRe.exec(masked)) !== null) {
    links.push({ label: m[1], href: m[2], index: m.index });
  }

  for (const link of links) {
    const { label, href } = link;
    // Rule 1: label == href
    if (label === href) {
      fails.push('step-1: label == href — [' + label.slice(0, 60) + '](' + href.slice(0, 60) + ')');
      continue;
    }
    // Rule 4: label is absolute
    if (label.charAt(0) === '/') {
      fails.push('step-1: absolute label — [' + label.slice(0, 60) + '](…)');
      continue;
    }
    // Rule 3: label contains .., …, or starts with ./
    if (/\.\.|…|^\.\//.test(label)) {
      fails.push('step-1: path-fragment label — [' + label.slice(0, 60) + '](…)');
      continue;
    }
    // Rule 2: label contains a / other than a single trailing slash
    // Skip if label is backtick-enclosed (intentional code/command display)
    if (!/^`.*`$/.test(label)) {
      const stripped = label.replace(/\/$/, '');
      if (stripped.indexOf('/') !== -1) {
        fails.push('step-1: slash-in-label — [' + label.slice(0, 60) + '](…)');
        continue;
      }
    }
  }

  const isTemplate = planPath.indexOf('/templates/') !== -1 || planPath.endsWith('_template.md');

  // Resolve relative hrefs and flag misses
  for (const link of links) {
    const href = link.href;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#') || href.charAt(0) === '/')
      continue;
    if (href.includes('<') || href.includes('>') || href.includes('...') || href.includes('href') || href.includes('path/to'))
      continue;
    if (isTemplate) {
      if (/tasks\/|ideas_reports\/|tasks_reports\/|\.\.\/plans\/|\.\.\/audits\/|\.\.\/ideas\/|\.\.\/nexts\/|\.\.\/contexts\/|\.\.\/tracks\/|\.\.\/archives\/|context\.md|dev\.md|plan_X|plan_|audit_|idea_|next_|track_|packages\//.test(href)) {
        continue;
      }
    }
    const targetHref = normalizeMarkdownHref(href);
    const resolved = path.resolve(planDir, targetHref);
    if (!fs.existsSync(resolved)) {
      fails.push('step-1: broken href — ' + href.slice(0, 80) + ' (resolved: ' + resolved.slice(0, 80) + ')');
    }
  }

  return fails;
}

// ── step 2 — structural alignment ─────────────────────────────────────────────

function checkStep2(content) {
  const fails = [];
  const lines = content.split('\n');

  // Extract H2 headings in order
  const headings = [];
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^## (.+)/);
    if (h) headings.push({ text: h[1], line: i + 1 });
  }

  const required = [
    { text: /\bTask Table\b/i, name: 'Task Table' },
    { text: /\bNext Executable Sequence\b/i, name: 'Next Executable Sequence' },
    { text: /\bHow to run this plan\b/i, name: 'How to run this plan' },
    { text: /\bAction Types\b/i, name: 'Action Types' },
    { text: /🧭\s*What.s Next/i, name: "What's Next?" },
    { text: /\bGenerated Files\b/i, name: 'Generated Files' },
  ];

  // Check presence
  const present = new Set();
  for (const h of headings) {
    for (const r of required) {
      if (r.text.test(h.text)) present.add(r.name);
    }
  }
  for (const r of required) {
    if (!present.has(r.name)) fails.push('step-2: missing section "' + r.name + '"');
  }

  // Check order (the required sections must appear in the order listed above)
  const order = [];
  for (const h of headings) {
    for (const r of required) {
      if (r.text.test(h.text)) order.push(r.name);
    }
  }
  let orderOk = true;
  let lastIdx = -1;
  for (const name of order) {
    const curIdx = required.findIndex(function (r) { return r.name === name; });
    if (curIdx < lastIdx) { orderOk = false; break; }
    lastIdx = curIdx;
  }
  if (!orderOk) {
    fails.push('step-2: section ordering invalid. Expected: Task Table → Next Executable Sequence → How to run this plan → Action Types → What\'s Next? → Generated Files');
  }

  // Check front-matter (---) at or near file start
  const firstTen = lines.slice(0, 10).join('\n');
  if (!/^---/.test(firstTen)) fails.push('step-2: missing front-matter (---) block at file start');

  // Check status callout
  if (!/\*\*Status:\*\*/.test(content)) fails.push('step-2: missing Status callout');

  // Check HOW_TO_RUN markers
  if (!/<!-- HOW_TO_RUN_START -->/.test(content)) fails.push('step-2: missing HOW_TO_RUN_START marker');
  if (!/<!-- HOW_TO_RUN_END -->/.test(content)) fails.push('step-2: missing HOW_TO_RUN_END marker');

  return fails;
}

// ── step 3 — missing-section insertion & wave externalization ──────────────────

function checkStep3(content, planPath) {
  const fails = [];
  const planDir = path.dirname(planPath);

  // No inline ### Wave notes heading
  if (/^###\s+Wave\s+[Nn]otes/im.test(content)) {
    fails.push('step-3: inline "### Wave notes" heading found — must be externalized to tasks/waves.md');
  }

  // Wave notes callout exists
  if (!/>\s*📝\s+\*\*Wave\s+[Nn]otes/i.test(content)) {
    fails.push('step-3: missing "> 📝 **Wave Notes…" callout in the 🌊 matrix section');
  }

  // tasks/waves.md resolves on disk
  const wavesPath = path.join(planDir, 'tasks', 'waves.md');
  if (!fs.existsSync(wavesPath)) {
    fails.push('step-3: tasks/waves.md does not exist — wave notes are not externalized');
  }

  return fails;
}

// ── step 4 — cell batching & D4 self-validation ───────────────────────────────

function checkStep4(content) {
  const fails = [];

  // All four Copy/Paste scenario blocks present
  const blocks = [
    /#### 1\.\s*Next wave execution/,
    /#### 2\.\s*Next wave dispatches/,
    /#### 3\.\s*All remaining waves execution/,
    /#### 4\.\s*All remaining waves dispatches/,
  ];
  for (const b of blocks) {
    if (!b.test(content)) {
      fails.push('step-4: missing copy/paste scenario block: ' + b.toString().slice(1, 60));
    }
  }

  // Extract the matrix section text only (between ## 🌊 and the next ## or the
  // copy/paste block start)
  const matrixStart = content.indexOf('## 🌊 Next Executable Sequence');
  let matrixText = '';
  if (matrixStart !== -1) {
    // Stop at Copy/Paste block or next major section
    const stopAt = content.indexOf('### 📋 Copy/Paste', matrixStart);
    const nextSection = content.indexOf('\n## ', matrixStart + 3);
    const end = stopAt !== -1 ? stopAt :
                nextSection !== -1 ? nextSection :
                content.length;
    matrixText = content.slice(matrixStart, end);
  }

  // No <placeholder> in matrix cells — match literal "<placeholder>" or
  // two-word template forms like "<plan path>", "<model name>" — but NOT
  // single-word HTML tags (<br>, <sub>, <span>) which are valid markdown.
  const placeholderRe = /^\|\s*\*\*[A-Z].*<(placeholder|[a-z]+ [a-z]+)>/m;
  if (placeholderRe.test(content)) {
    fails.push('step-4: matrix cell contains a <placeholder> or template variable');
  }
  // Also check for unexpanded $VAR in the command portion of matrix cells (but allow -M=$WORKER)
  if (matrixText) {
    const dispatches = matrixDispatchCommands(matrixText);
    for (const d of dispatches) {
      const cmdWithoutM = d.command
        .replace(/-M=\$[A-Za-z_][A-Za-z0-9_]*/g, '')
        .replace(/--model=\$[A-Za-z_][A-Za-z0-9_]*/g, '');
      if (/\$[A-Za-z_][A-Za-z0-9_]*/.test(cmdWithoutM)) {
        fails.push('step-4: matrix cell command contains an unexpanded $VAR');
        break;
      }
    }
  }

  // Every dispatch in the MATRIX (not copy/paste blocks) carries an explicit
  // model assignment — either -M= in the command or → *ModelName* in context
  const dispatches = matrixDispatchCommands(matrixText);
  for (const d of dispatches) {
    const cmd = d.command;
    if (!/^\/wb(Work|Valid)\s+/i.test(cmd)) continue;
    if (/--wave=|-W=/.test(cmd)) continue;
    const hasM = /-M[= ]/.test(cmd) || /--model[= ]/.test(cmd);
    const hasModelAnnot = d.suggestedModel || /in-session|\(auto\)|\(in-session\)/.test(d.cell || '');
    if (!hasM && !hasModelAnnot) {
      fails.push('step-4: matrix dispatch missing model assignment: `' + cmd.slice(0, 80) + '…`');
    }
  }

  // Also check copy/paste blocks for -M= flags
  const copyPasteSection = content.slice(content.indexOf('### 📋 Copy/Paste') > -1 ? content.indexOf('### 📋 Copy/Paste') : 0);
  if (copyPasteSection) {
    const cpEnd = copyPasteSection.indexOf('### 🚀');
    const cpText = cpEnd > -1 ? copyPasteSection.slice(0, cpEnd) : copyPasteSection;
    const fenceRe = /```[^\n]*\n([\s\S]*?)```/g;
    let fm;
    while ((fm = fenceRe.exec(cpText)) !== null) {
      const blockText = fm[1];
      const cmdRe = /(\/wb(Work|Valid)\s+[^\n]*)/g;
      let cm;
      while ((cm = cmdRe.exec(blockText)) !== null) {
        const cmd = cm[1].trim();
        if (/--wave=|-W=/.test(cmd)) continue;
        if (!/-M[= ]/.test(cmd) && !/--model[= ]/.test(cmd)) {
          // In-session commands are a special case — they don't need -M=
          const absoluteIndex = cpText.indexOf(cm[0], fm.index);
          const ac = cpText.slice(absoluteIndex + cm[0].length, absoluteIndex + cm[0].length + 200);
          if (!/in-session|\(auto\)|# in-session|human|\(human\)|manual/.test(ac) && !/in-session|\(auto\)|# in-session|human|\(human\)|manual/.test(cmd)) {
            fails.push('step-4: copy/paste dispatch missing -M= flag: `' + cmd.slice(0, 80) + '…`');
          }
        }
      }
    }
  }

  // D4 invariant: no self-validation. A row whose executor (☐ Done) and validator
  // (☐ Valid) resolve to the same model is self-validation, checked per id across
  // both merged and single-id /wbValid cells. The ☐ Valid column is where the model
  // that actually validated is recorded — the matrix's `→ *Model*` is only a routing
  // suggestion made before the run, and a trailing free-text annotation on the Done
  // cell ("*(orchestrator — …)*", "(Zen)") must not switch the comparison off.
  const doneMap = {};
  const validMap = {};
  const rows = parseTaskTable(content);
  for (const r of rows) {
    doneMap[r.id] = r.done;
    validMap[r.id] = r.valid;
  }

  // Strip a trailing "· …" tail, or a "*(…)*" / "(…)" annotation, which otherwise
  // poisons canonicalModelName (the annotation rides along inside the "model name").
  function stripAnnotation(s) {
    return String(s || '')
      .replace(/·.*/, '')
      .replace(/\s*\*?\([^()]*\)\*?\s*$/, '')
      .trim();
  }

  function executorFromDone(doneCell) {
    if (!doneCell) return 'unknown';
    // Strip HTML tags, keep the model name
    const clean = doneCell.replace(/<[^>]+>/g, ' ').trim();
    // Patterns: "✅ opencode-go/deepseek-v4-pro" or "✅ Claude Opus 5" or "✅ Model1"
    const m = clean.match(/✅\s*(.+?)(?:\s*$)/);
    if (!m) return clean.replace(/[^a-zA-Z0-9/._-]/g, '').trim();
    return stripAnnotation(m[1]);
  }

  function validatorFromValid(validCell) {
    if (!validCell || !/✅/.test(validCell)) return 'unknown';
    const clean = validCell.replace(/<[^>]+>/g, ' ').replace(/✅/g, '').trim();
    // Drop the leading score ("10/10 ") before the model name.
    const s = clean.replace(/^\d+\s*\/\s*\d+\s*/, '').trim();
    return stripAnnotation(s) || 'unknown';
  }

  // D4: walk MATRIX cells (not copy/paste blocks) looking for /wbValid dispatches.
  if (matrixText) {
    const validCmdRe = /`(\/wbValid\s+[^`]+)`/g;
    let m;
    while ((m = validCmdRe.exec(matrixText)) !== null) {
      const cmd = m[1];
      const idMatch = cmd.match(/--id[= ](\d+(?:,\d+)*)/);
      if (!idMatch) continue;
      const ids = idMatch[1].split(',').map(function (s) { return s.trim(); }).filter(Boolean);

      for (const id of ids) {
        const executor = executorFromDone(doneMap[id]);
        if (!executor || executor === 'unknown') continue;
        const validator = validatorFromValid(validMap[id]);
        if (!validator || validator === 'unknown') continue;

        const valCanon = canonicalModelName(validator);
        const execCanon = canonicalModelName(executor);
        if (sameModelOrFamily(valCanon, execCanon)) {
          fails.push('step-4: D4 self-validation — /wbValid --id=' + ids.join(',') + ' validated by ' + validator + ' which also executed id ' + id);
          break;
        }
      }
    }
  }

  return fails;
}

function matrixDispatchCommands(matrixText) {
  const out = [];
  if (!matrixText) return out;
  const matrix = WV.parseMatrix(matrixText);
  if (!matrix || !matrix.rows) return out;
  for (const row of matrix.rows) {
    row.cells.forEach(function (cell, i) {
      const role = row.roleOf[i];
      if (!role) return;
      const parsed = WV.parseCell(cell, role, row.label);
      parsed.forEach(function (p) {
        if (p.human) return;
        (p.prelude || []).forEach(function (cmd) {
          out.push({ command: cmd, cell: cell, suggestedModel: p.suggestedModel });
        });
        if (p.command) {
          out.push({ command: p.command, cell: cell, suggestedModel: p.suggestedModel });
        }
      });
    });
  }
  return out;
}

function runSelfTest() {
  const failures = [];
  function ok(cond, msg) {
    if (!cond) failures.push(msg);
  }

  const proseMatrix = [
    '## 🌊 Next Executable Sequence',
    '',
    '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
    '|---|---|---|---|---|',
    '| **A · 🔨 work** | — | — | `/wbWork plan.md --id=1 -M=$WORKER`<br>→ *$WORKER*<br><sub>Note: do not dispatch `/wbValid plan.md --id=1`; it is prose only.</sub> | — |',
    '',
    '### 📋 Copy/Paste Execution Scenarios',
    '#### 1. Next wave execution',
    '```bash',
    '/wbWork plan.md --wave=A -y',
    '```',
    '#### 2. Next wave dispatches',
    '```bash',
    '/wbWork plan.md --id=1 -M=$WORKER',
    '```',
    '#### 3. All remaining waves execution',
    '```bash',
    '/wbWork plan.md --wave=all -y',
    '```',
    '#### 4. All remaining waves dispatches',
    '```bash',
    '/wbWork plan.md --id=1 -M=$WORKER',
    '```',
  ].join('\n');
  const proseFails = checkStep4(proseMatrix);
  ok(!proseFails.some(function (f) { return /missing model assignment/.test(f); }),
    'step-4 must ignore prose mentions of dispatch commands');

  const realDispatchMissingModel = proseMatrix.replace(
    '`/wbWork plan.md --id=1 -M=$WORKER`<br>→ *$WORKER*',
    '`/wbWork plan.md --id=1`'
  );
  const realFails = checkStep4(realDispatchMissingModel);
  ok(realFails.some(function (f) { return /missing model assignment/.test(f); }),
    'step-4 must still fail real matrix dispatches without model routing');

  console.log('lint self-test');
  if (failures.length) {
    failures.forEach(function (f) { console.log('  ✗ ' + f); });
    console.log('0 passed, ' + failures.length + ' failed');
    return 1;
  }
  console.log('  ✓ prose command mentions are not dispatch cells');
  console.log('  ✓ real dispatch cells still require model routing');
  console.log('2 passed, 0 failed');
  return 0;
}

// ── step 5 — derived-block sync (shell out to sync_check.sh) ───────────────────

function checkStep5(planPath, isPlan) {
  const fails = [];
  // The sync_check.sh derived-block check needs a task table to judge completeness;
  // a report file has none. Skip it for non-plans (C60) but KEEP the matrix target
  // resolution below — that is the "carries a 🌊 matrix" check, keyed on the matrix,
  // not on plan-ness.
  if (isPlan === undefined || isPlan) {
    if (!fs.existsSync(SYNC_CHECK)) {
      fails.push('step-5: sync_check.sh not found at ' + SYNC_CHECK);
      return fails;
    }
    try {
      const result = cp.spawnSync('bash', [SYNC_CHECK, planPath], { encoding: 'utf-8', timeout: 10000 });
      const out = (result.stdout + result.stderr).trim();
      if (result.status !== 0) {
        const lines = out.split('\n').filter(function (l) { return l.length > 0; });
        for (const l of lines) {
          if (/^✗/.test(l)) fails.push('step-5: ' + l.slice(2).trim());
          else fails.push('step-5: ' + l);
        }
      }
    } catch (e) {
      fails.push('step-5: failed to run sync_check.sh — ' + e.message);
    }
  }
  try {
    const content = fs.readFileSync(planPath, 'utf8');
    const knownIds = new Set(parseTaskTable(content).map(function (r) { return r.id; }));
    // Matrix dispatch targets are repo-root-relative (per C45). A plan outside any
    // repo (a synthetic/temp plan) yields its own dir as the fallback root, which
    // misses monorepo-relative targets; add the invocation dir's repo root so both
    // real plans and temp fixtures resolve against the same base.
    const repoRoots = [findRepoRoot(path.dirname(planPath))];
    const cwdRepoRoot = findRepoRoot(process.cwd());
    if (cwdRepoRoot !== repoRoots[0]) repoRoots.push(cwdRepoRoot);
    const missing = new Set();
    for (const dispatch of matrixDispatchCommands(content)) {
      const parsed = WV.splitCommand(dispatch.command);
      if (!parsed) continue;
      if (/\.md$/.test(parsed.target || '') && !repoRoots.some(function (r) { return fs.existsSync(path.join(r, parsed.target)); })) {
        fails.push('step-5: matrix dispatch target does not resolve from repo root: ' + parsed.target);
      }
      if (knownIds.size > 0 && parsed.ids && parsed.ids.length > 0) {
        parsed.ids.forEach(function (id) {
          if (id && !knownIds.has(id)) missing.add(id);
        });
      }
    }
    if (knownIds.size > 0) {
      Array.from(missing).sort().forEach(function (id) {
        fails.push('step-5: matrix dispatch references unknown id ' + id + ' — no row exists in the task table');
      });
    }
  } catch (e) {
    fails.push('step-5: failed to compare matrix ids with task rows — ' + e.message);
  }
  return fails;
}

// ── step 10 — Plan Budget Estimate consistency ───────────────────────────────

function budgetSection(content) {
  const lines = String(content || '').split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{2,}\s+.*(?:Plan\s+)?Budget Estimate\b/i.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{2,}\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

function normalizeBudgetMetric(cell) {
  return String(cell || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function budgetMetricValue(section, metricName) {
  if (!section) return null;
  const want = normalizeBudgetMetric(metricName);
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (cells.length < 2) continue;
    if (normalizeBudgetMetric(cells[0]) === want) return cells[1].trim();
  }
  return null;
}

function numericValue(value) {
  const m = String(value || '').match(/([0-9]+)/);
  return m ? Number(m[1]) : null;
}

function budgetTaskCount(section) {
  if (!section) return null;
  const countLabels = new Set(['total tasks', 'total rows', 'tasks']);
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (cells.length < 2) continue;
    const metric = normalizeBudgetMetric(cells[0]);
    if (!countLabels.has(metric)) continue;

    for (let i = cells.length - 1; i >= 1; i--) {
      const n = numericValue(cells[i]);
      if (n !== null) return { value: n, label: metric, raw: cells[i].trim() };
    }
  }
  return null;
}

function budgetDoneOpenBreakdown(value) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const m = text.match(/^([0-9]+)\s*\(\s*([0-9]+)\s+closed\s*·\s*([0-9]+)\s+open\s*\)$/i);
  if (!m) return null;
  return {
    total: Number(m[1]),
    closed: Number(m[2]),
    open: Number(m[3])
  };
}

function displayBudgetMetric(metric) {
  if (metric === 'total rows') return 'Total rows';
  if (metric === 'tasks') return 'Tasks';
  return 'Total tasks';
}

function checkStep10(content) {
  const fails = [];
  const section = budgetSection(content);
  if (!section) return fails;

  const rows = parseTaskTable(content);
  if (!rows.length) return fails;

  const declaredTasks = budgetTaskCount(section);
  if (!declaredTasks) return fails;

  if (declaredTasks.value !== rows.length) {
    fails.push('step-10: Budget ' + displayBudgetMetric(declaredTasks.label) + ' says ' + declaredTasks.value +
      ', but the task table has ' + rows.length + ' row' + (rows.length === 1 ? '' : 's'));
  }

  const doneOpenBreakdown = budgetDoneOpenBreakdown(declaredTasks.raw);
  if (doneOpenBreakdown) {
    const openRows = rows.filter(function (r) { return isOpen(r); }).length;
    const closedRows = rows.length - openRows;
    if (doneOpenBreakdown.total !== rows.length) {
      fails.push('step-10: Budget ' + displayBudgetMetric(declaredTasks.label) + ' breakdown total says ' + doneOpenBreakdown.total +
        ', but the task table has ' + rows.length + ' row' + (rows.length === 1 ? '' : 's'));
    }
    if (doneOpenBreakdown.closed !== closedRows || doneOpenBreakdown.open !== openRows) {
      fails.push('step-10: Budget ' + displayBudgetMetric(declaredTasks.label) + ' breakdown says ' + doneOpenBreakdown.closed + ' closed / ' +
        doneOpenBreakdown.open + ' open, but the task table has ' + closedRows + ' closed / ' + openRows + ' open');
    }
    if (doneOpenBreakdown.closed + doneOpenBreakdown.open !== doneOpenBreakdown.total) {
      fails.push('step-10: Budget ' + displayBudgetMetric(declaredTasks.label) + ' breakdown parts sum to ' +
        (doneOpenBreakdown.closed + doneOpenBreakdown.open) + ', not ' + doneOpenBreakdown.total);
    }
  }

  return fails;
}

// ── step 8 — task-table column count ──────────────────────────────────────────

function checkStep8(content) {
  const fails = [];
  const lines = content.split('\n');
  let inTable = false;
  let headerCount = 0;
  let requiresIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inTable && isTaskTableHeading(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (line.trim().startsWith('#')) break;
    if (!line.trim().startsWith('|')) continue;
    if (/^\s*\|?\s*:?-+:?\s*\|/.test(line.trim()) || line.includes('---')) continue;

    const parts = line.split(/(?<!\\)\|/);
    if (headerCount === 0) {
      headerCount = parts.length;
      requiresIdx = parts.findIndex(function (c) { return /^\s*Requires\s*$/.test(c.trim()); });
      continue;
    }

    const idm = (parts[1] || '').trim().match(/^\[?([A-Za-z]?\d+(?:\.\d+)*)\]?/);
    if (!idm) continue;
    const rowId = idm[1];

    if (parts.length !== headerCount) {
      fails.push('step-8: column count mismatch in task row ' + rowId + ' — got ' + parts.length + ' columns, expected ' + headerCount);
    }

    // C68 — a Requires cell must be exactly one role tag (emoji + label), never
    // a bare role word in prose and never more than one tag.
    if (requiresIdx >= 0 && requiresIdx < parts.length) {
      const raw = (parts[requiresIdx] || '').trim();
      if (raw && raw !== '—' && raw !== '-') {
        const exact = ROLES.filter(function (r) { return r.tag.test(raw); });
        if (exact.length !== 1) {
          const present = ROLES.filter(function (r) {
            return new RegExp(r.tag.source.replace(/^\^|\$$/g, ''), r.tag.flags).test(raw);
          });
          const why = present.length > 1 ? present.length + ' role tags present' : 'no exact role tag';
          fails.push('step-8: Requires cell in task row ' + rowId + ' is not exactly one role tag — ' + why);
        }
      }
    }
  }
  return fails;
}

// ── step 9 — vacuous Verify clauses (V1-V9) ─────────────────────────────────

const COMMON_VERIFY_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do', 'done',
  'for', 'from', 'has', 'have', 'in', 'is', 'it', 'not', 'of', 'on', 'or', 'pass',
  'passed', 'plan', 'run', 'task', 'test', 'that', 'the', 'this', 'to', 'true',
  'was', 'with'
]);

function rawVerifyCommand(verifyCell) {
  if (!verifyCell) return null;
  var trimmed = String(verifyCell).trim();
  if (trimmed === '—' || trimmed === '-') return null;
  if (/^human\s*:/i.test(trimmed)) return null;
  var btMatch = trimmed.match(/`([^`]+)`/);
  return btMatch ? btMatch[1].trim() : trimmed;
}

function splitShellWords(command) {
  var words = [];
  var cur = '';
  var quote = null;
  for (var i = 0; i < command.length; i++) {
    var ch = command[i];
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === '\'' || ch === '"') {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (cur) {
        words.push(cur);
        cur = '';
      }
    } else {
      cur += ch;
    }
  }
  if (cur) words.push(cur);
  return words;
}

function splitShellWordsDetailed(command) {
  var words = [];
  var cur = '';
  var quote = null;
  var quoted = false;
  for (var i = 0; i < command.length; i++) {
    var ch = command[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (ch === '\\' && quote === '"' && i + 1 < command.length) {
        cur += command[++i];
        quoted = true;
      } else {
        cur += ch;
        quoted = true;
      }
      continue;
    }
    if (ch === '\'' || ch === '"') {
      quote = ch;
      quoted = true;
    } else if (ch === '\\' && i + 1 < command.length) {
      cur += command[++i];
    } else if (/\s/.test(ch)) {
      if (cur) {
        words.push({ text: cur, quoted: quoted });
        cur = '';
        quoted = false;
      }
    } else {
      cur += ch;
    }
  }
  if (cur) words.push({ text: cur, quoted: quoted });
  return words;
}

function commandSegments(command) {
  return String(command || '')
    .split(/(?:^|[^\\])(?:&&|;|\|\|)/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

function hasExtendedGrepOption(words) {
  return words.some(function (w) {
    return /^-[A-Za-z]*[EP][A-Za-z]*$/.test(w);
  });
}

function grepInvocationFromSegment(segment) {
  var m = segment.match(/(?:^|\s)(!+\s*)?(grep|rg)\b([\s\S]*)$/);
  if (!m) return null;
  var before = segment.slice(0, m.index + m[0].indexOf(m[2]));
  var raw = (m[2] + (m[3] || '')).trim();
  var words = splitShellWords(raw);
  if (!words.length) return null;
  var tool = words.shift();
  var pattern = null;
  var targets = [];
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    if (!w) continue;
    if (w === '--') continue;
    if (w.charAt(0) === '-') {
      if ((w === '-e' || w === '--regexp') && words[i + 1]) {
        pattern = words[++i];
      } else if ((w === '-f' || w === '--file') && words[i + 1]) {
        i++;
      }
      continue;
    }
    if (pattern === null) pattern = w;
    else targets.push(w);
  }
  return {
    tool: tool,
    words: [tool].concat(words),
    raw: raw,
    negated: /^\s*!/.test(segment) || /!\s*$/.test(before) || Boolean(m[1]),
    pattern: pattern,
    targets: targets
  };
}

function grepInvocations(command) {
  return commandSegments(command).map(grepInvocationFromSegment).filter(Boolean);
}

function normalizeMarkdownPipes(command) {
  var out = '';
  var quote = null;
  for (var i = 0; i < String(command || '').length; i++) {
    var ch = command[i];
    if (ch === '\\' && command[i + 1] === '|') {
      out += '|';
      i++;
    } else if (quote) {
      out += ch;
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < command.length) out += command[++i];
    } else if (ch === '\'' || ch === '"') {
      quote = ch;
      out += ch;
    } else {
      out += ch;
    }
  }
  return out;
}

function splitPipelineSegments(command) {
  var normalized = normalizeMarkdownPipes(command);
  var parts = [];
  var cur = '';
  var quote = null;
  for (var i = 0; i < normalized.length; i++) {
    var ch = normalized[i];
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < normalized.length) cur += normalized[++i];
      continue;
    }
    if (ch === '\'' || ch === '"') {
      quote = ch;
      cur += ch;
    } else if (ch === '|' && normalized[i - 1] !== '|' && normalized[i + 1] !== '|') {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function grepInvocationFromPipelineSegment(segment) {
  var cleaned = String(segment || '').trim().replace(/^\(+\s*/, '').replace(/\s*\)+$/, '');
  var m = cleaned.match(/(?:^|\s)(!+\s*)?(grep|rg)\b([\s\S]*)$/);
  if (!m) return null;
  var raw = (m[2] + (m[3] || '')).trim();
  var words = splitShellWordsDetailed(raw);
  if (!words.length || (words[0].text !== 'grep' && words[0].text !== 'rg')) return null;
  return { tool: words[0].text, words: words, raw: raw };
}

function shortOptionHasFlag(cluster, flag) {
  var takesArg = new Set(['e', 'f', 'm', 'A', 'B', 'C', 'D']);
  for (var i = 0; i < cluster.length; i++) {
    var ch = cluster[i];
    if (ch === flag) return true;
    if (takesArg.has(ch)) return false;
  }
  return false;
}

function quietInvertOptions(words) {
  var quiet = false;
  var invert = false;
  for (var i = 1; i < words.length; i++) {
    var w = words[i];
    var text = w.text;
    if (!text) continue;
    if (text === '--') break;
    if (w.quoted || text.charAt(0) !== '-') continue;
    if (text === '--quiet' || text === '--silent') quiet = true;
    else if (text === '--invert-match') invert = true;
    else if (/^-[^-]/.test(text)) {
      var cluster = text.slice(1);
      if (shortOptionHasFlag(cluster, 'q')) quiet = true;
      if (shortOptionHasFlag(cluster, 'v')) invert = true;
    }
  }
  return { quiet: quiet, invert: invert };
}

function lastCommandSegment(segment) {
  var parts = commandSegments(normalizeMarkdownPipes(segment));
  return (parts[parts.length - 1] || segment || '').trim();
}

function isSingleLineLimiter(segment) {
  var words = splitShellWords(lastCommandSegment(segment)).map(function (w) {
    return String(w || '').replace(/^\(+|\)+$/g, '');
  });
  if (words[0] !== 'tail' && words[0] !== 'head') return false;
  for (var i = 1; i < words.length; i++) {
    if (words[i] === '-1' || words[i] === '-n1') return true;
    if (words[i] === '-n' && words[i + 1] === '1') return true;
  }
  return false;
}

function quietInvertGrepFindings(command) {
  var findings = [];
  var segments = splitPipelineSegments(command);
  for (var i = 0; i < segments.length; i++) {
    var inv = grepInvocationFromPipelineSegment(segments[i]);
    if (!inv) continue;
    var opts = quietInvertOptions(inv.words);
    if (!opts.quiet || !opts.invert) continue;
    if (i > 0 && isSingleLineLimiter(segments[i - 1])) continue;
    findings.push(inv);
  }
  return findings;
}

function quietOrCountGrepOptions(words) {
  var quiet = false;
  var count = false;
  for (var i = 1; i < words.length; i++) {
    var w = words[i];
    var text = w.text;
    if (!text) continue;
    if (text === '--') break;
    if (w.quoted || text.charAt(0) !== '-') continue;
    if (text === '--quiet' || text === '--silent') quiet = true;
    else if (text === '--count') count = true;
    else if (/^-[^-]/.test(text)) {
      var cluster = text.slice(1);
      if (shortOptionHasFlag(cluster, 'q')) quiet = true;
      if (shortOptionHasFlag(cluster, 'c')) count = true;
    }
  }
  return { quiet: quiet, count: count };
}

function stripShellParens(text) {
  return String(text || '').trim().replace(/^\s*!?\s*\(+\s*/, '').replace(/\s*\)+\s*$/, '');
}

function commandWordsText(segment) {
  var words = splitShellWordsDetailed(stripShellParens(lastCommandSegment(segment))).map(function (w) {
    return w.text;
  });
  while (words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0])) words.shift();
  return words;
}

function nodeScriptIndex(words) {
  for (var i = 1; i < words.length; i++) {
    var w = words[i];
    if (!w) continue;
    if (w === '-e' || w === '--eval' || w === '-p' || w === '--print') return -1;
    if (w.charAt(0) !== '-') return i;
  }
  return -1;
}

function resolvedCommandPath(baseDir, token) {
  if (!token || token.indexOf('$') !== -1) return null;
  var clean = token.replace(/^['"]|['"]$/g, '');
  if (!clean) return null;
  return path.resolve(baseDir, clean).replace(/\\/g, '/');
}

function isExitCodeBearingCommand(segment, baseDir) {
  var words = commandWordsText(segment);
  if (!words.length) return null;

  if (words[0] === 'npm' && words[1] === 'test') return 'npm test';

  if (words[0] === 'node') {
    var scriptAt = nodeScriptIndex(words);
    if (scriptAt === -1) return null;
    var script = words[scriptAt];
    var resolved = resolvedCommandPath(baseDir, script) || script;
    if (/\/test\/[^/]+\.js$/.test(resolved) || /(^|\/)test\/[^/]+\.js$/.test(script)) return 'node test/*.js';
    return null;
  }

  var direct = resolvedCommandPath(baseDir, words[0]) || words[0];
  if (/\/vitest(?:\.js)?$/.test(direct) || /(^|\/)vitest(?:\.js)?$/.test(words[0]) || words[0] === 'vitest') return 'vitest';
  return null;
}

function quietGrepExitMaskFindings(command, baseDir) {
  var findings = [];
  var commandLists = commandSegments(normalizeMarkdownPipes(command));
  for (var c = 0; c < commandLists.length; c++) {
    var segments = splitPipelineSegments(commandLists[c]);
    if (segments.length < 2) continue;

    var finalInv = grepInvocationFromPipelineSegment(segments[segments.length - 1]);
    if (!finalInv || finalInv.tool !== 'grep') continue;

    var opts = quietOrCountGrepOptions(finalInv.words);
    if (!opts.quiet && !opts.count) continue;

    var bearing = null;
    for (var i = 0; i < segments.length - 1; i++) {
      bearing = isExitCodeBearingCommand(segments[i], baseDir);
      if (bearing) break;
    }
    if (!bearing) continue;

    findings.push({ grep: finalInv, command: bearing });
  }
  return findings;
}

function stripPatternNoise(pattern) {
  return String(pattern || '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/^\\b|\\b$/g, '')
    .replace(/^\^|\$$/g, '')
    .trim();
}

function maybePathToken(token) {
  if (!token || token.indexOf('$') !== -1 || /[*?[\]{}]/.test(token)) return false;
  if (/^(-|\/dev\/null)$/.test(token)) return false;
  return /\.[A-Za-z0-9]+$|\/|^\.\.?$/.test(token);
}

function resolveTarget(planDir, token) {
  if (!maybePathToken(token)) return null;
  return path.resolve(planDir, token.replace(/^['"]|['"]$/g, ''));
}

function leadingCdDir(planDir, command) {
  const first = commandSegments(command)[0] || '';
  const words = splitShellWords(first);
  if (words[0] !== 'cd' || !words[1]) return planDir;
  if (!maybePathToken(words[1])) return planDir;
  return path.resolve(planDir, words[1].replace(/^['"]|['"]$/g, ''));
}

function isCommentLine(line, ext) {
  var t = String(line || '').trim();
  if (!t) return false;
  if (ext === '.js' || ext === '.ts' || ext === '.vue') {
    return /^\/\//.test(t) || /^\/\*/.test(t) || /^\*/.test(t) || /^\*\//.test(t) || /^<!--/.test(t);
  }
  if (ext === '.sh' || ext === '.py') return /^#/.test(t);
  return false;
}

function checkCommentOnlyPattern(baseDir, pattern, targets) {
  var clean = stripPatternNoise(pattern);
  if (!clean || /[\\^$.*+?()[\]{}|]/.test(clean)) return false;
  for (const token of targets) {
    const resolved = resolveTarget(baseDir, token);
    if (!resolved || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) continue;
    const ext = path.extname(resolved);
    if (['.js', '.ts', '.vue', '.sh', '.py'].indexOf(ext) === -1) continue;
    const lines = fs.readFileSync(resolved, 'utf8').split('\n').filter(function (line) {
      return line.indexOf(clean) !== -1;
    });
    if (lines.length > 0 && lines.every(function (line) { return isCommentLine(line, ext); })) return true;
  }
  return false;
}



function checkCoarseDocumentPattern(baseDir, inv) {
  const clean = stripPatternNoise(inv.pattern);
  if (!clean) return null;
  if (inv.tool === 'grep' && inv.words.some(function (w) { return /^-[A-Za-z]*F[A-Za-z]*$/.test(w) || w === '--fixed-strings'; })) return null;
  for (const token of inv.targets) {
    const resolved = resolveTarget(baseDir, token);
    if (!resolved || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) continue;
    const size = fs.statSync(resolved).size;
    if (size > 4096) {
      const content = fs.readFileSync(resolved, 'utf8');
      const count = countDelimitedPatternOccurrences(content, clean);
      if (count > 2) {
        return { token: token, size: size, pattern: clean };
      }
    }
  }
  return null;
}

function isAbsenceAssertionCommand(command) {
  const normalized = normalizeMarkdownPipes(command);
  if (!/(^|[;&|]\s*)!\s*(?:\(|\{)?/.test(normalized)) return false;
  if (!/\b(?:grep|rg)\b[\s\S]*-(?:[A-Za-z]*q|[A-Za-z]*c)|\b(?:grep|rg)\b[\s\S]*--(?:quiet|silent|count)\b/.test(normalized)) return false;
  return /\b(vacuous Verify|vacuous|finding|findings|failure|failures|error|errors|violation|violations|regression|regressions)\b/i.test(normalized);
}

function taskQualifiesAbsenceAssertion(taskText) {
  const normalized = normalizeTaskText(taskText).toLowerCase();
  return /\bzero\s+v\d+(?:\s*-\s*v\d+|\s*,\s*v\d+)*(?:\s+as\s+of\s+\d{4}-\d{2}-\d{2})\b/.test(normalized) ||
         /\bclass\s+set\b[\s\S]*\b\d{4}-\d{2}-\d{2}\b/.test(normalized);
}

function openOracleFindings(content, planPath) {
  const fails = [];
  const planDir = path.dirname(planPath);
  const verify = WV.parseVerifyColumn(content);
  const rows = parseTaskTable(content);
  for (const row of rows) {
    if (!/⬜/.test(String(row.done || ''))) continue;
    const raw = rawVerifyCommand(verify[row.id]);
    if (!raw) continue;
    const cmd = normalizeMarkdownPipes(raw.trim());
    const result = cp.spawnSync('bash', ['-c', cmd], {
      cwd: planDir,
      encoding: 'utf8',
      timeout: 15000,
      stdio: 'ignore'
    });
    if (result.error && result.error.code === 'ETIMEDOUT') {
      fails.push('step-9: open-oracle check timed out in row ' + row.id + ' — Verify did not finish within 15s');
    } else if (!result.error && result.status === 0) {
      fails.push('step-9: open-oracle check in row ' + row.id + ' — Verify already passes on unfinished work');
    }
  }
  return fails;
}

function replayClosedOracles(content, planPath) {
  const fails = [];
  const planDir = path.dirname(planPath);
  const planBase = path.basename(planPath);
  const verify = WV.parseVerifyColumn(content);
  const rows = parseTaskTable(content);
  for (const row of rows) {
    if (!/✅/.test(String(row.done || ''))) continue;
    const raw = rawVerifyCommand(verify[row.id]);
    if (!raw) continue;
    if (/point-in-time/i.test(raw)) continue;

    let skipReplay = false;
    const m = raw.match(/--replay-closed\s+([^\s;&\|]+)/);
    if (m) {
      let targetPath = m[1];
      if (targetPath.startsWith("'") || targetPath.startsWith('"')) {
        targetPath = targetPath.slice(1, -1);
      }
      try {
        const resolvedTarget = fs.realpathSync(require('path').resolve(planDir, targetPath));
        const resolvedPlan = fs.realpathSync(planPath);
        if (resolvedTarget === resolvedPlan) skipReplay = true;
      } catch(e) {
        if (raw.indexOf(path.basename(planPath)) !== -1) skipReplay = true;
      }
    } else if (raw.indexOf('--replay-closed') !== -1 && raw.indexOf(path.basename(planPath)) !== -1) {
      skipReplay = true;
    }
    if (skipReplay) continue;

    
    const cmd = normalizeMarkdownPipes(raw.trim());
    const result = cp.spawnSync('bash', ['-c', cmd], {
      cwd: planDir,
      encoding: 'utf8',
      timeout: 120000,
      stdio: 'ignore',
      env: process.env
    });
    if (result.error && result.error.code === 'ETIMEDOUT') {
      fails.push('replay-closed: row ' + row.id + ' — Verify did not finish within 120s (timeout)');
    } else if (result.error || result.status !== 0) {
      fails.push('replay-closed: row ' + row.id + ' — closed row\'s Verify now fails (exit ' + (result.status || '1') + ')');
    }
  }
  return fails;
}

function canonicalModelName(model) {
  return String(model || '')
    .toLowerCase()
    .replace(/\s*\(in-session\)/g, '')
    .replace(/\s*\(auto\)/g, '')
    .replace(/^[a-z0-9_.-]+\//, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function isBareModelFamily(model) {
  return ['claude', 'gemini', 'gpt', 'deepseek', 'kimi', 'minimax', 'qwen'].indexOf(model) !== -1;
}

function sameModelOrFamily(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (isBareModelFamily(a) && b.indexOf(a) === 0) return true;
  if (isBareModelFamily(b) && a.indexOf(b) === 0) return true;
  return false;
}

function countDelimitedPatternOccurrences(content, needle) {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(^|\\s)' + escaped + '(?=$|\\s)', 'g');
  let count = 0;
  let match;
  while ((match = re.exec(content)) !== null) {
    count++;
    re.lastIndex = match.index + (match[1] || '').length + needle.length;
  }
  return count;
}

function checkStep9(content, planPath, options) {
  const fails = [];
  const planDir = path.dirname(planPath);
  // A bare-basename verify target (`grep -q x package.json`) is conventionally
  // scope-root-relative. When the plan sits outside any scope (a synthetic or
  // temp plan), fall back to the scope of the invocation directory.
  const scopeRoot = findScopeDir(planPath) || findScopeDir(path.join(process.cwd(), 'scope_probe.md'));
  const verify = WV.parseVerifyColumn(content);
  const includeClosed = Boolean(options && options.includeClosed);
  const checkOpenOracles = Boolean(options && options.checkOpenOracles);
  const done = WV.parseDoneColumn(content) || {};
  const taskRows = parseTaskTable(content).reduce(function (acc, row) {
    acc[row.id] = row;
    return acc;
  }, {});

  for (const id of Object.keys(verify)) {
    if (!includeClosed && done[id] && !/⬜|🔨/.test(String(done[id]))) continue;
    const raw = rawVerifyCommand(verify[id]);
    if (!raw) continue;
    const cmd = raw.trim();
    const commandDir = leadingCdDir(planDir, cmd);
    const row = taskRows[id] || {};

    const normalizedCmd = normalizeMarkdownPipes(cmd);
    const bashCheckResult = cp.spawnSync('bash', ['-n', '-c', normalizedCmd], { encoding: 'utf8' });
    if (bashCheckResult.status !== 0) {
      fails.push('step-9: unrunnable Verify cell in row ' + id + ' — fails bash parsing: ' + (bashCheckResult.stderr || bashCheckResult.stdout).trim().replace(/\n/g, ' '));
    }

    if (isAbsenceAssertionCommand(cmd) && !taskQualifiesAbsenceAssertion(row.task || '')) {
      fails.push('step-9: absence assertion in row ' + id + ' must name the detector class set and date');
    }

    if (cmd === 'true' || /(^|[;&|])\s*true\s*($|[;&|])/.test(cmd) || /\|\|\s*true\b/.test(cmd)) {
      fails.push('step-9: vacuous Verify V6 in row ' + id + ' — bare `true` / `|| true`');
    }

    if (/--only(?:=|\s+)\S+/.test(cmd) && /\bgrep\b[\s\S]*passed,\s*0 failed/i.test(cmd)) {
      fails.push('step-9: vacuous Verify V5 in row ' + id + ' — `--only=` result is accepted by a summary grep');
    }

    const invocations = grepInvocations(cmd);
    const quietInvertInvocations = quietInvertGrepFindings(cmd);
    for (const inv of quietInvertInvocations) {
      fails.push('step-9: vacuous Verify V7 in row ' + id + ' — quiet + invert ' + inv.tool + ' passes when any input line lacks the pattern');
    }

    const quietExitMaskInvocations = quietGrepExitMaskFindings(cmd, commandDir);
    for (const inv of quietExitMaskInvocations) {
      fails.push('step-9: vacuous Verify V8 in row ' + id + ' — final `grep -q/-c` masks the exit status from ' + inv.command + '; use `cmd && …` or check `$?` explicitly');
    }

    for (const inv of invocations) {
      const cleanPattern = stripPatternNoise(inv.pattern);
      if (cleanPattern && COMMON_VERIFY_WORDS.has(cleanPattern.toLowerCase())) {
        fails.push('step-9: vacuous Verify V4 in row ' + id + ' — common English grep/rg pattern `' + cleanPattern + '`');
      }

      if (inv.tool === 'grep' && !hasExtendedGrepOption(inv.words)) {
        const quotedPatternWithEscapedAlternation = /(["'])[^"']*\\\|[^"']*\1/.test(inv.raw);
        if (quotedPatternWithEscapedAlternation) {
          fails.push('step-9: vacuous Verify V2 in row ' + id + ' — grep pattern uses escaped alternation without -E/-P');
        }
      }

      if (inv.targets.length > 0) {
        const missing = inv.targets
          .map(function (t) { return { token: t, resolved: resolveTarget(commandDir, t) }; })
          .filter(function (t) {
            if (!t.resolved) return false;
            if (fs.existsSync(t.resolved)) return false;
            // Positive (unrunnable) targets may resolve from the scope root even
            // when they do not resolve from the command cwd. Negated targets keep
            // the strict command-cwd-only rule — a vacuous assertion is vacuous
            // regardless of whether the file exists elsewhere.
            if (!inv.negated) {
              const atScope = resolveTarget(scopeRoot, t.token);
              if (atScope && fs.existsSync(atScope)) return false;
            }
            return true;
          });
        if (missing.length > 0) {
          if (inv.negated) {
            fails.push('step-9: vacuous Verify V1 in row ' + id + ' — negated ' + inv.tool + ' target does not resolve from command cwd: ' + missing[0].token);
          } else {
            fails.push('step-9: unrunnable Verify V1 in row ' + id + ' — ' + inv.tool + ' target does not resolve from command cwd: ' + missing[0].token);
          }
        }
      }

      if (checkCommentOnlyPattern(commandDir, inv.pattern, inv.targets)) {
        fails.push('step-9: vacuous Verify V3 in row ' + id + ' — pattern occurs only on comment lines in a code target');
      }

      const coarse = checkCoarseDocumentPattern(commandDir, inv);
      if (coarse) {
        fails.push('step-9: vacuous Verify V9 in row ' + id + ' — coarse grep/rg pattern `' + coarse.pattern + '` over >4KB target `' + coarse.token + '` cannot detect removal of a specific change');
      }
    }
  }

  if (checkOpenOracles) fails.push.apply(fails, openOracleFindings(content, planPath));
  if (options && options.replayClosed) fails.push.apply(fails, replayClosedOracles(content, planPath));

  return fails;
}

// ── task folder collision check (N15) ──────────────────────────────────────────

function checkTaskCollisions(planPath, silent) {
  const fails = [];
  const infos = [];
  const planDir = path.dirname(planPath);
  const normalizedPlan = path.resolve(planPath).replace(/\\/g, '/');
  if (normalizedPlan.indexOf('/.wb/workflows/reports/') === -1) return fails;
  
  let entries = [];
  try { entries = fs.readdirSync(planDir); } catch(e) {}
  const planFiles = entries.filter(function(e) { return e.startsWith('plan_') && e.endsWith('.md'); });
  if (planFiles.length <= 1) return fails;
  
  const thisName = path.basename(planPath);
  const siblings = planFiles.filter(function(e) { return e !== thisName; });
  
  // N16: Extract claimed reports to detect Case (a) - silent overwrite hazard
  const claimMap = {};
  for (const p of planFiles) {
    let content = '';
    try { content = fs.readFileSync(path.join(planDir, p), 'utf-8'); } catch (e) { continue; }
    const linkRe = /\]\((tasks\/task_[^/]+\/[^)]+\.md)\)/g;
    let m;
    while ((m = linkRe.exec(content)) !== null) {
      const rPath = m[1];
      if (!claimMap[rPath]) claimMap[rPath] = [];
      if (claimMap[rPath].indexOf(p) === -1) {
        claimMap[rPath].push(p);
      }
    }
  }

  let fatalCount = 0;
  for (const rPath in claimMap) {
    if (claimMap[rPath].length > 1) {
      fatalCount++;
      const tDir = path.dirname(rPath).split('/').pop();
      const rName = path.basename(rPath);
      fails.push('collision in ' + tDir + ': report ' + rName + ' is claimed by multiple plans (' + claimMap[rPath].join(', ') + ')');
    }
  }
  
  const tasksDir = path.join(planDir, 'tasks');
  let collisions = 0;
  
  let taskDirs = [];
  try {
    taskDirs = fs.readdirSync(tasksDir, { withFileTypes: true })
      .filter(function(e) { return e.isDirectory() && e.name.startsWith('task_'); })
      .map(function(e) { return e.name; });
  } catch (e) {}
  
  for (const tDir of taskDirs) {
    let reportFiles = [];
    try {
      reportFiles = fs.readdirSync(path.join(tasksDir, tDir))
        .filter(function(e) { return e.endsWith('.md') && e.indexOf('_report_') !== -1; });
    } catch (e) {}
    
    // Case (b) - untidy directory with differently-named reports
    if (reportFiles.length > 1) {
      collisions++;
      infos.push('collision in ' + tDir + ': contains multiple reports (' + reportFiles.join(', ') + ')');
    }
  }
  
  if (fatalCount > 0) {
    fails.unshift('tasks/ tree is shared with sibling plan files (' + siblings.join(', ') + ') — ' + fatalCount + ' actual collision(s) found');
  } 
  
  if (collisions > 0) {
    if (fatalCount === 0) {
      infos.unshift('tasks/ tree is shared with sibling plan files (' + siblings.join(', ') + ') — ' + collisions + ' actual collision(s) found');
    }
  }
  
  if (!silent && infos.length > 0) {
    for (const msg of infos) {
      console.log('  ℹ️  ' + msg);
    }
  } else if (!silent && siblings.length > 0 && collisions === 0 && fatalCount === 0) {
    console.log('  ⚠️  WARNING: tasks/ tree is shared with sibling plan files (' + siblings.join(', ') + ')');
  }
  
  return fails;
}

// ── C58 — a ✅ Done row must carry its task report ────────────────────────────
// wbWork_template.md:826 requires a report "for EACH task executed", and G2's own
// verdict for a closed row with no report is `NO-OP — no task report at
// tasks/task_N/…`. Nothing cross-checked a ✅ Done mark against the artifact it
// summarises, so rows 3 and 4 of the 09-14 plan closed ✅ Done + ✅ Valid with no
// report while `lint` certified the plan 11/11.
function checkDoneReportCrossCheck(content, planPath) {
  const fails = [];
  const normalizedPlan = path.resolve(planPath).replace(/\\/g, '/');
  if (normalizedPlan.indexOf('/.wb/workflows/reports/') === -1) return fails;

  const planDir = path.dirname(planPath);
  const rows = parseTaskTable(content);
  for (const row of rows) {
    if (!isDone(row.done)) continue;
    if (/🚫|Cancelled|⏸️|Deferred/i.test(row.done)) continue;

    let hasReport = false;
    try {
      hasReport = fs.readdirSync(path.join(planDir, 'tasks', 'task_' + row.id))
        .some(function (e) { return e.endsWith('.md') && e.indexOf('_report_') !== -1; });
    } catch (_e) { hasReport = false; }

    if (!hasReport) {
      fails.push('step-11: row ' + row.id + ' is marked Done but has no task report at tasks/task_' + row.id + '/task_' + row.id + '_report_*.md (G2 classes this NO-OP)');
    }
  }
  return fails;
}

// ── step 6 — archive sweep (not enforceable) ───────────────────────────────────

// ── main ──────────────────────────────────────────────────────────────────────

function run(argv) {
  const rawArgs = (argv || []).slice();
  if (rawArgs.some(function (a) { return a === '--help' || a === '-h'; })) {
    console.log(HELP);
    return 0;
  }
  if (rawArgs.some(function (a) { return a === '--self-test'; })) {
    return runSelfTest();
  }
  const includeClosed = rawArgs.indexOf('--include-closed') !== -1;
  const checkOpenOracles = rawArgs.indexOf('--check-open-oracles') !== -1;
  const replayClosed = rawArgs.indexOf('--replay-closed') !== -1;
  const args = rawArgs.filter(function (a) { return a !== '--include-closed' && a !== '--check-open-oracles' && a !== '--replay-closed'; });

  function runScope(rootDir, silent, includeClosedRows, replayClosedRows) {
    const reportsDir = path.join(rootDir, '.wb', 'workflows', 'reports');
    
    function walkPlans(dir) {
      let results = [];
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_e) { return results; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== 'tasks') {
          results.push.apply(results, walkPlans(full));
        } else if (e.isFile() && /^plan_.+\.md$/.test(e.name)) {
          const normalized = full.replace(/\\/g, '/');
          if (normalized.indexOf('/plans/') !== -1) {
            results.push(full);
          }
        }
      }
      return results;
    }

    function walkReports(dir) {
      let results = [];
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_e) { return results; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== 'tasks') {
          results.push.apply(results, walkReports(full));
        } else if (e.isFile() && e.name.endsWith('.md')) {
          results.push(full);
        }
      }
      return results;
    }
    
    const plans = walkPlans(reportsDir).sort();
    
    let passed = 0, failed = 0, skipped = 0;
    
    for (const planPath of plans) {
      const content = fs.readFileSync(planPath, 'utf-8');
      const rows = parseTaskTable(content);
      const basename = path.basename(planPath);
      
      if (rows.length === 0) {
        if (!silent) console.log('  ' + basename.padEnd(45) + ' SKIPPED — pre-v5 format');
        skipped++;
        continue;
      }
      
      const scopeDir = findScopeDir(planPath);
      let planFailed = 0;
      
      const checks = [
        function () { return checkStep0(content, planPath, scopeDir); },
        function () { return checkStep1(content, planPath); },
        function () { return checkStep2(content); },
        function () { return checkStep3(content, planPath); },
        function () { return checkStep4(content); },
        function () { return checkStep5(planPath); },
        function () { return checkTaskCollisions(planPath, silent); },
        function () { return checkStep8(content); },
        function () { return checkStep9(content, planPath, { includeClosed: Boolean(includeClosedRows), checkOpenOracles: Boolean(checkOpenOracles), replayClosed: Boolean(replayClosedRows) }); },
        function () { return checkDoneReportCrossCheck(content, planPath); }
      ];
      
      for (const fn of checks) {
        try {
          const f = fn();
          if (f && f.length > 0) planFailed += f.length;
        } catch (e) {
          planFailed++;
        }
      }
      
      if (planFailed === 0) {
        if (!silent) console.log('  ' + basename.padEnd(45) + ' PASS');
        passed++;
      } else {
        if (!silent) console.log('  ' + basename.padEnd(45) + ' FAIL');
        failed++;
      }
    }
    
    const reports = walkReports(reportsDir).sort();
    for (const reportPath of reports) {
      if (plans.indexOf(reportPath) !== -1) continue; // Already checked
      const basename = path.basename(reportPath);
      let matrixFails = [];
      try {
        const content = fs.readFileSync(reportPath, 'utf-8');
        const repoRoot = findRepoRoot(path.dirname(reportPath));
        for (const dispatch of matrixDispatchCommands(content)) {
          const parsed = WV.splitCommand(dispatch.command);
          if (!parsed) continue;
          if (/\.md$/.test(parsed.target || '') && !fs.existsSync(path.join(repoRoot, parsed.target))) {
            matrixFails.push('step-5: matrix dispatch target does not resolve from repo root: ' + parsed.target);
          }
        }
      } catch (e) {}
      
      if (matrixFails.length > 0) {
        if (!silent) console.log('  ' + basename.padEnd(45) + ' FAIL');
        failed++;
      }
    }
    
    return { passed, failed, skipped };
  }

  let isAllMode = args[0] === '--all';
  let rootDir = args[1] ? path.resolve(args[1]) : process.cwd();

  if (!isAllMode && args.length > 0 && !args[0].startsWith('--')) {
    const targetPath = path.resolve(args[0]);
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      isAllMode = true;
      rootDir = targetPath;
    }
  }

  if (isAllMode) {
    const res = runScope(rootDir, false, includeClosed, replayClosed);
    const exitCode = res.failed > 0 ? 1 : 0;
    console.log('  summary: ' + res.passed + ' passed, ' + res.failed + ' failed, ' + res.skipped + ' skipped   -> overall exit ' + exitCode);
    return exitCode;
  }

  if (args[0] === '--fleet') {
    const flagArgs = args.slice(1).filter(function(a) { return a.startsWith('--'); });
    const rootArgs = args.slice(1).filter(function(a) { return !a.startsWith('--'); });
    const includeArchives = flagArgs.indexOf('--include-archives') !== -1;
    
    let monorepoRoot = rootArgs[0] ? path.resolve(rootArgs[0]) : null;
    if (!monorepoRoot) {
      let cur = process.cwd();
      while (cur) {
        if (fs.existsSync(path.join(cur, '.git'))) {
          monorepoRoot = cur;
          break;
        }
        const up = path.dirname(cur);
        if (up === cur) break;
        cur = up;
      }
      if (!monorepoRoot) monorepoRoot = process.cwd();
    }
    
    function findScopes(dir) {
      let results = [];
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_e) { return results; }
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const full = path.join(dir, e.name);
        
        if (!includeArchives && (e.name === 'node_modules' || e.name.indexOf('_archives_') !== -1 || full.indexOf('_archives_') !== -1)) continue;
        
        if (e.name === '.wb') {
          if (fs.existsSync(path.join(full, 'workflows', 'reports'))) {
            results.push(dir);
          }
          continue;
        }
        
        if (e.name !== '.git') {
          results.push.apply(results, findScopes(full));
        }
      }
      return results;
    }
    
    const scopes = findScopes(monorepoRoot).sort();
    let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
    
    for (const scope of scopes) {
      const res = runScope(scope, true, includeClosed, replayClosed);
      if (res.passed === 0 && res.failed === 0 && res.skipped === 0) continue;
      
      const relPath = path.relative(monorepoRoot, scope) || '.';
      console.log('  ' + relPath.padEnd(45) + res.passed + ' passed, ' + res.failed + ' failed, ' + res.skipped + ' skipped');
      
      totalPassed += res.passed;
      totalFailed += res.failed;
      totalSkipped += res.skipped;
    }
    
    const exitCode = totalFailed > 0 ? 1 : 0;
    console.log('  fleet summary: ' + totalPassed + ' passed, ' + totalFailed + ' failed, ' + totalSkipped + ' skipped   -> overall exit ' + exitCode);
    return exitCode;
  }

  if (args.length === 0) {
    console.error('❌ Missing plan file.\n   Usage: wb-flow lint <plan.md>');
    return 1;
  }

  const planPath = path.resolve(args[0]);
  if (!fs.existsSync(planPath)) {
    console.error('❌ Plan file not found: ' + planPath);
    return 1;
  }

  const content = fs.readFileSync(planPath, 'utf-8');
  const scopeDir = findScopeDir(planPath);
  const name = scopeName(planPath);

  console.log('🔍 wb-flow lint — ' + path.basename(planPath));
  console.log('   scope: ' + (scopeDir ? path.basename(scopeDir) : '(unknown)'));
  console.log('');

  const checks = [];
  let totalPassed = 0;
  let totalFailed = 0;


/**
 * step-7 — roster freshness + Multi-ID batching.
 *
 * Two rules that were WRITTEN and never ENFORCED, which is why both drifted:
 *
 *  (a) §10 rule 5b: the Active Model Roster block must match the roster file
 *      `resolveRosterFile()` picks. Nothing checked it, and this repo's own plan
 *      named `opencode-go/*` for two roles for ten days — including a month in
 *      which that subscription had lapsed.
 *
 *  (b) §10 rule 12: cells sharing a wave, scope, role AND routed model MUST be
 *      one `--id=X,Y` dispatch. `next.js` obeys it when it generates the
 *      run-book; the hand-authored matrix did not, and the same violation was
 *      caught by the owner three times running (waves A, B and C) because no
 *      gate looked.
 *
 * Keyed on "the file carries a 🌊 matrix", NOT on "the file is a plan":
 * `--wbPlan` on /wbActOn, /wbAudit, /wbReview and /wbStandup all write plans.
 */
/** Index of the 🌊 matrix SECTION heading — a line that begins with it. */
function matrixSectionStart(content) {
  const lines = content.split('\n');
  let at = 0;
  for (const line of lines) {
    if (/^##\s+\u{1F30A}\s+Next Executable Sequence\s*$/u.test(line)) return at;
    at += line.length + 1;
  }
  return -1;
}

function checkStep7(content, planPath) {
  const fails = [];
  // Anchor on the HEADING LINE, never on a substring. `indexOf` matched a prose
  // MENTION of "## 🌊 Next Executable Sequence" in a task description and sliced
  // 4 KB of Executive Summary instead of the matrix, so the batching half passed
  // on a plan containing the very defect it was written for. That is the same
  // mistake as task 19's oracle (`grep … | head -1` hitting prose) — twice in one
  // day, in two different files, both times "find the section" done by search.
  const matrixStart = matrixSectionStart(content);
  if (matrixStart === -1) return fails;   // no matrix, nothing to check

  // ── (a) roster block vs the resolved roster file ──────────────────────────
  //
  // ONLY for a plan with open work. A CLOSED plan's roster is a historical
  // record of what actually ran — `Claude (auto) || Codex (auto)` on an 08-09
  // plan is correct history, not drift, and failing it would make every
  // archived plan lint red forever. Caught by the existing smoke suite
  // ("embed then lint exits 0 on a real 08-09 plan"), which is exactly the kind
  // of over-reach a new gate makes and an old suite exists to stop.
  let hasOpenWork = false;
  try {
    const done = WV.parseDoneColumn(content) || {};
    // Only real TASK ids count. `parseDoneColumn` also returns prose rows from
    // narrative tables — the wb-flow 08-09 plan yields key "row" whose value is
    // "⬜ **OPEN**", a legend entry, not work. Counting it made a closed plan
    // look open and re-introduced the very failure this scoping removed.
    hasOpenWork = Object.keys(done).some(function (id) {
      return /^[A-Za-z]?\d/.test(id) && /⬜/.test(String(done[id] || ''));
    });
  } catch (_) { hasOpenWork = false; }

  let declared = hasOpenWork ? null : false;
  if (hasOpenWork) declared = null;
  if (hasOpenWork) {
    try { declared = WV.parseHeaderRoster(content); } catch (_) { declared = null; }
  }
  if (hasOpenWork && declared) {
    let rosterFile = null;
    try { rosterFile = MODEL.resolveRosterFile(path.dirname(planPath), {}); } catch (_) {}
    if (rosterFile && fs.existsSync(rosterFile)) {
      let live = null;
      try { live = MODEL.readRoster(fs.readFileSync(rosterFile, 'utf8')); } catch (_) {}
      if (live) {
        const pairs = [['planner', 'planner'], ['validator', 'validator'],
                       ['worker', 'worker'], ['mechanical', 'mechanical']];
        for (const [declKey, liveKey] of pairs) {
          const a = (declared[declKey] || []).join(' || ');
          const b = (live[liveKey] || []).join(' || ');
          if (!a || !b) continue;
          if (a !== b) {
            fails.push('step-7: roster drift — ' + declKey + ' declares "' + a +
                       '" but ' + path.basename(rosterFile) + ' says "' + b +
                       '" (self-correct must re-resolve the Active Model Roster block)');
          }
        }
      }
    }
  }

  // ── (b) Multi-ID batching in the matrix (§10 rule 12) ─────────────────────
  const after = content.slice(matrixStart);
  const end = after.search(/\n<!-- HOW_TO_RUN_START -->|\n## (?!🌊)/);
  const matrix = end === -1 ? after : after.slice(0, end);
  const groups = new Map();
  for (const line of matrix.split('\n')) {
    const rowM = line.match(/^\|\s*\*\*([A-Z])\s*·\s*(\S+)\s*(work|validate)\*\*\s*\|(.*)$/);
    if (!rowM) continue;
    const wave = rowM[1], kind = rowM[3];
    const cells = rowM[4].split('|');
    cells.forEach(function (cell, col) {
      const cmds = cell.match(/\/wb\w+[^`<]*--id=[\w.,-]+[^`<]*/g);
      if (!cmds || cmds.length < 2) return;
      // Two or more dispatches in ONE cell = same wave, same role column. If they
      // also name the same model they are the unmerged case rule 12 forbids.
      const models = cmds.map(function (c) {
        const m = c.match(/-M=("?)(\$?[\w./-]+)\1/);
        return m ? m[2] : '';
      });
      const ids = cmds.map(function (c) { return (c.match(/--id=([\w.,-]+)/) || [])[1] || '?'; });
      const uniq = Array.from(new Set(models));
      if (uniq.length === 1 && uniq[0]) {
        const key = wave + '·' + kind + '·' + col + '·' + uniq[0];
        if (!groups.has(key)) groups.set(key, { wave: wave, kind: kind, model: uniq[0], ids: ids });
      }
    });
  }
  for (const g of groups.values()) {
    fails.push('step-7: unmerged dispatches — wave ' + g.wave + ' · ' + g.kind +
               ' has ' + g.ids.length + ' cells all routed to ' + g.model +
               ' (--id=' + g.ids.join(' and --id=') + '); §10 rule 12 requires --id=' +
               g.ids.join(','));
  }
  return fails;
}

  const runCheck = function (step, label, checkable, fn) {
    let failures;
    try {
      failures = fn();
    } catch (e) {
      failures = ['(internal error) ' + e.message];
    }
    const tag = checkable === false ? '❌ (not enforceable)' :
                checkable === 'partial' ? '⚠️  (partial)' :
                '✅ (full)';
    if (!failures || failures.length === 0) {
      console.log('  ✓ step-' + step + ' … ' + label + '  ' + tag);
      totalPassed++;
      checks.push({ step: step, label: label, pass: true });
    } else {
      for (const f of failures) {
        console.log('  ✗ ' + f);
      }
      totalFailed += failures.length;
      checks.push({ step: step, label: label, pass: false, failures: failures });
    }
  };

  // C60 + C66 — a report file (audit/review/task report/loop log) gets link
  // integrity (step-1), the matrix checks (step-5 target resolution, step-7
  // batching), but NOT the plan schema (steps 0-4, 8-11). The plan schema reads
  // the task table, budget, Verify cells and link discipline that only a plan
  // possesses; running it over a report yields failures that describe no defect
  // ("no task rows found", "missing section Task Table", …). C66 restores step-1
  // to report files: link integrity applies to every markdown artifact, not just
  // plans — C60's matrix-only narrowing hid two dead `loops/` hrefs.
  const isPlan = isPlanFile(content);

  if (isPlan) {
    runCheck(0, 'open-task absorption', 'partial', function () {
      return checkStep0(content, planPath, scopeDir);
    });

    runCheck(1, 'link & href repair', true, function () {
      return checkStep1(content, planPath);
    });

    runCheck(2, 'structural alignment', true, function () {
      return checkStep2(content);
    });

    runCheck(3, 'wave externalization', true, function () {
      return checkStep3(content, planPath);
    });

    runCheck(4, 'cell batching & D4 self-validation', 'partial', function () {
      return checkStep4(content);
    });

    runCheck(8, 'task-table column count', true, function () {
      return checkStep8(content);
    });

    runCheck(9, 'Verify clause soundness', true, function () {
      return checkStep9(content, planPath, { includeClosed: includeClosed, checkOpenOracles: checkOpenOracles, replayClosed: replayClosed });
    });

    runCheck(10, 'Plan Budget Estimate consistency', true, function () {
      return checkStep10(content);
    });

    runCheck(11, 'task-report presence for Done rows', true, function () {
      return checkDoneReportCrossCheck(content, planPath);
    });

    runCheck('tasks', 'task folder collision', true, function () {
      return checkTaskCollisions(planPath, false);
    });
  } else {
    console.log('  ℹ  report file (not a plan) — link integrity + matrix checks');

    // C66 — step-1 runs on report files too. Link integrity is a property of
    // every markdown artifact in this system (audits, reviews, task reports,
    // loop logs), not just plans. C60's matrix-only profile dropped it, hiding
    // two dead `loop_2.md` hrefs created by a `loops/` relocation.
    runCheck(1, 'link & href repair', true, function () {
      return checkStep1(content, planPath);
    });
  }

  runCheck(5, 'derived-block sync', true, function () {
    return checkStep5(planPath, isPlan);
  });

  runCheck(7, 'roster freshness & Multi-ID batching', true, function () {
    return checkStep7(content, planPath);
  });

  // Step 6 — always report as not enforceable
  console.log('  — step-6 · archive sweep  ❌ (not enforceable — invocation state leaves no trace in the artifact)');

  console.log('');
  if (totalFailed === 0) {
    console.log('✓ LINT OK — ' + totalPassed + '/' + (totalPassed) + ' enforceable steps pass (step 6 is not enforceable)');
    return 0;
  } else {
    console.log('✗ LINT FAILED — ' + totalFailed + ' failure' + (totalFailed > 1 ? 's' : '') + ' across ' + checks.filter(function (c) { return !c.pass; }).length + ' step' + (checks.filter(function (c) { return !c.pass; }).length > 1 ? 's' : ''));
    return totalFailed;
  }
}

module.exports = {
  run,
  splitRow,
  parseTaskTable,
  isOpen,
  normalizeTaskText,
  checkStep1,
  checkStep4,
  checkStep5,
  checkStep8,
  checkStep10,
  checkStep9,
  checkDoneReportCrossCheck,
  matrixDispatchCommands,
  isPlanFile
};

// Keep the module importable for the installer while making the documented
// direct oracle invocation real: `node bin/lint.js <plan>` must execute the
// same runner as `wb-flow lint <plan>` instead of loading and exiting 0.
if (require.main === module) {
  process.exitCode = run(process.argv.slice(2)) || 0;
}

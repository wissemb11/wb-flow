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

  Options:
    --help, -h   Show this message
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

function scopeName(planPath) {
  const m = path.basename(planPath).match(/^plan_(.+)_\d{8}\.md$/);
  return m ? m[1] : path.basename(planPath, '.md');
}

// ── table parsing (minimal — lifted from wave.js splitRow logic) ──────────────

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
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

/** Parse plan table → [{id, done, valid, dep, task}] */
function parseTaskTable(content) {
  const rows = [];
  const lines = content.split('\n');

  // Find the task table heading
  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inTable && /^##\s+.*Task\s+Table/i.test(line.trim())) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    // End of the task table: next ## section or end of pipe-delimited rows
    if (line.trim().startsWith('## ')) break;
    if (!line.trim().startsWith('|')) continue;

    const cells = splitRow(line);
    if (cells.length < 4) continue;

    // Header row detection
    if (/^\s*#\s*$/.test(cells[0])) continue;

    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    // Only accept numeric or dotted-numeric ids
    if (!/^\d+(\.\d+)*$/.test(idm[1])) continue;

    const dn = cells[cells.length - 2] || '';
    const vn = cells[cells.length - 1] || '';
    rows.push({
      id: idm[1],
      done: dn.trim(),
      valid: vn.trim(),
      dep: (cells[2] || '').replace(/—/g, '').trim(),
      task: (cells[4] || '').trim(),
    });
  }
  return rows;
}

function isDone(doneCell) {
  return /✅/.test(doneCell);
}

function isOpen(doneCell) {
  // Cancelled and Deferred rows are decided, not open work (§13.2).
  return /⬜|🔨/.test(doneCell);
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
        const openRows = opRows.filter(function (r) { return isOpen(r.done); });
        for (const or of openRows) {
          const taskText = or.task.replace(/[*_`#]|📄/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
          const foundInCurrent = rows.some(function (cr) {
            const ct = cr.task.replace(/[*_`#]|📄/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
            return ct === taskText;
          });
          if (!foundInCurrent) {
            const shortName = path.basename(op);
            fails.push('step-0: open row ' + or.id + ' (' + taskText.slice(0, 60) + '…) from ' + shortName + ' is not absorbed into this plan');
          }
        }
      }
    }
  }

  return fails;
}

// ── step 1 — link & href repair ───────────────────────────────────────────────

function checkStep1(content, planPath) {
  const fails = [];
  const planDir = path.dirname(planPath);

  // Collect ALL markdown links: [label](href)
  const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  const links = [];
  while ((m = linkRe.exec(content)) !== null) {
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

  // Resolve relative hrefs and flag misses
  const hrefRe = /\]\(([^)]+)\)/g;
  while ((m = hrefRe.exec(content)) !== null) {
    const href = m[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#') || href.charAt(0) === '/')
      continue;
    const resolved = path.resolve(planDir, href);
    if (!fs.existsSync(resolved)) {
      // Skip targets that resolve through symlinks or special patterns
      const parent = path.dirname(resolved);
      if (!fs.existsSync(parent)) {
        fails.push('step-1: broken href — ' + href.slice(0, 80) + ' (resolved: ' + resolved.slice(0, 80) + ')');
      }
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

  // Every dispatch in the MATRIX (not copy/paste blocks) carries an explicit
  // model assignment — either -M= in the command or → *ModelName* in context
  const cmdRe = /`(\/wb(Work|Valid)\s+[^`]+)`/g;
  let m;
  while ((m = cmdRe.exec(matrixText)) !== null) {
    const cmd = m[1];
    if (/--wave=|-W=/.test(cmd)) continue;
    const hasM = /-M[= ]/.test(cmd) || /--model[= ]/.test(cmd);
    const after = matrixText.slice(m.index + m[0].length, m.index + m[0].length + 200);
    const hasModelAnnot = /→\s*\*[^*]+\*/.test(after) || /in-session|\(auto\)|\(in-session\)/.test(after);
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

  // D4 invariant: every merged /wbValid cell → check no self-validation
  // Parse the Done column from the task table
  const doneMap = {};
  const rows = parseTaskTable(content);
  for (const r of rows) {
    doneMap[r.id] = r.done;
  }

  function executorFromDone(doneCell) {
    if (!doneCell) return 'unknown';
    // Strip HTML tags, keep the model name
    const clean = doneCell.replace(/<[^>]+>/g, ' ').trim();
    // Patterns: "✅ opencode-go/deepseek-v4-pro" or "✅ Claude Opus 5" or "✅ Model1"
    const m = clean.match(/✅\s*(.+?)(?:\s*$)/);
    if (!m) return clean.replace(/[^a-zA-Z0-9/._-]/g, '').trim();
    return m[1].replace(/·.*/, '').trim();
  }

  function modelInMatrixCell(matrixCellText) {
    // Extract from "→ *ModelName · ~$X.XX*" or "→ *Claude Opus 5 (in-session) · ~$X.XX*"
    const mm = matrixCellText.match(/→\s*\*([^*]+)\*/);
    if (!mm) return null;
    return mm[1].split('·')[0].trim();
  }

  // D4: walk MATRIX cells (not copy/paste blocks) looking for merged /wbValid
  if (matrixText) {
    const validCmdRe = /`(\/wbValid\s+[^`]+)`/g;
    while ((m = validCmdRe.exec(matrixText)) !== null) {
      const cmd = m[1];
      const idMatch = cmd.match(/--id[= ](\d+(?:,\d+)*)/);
      if (!idMatch) continue;
      const ids = idMatch[1].split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (ids.length < 2) continue; // not merged

      const afterContext = matrixText.slice(m.index, m.index + 400);
      const routedModel = modelInMatrixCell(afterContext);
      if (!routedModel) continue;

      const routedLower = routedModel.toLowerCase().replace(/\s*\(in-session\)/i, '').replace(/claude\s*\(auto\)/i, 'claude');
      for (const id of ids) {
        const executor = executorFromDone(doneMap[id]);
        if (!executor || executor === 'unknown') continue;
        const execLower = executor.toLowerCase().replace(/\s+/g, ' ').trim();

        if (routedLower.indexOf(execLower) !== -1 || execLower.indexOf(routedLower) !== -1) {
          fails.push('step-4: D4 self-validation — merged /wbValid --id=' + ids.join(',') + ' routed to ' + routedModel + ', but ' + executor + ' executed id ' + id);
          break;
        }
      }
    }
  }

  return fails;
}

// ── step 5 — derived-block sync (shell out to sync_check.sh) ───────────────────

function checkStep5(planPath) {
  const fails = [];
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
  return fails;
}

// ── task folder collision check (N15) ──────────────────────────────────────────

function checkTaskCollisions(planPath, silent) {
  const fails = [];
  const infos = [];
  const planDir = path.dirname(planPath);
  
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

// ── step 6 — archive sweep (not enforceable) ───────────────────────────────────

// ── main ──────────────────────────────────────────────────────────────────────

function run(argv) {
  const args = (argv || []).slice();
  if (args.some(function (a) { return a === '--help' || a === '-h'; })) {
    console.log(HELP);
    return 0;
  }

  function runScope(rootDir, silent) {
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
        function () { return checkTaskCollisions(planPath, silent); }
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
    const res = runScope(rootDir, false);
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
      const res = runScope(scope, true);
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

  runCheck(5, 'derived-block sync', true, function () {
    return checkStep5(planPath);
  });

  runCheck('tasks', 'task folder collision', true, function () {
    return checkTaskCollisions(planPath, false);
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

module.exports = { run };

// Keep the module importable for the installer while making the documented
// direct oracle invocation real: `node bin/lint.js <plan>` must execute the
// same runner as `wb-flow lint <plan>` instead of loading and exiting 0.
if (require.main === module) {
  process.exit(run(process.argv.slice(2)) || 0);
}

'use strict';
const fs = require('fs');
const path = require('path');
const { ROLES, MATRIX_HEADING, ROLE_EMOJI_MAP } = require('./wave_constants');

/** Locate the matrix and map its columns to roles by header text, not position. */
function parseMatrix(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.trim() === MATRIX_HEADING);
  if (start === -1) return null;

  let header = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].indexOf('## ') === 0 && i > start) break; // left the section
    if (/^\|\s*Wave\s*\|/.test(lines[i])) { header = i; break; }
  }
  if (header === -1) return { rows: [] };

  const cols = splitRow(lines[header]);
  const roleOf = cols.map((c) => {
    const hit = ROLES.find((r) => r.match.test(c));
    return hit ? hit.key : null;
  });

  const rows = [];
  for (let i = header + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) break;
    const cells = splitRow(line);
    const raw = (cells[0] || '').replace(/\*/g, '').split('—')[0].trim();
    if (!raw) continue;
    // "A · 🔨 work" / "A · ✅ validate" — the wave label is everything before the ·
    const parts = raw.split('·');
    const label = parts[0].trim();
    const kind = /validate/i.test(raw) ? 'validate' : 'work';
    rows.push({ label: label, kind: kind, cells: cells, roleOf: roleOf });
  }
  return { rows: rows };
}

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const parts = [];
  let current = '';
  let inBacktick = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '`' && (i === 0 || trimmed[i - 1] !== '\\')) {
      inBacktick = !inBacktick;
      current += ch;
    } else if (ch === '|' && !inBacktick) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map(function (c) { return c.trim(); });
}

// Markup that may legitimately precede a command inside a cell: status emoji,
// bold/italic markers, HTML tags, separators. Stripped only to answer "does this
// chunk LEAD with a command?" — never from the text the command is read out of.
const LEADING_MARKUP = /^(?:\s|<[^>]+>|\*\*|__|\*|_|[⏸️🔨📋✅🧠👤🧍🟢🟡🟠🔴⛔·—–-])+/u;

// A 👤 / 🧍 designation — in the cell body or in its `→ *Model*` annotation —
// makes the cell a HUMAN GATE (A22): never given a lane, never given a fallback,
// reported as skipped, and rendered as a gate by `--list`.
const HUMAN_MARK = /👤|🧍/u;

/** One cell may hold several commands, separated by <br><br>. */
function parseCell(cell, role, waveLabel) {
  if (!cell || cell === '—' || cell === '-') return [];
  return cell.split(/<br>\s*<br>/).map((chunk) => {
    // A dispatch cell holds `/wbExplain …` then `/wbWork …` — both in backticks.
    // The last command is the primary one; earlier ones are its prelude.
    // Extract commands before any <sub> tag to avoid matching prose.
    const beforeSub = chunk.split(/<sub/i)[0];
    const model = ((chunk.match(/→\s*\*([^*]+)\*/) || [])[1] || '').split('·')[0].trim();

    // ── A22 · a human designation is a GATE, not a route ──────────────────────
    const human = HUMAN_MARK.test(beforeSub) || /\bhuman\b/i.test(model);

    // ── A23 · a dispatch cell LEADS with its command ──────────────────────────
    // Previously this took the LAST backticked `/…` token found ANYWHERE in the
    // chunk, so a sentence merely *mentioning* a command compiled into an
    // execution of it. The cell
    //     🧍 **user** — publish `wb-flow@1.0.2` (`/wbRelease`, then `/wbPublish`).
    //     Not an agent cell.
    // dispatched `/wbPublish` — an irreversible publish to a public registry —
    // to a mechanical-tier model, with a fallback chain, because "last wins".
    // The instruction not to dispatch was delivered *as the prompt of the
    // dispatch*, so no wording could have prevented it.
    //
    // Measured before changing: across 22 plan files and 112 command-bearing
    // chunks, 111 already lead with their command. The single one that does not
    // is a 👤 human row (`npm login` then `/wbRelease …`) — the very cell A22 was
    // raised about, which must not dispatch either. Zero legitimate regressions.
    const leads = /^`\s*\//.test(beforeSub.replace(LEADING_MARKUP, ''));

    const all = leads
      ? (beforeSub.match(/`[^`]+`/g) || [])
          .map((s) => s.slice(1, -1).trim())
          .filter((s) => s.charAt(0) === '/')
      : [];
    let cmd = all.length ? all[all.length - 1] : '';
    const prelude = all.slice(0, -1);
    
    // A human row (like /wbRelease) often omits --id in the backticked command, 
    // stating "closes row 3" in the prose instead. If cmd has no --id, patch it
    // in so wave generators and the `next` runbook can attribute it.
    const closesMatch = chunk.match(/closes\s+(?:row(?:s)?\s+)?([\w.,-]+)/i);
    if (cmd && closesMatch && !/--id=/.test(cmd)) {
      cmd += ' --id=' + closesMatch[1];
    }
    const estMatch = chunk.match(/\*?\s*\(\s*⏱️?\s*(\d+)\s*min\s*\)\*?/i);
    const est = estMatch ? parseInt(estMatch[1], 10) : null;
    // Accepts both "pairs Wave A · 3" (pre-subrow) and "pairs A · 3".
    const pairs = chunk.match(/pairs\s+(?:Wave\s+)?(\w+)\s*·\s*([\w.,-]+)/i);
    
    if (cmd && pairs && !/--id=/.test(cmd)) {
      cmd += ' --id=' + pairs[2];
    }
    // A cell is HELD only when it carries an explicit status marker: the ⏸️ pause
    // emoji, or `HELD` in capitals. This used to be a case-INSENSITIVE
    // /⏸️|\bHELD\b|\bheld\s+for\b/i, which matched any prose containing the word
    // "held" — including a wave note reading "**Held** to B because it writes
    // bin/wave.js". That single word in an explanatory <sub> note marked a P0 row
    // as dependency-held and made its whole wave emit ZERO runnable cells, with
    // the row's `Dep` column reading `—`. Hold state is a status, so only a status
    // marker may set it; prose that happens to describe a hold must not.
    const held = /⏸️|\bHELD\b/.test(chunk);
    return {
      role: role,
      wave: waveLabel,
      command: cmd.trim(),
      prelude: prelude,
      suggestedModel: model,
      est: est,
      pairsWave: pairs ? pairs[1] : null,
      pairsIds: pairs ? pairs[2].split(',').map((s) => s.trim()) : [],
      held: held,
      human: human,
    };
    // A human-gated cell is KEPT even with no command, so `--list` can render it
    // as a gate and the generator can count it as skipped. Dropping it would make
    // the gate invisible rather than enforced.
  }).filter((c) => c.command || c.human);
}

function cellsOf(matrix, rawWaveLabel, kind, roleFilter) {
  let waveLabel = String(rawWaveLabel || '').trim();
  let subrowKind = kind;

  if (/\.work$/i.test(waveLabel)) {
    waveLabel = waveLabel.replace(/\.work$/i, '');
    subrowKind = 'work';
  } else if (/\.(valid|validate)$/i.test(waveLabel)) {
    waveLabel = waveLabel.replace(/\.(valid|validate)$/i, '');
    subrowKind = 'validate';
  }

  const rows = matrix.rows.filter((r) => r.label.toUpperCase() === waveLabel.toUpperCase());
  if (!rows.length) return null;

  const out = [];
  const targetKinds = subrowKind ? [subrowKind === 'validate' ? 'validate' : 'work'] : ['work', 'validate'];

  for (const k of targetKinds) {
    const row = rows.find((r) => r.kind === k) || (rows.length === 1 && k === 'work' && rows[0].kind === 'work' ? rows[0] : null);
    if (!row) continue;
    row.cells.forEach((cell, i) => {
      const role = row.roleOf[i];
      if (!role) return;
      if (roleFilter && role !== roleFilter) return;
      out.push.apply(out, parseCell(cell, role, row.label));
    });
  }
  return out;
}

/**
 * Index every *dispatch* in the matrix by (target file, id) so a paired
 * validation can discover which role — and therefore which agent — ran it.
 *
 * Validator cells are deliberately excluded: they are not dispatches, and
 * indexing them lets a pairing match itself once the matrix is recomputed and
 * the original dispatch has left the grid.
 */
function indexDispatches(matrix) {
  const index = {};
  for (const row of matrix.rows) {
    if (row.kind === 'validate') continue;
    row.cells.forEach((cell, i) => {
      const role = row.roleOf[i];
      if (!role || role === 'validator') return;
      for (const c of parseCell(cell, role, row.label)) {
        const parsed = splitCommand(c.command);
        if (!parsed) continue;
        for (const id of parsed.ids) index[keyOf(row.label, parsed.target, id)] = role;
      }
    });
  }
  return index;
}

function keyOf(wave, target, id) {
  return String(wave).toUpperCase() + '::' + path.basename(target) + '::' + id;
}

/**
 * Parse the plan's task table into { id: doneCell }.
 *
 * The `☐ Done` column is the authoritative record of *who executed* a task —
 * and unlike the matrix it survives a recompute. A paired validation must route
 * off this, not off the grid: once wave A's dispatch has been executed and the
 * matrix recomputed, the executor's role is no longer anywhere in the matrix.
 */
function parseDoneColumn(text) {
  const done = {};
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (cells.length < 4) continue;
    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    done[idm[1]] = cells[cells.length - 2] || ''; // Done is second-to-last (Valid is last)
  }
  return done;
}

/** Parse the plan table's Verify column → {taskId: verifyCommand, ...} */
function parseVerifyColumn(text) {
  const verify = {};
  let verifyIdx = null;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = splitRow(line);
    if (verifyIdx === null) {
      verifyIdx = cells.findIndex(function (c) { return /^\s*Verify\s*$/.test(c); });
      if (verifyIdx === -1) verifyIdx = null;
      continue;
    }
    if (cells.length <= verifyIdx) continue;
    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    const cmd = cells[verifyIdx].trim();
    if (cmd && cmd !== '—' && cmd !== '-') verify[idm[1]] = cmd;
  }
  return verify;
}

/** Parse the plan table's ☐ Valid column → {taskId: cellText, ...}. */
function parseValidColumn(text) {
  const valid = {};
  let validIdx = null;
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (validIdx === null) {
      validIdx = cells.findIndex(function (c) { return /^\s*☐\s*Valid\s*$/.test(c); });
      if (validIdx === -1) validIdx = null;
      continue;
    }
    if (cells.length <= validIdx) continue;
    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    valid[idm[1]] = cells[validIdx].trim();
  }
  return valid;
}

/**
 * Parse the plan table's `Requires` column → {taskId: 'planner'|'worker'|…}.
 *
 * The role tag on the task row itself, which is what decides whether the
 * executor≠validator rule applies (🧠 Planner rows are exempt). Unlike the
 * matrix, it survives a recompute that has already retired the dispatch.
 */
function parseRequiresColumn(text) {
  const requires = {};
  let reqIdx = null;
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (reqIdx === null) {
      reqIdx = cells.findIndex(function (c) { return /^\s*Requires\s*$/.test(c); });
      if (reqIdx === -1) reqIdx = null;
      continue;
    }
    if (cells.length <= reqIdx) continue;
    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    const raw = cells[reqIdx] || '';
    const role = ROLES.filter(function (r) { return r.match.test(raw); })[0];
    if (role) requires[idm[1]] = role.key;
  }
  return requires;
}

/** Parse the plan table's Task column → {taskId: taskSummary, ...} */
function parseTaskText(text) {
  const tasks = {};
  let taskIdx = null;
  for (const line of (text || '').split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (taskIdx === null) {
      taskIdx = cells.findIndex(function (c) { return /^\s*Task\s*$/.test(c); });
      if (taskIdx === -1) taskIdx = null;
      continue;
    }
    if (cells.length <= taskIdx) continue;
    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    let t = (cells[taskIdx] || '').trim();
    t = t.replace(/<[^>]+>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1').trim();
    if (t) tasks[idm[1]] = t;
  }
  return tasks;
}

/** Does this `☐ Done` cell name a Claude model? */
/**
 * Parse the plan's task table `Est. Time (mins)` column → {taskId: minutes, ...}.
 * Splits on *unescaped* pipes only — Verify cells legitimately contain `\|`,
 * which must not shift column alignment (same defect family as F24/B1).
 */
function parseEstTime(text) {
  var est = {};
  var estIdx = null;
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var trimmed = lines[i].trim();
    if (!trimmed.startsWith('|')) continue;
    var cells = splitRow(lines[i]);
    if (estIdx === null) {
      var idx = cells.findIndex(function (c) { return /^\s*Est\.\s*Time/i.test(c); });
      if (idx !== -1) estIdx = idx;
      continue;
    }
    if (cells.length <= estIdx) continue;
    var idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    var minutes = parseInt(cells[estIdx], 10);
    if (!isNaN(minutes) && minutes > 0) est[idm[1]] = minutes;
  }
  return est;
}

/** Extract a runnable shell command from a Verify cell (backtick-delimited). */
function extractVerifyCommand(verifyCell) {
  if (!verifyCell) return null;
  var trimmed = verifyCell.trim();
  if (trimmed === '—' || trimmed === '-') return null;
  // A `human: …` cell is a legitimate, deliberately-unrunnable oracle
  // (output_conventions: "if a row genuinely cannot be machine-verified,
  // write `human: <what to check>`"). Returning it as a command makes G3 try
  // to execute prose and report ATTEMPTED, which reads as a failure when the
  // row is simply not machine-checkable. Return null so G3 reports SKIPPED.
  if (/^human\s*:/i.test(trimmed)) return null;
  var btMatch = trimmed.match(/`([^`]+)`/);
  var cmd = btMatch ? btMatch[1].trim() : trimmed;
  return cmd.replace(/\\\|/g, '|');
}

/** `/wbWork some/path/plan.md --id=3,4` → { name, target, ids, rest } */
function splitCommand(command) {
  const m = command.match(/^\/(\w+)\s+(\S+)\s*(.*)$/);
  if (!m) return null;
  const rest = m[3] || '';
  const idm = rest.match(/--id=([\w.,-]+)/);
  const modelMatch = rest.match(/(?:^|\s)(?:--model|-M)(?:=\s*|\s+)(?:\"([^\"]+)\"|'([^']+)'|([^\s]+))/);
  const cellModel = modelMatch ? (modelMatch[1] || modelMatch[2] || modelMatch[3] || '').trim() : '';
  return {
    name: m[1],
    target: m[2],
    rest: rest,
    ids: idm ? idm[1].split(',').map((s) => s.trim()) : [],
    delegateModel: cellModel,
  };
}
/**
 * Read the plan's Active Model Roster.
 *
 * Two accepted forms, because the block moved:
 *   - legacy, inside the 🌊 section:  `> **Active Model Roster for this Plan:**`
 *   - current, its own section above the Task Table:  `## 🎛️ Active Model Roster`
 *     (output_conventions.md §10 rule 5b — the task table consumes the roster
 *     too, so a definition sitting 60 lines below its first use is one nobody
 *     reads.)
 *
 * The scan also tolerates BLANK LINES inside the block. The heading form puts a
 * blank between the heading and the first `>` line, and prose callouts split the
 * role lines from the notes below them — the original `if (!line.startsWith('>'))
 * break` stopped at the first of those and returned null, so relocating the block
 * silently dropped the whole roster to DEFAULT_MODELS. It ends at a horizontal
 * rule or the next heading, which is where the section genuinely ends.
 */
function parseHeaderRoster(text) {
  let inBlock = false;
  const roster = {};
  for (const line of text.split('\n')) {
    if (inBlock) {
      if (/^\s*$/.test(line)) continue;
      if (/^\s*---\s*$/.test(line) || /^#{1,6}\s/.test(line)) break;
      if (!line.startsWith('>')) break;
      let roleKey = null;
      for (const [emoji, role] of Object.entries(ROLE_EMOJI_MAP)) {
        if (line.includes(emoji)) { roleKey = role; break; }
      }
      if (!roleKey) continue;
      const modelsMatch = line.match(/`([^`]+)`/);
      if (!modelsMatch) continue;
      // Split on the `||` fallback operator and on the ` / ` SEPARATOR — never on
      // a bare `/`, which lives inside every provider-prefixed slug
      // (`opencode/deepseek-v4-pro`). Splitting naively yielded the bare
      // provider name ("opencode"), which resolves to nothing and silently
      // dropped the whole plan-header roster to DEFAULT_MODELS.
      const chain = modelsMatch[1]
        .split(/\s*\|\|\s*|\s+\/\s+/).map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });
      // Keep the WHOLE chain. Taking only [0] is what made the 2nd and 3rd
      // models decorative: the roster and the wbWork template both promise
      // left-to-right fallback, and nothing implemented it.
      if (chain.length && !roster[roleKey]) roster[roleKey] = chain;
    }
    if (/\*\*Active Model Roster for this Plan:\*\*/.test(line) ||
        /^#{1,6}\s.*Active Model Roster\s*$/.test(line)) inBlock = true;
  }
  return Object.keys(roster).length >= 4 ? roster : null;
}

function parseModelRecommendations(mdPath) {
  if (!mdPath || !fs.existsSync(mdPath)) return null;
  const text = fs.readFileSync(mdPath, 'utf8');
  const chosenMtime = fs.statSync(mdPath).mtimeMs;
  const roster = {};
  const emojiEntries = Object.entries(ROLE_EMOJI_MAP);
  let inTable = false;
  let sawTable = false;
  for (const line of text.split('\n')) {
    if (inTable) {
      if (!line.trim().startsWith('|')) {
        // Bound the scan to the FIRST table under the heading. Without this, a
        // roster whose rows are all placeholders leaves `roster` empty, the loop
        // never breaks, and it walks into the next table — reading prose like
        // "Deep reasoning, decomposition, strategy" as a model name.
        if (sawTable || Object.keys(roster).length > 0) break;
        continue;
      }
      sawTable = true;
      let roleKey = null;
      for (const [emoji, role] of emojiEntries) {
        if (line.includes(emoji)) { roleKey = role; break; }
      }
      if (!roleKey) continue;
      const cells = line.trim().replace(/^\|/, '').split('|');
      if (cells.length < 2) continue;
      const col2 = cells[1].trim();
      const chainCell = col2.replace(/⚠️.*$/, '')
        .split(/\s+\/\s+/).map(function (x) { return x.replace(/\*\*/g, '').trim(); })
        .filter(function (x) { return x && !/^_.*_$/.test(x); });
      const firstModel = chainCell[0] || col2.replace(/\*\*([^*]+)\*\*.*$/, '$1').trim();
      // `_not configured_` and friends are the shipped default's placeholders,
      // not models. Counting them makes an unfilled roster look populated, which
      // both shadows the real install and spams "unrecognised model" warnings.
      if (/^_.*_$/.test(firstModel)) continue;
      if (chainCell.length && !roster[roleKey]) roster[roleKey] = chainCell;
    }
    if (/\bUser Models\b/.test(line)) inTable = true;
  }
  if (Object.keys(roster).length < 4) return null;
  // Non-enumerable so it never appears in role iteration or JSON dumps — it
  // exists purely so the router can compare freshness across candidate roots.
  Object.defineProperty(roster, '__mtime', { value: chosenMtime, enumerable: false });
  Object.defineProperty(roster, '__path', { value: mdPath, enumerable: false });
  return roster;
}

module.exports = {
  parseMatrix, splitRow, parseCell, cellsOf, indexDispatches, keyOf,
  parseDoneColumn, parseVerifyColumn, parseValidColumn, parseRequiresColumn,
  parseTaskText, parseEstTime, extractVerifyCommand, splitCommand,
  parseHeaderRoster, parseModelRecommendations
};

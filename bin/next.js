#!/usr/bin/env node
/**
 * bin/next.js — `wb-flow next <plan.md>`
 *
 * Generates the **▶️ How To Run This Plan** block: a wave inventory, the ordered
 * list of commands, the derived reasons NOT to use `--wave=all`, and flag
 * guidance.
 *
 * Everything here is **derived from the plan**, never authored:
 *
 *   - wave inventory  ← the 🌊 matrix, routed through `wave.js` `route()`
 *   - serial pairs    ← a wave whose task `Dep`s on the previous wave's task
 *   - judgment cells  ← a `🧠 Planner` row inside a wave
 *   - go/no-go gates  ← a `✅ Validator`-TAGGED task (not an auto-paired one)
 *
 * That is the whole point: a hand-written "how to run this" goes stale the
 * moment a task moves wave, and a stale run-book is worse than none — it tells
 * you to dispatch something that is now blocked. Regenerate instead.
 *
 * One generator, three consumers: `wb-flow next`, the `--next` flag on every
 * `/wb*` command, and the block embedded in the plan file itself.
 *
 * Zero dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const WV = require('./wave.js');

const BLOCK_START = '<!-- HOW_TO_RUN_START -->';
const BLOCK_END = '<!-- HOW_TO_RUN_END -->';
const HEADING = '## ▶️ How to run this plan';

const HELP = `
  wb-flow next — how to run a plan, derived from the plan

  Usage: wb-flow next <plan.md> [options]

  Prints a wave inventory, the ordered command list, the reasons NOT to use
  --wave=all (derived from this plan's own deps and roles), and flag guidance.

  Options:
    --embed        Write the block into the plan between the HOW_TO_RUN markers,
                   replacing any previous one. Regenerate after every edit.
    --json         Machine-readable
    --help, -h     Show this message
`;

/** Waves in matrix order, with their routed cells. */
function inventory(text, repoRoot, planPath) {
  const matrix = WV.parseMatrix(text);
  if (!matrix) return null;
  const requires = WV.parseRequiresColumn(text);
  const done = WV.parseDoneColumn(text);
  const est = WV.parseEstTime(text);
  const labels = [];
  for (const r of matrix.rows) if (labels.indexOf(r.label) === -1) labels.push(r.label);

  const packageRoot = WV.findPackageRoot(path.dirname(planPath));
  const resolved = WV.resolveModelsFromRoster(text, repoRoot, {}, WV.DEFAULT_MODELS, packageRoot);
  const models = resolved.models;
  return labels.map(function (label) {
    const cells = (WV.cellsOf(matrix, label, 'work') || [])
      .concat(WV.cellsOf(matrix, label, 'validate') || []);
    const routed = cells.filter(function (c) { return !c.held; }).map(function (c) {
      // A ✅ Validator-tagged task is still work when it appears in the
      // work sub-row. Its cell carries a /wbWork prelude followed by the
      // validation command; the Requires column names the task's role, not
      // the command to execute. A pairing cell has pairsWave and remains
      // validation-only.
      const isValidatorTask = c.role === 'validator' && !c.pairsWave && c.prelude && c.prelude.length;
      const effectiveCommand = isValidatorTask
        ? (c.prelude.find(function (command) { return /^\/wbWork\s+\S+/.test(command) && /--id=/.test(command); }) || c.prelude[0])
        : c.command;
      const effectiveCell = isValidatorTask
        ? Object.assign({}, c, { command: effectiveCommand, role: 'worker' })
        : c;
      // The matrix annotation is the model the plan author approved for this
      // cell. Feed it back through the same router as an explicit per-cell
      // override so a paired validator cannot be re-routed onto Claude and
      // then merged with a different annotated lane.
      const routeCell = effectiveCell.suggestedModel && !effectiveCell.human
        ? Object.assign({}, effectiveCell, {
          command: effectiveCell.command + ' -M="' + effectiveCell.suggestedModel + '"',
        })
        : effectiveCell;
      const r = WV.route(routeCell, WV.indexDispatches(matrix), models, done, '', requires);
      const parsed = WV.splitCommand(effectiveCommand);
      // `parsed` must be carried through: groupDispatches() skips any item without
      // it (`if (!item.parsed) continue`), so omitting it silently emptied BOTH
      // "without --wave flag" scenarios and dropped the mandatory -M model flags.
      return { cell: effectiveCell, route: r, parsed: parsed, ids: parsed ? parsed.ids : [], name: parsed ? parsed.name : '' };
    });
    // Ids this wave WORKS, as opposed to ids its validate row merely pairs.
    // Without the split, "validate what this wave did" re-validates rows that
    // closed three waves ago.
    // A legacy single-row matrix has no work/validate split, so cellsOf() calls
    // the whole row "work". Distinguish by ROLE instead: a ✅ Validator cell
    // that PAIRS another row is a validation, not work this wave performs.
    const workCells = (WV.cellsOf(matrix, label, 'work') || []).filter(function (c) {
      return !c.held && !(c.role === 'validator' && c.pairsWave);
    });
    const heldCells = (WV.cellsOf(matrix, label, 'work') || []).filter(function (c) {
      return c.held;
    });
    const workIds = workCells.reduce(function (a, c) {
      const command = c.role === 'validator' && !c.pairsWave && c.prelude && c.prelude.length
        ? (c.prelude.find(function (item) { return /^\/wbWork\s+\S+/.test(item) && /--id=/.test(item); }) || c.prelude[0])
        : c.command;
      const parsed = WV.splitCommand(command);
      return a.concat(parsed ? parsed.ids : []);
    }, []);
    const ids = routed.reduce(function (a, x) { return a.concat(x.ids); }, []);
    const validCol = parseValidColumn(text);
    const toValidate = workIds.filter(function (id, i, arr) {
      return arr.indexOf(id) === i && !/✅/.test(validCol[id] || '');
    });
    return {
      label: label,
      cells: routed.length,
      inSession: routed.filter(function (x) { return x.route.lane === 'claude'; }).length,
      spawned: routed.filter(function (x) { return x.route.lane !== 'claude'; }).length,
      ids: ids,
      workIds: workIds,
      toValidate: toValidate,
      heldCells: heldCells.length,
      heldParsed: heldCells.map(function (c) {
        return { command: c.command, reason: c.held === true ? 'dependency not met' : (c.held || 'unknown') };
      }),
      minutes: workIds.filter(function (id, i, a) { return a.indexOf(id) === i; })
        .reduce(function (a2, id) { return a2 + (est[id] || 0); }, 0),
      roles: Array.from(new Set(routed.map(function (x) { return x.cell.role; }))),
      requires: requires,
      routed: routed,
    };
  }).filter(function (w) { return w.cells > 0 || w.label; });
}

/**
 * Why this plan must not run unattended. Every reason is derived; if none
 * apply, say so rather than inventing caution.
 */
function autopilotRisks(waves, text) {
  const requires = WV.parseRequiresColumn(text);
  const deps = parseDeps(text);
  const risks = [];

  for (const w of waves) {
    // 1. A 🧠 Planner row inside a wave is a judgment call.
    const planners = (w.workIds || []).filter(function (id, i, a) {
      return a.indexOf(id) === i && requires[id] === 'planner';
    });
    if (planners.length) {
      const uniquePlanners = planners.filter(function (id, i, a) { return a.indexOf(id) === i; });
      risks.push({
        wave: w.label,
        kind: 'judgment',
        text: '**Wave ' + w.label + ' holds task ' + uniquePlanners.join(', ') + '** — a 🧠 Planner row. '
            + 'Auto-deciding it means an unreviewed decision drives everything downstream.',
      });
    }
    // 2. A ✅ Validator-TAGGED task (not an auto-pairing) is a gate.
    const gates = w.routed.filter(function (x) {
      return x.cell.role === 'validator' && !x.cell.pairsWave && x.ids.some(function (id) { return requires[id] === 'validator'; });
    });
    if (gates.length) {
      const gateIds = Array.from(new Set(gates.reduce(function (a, g) { return a.concat(g.ids); }, [])));
      risks.push({
        wave: w.label,
        kind: 'gate',
        text: '**Wave ' + w.label + ' is a gate, not a step** — task '
            + gateIds.join(', ')
            + ' exists so a human decides whether to continue.',
      });
    }
    // 2b. A 👤 human row is a gate.
    const humanRows = w.routed.filter(function (x) {
      return (x.route && /human/i.test(x.route.model || '')) || (x.cell && /human/i.test(x.cell.suggestedModel || ''));
    });
    if (humanRows.length) {
      const humanIds = Array.from(new Set(humanRows.reduce(function (a, r) { return a.concat(r.ids); }, [])));
      risks.push({
        wave: w.label,
        kind: 'gate',
        text: '**Wave ' + w.label + ' holds task ' + humanIds.join(', ') + '** — a 👤 human row. '
            + 'It requires manual human execution.',
      });
    }
  }

  // 3. Consecutive waves where the later one Deps on the earlier one's task.
  for (let i = 1; i < waves.length; i++) {
    const prev = waves[i - 1];
    const cur = waves[i];
    const chained = (cur.workIds || []).filter(function (id, i, a) {
      return a.indexOf(id) === i
        && (deps[id] || []).some(function (d) { return (prev.workIds || []).indexOf(d) !== -1; });
    });
    // A wave already flagged as a gate does not also need a serial note — the
    // gate is the stronger statement and two bullets for one wave reads as noise.
    const alreadyGate = risks.some(function (r) { return r.wave === cur.label && r.kind === 'gate'; });
    if (chained.length && cur.cells === 1 && !alreadyGate) {
      risks.push({
        wave: prev.label + '→' + cur.label,
        kind: 'serial',
        text: '**' + prev.label + '→' + cur.label + ' is serial by nature** — task ' + chained.join(', ')
            + ' consumes what ' + prev.label + ' produces. One unattended pass runs the second against a half-built first.',
      });
    }
  }
  return risks;
}

/** `☐ Valid` column → {id: cell}. Used to skip re-validating a closed row. */
function parseValidColumn(text) {
  const out = {};
  for (const line of String(text).split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = WV.splitRow(line);
    if (cells.length < 4) continue;
    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    out[idm[1]] = cells[cells.length - 1] || '';   // Valid is the last column
  }
  return out;
}

/** `Dep` column → {id: [ids]}. */
function parseDeps(text) {
  const out = {};
  let depIdx = null;
  for (const line of String(text).split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = WV.splitRow(line);
    if (depIdx === null) {
      depIdx = cells.findIndex(function (c) { return /^\s*Dep\s*$/.test(c); });
      if (depIdx === -1) depIdx = null;
      continue;
    }
    if (cells.length <= depIdx) continue;
    const idm = (cells[0] || '').match(/^\[?([\w.-]+)\]?/);
    if (!idm) continue;
    const raw = (cells[depIdx] || '').trim();
    if (!raw || raw === '—' || raw === '-') { out[idm[1]] = []; continue; }
    out[idm[1]] = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }
  return out;
}

function fmtMinutes(m) {
  if (!m) return '—';
  return m >= 60 ? '~' + (m / 60).toFixed(1) + ' h' : '~' + m + ' min';
}

/**
 * The closest safe equivalent to `--wave=all`, for a plan that has a derived
 * blocker: every remaining wave, in order, one command per wave, **segmented**
 * at the waves that need a human between them.
 *
 * Why one line per wave and not `--wave=C,D`: `wave.js` splits `--wave=` on `:`
 * for role-narrowing only and takes a SINGLE label. A comma list is parsed as the
 * literal label `C,D`, matches no row, and exits non-zero. Do not invent it.
 *
 * Segmentation reuses `autopilotRisks()` — the same analysis that produces the
 * "Why not --wave=all" bullets — so the run-book and the justification can never
 * disagree: a wave gets a pause line if and only if it contributed a bullet.
 */
function waveFlag(label) {
  const value = String(label);
  // Keep the rendered command free of literal spaces inside the value so the
  // plan's copy/paste oracle can distinguish a single argument from the old
  // split form. Bash concatenates the ANSI-C quoted space into the same word.
  return '--wave=' + value.replace(/\s/g, function () { return "$'\\x20'"; });
}

function segmentedRunbook(waves, risks) {
  const out = [];
  if (!waves.length) return out;

  if (!risks.length) {
    out.push('/wbWork $P ' + waveFlag('all') + ' -y      # no derived blocker in this plan');
    return out;
  }

  const byWave = {};
  for (const r of risks) (byWave[r.wave] = byWave[r.wave] || []).push(r);

  out.push('# ⚠️ the all-waves mode is NOT advised here (see the rationale below).');
  out.push('# Closest safe equivalent — same waves, in order, paused where a human is needed:');
  for (const w of waves) {
    const hit = byWave[w.label] || [];
    if (hit.length) {
      const kinds = Array.from(new Set(hit.map(function (h) { return h.kind; })));
      out.push('#   ⏸ ' + (kinds.indexOf('gate') !== -1 ? 'GATE' : 'REVIEW')
             + ' — wave ' + w.label + ' ' + reasonFor(hit) + '. Read its output before continuing.');
    }
    out.push('/wbWork $P ' + waveFlag(w.label) + ' -y');
  }
  return out;
}

/** One short clause explaining why a wave needs a human, from its risk records. */
function reasonFor(hits) {
  const kinds = hits.map(function (h) { return h.kind; });
  if (kinds.indexOf('gate') !== -1) return 'is a go/no-go gate';
  if (kinds.indexOf('judgment') !== -1) return 'holds a 🧠 Planner decision';
  return 'consumes what the previous wave produces';
}

function groupDispatches(routed) {
  if (!routed || !routed.length) return [];
  const map = new Map();
  const list = [];
  for (const item of routed) {
    if (!item.parsed) continue;
    const cmdName = item.parsed.name || 'wbWork';
    const role = item.cell ? item.cell.role : 'worker';
    const model = (item.route && item.route.model) ? item.route.model : '';
    const lane = (item.route && item.route.lane) ? item.route.lane : '';
    // Keep the plan's approved annotation in the grouping key as well as the
    // resolved route. Older plans can contain a paired cell whose annotation
    // names a different executor than the fallback inferred from Done; those
    // ids must never be merged into one command and silently promoted to the
    // more expensive lane.
    const suggestedModel = item.cell ? item.cell.suggestedModel : '';
    const key = [cmdName, role, model, lane, suggestedModel].join('::');
    if (map.has(key)) {
      const prev = map.get(key);
      for (const id of item.parsed.ids) {
        if (prev.ids.indexOf(id) === -1) prev.ids.push(id);
      }
    } else {
      const entry = {
        cmdName: cmdName,
        role: role,
        model: model,
        lane: lane,
        rawExecutor: item.cell ? item.cell.suggestedModel : '',
        ids: item.parsed.ids.slice()
      };
      map.set(key, entry);
      list.push(entry);
    }
  }

  const lines = [];
  for (const entry of list) {
    let modelFlag;
    if ((entry.model && /human/i.test(entry.model)) || (entry.rawExecutor && /human/i.test(entry.rawExecutor))) {
      modelFlag = '   # manual execution (human)';
    } else if (entry.model) {
      modelFlag = ' -M="' + entry.model + '"';
    } else if (entry.lane === 'claude') {
      // NOT `-M="Claude (auto)"`. `-M` means *delegate this run to a named model*,
      // while `Claude (auto)` is the roster's in-session sentinel meaning *do not
      // delegate* — the flag and its value contradict each other. Worse, it is not
      // dispatchable: wave.js resolves it to '' and exits 1 with "names the
      // in-session Claude sentinel, which cannot be dispatched", so the emitted
      // line is guaranteed to fail if anyone pastes it into `wb-flow wave --model=`.
      // Name the executor in a trailing comment instead; the line stays runnable.
      modelFlag = '   # in-session (Claude — no delegation)';
    } else {
      modelFlag = '';
    }
    lines.push('/' + entry.cmdName + ' $P --id=' + entry.ids.join(',') + modelFlag);
  }
  return lines;
}

/** Render one copy/paste command without allowing neighbouring commands to
 * become part of the same shell block. The lint gate treats these headings and
 * fences as the plan's copy/paste contract. */
function commandBlock(lines) {
  const out = [];
  for (const line of lines || []) {
    out.push('```bash');
    out.push(line);
    out.push('```');
  }
  return out;
}

function recommendedCommands(planRel, live, risks) {
  const out = [
    '### 🚀 Recommended Next Execution Command(s)',
    '',
    '*Calculated from the active wave matrix (Total Wave A Est. Time: '
      + fmtMinutes(live[0] ? live[0].minutes : 0) + ' wall-clock)*',
    '',
    '- **Option 1: Standard Parallel Wave Execution (Wave ' + live[0].label + ')** — *Est. ' + fmtMinutes(live[0].minutes) + '*',
    '  ```bash',
    '  .wb/bin/wbRun claude -p --permission-mode auto "/wbWork ' + planRel + ' ' + waveFlag(live[0].label) + ' -y"',
    '  ```',
    '',
    '- **Option 2: All remaining waves (segmented where review is required)** — *Derived from the active matrix*',
    '  ```bash',
    '  .wb/bin/wbRun claude -p --permission-mode auto "/wbWork ' + planRel + ' --wave=all -y"',
    '  ```',
  ];
  if (risks && risks.length) {
    out.push('', '> ⚠️ the all-waves mode is not advised for this plan; use Scenario 3 above and pause at its review gates.');
  }
  return out;
}

function render(planRel, waves, risks, opts) {
  const o = opts || {};
  const live = waves.filter(function (w) { return w.cells > 0; });
  const L = [];

  L.push(HEADING);
  L.push('');

  // ── closed plan: one line, and nothing that reads as an instruction ──────────
  // A closed plan used to render the full run-book scaffolding — the "regenerate
  // after every edit" preamble, an inventory table with a header and no rows, a
  // "Why not --wave=all" section still recommending a dispatch, and a Flags
  // section tuning flags for cells that no longer exist. Every one of those is an
  // instruction to act on a plan where there is nothing to do. Emitting a header
  // with no rows is worse than emitting nothing: it reads as "the data is
  // missing", not as "the work is finished".
  if (!live.length) {
    L.push('> Generated by `wb-flow next` — **derived from this plan**, not authored.');
    L.push('');
    L.push('**Nothing to dispatch — every task in this plan is closed.**');
    L.push('');
    L.push('### 📋 Copy/Paste Execution Scenarios');
    L.push('');
    L.push('#### 1. Next wave execution (with `--wave` flag — work + valid)');
    L.push('```bash');
    L.push('# none — all waves complete');
    L.push('```');
    L.push('');
    L.push('#### 2. Next wave dispatches (without `--wave` flag — grouped by model)');
    L.push('```bash');
    L.push('# none — all waves complete');
    L.push('```');
    L.push('');
    L.push('#### 3. All remaining waves execution (with `--wave` flag)');
    L.push('```bash');
    L.push('# none — all waves complete');
    L.push('```');
    L.push('');
    L.push('#### 4. All remaining waves dispatches (without `--wave` flag — grouped by model)');
    L.push('```bash');
    L.push('# none — all waves complete');
    L.push('```');
    L.push('');
    L.push('### 🚀 Recommended Next Execution Command(s)');
    L.push('');
    L.push('No dispatch remains — every task is complete.');
    L.push('');
    return L.join('\n');
  }

  L.push('> Generated by `wb-flow next` — **derived from this plan**, not authored. Regenerate after');
  L.push('> every edit: a hand-written run-book goes stale the moment a task changes wave, and a stale');
  L.push('> one tells you to dispatch something that is now blocked.');
  L.push('');

  // ── inventory ──
  L.push('| Wave | Cells | Spawned | Est. | Nature |');
  L.push('|---|---|---|---|---|');
  for (const w of waves) {
    if (!w.cells) { L.push('| ' + w.label + ' | 0 | — | — | ✅ closed |'); continue; }
    const risk = risks.filter(function (r) { return r.wave === w.label; })[0];
    const nature = risk ? (risk.kind === 'gate' ? '**go/no-go gate**' : 'holds a judgment call')
                        : (w.spawned === 0 ? 'in-session only' : 'parallel');
    L.push('| **' + w.label + '** | ' + w.cells + ' | ' + w.spawned + ' | ' + fmtMinutes(w.minutes) + ' | ' + nature + ' |');
  }
  L.push('');

  // ── copy-paste dispatches by scenario ──
  L.push('### 📋 Copy/Paste Execution Scenarios');
  L.push('');
  L.push('```bash');
  L.push('P=' + planRel);
  L.push('```');
  L.push('');
  if (!live.length) {
    L.push('# Nothing to dispatch — this plan is closed.');
  } else {
    L.push('#### 1. Next wave execution (with `--wave` flag — work + valid)');
    L.push('');
    if (live[0]) {
      L.push.apply(L, commandBlock(['/wbWork $P ' + waveFlag(live[0].label) + ' -y']));
    }
    L.push('');
    L.push('#### 2. Next wave dispatches (without `--wave` flag — grouped by model)');
    L.push('');
    if (live[0] && live[0].routed) {
      const nextWaveLines = groupDispatches(live[0].routed);
      L.push.apply(L, commandBlock(nextWaveLines));
    }
    L.push('');
    L.push('#### 3. All remaining waves execution (with `--wave` flag)');
    L.push('');
    // Emitting a bare `--wave=all` here while the "Why not --wave=all" section below
    // argues against it hands the reader a command and then tells them not to run it.
    // When this plan HAS a derived blocker, emit the closest safe equivalent instead:
    // the same waves, in order, segmented at the points that need a human.
    L.push.apply(L, commandBlock(segmentedRunbook(live, risks)));
    L.push('');
    L.push('#### 4. All remaining waves dispatches (without `--wave` flag — grouped by model)');
    L.push('');
    for (let i = 0; i < live.length; i++) {
      const w = live[i];
      L.push('**Wave ' + w.label + ':**');
      const waveLines = groupDispatches(w.routed);
      L.push.apply(L, commandBlock(waveLines));
      if (w.heldParsed && w.heldParsed.length) {
        for (const h of w.heldParsed) {
          L.push('# ⏸️ HELD — ' + h.command.replace(/^\/wbWork\s+\S+\s+/, '') + ' (' + h.reason + ')');
        }
      }
    }
  }
  L.push('');
  L.push.apply(L, recommendedCommands(planRel, live, risks));
  L.push('');

  // ── why not all ──
  L.push('### Why not `--wave=all`');
  L.push('');
  if (!risks.length) {
    L.push('No derived blocker in this plan — every wave is mechanical and dependency-clean. '
         + '`--wave=all` is defensible here. Still watch the first dispatch: a half-failed wave '
         + 'makes the next one meaningless regardless.');
  } else {
    for (const r of risks) L.push('- ' + r.text);
    L.push('');
    L.push('The template rule behind all of these: *a half-failed wave makes the next wave meaningless.*');
    L.push('');
    L.push('**This is a refusal with an alternative, not a dead end.** Scenario 3 above already carries '
         + 'the closest safe equivalent: the same waves, in the same order, one wave-label command per line, '
         + 'with a `⏸` pause line before each wave that produced a bullet here. Run it top to bottom and '
         + 'stop at the pauses — that is the all-waves mode minus the part that makes it unsafe.');
    L.push('');
    L.push('> ⚠️ One command per wave. The `--wave` flag takes a **single** label — a comma-separated label is '
         + 'parsed literally, matches no row, and exits non-zero.');
  }
  L.push('');

  // ── flags ──
  L.push('### Flags');
  L.push('');
  L.push('- `--summary` is **already the default** in wave mode. Add `--no-summary` only when');
  L.push('  debugging one cell — the full stream costs orchestrator context, once per cell.');
  const heaviest = live.slice().sort(function (a, b) { return b.spawned - a.spawned; })[0];
  if (heaviest && heaviest.spawned >= 2) {
    L.push('- `--sessions` is opt-in and unmeasured. Skip it early — cells on different tasks share');
    L.push('  little warm context. Revisit at **Wave ' + heaviest.label + '** (' + heaviest.spawned
         + ' spawned cells), and measure with `opencode stats --days 1 --models` before and after.');
  } else {
    L.push('- `--sessions` buys little here — no wave spawns enough cells to amortise a warm session.');
  }
  L.push('- `--snap` / `--snap-copy` on any run you want to find again.');
  return L.join('\n');
}

function run(argv) {
  const args = (argv || []).filter(Boolean);
  if (args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1) { console.log(HELP); return 0; }
  const embed = args.indexOf('--embed') !== -1;
  const asJson = args.indexOf('--json') !== -1;
  const planPath = args.filter(function (a) { return a.charAt(0) !== '-'; })[0];

  if (!planPath || !fs.existsSync(planPath)) {
    console.error('❌ Usage: wb-flow next <plan.md> [--embed] [--json]');
    return 1;
  }
  const text = fs.readFileSync(planPath, 'utf8');
  const waves = inventory(text, process.cwd(), planPath);
  if (!waves) {
    console.error('❌ No `## 🌊 Next Executable Sequence` matrix in ' + planPath);
    console.error('   Run /wbPlan on it first — the matrix is what this block is derived from.');
    return 1;
  }
  const risks = autopilotRisks(waves, text);
  const block = render(planPath, waves, risks, {});

  if (asJson) { console.log(JSON.stringify({ waves: waves.map(function (w) { return { label: w.label, cells: w.cells, spawned: w.spawned, ids: w.ids, minutes: w.minutes }; }), risks: risks }, null, 2)); return 0; }

  if (embed) {
    const wrapped = BLOCK_START + '\n' + block + '\n' + BLOCK_END;
    let next;
    if (text.indexOf(BLOCK_START) !== -1 && text.indexOf(BLOCK_END) !== -1) {
      // Strip the block AND the separators that were emitted around it. Removing
      // only the marker span leaves the previous run's `---` rules behind, and the
      // re-insert below adds two more — so every --embed accreted two orphaned
      // rules plus blank lines. Observed: ~40 lines of nothing but `---` between
      // the Wave-notes callout and the block, after a day of routine re-embeds.
      const before = text.slice(0, text.indexOf(BLOCK_START)).replace(/(?:\s*\n---[ \t]*)+\s*$/, '\n');
      const after = text.slice(text.indexOf(BLOCK_END) + BLOCK_END.length).replace(/^(?:\s*---[ \t]*\n)+/, '\n');
      let stripped = before + after;
      stripped = stripped.replace(/\n### 📋 Copy\/Paste Execution Scenarios[\s\S]*?(?=\n### |\n## |\n<!--|\n*$)/g, '\n');
      stripped = stripped.replace(/\n### 🚀 Recommended Next Execution Command\(s\)[\s\S]*?(?=\n### |\n## |\n<!--|\n*$)/g, '\n');
      stripped = stripped.replace(/\n### 💰 Plan Budget Estimate[\s\S]*?(?=\n### |\n## |\n<!--|\n*$)/g, '\n');
      const targetPos = stripped.search(/\n## (🔗 Action Types|🧭 What's Next\?|📂 Generated Files)/);
      if (targetPos !== -1) {
        next = stripped.slice(0, targetPos).trimRight() + '\n\n---\n\n' + wrapped + '\n\n---\n\n' + stripped.slice(targetPos).trimLeft();
      } else {
        next = stripped.trimRight() + '\n\n---\n\n' + wrapped + '\n';
      }
    } else {
      const targetPos = text.search(/\n## (🔗 Action Types|🧭 What's Next\?|📂 Generated Files)/);
      if (targetPos !== -1) {
        next = text.slice(0, targetPos).trimRight() + '\n\n---\n\n' + wrapped + '\n\n---\n\n' + text.slice(targetPos).trimLeft();
      } else {
        next = text.trimRight() + '\n\n---\n\n' + wrapped + '\n';
      }
    }
    fs.writeFileSync(planPath, next);
    console.log('✅ How-to-run block embedded in ' + planPath);
    return 0;
  }

  console.log('\n' + block + '\n');
  return 0;
}

module.exports = { run, inventory, parseValidColumn, autopilotRisks, parseDeps, render, BLOCK_START, BLOCK_END, HEADING, waveFlag };

if (require.main === module) process.exit(run(process.argv.slice(2)));

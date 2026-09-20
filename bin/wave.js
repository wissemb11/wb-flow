#!/usr/bin/env node
/**
 * bin/wave.js — `wb-flow wave <plan.md> --wave=A`
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const { PKG_ROOT, ROLES, DEFAULT_MODELS, INFRA_FATAL_MESSAGES, GATE_LINE_PATTERN, INFRA_GREP_PATTERN, NAME_TO_SLUG, CODEX_ONLY_RE, AGY_ONLY_SLUGS, MATRIX_HEADING, HELP, ROLE_EMOJI_MAP } = require('./wave_constants');
const { parseMatrix, splitRow, parseCell, cellsOf, indexDispatches, keyOf, parseDoneColumn, parseVerifyColumn, parseValidColumn, parseRequiresColumn, parseTaskText, parseEstTime, extractVerifyCommand, splitCommand, parseHeaderRoster, parseModelRecommendations } = require('./wave_parser');
const { resolveDisplayName, isClaudeExecutor, route, chainFor, cliFor, resolveModelsFromRoster } = require('./wave_router');
const { sessionArgsShell, shq, templatePathFor, inlineTemplatePrompt, sessionKeyFor, keyFileOf, emitDispatchGates, buildScript, resolveWbRun } = require('./wave_generator');

/**
 * A model flag may name a FALLBACK CHAIN, not a single model:
 *
 *     -M="openai/gpt-5.5||anthropic/claude-fable-5||xai/grok-4.5"
 *
 * That is the same `||` spelling the roster and `model_recommendations.md`
 * already use for their dispatch chains, so the flag and the roster describe a
 * chain the same way. Before this, `-M=` was `arg.slice(3).trim()` — one opaque
 * string — so a chain became a lookup for a model literally named `a||b||c`,
 * and every generated dispatch carried a single model with no fallback while
 * `concepts/model-fallback-chains.md` documented the opposite.
 *
 * Split, trim, drop empties, de-duplicate while preserving order.
 */
function splitModelChain(raw) {
  return String(raw == null ? '' : raw)
    .split(/\s*(?:\|\||,)\s*/)
    .map(function (s) { return s.trim(); })
    .filter(function (s, i, a) { return s && a.indexOf(s) === i; });
}

/**
 * `--worker="a||b||c"` pins the whole chain for a role, not just its head:
 * `models.<key>` is the head (what every existing caller reads) and
 * `models.chains.<key>` is the sequence `chainFor()` already knows how to
 * consume. Keeping both in sync here is what makes an explicit role flag
 * behave exactly like a roster-derived chain.
 */
function setRoleChain(opts, key, raw) {
  const chain = splitModelChain(raw);
  opts.models[key] = chain[0] || '';
  opts.models.chains = opts.models.chains || {};
  opts.models.chains[key] = chain;
  opts._explicitModels[key] = true;
}

function parseArgs(argv) {
  const opts = {
    plan: null, wave: null, waveRole: null, kind: null, out: null, print: false, jobs: 4,
    delegateModel: '', delegateChain: [],
    models: Object.assign({}, DEFAULT_MODELS), _explicitModels: {}, list: false, help: false,
    selfTestGates: false, selfTestLogFile: '', selfTestExitCode: 0,
    selfTestOracle: false, selfTestOracleCmd: '', sessions: false, summary: false, sandbox: false,
  };
  const positionals = [];
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--print') opts.print = true;
    else if (arg === '--list') opts.list = true;
    else if (arg === '--validate') opts.kind = 'validate';
    else if (arg === '--sessions') opts.sessions = true;
    else if (arg === '--summary') opts.summary = true;
    else if (arg === '--sandbox') opts.sandbox = true;
    // Accepted explicitly so a `/wbWork … --wave=A --no-summary` pass-through
    // doesn't land in positionals and get mistaken for the plan path.
    else if (arg === '--no-summary') opts.summary = false;
    else if (arg === '--self-test-gates') opts.selfTestGates = true;
    else if (arg === '--self-test-oracle') opts.selfTestOracle = true;
    else if (arg.indexOf('--wave=') === 0 || arg.indexOf('-W=') === 0) {
      // `--wave=A` runs the whole row. `--wave=A:W` narrows to ONE cell:
      //   P → 🧠 Planner · V → ✅ Validator · W → 🔨 Worker · M → 📋 Mechanical
      const raw = (arg.indexOf('-W=') === 0 ? arg.slice(3) : arg.slice(7)).trim();
      const parts = raw.split(':');
      opts.wave = parts[0].trim();
      if (parts.length > 1 && parts[1].trim()) {
        const r = parts[1].trim().toUpperCase();
        const map = { P: 'planner', V: 'validator', W: 'worker', M: 'mechanical' };
        if (!map[r]) {
          console.error('❌ Unknown wave role \'' + parts[1] + '\' in --wave=' + raw);
          console.error('   Use P (Planner), V (Validator), W (Worker) or M (Mechanical).');
          process.exit(1);
        }
        opts.waveRole = map[r];
      }
    }
    else if (arg.indexOf('--model=') === 0) opts.delegateChain = splitModelChain(arg.slice(8));
    else if (arg.indexOf('-M=') === 0) opts.delegateChain = splitModelChain(arg.slice(3));
    // (resolution happens after the loop — see resolveDelegate below)
    else if (arg.indexOf('--out=') === 0) opts.out = arg.slice(6).trim();
    else if (arg.indexOf('--jobs=') === 0) opts.jobs = parseInt(arg.slice(7), 10) || 0;
    else     if (arg.indexOf('--worker-model=') === 0) { setRoleChain(opts, 'worker', arg.slice(15)); }
    else if (arg.indexOf('--worker=') === 0) { setRoleChain(opts, 'worker', arg.slice(9)); }
    else if (arg.indexOf('--mech-model=') === 0) { setRoleChain(opts, 'mechanical', arg.slice(13)); }
    else if (arg.indexOf('--mechanical=') === 0) { setRoleChain(opts, 'mechanical', arg.slice(13)); }
    else if (arg.indexOf('--validator-model=') === 0) { setRoleChain(opts, 'selfValidator', arg.slice(18)); }
    else if (arg.indexOf('--validator=') === 0) { setRoleChain(opts, 'selfValidator', arg.slice(12)); }
    else if (arg.indexOf('--planner=') === 0) { setRoleChain(opts, 'planner', arg.slice(10)); }
    else if (arg.indexOf('-p=') === 0) { setRoleChain(opts, 'planner', arg.slice(3)); }
    else if (arg.indexOf('-v=') === 0) { setRoleChain(opts, 'selfValidator', arg.slice(3)); }
    else if (arg.indexOf('-m=') === 0) { setRoleChain(opts, 'mechanical', arg.slice(3)); }
    else if (arg.indexOf('-w=') === 0) { setRoleChain(opts, 'worker', arg.slice(3)); }
    else if (arg.charAt(0) !== '-') positionals.push(arg);
  }
  // --model/-M must resolve to a real dispatchable slug. Passing the raw string
  // through produced `opencode run -m claude`, which dies with "Model not found"
  // — the F18 failure exactly, in the flag added to prevent guessing. Accept a
  // display name from NAME_TO_SLUG, or a slug that already contains a provider
  // prefix; anything else is rejected loudly rather than dispatched broken.
  // Validate EVERY link in the chain, not just its head. A chain whose second
  // entry is a typo is worse than one that fails immediately: the run looks
  // healthy until the first model rate-limits, hours in, and the fallback the
  // chain existed to provide dies on a name nobody checked.
  if (opts.delegateChain.length) {
    const resolvedChain = [];
    for (const raw of opts.delegateChain) {
      const mapped = resolveDisplayName(raw);
      if (mapped) {
        resolvedChain.push(mapped);
      } else if (mapped === '') {
        console.error('❌ --model=' + raw + ' names the in-session Claude sentinel, which cannot be dispatched.');
        console.error('   Omit --model to run in-session, or name a dispatchable model.');
        process.exit(1);
      } else if (raw.indexOf('/') === -1) {
        console.error('❌ --model=' + raw + ' is not a known model.');
        if (opts.delegateChain.length > 1) {
          console.error('   (link ' + (opts.delegateChain.indexOf(raw) + 1) + ' of ' +
                        opts.delegateChain.length + ' in the chain ' + opts.delegateChain.join(' || ') + ')');
        }
        console.error('   Use a provider-prefixed slug (e.g. opencode/claude-opus-5,');
        console.error('   opencode-go/deepseek-v4-pro) or a display name from');
        console.error('   templates/commands/model_recommendations.md:');
        console.error('     ' + Array.from(NAME_TO_SLUG.keys()).join(', '));
        process.exit(1);
      } else {
        resolvedChain.push(raw);
      }
    }
    opts.delegateChain = resolvedChain;
    // The head stays in `delegateModel` so every existing reader is unchanged;
    // a single-model -M therefore behaves byte-identically to before.
    opts.delegateModel = resolvedChain[0] || '';
  }

  if (opts.selfTestGates) {
    opts.selfTestLogFile = positionals[0] || '';
    opts.selfTestExitCode = parseInt(positionals[1], 10) || 0;
  } else if (opts.selfTestOracle) {
    opts.selfTestOracleCmd = positionals[0] || '';
  } else if (positionals.length > 0) {
    opts.plan = positionals[0];
  }
  return opts;
}
/**
 * The cells hold paths relative to the REPO root (that's what you paste into a
 * CLI), so the script must cd there — not to the nearest `.wb/`. A scope folder
 * like frontEnd/wbc-ui3/ has its own `.wb/`, and stopping at it would break
 * every path in the wave. So: outermost-wins on `.git`, `.wb` only as fallback.
 */
function findRepoRoot(from) {
  let dir = path.resolve(from);
  let git = null;
  let wb = null;
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) git = dir; // keep walking: outermost wins
    if (fs.existsSync(path.join(dir, '.wb')) && !wb) wb = dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return git || wb || path.resolve(from);
}

function findPackageRoot(from) {
  let dir = path.resolve(from);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.wb'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}
function stripAnsi(str) {
  return String(str || '').replace(/\x1b\[[0-9;]*m/g, '');
}

function selfTestGatesMode(logFile, exitCode) {
  if (!logFile || !fs.existsSync(logFile)) {
    console.error('--self-test-gates: log file not found: ' + logFile);
    return 1;
  }
  var output;
  try { output = fs.readFileSync(logFile, 'utf8'); } catch (e) { output = ''; }

  if (exitCode !== 0) {
    console.log('G1: INFRA — exit code ' + exitCode + ' (non-zero)');
    return 1;
  }

  var stripped = stripAnsi(output);

  for (var i = 0; i < INFRA_FATAL_MESSAGES.length; i++) {
    if (stripped.indexOf(INFRA_FATAL_MESSAGES[i]) !== -1) {
      var prefix = stripped.split('\n').some(function (l) { return l.trim().indexOf(INFRA_FATAL_MESSAGES[i]) === 0; });
      if (prefix) {
        console.log('G1: INFRA — anchored fatal pattern: ' + INFRA_FATAL_MESSAGES[i]);
        return 1;
      }
    }
  }

  if (stripped.toLowerCase().indexOf('timeout') !== -1) {
    console.log('G1: ATTEMPTED — agent timed out');
    return 1;
  }

  console.log('G1: PASS — no anchored fatal patterns, exit code 0');
  return 0;
}

function selfTestOracleMode(oracleCmd) {
  if (!oracleCmd) {
    console.error('--self-test-oracle: missing oracle command');
    return 1;
  }
  var cp;
  try { cp = require('child_process'); } catch (e) { cp = null; }
  if (!cp) {
    console.error('--self-test-oracle: child_process unavailable');
    return 1;
  }
  var result;
  try {
    result = cp.execSync('bash -c ' + shq(oracleCmd), { stdio: 'pipe', timeout: 30000 });
  } catch (e) {
    result = null;
  }
  if (result !== null) {
    console.log('VERDICT: PASS (oracle succeeded, exit 0)');
    return 0;
  }
  console.log('VERDICT: ATTEMPTED (oracle failed)');
  return 1;
}

function scopeOf(planPath) {
  const m = path.basename(planPath).match(/^plan_(.+)_\d{8}\.md$/);
  return m ? m[1] : path.basename(planPath, '.md');
}
function run(argv) {
  const opts = parseArgs(argv || []);
  if (opts.help) { console.log(HELP); return 0; }

  if (opts.selfTestGates) {
    return selfTestGatesMode(opts.selfTestLogFile, opts.selfTestExitCode);
  }

  if (opts.selfTestOracle) {
    return selfTestOracleMode(opts.selfTestOracleCmd);
  }

  if (!opts.plan) {
    console.error('❌ Missing plan file.\n   Usage: wb-flow wave <plan.md> --wave=A');
    return 1;
  }
  const planPath = path.resolve(opts.plan);
  if (!fs.existsSync(planPath)) {
    console.error('❌ Plan file not found: ' + planPath);
    return 1;
  }
  if (!opts.wave) {
    console.error('❌ Missing --wave=<label>. Which row of the matrix should run?');
    return 1;
  }

  // Preflight: sweep leaked temp files, THEN check free disk space.
  //
  // Order matters. The sweep runs first so a recoverable condition self-heals and only
  // a genuine shortage stops the wave — refusing to dispatch over 6 GB of garbage we
  // could have removed ourselves is not a preflight, it is an obstacle. This is also
  // the invocation point the sweep script was missing: a script nothing calls cannot
  // stop the leak accumulating, which was the whole point of the row.
  //
  // TMPDIR is honoured (default /tmp) so both halves are testable against a fixture,
  // for the same reason the threshold is overridable: a preflight nobody can exercise
  // is one nobody should trust.
  const tmpDir = process.env.TMPDIR || '/tmp';
  try {
    const cp = require('child_process');
    try {
      const sweepScript = path.join(__dirname, 'sweep-tmp.sh');
      if (fs.existsSync(sweepScript)) {
        cp.execFileSync('bash', [sweepScript], {
          stdio: 'ignore',
          env: Object.assign({}, process.env, { TMPDIR: tmpDir }),
        });
      }
    } catch (e) {
      // A failed sweep must never block dispatch — it is best-effort hygiene.
    }
    const dfOut = cp.execFileSync('df', ['-m', tmpDir], { encoding: 'utf8' }).trim().split('\n');
    if (dfOut.length >= 2) {
      const line = dfOut[dfOut.length - 1];
      const parts = line.trim().split(/\s+/);
      const availIdx = parts.length === 6 ? 3 : (parts.length === 5 ? 2 : -1);
      if (availIdx !== -1) {
        const freeMb = parseInt(parts[availIdx], 10);
        const minMb = parseInt(process.env.WB_FLOW_MIN_FREE_MB || process.env.WBFLOW_MIN_FREE_MB || process.env.WB_FLOW_MIN_DISK_MB || '50', 10);
        if (!isNaN(freeMb) && !isNaN(minMb) && freeMb < minMb) {
          console.error('❌ PREFLIGHT FAIL: ' + tmpDir + ' free space is too low (' + freeMb + ' MB < ' + minMb + ' MB). Oracles will fail confusingly.');
          return 1;
        }
      } else {
        console.error('⚠️ PREFLIGHT WARN: Unrecognized df output format, skipping disk check. Output: ' + line);
      }
    }
  } catch (e) {
    // Ignore if df fails
  }

  const text = fs.readFileSync(planPath, 'utf8');
  const matrix = parseMatrix(text);
  if (!matrix) {
    console.error('❌ No "' + MATRIX_HEADING + '" matrix found in ' + path.basename(planPath) + '.');
    console.error('   Run `/wbPlan ' + opts.plan + '` first — self-correct adds it (output_conventions §10.5).');
    return 1;
  }
  if (matrix.rows.length === 0) {
    console.log('every row is closed — nothing to schedule');
    return 0;
  }

  // `--wave=all` (aliases `auto`, `*`) is an ORCHESTRATOR loop, not a script.
  //
  // It cannot be compiled into one mega-script: the loop's first rule is that it
  // advances only when every cell of a wave is green, and a pre-generated script
  // has already decided what runs before the first verdict exists. On 2026-09-13 a
  // cell reported NO-OP while having deleted the score extractor and truncated the
  // test suite; a script that had already queued the next wave would have run it
  // against that tree. So this prints the wave order and hands the loop back.
  const LOOP_ALIASES = ['all', 'auto', '*'];
  if (LOOP_ALIASES.indexOf(String(opts.wave || '').trim().toLowerCase()) !== -1) {
    if (opts.waveRole || opts.kind) {
      const filters = [];
      if (opts.waveRole) filters.push('role filter :' + opts.waveRole);
      if (opts.kind) filters.push('kind filter --' + opts.kind);
      console.error('❌ --wave=' + opts.wave + ' is a loop alias and cannot be combined with ' +
        filters.join(' and ') + '.');
      console.error('   Run a concrete wave cell instead, e.g. --wave=A:W, or use plain --wave=' + opts.wave + '.');
      return 1;
    }
    const seen = [];
    for (const r of matrix.rows) if (seen.indexOf(r.label) === -1) seen.push(r.label);
    if (!seen.length) {
      console.log('every row is closed — nothing to schedule');
      return 0;
    }
    const planArg = opts.plan;
    console.log('🌊 --wave=' + opts.wave + ' is an orchestrator loop, not a single script.');
    console.log('   ' + seen.length + ' wave(s) in order: ' + seen.join(' → '));
    console.log('');
    console.log('   ⚠️  This list is a FORECAST of the current table, not a schedule.');
    console.log('   Run the FIRST wave only, transcribe its results, then rewrite the matrix from the task table:');
    console.log('       the 🌊 matrix has no CLI writer');
    console.log('   Then regenerate the run-book:');
    console.log('       wb-flow next ' + planArg + ' --embed');
    console.log('   …and read the next wave fresh. Later labels may not survive the first wave.');
    console.log('');
    console.log('   Waves as the table stands right now:');
    for (const l of seen) console.log('     wb-flow wave ' + planArg + ' --wave=' + l);
    console.log('');
    console.log('   The four rules that govern the loop (wbWork_template.md → Multi-Wave Execution):');
    console.log('     1. Advance only on all-green — any INFRA/NO-OP/ATTEMPTED stops the loop.');
    console.log('     2. Escalate when blocked — `-y` silences ambiguity, never a blocked step.');
    console.log('     3. Stuck is terminal — no waves left but rows still open is a state to report.');
    console.log('     4. A wave editing bin/wave_generator.js or bin/wave.js cannot grade itself.');
    console.log('');
    console.log('   Snapshot the files each wave targets before dispatching it.');
    console.log('   Never walk this list as-is: a validator built from a stale matrix carries task');
    console.log('   ids that may already be closed, and reports NO-OP on a row that is not there.');
    return 0;
  }

  // Resolve the roster — and emit its reachability warning — BEFORE resolving
  // the wave's cells. The warning is roster-level state (a selected model is
  // marked unreachable, or the roster was never probed), not wave-level, so it
  // must surface even when the requested wave label is absent. A stale label
  // (`--wave=A` against a matrix that now starts at D) must still warn about a
  // dead provider rather than exit silently on "No wave".
  const repoRoot = findRepoRoot(path.dirname(planPath));
  const packageRoot = findPackageRoot(path.dirname(planPath));
  const planDirRel = path.relative(repoRoot, path.dirname(planPath));

  const resolved = resolveModelsFromRoster(text, repoRoot, opts._explicitModels, opts.models, packageRoot);
  opts.models = resolved.models;
  opts._modelSources = resolved.sources;

  const cells = cellsOf(matrix, opts.wave, opts.kind, opts.waveRole);
  if (!cells) {
    console.error('❌ No wave "' + opts.wave + '" in the matrix. Found: ' +
      matrix.rows.map((r) => r.label).join(', '));
    return 1;
  }

  const dispatchIndex = indexDispatches(matrix);
  const doneColumn = parseDoneColumn(text);
  const requiresColumn = parseRequiresColumn(text);
  const verifyColumn = parseVerifyColumn(text);
  const validColumn = parseValidColumn(text);
  const estTime = parseEstTime(text);

  if (opts.list) {
    console.log('\n🌊 Wave ' + opts.wave + ' — ' + cells.length + ' cell(s) in ' + path.basename(planPath) + '\n');

    // The roster this wave will actually dispatch from. Printed here because it
    // is the one question `--list` existed to answer and could not: the cell
    // lines below name only each cell's FIRST model, and `wb-flow model --show`
    // resolves the roster differently (first match from cwd, no freshness
    // rule), so it can report a different file entirely.
    var rosterPath = opts.models && opts.models.__rosterPath;
    console.log('  📋 Roster in effect: ' + (rosterPath || '(built-in defaults — no model_recommendations.md found)'));
    var ROLE_LABEL = { planner: '🧠 Planner', selfValidator: '✅ Validator', worker: '🔨 Worker', mechanical: '📋 Mechanical' };
    var inSess = (opts.models && opts.models.inSession) || {};
    for (var rk of ['planner', 'selfValidator', 'worker', 'mechanical']) {
      var ch = chainFor(opts.models, rk).map(function (m) { return m || 'Claude (in-session)'; });
      // An in-session role has an EMPTY slug by design (nothing is spawned), so
      // chainFor filters it out and the row would read '—' — which looks like a
      // misconfiguration rather than "the orchestrator runs this itself".
      if (!ch.length && inSess[rk]) ch = ['Claude (in-session) — nothing spawned'];
      var srcNote = opts._modelSources && opts._modelSources[rk] ? '  · ' + opts._modelSources[rk] : '';
      // Emoji render two columns wide in most terminals but count as one char,
      // so pad on the visible width, not String.length.
      var lbl = ROLE_LABEL[rk];
      console.log('     ' + lbl + ' '.repeat(Math.max(1, 14 - (lbl.length + 1))) + (ch.length ? ch.join('  ||  ') : '—') + srcNote);
    }
    console.log('     (each role tries its chain left to right; `||` is a real bash fallback)\n');
    for (const cell of cells) {
      // A22 — a 👤 human row is rendered as a gate and never routed. It is shown
      // (not hidden) so the wave's shape stays honest: the work exists, it just
      // is not an agent's to do.
      if (cell.human) {
        const hlabel = ROLES.filter((x) => x.key === cell.role)[0].label;
        console.log('  ' + hlabel.padEnd(14) + ' ' + (cell.command || '(manual step — see the plan row)'));
        console.log('  ' + ''.padEnd(14) + ' → SKIPPED — 👤 human row, never dispatched   [no lane, no fallback]');
        console.log('');
        continue;
      }
      const r = route(cell, dispatchIndex, opts.models, doneColumn, opts.delegateModel, requiresColumn, opts.delegateChain, { sandbox: opts.sandbox });
      const lane = cell.held ? 'SKIPPED (held)' : (r.lane === 'claude' ? 'claude (in-session)' : r.cli.bin + ' ' + r.model);
      // The cell's own fallback chain — what runs if the first model cannot.
      var cellChain = (r.chain && r.chain.length > 1)
        ? r.chain.map(function (m) { return m || 'Claude (in-session)'; }).join('  ||  ')
        : '';
      const label = ROLES.filter((x) => x.key === cell.role)[0].label;
      var sourceNote = '';
      if (r.model && r.lane === 'opencode') {
        var roleSourceKey = cell.role === 'validator' ? 'selfValidator' : cell.role;
        var src = opts._modelSources[roleSourceKey] || '';
        if (src && src !== 'CLI flag') sourceNote = ' · ' + src;
      }
      console.log('  ' + label.padEnd(14) + ' ' + cell.command);
      console.log('  ' + ''.padEnd(14) + ' → ' + lane + sourceNote + '   [' + r.reason + ']');
      if (cellChain) console.log('  ' + ''.padEnd(14) + '   fallback: ' + cellChain);
      console.log('');
    }
    return 0;
  }

  const built = buildScript({
    planPath: planPath, wave: opts.wave, cells: cells, dispatchIndex: dispatchIndex,
    models: opts.models, jobs: opts.jobs, repoRoot: repoRoot, doneColumn: doneColumn,
    requiresColumn: requiresColumn, sessions: opts.sessions, summary: opts.summary,
    sandbox: opts.sandbox,
    scopeName: path.basename(packageRoot || repoRoot || '.'),
    delegateModel: opts.delegateModel, delegateChain: opts.delegateChain,
    verifyColumn: verifyColumn, planDirRel: planDirRel, estTime: estTime,
  });

  if (opts.print) {
    process.stdout.write(built.script);
    return 0;
  }

  const outPath = opts.out
    ? path.resolve(opts.out)
    : path.join(path.dirname(planPath), 'waves', 'wave_' + opts.wave + '_' + scopeOf(planPath) + '.sh');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, built.script, { mode: 0o755 });

  console.log('🌊 Wave ' + opts.wave + ' → ' + outPath);
  console.log('   ' + built.spawned.length + ' spawned in parallel · ' +
    built.inline.length + ' for Claude in-session · ' + built.skipped.length + ' skipped');
  console.log('');
  console.log('   Read it, then run:  bash ' + path.relative(process.cwd(), outPath));
  return 0;
}

module.exports = { 
  run, parseMatrix, cellsOf, indexDispatches, route, splitCommand, buildScript, emitDispatchGates,
  cliFor, chainFor, AGY_ONLY_SLUGS,
  splitRow, parseDoneColumn, parseValidColumn, parseVerifyColumn, parseRequiresColumn, parseTaskText, parseEstTime, sessionKeyFor,
  parseModelRecommendations, extractVerifyCommand, isClaudeExecutor, resolveWbRun,
  parseHeaderRoster, resolveModelsFromRoster, findRepoRoot, findPackageRoot, selfTestGatesMode, selfTestOracleMode, stripAnsi,
  resolveDisplayName, NAME_TO_SLUG, DEFAULT_MODELS, INFRA_FATAL_MESSAGES, INFRA_GREP_PATTERN,
  splitModelChain 
};

if (require.main === module) {
  process.exit(run(process.argv.slice(2)) || 0);
}

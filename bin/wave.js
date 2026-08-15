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

function parseArgs(argv) {
  const opts = {
    plan: null, wave: null, waveRole: null, kind: null, out: null, print: false, jobs: 4,
    delegateModel: '',
    models: Object.assign({}, DEFAULT_MODELS), _explicitModels: {}, list: false, help: false,
    selfTestGates: false, selfTestLogFile: '', selfTestExitCode: 0,
    selfTestOracle: false, selfTestOracleCmd: '', sessions: false, summary: false,
  };
  const positionals = [];
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--print') opts.print = true;
    else if (arg === '--list') opts.list = true;
    else if (arg === '--validate') opts.kind = 'validate';
    else if (arg === '--sessions') opts.sessions = true;
    else if (arg === '--summary') opts.summary = true;
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
    else if (arg.indexOf('--model=') === 0) opts.delegateModel = arg.slice(8).trim();
    else if (arg.indexOf('-M=') === 0) opts.delegateModel = arg.slice(3).trim();
    // (resolution happens after the loop — see resolveDelegate below)
    else if (arg.indexOf('--out=') === 0) opts.out = arg.slice(6).trim();
    else if (arg.indexOf('--jobs=') === 0) opts.jobs = parseInt(arg.slice(7), 10) || 0;
    else     if (arg.indexOf('--worker-model=') === 0) { opts.models.worker = arg.slice(15).trim(); opts._explicitModels.worker = true; }
    else if (arg.indexOf('--worker=') === 0) { opts.models.worker = arg.slice(9).trim(); opts._explicitModels.worker = true; }
    else if (arg.indexOf('--mech-model=') === 0) { opts.models.mechanical = arg.slice(13).trim(); opts._explicitModels.mechanical = true; }
    else if (arg.indexOf('--mechanical=') === 0) { opts.models.mechanical = arg.slice(13).trim(); opts._explicitModels.mechanical = true; }
    else if (arg.indexOf('--validator-model=') === 0) { opts.models.selfValidator = arg.slice(18).trim(); opts._explicitModels.selfValidator = true; }
    else if (arg.indexOf('--validator=') === 0) { opts.models.selfValidator = arg.slice(12).trim(); opts._explicitModels.selfValidator = true; }
    else if (arg.indexOf('--planner=') === 0) { opts.models.planner = arg.slice(10).trim(); opts._explicitModels.planner = true; }
    else if (arg.indexOf('-p=') === 0) { opts.models.planner = arg.slice(3).trim(); opts._explicitModels.planner = true; }
    else if (arg.indexOf('-v=') === 0) { opts.models.selfValidator = arg.slice(3).trim(); opts._explicitModels.selfValidator = true; }
    else if (arg.indexOf('-m=') === 0) { opts.models.mechanical = arg.slice(3).trim(); opts._explicitModels.mechanical = true; }
    else if (arg.indexOf('-w=') === 0) { opts.models.worker = arg.slice(3).trim(); opts._explicitModels.worker = true; }
    else if (arg.charAt(0) !== '-') positionals.push(arg);
  }
  // --model/-M must resolve to a real dispatchable slug. Passing the raw string
  // through produced `opencode run -m claude`, which dies with "Model not found"
  // — the F18 failure exactly, in the flag added to prevent guessing. Accept a
  // display name from NAME_TO_SLUG, or a slug that already contains a provider
  // prefix; anything else is rejected loudly rather than dispatched broken.
  if (opts.delegateModel) {
    const raw = opts.delegateModel;
    const mapped = resolveDisplayName(raw);
    if (mapped) {
      opts.delegateModel = mapped;
    } else if (mapped === '') {
      console.error('❌ --model=' + raw + ' names the in-session Claude sentinel, which cannot be dispatched.');
      console.error('   Omit --model to run in-session, or name a dispatchable model.');
      process.exit(1);
    } else if (raw.indexOf('/') === -1) {
      console.error('❌ --model=' + raw + ' is not a known model.');
      console.error('   Use a provider-prefixed slug (e.g. opencode/claude-opus-5,');
      console.error('   opencode-go/deepseek-v4-pro) or a display name from');
      console.error('   templates/commands/model_recommendations.md:');
      console.error('     ' + Array.from(NAME_TO_SLUG.keys()).join(', '));
      process.exit(1);
    }
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

  const text = fs.readFileSync(planPath, 'utf8');
  const matrix = parseMatrix(text);
  if (!matrix) {
    console.error('❌ No "' + MATRIX_HEADING + '" matrix found in ' + path.basename(planPath) + '.');
    console.error('   Run `/wbPlan ' + opts.plan + '` first — self-correct adds it (output_conventions §10.5).');
    return 1;
  }

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
  const repoRoot = findRepoRoot(path.dirname(planPath));
  const packageRoot = findPackageRoot(path.dirname(planPath));
  const planDirRel = path.relative(repoRoot, path.dirname(planPath));

  const resolved = resolveModelsFromRoster(text, repoRoot, opts._explicitModels, opts.models, packageRoot);
  opts.models = resolved.models;
  opts._modelSources = resolved.sources;

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
      const r = route(cell, dispatchIndex, opts.models, doneColumn, opts.delegateModel, requiresColumn);
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
    scopeName: path.basename(packageRoot || repoRoot || '.'),
    delegateModel: opts.delegateModel,
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
  resolveDisplayName, NAME_TO_SLUG, DEFAULT_MODELS, INFRA_FATAL_MESSAGES, INFRA_GREP_PATTERN 
};

if (require.main === module) {
  process.exit(run(process.argv.slice(2)) || 0);
}

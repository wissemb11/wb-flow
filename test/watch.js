#!/usr/bin/env node

/**
 * watch.js — regression tests for `wb-flow watch`
 *
 * Hand-rolled assertions (no test framework) to keep zero runtime deps.
 * Node >= 14 compatible (CommonJS, no top-level await, no node:test).
 *
 *   node test/watch.js
 *   node test/watch.js --only=est
 *
 * What it asserts, and why each one earns its place:
 *
 *   est      — Est. Time is read correctly from a row whose Verify cell contains
 *              an ESCAPED PIPE. Splitting a plan row on a bare `|` shifts every
 *              later column; that is the defect that broke watch.sh's predecessor
 *              and the single most important test in this file.
 *   discover — run directories are found and ordered newest-first.
 *   states   — the THREE cell states, especially ⚠️ ENDED. A killed cell writes no
 *              verdict, so two-state logic reports it as running forever.
 *   cli      — --list and -1 exit 0; --run= on a missing run exits non-zero.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const PKG_ROOT = path.resolve(__dirname, '..');
const WATCH = path.join(PKG_ROOT, 'bin', 'watch.js');
const W = require(WATCH);

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) { passed++; console.log('  ✓ ' + msg); }
  else { failed++; failures.push(msg); console.log('  ✗ ' + msg); }
}

const ONLY = (function () {
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].indexOf('--only=') === 0) return a[i].slice('--only='.length);
    if (a[i] === '--only' && a[i + 1]) return a[i + 1];
  }
  return null;
})();
function run(name) { return !ONLY || ONLY === name; }

console.log('🧪 wb-flow watch regression test\n');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-flow-watch-'));

try {
  // ── est: escaped pipes in the Verify column ────────────────────────────────
  if (run('est')) {
    console.log('splitRow / Est. Time — escaped pipes in a Verify cell');

    // Row 2's Verify contains `\|\|`. A naive split('|') yields extra columns and
    // reads the WRONG cell for Est. Time — silently, which is the danger.
    const plan = [
      '# Plan Backlog: t — 2026-08-03',
      '',
      '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
      '|---|---|---|---|---|---|---|---|---|---|---|---|',
      '| 1 | 🔨 Worker | — | 📄 | plain | `test -f a` | P0 | 30 | X | Y | ⬜ | ⬜ |',
      '| 2 | 🔨 Worker | — | 📄 | escaped | `for k in a b; do grep -q "$k" f \\|\\| exit 1; done` | P1 | 45 | X | Y | ⬜ | ⬜ |',
      '| 3 | 📋 Mechanical | — | 📄 | piped | `test $(ls \\| wc -l) -gt 1` | P2 | 7 | X | Y | ⬜ | ⬜ |',
    ].join('\n');
    const planPath = path.join(tmp, 'plan_t_20260803.md');
    fs.writeFileSync(planPath, plan);

    const est = W.estimatesFromPlan(planPath);
    assert(est['1'] === 30, 'plain Verify cell → Est 30 (got ' + est['1'] + ')');
    assert(est['2'] === 45, 'Verify with \\|\\| → Est 45, NOT a shifted column (got ' + est['2'] + ')');
    assert(est['3'] === 7, 'Verify with a single \\| → Est 7 (got ' + est['3'] + ')');

    const tasks = W.tasksFromPlan(planPath);
    assert(tasks['1'] === 'plain', 'plain Task cell → "plain" (got ' + tasks['1'] + ')');
    assert(tasks['2'] === 'escaped', 'escaped Task cell → "escaped" (got ' + tasks['2'] + ')');
    assert(tasks['3'] === 'piped', 'piped Task cell → "piped" (got ' + tasks['3'] + ')');

    // Directly pin the splitter: an escaped pipe is content, not a delimiter.
    assert(W.splitRow('| a | `x \\| y` | 9 |').length === 3,
      'splitRow keeps an escaped pipe inside its cell (3 cols)');
    assert(W.splitRow('| a | b | c |').length === 3,
      'splitRow still splits on real pipes (3 cols)');

    // A missing plan must not throw — watch runs with no plan in reach.
    let threw = false;
    try { W.estimatesFromPlan(path.join(tmp, 'nope.md')); } catch (e) { threw = true; }
    assert(!threw, 'estimatesFromPlan on a missing file returns {} rather than throwing');
  }

  // ── discover: run directories, newest first ───────────────────────────────
  if (run('discover')) {
    console.log('\nrun discovery — newest first, non-run dirs ignored');

    const root = path.join(tmp, 'repo');
    const waves = path.join(root, '.wb', 'workflows', 'reports', 'waves');
    fs.mkdirSync(waves, { recursive: true });
    const mk = function (name, ageMs) {
      const d = path.join(waves, name);
      fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, 'wbWork_1_1.log'), '▶ wbWork 1\n');
      const t = new Date(Date.now() - ageMs);
      fs.utimesSync(d, t, t);
      return d;
    };
    mk('A_20260803_010000', 60000);
    mk('B_20260803_020000', 30000);
    mk('C_20260803_030000', 1000);
    fs.mkdirSync(path.join(waves, 'sessions'), { recursive: true });   // must be ignored
    fs.mkdirSync(path.join(waves, 'not_a_run'), { recursive: true });  // must be ignored

    const runs = W.waveDirs(root);
    const names = runs.map(function (r) { return r.name; });
    assert(names.indexOf('sessions') === -1, 'sessions/ is not treated as a run');
    assert(names.indexOf('not_a_run') === -1, 'a non-timestamped dir is not treated as a run');
    assert(names.length >= 3, 'all three run dirs discovered (got ' + names.length + ')');
    assert(names[0] === 'C_20260803_030000',
      'newest run sorts first (got ' + names[0] + ')');

    // A run dir with no .log files is not a run.
    fs.mkdirSync(path.join(waves, 'D_20260803_040000'), { recursive: true });
    const runs2 = W.waveDirs(root).map(function (r) { return r.name; });
    assert(runs2.indexOf('D_20260803_040000') === -1,
      'a run dir with no .log files is skipped');
  }

  // ── states: done / failed / ended ─────────────────────────────────────────
  if (run('states')) {
    console.log('\ncell states — three, never two');

    const runDir = path.join(tmp, 'staterun');
    fs.mkdirSync(runDir, { recursive: true });
    // id 900001+ are used so pgrep cannot match a live process for them.
    fs.writeFileSync(path.join(runDir, 'wbWork_900001_1.log'),
      '▶ wbWork 900001\n  G2 [900001]: PASS\n  VERDICT [900001]: DONE\n');
    fs.writeFileSync(path.join(runDir, 'wbWork_900002_2.log'),
      '▶ wbWork 900002\n  G3 [900002]: ATTEMPTED — oracle failed\n  VERDICT [900002]: ATTEMPTED\n');
    fs.writeFileSync(path.join(runDir, 'wbWork_900003_3.log'),
      '▶ wbWork 900003\n… killed mid-flight, no verdict ever written …\n');

    const cells = W.collect(runDir, { 900001: 10, 900002: 20, 900003: 30 });
    const byId = {};
    cells.forEach(function (c) { byId[c.ids] = c; });

    assert(byId['900001'] && byId['900001'].state === 'done',
      'a cell with VERDICT: DONE and no process → done');
    assert(byId['900002'] && byId['900002'].state === 'failed',
      'a cell with VERDICT: ATTEMPTED → failed, not done');
    assert(byId['900003'] && byId['900003'].state === 'ended',
      'a cell with NO verdict and NO process → ⚠️ ENDED (not "running forever")');

    assert(W.verdictOf('  VERDICT [7]: NO-OP\n') === 'NO-OP',
      'verdictOf reads a per-id verdict');
    assert(W.verdictOf('nothing here') === null,
      'verdictOf returns null when the cell has not finished');

    // Budget is the SUM across a merged cell's ids — that is what OVER est measures.
    const merged = W.collect(runDir, { 900001: 10, 900002: 20, 900003: 30 })
      .filter(function (c) { return c.ids === '900001'; })[0];
    assert(merged.budget === 10, 'per-cell budget comes from the plan Est column');

    assert(W.bar(0).length === 10 && W.bar(100).length === 10,
      'progress bar is a fixed 10 cells wide');
    assert(W.isAlive('999999999') === false,
      'isAlive is false for an id no process holds');
  }

  // ── cli: exit codes ───────────────────────────────────────────────────────
  if (run('cli')) {
    console.log('\nCLI — exit codes');

    const node = process.execPath;
    const callOk = function (args, cwd) {
      try { execFileSync(node, [WATCH].concat(args), { cwd: cwd, stdio: ['ignore', 'pipe', 'pipe'] }); return 0; }
      catch (e) { return typeof e.status === 'number' ? e.status : 1; }
    };

    assert(callOk(['--help']) === 0, '--help exits 0');

    const root = path.join(tmp, 'repo');
    assert(callOk(['--list'], root) === 0, '--list exits 0 when runs exist');
    assert(callOk(['-1'], root) === 0, '-1 (one-shot) exits 0');
    assert(callOk(['--run=does_not_exist'], root) !== 0,
      '--run= on a missing run exits NON-zero (a typo must not silently watch the newest)');

    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-watch-empty-'));
    assert(callOk(['--list'], empty) !== 0, '--list exits non-zero when there are no runs at all');
  }
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* best effort */ }
}

console.log('\n' + '-'.repeat(50));
console.log(passed + ' passed, ' + failed + ' failed');
if (failed) {
  failures.forEach(function (f) { console.log('  FAIL: ' + f); });
  process.exit(1);
}
process.exit(0);

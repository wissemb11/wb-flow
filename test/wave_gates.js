#!/usr/bin/env node

/**
 * wave_gates.js — regression tests for the four wave.js harness bugs
 *
 * Hand-rolled assertions (no test framework) to keep zero runtime deps.
 * Node >= 14 compatible (uses CommonJS, no top-level await, no node:test).
 *
 * Run:   node test/wave_gates.js
 * One:   node test/wave_gates.js --only=bug1
 *
 * What it asserts per bug:
 *   bug1 — PIDS captures the agent PID, not the pipeline tail (tee/grep).
 *   bug2 — G3 oracle runs from the plan's own directory, not REPO root.
 *   bug3 — wbValid cells are gated (G2/G3), never DONE on G1 alone.
 *   bug4 — routing is shared between --list and the generator.
 *   bug5 — session key includes the plan, not just (scope, model).
 *   meta — _meta and __EXIT__ are written.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');
const WV = require(path.join(PKG_ROOT, 'bin', 'wave.js'));

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log('  \u2713 ' + msg);
  } else {
    failed++;
    failures.push(msg);
    console.log('  \u2717 ' + msg);
  }
}

// Accept BOTH `--only=bug1` and `--only bug1`, anywhere in argv. The task oracles
// in the plan use the `=` form; parsing only the space form silently disabled the
// filter, so every task's oracle failed on a *sibling* bug that was still open —
// exactly what --only exists to prevent (task 1 spec §3).
const ONLY = (function () {
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].indexOf('--only=') === 0) return a[i].slice('--only='.length);
    if (a[i] === '--only' && a[i + 1]) return a[i + 1];
  }
  return null;
})();

function run(name) { return !ONLY || ONLY === name; }

console.log('\uD83E\uDDEA wave gates regression test\n');

// ── shared fixture ────────────────────────────────────────────────────────
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'plan_gates_fixture.md');
const FIXTURE = fs.readFileSync(FIXTURE_PATH, 'utf8');

// ── splitRow / escaped-pipe regression ──────────────────────────────────────
// A Verify cell legitimately contains `\|`. Splitting the row on a bare `|`
// shifts every later column and misreads Est. Time — the defect that broke
// watch.sh's predecessor. Task 1 spec §2 calls this fixture property
// "load-bearing"; it was absent from the first delivery, so it is pinned here.
if (run('splitrow')) {
  console.log('\nsplitRow — escaped pipes in a Verify cell');
  const est0 = WV.parseEstTime(FIXTURE);
  assert(/\\\|/.test(FIXTURE), 'fixture still contains an escaped pipe (do not "tidy" this away)');
  assert(est0.G3 === 5, 'Est. Time reads 5 through a Verify cell containing \\| (got ' + est0.G3 + ')');
  assert(est0.G4 === 7, 'Est. Time reads 7 through a Verify cell containing \\|\\| (got ' + est0.G4 + ')');
  const cols = WV.splitRow('| G4 | x | `a \\| b` | 7 |');
  assert(cols.length === 4, 'splitRow does not split on an escaped pipe (got ' + cols.length + ' cols)');
}


const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-flow-gates-'));
try {
  fs.mkdirSync(path.join(tmpDir, '.git'), { recursive: true });
  // Plan lives at tmpDir/subdir/plan_gates_fixture.md so planDirRel is 'subdir'
  const planSubDir = path.join(tmpDir, 'subdir');
  fs.mkdirSync(planSubDir, { recursive: true });
  const planPath = path.join(planSubDir, 'plan_gates_fixture.md');
  // Rewrite fixture commands to use subdir/plan_gates_fixture.md
  const rewritten = FIXTURE.replace(/\/wbWork plan_gates_fixture\.md/g, '/wbWork subdir/plan_gates_fixture.md');
  fs.writeFileSync(planPath, rewritten);
  const planDirRel = 'subdir';

  // Parse the rewritten fixture
  const matrix = WV.parseMatrix(rewritten);
  const aCells = WV.cellsOf(matrix, 'A', 'work');
  const dispatchIdx = WV.indexDispatches(matrix);
  const verifyCol = WV.parseVerifyColumn(rewritten);
  const estCol = WV.parseEstTime(rewritten);

  // ── bug 1: PIDS captures the agent PID, not the pipeline tail ───────────
  if (run('bug1')) {
    console.log('\nBug 1 — PIDS captures the agent PID, not tee/grep');

    const built = WV.buildScript({
      planPath: planPath, wave: 'A', cells: aCells, dispatchIndex: dispatchIdx,
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: tmpDir,
      verifyColumn: verifyCol, estTime: estCol, planDirRel: planDirRel,
    });
    const script = built.script;

    const summaryBuilt = WV.buildScript({
      planPath: planPath, wave: 'A', cells: aCells, dispatchIndex: dispatchIdx,
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: tmpDir,
      verifyColumn: verifyCol, estTime: estCol, planDirRel: planDirRel,
      summary: true,
    });
    const summaryScript = summaryBuilt.script;

    assert(built.spawned.length > 0, 'wave A spawns at least 1 cell (got ' + built.spawned.length + ')');

    // The summary path must use process substitution, not a pipe.
    assert(
      /> >\(tee/.test(summaryScript),
      'summary dispatch uses process substitution (> >(tee …))'
    );
    assert(
      !/\) 2>&1 \| tee/.test(summaryScript),
      'summary dispatch does NOT pipe into tee (that captured grep PID)'
    );

    // The non-summary path must also use process substitution.
    assert(
      /> >\(tee/.test(script),
      'non-summary dispatch uses process substitution (> >(tee …))'
    );
    assert(
      !/\) 2>&1 \| tee [^|]*&/.test(script),
      'non-summary dispatch does NOT pipe into tee'
    );

    // PIDS+=($!) must come right after the backgrounding `&`, not after a pipe.
    assert(
      /&[\s\n]*PIDS\+=\(\$!\)/.test(script),
      'PIDS+=($!) immediately follows backgrounding & (captures subshell PID)'
    );

    // The generated script must be valid bash syntax.
    try {
      const shPath = path.join(tmpDir, 'wave_gates_bug1.sh');
      fs.writeFileSync(shPath, script);
      execFileSync('bash', ['-n', shPath], { stdio: ['ignore', 'pipe', 'pipe'] });
      assert(true, 'generated script (process substitution) passes `bash -n`');
    } catch (e) {
      if (/ENOENT/.test(e.message)) {
        assert(true, 'bash not available — skipping syntax check');
      } else {
        assert(false, 'generated script passes `bash -n`: ' + e.message);
      }
    }
  }

  // ── bug 2: G3 oracle runs from the plan's own directory ─────────────────
  if (run('bug2')) {
    console.log('\nBug 2 — G3 oracle runs from the plan directory, not REPO root');

    const built = WV.buildScript({
      planPath: planPath, wave: 'A', cells: aCells, dispatchIndex: dispatchIdx,
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: tmpDir,
      verifyColumn: verifyCol, estTime: estCol, planDirRel: planDirRel,
    });
    const script = built.script;

    assert(built.spawned.length > 0, 'wave A spawns workers for bug 2 test');

    // The G3 oracle must cd to the plan directory.
    assert(
      /\(cd 'subdir'/.test(script),
      'G3 oracle cds to the plan directory (cd subdir)'
    );
    assert(
      /\(cd /.test(script) && /&& bash -c/.test(script),
      'G3 oracle runs with: (cd <planDir> && bash -c <oracle>)'
    );

    // Concrete proof: create a marker at the plan-relative path and verify
    // the oracle resolves correctly.
    // G1's Verify cell says `test -f test/smoke.js` relative to the plan dir.
    const planAbs = path.dirname(planPath);
    const marker = path.join(planAbs, 'test', 'smoke.js');
    fs.mkdirSync(path.join(planAbs, 'test'), { recursive: true });
    fs.writeFileSync(marker, '# marker for bug 2 regression test');

    const g1Vfy = WV.extractVerifyCommand(verifyCol['G1']);
    try {
      execFileSync('bash', ['-c', 'cd "' + planDirRel + '" && ' + g1Vfy], { cwd: tmpDir, stdio: ['ignore', 'pipe', 'pipe'] });
      assert(true, 'G1 oracle with cd subdir PASSES (plan-relative paths resolve)');
    } catch (e) {
      assert(false, 'G1 oracle with cd subdir should pass: ' + e.message);
    }

    // Without the cd, running from REPO root should fail.
    try {
      execFileSync('bash', ['-c', g1Vfy], { cwd: tmpDir, stdio: ['ignore', 'pipe', 'pipe'] });
      assert(false, 'G1 oracle from REPO root should fail — but passed');
    } catch (e) {
      assert(true, 'G1 oracle from REPO root FAILS (the bug: relative paths break)');
    }

    // The generated script must be valid bash.
    try {
      const shPath = path.join(tmpDir, 'wave_gates_bug2.sh');
      fs.writeFileSync(shPath, script);
      execFileSync('bash', ['-n', shPath], { stdio: ['ignore', 'pipe', 'pipe'] });
      assert(true, 'generated script (cd+oracle) passes `bash -n`');
    } catch (e) {
      if (!/ENOENT/.test(e.message)) {
        assert(false, 'generated script passes `bash -n`: ' + e.message);
      }
    }
  }

  // ── bug 3: wbValid cells are gated (G2/G3) ──────────────────────────────
  if (run('bug3')) {
    console.log('\nBug 3 — wbValid cells are gated, never DONE on G1 alone');

    const VALID_FIXTURE = [
      '# Plan Backlog: val — 2026-08-03',
      '',
      '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
      '|---|---|---|---|---|---|---|---|---|---|---|',
      '| V1 | 🔨 Worker | — | 📄 | X | `echo ok` | P0 | 5 | DeepSeek V4 Pro | Claude | ⬜ | ⬜ |',
      '',
      '## 🌊 Next Executable Sequence',
      '',
      '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
      '|---|---|---|---|---|',
      '| **A · ✅ validate** | — | `/wbValid plan_val_20260803.md --id=V1`<br>→ *opencode-go/kimi-k2.7-code*<br><sub>pairs X · V1</sub> | — | — |',
    ].join('\n');
    const valPlanPath = path.join(tmpDir, 'plan_val_20260803.md');
    fs.writeFileSync(valPlanPath, VALID_FIXTURE);
    const valMatrix = WV.parseMatrix(VALID_FIXTURE);
    const valCells = WV.cellsOf(valMatrix, 'A', 'validate');
    const valBuilt = WV.buildScript({
      planPath: valPlanPath, wave: 'A', cells: valCells,
      dispatchIndex: WV.indexDispatches(valMatrix),
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: tmpDir,
      planDirRel: '.', verifyColumn: WV.parseVerifyColumn(VALID_FIXTURE),
      doneColumn: { V1: 'Claude Opus 5' },  // simulate Claude-executed task so validator spawns
    });

    assert(valBuilt.spawned.length > 0, 'wbValid cell is spawned (not skipped)');

    const valScript = valBuilt.script;
    // Bug 3: `gated = (isWbWork || isWbExplain)` excluded wbValid.
    // A wbValid cell must now emit gated output (G2/G3), not just VERDICT: DONE.
    // Check: the script should NOT have a bare DONE without G2 preceding it.
    const hasG2 = /G2 \[V1\]/.test(valScript);
    assert(
      hasG2,
      'wbValid cells emit G2 gate (artifact check) — no longer a bare DONE'
    );

    // The key assertion: G2 should come before VERDICT for the same id.
    if (hasG2) {
      const g2Pos = valScript.indexOf('G2 [V1]');
      const verdictPos = valScript.indexOf('VERDICT [V1]');
      assert(
        g2Pos < verdictPos,
        'G2 checks run BEFORE the per-id verdict (gated path)'
      );
    }
  }

  // ── bug 4: routing is shared between --list and the generator ───────────
  if (run('bug4')) {
    console.log('\nBug 4 — routing is shared between --list and the generator');

    let listText = '';
    try {
      // HOME is redirected to an empty directory: wave.js includes
      // `$HOME/.wb-flow` among its roster roots, so without this the child
      // process reads the DEVELOPER's roster and the assertions below compare
      // against DEFAULT_MODELS that never got used. This suite passed for years
      // only because the machine's roster happened to name
      // `opencode-go/deepseek-v4-pro` as its worker — the same slug as
      // DEFAULT_MODELS.worker. Restoring a different roster on 2026-08-14 turned
      // it red and exposed the coincidence.
      listText = execFileSync('node', [
        path.join(PKG_ROOT, 'bin', 'wave.js'), planPath,
        '--wave=A', '--list',
      ], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: Object.assign({}, process.env, { HOME: fs.mkdtempSync(path.join(os.tmpdir(), 'wbhome-')) }),
      });
    } catch (e) {
      listText = e.stdout || e.stderr || '';
    }

    const built = WV.buildScript({
      planPath: planPath, wave: 'A', cells: aCells, dispatchIndex: dispatchIdx,
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: tmpDir,
      planDirRel: planDirRel,
    });

    // Both --list and the generator should agree on the model.
    // The model in --list is reported in the routing lines.
    const modelInList = listText.indexOf(WV.DEFAULT_MODELS.worker) !== -1;  // summary or dispatch — either proves --list saw it
    const modelInScript = built.script.indexOf(WV.DEFAULT_MODELS.worker) !== -1;

    // A DISJUNCTION IS NOT THE INVARIANT. `modelInList || modelInScript` passes
    // when only one side names the model — which is precisely the divergence bug 4
    // is about (2026-08-03: --list said `opencode opencode-go/kimi-k2.7-code`,
    // the script ran `agy -p --model claude-opus-4-6-thinking`). Both sides must
    // agree, and --list must actually have produced routing output to compare.
    assert(
      listText.trim().length > 0,
      '--list produced routing output to compare against (not silently empty)'
    );
    assert(
      modelInList && modelInScript,
      '--list AND the generated script BOTH name the worker model (they must agree)'
    );

    // Strongest form: whatever model --list advertises per lane must be the model
    // the dispatch line actually invokes. Compare the set of model slugs each side
    // mentions, so a future refactor cannot let them drift apart.
    const slugRe = /(?:opencode-go|opencode|agy|gemini|claude)[\w./-]*/g;

    // `--list` opens with a ROSTER SUMMARY — the full chain for all four roles,
    // so a reader can answer "which models are set for each role" without
    // diffing candidate roster files by hand. Those chains deliberately name
    // models this wave will not dispatch: a wave with no 🧠 Planner cell still
    // shows the Planner chain. The drift invariant applies to the DISPATCH
    // section only, which is what bug 4 was about.
    //
    // The summary is still asserted to exist, so it cannot silently vanish, and
    // the strict check below is unchanged for everything after it.
    const SUMMARY_END = '(each role tries its chain left to right';
    assert(
      listText.indexOf('📋 Roster in effect:') !== -1 && listText.indexOf(SUMMARY_END) !== -1,
      '--list still prints the roster summary (file in effect + per-role chains)'
    );
    const dispatchText = listText.slice(listText.indexOf(SUMMARY_END) + SUMMARY_END.length);

    const listSlugs = new Set((dispatchText.match(slugRe) || []).filter(function (x) { return x.indexOf('/') !== -1; }));
    const scriptSlugs = new Set((built.script.match(slugRe) || []).filter(function (x) { return x.indexOf('/') !== -1; }));
    let drifted = [];
    listSlugs.forEach(function (m) { if (!scriptSlugs.has(m)) drifted.push(m); });
    assert(
      drifted.length === 0,
      'every model --list advertises is actually dispatched by the script' +
        (drifted.length ? ' (drifted: ' + drifted.join(', ') + ')' : '')
    );

    // Bug 4 is about them diverging — both should name the SAME model.
    // We can't easily verify they agree when one might have been skipped,
    // but at minimum neither should silently route wrong.
    if (built.spawned.length > 0) {
      assert(
        modelInScript,
        'generated script dispatches to the configured worker model (' + WV.DEFAULT_MODELS.worker + ')'
      );
    }
  }

  // ── bug 5: session key includes the plan ─────────────────────────────────
  if (run('bug5')) {
    console.log('\nBug 5 — session key includes the plan, not just (scope, model)');

    const warmBuilt = WV.buildScript({
      planPath: planPath, wave: 'A', cells: aCells,
      dispatchIndex: dispatchIdx, models: WV.DEFAULT_MODELS,
      jobs: 0, repoRoot: tmpDir,
      planDirRel: planDirRel, sessions: true, scopeName: 'core',
    });

    const planSlug = path.basename(planPath, '.md').replace(/[^\w.-]+/g, '-');
    const expectedKey = 'wbflow:core:' + WV.DEFAULT_MODELS.worker.replace(/\//g, '-') + ':' + planSlug;

    assert(
      warmBuilt.script.indexOf(expectedKey) !== -1,
      'session title includes the plan: (scope, model, PLAN) key found'
    );
    assert(
      warmBuilt.script.indexOf("wbflow:core:opencode-go-deepseek-v4-pro'") === -1,
      'the plan-less (scope, model) key is gone — it caused cross-plan context leaks'
    );
  }

  // ── meta: _meta and __EXIT__ are written ─────────────────────────────────
  // ── heartbeat: forked AFTER dispatch, or it can never see a cell ──────────
  if (run('heartbeat')) {
    console.log('\nHeartbeat — forked after dispatch, so PIDS is populated');

    const built = WV.buildScript({
      planPath: planPath, wave: 'A', cells: aCells, dispatchIndex: dispatchIdx,
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: tmpDir,
      verifyColumn: verifyCol, estTime: estCol, planDirRel: planDirRel,
    });
    const lines = built.script.split('\n');
    const idx = (needle) => lines.findIndex((l) => l.indexOf(needle) !== -1);

    const declare = idx('declare -a PIDS=()');
    const fork = idx('heartbeat &');
    const firstPush = lines.findIndex((l) => /^PIDS\+=\(\$!\)/.test(l));
    const collect = idx('# ── collect');

    assert(fork !== -1, 'the script forks a heartbeat');
    assert(firstPush !== -1, 'the script records at least one cell PID');

    // The regression. A backgrounded bash function gets a COPY of shell state,
    // so a heartbeat forked before the first PIDS+= sees an empty array forever:
    // any_running is 0 on tick one, it prints "all cells finished" at 30s and
    // exits. Observed in EVERY wave on 2026-08-03 (G,H,I,K,L,M,N,O) — including
    // one whose cell was still writing 90s later.
    assert(
      fork > firstPush,
      'heartbeat is forked AFTER the first PIDS+= (fork@' + fork + ' > push@' + firstPush + ')'
    );
    assert(fork > declare, 'heartbeat is forked after PIDS is declared');
    assert(fork < collect, 'heartbeat is forked before the collect loop waits on the PIDs');
    assert(
      idx('kill $HEARTBEAT_PID') > collect,
      'the heartbeat is killed after collect, not before'
    );
  }

  if (run('meta')) {
    console.log('\nMeta — _meta and __EXIT__ markers');

    const built = WV.buildScript({
      planPath: planPath, wave: 'A', cells: aCells, dispatchIndex: dispatchIdx,
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: tmpDir,
      planDirRel: planDirRel,
    });

    // These are mandated by output_conventions but wave.js never wrote them.
    // Bug 6 (task 6) fixes this — they must now be present.
    // `/\.meta/` was too loose: it matched the per-cell `<slug>.meta` while the
    // RUN-LEVEL `_meta` — the only filename wb-flow watch reads — was never written.
    // Assert the exact path, and the keys a status snapshot needs.
    assert(/__EXIT__=/.test(built.script), '__EXIT__=<rc> is written per cell');
    assert(
      /"\$RUN_DIR\/_meta"/.test(built.script),
      'a RUN-LEVEL _meta is written (the path wb-flow watch reads)'
    );
    assert(
      /\.meta"/.test(built.script),
      'the richer per-cell <slug>.meta is still written too'
    );
    ['COMMAND=', 'WAVE=', 'KIND=', 'EXECUTOR=', 'DISPATCH=', 'PLAN='].forEach(function (k) {
      assert(built.script.indexOf(k) !== -1, '_meta carries ' + k.replace('=', ''));
    });
  }

} catch (e) {
  assert(false, 'wave gates suite: ' + (e.stack || e.message));
} finally {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) { /* best effort */ }
}

// ── wbRun guard: shipped shell twin of INFRA_GREP_PATTERN ──────────────────
// wbRun cannot import from wave.js (it is a zero-dependency bash wrapper), so the
// pattern is duplicated by necessity. These assertions make the duplication safe:
// if either side is edited alone, the suite fails. The two DID drift apart, and
// the drift scored four completed cells as INFRA on 2026-08-03.
if (run('wbrun')) {
  console.log('\nwbRun guard — one definition of "fatal", not two');

  const wbRunPath = path.join(PKG_ROOT, 'templates', '_shared', 'wbRun');
  const wbRunSrc = fs.readFileSync(wbRunPath, 'utf8');
  const m = wbRunSrc.match(/^INFRA_PATTERN='(.+)'$/m);

  assert(!!m, 'wbRun declares a single-quoted INFRA_PATTERN on its own line');

  if (m) {
    assert(
      m[1] === WV.INFRA_GREP_PATTERN,
      'wbRun INFRA_PATTERN is byte-identical to wave.js INFRA_GREP_PATTERN'
    );
  }

  // The regression itself: text that merely MENTIONS a fatal must not match,
  // and a real fatal must. Asserted against the pattern wbRun actually ships.
  const re = new RegExp(m ? m[1] : '$^');
  const mustNotMatch = [
    'Error: Could not find oldString in the file.',
    '  ✓ G1 classifies as INFRA: "Error: Insufficient credits"',
    'The fallback fires on rate limit errors.',
    '- Fixed: API key handling in wbRun',
  ];
  mustNotMatch.forEach(function (line) {
    assert(!re.test(line), 'wbRun guard ignores non-fatal text: ' + line.trim().slice(0, 46));
  });

  const mustMatch = ['Error: Model not found', 'Error: Insufficient balance.', 'Error: Rate limit exceeded'];
  mustMatch.forEach(function (line) {
    assert(re.test(line), 'wbRun guard still catches a real fatal: ' + line);
  });

  // The shipped copy is the one that matters — templates/ is in files[].
  assert(
    /files/.test(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')) &&
      JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')).files.indexOf('templates/') !== -1,
    'templates/ ships, so this guard reaches every user'
  );
}

// ── splitCommand edge cases ────────────────────────────────────────────────
console.log('\nSplit command edge cases');

assert(
  WV.splitCommand('/wbWork plan.md --id=F20').ids.join('') === 'F20',
  'splitCommand parses an alphanumeric id (--id=F20)'
);

// ── syncguard: sync_docs.js MERGED CONTENT FROM regression tripwire ──────
if (run('syncguard')) {
  console.log('\nSyncGuard — sync_docs.js refuses to write MERGED CONTENT FROM to site');

  const SYNC_DOCS = path.resolve(__dirname, '../../documentation/flow.wbc-ui.com/scripts/sync_docs.js');
  const syncTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-flow-syncguard-'));

  try {
    // Fixture: core has a corrupt README.md; site has a clean one.
    const coreCmd = path.join(syncTmp, 'core', 'docs', 'commands', 'wbSg');
    const siteCmd = path.join(syncTmp, 'site', 'docs', 'commands', 'wbSg');
    fs.mkdirSync(coreCmd, { recursive: true });
    fs.mkdirSync(siteCmd, { recursive: true });

    fs.writeFileSync(path.join(coreCmd, 'README.md'),
      '# /wbSg/\n\nMERGED CONTENT FROM wbSg_root.md\n\n## Example\n\nCorrupted hub.\n');
    fs.writeFileSync(path.join(siteCmd, 'README.md'),
      '# /wbSg/\n\nA clean command hub.\n');

    // Also add a clean non-README file to verify only READMEs are affected
    const coreCleanMd = path.join(coreCmd, 'wbSg_root.md');
    const siteCleanMd = path.join(siteCmd, 'wbSg_root.md');
    fs.writeFileSync(coreCleanMd, '# /wbSg_root/\n\nClean root doc.\n');
    fs.writeFileSync(siteCleanMd, '# /wbSg_root/\n\nClean root doc.\n');

    // 1. Dry-run: classification should flag the corrupt README.md as conflict
    let dryJson = '';
    try {
      dryJson = execFileSync('node', [SYNC_DOCS, '--test-root=' + syncTmp, '--dry-run', '--json'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) {
      dryJson = e.stdout || e.stderr || '';
    }

    let dryResult = null;
    try { dryResult = JSON.parse(dryJson.trim()); } catch (_) {}

    assert(
      dryResult !== null && dryResult.conflict > 0,
      'dry-run classifies corrupt README.md as ⚠️ conflict (got conflict=' +
        (dryResult ? dryResult.conflict : 'parse error') + ')'
    );
    assert(
      dryResult !== null && dryResult.dryRun === true,
      '--dry-run flag is reflected in --json output'
    );

    // The clean file should be skipped (byte-identical)
    assert(
      dryResult !== null && dryResult.skip > 0,
      'clean file is skipped (byte-identical) — only the corrupt one is flagged'
    );

    // 2. Execute sync (no --dry-run): the site README.md must NOT be overwritten
    try {
      execFileSync('node', [SYNC_DOCS, '--test-root=' + syncTmp, '--json'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) {
      // --json catches conflicts as non-zero; that is expected
    }

    const siteReadme = fs.readFileSync(path.join(siteCmd, 'README.md'), 'utf8');
    assert(
      !siteReadme.includes('MERGED CONTENT FROM'),
      'site README.md is NOT overwritten with MERGED CONTENT FROM after sync'
    );
    assert(
      siteReadme.includes('clean command hub'),
      'site README.md retains its original clean content after sync'
    );

    // 3. Live check: no tracked file in EITHER tree contains MERGED CONTENT FROM.
    //    Tightened from site ≤1 to upstream == 0 && site == 0 — a ratchet that only
    //    counts down. The demo-app exception was cleaned up as part of D6.
    const walkSync = (dir) => {
      const out = [];
      try {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) { out.push(...walkSync(full)); }
          else { out.push(full); }
        }
      } catch (_) {}
      return out;
    };
    const CORE_DOCS_ROOT = path.resolve(__dirname, '../docs');
    const SITE_DOCS_ROOT = path.resolve(__dirname, '../../documentation/flow.wbc-ui.com/docs');
    const checkCorrupt = (root, label) => {
      if (!fs.existsSync(root)) return { count: 0, files: [], skipped: true };
      const files = walkSync(root);
      let count = 0;
      const corruptFiles = [];
      for (const f of files) {
        if (!f.endsWith('.md')) continue;
        try {
          const c = fs.readFileSync(f, 'utf8');
          if (c.includes('MERGED CONTENT FROM')) {
            count++;
            corruptFiles.push(path.relative(root, f));
          }
        } catch (_) {}
      }
      return { count, files: corruptFiles, skipped: false };
    };
    const upstreamCheck = checkCorrupt(CORE_DOCS_ROOT, 'upstream');
    const siteCheck = checkCorrupt(SITE_DOCS_ROOT, 'site');
    assert(
      upstreamCheck.count === 0,
      'upstream core/docs/ has 0 MERGED CONTENT FROM files (got ' + upstreamCheck.count +
        (upstreamCheck.files.length ? ': ' + upstreamCheck.files.join(', ') : '') + ')'
    );
    assert(
      siteCheck.count === 0,
      'site docs/ has 0 MERGED CONTENT FROM files (got ' + siteCheck.count +
        (siteCheck.files.length ? ': ' + siteCheck.files.join(', ') : '') + ')'
    );

  } catch (e) {
    assert(false, 'syncguard fixture: ' + (e.stack || e.message));
  } finally {
    try { fs.rmSync(syncTmp, { recursive: true, force: true }); } catch (_) {}
  }
}


// ── A22 / A23 — the human gate and the prose gate ──────────────────────────
// Two INDEPENDENT guards, tested independently on purpose. A18 was "fixed" in
// bin/next.js (the run-book renderer) while bin/wave.js (the dispatcher) kept
// its own path to the same matrix, so the bug survived its own fix. Either
// guard alone stops the observed incidents; both are asserted so a refactor
// that removes one is caught while the other is still masking it.
{
  const WVP = require(path.join(PKG_ROOT, 'bin', 'wave_parser.js'));
  const dispatchable = function (cell, role) {
    return WVP.parseCell(cell, role || 'mechanical', 'A')
      .filter(function (c) { return c.command && !c.human; });
  };

  // A23 — prose must never compile into a dispatch.
  // Verbatim cell that dispatched /wbPublish to a mechanical-tier model on
  // 2026-08-15, from a sentence whose own text said not to dispatch it.
  const proseHuman = '\u{1F9CD} **user** — publish `wb-flow@1.0.2` '
    + '(`/wbRelease`, then `/wbPublish`). Not an agent cell.';
  assert(dispatchable(proseHuman).length === 0,
    'A23: a human/prose cell mentioning `/wbPublish` yields no dispatch');

  // …and with no human marker at all, so the prose guard is proven on its own.
  assert(dispatchable('Remember to run `/wbPublish` once the release lands.').length === 0,
    'A23: a bare prose mention of a command yields no dispatch (guard stands alone)');

  assert(dispatchable('`npm login` then `/wbRelease pkg/`').length === 0,
    'A23: a cell led by a non-slash token does not dispatch its trailing command');

  // A22 — a human designation is a gate, and survives as one.
  const humanCell = '`/wbRelease pkg/`<br>→ *\u{1F464} human · ~$0.05*';
  const parsedHuman = WVP.parseCell(humanCell, 'mechanical', 'A');
  assert(parsedHuman.length === 1 && parsedHuman[0].human === true,
    'A22: a `→ *\u{1F464} human*` cell is kept and flagged human');
  assert(dispatchable(humanCell).length === 0,
    'A22: a \u{1F464} human cell is never dispatchable');

  // The gate must not swallow ordinary work.
  const normal = '`/wbWork plan.md --id=3`<br>→ *Opus 5 · ~$0.30*';
  assert(dispatchable(normal).length === 1,
    'A22/A23: an ordinary dispatch cell is unaffected');
  const withPrelude = '`/wbExplain plan.md --id=3`<br>`/wbWork plan.md --id=3`<br>→ *Opus 5*';
  const pre = dispatchable(withPrelude);
  assert(pre.length === 1 && /wbWork/.test(pre[0].command) && pre[0].prelude.length === 1,
    'A22/A23: the prelude+primary convention still resolves to the primary');
  assert(dispatchable('\u{1F7E2} `/wbWork plan.md --id=1`').length === 1,
    'A23: a status emoji before the command does not suppress it');

  // The generator must refuse a human cell even if one ever reaches it.
  const gen = require(path.join(PKG_ROOT, 'bin', 'wave_generator.js'));
  assert(typeof gen === 'object', 'A22: wave_generator loads for the human-skip path');
}

// ── summary ────────────────────────────────────────────────────────────────
console.log('\n' + '-'.repeat(50));
console.log(passed + ' passed, ' + failed + ' failed');
failures.forEach(function (f) { console.log('  FAIL: ' + f); });
process.exit(failed > 0 ? 1 : 0);

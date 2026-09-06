'use strict';
//
// Behavioural unit tests for the four modules extracted from bin/wave.js
// (finding A4 / plan row 10).
//
// These assert RESULTS, not shapes. Two earlier attempts at this file passed by
// asserting `typeof fn === 'function'` and then by calling functions inside
// `try {} catch (e) {}` with no assertion — both stayed green when a function
// body was replaced with a mutant. The oracle for this file is therefore a
// mutation check, not a grep: break shq() or resolveDisplayName() in the source
// and this suite MUST go red.
//
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const parser = require('../bin/wave_parser.js');
const router = require('../bin/wave_router.js');
const generator = require('../bin/wave_generator.js');
const constants = require('../bin/wave_constants.js');

let pass = 0;
function t(name, fn) {
  fn();
  pass++;
  console.log('  ✓ ' + name);
}

console.log('🧪 wave_* module unit tests');

// ── wave_generator ───────────────────────────────────────────────────────────
t('shq() wraps in single quotes', () => {
  assert.strictEqual(generator.shq('abc'), "'abc'");
});

t("shq() escapes an embedded single quote as '\\''", () => {
  // The POSIX idiom: close the quote, emit an escaped quote, reopen.
  assert.strictEqual(generator.shq("a'b"), "'a'\\''b'");
});

t('shq() output survives a real shell round-trip', () => {
  // The property that actually matters: whatever goes in comes back out of sh.
  const nasty = `a'b"c $d ${'`'}e${'`'} \\f`;
  const out = require('child_process')
    .execSync('printf %s ' + generator.shq(nasty))
    .toString();
  assert.strictEqual(out, nasty);
});

t('buildScript() --sandbox omits bypass flags and has a REFUSED verdict path', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-wave-sandbox-'));
  const plan = path.join(dir, 'plan.md');
  fs.writeFileSync(plan, '# Plan Backlog: x — 2026-09-04\n');
  try {
    const built = generator.buildScript({
      planPath: plan,
      wave: 'A',
      cells: [{
        role: 'worker',
        wave: 'A',
        command: '/wbWork plan.md --id=1',
        suggestedModel: '',
        prelude: [],
        pairsWave: null,
        pairsIds: [],
        held: false,
      }],
      dispatchIndex: {},
      models: { worker: 'opencode-go/deepseek-v4-pro' },
      jobs: 0,
      repoRoot: dir,
      planDirRel: '',
      sandbox: true,
    });
    assert.ok(/sandbox: permission/.test(built.script), 'script must identify sandbox mode');
    assert.ok(/VERDICT: REFUSED/.test(built.script), 'sandbox refusals must not be scoreable as PASS');
    assert.ok(!/dangerously-skip-permissions|dangerously-bypass-approvals-and-sandbox|bypassPermissions/.test(built.script),
      'sandboxed script leaked a permission bypass flag');
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* best effort */ }
  }
});

t('REFUSAL_GREP_PATTERN matches refusal lines, not permissions-related task prose', () => {
  // Negative control: permissions-related task prose is not scored REFUSED.
  const re = new RegExp(constants.REFUSAL_GREP_PATTERN, 'i');
  const yes = [
    'G1: REFUSED - sandboxed dispatch could not proceed without permission bypass',
    'ERROR: permission denied for this tool',
    'Tool use blocked - approval required',
  ];
  const no = [
    'Task: add sandbox docs; permission bypass flags are omitted; refused tool calls score REFUSED',
    'Do not block the override; emit a warning when operator permission is required',
    'Approval is required before publishing, per the plan trust model',
  ];
  for (const s of yes) assert.ok(re.test(s), 'missed refusal: ' + s);
  for (const s of no) assert.ok(!re.test(s), 'permissions-related task prose was scored REFUSED: ' + s);
});

t('lint splitRow falls back when an odd backtick count would desynchronise tail columns', () => {
  const { parseTaskTable } = require('../bin/lint.js');
  const fixture = [
    '## 📊 Task Table',
    '',
    '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|',
    '| 27 | 🔨 Worker | — | 📄 | Cancelled row mentions `unterminated code and an escaped pipe \\| in prose | — *(no oracle — cancelled)* | P0 | 45 | $WORKER | $VALIDATOR | 🚫 Cancelled | 🚫 n/a |',
  ].join('\n');
  const rows = parseTaskTable(fixture);
  assert.strictEqual(rows.length, 1, 'fixture row should parse');
  assert.strictEqual(rows[0].id, '27');
  assert.ok(/🚫 Cancelled/.test(rows[0].done), 'row 27 Done cell must not be desynchronised');
  assert.ok(/🚫 n\/a/.test(rows[0].valid), 'row 27 Valid cell must not be desynchronised');
});

t('buildScript() content diff detects an edit to a pre-existing untracked file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-wave-content-diff-'));
  const plan = path.join(dir, 'plan.md');
  const fixture = path.join(dir, 'preexisting-untracked.txt');
  const fakeBin = path.join(dir, 'fake-bin');
  const fakeOpencode = path.join(fakeBin, 'opencode');
  const report = path.join(dir, 'tasks', 'task_1', 'task_1_report_fixture_20260904.md');
  fs.mkdirSync(fakeBin, { recursive: true });
  fs.writeFileSync(plan, '# Plan Backlog: x — 2026-09-04\n');
  fs.writeFileSync(fixture, 'before\n');
  fs.writeFileSync(fakeOpencode, [
    '#!/usr/bin/env bash',
    'printf \'after\\n\' > preexisting-untracked.txt',
    'mkdir -p tasks/task_1',
    'printf \'# Task 1: fixture\\n\' > ' + JSON.stringify(report),
  ].join('\n') + '\n', { mode: 0o755 });

  try {
    const built = generator.buildScript({
      planPath: plan,
      wave: 'A',
      cells: [{
        role: 'worker',
        wave: 'A',
        command: '/wbWork plan.md --id=1',
        suggestedModel: '',
        prelude: [],
        pairsWave: null,
        pairsIds: [],
        held: false,
      }],
      dispatchIndex: {},
      models: { worker: 'opencode-go/deepseek-v4-pro' },
      jobs: 0,
      repoRoot: dir,
      planDirRel: '',
      verifyColumn: { 1: '`true`' },
    });
    const script = path.join(dir, 'wave_A.sh');
    fs.writeFileSync(script, built.script, { mode: 0o755 });
    const env = Object.assign({}, process.env, {
      PATH: fakeBin + path.delimiter + process.env.PATH,
      WB_WAVE_LOG_DIR: path.join(dir, 'wave-logs'),
    });
    const output = require('child_process').execFileSync('bash', [script], {
      cwd: dir,
      env,
      encoding: 'utf8',
    });
    assert.ok(output.indexOf('G2 [1]: PASS') !== -1,
      'an untracked content edit is not misclassified as NO-OP');
    assert.ok(output.indexOf('G2 [1]: NO-OP') === -1 && output.indexOf('VERDICT [1]: NO-OP') === -1,
      'the content-diff gate emits no NO-OP verdict for a real untracked edit');
    assert.strictEqual(fs.readFileSync(fixture, 'utf8'), 'after\n',
      'the fake worker changed the pre-existing untracked fixture');
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* best effort */ }
  }
});

// ── wave_router ──────────────────────────────────────────────────────────────
t('resolveDisplayName() maps an alias to its dispatchable slug', () => {
  assert.strictEqual(router.resolveDisplayName('gemini 3.1 pro'), 'gemini-3.1-pro-high');
});

t('resolveDisplayName() passes a -high slug through untouched', () => {
  assert.strictEqual(router.resolveDisplayName('gemini-3.1-pro-high'), 'gemini-3.1-pro-high');
});

t('resolveDisplayName() returns undefined for an unresolvable name', () => {
  // Regression guard for review finding R2: a lane suffix breaks the $ anchor,
  // which silently falls back to DEFAULT_MODELS. Must stay visible.
  assert.strictEqual(router.resolveDisplayName('gemini-3.1-pro-high (agy)'), undefined);
});

t('resolveDisplayName() normalises the in-session Claude sentinel to empty', () => {
  assert.strictEqual(router.resolveDisplayName('Claude (auto)'), '');
});

// ── wave_parser ──────────────────────────────────────────────────────────────
t('parseDoneColumn() extracts the Done cell keyed by row id', () => {
  const got = parser.parseDoneColumn('| 1 | x | ✅<br>Gemini | ⬜ |');
  assert.strictEqual(got['1'], '✅<br>Gemini');
});

t('parseDoneColumn() distinguishes an open row from a closed one', () => {
  const closed = parser.parseDoneColumn('| 7 | x | ✅<br>Claude | ⬜ |');
  const open = parser.parseDoneColumn('| 8 | x | ⬜ | ⬜ |');
  assert.ok(/✅/.test(closed['7']), 'row 7 should read as closed');
  assert.ok(!/✅/.test(open['8'] || ''), 'row 8 should read as open');
});

t('splitCommand() decomposes a dispatch into name, target and ids', () => {
  const got = parser.splitCommand('/wbWork foo/plan.md --id=5');
  assert.strictEqual(got.name, 'wbWork');
  assert.strictEqual(got.target, 'foo/plan.md');
  assert.deepStrictEqual(got.ids, ['5']);
});

t('splitCommand() splits a merged multi-id dispatch', () => {
  const got = parser.splitCommand('/wbValid foo/plan.md --id=5,9,14');
  assert.deepStrictEqual(got.ids, ['5', '9', '14']);
});

t('parseMatrix() finds the wave table and returns its rows', () => {
  const md = [
    '## 🌊 Next Executable Sequence',
    '',
    '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
    '|---|---|---|---|---|',
    '| **A · 🔨 work** | — | — | `/wbWork p.md --id=1` | — |',
    '',
  ].join('\n');
  const m = parser.parseMatrix(md);
  assert.ok(m && Array.isArray(m.rows), 'parseMatrix should return {rows: []}');
  assert.strictEqual(m.rows.length, 1);
});

t('parseMatrix() returns falsy when there is no matrix heading', () => {
  assert.ok(!parser.parseMatrix('# just a document\n\nno matrix here.\n'));
});

// ── wave_constants ───────────────────────────────────────────────────────────
t('NAME_TO_SLUG is a Map, not a plain object', () => {
  // This one is deliberate: the Map-vs-object shape cost a wrong measurement
  // during the 2026-08-14 audit, when Object.keys() on it returned [].
  assert.ok(constants.NAME_TO_SLUG instanceof Map, 'NAME_TO_SLUG must be a Map');
  assert.ok(constants.NAME_TO_SLUG.size >= 7, 'expected at least 7 aliases');
  assert.strictEqual(constants.NAME_TO_SLUG.get('gemini 3.1 pro'), 'gemini-3.1-pro-high');
});

t('ROLES carries the four canonical roles in order', () => {
  assert.deepStrictEqual(
    constants.ROLES.map((r) => r.key),
    ['planner', 'validator', 'worker', 'mechanical']
  );
});

// ── cli_registry ─────────────────────────────────────────────────────────────
t('cli_registry CLI_SPEC --sandbox drops all permission bypasses across every lane', () => {
  const { CLI_SPEC } = require('../bin/cli_registry.js');
  const byp = /dangerously|bypass|skip-permissions|permission-mode/i;
  const bad = [];
  for (const n of Object.keys(CLI_SPEC)) {
    const a = (CLI_SPEC[n].argv('M', 'P', { sandbox: true }) || []).join(' ');
    if (byp.test(a)) bad.push(n + ': ' + a);
  }
  assert.strictEqual(bad.length, 0, '--sandbox leaves a permission bypass on: ' + bad.join(' ; '));
  
  const b = (CLI_SPEC.claude.argv('M', 'P') || []).join(' ');
  assert.ok(/permission-mode/.test(b), 'non-sandbox claude lane lost --permission-mode (over-correction)');
});

console.log(pass + ' passed, 0 failed');

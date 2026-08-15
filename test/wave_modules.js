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

console.log(pass + ' passed, 0 failed');

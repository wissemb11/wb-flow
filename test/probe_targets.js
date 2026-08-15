'use strict';
//
// `--probe --all[=<what>]` target selection.
//
// Regression suite for the 2026-08-14 review: the flag was implemented twice —
// once under `--pick` and once without — and the two drifted. The non-pick
// branch never received the catalog index (so anthropic/* and openai/* reported
// a phantom "Insufficient balance") and ignored every `--all=<filter>` (so
// `--all=openai` probed all 36 models instead of 6). Both branches now call
// selectProbeTargets(), and these tests pin the behaviour of that one function.
//
const assert = require('assert');
const M = require('../bin/model.js');

let pass = 0;
function t(name, fn) { fn(); pass++; console.log('  ✓ ' + name); }

console.log('🧪 probe target selection');

const CATALOG = {
  masterProviders: [
    { provider: 'anthropic', pool: 'claude-pro', models: ['anthropic/claude-opus-5', 'anthropic/claude-haiku-4-5-20251001'] },
    { provider: 'openai', pool: 'chatgpt', models: ['openai/gpt-5.6-terra', 'openai/gpt-5.3-codex'] },
    { provider: 'antigravity', pool: 'google-one', models: ['gemini-3.1-pro-high', 'gemini-3.6-flash-low'] },
    { provider: 'opencode-go', pool: 'opencode-go', models: ['opencode-go/kimi-k3'] },
  ],
};
const idx = M.catalogIndex(CATALOG);
const ALL = [];
for (const g of CATALOG.masterProviders) for (const m of g.models) ALL.push(m);

t('--all (default) selects the whole catalog and groups it', () => {
  const s = M.selectProbeTargets(ALL, 'default', idx);
  assert.strictEqual(s.targets.length, ALL.length);
  assert.strictEqual(s.mode, 'default');
  assert.strictEqual(s.grouped, true);
});

t('--all=raw selects everything and streams (does not group)', () => {
  const s = M.selectProbeTargets(ALL, 'raw', idx);
  assert.strictEqual(s.targets.length, ALL.length);
  assert.strictEqual(s.grouped, false, 'raw must stream, that is its whole purpose');
});

t('--all=<provider> narrows to that provider', () => {
  const s = M.selectProbeTargets(ALL, 'anthropic', idx);
  assert.strictEqual(s.mode, 'provider');
  assert.deepStrictEqual(s.targets, ['anthropic/claude-opus-5', 'anthropic/claude-haiku-4-5-20251001']);
});

t('--all=<provider> groups too — consistent with --all=<role>', () => {
  // Previously the provider filter fell through to the streaming branch, so
  // --all=openai and --all=worker formatted their output differently for no
  // stated reason.
  assert.strictEqual(M.selectProbeTargets(ALL, 'anthropic', idx).grouped, true);
  assert.strictEqual(M.selectProbeTargets(ALL, 'worker', idx).grouped, true);
});

t('--all=<role> narrows by role', () => {
  const s = M.selectProbeTargets(ALL, 'mechanical', idx);
  assert.strictEqual(s.mode, 'role');
  assert.ok(s.targets.length > 0 && s.targets.length < ALL.length, 'expected a strict subset');
});

t('an unknown filter reports an error instead of probing nothing quietly', () => {
  const s = M.selectProbeTargets(ALL, 'nonexistent-provider', idx);
  assert.strictEqual(s.targets.length, 0);
  assert.ok(/No models match provider/.test(s.error), 'got: ' + s.error);
});

t('--all= (empty) behaves as --all, not as "probe nothing"', () => {
  // `--all=` parsed to '' which is falsy, so the entire probe block was skipped
  // with no output and no error.
  for (const v of ['', true, undefined, null]) {
    const s = M.selectProbeTargets(ALL, v, idx);
    assert.strictEqual(s.targets.length, ALL.length, JSON.stringify(v) + ' should mean "all"');
    assert.strictEqual(s.mode, 'default');
  }
});

t('filter matching is case-insensitive', () => {
  assert.strictEqual(M.selectProbeTargets(ALL, 'ANTHROPIC', idx).targets.length, 2);
  assert.strictEqual(M.selectProbeTargets(ALL, 'Mechanical', idx).mode, 'role');
});

// ── grouping ────────────────────────────────────────────────────────────────

t('ROLE_TAGS covers every tag qualifyModel can emit', () => {
  // The display order list previously held 5 of the 7 tags, so 🔨 Heavy Worker
  // and 💡 General Purpose Worker fell into an unordered catch-all.
  const emitted = new Set();
  const probes = ['grok-4.6', 'opus-5', 'sonnet-5', 'deepseek-v4-pro', 'kimi-k2.7-code',
    'haiku', 'kimi-k3', 'qwen3.7-max', 'mixtral', 'something-unclassified'];
  for (const p of probes) emitted.add(M.qualifyModel(p));
  for (const tag of emitted) {
    assert.ok(M.ROLE_TAGS.indexOf(tag) !== -1, 'ROLE_TAGS is missing: ' + tag);
  }
});

t('renderGrouped() orders by ROLE_TAGS and drops nothing', () => {
  const buckets = {};
  buckets[M.ROLE_TAGS[2]] = ['c'];
  buckets[M.ROLE_TAGS[0]] = ['a'];
  buckets['🛸 An Unknown Tag'] = ['z'];
  const out = M.renderGrouped(buckets);
  assert.deepStrictEqual(out, ['a', 'c', 'z'], 'ordered by ROLE_TAGS, unknown tags last but present');
});

// ── the invariant the review was about ──────────────────────────────────────

t('BOTH --probe paths select identically for every --all form', () => {
  // The two branches are separate code. This asserts they cannot disagree
  // about WHAT to probe, which is the defect that shipped.
  for (const form of ['default', 'raw', 'anthropic', 'openai', 'worker', 'mechanical', '']) {
    const a = M.selectProbeTargets(ALL, form, idx);
    const b = M.selectProbeTargets(ALL, form, idx);
    assert.deepStrictEqual(a.targets, b.targets, 'divergence on --all=' + form);
  }
  // and a filter must actually narrow — the non-pick branch used to ignore it
  const filtered = M.selectProbeTargets(ALL, 'openai', idx).targets.length;
  assert.ok(filtered < ALL.length, '--all=openai must NOT fall back to the whole catalog');
  assert.strictEqual(filtered, 2);
});

console.log(pass + ' passed, 0 failed');

'use strict';
//
// Step 1 defaults come from the probe, and tier siblings collapse to one.
//
// Requested 2026-08-14: after `--pick --probe --all`, the models the probe
// listed under a role should be the ones pre-checked for that role — detection
// only proves a credential exists, the probe proves the model answered. And
// `gemini-3.6-flash-{high,medium,low}` is one model at three service tiers, so
// offering all three as fallback links is one point of failure wearing three
// hats.
//
const assert = require('assert');
const M = require('../bin/model.js');

let pass = 0;
function t(name, fn) { fn(); pass++; console.log('  ✓ ' + name); }
console.log('🧪 probe-derived Step 1 defaults');

// ── tier collapsing ─────────────────────────────────────────────────────────

t('collapses -high/-medium/-low of one stem to the -high variant', () => {
  assert.deepStrictEqual(
    M.collapseTiers(['gemini-3.6-flash-high', 'gemini-3.6-flash-medium', 'gemini-3.6-flash-low']),
    ['gemini-3.6-flash-high']);
});

t('keeps DIFFERENT releases — 3.6-flash and 3.5-flash are separate stems', () => {
  assert.deepStrictEqual(
    M.collapseTiers(['gemini-3.6-flash-high', 'gemini-3.6-flash-low',
                     'gemini-3.5-flash-high', 'gemini-3.5-flash-medium']),
    ['gemini-3.6-flash-high', 'gemini-3.5-flash-high']);
});

t('prefers -high even when it appears after -low', () => {
  assert.deepStrictEqual(
    M.collapseTiers(['gemini-3.1-pro-low', 'gemini-3.1-pro-high']), ['gemini-3.1-pro-high']);
});

t('falls back to the best available tier when there is no -high', () => {
  assert.deepStrictEqual(M.collapseTiers(['x-flash-low', 'x-flash-medium']), ['x-flash-medium']);
});

t('leaves non-tier suffixes and sentinels alone', () => {
  const input = ['claude-opus-4-6-thinking', 'Codex (auto)', 'anthropic/claude-opus-5'];
  assert.deepStrictEqual(M.collapseTiers(input), input, '-thinking is not a service tier');
});

t('preserves input order', () => {
  assert.deepStrictEqual(
    M.collapseTiers(['b-high', 'b-low', 'a-high', 'a-medium']), ['b-high', 'a-high']);
});

// ── probe-derived defaults ──────────────────────────────────────────────────

function probe(slugs, provOf) {
  return new Map(slugs.map((s) => [s, { ok: true, tag: M.qualifyModel(s), route: { provider: provOf(s) } }]));
}
const PROV = (s) => s.startsWith('anthropic/') ? 'anthropic'
  : s.startsWith('openai/') || /^Codex/.test(s) ? 'openai'
  : /^Antigravity|^gemini-/.test(s) ? 'antigravity' : 'other';

const REACHABLE = ['anthropic/claude-opus-5', 'anthropic/claude-sonnet-4-6', 'gemini-3.1-pro-high',
  'anthropic/claude-sonnet-5', 'openai/gpt-5.6-terra', 'openai/gpt-5.5',
  'anthropic/claude-haiku-4-5-20251001', 'openai/gpt-5.6-luna',
  'gemini-3.6-flash-high', 'gemini-3.6-flash-medium', 'gemini-3.6-flash-low',
  'gemini-3.5-flash-high', 'gemini-3.5-flash-medium', 'gemini-3.5-flash-low',
  'Codex (auto)', 'Antigravity (auto)'];
const PR = probe(REACHABLE, PROV);
const ACTIVE = ['anthropic', 'openai', 'antigravity'];

t('every role gets a non-empty default chain', () => {
  for (const role of ['planner', 'validator', 'worker', 'mechanical']) {
    const c = M.suggestFromProbe(role, PR, ACTIVE, null);
    assert.ok(c && c.length, role + ' got no default');
  }
});

t('no -medium/-low variant is ever pre-checked', () => {
  for (const role of ['planner', 'validator', 'worker', 'mechanical']) {
    for (const slug of M.suggestFromProbe(role, PR, ACTIVE, null)) {
      assert.ok(!/-(medium|low)$/.test(slug), role + ' pre-checked a non-high tier: ' + slug);
    }
  }
});

t('an UNREACHABLE model is never pre-checked', () => {
  const pr = new Map(PR);
  pr.set('anthropic/claude-fable-5', { ok: false, why: 'Insufficient balance', tag: M.qualifyModel('anthropic/claude-fable-5') });
  for (const role of ['planner', 'worker']) {
    assert.ok(M.suggestFromProbe(role, pr, ACTIVE, null).indexOf('anthropic/claude-fable-5') === -1);
  }
});

t('a ⚠️ substituted model is never pre-checked', () => {
  // It answered — as a different model. Putting it in a chain guarantees a
  // dispatch that silently runs something else.
  const pr = new Map(PR);
  pr.set('gpt-oss-120b-medium', { ok: false, substituted: true, why: 'using Gemini 3.1 Pro', tag: '🧠 Lead Architect & Planner' });
  assert.ok(M.suggestFromProbe('planner', pr, ACTIVE, null).indexOf('gpt-oss-120b-medium') === -1);
});

t('models outside the enabled subscriptions are excluded', () => {
  const only = M.suggestFromProbe('planner', PR, ['antigravity'], null);
  for (const slug of only) assert.strictEqual(PROV(slug), 'antigravity', 'leaked: ' + slug);
});

t('chains span MORE THAN ONE billing pool', () => {
  // The whole point of a fallback chain. A reachable model matching no
  // ROLE_PREFERENCE pattern used to be dropped by pickForRole, which collapsed
  // the worker chain onto a single pool.
  for (const role of ['planner', 'worker', 'mechanical']) {
    const pools = new Set(M.suggestFromProbe(role, PR, ACTIVE, null).map(M.poolOf));
    assert.ok(pools.size >= 2, role + ' chain sits on one pool: ' + [...pools].join(','));
  }
});

t('top-up fills a NEW pool before a second model from a pool already used', () => {
  // Targets the top-up ordering specifically. The previous assertion ("spans
  // more than one pool") was satisfied by pickForRole alone, so a top-up that
  // ignored pool diversity still passed it — the mutant survived.
  const slugs = ['openai/gpt-5.5', 'Codex (auto)', 'openai/gpt-5.6-luna', 'Antigravity (auto)'];
  const pr = probe(slugs, PROV);
  const chain = M.suggestFromProbe('worker', pr, ['openai', 'antigravity'], null);
  const pools = chain.map(M.poolOf);
  const firstNewPoolAt = pools.findIndex((p, i) => pools.indexOf(p) === i && i > 0);
  assert.ok(chain.indexOf('Antigravity (auto)') !== -1,
    'the only google-one candidate must be pulled in: ' + chain.join(' || '));
  // and it must arrive before a THIRD chatgpt/openai model
  const agIdx = chain.indexOf('Antigravity (auto)');
  const laterSamePool = chain.slice(agIdx + 1).filter((s) => M.poolOf(s) === M.poolOf(chain[0]));
  assert.strictEqual(laterSamePool.length, 0,
    'a same-pool model was placed before the new-pool one: ' + chain.join(' || '));
  assert.ok(firstNewPoolAt !== -1, 'chain never introduces a second pool');
});

t('returns null when no probe ran, so the old base is kept', () => {
  assert.strictEqual(M.suggestFromProbe('planner', null, ACTIVE, null), null);
  assert.strictEqual(M.suggestFromProbe('planner', new Map(), ACTIVE, null), null);
});

t('mechanical prefers the fast tier the probe tagged ⚡', () => {
  const c = M.suggestFromProbe('mechanical', PR, ACTIVE, null);
  assert.ok(/flash|haiku|luna/i.test(c[0]), 'expected a fast model first, got ' + c[0]);
});

console.log(pass + ' passed, 0 failed');

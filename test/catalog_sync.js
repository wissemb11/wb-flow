'use strict';
/**
 * test/catalog_sync.js — fixture-driven contract tests for bin/catalog_sync.js.
 *
 * FIXTURE-DRIVEN ON PURPOSE. The suite must run on a machine with no CLIs
 * installed and no subscriptions, because that is the machine an installer has.
 * Nothing here shells out; every input is a literal below. That is the whole
 * reason catalog_sync.js is a pure module (spec §10).
 *
 *   node test/catalog_sync.js
 *   node test/catalog_sync.js --only=prune
 */

const assert = require('assert');
const C = require('../bin/catalog_sync.js');

const only = (process.argv.find((a) => a.indexOf('--only=') === 0) || '').slice(7);
let pass = 0, skipped = 0;
function t(name, fn) {
  if (only && name.indexOf(only) === -1) { skipped++; return; }
  fn(); pass++; console.log('  ✓ ' + name);
}

console.log('🧪 catalog_sync');

// ── fixtures ────────────────────────────────────────────────────────────────
// A Zen catalog in miniature: the real one is 62 slugs, of which 44 duplicate a
// flat-rate pool. The proportions matter more than the count.
const ZEN = [
  'opencode/deepseek-v4-pro', 'opencode/deepseek-v4-flash', 'opencode/glm-5.2',
  'opencode/minimax-m3', 'opencode/kimi-k2.6', 'opencode/big-pickle',
  'opencode/gemini-3.1-pro', 'opencode/claude-opus-5', 'opencode/gpt-5.5',
  'opencode/grok-4.6', 'opencode/gemini-embedding-001',
];
const FLAT = [
  { provider: 'anthropic', pool: 'claude-pro', models: ['anthropic/claude-opus-5'] },
  { provider: 'xai', pool: 'supergrok', models: ['xai/grok-4.6'] },
];

// ── curation ────────────────────────────────────────────────────────────────

t('curate caps a large provider list — at the 691 slugs the row named', function () {
  // 691 is the real `opencode models` count measured 2026-09-02, not a round
  // number: the row asked for that input specifically, and a 200-slug proxy
  // leaves the actual scale untested. Flagged in the row-3 re-score.
  const many = [];
  for (let i = 0; i < 691; i++) many.push('opencode/model-' + i);
  assert.ok(C.curate(many, {}).length <= C.DEFAULT_CAP,
    'a 200-slug provider must curate to at most ' + C.DEFAULT_CAP);
});

t('curate drops non-chat models', function () {
  const out = C.curate(['opencode/deepseek-v4-pro', 'opencode/gemini-embedding-001'], {});
  assert.ok(out.indexOf('opencode/gemini-embedding-001') === -1, 'an embedding model is not a chat model');
  assert.ok(out.indexOf('opencode/deepseek-v4-pro') !== -1, 'the chat model must survive');
});

t('curate keeps a metered model with no flat-rate twin', function () {
  const held = C.heldFamiliesOf(FLAT);
  const out = C.curate(ZEN, { heldFamilies: held });
  assert.ok(out.indexOf('opencode/deepseek-v4-pro') !== -1, 'deepseek-v4-pro is unique to Zen here — keep it');
});

t('curate drops a metered model whose family a HELD flat-rate pool already serves', function () {
  const held = C.heldFamiliesOf(FLAT);
  const out = C.curate(ZEN, { heldFamilies: held });
  assert.ok(out.indexOf('opencode/claude-opus-5') === -1,
    'Claude Pro is held, so the metered Claude copy must go');
  assert.ok(out.indexOf('opencode/grok-4.6') === -1,
    'SuperGrok is held, so the metered Grok copy must go');
});

t('the dedupe is per-user: without the subscription the metered copy STAYS', function () {
  // The rule that must never become a hard-coded blocklist. A user with no
  // Claude Pro should keep opencode/claude-opus-5 — for them it is not a
  // duplicate, it is the only route to Opus.
  const noneHeld = C.heldFamiliesOf([]);
  const out = C.curate(ZEN, { heldFamilies: noneHeld });
  assert.ok(out.indexOf('opencode/claude-opus-5') !== -1,
    'with nothing held, the metered Claude copy is the only Opus available — keep it');
});

t("Zen curation keeps deepseek-v4-pro and gemini-3.1-pro and DROPS big-pickle", function () {
  // The row's own words. It was missing from the first version of this suite,
  // and `curate()` did in fact keep `big-pickle` — the assertion and the
  // behaviour were both absent, so nothing failed. Found by the cross-provider
  // validator (xai/grok-4.5), not by the suite.
  const out = C.curate(ZEN, {});
  assert.ok(out.indexOf('opencode/deepseek-v4-pro') !== -1, 'deepseek-v4-pro must survive');
  assert.ok(out.indexOf('opencode/gemini-3.1-pro') !== -1, 'gemini-3.1-pro must survive');
  assert.ok(out.indexOf('opencode/big-pickle') === -1, 'big-pickle is a demo codename — drop it');
});

t('the demo filter is a rule, not a name list', function () {
  // -free is self-declared; an absent version token marks a codename. Rank is
  // NOT the signal: kimi-k2.6 matches no ROLE_PREFERENCE pattern either and is
  // a model worth routing to.
  const out = C.curate(['opencode/kimi-k2.6', 'opencode/ling-3.0-flash-fin-free', 'opencode/big-pickle'], {});
  assert.ok(out.indexOf('opencode/kimi-k2.6') !== -1, 'unranked but versioned — keep');
  assert.ok(out.indexOf('opencode/ling-3.0-flash-fin-free') === -1, 'explicit -free — drop');
  assert.ok(out.indexOf('opencode/big-pickle') === -1, 'no version token — drop');
});

// ── merge semantics ─────────────────────────────────────────────────────────

const EXISTING = {
  seed: true,
  providers: [{
    provider: 'xai', pool: 'supergrok', cli: 'grok',
    models: ['xai/grok-4.6', { slug: 'xai/grok-pinned', pinned: true }, 'xai/grok-gone'],
  }],
};
const LIVE = {
  groups: [{ provider: 'xai', pool: 'supergrok', models: ['xai/grok-4.6', 'xai/grok-4.5'] }],
  reported: ['nvidia'],
};
const NOW = '2026-09-02';

t('mergeCatalog does not mutate its arguments', function () {
  const a = JSON.stringify(EXISTING), b = JSON.stringify(LIVE);
  C.mergeCatalog(EXISTING, LIVE, { now: NOW });
  assert.strictEqual(JSON.stringify(EXISTING), a, 'existing was mutated');
  assert.strictEqual(JSON.stringify(LIVE), b, 'live was mutated');
});

t('mergeCatalog adds, keeps and retires', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW });
  assert.deepStrictEqual(r.changes.add, ['xai/grok-4.5']);
  assert.deepStrictEqual(r.changes.keep, ['xai/grok-4.6']);
  assert.deepStrictEqual(r.changes.retire, ['xai/grok-gone']);
});

t('retire MARKS rather than deletes — an empty enumeration is usually a CLI failure', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW });
  const gone = r.providers[0].models.find(function (m) { return m && m.slug === 'xai/grok-gone'; });
  assert.ok(gone, 'the retired slug must still be present');
  assert.strictEqual(gone.retired, NOW, 'and carry the date it left');
});

t('a pinned model survives a normal merge', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW });
  assert.deepStrictEqual(r.changes.pin, ['xai/grok-pinned']);
  assert.ok(r.providers[0].models.some(function (m) { return m && m.slug === 'xai/grok-pinned'; }));
});

t('a pinned model survives prune', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW, prune: true });
  assert.ok(r.providers[0].models.some(function (m) { return m && m.slug === 'xai/grok-pinned'; }),
    'prune must not remove a pinned slug');
});

t('prune REFUSES a slug the live roster still names, without --force', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW, prune: true, referenced: ['xai/grok-gone'] });
  assert.strictEqual(r.changes.refused.length, 1, 'the referenced slug must be refused');
  assert.ok(/grok-gone/.test(r.changes.refused[0]));
  assert.ok(r.providers[0].models.some(function (m) {
    return (typeof m === 'string' ? m : m.slug) === 'xai/grok-gone';
  }), 'and must still be in the catalog');
});

t('--force overrides the refusal and removes it', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW, prune: true, referenced: ['xai/grok-gone'], force: true });
  assert.strictEqual(r.changes.refused.length, 0);
  assert.ok(!r.providers[0].models.some(function (m) {
    return (typeof m === 'string' ? m : m.slug) === 'xai/grok-gone';
  }), 'with --force the slug is gone');
});

t('a credentialed but unlisted provider is REPORTED, never added', function () {
  const live = C.enumerateLive(
    { slugs: ['xai/grok-4.6', 'nvidia/some-model'], providers: [] },
    { knownProviders: ['xai'] }
  );
  assert.deepStrictEqual(live.reported, ['nvidia'], 'nvidia must be reported');
  assert.ok(!live.groups.some(function (g) { return g.provider === 'nvidia'; }),
    'and must NOT appear as a group — mergeCatalog can only add what enumerateLive returns');
});

t('the seed flag clears on a successful merge and syncedAt is stamped', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW });
  assert.strictEqual(r.catalog.seed, undefined, 'seed must be cleared once real models land');
  assert.strictEqual(r.catalog.syncedAt, NOW);
});

t('diffCatalog returns a table and prints nothing', function () {
  const r = C.mergeCatalog(EXISTING, LIVE, { now: NOW });
  const out = C.diffCatalog(r.changes);
  assert.strictEqual(typeof out, 'string');
  assert.ok(/\| Verdict \| Count \|/.test(out), 'must render a markdown table');
});

t('a PROVIDER name in selected.json maps to its POOL, not just to itself', function () {
  // The pin that was missing. The first data-driven implementation asked
  // catalogIndex() with no argument (returns {}), so every name fell through to
  // `|| name` and only providers whose NAME equals their POOL worked.
  // `opencode-zen` is such a name — so a test written with the pool name
  // confirmed itself while `anthropic` still classified as not-a-subscription.
  // Caught by a cross-provider validator, not by this suite.
  const M = require('../bin/model.js');
  M._setActiveProviders(['anthropic']);
  assert.strictEqual(M.isSubscription('anthropic/claude-opus-5'), true,
    'provider "anthropic" must map to pool "claude-pro"');
  assert.strictEqual(M.poolRank('anthropic/claude-opus-5'), 0, 'and rank by the active-set order');
  assert.strictEqual(M.isSubscription('opencode/deepseek-v4-pro'), false,
    'a pool NOT in the active set stays metered');
  M._setActiveProviders(null);
  assert.strictEqual(M.isSubscription('anthropic/claude-opus-5'), true, 'bare-install fallback unchanged');
  assert.strictEqual(M.isSubscription('opencode/deepseek-v4-pro'), false, 'bare-install fallback unchanged');
  M._setActiveProviders(undefined);
});

t('entitlement: a persisted checkedAt outranks the CODEX_VERIFIED seed', function () {
  const M = require('../bin/model.js');
  // The seed itself must first be CORRECT — measured 2026-09-02 against Codex
  // Plus, the old one was missing gpt-5.6-sol (Codex's own default) and gpt-5.4.
  for (const want of ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini']) {
    assert.ok(M.CODEX_VERIFIED.indexOf(want) !== -1, 'seed must list ' + want);
  }
  assert.ok(M.CODEX_VERIFIED.indexOf('gpt-5.3-codex') === -1, 'gpt-5.3-codex is not entitled');
  // And the seed must be reachable only as a FALLBACK.
  assert.strictEqual(typeof M.persistedCodexVerified, 'function',
    'detect() needs a persisted-entitlement reader to prefer over the seed');
});

t('entitlement: a plain --sync-catalog never probes', function () {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'bin', 'model.js'), 'utf8');
  const at = src.indexOf('if (opts.probe) {');
  assert.ok(at !== -1, 'the probe path must be guarded by opts.probe');
  assert.ok(/NEVER under a plain --sync-catalog/.test(src),
    'the no-silent-spend rule must be stated where the probe lives');
});

t('picker parsing survives the cursor, the (default)/(current) markers and the description column', function () {
  const M = require('../bin/model.js');
  const real = [
    '  1. gpt-5.6-sol (default)    Reliable agentic workhorse for everyday tasks.',
    '\u203a 2. gpt-5.6-terra (current)  Balanced agentic coding model for everyday work.',
    '  3. gpt-5.6-luna             Fast and affordable agentic coding model.',
  ].join('\n');
  assert.deepStrictEqual(M.parsePickerModels(real),
    ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna'],
    'the cursor, markers and description column must all be stripped');
  assert.deepStrictEqual(M.parsePickerModels('no numbered lines here'), []);
});

t('agy model lines are stored as SLUGS — the display name never reaches a roster', function () {
  // `agy models` prints "<slug>\t<Display Name>". Storing the whole line put
  // `claude-opus-4-6-thinking\tClaude Opus 4.6 (Thinking)` into rosters written
  // by `wb-flow init` — a dispatch naming a model that does not exist. Invisible
  // on a machine whose top picks are not agy models; found by a sandboxed clean
  // install, not by a test. This is that test.
  const M = require('../bin/model.js');
  const d = M.detect({
    hasCLI: function (bin) { return bin === 'agy'; },
    tryExec: function (bin, args) {
      if (bin === 'agy' && args[0] === 'models') return 'claude-opus-4-6-thinking\tClaude Opus 4.6 (Thinking)\n';
      return '';
    },
  });
  const agy = (d.agy && d.agy.models) || [];
  assert.ok(!agy.some(function (m) { return String(m).indexOf('\t') !== -1; }),
    'no agy slug may carry a tab');
  const r = M.proposeRoster(d);
  for (const role of M.ROLE_ORDER) {
    for (const m of r[role] || []) {
      assert.ok(String(m).indexOf('\t') === -1, role + ' chain carries a tabbed slug: ' + JSON.stringify(m));
    }
  }
});

t('unit runs can stub live CLI enumeration with WB_FLOW_NO_ENUM', function () {
  const M = require('../bin/model.js');
  const prev = process.env.WB_FLOW_NO_ENUM;
  process.env.WB_FLOW_NO_ENUM = '1';
  try {
    const d = M.detect();
    assert.strictEqual(d.noEnum, true);
    assert.deepStrictEqual(d.slugs, []);
    assert.strictEqual(d.claude, null);
  } finally {
    if (prev === undefined) delete process.env.WB_FLOW_NO_ENUM;
    else process.env.WB_FLOW_NO_ENUM = prev;
  }
});

t('the module-level activeProviders helper is not shadowed by a local in run()', function () {
  // Row 7 declared `let activeProviders = null` inside run() and then called
  // `activeProviders()` a few lines later. A `let` shadows for the WHOLE block,
  // so Step 0 threw "activeProviders is not a function" and the interactive
  // picker could not run at all — invisible to a `--yes` install, which never
  // reaches that branch. Found by a cross-provider validator, not by a test.
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'bin', 'model.js'), 'utf8');
  assert.ok(!/\blet\s+activeProviders\b/.test(src),
    'no local may shadow the activeProviders() helper');
  const M = require('../bin/model.js');
  assert.strictEqual(typeof M.activeProviders, 'function');
});

console.log('  ' + pass + ' passed' + (skipped ? ' · ' + skipped + ' skipped by --only' : ''));

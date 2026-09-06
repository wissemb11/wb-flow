'use strict';
//
// Catalog-authoritative model → CLI routing.
//
// Regression suite for the 2026-08-14 defect: `wb-flow model --pick --probe --all`
// reported "Insufficient balance" for `openai/gpt-5.6-terra` while
// `codex exec -m gpt-5.6-terra` answered instantly. Cause: probe/dispatch both
// re-derived the CLI from the slug with a guard of
//     slug.indexOf('/') === -1 && CODEX_ONLY.test(tail)
// which the catalog's own namespaced spelling fails. models.json already
// records { provider, pool } per model; nothing read it.
//
const assert = require('assert');
const M = require('../bin/model.js');
const R = require('../bin/wave_router.js');

let pass = 0;
function t(name, fn) { fn(); pass++; console.log('  ✓ ' + name); }

console.log('🧪 model routing (catalog-authoritative)');

// A catalog shaped exactly like a real .wb/models.json.
const CATALOG = {
  masterProviders: [
    { provider: 'anthropic', pool: 'claude-pro', models: ['anthropic/claude-opus-5', 'anthropic/claude-haiku-4-5-20251001', 'Claude (auto)'] },
    { provider: 'openai', pool: 'chatgpt', models: ['openai/gpt-5.6-terra', 'openai/gpt-5.3-codex', 'Codex (auto)'] },
    { provider: 'openrouter', pool: 'openrouter', models: ['openrouter/openai/gpt-4o'] },
    { provider: 'opencode-go', pool: 'opencode-go', models: ['opencode-go/deepseek-v4-pro'] },
    { provider: 'opencode-zen', pool: 'opencode-zen', models: ['opencode/gemini-3.1-pro'] },
    { provider: 'antigravity', pool: 'google-one', models: ['gemini-3.1-pro-high', 'claude-opus-4-6-thinking', 'gpt-oss-120b-medium', 'Antigravity (auto)'] },
    { provider: 'github-copilot', pool: 'github-copilot', models: ['github-copilot/auto'] },
  ],
};
const idx = M.catalogIndex(CATALOG);

t('catalogIndex() maps every catalogued slug to its provider and pool', () => {
  assert.strictEqual(idx.size, 14);
  assert.deepStrictEqual(idx.get('openai/gpt-5.6-terra'), { provider: 'openai', pool: 'chatgpt' });
  assert.deepStrictEqual(idx.get('gemini-3.1-pro-high'), { provider: 'antigravity', pool: 'google-one' });
});

t('THE BUG: a namespaced openai slug routes to codex, not opencode', () => {
  const r = M.resolveCli('openai/gpt-5.6-terra', idx);
  assert.strictEqual(r.cli, 'codex', 'must not fall through to opencode');
  assert.strictEqual(r.source, 'catalog');
});

t('…and codex is handed the BARE model name, which is what it accepts', () => {
  assert.strictEqual(M.resolveCli('openai/gpt-5.6-terra', idx).modelArg, 'gpt-5.6-terra');
});

t('the bare spelling still resolves to codex (no regression)', () => {
  assert.strictEqual(M.resolveCli('gpt-5.6-terra', idx).cli, 'codex');
});

t('antigravity-served models route to agy even when Anthropic-branded', () => {
  // claude-opus-4-6-thinking is billed on google-one, not claude-pro. Reading
  // the name alone gets this wrong in the other direction.
  const r = M.resolveCli('claude-opus-4-6-thinking', idx);
  assert.strictEqual(r.cli, 'agy');
  assert.strictEqual(r.pool, 'google-one');
});

t('opencode-served models keep their namespaced slug', () => {
  const r = M.resolveCli('opencode-go/deepseek-v4-pro', idx);
  assert.strictEqual(r.cli, 'opencode');
  assert.strictEqual(r.modelArg, 'opencode-go/deepseek-v4-pro');
});

t('sentinels resolve without a catalog entry', () => {
  assert.strictEqual(M.resolveCli('Claude (auto)', idx).cli, 'in-session');
  assert.strictEqual(M.resolveCli('Codex (auto)', idx).cli, 'codex');
  assert.strictEqual(M.resolveCli('Antigravity (auto)', idx).cli, 'agy');
});

t('an uncatalogued slug falls back to the heuristic and says so', () => {
  const r = M.resolveCli('some/unknown-model', idx);
  assert.strictEqual(r.cli, 'opencode');
  assert.strictEqual(r.source, 'heuristic', 'source must be attributable');
});

t('dispatchFor() emits a codex line for a namespaced openai model', () => {
  const line = M.dispatchFor('openai/gpt-5.6-terra', '<p>', idx);
  assert.ok(/codex exec -m gpt-5\.6-terra/.test(line), 'got: ' + line);
  assert.ok(!/opencode run/.test(line), 'must not emit an opencode line');
});

t('laneOf() reports the catalog lane', () => {
  assert.strictEqual(M.laneOf('openai/gpt-5.6-terra', idx), 'codex');
  assert.strictEqual(M.laneOf('gemini-3.1-pro-high', idx), 'agy');
});

// ── the wave dispatcher must agree with the picker ───────────────────────────
t('wave_router.cliForHeuristic() still shows the OLD behaviour', () => {
  // Kept as the fallback, and pinned here so the fix is visibly a fix.
  assert.strictEqual(R.cliForHeuristic('openai/gpt-5.6-terra').bin, 'opencode');
});

t('PROVIDER_CLI is ONE object, shared — not two that must be kept in step', () => {
  // Previously duplicated in model.js and wave_router.js with a parity test
  // guarding the drift. bin/cli_registry.js removed the second copy, so this
  // now asserts identity, not equality.
  const REG = require('../bin/cli_registry.js');
  assert.strictEqual(M.PROVIDER_CLI, REG.PROVIDER_CLI);
  assert.strictEqual(R.PROVIDER_CLI, REG.PROVIDER_CLI);
});


// ── every provider in the catalog, not just the one that was reported ───────
t('EVERY provider maps to a CLI that is not silently opencode-by-accident', () => {
  // The original defect was reported for openai only. It was never
  // openai-specific: anthropic/* answered fine under `claude -p --model …`
  // while the probe called them "Insufficient balance" through opencode.
  const expected = {
    'anthropic/claude-opus-5': ['claude', 'claude-opus-5'],
    'anthropic/claude-haiku-4-5-20251001': ['claude', 'claude-haiku-4-5-20251001'],
    'openai/gpt-5.6-terra': ['codex', 'gpt-5.6-terra'],
    'gemini-3.1-pro-high': ['agy', 'gemini-3.1-pro-high'],
    'github-copilot/auto': ['copilot', null],
    'openrouter/openai/gpt-4o': ['opencode', 'openrouter/openai/gpt-4o'],
    'opencode-go/deepseek-v4-pro': ['opencode', 'opencode-go/deepseek-v4-pro'],
    'opencode/gemini-3.1-pro': ['opencode', 'opencode/gemini-3.1-pro'],
  };
  for (const [slug, [cli, arg]] of Object.entries(expected)) {
    const r = M.resolveCli(slug, idx);
    assert.strictEqual(r.cli, cli, slug + ' → expected ' + cli + ', got ' + r.cli);
    if (arg !== null) assert.strictEqual(r.modelArg, arg, slug + ' modelArg');
  }
});

t('only opencode keeps the namespace; every native CLI gets the bare name', () => {
  const REG = require('../bin/cli_registry.js');
  for (const cli of REG.BARE_MODEL_CLIS) {
    assert.ok(cli !== 'opencode', 'opencode must NOT be in BARE_MODEL_CLIS');
  }
  assert.ok(REG.BARE_MODEL_CLIS.has('claude'));
  assert.ok(REG.BARE_MODEL_CLIS.has('codex'));
});

t('every provider in PROVIDER_CLI has a CLI_SPEC that can build an argv', () => {
  const REG = require('../bin/cli_registry.js');
  for (const [provider, cli] of Object.entries(REG.PROVIDER_CLI)) {
    const spec = REG.CLI_SPEC[cli];
    assert.ok(spec, provider + ' → ' + cli + ' has no CLI_SPEC');
    const argv = spec.argv('some-model', 'hi. how are you?');
    assert.ok(Array.isArray(argv) && argv.length, cli + ' produced no argv');
    assert.strictEqual(argv[argv.length - 1], 'hi. how are you?', cli + ' must end with the prompt');
  }
});

t("agy's -p is the LAST flag before the prompt (Go flag package trap)", () => {
  const REG = require('../bin/cli_registry.js');
  const argv = REG.CLI_SPEC.agy.argv('gemini-3.1-pro-high', 'hi. how are you?');
  assert.strictEqual(argv[argv.length - 2], '-p', 'agy: -p must immediately precede the prompt');
});

t('sandbox argv omits permission and sandbox bypass flags', () => {
  const REG = require('../bin/cli_registry.js');
  const cases = [
    REG.CLI_SPEC.codex.argv('gpt-5.6-terra', null, { sandbox: true }),
    REG.CLI_SPEC.grok.argv('grok-4.6', null, { sandbox: true }),
    REG.CLI_SPEC.agy.argv('gemini-3.1-pro-high', null, { sandbox: true }),
    REG.CLI_SPEC.opencode.argv('opencode-go/deepseek-v4-pro', null, { sandbox: true }),
    REG.CLI_SPEC.copilot.argv('github-copilot/auto', null, { sandbox: true }),
  ];
  for (const argv of cases) {
    const line = argv.join(' ');
    assert.ok(!/dangerously|bypassPermissions|--allow-all/.test(line), 'sandbox leaked a bypass flag: ' + line);
  }
});

t('the wave dispatcher resolves identically to the picker', () => {
  // The whole point of bin/cli_registry.js: one table, two consumers. If these
  // ever diverge a model is probed through one CLI and dispatched through
  // another, which is invisible until a wave fails.
  for (const slug of ['anthropic/claude-opus-5', 'openai/gpt-5.6-terra', 'gemini-3.1-pro-high', 'github-copilot/auto']) {
    const picker = M.resolveCli(slug, idx).cli;
    const waveBin = R.cliFor(slug).bin;
    assert.strictEqual(waveBin, picker, slug + ': picker=' + picker + ' wave=' + waveBin);
  }
});

console.log(pass + ' passed, 0 failed');

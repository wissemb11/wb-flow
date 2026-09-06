'use strict';
/**
 * test/model_chain.js — `-M` / role flags accept a `||` fallback chain (task 18).
 *
 * Before this landed, `wave.js` read `-M=` as one opaque string
 * (`arg.slice(3).trim()`), so `-M="a||b||c"` looked for a model literally named
 * `a||b||c`, and the delegate branches in `route()` set `model` without `chain`
 * — leaving every operator-delegated dispatch with no fallback while the
 * roster-routed cells beside it had one, and while
 * `concepts/model-fallback-chains.md` documented the opposite.
 *
 * The two properties that matter and are easy to regress:
 *   1. a chain really becomes N attempts in the generated script;
 *   2. a SINGLE model behaves exactly as before — one attempt, no loop.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const W = require('../bin/wave.js');
const R = require('../bin/wave_router.js');
const M = require('../bin/model.js');

let pass = 0;
function t(name, fn) { fn(); pass++; console.log('  ✓ ' + name); }

console.log('🧪 -M fallback chains');

t('splitModelChain splits, trims and de-duplicates, preserving order', function () {
  assert.deepStrictEqual(W.splitModelChain('a/b||c/d'), ['a/b', 'c/d']);
  assert.deepStrictEqual(W.splitModelChain(' a/b ||  c/d '), ['a/b', 'c/d']);
  assert.deepStrictEqual(W.splitModelChain('a/b||a/b||c/d'), ['a/b', 'c/d']);
  assert.deepStrictEqual(W.splitModelChain(''), []);
  assert.deepStrictEqual(W.splitModelChain(undefined), []);
});

t('a single model still yields a one-entry chain (no behaviour change)', function () {
  assert.deepStrictEqual(W.splitModelChain('openai/gpt-5.5'), ['openai/gpt-5.5']);
});

t('route() carries the operator chain, not just its head', function () {
  const cell = { role: 'worker', command: '/wbWork p.md --id=1' };
  const chain = ['openai/gpt-5.5', 'anthropic/claude-fable-5', 'xai/grok-4.5'];
  const r = R.route(cell, {}, {}, {}, chain[0], {}, chain);
  assert.strictEqual(r.model, chain[0], 'head must remain the first model');
  assert.deepStrictEqual(r.chain, chain, 'the whole chain must survive routing');
  assert.ok(/operator chain, 3 deep/.test(r.reason), 'reason must say the chain is 3 deep');
});

t('route() with one model yields a one-entry chain and no "N deep" note', function () {
  const cell = { role: 'worker', command: '/wbWork p.md --id=1' };
  const r = R.route(cell, {}, {}, {}, 'openai/gpt-5.5', {}, ['openai/gpt-5.5']);
  assert.deepStrictEqual(r.chain, ['openai/gpt-5.5']);
  assert.ok(!/deep/.test(r.reason));
});

t('a cell-level -M="a||b" is split too', function () {
  const cell = { role: 'worker', command: '/wbWork p.md --id=1 -M="openai/gpt-5.5||xai/grok-4.5"' };
  const r = R.route(cell, {}, {}, {}, '', {});
  assert.deepStrictEqual(r.chain, ['openai/gpt-5.5', 'xai/grok-4.5']);
});

console.log('  ' + pass + ' passed');

// ── parseHeaderRoster accepts the relocated block (task 19 regression) ──────
t('parseHeaderRoster reads the roster from its own SECTION, not only the callout', function () {
  const heading = [
    '## 🎛️ Active Model Roster',
    '',
    '> Prose that is not a role line.',
    '>',
    '> 🧠 **Planner:** `a/1 || b/2`',
    '> ✅ **Validator:** `c/3 || d/4`',
    '> 🔨 **Worker:** `e/5 || f/6`',
    '> 📋 **Mechanical:** `g/7 || h/8`',
    '',
    '> ⚠️ A callout after a BLANK line — the old parser stopped here and returned null.',
    '',
    '---',
    '',
    '## 📊 Task Table',
  ].join('\n');
  const r = W.parseHeaderRoster(heading);
  assert.ok(r, 'heading form must parse');
  assert.deepStrictEqual(r.planner, ['a/1', 'b/2']);
  assert.deepStrictEqual(r.mechanical, ['g/7', 'h/8'], 'a blank line must not truncate the block');
});

t('the legacy callout form still parses', function () {
  const legacy = [
    '> **Active Model Roster for this Plan:**',
    '> 🧠 **Planner:** `a/1`',
    '> ✅ **Validator:** `c/3`',
    '> 🔨 **Worker:** `e/5`',
    '> 📋 **Mechanical:** `g/7`',
  ].join('\n');
  const r = W.parseHeaderRoster(legacy);
  assert.ok(r, 'legacy form must keep working');
  assert.deepStrictEqual(r.worker, ['e/5']);
});

// ── the emitted shell form is comma-separated and unquoted ─────────────────
t('splitModelChain accepts commas as well as ||, so --set grammar round-trips', function () {
  assert.deepStrictEqual(W.splitModelChain('a/1,b/2,c/3'), ['a/1', 'b/2', 'c/3']);
  assert.deepStrictEqual(W.splitModelChain('a/1 , b/2 || c/3'), ['a/1', 'b/2', 'c/3']);
});

t('a cell writing -M=$ROLE is a role reference, not a per-cell override', function () {
  const cell = { role: 'worker', command: '/wbWork p.md --id=1 -M=$WORKER' };
  const r = R.route(cell, {}, { worker: 'x/1', chains: { worker: ['x/1', 'y/2'] } }, {}, '', {});
  assert.ok(!/explicitly delegated/.test(r.reason),
    'a $ROLE reference must not take the delegate branch: ' + r.reason);
});

// ── provider-independent validation (task 25) ─────────────────────────────
t('crossProviderPick skips the executor provider when a validator-chain alternative exists', function () {
  const chain = ['xai/grok-4.5', 'openai/gpt-5.6-terra', 'anthropic/claude-sonnet-5'];
  assert.strictEqual(R.crossProviderPick(chain, 'anthropic/claude-opus-5').model, 'xai/grok-4.5');
  assert.strictEqual(R.crossProviderPick(chain, 'xai/grok-4.6').model, 'openai/gpt-5.6-terra');
});

t('poolOf maps every catalog provider prefix to its real pool, not a phantom', function () {
  // `openai/*` is served by the ChatGPT/Codex subscription — the catalog's own
  // `openai` provider carries pool "chatgpt". A prefix that falls through to
  // `return prefix` mints a pool no catalog entry uses.
  assert.strictEqual(M.poolOf('openai/gpt-5.6-terra'), 'chatgpt');
  assert.strictEqual(M.poolOf('openai/gpt-5.5'), M.poolOf('Codex (auto)'));
});

t('poolOf reads provider pools from the catalog before prefix fallback', function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-models-'));
  const file = path.join(dir, 'models.json');
  const oldFile = process.env.WB_MODELS_FILE;
  fs.writeFileSync(file, JSON.stringify({
    providers: [
      { provider: 'bedrock', pool: 'aws-bedrock-seat', models: ['bedrock/claude-opus'] },
      { provider: 'acme', pool: 'shared-acme-seat', models: [] },
    ],
  }, null, 2));
  process.env.WB_MODELS_FILE = file;
  try {
    assert.strictEqual(M.poolOf('bedrock/claude-opus'), 'aws-bedrock-seat');
    assert.strictEqual(M.poolOf('acme/unknown-model'), 'shared-acme-seat');
  } finally {
    if (oldFile === undefined) delete process.env.WB_MODELS_FILE;
    else process.env.WB_MODELS_FILE = oldFile;
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* best effort */ }
  }
});

t('poolOf does not mint a phantom pool for an uncatalogued provider prefix', function () {
  assert.strictEqual(M.poolOf('bedrock/claude-opus'), 'unknown');
});

t('crossProviderPick refuses a same-subscription validator across slug forms', function () {
  // Regression: `openai/gpt-5.5` vs `Codex (auto)` is ONE ChatGPT subscription.
  // While poolOf() returned the phantom `openai`, this scored as independent.
  const picked = R.crossProviderPick(['Codex (auto)', 'anthropic/claude-sonnet-5'], 'openai/gpt-5.5');
  assert.strictEqual(picked.model, 'anthropic/claude-sonnet-5');
  assert.strictEqual(picked.forced, false);
});

t('crossProviderPick visibly flags an obliged same-provider fallback', function () {
  const picked = R.crossProviderPick(['anthropic/claude-sonnet-5'], 'anthropic/claude-opus-5');
  assert.strictEqual(picked.model, 'anthropic/claude-sonnet-5');
  assert.strictEqual(picked.forced, true);
});

t('sameProviderWarning is exported and detects operator -M sharing the executor pool', function () {
  assert.strictEqual(typeof R.sameProviderWarning, 'function');
  const warning = R.sameProviderWarning(['openai/gpt-5.6-terra'], ['7'], {
    '7': '✅<br>openai/gpt-5.5',
  });
  assert.ok(/same-provider validation/.test(warning), warning);
  assert.ok(/chatgpt/.test(warning), warning);
  assert.ok(/id\(s\) 7/.test(warning), warning);

  const independent = R.sameProviderWarning(['anthropic/claude-sonnet-5'], ['7'], {
    '7': '✅<br>openai/gpt-5.5',
  });
  assert.strictEqual(independent, '');
});

t('route() warns when a validator operator -M head shares the done executor pool', function () {
  const cell = {
    role: 'validator',
    command: '/wbValid p.md --id=7 -M="openai/gpt-5.6-terra||anthropic/claude-sonnet-5"',
    pairsIds: ['7'],
  };
  const r = R.route(cell, {}, {}, { '7': '✅<br>openai/gpt-5.5' }, '', {});
  assert.deepStrictEqual(r.chain, ['openai/gpt-5.6-terra', 'anthropic/claude-sonnet-5']);
  assert.ok(/explicitly delegated by the operator/.test(r.reason), r.reason);
  assert.ok(/same-provider validation/.test(r.reason), r.reason);
  assert.ok(/chatgpt/.test(r.reason), r.reason);
});

console.log('  ' + pass + ' passed (incl. roster relocation + comma form)');

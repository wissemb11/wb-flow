'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const P = require('../bin/wave_parser.js');
const R = require('../bin/wave_router.js');

let pass = 0;
function t(name, fn) { fn(); pass++; console.log('  ✓ ' + name); }
console.log('🧪 roster freshness -> newest wins');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'wbroster-'));
const REAL_HOME = process.env.HOME;
process.env.HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'wbhome-'));

function roster(models) {
  return ['## User Models (Active Contractual Reference)', '',
    '| Role | Active Selected Models (1st / 2nd / 3rd) | Lane |', '|---|---|---|',
    '| 🧠 **Planner** | ' + models.map((m) => '**' + m + '**').join(' / ') + ' | x |',
    '| ✅ **Validator** | ' + models.map((m) => '**' + m + '**').join(' / ') + ' | x |',
    '| 🔨 **Worker** | ' + models.map((m) => '**' + m + '**').join(' / ') + ' | x |',
    '| 📋 **Mechanical** | ' + models.map((m) => '**' + m + '**').join(' / ') + ' | x |', ''].join('\n');
}

function write(root, rel, models, mtime) {
  const f = path.join(root, rel, 'model_recommendations.md');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, roster(models));
  fs.utimesSync(f, mtime, mtime);
  return f;
}

const pkgRoot = path.join(TMP, 'pkg');
const repoRoot = path.join(TMP, 'repo');
const OLD = new Date('2026-08-02T12:00:00Z') / 1000;
const NEW = new Date('2026-08-13T12:00:00Z') / 1000;

write(pkgRoot, '.wb/commands', ['opencode-go/kimi-k3', 'gpt-5.6-terra'], OLD);
write(repoRoot, '.wb/commands', ['Codex (auto)', 'gemini-3.1-pro-high', 'gemini-3.6-flash-high'], NEW);

t('within one root, .wb/commands/ outranks the shipped templates/ seed', () => {
  const r2 = path.join(TMP, 'r2');
  write(r2, 'templates/commands', ['SEED-MUST-NOT-WIN'], NEW);
  const f = write(r2, '.wb/commands', ['opencode-go/kimi-k3', 'x', 'y'], OLD);
  const got = P.parseModelRecommendations(f);
  assert.strictEqual(got.planner[0], 'opencode-go/kimi-k3');
});

t('across roots, the FRESHEST roster wins — not the nearest', () => {
  const { models } = R.resolveModelsFromRoster('# a plan with no header roster', repoRoot, {}, {}, pkgRoot);
  const chain = R.chainFor(models, 'planner').map((m) => m || 'Claude (auto)');
  assert.strictEqual(chain[0], 'Codex (auto)',
    'the newer repo roster must win even when a nearer package roster exists');
});

t('every role resolves from the same file', () => {
  const { models } = R.resolveModelsFromRoster('# no header', repoRoot, {}, {}, pkgRoot);
  for (const role of ['planner', 'selfValidator', 'worker', 'mechanical']) {
    assert.strictEqual(R.chainFor(models, role).map((m) => m || 'Claude (auto)')[0], 'Codex (auto)');
  }
});

t('a plan-header roster still overrides the file', () => {
  const plan = ['> **Active Model Roster for this Plan:**',
    '> 🧠 **Planner:** `gemini-3.1-pro-high`', '> ✅ **Validator:** `gemini-3.1-pro-high`',
    '> 🔨 **Worker:** `gemini-3.1-pro-high`', '> 📋 **Mechanical:** `gemini-3.6-flash-high`', ''].join('\n');
  const { models } = R.resolveModelsFromRoster(plan, repoRoot, {}, {}, pkgRoot);
  assert.strictEqual(R.chainFor(models, 'worker')[0], 'gemini-3.1-pro-high');
});

fs.rmSync(process.env.HOME, { recursive: true, force: true });
process.env.HOME = REAL_HOME;
fs.rmSync(TMP, { recursive: true, force: true });
console.log(pass + ' passed, 0 failed');

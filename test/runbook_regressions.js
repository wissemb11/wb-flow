'use strict';

const assert = require('assert');
const NX = require('../bin/next.js');

let pass = 0;
function t(name, fn) {
  fn();
  pass++;
  console.log('  ✓ ' + name);
}

console.log('🧪 next.js run-book regressions');

const plan = [
  '# Plan Backlog: runbook — 2026-08-18',
  '',
  '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  '| 1 | 🔨 Worker | — | 📄 | first | `true` | P1 | 5 | x | y | ✅<br>Qwen | ⬜ |',
  '| 2 | 🔨 Worker | — | 📄 | second | `true` | P1 | 5 | x | y | ✅<br>Qwen | ⬜ |',
  '',
  '## 🌊 Next Executable Sequence',
  '',
  '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
  '|---|---|---|---|---|',
  '| **A · ✅ validate** | — | `/wbValid runbook.md --id=1`<br>→ *opencode-go/kimi-k2.7-code*<br><br>`/wbValid runbook.md --id=2`<br>→ *Claude (auto)* | — | — |',
].join('\n');

const waves = NX.inventory(plan, process.cwd(), 'runbook.md');
const rendered = NX.render('runbook.md', waves, [], {});

t('does not merge validation ids whose approved models differ', () => {
  assert.ok(!rendered.includes('/wbValid $P --id=1,2'), rendered);
  assert.ok(rendered.includes('/wbValid $P --id=1 -M="opencode-go/kimi-k2.7-code"'), rendered);
  assert.ok(rendered.includes('/wbValid $P --id=2   # in-session (Claude — no delegation)'), rendered);
});

t('quotes wave labels containing whitespace as one shell argument', () => {
  assert.strictEqual(NX.waveFlag('⏸️ blocked'), "--wave=⏸️$'\\x20'blocked");
  const withBlocked = NX.render(
    'runbook.md',
    [{ label: '⏸️ blocked', cells: 1, spawned: 0, minutes: 0, routed: [], workIds: [], heldParsed: [] }],
    [],
    {}
  );
  assert.ok(withBlocked.includes("/wbWork $P --wave=⏸️$'\\x20'blocked -y"), withBlocked);
  assert.ok(!withBlocked.includes('/wbWork $P --wave=⏸️ blocked -y'), withBlocked);
});

const runbookPath = require('path').join(__dirname, '../_deploy_/publish_runbook.md');
const fs = require('fs');

t('publish runbook copies dotfiles using core/. instead of core/*', () => {
  const runbook = fs.readFileSync(runbookPath, 'utf8');
  // cp -r blah/next/core/.
  const dotglobRegex = new RegExp('cp -r .*next/core/\\.');
  assert.ok(
    dotglobRegex.test(runbook),
    'Runbook must use next/core/. to include dotfiles like .github'
  );
  assert.ok(
    !/cp -r .*next\/core\/\*/.test(runbook),
    'Runbook must not use next/core/* which misses dotfiles'
  );
});



const WV = require('../bin/wave.js');

t('T1: wave generator emits --command only for opencode, not claude/grok', () => {
  function gen(model) {
    return WV.buildScript({
      planPath: 'dummy_plan.md', wave: 'A',
      cells: [{
        role: 'validator', wave: 'A', command: '/wbValid dummy_plan.md --id=1',
        suggestedModel: '', pairsWave: 'A', pairsIds: ['1'], held: false
      }],
      dispatchIndex: {},
      doneColumn: { '1': '✅<br>Claude Opus 5' },
      models: Object.assign({}, WV.DEFAULT_MODELS, { selfValidator: model }),
      jobs: 0, repoRoot: process.cwd()
    }).script;
  }

  const claude = gen('anthropic/claude-opus-5');
  const grok = gen('xai/grok-4.6');
  const opencode = gen('opencode/deepseek-v4-pro');

  assert.ok(!claude.includes('--command'), 'claude script must have zero --command');
  assert.ok(claude.includes('/wbValid dummy_plan.md --id=1'), 'claude script must contain /wbValid');

  assert.ok(!grok.includes('--command'), 'grok script must have zero --command');
  assert.ok(grok.includes('/wbValid dummy_plan.md --id=1'), 'grok script must contain /wbValid');

  assert.ok(opencode.includes('--command'), 'opencode script must STILL contain --command');

  // Guard for T2 / grok argv
  const r = require('../bin/wave_router.js');
  const grokCli = r.cliFor('xai/grok-4.6');
  assert.ok(grokCli.argv.includes('-p'), 'grok argv must still contain -p');
});

console.log(pass + ' passed, 0 failed');

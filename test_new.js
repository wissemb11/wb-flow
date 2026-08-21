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

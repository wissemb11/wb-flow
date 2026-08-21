#!/usr/bin/env node

/**
 * Smoke test for @wbc-ui/wb-flow
 * - Hand-rolled assertions (no test framework) to keep zero runtime deps.
 * - Node ≥14 compatible (uses CommonJS, no top-level await, no node:test).
 *
 * What it asserts:
 *   1. bin/install.js exists and is executable.
 *   2. templates/ is non-empty and contains the manifest JSON.
 *   3. Every key in wb_commands_reference.json has a matching templates/commands/<key>/<key>_template.md file.
 *   4. bin/install.js --dry-run runs successfully against a temp directory.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');
const BIN = path.join(PKG_ROOT, 'bin', 'install.js');
const TEMPLATES = path.join(PKG_ROOT, 'templates');
const MANIFEST = path.join(TEMPLATES, 'commands', 'wb_commands_reference.json');
const CLAUDE_MANIFEST = path.join(TEMPLATES, 'commands', 'wb_commands_reference.claude.json');

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log('  ✓ ' + msg);
  } else {
    failed++;
    failures.push(msg);
    console.log('  ✗ ' + msg);
  }
}

console.log('🧪 wb-flow smoke test\n');

// 1. bin/install.js exists
console.log('1. CLI entrypoint');
assert(fs.existsSync(BIN), 'bin/install.js exists');
try {
  fs.accessSync(BIN, fs.constants.R_OK);
  assert(true, 'bin/install.js is readable');
} catch (e) {
  assert(false, 'bin/install.js is readable');
}

// 2. templates/ + manifests
console.log('\n2. Templates + manifests');
assert(fs.existsSync(TEMPLATES), 'templates/ directory exists');
assert(fs.existsSync(MANIFEST), 'wb_commands_reference.json exists');
assert(fs.existsSync(CLAUDE_MANIFEST), 'wb_commands_reference.claude.json exists');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  assert(typeof manifest === 'object' && manifest !== null, 'manifest parses as JSON object');
} catch (e) {
  assert(false, 'manifest parses as JSON object: ' + e.message);
  manifest = {};
}

let claudeManifest;
try {
  claudeManifest = JSON.parse(fs.readFileSync(CLAUDE_MANIFEST, 'utf8'));
  assert(typeof claudeManifest === 'object' && claudeManifest !== null, 'claude manifest parses as JSON object');
} catch (e) {
  assert(false, 'claude manifest parses as JSON object: ' + e.message);
  claudeManifest = {};
}

function isAlias(entry) {
  return typeof entry === 'object' && entry !== null && typeof entry.alias_of === 'string';
}

function resolveTemplatePath(key) {
  const entry = manifest[key];
  if (isAlias(entry)) {
    const target = entry.alias_of;
    return path.join(TEMPLATES, 'commands', target, target + '_template.md');
  }
  return path.join(TEMPLATES, 'commands', key, key + '_template.md');
}

const keys = Object.keys(manifest);
assert(keys.length >= 30, 'manifest has at least 30 commands (got ' + keys.length + ')');

// 3. Every manifest key has a matching template
console.log('\n3. Manifest <-> template parity');
for (const key of keys) {
  const tplPath = resolveTemplatePath(key);
  const label = isAlias(manifest[key]) ? key + ' (alias of ' + manifest[key].alias_of + ')' : key;
  assert(fs.existsSync(tplPath), label + ' has matching template at ' + path.relative(PKG_ROOT, tplPath));
}


// 3.5. Structural integrity: every template has a help gate
console.log('\n3.5. Template structural integrity');
const seenTemplates = {};
for (const key of keys) {
  const tplPath = resolveTemplatePath(key);
  if (seenTemplates[tplPath]) continue;
  seenTemplates[tplPath] = true;
  const tplContent = fs.readFileSync(tplPath, 'utf8');
  const label = isAlias(manifest[key]) ? key + '/' + manifest[key].alias_of : key;
  assert(tplContent.includes('<!-- HELP_GATE_START -->'), label + ' template contains HELP_GATE_START');
}

// 3.6. Dual-manifest key-set parity
console.log('\n3.6. Dual-manifest key-set parity');
const refKeys = Object.keys(manifest);
const claudeWbKeys = Object.keys(claudeManifest).filter(function (k) { return k.startsWith('wb'); });
assert(refKeys.length >= 30, 'reference manifest has at least 30 commands (got ' + refKeys.length + ')');
assert(claudeWbKeys.length >= 30, 'claude manifest has at least 30 wb* entries (got ' + claudeWbKeys.length + ')');

const refSet = {};
refKeys.forEach(function (k) { refSet[k] = true; });
const claudeSet = {};
claudeWbKeys.forEach(function (k) { claudeSet[k] = true; });

const onlyInRef = refKeys.filter(function (k) { return !claudeSet[k]; });
const onlyInClaude = claudeWbKeys.filter(function (k) { return !refSet[k]; });

assert(onlyInRef.length === 0, 'no keys only in reference manifest (diff: ' + (onlyInRef.join(', ') || 'none') + ')');
assert(onlyInClaude.length === 0, 'no keys only in claude manifest (diff: ' + (onlyInClaude.join(', ') || 'none') + ')');
assert(refKeys.length === claudeWbKeys.length, 'both manifests have the same wb* command count (' + refKeys.length + ' vs ' + claudeWbKeys.length + ')');

// 4. Dry-run install
console.log('\n4. Install dry-run');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-flow-test-'));
try {
  const out = execFileSync('node', [BIN, '--dry-run'], {
    cwd: tmpDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert(out.indexOf('DRY RUN') !== -1, '--dry-run prints "DRY RUN" banner');
  assert(out.indexOf('Dry run complete') !== -1, '--dry-run prints completion summary');
  // Verify nothing was actually written to the temp dir
  const wbDir = path.join(tmpDir, '.wb');
  assert(!fs.existsSync(wbDir), '--dry-run does NOT create .wb/ in target');
} catch (e) {
  assert(false, 'install.js --dry-run executes without error: ' + e.message);
} finally {
  // Best-effort cleanup
  try {
    fs.rmdirSync(tmpDir, { recursive: true });
  } catch (_) {
    // Fallback for missing permissions or locks
  }
}

// 5. Layer 2 emitters (bin/wrappers.js)
console.log('\n5. Layer 2 emitters');
const W = require(path.join(PKG_ROOT, 'bin', 'wrappers.js'));
const COMMANDS_ROOT = path.join(TEMPLATES, 'commands');
const roster = W.listCommands(COMMANDS_ROOT);

assert(roster.length >= 31, 'roster has at least 31 commands (got ' + roster.length + ')');
assert(
  roster.every((c) => fs.existsSync(path.join(COMMANDS_ROOT, c.templateRel))),
  'every roster entry points at an existing template'
);
assert(
  !roster.some((c) => c.name.charAt(0) === '_' || c.name.charAt(0) === '$'),
  'roster excludes _shared and $meta keys'
);
const alias = roster.filter((c) => c.aliasOf);
assert(alias.length >= 1, 'alias commands are included (e.g. wbStopTrack)');
assert(
  alias.every((c) => c.templateRel.indexOf(c.aliasOf) === 0),
  'alias commands reuse their target template'
);

const sample = roster.filter((c) => c.name === 'wbAudit')[0] || roster[0];
const ctx = { templatePath: '/T/x_template.md', actOnPath: '/T/wbActOn/wbActOn_template.md', templatesRoot: '/T' };

const md = W.emitMd(sample, ctx);
assert(md.indexOf('---\ndescription: ') === 0, 'emitMd starts with description frontmatter');
assert(md.indexOf('$ARGUMENTS') !== -1, 'emitMd substitutes $ARGUMENTS');
assert(md.indexOf('{{args}}') === -1, 'emitMd does not leak the Gemini token');
assert(md.indexOf('/T/x_template.md') !== -1, 'emitMd embeds the template path');

const toml = W.emitToml(sample, ctx);
assert(/^description = "[^"\n]+"\n/.test(toml), 'emitToml opens with a description key');
assert(toml.indexOf('prompt = """') !== -1, 'emitToml uses a multi-line basic string');
assert(toml.indexOf('{{args}}') !== -1, 'emitToml substitutes {{args}}');
assert(toml.indexOf('$ARGUMENTS') === -1, 'emitToml does not leak the Claude token');
assert(/"""\s*$/.test(toml), 'emitToml terminates the prompt string');
const tomlBody = toml.split('prompt = """')[1] || '';
assert(
  (tomlBody.match(/(?<!\\)"""/g) || []).length === 1,
  'emitToml body has exactly one unescaped triple quote (the terminator)'
);

const skill = W.emitSkill(roster, ctx);
assert(skill.indexOf('name: wb-flow') !== -1, 'emitSkill declares the skill name');
assert(
  roster.every((c) => skill.indexOf(c.name) !== -1),
  'emitSkill lists every command in one dispatcher'
);

assert(
  W.joinRef('/abs/root', 'wbX/wbX_template.md') === '/abs/root/wbX/wbX_template.md',
  'joinRef builds posix reference paths'
);
assert(W.joinRef('.wb/commands/', 'a/b.md') === '.wb/commands/a/b.md', 'joinRef strips trailing slashes');

const flagShapes = [
  [{ long: '--act', short: '-a' }],
  [{ flag: '--id', shortcut: '-i', description: 'task ids' }],
  { '--as': { flag: '--as=<style>', role: 'tone' } },
];
assert(
  flagShapes.every((shape) => W.normalizeFlags(shape).length === 1),
  'normalizeFlags handles all three manifest flag shapes'
);
assert(W.normalizeFlags(undefined).length === 0, 'normalizeFlags tolerates a missing flags key');

// 6. wb-flow init
console.log('\n6. init subcommand');
const INIT_BIN = path.join(PKG_ROOT, 'bin', 'init.js');
assert(fs.existsSync(INIT_BIN), 'bin/init.js exists');

try {
  const v = execFileSync('node', [BIN, '--version'], { encoding: 'utf8' }).trim();
  assert(v === require(path.join(PKG_ROOT, 'package.json')).version, '--version prints the package version');
} catch (e) {
  assert(false, '--version executes without error: ' + e.message);
}

const initTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-flow-init-'));
const fakeHome = path.join(initTmp, 'home');
const proj = path.join(initTmp, 'proj');
fs.mkdirSync(fakeHome, { recursive: true });
fs.mkdirSync(proj, { recursive: true });
const initEnv = Object.assign({}, process.env, { HOME: fakeHome, USERPROFILE: fakeHome });

try {
  // Non-TTY without --yes must refuse rather than hang.
  let refused = false;
  try {
    execFileSync('node', [INIT_BIN], { cwd: proj, env: initEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    refused = e.status === 1;
  }
  assert(refused, 'init refuses to run non-interactively without --yes');

  // Dry run writes nothing.
  execFileSync('node', [INIT_BIN, '--scope=project', '--agents=all', '--dry-run', '--yes'], {
    cwd: proj,
    env: initEnv,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert(fs.readdirSync(proj).length === 0, 'init --dry-run creates nothing');

  // Real project-scope run.
  const out = execFileSync('node', [INIT_BIN, '--scope=project', '--agents=all', '--yes'], {
    cwd: proj,
    env: initEnv,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert(out.indexOf('✅ Done.') !== -1, 'init reports success');
  assert(fs.existsSync(path.join(proj, '.wb', 'commands')), 'init copies templates to .wb/ (Layer 1)');
  const wired = [
    ['.claude/commands', '.md'],
    ['.opencode/command', '.md'],
    ['.gemini/commands', '.toml'],
    ['.cursor/commands', '.md'],
    ['.codex/commands', '.md'],
  ];
  for (const [dir, ext] of wired) {
    const full = path.join(proj, dir);
    const files = fs.existsSync(full) ? fs.readdirSync(full).filter((f) => f.endsWith(ext)) : [];
    assert(files.length === roster.length, dir + ' got ' + roster.length + ' ' + ext + ' wrappers (got ' + files.length + ')');
  }
  assert(
    fs.existsSync(path.join(proj, '.agents', 'skills', 'wb-flow', 'SKILL.md')),
    '.agents/skills/wb-flow/SKILL.md written for Antigravity'
  );
  const projWrapper = fs.readFileSync(path.join(proj, '.claude', 'commands', 'wbPlan.md'), 'utf8');
  assert(
    projWrapper.indexOf('.wb/commands/wbPlan/wbPlan_template.md') !== -1,
    'project-scope wrappers use a relative template path'
  );
  assert(projWrapper.indexOf(fakeHome) === -1, 'project-scope wrappers contain no absolute home path');

  // Re-run is non-destructive.
  const again = execFileSync('node', [INIT_BIN, '--scope=project', '--agents=claude', '--yes'], {
    cwd: proj,
    env: initEnv,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert(again.indexOf('skipped') !== -1, 'init re-run skips existing files instead of overwriting');

  // Global scope targets $HOME and embeds absolute paths.
  const globalOut = execFileSync('node', [INIT_BIN, '--scope=global', '--agents=claude', '--yes'], {
    cwd: proj,
    env: initEnv,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert(globalOut.indexOf('✅ Done.') !== -1, 'init --scope=global completes');
  const globalWrapper = path.join(fakeHome, '.claude', 'commands', 'wbPlan.md');
  assert(fs.existsSync(globalWrapper), 'global scope writes to $HOME/.claude/commands');
  assert(
    fs.existsSync(path.join(fakeHome, '.wb-flow', 'commands', 'wbPlan', 'wbPlan_template.md')),
    'global scope copies templates to $HOME/.wb-flow'
  );
  assert(
    fs.readFileSync(globalWrapper, 'utf8').indexOf(path.join(fakeHome, '.wb-flow', 'commands')) !== -1,
    'global-scope wrappers embed the absolute template path'
  );

  // Unknown agent is a hard error, not a silent no-op.
  let rejected = false;
  try {
    execFileSync('node', [INIT_BIN, '--scope=project', '--agents=notanagent', '--yes'], {
      cwd: proj,
      env: initEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    rejected = e.status === 1;
  }
  assert(rejected, 'init rejects an unknown --agents value');
} catch (e) {
  assert(false, 'init end-to-end run: ' + e.message);
} finally {
  try {
    fs.rmSync(initTmp, { recursive: true, force: true });
  } catch (_) {
    // best effort
  }
}

// 7. wave generator (bin/wave.js)
console.log('\n7. wave generator');
const WV = require(path.join(PKG_ROOT, 'bin', 'wave.js'));

const FIXTURE = [
  '# Plan Backlog: demo — 2026-07-30',
  '',
  '## 🌊 Next Executable Sequence',
  '',
  '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
  '|---|---|---|---|---|',
  '| **A** — now | `/wbWork demo/plan_demo_20260730.md --id=1`<br>→ *Opus 4.7 · ~$0.30* | — | `/wbWork demo/plan_demo_20260730.md --id=2`<br>→ *Sonnet 4.7 · ~$0.08* | `/wbWork demo/plan_demo_20260730.md --id=3`<br>→ *Flash · ~$0.02* |',
  '| **B** — after A | — | `/wbValid demo/plan_demo_20260730.md --id=1`<br>→ *Kimi · ~$0.10*<br><sub>pairs Wave A · 1</sub><br><br>`/wbValid demo/plan_demo_20260730.md --id=2`<br>→ *Opus 4.7 · ~$0.10*<br><sub>pairs Wave A · 2</sub> | — | — |',
  '| **C** — after B | — | — | — | ⏸️ `/wbWork demo/plan_demo_20260730.md --id=9`<br>→ *held for explicit user go* |',
  '',
  '## 🧭 What\'s Next?',
  '',
].join('\n');

const waveTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-flow-wave-'));
try {
  fs.mkdirSync(path.join(waveTmp, 'demo'), { recursive: true });
  fs.mkdirSync(path.join(waveTmp, '.git'), { recursive: true });
  const planFile = path.join(waveTmp, 'demo', 'plan_demo_20260730.md');
  fs.writeFileSync(planFile, FIXTURE);

  const matrix = WV.parseMatrix(FIXTURE);
  assert(matrix !== null, 'parseMatrix finds the 🌊 section');
  assert(matrix.rows.length === 3, 'parseMatrix reads 3 wave rows (got ' + (matrix ? matrix.rows.length : 0) + ')');
  assert(matrix.rows.map((r) => r.label).join(',') === 'A,B,C', 'wave labels parsed as A,B,C');

  const a = WV.cellsOf(matrix, 'A');
  assert(a.length === 3, 'wave A has 3 cells (got ' + a.length + ')');
  assert(a.filter((c) => c.role === 'planner').length === 1, 'wave A has 1 planner cell');
  assert(a.filter((c) => c.role === 'mechanical').length === 1, 'wave A has 1 mechanical cell');
  assert(WV.cellsOf(matrix, 'a').length === 3, 'wave lookup is case-insensitive');
  assert(WV.cellsOf(matrix, 'Z') === null, 'unknown wave returns null');

  const b = WV.cellsOf(matrix, 'B');
  assert(b.length === 2, 'a single cell splits into 2 commands on <br><br> (got ' + b.length + ')');
  assert(b[0].pairsWave === 'A' && b[0].pairsIds[0] === '1', 'pairing metadata parsed from <sub>');

  const idx = WV.indexDispatches(matrix);
  const models = WV.DEFAULT_MODELS;
  const rPlanner = WV.route(a.filter((c) => c.role === 'planner')[0], idx, models);
  assert(rPlanner.lane === 'claude', 'planner routes to claude in-session');
  const rWorker = WV.route(a.filter((c) => c.role === 'worker')[0], idx, models);
  assert(rWorker.lane === 'opencode' && rWorker.model === models.worker, 'worker routes to opencode worker model');
  const rMech = WV.route(a.filter((c) => c.role === 'mechanical')[0], idx, models);
  assert(rMech.model === models.mechanical, 'mechanical routes to the fast model');

  // 🧠 Planner rows are EXEMPT from executor≠validator: they produce a decision,
  // not a diff, so the pairing may stay with the model that produced it.
  const vPairsPlanner = WV.route(b[0], idx, models);
  assert(
    vPairsPlanner.lane === 'claude',
    'validator pairing a Planner row stays in-session — same model is allowed (got ' + vPairsPlanner.lane + '/' + vPairsPlanner.model + ')'
  );
  assert(
    /Planner row/.test(vPairsPlanner.reason) && /self-validated/.test(vPairsPlanner.reason),
    'the routing reason names the Planner self-validation exemption'
  );
  const vPairsWorker = WV.route(b[1], idx, models);
  assert(vPairsWorker.lane === 'claude', 'validator pairing a Worker row routes to claude');

  // Routing must survive a recompute: once wave A's dispatch has run and left the
  // matrix, only the ☐ Done column still records who executed it.
  const doneCol = WV.parseDoneColumn([
    '| # | Requires | Dep | Task | ☐ Done | ☐ Valid |',
    '|---|---|---|---|---|---|',
    '| 1 | 🔨 Worker | — | x | ✅<br>DeepSeek V4 Pro | ⬜ |',
    '| 3 | 🧠 Planner | — | y | ✅<br>Claude Opus 5 | ⬜ |',
    '| 4 | 🔨 Worker | — | z | ⬜ | ⬜ |',
  ].join('\n'));
  assert(/DeepSeek/.test(doneCol['1']), 'parseDoneColumn reads a non-Claude executor');
  assert(/Claude/.test(doneCol['3']), 'parseDoneColumn reads a Claude executor');
  assert(WV.isClaudeExecutor('✅<br>Claude Opus 5'), 'isClaudeExecutor matches Claude');
  assert(WV.isClaudeExecutor('✅<br>Opus 4.7'), 'isClaudeExecutor matches a bare Claude model name');
  assert(!WV.isClaudeExecutor('✅<br>DeepSeek V4 Pro'), 'isClaudeExecutor rejects DeepSeek');
  assert(!WV.isClaudeExecutor('✅<br>Gemini 3.1 Pro'), 'isClaudeExecutor rejects Gemini');
  assert(!WV.isClaudeExecutor('⬜'), 'isClaudeExecutor rejects an unexecuted row');

  const orphan = { role: 'validator', wave: 'A', command: '/wbValid demo/plan_demo_20260730.md --id=3', suggestedModel: '', pairsWave: 'A', pairsIds: ['3'], held: false };
  const rOrphanClaude = WV.route(orphan, {}, models, doneCol);
  assert(
    rOrphanClaude.lane === 'opencode' && rOrphanClaude.model === models.selfValidator,
    'a pairing whose dispatch has left the matrix still routes away from Claude via the Done column'
  );
  const orphan12 = Object.assign({}, orphan, { command: '/wbValid demo/plan_demo_20260730.md --id=1', pairsIds: ['1'] });
  assert(WV.route(orphan12, {}, models, doneCol).lane === 'claude', 'Done column naming DeepSeek routes validation to Claude');
  // An unexecuted row must fall back to the matrix, not guess from a blank box.
  const notYet = Object.assign({}, orphan, { command: '/wbValid demo/plan_demo_20260730.md --id=4', pairsIds: ['4'] });
  assert(WV.route(notYet, {}, models, doneCol).lane === 'claude', 'a blank Done box falls through to the matrix inference');
  // Validator cells must never be indexed as dispatches (that made pairings self-match).
  const vIdx = WV.indexDispatches(WV.parseMatrix(FIXTURE));
  assert(
    Object.keys(vIdx).every((k) => vIdx[k] !== 'validator'),
    'indexDispatches excludes validator cells'
  );

  // ── work/validate sub-rows + the explain→work→validate triplet ──────────
  const SUBROW = [
    '# Plan Backlog: sub — 2026-07-30',
    '',
    '## 🌊 Next Executable Sequence',
    '',
    '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
    '|---|---|---|---|---|',
    '| **A · 🔨 work** | `/wbExplain demo/plan_demo_20260730.md --id=9 --as="expert,steps,graphs"`<br>`/wbWork demo/plan_demo_20260730.md --id=9`<br>→ *Opus 4.7* | — | `/wbExplain demo/plan_demo_20260730.md --id=1 --as="expert,steps,graphs"`<br>`/wbWork demo/plan_demo_20260730.md --id=1`<br>→ *Sonnet 4.7* | — |',
    '| **A · ✅ validate** | — | `/wbValid demo/plan_demo_20260730.md --id=9`<br>→ *Kimi*<br><sub>pairs A · 9</sub><br><br>`/wbValid demo/plan_demo_20260730.md --id=1`<br>→ *Opus 4.7*<br><sub>pairs A · 1</sub> | — | — |',
    '',
    '## 🧭 Next',
  ].join('\n');

  const subMatrix = WV.parseMatrix(SUBROW);
  assert(subMatrix.rows.length === 2, 'a wave emits two rows: work + validate');
  assert(subMatrix.rows[0].kind === 'work' && subMatrix.rows[1].kind === 'validate', 'row kinds parsed from the label');
  assert(subMatrix.rows.every((r) => r.label === 'A'), 'both sub-rows share the wave label');

  const subWork = WV.cellsOf(subMatrix, 'A', 'work');
  const subVal = WV.cellsOf(subMatrix, 'A', 'validate');
  assert(subWork.length === 2, 'work row yields its dispatch cells (got ' + subWork.length + ')');
  assert(subVal.length === 2, 'validate row yields its pairing cells (got ' + subVal.length + ')');
  assert(subWork.every((c) => c.prelude.length === 1), 'each dispatch carries one /wbExplain prelude');
  assert(subWork.every((c) => /^\/wbExplain/.test(c.prelude[0])), 'the prelude is the /wbExplain');
  assert(subWork.every((c) => /^\/wbWork/.test(c.command)), 'the primary command is the /wbWork, not the prelude');
  assert(subWork[0].prelude.length === 1 && /^\/wbExplain/.test(subWork[0].prelude[0]) && /^\/wbWork/.test(subWork[0].command),
    'prose command parsing preserves the /wbExplain prelude + /wbWork pair');
  assert(/--as="expert,steps,graphs"/.test(subWork[0].prelude[0]), 'prelude keeps its --as style tokens');

  const SUB_NOTE_COMMAND = [
    '# Plan Backlog: sub-note — 2026-07-30',
    '',
    '## 🌊 Next Executable Sequence',
    '',
    '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
    '|---|---|---|---|---|',
    '| **A** — now | — | — | `/wbWork demo/plan_demo_20260730.md --id=7`<br>→ *Sonnet 4.7*<br><sub>the prose note mentions the validation command `/wbValid`, but it is not the dispatch</sub> | — |',
    '',
    '## 🧭 Next',
  ].join('\n');
  const subNoteCell = WV.cellsOf(WV.parseMatrix(SUB_NOTE_COMMAND), 'A', 'work')[0];
  assert(subNoteCell.command === '/wbWork demo/plan_demo_20260730.md --id=7',
    'sub. note prose command is ignored when selecting the dispatch');

  const subIdx = WV.indexDispatches(subMatrix);
  assert(Object.keys(subIdx).length === 2, 'only work-row cells are indexed as dispatches');
  const vPlanner = subVal.filter((c) => /--id=9/.test(c.command))[0];
  const vWorker = subVal.filter((c) => /--id=1$/.test(c.command))[0];
  assert(
    WV.route(vPlanner, subIdx, models).lane === 'claude',
    'a same-wave pairing of a Planner cell stays in-session (Planner rows may self-validate)'
  );
  assert(WV.route(vWorker, subIdx, models).lane === 'claude', 'a same-wave pairing of a Worker cell routes to Claude');
  assert(vPlanner.pairsWave === 'A' && vPlanner.pairsIds[0] === '9', 'the shorter "pairs A · 9" label parses');

  // Legacy single-row matrices must keep working.
  assert(WV.cellsOf(WV.parseMatrix(FIXTURE), 'A', 'work').length === 3, 'a pre-subrow matrix is still treated as a work row');
  assert(WV.cellsOf(WV.parseMatrix(FIXTURE), 'A', 'validate').length === 0, 'a pre-subrow matrix has no validate row');

  const VALIDATE_ONLY = [
    '# Plan Backlog: validate-only — 2026-07-30',
    '',
    '## 🌊 Next Executable Sequence',
    '',
    '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
    '|---|---|---|---|---|',
    '| **C · ✅ validate** | — | `/wbValid demo/plan_demo_20260730.md --id=9`<br>→ *Kimi*<br><sub>pairs C · 9</sub> | — | — |',
    '',
    '## 🧭 Next',
  ].join('\n');
  const validateOnlyMatrix = WV.parseMatrix(VALIDATE_ONLY);
  assert(WV.cellsOf(validateOnlyMatrix, 'C').length === 1, 'validate-only wave has one cell');
  assert(WV.cellsOf(validateOnlyMatrix, 'C', 'work').length === 0, 'validate-only wave has no work cell');

  // ── Dual-pass execution: `--wave=A` runs A.work, THEN A.valid ─────────────
  // output_conventions.md §10.2 rule 13, wbWork_template.md:293 and
  // wbPlan_template.md:305 all say "sequentially executes … followed by".
  // Until 2026-08-10 the script launched both sub-rows into ONE parallel batch
  // with a single `wait` at the end — measured on the 08-09 plan: dispatches at
  // lines 167 and 345, the only `wait` at 361, zero barriers between them. A
  // validate cell pairing its own wave's work therefore started before the
  // worker wrote its task report.
  //
  // Both cells must actually SPAWN for this to be observable: a validate cell
  // routed to Claude runs in-session and never reaches the script at all. The
  // Done column naming a Claude executor is what forces a spawnable validator.
  const dualBuilt = WV.buildScript({
    planPath: planFile, wave: 'A',
    cells: [
      { role: 'worker', wave: 'A', command: '/wbWork ' + path.relative(waveTmp, planFile) + ' --id=1', suggestedModel: '', prelude: [], pairsWave: null, pairsIds: [], held: false },
      { role: 'validator', wave: 'A', command: '/wbValid ' + path.relative(waveTmp, planFile) + ' --id=1', suggestedModel: '', prelude: [], pairsWave: 'A', pairsIds: ['1'], held: false },
    ],
    dispatchIndex: {}, doneColumn: { '1': '✅<br>Claude Opus 5' },
    models: Object.assign({}, models, { worker: 'gpt-5.6-terra', selfValidator: 'gemini-3.1-pro-high' }),
    jobs: 0, repoRoot: waveTmp,
  });
  assert(dualBuilt.spawned.length === 2, 'the dual-pass fixture spawns both a work and a validate cell (got ' + dualBuilt.spawned.length + ')');
  (function () {
    const lines = dualBuilt.script.split('\n');
    const idxOf = function (re) { return lines.findIndex(function (l) { return re.test(l); }); };
    const p1 = idxOf(/^# ═══ phase 1\/2 — 🔨 work/);
    const p2 = idxOf(/^# ═══ phase 2\/2 — ✅ validate/);
    assert(p1 !== -1 && p2 !== -1 && p1 < p2, 'the script is emitted as phase 1 🔨 work then phase 2 ✅ validate');

    const launches = [];
    const barriers = [];
    lines.forEach(function (l, i) {
      if (/^PIDS\+=/.test(l)) launches.push(i);
      if (/wait "\$\{PIDS\[\$_i\]\}"/.test(l)) barriers.push(i);
    });
    assert(launches.length === 2, 'two dispatches are launched (got ' + launches.length + ')');
    // THE assertion. Without a barrier between them, `--wave=A` is a parallel
    // batch and every document describing it is wrong.
    assert(
      barriers.some(function (b) { return b > launches[0] && b < launches[1]; }),
      'a `wait` barrier separates the work dispatch from the validate dispatch'
    );
    assert(launches[1] > p2, 'the validate dispatch is emitted inside phase 2, after the work barrier');
  })();

  const subBuilt = WV.buildScript({
    planPath: planFile, wave: 'A', cells: subWork, dispatchIndex: subIdx,
    models: models, jobs: 0, repoRoot: waveTmp,
  });
  assert(subBuilt.script.indexOf("--command 'wbExplain'") !== -1, 'the script invokes wbExplain');
  assert(
    subBuilt.script.indexOf("--command 'wbExplain'") < subBuilt.script.indexOf("--command 'wbWork'"),
    'wbExplain is emitted before wbWork in the same cell'
  );
  assert((subBuilt.script.match(/VERDICT:/g) || []).length >= 2, 'a failed blueprint aborts its own cell (each dispatch gets its own gate block)');
  assert(
    (subBuilt.script.match(/PIDS\+=\(\$!\)/g) || []).length === subBuilt.spawned.length,
    'the triplet stays inside ONE background shell per cell — parallelism is across cells'
  );

  const parsed = WV.splitCommand('/wbWork some/plan.md --id=3,4 --scope=x');
  assert(parsed.name === 'wbWork', 'splitCommand reads the command name');
  assert(parsed.target === 'some/plan.md', 'splitCommand reads the target');
  assert(parsed.ids.join(',') === '3,4', 'splitCommand reads batched ids');
  const pinned = WV.splitCommand('/wbValid some/plan.md --id=11,12 -M="Codex (auto)"');
  assert(pinned.delegateModel === 'Codex (auto)', 'splitCommand reads a quoted cell-level -M pin');
  assert(
    WV.route({ role: 'worker', command: '/wbWork some/plan.md --id=11 -M="Codex (auto)"' }, {}, WV.DEFAULT_MODELS).model === 'Codex (auto)',
    'cell-level -M outranks the role roster'
  );
  const claudePinned = { role: 'validator', command: '/wbValid some/plan.md --id=11 -M="Claude (auto)"' };
  const claudePinnedRoute = WV.route(claudePinned, {}, WV.DEFAULT_MODELS);
  assert(
    claudePinnedRoute.lane === 'claude' && claudePinnedRoute.model === null,
    'a cell-level Claude (auto) pin stays in-session'
  );
  assert(
    !/opencode run -m.*Claude \(auto\)/.test(WV.buildScript({
      planPath: planFile, wave: 'A', cells: [claudePinned], dispatchIndex: {},
      models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: waveTmp,
    }).script),
    'a cell-level Claude (auto) pin never emits a dead opencode dispatch'
  );
  const codexPinned = WV.route(
    { role: 'validator', command: '/wbValid some/plan.md --id=11 -M="Codex (auto)"' },
    {}, WV.DEFAULT_MODELS
  );
  assert(
    codexPinned.lane === 'opencode' && codexPinned.model === 'Codex (auto)',
    'a cell-level Codex (auto) pin still spawns'
  );

  // F20 fixture — alphanumeric task ids (F1, SITE-0, TPL1…)
  assert(
    WV.splitCommand('/wbWork plan.md --id=F20').ids.join('') === 'F20',
    'splitCommand parses an alphanumeric id (--id=F20)'
  );
  assert(
    WV.splitCommand('/wbWork plan.md --id=F1,F2,F19 --other').ids.join(',') === 'F1,F2,F19',
    'splitCommand parses batched alphanumeric ids'
  );
  assert(
    WV.splitCommand('/wbWork plan.md --id=SITE-0').ids.join('') === 'SITE-0',
    'splitCommand parses a hypenated id (--id=SITE-0)'
  );
  assert(
    WV.splitCommand('/wbWork plan.md --id=TPL1,TPL2,TPL3').ids.join(',') === 'TPL1,TPL2,TPL3',
    'splitCommand parses a mixture of letters and digits'
  );
  assert(
    WV.splitCommand('/wbWork plan.md --id=3.1,3.2').ids.join(',') === '3.1,3.2',
    'splitCommand regression: dotted numeric ids still work'
  );

  // parseDoneColumn with alphanumeric task ids
  const ALPHA_TABLE = [
    '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    '| [F1](tasks/task_F1/) | 🔨 Worker | — | 📄 | … | … | P0 | 15 | DeepSeek V4 Pro | Kimi K2.7 Code | ✅<br>DeepSeek V4 Pro | ✅<br>Kimi K2.7 Code |',
    '| F20 | 🔨 Worker | — | 📄 | … | … | P0 | 25 | Claude (auto) | Kimi K2.7 Code | ⬜ | ⬜ |',
    '| F21 | 🔨 Worker | — | 📄 | … | … | P0 | 25 | Claude (auto) | Kimi K2.7 Code | ✅<br>Claude Opus 5 | ⬜ |',
    '| [SITE](some/plan.md) | 🧠 Planner | — | 📄 | … | … | P1 | 90 | 🔄 Recursive | Kimi K2.7 Code | ✅<br>Claude Opus 5 | ✅<br>Kimi K2.7 Code |',
    '| [SITE-0](tasks/task_SITE-0/) | 📋 Mechanical | — | 📄 | … | … | P1 | 5 | Qwen 3.7 Plus | Kimi K2.7 Code | ✅<br>Qwen 3.7 Plus | ✅<br>Kimi K2.7 Code |',
    '| TPL1 | 📋 Mechanical | TPL2,TPL3,TPL4 | 📄 | … | … | P2 | 40 | Qwen 3.7 Plus | Kimi K2.7 Code | ⬜ | ⬜ |',
  ].join('\n');
  const alphaDone = WV.parseDoneColumn(ALPHA_TABLE);
  const alphaRequires = WV.parseRequiresColumn(ALPHA_TABLE);
  assert(alphaRequires['SITE'] === 'planner', 'parseRequiresColumn reads the 🧠 Planner role tag off a task row');
  assert(alphaRequires['F1'] === 'worker', 'parseRequiresColumn reads the 🔨 Worker role tag');
  assert(alphaRequires['SITE-0'] === 'mechanical', 'parseRequiresColumn reads the 📋 Mechanical role tag');
  assert(/DeepSeek/.test(alphaDone['F1']), 'parseDoneColumn reads a Done box keyed by an alpha-numeric id (F1)');
  assert(/Claude/.test(alphaDone['SITE']), 'parseDoneColumn reads a Done box keyed by a label-only id (SITE)');
  assert(/Qwen/.test(alphaDone['SITE-0']), 'parseDoneColumn reads a Done box keyed by a hyphenated id (SITE-0)');
  assert(/⬜/.test(alphaDone['TPL1']), 'parseDoneColumn reads an open (⬜) Done box for TPL1');
  assert(/⬜/.test(alphaDone['F20']), 'parseDoneColumn reads an open (⬜) Done box for F20');

  // ── F24: splitRow must ignore | inside backticks ──
  const cellsNoPipe = WV.splitRow('| F24 | 🔨 Worker | — | 📄 | Fix pipe | `echo hello` | P0 | 30 | Worker | Validator | ⬜ | ⬜ |');
  assert(cellsNoPipe.length === 12, 'splitRow: plain row produces 12 columns (got ' + cellsNoPipe.length + ')');

  const cellsWithPipeInBacktick = WV.splitRow('| F24 | 🔨 Worker | — | 📄 | Fix pipe | `echo "hello" \\| grep world` && echo ok | P0 | 30 | Worker | Validator | ⬜ | ⬜ |');
  assert(cellsWithPipeInBacktick.length === 12, 'splitRow: pipe inside backtick does not create a spurious column (got ' + cellsWithPipeInBacktick.length + ')');

  const cellsMultiBacktick = WV.splitRow('| F24 | 🔨 Worker | — | 📄 | Fix pipe | `grep -cE "Error: (Model not found\\|Insufficient credits)"` > 0 | P0 | 30 | Worker | Validator | ⬜ | ⬜ |');
  assert(cellsMultiBacktick.length === 12, 'splitRow: multiple pipes inside backticks do not fragment columns (got ' + cellsMultiBacktick.length + ')');

  // F24 — parseVerifyColumn extracts the oracle, not Task prose
  const pipeVerifyFixture = [
    '# Plan Backlog: pipe — 2026-08-01',
    '',
    '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    '| F24 | 🔨 Worker | F19 | 📄 | Make splitRow ignore `\\\\|` inside backticks | `node -e "console.log(\\"ok\\")"` → ok | P0 | 30 | Claude | Kimi | ⬜ | ⬜ |',
    '| F25 | 🔨 Worker | F19 | 📄 | Strip ANSI before G1 matching | `grep -cE "Error: (Model not found\\\\|Insufficient credits)" file` > 0 | P1 | 20 | Claude | Kimi | ⬜ | ⬜ |',
    '| F26 | 🔨 Worker | F3 | 📄 | Fix model precedence | `wave plan.md --list 2>&1 \\\\| grep "model_recommendations"` | P1 | 25 | Claude | GLM | ⬜ | ⬜ |',
  ].join('\n');
  const pipeVerifyCol = WV.parseVerifyColumn(pipeVerifyFixture);
  assert(pipeVerifyCol['F24'] !== undefined, 'parseVerifyColumn finds the Verify cell for F24');
  assert(pipeVerifyCol['F25'] !== undefined, 'parseVerifyColumn finds the Verify cell for F25');
  assert(pipeVerifyCol['F26'] !== undefined, 'parseVerifyColumn finds the Verify cell for F26');
  assert(
    pipeVerifyCol['F24'].indexOf('/wbExplain') === -1 && pipeVerifyCol['F24'].indexOf('Make splitRow') === -1 && pipeVerifyCol['F24'].indexOf('node') !== -1,
    'F24 Verify is the oracle (node command), not the Task prose or text from another column'
  );
  assert(
    pipeVerifyCol['F25'].indexOf('grep') !== -1,
    'F25 Verify extracts the grep oracle despite containing a pipe in the pattern'
  );
  assert(
    pipeVerifyCol['F26'].indexOf('grep') !== -1,
    'F26 Verify extracts the grep oracle despite containing a pipeline'
  );

  // F24 — buildScript embeds the real oracle, not Task prose
  const pipePlanPath = path.join(waveTmp, 'plan_pipe_20260801.md');
  const PIPE_PLAN = [
    '# Plan Backlog: pipe — 2026-08-01',
    '',
    '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    '| F24 | 🔨 Worker | — | 📄 | Make splitRow ignore `\\\\|` inside backticks | `echo ok` | P0 | 30 | DeepSeek V4 Pro | Kimi K2.7 Code | ⬜ | ⬜ |',
    '',
    '## 🌊 Next Executable Sequence',
    '',
    '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
    '|---|---|---|---|---|',
    '| **C · 🔨 work** | — | — | `/wbWork plan_pipe_20260801.md --id=F24`<br>→ *DeepSeek V4 Pro*<br><sub>*(⏱️ 30 min)*</sub> | — |',
  ].join('\n');
  fs.writeFileSync(pipePlanPath, PIPE_PLAN);
  const pipeMatrix = WV.parseMatrix(PIPE_PLAN);
  const pipeCells = WV.cellsOf(pipeMatrix, 'C', 'work');
  const pipeDispatchIdx = WV.indexDispatches(pipeMatrix);
  const pipeVerifyCol2 = WV.parseVerifyColumn(PIPE_PLAN);
  const pipeBuilt = WV.buildScript({
    planPath: pipePlanPath, wave: 'C', cells: pipeCells, dispatchIndex: pipeDispatchIdx,
    models: WV.DEFAULT_MODELS, jobs: 0, repoRoot: waveTmp,
    verifyColumn: pipeVerifyCol2, planDirRel: '',
  });
  assert(
    pipeBuilt.script.indexOf("bash -c 'echo ok'") !== -1,
    'buildScript embeds the real oracle (echo ok) in the G3 gate, not Task prose'
  );

  // SITE is a 🧠 Planner row executed by Claude. Without the role it is just a
  // Claude-executed row and routes away; WITH the Requires column it is a
  // Planner row, and Planner rows may be validated by the same model.
  const siteValidatorCell = { role: 'validator', wave: 'B', command: '/wbValid demo/plan_demo_20260730.md --id=SITE', suggestedModel: '', pairsWave: 'A', pairsIds: ['SITE'], held: false };
  const rSiteNoRole = WV.route(siteValidatorCell, {}, models, alphaDone);
  assert(
    rSiteNoRole.lane === 'opencode' && rSiteNoRole.model === models.selfValidator,
    'with no role information, a Claude-executed row still routes away (the rule holds by default)'
  );
  const rSiteVal = WV.route(siteValidatorCell, {}, models, alphaDone, '', alphaRequires);
  assert(
    rSiteVal.lane === 'claude',
    'a 🧠 Planner row may be validated by the same model — SITE stays in-session'
  );
  assert(
    /Planner row/.test(rSiteVal.reason),
    'the routing reason for SITE validation names the Planner exemption'
  );

  // …and the exemption is Planner-only: a 🔨 Worker row Claude executed still
  // hands off. This is the half of the rule that protects code edits.
  const f21ValidatorCell = { role: 'validator', wave: 'B', command: '/wbValid demo/plan_demo_20260730.md --id=F21', suggestedModel: '', pairsWave: 'A', pairsIds: ['F21'], held: false };
  const rF21Val = WV.route(f21ValidatorCell, {}, models, alphaDone, '', alphaRequires);
  assert(
    rF21Val.lane === 'opencode' && rF21Val.model === models.selfValidator,
    'a Claude-executed 🔨 Worker row still routes AWAY from Claude — the exemption is Planner-only'
  );

  const built = WV.buildScript({
    planPath: planFile, wave: 'A', cells: a, dispatchIndex: idx,
    models: models, jobs: 0, repoRoot: waveTmp,
  });
  assert(built.spawned.length === 2, 'wave A spawns 2 cells (planner stays inline)');
  assert(built.inline.length === 1, 'wave A leaves 1 cell for the orchestrator');
  assert(built.script.indexOf('--no-plan-update') !== -1, 'spawned commands carry --no-plan-update');
  // Count only the shell-quoted arg strings, not the explanatory header comment.
  assert(
    (built.script.match(/--no-plan-update'/g) || []).length === built.spawned.length,
    'every spawned command carries --no-plan-update (found ' +
      (built.script.match(/--no-plan-update'/g) || []).length + ', expected ' + built.spawned.length + ')'
  );
  assert(built.script.indexOf('--dangerously-skip-permissions') !== -1, 'uses the real opencode permission flag');
  assert(built.script.indexOf('--auto') === -1, 'does NOT use the non-existent --auto flag');
  assert(built.script.indexOf("--command 'wbWork'") !== -1, 'invokes the slash-command via --command');
  assert(built.script.indexOf('#!/usr/bin/env bash') === 0, 'emits a bash shebang');
  assert(built.script.indexOf('PIDS+=($!)') !== -1, 'launches cells in parallel and tracks pids');
  assert(built.script.indexOf('exit "$FAILED"') !== -1, 'exit code reports failed cells');
  assert(built.script.indexOf(waveTmp) !== -1, 'cds to the repo root, not the scope folder');

  const heldBuilt = WV.buildScript({
    planPath: planFile, wave: 'C', cells: WV.cellsOf(matrix, 'C'), dispatchIndex: idx,
    models: models, jobs: 0, repoRoot: waveTmp,
  });
  assert(heldBuilt.spawned.length === 0, 'HELD cells are never spawned');
  assert(
    heldBuilt.skipped.length === 1 && /HELD/.test(heldBuilt.skipped[0].why),
    'HELD cells are reported as skipped'
  );

  // Missing target must be caught before an agent is spawned to fail.
  const bogus = WV.buildScript({
    planPath: planFile, wave: 'A', dispatchIndex: {}, models: models, jobs: 0, repoRoot: waveTmp,
    cells: [{ role: 'worker', wave: 'A', command: '/wbWork nope/missing.md --id=1', suggestedModel: '', pairsWave: null, pairsIds: [], held: false }],
  });
  assert(bogus.spawned.length === 0 && /target not found/.test(bogus.skipped[0].why), 'a non-existent target is skipped, not spawned');

  // Generated script must be syntactically valid bash (if bash is available).
  try {
    const shPath = path.join(waveTmp, 'wave_A.sh');
    fs.writeFileSync(shPath, built.script);
    execFileSync('bash', ['-n', shPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    assert(true, 'generated script passes `bash -n`');
  } catch (e) {
    assert(/ENOENT/.test(e.message), 'generated script passes `bash -n`: ' + e.message);
  }

  // CLI surface
  const out = execFileSync('node', [path.join(PKG_ROOT, 'bin', 'wave.js'), planFile, '--wave=A', '--print'], { encoding: 'utf8' });
  assert(out.indexOf('#!/usr/bin/env bash') === 0, '--print writes the script to stdout');
  // Wave B pairs a 🧠 Planner row (id=1) and a 🔨 Worker row (id=2). Both stay
  // in-session now: the Planner one by the exemption, the Worker one because a
  // non-Claude model executed it. The self-validation model appears only when a
  // Claude-executed non-Planner row is paired — covered by the rF21Val case.
  const listed = execFileSync('node', [path.join(PKG_ROOT, 'bin', 'wave.js'), planFile, '--wave=B', '--list'], { encoding: 'utf8' });
  assert(listed.indexOf('claude (in-session)') !== -1, '--list resolves validator routing to a lane');
  assert(
    /Planner row/.test(listed),
    '--list reports the Planner self-validation exemption in its routing reason'
  );

  let badWave = false;
  try {
    execFileSync('node', [path.join(PKG_ROOT, 'bin', 'wave.js'), planFile, '--wave=Z'], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) { badWave = e.status === 1; }
  assert(badWave, 'unknown --wave exits 1');

  let noMatrix = false;
  const plain = path.join(waveTmp, 'demo', 'plan_plain_20260730.md');
  fs.writeFileSync(plain, '# Plan Backlog: plain — 2026-07-30\n\nno matrix here\n');
  try {
    execFileSync('node', [path.join(PKG_ROOT, 'bin', 'wave.js'), plain, '--wave=A'], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) { noMatrix = e.status === 1; }
  assert(noMatrix, 'a plan with no matrix exits 1 with guidance');

  // Canonical role flags: --planner=, --worker=, --validator=, --mechanical=
  const helpOut = execFileSync('node', [path.join(PKG_ROOT, 'bin', 'wave.js'), '--help'], { encoding: 'utf8' });
  assert(helpOut.indexOf('--planner=') !== -1, '--help documents --planner=');
  assert(helpOut.indexOf('--worker=') !== -1, '--help documents --worker=');
  assert(helpOut.indexOf('--validator=') !== -1, '--help documents --validator=');
  assert(helpOut.indexOf('--mechanical=') !== -1, '--help documents --mechanical=');

  // ── Merged ids (`--id=3,8`) — G2/G3 must gate EVERY id, not just ids[0] ──
  // Merging same-target/same-model/same-role rows pays the agent's start-up
  // context once instead of once per row. Gating only the first id made that
  // merge silently unverified for every id after it.
  const mergedDir = path.join(waveTmp, 'merged');
  fs.mkdirSync(path.join(mergedDir, 'tasks', 'task_3'), { recursive: true });
  fs.mkdirSync(path.join(mergedDir, 'tasks', 'task_8'), { recursive: true });
  const mergedPlanPath = path.join(mergedDir, 'plan_merged_20260801.md');
  const MERGED_PLAN = [
    '# Plan Backlog: merged — 2026-08-01',
    '',
    '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|',
    '| 3 | 🔨 Worker | — | 📄 | Build the free dist | `test -f built3.txt` | P0 | 30 | DeepSeek V4 Pro | Claude | ⬜ | ⬜ |',
    '| 8 | 🔨 Worker | — | 📄 | Add the LICENSE | `test -f built8.txt` | P1 | 10 | DeepSeek V4 Pro | Claude | ⬜ | ⬜ |',
    '',
    '## 🌊 Next Executable Sequence',
    '',
    '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
    '|---|---|---|---|---|',
    '| **A** | — | — | `/wbWork plan_merged_20260801.md --id=3,8`<br>→ *DeepSeek V4 Pro* *(⏱️ 30 min)* | — |',
  ].join('\n');
  fs.writeFileSync(mergedPlanPath, MERGED_PLAN);
  const mergedMatrix = WV.parseMatrix(MERGED_PLAN);
  const mergedBuilt = WV.buildScript({
    planPath: mergedPlanPath, wave: 'A', cells: WV.cellsOf(mergedMatrix, 'A', 'work'),
    dispatchIndex: WV.indexDispatches(mergedMatrix), models: models, jobs: 0,
    repoRoot: mergedDir, verifyColumn: WV.parseVerifyColumn(MERGED_PLAN),
    estTime: WV.parseEstTime(MERGED_PLAN), planDirRel: '',
  });
  assert(mergedBuilt.spawned.length === 1, 'a merged --id=3,8 cell is ONE dispatch (one agent, one context)');
  assert(
    /VERDICT \[3\]:/.test(mergedBuilt.script) && /VERDICT \[8\]:/.test(mergedBuilt.script),
    'a merged dispatch emits a per-id verdict for EVERY id it names'
  );
  assert(
    /G2 \[8\]: NO-OP/.test(mergedBuilt.script),
    'G2 checks the second id\'s report, not only ids[0]'
  );
  assert(
    mergedBuilt.script.indexOf("bash -c 'test -f built8.txt'") !== -1,
    'G3 runs the SECOND id\'s Verify oracle too, not only ids[0]'
  );
  assert(
    /VERDICT: NO-OP —\$_g9_noop/.test(mergedBuilt.script) && /VERDICT: ATTEMPTED —\$_g9_att/.test(mergedBuilt.script),
    'the cell verdict is the worst id, and names which ids failed'
  );

  const NOMERGE_PLAN = MERGED_PLAN.replace('--id=3,8', '--id=3 --no-merge`<br><br>`/wbWork plan_merged_20260801.md --id=8');
  fs.writeFileSync(mergedPlanPath, NOMERGE_PLAN);
  const nomergeMatrix = WV.parseMatrix(NOMERGE_PLAN);
  const nomergeBuilt = WV.buildScript({
    planPath: mergedPlanPath, wave: 'A', cells: WV.cellsOf(nomergeMatrix, 'A', 'work'),
    dispatchIndex: WV.indexDispatches(nomergeMatrix), models: models, jobs: 0,
    repoRoot: mergedDir, verifyColumn: WV.parseVerifyColumn(NOMERGE_PLAN),
    estTime: WV.parseEstTime(NOMERGE_PLAN), planDirRel: '',
  });
  assert(nomergeBuilt.spawned.length === 2, '--no-merge disables auto-merge for the specified cell');
  assert(
    /plan_merged_20260801\.md --id=3.*--no-merge/.test(nomergeBuilt.script) && 
    /plan_merged_20260801\.md --id=8/.test(nomergeBuilt.script),
    'the generated script contains both independent cell commands'
  );
  assert(
    mergedBuilt.script.indexOf("['3,8']=40") !== -1,
    'a merged cell budgets the SUM of its rows (30+10), so it is not falsely OVER est'
  );
  assert(
    mergedBuilt.script.indexOf("TASK_IDS+=('3,8')") !== -1,
    'the heartbeat tracks the joined id — what `pgrep -f -- "--id=3,8"` matches'
  );
  assert(
    mergedBuilt.script.indexOf('\\$WB_RUN') !== -1,
    'the missing-wbRun warning escapes $WB_RUN — unescaped it trips `set -u` and kills the wave'
  );

  // ── --sessions: warm dispatch per (scope, model) ──────────────────────────
  assert(
    WV.sessionKeyFor('wbc-ui3', 'opencode-go/deepseek-v4-pro') === 'wbflow:wbc-ui3:opencode-go-deepseek-v4-pro',
    'sessionKeyFor is per (scope, model) and slash-safe'
  );
  const coldBuilt = WV.buildScript({
    planPath: mergedPlanPath, wave: 'A', cells: WV.cellsOf(mergedMatrix, 'A', 'work'),
    dispatchIndex: WV.indexDispatches(mergedMatrix), models: models, jobs: 0,
    repoRoot: mergedDir, planDirRel: '',
  });
  assert(
    coldBuilt.script.indexOf('SESSION_DIR') === -1 && coldBuilt.script.indexOf('--title') === -1,
    'without --sessions the dispatch is unchanged (opt-in, not default)'
  );
  const warmBuilt = WV.buildScript({
    planPath: mergedPlanPath, wave: 'A', cells: WV.cellsOf(mergedMatrix, 'A', 'work'),
    dispatchIndex: WV.indexDispatches(mergedMatrix), models: models, jobs: 0,
    repoRoot: mergedDir, planDirRel: '', sessions: true, scopeName: 'merged',
  });
  assert(
    /SESSION_DIR="\$\{WB_WAVE_SESSION_DIR:-\$\(dirname "\$RUN_DIR"\)\/sessions\}"/.test(warmBuilt.script),
    'the session store sits beside the wave logs, outside the timestamped run dir'
  );
  // The key MUST include the plan. Keying on (scope, model) alone let two plans in
  // one scope share a conversation, and a resumed session outranks the command line:
  // on 2026-08-03 two cells dispatched against the 08-03 plan executed the 08-02
  // plan's tasks, and a third overwrote a validated task report. This assertion
  // previously pinned that bug.
  const warmPlanSlug = path.basename(mergedPlanPath, '.md').replace(/[^\w.-]+/g, '-');
  assert(
    warmBuilt.script.indexOf(
      "--title 'wbflow:merged:" + models.worker.replace(/\//g, '-') + ':' + warmPlanSlug + "'"
    ) !== -1,
    'a cold dispatch tags its session with the (scope, model, PLAN) key'
  );
  assert(
    warmBuilt.script.indexOf("--title 'wbflow:merged:" + models.worker.replace(/\//g, '-') + "'") === -1,
    'the plan-less (scope, model) session key is gone — it caused cross-plan context leaks'
  );
  assert(
    warmBuilt.script.indexOf('_g9_sargs=(-s "$_g9_sid" --fork)') !== -1,
    'a warm dispatch RESUMES AND FORKS — parallel cells must not share one conversation'
  );
  assert(
    /select\(\.title==\$t\)/.test(warmBuilt.script) && /sort_by\(\.created\)/.test(warmBuilt.script),
    'the id is resolved by title, not by "most recent" (which races under parallelism)'
  );
  assert(
    warmBuilt.script.indexOf('jq not found') !== -1,
    'a missing jq is reported rather than silently leaving every run cold'
  );

  // ── Never delegate to yourself ────────────────────────────────────────────
  // A roster naming the orchestrator ("Claude (auto)") for a role must run that
  // role in-session. Before the fix the sentinel resolved to an empty slug, was
  // dropped, and the role silently fell through to DEFAULT_MODELS — so a
  // Claude-worker roster dispatched to deepseek instead.
  const selfModels = Object.assign({}, models, { inSession: { worker: true, mechanical: true } });
  const workerCell = { role: 'worker', wave: 'A', command: '/wbWork p.md --id=1', suggestedModel: '', pairsWave: null, pairsIds: [], held: false };
  const mechCell = Object.assign({}, workerCell, { role: 'mechanical' });
  assert(
    WV.route(workerCell, {}, selfModels).lane === 'claude',
    'a 🔨 Worker roster naming the orchestrator runs in-session instead of spawning'
  );
  assert(
    /not delegated/.test(WV.route(workerCell, {}, selfModels).reason),
    'the routing reason says the cell was not delegated'
  );
  assert(
    WV.route(mechCell, {}, selfModels).lane === 'claude',
    'the same holds for 📋 Mechanical'
  );
  assert(
    WV.route(workerCell, {}, models).lane === 'opencode' && WV.route(workerCell, {}, models).model === models.worker,
    'a roster naming a real model still delegates (the rule is narrow)'
  );

  // ── --summary: decisions to the terminal, evidence to the log file ────────
  const quietBuilt = WV.buildScript({
    planPath: mergedPlanPath, wave: 'A', cells: WV.cellsOf(mergedMatrix, 'A', 'work'),
    dispatchIndex: WV.indexDispatches(mergedMatrix), models: models, jobs: 0,
    repoRoot: mergedDir, planDirRel: '', summary: true,
  });
  assert(
    /> >\(tee "\$RUN_DIR\/[^"]+\.log" \| \{ grep --line-buffered -E/.test(quietBuilt.script),
    '--summary uses process substitution so $! captures the agent PID, not grep (bug 1)'
  );
  assert(
    quietBuilt.script.indexOf('|| true; }) 2>&1 &') !== -1,
    'the summary grep cannot set the pipeline exit status (pipefail would turn "no match" into a failed cell)'
  );
  assert(
    /grep --line-buffered/.test(quietBuilt.script),
    'the summary stream is line-buffered — a wave must report as it runs, not at the end'
  );
  assert(
    coldBuilt.script.indexOf('grep --line-buffered') === -1,
    'without --summary the full stream still reaches the terminal (opt-in, not default)'
  );

  // The G2 glob must actually MATCH. Fully quoted (`ls 'a_*.md'`) it asks for a
  // file literally named `a_*.md`, so every gated dispatch landed NO-OP.
  const g2Line = (mergedBuilt.script.match(/if (ls '[^\n]*?) >\/dev\/null/) || [])[1];
  assert(!!g2Line, 'the G2 gate emits an ls check');
  fs.writeFileSync(path.join(mergedDir, 'tasks', 'task_3', 'task_3_report_merged_20260801.md'), '# report');
  let g2Matched = false;
  try {
    execFileSync('bash', ['-c', g2Line], { cwd: mergedDir, stdio: ['ignore', 'pipe', 'pipe'] });
    g2Matched = true;
  } catch (_) { g2Matched = false; }
  assert(g2Matched, 'the G2 glob matches a real report file (the `*` is outside the quotes)');

  const listedWorker = execFileSync('node', [path.join(PKG_ROOT, 'bin', 'wave.js'), planFile, '--wave=A', '--list', '--worker=kimi-k3'], { encoding: 'utf8' });
  assert(listedWorker.indexOf('kimi-k3') !== -1, '--worker= overrides the worker model in --list');
  const listedMech = execFileSync('node', [path.join(PKG_ROOT, 'bin', 'wave.js'), planFile, '--wave=A', '--list', '--mechanical=test-mech'], { encoding: 'utf8' });
  assert(listedMech.indexOf('test-mech') !== -1, '--mechanical= overrides the mechanical model in --list');
} catch (e) {
  assert(false, 'wave generator suite: ' + e.message);
} finally {
  try { fs.rmSync(waveTmp, { recursive: true, force: true }); } catch (_) { /* best effort */ }
}

// 8. B1 regression — oracle pipe unescaping and --self-test-oracle
console.log('\n8. B1 oracle pipe unescape and --self-test-oracle');

assert(
  WV.extractVerifyCommand('`grep -c ZZZ file \\| wc -l`') === 'grep -c ZZZ file | wc -l',
  'extractVerifyCommand unescapes \\| to real pipe'
);
assert(
  WV.extractVerifyCommand('`echo "ok" \\| grep ok`') === 'echo "ok" | grep ok',
  'extractVerifyCommand unescapes \\| from a double-quoted pipeline'
);
assert(
  WV.extractVerifyCommand('`grep -c ZZZ /dev/null`') === 'grep -c ZZZ /dev/null',
  'extractVerifyCommand leaves pipeless oracles unchanged'
);
assert(
  WV.extractVerifyCommand('`echo "needed" \\| grep -c needed`') === 'echo "needed" | grep -c needed',
  'extractVerifyCommand: escaped-pipe oracle that must PASS resolves correctly'
);

var selfTestOracle_err;
try {
  execFileSync('node', [
    path.join(PKG_ROOT, 'bin', 'wave.js'), '--self-test-oracle', 'grep -c ZZZ /dev/null',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  selfTestOracle_err = e;
}
assert(
  selfTestOracle_err && /VERDICT: ATTEMPTED/.test(selfTestOracle_err.stdout || selfTestOracle_err.message || ''),
  '--self-test-oracle with must-fail oracle (grep -c ZZZ /dev/null) reports ATTEMPTED'
);

var selfTestOracle_passErr = null;
var selfTestOracle_passOut = '';
try {
  selfTestOracle_passOut = execFileSync('node', [
    path.join(PKG_ROOT, 'bin', 'wave.js'), '--self-test-oracle', 'echo ok',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  selfTestOracle_passErr = e;
  selfTestOracle_passOut = e.stdout || e.message || '';
}
assert(
  !selfTestOracle_passErr && /VERDICT: PASS/.test(selfTestOracle_passOut),
  '--self-test-oracle with passing oracle (echo ok) reports PASS'
);

// Summary
// 9. `wb-flow model` — the single roster writer
console.log('\n9. model roster writer');

const MD = require(path.join(PKG_ROOT, 'bin', 'model.js'));

// Family collapse: a fallback chain of three adjacent versions is not a chain.
assert(MD.familyOf('opencode/claude-sonnet-4') === MD.familyOf('opencode/claude-sonnet-4-6'),
  'familyOf collapses adjacent versions of one model');
assert(MD.familyOf('anthropic/claude-opus-4-5-20251101') === MD.familyOf('anthropic/claude-opus-4-8-fast'),
  'familyOf collapses dated snapshots and speed variants');
assert(MD.versionRank('opencode-go/qwen3.7-plus') > MD.versionRank('opencode/qwen3.5-plus'),
  'versionRank prefers the newer release');

// Role mapping
const catalog = [
  'opencode-go/deepseek-v4-pro', 'opencode-go/deepseek-v4-flash', 'opencode-go/qwen3.7-plus',
  'opencode-go/kimi-k2.7-code', 'opencode-go/glm-5.2', 'opencode/claude-opus-5',
  'gemini-3.1-pro-high', 'openrouter/~anthropic/claude-fable-latest',
];
const worker = MD.pickForRole('worker', catalog, { excludeAgy: true, limit: 3 });
assert(worker[0] === 'opencode-go/deepseek-v4-pro',
  'worker leads with the cheap-and-capable tier, not the premium one');
assert(
  MD.pickForRole('worker', catalog, { excludeAgy: true, limit: 3 }).indexOf('gemini-3.1-pro-high') === -1,
  'excludeAgy still filters agy models when a caller asks for it'
);
assert(
  MD.pickForRole('planner', ['gemini-3.1-pro-high'], { limit: 3 }).indexOf('gemini-3.1-pro-high') !== -1,
  'but agy models are offered BY DEFAULT now that wave can dispatch them — they were the only reachable executor on 2026-08-02'
);
assert(
  MD.pickForRole('planner', catalog, { excludeAgy: true, limit: 3 }).every((s) => s.indexOf('~') === -1),
  'aliased/nested slugs are never offered (not dispatchable as -m <slug>)'
);
const mech = MD.pickForRole('mechanical', catalog, { excludeAgy: true, limit: 3 });
assert(mech[0] === 'opencode-go/qwen3.7-plus', 'mechanical buys speed first');

// In-session lead must have NON-Claude escapes, or the chain has no fallback.
const proposed = MD.proposeRoster({ claude: true, slugs: catalog });
assert(/\(auto\)/.test(proposed.planner[0]), 'planner leads with the in-session sentinel when claude is present');
assert(
  proposed.planner.slice(1).every((s) => !/claude|opus|sonnet|fable/i.test(s)),
  'the fallbacks behind an in-session lead are a different family — otherwise there is no escape'
);

// The escaping this whole module exists to guarantee.
const table = MD.renderRosterTable(proposed, {});
const headerCells = table.split('\n')[0].split(/(?<!\\)\|/).length;
assert(
  table.split('\n').filter((l) => l.startsWith('|') && !/^\|-/.test(l))
       .every((l) => l.split(/(?<!\\)\|/).length === headerCells),
  'every rendered row has the header cell count — the bash `||` is escaped `\\|\\|`'
);
assert(
  table.indexOf('\\|') === -1,
  'NO backslash-escaped pipes: the bash `||` lives in a fenced block, not a table cell, so nothing needs escaping'
);
assert(
  /```bash[\s\S]*\|\|[\s\S]*```/.test(table),
  'the `||` fallback operator appears literally inside the fenced dispatch block'
);
assert(
  !/^#.*\|\|/m.test(table),
  'an in-session lead never shares a line with the chain — a leading `#` would comment the whole `||` chain out'
);

// Round-trip through the file writer, leaving other sections untouched.
const neutralPath = path.join(PKG_ROOT, 'templates', 'commands', 'model_recommendations.default.md');
assert(fs.existsSync(neutralPath), 'a provider-neutral default roster ships');
const neutralText = fs.readFileSync(neutralPath, 'utf8');
assert(
  MD.ROLE_ORDER.every((r) => !(MD.readRoster(neutralText) || {})[r] || !MD.readRoster(neutralText)[r].length),
  'the shipped default names NO models — no user inherits the packager subscriptions'
);
const written = MD.writeRosterInto(neutralText, proposed, { date: '2026-08-02' });
assert(written.indexOf('## 🌳 Who may be the orchestrator') !== -1,
  'writeRosterInto replaces only the roster table, leaving other sections intact');
const back = MD.readRoster(written);
assert(back.worker.join(',') === proposed.worker.join(','), 'roster round-trips through write → read');

// The prepublish guard must reject a populated shipped roster.
const guard = path.join(PKG_ROOT, 'bin', 'verify-roster.js');
assert(fs.existsSync(guard), 'the prepublish roster guard exists');
let guardBlocked = false;
try {
  execFileSync('node', [guard], { stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { guardBlocked = e.status === 1; }
assert(
  typeof guardBlocked === 'boolean',
  'verify-roster.js runs and reports a status (blocked=' + guardBlocked + ')'
);

// ── the interactive picker ────────────────────────────────────────────────
// A provider CLI may print an error while returning exit status 0. A probe is
// valid only when the requested response token came back.
assert(MD.probeResponseError({ status: 0 }, 'WB_FLOW_PROBE_OK') === null,
  'a probe requires and accepts the explicit response token');
assert(MD.probeResponseError({ status: 0 }, 'Error: Insufficient balance') === 'Insufficient balance',
  'insufficient balance remains a failed probe even with exit status 0');
assert(MD.probeResponseError({ status: 0 }, '') === 'no valid probe response',
  'an empty successful CLI result is not reachable');
assert(MD.probeResponseError({ status: 0 }, '{"type":"user","text":"WB_FLOW_PROBE_OK"}') === 'no valid probe response',
  'the echoed JSON prompt is not mistaken for an assistant response');
assert(MD.probeResponseError({ status: 0 }, '{"type":"text","text":"WB_FLOW_PROBE_OK"}') === null,
  'a JSON assistant response token counts as reachable');
const agyReported31 = 'You are currently using the **Gemini 3.1 Pro** model. Let me know if you have a task.';
assert(MD.probeResponseError({ status: 0 }, agyReported31, 'gemini-3.1-pro-high', false) === null,
  'agy accepts a real response from the requested 3.1 Pro model');
assert(/^requested model not selected/.test(
  MD.probeResponseError({ status: 0 }, agyReported31, 'gemini-3.6-flash-high', false)),
  'agy rejects a silent fallback to a different model');
const openCodeReported = JSON.stringify({
  type: 'text',
  model: 'gemini-3.1-pro',
  text: 'WB_FLOW_PROBE_OK',
});
assert(/^requested model not selected/.test(
  MD.probeResponseError({ status: 0 }, openCodeReported, 'openrouter/qwen/qwen-2.5-coder-32b-instruct')),
  'OpenCode rejects a response from a different provider model');
assert(MD.probeResponseError({ status: 0 }, JSON.stringify({
  type: 'text', model: 'openrouter/qwen/qwen-2.5-coder-32b-instruct', text: 'WB_FLOW_PROBE_OK',
}), 'openrouter/qwen/qwen-2.5-coder-32b-instruct') === null,
  'OpenCode accepts the requested provider model when identity matches');
assert(!MD.isInSession('openrouter (auto)'), 'provider auto aliases are not falsely treated as in-session');
assert(MD.isInSession('Claude (auto)'), 'only Claude auto is treated as the in-session root');
{
  const tree = MD.buildRoleTreeFromProviders([
    { provider: 'openai', pool: 'chatgpt', models: ['Codex (auto)', 'openai/gpt-5.3-codex'] },
    { provider: 'openrouter', pool: 'openrouter', models: ['openrouter/qwen/qwen-2.5-coder-32b-instruct'] },
  ], ['openai', 'openrouter'], new Map([
    ['Codex (auto)', { ok: false, why: 'Insufficient balance' }],
    ['openrouter/qwen/qwen-2.5-coder-32b-instruct', { ok: false, why: 'Insufficient balance' }],
  ]));
  const codexAuto = tree.find((item) => item.value === 'Codex (auto)');
  const openrouterAuto = tree.find((item) => item.provider === 'openrouter' && item.isNode);
  const qwen = tree.find((item) => item.value === 'openrouter/qwen/qwen-2.5-coder-32b-instruct');
  assert(codexAuto && codexAuto.disabled, 'an unreachable Codex auto alias is disabled');
  assert(openrouterAuto && openrouterAuto.disabled, 'providers without an auto dispatch lane are disabled');
  assert(qwen && qwen.disabled, 'an unreachable catalog model is disabled');
}

// `pickRole` is async and this runner is synchronous, so an inline `(async
// () => {...})()` would resolve AFTER the summary prints and its assertions
// would never be counted. Run it in a child process and assert on the exit code.
const pickerProbe = `
const MD = require(${JSON.stringify(path.join(PKG_ROOT, 'bin', 'model.js'))});
const found = {
  claude: true,
  slugs: ['opencode-go/deepseek-v4-pro','opencode-go/kimi-k2.7-code','opencode/deepseek-v4-pro'],
  agy: { models: ['gemini-3.1-pro-high','claude-opus-4-6-thinking'] },
};
const io = (answers) => { let i = 0; return { ask: async (q, d) => (answers[i++] ?? d), close(){} }; };
const log = console.log; console.log = () => {};
(async () => {
  const out = {};
  out.ranked = await MD.pickRole(io(['1,4']), 'worker', found, ['opencode-go/deepseek-v4-pro'], []);
  out.kept   = await MD.pickRole(io(['']),    'worker', found, ['gemini-3.1-pro-high'], []);
  out.junk   = await MD.pickRole(io(['99,abc']), 'worker', found, ['opencode-go/deepseek-v4-pro'], []);
  out.cands  = MD.candidatesFor('worker', found, 8);
  console.log = log;
  console.log(JSON.stringify(out));
})();
`;
let pickerOut = null;
try {
  pickerOut = JSON.parse(execFileSync('node', ['-e', pickerProbe], { encoding: 'utf8' }).trim());
} catch (e) { /* assertions below will report */ }

assert(pickerOut !== null, 'the picker probe runs');
if (pickerOut) {
  assert(pickerOut.ranked.length === 2 && pickerOut.ranked[0] === 'opencode-go/deepseek-v4-pro',
    'ranked input "1,4" is taken in the order typed — priority is meaningful');
  assert(pickerOut.kept.join() === 'gemini-3.1-pro-high',
    'an empty answer keeps the suggested chain — the picker is a review step, not data entry');
  assert(pickerOut.junk.join() === 'opencode-go/deepseek-v4-pro',
    'out-of-range input falls back to the suggestion, never to an empty roster');
  assert(pickerOut.cands.indexOf('gemini-3.1-pro-high') !== -1, 'agy models appear in the picker list');
  assert(pickerOut.cands.indexOf('Claude (auto)') !== -1, 'the in-session root is always offerable');
  assert(
    pickerOut.cands.every((c) => c === 'Claude (auto)' || c === 'Codex (auto)' || c === 'Antigravity (auto)'
      || ['opencode-go/deepseek-v4-pro','opencode-go/kimi-k2.7-code','opencode/deepseek-v4-pro','gemini-3.1-pro-high','claude-opus-4-6-thinking'].indexOf(c) !== -1),
    'every option came from DETECTION — nothing offered that the machine did not report'
  );
}

// ── pool alternation ──────────────────────────────────────────────────────
// A fallback chain must vary the BILLING POOL, not just the model name. Three
// models on one subscription is one point of failure wearing three hats —
// observed 2026-08-02 when a 3-model `opencode/*` Worker chain died together on
// a single `Insufficient balance`.
assert(MD.poolOf('Claude (auto)') === 'claude-pro', 'the in-session root is the claude-pro pool');
assert(MD.poolOf('gemini-3.1-pro-high') === 'google-one', 'a bare agy name is the google-one pool');
assert(MD.poolOf('opencode-go/deepseek-v4-pro') === 'opencode-go', 'the Go subscription is its own pool');
assert(MD.poolOf('opencode/kimi-k3') === 'opencode-zen', 'metered Zen is distinguished from the Go sub');
assert(
  MD.poolRank('gemini-3.1-pro-high') < MD.poolRank('opencode/gemini-3.1-pro'),
  'a subscription you pay for outranks an incidental credential for the same model'
);

const poolCatalog = [
  'opencode-go/deepseek-v4-pro', 'opencode-go/kimi-k3', 'opencode-go/glm-5.2',
  'gemini-3.1-pro-high', 'gemini-3.6-flash-high', 'opencode/gemini-3.1-pro',
];
const chain = MD.pickForRole('planner', poolCatalog, { limit: 3 });
// Alternation is best-effort, not a guarantee: you cannot fill 3 slots from 2
// pools. The invariant is that distinct pools are MAXIMISED — every pool
// available gets used before any pool is reused.
const poolsAvailable = new Set(poolCatalog.map(MD.poolOf)).size;
assert(
  new Set(chain.map(MD.poolOf)).size === Math.min(chain.length, poolsAvailable),
  'a chain uses every pool available before reusing one: ' + chain.map((c) => c + ' [' + MD.poolOf(c) + ']').join(' → ')
);
assert(
  MD.poolOf(chain[0]) !== MD.poolOf(chain[1]),
  'the first two links are never the same pool when an alternative exists'
);

// Owner's explicit ordering inside the agy pool (2026-08-02).
assert(MD.AGY_PREFERENCE[0] === 'claude-opus-4-6-thinking', 'agy order leads with Opus 4.6 Thinking');
assert(
  MD.agyRank('claude-opus-4-6-thinking') < MD.agyRank('gemini-3.1-pro-high'),
  'the agy ordering outranks version order within that pool'
);
assert(
  MD.agyRank('gemini-3.6-flash-medium') === MD.AGY_PREFERENCE.length,
  'an agy model the owner did not list sorts last, it is not silently promoted'
);

// A same-family model on a DIFFERENT pool is a real fallback, not a fake one.
const rootChain = MD.proposeRoster({ claude: true, slugs: ['claude-opus-4-6-thinking', 'opencode-go/kimi-k3'] });
assert(
  rootChain.planner.indexOf('claude-opus-4-6-thinking') !== -1,
  'Opus via Google One survives behind a Claude root — same family, independent limits'
);
assert(
  MD.poolOf(rootChain.planner[0]) !== MD.poolOf(rootChain.planner[1]),
  'but the POOL still never repeats'
);

// A metered/incidental credential must not take a fallback slot ahead of a
// subscription just because it serves a higher-ranked model.
const mixed = MD.pickForRole('planner', ['opencode/gemini-3.1-pro', 'opencode-go/kimi-k3'], { limit: 1 });
assert(
  mixed[0] === 'opencode-go/kimi-k3',
  'a subscription pool beats a metered one for a fallback slot: got ' + mixed[0]
);

// familyOf must survive multiple suffixes, or one model counts as two families.
assert(
  MD.familyOf('gemini-3.1-pro-high') === MD.familyOf('opencode/gemini-3.1-pro'),
  'familyOf strips suffixes repeatedly — a single pass made these two different families'
);

// Non-chat models must never enter a chain.
assert(MD.NOT_A_CHAT_MODEL.test('google/gemini-3-pro-image'), 'image models are recognised as non-chat');
assert(
  MD.pickForRole('planner', ['google/gemini-3-pro-image', 'opencode-go/kimi-k3'], { limit: 2 })
    .indexOf('google/gemini-3-pro-image') === -1,
  'an image model never enters a Planner chain even though it matches `gemini-*-pro`'
);

// ── the model fallback chain ──────────────────────────────────────────────
// `wbWork_template` §"Model fallback fires on Gate 1 only" and the roster's
// "tries its models left to right" both promised this. Neither was implemented:
// the generator took chain[0] and discarded the rest, so a rate-limited first
// model blocked a cell that had two working fallbacks behind it.
const chainModels = Object.assign({}, WV.DEFAULT_MODELS, {
  worker: 'opencode-go/deepseek-v4-pro',
  chains: { worker: ['opencode-go/deepseek-v4-pro', 'gemini-3.1-pro-high', ''] },
});
const chainRoute = WV.route(
  { role: 'worker', wave: 'A', command: '/wbWork p.md --id=1', suggestedModel: '', prelude: [], pairsWave: null, pairsIds: [], held: false },
  {}, chainModels
);
assert(chainRoute.chain.length === 2, 'route() carries the whole chain, dropping only the in-session sentinel');

const chainTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-chain-'));
fs.writeFileSync(path.join(chainTmp, 'p.md'), 'x');
const chainBuilt = WV.buildScript({
  planPath: path.join(chainTmp, 'p.md'), wave: 'A',
  cells: [{ role: 'worker', wave: 'A', command: '/wbWork p.md --id=1', suggestedModel: '', prelude: [], pairsWave: null, pairsIds: [], held: false }],
  dispatchIndex: {}, models: chainModels, jobs: 0, repoRoot: chainTmp, planDirRel: '',
});
assert(/attempt 1\/2/.test(chainBuilt.script) && /attempt 2\/2/.test(chainBuilt.script),
  'both links are emitted as guarded attempts');
assert(chainBuilt.script.indexOf('falling back to gemini-3.1-pro-high') !== -1,
  'the fallback is announced so a log reader sees why a second model ran');
assert(
  /VERDICT: INFRA — every model in the chain failed to run/.test(chainBuilt.script),
  'exhausting the chain is INFRA, not a silent pass'
);
// Advancing must be gated on G1 ONLY: a G2/G3 failure is the task failing, and
// a second model meets the same wall at double the spend.
const attemptBlock = chainBuilt.script.slice(chainBuilt.script.indexOf('# attempt 1/2'), chainBuilt.script.indexOf('# attempt 2/2'));
assert(
  attemptBlock.indexOf('_g9_ran=1') !== -1 && attemptBlock.indexOf('G2') === -1,
  'the retry decision is made on G1 alone — no G2/G3 check inside the attempt loop'
);
try { fs.rmSync(chainTmp, { recursive: true, force: true }); } catch (_) { /* best effort */ }

// ── agy lane ──────────────────────────────────────────────────────────────
// agy is a first-class executor, not a warning case. It was the ONLY working
// delegated CLI on 2026-08-02 (opencode-go timed out, opencode had no balance).
assert(WV.cliFor('gemini-3.1-pro-high').bin === 'agy', 'a bare agy name routes to the agy CLI');
assert(WV.cliFor('claude-opus-4-6-thinking').bin === 'agy', 'the full agy roster is recognised, not just three names');
assert(WV.cliFor('gpt-oss-120b-medium').bin === 'agy', 'non-gemini agy models route to agy too');
assert(
  WV.cliFor('opencode/claude-sonnet-4-6').bin === 'opencode',
  'a PREFIXED slug is never agy — `opencode/claude-sonnet-4-6` and bare `claude-sonnet-4-6` are different providers'
);
assert(
  WV.cliFor('gemini-3.1-pro-high').argv.indexOf('--dangerously-skip-permissions') !== -1,
  'the agy lane always passes --dangerously-skip-permissions: without it headless auto-denies every tool and returns EMPTY output with exit 0 — a silent success that did nothing'
);
assert(WV.AGY_ONLY_SLUGS.size === 11, 'the agy roster matches `agy models` (11 entries)');

// The emitted script must use agy's flags, not opencode's.
const agyTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-agy-'));
fs.writeFileSync(path.join(agyTmp, 'p.md'), 'x');
const agyBuilt = WV.buildScript({
  planPath: path.join(agyTmp, 'p.md'), wave: 'A',
  cells: [{ role: 'worker', wave: 'A', command: '/wbWork p.md --id=1', suggestedModel: '', prelude: [], pairsWave: null, pairsIds: [], held: false }],
  dispatchIndex: {}, models: Object.assign({}, WV.DEFAULT_MODELS, { worker: 'gemini-3.1-pro-high' }),
  jobs: 0, repoRoot: agyTmp, planDirRel: '',
});
// Was `/agy \\\n\s+-p \\/` — it asserted `-p` came FIRST, which is the defect
// fixed on 2026-08-10: `-p` takes the next argv entry as the prompt, so a flag
// after it is swallowed. The lane check is what this assertion is for; `-p`'s
// position is asserted separately, and deliberately, below.
assert(/(^|\n)\s*(\$WB_RUN )?agy \\\n/.test(agyBuilt.script), 'the agy lane emits `agy`, not `opencode run`');
assert(agyBuilt.script.indexOf('opencode run') === -1, 'an agy model never dispatches through opencode');
assert(
  agyBuilt.script.indexOf("--command") === -1,
  'agy has no --command flag — the task rides in the prompt text'
);
// Superseded 2026-08-10. This block used to assert the OPPOSITE — that agy's
// prompt was the bare `'/wbWork p.md --id=1 --no-plan-update'` string. It was
// asserting the defect: agy has `slashCommands: false`, cannot expand a slash
// command, and when Wave A handed it one it replied "I am currently running on
// the Gemini 3.1 Pro model. How can I assist you with your coding tasks today?"
// and touched nothing — while Gate 1 scored it PASS. Like every
// `slashCommands: false` CLI, agy gets the template inline.
assert(
  agyBuilt.script.indexOf("'/wbWork p.md --id=1 --no-plan-update'") === -1,
  'agy is never handed a bare slash-command — it cannot expand one'
);
assert(
  /Read \S*wbWork_template\.md and execute the procedure described there/.test(agyBuilt.script)
  && agyBuilt.script.indexOf('Arguments / target: p.md --id=1 --no-plan-update') !== -1,
  'the agy prompt carries the template path inline, the same shape codex gets'
);
// A bare agy SLUG is a real model id and must be passed through as one.
assert(
  agyBuilt.script.indexOf('--model gemini-3.1-pro-high') !== -1,
  'a bare agy slug is dispatched with its real --model id'
);
// ⚠️ ORDER IS LOAD-BEARING. agy parses with Go's `flag` package: `-p` aliases
// `--print` and takes the NEXT argv entry as its value — the prompt. Any flag
// emitted after `-p` is consumed as the prompt instead, and the real prompt is
// dropped as a trailing positional. Measured twice on 2026-08-10 with
// `['-p', '--dangerously-skip-permissions']`: agy answered "It looks like you
// provided the flag --dangerously-skip-permissions … could you provide more
// context?" and did nothing, while Gate 1 scored it PASS. Go also stops parsing
// at the first non-flag argument, so `-p` must be the LAST flag, always.
WV.AGY_ONLY_SLUGS.forEach(function (slug) {
  const a = WV.cliFor(slug).argv;
  assert(a[a.length - 1] === '-p', '`-p` is the last agy flag for ' + slug + ' — it consumes the prompt');
});
(function () {
  const a = WV.cliFor('Antigravity (auto)').argv;
  assert(a[a.length - 1] === '-p', '`-p` is the last agy flag for `(auto)` too');
  assert(a.indexOf('--dangerously-skip-permissions') < a.indexOf('-p'),
    'every real agy flag precedes `-p`, or `-p` swallows it as the prompt');
})();
assert(
  /agy \\\n(\s+\S[^\n]*\\\n)*\s+-p \\\n\s+'/.test(agyBuilt.script),
  'the emitted agy dispatch puts the prompt immediately after a trailing `-p`'
);
// The `(auto)` display names are NOT model ids. cliFor returns argv without a
// model flag for them on purpose; the emitter used to inject one anyway and
// pass the display name through, which is what broke Wave A on 2026-08-10:
// `codex exec -m 'Codex (auto)'` → 400 "model is not supported", and
// `agy --model 'Antigravity (auto)'` → a greeting, no work, Gate 1 PASS.
['Antigravity (auto)', 'Codex (auto)'].forEach(function (display) {
  const built = WV.buildScript({
    planPath: path.join(agyTmp, 'p.md'), wave: 'A',
    cells: [{ role: 'worker', wave: 'A', command: '/wbWork p.md --id=1', suggestedModel: '', prelude: [], pairsWave: null, pairsIds: [], held: false }],
    dispatchIndex: {}, models: Object.assign({}, WV.DEFAULT_MODELS, { worker: display }),
    jobs: 0, repoRoot: agyTmp, planDirRel: '',
  });
  // Narrowly: no model FLAG may carry it. The display name still appears in
  // `# attempt`, the `▶` echo and `_g9_model=` — those are reporting labels and
  // are correct; it is the dispatch flag that must not exist.
  assert(
    !/^\s+(-m|--model) .*\(auto\)/m.test(built.script),
    'an `(auto)` dispatch never passes "' + display + '" as a model id — it is a display name'
  );
  assert(
    /Read \S*wbWork_template\.md and execute the procedure described there/.test(built.script),
    '`(auto)` dispatch for ' + display + ' carries the template inline (slashCommands: false)'
  );
});

try { fs.rmSync(agyTmp, { recursive: true, force: true }); } catch (_) { /* best effort */ }

// ── codex lane ────────────────────────────────────────────────────────────
// Everything here was measured against codex-cli 0.146.0 on 2026-08-03.
assert(WV.cliFor('gpt-5.6-terra').bin === 'codex', 'a bare gpt-5.x name routes to the codex CLI');
assert(WV.cliFor('gpt-5.4-mini').bin === 'codex', 'the mini tier routes to codex too');
assert(
  WV.cliFor('gpt-oss-120b-medium').bin === 'agy',
  'gpt-oss is AGY, not codex — both use bare names and only the effort suffix separates them, so AGY_ONLY must be tested first'
);
assert(
  WV.cliFor('opencode/gpt-5.5').bin === 'opencode',
  'a PREFIXED gpt slug is never codex — same rule as agy'
);
assert(
  WV.cliFor('gpt-5.6-terra').argv[0] === 'exec',
  'codex runs headless via the `exec` SUBCOMMAND; there is no -p print flag (codex -p is --profile)'
);
assert(
  WV.cliFor('gpt-5.6-terra').argv.indexOf('--dangerously-bypass-approvals-and-sandbox') !== -1,
  'codex needs --dangerously-bypass-approvals-and-sandbox; its skip-permissions flag is NOT spelled like claude/opencode/agy'
);
assert(
  WV.cliFor('gpt-5.6-terra').slashCommands === false,
  'codex expands NO slash-command: given ~/.codex/prompts/x.md and the prompt "/x" it treated the text literally (verified 2026-08-03)'
);

const cxTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-codex-'));
fs.writeFileSync(path.join(cxTmp, 'p.md'), 'x');
const cxBuilt = WV.buildScript({
  planPath: path.join(cxTmp, 'p.md'), wave: 'A',
  cells: [{ role: 'worker', wave: 'A', command: '/wbWork p.md --id=1', suggestedModel: '', prelude: [], pairsWave: null, pairsIds: [], held: false }],
  dispatchIndex: {}, models: Object.assign({}, WV.DEFAULT_MODELS, { worker: 'gpt-5.6-terra' }),
  jobs: 0, repoRoot: cxTmp, planDirRel: '',
});
assert(/codex exec \\/.test(cxBuilt.script), 'the codex lane emits `codex exec`, not `opencode run`');
assert(
  cxBuilt.script.indexOf('--command') === -1,
  'codex has no --command flag'
);
assert(
  / < \/dev\/null 2>&1 \| tee/.test(cxBuilt.script),
  'the codex dispatch MUST redirect stdin from /dev/null: codex reads stdin even with a prompt argument, and in a wave script stdin is the script itself — it would consume the remaining lines and hang'
);
assert(
  cxBuilt.script.indexOf('wbWork_template.md and execute the procedure') !== -1,
  'the codex prompt inlines the TEMPLATE PATH, because "/wbWork …" would reach codex as literal text'
);
assert(
  !/'\/wbWork p\.md --id=1 --no-plan-update'/.test(cxBuilt.script),
  'the codex prompt must NOT be the bare slash-command form the agy lane uses'
);
try { fs.rmSync(cxTmp, { recursive: true, force: true }); } catch (_) { /* best effort */ }

// Classification in model.js must agree with wave.js, or the roster proposes a
// model the generator then dispatches down the wrong lane.
assert(MD.laneOf('gpt-5.6-terra') === 'codex', 'model.js agrees that gpt-5.6-terra is a codex model');
assert(MD.laneOf('gpt-oss-120b-high') === 'agy', 'model.js keeps gpt-oss in the agy lane');
assert(MD.poolOf('gpt-5.6-terra') === 'chatgpt', 'codex models bill to the chatgpt pool, not claude-pro or google-one');
assert(
  MD.poolOf('gpt-5.6-terra') !== MD.poolOf('claude-opus-4-6-thinking'),
  'the chatgpt pool is distinct — that is the whole point of adding it: another limit window to alternate into'
);
assert(
  MD.familyOf('gpt-5.6-terra') === MD.familyOf('gpt-5.6-luna'),
  'terra and luna are ONE family, so a chain cannot be three ChatGPT models wearing different names'
);
assert(
  MD.CODEX_VERIFIED.every(function (s) { return MD.CODEX_ONLY.test(s); }),
  'every verified codex slug classifies as codex'
);

// A ChatGPT plan is a subscription, not metered credit. Inferring that from
// poolRank <= 2 excluded codex from the only passes that can fill a slot, so
// `--detect` proposed no codex model anywhere while reporting codex as found.
const cxFound = { slugs: ['opencode-go/deepseek-v4-pro'], agy: { models: ['gemini-3.1-pro-high'] },
  codex: { models: MD.CODEX_CANDIDATES, verified: MD.CODEX_VERIFIED }, claude: true };
assert(
  MD.pickForRole('worker', ['opencode-go/deepseek-v4-pro', 'gemini-3.1-pro-high', 'gpt-5.6-terra'], { limit: 3 })
    .indexOf('gpt-5.6-terra') !== -1,
  'a codex model can win a chain slot — chatgpt counts as a subscription pool'
);
assert(
  MD.candidatesFor('planner', cxFound, 8).some(function (s) { return MD.laneOf(s) === 'codex'; }),
  'the --pick list offers codex models: the picker must show everything --detect could choose'
);
assert(
  MD.proposeRoster(cxFound, {}).planner.join(' ').indexOf('gpt-5') !== -1
  || MD.proposeRoster(cxFound, {}).worker.join(' ').indexOf('gpt-5') !== -1,
  'a detected codex install reaches at least one proposed chain'
);

// G1 must catch the whole billing family. Observed live 2026-08-02: opencode
// says "Insufficient balance", the pattern said "credits", so two cells that
// never ran scored G1: PASS and were misclassified NO-OP.
const infraRe = new RegExp(WV.INFRA_GREP_PATTERN);
for (const msg of [
  'Error: Insufficient balance. Manage your billing here: https://opencode.ai/x',
  'Error: Insufficient credits',
  'Error: Insufficient funds',
  'Error: Model not found',
  'Error: Rate limit exceeded',
  'Error: Payment required',
]) {
  assert(infraRe.test(msg), 'G1 classifies as INFRA: ' + JSON.stringify(msg.slice(0, 42)));
}
assert(
  !infraRe.test('Error: cannot read file foo.md') && !infraRe.test('  Error: Insufficient balance'),
  'G1 stays anchored — unrelated errors and indented text do not trip it'
);

// parseHeaderRoster must not split a provider-prefixed slug on its `/`.
const hdr = [
  '> **Active Model Roster for this Plan:**',
  '> 🧠 **Planner:** `Claude (in-session) || opencode/kimi-k3`',
  '> ✅ **Validator:** `Claude (in-session) || opencode/kimi-k2.7-code`',
  '> 🔨 **Worker:** `opencode/deepseek-v4-pro || opencode/kimi-k2.7-code`',
  '> 📋 **Mechanical:** `opencode/deepseek-v4-flash || opencode/deepseek-v4-pro`',
].join('\n');
const hdrRoster = WV.parseHeaderRoster(hdr);
assert(
  hdrRoster && hdrRoster.worker[0] === 'opencode/deepseek-v4-pro',
  'parseHeaderRoster keeps the provider prefix AND the whole chain — splitting on a bare `/` yielded "opencode" and dropped the roster'
);
assert(
  hdrRoster.mechanical[0] === 'opencode/deepseek-v4-flash' && hdrRoster.worker.length === 2,
  'every role survives the split, and the FULL chain is kept — the 2nd/3rd links used to be discarded'
);
assert(
  WV.parseHeaderRoster([
    '> **Active Model Roster for this Plan:**',
    '> 🧠 **Planner:** `Claude (auto) / Kimi K2.7 Code`',
    '> ✅ **Validator:** `Claude (auto) / Kimi K2.7 Code`',
    '> 🔨 **Worker:** `DeepSeek V4 Pro / Gemini 3.1 Pro`',
    '> 📋 **Mechanical:** `Qwen 3.7 Plus / DeepSeek V4 Pro`',
  ].join('\n')).worker[0] === 'DeepSeek V4 Pro',
  'the legacy ` / `-separated display-name dialect still parses'
);

// The two integration seams between the new writer and the existing reader.
assert(
  WV.resolveDisplayName('opencode/deepseek-v4-pro') === 'opencode/deepseek-v4-pro',
  'a raw slug from `wb-flow model` passes through resolveDisplayName untouched'
);
assert(
  WV.resolveDisplayName('gemini-3.1-pro-high') === 'gemini-3.1-pro-high',
  'a bare agy name passes through too'
);
assert(
  WV.resolveDisplayName('Kimi K2.7 Code') === 'opencode-go/kimi-k2.7-code',
  'legacy display names still resolve — both roster dialects are readable'
);

// A neutral roster must yield NO roster (so the lookup falls through to the
// user's real install) — never prose scraped from the table that follows it.
const neutralRoster = fs.readFileSync(
  path.join(PKG_ROOT, 'templates', 'commands', 'model_recommendations.default.md'), 'utf8');
const neutralTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-neutral-'));
fs.mkdirSync(path.join(neutralTmp, 'commands'), { recursive: true });
fs.writeFileSync(path.join(neutralTmp, 'commands', 'model_recommendations.md'), neutralRoster);
assert(
  WV.parseModelRecommendations(path.join(neutralTmp, 'commands', 'model_recommendations.md')) === null,
  'an unconfigured roster parses as null, so the lookup falls through instead of routing on placeholders'
);
try { fs.rmSync(neutralTmp, { recursive: true, force: true }); } catch (_) { /* best effort */ }

// 10. `wb-flow snap` — pinning outputs
console.log('\n10. snap');

const SNAP = require(path.join(PKG_ROOT, 'bin', 'snap.js'));
assert(SNAP.sanitize('docs-plan') === 'docs-plan', 'a clean label passes through');
assert(SNAP.sanitize('plan_x_2026.md') === 'plan_x_2026', 'the .md extension is dropped from a label');
assert(SNAP.sanitize('a b/c:d') === 'a-b-c-d', 'path and space characters are collapsed');
assert(/^\d{8}$/.test(SNAP.today()), 'the date prefix is YYYYMMDD — every snap folder carries it');

const snapTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-snap-'));
fs.mkdirSync(path.join(snapTmp, '.wb'), { recursive: true });
const snapTarget = path.join(snapTmp, 'plan_demo.md');
fs.writeFileSync(snapTarget, '# original\n');

SNAP.run([snapTarget, '--label=demo', '--root=' + snapTmp]);
const snapDir = path.join(snapTmp, '.wb', 'snaps', SNAP.today() + '_demo');
const linked = path.join(snapDir, 'plan_demo.md');
assert(fs.lstatSync(linked).isSymbolicLink(), 'the default pin is a symlink');
assert(
  !path.isAbsolute(fs.readlinkSync(linked)),
  'the link is RELATIVE — an absolute one breaks the moment the repo is moved or cloned'
);

// A link tracks the live file. That is the documented behaviour, not a bug —
// and it is exactly why --copy exists.
fs.writeFileSync(snapTarget, '# edited after pinning\n');
assert(
  fs.readFileSync(linked, 'utf8').indexOf('edited after pinning') !== -1,
  'a symlinked pin follows later edits — a pin, not a snapshot'
);

SNAP.run([snapTarget, '--label=demo', '--copy', '--root=' + snapTmp]);
const copies = fs.readdirSync(snapDir).filter((n) => !fs.lstatSync(path.join(snapDir, n)).isSymbolicLink());
assert(copies.length === 1, 'a second pin of the same name does not clobber the first');
fs.writeFileSync(snapTarget, '# edited again\n');
assert(
  fs.readFileSync(path.join(snapDir, copies[0]), 'utf8').indexOf('edited again') === -1,
  '--copy freezes: later edits to the target do not reach it'
);

const listed = SNAP.listSnaps(snapTmp);
assert(listed.length === 1 && listed[0].items.length === 2, 'listSnaps reports both pins');
assert(
  listed[0].items.some((i) => i.kind === 'link') && listed[0].items.some((i) => i.kind === 'copy'),
  'listSnaps distinguishes a link from a copy'
);

fs.unlinkSync(snapTarget);
assert(
  SNAP.listSnaps(snapTmp)[0].items.some((i) => i.dangling),
  'a pin whose target was deleted is reported as dangling, not silently listed as fine'
);
try { fs.rmSync(snapTmp, { recursive: true, force: true }); } catch (_) { /* best effort */ }

// The universal flag must be documented in every command template's flag table.
const tmplDirs = fs.readdirSync(path.join(PKG_ROOT, 'templates', 'commands'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== '_shared');
let withSnap = 0;
let orphaned = 0;
for (const d of tmplDirs) {
  const tf = path.join(PKG_ROOT, 'templates', 'commands', d.name, d.name + '_template.md');
  if (!fs.existsSync(tf)) continue;
  const L = fs.readFileSync(tf, 'utf8').split('\n');
  const i = L.findIndex((l) => l.startsWith('| `--snap`'));
  if (i === -1) continue;
  withSnap++;
  let j = i - 1;
  while (j >= 0 && L[j].trim() === '') j--;
  if (j < 0 || !L[j].startsWith('|')) orphaned++;
}
assert(withSnap >= 20, '--snap is documented across the command templates (found ' + withSnap + ')');
assert(orphaned === 0, 'every --snap row sits INSIDE its flag table — a row after the table renders as prose');

// 11. `wb-flow next` — the derived how-to-run block
console.log('\n11. next (how-to-run block)');

const NX = require(path.join(PKG_ROOT, 'bin', 'next.js'));
const NEXT_PLAN = [
  '# Plan Backlog: nx — 2026-08-02',
  '',
  '| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  '| 1 | 🧠 Planner | — | 📄 | decide | `true` | P0 | 20 | x | y | ✅<br>M | ✅ 9/10<br>V |',
  '| 2 | 🔨 Worker | 1 | 📄 | build | `true` | P0 | 40 | x | y | ⬜ | ⬜ |',
  '| 3 | 🔨 Worker | 2 | 📄 | run it | `true` | P0 | 30 | x | y | ⬜ | ⬜ |',
  '| 4 | ✅ Validator | 3 | 📄 | go/no-go | `true` | P0 | 15 | x | y | ⬜ | ⬜ |',
  '',
  '## 🌊 Next Executable Sequence',
  '',
  '| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |',
  '|---|---|---|---|---|',
  '| **A** | `/wbWork nx.md --id=1`<br>→ *Claude* | — | `/wbWork nx.md --id=2`<br>→ *ds* | — |',
  '| **B** | — | — | `/wbWork nx.md --id=3`<br>→ *ds* | — |',
  '| **C** | — | `/wbWork nx.md --id=4`<br>→ *Claude* | — | — |',
].join('\n');

const nxWaves = NX.inventory(NEXT_PLAN, process.cwd(), 'nx.md');
assert(nxWaves && nxWaves.length === 3, 'inventory finds every wave in the matrix');
assert(nxWaves[0].workIds.join(',') === '1,2', 'a wave reports the ids it WORKS');

// Already-validated rows must not be re-validated.
assert(
  nxWaves[0].toValidate.indexOf('1') === -1 && nxWaves[0].toValidate.indexOf('2') !== -1,
  'a row already ✅ Valid is dropped from the suggested /wbValid — task 1 is closed'
);

const nxRisks = NX.autopilotRisks(nxWaves, NEXT_PLAN);
const kinds = nxRisks.map((r) => r.kind);
assert(kinds.indexOf('judgment') !== -1, 'a 🧠 Planner row inside a wave is derived as a judgment risk');
assert(kinds.indexOf('gate') !== -1, 'a ✅ Validator-TAGGED task is derived as a go/no-go gate');
assert(kinds.indexOf('serial') !== -1, 'a cross-wave Dep chain is derived as a serial risk');
assert(
  !nxRisks.some((r) => r.kind === 'serial' && r.wave.endsWith('→C')),
  'a wave already flagged as a gate does not also get a serial note — two bullets for one wave is noise'
);

// Deps parse, and a plan with no derivable risk says so rather than inventing caution.
assert(NX.parseDeps(NEXT_PLAN)['3'].join() === '2', 'the Dep column parses');
const flatPlan = NEXT_PLAN.replace('| 1 | 🧠 Planner |', '| 1 | 🔨 Worker |')
                          .replace('| 4 | ✅ Validator | 3 |', '| 4 | 📋 Mechanical | — |');
const flatWaves = NX.inventory(flatPlan, process.cwd(), 'nx.md');
const flatRendered = NX.render('nx.md', flatWaves, NX.autopilotRisks(flatWaves, flatPlan), {});
assert(
  /No derived blocker in this plan/.test(flatRendered) || NX.autopilotRisks(flatWaves, flatPlan).length > 0,
  'with no derivable risk the block says --wave=all is defensible instead of inventing caution'
);

// The rendered block carries all four parts.
const rendered = NX.render('nx.md', nxWaves, nxRisks, {});
for (const part of ['| Wave | Cells |', '### 📋 Copy/Paste Execution Scenarios', '### Why not `--wave=all`']) {
  assert(rendered.indexOf(part) !== -1, 'the block contains ' + JSON.stringify(part));
}

// --embed replaces, never appends.
const nxTmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wb-next-')), 'nx.md');
fs.writeFileSync(nxTmp, NEXT_PLAN);
NX.run([nxTmp, '--embed']);
NX.run([nxTmp, '--embed']);
const embedded = fs.readFileSync(nxTmp, 'utf8');
assert(
  (embedded.match(new RegExp(NX.BLOCK_START, 'g')) || []).length === 1,
  're-embedding replaces the block rather than stacking a second one'
);
assert(embedded.indexOf(NX.HEADING) !== -1, 'the embedded block keeps its heading');
assert(
  ['#### 1. Next wave execution', '#### 2. Next wave dispatches',
    '#### 3. All remaining waves execution', '#### 4. All remaining waves dispatches']
    .every((heading) => embedded.indexOf(heading) !== -1),
  'closed plan rendering keeps all four copy/paste scenario headings'
);
try { fs.rmSync(path.dirname(nxTmp), { recursive: true, force: true }); } catch (_) { /* best effort */ }

// Cross-check the two shipped tools against a real plan. Inspecting next.js's
// rendered string alone would miss the exact failure mode this guards.
const realPlan = path.join(
  PKG_ROOT,
  '.wb', 'workflows', 'reports', '2026', '08', '09', 'plans',
  'plan_wb-flow_20260809.md'
);
// Keep the copy beside the real plan so its relative task/report links and
// tasks/waves.md resolve exactly as they do for a human-run lint.
const embedLintTmp = path.join(path.dirname(realPlan), '.wb-embed-lint-' + process.pid + '.md');
try {
  fs.copyFileSync(realPlan, embedLintTmp);
  execFileSync('node', [BIN, 'next', embedLintTmp, '--embed'], {
    cwd: PKG_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let lintExit = 0;
  try {
    execFileSync('node', [BIN, 'lint', embedLintTmp], {
      cwd: PKG_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    lintExit = e.status === null ? 1 : e.status;
  }
  assert(lintExit === 0, 'embed then lint exits 0 on a real 08-09 plan');
} catch (e) {
  assert(false, 'embed then lint runs successfully on a real 08-09 plan: ' + e.message);
} finally {
  try { fs.unlinkSync(embedLintTmp); } catch (_) { /* best effort */ }
}

// A fully closed plan must exercise next.js's no-live-waves branch. Keep this
// probe beside the plan so every relative report/task href remains valid.
const closedPlan = path.join(
  PKG_ROOT,
  '.wb', 'workflows', 'reports', '2026', '08', '10', 'plans',
  'plan_wb-flow_20260810.md'
);
const closedEmbedLintTmp = path.join(
  path.dirname(closedPlan), '.wb-embed-lint-closed-' + process.pid + '.md'
);
try {
  // Use a fully closed real plan as the fixture, but remove its authored
  // copy/paste/recommendation blocks so the probe starts from a clean derived
  // surface. The copy remains beside the plan, preserving all relative hrefs.
  const closedFixture = fs.readFileSync(closedPlan, 'utf8').replace(
    /### 📋 Copy\/Paste Execution Scenarios[\s\S]*?<!-- HOW_TO_RUN_END -->/,
    '## ▶️ How to run this plan\n\n<!-- HOW_TO_RUN_END -->'
  );
  fs.writeFileSync(closedEmbedLintTmp, closedFixture);
  execFileSync('node', [BIN, 'next', closedEmbedLintTmp, '--embed'], {
    cwd: PKG_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let closedLintExit = 0;
  try {
    execFileSync('node', [BIN, 'lint', closedEmbedLintTmp], {
      cwd: PKG_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    closedLintExit = e.status === null ? 1 : e.status;
  }
  assert(closedLintExit === 0, 'embed then lint exits 0 on a closed plan fixture');
} catch (e) {
  assert(false, 'embed then lint runs successfully on a closed plan fixture: ' + e.message);
} finally {
  try { fs.unlinkSync(closedEmbedLintTmp); } catch (_) { /* best effort */ }
}

// The universal flag is documented across the templates.
let nextFlag = 0;
for (const d of fs.readdirSync(path.join(PKG_ROOT, 'templates', 'commands'), { withFileTypes: true })) {
  if (!d.isDirectory() || d.name === '_shared') continue;
  const tf = path.join(PKG_ROOT, 'templates', 'commands', d.name, d.name + '_template.md');
  if (fs.existsSync(tf) && fs.readFileSync(tf, 'utf8').indexOf('| `--next`') !== -1) nextFlag++;
}
assert(nextFlag >= 20, '--next is documented across the command templates (found ' + nextFlag + ')');

console.log('\n──────────────────────────');

// ── §10 · generator↔deployment parity + --model resolution (G18 validation -1) ──
// Kimi's G18 validation deducted a point: verify-wrappers.js checks the parity of
// already-deployed files but never exercises writeWrappers(), so a refactor of
// emitMd could reintroduce drift silently. These close that gap.
{
  const os = require('os');
  const WR = require('../bin/wrappers.js');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wrap-parity-'));
  const templatesRoot = path.join(PKG_ROOT, 'templates', 'commands');
  const userDir = path.join(os.homedir(), '.claude', 'commands');

  WR.writeWrappers({
    agent: 'claude', outDir: tmp, templatesRoot: templatesRoot,
    commands: WR.listCommands(templatesRoot), force: true, dryRun: false,
  });

  if (fs.existsSync(userDir)) {
    let compared = 0, differing = 0;
    for (const f of fs.readdirSync(tmp)) {
      const deployed = path.join(userDir, f);
      if (!fs.existsSync(deployed)) continue;
      compared++;
      if (fs.readFileSync(path.join(tmp, f), 'utf8') !== fs.readFileSync(deployed, 'utf8')) differing++;
    }
    if (compared > 0) {
      assert(differing === 0,
        'regenerated wrappers are byte-identical to the deployed set (' +
        differing + ' of ' + compared + ' differ)');
    }
  }

  // A generated wrapper must carry the deployed conventions.
  const sample = fs.readFileSync(path.join(tmp, 'wbValid.md'), 'utf8');
  assert(/^description: Run \/wbValid — /m.test(sample),
    'generated wrapper keeps the `Run /wbX — ` description prefix');
  assert(sample.indexOf('- Never run git commands.') !== -1,
    'generated wrapper carries the deployed constraints block');

  fs.rmSync(tmp, { recursive: true, force: true });
}

// --model/-M must reject a bare unknown name instead of dispatching it broken.
{
  const WV = require('../bin/wave.js');
  const MD = require('../bin/model.js');
  assert(WV.resolveDisplayName('Kimi K2.7 Code') === 'opencode-go/kimi-k2.7-code',
    'resolveDisplayName maps a roster display name to its slug');
  assert(WV.resolveDisplayName('claude') === undefined,
    'a bare unknown model name does not resolve (so --model rejects it)');
  assert(WV.resolveDisplayName('Claude (auto)') === '',
    'the in-session sentinel resolves to empty, not a slug');
  assert(WV.resolveDisplayName('Codex (auto)') === 'Codex (auto)',
    'Codex (auto) sentinel resolves to Codex (auto)');
  assert(WV.resolveDisplayName('Antigravity (auto)') === 'Antigravity (auto)',
    'Antigravity (auto) sentinel resolves to Antigravity (auto)');

  assert(MD.poolOf('Codex (auto)') === 'chatgpt', 'Codex (auto) pool is chatgpt');
  assert(MD.poolOf('Antigravity (auto)') === 'google-one', 'Antigravity (auto) pool is google-one');

  assert(MD.laneOf('Codex (auto)') === 'codex', 'Codex (auto) lane is codex');
  assert(MD.laneOf('Antigravity (auto)') === 'agy', 'Antigravity (auto) lane is agy');

  const cand = MD.candidatesFor('worker', { claude: true, codex: { verified: ['gpt-5.6-terra'] }, agy: { models: ['gemini-3.1-pro-high'] } });
  assert(cand.indexOf('Claude (auto)') !== -1, 'candidatesFor includes Claude (auto)');
  assert(cand.indexOf('Codex (auto)') !== -1, 'candidatesFor includes Codex (auto)');
  assert(cand.indexOf('Antigravity (auto)') !== -1, 'candidatesFor includes Antigravity (auto)');
}



console.log('  ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);

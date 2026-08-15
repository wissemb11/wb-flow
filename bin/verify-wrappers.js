#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');

function findMonorepoRoot(startDir) {
  let current = startDir;
  while (current !== path.dirname(current)) {
    if (
      fs.existsSync(path.join(current, '.claude', 'commands')) ||
      fs.existsSync(path.join(current, '.git'))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

const MONOREPO_ROOT = findMonorepoRoot(PKG_ROOT);
const HOME = os.homedir();

const TEMPLATES_DIR = path.join(PKG_ROOT, 'templates', 'commands');

const USER_CLAUDE = path.join(HOME, '.claude', 'commands');
const USER_OPENCODE = path.join(HOME, '.config', 'opencode', 'command');
const REPO_CLAUDE = MONOREPO_ROOT ? path.join(MONOREPO_ROOT, '.claude', 'commands') : null;
const REPO_OPENCODE = MONOREPO_ROOT ? path.join(MONOREPO_ROOT, '.config', 'opencode', 'command') : null;

const CLAUDE_DIR = fs.existsSync(USER_CLAUDE) ? USER_CLAUDE : REPO_CLAUDE;
const OPENCODE_DIR = fs.existsSync(USER_OPENCODE) ? USER_OPENCODE : REPO_OPENCODE;

if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error('❌ Templates dir not found');
  process.exit(1);
}

if (!CLAUDE_DIR || !OPENCODE_DIR || !fs.existsSync(CLAUDE_DIR) || !fs.existsSync(OPENCODE_DIR)) {
  console.log('⚠️ SKIPPED (not PASSED) — wrapper directories not found' + (MONOREPO_ROOT ? ' at ' + MONOREPO_ROOT + ' or ' + HOME : ' (no monorepo root or home dir found)') + '.');
  process.exit(0);
}

const manifestPath = path.join(TEMPLATES_DIR, 'wb_commands_reference.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const commands = Object.keys(manifest);

let errors = 0;

console.log('🔍 Verifying wrapper parity across clients...');

for (const cmd of commands) {
  // Check Claude
  const claudeFile = path.join(CLAUDE_DIR, `${cmd}.md`);
  if (!fs.existsSync(claudeFile)) {
    console.error(`  ✗ Missing Claude wrapper: ${cmd}.md`);
    errors++;
  }
  
  // Check OpenCode
  const opencodeFile = path.join(OPENCODE_DIR, `${cmd}.md`);
  if (!fs.existsSync(opencodeFile)) {
    console.error(`  ✗ Missing OpenCode wrapper: ${cmd}.md`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ Wrapper drift detected: ${errors} missing wrapper(s).`);
  process.exit(1);
}

console.log('✅ Wrapper parity confirmed (100% coverage).');
process.exit(0);

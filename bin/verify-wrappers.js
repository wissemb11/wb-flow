#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
// Note: we are currently executing inside frontEnd/wbc-ui/core2/packages/wb-flow/
// The wrappers are 5 levels up in the project root.
const MONOREPO_ROOT = path.resolve(PKG_ROOT, '..', '..', '..', '..', '..');

const TEMPLATES_DIR = path.join(PKG_ROOT, 'templates', 'commands');
const CLAUDE_DIR = path.join(MONOREPO_ROOT, '.claude', 'commands');
const OPENCODE_DIR = path.join(MONOREPO_ROOT, '.config', 'opencode', 'command');

if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error('❌ Templates dir not found');
  process.exit(1);
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

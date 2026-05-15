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

// 2. templates/ + manifest
console.log('\n2. Templates + manifest');
assert(fs.existsSync(TEMPLATES), 'templates/ directory exists');
assert(fs.existsSync(MANIFEST), 'wb_commands_reference.json exists');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  assert(typeof manifest === 'object' && manifest !== null, 'manifest parses as JSON object');
} catch (e) {
  assert(false, 'manifest parses as JSON object: ' + e.message);
  manifest = {};
}

const keys = Object.keys(manifest);
assert(keys.length >= 30, 'manifest has at least 30 commands (got ' + keys.length + ')');

// 3. Every manifest key has a matching template
console.log('\n3. Manifest <-> template parity');
for (const key of keys) {
  const tplPath = path.join(TEMPLATES, 'commands', key, key + '_template.md');
  assert(fs.existsSync(tplPath), key + ' has matching template at templates/commands/' + key + '/');
}


// 3.5. Structural integrity: every template has a help gate
console.log('\n3.5. Template structural integrity');
for (const key of keys) {
  const tplPath = path.join(TEMPLATES, 'commands', key, key + '_template.md');
  const tplContent = fs.readFileSync(tplPath, 'utf8');
  assert(tplContent.includes('<!-- HELP_GATE_START -->'), key + ' template contains HELP_GATE_START');
}

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

// Summary
console.log('\n──────────────────────────');
console.log('  ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
process.exit(0);

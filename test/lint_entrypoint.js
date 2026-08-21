'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const BIN = path.resolve(__dirname, '..', 'bin', 'lint.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-lint-entry-'));
const plan = path.join(tmp, 'broken.md');
fs.writeFileSync(plan, '# Plan Backlog: x — 2026-01-01\n');

let code = 0;
try {
  cp.execFileSync(process.execPath, [BIN, plan], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch (err) {
  code = err.status === null ? 1 : err.status;
}

assert.notStrictEqual(code, 0, 'direct node bin/lint.js invocation runs checks and fails a broken plan');
fs.rmSync(tmp, { recursive: true, force: true });
console.log('🧪 lint.js entrypoint');
console.log('  ✓ direct invocation executes run()');
console.log('1 passed, 0 failed');

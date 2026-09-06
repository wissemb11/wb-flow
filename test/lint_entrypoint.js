'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const BIN = path.resolve(__dirname, '..', 'bin', 'lint.js');
const L = require(BIN);
const FIX = path.resolve(__dirname, 'fixtures');
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

for (const key of ['parseTaskTable', 'isOpen', 'normalizeTaskText', 'splitRow']) {
  assert.strictEqual(typeof L[key], 'function', 'lint.js exports ' + key);
}

// Fixtures live as checked-in, never-edited samples under test/fixtures/.
// Earlier revisions read live plan files from `.wb/workflows/reports/...`;
// `wb-flow archive` moves whole <DD>/ folders into `archives/`, so any
// `/wbWork` that edits one of those live files could turn this suite, and
// therefore `prepublishOnly`, red for reasons unrelated to `lint.js`. The
// fixtures below were copied verbatim on 2026-09-06 from those live files
// and pinned here so the suite tests the parser, not the corpus.
const legacySrc   = fs.readFileSync(path.join(FIX, 'plan_legacy_tasklist.md'), 'utf8');
const alphaSrc    = fs.readFileSync(path.join(FIX, 'plan_alpha_ids.md'), 'utf8');
const v54Src      = fs.readFileSync(path.join(FIX, 'plan_v54.md'), 'utf8');

const legacyRows = L.parseTaskTable(legacySrc);
assert(legacyRows.find((r) => r.id === '7'), 'pre-v5 TASK LIST heading is parsed');

const alphaRows = L.parseTaskTable(alphaSrc);
const c1 = alphaRows.find((r) => r.id === 'C1');
assert(c1, 'alphanumeric id C1 is parsed');
assert(/Repair/.test(c1.task), 'task text is read by header name, not fixed position');

const v54Rows = L.parseTaskTable(v54Src);
assert.strictEqual(v54Rows.length, 2, 'v5.4 task table still returns exactly two rows');

assert.strictEqual(L.isOpen.length >= 2, true, 'isOpen accepts Done and Valid columns');
assert.strictEqual(L.isOpen('⬜', '✅'), true, 'open Done is reported');
assert.strictEqual(L.isOpen('✅', '⬜'), true, 'open Valid is reported');
assert.strictEqual(L.isOpen('🚫 Cancelled', '🚫 n/a'), false, 'cancelled rows are decided');
assert.strictEqual(L.isOpen('⏸️ Deferred', '⏸️ Deferred'), false, 'deferred rows are decided');
assert.strictEqual(L.isOpen('✅', '✅ 10/10'), false, 'closed rows are not open');

const a = 'a [x](p/q.md) b';
const b = 'a [x](../z/q.md) b';
assert.strictEqual(L.normalizeTaskText(a), L.normalizeTaskText(b), 'task normalization ignores markdown hrefs');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('🧪 lint.js entrypoint');
console.log('  ✓ direct invocation executes run()');
console.log('  ✓ task-table parser handles legacy headings, alpha ids, and named columns');
console.log('  ✓ isOpen checks Done and Valid together');
console.log('  ✓ task normalization is href-insensitive');
console.log('4 passed, 0 failed');

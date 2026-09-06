#!/usr/bin/env node
'use strict';

const assert = require('assert');
const M = require('../bin/model.js');

console.log('🧪 model enumeration integration');

const supported = ['opencode', 'agy', 'codex', 'grok', 'claude'].filter(M.hasCLI);
if (!supported.length) {
  console.log('  SKIP: no supported model CLIs found on PATH');
  process.exit(0);
}

const found = M.detect({ noEnum: false });
assert.ok(found && typeof found === 'object', 'detect() returns a result object');

if (supported.indexOf('opencode') !== -1) {
  assert.ok(found.opencode === null || typeof found.opencode.total === 'number',
    'opencode enumeration reports a numeric total when it answers');
}
if (supported.indexOf('agy') !== -1) {
  assert.ok(found.agy === null || Array.isArray(found.agy.models),
    'agy enumeration reports a model list when it answers');
  assert.ok(!((found.agy && found.agy.models) || []).some((m) => String(m).indexOf('\t') !== -1),
    'agy enumeration strips display names from slugs');
}
if (supported.indexOf('codex') !== -1) {
  assert.ok(found.codex && found.codex.enumerable === false,
    'codex is represented by curated candidates, not a fake live list');
}

console.log('  ✓ enumerated available CLIs: ' + supported.join(', '));

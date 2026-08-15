#!/usr/bin/env node

/**
 * Docs repair invariants test.
 *
 * Asserts four repaired-state invariants across both docs trees.
 * Exit 0 = clean, exit 1 = one or more invariant violations found.
 */

const fs = require('fs');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const CORE_DOCS = path.join(PKG_ROOT, 'docs');
const SITE_ROOT = path.resolve(PKG_ROOT, '..', 'documentation', 'flow.wbc-ui.com');
const SITE_DOCS = path.join(SITE_ROOT, 'docs');

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log('  \u2713 ' + msg);
  } else {
    failed++;
    failures.push(msg);
    console.log('  \u2717 ' + msg);
  }
}

function walkDir(dir) {
  const results = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (_) {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else {
        results.push(full);
      }
    }
  }
  return results;
}

function findFiles(dir, pattern) {
  return walkDir(dir).filter(function (f) { return pattern.test(f); });
}

console.log('\u{1F9EA} docs repair invariants test\n');

console.log('Docs trees under test:');
console.log('  core/docs: ' + (fs.existsSync(CORE_DOCS) ? 'present' : 'MISSING'));
console.log('  site/docs: ' + (fs.existsSync(SITE_DOCS) ? 'present' : 'MISSING'));
console.log('');

// ── 1. No MERGED CONTENT FROM markers in either docs tree ──

console.log('1. MERGED CONTENT FROM markers');

var trees = [CORE_DOCS, SITE_DOCS];
var inv1_clean = true;

trees.forEach(function (tree) {
  if (!fs.existsSync(tree)) return;
  var files = walkDir(tree);
  files.forEach(function (f) {
    if (!/\.md$/i.test(f)) return;
    try {
      var content = fs.readFileSync(f, 'utf8');
      if (/MERGED CONTENT FROM/.test(content)) {
        inv1_clean = false;
      }
    } catch (_) {
      /* skip unreadable */
    }
  });
});

assert(inv1_clean, 'no MERGED CONTENT FROM markers in either docs tree');

// ── 2. No _partN.md files in either docs tree ──

console.log('\n2. _partN.md files');

var partPattern = /[\\/]_part\d+\.md$/i;
var inv2_clean = true;

trees.forEach(function (tree) {
  if (!fs.existsSync(tree)) return;
  var files = walkDir(tree);
  files.forEach(function (f) {
    if (partPattern.test(f)) {
      inv2_clean = false;
    }
  });
});

assert(inv2_clean, 'no _partN.md files in either docs tree');

// ── 3. No _partN.md link text or targets in either docs tree ──

console.log('\n3. _partN.md link references in file contents');

var linkPattern = /(^|[^a-zA-Z])_part\d+\.md/i;
var inv3_clean = true;

trees.forEach(function (tree) {
  if (!fs.existsSync(tree)) return;
  var files = walkDir(tree);
  files.forEach(function (f) {
    if (!/\.md$/i.test(f)) return;
    try {
      var content = fs.readFileSync(f, 'utf8');
      if (linkPattern.test(content)) {
        inv3_clean = false;
      }
    } catch (_) {
      /* skip unreadable */
    }
  });
});

assert(inv3_clean, 'no _partN.md link text or targets in either docs tree');

// ── 4. No site command README.md byte-identical to its sibling index.md ──

console.log('\n4. Site README.md / index.md byte-identical pairs');

var inv4_clean = true;
var identicalPairs = [];

if (fs.existsSync(SITE_DOCS)) {
  var siteFiles = walkDir(SITE_DOCS);
  siteFiles.forEach(function (f) {
    var rel = path.relative(SITE_DOCS, f);
    if (!rel.startsWith('commands/') || !/\/README\.md$/i.test(f)) return;
    var dir = path.dirname(f);
    var idx = path.join(dir, 'index.md');
    if (!fs.existsSync(idx)) return;
    try {
      var readmeBuf = fs.readFileSync(f);
      var idxBuf = fs.readFileSync(idx);
      if (readmeBuf.equals(idxBuf)) {
        inv4_clean = false;
        identicalPairs.push(path.relative(SITE_ROOT, f));
      }
    } catch (_) {
      /* skip unreadable */
    }
  });
}

if (identicalPairs.length > 0) {
  assert(false, 'no site README.md byte-identical to its sibling index.md (found ' + identicalPairs.length + '): ' + identicalPairs.join(', '));
} else {
  assert(true, 'no site README.md byte-identical to its sibling index.md');
}

// ── Summary ──

console.log('\n' + '='.repeat(40));
console.log('passed: ' + passed + '  failed: ' + failed);

if (failed > 0) {
  console.error('\nFAILURES:');
  failures.forEach(function (msg) { console.error('  - ' + msg); });
  process.exit(1);
}

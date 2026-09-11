'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const OUTPUT_CONVENTIONS = path.join(PKG_ROOT, 'templates', 'commands', '_shared', 'output_conventions.md');

const content = fs.readFileSync(OUTPUT_CONVENTIONS, 'utf8');
const sectionMatch = content.match(/## 8\. Target Resolution & Initialization Protocol[\s\S]*?(?=\n## 9\.)/);

assert.ok(sectionMatch, '§8 target resolution section exists');

const section = sectionMatch[0];

assert.match(
  section,
  /0\.\s+\*\*Nearest Existing `?\.wb\/?`? Wins:\*\*/i,
  '§8 starts with a rule 0 for nearest existing .wb scope resolution',
);
assert.match(
  section,
  /walking up .*nearest existing `?\.wb\/?`?/i,
  '§8 tells commands to walk up to the nearest .wb ancestor',
);
assert.match(
  section,
  /Create a new `?\.wb\/?`? at the literal target only when no ancestor has one/i,
  '§8 forbids creating nested .wb scopes when an ancestor .wb exists',
);

const rule0 = section.indexOf('0. **Nearest Existing');
const rule1 = section.indexOf('1. **Monorepo Root');
assert.ok(rule0 !== -1 && rule1 !== -1 && rule0 < rule1, 'the .wb walk-up rule precedes monorepo/sub-package routing');

console.log('output conventions scope resolution invariant passed');

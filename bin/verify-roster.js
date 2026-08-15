#!/usr/bin/env node
/**
 * bin/verify-roster.js — prepublish guard: never ship someone else's models.
 *
 * `templates/commands/model_recommendations.md` is copied verbatim into every
 * install. If it leaves here with a populated roster, every user inherits the
 * packager's subscriptions — models they hold no credential for. That does not
 * fail at install where it would be visible; it fails much later as a wave cell
 * dying at G1 with `Error: Model not found`, or one that simply hangs.
 *
 * The shipped file must be the neutral skeleton. A real roster belongs in the
 * INSTALL, written by `wb-flow model --detect` from what the user can reach.
 *
 * Run by `prepublishOnly`, not by `npm test`: a populated roster is correct
 * during development and wrong only at the moment of publishing.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const MODEL = require('./model.js');

const shipped = path.join(__dirname, '..', 'templates', 'commands', 'model_recommendations.md');
const neutral = path.join(__dirname, '..', 'templates', 'commands', 'model_recommendations.default.md');

function fail(lines) {
  console.error('\n❌ Roster guard: refusing to publish.\n');
  for (const l of lines) console.error('   ' + l);
  console.error('');
  process.exit(1);
}

if (!fs.existsSync(neutral)) {
  fail(['Missing ' + path.relative(process.cwd(), neutral),
        'The neutral default is what a fresh install seeds from.']);
}

if (!fs.existsSync(shipped)) {
  console.log('✅ Roster guard: no shipped roster (installs seed from the default).');
  process.exit(0);
}

const text = fs.readFileSync(shipped, 'utf8');
const roster = MODEL.readRoster(text);
const populated = roster
  ? MODEL.ROLE_ORDER.filter((r) => (roster[r] || []).length > 0)
  : [];

if (populated.length) {
  fail([
    path.relative(process.cwd(), shipped) + ' ships a POPULATED roster:',
    '',
    ...populated.map((r) => '  ' + r.padEnd(11) + (roster[r] || []).join(' / ')),
    '',
    'Every user who installs this package inherits those models.',
    'Fix: replace the shipped file with the neutral default —',
    '',
    '  cp templates/commands/model_recommendations.default.md \\',
    '     templates/commands/model_recommendations.md',
    '',
    'and keep your own roster in the install (~/.wb-flow/commands/ or .wb/commands/),',
    'where `wb-flow model --detect` writes it.',
  ]);
}

console.log('✅ Roster guard: shipped roster is neutral.');

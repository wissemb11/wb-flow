#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const want = 'RELEASE_' + pkg.version + '.md';
const files = Array.isArray(pkg.files) ? pkg.files : [];

const literals = files.filter((f) => /^RELEASE_[0-9]/.test(String(f)));
if (literals.length) {
  console.error('files[] hardcodes versioned release notes: ' + literals.join(', '));
  process.exit(1);
}

if (files.indexOf('RELEASE_*.md') === -1) {
  console.error('files[] must include RELEASE_*.md');
  process.exit(1);
}

if (!fs.existsSync(path.join(ROOT, want))) {
  console.error('Missing release notes for package version: ' + want);
  process.exit(1);
}

const packed = spawnSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: ROOT,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

if (packed.status !== 0) {
  console.error((packed.stderr || packed.stdout || '').trim() || 'npm pack --dry-run failed');
  process.exit(packed.status || 1);
}

let entries = [];
try {
  const parsed = JSON.parse(packed.stdout || '[]');
  const meta = Array.isArray(parsed) ? parsed[0] : parsed[Object.keys(parsed)[0]];
  entries = ((meta && meta.files) || []).map((f) => f && f.path).filter(Boolean);
} catch (_) {
  entries = String(packed.stdout || packed.stderr || '').split(/\r?\n/).map((l) => l.trim());
}

if (entries.indexOf(want) === -1 && !entries.some((e) => e.endsWith('/' + want))) {
  console.error('Packed tarball carries no release file for ' + pkg.version + ': ' + want);
  process.exit(1);
}

const backupArtifacts = entries.filter((e) => /\.(bak|orig|rej)$/.test(e) || /~$/.test(e));
if (backupArtifacts.length) {
  console.error('Packed tarball carries backup/editor artifacts: ' + backupArtifacts.join(', '));
  process.exit(1);
}

console.log('✓ release file packaged: ' + want);

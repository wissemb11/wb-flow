#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync: defaultSpawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function result(ok, message, extra) {
  return Object.assign(
    {
      ok,
      status: ok ? 0 : 1,
      stdout: ok ? message : '',
      stderr: ok ? '' : message,
    },
    extra || {}
  );
}

function parsePackEntries(stdout, stderr) {
  try {
    const parsed = JSON.parse(stdout || '[]');
    const meta = Array.isArray(parsed) ? parsed[0] : parsed[Object.keys(parsed)[0]];
    return ((meta && meta.files) || []).map((f) => f && f.path).filter(Boolean);
  } catch (_) {
    return String(stdout || stderr || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  }
}

function verifyReleaseFile(options) {
  const opts = options || {};
  const root = path.resolve(opts.root || ROOT);
  const spawnSync = opts.spawnSync || defaultSpawnSync;
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const want = 'RELEASE_' + pkg.version + '.md';
  const files = Array.isArray(pkg.files) ? pkg.files : [];

  const literals = files.filter((f) => /^RELEASE_[0-9]/.test(String(f)));
  if (literals.length) {
    return result(false, 'files[] hardcodes versioned release notes: ' + literals.join(', '), { want });
  }

  if (files.indexOf('RELEASE_*.md') === -1) {
    return result(false, 'files[] must include RELEASE_*.md', { want });
  }

  if (!fs.existsSync(path.join(root, want))) {
    return result(false, 'Missing release notes for package version: ' + want, { want });
  }

  const packed = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (packed.status !== 0) {
    return result(false, (packed.stderr || packed.stdout || '').trim() || 'npm pack --dry-run failed', {
      status: packed.status || 1,
      want,
    });
  }

  const entries = parsePackEntries(packed.stdout, packed.stderr);
  if (entries.indexOf(want) === -1 && !entries.some((e) => e.endsWith('/' + want))) {
    return result(false, 'Packed tarball carries no release file for ' + pkg.version + ': ' + want, {
      entries,
      want,
    });
  }

  const backupArtifacts = entries.filter((e) => /\.(bak|orig|rej)$/.test(e) || /~$/.test(e));
  if (backupArtifacts.length) {
    return result(false, 'Packed tarball carries backup/editor artifacts: ' + backupArtifacts.join(', '), {
      entries,
      want,
    });
  }

  return result(true, '✓ release file packaged: ' + want, { entries, want });
}

if (require.main === module) {
  const outcome = verifyReleaseFile();
  if (outcome.stdout) console.log(outcome.stdout);
  if (outcome.stderr) console.error(outcome.stderr);
  process.exit(outcome.status);
}

module.exports = {
  parsePackEntries,
  verifyReleaseFile,
};

#!/usr/bin/env node
/**
 * bin/snap.js — `wb-flow snap <path>`
 *
 * Pin an output (a plan, an explanation, a report folder) into
 * `.wb/snaps/<YYYYMMDD>_<label>/` so it stays findable after the reports tree
 * has grown another hundred files.
 *
 * **A symlink is a PIN, not a snapshot.** It points at the live file, so a
 * pinned plan shows its *current* Done boxes and matrix — not the state it had
 * when you pinned it. That is the right default for explanation files (written
 * once, never edited) and for "I want to find this again". When you need the
 * content frozen as-of today — a plan mid-execution, a report you are about to
 * supersede — pass `--copy`.
 *
 * One implementation rather than 33 templates each hand-rolling `ln -s`: the
 * same reasoning that made `wb-flow model` the single writer of the roster.
 * Relative symlinks throughout, so the repo stays portable.
 *
 * Zero dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const HELP = `
  wb-flow snap — pin an output so you can find it again

  Usage: wb-flow snap <path> [options]

  Creates .wb/snaps/<YYYYMMDD>_<label>/ and links <path> into it.

  Options:
    --label=<name>   Folder label (default: the target's basename, sanitized).
                     The date prefix is always added; you cannot omit it.
    --copy           Copy instead of symlink — freezes the content as-of now.
                     Use for anything still being edited: a symlinked plan
                     shows its CURRENT state, not the state you pinned.
    --root=<dir>     Where .wb/ lives (default: nearest .wb/ walking up, else cwd)
    --list           List existing snaps and exit
    --json           Machine-readable output
    --dry-run, -n    Show what would happen, write nothing
    --help, -h       Show this message

  Examples:
    wb-flow snap .wb/workflows/reports/2026/08/02/plans/plan_x_20260802.md
    wb-flow snap <plan-dir>/tasks/task_1/ --label=retirement --copy
    wb-flow snap --list
`;

function sanitize(s) {
  return String(s || '').replace(/\.md$/i, '').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function today() {
  const d = new Date();
  return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
}

/** Nearest ancestor holding a `.wb/`, else cwd. */
function findRoot(from) {
  let dir = path.resolve(from || process.cwd());
  for (;;) {
    if (fs.existsSync(path.join(dir, '.wb'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return path.resolve(from || process.cwd());
}

function copyRecursive(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) copyRecursive(path.join(src, entry), path.join(dest, entry));
  } else {
    fs.copyFileSync(src, dest);
  }
}

function listSnaps(root) {
  const dir = path.join(root, '.wb', 'snaps');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const p = path.join(dir, e.name);
      const items = fs.readdirSync(p).map((n) => {
        const full = path.join(p, n);
        let kind = 'copy';
        try { kind = fs.lstatSync(full).isSymbolicLink() ? 'link' : 'copy'; } catch (_) { /* ignore */ }
        let dangling = false;
        if (kind === 'link') { try { fs.statSync(full); } catch (_) { dangling = true; } }
        return { name: n, kind: kind, dangling: dangling };
      });
      return { label: e.name, path: p, items: items };
    })
    .sort((a, b) => (a.label < b.label ? 1 : -1));
}

function parseArgs(argv) {
  const o = { target: null, label: null, copy: false, root: null, list: false, json: false, dryRun: false, help: false };
  for (const a of argv) {
    if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--copy') o.copy = true;
    else if (a === '--list') o.list = true;
    else if (a === '--json') o.json = true;
    else if (a === '--dry-run' || a === '-n') o.dryRun = true;
    else if (a.indexOf('--label=') === 0) o.label = a.slice(8);
    else if (a.indexOf('--root=') === 0) o.root = a.slice(7);
    else if (a.charAt(0) !== '-' && !o.target) o.target = a;
  }
  return o;
}

function run(argv) {
  const opts = parseArgs(argv || []);
  if (opts.help) { console.log(HELP); return 0; }

  const root = opts.root ? path.resolve(opts.root) : findRoot(opts.target ? path.dirname(path.resolve(opts.target)) : null);

  if (opts.list) {
    const snaps = listSnaps(root);
    if (opts.json) { console.log(JSON.stringify(snaps, null, 2)); return 0; }
    if (!snaps.length) { console.log('\nNo snaps under ' + path.join(root, '.wb', 'snaps') + '\n'); return 0; }
    console.log('\n📌 Snaps in ' + path.join(root, '.wb', 'snaps') + '\n');
    for (const s of snaps) {
      console.log('  ' + s.label);
      for (const it of s.items) {
        console.log('     ' + (it.kind === 'link' ? '🔗' : '📄') + ' ' + it.name + (it.dangling ? '   ⚠️ dangling — target moved or deleted' : ''));
      }
    }
    console.log('');
    return 0;
  }

  if (!opts.target) {
    console.error('❌ Nothing to snap. Usage: wb-flow snap <path> [--label=…] [--copy]');
    console.error('   `wb-flow snap --list` shows existing snaps.');
    return 1;
  }
  const target = path.resolve(opts.target);
  if (!fs.existsSync(target)) {
    console.error('❌ No such path: ' + opts.target);
    return 1;
  }

  const label = today() + '_' + (sanitize(opts.label) || sanitize(path.basename(target)) || 'snap');
  const snapDir = path.join(root, '.wb', 'snaps', label);
  const linkName = path.basename(target);
  let dest = path.join(snapDir, linkName);

  // Never clobber a previous pin: two snaps of different files can share a
  // label, and silently overwriting one would lose it.
  if (fs.existsSync(dest) || isLink(dest)) {
    const stamp = new Date().toTimeString().slice(0, 5).replace(':', '');
    dest = path.join(snapDir, path.parse(linkName).name + '_' + stamp + path.parse(linkName).ext);
  }

  // Relative, so the repo stays portable if it is moved or cloned elsewhere.
  const rel = path.relative(snapDir, target);

  if (opts.dryRun) {
    console.log('\n📋 DRY RUN');
    console.log('   ' + (opts.copy ? 'copy' : 'link') + ': ' + path.relative(root, dest));
    console.log('   → ' + (opts.copy ? path.relative(root, target) : rel));
    return 0;
  }

  fs.mkdirSync(snapDir, { recursive: true });
  if (opts.copy) {
    copyRecursive(target, dest);
  } else {
    fs.symlinkSync(rel, dest);
  }

  if (opts.json) {
    console.log(JSON.stringify({ snap: dest, target: target, kind: opts.copy ? 'copy' : 'link', label: label }, null, 2));
    return 0;
  }
  console.log('\n📌 Snapped → ' + path.relative(root, dest));
  console.log('   ' + (opts.copy ? 'copy — content frozen as of now' : 'symlink → ' + rel));
  if (!opts.copy) {
    console.log('   ⚠️  a link tracks the live file: if it is still being edited, this pin');
    console.log('      will show its future state, not the state you pinned. Use --copy to freeze.');
  }
  console.log('   List them:  wb-flow snap --list\n');
  return 0;
}

function isLink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch (_) { return false; }
}

module.exports = { run, listSnaps, findRoot, sanitize, today, parseArgs };

if (require.main === module) process.exit(run(process.argv.slice(2)));

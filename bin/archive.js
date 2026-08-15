#!/usr/bin/env node
/**
 * bin/archive.js — `wb-flow archive <target>`
 *
 * Retire superseded daily report folders so a scope's `reports/` tree holds only
 * the CURRENT file for each category, and the history moves — intact — to
 * `.wb/workflows/archives/<YYYY>/<MM>/<DD>/<category>/`.
 *
 * Why a script and not 33 templates each hand-rolling `mv`: same reasoning as
 * `wb-flow snap` and `wb-flow model`. This one moves real work product, so the
 * failure modes are worse than a bad link — a hand-rolled sweep that mis-globs
 * eats a plan whose tasks are still open. Everything here is therefore:
 *
 *   - **Whole-folder.** The unit is `<DD>/<category>/`, never a lone `.md`. A
 *     plan's `tasks/`, `waves/` and `explanations/` are siblings INSIDE that
 *     folder; moving the file alone would orphan every task report it links to.
 *   - **Depth-preserving.** `archives/<YYYY>/<MM>/<DD>/<cat>/` mirrors
 *     `reports/<YYYY>/<MM>/<DD>/<cat>/` exactly, so every relative href inside a
 *     moved file that pointed at a same-tree sibling still resolves after the
 *     move. That is the whole reason the archive root sits beside `reports/`
 *     under `.wb/workflows/` rather than anywhere shorter or prettier.
 *   - **Keeper-safe.** The newest date per category is never a candidate, and a
 *     folder holding the resolved keeper is skipped whole.
 *   - **Reversible.** Every move is logged with its source, and `--restore`
 *     puts a folder back where it came from.
 *
 * Exempt by default: `standups/` and `tracks/`. Both ARE the history — a standup
 * reads "what we did yesterday / what today", a track is the session narrative.
 * Archiving them would delete the log the sweep exists to preserve. `--all`
 * or `--include-standups` / `--include-tracks` overrides.
 *
 * Zero dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/** Categories that are the log itself — never swept unless explicitly opted in. */
const EXEMPT_CATEGORIES = ['standups', 'tracks'];

/** Sub-folders inside a category dir that are payload, not sibling reports. */
const PAYLOAD_DIRS = ['tasks', 'waves', 'explanations', 'ideas_reports'];

/** category → the filename prefix its primary file uses. Fallback: strip 's'. */
const CATEGORY_PREFIX = {
  plans: 'plan',
  audits: 'audit',
  ideas: 'idea',
  visions: 'vision',
  reviews: 'review',
  contexts: 'context',
  nexts: 'next',
  tests: 'test',
  standups: 'standup',
  actions: 'action',
  cleans: 'clean',
  debugs: 'debug',
  security: 'security',
  deployments: 'deploy',
  publishes: 'publish',
  releases: 'release',
  broadcasts: 'broadcast',
  setup: 'setup',
  monetize: 'monetize',
  validations: 'validation',
  tracks: 'track',
};

const HELP = `
  wb-flow archive — retire superseded daily reports, keep the newest

  Usage: wb-flow archive <scope-dir | report-file> [options]

  Moves every superseded <YYYY>/<MM>/<DD>/<category>/ folder out of
  .wb/workflows/reports/ and into .wb/workflows/archives/, at the SAME depth so
  relative links inside the moved files keep resolving. The newest date per
  category stays put.

  Passing a report FILE pins it as the keeper for its own category — everything
  older than it is archived, everything newer is left alone.

  Options:
    --type=<a,b>         Categories to sweep (default: every non-exempt one found)
    --keep=<N>           Keep the N newest dates per category (default: 1)
    --before=<YYYYMMDD>  Only archive dates strictly before this one
    --recursive, -R      Sweep every scope with a .wb/ below <target> (fleet mode)
    --include-standups   Also sweep standups/ (exempt by default — it IS the log)
    --include-tracks     Also sweep tracks/ (exempt by default — same reason)
    --all                Sweep every category, exempt ones included
    --no-banner          Do not insert the 🗄️ ARCHIVED banner into moved files
    --no-log             Do not append to archives/archive_log.md
    --restore=<path>     Move an archived folder back under reports/ and exit
    --list               Show what is already archived and exit
    --root=<dir>         Where .wb/ lives (default: nearest .wb/ walking up)
    --dry-run, -n        Print the plan, move nothing
    --json               Machine-readable output
    --help, -h           Show this message

  Examples:
    wb-flow archive packages/wb-latex --type=plans -n
    wb-flow archive .wb/workflows/reports/2026/08/09/plans/plan_x_20260809.md
    wb-flow archive . --recursive --all -n
    wb-flow archive --list
    wb-flow archive --restore=.wb/workflows/archives/2026/08/07/plans
`;

// ── helpers ────────────────────────────────────────────────────────────────

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** Nearest ancestor holding a `.wb/`, else the path itself. */
function findRoot(from) {
  let dir = path.resolve(from || process.cwd());
  if (fs.existsSync(dir) && !fs.statSync(dir).isDirectory()) dir = path.dirname(dir);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.wb'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return path.resolve(from || process.cwd());
}

function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch (e) { return false; }
}

function singular(category) {
  if (CATEGORY_PREFIX[category]) return CATEGORY_PREFIX[category];
  return category.replace(/s$/, '');
}

/**
 * Date folders come in two shapes across the corpus: the current
 * `<YYYY>/<MM>/<DD>/` and the legacy flat `<YYYYMMDD>/`. Both are walked, and
 * both archive to the shape they were found in — a sweep is not a migration.
 */
function listDateDirs(reportsDir) {
  const out = [];
  if (!isDir(reportsDir)) return out;
  for (const y of fs.readdirSync(reportsDir)) {
    const yDir = path.join(reportsDir, y);
    if (!isDir(yDir)) continue;
    if (/^\d{8}$/.test(y)) { out.push({ key: y, dir: yDir, rel: y }); continue; }
    if (!/^\d{4}$/.test(y)) continue;
    for (const m of fs.readdirSync(yDir)) {
      const mDir = path.join(yDir, m);
      if (!/^\d{2}$/.test(m) || !isDir(mDir)) continue;
      for (const d of fs.readdirSync(mDir)) {
        const dDir = path.join(mDir, d);
        if (!/^\d{2}$/.test(d) || !isDir(dDir)) continue;
        out.push({ key: y + m + d, dir: dDir, rel: path.join(y, m, d) });
      }
    }
  }
  return out.sort(function (a, b) { return a.key < b.key ? 1 : a.key > b.key ? -1 : 0; }); // newest first
}

/** The primary `.md` of a category folder — the one a banner should point at. */
function primaryFile(catDir, category) {
  if (!isDir(catDir)) return null;
  const mds = fs.readdirSync(catDir).filter(function (n) {
    return /\.md$/i.test(n) && !isDir(path.join(catDir, n));
  });
  if (!mds.length) return null;
  const pref = singular(category) + '_';
  const hit = mds.filter(function (n) { return n.indexOf(pref) === 0; }).sort();
  return path.join(catDir, hit.length ? hit[hit.length - 1] : mds.sort()[0]);
}

/** Every scope under `from` that owns a `.wb/workflows/reports/`. */
function findScopes(from, acc, depth) {
  acc = acc || [];
  depth = depth || 0;
  const root = path.resolve(from);
  if (!isDir(root) || depth > 8) return acc;
  if (isDir(path.join(root, '.wb', 'workflows', 'reports'))) acc.push(root);
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const n = entry.name;
    if (n === 'node_modules' || n === '.git' || n === '.wb' || n === 'dist' || n.charAt(0) === '.') continue;
    findScopes(path.join(root, n), acc, depth + 1);
  }
  return acc;
}

function moveDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    fs.renameSync(src, dest);
  } catch (e) {
    // Cross-device (EXDEV) or a platform that refuses the rename: copy then drop.
    copyRecursive(src, dest);
    fs.rmSync(src, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) copyRecursive(path.join(src, entry), path.join(dest, entry));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

/** Drop `<DD>`, `<MM>`, `<YYYY>` shells left empty by a move, never `reports/`. */
function pruneEmpty(dir, stopAt) {
  let cur = path.resolve(dir);
  const stop = path.resolve(stopAt);
  while (cur !== stop && cur.indexOf(stop) === 0) {
    let entries;
    try { entries = fs.readdirSync(cur); } catch (e) { return; }
    if (entries.length) return;
    try { fs.rmdirSync(cur); } catch (e) { return; }
    cur = path.dirname(cur);
  }
}

const BANNER_MARK = '🗄️ **ARCHIVED';

/**
 * Stamp a moved file so a reader who lands on it via an old link knows it is not
 * live, and can reach what replaced it in one click. Inserted after YAML
 * front-matter (never before it — a banner above `---` breaks the parse).
 */
function insertBanner(file, keeperHref, keeperName, fromRel) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return false; }
  if (text.indexOf(BANNER_MARK) !== -1) return false; // idempotent

  const lines = ['> ' + BANNER_MARK + ' ' + today() + '** — this file is history, not live state.'];
  if (keeperHref) {
    lines.push('> Superseded by [' + keeperName + '](' + keeperHref + ').');
  }
  lines.push('> Moved from `' + fromRel + '` by `wb-flow archive`. Links to files that moved with it still resolve (`archives/` mirrors `reports/` depth); links to still-live reports do not.');
  const banner = lines.join('\n') + '\n\n';

  let out;
  const fm = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(text);
  if (fm && fm.index === 0) out = text.slice(0, fm[0].length) + '\n' + banner + text.slice(fm[0].length).replace(/^\n+/, '');
  else out = banner + text;
  fs.writeFileSync(file, out);
  return true;
}

function appendLog(root, rows) {
  if (!rows.length) return;
  const logFile = path.join(root, '.wb', 'workflows', 'archives', 'archive_log.md');
  const exists = fs.existsSync(logFile);
  let head = '';
  if (!exists) {
    head = '# Archive Log\n\n' +
      '> Append-only record of every `wb-flow archive` sweep in this scope.\n' +
      '> Each row is reversible: `wb-flow archive --restore=<archived path>`.\n\n' +
      '| Date | Category | Archived from | Archived to | Superseded by |\n' +
      '|---|---|---|---|---|\n';
  }
  const body = rows.map(function (r) {
    return '| ' + today() + ' | `' + r.category + '` | `' + r.fromRel + '` | `' + r.toRel + '` | ' + (r.keeperName ? '`' + r.keeperName + '`' : '—') + ' |';
  }).join('\n') + '\n';
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, head + body);
}

// ── planning ───────────────────────────────────────────────────────────────

/**
 * Build the move list for one scope. Pure: touches nothing on disk.
 *
 * The keeper is resolved per category — one category having no current file
 * must not drag another category's history out with it.
 */
function planScope(root, opts) {
  const reportsDir = path.join(root, '.wb', 'workflows', 'reports');
  const archivesDir = path.join(root, '.wb', 'workflows', 'archives');
  const moves = [];
  const skipped = [];
  if (!isDir(reportsDir)) return { root: root, moves: moves, skipped: skipped };

  const dates = listDateDirs(reportsDir); // newest first

  // category → [{date, dir, rel}], newest first
  const byCategory = {};
  for (const d of dates) {
    for (const entry of fs.readdirSync(d.dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const cat = entry.name;
      if (PAYLOAD_DIRS.indexOf(cat) !== -1) continue;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({ key: d.key, rel: d.rel, dir: path.join(d.dir, cat) });
    }
  }

  for (const cat of Object.keys(byCategory).sort()) {
    if (opts.types && opts.types.indexOf(cat) === -1) continue;
    if (!opts.all && !opts.types && EXEMPT_CATEGORIES.indexOf(cat) !== -1 && opts.include.indexOf(cat) === -1) {
      skipped.push({ category: cat, reason: 'exempt — it is the log (use --include-' + cat + ' or --all)' });
      continue;
    }

    const entries = byCategory[cat]; // newest first
    let keeperDir = null;
    let candidates = entries;

    if (opts.keepFile && opts.keepFileCategory === cat) {
      // An explicit file pins its own folder as the keeper: anything NEWER than
      // it is left alone too. Archiving forward from a hand-picked keeper would
      // destroy work the caller never mentioned.
      const keeperFolder = path.dirname(path.resolve(opts.keepFile));
      keeperDir = keeperFolder;
      candidates = entries.filter(function (e) { return path.resolve(e.dir) !== keeperFolder; });
      const keeperEntry = entries.filter(function (e) { return path.resolve(e.dir) === keeperFolder; })[0];
      if (keeperEntry) candidates = candidates.filter(function (e) { return e.key < keeperEntry.key; });
    } else {
      const keep = entries.slice(0, Math.max(1, opts.keep));
      keeperDir = keep.length ? keep[0].dir : null;
      candidates = entries.slice(Math.max(1, opts.keep));
    }

    if (opts.before) candidates = candidates.filter(function (e) { return e.key < opts.before; });

    const keeperFile = keeperDir ? primaryFile(keeperDir, cat) : null;

    for (const c of candidates) {
      const dest = path.join(archivesDir, c.rel, cat);
      if (fs.existsSync(dest)) {
        skipped.push({ category: cat, reason: 'already archived: ' + path.relative(root, dest) });
        continue;
      }
      moves.push({
        category: cat,
        from: c.dir,
        to: dest,
        fromRel: path.relative(root, c.dir),
        toRel: path.relative(root, dest),
        keeperFile: keeperFile,
        keeperName: keeperFile ? path.basename(keeperFile) : null,
      });
    }
  }
  return { root: root, moves: moves, skipped: skipped };
}

// ── actions ────────────────────────────────────────────────────────────────

function doList(root, json) {
  const archivesDir = path.join(root, '.wb', 'workflows', 'archives');
  const dates = listDateDirs(archivesDir);
  const rows = [];
  for (const d of dates) {
    for (const entry of fs.readdirSync(d.dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(d.dir, entry.name);
      const files = fs.readdirSync(dir).filter(function (n) { return /\.md$/i.test(n); });
      rows.push({ date: d.rel, category: entry.name, files: files.length, path: path.relative(root, dir) });
    }
  }
  if (json) { console.log(JSON.stringify({ root: root, archived: rows }, null, 2)); return 0; }
  if (!rows.length) { console.log('\nNothing archived under ' + path.join(root, '.wb', 'workflows', 'archives') + '\n'); return 0; }
  console.log('\n🗄️  Archived in ' + path.relative(process.cwd(), archivesDir) + '\n');
  for (const r of rows) console.log('   ' + r.date + '  ' + r.category.padEnd(14) + r.files + ' file(s)   ' + r.path);
  console.log('\n   Restore one:  wb-flow archive --restore=<path>\n');
  return 0;
}

function doRestore(root, target, opts) {
  const src = path.resolve(target);
  if (!isDir(src)) { console.error('❌ Not an archived folder: ' + target); return 1; }
  const archivesDir = path.join(root, '.wb', 'workflows', 'archives');
  const rel = path.relative(archivesDir, src);
  if (rel.indexOf('..') === 0) { console.error('❌ Not under ' + archivesDir + ': ' + target); return 1; }
  const dest = path.join(root, '.wb', 'workflows', 'reports', rel);
  if (fs.existsSync(dest)) { console.error('❌ Destination already exists: ' + path.relative(root, dest)); return 1; }
  if (opts.dryRun) { console.log('\n📋 DRY RUN\n   restore: ' + path.relative(root, src) + '\n        → ' + path.relative(root, dest) + '\n'); return 0; }
  moveDir(src, dest);
  pruneEmpty(path.dirname(src), archivesDir);
  console.log('\n♻️  Restored → ' + path.relative(root, dest) + '\n');
  return 0;
}

function apply(plan, opts) {
  const applied = [];
  for (const m of plan.moves) {
    if (opts.dryRun) { applied.push(m); continue; }
    moveDir(m.from, m.to);
    pruneEmpty(path.dirname(m.from), path.join(plan.root, '.wb', 'workflows', 'reports'));
    if (!opts.noBanner) {
      for (const n of fs.readdirSync(m.to)) {
        const f = path.join(m.to, n);
        if (/\.md$/i.test(n) && !isDir(f)) {
          const href = m.keeperFile ? path.relative(m.to, m.keeperFile).split(path.sep).join('/') : null;
          insertBanner(f, href, m.keeperName, m.fromRel);
        }
      }
    }
    applied.push(m);
  }
  if (!opts.dryRun && !opts.noLog) appendLog(plan.root, applied);
  return applied;
}

// ── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const o = {
    target: null, types: null, keep: 1, before: null, recursive: false,
    include: [], all: false, noBanner: false, noLog: false, restore: null,
    list: false, root: null, dryRun: false, json: false, help: false,
    keepFile: null, keepFileCategory: null,
  };
  for (const a of argv) {
    if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--list') o.list = true;
    else if (a === '--all') o.all = true;
    else if (a === '--no-banner') o.noBanner = true;
    else if (a === '--no-log') o.noLog = true;
    else if (a === '--recursive' || a === '-R') o.recursive = true;
    else if (a === '--include-standups') o.include.push('standups');
    else if (a === '--include-tracks') o.include.push('tracks');
    else if (a === '--dry-run' || a === '-n') o.dryRun = true;
    else if (a === '--json') o.json = true;
    else if (a.indexOf('--type=') === 0) o.types = a.slice(7).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    else if (a.indexOf('--keep=') === 0) o.keep = parseInt(a.slice(7), 10) || 1;
    else if (a.indexOf('--before=') === 0) o.before = a.slice(9).replace(/-/g, '');
    else if (a.indexOf('--restore=') === 0) o.restore = a.slice(10);
    else if (a.indexOf('--root=') === 0) o.root = a.slice(7);
    else if (a.charAt(0) !== '-' && !o.target) o.target = a;
  }
  return o;
}

function run(argv) {
  const opts = parseArgs(argv || []);
  if (opts.help) { console.log(HELP); return 0; }

  // A file target pins the keeper for its own category.
  if (opts.target && fs.existsSync(opts.target) && !isDir(opts.target)) {
    const abs = path.resolve(opts.target);
    opts.keepFile = abs;
    opts.keepFileCategory = path.basename(path.dirname(abs));
    if (!opts.types) opts.types = [opts.keepFileCategory];
  }

  const root = opts.root ? path.resolve(opts.root) : findRoot(opts.target);

  if (opts.restore) return doRestore(root, opts.restore, opts);
  if (opts.list) return doList(root, opts.json);

  const scopes = opts.recursive ? findScopes(opts.target || root) : [root];
  if (!scopes.length) {
    console.error('❌ No scope with a .wb/workflows/reports/ under ' + (opts.target || root));
    return 1;
  }

  const plans = scopes.map(function (s) { return planScope(s, opts); });
  const total = plans.reduce(function (n, p) { return n + p.moves.length; }, 0);

  if (opts.json) {
    const applied = opts.dryRun ? [] : plans.map(function (p) { return apply(p, opts); });
    console.log(JSON.stringify({
      dryRun: opts.dryRun,
      scopes: plans.map(function (p, i) {
        return {
          scope: p.root,
          moves: p.moves.map(function (m) { return { category: m.category, from: m.fromRel, to: m.toRel, supersededBy: m.keeperName }; }),
          skipped: p.skipped,
          applied: opts.dryRun ? 0 : applied[i].length,
        };
      }),
      total: total,
    }, null, 2));
    return 0;
  }

  if (!total) {
    console.log('\n✅ Nothing to archive — every category already holds only its newest folder.');
    for (const p of plans) {
      for (const s of p.skipped) console.log('   · ' + s.category + ': ' + s.reason);
    }
    console.log('');
    return 0;
  }

  console.log('\n' + (opts.dryRun ? '📋 DRY RUN — nothing will move' : '🗄️  Archiving superseded reports') + '\n');
  for (const p of plans) {
    if (!p.moves.length && !p.skipped.length) continue;
    if (plans.length > 1) console.log('  ' + path.relative(process.cwd(), p.root) + '/');
    for (const m of p.moves) {
      console.log('   ' + m.category.padEnd(12) + m.fromRel);
      console.log('   ' + ''.padEnd(12) + '→ ' + m.toRel + (m.keeperName ? '   (kept: ' + m.keeperName + ')' : '   ⚠️  no current file in this category'));
    }
    for (const s of p.skipped) console.log('   · ' + s.category + ': ' + s.reason);
    apply(p, opts);
  }

  console.log('\n   ' + total + ' folder(s) ' + (opts.dryRun ? 'would move' : 'moved') + '.');
  if (opts.dryRun) console.log('   Re-run without --dry-run to apply.');
  else console.log('   Log: .wb/workflows/archives/archive_log.md   ·   Undo: wb-flow archive --restore=<path>');
  console.log('');
  return 0;
}

module.exports = {
  run, parseArgs, planScope, findScopes, findRoot, listDateDirs,
  primaryFile, insertBanner, pruneEmpty, singular,
  EXEMPT_CATEGORIES, PAYLOAD_DIRS, CATEGORY_PREFIX,
};

if (require.main === module) process.exit(run(process.argv.slice(2)));

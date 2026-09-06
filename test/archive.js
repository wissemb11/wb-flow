#!/usr/bin/env node

/**
 * archive.js — regression tests for `wb-flow archive`
 *
 * Hand-rolled assertions (no test framework) to keep zero runtime deps.
 * Node >= 14 compatible (CommonJS, no top-level await, no node:test).
 *
 *   node test/archive.js
 *   node test/archive.js --only=keeper
 *
 * What each group asserts, and why it earns its place — this command MOVES
 * work product, so every test here corresponds to a way it could lose some:
 *
 *   keeper   — the newest folder per category is NEVER a candidate, and each
 *              category resolves its own keeper. One category having no current
 *              file must not drag another category's history out with it.
 *   payload  — a plan's tasks/ and waves/ move WITH it. Moving the .md alone
 *              orphans every task report it links to; this is the defect the
 *              whole-folder rule exists to prevent.
 *   depth    — archives/<Y>/<M>/<D>/<cat>/ mirrors reports/ exactly, so a
 *              relative href inside a moved file still resolves. This is the
 *              single reason the archive root is where it is.
 *   exempt   — standups/ and tracks/ are skipped by default. They ARE the log.
 *   banner   — inserted after front-matter (never before — that breaks the
 *              parse), and idempotent across repeat runs.
 *   pin      — passing a FILE pins it as keeper and leaves anything newer alone.
 *   restore  — every move is individually reversible.
 *   dryrun   — --dry-run writes absolutely nothing.
 *   cli      — exit codes: bad targets fail, --help/--list succeed.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const PKG_ROOT = path.resolve(__dirname, '..');
const ARCHIVE = path.join(PKG_ROOT, 'bin', 'archive.js');
const A = require(ARCHIVE);

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) { passed++; console.log('  ✓ ' + msg); }
  else { failed++; failures.push(msg); console.log('  ✗ ' + msg); }
}

const ONLY = (function () {
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].indexOf('--only=') === 0) return a[i].slice('--only='.length);
    if (a[i] === '--only' && a[i + 1]) return a[i + 1];
  }
  return null;
})();
function run(name) { return !ONLY || ONLY === name; }

console.log('🧪 wb-flow archive regression test\n');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-flow-archive-'));

/** Build a throwaway scope. spec = { 'YYYY/MM/DD': { category: { file: body } } } */
function scaffold(name, spec) {
  const root = path.join(tmp, name);
  for (const date of Object.keys(spec)) {
    for (const cat of Object.keys(spec[date])) {
      const dir = path.join(root, '.wb', 'workflows', 'reports', date, cat);
      fs.mkdirSync(dir, { recursive: true });
      for (const file of Object.keys(spec[date][cat])) {
        const full = path.join(dir, file);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, spec[date][cat][file]);
      }
    }
  }
  return root;
}

const R = path.join('.wb', 'workflows', 'reports');
const V = path.join('.wb', 'workflows', 'archives');
function reports(root, p) { return path.join(root, R, p); }
function archives(root, p) { return path.join(root, V, p); }

try {
  // ── keeper: newest per category survives; keepers are per-category ─────────
  if (run('keeper')) {
    console.log('keeper resolution — newest folder per category is never a candidate');
    const root = scaffold('keeper', {
      '2026/08/05': { plans: { 'plan_x_20260805.md': '# old' } },
      '2026/08/07': { plans: { 'plan_x_20260807.md': '# mid' } },
      '2026/08/09': { plans: { 'plan_x_20260809.md': '# new' } },
      '2026/07/30': { audits: { 'audit_x_20260730.md': '# a1' } },
      '2026/07/31': { audits: { 'audit_x_20260731.md': '# a2' } },
    });
    A.run([root]);

    assert(fs.existsSync(reports(root, '2026/08/09/plans/plan_x_20260809.md')),
      'newest plan stays live');
    assert(!fs.existsSync(reports(root, '2026/08/07/plans')),
      'superseded plan folder leaves reports/');
    assert(fs.existsSync(archives(root, '2026/08/05/plans/plan_x_20260805.md')) &&
           fs.existsSync(archives(root, '2026/08/07/plans/plan_x_20260807.md')),
      'both superseded plan folders land in archives/');

    // The audits keeper is 07/31 — a DIFFERENT date than the plans keeper.
    // Resolving one keeper for the whole scope would archive 07/31 too.
    assert(fs.existsSync(reports(root, '2026/07/31/audits/audit_x_20260731.md')),
      'audits keep their OWN newest (07/31), not the plans keeper date');
    assert(fs.existsSync(archives(root, '2026/07/30/audits/audit_x_20260730.md')),
      'older audit is archived independently of the plans sweep');

    // Empty <DD>/<MM> shells must not be left behind.
    assert(!fs.existsSync(reports(root, '2026/08/05')),
      'emptied date folder is pruned from reports/');

    console.log('  keep=N');
    const root2 = scaffold('keeper2', {
      '2026/08/01': { plans: { 'plan_y_20260801.md': '# 1' } },
      '2026/08/02': { plans: { 'plan_y_20260802.md': '# 2' } },
      '2026/08/03': { plans: { 'plan_y_20260803.md': '# 3' } },
    });
    A.run([root2, '--keep=2']);
    assert(fs.existsSync(reports(root2, '2026/08/03/plans')) &&
           fs.existsSync(reports(root2, '2026/08/02/plans')) &&
           fs.existsSync(archives(root2, '2026/08/01/plans')),
      '--keep=2 retains the two newest, archives the rest');
  }

  // ── payload: tasks/ and waves/ travel with the plan ────────────────────────
  if (run('payload')) {
    console.log('\npayload — a plan folder moves WHOLE, or its task reports are orphaned');
    const root = scaffold('payload', {
      '2026/08/07': {
        plans: {
          'plan_p_20260807.md': '# plan\n\nsee [task 1](tasks/task_1/task_1_report_p_20260807.md)\n',
          'tasks/task_1/task_1_report_p_20260807.md': '# report',
          'waves/wave_A_p.sh': '#!/bin/bash\n',
        },
      },
      '2026/08/09': { plans: { 'plan_p_20260809.md': '# new' } },
    });
    A.run([root]);

    const moved = archives(root, '2026/08/07/plans');
    assert(fs.existsSync(path.join(moved, 'tasks/task_1/task_1_report_p_20260807.md')),
      'nested task report moves with its plan');
    assert(fs.existsSync(path.join(moved, 'waves/wave_A_p.sh')),
      'waves/ moves with its plan');

    // The in-file link is relative to the plan's own folder, so it must still
    // resolve from the archived location without being rewritten.
    const body = fs.readFileSync(path.join(moved, 'plan_p_20260807.md'), 'utf8');
    const href = /\]\(([^)]+task_1_report[^)]*)\)/.exec(body)[1];
    assert(fs.existsSync(path.resolve(moved, href)),
      'the plan\'s relative link to its task report still resolves after the move');

    assert(!fs.existsSync(reports(root, '2026/08/07')),
      'nothing of the archived day is left behind in reports/');
  }

  // ── depth: archives/ mirrors reports/ exactly ──────────────────────────────
  if (run('depth')) {
    console.log('\ndepth parity — archives/<Y>/<M>/<D>/<cat>/ sits at the same depth as reports/');
    const root = scaffold('depth', {
      '2026/08/06': { plans: { 'plan_d_20260806.md': '# old' } },
      '2026/08/09': { plans: { 'plan_d_20260809.md': '# new' } },
    });
    A.run([root, '--no-banner']);

    const live = reports(root, '2026/08/09/plans/plan_d_20260809.md');
    const moved = archives(root, '2026/08/06/plans/plan_d_20260806.md');
    const depthOf = function (f) { return path.relative(root, f).split(path.sep).length; };
    assert(depthOf(live) === depthOf(moved),
      'archived file sits at the same path depth as a live one (7 dirs to scope root)');

    // The property that matters: a scope-root href computed for reports/ is
    // still correct from archives/. Seven `../` from either.
    const up7 = '../../../../../../../';
    assert(path.resolve(path.dirname(moved), up7) === path.resolve(root),
      'the canonical 7-up scope-root href resolves from an archived file too');
  }

  // ── exempt: standups/ and tracks/ are the log ──────────────────────────────
  if (run('exempt')) {
    console.log('\nexempt categories — standups/ and tracks/ are never swept by default');
    const root = scaffold('exempt', {
      '2026/08/01': { standups: { 'standup_e_20260801.md': '# s1' }, plans: { 'plan_e_20260801.md': '# p' } },
      '2026/08/02': { standups: { 'standup_e_20260802.md': '# s2' } },
      '2026/08/09': { standups: { 'standup_e_20260809.md': '# s3' }, plans: { 'plan_e_20260809.md': '# p' } },
    });
    A.run([root]);

    assert(fs.existsSync(reports(root, '2026/08/01/standups/standup_e_20260801.md')) &&
           fs.existsSync(reports(root, '2026/08/02/standups/standup_e_20260802.md')),
      'the whole standup SERIES stays in reports/ — keeping only the newest destroys its value');
    assert(fs.existsSync(archives(root, '2026/08/01/plans/plan_e_20260801.md')),
      'the plan in that same day folder IS archived (exemption is per-category, not per-day)');

    A.run([root, '--include-standups']);
    assert(fs.existsSync(archives(root, '2026/08/01/standups/standup_e_20260801.md')),
      '--include-standups opts the series in explicitly');
  }

  // ── banner: after front-matter, and idempotent ─────────────────────────────
  if (run('banner')) {
    console.log('\nbanner — stamped after front-matter, once');
    const root = scaffold('banner', {
      '2026/08/04': {
        plans: {
          'plan_b_20260804.md': '---\ntype: 🧠 Planner\nemits: mixed\n---\n\n# Plan Backlog: b — 2026-08-04\n',
        },
      },
      '2026/08/09': { plans: { 'plan_b_20260809.md': '# Plan Backlog: b — 2026-08-09\n' } },
    });
    A.run([root]);

    const f = archives(root, '2026/08/04/plans/plan_b_20260804.md');
    const text = fs.readFileSync(f, 'utf8');
    const fmEnd = text.indexOf('---', 3) + 3;
    assert(text.indexOf('---\ntype: 🧠 Planner') === 0,
      'YAML front-matter stays at byte 0 — a banner above it would break the parse');
    assert(text.indexOf('🗄️ **ARCHIVED') > fmEnd,
      'banner is inserted after the front-matter block');
    assert(/Superseded by \[plan_b_20260809\.md\]\(([^)]+)\)/.test(text),
      'banner names the superseding file as a markdown link');

    const href = /Superseded by \[[^\]]+\]\(([^)]+)\)/.exec(text)[1];
    assert(fs.existsSync(path.resolve(path.dirname(f), href)),
      'the banner\'s relative href to the live keeper actually resolves');

    // Re-running must not stack banners.
    const before = fs.readFileSync(f, 'utf8');
    A.insertBanner(f, '../x.md', 'x.md', 'somewhere');
    assert(fs.readFileSync(f, 'utf8') === before,
      'insertBanner is idempotent — a second pass does not stack a second banner');

    // No front-matter → banner goes at the very top.
    const root2 = scaffold('banner2', {
      '2026/08/04': { plans: { 'plan_c_20260804.md': '# Plan Backlog: c\n' } },
      '2026/08/09': { plans: { 'plan_c_20260809.md': '# new\n' } },
    });
    A.run([root2]);
    assert(fs.readFileSync(archives(root2, '2026/08/04/plans/plan_c_20260804.md'), 'utf8')
      .indexOf('> 🗄️ **ARCHIVED') === 0,
      'a file with no front-matter gets the banner at byte 0');
  }

  // ── referrer: a file OUTSIDE the moving folder that links INTO it blocks it ─
  if (run('referrer')) {
    console.log('\nreferrer — a file outside the moving folder that links into it blocks the archive');
    const root = path.join(tmp, 'referrer');
    const link = path.relative(
      path.join(root, R, '2026/08/09/plans'),
      path.join(root, R, '2026/08/05/plans/plan_x_20260805.md')
    ).split(path.sep).join('/');
    scaffold('referrer', {
      '2026/08/05': { plans: { 'plan_x_20260805.md': '# old' } },
      '2026/08/09': { plans: { 'plan_x_20260809.md': '# new\n\nsee [prior](' + link + ')\n' } },
    });

    const rc = A.run([root]);
    assert(rc !== 0, 'archive refuses when a referrer points into the folder about to move');
    assert(fs.existsSync(reports(root, '2026/08/05/plans/plan_x_20260805.md')),
      'the referenced folder is left in place — nothing moved on refusal');
    assert(!fs.existsSync(path.join(root, '.wb', 'workflows', 'archives')),
      'no archives/ tree is created on refusal');

    const rc2 = A.run([root, '--force']);
    assert(rc2 === 0, '--force overrides the refusal and archives anyway');
    assert(fs.existsSync(archives(root, '2026/08/05/plans')),
      '--force actually moved the referenced folder once overridden');
  }

  // ── keepconflict: --keep=N + a file target must not silently drop one ──────
  if (run('keepconflict')) {
    console.log('\n--keep + file pin — the two resolve different keeper sets and must not silently pick one');
    const root = scaffold('keepconflict', {
      '2026/08/01': { plans: { 'plan_k_20260801.md': '# 1' } },
      '2026/08/05': { plans: { 'plan_k_20260805.md': '# 5' } },
      '2026/08/09': { plans: { 'plan_k_20260809.md': '# 9' } },
    });
    const rc = A.run([reports(root, '2026/08/05/plans/plan_k_20260805.md'), '--keep=3', '--dry-run']);
    assert(rc !== 0, '--keep=N with a file target is rejected, not silently honoured or dropped');
    assert(fs.existsSync(reports(root, '2026/08/01/plans')) &&
           fs.existsSync(reports(root, '2026/08/05/plans')) &&
           fs.existsSync(reports(root, '2026/08/09/plans')),
      'nothing moved — the whole run refused before planning');
  }

  // ── pin: a file target is the keeper, nothing newer is touched ─────────────
  if (run('pin')) {
    console.log('\nfile target — pins itself as keeper, leaves anything NEWER alone');
    const root = scaffold('pin', {
      '2026/08/01': { plans: { 'plan_f_20260801.md': '# 1' } },
      '2026/08/05': { plans: { 'plan_f_20260805.md': '# 5' } },
      '2026/08/09': { plans: { 'plan_f_20260809.md': '# 9' } },
    });
    A.run([reports(root, '2026/08/05/plans/plan_f_20260805.md')]);

    assert(fs.existsSync(archives(root, '2026/08/01/plans')),
      'older than the pinned file is archived');
    assert(fs.existsSync(reports(root, '2026/08/05/plans/plan_f_20260805.md')),
      'the pinned file itself stays live');
    assert(fs.existsSync(reports(root, '2026/08/09/plans/plan_f_20260809.md')),
      'a file NEWER than the pin is left alone — sweeping forward would destroy unmentioned work');
  }

  // ── restore ────────────────────────────────────────────────────────────────
  if (run('restore')) {
    console.log('\nrestore — every move is individually reversible');
    const root = scaffold('restore', {
      '2026/08/03': { plans: { 'plan_r_20260803.md': '# old', 'tasks/task_1/r.md': '# t' } },
      '2026/08/09': { plans: { 'plan_r_20260809.md': '# new' } },
    });
    A.run([root]);
    assert(fs.existsSync(archives(root, '2026/08/03/plans')), 'archived first');

    A.run(['--root=' + root, '--restore=' + archives(root, '2026/08/03/plans')]);
    assert(fs.existsSync(reports(root, '2026/08/03/plans/plan_r_20260803.md')),
      'restore puts the folder back at its original reports/ path');
    assert(fs.existsSync(reports(root, '2026/08/03/plans/tasks/task_1/r.md')),
      'restore brings the payload back too');
    assert(!fs.existsSync(archives(root, '2026/08/03/plans')),
      'restore leaves nothing behind in archives/');

    // A log exists so the sweep is auditable.
    assert(fs.existsSync(path.join(root, '.wb', 'workflows', 'archives', 'archive_log.md')),
      'archive_log.md records the sweep');
  }

  // ── dry run writes nothing ─────────────────────────────────────────────────
  if (run('dryrun')) {
    console.log('\n--dry-run — writes absolutely nothing');
    const root = scaffold('dry', {
      '2026/08/02': { plans: { 'plan_n_20260802.md': '# old' } },
      '2026/08/09': { plans: { 'plan_n_20260809.md': '# new' } },
    });
    const before = fs.readFileSync(reports(root, '2026/08/02/plans/plan_n_20260802.md'), 'utf8');
    A.run([root, '--dry-run']);
    assert(fs.existsSync(reports(root, '2026/08/02/plans/plan_n_20260802.md')),
      'the candidate folder is still in reports/');
    assert(!fs.existsSync(path.join(root, '.wb', 'workflows', 'archives')),
      'no archives/ tree is created');
    assert(fs.readFileSync(reports(root, '2026/08/02/plans/plan_n_20260802.md'), 'utf8') === before,
      'no banner is written into the candidate file');
  }

  // ── recursive fleet mode ───────────────────────────────────────────────────
  if (run('recursive')) {
    console.log('\n--recursive — the /wbStandup fleet sweep finds every scope');
    const mono = path.join(tmp, 'mono');
    scaffold('mono/a', {
      '2026/08/01': { plans: { 'plan_a_20260801.md': '# 1' } },
      '2026/08/09': { plans: { 'plan_a_20260809.md': '# 9' } },
    });
    scaffold('mono/b', {
      '2026/07/30': { ideas: { 'idea_b_20260730.md': '# i' } },
      '2026/07/31': { ideas: { 'idea_b_20260731.md': '# i' } },
    });
    fs.mkdirSync(path.join(mono, 'node_modules', 'pkg', '.wb', 'workflows', 'reports', '2026', '08', '01', 'plans'), { recursive: true });

    const found = A.findScopes(mono);
    assert(found.length === 2, 'finds exactly the two real scopes (got ' + found.length + ')');
    assert(!found.some(function (s) { return s.indexOf('node_modules') !== -1; }),
      'node_modules is not walked');

    A.run([mono, '--recursive']);
    assert(fs.existsSync(path.join(mono, 'a', V, '2026/08/01/plans')) &&
           fs.existsSync(path.join(mono, 'b', V, '2026/07/30/ideas')),
      'each scope is swept against its OWN keeper');
    assert(fs.existsSync(path.join(mono, 'b', R, '2026/07/31/ideas/idea_b_20260731.md')),
      'a scope whose newest file is old still keeps that newest file');
  }

  // ── CLI exit codes ─────────────────────────────────────────────────────────
  if (run('cli')) {
    console.log('\nCLI — exit codes');
    const call = function (args, cwd) {
      try { execFileSync(process.execPath, [ARCHIVE].concat(args), { cwd: cwd || PKG_ROOT, stdio: 'pipe' }); return 0; }
      catch (e) { return typeof e.status === 'number' ? e.status : 1; }
    };
    assert(call(['--help']) === 0, '--help exits 0');

    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-arch-empty-'));
    assert(call(['--list'], empty) === 0, '--list exits 0 with nothing archived');
    assert(call(['--restore=/nonexistent/path'], empty) !== 0,
      '--restore on a missing folder exits NON-zero (a typo must not silently no-op)');
    assert(call([path.join(empty, 'nope'), '--recursive']) !== 0,
      '--recursive on a path with no scope exits NON-zero');

    // Dispatch through the real entry point, the way a user reaches it.
    const INSTALL = path.join(PKG_ROOT, 'bin', 'install.js');
    let out = '';
    try { out = execFileSync(process.execPath, [INSTALL, 'archive', '--help'], { stdio: 'pipe' }).toString(); }
    catch (e) { out = ''; }
    assert(out.indexOf('wb-flow archive') !== -1,
      '`wb-flow archive --help` dispatches through install.js');
  }
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* best effort */ }
}

console.log('\n' + '-'.repeat(50));
console.log(passed + ' passed, ' + failed + ' failed');
if (failed) {
  failures.forEach(function (f) { console.log('  FAIL: ' + f); });
  process.exit(1);
}
process.exit(0);

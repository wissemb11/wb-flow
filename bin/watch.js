#!/usr/bin/env node
'use strict';

/**
 * wb-flow watch — live status of the wave cells running behind the scenes.
 *
 *   wb-flow watch                 follow the newest run, refresh every 5s
 *   wb-flow watch -1              one-shot snapshot (scriptable)
 *   wb-flow watch --list          list recent runs and exit
 *   wb-flow watch --run=<dir>     watch a specific run
 *   wb-flow watch --plan=<file>   parse Est. Time from this plan (else auto)
 *
 * Design notes — read before "simplifying" any of this:
 *
 * 1. `wave.js` writes neither `_meta` nor `__EXIT__` markers, despite the
 *    output_conventions contract asking for both. This tool therefore infers
 *    completion from the `VERDICT:` line that wave.js *does* print, and
 *    liveness from the process table. If `_meta` ever lands, it is used.
 *
 * 2. Liveness is `pgrep -f -- "--id=<ids> "` — NOT log mtime. Agents buffer
 *    while composing, so a thinking cell and a dead one look identical by
 *    idle time. Ten healthy validators once all showed idle≈230s at once.
 *
 * 3. The plan table is split on UNESCAPED pipes only. `line.split('|')` is
 *    wrong: Verify cells legitimately contain `\|`, which shifts every later
 *    column and silently misreads the Est. Time column.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── locating things ─────────────────────────────────────────────────────────

function findWbRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.wb'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

/**
 * Wave logs are written to <root>/.wb/workflows/reports/waves/. Note that
 * wave.js resolves that root to the *git repo root*, not the plan's own scope,
 * so a plan under packages/x/.wb/ still logs to the monorepo root. We search
 * both and merge, newest first, rather than guessing which one is in play.
 */
function waveDirs(cwd) {
  const roots = new Set();
  const near = findWbRoot(cwd);
  if (near) roots.add(near);
  try {
    const top = execSync('git rev-parse --show-toplevel', {
      cwd, stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
    if (top) roots.add(top);
  } catch { /* not a git tree — the nearest .wb/ is all we have */ }

  const runs = [];
  for (const r of roots) {
    const base = path.join(r, '.wb', 'workflows', 'reports', 'waves');
    if (!fs.existsSync(base)) continue;
    for (const name of fs.readdirSync(base)) {
      const full = path.join(base, name);
      if (!fs.statSync(full).isDirectory()) continue;
      if (!/^[A-Za-z0-9′]+_\d{8}_\d{6}$/.test(name)) continue; // skip sessions/
      if (!fs.readdirSync(full).some((f) => f.endsWith('.log'))) continue;
      runs.push({ name, full, mtime: fs.statSync(full).mtimeMs });
    }
  }
  return runs.sort((a, b) => b.mtime - a.mtime);
}

// ── plan parsing ────────────────────────────────────────────────────────────

/** Split a markdown table row on unescaped pipes. See design note 3. */
function splitRow(line) {
  return line.replace(/^\||\|$/g, '').split(/(?<!\\)\|/);
}

function estimatesFromPlan(planPath) {
  const est = {};
  if (!planPath || !fs.existsSync(planPath)) return est;
  for (const line of fs.readFileSync(planPath, 'utf8').split('\n')) {
    if (!line.startsWith('| ')) continue;
    const c = splitRow(line.trim());
    if (c.length < 9) continue;
    const id = (c[0].match(/\s*\[?([A-Za-z0-9.]+)\]?/) || [])[1];
    const mins = (c[7] || '').replace(/\D/g, '');
    if (id && mins) est[id] = parseInt(mins, 10);
  }
  return est;
}

function tasksFromPlan(planPath) {
  const tasks = {};
  if (!planPath || !fs.existsSync(planPath)) return tasks;
  let taskIdx = null;
  for (const line of fs.readFileSync(planPath, 'utf8').split('\n')) {
    if (!line.startsWith('| ')) continue;
    const c = splitRow(line.trim());
    if (taskIdx === null) {
      taskIdx = c.findIndex((col) => /^\s*Task\s*$/.test(col));
      if (taskIdx === -1) taskIdx = 4;
    }
    if (c.length <= taskIdx) continue;
    const id = (c[0].match(/\s*\[?([A-Za-z0-9.]+)\]?/) || [])[1];
    let t = (c[taskIdx] || '').trim();
    t = t.replace(/<[^>]+>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1').trim();
    if (id && t) tasks[id] = t;
  }
  return tasks;
}

function findPlan(runDir) {
  const meta = path.join(runDir, '_meta');
  if (fs.existsSync(meta)) {
    const m = fs.readFileSync(meta, 'utf8').match(/^PLAN=(.+)$/m);
    if (m && fs.existsSync(m[1].trim())) return m[1].trim();
  }
  // Fall back to the most recently modified plan_*.md under any .wb/ nearby.
  try {
    const root = findWbRoot(process.cwd()) || process.cwd();
    const out = execSync(
      `find ${JSON.stringify(root)} -path '*/plans/plan_*.md' -not -path '*/node_modules/*' -printf '%T@ %p\\n' 2>/dev/null | sort -rn | head -1`,
      { shell: '/bin/bash' },
    ).toString().trim();
    return out ? out.split(' ').slice(1).join(' ') : null;
  } catch { return null; }
}

function readMeta(runDir) {
  const f = path.join(runDir, '_meta');
  if (!fs.existsSync(f)) return null;
  const meta = {};
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) meta[m[1]] = m[2];
  }
  return meta;
}

// ── cell state ──────────────────────────────────────────────────────────────

function isAlive(ids) {
  try {
    const cleanEnv = Object.assign({}, process.env);
    delete cleanEnv['BASH_FUNC_which%%'];
    delete cleanEnv['ANTIGRAVITY_SOURCE_METADATA'];
    const out = execSync(`pgrep -a -f -- "--id=${ids} "`, { env: cleanEnv }).toString().trim();
    const matches = out.split('\n').filter((l) => l.trim() && !l.includes('pgrep'));
    return matches.length > 0;
  } catch { return false; }
}

/** Newest VERDICT line wave.js printed for this cell, if it has finished. */
function verdictOf(text) {
  const lines = text.split('\n').filter((l) => /^\s*VERDICT(\s*\[[^\]]+\])?:/.test(l));
  if (!lines.length) return null;
  const last = lines[lines.length - 1].trim();
  const m = last.match(/VERDICT[^:]*:\s*(\S+)/);
  return m ? m[1] : last;
}

function bar(pct) {
  const filled = Math.max(0, Math.min(10, Math.round(pct / 10)));
  return '█'.repeat(filled) + '·'.repeat(10 - filled);
}

/** Read a per-cell .meta file (written by wave.js next to its .log). */
function readCellMeta(runDir, logBase) {
  const f = path.join(runDir, logBase + '.meta');
  if (!fs.existsSync(f)) return {};
  const meta = {};
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) meta[m[1]] = m[2];
  }
  return meta;
}

function collect(runDir, est) {
  const now = Date.now();
  const planPath = findPlan(runDir);
  const planTasks = tasksFromPlan(planPath);
  const cells = [];
  for (const f of fs.readdirSync(runDir).filter((x) => x.endsWith('.log')).sort()) {
    const full = path.join(runDir, f);
    const base = f.replace(/\.log$/, '');
    // wbWork_16-17_2.log -> ids "16,17"
    const m = base.match(/^wb\w+_(.+?)_\d+$/);
    const ids = (m ? m[1] : base).replace(/-/g, ',');
    const st = fs.statSync(full);
    const text = fs.readFileSync(full, 'utf8');
    const verdict = verdictOf(text);
    const alive = isAlive(ids);
    const started = st.birthtimeMs && st.birthtimeMs > 0 ? st.birthtimeMs : st.ctimeMs;
    const elapsed = Math.max(0, Math.round((now - started) / 1000));
    const idle = Math.max(0, Math.round((now - st.mtimeMs) / 1000));
    const budget = ids.split(',').reduce((a, id) => a + (est[id] || 0), 0);
    const cellMeta = readCellMeta(runDir, base);

    let taskText = cellMeta.TASK || '';
    if (!taskText && ids) {
      taskText = ids.split(',').map((id) => planTasks[id]).filter(Boolean).join('; ');
    }

    let state;
    if (verdict && !alive) state = /^(DONE|PASS)$/i.test(verdict) ? 'done' : 'failed';
    else if (alive) state = 'running';
    else state = 'ended';

    cells.push({
      ids, state, verdict, elapsed, idle, budget, bytes: st.size, kind: base.split('_')[0],
      executor: cellMeta.EXECUTOR || '', role: cellMeta.ROLE || cellMeta.KIND || '',
      chain: cellMeta.CHAIN || '', command: cellMeta.COMMAND || '', task: taskText,
    });
  }
  return cells;
}

function render(runDir, est, oneshot) {
  const cells = collect(runDir, est);
  const meta = readMeta(runDir);
  const done = cells.filter((c) => c.state === 'done').length;
  const failed = cells.filter((c) => c.state === 'failed').length;
  const running = cells.filter((c) => c.state === 'running');
  const ended = cells.filter((c) => c.state === 'ended').length;

  let eta = 0;
  for (const c of running) {
    if (c.budget > 0) eta = Math.max(eta, c.budget * 60 - c.elapsed);
  }

  const out = [];
  if (!oneshot) out.push('\x1b[H\x1b[J');
  out.push(`🌊 ${path.basename(runDir)}`);
  if (meta) {
    if (meta.COMMAND) out.push(`   triggered by: ${meta.COMMAND}`);
    if (meta.EXECUTOR) out.push(`   executor:     ${meta.EXECUTOR}`);
  } else {
    out.push('   (no _meta — wave.js does not write one; header inferred from paths)');
  }
  out.push(`   ${path.dirname(runDir)}`);
  const parts = [`✅ ${done} done`, `🔄 ${running.length} running`];
  if (failed) parts.push(`❌ ${failed} failed`);
  if (ended) parts.push(`⚠️  ${ended} ended`);
  out.push(`   ${parts.join(' · ')}${running.length ? ` · ETA ≲ ${Math.ceil(eta / 60)}m (slowest cell)` : ''}   ${new Date().toLocaleTimeString()}`);
  out.push('');

  for (const c of cells) {
    const id = c.ids.padEnd(7);
    // Detail line: role + task + executor + chain (shown below the progress bar)
    const detailParts = [];
    if (c.role) detailParts.push(c.role);
    if (c.task) {
      const cleanTask = c.task.replace(/^\[?#?[\d.,A-Za-z-]+\]?:?\s*/, '');
      const displayTask = cleanTask.length > 80 ? cleanTask.slice(0, 77) + '...' : cleanTask;
      const idStr = c.ids ? `[#${c.ids}]` : '';
      detailParts.push(`task ${idStr}: ${displayTask}`);
    }
    if (c.executor) detailParts.push(`model: ${c.executor}`);
    if (c.chain && c.chain !== c.executor) detailParts.push(`chain: ${c.chain}`);
    const detail = detailParts.length ? `\n         ${detailParts.join(' · ')}` : '';

    if (c.state === 'done') {
      out.push(`  ${id}✅ ${c.verdict}${c.budget ? `   (est ${c.budget}m)` : ''}${detail}`);
    } else if (c.state === 'failed') {
      out.push(`  ${id}❌ ${c.verdict}${c.budget ? `   (est ${c.budget}m)` : ''}${detail}`);
    } else if (c.state === 'ended') {
      out.push(`  ${id}⚠️  ENDED without a verdict (killed/crashed) — last write ${c.idle}s ago${detail}`);
    } else if (c.budget > 0) {
      const pct = Math.round((c.elapsed * 100) / (c.budget * 60));
      const em = Math.round(c.elapsed / 60);
      out.push(pct >= 100
        ? `  ${id}🔄 ██████████ OVER est ${c.budget}m by ${em - c.budget}m   idle ${c.idle}s   ${(c.bytes / 1024).toFixed(0)}KB${detail}`
        : `  ${id}🔄 ${bar(pct)} ${String(pct).padStart(3)}% of ${c.budget}m   idle ${c.idle}s   ${(c.bytes / 1024).toFixed(0)}KB${detail}`);
    } else {
      out.push(`  ${id}🔄 running (no estimate)   idle ${c.idle}s   ${(c.bytes / 1024).toFixed(0)}KB${detail}`);
    }
  }

  console.log(out.join('\n'));
  return running.length > 0;
}

// ── entry ───────────────────────────────────────────────────────────────────

function help() {
  console.log(`
  wb-flow watch — live status of wave cells running in the background

  Usage: wb-flow watch [options]

  Options:
    -1, --once        One-shot snapshot, no refresh (scriptable)
    --list            List recent runs and exit
    --run=<name|dir>  Watch a specific run (default: the newest)
    --plan=<file>     Plan to read 'Est. Time (mins)' from (default: newest)
    --interval=<s>    Refresh seconds in follow mode (default 5)
    -h, --help        Show this message

  Progress and ETA come from the plan's own Est. Time column — the same number
  the 🌊 matrix prints as (⏱️ N min). A cell past its estimate shows OVER, which
  is what distinguishes slow from hung; elapsed time alone cannot.

  Liveness is read from the process table, never from log mtime: agents buffer
  while composing, so an idle log does not mean a dead cell.
`);
}

function run(args) {
  if (args.some((a) => a === '-h' || a === '--help')) { help(); return 0; }

  const runs = waveDirs(process.cwd());
  if (args.includes('--list')) {
    if (!runs.length) { console.log('no wave runs found'); return 1; }
    console.log('\n  Recent wave runs:\n');
    for (const r of runs.slice(0, 15)) {
      const n = fs.readdirSync(r.full).filter((f) => f.endsWith('.log')).length;
      console.log(`    ${r.name.padEnd(22)} ${String(n).padStart(2)} cell(s)   ${new Date(r.mtime).toLocaleString()}`);
    }
    console.log(`\n  Watch one:  wb-flow watch --run=<name>\n`);
    return 0;
  }

  const oneshot = args.some((a) => a === '-1' || a === '--once');
  const runArg = (args.find((a) => a.startsWith('--run=')) || '').slice('--run='.length);
  const planArg = (args.find((a) => a.startsWith('--plan=')) || '').slice('--plan='.length);
  const iv = parseInt((args.find((a) => a.startsWith('--interval=')) || '').slice('--interval='.length), 10) || 5;

  let runDir;
  if (runArg) {
    runDir = fs.existsSync(runArg) ? path.resolve(runArg) : (runs.find((r) => r.name === runArg) || {}).full;
    if (!runDir) { console.error(`❌ no such run: ${runArg}\n   Try: wb-flow watch --list`); return 1; }
  } else {
    if (!runs.length) {
      console.error('❌ no wave runs found under .wb/workflows/reports/waves/');
      console.error('   Start one with:  wb-flow wave <plan.md> --wave=A');
      return 1;
    }
    runDir = runs[0].full;
  }

  const est = estimatesFromPlan(planArg || findPlan(runDir));

  if (oneshot) { render(runDir, est, true); return 0; }
  const tick = () => {
    if (!render(runDir, est, false)) {
      console.log('\nall cells finished.');
      process.exit(0);
    }
    setTimeout(tick, iv * 1000);
  };
  tick();
  return 0;
}

// Internals are exported so test/watch.js can unit-test them directly, the same
// way wave.js exposes buildScript/route. Testing only through the CLI would leave
// the parsing paths — where the escaped-pipe regression lives — uncovered.
module.exports = {
  run,
  findWbRoot, waveDirs, splitRow, estimatesFromPlan, tasksFromPlan,
  findPlan, readMeta, readCellMeta, isAlive, verdictOf, bar, collect,
};

if (require.main === module) process.exit(run(process.argv.slice(2)) || 0);

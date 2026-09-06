#!/usr/bin/env node
/**
 * bin/init.js — `wb-flow init`
 *
 * Does Layer 1 + Layer 2 in one interactive pass:
 *   Layer 1  copy templates/ to a stable home (global: ~/.wb-flow, project: ./.wb)
 *   Layer 2  write the per-agent files that register real slash-commands
 *
 * Interactive by default; fully flag-driven for CI (see --help). Zero deps —
 * prompts use node's built-in readline.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const W = require('./wrappers.js');
const MODEL = require('./model.js');
const { prompter, isYes } = require('./prompt.js');

const PKG_ROOT = path.resolve(__dirname, '..');
const PKG_TEMPLATES = path.join(PKG_ROOT, 'templates');
const GLOBAL_HOME = path.join(os.homedir(), '.wb-flow');

const HELP = `
  wb-flow init — wire the /wb* commands into your AI assistants

  Usage: wb-flow init [options]

  Interactive by default. It asks where the commands should live, which
  assistants to wire, then copies the templates and writes the wrappers.

  Options:
    --scope=<global|project>  Skip the scope question
                                global  → templates in ~/.wb-flow, wrappers in ~/…
                                project → templates in ./.wb, wrappers in ./…
    --agents=<list>           Skip the agent questions. Comma-separated, or
                              "all" / "detected" / "none".
                              Known: ${W.agentNames().join(', ')}
    --templates=<path>        Use an existing template root instead of copying
    --yes, -y                 Accept all defaults, ask nothing (required in CI)
    --force, -f               Overwrite existing files (default: skip existing)
    --dry-run, -n             Show what would be written, change nothing
    --help, -h                Show this message

  Examples:
    wb-flow init
    wb-flow init --scope=global --agents=claude,opencode -y
    wb-flow init --scope=project --agents=all --dry-run
`;

function parseArgs(argv) {
  const opts = {
    scope: null,
    agents: null,
    templates: null,
    yes: false,
    force: false,
    dryRun: false,
    help: false,
  };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--yes' || arg === '-y') opts.yes = true;
    else if (arg === '--force' || arg === '-f') opts.force = true;
    else if (arg === '--dry-run' || arg === '-n') opts.dryRun = true;
    else if (arg.indexOf('--scope=') === 0) opts.scope = arg.slice(8).trim();
    else if (arg.indexOf('--agents=') === 0) opts.agents = arg.slice(9).trim();
    else if (arg.indexOf('--templates=') === 0) opts.templates = arg.slice(12).trim();
  }
  return opts;
}

/** Recursive copy. Returns counts; honours force/dryRun like bin/install.js. */
function copyDir(src, dest, opts, stats, _relBase) {
  stats = stats || { created: 0, updated: 0, skipped: 0, errors: [] };
  _relBase = _relBase || '';
  let entries;
  try {
    entries = fs.readdirSync(src, { withFileTypes: true });
  } catch (err) {
    stats.errors.push({ file: src, error: err.message });
    return stats;
  }
  if (!opts.dryRun) fs.mkdirSync(dest, { recursive: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    const rel = _relBase ? _relBase + '/' + entry.name : entry.name;
    if (rel === '_shared/wbRun') continue;
    if (entry.isDirectory()) {
      copyDir(from, to, opts, stats, rel);
      continue;
    }
    const exists = fs.existsSync(to);
    if (exists && !opts.force) {
      stats.skipped++;
      continue;
    }
    try {
      if (!opts.dryRun) fs.copyFileSync(from, to);
      if (exists) stats.updated++;
      else stats.created++;
    } catch (err) {
      stats.errors.push({ file: to, error: err.message });
    }
  }
  return stats;
}

function resolveAgentList(spec, scope) {
  const all = W.agentNames();
  const usable = all.filter((n) => scope === 'project' || W.AGENTS[n].global);

  if (!spec) return null;
  const value = spec.trim().toLowerCase();
  if (value === 'none') return [];
  if (value === 'all') return usable;
  if (value === 'detected') return usable.filter(W.isInstalled);

  const picked = [];
  const unknown = [];
  for (const raw of spec.split(',')) {
    const name = raw.trim().toLowerCase();
    if (!name) continue;
    if (all.indexOf(name) === -1) unknown.push(name);
    else if (usable.indexOf(name) === -1) {
      console.log('⚠️  ' + W.AGENTS[name].label + ' has no global scope — skipped (use --scope=project).');
    } else picked.push(name);
  }
  if (unknown.length) {
    console.error('❌ Unknown agent(s): ' + unknown.join(', '));
    console.error('   Known: ' + all.join(', '));
    process.exit(1);
  }
  return picked;
}

async function run(argv) {
  let detected = null;   // one enumeration, shared by the catalog fill and the roster step
  const opts = parseArgs(argv || []);

  if (opts.help) {
    console.log(HELP);
    return 0;
  }

  const interactive = Boolean(process.stdin.isTTY) && !opts.yes;

  if (!interactive && !opts.yes && (!opts.scope || !opts.agents)) {
    console.error('❌ Not a TTY: cannot prompt.');
    console.error('   Pass --yes (and optionally --scope=/--agents=), e.g.');
    console.error('   wb-flow init --scope=project --agents=detected --yes');
    return 1;
  }

  console.log('\n🚀 wb-flow init — wiring the /wb* commands into your assistants');
  if (opts.dryRun) console.log('📋 DRY RUN — nothing will be written.');
  console.log('');

  const io = interactive ? prompter() : null;

  try {
    // ---- 1. Scope -----------------------------------------------------------
    let scope = opts.scope;
    if (scope && scope !== 'global' && scope !== 'project') {
      console.error('❌ --scope must be "global" or "project" (got "' + scope + '").');
      return 1;
    }
    if (!scope) {
      if (interactive) {
        console.log('Where should the /wb* commands be available?');
        console.log('  1) Globally — every project on this machine');
        console.log('  2) This project only — ' + process.cwd());
        const answer = await io.ask('> [1] ', '1');
        scope = answer.trim() === '2' ? 'project' : 'global';
        console.log('');
      } else {
        scope = 'project';
      }
    }

    // ---- 2. Template home ---------------------------------------------------
    let templatesHome;
    let templatesRef; // the path embedded in the wrappers
    let copyNeeded = true;

    if (opts.templates) {
      templatesHome = path.resolve(opts.templates);
      templatesRef = templatesHome;
      copyNeeded = false;
      if (!fs.existsSync(path.join(templatesHome, 'commands'))) {
        console.error('❌ --templates=' + templatesHome + ' has no commands/ directory.');
        return 1;
      }
    } else if (scope === 'global') {
      templatesHome = GLOBAL_HOME;
      templatesRef = GLOBAL_HOME;
    } else {
      templatesHome = path.join(process.cwd(), '.wb');
      templatesRef = '.wb'; // relative: the agent runs from the project root
    }

    const commandsRoot = path.join(templatesHome, 'commands');
    const commandsRef = W.joinRef(templatesRef, 'commands');

    // ---- 3. Agents ----------------------------------------------------------
    let agents = resolveAgentList(opts.agents, scope);
    if (!agents) {
      agents = [];
      if (interactive) {
        console.log('Which assistants should get the commands? (detected ones default to Yes)');
        for (const name of W.agentNames()) {
          const agent = W.AGENTS[name];
          const dir = scope === 'global' ? agent.global : agent.project;
          if (!dir) {
            console.log('  – ' + agent.label + ' — project scope only, skipped');
            continue;
          }
          const detected = W.isInstalled(name);
          const note = agent.kind === 'skill' ? ' (skill — agy has no slash-commands)' : '';
          const def = detected ? 'y' : 'n';
          const hint = detected ? '[Y/n]' : '[y/N]';
          const answer = await io.ask(
            '  ' + agent.label + ' → ' + dir + note + ' ' + hint + ' ',
            def
          );
          if (isYes(answer, detected)) agents.push(name);
        }
        console.log('');
      } else {
        agents = W.agentNames().filter(
          (n) => (scope === 'project' || W.AGENTS[n].global) && W.isInstalled(n)
        );
      }
    }

    // ---- 4. Roster ----------------------------------------------------------
    const sourceCommands = copyNeeded ? path.join(PKG_TEMPLATES, 'commands') : commandsRoot;
    if (!fs.existsSync(sourceCommands)) {
      console.error('❌ Templates not found at ' + sourceCommands);
      console.error('   The package installation looks corrupted — reinstall wb-flow.');
      return 1;
    }
    const commands = W.listCommands(sourceCommands);
    if (!commands.length) {
      console.error('❌ No command templates found in ' + sourceCommands);
      return 1;
    }

    // ---- 5. Plan ------------------------------------------------------------
    console.log('Plan:');
    console.log('  scope      : ' + scope);
    console.log('  templates  : ' + (copyNeeded ? templatesHome + '  (copied)' : templatesHome + '  (reused)'));
    console.log('  commands   : ' + commands.length);
    if (agents.length) {
      for (const name of agents) {
        const agent = W.AGENTS[name];
        const dir = path.resolve(scope === 'global' ? agent.global : agent.project);
        const count = agent.kind === 'skill' ? '1 SKILL.md' : commands.length + ' × ' + (agent.kind === 'toml' ? '.toml' : '.md');
        console.log('  ' + agent.label.padEnd(19) + ': ' + dir + '  (' + count + ')');
      }
    } else {
      console.log('  agents     : none — Layer 1 only (no slash-commands)');
    }
    console.log('');

    if (interactive) {
      const go = await io.ask('Proceed? [Y/n] ', 'y');
      if (!isYes(go, true)) {
        console.log('Aborted. Nothing was written.');
        return 0;
      }
      console.log('');
    }

    // ---- 6. Layer 1 ---------------------------------------------------------
    if (copyNeeded) {
      const stats = copyDir(PKG_TEMPLATES, templatesHome, opts);
      console.log(
        '📁 Templates → ' + templatesHome + '  (' + summarize(stats) + ')'
      );
      if (!opts.dryRun) {
        try {
          const version = require(path.join(PKG_ROOT, 'package.json')).version;
          fs.writeFileSync(path.join(templatesHome, '.wb-flow-version'), version + '\n');
        } catch (_) {
          // version stamp is informational only
        }
        const wbRunSrc = path.join(PKG_TEMPLATES, '_shared', 'wbRun');
        const wbRunDestDir = path.join(templatesHome, 'bin');
        const wbRunDest = path.join(wbRunDestDir, 'wbRun');
        try {
          fs.mkdirSync(wbRunDestDir, { recursive: true });
          const destExists = fs.existsSync(wbRunDest);
          const srcMtime = fs.statSync(wbRunSrc).mtimeMs;
          const destMtime = destExists ? fs.statSync(wbRunDest).mtimeMs : 0;
          if (srcMtime <= destMtime) {
            console.log('📁 wbRun → ' + wbRunDest + ' (already up-to-date)');
          } else {
            fs.copyFileSync(wbRunSrc, wbRunDest);
            fs.chmodSync(wbRunDest, 0o755);
            if (destExists) {
              console.log('📁 wbRun → ' + wbRunDest + ' (refreshed — source was newer)');
            } else {
              console.log('📁 wbRun → ' + wbRunDest);
            }
          }
        } catch (err) {
          console.error('  ✗ wbRun install: ' + err.message);
        }
      }
      for (const err of stats.errors) console.error('  ✗ ' + err.file + ': ' + err.error);
      if (!opts.dryRun) {
        try {
          const userDotWb = path.join(os.homedir(), '.wb', 'models.json');
          if (!fs.existsSync(userDotWb)) {
            fs.mkdirSync(path.join(os.homedir(), '.wb'), { recursive: true });
            fs.copyFileSync(path.join(PKG_TEMPLATES, 'models.json'), userDotWb);
            console.log('📁 models.json → ' + userDotWb);
            // The seed is a provider INDEX, not a catalog: it names which
            // providers exist and which CLI reaches each, with empty model
            // lists. Saying so here is the difference between "wb-flow shipped
            // me an empty file" and "wb-flow is waiting for one command".
            //
            // Before this, the seed was byte-identical to a developer's own
            // ~/.wb/models.json, so a fresh install silently inherited someone
            // else's subscriptions and every dispatch died at Gate 1 with
            // `Model not found` — much later, and nowhere near the cause.
            console.log('   ↳ empty by design — it lists providers, not models.');
          }

          // ── fill the catalog from THIS machine ──────────────────────────
          // init already calls MODEL.detect() forty lines below, at the roster
          // step, and then throws that enumeration away for the catalog — the
          // seed was copied verbatim above. That is defect #1 restated at the
          // install layer: the work is already paid for.
          //
          // So enumerate ONCE here and reuse it for both. Non-fatal by rule —
          // this file's own comment says "Never fail an install over the roster:
          // the wiring is the point", and a catalog fill is no different.
          try {
            detected = MODEL.detect();
            const CS = require('./catalog_sync.js');
            const seedCat = JSON.parse(fs.readFileSync(userDotWb, 'utf8'));
            const known = (seedCat.providers || []).map(function (p) { return p.provider; });
            const poolOfProvider = {};
            for (const p of seedCat.providers || []) if (p.provider && p.pool) poolOfProvider[p.provider] = p.pool;

            // Which providers to fill: the persisted Step 0 selection if there
            // is one, else every catalogued provider this machine can reach.
            const persisted = MODEL.activeProviders();
            const reachable = (detected.providers || []).map(function (d) {
              return String(d).toLowerCase().replace(/\s+/g, '-');
            });
            const scope = (persisted && persisted.length)
              ? persisted
              : known.filter(function (n) {
                  const k = String(n).toLowerCase();
                  return reachable.some(function (c) { return c === k || c.indexOf(k) !== -1 || k.indexOf(c) !== -1; });
                });

            if (!interactive && !scope.length) {
              console.log('   ↳ fill it from THIS machine:  wb-flow model --sync-catalog');
              console.log('   ↳ or one provider at a time:  wb-flow model --add=<provider>');
            } else if (scope.length) {
              const live = CS.enumerateLive(detected, { knownProviders: known, poolOfProvider: poolOfProvider });
              const held = CS.heldFamiliesOf(live.groups);
              for (const g of live.groups) g.models = CS.curate(g.models, { heldFamilies: held });
              const merged = CS.mergeCatalog(seedCat, live, { only: scope });
              fs.writeFileSync(userDotWb, JSON.stringify(merged.catalog, null, 2) + '\n');
              for (const g of merged.providers) {
                if (scope.indexOf(g.provider) === -1) continue;
                const n = (g.models || []).filter(function (m) { return !(m && m.retired); }).length;
                console.log('   ✅ ' + g.provider.padEnd(16) + n + ' models');
              }
              for (const p of merged.changes.reported || []) {
                console.log('   ℹ️  ' + p.padEnd(16) + 'credentialed but not in your catalog — wb-flow model --add=' + p);
              }
              for (const p of Object.keys(CS.NON_ENUMERABLE)) {
                if (scope.indexOf(p) !== -1) console.log('   ⚠️  ' + p.padEnd(16) + CS.NON_ENUMERABLE[p]);
              }
            }
          } catch (err) {
            // Never fail an install over the catalog.
            console.log('   ↳ catalog fill skipped: ' + (err && err.message ? err.message : err));
            console.log('   ↳ run it yourself:  wb-flow model --sync-catalog');
          }
        } catch (_) {}
      }
    }

    // ---- 7. Layer 2 ---------------------------------------------------------
    let wrapperTotal = 0;
    for (const name of agents) {
      const agent = W.AGENTS[name];
      const outDir = path.resolve(scope === 'global' ? agent.global : agent.project);
      const stats = W.writeWrappers({
        agent: name,
        outDir: outDir,
        templatesRoot: commandsRef,
        commands: commands,
        force: opts.force,
        dryRun: opts.dryRun,
      });
      wrapperTotal += stats.created + stats.updated;
      console.log('🔗 ' + agent.label.padEnd(19) + ' → ' + outDir + '  (' + summarize(stats) + ')');
      for (const err of stats.errors) console.error('  ✗ ' + err.file + ': ' + err.error);
    }

    // ---- 8. Model roster ----------------------------------------------------
    // The shipped roster names no models on purpose. Filling it here is the one
    // moment we are guaranteed the user's attention — a roster inherited from
    // someone else's subscriptions does not fail at install, it fails later as a
    // wave cell that dies at G1 with `Model not found`, or one that just hangs.
    if (!opts.dryRun) {
      const rosterPath = path.join(templatesHome, 'commands', 'model_recommendations.md');
      const defaultPath = path.join(templatesHome, 'commands', 'model_recommendations.default.md');
      try {
        // Seed from the neutral default only when no roster exists — a roster
        // the user already has is never overwritten. Note this CANNOT tell a
        // user's roster from one the packager shipped populated; that is a
        // packaging concern, enforced by bin/verify-roster.js at prepublish.
        if (!fs.existsSync(rosterPath) && fs.existsSync(defaultPath)) {
          fs.copyFileSync(defaultPath, rosterPath);
        }
        if (fs.existsSync(rosterPath)) {
          console.log('');
          console.log('🎛️  Model roster');
          const found = detected || MODEL.detect();   // reuse the enumeration paid for above
          const bits = [];
          if (found.opencode) bits.push('opencode (' + found.opencode.credentialed + ' credentialed)');
          if (found.agy) bits.push('agy (' + found.agy.models.length + ' models)');
          if (found.claude) bits.push('claude');
          console.log('   detected: ' + (bits.length ? bits.join(', ') : 'no model CLI found'));

          const proposed = MODEL.proposeRoster(found);
          for (const role of MODEL.ROLE_ORDER) {
            console.log('   ' + role.padEnd(11) + ((proposed[role] || []).join(' / ') || '—'));
          }

          let write = true;
          if (interactive) {
            const customize = isYes(await io.ask('   Customize the picks? [y/N] ', 'n'), false);
            if (customize) {
              for (const role of MODEL.ROLE_ORDER) {
                proposed[role] = await MODEL.pickRole(io, role, found, proposed[role] || [], []);
              }
            }
            write = isYes(await io.ask('   Write this roster? [Y/n] ', 'y'), true);
          }
          if (write) {
            const meta = { date: new Date().toISOString().slice(0, 10), unreachable: [] };
            // Reachability is opt-in and never the default: it dispatches a real
            // call per model. Catalogued + credentialed still does not imply
            // reachable, so offer it — but make the user choose to spend it.
            if (interactive) {
              const uniq = Array.from(new Set(MODEL.ROLE_ORDER.reduce(function (a, r) {
                return a.concat(proposed[r] || []);
              }, []))).filter(function (m) { return !/\(auto\)|\(in-session\)/i.test(m); });
              const probe = isYes(await io.ask(
                '   Probe those ' + uniq.length + ' model(s) to check they answer? (real calls, ~45s each) [y/N] ', 'n'), false);
              if (probe) {
                for (const slug of uniq) {
                  const res = MODEL.probeModel(slug, 45000);
                  console.log('   ' + (res.ok ? '✅' : '❌') + ' ' + slug + (res.ok ? '' : '  ' + (res.why || '')));
                  if (!res.ok) meta.unreachable.push(slug);
                }
                meta.probed = true;
              }
            }
            const text = fs.readFileSync(rosterPath, 'utf8');
            fs.writeFileSync(rosterPath, MODEL.writeRosterInto(text, proposed, meta));
            console.log('   → ' + rosterPath);
            if (meta.unreachable.length) {
              console.log('   ⚠️  ' + meta.unreachable.length + ' model(s) did not answer — marked in the table.');
            }
          } else {
            console.log('   skipped — run `wb-flow model --detect` later.');
          }
        }
      } catch (err) {
        // Never fail an install over the roster: the wiring is the point, and
        // `wb-flow model --detect` can fix this afterwards.
        console.log('   ⚠️  roster step skipped: ' + (err && err.message ? err.message : err));
      }
    }

    // ---- 9. What now --------------------------------------------------------
    console.log('');
    if (opts.dryRun) {
      console.log('📋 Dry run complete — nothing was written.');
      return 0;
    }
    console.log('✅ Done.');
    console.log('');
    const example = commands.some((c) => c.name === 'wbPlan') ? 'wbPlan' : commands[0].name;
    if (agents.length) {
      console.log('Try it — restart your assistant, then:');
      for (const name of agents) {
        const agent = W.AGENTS[name];
        if (agent.kind === 'skill') {
          console.log('  ' + agent.label.padEnd(19) + ' run ' + example + ' on src/     (natural language — no slash)');
        } else {
          console.log('  ' + agent.label.padEnd(19) + ' /' + example + ' src/');
        }
      }
    } else {
      console.log('No wrappers were written. You can still run any command by asking:');
      console.log('  read `' + W.joinRef(commandsRef, example + '/' + example + '_template.md') + '` and execute it on src/');
    }
    console.log('');
    console.log('Models: wb-flow model --pick              (interactive picker)');
    console.log('        wb-flow model --set worker=<slug>');
    console.log('        wb-flow model --probe             (verify they answer)');
    console.log('Docs: https://flow.wbc-ui.com');
    return 0;
  } catch (err) {
    if (err && err.wbAbort) {
      console.log('\n\nAborted — input closed. Nothing was written.');
      console.log('Tip: for unattended setup use `wb-flow init --scope=… --agents=… --yes`.');
      return 1;
    }
    throw err;
  } finally {
    if (io) io.close();
  }
}

function summarize(stats) {
  const parts = [];
  if (stats.created) parts.push(stats.created + ' created');
  if (stats.updated) parts.push(stats.updated + ' updated');
  if (stats.skipped) parts.push(stats.skipped + ' skipped');
  if (!parts.length) parts.push('nothing to do');
  return parts.join(', ');
}

module.exports = { run: run };

if (require.main === module) {
  run(process.argv.slice(2))
    .then(function (code) {
      process.exit(code || 0);
    })
    .catch(function (err) {
      console.error('❌ ' + (err && err.message ? err.message : err));
      process.exit(1);
    });
}

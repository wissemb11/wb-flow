#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(process.cwd(), '.wb');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// Parse flags
const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');
const dryRun = args.includes('--dry-run') || args.includes('-n');
const listCmd = args.includes('--list') || args.includes('-l');

// Subcommand dispatch. `init` also wires the per-agent slash-commands (Layer 2),
// so it handles its own flags and help.
const subcommand = args.find((a) => a.charAt(0) !== '-');
if (subcommand === 'init') {
  require('./init.js')
    .run(args.filter((a) => a !== 'init'))
    .then((code) => process.exit(code || 0))
    .catch((err) => {
      console.error('❌ ' + (err && err.message ? err.message : err));
      process.exit(1);
    });
  return;
}
if (subcommand === 'archive') {
  process.exit(require('./archive.js').run(args.filter((a) => a !== 'archive')) || 0);
}
if (subcommand === 'next') {
  process.exit(require('./next.js').run(args.filter((a) => a !== 'next')) || 0);
}
if (subcommand === 'snap') {
  process.exit(require('./snap.js').run(args.filter((a) => a !== 'snap')) || 0);
}
if (subcommand === 'wave') {
  process.exit(require('./wave.js').run(args.filter((a) => a !== 'wave')) || 0);
}
if (subcommand === 'watch') {
  // Follow mode never returns — it schedules itself and exits from inside.
  const code = require('./watch.js').run(args.filter((a) => a !== 'watch'));
  if (typeof code === 'number' && args.some((a) => a === '-1' || a === '--once' || a === '--list' || a === '-h' || a === '--help')) {
    process.exit(code);
  }
  return;
}
if (subcommand === 'lint') {
  process.exit(require('./lint.js').run(args.filter((a) => a !== 'lint')) || 0);
}
if (subcommand === 'model') {
  // run() is async (the --pick picker awaits input), same shape as init.
  require('./model.js')
    .run(args.filter((a) => a !== 'model'))
    .then((code) => process.exit(code || 0))
    .catch((err) => { console.error('❌ ' + (err && err.message ? err.message : err)); process.exit(1); });
  return;
}
if (subcommand) {
  console.error(`❌ Unknown subcommand: ${subcommand}`);
  console.error('   Known subcommands: archive, init, lint, model, next, snap, watch, wave. Run `wb-flow --help` for usage.');
  process.exit(1);
}

if (args.includes('--version') || args.includes('-v')) {
  try {
    console.log(require('../package.json').version);
    process.exit(0);
  } catch (err) {
    console.error('❌ Could not read package.json: ' + err.message);
    process.exit(1);
  }
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  wb-flow — Bootstrap the /wb* agentic command system

  Usage: npx wb-flow [command] [options]

  Commands:
    archive         Retire superseded daily reports: move every
                    reports/<Y>/<M>/<D>/<category>/ folder except the newest into
                    .wb/workflows/archives/ at the same depth, so relative links
                    keep resolving. standups/ and tracks/ are exempt (they ARE
                    the log). \`-n\` to preview, \`--restore=\` to undo.
    init            Interactive setup: copy the templates AND register the
                    /wb* slash-commands in your assistants (Claude Code,
                    OpenCode, Gemini CLI, Antigravity, Cursor, Codex).
                    Run \`wb-flow init --help\` for its options.
    lint            Run static analysis on plan files to catch structural
                    and data consistency errors.
    model           Inspect or rewrite the /wb* model roster. Detects which
                    CLIs and providers you actually have credentials for and
                    writes commands/model_recommendations.md from that.
                    Run \`wb-flow model --help\` for its options.
    next            Print how to run a plan — wave inventory, the ordered
                    command list, and the derived reasons not to autopilot.
                    \`--embed\` writes it into the plan file itself.
    snap            Pin an output (plan, explanation, report folder) into
                    .wb/snaps/<YYYYMMDD>_<label>/ so it stays findable.
                    Symlink by default; --copy freezes the content.
    wave            Turn one row of a plan's 🌊 Next Executable Sequence into a
                    parallel bash script, routed per role to opencode/Claude.
                    Run \`wb-flow wave --help\` for its options.
    watch           Live status of the wave cells running in the background:
                    per-cell progress, % of Est. Time, OVER-estimate state and
                    ETA. \`-1\` for a one-shot snapshot, \`--list\` for past runs.
    (none)          Copy templates/ into <cwd>/.wb/ and stop.

  Options:
    --force, -f     Overwrite existing files (default: skip existing)
    --dry-run, -n   Show what would be copied without making changes
    --list, -l      List the bundled command roster and exit
    --version, -v   Print the installed version and exit
    --help, -h      Show this help message

  Copies templates/ into <cwd>/.wb/ to materialize the full
  set of /wb* command templates and shortcut grammar. This alone does NOT
  register slash-commands in any assistant — use \`wb-flow init\` for that.
  `);
  process.exit(0);
}


if (listCmd) {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error('❌ Error: Internal templates directory not found.');
    process.exit(1);
  }
  const manifestPath = path.join(TEMPLATES_DIR, 'commands', 'wb_commands_reference.json');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`\n📦 Bundled Command Roster (${Object.keys(manifest).length} commands):\n`);
    for (const [cmd, desc] of Object.entries(manifest)) {
      console.log(`  - ${cmd.padEnd(15)} : ${typeof desc === 'object' ? desc.description : desc}`);
    }
    console.log('');
  } catch (err) {
    console.error('❌ Error reading command manifest:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

const stats = { created: 0, skipped: 0, updated: 0, errors: [] };

function copyDirectory(src, dest, _relBase) {
  _relBase = _relBase || '';
  try {
    if (!fs.existsSync(dest)) {
      if (!dryRun) {
        fs.mkdirSync(dest, { recursive: true });
      }
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      const rel = _relBase ? _relBase + '/' + entry.name : entry.name;

      if (rel === '_shared/wbRun') continue;

      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath, rel);
      } else {
        try {
          const exists = fs.existsSync(destPath);

          if (exists && !force) {
            stats.skipped++;
          } else {
            if (dryRun) {
              const action = exists ? 'update' : 'create';
              const relPath = path.relative(process.cwd(), destPath);
              console.log(`  [${action}] ${relPath}`);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }

            if (exists) {
              stats.updated++;
            } else {
              stats.created++;
            }
          }
        } catch (err) {
          const relPath = path.relative(process.cwd(), destPath);
          stats.errors.push({ file: relPath, error: err.message });
        }
      }
    }
  } catch (err) {
    const relPath = path.relative(process.cwd(), src);
    stats.errors.push({ file: relPath, error: err.message });
  }
}

console.log('🚀 Initializing wb-flow inside your project...');

if (dryRun) {
  console.log('📋 DRY RUN — no files will be modified.\n');
}

if (fs.existsSync(TARGET_DIR)) {
  if (force) {
    console.log(`⚠️  .wb/ folder already exists in ${process.cwd()}. Overwriting (--force)...`);
  } else {
    console.log(`📁 .wb/ folder already exists in ${process.cwd()}. New files only (use --force to overwrite).`);
  }
} else {
  console.log(`📁 Creating .wb/ folder in ${process.cwd()}...`);
}

if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error('\n❌ Error: Internal templates directory not found.');
  console.error(`   Expected path: ${TEMPLATES_DIR}`);
  console.error('   This usually means the package installation is corrupted. Please reinstall @wbc-ui/wb-flow.');
  process.exit(1);
}

copyDirectory(TEMPLATES_DIR, TARGET_DIR);

// Version stamp
const pkgPath = path.join(__dirname, '..', 'package.json');
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const wbDir = TARGET_DIR;
  if (!dryRun) {
    if (!fs.existsSync(wbDir)) {
      fs.mkdirSync(wbDir, { recursive: true });
    }
    fs.writeFileSync(path.join(wbDir, '.wb-flow-version'), pkg.version + '\n');
  }
  if (dryRun) {
    console.log(`  [create] .wb/.wb-flow-version → ${pkg.version}`);
  }
} catch (_) {
  // Non-fatal: version stamp is informational only
}

// Post-install guidance
if (!dryRun) {
  const docsUrl = 'https://flow.wbc-ui.com';
  console.log('');
  console.log('📍 Templates installed to: .wb/');
  console.log('📖 Documentation: ' + docsUrl);
  console.log('🚀 Start here: /wbSetup <your-project-path>');
}

// Summary
if (dryRun) {
  console.log(`\n📋 Dry run complete: ${stats.created} to create, ${stats.updated} to update, ${stats.skipped} to skip.`);
} else {
  const parts = [];
  if (stats.created > 0) parts.push(`${stats.created} created`);
  if (stats.updated > 0) parts.push(`${stats.updated} updated`);
  if (stats.skipped > 0) parts.push(`${stats.skipped} skipped`);
  console.log(`✅ Done! ${parts.join(', ')}.`);
}

// Bare `wb-flow` copies templates and stops — which reads like that is all the
// CLI does. `init` and `wave` are only discoverable via --help, so point at it.
console.log('');
console.log('🔧 Other commands: `wb-flow init` (register the /wb* slash-commands)');
console.log('                   `wb-flow model --detect` (pick models from what you can reach)');
console.log('                   `wb-flow wave <plan.md> --wave=A` (run one wave of a plan)');
console.log('                   `wb-flow archive <scope> -n` (retire superseded daily reports)');
console.log('                   `wb-flow --help` for the full list');

if (stats.errors.length > 0) {
  console.error(`\n⚠️  ${stats.errors.length} error(s) during copy:`);
  for (const { file, error } of stats.errors) {
    console.error(`  ✗ ${file}: ${error}`);
  }
  process.exit(1);
}


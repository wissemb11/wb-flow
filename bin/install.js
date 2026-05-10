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

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  wb-flow — Bootstrap the /wb* agentic command system

  Usage: npx wb-flow [options]

  Options:
    --force, -f     Overwrite existing files (default: skip existing)
    --dry-run, -n   Show what would be copied without making changes
    --list, -l      List the bundled command roster and exit
    --help, -h      Show this help message

  Copies templates/ into <cwd>/.wb/ to materialize the full
  set of /wb* slash-command templates and shortcut grammar.
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

function copyDirectory(src, dest) {
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

      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
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
  const docsUrl = 'https://flow.wb-ui.com';
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

if (stats.errors.length > 0) {
  console.error(`\n⚠️  ${stats.errors.length} error(s) during copy:`);
  for (const { file, error } of stats.errors) {
    console.error(`  ✗ ${file}: ${error}`);
  }
  process.exit(1);
}


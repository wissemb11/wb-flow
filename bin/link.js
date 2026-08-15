#!/usr/bin/env node
/**
 * bin/link.js — Monorepo-internal wrapper wiring tool.
 *
 * PURPOSE: Rewrites .claude/commands/ wrappers to point at the local .wb/ copies
 * instead of the raw templates/ path inside the wb-flow package.
 *
 * CONSUMER NOTE: This script is for MONOREPO-INTERNAL DEVELOPMENT ONLY.
 * It writes to MONOREPO_ROOT/.claude/commands/ (5 levels up from this package).
 * npm consumers of @wbc-ui/wb-flow cannot use this script — they should instead
 * run `npx wb-flow` which copies templates directly to their project .wb/.
 *
 * USAGE: Run from the monorepo root (wb-labs/), after `npx wb-flow` has been
 * executed to populate the .wb/ commands directory.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');

function findMonorepoRoot(startDir) {
  let current = startDir;
  while (current !== path.dirname(current)) {
    if (
      fs.existsSync(path.join(current, '.claude', 'commands')) ||
      fs.existsSync(path.join(current, '.git'))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

const MONOREPO_ROOT = findMonorepoRoot(PKG_ROOT);

if (!MONOREPO_ROOT) {
  console.error('❌ Error: could not locate the monorepo root.');
  console.error('   bin/link.js walks upward from the package directory looking for');
  console.error('   .claude/commands or .git — neither marker was found.');
  console.error('   Ensure this script is installed inside a monorepo or git repository.');
  process.exit(1);
}

// D2 (2026-08-01): USER level — ~/.claude/commands — is the canonical wrapper
// location. verify-wrappers.js was taught this by G3; link.js was not, so the
// tool that DETECTS drift could not be fixed by the tool that GENERATES
// wrappers: `link.js` printed "Nothing to link" and exited 0 against real drift.
// Resolution order must match verify-wrappers.js exactly, or they disagree again.
const USER_CLAUDE_DIR = path.join(os.homedir(), '.claude', 'commands');
const REPO_CLAUDE_DIR = path.join(MONOREPO_ROOT, '.claude', 'commands');
const claudeCommandsDir = fs.existsSync(USER_CLAUDE_DIR) ? USER_CLAUDE_DIR : REPO_CLAUDE_DIR;
const projectRoot = MONOREPO_ROOT;

if (projectRoot.includes('packages/wb-flow')) {
  console.error('❌ Error: bin/link.js must be run from a consumer project root,');
  console.error('   not from inside the wb-flow package directory.');
  console.error('   This script writes wrappers to MONOREPO_ROOT/.claude/commands/');
  console.error('   and is not usable by npm consumers of @wbc-ui/wb-flow.');
  console.error('   For monorepo-internal development only.');
  process.exit(1);
}

const wbCommandsDir = path.join(projectRoot, '.wb', 'commands');

let exitCode = 0;

if (fs.existsSync(claudeCommandsDir)) {
  if (!fs.existsSync(wbCommandsDir)) {
    console.log('No .wb/commands directory found. Please run npx wb-flow first.');
    exitCode = 1;
  } else {
    console.log('🔗 Wiring .claude/commands/ wrappers to .wb/ template copies...');
    let updated = 0;

    const files = fs.readdirSync(claudeCommandsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const cmdName = file.replace('.md', '');
        const wrapperPath = path.join(claudeCommandsDir, file);

        const targetTemplatePath = path.posix.join('.wb', 'commands', cmdName, `${cmdName}_template.md`);
        if (fs.existsSync(path.join(projectRoot, targetTemplatePath))) {
          let content = fs.readFileSync(wrapperPath, 'utf8');

          const rgx = /frontEnd\/wbc-ui\/core2\/packages\/wb-flow\/templates\/commands\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+_template\.md/g;

          if (rgx.test(content)) {
            content = content.replace(rgx, targetTemplatePath);
            fs.writeFileSync(wrapperPath, content);
            updated++;
            console.log(`  [linked] ${file} -> ${targetTemplatePath}`);
          }
        }
      }
    }

    console.log(`✅ Done. Updated ${updated} wrappers.`);
  }
} else {
  console.error('❌ No .claude/commands directory found at either:');
    console.error('     user: ' + USER_CLAUDE_DIR);
    console.error('     repo: ' + REPO_CLAUDE_DIR);
    console.error('   Nothing to link — exiting non-zero so this is not mistaken for success.');
    process.exitCode = 1;
}

const installedWbRun = path.join(projectRoot, '.wb', 'bin', 'wbRun');
const sourceWbRun = path.join(PKG_ROOT, 'templates', '_shared', 'wbRun');
if (fs.existsSync(sourceWbRun)) {
  try {
    const destExists = fs.existsSync(installedWbRun);
    const srcMtime = fs.statSync(sourceWbRun).mtimeMs;
    const destMtime = destExists ? fs.statSync(installedWbRun).mtimeMs : 0;
    if (srcMtime > destMtime) {
      const destDir = path.dirname(installedWbRun);
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(sourceWbRun, installedWbRun);
      fs.chmodSync(installedWbRun, 0o755);
      console.log('📁 wbRun → ' + installedWbRun + ' (refreshed — source was newer)');
    } else if (destExists) {
      console.log('📁 wbRun → ' + installedWbRun + ' (already up-to-date)');
    }
  } catch (err) {
    console.error('  ✗ wbRun refresh: ' + err.message);
  }
}

// ── Generate wrappers the manifest declares but disk lacks ──────────────────
// link.js only ever REWROTE wrappers that already existed, so it could not
// repair the drift verify-wrappers.js detects: on 2026-08-01 `wbModel.md` was
// missing, `npm test` failed (prepublishOnly runs it), and `node bin/link.js`
// printed "Updated 0 wrappers" and exited 0. The detector and the generator
// must close the same loop, or the obvious remedy is a silent no-op.
try {
  const wrappers = require('./wrappers.js');
  const templatesRoot = path.join(PKG_ROOT, 'templates', 'commands');
  const commands = wrappers.listCommands(templatesRoot);
  // force:false → writeWrappers' own `write()` skips existing files, so this
  // creates ONLY what is missing and never clobbers a hand-edited wrapper.
  const stats = wrappers.writeWrappers({
    agent: 'claude',
    outDir: claudeCommandsDir,
    templatesRoot: templatesRoot,
    commands: commands,
    force: false,
    dryRun: false,
  });
  if (stats.created > 0) {
    console.log('🆕 Generated ' + stats.created + ' missing wrapper(s):');
    for (const fp of stats.files) console.log('     + ' + path.basename(fp));
  } else {
    console.log('🆕 No missing wrappers — manifest and ' + claudeCommandsDir + ' agree.');
  }
  if (stats.errors && stats.errors.length) {
    for (const e of stats.errors) console.error('  ✗ ' + e.file + ': ' + e.error);
    exitCode = 1;
  }
} catch (err) {
  console.error('  ✗ wrapper generation: ' + err.message);
  exitCode = 1;
}

if (exitCode !== 0) process.exit(exitCode);

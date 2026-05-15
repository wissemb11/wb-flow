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
const path = require('path');

const projectRoot = process.cwd();

if (projectRoot.includes('packages/wb-flow')) {
  console.error('❌ Error: bin/link.js must be run from a consumer project root,');
  console.error('   not from inside the wb-flow package directory.');
  console.error('   This script writes wrappers to MONOREPO_ROOT/.claude/commands/');
  console.error('   and is not usable by npm consumers of @wbc-ui/wb-flow.');
  console.error('   For monorepo-internal development only.');
  process.exit(1);
}

const claudeCommandsDir = path.join(projectRoot, '.claude', 'commands');
const wbCommandsDir = path.join(projectRoot, '.wb', 'commands');

if (!fs.existsSync(claudeCommandsDir)) {
  console.log('No .claude/commands directory found. Nothing to link.');
  process.exit(0);
}

if (!fs.existsSync(wbCommandsDir)) {
  console.log('No .wb/commands directory found. Please run npx wb-flow first.');
  process.exit(1);
}

console.log('🔗 Wiring .claude/commands/ wrappers to .wb/ template copies...');
let updated = 0;

const files = fs.readdirSync(claudeCommandsDir);
for (const file of files) {
  if (file.endsWith('.md')) {
    const cmdName = file.replace('.md', '');
    const wrapperPath = path.join(claudeCommandsDir, file);
    
    // Check if the corresponding command exists in .wb/commands
    const targetTemplatePath = path.posix.join('.wb', 'commands', cmdName, `${cmdName}_template.md`);
    if (fs.existsSync(path.join(projectRoot, targetTemplatePath))) {
      let content = fs.readFileSync(wrapperPath, 'utf8');
      
      // We want to replace paths that point into frontEnd/wbc-ui/.../templates/commands/ with .wb/commands/
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

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

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

const HOME = os.homedir();

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

function verifyWrappers(options) {
  const opts = options || {};
  const pkgRoot = path.resolve(opts.pkgRoot || PKG_ROOT);
  const home = path.resolve(opts.home || HOME);
  const monorepoRoot =
    Object.prototype.hasOwnProperty.call(opts, 'monorepoRoot')
      ? opts.monorepoRoot && path.resolve(opts.monorepoRoot)
      : findMonorepoRoot(pkgRoot);

  const templatesDir = path.join(pkgRoot, 'templates', 'commands');
  const userClaude = path.join(home, '.claude', 'commands');
  const userOpencode = path.join(home, '.config', 'opencode', 'command');
  const repoClaude = monorepoRoot ? path.join(monorepoRoot, '.claude', 'commands') : null;
  const repoOpencode = monorepoRoot ? path.join(monorepoRoot, '.config', 'opencode', 'command') : null;

  if (!fs.existsSync(templatesDir)) {
    return result(false, '❌ Templates dir not found');
  }

  const claudeDir = fs.existsSync(userClaude) ? userClaude : repoClaude;
  const opencodeDir = fs.existsSync(userOpencode) ? userOpencode : repoOpencode;

  if (!claudeDir || !opencodeDir || !fs.existsSync(claudeDir) || !fs.existsSync(opencodeDir)) {
    return result(
      true,
      '⚠️ SKIPPED (not PASSED) — wrapper directories not found' +
        (monorepoRoot ? ' at ' + monorepoRoot + ' or ' + home : ' (no monorepo root or home dir found)') +
        '.',
      { skipped: true }
    );
  }

  const manifestPath = path.join(templatesDir, 'wb_commands_reference.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const commands = Object.keys(manifest);

  const lines = ['🔍 Verifying wrapper parity across clients...'];
  const missing = [];

  for (const cmd of commands) {
    const claudeFile = path.join(claudeDir, `${cmd}.md`);
    if (!fs.existsSync(claudeFile)) {
      missing.push({ client: 'Claude', cmd });
      lines.push(`  ✗ Missing Claude wrapper: ${cmd}.md`);
    }

    const opencodeFile = path.join(opencodeDir, `${cmd}.md`);
    if (!fs.existsSync(opencodeFile)) {
      missing.push({ client: 'OpenCode', cmd });
      lines.push(`  ✗ Missing OpenCode wrapper: ${cmd}.md`);
    }
  }

  if (missing.length > 0) {
    lines.push('');
    lines.push(`❌ Wrapper drift detected: ${missing.length} missing wrapper(s).`);
    return result(false, lines.join('\n'), { missing });
  }

  lines.push('✅ Wrapper parity confirmed (100% coverage).');
  return result(true, lines.join('\n'), { missing });
}

if (require.main === module) {
  const outcome = verifyWrappers();
  if (outcome.stdout) console.log(outcome.stdout);
  if (outcome.stderr) console.error(outcome.stderr);
  process.exit(outcome.status);
}

module.exports = {
  findMonorepoRoot,
  verifyWrappers,
};

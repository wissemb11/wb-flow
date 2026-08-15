/**
 * bin/wrappers.js — Layer 2 emitters.
 *
 * wb-flow ships agent-agnostic markdown procedures (Layer 1). This module turns
 * them into the per-agent files that register a real slash-command (Layer 2):
 *
 *   Claude Code / OpenCode / Cursor  → <cmd>.md   (frontmatter + $ARGUMENTS)
 *   Gemini CLI                       → <cmd>.toml (description + prompt + {{args}})
 *   Antigravity                      → skills/wb-flow/SKILL.md (one dispatcher;
 *                                      agy has no user slash-commands at all)
 *
 * Pure functions + one writer. No runtime dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');

/** Where each agent looks for commands. `null` = that scope is unsupported. */
const AGENTS = {
  claude: {
    label: 'Claude Code',
    global: path.join(os.homedir(), '.claude', 'commands'),
    project: path.join('.claude', 'commands'),
    kind: 'md',
    detect: [path.join(os.homedir(), '.claude')],
  },
  opencode: {
    label: 'OpenCode',
    global: path.join(os.homedir(), '.config', 'opencode', 'command'),
    project: path.join('.opencode', 'command'),
    kind: 'md',
    detect: [path.join(os.homedir(), '.config', 'opencode')],
  },
  gemini: {
    label: 'Gemini CLI',
    global: path.join(os.homedir(), '.gemini', 'commands'),
    project: path.join('.gemini', 'commands'),
    kind: 'toml',
    detect: [path.join(os.homedir(), '.gemini')],
  },
  antigravity: {
    label: 'Antigravity (agy)',
    global: path.join(os.homedir(), '.gemini', 'config', 'skills'),
    project: path.join('.agents', 'skills'),
    kind: 'skill',
    detect: [path.join(os.homedir(), '.gemini', 'antigravity-cli')],
  },
  cursor: {
    label: 'Cursor',
    global: null, // project-scoped only
    project: path.join('.cursor', 'commands'),
    kind: 'md',
    detect: [path.join(os.homedir(), '.cursor')],
  },
  codex: {
    label: 'Codex',
    global: path.join(os.homedir(), '.codex', 'commands'),
    project: path.join('.codex', 'commands'),
    kind: 'md',
    detect: [path.join(os.homedir(), '.codex')],
  },
};

/** Commands that route their output through the /wbActOn engine. */
const CHAIN_FLAGS = ['--act', '--wbPlan'];

function agentNames() {
  return Object.keys(AGENTS);
}

function isInstalled(name) {
  const agent = AGENTS[name];
  if (!agent) return false;
  return agent.detect.some((p) => fs.existsSync(p));
}

/** Read the extended manifest; fall back to the plain one, then to bare names. */
function loadManifest(templatesRoot) {
  const candidates = [
    'wb_commands_reference.claude.json',
    'wb_commands_reference.json',
  ];
  for (const file of candidates) {
    const p = path.join(templatesRoot, file);
    if (!fs.existsSync(p)) continue;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (_) {
      // try the next candidate
    }
  }
  return {};
}

/**
 * The command roster: every templates/commands/<cmd>/<cmd>_template.md on disk,
 * plus manifest entries that alias an existing template (e.g. wbStopTrack).
 */
function listCommands(templatesRoot) {
  const manifest = loadManifest(templatesRoot);
  const out = [];
  const seen = Object.create(null);

  let entries = [];
  try {
    entries = fs.readdirSync(templatesRoot, { withFileTypes: true });
  } catch (_) {
    return out;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.charAt(0) === '_') continue;
    const rel = path.posix.join(entry.name, entry.name + '_template.md');
    if (!fs.existsSync(path.join(templatesRoot, rel))) continue;
    out.push({ name: entry.name, templateRel: rel, meta: manifest[entry.name] || {} });
    seen[entry.name] = true;
  }

  for (const name of Object.keys(manifest)) {
    if (name.charAt(0) === '$' || seen[name]) continue;
    const meta = manifest[name];
    if (!meta || !meta.alias_of) continue;
    const rel = (meta.references || {}).template;
    if (!rel || !fs.existsSync(path.join(templatesRoot, rel))) continue;
    out.push({ name: name, templateRel: rel, meta: meta, aliasOf: meta.alias_of });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/** The manifest stores flags in three different shapes. Flatten them. */
function normalizeFlags(flags) {
  const out = [];
  if (!flags) return out;
  if (Array.isArray(flags)) {
    for (const f of flags) {
      if (!f || typeof f !== 'object') continue;
      const long = f.long || f.flag;
      if (!long) continue;
      out.push({ long: long, short: f.short || f.shortcut || '', desc: f.description || '' });
    }
  } else if (typeof flags === 'object') {
    for (const key of Object.keys(flags)) {
      const val = flags[key];
      const long = val && typeof val === 'object' ? val.flag || key : key;
      const desc = val && typeof val === 'object' ? val.role || '' : '';
      out.push({ long: long, short: '', desc: desc });
    }
  }
  return out;
}

/**
 * The shared instruction body — identical prose for every markdown-style agent,
 * so a command behaves the same whichever assistant runs it.
 * `argsToken` differs per agent ($ARGUMENTS vs {{args}}).
 */
function buildBody(cmd, templatePath, actOnPath, argsToken) {
  const flags = normalizeFlags(cmd.meta.flags);
  const longs = flags.map((f) => f.long);
  const chains = CHAIN_FLAGS.filter((f) => longs.indexOf(f) !== -1);
  const lines = [];

  lines.push('Read `' + templatePath + '`');
  lines.push('and execute the procedure described there.');
  lines.push('');
  lines.push('Arguments / target: ' + argsToken);
  lines.push('');
  lines.push('Tip: pass `--help` (or `-h`) to print usage instead of executing.');
  lines.push('');

  if (cmd.meta.recommendedModel) {
    lines.push('Recommended model (from manifest): `' + cmd.meta.recommendedModel + '`');
    lines.push('');
  }

  if (flags.length) {
    lines.push('Flags (parse from arguments):');
    for (const f of flags) {
      let line = '- `' + f.long + '`';
      if (f.short) line += ' / `' + f.short + '`';
      if (f.desc) line += ' — ' + f.desc;
      lines.push(line);
    }
    lines.push('');
  }

  if (chains.length) {
    lines.push('Chaining:');
    if (chains.indexOf('--act') !== -1) {
      lines.push(
        '- `--act` → after the primary output, run the /wbActOn engine (`' +
          actOnPath +
          '`) on the new file. Produces a sibling `action_' + cmd.name.replace(/^wb/, '').toLowerCase() +
          '_<name>_<ts>_<model>.md` under ' +
          '`<target>/.wb/workflows/reports/<date>/actions/<model>/`.'
      );
    }
    if (chains.indexOf('--wbPlan') !== -1) {
      lines.push(
        '- `--wbPlan` → after the primary output (and after `--act` if both passed), ' +
          'run the /wbActOn plan-generation phase. Produces a sibling `plan_<...>.md` under ' +
          '`<target>/.wb/workflows/reports/<date>/plans/<model>/`, one section per 🔵 finding ' +
          'with worker/validator pairs.'
      );
    }
    if (chains.length > 1) lines.push('- Both flags are independent and composable.');
    lines.push('');
  }

  if (cmd.aliasOf) {
    lines.push(
      'Note: `/' + cmd.name + '` is the closing half of `/' + cmd.aliasOf + '` and shares its ' +
        'template. Execute only the stop/finalize path (write the final §END section, ' +
        'extract derivative files).'
    );
    lines.push('');
  }

  // Constraints block — must match the deployed wrappers verbatim (row G18).
  lines.push('Constraints:');
  lines.push('- Never run git commands. For /wbGit specifically: produce commit-message text only; the user runs git themselves.');
  lines.push('- Declare the model choice (Sonnet = simple / Opus = complex) before acting.');
  lines.push('- For big or multi-step invocations, apply the task-triage table first.');
  lines.push('- Outputs go to `<target>/.wb/workflows/reports/` — never `.agents/`, never `docs/ai_reference/` (canon-only).');
  lines.push('- Close with the next executable Waves, split by Gemini / Claude / user.');
  lines.push('');

  return lines.join('\n');
}

function firstSentence(text, fallback) {
  if (!text) return fallback;
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat || fallback;
}

function emitMd(cmd, ctx) {
  // Deployed convention (all 33 wrappers): `Run /wbX — <first sentence>`.
  // The generator previously emitted the bare sentence, so repairing drift with
  // link.js rewrote a wrapper into a shape unlike its siblings (row G18).
  const sentence = firstSentence(cmd.meta.description, '');
  let desc = sentence ? 'Run /' + cmd.name + ' — ' + sentence : 'Run /' + cmd.name;
  // Deployed wrappers append this for the four commands that actually expose the
  // chaining flags. Derived from the command's own flag set, not a hardcoded list,
  // so a command gaining/losing --act stays correct without editing this file.
  const flagsJson = JSON.stringify(cmd.meta.flags || cmd.meta.args || {});
  if (/--act/.test(flagsJson) && /--wbPlan/.test(flagsJson)) {
    desc += ' Supports --act and --wbPlan (independent, composable).';
  }
  const body = buildBody(cmd, ctx.templatePath, ctx.actOnPath, '$ARGUMENTS');
  return ['---', 'description: ' + desc, '---', '', body].join('\n');
}

/** TOML multi-line basic string: escape backslashes and any literal triple quote. */
function tomlBlock(text) {
  return text.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');
}

function emitToml(cmd, ctx) {
  const desc = firstSentence(cmd.meta.description, 'Run /' + cmd.name).replace(/"/g, '\\"');
  const body = buildBody(cmd, ctx.templatePath, ctx.actOnPath, '{{args}}');
  return ['description = "' + desc + '"', 'prompt = """', tomlBlock(body) + '"""', ''].join('\n');
}

/**
 * Antigravity has no user-definable slash-commands — only Rules, Skills,
 * Plugins, Hooks and MCP servers. So all commands collapse into ONE skill,
 * activated by description match in natural language. Emitting 31 separate
 * skills would inject 31 name+description pairs into every agy context.
 */
function emitSkill(commands, ctx) {
  const names = commands.map((c) => c.name);
  const lines = [];

  lines.push('---');
  lines.push('name: wb-flow');
  lines.push('description: >-');
  lines.push('  Use this skill whenever the user asks to run any /wb* agentic workflow command —');
  lines.push('  ' + names.join(', ') + ' —');
  lines.push('  in any phrasing ("run wbAudit on X", "/wbStandup", "wb plan for the api package").');
  lines.push('  Each command is a template-driven procedure stored on disk; this skill explains');
  lines.push('  how to locate and execute it.');
  lines.push('---');
  lines.push('');
  lines.push('# wb-flow — /wb* command dispatcher');
  lines.push('');
  lines.push('The `/wb*` commands are markdown procedure templates, not executable code.');
  lines.push('To run one, read its template and follow the procedure it describes.');
  lines.push('');
  lines.push('## Step 1 — Locate the template');
  lines.push('');
  lines.push('Template root:');
  lines.push('');
  lines.push('```');
  lines.push(ctx.templatesRoot);
  lines.push('```');
  lines.push('');
  lines.push('The template for command `wbX` is `<TEMPLATE_ROOT>/wbX/wbX_template.md`.');
  lines.push('Read it in full before doing anything else.');
  lines.push('');
  lines.push('Available commands:');
  lines.push('');
  for (const cmd of commands) {
    const desc = firstSentence(cmd.meta.description, '');
    lines.push('- `' + cmd.name + '` → `' + cmd.templateRel + '`' + (desc ? ' — ' + desc : ''));
  }
  lines.push('');
  lines.push('If the current project has its own `.wb/commands/` directory, prefer');
  lines.push('`<project>/.wb/commands/wbX/wbX_template.md` — a project may pin an older');
  lines.push('template version deliberately.');
  lines.push('');
  lines.push('The command roster with roles, flags, recommended models, chains and refusal');
  lines.push('conditions lives in `<TEMPLATE_ROOT>/wb_commands_reference.claude.json`.');
  lines.push('Shared output rules are in `<TEMPLATE_ROOT>/_shared/output_conventions.md`.');
  lines.push('');
  lines.push('## Step 2 — Execute');
  lines.push('');
  lines.push('The template is the authority: follow its steps, section structure and report');
  lines.push('format exactly. Treat the target path and flags as its arguments. If the user');
  lines.push('passed `--help` or `-h`, print the template\'s HELP_GATE block and stop.');
  lines.push('');
  lines.push('`--act` routes the output through the /wbActOn engine (a ranked execution');
  lines.push('thread); `--wbPlan` runs its plan-generation phase (a task-table plan file).');
  lines.push('They are independent and composable, and only wbAudit, wbReview, wbStandup,');
  lines.push('wbPlan and wbActOn declare them. `/wbPlan --wbPlan` is a no-op.');
  lines.push('');
  lines.push('## Step 3 — Write the output');
  lines.push('');
  lines.push('```');
  lines.push('<target>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/<kind>/<name>_<YYYYMMDD>.md');
  lines.push('```');
  lines.push('');
  lines.push('Create the directories if missing. Never write reports to `.agents/` (legacy —');
  lines.push('and Antigravity\'s own customization root) or `docs/ai_reference/` (canon-only).');
  lines.push('');
  lines.push('## Standing constraints');
  lines.push('');
  lines.push('- For `/wbGit`: produce the Conventional Commits message text only; let the user run git.');
  lines.push('- Declare the model choice before acting.');
  lines.push('- For large or multi-step invocations, present a task-triage table first.');
  lines.push('- Prefer a different model for validation than the one that did the work.');
  lines.push('- Close with the next executable steps, split by which agent or person runs each.');
  lines.push('');
  lines.push('## Invocation');
  lines.push('');
  lines.push('Antigravity has no user-defined slash-commands, so `/wbStandup` returns');
  lines.push('"Unknown command". Ask in natural language — "run wbStandup on src/api" — and');
  lines.push('this skill activates.');
  lines.push('');

  return lines.join('\n');
}

/**
 * Write Layer 2 files for one agent.
 * @returns {{created:number, updated:number, skipped:number, files:string[], errors:Array}}
 */
function writeWrappers(opts) {
  const agent = AGENTS[opts.agent];
  if (!agent) throw new Error('Unknown agent: ' + opts.agent);

  const outDir = opts.outDir;
  const templatesRoot = opts.templatesRoot; // path written INTO the wrappers
  const commands = opts.commands;
  const stats = { created: 0, updated: 0, skipped: 0, files: [], errors: [] };

  const ctx = {
    templatesRoot: templatesRoot,
    actOnPath: joinRef(templatesRoot, 'wbActOn/wbActOn_template.md'),
  };

  function write(targetPath, content) {
    const exists = fs.existsSync(targetPath);
    if (exists && !opts.force) {
      stats.skipped++;
      return;
    }
    try {
      if (!opts.dryRun) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, content);
      }
      if (exists) stats.updated++;
      else stats.created++;
      stats.files.push(targetPath);
    } catch (err) {
      stats.errors.push({ file: targetPath, error: err.message });
    }
  }

  if (agent.kind === 'skill') {
    write(path.join(outDir, 'wb-flow', 'SKILL.md'), emitSkill(commands, ctx));
    return stats;
  }

  for (const cmd of commands) {
    const cmdCtx = Object.assign({}, ctx, {
      templatePath: joinRef(templatesRoot, cmd.templateRel),
    });
    const ext = agent.kind === 'toml' ? '.toml' : '.md';
    const content = agent.kind === 'toml' ? emitToml(cmd, cmdCtx) : emitMd(cmd, cmdCtx);
    write(path.join(outDir, cmd.name + ext), content);
  }

  return stats;
}

/** Join a reference path for embedding in a wrapper (always posix-style). */
function joinRef(root, rel) {
  const normalizedRoot = root.replace(/[\\/]+$/, '');
  return normalizedRoot + '/' + rel.replace(/\\/g, '/');
}

module.exports = {
  AGENTS: AGENTS,
  PKG_ROOT: PKG_ROOT,
  agentNames: agentNames,
  isInstalled: isInstalled,
  listCommands: listCommands,
  loadManifest: loadManifest,
  normalizeFlags: normalizeFlags,
  writeWrappers: writeWrappers,
  emitMd: emitMd,
  emitToml: emitToml,
  emitSkill: emitSkill,
  joinRef: joinRef,
};

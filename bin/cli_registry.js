'use strict';
//
// The single source of truth for "which CLI serves this model, and how is it
// invoked". Both bin/model.js (picker + probe) and bin/wave_router.js (wave
// dispatch) import this, so a model can never be probed through one CLI and
// dispatched through another.
//
// WHY THIS EXISTS
// ---------------
// Routing used to be re-derived from the slug string in three separate places,
// each with a guard of the form:
//
//     slug.indexOf('/') === -1 && CODEX_ONLY.test(tail)
//
// models.json spells its entries namespaced — `openai/gpt-5.6-terra`,
// `anthropic/claude-opus-5` — so every namespaced entry failed that guard and
// fell through to opencode, which cannot bill them. `wb-flow model --probe
// --all` then reported "Insufficient balance" for models that answer instantly
// under their own CLI. Measured 2026-08-14:
//
//     codex  exec -m gpt-5.6-terra "hi. how are you?"                  → answers
//     claude -p --model claude-opus-5 --permission-mode auto "hi…"     → answers
//     opencode run -m openai/gpt-5.6-terra                             → Insufficient balance
//
// The catalog already recorded { provider, pool } for every model. Nothing read
// it. Now it is authoritative and the regex heuristics are the fallback for
// slugs the catalog does not mention.
//
const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── provider → CLI ─────────────────────────────────────────────────────────
// Keyed on the `provider` field of a models.json group. A provider absent here
// falls back to opencode, which is the correct default: opencode is the only
// CLI that takes an arbitrary namespaced slug.
const PROVIDER_CLI = {
  anthropic: 'claude',
  openai: 'codex',
  antigravity: 'agy',
  google: 'gemini',
  'github-copilot': 'copilot',
  openrouter: 'opencode',
  'opencode-go': 'opencode',
  'opencode-zen': 'opencode',
};

// ─── how each CLI is invoked ────────────────────────────────────────────────
// `argv(model, prompt)` returns the full argument vector. Each shape was
// verified live on 2026-08-14; the comments record the traps.
const CLI_SPEC = {
  claude: {
    bin: 'claude',
    slashCommands: true,
    argv: function (model, prompt) {
      const a = ['-p'];
      if (model) a.push('--model', model);
      a.push('--permission-mode', 'auto');
      if (prompt != null) a.push(prompt);
      return a;
    },
  },
  codex: {
    bin: 'codex',
    slashCommands: false,
    inlineTemplate: true, // codex expands no slash-command; name the template
    stdinNull: true,      // codex reads stdin even with a prompt arg → hangs in a script
    argv: function (model, prompt) {
      const a = ['exec'];
      if (model) a.push('-m', model);
      a.push('--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check');
      if (prompt != null) a.push(prompt);
      return a;
    },
  },
  agy: {
    bin: 'agy',
    slashCommands: false,
    argv: function (model, prompt) {
      // ⚠️ `-p` MUST BE LAST before the prompt. agy parses with Go's `flag`
      // package where `-p` aliases `--print` and consumes the NEXT argv entry
      // as its value. Until 2026-08-10 this read ['-p','--dangerously-skip-
      // permissions'], so agy was asked to respond to the literal string
      // "--dangerously-skip-permissions" and the real prompt was dropped.
      const a = [];
      if (model) a.push('--model', model);
      a.push('--dangerously-skip-permissions', '-p');
      if (prompt != null) a.push(prompt);
      return a;
    },
  },
  opencode: {
    bin: 'opencode',
    slashCommands: true,
    argv: function (model, prompt) {
      const a = ['run'];
      if (model) a.push('-m', model);
      a.push('--dangerously-skip-permissions');
      if (prompt != null) a.push(prompt);
      return a;
    },
  },
  gemini: {
    bin: 'gemini',
    slashCommands: false,
    argv: function (model, prompt) {
      const a = [];
      if (model) a.push('-m', model);
      a.push('-p');
      if (prompt != null) a.push(prompt);
      return a;
    },
  },
  copilot: {
    bin: 'copilot',
    slashCommands: false,
    argv: function (model, prompt) {
      const a = ['--allow-all'];
      if (model) a.push('--model', model);
      a.push('-p');
      if (prompt != null) a.push(prompt);
      return a;
    },
  },
};

// Which CLIs take the BARE model name rather than the namespaced slug. Only
// opencode understands `provider/model`; handing it to the others is what made
// them look unreachable.
const BARE_MODEL_CLIS = new Set(['claude', 'codex', 'agy', 'gemini', 'copilot']);

// ─── catalog ────────────────────────────────────────────────────────────────

/** Build slug → { provider, pool } from a models.json `providers` array. */
function catalogIndex(groups) {
  const idx = new Map();
  if (!Array.isArray(groups)) return idx;
  for (const g of groups) {
    if (!g || !Array.isArray(g.models)) continue;
    for (const m of g.models) {
      const slug = typeof m === 'string' ? m : (m && (m.name || m.model));
      if (slug) idx.set(slug, { provider: g.provider || 'unknown', pool: g.pool || 'unknown' });
    }
  }
  return idx;
}

/** Locate and parse models.json. Returns a slug→{provider,pool} Map, or null. */
function loadCatalogIndex(explicitFile) {
  const candidates = [
    explicitFile,
    process.env.WB_MODELS_FILE,
    path.join(process.cwd(), '.wb', 'models.json'),
    path.join(os.homedir(), '.wb', 'models.json'),
    path.join(os.homedir(), '.config', 'wb-flow', 'models.json'),
  ].filter(Boolean);
  for (const f of candidates) {
    try {
      if (!fs.existsSync(f)) continue;
      const idx = catalogIndex(JSON.parse(fs.readFileSync(f, 'utf8')).providers);
      if (idx.size) return idx;
    } catch (e) { /* a malformed catalog must never break dispatch */ }
  }
  return null;
}

// ─── resolution ─────────────────────────────────────────────────────────────

const SENTINEL = [
  { re: /^claude\s*\(auto\)$|^claude\s*\(in-session\)$/i, cli: 'in-session', provider: 'anthropic', pool: 'claude-pro' },
  { re: /^codex\s*\(auto\)$/i, cli: 'codex', provider: 'openai', pool: 'chatgpt' },
  { re: /^(agy|antigravity)\s*\(auto\)$/i, cli: 'agy', provider: 'antigravity', pool: 'google-one' },
  { re: /^copilot\s*\(auto\)$|^github-copilot\/auto$/i, cli: 'copilot', provider: 'github-copilot', pool: 'github-copilot' },
];

/**
 * @returns {{cli:string, modelArg:?string, provider:?string, pool:?string, source:string}}
 *   `source` is 'catalog' | 'sentinel' | 'heuristic' — surfaced so a wrong
 *   route is attributable rather than mysterious.
 */
function resolveCli(slug, catIdx, heuristic) {
  const name = String(slug).trim();
  const tail = name.split('/').pop();
  const hit = catIdx && catIdx.get ? catIdx.get(name) : null;
  const provider = hit ? hit.provider : null;
  const pool = hit ? hit.pool : null;

  for (const s of SENTINEL) {
    if (s.re.test(name)) {
      return { cli: s.cli, modelArg: null, provider: provider || s.provider, pool: pool || s.pool, source: 'sentinel' };
    }
  }

  if (provider && PROVIDER_CLI[provider]) {
    const cli = PROVIDER_CLI[provider];
    return {
      cli: cli,
      modelArg: BARE_MODEL_CLIS.has(cli) ? tail : name,
      provider: provider,
      pool: pool,
      source: 'catalog',
    };
  }

  if (typeof heuristic === 'function') {
    const h = heuristic(name, tail);
    if (h) return Object.assign({ provider: provider, pool: pool, source: 'heuristic' }, h);
  }
  return { cli: 'opencode', modelArg: name, provider: provider, pool: pool, source: hit ? 'catalog' : 'heuristic' };
}

/** Build the argv for a resolved route. */
function argvFor(route, prompt) {
  const spec = CLI_SPEC[route.cli];
  if (!spec) return null;
  return { bin: spec.bin, argv: spec.argv(route.modelArg, prompt), spec: spec };
}

module.exports = {
  PROVIDER_CLI, CLI_SPEC, BARE_MODEL_CLIS, SENTINEL,
  catalogIndex, loadCatalogIndex, resolveCli, argvFor,
};

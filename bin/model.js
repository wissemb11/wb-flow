#!/usr/bin/env node
/**
 * bin/model.js — `wb-flow model`
 *
 * THE SINGLE WRITER of `commands/model_recommendations.md`. `wb-flow init`,
 * `wb-flow model` and the `/wbModel` slash-command all route through here.
 *
 * Why one writer: the roster is a markdown table whose cells contain the bash
 * OR operator `||`, which GFM parses as two extra column separators unless it
 * is escaped `\|\|`. Every hand-maintained copy of this file has eventually got
 * that wrong — `wb-flow-pro` still ships `opencode-go/qwen-3.7-plus`, a slug
 * that does not exist, next to a correct one in this package. Three writers
 * means three chances to drift; one writer means the escaping and the slugs are
 * produced by code that is tested.
 *
 * Detection is catalog-based and fast (no model is dispatched). Reachability is
 * a SEPARATE, opt-in step: a model can be catalogued AND credentialed AND still
 * hang — observed 2026-08-02, when every `opencode-go/*` inference probe timed
 * out at 150s while `opencode models` answered instantly.
 *
 * Zero dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
// `os` was never imported at module scope: loadCustomModels() called os.homedir()
// inside a bare `try {} catch {}`, so it threw ReferenceError on EVERY run and was
// silently swallowed. Net effect — `~/.wb/models.json` and `~/.config/wb-flow/
// models.json` were unreachable, and only a `./.wb/models.json` in the CURRENT
// directory ever loaded. That one missing line removed Step 0, dropped every
// provider the catalog contributes, and rendered `[unknown]` pools.
// (`node -e` hides this: Node exposes core modules as globals there, but not in
// normal module execution — so the bug reproduces only through the real CLI.)
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');
const { prompter, isYes, canPrompt, checkboxPick } = require('./prompt.js');

// Load .env manually to avoid dependencies
(function loadEnvFile() {
  try {
    let envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      envPath = path.join(process.env.HOME || '', '.wb-flow', '.env');
    }
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    
    let skippedCount = 0;
    const allowAll = process.env.WB_FLOW_ENV_ALL === '1';
    let extraAllow = [];
    if (process.env.WB_FLOW_ENV_ALLOW) {
      extraAllow = process.env.WB_FLOW_ENV_ALLOW.split(',').map(s => s.trim()).filter(Boolean);
    }
    const basePrefixes = ['GROQ_', 'OPENROUTER_', 'ANTHROPIC_', 'OPENAI_', 'GEMINI_', 'GOOGLE_', 'DEEPSEEK_', 'MOONSHOT_', 'ZHIPU_', 'XAI_', 'MISTRAL_', 'TOGETHER_', 'FIREWORKS_', 'CEREBRAS_', 'WB_'];
    const allowedPrefixes = basePrefixes.concat(extraAllow);
    
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        
        let allowed = allowAll;
        if (!allowed) {
          for (const prefix of allowedPrefixes) {
            if (key.startsWith(prefix)) {
              allowed = true;
              break;
            }
          }
        }
        
        if (allowed) {
          // Remove quotes and handle basic escaped newlines
          value = value.replace(/(^['"]|['"]$)/g, '').replace(/\\n/g, '\n').trim();
          if (!process.env[key]) process.env[key] = value;
        } else {
          skippedCount++;
        }
      }
    });
    
    if (skippedCount > 0) {
      console.error('wb-flow: Skipped ' + skippedCount + ' keys from .env. See README for allowlist.');
    }
  } catch (e) {
    // silently fail
  }
})();

const ROSTER_HEADING = '## User Models (Active Contractual Reference)';
const ROLE_ORDER = ['planner', 'validator', 'worker', 'mechanical'];

const ROLE_META = {
  planner: { label: '🧠 **Planner**', emoji: '🧠' },
  validator: { label: '✅ **Validator**', emoji: '✅' },
  worker: { label: '🔨 **Worker**', emoji: '🔨' },
  mechanical: { label: '📋 **Mechanical**', emoji: '📋' },
};

/**
 * Ranked patterns per role, best first. Matched against a model slug's tail.
 * Deliberately pattern-based rather than an allow-list of names: providers ship
 * new versions constantly (`kimi-k3` and `grok-4.5` appeared without warning),
 * and a hard-coded list silently degrades into the stale roster this whole
 * subcommand exists to prevent.
 */
const ROLE_PREFERENCE = {
  // Deep reasoning. Owner's ordering (2026-08-02): gemini sits high, not at the
  // back — it is a whole subscription pool, and burying it makes every chain
  // depend on one provider.
  planner: [
    /\bopus\b/i, /gemini-[\d.]+-pro/i, /gpt-5\.\d+-(terra|pro)\b/i, /\bfable\b/i,
    /\bsonnet\b/i, /\bmythos\b/i,
    /kimi-k3/i, /kimi-k2\.7/i, /glm-5\.2/i, /grok-4/i, /gpt-[\d.]+-pro/i,
  ],
  validator: [
    /\bopus\b/i, /gemini-[\d.]+-pro/i, /gpt-5\.\d+-(terra|pro)\b/i, /\bfable\b/i,
    /kimi-k2\.7/i, /kimi-k3/i,
    /glm-5\.2/i, /\bsonnet\b/i,
  ],
  // Code edits at volume: cheap-and-capable first, then a different pool.
  worker: [
    /deepseek-v4-pro/i, /gemini-[\d.]+-pro/i, /gpt-5\.\d+-(terra|luna)\b/i,
    /kimi-k2\.7-code/i, /qwen[\d.]*-max/i,
    /minimax-m3/i, /glm-5\.2/i, /codex/i, /^gpt-5\.\d+$/i, /\bsonnet\b/i, /\bopus\b/i,
  ],
  // Run a command, read output, format a report. NOTE the gemini entry is the
  // FLASH tier, not pro: buying a Pro-tier reasoner for a role defined as
  // "no judgment to buy" is paying for something you explicitly do not want.
  mechanical: [
    /qwen[\d.]*-plus/i, /gemini-[\d.]+-flash/i, /deepseek-v4-flash/i, /\bhaiku\b/i,
    /flash/i, /\bnano\b/i, /\bmini\b/i, /mimo/i, /glm-5\.1/i,
  ],
};

/**
 * Which billing/rate-limit pool an entry draws from.
 *
 * This is the axis a fallback chain must vary. Three different models on one
 * subscription is one point of failure wearing three hats — observed live on
 * 2026-08-02, when a Worker chain of three `opencode/*` models died together
 * on a single `Insufficient balance`.
 */
/**
 * Preference between pools that both satisfy the same capability slot.
 *
 * A subscription you pay for beats an incidental credential. Without this the
 * picker reaches for whichever gemini sorted first — `opencode/gemini-3.1-pro`
 * (Zen, metered) or `github-copilot/gemini-3.1-pro-preview` — instead of the
 * `agy` one covered by Google One. Same model, wrong wallet.
 */
const POOL_RANK_FALLBACK = {
  'claude-pro': 0,      // Claude Pro — the in-session root and `claude -p`
  'google-one': 1,      // agy — bare model names
  'opencode-go': 2,     // the Go subscription
  'chatgpt': 3,         // codex — a ChatGPT subscription, its own limit window
  'supergrok': 4,       // grok — SuperGrok, a fifth limit window (xAI)
  'opencode-zen': 5,    // metered, pay-as-you-go
};

/**
 * The active provider set, read from `.wb/selected.json`. This is what makes
 * pool classification DATA-DRIVEN instead of a literal.
 *
 * A hard-coded set cannot describe a subscription that starts or lapses. It is
 * why `opencode-zen` could never fill a role slot (defect #3) and why the same
 * shape recurs in `CODEX_VERIFIED` and the Step 0 provider defaults. Cached per process:
 * this is read inside ranking comparators.
 */
let _activeProvidersCache;
function activeProviders() {
  if (_activeProvidersCache !== undefined) return _activeProvidersCache;
  _activeProvidersCache = null;
  const roots = [path.join(process.cwd(), '.wb', 'selected.json')];
  try {
    const home = process.env.HOME || os.homedir();
    if (home) roots.push(path.join(home, '.wb', 'selected.json'));
  } catch (_) { /* no home is survivable */ }
  for (const f of roots) {
    try {
      if (!fs.existsSync(f)) continue;
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (Array.isArray(j.providers) && j.providers.length) { _activeProvidersCache = j.providers.slice(); break; }
    } catch (_) { /* unreadable selection falls back, never throws */ }
  }
  return _activeProvidersCache;
}
/** Test seam — the suite sets the active set without touching disk. */
function _setActiveProviders(list) { _activeProvidersCache = list === undefined ? undefined : list; }

/**
 * The POOLS the active providers resolve to.
 *
 * `selected.json.providers` holds PROVIDER names (`anthropic`, `openai`), while
 * classification keys on POOLS (`claude-pro`, `chatgpt`). Mapping between them
 * is the whole job of this function, and the first version did not do it: it
 * asked `catalogIndex()` with no argument, which returns `{}`, so every name
 * fell through to `|| name` and only providers whose name *happens* to equal
 * their pool worked.
 *
 * `opencode-zen` is exactly such a name — which is why the Zen test passed and
 * `anthropic/claude-opus-5` still classified as NOT a subscription with
 * `anthropic` in the active set. A test written with the pool name confirmed
 * itself. Found by the cross-provider validator, not by the suite.
 *
 * Reads the catalog's own `providers[]` (the same file `loadCustomModels()`
 * reads) and falls back to `poolOf('<provider>/x')` — the shared classifier —
 * before finally accepting the name itself.
 */
function poolsOfActiveProviders() {
  const active = activeProviders();
  if (!active) return null;
  let byName = {};
  try {
    const cat = loadCustomModels({}) || {};
    const groups = cat.masterProviders || (cat.raw && cat.raw.providers) || [];
    for (const p of groups) if (p && p.provider && p.pool) byName[p.provider] = p.pool;
  } catch (_) { byName = {}; }
  const pools = [];
  for (const name of active) {
    let p = byName[name];
    if (!p) {
      const guess = poolOf(String(name) + '/x');
      p = (guess && guess !== 'unknown') ? guess : name;
    }
    if (pools.indexOf(p) === -1) pools.push(p);
  }
  return pools.length ? pools : null;
}

function poolRank(entry) {
  const pool = poolOf(entry);
  // Ranked by the ORDER of the persisted active set, so a user's own priority
  // decides; unlisted pools sort last. Falls back to the literal above when no
  // selection exists, so a bare install behaves exactly as before.
  const active = poolsOfActiveProviders();
  if (active) {
    const i = active.indexOf(pool);
    return i === -1 ? 9 : i;
  }
  const r = POOL_RANK_FALLBACK[pool];
  return r === undefined ? 9 : r;
}

/**
 * Pools backed by a subscription you already pay for, as opposed to metered
 * credit or an incidental credential.
 *
 * This used to be inferred as `poolRank(x) <= 2`, which conflated two different
 * questions: "which pool do I prefer?" and "am I already paying for it?".
 * Adding `chatgpt` at rank 3 exposed the conflation — codex is a ChatGPT
 * subscription, but the rank test classed it as metered and dropped it from the
 * only two passes that can fill a slot, so no codex model could ever be
 * proposed. Preference and payment are now separate facts.
 * **No longer a literal (2026-09-02).** A hard-coded set is a claim about which
 * subscriptions exist, frozen at the moment someone typed it — so it was wrong
 * the day `opencode-zen` was bought and wrong again the month `opencode-go`
 * lapsed. `opencode-zen` was absent, so `proposeRoster()` could never propose a
 * Zen model no matter what the user held: defect #3, and the same shape as
 * `CODEX_VERIFIED` and the Step 0 provider defaults. The set is now DERIVED from the
 * user's own persisted provider selection, with the literal kept only as the
 * bare-install fallback. Preference and payment remain separate facts.
 */
const SUBSCRIPTION_POOLS_FALLBACK = new Set(['claude-pro', 'google-one', 'opencode-go', 'chatgpt', 'supergrok']);
function isSubscription(entry) {
  const pool = poolOf(entry);
  const active = poolsOfActiveProviders();
  if (active) return active.indexOf(pool) !== -1;
  return SUBSCRIPTION_POOLS_FALLBACK.has(pool);
}

let _catalogPoolCacheKey = null;
let _catalogPoolCache = null;
function catalogPoolFor(name, prefix) {
  let cat = null;
  try { cat = loadCustomModels({}) || null; } catch (_) { cat = null; }
  if (!cat || !cat.filepath) return null;

  let key = cat.filepath;
  try {
    const st = fs.statSync(cat.filepath);
    key += ':' + st.mtimeMs + ':' + st.size;
  } catch (_) { /* an unreadable catalog simply misses the cache */ }

  if (_catalogPoolCacheKey !== key) {
    const byProvider = Object.create(null);
    const byModel = new Map();
    const groups = cat.masterProviders || (cat.raw && cat.raw.providers) || [];
    if (Array.isArray(groups)) {
      for (const g of groups) {
        if (!g || !g.provider || !g.pool) continue;
        byProvider[g.provider] = g.pool;
        for (const m of g.models || []) {
          const slug = typeof m === 'string' ? m : (m && (m.name || m.model));
          if (slug) byModel.set(slug, g.pool);
        }
      }
    }
    _catalogPoolCache = { byProvider: byProvider, byModel: byModel };
    _catalogPoolCacheKey = key;
  }

  if (!_catalogPoolCache) return null;
  return _catalogPoolCache.byModel.get(name) || _catalogPoolCache.byProvider[prefix] || null;
}

function poolOf(entry) {
  const name = String(entry || '');
  if (name === 'Claude (auto)' || /^anthropic\s*\(auto\)$/i.test(name)) return 'claude-pro';
  if (/^codex\s*\(auto\)$/i.test(name) || name === 'Codex (auto)' || /^openai\s*\(auto\)$/i.test(name)) return 'chatgpt';
  if (/^(agy|antigravity)\s*\(auto\)$/i.test(name) || name === 'Antigravity (auto)') return 'google-one';
  if (/^(grok|xai|supergrok)\s*\(auto\)$/i.test(name) || name === 'Grok (auto)') return 'supergrok';
  if (/^opencode-go\s*\(auto\)$/i.test(name)) return 'opencode-go';
  if (/^opencode-zen\s*\(auto\)$/i.test(name)) return 'opencode-zen';
  if (/^github-copilot\s*\(auto\)$/i.test(name)) return 'github-copilot';
  if (isInSession(name)) return 'claude-pro';
  if (name.indexOf('/') === -1) {
    // Order matters: agy carries `gpt-oss-*-high`, which is NOT codex. AGY_ONLY
    // demands an effort suffix, so it is the stricter test and runs first.
    if (AGY_ONLY.test(name)) return 'google-one';
    return CODEX_ONLY.test(name) ? 'chatgpt' : 'unknown';
  }
  const prefix = name.split('/')[0];
  const catalogPool = catalogPoolFor(name, prefix);
  if (catalogPool) return catalogPool;
  if (prefix === 'opencode-go') return 'opencode-go';
  if (prefix === 'opencode') return 'opencode-zen';
  if (prefix === 'anthropic') return 'claude-pro';
  if (prefix === 'xai') return 'supergrok';
  // The `openai/` slugs are served by the ChatGPT/Codex subscription: the
  // catalog's own `openai` provider carries `pool: "chatgpt"`. Without this
  // line the prefix falls through to `return prefix`, minting a phantom pool
  // `openai` that no catalog entry uses — which lets crossProviderPick() score
  // `Codex (auto)` as an independent validator for an `openai/*` executor
  // (one subscription, graded as two), and makes a --sync-catalog write
  // `pool: "openai"` over the catalog's correct `chatgpt`.
  if (prefix === 'openai') return 'chatgpt';
  return 'unknown';
}

/**
 * Never offer these for any role: they are not general chat/coding models, so a
 * capability pattern matching their name (`gemini-3-pro-image` matches
 * `gemini-*-pro`) puts an image generator in a Planner chain.
 */
/**
 * Owner's explicit ordering WITHIN the agy pool (2026-08-02). Capability
 * patterns decide which slot a model is eligible for; this decides which agy
 * model fills it when several qualify.
 */
const AGY_PREFERENCE = [
  'claude-opus-4-6-thinking',
  'gemini-3.6-flash-high',
  'gemini-3.5-flash-high',
  'gemini-3.1-pro-high',
  'gemini-3.1-pro-low',
  'claude-sonnet-4-6',
];
function agyRank(entry) {
  const i = AGY_PREFERENCE.indexOf(String(entry));
  return i === -1 ? AGY_PREFERENCE.length : i;   // unlisted agy models sort last
}

const NOT_A_CHAT_MODEL = /(^|[-_/])(image|vision|embed|embedding|tts|whisper|audio|rerank|moderation|guard)([-_]|$)/i;

/** Models only the `agy` CLI can run — `wave` spawns with `opencode run`. */
const AGY_ONLY = /^(gemini|claude|gpt-oss)[\w.-]*(-high|-medium|-low|-thinking)$/;

/**
 * Models only the `codex` CLI can run (OpenAI Codex, `codex exec`).
 *
 * Bare names, like agy's — so `poolOf`/`laneOf` must test AGY_ONLY first:
 * `gpt-oss-120b-high` is an agy model despite starting with `gpt`, and only the
 * effort suffix tells them apart.
 */
const CODEX_ONLY = /^gpt-5(\.\d+)?(-(terra|luna|sol|pro|mini|nano|codex|codex-mini))?$/;

/**
 * **`codex` has no `models` subcommand.** opencode and agy can both enumerate
 * themselves; codex cannot, so there is nothing to parse and detection has to
 * work from a curated list instead.
 *
 * These are the slugs the 0.146.0 binary knows about, newest first. Being on
 * this list means "worth trying", NOT "you can run it" — entitlement is per
 * account. On the owner's ChatGPT plan (2026-08-03) exactly four answered:
 * gpt-5.6-terra, gpt-5.6-luna, gpt-5.5, gpt-5.4-mini — while gpt-5.6,
 * gpt-5.6-sol, gpt-5.6-pro, gpt-5.4 and gpt-5.3-codex were all refused with
 * "not supported when using Codex with a ChatGPT account".
 *
 * That gap is exactly the catalogued ≠ credentialed ≠ reachable distinction
 * that `--probe` exists to close: run `wb-flow model --detect --probe` to find
 * out which of these YOUR plan actually serves.
 */
const CODEX_CANDIDATES = [
  'gpt-5.6-terra',   // default on a ChatGPT plan; the flagship
  'gpt-5.6-luna',
  'gpt-5.6-pro',
  'gpt-5.6-sol',
  'gpt-5.6',
  'gpt-5.5',
  'gpt-5.4',
  'gpt-5.4-mini',
  'gpt-5.4-nano',
  'gpt-5.3-codex',
  'gpt-5.2-codex',
  'gpt-5.1-codex-mini',
];

/**
 * A first-run seed only; superseded by `--sync-catalog --probe`.
 *
 * Codex cannot enumerate itself — `codex models` exists but is interactive-only
 * (piped: "stdin is not a terminal"; through a pty it renders nothing and exits
 * 0), so entitlement is knowable only by probing or by reading the picker.
 * A frozen constant therefore describes whichever plan someone had on the day
 * they typed it: this list was captured 2026-08-03 and, measured 2026-09-02
 * against Codex Plus, was **missing `gpt-5.6-sol` — Codex's own default — and
 * `gpt-5.4`**. That is the failure mode of every hard-coded list in this file.
 *
 * `detect()` prefers the PERSISTED set (`verified` + `checkedAt` in models.json)
 * and falls back here only when the catalog carries no `checkedAt`.
 */
const CODEX_VERIFIED = ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini'];

/**
 * The persisted Codex entitlements, if `--sync-catalog --probe` has ever run.
 * Returns null when the catalog has no `checkedAt`, which is what makes
 * CODEX_VERIFIED a seed rather than an authority.
 */
function persistedCodexVerified() {
  try {
    const cat = loadCustomModels({}) || {};
    for (const p of cat.providers || []) {
      if (p.provider !== 'openai') continue;
      const models = (p.models || []).filter(function (m) { return m && typeof m === 'object' && m.checkedAt; });
      if (!models.length) return null;
      return models.filter(function (m) { return m.verified; })
                   .map(function (m) { return String(m.slug).replace(/^openai\//, ''); });
    }
  } catch (_) { /* unreadable catalog falls back to the seed */ }
  return null;
}

const HELP = `
  wb-flow model — inspect and rewrite the /wb* model roster

  Usage: wb-flow model [options]

  The roster lives in commands/model_recommendations.md and decides which model
  each of the four roles dispatches to. This subcommand is the only thing that
  should write that file — \`/wbModel\` and \`wb-flow init\` both route here.

  Options:
    --detect             Re-read the installed CLIs' catalogs and propose a
                         roster from what is actually credentialed.
    --sync-catalog       Fill models.json from what THIS machine can reach.
      (alias --sync)     Enumerates every installed CLI, curates the result, and
                         three-way-merges it: new models are added, missing ones
                         are MARKED retired (not deleted — an empty enumeration
                         is usually a CLI failure), and "pinned": true is immune.
                         Writes atomically, keeping the previous file as .bak.
                         Respects --dry-run / --json (both write nothing).
    --probe              With --sync-catalog: confirm entitlements for providers
                         that cannot enumerate themselves (codex), stamping
                         "verified" + "checkedAt" per model. REAL CALLS — never
                         runs under a plain --sync-catalog.
    --add=<a,b,c>        Fill ONE OR MORE providers from what this machine can
                         reach — a scoped --sync-catalog. Accepts the provider
                         name or its alias (codex=openai, zen=opencode-zen,
                         agy=antigravity, go=opencode-go, grok=xai).
                         Per-provider transactional: writes what succeeded,
                         reports what did not with its remedy, and exits 0 unless
                         EVERY provider failed. --strict fails on any.
    --remove=<a,b,c>     Drop providers from the catalog. Refuses one the live
                         roster still names unless --force.
    --from-picker        With --add: read a provider's model list from the CLI's
                         own interactive picker, pasted on stdin (or --from-file).
                         The only non-probing way to fill codex, which cannot
                         enumerate itself. Marks each model verified + checkedAt.
    --from-file=<path>   Read the picker text from a file instead of stdin.
    --strict             With --add: fail if any named provider could not be filled.
    --prune              With --sync-catalog: DELETE retired models instead of
                         marking them. Refuses any slug the live roster still
                         dispatches to unless --force is also given.
    --force              Allow --prune to remove a roster-referenced slug.
    --reset              Alias for --detect. The shipped roster is neutral by
                         design, so there is no packaged baseline to restore to
                         — a reset re-derives from what THIS machine can reach.
    --pick, -i           Interactive picker: shows what THIS machine detected,
                         annotated with billing pool and probe result, and asks
                         you to rank up to 3 per role. Enter keeps the suggested
                         pick. Requires a TTY.
    --set <role>=<slug>  Pin one role, e.g. --set worker=deepseek/deepseek-v4-pro
                         (repeatable). Roles: planner validator worker mechanical
    --probe              Dispatch one trivial prompt per selected model and mark
                         anything that does not answer. Costs real calls — off by
                         default. Catalogued + credentialed does NOT imply
                         reachable; this is the only check that proves it.
    --all                Pre-probe all catalog models, order by Role, and display
                         only reachable models.
    --all=raw            Pre-probe and stream all catalog models without filtering.
    --all=<provider>     Filter pre-probe to a specific provider.
    --all=<role>         Filter pre-probe to a specific role.
    --timeout=<ms>       Per-model probe timeout (default 45000)
    --file=<path>        Roster file to read/write (default: resolved from cwd)
    --json               Machine-readable output; implies no write
    --yes, -y            Write without confirming
    --dry-run, -n        Show the roster that would be written, write nothing
    --help, -h           Show this message

  With no options it prints the current roster and exits.
`;

// ─── detection ──────────────────────────────────────────────────────────────

const DEFAULT_ENUM_TIMEOUT_MS = Math.max(1000, parseInt(process.env.WB_FLOW_ENUM_TIMEOUT_MS || '3000', 10) || 3000);

function hasCLI(bin) {
  // `which`, not `command -v` under a shell: shell:true concatenates rather than
  // escapes its args (Node DEP0190) and buys nothing here.
  const r = spawnSync('which', [bin], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return r.status === 0 && Boolean((r.stdout || '').trim());
}

function tryExec(bin, args, timeout) {
  try {
    return execFileSync(bin, args, {
      encoding: 'utf8',
      timeout: timeout || DEFAULT_ENUM_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (_) {
    return '';
  }
}

function stripAnsi(s) {
  return String(s || '').replace(/\x1b\[[0-9;]*m/g, '');
}

/** "OpenCode Go" → "opencodego"; used to match a credential to a slug prefix. */
function normalizeProvider(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Which provider prefixes hold a credential.
 *
 * The match is deliberately loose in both directions ("opencodezen" ⊃
 * "opencode"): a false positive costs one unreachable suggestion the user can
 * see and change, while a false negative silently hides a provider they are
 * paying for.
 */
function credentialedPrefixes(providersOutput, allSlugs) {
  const names = stripAnsi(providersOutput)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[●•]\s/.test(l))
    .map((l) => l.replace(/^[●•]\s*/, '').replace(/\s+(api|oauth|[A-Z_]{4,})\s*$/, '').trim())
    .filter(Boolean);

  const prefixes = Array.from(new Set(allSlugs.map((s) => s.split('/')[0])));
  const out = new Set();
  for (const prefix of prefixes) {
    const np = normalizeProvider(prefix);
    for (const name of names) {
      const nn = normalizeProvider(name);
      if (nn === np || nn.indexOf(np) === 0 || np.indexOf(nn) === 0) { out.add(prefix); break; }
    }
  }
  return { prefixes: out, names: names };
}

function detect(opts) {
  const o = opts || {};
  const found = { opencode: null, agy: null, codex: null, claude: null, grok: null, slugs: [], providers: [] };
  const injected = typeof o.hasCLI === 'function' || typeof o.tryExec === 'function';
  if (!injected && o.noEnum !== false && (o.noEnum === true || process.env.WB_FLOW_NO_ENUM === '1')) {
    found.noEnum = true;
    return found;
  }
  const canRun = typeof o.hasCLI === 'function' ? o.hasCLI : hasCLI;
  const execEnum = typeof o.tryExec === 'function' ? o.tryExec : tryExec;

  if (o.hasOpencode !== false && canRun('opencode')) {
    const models = execEnum('opencode', ['models'], o.timeout).split('\n').map((l) => l.trim()).filter(Boolean);
    const providers = execEnum('opencode', ['providers', 'list'], o.timeout);
    const cred = credentialedPrefixes(providers, models);
    found.providers = cred.names;
    const usable = models.filter((m) => cred.prefixes.has(m.split('/')[0]));
    found.opencode = { total: models.length, credentialed: usable.length };
    // Fall back to the whole catalog if the credential parse found nothing —
    // better to over-offer than to report "no models" on a working install.
    found.slugs = usable.length ? usable : models;
  }

  if (o.hasAgy !== false && canRun('agy')) {
    // `agy models` prints "<slug>\t<Display Name>". Keep ONLY the slug.
    //
    // Storing the whole line put the display name into every consumer:
    // proposeRoster() wrote roster entries like
    //   `claude-opus-4-6-thinking\tClaude Opus 4.6 (Thinking)`
    // and a dispatch built from that names a model that does not exist. It was
    // invisible on a machine whose top picks were not agy models — surfaced by a
    // sandboxed clean install during task 17, not by any test.
    // `enumerateLive()` had already worked around this locally; the workaround
    // stays as defence, but the fix belongs here, at the source.
    const list = execEnum('agy', ['models'], o.timeout)
      .split('\n')
      .map((l) => String(l).split('\t')[0].trim())
      .filter(Boolean);
    found.agy = { models: list };
  }

  // codex cannot list its own models (no `codex models` subcommand), so this is
  // the curated candidate set rather than a query. `enumerable: false` tells the
  // caller these are unconfirmed — only --probe can promote them.
  if (o.hasCodex !== false && canRun('codex')) {
    // Persisted entitlements outrank the seed — that is the whole point of
    // writing checkedAt. `fromSeed` lets the caller say which it is showing.
    const persisted = persistedCodexVerified();
    found.codex = {
      models: CODEX_CANDIDATES.slice(),
      verified: persisted || CODEX_VERIFIED.slice(),
      fromSeed: !persisted,
      enumerable: false,
    };
  }

  // grok CAN list its own models (unlike codex), but decorates them: the default
  // reads `* <slug> (default)` and the rest `- <slug>`, alongside an auth banner
  // and a "Default model:" line. Keep only bullet lines, strip the decoration,
  // and prefix with `xai/` so poolOf() bills them to `supergrok` — a bare
  // `grok-4.6` has no prefix and would fall through to an `[unknown]` pool.
  if (o.hasGrok !== false && canRun('grok')) {
    const list = execEnum('grok', ['models'], o.timeout)
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^[*-]\s+\S/.test(l))
      .map((l) => l.replace(/^[*-]\s+/, '').replace(/\s*\(default\)\s*$/i, '').trim())
      .filter(Boolean)
      .map((s) => (s.indexOf('/') === -1 ? 'xai/' + s : s));
    found.grok = { models: list };
  }

  found.claude = o.hasClaude !== false && canRun('claude');
  return found;
}

// ─── role → model mapping ───────────────────────────────────────────────────

/**
 * Family key so a roster doesn't list three spellings of the same model.
 * Version segments are stripped too: `claude-sonnet-4`, `claude-sonnet-4-5` and
 * `claude-sonnet-4-6` are ONE family. Without this the roster fills all three
 * slots with adjacent versions of a single model and the fallback chain has no
 * actual fallback.
 */
function familyOf(slug) {
  let tail = String(slug).split('/').pop();
  // Strip REPEATEDLY: a single pass left `gemini-3.1-pro-high` → "gemini31pro"
  // while `gemini-3.1-pro` → "gemini", so the same model counted as two
  // families and a chain could carry it twice.
  let prev = null;
  while (prev !== tail) {
    prev = tail;
    tail = tail.replace(/[-_]\d{8}$/, '');                       // dated snapshot
    tail = tail.replace(/[-_](fast|thinking|free|latest)$/i, ''); // speed/variant
    // terra/luna/sol are OpenAI's gpt-5.6 variant names. Stripping them folds
    // the whole codex family to one key, so a chain cannot be gpt-5.6-terra →
    // gpt-5.6-luna → gpt-5.5: three names, one subscription, no real fallback.
    // `lite` and `spark` join the list for the same reason terra/luna/sol did:
    // they are variant names, not families. Measured 2026-09-03, their absence
    // let `opencode/gemini-3.5-flash-lite` (family "gemini35flashlite") and
    // `opencode/gpt-5.3-codex-spark` ("gpt53codexspark") escape the flat-rate
    // dedupe — metered copies of gemini and gpt surviving in a curated list
    // while the plain variants of both were correctly dropped.
    tail = tail.replace(/[-_](high|medium|low|max|plus|pro|flash|mini|nano|lite|spark|code|codex|preview|customtools|terra|luna|sol)$/i, '');
    tail = tail.replace(/([-_.]\d+(\.\d+)*)+$/g, '');
  }
  return tail.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

/** Sort key: newest version first, so a family contributes its latest member. */
function versionRank(slug) {
  const nums = (String(slug).split('/').pop().match(/\d+(\.\d+)*/g) || [])
    .map(function (n) { return parseFloat(n) || 0; });
  return nums.length ? Math.max.apply(null, nums) : 0;
}

function pickForRole(role, slugs, opts) {
  const o = opts || {};
  const patterns = ROLE_PREFERENCE[role] || [];
  const limit = o.limit || 3;
  const picked = [];
  const seenFamily = new Set();
  const usedPools = new Set(o.seedPools || []);

  // Two passes over the SAME capability ranking.
  //
  //   Pass 1 — prefer a model whose pool is not yet represented in this chain.
  //   Pass 2 — fill any remaining slots with the best still-unused model.
  //
  // Capability order never changes; the pool rule only breaks ties between
  // candidates the ranking already accepts. So a chain stays as strong as the
  // ranking allows, but stops being three names for one point of failure —
  // which is what a fallback chain is *for*. A rate-limit window or a billing
  // lapse takes out one pool, not the ladder.
  // Three passes, loosening one constraint at a time:
  //   1. new pool AND new family  — maximum diversity
  //   2. new pool, family may repeat — the SAME model on a different
  //      subscription is the ideal rate-limit fallback: identical capability,
  //      independent limits (e.g. Opus via Claude Pro, then Opus via agy)
  //   3. anything still unused    — fill the slot rather than leave it short
  for (const pass of [1, 2, 3]) {
    const requireNewPool = pass <= 2;
    const requireNewFamily = pass === 1;
    // Passes 1-2 consider only pools you actually subscribe to (SUBSCRIPTION_POOLS).
    // A metered or incidental credential should never take a fallback slot
    // ahead of a subscription just because it happens to serve a
    // higher-ranked model — that trades a bill you don't want for a
    // capability difference you won't notice in a fallback.
    const subscriptionsOnly = pass <= 2;
    for (const re of patterns) {
      if (picked.length >= limit) break;
      // Subscription first, then newest version — so a capability slot is filled
      // from a pool you pay for before an incidental credential. Without this the
      // picker reached for `opencode/gemini-3.1-pro` (Zen, metered) over the
      // `agy` one covered by Google One: same model, wrong wallet.
      const ordered = slugs.slice().sort(function (a, b) {
        const pr = poolRank(a) - poolRank(b);
        if (pr !== 0) return pr;
        // Within the agy pool, the owner's explicit ordering wins over version.
        const ar = agyRank(a) - agyRank(b);
        if (ar !== 0) return ar;
        return versionRank(b) - versionRank(a);
      });
      for (const slug of ordered) {
        if (picked.length >= limit) break;
        if (slug.indexOf('~') !== -1 || slug.split('/').length > 2) continue;
        if (NOT_A_CHAT_MODEL.test(slug)) continue;
        const tail = slug.split('/').pop();
        if (!re.test(tail)) continue;
        if (o.excludeAgy && AGY_ONLY.test(tail)) continue;
        if (o.exclude && o.exclude.test(tail)) continue;
        const fam = familyOf(slug);
        const pool = poolOf(slug);
        if (requireNewFamily && seenFamily.has(fam)) continue;
        // Never the same model from the same pool twice — that is a duplicate,
        // not a fallback.
        if (seenFamily.has(fam + '@' + pool)) continue;
        if (subscriptionsOnly && !isSubscription(slug)) continue;
        if (requireNewPool && usedPools.has(pool)) continue;
        seenFamily.add(fam);
        seenFamily.add(fam + '@' + pool);
        usedPools.add(pool);
        picked.push(slug);
      }
    }
    if (picked.length >= limit) break;
  }
  return picked;
}

/**
 * Propose a full roster. 🧠 Planner and ✅ Validator lead with the in-session
 * sentinel when a `claude` CLI is present: the orchestrator is the root agent,
 * and a role that names the root must never be delegated (see
 * model_recommendations.md §Who may be the orchestrator).
 */
function proposeRoster(found, opts) {
  const o = opts || {};
  // agy names come from `agy models`, not from the opencode catalog — merge them
  // into the candidate pool or --detect can never propose one, which is how the
  // only reachable executor stayed invisible on 2026-08-02.
  // codex likewise contributes bare names, and from a curated list rather than a
  // query — see CODEX_CANDIDATES. Only the account-verified subset is offered
  // for a roster: proposing a slug the plan refuses would bake a guaranteed
  // INFRA into the chain, and the whole point of the chatgpt pool is that it
  // survives a Claude or Google limit window.
  const slugs = ((found && found.slugs) || [])
    .concat((found && found.agy && found.agy.models) || [])
    .concat((found && found.codex && (found.codex.verified || found.codex.models)) || []);
  const roster = {};
  const inSession = found && found.claude ? 'Claude (auto)' : null;

  for (const role of ROLE_ORDER) {
    const leadsInSession = (role === 'planner' || role === 'validator') && inSession;
    // A fallback chain whose fallbacks are the SAME family as the primary is not
    // a fallback chain. When the root is Claude, the next links must be
    // reachable when Claude is not — so exclude that family from the picker
    // itself, not after the limit, or the escapes are whatever happens to
    // survive the first three Claude picks.
    const picks = pickForRole(role, slugs, {
      // The in-session lead already spends the claude-pro pool, so the
      // fallbacks behind it must come from elsewhere.
      seedPools: leadsInSession ? ['claude-pro'] : [],
      // agy models are dispatchable since the `agy` lane landed (bin/wave.js
      // cliFor). Excluding them used to be correct; now it hides the only
      // executor some installs can actually reach.
      excludeAgy: o.excludeAgy === true,
      // Exclude the ROOT'S OWN POOL, not its model family. Excluding the family
      // outright would drop `claude-opus-4-6-thinking` (Google One) from a
      // Claude-rooted chain — but that is Opus-class reasoning on a *different*
      // subscription, i.e. exactly the fallback you want when Claude Pro
      // throttles. What must not repeat is the pool, and `seedPools` handles it.
      exclude: null,
      limit: leadsInSession ? 2 : 3,
    });
    if (leadsInSession) {
      roster[role] = [inSession].concat(picks).slice(0, 3);
    } else if (picks.length) {
      // Owner's ordering: 🔨 Worker and 📋 Mechanical end with the orchestrator
      // itself. It is a third pool — never metered, never provider-rate-limited —
      // so the chain degrades to "do it here" instead of failing outright.
      const chain = picks.slice(0, inSession ? 2 : 3);
      if (inSession) chain.push(inSession);
      roster[role] = chain;
    } else {
      roster[role] = inSession ? [inSession] : [];
    }
  }
  return roster;
}

// ─── rendering ──────────────────────────────────────────────────────────────

/** Escape a cell for GFM. The bash `||` MUST become `\|\|` — see file header. */
function cell(text) {
  return String(text).replace(/\|/g, '\\|');
}

function isInSession(name) {
  const s = String(name || '').trim();
  // Only Claude (auto) is supplied by the current orchestrator session. A
  // generic `<provider> (auto)` label is a picker alias, not proof that the
  // provider is available and must never silently become in-session.
  return /^Claude\s*\((auto|in-session)\)$/i.test(s);
}

/** Provider aliases that have a real runtime dispatch lane. */
function autoAliasForProvider(provider) {
  const name = String(provider || '').trim().toLowerCase();
  if (name === 'anthropic') return 'Claude (auto)';
  if (name === 'openai') return 'Codex (auto)';
  if (name === 'antigravity' || name === 'agy') return 'Antigravity (auto)';
  if (name === 'xai' || name === 'grok') return 'Grok (auto)';
  return null;
}

function dispatchFor(entry, promptExample, catIdx) {
  // Catalog-authoritative first: a namespaced slug whose provider names a
  // native CLI must dispatch through that CLI with the BARE model name. The
  // heuristics below only see the string, so `openai/gpt-5.6-terra` used to
  // emit an `opencode run` line for a model opencode cannot bill.
  if (catIdx) {
    const R = resolveCli(entry, catIdx);
    if (R.source === 'catalog' && R.modelArg) {
      if (R.cli === 'codex') {
        return '.wb/bin/wbRun codex exec -m ' + R.modelArg
          + ' --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check'
          + ' "Read <template> and execute it. Arguments: ' + promptExample + '" < /dev/null';
      }
      if (R.cli === 'agy') {
        return '.wb/bin/wbRun agy -p --model ' + R.modelArg + ' --dangerously-skip-permissions "' + promptExample + '"';
      }
      if (R.cli === 'grok') {
        // grok DOES expand `/wb*` (Claude Code commands are loaded as skills),
        // so the prompt keeps its slash form — no --command flag, no inlined
        // template path. `-p` takes the prompt as its value, so it goes last.
        return '.wb/bin/wbRun grok --model ' + R.modelArg
          + ' --permission-mode bypassPermissions -p "' + promptExample + '"';
      }
      // Every OTHER catalogued CLI, straight from its spec. Without this, only
      // the three hand-written branches above were catalog-aware and everything
      // else fell to the `opencode run -m <slug>` line at the bottom — so a
      // detected roster published `opencode run -m anthropic/claude-opus-5`,
      // billing a model to a CLI that cannot serve it. That is the precise bug
      // cli_registry.js was introduced to end; the roster writer had never been
      // connected to it. (Found 2026-08-17 while adding the xai provider.)
      const spec = REG.CLI_SPEC[R.cli];
      if (spec && R.cli !== 'opencode') {
        return '.wb/bin/wbRun ' + spec.bin + ' ' + spec.argv(R.modelArg, null).join(' ')
          + ' "' + promptExample + '"' + (spec.stdinNull ? ' < /dev/null' : '');
      }
    }
  }
  if (isInSession(entry)) {
    // A shell comment, not markdown: this string lands inside a ```bash block.
    return '# in-session — the orchestrator runs this itself, nothing is spawned';
  }
  const name = String(entry);
  if (/^codex\s*\(auto\)$/i.test(name) || name === 'Codex (auto)') {
    return '.wb/bin/wbRun codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "Read <template> and execute it. Arguments: ' + promptExample + '" < /dev/null';
  }
  if (/^(agy|antigravity)\s*\(auto\)$/i.test(name) || name === 'Antigravity (auto)') {
    return '.wb/bin/wbRun agy -p --dangerously-skip-permissions "' + promptExample + '"';
  }
  if (/^(grok|xai|supergrok)\s*\(auto\)$/i.test(name) || name === 'Grok (auto)') {
    return '.wb/bin/wbRun grok --permission-mode bypassPermissions -p "' + promptExample + '"';
  }
  const tail = name.split('/').pop();
  if (AGY_ONLY.test(tail)) {
    return '.wb/bin/wbRun agy -p --model ' + tail + ' --dangerously-skip-permissions "' + promptExample + '"';
  }
  if (String(entry).indexOf('/') === -1 && CODEX_ONLY.test(tail)) {
    // Three ways codex differs from every other lane here:
    //   `exec`  — headless is a subcommand, and `-p` means --profile, not print
    //   the prompt names the TEMPLATE — codex expands no slash-command
    //   `< /dev/null` — codex reads stdin even with a prompt argument, and a
    //                   wave script's stdin is the script itself, so it hangs
    return '.wb/bin/wbRun codex exec -m ' + tail
      + ' --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check'
      + ' "Read <template> and execute it. Arguments: ' + promptExample + '" < /dev/null';
  }
  return '.wb/bin/wbRun opencode run -m ' + entry + ' --dangerously-skip-permissions "' + promptExample + '"';
}

const ROLE_PROMPT = {
  planner: '<prompt>',
  validator: '/wbValid <plan.md> --id=1',
  worker: '/wbWork <plan.md> --id=1',
  mechanical: '/wbTest <target>',
};

function renderRosterTable(roster, meta) {
  const m = meta || {};
  // Both the Lane column and the dispatch chains below used to be computed
  // catalog-BLIND (`entries.map(laneOf)` / `dispatchFor(e, prompt)` with no
  // index), so the published roster disagreed with the router that actually
  // runs it. Load the catalog once here and hand it to both.
  const catIdx = REG.loadCatalogIndex();
  const lines = [];
  lines.push('| Role | Active Selected Models (1st / 2nd / 3rd) | Lane |');
  lines.push('|---|---|---|');

  for (const role of ROLE_ORDER) {
    const entries = (roster[role] || []).filter(Boolean);
    const names = entries.length
      ? entries.map((e) => '**' + e + '**').join(' / ')
      : '_not configured_';
    const lane = entries.length
      ? Array.from(new Set(entries.map((e) => laneOf(e, catIdx)))).join(' → ')
      : '_run `wb-flow model --detect`_';
    const unreachable = (m.unreachable || []).filter((u) => entries.indexOf(u) !== -1);
    const warn = unreachable.length ? ' ⚠️ unreachable: ' + unreachable.join(', ') : '';
    lines.push('| ' + ROLE_META[role].label + ' | ' + names + warn + ' | ' + lane + ' |');
  }

  // The dispatch chains, outside the table. A bash `||` inside a GFM table cell
  // must be written `\|\|` or the row gains two phantom columns — so it does not
  // go in a table at all.
  lines.push('');
  lines.push('**Dispatch chains** — each role tries its models left to right:');
  lines.push('');
  lines.push('```bash');
  for (const role of ROLE_ORDER) {
    const entries = (roster[role] || []).filter(Boolean);
    lines.push('# ' + ROLE_META[role].label.replace(/\*\*/g, ''));
    if (!entries.length) {
      lines.push('# not configured — run: wb-flow model --detect');
    } else {
      // An in-session lead is a COMMENT, so it must not share a line with the
      // rest of the chain — `#` would comment the whole `||` chain out.
      const inSess = entries.filter(isInSession);
      const spawned = entries.filter((e) => !isInSession(e));
      if (inSess.length) lines.push('# 1st: in-session — the orchestrator runs this itself, nothing spawned');
      if (spawned.length) {
        lines.push(spawned.map((e) => dispatchFor(e, ROLE_PROMPT[role], catIdx)).join(' || '));
      } else {
        lines.push('# (no delegated fallback configured)');
      }
    }
    lines.push('');
  }
  lines.push('```');
  return lines.join('\n');
}

// ─── catalog-authoritative CLI resolution ───────────────────────────────────
//
// models.json groups every slug under a { provider, pool, models[] } entry, so
// the catalog already knows which subscription serves a model. Nothing used to
// read it: routing was re-derived from the slug string alone, and the guard
//
//     slug.indexOf('/') === -1 && CODEX_ONLY.test(tail)
//
// fails for the catalog's own namespaced spelling. `openai/gpt-5.6-terra` fell
// through to `opencode run -m openai/gpt-5.6-terra` and reported "Insufficient
// balance" for a model that answers instantly under `codex exec -m
// gpt-5.6-terra`. The bug hit the probe AND the real dispatch, so a model could
// be excluded from the roster for a balance problem it never had.
//
// The catalog is now the source of truth; the regexes below remain the fallback
// for any slug the catalog does not mention.

const REG = require('./cli_registry.js');
const PROVIDER_CLI = REG.PROVIDER_CLI;

/** Build slug → { provider, pool } from a loadCustomModels() result. */
function catalogIndex(customObj) {
  const groups = customObj && (customObj.masterProviders || (customObj.raw && customObj.raw.providers));
  return REG.catalogIndex(groups);
}

/**
 * Resolve how a slug should actually be invoked. Delegates to the shared
 * registry so the picker and the wave dispatcher can never disagree; the
 * legacy regexes are passed in as the fallback for uncatalogued slugs.
 */
function resolveCli(slug, catIdx) {
  return REG.resolveCli(slug, catIdx, function (name, tail) {
    if (name.indexOf('/') === -1 && AGY_ONLY.test(name)) return { cli: 'agy', modelArg: tail };
    if (name.indexOf('/') === -1 && CODEX_ONLY.test(tail)) return { cli: 'codex', modelArg: tail };
    return null;
  });
}

/** Which CLI runs this entry — shown in the table's Lane column. */
function laneOf(entry, catIdx) {
  if (catIdx) {
    const R = resolveCli(entry, catIdx);
    if (R.source === 'catalog' || R.source === 'sentinel') return R.cli;
  }
  if (entry === 'Claude (auto)' || (isInSession(entry) && !/codex|agy|antigravity/i.test(String(entry)))) return 'in-session';
  const name = String(entry);
  if (/^codex\s*\(auto\)$/i.test(name) || name === 'Codex (auto)') return 'codex';
  if (/^(agy|antigravity)\s*\(auto\)$/i.test(name) || name === 'Antigravity (auto)') return 'agy';
  if (/^(grok|xai|supergrok)\s*\(auto\)$/i.test(name) || name === 'Grok (auto)') return 'grok';
  if (name.indexOf('/') === -1 && AGY_ONLY.test(name)) return 'agy';
  if (name.indexOf('/') === -1 && CODEX_ONLY.test(name)) return 'codex';
  return 'opencode';
}

// ─── file read / write ──────────────────────────────────────────────────────

function resolveRosterFile(from, opts) {
  opts = opts || {};
  const cwd = from || process.cwd();
  
  let pkgRoot = opts.pkgRoot;
  if (!pkgRoot) {
    let current = cwd;
    while (true) {
      if (fs.existsSync(path.join(current, '.wb'))) {
        pkgRoot = current;
        break;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    if (!pkgRoot) pkgRoot = cwd;
  }
  const repoRoot = opts.repoRoot || pkgRoot;

  const homedir = process.env.HOME || require('os').homedir();
  const templatesRoot = path.resolve(__dirname, '..');

  // `implicitRoots: false` restricts the search to the roots the CALLER named.
  // The home and package roots are discovered, not passed in — `templatesRoot`
  // is `__dirname/..`, i.e. the real installed package — so a caller that wants
  // a hermetic resolution (tests) has no other way to exclude them. Production
  // callers never pass this and keep the full search.
  const roots = opts.implicitRoots === false
    ? [pkgRoot, repoRoot]
    : [
      pkgRoot,
      repoRoot,
      path.join(homedir, '.wb-flow'),
      templatesRoot,
    ];

  const uniqueRoots = [];
  for (const r of roots) {
    if (r && uniqueRoots.indexOf(r) === -1) uniqueRoots.push(r);
  }

  const allCandidates = [];
  for (const root of uniqueRoots) {
    allCandidates.push({ root: root, path: path.join(root, '.wb', 'commands', 'model_recommendations.md') });
    allCandidates.push({ root: root, path: path.join(root, 'commands', 'model_recommendations.md') });
    allCandidates.push({ root: root, path: path.join(root, 'templates', 'commands', 'model_recommendations.md') });
  }

  const existing = [];
  for (const c of allCandidates) {
    if (fs.existsSync(c.path)) {
      try {
        const stat = fs.statSync(c.path);
        existing.push({ path: c.path, mtime: stat.mtimeMs, root: c.root });
      } catch (e) {}
    }
  }

  if (opts.forWrite) {
    const tmplDir = path.join(templatesRoot, 'templates');
    const valid = existing.filter((c) => {
      try {
        const resolved = fs.realpathSync(c.path);
        return !(resolved === tmplDir || resolved.startsWith(tmplDir + path.sep));
      } catch (e) {
        return false;
      }
    });
    if (!valid.length) {
      throw new Error('All roster candidates resolve into the shipped templates directory. Cannot write here.');
    }
    return valid[0].path;
  }
  
  if (!existing.length) return null;
  
  // The shipped template is a seed, not a user's active roster. Its mtime can
  // move whenever the package is rebuilt, so it must not outrank a real roster
  // merely because the package was installed recently.
  const templateDir = path.join(templatesRoot, 'templates');
  const active = existing.filter((candidate) => {
    try {
      const resolved = fs.realpathSync(candidate.path);
      return !(resolved === templateDir || resolved.startsWith(templateDir + path.sep));
    } catch (e) {
      return false;
    }
  });
  const candidates = active.length ? active : existing;

  // A scope-local copy is useful only while it is current. Once a newer
  // project or user roster exists, silently routing on the nearest stale copy
  // makes every generated dispatch look valid while using the wrong lineup.
  // Keep the original candidate order as the deterministic tie-breaker.
  let freshest = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i].mtime > freshest.mtime) freshest = candidates[i];
  }

  return freshest.path;
}

/** Parse the roster table back out — `/wbModel --list` and tests both need it. */
function readRoster(text) {
  const lines = String(text || '').split('\n');
  const start = lines.findIndex((l) => l.trim() === ROSTER_HEADING);
  if (start === -1) return null;
  const roster = {};
  for (let i = start; i < lines.length; i++) {
    if (i > start && /^## /.test(lines[i])) break;
    if (!lines[i].startsWith('|')) continue;
    const cells = lines[i].split(/(?<!\\)\|/).map((c) => c.trim());
    const roleCell = cells[1] || '';
    const role = ROLE_ORDER.filter((r) => roleCell.indexOf(ROLE_META[r].emoji) !== -1)[0];
    if (!role) continue;
    // Split on the ` / ` SEPARATOR, not on any slash: every provider-prefixed
    // slug contains one (`opencode-go/deepseek-v4-pro`), and splitting naively
    // shreds each model into two bogus entries.
    roster[role] = (cells[2] || '')
      .replace(/⚠️.*$/, '')
      .split(/\s+\/\s+/)
      .map((s) => s.replace(/\*\*/g, '').trim())
      // `_italic_` cells are placeholders from the neutral default, not models.
      .filter((s) => s && !/^_.*_$/.test(s));
  }
  return Object.keys(roster).length ? roster : null;
}

/**
 * Replace the roster table in place, leaving every other section untouched —
 * the annexes, the orchestrator rules, and the notes are hand-written prose
 * that a regenerated file must not clobber.
 */
function writeRosterInto(text, roster, meta) {
  const lines = String(text).split('\n');
  const start = lines.findIndex((l) => l.trim() === ROSTER_HEADING);
  if (start === -1) throw new Error('roster heading not found: ' + ROSTER_HEADING);

  let first = -1;
  let last = -1;
  for (let i = start; i < lines.length; i++) {
    if (i > start && /^## /.test(lines[i])) break;
    if (lines[i].startsWith('|')) {
      if (first === -1) first = i;
      last = i;
    }
  }
  if (first === -1) throw new Error('no roster table under ' + ROSTER_HEADING);

  const stamp = '> **Roster written ' + (meta && meta.date || new Date().toISOString().slice(0, 10))
    + ' by `wb-flow model`.** Detected from the installed CLIs\' catalogs'
    + (meta && meta.probed ? ' and verified by dispatch probe.' : '; reachability NOT probed — run `wb-flow model --probe` to verify.')
    + ' Edit via `wb-flow model` or `/wbModel`, not by hand: the `\\|\\|` escaping in the last column is load-bearing.';

  // Drop any prior stamp/dispatch block before writing the new one — otherwise
  // every `--set` appends another "Roster written …" line and the file grows a
  // stack of contradictory timestamps (observed: 4 stamps after 4 writes).
  const tail = lines.slice(last + 1);
  let skip = 0;
  while (skip < tail.length) {
    const t = tail[skip].trim();
    if (t === '' || t.indexOf('> **Roster written') === 0 || t.indexOf('**Dispatch chains**') === 0) { skip++; continue; }
    if (t === '```bash') {                       // the generated dispatch block
      let k = skip + 1;
      while (k < tail.length && tail[k].trim() !== '```') k++;
      skip = k + 1;
      continue;
    }
    break;
  }

  const out = lines.slice(0, first)
    .concat(renderRosterTable(roster, meta).split('\n'))
    .concat([''], [stamp], [''])
    .concat(tail.slice(skip));
  return out.join('\n');
}

// ─── reachability probe ─────────────────────────────────────────────────────

const PROBE_TOKEN = 'WB_FLOW_PROBE_OK';
const PROBE_PROMPT = 'Reply with exactly ' + PROBE_TOKEN + ' and nothing else.';

function extractProbeError(r, out) {
  if (r.error) return String(r.error.code || r.error.message);
  const text = String(out || (r.stdout || '') + (r.stderr || ''));

  if (/Insufficient balance|balance|billing|Insufficient credits|credits|Insufficient funds|Payment required|payment/i.test(text)) return 'Insufficient balance';
  if (/Quota exceeded|Rate limit|too many requests/i.test(text)) return 'Rate limit / Quota exceeded';
  if (/Model not found|unknown model|does not exist/i.test(text)) return 'Model not found';
  if (/not supported when using Codex|subscription|plan|tier/i.test(text)) return 'not on this plan';
  if (/Unauthorized|Invalid API key|authentication/i.test(text)) return 'Invalid API key';

  if (r.status !== 0) return 'Insufficient balance';
  return null;
}

function probeResponseText(out) {
  const raw = String(out || '');
  const values = [];
  const add = (value) => { if (typeof value === 'string' && value) values.push(value); };
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (value.type === 'text') add(value.text);
    if (value.part && value.part.type === 'text') add(value.part.text);
    if (typeof value.response === 'string') add(value.response);
    if (typeof value.output === 'string') add(value.output);
    if (value.role === 'assistant') {
      if (typeof value.content === 'string') add(value.content);
      else visit(value.content);
    }
  };
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
  let parsed = false;
  for (const line of lines) {
    try { const event = JSON.parse(line); parsed = true; visit(event); } catch (_) { /* default CLI output */ }
  }
  return values.length ? values.join('\n') : (parsed ? '' : raw);
}

function normalizedModelLabel(value) {
  return String(value || '')
    .toLowerCase()
    .split('/').pop()
    .replace(/[-_.](high|medium|low|thinking)$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function reportedModel(out) {
  const raw = stripAnsi(out);
  const models = [];
  const add = (value) => { if (typeof value === 'string' && value.trim()) models.push(value.trim()); };
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    for (const key of ['model', 'modelName', 'model_name', 'currentModel', 'current_model']) {
      if (typeof value[key] === 'string') add(value[key]);
    }
    Object.keys(value).forEach((key) => {
      if (key !== 'model' && key !== 'modelName' && key !== 'model_name' && key !== 'currentModel' && key !== 'current_model') {
        if (value[key] && typeof value[key] === 'object') visit(value[key]);
      }
    });
  };
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try { visit(JSON.parse(trimmed)); } catch (_) { /* text output */ }
  });
  const prose = raw.match(/currently using (?:the )?\*\*([^*]+)\*\*\s+model/i)
    || raw.match(/underlying model powering me right now is\s+([^.!\n]+)/i);
  if (prose) add(prose[1]);
  return models[0] || '';
}

function hasMeaningfulProbeResponse(text) {
  const lines = stripAnsi(text).split('\n').map((line) => line.trim()).filter(Boolean);
  return lines.some((line) =>
    line !== PROBE_PROMPT
      && !/^>\s*(build|plan|run)\b/i.test(line)
      && !/^error\b/i.test(line)
      && !/^warning\b/i.test(line));
}

/**
 * A zero exit status is not sufficient. Several CLI/provider combinations
 * print an error and still exit 0, so require the response to contain the
 * token requested by the probe. This proves that the configured dispatch lane
 * returned an actual model response rather than merely starting successfully.
 */
function probeResponseError(r, out, expectedModel, requireToken) {
  const errWhy = extractProbeError(r, out);
  if (errWhy) return errWhy;
  if (r.status !== 0) return 'probe command failed';
  const responseText = probeResponseText(out);
  if (expectedModel) {
    const actual = reportedModel(out);
    if (actual && normalizedModelLabel(actual) !== normalizedModelLabel(expectedModel)) {
      return 'requested model not selected (using ' + actual + ')';
    }
  }
  if (requireToken !== false && !new RegExp('(^|[^A-Z0-9_])' + PROBE_TOKEN + '([^A-Z0-9_]|$)', 'i').test(stripAnsi(responseText))) {
    return 'no valid probe response';
  }
  if (!hasMeaningfulProbeResponse(responseText)) return 'no valid probe response';
  return null;
}

/**
 * The only check that proves a model answers. Catalogued + credentialed is not
 * enough: on 2026-08-02 every `opencode-go/*` probe timed out at 150s while the
 * catalog answered instantly.
 */
function probeModel(slug, timeoutMs, catIdx) {
  const name = String(slug).trim();
  // Catalog-authoritative routing (see resolveCli). When the catalog names a
  // CLI for this slug, honour it instead of re-deriving one from the string.
  const R = resolveCli(name, catIdx);
  // `|| 'sentinel'` added 2026-08-17. A provider `(auto)` entry resolves through
  // SENTINEL, not the catalog, so it used to fall past this branch into the
  // string heuristics and out the bottom as `opencode run -m "Grok (auto)"` —
  // reported as *"Model not found"* for a lane that answers in 3 s. wave_router's
  // cliFor() has always accepted both sources; the probe was the outlier, which
  // is exactly the probe-here / dispatch-there split cli_registry.js exists to
  // prevent. Fixing it also repairs the `Antigravity (auto)` probe, whose
  // hand-written fallback below still carries the `-p`-first argv order that
  // makes agy answer the permission flag instead of the prompt.
  if ((R.source === 'catalog' || R.source === 'sentinel') && R.cli !== 'opencode') {
    if (R.cli === 'in-session') return { slug: slug, ok: true, why: '', skipped: 'in-session root', route: R };
    const built = REG.argvFor(R, PROBE_PROMPT);
    if (!built) return { slug: slug, ok: false, why: 'no CLI spec for ' + R.cli, route: R };
    if (!hasCLI(built.bin)) return { slug: slug, ok: false, why: built.bin + ' not installed', route: R };
    const rr = spawnSync(built.bin, built.argv,
      { encoding: 'utf8', timeout: timeoutMs || 45000, stdio: ['ignore', 'pipe', 'pipe'] });
    const oo = String((rr.stdout || '') + (rr.stderr || ''));
    // Only opencode echoes the model it served, so only there can the reply be
    // cross-checked against what was requested. For the native CLIs the check
    // is reachability, not identity.
    const ww = probeResponseError(rr, oo, R.modelArg, built.bin === 'opencode');
    return { slug: slug, ok: !ww, why: ww || '', route: R };
  }
  if (isInSession(name)) {
    return { slug: slug, ok: true, why: '', skipped: 'in-session root' };
  }
  if (/^codex\s*\(auto\)$/i.test(name) || name === 'Codex (auto)') {
    if (!hasCLI('codex')) return { slug: slug, ok: false, why: 'codex not installed' };
    const r = spawnSync('codex', ['exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', PROBE_PROMPT],
      { encoding: 'utf8', timeout: timeoutMs || 45000, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = String((r.stdout || '') + (r.stderr || ''));
    const errWhy = probeResponseError(r, out, '', false);
    return { slug: slug, ok: !errWhy, why: errWhy || '' };
  }
  if (/^(agy|antigravity)\s*\(auto\)$/i.test(name) || name === 'Antigravity (auto)') {
    if (!hasCLI('agy')) return { slug: slug, ok: false, why: 'agy not installed' };
    const r = spawnSync('agy', ['-p', '--dangerously-skip-permissions', PROBE_PROMPT],
      { encoding: 'utf8', timeout: timeoutMs || 45000, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = String((r.stdout || '') + (r.stderr || ''));
    const errWhy = probeResponseError(r, out, '', false);
    return { slug: slug, ok: !errWhy, why: errWhy || '' };
  }
  const tail = name.split('/').pop();
  if (AGY_ONLY.test(tail)) {
    if (!hasCLI('agy')) return { slug: slug, ok: false, why: 'agy not installed' };
    const r = spawnSync('agy', ['-p', '--model', tail, '--dangerously-skip-permissions', PROBE_PROMPT],
      { encoding: 'utf8', timeout: timeoutMs || 45000, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = String((r.stdout || '') + (r.stderr || ''));
    const errWhy = probeResponseError(r, out, tail, false);
    return { slug: slug, ok: !errWhy, why: errWhy || '' };
  }
  if (String(slug).indexOf('/') === -1 && CODEX_ONLY.test(tail)) {
    if (!hasCLI('codex')) return { slug: slug, ok: false, why: 'codex not installed' };
    const r = spawnSync('codex', ['exec', '-m', tail, '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check',
      PROBE_PROMPT],
      { encoding: 'utf8', timeout: timeoutMs || 45000, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = String((r.stdout || '') + (r.stderr || ''));
    const errWhy = probeResponseError(r, out, tail);
    return { slug: slug, ok: !errWhy, why: errWhy || '' };
  }
  if (!hasCLI('opencode')) return { slug: slug, ok: false, why: 'opencode not installed' };
  const r = spawnSync('opencode', ['run', '-m', slug, '--format', 'json', '--dangerously-skip-permissions', PROBE_PROMPT],
    { encoding: 'utf8', timeout: timeoutMs || 45000, stdio: ['ignore', 'pipe', 'pipe'] });
  const out = String((r.stdout || '') + (r.stderr || ''));
  const errWhy = probeResponseError(r, out, name);
  return {
    slug: slug,
    ok: !errWhy,
    why: errWhy || '',
  };
}

/**
/**
 * Custom models loader. Loads from:
 * 1. CLI flag: --models-file=<path> or --models=<path>
 * 2. Environment variable: WB_MODELS_FILE
 * 3. Local workspace file: .wb/models.json
 * 4. User global config file: ~/.config/wb-flow/models.json
 */
/**
 * Where `--sync-catalog` writes. Same documented order `loadCustomModels()`
 * reads by, so the file that is read is the file that is written — resolving
 * them differently is A15 in a new place.
 */
function resolveCatalogPath(opts) {
  const explicit = (opts && opts.modelsFile) || process.env.WB_MODELS_FILE || null;
  if (explicit) return explicit;
  const local = path.join(process.cwd(), '.wb', 'models.json');
  if (fs.existsSync(local)) return local;
  const home = process.env.HOME || os.homedir();
  if (home) {
    const user = path.join(home, '.wb', 'models.json');
    if (fs.existsSync(user)) return user;
    const cfg = path.join(home, '.config', 'wb-flow', 'models.json');
    if (fs.existsSync(cfg)) return cfg;
    return user;
  }
  return local;
}

function loadCustomModels(opts) {
  // Documented resolution order (docs/start_here/tutorial_model_picker.md):
  //   $WB_MODELS_FILE -> ./.wb/models.json -> ~/.wb/models.json -> ~/.config/wb-flow/models.json
  const searchPath = [path.join(process.cwd(), '.wb', 'models.json')];
  try {
    const home = process.env.HOME || os.homedir();
    if (home) {
      searchPath.push(path.join(home, '.wb', 'models.json'));
      searchPath.push(path.join(home, '.config', 'wb-flow', 'models.json'));
    }
  } catch (err) {
    console.warn('⚠️  Could not resolve the home directory: ' + err.message);
  }

  const explicit = (opts && opts.modelsFile) || process.env.WB_MODELS_FILE || null;
  let filepath = explicit;

  // An explicit path that does not exist outranked every on-disk default and
  // returned null WITHOUT A WORD — which silently removed Step 0, dropped every
  // provider the catalog contributes (grok among them), and left the picker
  // showing `[unknown]` pools. Three visible symptoms, no diagnostic. Say it
  // out loud, then fall back rather than losing the catalog entirely.
  if (explicit && !fs.existsSync(explicit)) {
    console.warn('\n⚠️  Models catalog not found at: ' + explicit);
    console.warn('   (from ' + (opts && opts.modelsFile ? '--models-file' : '$WB_MODELS_FILE') + ')');
    console.warn('   Falling back to the default search path.');
    filepath = null;
  }

  if (!filepath) {
    for (const cand of searchPath) {
      if (fs.existsSync(cand)) { filepath = cand; break; }
    }
  }
  if (!filepath || !fs.existsSync(filepath)) return null;

  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const result = {};
    const roles = data.roles || data;

    for (const role of ROLE_ORDER) {
      const entry = roles[role];
      if (!entry) continue;
      let modelList = [];
      if (Array.isArray(entry)) {
        modelList = entry.map((item) => (typeof item === 'string' ? item : item.name || item.model));
      } else if (entry.providers && Array.isArray(entry.providers)) {
        for (const p of entry.providers) {
          if (p.models && Array.isArray(p.models)) {
            for (const m of p.models) {
              modelList.push(typeof m === 'string' ? m : m.name || m.model);
            }
          }
        }
      } else if (entry.models && Array.isArray(entry.models)) {
        modelList = entry.models.map((item) => (typeof item === 'string' ? item : item.name || item.model));
      }
      if (modelList.length) result[role] = modelList;
    }
    return { filepath, models: result, raw: roles, masterProviders: data.providers || null };
  } catch (err) {
    console.warn('⚠️ Could not parse custom models JSON at ' + filepath + ': ' + err.message);
    return null;
  }
}

function saveSelectedRoster(roster, opts) {
  try {
    const targetDir = path.join(process.cwd(), '.wb');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const selectedFile = path.join(targetDir, 'selected.json');
    // `providers` is what makes pool classification data-driven (task 5) AND
    // what pre-checks Step 0 next time (defect #6). Without it the owner
    // re-toggled every checkbox on every --pick run, and `isSubscription()` had
    // nothing to derive from.
    const payload = {
      updatedAt: new Date().toISOString(),
      roster: roster,
    };
    if (opts && Array.isArray(opts.providers) && opts.providers.length) {
      payload.providers = opts.providers.slice();
    } else {
      // Never silently drop a selection a previous run persisted.
      try {
        const prev = JSON.parse(fs.readFileSync(selectedFile, 'utf8'));
        if (Array.isArray(prev.providers) && prev.providers.length) payload.providers = prev.providers;
      } catch (_) { /* first write, or unreadable — fine */ }
    }
    fs.writeFileSync(selectedFile, JSON.stringify(payload, null, 2));
  } catch (_) { /* non-fatal */ }
}

/**
 * Returns a human-readable role qualification suffix for a model slug.
 */
function qualifyModel(slug) {
  const name = String(slug).toLowerCase();
  
  if (/grok-4\.6|opus-5|gpt-5\.6-sol|command-a-plus|mistral-large|gpt-oss-120b|sonnet-4-6|gpt-4o|claude-3-7|gemini-3\.1-pro/i.test(name)) {
    return '🧠 Lead Architect & Planner';
  }
  if (/opus-4|sonnet-5|gpt-5\.6-terra|grok-4\.5|deepseek-v4-pro|r1|reasoner|o1|o3|thinking|deepseek-r1/i.test(name)) {
    return '🧠 Big Planner & Deep Thinker';
  }
  if (/coder|codestral|devstral|fable-5|gpt-5\.5|gpt-5\.3-codex|grok-4\.3|command-a|llama-3\.3|qwen-2\.5-coder|kimi-k2\.7-code/i.test(name)) {
    return '💻 Great Coder Worker';
  }
  if (/haiku|flash|luna|mini|small|gemma|qwen3\.7-plus|gpt-5\.4-mini|gpt-oss-20b|grok-4\.1-fast/i.test(name)) {
    return '⚡ Fast Mechanical Worker';
  }
  if (/deepseek-v3|kimi-k3|qwen3\.7-max|glm-4/i.test(name)) {
    return '🔨 Heavy Worker';
  }
  if (/command|llama|mixtral|grok|mistral/i.test(name)) {
    return '💡 General Purpose Worker';
  }
  return '💡 General Worker';
}

// ─── probe target selection (shared by BOTH --probe paths) ──────────────────
//
// `--probe --all` exists in two branches: one under --pick (the interactive
// picker) and one without it (scriptable/CI). They drifted: the --pick branch
// gained catalog-authoritative routing and the --all=<filter> forms, while the
// non-pick branch kept probing the whole catalog through the old routing and
// still reported "Insufficient balance" for every anthropic/* and openai/*
// model. Both now call this one function.

/** Every tag qualifyModel can return, in display order. */
const ROLE_TAGS = [
  '🧠 Lead Architect & Planner',
  '🧠 Big Planner & Deep Thinker',
  '💻 Great Coder Worker',
  '🔨 Heavy Worker',
  '⚡ Fast Mechanical Worker',
  '💡 General Purpose Worker',
  '💡 General Worker',
];

/**
 * Resolve `--all[=<what>]` into the set of models to probe.
 * @returns {{targets:string[], mode:string, filter:?string, grouped:boolean, error:?string}}
 *   mode ∈ 'raw' | 'default' | 'role' | 'provider'
 */
function selectProbeTargets(allCatalog, allOpt, catIdx) {
  // `--all=` with nothing after it used to parse as '' and silently disable the
  // probe entirely. Treat it as the plain `--all`.
  const want = (allOpt === true || allOpt === '' || allOpt === undefined || allOpt === null)
    ? 'default' : String(allOpt).toLowerCase();

  if (want === 'raw') return { targets: allCatalog, mode: 'raw', filter: null, grouped: false, error: null };
  if (want === 'default') return { targets: allCatalog, mode: 'default', filter: null, grouped: true, error: null };

  if (ROLE_ORDER.indexOf(want) !== -1) {
    const patterns = ROLE_PREFERENCE[want] || [];
    const targets = allCatalog.filter(function (slug) {
      const tail = slug.split('/').pop();
      return patterns.some(function (re) { return re.test(tail); });
    });
    return {
      targets: targets, mode: 'role', filter: want, grouped: true,
      error: targets.length ? null : 'No models match role: ' + allOpt + '  (try --all=raw)',
    };
  }

  const targets = allCatalog.filter(function (slug) {
    const prov = (resolveCli(slug, catIdx).provider || '').toLowerCase();
    return prov.indexOf(want) !== -1;
  });
  return {
    targets: targets, mode: 'provider', filter: want, grouped: true,
    error: targets.length ? null : 'No models match provider: ' + allOpt + '  (try --all=raw, or check the spelling)',
  };
}

/** Group probe lines under their role headings, ordered, nothing dropped. */
function renderGrouped(buckets) {
  const out = [];
  const seen = new Set();
  for (const tag of ROLE_TAGS) {
    if (buckets[tag] && buckets[tag].length) {
      out.push.apply(out, buckets[tag]);
      seen.add(tag);
    }
  }
  // Any tag not in ROLE_TAGS still prints — never silently dropped.
  for (const tag of Object.keys(buckets)) {
    if (!seen.has(tag)) out.push.apply(out, buckets[tag]);
  }
  return out;
}


/**
 * Builds a 2-level tree structure for interactive role model picking from custom JSON providers.
 * Level 1 (Parent Node): Provider — selecting registers a real provider alias
 * Level 2 (Leaf Node)  : Model    — selecting registers specific model slug
 */
function buildRoleTreeFromProviders(providers, activeProviders, probeResults) {
  const treeItems = [];
  const filtered = Array.isArray(activeProviders) && activeProviders.length
    ? providers.filter((p) => activeProviders.indexOf(p.provider) !== -1)
    : providers;

  for (const group of filtered) {
    const provName = group.provider || 'unknown';
    // Filter out redundant auto model leaf nodes since parent node represents provider (auto)
    const models = (group.models || [])
      .map((m) => (typeof m === 'string' ? m : m.name || m.model))
      .filter((m) => !/\(auto\)$/i.test(m));

    const pool = group.pool || (models[0] ? poolOf(models[0]) : 'unknown');
    const provAutoVal = autoAliasForProvider(provName) || provName + ' (auto)';
    const providerProbe = probeResults instanceof Map ? probeResults.get(provAutoVal) : null;
    const providerAutoAvailable = Boolean(autoAliasForProvider(provName)) && (!probeResults || !providerProbe || providerProbe.ok);
    const providerNote = providerProbe && !providerProbe.ok
      ? ' ❌ ' + (providerProbe.why || 'unreachable')
      : (!autoAliasForProvider(provName) ? ' — choose a verified model' : '');
    const poolTag = '[' + pool + ']';

    // Level 1: Provider Parent Node
    treeItems.push({
      isNode: true,
      provider: provName,
      pool: pool,
      value: provAutoVal,
      disabled: !providerAutoAvailable,
      display: '📁 ' + provName.padEnd(28) + poolTag + providerNote,
    });

    // Level 2: Model Leaf Nodes
    const mCount = models.length;
    models.forEach((m, idx) => {
      const isLast = idx === mCount - 1;
      const branch = isLast ? '      └── ' : '      ├── ';
      const tag = qualifyModel(m);
      if (probeResults instanceof Map && probeResults.has(m)) {
        const pRes = probeResults.get(m);
        const icon = pRes.ok ? '✅ ' : '❌ ';
        const note = pRes.ok ? '' : ' (' + (pRes.why || 'unreachable') + ')';
        treeItems.push({
          isNode: false,
          disabled: !pRes.ok,
          provider: provName,
          pool: pool,
          value: m,
          display: branch + icon + '📄 ' + m.padEnd(44) + ' — ' + tag + note,
        });
      } else {
        treeItems.push({
          isNode: false,
          disabled: Boolean(probeResults instanceof Map),
          provider: provName,
          pool: pool,
          value: m,
          display: branch + '📄 ' + m.padEnd(44) + ' — ' + tag,
        });
      }
    });
  }
  return treeItems;
}

/**
 * Candidates offered for a role, best-first.
 */
function candidatesFor(role, found, limit, customCatalog) {
  const custom = (customCatalog && customCatalog[role]) || [];
  if (custom.length) {
    const out = custom.slice();
    if (found && found.claude && out.indexOf(IN_SESSION) === -1) out.push(IN_SESSION);
    if (found && found.codex && out.indexOf('Codex (auto)') === -1) out.push('Codex (auto)');
    if (found && found.agy && out.indexOf('Antigravity (auto)') === -1) out.push('Antigravity (auto)');
    if (found && found.grok && out.indexOf('Grok (auto)') === -1) out.push('Grok (auto)');
    return out;
  }

  const slugs = ((found && found.slugs) || [])
    .concat((found && found.agy && found.agy.models) || [])
    .concat((found && found.grok && found.grok.models) || [])
    .concat((found && found.codex && (found.codex.verified || found.codex.models)) || []);
  const maxLimit = limit || 16;
  const ranked = pickForRole(role, slugs, { limit: maxLimit });
  const extra = pickForRole(role, slugs, { limit: maxLimit * 3 })
    .filter((s) => ranked.indexOf(s) === -1);
  const out = ranked.concat(extra).slice(0, maxLimit);
  if (found && found.claude && out.indexOf(IN_SESSION) === -1) out.push(IN_SESSION);
  if (found && found.codex && out.indexOf('Codex (auto)') === -1) out.push('Codex (auto)');
  if (found && found.agy && out.indexOf('Antigravity (auto)') === -1) out.push('Antigravity (auto)');
  if (found && found.grok && out.indexOf('Grok (auto)') === -1) out.push('Grok (auto)');
  return out;
}

const IN_SESSION = 'Claude (auto)';

// ─── probe-derived defaults for the Step 1 pickers ──────────────────────────
//
// Before this, Step 1 pre-checked whatever `proposeRoster(found)` produced from
// CLI *detection* — which knows a model is credentialed but not whether it
// answers. After `--probe --all` the reachable set is known exactly, so the
// models the probe just listed under a role become that role's default chain.

/** Which qualifyModel() tags feed which role. */
const TAG_ROLES = {
  '🧠 Lead Architect & Planner': ['planner', 'validator'],
  '🧠 Big Planner & Deep Thinker': ['planner', 'validator'],
  '💻 Great Coder Worker': ['worker'],
  '🔨 Heavy Worker': ['worker'],
  '⚡ Fast Mechanical Worker': ['mechanical'],
  '💡 General Purpose Worker': ['worker'],
  '💡 General Worker': ['planner', 'validator', 'worker', 'mechanical'],
};

const TIER_RE = /^(.*)-(high|medium|low)$/;
const TIER_RANK = { high: 3, medium: 2, low: 1 };

/**
 * Collapse `-high` / `-medium` / `-low` siblings of the SAME stem to one entry,
 * preferring `-high`.
 *
 * `gemini-3.6-flash-{high,medium,low}` is one model at three service tiers, so
 * offering all three as separate fallback links is a chain of one model wearing
 * three hats — the exact failure the pool rule exists to prevent. Different
 * RELEASES are left alone: `gemini-3.6-flash-high` and `gemini-3.5-flash-high`
 * have different stems and both survive.
 */
function collapseTiers(slugs) {
  const best = new Map();
  const out = [];
  for (const slug of slugs) {
    const m = TIER_RE.exec(slug);
    if (!m) { out.push(slug); continue; }
    const stem = m[1];
    const rank = TIER_RANK[m[2]] || 0;
    const prev = best.get(stem);
    if (!prev || rank > prev.rank) best.set(stem, { slug: slug, rank: rank });
  }
  for (const { slug } of best.values()) out.push(slug);
  // Preserve the caller's ordering rather than Map insertion order.
  return slugs.filter(function (s) { return out.indexOf(s) !== -1; });
}

/**
 * Default chain for one role, drawn from what the probe proved reachable.
 * Returns null when there is nothing to go on, so the caller keeps its old base.
 */
function suggestFromProbe(role, probeResults, activeProviders, catIdx) {
  if (!(probeResults instanceof Map) || !probeResults.size) return null;

  const reachable = [];
  for (const [slug, res] of probeResults) {
    if (!res || !res.ok) continue;                 // ❌ and ⚠️ substituted are both out
    if (Array.isArray(activeProviders) && activeProviders.length) {
      const prov = (res.route && res.route.provider) ||
        (catIdx && catIdx.get(slug) && catIdx.get(slug).provider);
      if (prov && activeProviders.indexOf(prov) === -1) continue;
    }
    reachable.push(slug);
  }
  if (!reachable.length) return null;

  // Role-tagged first; if the probe found nothing for this role, fall back to
  // the whole reachable set rather than leaving the role with no default.
  const tagged = reachable.filter(function (slug) {
    const roles = TAG_ROLES[(probeResults.get(slug) || {}).tag || qualifyModel(slug)];
    return roles && roles.indexOf(role) !== -1;
  });
  const pool = collapseTiers(tagged.length ? tagged : reachable);

  // pickForRole applies the capability ranking AND the different-billing-pool
  // rule, so the default chain is diverse by construction.
  const chain = (pickForRole(role, pool, { limit: 4 }) || []).slice();

  // Top up. pickForRole only returns models matched by a ROLE_PREFERENCE
  // pattern, so a reachable model nobody wrote a pattern for is dropped
  // entirely — which loses whole billing pools. Observed: a probe with
  // `Antigravity (auto)` reachable produced a two-link worker chain, both on
  // chatgpt. Fill the remaining slots newest-pool-first so the chain keeps the
  // property it exists for.
  const usedPools = new Set(chain.map(poolOf));
  for (const wantNewPool of [true, false]) {
    for (const slug of pool) {
      if (chain.length >= 4) break;
      if (chain.indexOf(slug) !== -1) continue;
      const isNew = !usedPools.has(poolOf(slug));
      if (wantNewPool !== isNew) continue;
      chain.push(slug);
      usedPools.add(poolOf(slug));
    }
  }
  return chain.length ? chain : pool.slice(0, 4);
}

/** One role's interactive question. Returns the chosen chain, in order. */
async function pickRole(io, role, found, suggested, unreachable, customObj, activeProviders, probeResults) {
  let treeItems = [];

  const masterProviders = customObj && (customObj.masterProviders || (customObj.raw && customObj.raw.providers));
  if (masterProviders && Array.isArray(masterProviders)) {
    treeItems = buildRoleTreeFromProviders(masterProviders, activeProviders, probeResults);
  } else if (customObj && customObj.raw && customObj.raw[role] && Array.isArray(customObj.raw[role].providers)) {
    treeItems = buildRoleTreeFromProviders(customObj.raw[role].providers, activeProviders, probeResults);
  } else {
    const options = candidatesFor(role, found, 16, customObj ? customObj.models : null);
    for (const s of suggested) if (options.indexOf(s) === -1) options.push(s);

    treeItems = options.map((o, i) => {
      const pool = poolOf(o);
      const probe = probeResults instanceof Map ? probeResults.get(o) : null;
      const failed = (probe && !probe.ok) || unreachable.indexOf(o) !== -1;
      const mark = failed ? '  ❌ did not answer'
                 : (isInSession(o) ? '  in-session, never spawned'
                 : (o === 'Codex (auto)' || /^codex\s*\(auto\)$/i.test(o) ? '  codex active model'
                 : (o === 'Antigravity (auto)' || /^(antigravity|agy)\s*\(auto\)$/i.test(o) ? '  agy active model' : '')));
      return {
        isNode: false,
        value: o,
        disabled: failed,
        display: String(i + 1).padStart(2) + ') ' + o.padEnd(42) + '[' + pool + ']' + mark,
      };
    });
  }

  const suggestedVals = suggested || [];
  const defaultIndexes = suggestedVals
    .map((val) => treeItems.findIndex((item) => item.value === val))
    .filter((idx) => idx !== -1 && !treeItems[idx].disabled);

  const label = ROLE_META[role].label.replace(/\*\*/g, '');
  const title = label + ' — select model chain in priority order';

  let chosenIndexes;
  if (process.stdin.isTTY) {
    chosenIndexes = await checkboxPick(title, treeItems, defaultIndexes);
  } else {
    // Non-interactive fallback
    console.log('');
    console.log('  ' + title);
    treeItems.forEach((it, i) => console.log('   ' + String(i + 1).padStart(2) + ') ' + it.display));
    const dflt = defaultIndexes.map((i) => String(i + 1)).join(',');
    const answer = await io.ask('    > ', dflt);
    chosenIndexes = String(answer).split(/[,\s]+/)
      .map((n) => parseInt(n, 10) - 1)
      .filter((n) => n >= 0 && n < treeItems.length);
  }

  const chosenVals = chosenIndexes
    .filter((idx) => treeItems[idx] && !treeItems[idx].disabled)
    .map((idx) => treeItems[idx].value)
    .filter((v, i, a) => a.indexOf(v) === i);
  const validSuggested = (suggested || []).filter((value) => {
    const result = probeResults instanceof Map ? probeResults.get(value) : null;
    return unreachable.indexOf(value) === -1 && (!result || result.ok);
  });
  const final = chosenVals.length ? chosenVals : validSuggested;
  const pools = final.map(poolOf);

  console.log('      → ' + final.join(' || '));
  console.log('        pools: ' + pools.join(' → ')
    + (new Set(pools).size === pools.length ? '  ✓ no repeat'
       : '  ⚠️  same pool twice — one rate-limit window takes out the whole chain'));
  return final;
}

function getAllCatalogModels(customObj, roster) {
  const set = new Set();
  if (customObj && customObj.masterProviders) {
    for (const group of customObj.masterProviders) {
      for (const m of group.models || []) {
        const slug = typeof m === 'string' ? m : m.name || m.model;
        if (slug) set.add(slug);
      }
    }
  } else if (customObj && customObj.models) {
    for (const role of Object.keys(customObj.models)) {
      for (const slug of customObj.models[role] || []) {
        if (slug) set.add(slug);
      }
    }
  }
  if (roster) {
    for (const role of Object.keys(roster)) {
      for (const slug of roster[role] || []) {
        if (slug) set.add(slug);
      }
    }
  }
  return Array.from(set);
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const o = { detect: false, pick: false, set: {}, probe: false, all: false, timeout: 45000, file: null, modelsFile: null, json: false, yes: false, dryRun: false, help: false, syncCatalog: false, prune: false, force: false, add: null, remove: null, strict: false, fromPicker: false, fromFile: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--detect' || a === '--reset') o.detect = true;
    else if (a === '--sync-catalog' || a === '--sync') o.syncCatalog = true;
    else if (a.indexOf('--add=') === 0) o.add = splitProviderList(a.slice(6));
    else if (a === '--add') { o.add = splitProviderList(argv[++i] || ''); }
    else if (a.indexOf('--remove=') === 0) o.remove = splitProviderList(a.slice(9));
    else if (a === '--remove') { o.remove = splitProviderList(argv[++i] || ''); }
    else if (a === '--strict') o.strict = true;
    else if (a === '--from-picker') o.fromPicker = true;
    else if (a.indexOf('--from-file=') === 0) { o.fromPicker = true; o.fromFile = a.slice(12); }
    else if (a === '--prune') o.prune = true;
    else if (a === '--force') o.force = true;
    else if (a === '--pick' || a === '-i') o.pick = true;
    else if (a === '--probe') o.probe = true;
    else if (a === '--all' || a === '-a') o.all = 'default';
    else if (a.startsWith('--all=')) o.all = a.slice(6);
    else if (a === '--json') o.json = true;
    else if (a === '--yes' || a === '-y') o.yes = true;
    else if (a === '--dry-run' || a === '-n') o.dryRun = true;
    else if (a.indexOf('--timeout=') === 0) o.timeout = parseInt(a.slice(10), 10) || 45000;
    else if (a.indexOf('--file=') === 0) o.file = a.slice(7);
    else if (a.indexOf('--models-file=') === 0) o.modelsFile = a.slice(14);
    else if (a.indexOf('--models=') === 0) o.modelsFile = a.slice(9);
    else if (a === '--set') { const kv = argv[++i] || ''; applySet(o, kv); }
    else if (a.indexOf('--set=') === 0) applySet(o, a.slice(6));
  }
  return o;
}

function applySet(o, kv) {
  const m = String(kv).match(/^(\w+)=(.+)$/);
  if (!m) return;
  const role = m[1].toLowerCase();
  if (ROLE_ORDER.indexOf(role) === -1) {
    console.error('❌ Unknown role \'' + role + '\'. Use: ' + ROLE_ORDER.join(' '));
    process.exit(1);
  }
  o.set[role] = m[2].split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * `wb-flow model --sync-catalog [--prune] [--force] [--dry-run] [--json] [--yes]`
 *
 * Enumerate what THIS machine can reach, curate it, merge it into models.json.
 * All I/O lives here; the merge itself is bin/catalog_sync.js, which is pure so
 * the suite can exercise it with no CLIs installed (spec §10).
 *
 * The write is atomic — `.tmp` then rename — after copying the previous file to
 * `.bak`. A half-written catalog is worse than a stale one: the stale file still
 * routes, the truncated one breaks every dispatch with a JSON parse error.
 */
/**
 * Provider aliases, because a user types what they call the thing.
 * `codex` is the CLI; `openai` is the provider. `zen` / `go` / `agy` likewise.
 */
const PROVIDER_ALIAS = {
  codex: 'openai', chatgpt: 'openai',
  zen: 'opencode-zen', opencode: 'opencode-zen',
  go: 'opencode-go',
  agy: 'antigravity', google: 'antigravity', gemini: 'antigravity',
  claude: 'anthropic', grok: 'xai', supergrok: 'xai',
  copilot: 'github-copilot',
};
function resolveProviderName(name) {
  const k = String(name || '').trim().toLowerCase();
  return PROVIDER_ALIAS[k] || k;
}
function splitProviderList(raw) {
  return String(raw == null ? '' : raw)
    .split(/\s*[,|]+\s*/)
    .map(function (s) { return resolveProviderName(s); })
    .filter(function (s, i, a) { return s && a.indexOf(s) === i; });
}

/**
 * Parse the `codex` interactive picker's own output into slugs.
 *
 * Codex is the one provider that cannot be enumerated: `codex models` exists
 * but is interactive-only (piped it exits "stdin is not a terminal"; through a
 * pty it renders nothing and exits 0, both measured 2026-09-02). So the picker's
 * text IS the source of truth, and pasting it is cheaper and more reliable than
 * probing — which costs real calls.
 *
 * Tolerates the `›` cursor, the ` (default)` / ` (current)` markers, and the
 * trailing description column:
 *
 *     1. gpt-5.6-sol (default)    Reliable agentic workhorse for everyday tasks.
 *   › 2. gpt-5.6-terra (current)  Balanced agentic coding model for everyday work.
 */
function parsePickerModels(text) {
  const out = [];
  for (const raw of String(text || '').split('\n')) {
    const line = raw.replace(/^[\s\u203a>*]+/, '').trim();
    const m = /^\d+\.\s+([A-Za-z0-9][\w.\-]*)/.exec(line);
    if (!m) continue;
    const slug = m[1];
    if (out.indexOf(slug) === -1) out.push(slug);
  }
  return out;
}

function runSyncCatalog(opts) {
  const CS = require('./catalog_sync.js');
  const target = resolveCatalogPath(opts);

  // Roster-referenced slugs, needed by both --remove and the merge.
  let referencedSlugs = [];
  try {
    const rf0 = opts.file || resolveRosterFile(null, {});
    if (rf0 && fs.existsSync(rf0)) {
      const r0 = readRoster(fs.readFileSync(rf0, 'utf8')) || {};
      referencedSlugs = ROLE_ORDER.reduce(function (a, role) { return a.concat(r0[role] || []); }, []);
    }
  } catch (_) { /* no roster yet */ }

  let existing = { providers: [] };
  if (fs.existsSync(target)) {
    try { existing = JSON.parse(fs.readFileSync(target, 'utf8')); }
    catch (err) {
      console.error('❌ ' + target + ' is not valid JSON: ' + err.message);
      console.error('   Refusing to overwrite a file I cannot read — fix or move it first.');
      return 1;
    }
  }

  const known = (existing.providers || []).map(function (p) { return p.provider; });

  // `--add=<list>` is a SCOPED sync: same pipeline, one or more named providers.
  // `--sync-catalog` alongside it is redundant and accepted — --add already
  // implies it for the named providers, while a bare --sync-catalog refreshes
  // everything already in the catalog.
  const scope = (opts.add && opts.add.length) ? opts.add.slice() : null;
  if (opts.remove && opts.remove.length) {
    const gone = [];
    const kept = (existing.providers || []).filter(function (p) {
      if (opts.remove.indexOf(p.provider) === -1) return true;
      const named = (p.models || []).some(function (m) {
        return referencedSlugs.indexOf(typeof m === 'string' ? m : m.slug) !== -1;
      });
      if (named && !opts.force) {
        console.error('❌ ' + p.provider + ' is named by the live roster — pass --force to remove it.');
        return true;
      }
      gone.push(p.provider);
      return false;
    });
    if (gone.length) {
      existing = Object.assign({}, existing, { providers: kept });
      (opts.json ? console.error : console.log)('\n🗑️  removed: ' + gone.join(', '));
    }
  }
  if (scope) {
    const unknownToCatalog = scope.filter(function (p) { return known.indexOf(p) === -1; });
    const catalogPools = (existing.providers || []).map(function (p) { return p.pool; });
    const bad = unknownToCatalog.filter(function (p) { return catalogPools.indexOf(p) === -1 && !PROVIDER_CLI[p]; });
    if (bad.length === scope.length) {
      console.error('❌ Unknown provider(s): ' + bad.join(', '));
      console.error('   Known: ' + (known.join(', ') || '(catalog is empty — run --sync-catalog first)'));
      return 1;
    }
  }
  const found = detect();
  // Hand the pool of each catalogued provider across, so enumerateLive can map
  // a slug prefix back to the NAME this catalog uses (opencode/ -> opencode-zen).
  const poolOfProvider = {};
  for (const p of existing.providers || []) if (p.provider && p.pool) poolOfProvider[p.provider] = p.pool;
  const live = CS.enumerateLive(found, { knownProviders: known, poolOfProvider: poolOfProvider });
  const held = CS.heldFamiliesOf(live.groups);
  for (const g of live.groups) g.models = CS.curate(g.models, { heldFamilies: held });

  // A slug the live roster dispatches to must not be pruned out from under it.
  const referenced = referencedSlugs;

  const merged = CS.mergeCatalog(existing, live, {
    prune: opts.prune, force: opts.force, referenced: referenced, only: scope,
  });

  // ── --from-picker: paste the interactive list instead of probing ─────────
  if (opts.fromPicker) {
    let text = '';
    try {
      text = opts.fromFile ? fs.readFileSync(opts.fromFile, 'utf8') : fs.readFileSync(0, 'utf8');
    } catch (err) {
      console.error('❌ --from-picker needs the picker text on stdin or via --from-file=<path>.');
      return 1;
    }
    const slugs = parsePickerModels(text);
    if (!slugs.length) {
      console.error('❌ No models parsed from the picker text.');
      console.error('   Expected lines like:  1. gpt-5.6-sol (default)   <description>');
      return 1;
    }
    const today = new Date().toISOString().slice(0, 10);
    const targets = scope && scope.length ? scope : Object.keys(CS.NON_ENUMERABLE);
    for (const name of targets) {
      let g = merged.providers.filter(function (p) { return p.provider === name; })[0];
      if (!g) { g = { provider: name, pool: name === 'openai' ? 'chatgpt' : name, cli: PROVIDER_CLI[name] || '', models: [] }; merged.providers.push(g); }
      const autos = (g.models || []).filter(function (m) { return /\(auto\)$/.test(String(typeof m === 'string' ? m : m.slug)); });
      g.models = autos.concat(slugs.map(function (s) {
        return { slug: name === 'openai' ? 'openai/' + s : s, verified: true, checkedAt: today };
      }));
      (opts.json ? console.error : console.log)('\n📋 ' + name + ' — ' + slugs.length + ' models from the picker, marked verified ' + today);
    }
    merged.catalog.providers = merged.providers;
  }

  // ── entitlement probe, --probe ONLY ──────────────────────────────────────
  // Codex cannot enumerate itself, so its group is a candidate list until
  // something confirms it. `--probe` dispatches one trivial call per candidate
  // and stamps `verified` + `checkedAt`, which `detect()` then prefers over the
  // CODEX_VERIFIED seed.
  //
  // ⛔ NEVER under a plain --sync-catalog. Probes are real, billable calls, and
  // a sync that quietly spends money is a sync nobody runs twice.
  if (opts.probe) {
    const today = new Date().toISOString().slice(0, 10);
    for (const g of merged.providers) {
      if (!CS.NON_ENUMERABLE[g.provider]) continue;
      (opts.json ? console.error : console.log)('\n🔎 Probing ' + g.provider + ' — real calls, one per candidate…');
      g.models = (g.models || []).map(function (entry) {
        const slug = typeof entry === 'string' ? entry : entry.slug;
        if (/\(auto\)$/.test(String(slug))) return entry;
        let ok = false;
        try { ok = !!(probeModel(slug, opts.timeout) || {}).ok; } catch (_) { ok = false; }
        (opts.json ? console.error : console.log)('   ' + (ok ? '✅' : '❌') + ' ' + slug);
        const meta = typeof entry === 'string' ? { slug: slug } : Object.assign({}, entry);
        meta.verified = ok;
        meta.checkedAt = today;
        return meta;
      });
    }
    merged.catalog.providers = merged.providers;
  }

  if (opts.json) {
    // Under a SCOPED --add, report only what this invocation touched. The
    // written catalog stays complete — mergeCatalog carries untouched providers
    // through, which is right for the file and wrong for the report: `--add zen`
    // answering with all 8 providers cannot be distinguished from a full sync.
    const reported = scope
      ? merged.providers.filter(function (p) { return scope.indexOf(p.provider) !== -1; })
      : merged.providers;
    console.log(JSON.stringify({ providers: reported, changes: merged.changes }, null, 2));
    return 0;                                   // --json implies no write
  }

  console.log('\n🔄 Catalog sync — ' + target + '\n');
  console.log(CS.diffCatalog(merged.changes));
  if (merged.changes.reported.length) {
    console.log('\nℹ️  Credentialed but not in your catalog — add explicitly if you want them:');
    for (const p of merged.changes.reported) console.log('     wb-flow model --add=' + p);
  }
  for (const p of Object.keys(CS.NON_ENUMERABLE)) {
    if (known.indexOf(p) !== -1) console.log('\n⚠️  ' + p + ': ' + CS.NON_ENUMERABLE[p]);
  }

  if (opts.dryRun) { console.log('\n--dry-run: nothing written.\n'); return 0; }

  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (fs.existsSync(target)) fs.copyFileSync(target, target + '.bak');
    const tmp = target + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(merged.catalog, null, 2) + '\n');
    fs.renameSync(tmp, target);
  } catch (err) {
    console.error('❌ Could not write ' + target + ': ' + err.message);
    return 1;
  }
  console.log('\n✅ ' + target + (fs.existsSync(target + '.bak') ? '   (previous kept as .bak)' : '') + '\n');
  return 0;
}

async function run(argv) {
  const opts = parseArgs(argv || []);
  if (opts.help) { console.log(HELP); return 0; }

  // --sync-catalog writes models.json, not the roster — handled before the
  // roster is even resolved, so a machine with no model_recommendations.md can
  // still fill its catalog.
  if (opts.syncCatalog || (opts.add && opts.add.length) || (opts.remove && opts.remove.length)) return runSyncCatalog(opts);

  const needsWrite = opts.detect || opts.pick || Object.keys(opts.set).length > 0 || opts.probe;
  const file = opts.file || resolveRosterFile(null, { forWrite: needsWrite });
  if (!file) {
    console.error('❌ No model_recommendations.md found. Run `wb-flow init` first,');
    console.error('   or pass --file=<path>.');
    return 1;
  }
  const text = fs.readFileSync(file, 'utf8');
  const current = readRoster(text);

  // Plain `wb-flow model` — report and stop.
  if (!opts.detect && !opts.pick && !Object.keys(opts.set).length && !opts.probe) {
    if (opts.json) { console.log(JSON.stringify({ file: file, roster: current }, null, 2)); return 0; }
    console.log('\n📋 Roster: ' + file + '\n');
    for (const role of ROLE_ORDER) {
      console.log('  ' + ROLE_META[role].label.replace(/\*\*/g, '').padEnd(16)
        + ((current && current[role] || []).join(' / ') || '—'));
    }
    console.log('\n  `wb-flow model --detect`      to re-derive from installed CLIs');
    console.log('  `wb-flow model --probe`       to verify selected active models');
    console.log('  `wb-flow model --probe --all` to verify ALL models in catalog\n');
    return 0;
  }

  let roster = current || {};
  const meta = { date: new Date().toISOString().slice(0, 10), unreachable: [] };

  if (opts.detect) {
    const found = detect();
    console.log('\n🔍 Detected:');
    if (found.opencode) console.log('   opencode — ' + found.opencode.credentialed + ' credentialed of ' + found.opencode.total + ' catalogued');
    else console.log('   opencode — not installed');
    if (found.agy) console.log('   agy      — ' + found.agy.models.length + ' models (dispatchable: `agy -p --model …`)');
    else console.log('   agy      — not installed');
    if (found.codex) {
      console.log('   codex    — ' + found.codex.models.length + ' candidates, '
        + found.codex.verified.length + ' verified (dispatchable: `codex exec -m …`)');
      console.log('              ⚠️  codex cannot list its own models — this is a curated list,');
      console.log('                  not a query. Run with --probe to see what your plan serves.');
    } else console.log('   codex    — not installed');
    if (found.grok) console.log('   grok     — ' + found.grok.models.length + ' models (dispatchable: `grok --model …`)');
    else console.log('   grok     — not installed');
    console.log('   claude   — ' + (found.claude ? 'present (eligible as in-session root)' : 'not installed'));
    if (found.providers.length) console.log('   credentials: ' + found.providers.join(', '));
    roster = proposeRoster(found);
  }

  for (const role of Object.keys(opts.set)) roster[role] = opts.set[role];

  if (opts.probe && !opts.pick) {
    const customObj = loadCustomModels(opts);
    // Catalog index — WITHOUT it every namespaced slug is re-derived from the
    // string and anthropic/* + openai/* report a phantom "Insufficient balance".
    // This branch used to omit it while the --pick branch passed it, so the two
    // paths disagreed about which models were reachable.
    const catIdx = catalogIndex(customObj);
    let targets;
    if (opts.all) {
      const sel = selectProbeTargets(getAllCatalogModels(customObj, roster), opts.all, catIdx);
      if (sel.error) { console.log('\n❌ ' + sel.error + '\n'); return 0; }
      targets = sel.targets;
    } else {
      targets = Array.from(new Set(ROLE_ORDER.reduce((a, r) => a.concat(roster[r] || []), [])));
    }

    console.log('\n🛰️  Probing ' + targets.length + ' model(s), ' + opts.timeout + 'ms each…');
    for (const slug of targets) {
      const res = probeModel(slug, opts.timeout, catIdx);
      const tag = qualifyModel(slug);
      const R = res.route || resolveCli(slug, catIdx);
      const via = (R.provider || '—') + ' via ' + (R.cli || '?') + (R.source === 'heuristic' ? '?' : '');
      if (res.skipped) { console.log('   • ' + slug.padEnd(44) + ' — ' + via + ' — ' + tag + ' — skipped (' + res.skipped + ')'); continue; }
      const substituted = !res.ok && /requested model not selected|using [A-Z]/i.test(res.why || '');
      const mark = res.ok ? '✅ ' : (substituted ? '⚠️  ' : '❌ ');
      console.log('   ' + mark + slug.padEnd(44) + ' — ' + via + ' — ' + tag
        + (res.ok ? '' : ' — (' + (res.why || 'failed') + ')'));
      if (!res.ok) meta.unreachable.push(slug);
    }
    meta.probed = true;
  }

  if (opts.pick) {
    if (!canPrompt(opts)) {
      console.error('❌ --pick needs a TTY. In CI use --detect, or --set <role>=<slug>.');
      return 1;
    }
    const found = opts.detect ? detect() : detect();
    const customObj = loadCustomModels(opts);
    if (customObj) {
      console.log('\n📄 Using custom models catalog: ' + customObj.filepath);
    }

    let probeResults = null;
    if (opts.probe && opts.all) {
      const allCatalog = getAllCatalogModels(customObj, roster);
      const catIdx = catalogIndex(customObj);

      // Same selector the non-pick branch uses — one definition of what
      // --all / --all=raw / --all=<role> / --all=<provider> mean.
      const sel = selectProbeTargets(allCatalog, opts.all, catIdx);
      if (sel.error) {
        console.log('\n❌ ' + sel.error + '\n');
      } else {
        const targetCatalog = sel.targets;
        const grouped = sel.grouped;
        console.log('\n🛰️  Pre-probing ' + targetCatalog.length + ' model(s)'
          + (sel.filter ? ' [' + sel.mode + '=' + sel.filter + ']' : '')
          + ' to verify reachability & balance…');
        if (grouped) console.log('   (buffered — grouped by role, reachable first)');
        else console.log('   ' + 'MODEL'.padEnd(44) + ' ' + 'PROVIDER'.padEnd(15) + ' ' + 'CLI'.padEnd(11) + ' ROLE');

        probeResults = new Map();
        let okCount = 0;
        let subCount = 0;
        const buckets = {};
        const notReached = [];

        for (const slug of targetCatalog) {
          const res = probeModel(slug, opts.timeout, catIdx);
          const tag = qualifyModel(slug);
          const R = res.route || resolveCli(slug, catIdx);
          const via = (R.cli || '?') + (R.source === 'heuristic' ? '?' : '');
          const prov = (R.provider || '—') + (R.pool ? '/' + R.pool : '');
          const cols = slug.padEnd(44) + ' ' + String(prov).padEnd(15) + ' ' + String(via).padEnd(11) + ' ' + tag;

          if (res.skipped) {
            probeResults.set(slug, { ok: res.ok, why: res.why, skipped: res.skipped, tag: tag, route: R });
            if (!grouped) console.log('   • ' + cols + ' — skipped (' + res.skipped + ')');
            continue;
          }

          const substituted = !res.ok && /requested model not selected|using [A-Z]/i.test(res.why || '');
          probeResults.set(slug, { ok: res.ok, why: res.why, skipped: res.skipped, tag: tag, route: R, substituted: substituted });
          if (!res.ok && meta.unreachable.indexOf(slug) === -1) meta.unreachable.push(slug);

          let lineOut;
          if (res.ok) { okCount++; lineOut = '   ✅ ' + cols; }
          else if (substituted) { subCount++; lineOut = '   ⚠️  ' + cols + ' — substituted: ' + res.why; }
          else { lineOut = '   ❌ ' + cols + (res.why ? ' — (' + res.why + ')' : ''); }

          if (!grouped) { console.log(lineOut); continue; }
          // Grouped view: reachable models are bucketed by role. Substituted
          // ones are listed separately rather than silently dropped — the
          // footer used to count them without ever saying which they were.
          if (res.ok) { (buckets[tag] = buckets[tag] || []).push(lineOut); }
          else if (substituted) { notReached.push(lineOut); }
        }

        if (grouped) {
          console.log('\n   ' + 'MODEL'.padEnd(44) + ' ' + 'PROVIDER'.padEnd(15) + ' ' + 'CLI'.padEnd(11) + ' ROLE');
          for (const line of renderGrouped(buckets)) console.log(line);
          if (notReached.length) {
            console.log('');
            for (const line of notReached) console.log(line);
          }
        }

        console.log('\n   ✓ Probed: ' + okCount + ' of ' + targetCatalog.length
          + ' models verified reachable with sufficient balance.'
          + (subCount ? '  ⚠️  ' + subCount + ' answered as a different model and were NOT counted.' : ''));
        if (grouped) console.log('   Unreachable models are hidden here — run --all=raw to see them.');
        console.log('   A `?` after the CLI means the route was guessed from the slug, not read from the catalog.\n');
      }
    }

    // Named `selectedProviders`, NOT `activeProviders`: the module-level helper
    // of that name is called a few lines below, and a `let` in this scope
    // shadows it for the WHOLE block — so `activeProviders()` threw
    // "activeProviders is not a function" and Step 0 could not run at all.
    // Invisible to a --yes install, which never reaches the interactive branch.
    let selectedProviders = null;
    const masterProviders = customObj && (customObj.masterProviders || (customObj.raw && customObj.raw.providers));

    if (masterProviders && Array.isArray(masterProviders) && masterProviders.length && process.stdin.isTTY) {
      const step0Title = 'Step 0 — Select your active provider subscriptions';
      const step0Items = masterProviders.map((p) => {
        const pool = p.pool || (p.models && p.models[0] ? poolOf(p.models[0]) : 'unknown');
        return {
          value: p.provider,
          display: '💳 📁 ' + p.provider.padEnd(26) + '[' + pool + ']',
        };
      });

      // DERIVED, never a literal. The old array named `google` (a provider that
      // does not exist in the catalog — the `gemini` CLI is dead) and omitted
      // `opencode-zen`, so a Zen subscriber had to hand-check it on every run
      // while a dead provider was pre-checked for everyone. That is defect #5,
      // and it is the same shape as SUBSCRIPTION_POOLS and CODEX_VERIFIED.
      //
      // Order of preference:
      //   1. what THIS user persisted last time  (selected.json.providers)
      //   2. else every catalog provider this machine has a credential for
      //   3. else everything, so a first run is not an empty checklist
      const persisted = activeProviders();
      const credentialed = (found.providers || []).map(function (d) {
        return String(d).toLowerCase().replace(/\s+/g, '-');
      });
      const preferred = persisted && persisted.length
        ? persisted
        : masterProviders
            .map(function (p) { return p.provider; })
            .filter(function (name) {
              const key = String(name).toLowerCase();
              return credentialed.some(function (c) { return c === key || c.indexOf(key) !== -1 || key.indexOf(c) !== -1; });
            });
      const defaultIndexes = masterProviders
        .map((p, idx) => (preferred.indexOf(p.provider) !== -1 ? idx : -1))
        .filter((idx) => idx !== -1);

      // A provider in the catalog that the persisted selection does not enable
      // is invisible otherwise — the exact way opencode-zen stayed off.
      if (persisted && persisted.length) {
        for (const p of masterProviders) {
          if (persisted.indexOf(p.provider) === -1) {
            console.log('   ℹ️  ' + p.provider + ' is in your catalog but not enabled — press Space to turn it on.');
          }
        }
      }

      const chosenIndexes = await checkboxPick(step0Title, step0Items, defaultIndexes.length ? defaultIndexes : masterProviders.map((_, i) => i));
      selectedProviders = chosenIndexes.map((idx) => step0Items[idx].value);
      if (selectedProviders.length) {
        console.log('   ✓ Enabled subscriptions: ' + selectedProviders.join(', '));
      }
    }

    console.log('\n🎛️  Pick a chain per role. Each link should draw from a DIFFERENT');
    console.log('   billing pool — three models on one subscription is one point of');
    console.log('   failure wearing three hats.');
    const io = prompter();
    try {
      const base = Object.keys(roster).length ? roster : proposeRoster(found);
      // When a probe ran, its results outrank `proposeRoster(found)`: detection
      // only proves a credential exists, the probe proves the model answered.
      // So the models the probe just listed under a role become that role's
      // pre-checked default chain, tier-collapsed to one entry per stem.
      const pickIdx = catalogIndex(customObj);
      for (const role of ROLE_ORDER) {
        const fromProbe = suggestFromProbe(role, probeResults, selectedProviders, pickIdx);
        roster[role] = await pickRole(io, role, found, fromProbe || base[role] || [], meta.unreachable || [], customObj, selectedProviders, probeResults);
      }
    } catch (err) {
      if (err && err.wbAbort) { console.log('\n\nAborted — input closed. Nothing was written.'); return 1; }
      throw err;
    } finally { io.close(); }

    saveSelectedRoster(roster, Object.assign({}, opts, { providers: selectedProviders }));
  }

  if (opts.json) { console.log(JSON.stringify({ file: file, roster: roster, meta: meta }, null, 2)); return 0; }

  const next = writeRosterInto(text, roster, meta);
  if (opts.dryRun) {
    console.log('\n📋 DRY RUN — would write to ' + file + ':\n');
    console.log(renderRosterTable(roster, meta));
    return 0;
  }
  fs.writeFileSync(file, next);
  console.log('\n✅ Roster written to ' + file);
  console.log('   Change it later:  wb-flow model --pick              (interactive)');
  console.log('                     wb-flow model --set worker=<slug>');
  console.log('                     /wbModel --worker="…"             (from a chat session)');
  const selectedUnreachable = meta.unreachable.filter((slug) =>
    ROLE_ORDER.some((role) => (roster[role] || []).indexOf(slug) !== -1));
  if (selectedUnreachable.length) {
    console.log('⚠️  ' + selectedUnreachable.length + ' selected model(s) did not answer — the table marks them.');
  } else if (opts.probe && opts.all && meta.unreachable.length) {
    console.log('⚠️  ' + meta.unreachable.length + ' unreachable catalog model(s) were excluded from selection.');
  }
  return 0;
}

module.exports = {
  run, detect, proposeRoster, pickForRole, renderRosterTable, readRoster, loadCustomModels,
  writeRosterInto, probeModel, probeResponseError, probeResponseText, extractProbeError, resolveRosterFile, familyOf, versionRank, credentialedPrefixes, pickRole, candidatesFor, IN_SESSION, isInSession, autoAliasForProvider, buildRoleTreeFromProviders, laneOf, poolOf, poolRank, POOL_RANK_FALLBACK, POOL_RANK: POOL_RANK_FALLBACK, NOT_A_CHAT_MODEL, AGY_PREFERENCE, agyRank,
  ROLE_ORDER, ROLE_PREFERENCE, AGY_ONLY, ROSTER_HEADING,
  CODEX_ONLY, CODEX_CANDIDATES, CODEX_VERIFIED,
  resolveCli, catalogIndex, PROVIDER_CLI, dispatchFor, isSubscription, persistedCodexVerified, saveSelectedRoster, parsePickerModels, resolveProviderName, splitProviderList, poolRank, activeProviders, _setActiveProviders,
  hasCLI, tryExec, DEFAULT_ENUM_TIMEOUT_MS,
  selectProbeTargets, renderGrouped, ROLE_TAGS, qualifyModel, getAllCatalogModels,
  collapseTiers, suggestFromProbe, TAG_ROLES,
};

if (require.main === module) {
  run(process.argv.slice(2))
    .then(function (code) { process.exit(code || 0); })
    .catch(function (err) {
      console.error('❌ ' + (err && err.message ? err.message : err));
      process.exit(1);
    });
}

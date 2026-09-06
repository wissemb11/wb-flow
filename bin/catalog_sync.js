'use strict';
/**
 * bin/catalog_sync.js — the pure core of `wb-flow model --sync-catalog` / `--add`.
 *
 * Spec: docs/_specs/catalog_sync.md (plan_next_20260902 task 1).
 *
 * PURITY IS THE POINT, not a style preference. This module performs no file
 * I/O, starts no child processes and prints nothing. All of that lives in
 * bin/model.js. The reason is testability: the suite has to run the merge
 * against fixtures on a machine with no CLIs installed at all, and a module
 * that shells out cannot be tested without the very subscriptions it exists to
 * handle.
 *
 *   enumerateLive(detectResult, opts) -> { groups, reported }
 *   curate(models, opts)              -> models[]        (filtered, ranked, capped)
 *   mergeCatalog(existing, live, opts)-> { providers, changes }
 *   diffCatalog(changes)              -> string          (a markdown table)
 *
 * Pool classification is imported from model.js rather than re-derived. A
 * second pool classifier re-opens A15 ("`model --show` and `wave` resolve the
 * roster by two different algorithms and read two different files"), closed on
 * 2026-08-15 by giving them one shared resolver.
 */

const M = require('./model.js');

// Flat-rate pools. Passed in by the caller once task 5 makes this derived from
// the user's own persisted selection; this literal is only the fallback for a
// bare install, and is deliberately the ONLY place a pool name is hard-coded.
const DEFAULT_SUBSCRIPTION_POOLS = ['claude-pro', 'google-one', 'opencode-go', 'chatgpt', 'supergrok'];

/** Providers whose catalog no CLI can enumerate — see spec §6. */
const NON_ENUMERABLE = { openai: 'codex models is interactive-only — use --add codex --from-picker' };

const DEFAULT_CAP = 12;

// ── enumerateLive ────────────────────────────────────────────────────────────

/**
 * Map a `detect()` result into per-provider groups.
 *
 * `detect()` gives `slugs` (every opencode-visible model, provider-prefixed),
 * `agy.models` and `grok.models` (bare names), plus `providers` — the
 * CREDENTIALED provider display names, which is not the same thing as
 * subscribed. Anything credentialed but absent from the catalog is *reported*
 * and never auto-added (spec §2): a fallback slot is reached exactly when
 * nobody is watching, so a silent addition becomes a silent bill.
 */
function enumerateLive(detectResult, opts) {
  const d = detectResult || {};
  const o = opts || {};
  const known = new Set(o.knownProviders || []);
  const byProvider = new Map();

  // `agy models` and `grok models` print "<slug>\t<Display Name>" — taking the
  // whole line made the slug `gemini-3.7-flash-high\tGemini 3.7 Flash (High)`,
  // which poolOf() could not classify (pool "unknown"), which in turn emptied
  // the held-family set and disabled the §4 flat-rate dedupe entirely. One
  // unsplit tab, three failures downstream, none of them visible to the oracle.
  const slugOf = function (line) { return String(line).split(/[\t]/)[0].trim(); };

  // Resolve the group's provider NAME the catalog uses, not the slug prefix.
  //
  // They differ, and the difference is the §1 naming hazard biting this very
  // function: pool `opencode-zen` serves slugs prefixed `opencode/`. Keyed by
  // prefix, "opencode" never matched the catalog's "opencode-zen", so Zen was
  // reported as an unknown provider instead of synced — the sync could never
  // fill the one metered pool the owner actually holds. Prefer a catalog
  // provider whose POOL matches; fall back to the prefix for a genuinely new one.
  const poolToName = new Map();
  for (const name of known) {
    const p = (o.poolOfProvider && o.poolOfProvider[name]) || null;
    if (p) poolToName.set(p, name);
  }
  const nameFor = function (prefix, slug) {
    const pool = M.poolOf(slug);
    if (poolToName.has(pool)) return poolToName.get(pool);
    if (known.has(pool)) return pool;
    return prefix;
  };

  const push = function (rawProvider, slug, source) {
    const provider = nameFor(rawProvider, slug);
    if (!provider || !slug) return;
    if (!byProvider.has(provider)) {
      byProvider.set(provider, { provider: provider, pool: M.poolOf(slug), models: [], source: source });
    }
    const g = byProvider.get(provider);
    if (g.models.indexOf(slug) === -1) g.models.push(slug);
  };

  for (const slug of d.slugs || []) {
    const i = String(slug).indexOf('/');
    if (i === -1) continue;
    push(String(slug).slice(0, i), slug, 'opencode models');
  }
  for (const line of (d.agy && d.agy.models) || []) push('antigravity', slugOf(line), 'agy models');
  for (const line of (d.grok && d.grok.models) || []) push('xai', 'xai/' + slugOf(line).replace(/^xai\//, ''), 'grok models');

  // Codex cannot list itself. Carry the persisted/seed set through so a sync
  // never blanks the group, and mark it so the caller can say why.
  if (d.codex) {
    for (const name of d.codex.verified || d.codex.models || []) {
      push('openai', 'openai/' + String(name).replace(/^openai\//, ''), 'seed (not enumerable)');
    }
  }

  // §2 — credentialed is not subscribed. A provider the catalog does not list
  // is REPORTED and never returned as a group, so mergeCatalog cannot add it.
  //
  // The first version of this reported nothing at all: it compared `d.providers`
  // display names against `known` but skipped anything that had produced a
  // group — and every credentialed provider produces a group, because they all
  // appear in `opencode models`. So the check could only ever fire for a
  // provider with zero models, and `nvidia` (101 slugs), `openrouter` (354),
  // `google` (37) and `groq` (16) would all have been auto-added silently.
  const reported = [];
  const groups = [];
  for (const g of byProvider.values()) {
    if (known.size && !known.has(g.provider)) {
      if (reported.indexOf(g.provider) === -1) reported.push(g.provider);
      continue;
    }
    groups.push(g);
  }

  return { groups: groups, reported: reported };
}

// ── curate ───────────────────────────────────────────────────────────────────

/**
 * 691 raw slugs must become a list a human can pick from. Every step already
 * exists in model.js; this composes them rather than inventing ranking.
 * Order matters and is spec §3.
 */
function curate(models, opts) {
  const o = opts || {};
  const cap = o.cap || DEFAULT_CAP;
  const subs = new Set(o.subscriptionPools || DEFAULT_SUBSCRIPTION_POOLS);
  const heldFamilies = o.heldFamilies instanceof Set ? o.heldFamilies : new Set(o.heldFamilies || []);

  let out = (models || []).filter(function (s) { return s && !M.NOT_A_CHAT_MODEL.test(String(s)); });

  // Demo and free-tier noise. Two self-describing signals, no name list:
  //
  //   1. an explicit `-free` suffix — the provider says so itself
  //      (ling-3.0-flash-fin-free, mimo-v2.5-free, nemotron-*-free, …)
  //   2. NO VERSION TOKEN anywhere in the tail — every production model carries
  //      one (deepseek-v4-pro, glm-5.2, kimi-k2.6, qwen3.6-plus, minimax-m3);
  //      `big-pickle` does not, because it is a codename for a preview.
  //
  // Rank alone is not the signal: `kimi-k2.6` matches no ROLE_PREFERENCE pattern
  // either, and it is a model worth routing to. Versioning separates a product
  // from a demo where ranking does not.
  out = out.filter(function (s) {
    const tail = String(s).split('/').pop();
    if (/-free$/i.test(tail)) return false;
    return /\d/.test(tail);
  });

  // §4 — the flat-rate dedupe, and the rule with the largest cost consequence.
  // A metered model whose family is ALREADY served by a flat-rate pool the user
  // holds is dropped: identical capability, a bill instead of a subscription.
  // Derived from the caller's own held pools, never a hard-coded blocklist — a
  // user WITHOUT Claude Pro must keep opencode/claude-opus-5, because for them
  // it is the only route to Opus rather than a duplicate.
  if (heldFamilies.size) {
    out = out.filter(function (s) {
      const pool = M.poolOf(s);
      if (subs.has(pool)) return true;              // itself flat-rate — keep
      return !heldFamilies.has(M.familyOf(s));      // metered duplicate — drop
    });
  }

  out = M.collapseTiers(out);

  const rank = function (s) {
    const tail = String(s).split('/').pop();
    let best = 999;
    for (const role of Object.keys(M.ROLE_PREFERENCE || {})) {
      const pats = M.ROLE_PREFERENCE[role] || [];
      for (let i = 0; i < pats.length; i++) {
        const p = pats[i];
        const hit = p instanceof RegExp ? p.test(tail) : String(tail).indexOf(String(p)) !== -1;
        if (hit && i < best) best = i;
      }
    }
    return best;
  };
  out = out.slice().sort(function (a, b) { return rank(a) - rank(b); });

  return out.slice(0, cap);
}

/** The families a set of flat-rate pools already covers — input to curate()'s §4. */
function heldFamiliesOf(groups, subscriptionPools) {
  const subs = new Set(subscriptionPools || DEFAULT_SUBSCRIPTION_POOLS);
  const fams = new Set();
  for (const g of groups || []) {
    if (!subs.has(g.pool)) continue;
    for (const s of g.models || []) fams.add(M.familyOf(s));
  }
  return fams;
}

// ── mergeCatalog ─────────────────────────────────────────────────────────────

/**
 * Three-way merge, keyed on SLUG (never array position). Returns a new object;
 * `existing` and `live` are not touched — task 3's suite deep-equals the inputs
 * afterwards to prove it.
 *
 * retire != prune. The default MARKS a slug that left the enumeration, because
 * a model missing from one run is more often a transient CLI failure than a
 * real removal — an empty exec result must never read as "the provider serves
 * nothing". `--prune` deletes, and both refuse a slug the live roster still
 * dispatches to unless `force` is set: deleting one would break routing at the
 * next wave, hours after the sync that caused it.
 */
function mergeCatalog(existing, live, opts) {
  const o = opts || {};
  const today = o.now || new Date().toISOString().slice(0, 10);
  const referenced = new Set(o.referenced || []);
  const only = o.only && o.only.length ? new Set(o.only) : null;

  const changes = { add: [], keep: [], retire: [], pin: [], refused: [], reported: (live && live.reported) || [] };
  const liveByProvider = new Map();
  for (const g of (live && live.groups) || []) liveByProvider.set(g.provider, g);

  const providers = [];
  const seen = new Set();

  for (const prev of (existing && existing.providers) || []) {
    const name = prev.provider;
    seen.add(name);
    const g = liveByProvider.get(name);

    // Out of scope for a scoped --add: carry the group through untouched.
    if (only && !only.has(name)) { providers.push(Object.assign({}, prev)); continue; }
    // Non-enumerable, or simply absent from this run: never blank a group.
    if (!g) { providers.push(Object.assign({}, prev)); continue; }

    const prevModels = (prev.models || []).slice();
    const liveSet = new Set(g.models || []);
    const next = [];

    for (const entry of prevModels) {
      const slug = typeof entry === 'string' ? entry : entry.slug;
      const meta = typeof entry === 'string' ? {} : entry;
      const isAuto = /\(auto\)$/.test(String(slug));
      if (meta.pinned) { changes.pin.push(slug); next.push(entry); continue; }
      if (isAuto || liveSet.has(slug)) { changes.keep.push(slug); next.push(entry); continue; }
      if (referenced.has(slug) && !o.force) {
        changes.refused.push(slug + ' (named by the live roster — pass --force)');
        next.push(entry);
        continue;
      }
      if (o.prune) { changes.retire.push(slug + ' (pruned)'); continue; }
      changes.retire.push(slug);
      next.push(typeof entry === 'string' ? { slug: slug, retired: today } : Object.assign({}, entry, { retired: today }));
    }

    const have = new Set(next.map(function (e) { return typeof e === 'string' ? e : e.slug; }));
    for (const slug of g.models || []) {
      if (have.has(slug)) continue;
      changes.add.push(slug);
      next.push(slug);
    }

    providers.push(Object.assign({}, prev, { models: next }));
  }

  for (const g of (live && live.groups) || []) {
    if (seen.has(g.provider)) continue;
    if (only && !only.has(g.provider)) continue;
    for (const slug of g.models || []) changes.add.push(slug);
    providers.push({ provider: g.provider, pool: g.pool, cli: g.cli || '', models: (g.models || []).slice() });
  }

  const out = Object.assign({}, existing || {}, { providers: providers, syncedAt: today });
  delete out.seed;
  return { providers: providers, changes: changes, catalog: out };
}

// ── diffCatalog ──────────────────────────────────────────────────────────────

/** Render the merge as a markdown table. Returns a string; prints nothing. */
function diffCatalog(changes) {
  const c = changes || {};
  const rows = [
    ['add', (c.add || []).length],
    ['keep', (c.keep || []).length],
    ['pin', (c.pin || []).length],
    ['retire', (c.retire || []).length],
    ['refused', (c.refused || []).length],
    ['reported', (c.reported || []).length],
  ];
  const L = ['| Verdict | Count |', '|---|---|'];
  for (const [k, n] of rows) L.push('| ' + k + ' | ' + n + ' |');
  for (const key of ['add', 'retire', 'refused', 'reported']) {
    const list = c[key] || [];
    if (!list.length) continue;
    L.push('');
    L.push('**' + key + ':** ' + list.join(', '));
  }
  return L.join('\n');
}

module.exports = {
  enumerateLive, curate, mergeCatalog, diffCatalog,
  heldFamiliesOf, DEFAULT_SUBSCRIPTION_POOLS, NON_ENUMERABLE, DEFAULT_CAP,
};

---
title: "Catalog Sync — Design Spec"
description: "How `wb-flow model --sync-catalog` and `--add` turn a live CLI enumeration into models.json without clobbering user intent."
---

# Catalog Sync — Design Spec

> **Status:** accepted · **Date:** 2026-09-02 · **Author:** Claude Opus 5 (Planner)
> **Origin:** `plan_next_20260902.md` task 1 *(internal plan file — not published with the docs)*
> **Implements:** tasks 2–8, 15–17 · **Concept background:** [model-fallback-chains.md](../concepts/model-fallback-chains.md)

---

## 0 · The problem, in one sentence

`bin/model.js` already **enumerates** every installed CLI — `detect()` reads `opencode models`,
`opencode providers list`, `agy models`, `grok models` — and then throws that away for the catalog:
`models.json` is a hand-maintained snapshot with **no writer**. Adding a subscription is a JSON edit.

Everything below exists to make it a command instead, without turning the picker into a dump of 691
slugs or silently spending money the user did not agree to.

---

## 1 · Source precedence — where a provider's truth comes from

One source per provider, and only one. A provider with two sources has two versions of the truth.

| Provider | Enumerated by | Notes |
|---|---|---|
| `opencode`, `opencode-go`, `opencode-zen`, `openrouter` | `opencode models` | 691 slugs; the prefix selects the pool |
| `antigravity` | `agy models` | 11 today, including the `gemini-3.7-flash-*` generation |
| `xai` | `grok models` | 2 |
| `anthropic` | **curated constant** | the CLI has no catalog subcommand |
| `openai` / Codex | ⛔ **not enumerable — see §6** | `codex models` is interactive-only |

> ⚠️ **The pool name is not the slug prefix.** Pool `opencode-zen` serves slugs prefixed
> **`opencode/`**; pool `opencode-go` serves **`opencode-go/`**. The pool *without* the qualifier is
> the **metered** one. So `opencode/deepseek-v4-pro` and `opencode-go/deepseek-v4-pro` are the same
> model on opposite billing models. This has already put a metered twin at a Worker head while the
> flat-rate twin sat unselected — treat it as a naming hazard, not a detail.

---

## 2 · Credentialed ≠ subscribed

`opencode providers list` reports **11** credentialed providers on a developer machine, including
`ollama`, `nvidia`, `llama`, `deepseek` and `openrouter`. Holding a credential is not consent to
route work there.

**Rule:** a provider that is credentialed but **absent from the catalog** is *reported*, never
auto-added. It lands in `changes.reported[]`, is printed as a suggestion, and enters the catalog only
via an explicit `--add <name>`.

**Why this is not merely tidy:** an auto-added provider takes a fallback slot, and a fallback slot is
reached exactly when the primaries are exhausted — i.e. when nobody is watching. A silent addition
becomes a silent bill.

---

## 3 · Curation — 691 slugs must become a usable list

Applied per provider, in order. Every step already exists in `bin/model.js`; sync composes them
rather than inventing ranking.

1. **`NOT_A_CHAT_MODEL`** (line 231) drops image / vision / embedding / tts / audio / rerank /
   moderation / guard variants.
2. **`familyOf()`** (line 434) groups siblings.
3. **`collapseTiers()`** (line 1501) folds superseded versions — `glm-5`, `glm-5.1` → `glm-5.2`.
4. **Flat-rate dedupe** — see §4.
5. **`ROLE_PREFERENCE`** (line 110) ranks what survives.
6. **Cap ≤ 12 per provider**, newest version first within a family.

**Worked example — `opencode-zen`, 62 slugs:**

| Step | Remaining |
|---|---|
| raw catalog | 62 |
| after flat-rate dedupe (§4) | 18 |
| after dropping free/demo tiers | 11 |
| after `collapseTiers()` | **5** |

Survivors: `deepseek-v4-flash`, `glm-5.2`, `kimi-k2.6`, `minimax-m3`, `qwen3.6-plus`.

---

## 4 · Flat-rate dedupe — the rule with the largest cost consequence

**A metered model whose family is already served by a flat-rate pool the user holds is dropped.**

`SUBSCRIPTION_POOLS` (`model.js:184` region) names the flat-rate pools; `opencode-zen` and
`openrouter` are metered. Zen resells the major subscriptions at list price — `claude-fable-5` at
**$10/$50 per Mtok**, `claude-opus-5` at $5/$25, `gpt-5.5` at $5/$30, `grok-4.6` at $2/$6,
`gemini-3.1-pro` at $2/$12. **44 of Zen's 62 slugs are in that class.** Routing to them is pure loss:
identical capability, a bill instead of a subscription.

⛔ **Derive the rule from the user's own held pools. Never hard-code a blocklist.** A user *without*
Claude Pro should keep `opencode/claude-opus-5` — for them it is not a duplicate, it is the only way
to reach Opus at all. A name-based blocklist would be defects #3, #5 and #7 in a new file.

**Corollary for chain ordering:** when a metered entry does survive, it goes **last**. A metered tail
is reached only when every flat-rate pool is exhausted, so it should be the *cheapest* model that can
still do the role — not the most capable.

---

## 5 · Merge semantics

`mergeCatalog(existing, live, opts)` returns `{ providers, changes }` and **never mutates its
inputs**. Keyed on **slug**, not on array position.

| Verdict | When | Effect |
|---|---|---|
| `add` | in `live`, not in `existing` | appended |
| `keep` | in both | existing entry retained, including its flags |
| `retire` | in `existing`, not in `live` | marked `"retired": "<ISO date>"`; **not deleted** |
| `pin` | `"pinned": true` | immune to retire **and** to `--prune` |
| `reported` | credentialed provider absent from the catalog | listed, never added (§2) |

**Retire ≠ prune.** The default marks; `--prune` deletes. **Both refuse** to touch a slug referenced
by `selected.json` or `model_recommendations.md` without `--force` — deleting a model the live roster
dispatches to would break routing at the next wave, hours after the sync that caused it.

**Why retire rather than delete by default:** a model missing from one enumeration is more often a
transient CLI failure than a real removal. `tryExec` returning empty must never look like "the
provider serves nothing."

---

## 6 · Codex — the provider that cannot be enumerated

Measured 2026-09-02:

```
$ codex models
Error: stdin is not a terminal

$ script -qfc 'codex models' out.raw   # a real pty
(renders nothing, exit 0)
```

The subcommand exists; it is **interactive-only**. So `--add codex` cannot enumerate and needs a
second path. Two, both explicit:

- **`--add codex --from-picker`** — reads the interactive picker's lines from **stdin** or
  `--from-file=`, parsing `N. <slug>  <description>` and tolerating the ` (default)` / ` (current)`
  markers and the `›` cursor. **This is the default answer**: free, repeatable, no API calls.
- **`--add codex --probe`** — dispatches one trivial `codex exec …` per candidate and keeps what
  answers. ⚠️ **Costs real calls.** Never runs under a bare `--add` or `--sync-catalog`.

Both persist `"verified": true|false` and `"checkedAt": "<ISO date>"` per model. `detect()` reads the
**persisted** set, falling back to `CODEX_VERIFIED` only when no `checkedAt` exists.

**`CODEX_VERIFIED` is wrong today** and demotes to a first-run seed:

| Codex Plus serves | In `CODEX_VERIFIED`? | In the shipped seed? |
|---|---|---|
| `gpt-5.6-sol` *(the default)* | ❌ **missing** | ✅ |
| `gpt-5.6-terra` | ✅ | ✅ |
| `gpt-5.6-luna` | ✅ | ✅ |
| `gpt-5.5` | ✅ | ✅ |
| `gpt-5.4` | ❌ **missing** | ❌ |
| `gpt-5.4-mini` | ✅ | ❌ |
| — | — | `gpt-5.3-codex` → **phantom, not entitled** |

It omits Codex's **own default model** and advertises one the plan does not serve.

---

## 7 · The shipped seed is a skeleton

Not the current file — `core/templates/models.json` is **byte-identical** to a developer's personal
`~/.wb/models.json` (2 146 B, `diff -q` clean), so a fresh installer without Claude Pro receives a
roster naming `anthropic/claude-opus-5` and loses every dispatch at G1 with *Model not found*. And
not an empty `{}` either: `--add <name>` must resolve name → CLI → pool, and with no catalog that map
would have to be hard-coded in `model.js` — the same defect class, relocated.

**Ship the provider index with empty model lists:**

```json
{ "seed": true,
  "providers": [
    { "provider": "anthropic",    "pool": "claude-pro",    "cli": "claude",   "models": ["Claude (auto)"] },
    { "provider": "openai",       "pool": "chatgpt",       "cli": "codex",    "models": ["Codex (auto)"] },
    { "provider": "xai",          "pool": "supergrok",     "cli": "grok",     "models": ["Grok (auto)"] },
    { "provider": "antigravity",  "pool": "google-one",    "cli": "agy",      "models": ["Antigravity (auto)"] },
    { "provider": "opencode-go",  "pool": "opencode-go",   "cli": "opencode", "models": [] },
    { "provider": "opencode-zen", "pool": "opencode-zen",  "cli": "opencode", "models": [] }
  ] }
```

The skeleton carries **names**; `--add` supplies **models**. `(auto)` aliases are provider-level, not
subscription-level, so they are safe to ship.

---

## 8 · `--add` takes a list, and is per-provider transactional

```bash
wb-flow model --add=claude,codex,grok,opencode
```

Accepts the provider name **or** its pool alias (`codex` ≡ `openai`, `zen` ≡ `opencode-zen`,
`agy` ≡ `antigravity`) — what a user actually types.

**`--sync-catalog` alongside `--add` is redundant but accepted.** `--add=<list>` implies a sync of the
named providers; bare `--sync-catalog` refreshes everything already in the catalog. Two flags, two
scopes, idempotent together.

⚠️ **Per-provider transactional, never all-or-nothing.** That example contains `codex`, which cannot
enumerate (§6). Aborting three healthy providers over it is wrong; silently skipping it writes an
empty `openai` group that later reads as *"Codex serves no models."* So:

- write the providers that succeeded;
- report each failure **with its remedy** (`codex` → *"run `--add codex --from-picker`"*);
- exit **0** unless **every** provider failed;
- `--strict` fails on any.

**`wb-flow init` drives the same call.** `init.js` already invokes `MODEL.detect()` at its roster
step and discards it for the catalog — line 321 copies the seed verbatim. The multi-add belongs
between those two points, its provider list taken from the Step 0 checkboxes, **reusing the
already-computed `detect()` result**. It must stay non-fatal: the file's own comment says *"Never
fail an install over the roster: the wiring is the point."*

---

## 9 · JSON schema delta

| Field | Level | Meaning |
|---|---|---|
| `seed` | top | `true` in the shipped skeleton; cleared on first successful sync |
| `syncedAt` | top | ISO date of the last successful merge |
| `pinned` | model | immune to retire and `--prune` |
| `retired` | model | ISO date it left the live enumeration; still readable |
| `verified` | model | probe/picker result — meaningful only for non-enumerable providers |
| `checkedAt` | model | ISO date of that verification; its absence is what makes `CODEX_VERIFIED` a fallback |
| `cli` | provider | which binary enumerates it (§1) |

---

## 10 · Module boundary

`bin/catalog_sync.js` is **pure**: `enumerateLive` · `curate` · `mergeCatalog` · `diffCatalog`. No
`fs.writeFileSync`, no `spawnSync`, no `console.log`. All I/O — the atomic `.tmp` + rename, the
`.bak` copy, the diff table — stays in `bin/model.js`.

**Why the boundary is load-bearing:** the test suite must run the merge against fixtures on a machine
with no CLIs installed. A module that shells out cannot be tested without the subscriptions it is
testing the handling of.

`enumerateLive` imports `poolOf()` from `model.js` rather than re-deriving pool logic — a second pool
classifier is **A15** re-opened (*"`model --show` and `wave` resolve the roster by two different
algorithms and read two different files"*), closed on 2026-08-15 by giving them one shared resolver.

---

## 11 · What this spec does **not** decide

- **Go vs Zen as a purchase.** §4 makes routing correct under either; which subscription to hold is
  the owner's call.
- **Probe cadence.** `--probe` stays opt-in and manual. Automatic probing would spend money on a
  schedule.
- **Splitting `model.js`.** It is ~2 000 lines and six tasks edit it, which is the collision shaping
  the plan's wave order. A legitimate follow-up — but refactoring the file this plan is changing
  would be its own risk.

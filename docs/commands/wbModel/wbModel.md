# /wbModel — Command Reference

## Description

The `/wbModel` command dynamically updates the `User Models (Active Contractual Reference)` table located at the top of `commands/model_recommendations.md`. This table defines the dynamic contract for all agent role dispatches (Planner, Validator, Worker, Mechanical) across the `wb-flow` ecosystem.

## Command Syntax

```bash
/wbModel [--planner="<models>"] [--validator="<models>"] [--worker="<models>"] [--mechanical="<models>"] [--show] [--reset]
```

## Behavior & Fallback Formatting

1. **Role Model Parsing**: Extracts up to 3 priority model names per role (separated by commas).
2. **CLI Binary Mapping**: Resolves explicit or default vendor prefixes to `agy`, `codex`, `opencode`, or `copilot` binaries.
3. **Fallback Chains (`||`)**: Generates an execution chain string using the `||` Bash operator:
   ```bash
   `agy run -m claude-opus-5 "<prompt>" || agy run -m gemini-3.5-pro "<prompt>" || opencode run -m kimi-k3 "<prompt>"`
   ```
4. **Contract Reset (`--reset`)**: Restores all 4 role rows in the `User Models` table back to the baseline model recommendations defined in `## The Logic`.
5. **Contract Persistence**: Modifies `commands/model_recommendations.md` in place, ensuring all future `/wb*` command dispatches reference the updated models.

## Interactive Picker & Qualification Badges (`--pick`)

When executing `wb-flow model --pick`, an interactive terminal UI presents:

1. **Step 0 — Subscription Selection:** Allows users to filter the catalog down to active subscriptions from famous providers (`anthropic`, `openai`, `opencode-go`, `antigravity`, `openrouter`, `github-copilot`, `opencode-zen`).
2. **Model Role Qualification Badges:** Models are scored and tagged by their capabilities during selection:
   - 🧠 **Lead Architect & Planner:** Top-tier reasoning (Opus, GPT-4, Gemini Pro).
   - 💻 **Great Coder Worker:** Coding specialists (Sonnet, Qwen Coder).
   - ⚡ **Fast Mechanical Worker:** High-speed models (Haiku, Flash).
   - 🔨 **Heavy Worker:** High-context models (Kimi, Max).
   - 💡 **General Worker:** Auto-routing pools.
3. **Probing (`--probe --all`):** Validates reachability and credit balance via live API pings before selection. By default, it groups reachable models by Role. Modes like `--all=raw`, `--all=<provider>`, or `--all=<role>` filter and change this behavior — `--all=raw` is the only one that streams; every other form groups by role and hides unreachable models.

> **Both `--probe` paths behave identically.** `wb-flow model --probe --all[=…]` works the same with or without `--pick`: the same catalog-authoritative routing (so `anthropic/*` probes via `claude` and `openai/*` via `codex`, not opencode) and the same filters. `--all=` with an empty value means `--all`, and an unrecognised filter reports an error rather than probing nothing.

**Tree Picker Example:**
```text
  📋 Mechanical — select model chain in priority order
  (Use ↑/↓ to move, Space to toggle rank, 'a' to select/deselect all, Enter to confirm)

   ❯ [4] ◉ 📁 anthropic                   [claude-pro]
         ◯       ├── ❌ 📄 anthropic/claude-opus-5                      — 🧠 Lead Architect & Planner (Insufficient balance)
         ◯       └── ❌ 📄 anthropic/claude-haiku-4-5-20251001          — ⚡ Fast Mechanical Worker (Insufficient balance)
     [3] ◉ 📁 openai                      [chatgpt]
         ◯       ├── ❌ 📄 openai/gpt-5.6-sol                           — 🧠 Lead Architect & Planner (Insufficient balance)
         ◯       └── ❌ 📄 openai/gpt-5.5                               — 💻 Great Coder Worker (Insufficient balance)
     [1] ◉ 📁 opencode-go                 [opencode-go]
         ◯       ├── ✅ 📄 opencode-go/deepseek-v4-pro                  — 🧠 Big Planner & Deep Thinker
         ◯       └── ❌ 📄 opencode-go/kimi-k3                          — 🔨 Heavy Worker (Insufficient balance)
     [2] ◉ 📁 antigravity                 [google-one]
         ◯       ├── ✅ 📄 gemini-3.6-flash-high                        — ⚡ Fast Mechanical Worker
         ◯       └── ✅ 📄 claude-opus-4-6-thinking                     — 🧠 Big Planner & Deep Thinker

      chain: opencode-go (auto) || antigravity (auto) || openai (auto) || anthropic (auto)
```

## Flags & Shortcuts

| Flag | Shortcut | Role / Description |
|---|---|---|
| `--planner="<models>"` | `-p` | Sets/overrides models for the 🧠 **Planner** role. |
| `--validator="<models>"` | `-v` | Sets/overrides models for the ✅ **Validator** role. |
| `--worker="<models>"` | `-w` | Sets/overrides models for the 🔨 **Worker** role. |
| `--mechanical="<models>"` | `-m` | Sets/overrides models for the 📋 **Mechanical** role. |
| `--show` | `-s` | Displays the current active `User Models (Active Contractual Reference)` table without editing. **Resolves from the current directory only** — for what a wave will dispatch use `wb-flow wave <plan.md> --wave=<L> --list` (see the warning above). |
| `--reset` | `-r` | Resets the active `User Models` table back to `The Logic` default selections. |
| `--help` | `-h` | Prints this help block. |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md)

---

### What `--probe --all` pre-selects for you

When a probe has run, **the models it proved reachable become the pre-checked default chain** for each
role in Step 1. Detection alone only proves a credential exists; the probe proves the model answered, so
its result outranks the detected roster.

Two rules shape the defaults:

- **One tier per model.** `gemini-3.6-flash-high`, `-medium` and `-low` are one model at three service
  tiers, so only **`-high`** is pre-checked — a chain of three tiers of the same model is one point of
  failure wearing three hats. Different *releases* are kept: `gemini-3.6-flash-high` and
  `gemini-3.5-flash-high` are separate models and both remain eligible. The other tiers stay visible in
  the tree, just unchecked, so you can still select them deliberately.
- **More than one billing pool.** Each link is drawn from a different subscription where one is
  available, which is the entire point of a fallback chain: a rate-limit window or a lapsed card takes
  out one pool, not the ladder.

Never pre-checked: anything the probe marked ❌ unreachable, anything marked ⚠️ substituted (it answered
*as a different model* — putting it in a chain guarantees a dispatch that silently runs something else),
and anything outside the subscriptions you enabled in Step 0.

You are always free to override — Space toggles rank, and the order you check is the order the chain
dispatches.

<!-- ROSTER_DIVERGENCE_START -->

> [!WARNING]
> **`wb-flow model --show` and `wb-flow wave` can report different rosters.** For any question about
> what a *wave* will dispatch, trust **`wb-flow wave <plan.md> --wave=<L> --list`** — not `model --show`.
>
> They resolve the roster file differently:
>
> | | Searches | Picks |
> |---|---|---|
> | `model --show` | the current directory only (`.wb/commands/` → `commands/` → `~/.wb-flow/` → shipped seed) | the **first** file that exists |
> | `wave` | the package root, the repo root **and** `~/.wb-flow/` | the **most recently written** file |
>
> So running `model --show` from inside a sub-package that carries its own older
> `.wb/commands/model_recommendations.md` reports that stale file, while the wave dispatches from the
> fresher roster `wb-flow model --pick` wrote at the repo root. Observed 2026-08-14 — the two named
> completely different planner chains.
>
> `wave --list` prints **`📋 Roster in effect:`** with the resolved file path and the full chain per
> role, precisely so this is visible rather than silent. It is read-only and dispatches nothing.
>
> ```bash
> wb-flow wave <plan.md> --wave=A --list      # authoritative for wave dispatch
> wb-flow model --show                        # the roster in THIS directory; may differ
> ```
>
> The divergence is known and not yet unified: `model --show` shares its resolver with the **write**
> path used by `--pick`, so changing it would move where your roster is saved. Until that is settled
> deliberately, the two commands answer two different questions — *"what is configured here"* versus
> *"what will this wave actually run"*.

<!-- ROSTER_DIVERGENCE_END -->

<!-- MODEL_FILES_START -->

## 🗂️ The three model files — and editing them by hand

`wb-flow` keeps model configuration in three files. Two are yours to edit; the third is generated.

| File | What it is | Ships? | Hand-editable |
|---|---|---|---|
| `models.json` | **The catalog** — which models exist and which `provider`/`pool` serves each | ✅ default ships at `templates/models.json` | ✅ yes |
| `selected.json` | **Your picks** — the ordered roster per role, written by `--pick` | ❌ generated, never shipped | ✅ yes |
| `commands/model_recommendations.md` | **The dispatch roster** — what `--wave` actually reads | seed only | ✅ yes |

### `models.json` — the catalog

The shipped default is copied to `~/.wb/models.json` on `wb-flow init` (only if absent, so your edits
are never overwritten). Resolution order, first hit wins:

```
$WB_MODELS_FILE  →  ./.wb/models.json  →  ~/.wb/models.json  →  ~/.config/wb-flow/models.json
```

Add a provider or model by editing it directly:

```jsonc
{
  "providers": [
    {
      "provider": "anthropic",      // ← decides the CLI: anthropic → claude
      "pool": "claude-pro",         // ← billing pool, shown in the picker
      "models": ["anthropic/claude-opus-5", "Claude (auto)"]
    }
  ]
}
```

**The `provider` field is what routes the model, not its name.** `claude-opus-4-6-thinking` is
Anthropic-branded but listed under `antigravity`, so it dispatches through `agy` and bills against
`google-one`. Put a model under the wrong provider and it will be probed — and dispatched — through the
wrong CLI. A provider not in the routing table falls back to `opencode`.

### `selected.json` — your roster

Written by `wb-flow model --pick`, next to the roster it generates. Order is priority order:

```json
{
  "updatedAt": "2026-08-13T15:39:40.161Z",
  "roster": {
    "planner":    ["Codex (auto)", "gemini-3.1-pro-high", "gemini-3.6-flash-high"],
    "validator":  ["Codex (auto)", "gemini-3.1-pro-high"],
    "worker":     ["Codex (auto)", "gemini-3.1-pro-high"],
    "mechanical": ["Antigravity (auto)"]
  }
}
```

Edit it to reorder or swap models without re-running the picker. **`selected.json` is a record of your
choice; `model_recommendations.md` is what the dispatcher reads** — so if you hand-edit one, edit the
other to match, or re-run `wb-flow model --pick` to regenerate both.

### Which roster `--wave` uses

Every role dispatches its chain **left to right** with bash `||`, so
`model1 || model2 || model3` means *try model1; if it fails to run, try model2*. Each link routes
through its own CLI, so one chain routinely spans several:

```bash
.wb/bin/wbRun codex exec -m gpt-5.6-terra … \
  || .wb/bin/wbRun agy --model gemini-3.1-pro-high … \
  || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro …
```

Precedence, highest first:

1. `-M` / `--model` on the invocation — delegates that one run
2. A plan's own `> **Active Model Roster for this Plan:**` header
3. **The most recently written `model_recommendations.md`** across the package root, repo root and
   `~/.wb-flow/`
4. Built-in defaults

Point 3 is freshness, not position — deliberately. `--pick` writes into the **current directory's**
`.wb/`, so a scope carrying an older roster of its own used to shadow the picks you had just made, and
`--wave` would dispatch to models you had not chosen. Within a single root the order is still fixed:
`.wb/commands/` (your install) outranks `templates/commands/` (the neutral shipped seed).

Verify what a plan will actually dispatch before committing to a wave:

```bash
wb-flow wave <plan.md> --wave=A --list
```

<!-- MODEL_FILES_END -->

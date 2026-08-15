# Tutorial: Dynamic Model Discovery, Probing & Role Assignment

This field manual walks you through using `wb-flow model` to discover credentialed AI models, verify reachability and credit balances via live probing (`--probe`), and configure 3-tier fallback chains across execution roles (**Planner**, **Validator**, **Worker**, **Mechanical**).

<ModelPickerAnimation />

---

## ⚙️ Model Orchestration Pipeline Architecture

`wb-flow model` uses a multi-stage flow to discover, validate, and persist your AI execution contract:

---

## 🚀 1. Executing the Prober & Interactive Picker

To probe your catalog and launch the interactive picker, combine the three universal flags:

```bash
wb-flow model --pick --probe --all
```

| Flag | Role / Purpose |
|---|---|
| `--pick` (`-i`) | Opens the interactive terminal user interface. |
| `--probe` | Dispatches real inference calls to test provider API reachability and balance. |
| `--all` (`-a`) | Pre-probes the *entire* curated catalog in `models.json`. Reachable models are grouped by role; unreachable ones are hidden. |
| `--all=raw` | Streams every result as probed, including ❌ failures — the pre-1.0.2 output. |
| `--all=<provider>` | Narrows the probe to one provider (`anthropic`, `openai`, `antigravity`, `opencode`, …) — saves time and credits. |
| `--all=<role>` | Narrows the probe to one role (`planner`, `validator`, `worker`, `mechanical`). |

> **All `--all` forms work with or without `--pick`.** `wb-flow model --probe --all=anthropic` in a script
> behaves exactly like the interactive path: same catalog-authoritative routing (`anthropic/*` probes via
> the `claude` CLI, `openai/*` via `codex` — not opencode) and the same filtering. Only `--all=raw` streams;
> every other form groups by role and hides unreachable models.


---

## 🛰️ 2. Reading Live Probe Results

When probing starts, `wb-flow` reads API credentials from your system environment and local `.env` files, making live HTTP test requests to each vendor endpoint:

```text
📄 Using custom models catalog: /home/wissemb11/Allprojects/wb-labs/.wb/models.json

🛰️  Pre-probing all catalog model(s) to verify reachability & balance…
   ❌ anthropic/claude-opus-5                        — 🧠 Lead Architect & Planner — (Insufficient balance)
   ❌ openai/gpt-5.6-sol                             — 🧠 Lead Architect & Planner — (Insufficient balance)
   ✅ openrouter/qwen/qwen-2.5-coder-32b-instruct    — 💻 Great Coder Worker
   ✅ opencode-go/deepseek-v4-pro                    — 🧠 Big Planner & Deep Thinker
   ✅ gemini-3.6-flash-high                          — ⚡ Fast Mechanical Worker

   ✓ Probed catalog: 4 of 54 models verified reachable with sufficient balance.
```

### Probe Status Key

- **✅ Reachable**: The API key is valid and the account has active credits.
- **❌ Insufficient balance**: API key is authenticated, but the provider billing account lacks credits/balance to run inference.
- **❌ Model not found**: Model slug is deprecated or unsupported by the target provider CLI.

---

## 💳 3. Step 0: Active Provider Subscription Selection

Once probing finishes, you enter **Step 0**, where you select your active subscriptions:

```text
  Step 0 — Select your active provider subscriptions
  (Use ↑/↓ to move, Space to toggle rank, 'a' to select/deselect all, Enter to confirm)

   ❯ [1] ◉ 💳 📁 anthropic                 [claude-pro]
     [2] ◉ 💳 📁 openai                    [chatgpt]
         ◯ 💳 📁 openrouter                [openrouter]
     [3] ◉ 💳 📁 opencode-go               [opencode-go]
     [4] ◉ 💳 📁 antigravity               [google-one]
         ◯ 💳 📁 github-copilot            [github-copilot]

      chain: anthropic || openai || opencode-go || antigravity

   ✓ Enabled subscriptions: anthropic, openai, opencode-go, antigravity
```

### Controls:
- **`Up / Down Arrows`**: Navigate provider subscriptions.
- **`Space`**: Toggle enable/disable subscription.
- **`Enter`**: Confirm enabled providers and advance to Role Selection.

---

## 🌲 4. The Model Tree Picker & Role Qualification Badges

In **Step 1**, you configure the 3-tier fallback chain for each execution role:

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

### Model Role Qualification Badges

`wb-flow` automatically analyzes each model's benchmark capability and tags it with a role badge:

- 🧠 **Lead Architect & Planner**: Complex reasoning & architecture (`claude-opus-5`, `gemini-3.1-pro`, `gpt-5.6-sol`).
- 💻 **Great Coder Worker**: High-speed implementation & coding (`claude-sonnet-5`, `qwen-2.5-coder-32b`, `gpt-5.5`).
- ⚡ **Fast Mechanical Worker**: Low-latency lightweight execution (`claude-haiku-4.5`, `gemini-3.6-flash-high`).
- 🔨 **Heavy Worker**: Massively parallel long-context processing (`deepseek-v4-pro`, `kimi-k3`).
- 💡 **General Worker**: General fallback routing pools (`github-copilot/auto`).

---

## 🔗 5. How Fallback Chains (`||`) Work at Runtime

When `wb-flow wave` dispatches background tasks, it wraps commands in `.wb/bin/wbRun`. If a primary provider encounters a rate limit or API outage, execution seamlessly fails over to the secondary and tertiary models in the chain:

<FallbackFailoverAnimation />

### Shell Chain Example:
```bash
.wb/bin/wbRun agy --model claude-opus-5 -p "<prompt>" || \
.wb/bin/wbRun agy --model gemini-3.6-flash-high -p "<prompt>" || \
.wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "<prompt>"
```

> 💡 **Best Practice**: Always select models from **different billing providers** (e.g. Anthropic + Google + OpenCode) for your fallback chain. Three models under a single subscription represent a single point of failure!

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

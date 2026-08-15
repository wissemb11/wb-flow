# Model Recommendations per `/wb*` Command

> **This is the shipped default — it names no models yet, on purpose.**
> Run `wb-flow model --detect` (or answer the roster step in `wb-flow init`) and the
> table below is rewritten from the CLIs *you* have installed and credentialed.
>
> Nothing here is tied to any particular subscription. A roster copied from someone
> else's machine is worse than an empty one: an unreachable model does not fail at
> install, it fails much later as a wave cell that dies at G1 with
> `Error: Model not found` — or, worse, one that simply hangs.

---

## User Models (Active Contractual Reference)

> **Contract:** this table is what `/wb*` commands and `wb-flow wave` actually route on.
> Each role lists up to **3 models** tried in order via the `||` (Bash OR) fallback operator.

| Role | Active Selected Models (1st / 2nd / 3rd) | Lane |
|---|---|---|
| 🧠 **Planner** | _not configured_ | _run `wb-flow model --detect`_ |
| ✅ **Validator** | _not configured_ | _run `wb-flow model --detect`_ |
| 🔨 **Worker** | _not configured_ | _run `wb-flow model --detect`_ |
| 📋 **Mechanical** | _not configured_ | _run `wb-flow model --detect`_ |

> **Where are the bash commands?** In a fenced ` ```bash ` block written directly under this table,
> not in a cell. A bash `||` inside a GFM table cell has to be written `\|\|` or the row silently
> gains two phantom columns — so the dispatch chains live outside the table, where `||` is just `||`.

## 🎚️ What the defaults are

There is no packaged list of model names — that would hand you someone else's subscriptions. The
default is a set of **ranking rules**, applied by `wb-flow model --detect` (and `--reset`) against
whatever your machine can actually reach:

| Role | Preference order (capability), then a **different pool** at each step |
|---|---|
| 🧠 **Planner** | orchestrator → opus → gemini-*-pro → **gpt-5.*-terra** → fable → sonnet → mythos → kimi-k3 → kimi-k2.7 → glm-5.2 → grok-4 |
| ✅ **Validator** | orchestrator → opus → gemini-*-pro → **gpt-5.*-terra** → fable → kimi-k2.7 → kimi-k3 → glm-5.2 → sonnet |
| 🔨 **Worker** | deepseek-v4-pro → gemini-*-pro → **gpt-5.*-terra/luna** → kimi-k2.7-code → qwen*-max → minimax-m3 → glm-5.2 → codex → sonnet → opus → **orchestrator (last resort)** |
| 📋 **Mechanical** | qwen*-plus → gemini-*-**flash** → deepseek-v4-flash → haiku → flash → nano → mini → mimo → glm-5.1 → **orchestrator (last resort)** |

### Ordering *within* the `agy` pool

When several agy models qualify for the same slot, this order decides (owner's choice, 2026-08-02):

| # | Model | Typical slot |
|---|---|---|
| 1 | `claude-opus-4-6-thinking` | 🧠 Planner / ✅ Validator — Opus-class reasoning on a **different subscription** than Claude Pro |
| 2 | `gemini-3.6-flash-high` | 📋 Mechanical |
| 3 | `gemini-3.5-flash-high` | 📋 Mechanical fallback |
| 4 | `gemini-3.1-pro-high` | 🔨 Worker |
| 5 | `gemini-3.1-pro-low` | 🔨 Worker, cheaper |
| 6 | `claude-sonnet-4-6` | 🔨 Worker fallback |

Agy models not on this list (`-medium` / `-low` flash variants, `gpt-oss-120b-medium`) sort **last** —
available if nothing else fits, never promoted silently.

**The root's family is not excluded — its *pool* is.** A Claude-rooted chain still takes
`claude-opus-4-6-thinking` at slot 2: same model class, Google One's limits instead of Claude Pro's.
That is precisely the fallback you want when one subscription throttles.

### Why the chain alternates pools

Capability picks *which* model; the **pool** rule picks *which of the equally-good ones*. A chain of
three models on one subscription is one point of failure wearing three hats — on 2026-08-02 a Worker
chain of three `opencode/*` models died together on a single `Insufficient balance`.

| Pool | Covers | Rank |
|---|---|---|
| `claude-pro` | the in-session root, `claude -p`, `anthropic/*` | 0 |
| `google-one` | `agy` — bare model names | 1 |
| `opencode-go` | the Go subscription | 2 |
| `chatgpt` | `codex` — bare `gpt-5.*` names | 3 |
| `opencode-zen` | metered pay-as-you-go | 5 |
| anything else | incidental credentials | 9 |

**Rank is preference, not payment.** The first four rows are *subscriptions*; passes 1–2 draw only
from those. Rank breaks ties between them — it does not decide which counts as a subscription. (The
two were conflated once: `chatgpt` at rank 3 failed a `rank <= 2` test and no codex model could ever
be proposed, while `--detect` cheerfully reported codex as found.)

Three passes, loosening one constraint at a time: **new pool + new family** → **new pool, family may
repeat** (the same model on a different subscription is the *ideal* fallback: identical capability,
independent limits) → **anything unused**. Never the same model from the same pool twice.

Two consequences worth knowing:

- **Mechanical gets `gemini-*-flash`, not `-pro`.** The role is defined as "no judgment to buy";
  a Pro-tier reasoner there is paying for something you explicitly do not want.
- **Worker and Mechanical end at the orchestrator.** It is a third pool that is never metered and
  never provider-rate-limited, so the chain degrades to "do it here" instead of failing outright.

Three rules shape the result:

1. **Planner and Validator lead with the orchestrator itself** when a `claude` CLI is present —
   a role naming the root is run in-session, never spawned.
2. **Their fallbacks exclude the root's own family.** A chain whose backups are the same model as
   the primary is not a fallback chain.
3. **Worker and Mechanical lead with the cheap tier on purpose.** Leaves are where a flat-rate
   subscription earns its keep; the root already supervises them.

### If nothing resolves at all

When no roster file is found and no CLI is detected, `wb-flow wave` falls back to a hard-coded
triple in `bin/wave.js`:

```
worker         opencode-go/deepseek-v4-pro
mechanical     opencode-go/qwen3.7-plus
selfValidator  opencode-go/kimi-k2.7-code
```

Routing labels these `built-in DEFAULT_MODELS`. **Seeing that label means your roster was not read** —
it is a symptom, not a configuration. Fix the roster rather than relying on it.

## 📖 Worked examples

```bash
# 1. First run — derive a roster from what you actually have
wb-flow model --detect

# 2. Prove the picks answer (real calls, ~45 s each; this is the ONLY check
#    that distinguishes "catalogued" from "reachable")
wb-flow model --probe

# 3. Pin one role by hand — e.g. route Worker to Antigravity
wb-flow model --set worker=gemini-3.1-pro-high

# 4. Pin a whole chain (1st / 2nd / 3rd, tried left to right)
wb-flow model --set worker=gemini-3.1-pro-high,opencode/deepseek-v4-pro,opencode/kimi-k2.7-code

# 5. Show the roster without touching it
wb-flow model

# 6. Start over — re-derives from this machine, no packaged baseline exists
wb-flow model --reset

# 7. Machine-readable, writes nothing
wb-flow model --json
```

**Model-name shapes matter.** A provider-prefixed slug goes to `opencode`; a bare name from
`agy models` goes to `agy`:

```bash
opencode/deepseek-v4-pro     # → opencode run -m opencode/deepseek-v4-pro …
opencode-go/qwen3.7-plus     # → opencode run -m opencode-go/qwen3.7-plus …
gpt-5.6-terra                # → codex exec -m gpt-5.6-terra …  (bare gpt-5.* = codex)
gemini-3.1-pro-high          # → agy -p --model gemini-3.1-pro-high …
opencode/claude-sonnet-4-6   # → opencode  (NOT agy — the prefix decides)
claude-sonnet-4-6            # → agy       (same model name, different provider)
```

---

## What each role is buying

| Role | What it needs | Pick a model that is… |
|---|---|---|
| 🧠 **Planner** | Deep reasoning, decomposition, strategy | the best reasoner you have access to |
| ✅ **Validator** | Judgment: is this actually done, and is it right? | a *different* big thinker from the executor |
| 🔨 **Worker** | Code generation and surgical file edits | capable but cheap — this is where volume lives |
| 📋 **Mechanical** | Run a command, read output, format a report | fast; there is no judgment to buy here |

**Spend your budget on the roles that judge, not the roles that type.** Worker and Mechanical
run the most calls by far, so a flat-rate or free tier there is worth more than a premium model.

---

## 🌳 Who may be the orchestrator

The **root agent** is whichever assistant you type `/wbWork … --wave=A` into. It is not just
another executor — it owns the work the wave script cannot do:

- classify every cell by the three gates (INFRA / NO-OP / ATTEMPTED / DONE)
- own the plan file: check Done boxes, recompute the matrix, write Wave notes
- run 🧠 Planner and ✅ Validator cells **in-session** — these are never delegated
- judge cell liveness, and decide when a half-failed wave means stop

A root that mis-classifies a gate writes a green Done box over work that never ran — the most
expensive failure mode in this system, and invisible until someone reads the code.

**Use your strongest available model as the root, and delegate leaves to the cheap tier.**
A model listed as `(auto)` or `(in-session)` in the roster above means *the orchestrator itself* —
`wb-flow wave` runs that role in the current session and never spawns a subprocess for it.

> Known limitation: the executor-identity checks in `bin/wave.js` are written against Claude as
> the root. Rooting on another assistant is not currently supported — see the project's own
> `model_recommendations.md` for the detail if you are adapting this.

---

## 🔁 Filling and re-verifying this file

```bash
wb-flow model                 # show the current roster
wb-flow model --detect        # re-derive it from installed, credentialed CLIs
wb-flow model --probe         # dispatch one trivial call per model — the ONLY
                              # check that proves a model actually answers
wb-flow model --set worker=<provider>/<slug>
```

**Catalogued + credentialed does not mean reachable.** A provider can list a model, hold a valid
credential for it, and still never answer. `--detect` cannot see that; `--probe` can. Run it once
after the first `--detect`, and again whenever a wave cell fails at G1.

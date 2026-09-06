---
title: "Model Fallback Chains — Pools, Lanes, and the Executor≠Validator Rule"
description: "---"
---

# Model Fallback Chains — Pools, Lanes, and the Executor≠Validator Rule

> The model roster is not a list of model names. It is four chains — one per role — where the order
> of entries IS the fallback sequence, and where the **pool** each entry draws from matters as much
> as the capability ranking. A chain of three models on one subscription is one point of failure
> wearing three hats.

---


> [!NOTE]
> A chain says *which model runs a role*. It does **not** say who may be the **root** agent — that is
> a separate, stricter rule. See [`orchestrator_and_tokens`](orchestrator_and_tokens.md).

## Pool alternation — why it matters

On 2026-08-02 a Worker chain of three `opencode/*` models died together on a single `Insufficient
balance`. All three were from the same billing pool (opencode Zen, metered). The chain had three
names and one point of failure.

Each model entry belongs to exactly one **pool** — a billing and rate-limit domain:

| Pool | Covers | Rank |
|---|---|---|
| `claude-pro` | the in-session root, `claude -p`, `anthropic/*` | 0 (always preferred) |
| `google-one` | `agy` — bare model names (`gemini-*`, `claude-opus-*`, `gpt-oss-*`) | 1 |
| `opencode-go` | the Go subscription (`opencode-go/*`) | 2 |
| `chatgpt` | `codex` — bare `gpt-5*` names **and `openai/*` slugs** | 3 |
| `opencode-zen` | metered pay-as-you-go (`opencode/*`) | 5 |
| anything else | incidental credentials | 9 (last) |

The picker enforces pool diversity across the chain. It runs three passes over the capability
ranking:

| Pass | Rule | Why |
|---|---|---|
| 1 | New pool AND new family | Maximum diversity — three models, three subscriptions, three families |
| 2 | New pool, family may repeat | The same model on a *different* subscription is the ideal fallback: identical capability, independent rate limits |
| 3 | Anything unused | Fill the slot rather than leave it short |

A chain of `claude-opus-5 (Claude Pro) → claude-opus-4-6-thinking (Google One) → deepseek-v4-pro
(opencode Go)` survives any one subscription's rate limit or billing lapse. The capability ranking
picks *which* model; the pool rule picks *which of the equally-good ones*.

---

## The `agy` lane

Models served by the Antigravity (`agy`) CLI are dispatched differently from opencode:

```bash
# opencode
opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions "/wbWork …"

# agy
agy --model gemini-3.1-pro-high --dangerously-skip-permissions -p "/wbWork …"

# codex
codex exec -m gpt-5.6-terra --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  "Read <template> and execute it. …" < /dev/null
```

`--dangerously-skip-permissions` on agy is **not optional**: without it, headless mode auto-denies
every tool the prompt needs and returns empty output with a zero exit code — a silent success that
has produced nothing. Verified in a terminal on 2026-08-02.

codex differs in three ways:
1. `exec` is the headless subcommand (not `run`)
2. `-p` means `--profile`, not print — the prompt is a positional argument
3. `< /dev/null` is mandatory — codex reads stdin even with a prompt argument, and inside a wave
   script stdin IS the script, so an unredirected dispatch consumes the remaining lines and hangs

---

## The no-self-delegation rule

If the roster names the orchestrator for a role (e.g. `Claude (in-session)` as the first Worker),
that cell stays in-session rather than spawning a subprocess. A cold subprocess of the same model
would pay a full re-read of the template and scope files to reach a worse-informed copy of the agent
that dispatched it — more tokens for a worse version of the same judgment.

**Worker and Mechanical chains end at the orchestrator as a last resort.** It is a pool that is
never metered and never provider-rate-limited, so the chain degrades to "do it here" instead of
failing outright.

---

## The executor≠validator rule

A model must never validate its own **edits**. A model re-reading a diff it just wrote will call it
correct — and that echo chamber is the single most common way a hollow pass reaches a plan file.

When a paired validation resolves: the orchestrator is Claude, and the `☐ Done` column says Claude
executed the paired task → delegate the validation to a **different** model. If a non-Claude model
executed it → Claude validates in-session.

### The boundary is the provider, not the model name

Since 1.0.5 the rule compares **pools**, not model strings. Two models from one house are not two
opinions: they share a trainer, a tokenizer, and a family of failure modes, so `claude-opus-5`
graded by `claude-sonnet-5` is an echo chamber that merely changes its voice.

`crossProviderPick()` resolves the executor's pool through the same `poolOf()` classifier the rest
of the toolchain uses — never a second one — and walks the validator's chain for the first entry
whose pool differs:

```
executor anthropic/claude-opus-5   (claude-pro)  ->  validator openai/gpt-5.6-terra  (chatgpt)
executor openai/gpt-5.5            (chatgpt)     ->  validator anthropic/claude-sonnet-5 (claude-pro)
```

Because the choice is made **per executor**, the roster does not need four heads from four different
pools — which is fortunate, since with a lapsed subscription there are often fewer usable pools than
roles.

**The escape hatch is loud on purpose.** When every candidate in the chain sits in the executor's own
pool, the head is used anyway and the dispatch line must say so:

```
same-provider validation — chain offers no alternative
```

An unavoidable exception is fine. A *silent* one is the defect: it reads exactly like an independent
pass in the plan file, and nothing distinguishes them afterwards.

> [!WARNING]
> **An explicit `-M=` is honoured verbatim, and is not pool-checked.** The comparison runs on the
> routed path — the branch that fires when the `☐ Done` column says Claude executed the paired task.
> A hand-typed `/wbValid … -M=$VALIDATOR` is an operator override and is taken as given, so if that
> chain's head shares the executor's pool you get a same-provider validation with no warning. When
> you pass `-M=` yourself, check the pool yourself.

### 🧠 Planner exemption

Planner rows are **exempt** from the executor≠validator rule. They produce a **decision**, not a
diff — and their validation is a re-read of reasoning that is already in the orchestrator's context.
Handing that to a second model buys a spawn and a cold re-read, not independence.

Assign a different model to a Planner pairing only when you *want* an outside opinion on the
decision. It is now a choice, not a requirement.

The exemption covers only 🧠 Planner rows. 🔨 Worker and 📋 Mechanical rows — the ones that touch
files — keep the rule with no exception.

---

## The neutral shipped roster + prepublish guard

The packaged `model_recommendations.md` names **no models**. It ships with `_not configured_` for
every role, and a set of **ranking rules** that `wb-flow model --detect` applies against whatever
your machine can actually reach.

There is no prepackaged list of model names — that would hand you someone else's subscriptions. An
unreachable model does not fail at install; it fails much later as a wave cell that dies at G1 with
`Error: Model not found` or, worse, one that simply hangs.

**The prepublish guard** (`bin/verify-roster.js`): before `npm pack`, the CI verifies that the
shipped roster is neutral — all four roles are `_not configured_` or absent. A roster that names a
concrete model is rejected. The only way to configure the roster is to run `wb-flow model --detect`
on the machine where the work runs.

### What happens when nothing is configured

When no roster file is found and no CLI is detected, `wb-flow wave` falls back to three hard-coded
defaults in `bin/wave.js`:

```
worker         opencode-go/deepseek-v4-pro
mechanical     opencode-go/qwen3.7-plus
selfValidator  opencode-go/kimi-k2.7-code
```

Routing labels these `built-in DEFAULT_MODELS`. **Seeing that label means your roster was not read**
— it is a symptom, not a configuration. Fix the roster rather than relying on it.

---

## Fallback advances on Gate 1 only

When a wave cell fails at G1 (INFRA — the agent never ran), the script advances to the next model
in the chain. A different provider and a different rate-limit window might succeed.

When a cell fails at G2 (NO-OP — ran, produced nothing) or G3 (ATTEMPTED — oracle failed), the
fallback **stops**. The blocker is the task, not the agent — a second model meets the same wall at
double the cost. Re-dispatch after a G2/G3 failure is a human decision.

---

## Routing precedence

When a model is resolved for a cell, seven sources compete, from highest to lowest:

1. `--model` / `-M` — the operator delegates this ONE invocation explicitly. Outranks everything,
   including the executor≠validator rule. The override is printed in the routing line:
   `[--model=opencode-go/deepseek-v4-pro — explicitly delegated by the operator]`
2. Explicit role flag (`--planner`, `--worker`, `--validator`, `--mechanical`) — persists to
   `model_recommendations.md`
3. The plan-header roster block under `## 🌊 Next Executable Sequence`
4. `model_recommendations.md` — the active roster file, maintained by `wb-flow model`
5. Built-in `DEFAULT_MODELS` in `bin/wave.js`

---

← [Concepts Hub](README.md) · [Home](../README.md)

---

## Expressing a chain — the syntax

Everything above describes what a chain *should* be. This is how you write one.

### On the command line

`-M` (and the per-role `--worker=` / `--validator=` / `--planner=` / `--mech=`) accept a **chain**,
not a single model. Two separators are read; one is emitted.

```bash
/wbWork $P --id=1 -M=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high
```

The `||` separator this page uses in prose is also accepted on input, but it must then be quoted —
see the note below on why commas are the emitted form.

Each link is dispatched left to right until one answers, **advancing only on a Gate-1/INFRA failure**
— the agent never ran, so a different one is worth trying. A Gate-2 or Gate-3 failure is the *task*
failing, and a second model meets the same wall at double the spend.

**Every link is validated when the flag is parsed**, not when it is reached. A chain whose second
entry is a typo is worse than one that fails immediately: the run looks healthy until the head
rate-limits, hours in, and the fallback the chain existed for dies on a name nobody checked.

The executed model is reported per attempt:

```
▶ wbWork 1 [openai/gpt-5.5]
▶ wbWork 1 [anthropic/claude-fable-5]   # fallback
```

### In a plan — role variables

A matrix cell names a **role**, never a model:

```markdown
| **A · 🔨 work** | — | — | `/wbWork $P --id=1,2 -M=$WORKER` | — |
```

and the four roles are declared once, in the plan's `## 🎛️ Active Model Roster` section — above the
task table, because the table's `Suggested` columns consume it too. Copy/paste blocks declare them
beside the `P=` line, **comma-separated and unquoted**, so a role reads exactly like every other
variable:

```bash
P=path/to/plan.md
WORKER=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high
/wbWork $P --id=1,2 -M=$WORKER
```

> **Why a comma and not the `||` this page uses in prose.** `||` is a shell OR operator, so
> `WORKER=a||b||c` unquoted is **not an assignment**: bash reads `WORKER=a`, then `|| b`, then
> `|| c`, leaving the variable holding **only the first model** — and exiting 0, which is the
> direction that hides the failure. Quoting fixes it but makes the roster lines look unlike every
> other variable in the block. A comma has no meaning to the shell, and it already matches
> `wb-flow model --set <role>=a,b,c`.

**A cell writing `-M=$WORKER` is a reference to the role's chain.** Only a *literal* model in `-M=` is
a per-cell override, and the generated run-book marks it as one.

### Why the cell may not name a model

A cell naming one model is wrong the moment a subscription changes — and the matrix is regenerated on
every `--embed`, so the staleness returns as fast as it is fixed. Measured 2026-09-02: a plan named a
provider's models for two roles for **ten days**, including a month in which that subscription had
lapsed. With a role variable it is one roster edit instead of every cell in the file.

`wb-flow lint` **step-7** enforces both halves: the roster block must match the roster file
`resolveRosterFile()` resolves, and cells sharing a wave, role and routed model must be merged into
one `--id=X,Y` dispatch.

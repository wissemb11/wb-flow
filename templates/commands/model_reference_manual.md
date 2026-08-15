# Model Reference Manual — `wb-flow`

> **This file is for a human, not an agent.** It is your bench reference: which models exist, what
> each CLI's syntax is, and which model each role should get. Nothing reads it automatically —
> `wb-flow model` and `/wbModel` write `model_recommendations.md`, never this file.
>
> **Restored 2026-08-02** from the pre-neutralization roster, then corrected against live terminal
> output. Kept deliberately verbose; the shipped `model_recommendations.md` is terse because an agent
> parses it.
>
> | File | Audience | Written by |
> |---|---|---|
> | `model_recommendations.md` | the agent — routing contract | `wb-flow model` / `/wbModel` |
> | `model_recommendations.default.md` | a fresh install — neutral seed | shipped |
> | **this file** | **you** | **by hand** |

---

## 🗺️ Quick index

| Section | What you'll find |
|---|---|
| [User Models](#user-models-active-contractual-reference) | the active roster snapshot |
| [Who may be the orchestrator](#-who-may-be-the-orchestrator) | root-agent rules |
| [The Logic](#the-logic) | **the `--reset` baseline** — what each role should get |
| [Annex A](#-annex-a--verified-model-roster-opencode-go) | `opencode-go/*` slugs |
| [Annex B](#-annex-b--agy-model-roster-antigravity--google) | `agy` models **+ verified syntax** |
| [Annex C](#-annex-c--claude-cli) | `claude` CLI |
| [Annex C2](#-annex-c2--codex-cli-openai-codex) | **`codex` CLI** — `exec`, no slash-commands, stdin trap |
| [Annex D](#-annex-d--subscriptions-inventory) | what each subscription covers |
| [Annex E](#-annex-e--delegated-commands-which-flags-belong-where) | which flags go on which dispatch |
| [Annex F](#-annex-f--calling-these-from-python-and-node) | **Python / Node equivalents** — parsing, timeouts, capture |
| [Provider status](#-provider-status-2026-08-02) | **what actually answers today** |
| [Annex G](#-annex-g--full-command-glossary) | **full glossary** — every command × bash / Python / Node |

---

## User Models (Active Contractual Reference)

> **Contract:** This table represents the active model selections and CLI dispatches for `wb-flow` execution and all `/wb*` commands. Each role defines **3 priority models** executed in chain using the `||` (Bash OR fallback) operator with output-error guarding across their designated CLI utilities (`claude` for Claude Pro, `agy` for Google Gemini, `opencode` for GO/DeepSeek/Kimi/Qwen/GLM).

| Role | Active Selected Models (1st / 2nd / 3rd) | Tier | Lane |
|---|---|---|---|
| 🧠 **Planner** | **Claude (auto)** / **opencode/kimi-k3** / **opencode/kimi-k2.7-code** | Pro / Zen / Zen | in-session → opencode |
| ✅ **Validator** | **Claude (auto)** / **opencode/kimi-k2.7-code** / **opencode/kimi-k3** | Pro / Zen / Zen | in-session → opencode |
| 🔨 **Worker** | **opencode/deepseek-v4-pro** / **opencode/kimi-k2.7-code** / **opencode/deepseek-v4-flash** | Zen | opencode |
| 📋 **Mechanical** | **opencode/deepseek-v4-flash** / **anthropic/claude-haiku-4-5** / **opencode/deepseek-v4-pro** | Zen / Pro / Zen | opencode |

> Snapshot of `~/.wb-flow/commands/model_recommendations.md` at 2026-08-02. The live file is written
> by `wb-flow model`; this copy is a bench reference and does not update itself.

**Dispatch chains** — each role tries its models left to right:

```bash
# 🧠 Planner  /  ✅ Validator
# 1st: in-session — the orchestrator runs this itself, nothing spawned
.wb/bin/wbRun opencode run -m opencode/kimi-k3 --dangerously-skip-permissions "hi! who are you?"

# 🔨 Worker
.wb/bin/wbRun opencode run -m opencode/deepseek-v4-pro --dangerously-skip-permissions "/wbWork <plan.md> --id=1" || .wb/bin/wbRun opencode run -m opencode/kimi-k2.7-code --dangerously-skip-permissions "/wbWork <plan.md> --id=1"

# 📋 Mechanical
.wb/bin/wbRun opencode run -m opencode/deepseek-v4-flash --dangerously-skip-permissions "/wbTest <target>"
```

> **Roster change (2026-08-01 09:35 — `/wbModel`):** 🔨 Worker and 📋 Mechanical moved to the **`agy`** CLI (Gemini 3.1 Pro → Gemini 3.6 Flash → Claude auto) because the `opencode-go` provider was unreachable (three models, three 30–90s timeouts on a trivial probe). Requested `gemini 4.5 pro` / `gemini 4.1 pro` **do not exist** — `agy models` tops out at `gemini-3.1-pro-high` and `gemini-3.6-flash-high`; the real ids are used here so dispatches resolve. ⚠️ This routes `/wbWork` rows to Antigravity, which was marked untrusted as a worker on 2026-07-25 (nine rows ticked Done with zero task reports). Verify its output rather than accepting Done boxes.

> 🚫 **Never delegate to yourself — the CLI column is what to run *when the role is delegated*, not an instruction to always spawn.** When the resolved executor for a role **is the orchestrator already running** (the table says `Claude (auto)` and the root agent is Claude Code), do **not** launch `claude -p …`. Run that cell **in the current session**. Spawning would pay a full cold re-read — template + `output_conventions` + scope context, ~31,000 tokens — to reach a *worse-informed copy* of the agent that dispatched it: same model, none of the context, no ability to ask you anything.
>
> This is enforced in `bin/wave.js`: a role whose roster entry resolves to the in-session sentinel (`Claude (auto)`, `(in-session)`) routes to `lane: 'claude'`, and `--list` labels it `model_recommendations.md (in-session — not delegated)`. **Before 2026-08-02 it did the opposite of both intents** — the sentinel was dropped and the role fell through to `DEFAULT_MODELS`, so a roster naming Claude as 🔨 Worker silently dispatched to `opencode-go/deepseek-v4-pro`: wrong lane *and* wrong model, with no warning.
>
> One deliberate exception: a ✅ Validator cell pairing a **non-Planner** row that the orchestrator itself executed still routes **away** to a different model. Rule 10 (never validate your own edits) outranks the no-self-delegation rule; 🧠 Planner rows are exempt from rule 10 and stay in-session. See `wbWork` §Your loop and `_shared/output_conventions.md` §10.2.

> **`--summary` / `--sessions` are NOT flags of these CLI invocations.** They belong to `wb-flow wave` (and to `/wbWork … --wave=…`, which passes them through). Appending them to an `opencode run` or `agy -p` line is an unknown-flag error. A dispatch only carries them when the *prompt it sends* is itself a wave orchestration — e.g. `claude -p "/wbWork <plan> --wave=A --sessions"`. See the table under §Delegated commands below.

> **Validation note (2026-07-31):** Every `opencode-go/*` slug in this file is verified against `opencode models` output. The canonical source of truth is the live model list — run `opencode models | grep "^opencode-go/"` to re-check. If a slug drifts (e.g. a provider renames a model), the dispatch will fail with `Model not found`; fix the slug here to match.

---

## 🌳 Who may be the orchestrator

**This file's *roster* is provider-agnostic; the *orchestration* it feeds is not.** The four-role
table below says which model runs each role. It does **not** say who may be the root agent, and
`bin/wave.js` currently assumes that root is Claude. Read this before rooting a run anywhere else.

### The orchestrator's actual job

Not "run the wave" — the wave script does that. The root agent owns the judgment the script can't:

| Duty | Why it needs a big thinker |
|---|---|
| Classify each cell by the three gates | INFRA vs NO-OP vs ATTEMPTED vs DONE — never from output text |
| Own the plan file | Check Done boxes, recompute the matrix, write Wave notes — once, without corrupting the table |
| Run 🧠 Planner and ✅ Validator cells in-session | These are *never* delegated to a cheap model |
| Judge cell liveness | `OVER est` + flat CPU across samples — not `idle` alone, not a stale log |
| Decide when to stop | A half-failed wave makes the next wave meaningless |

A model that mis-classifies a gate writes a green Done box over work that never ran. That is the
single most expensive failure mode in this system, and it is invisible until someone reads the code.

### Two hard couplings to Claude (verified 2026-08-02)

1. **The anti-self-validation guard is Claude-shaped.** `isClaudeExecutor()` matches
   `/claude|opus|sonnet|haiku/i`. Routing a validation that pairs a row **DeepSeek** executed
   returns `lane: 'claude'` — "a non-Claude model executed it, so the in-session agent validates."
   With Claude as root that is correct and independent. **With DeepSeek as root, the in-session
   agent *is* DeepSeek — so DeepSeek validates its own work, and the invariant inverts into
   guaranteed self-validation with no warning.**
2. **The 🧠 Planner lane is hardcoded in-session** (`'deep reasoning stays with Claude in-session'`).
   Root the run on a fast model and every Planner cell is silently executed *by that fast model* —
   the exact thing the lane exists to prevent.

<!-- ROOT_FALLBACK_TIP_START -->
> [!TIP]
> ### If you hit your Claude limit — a temporary root
>
> **First, drop a tier rather than switching root:**
>
> ```bash
> claude --model sonnet     # or haiku
> ```
>
> Still the `claude` CLI, so slash-commands work and both couplings hold as designed. Claude limits are
> usually per-tier, so Opus running out often does not mean Sonnet has.
>
> **If Claude is fully unavailable**, the only workable alternative is **`codex`, with the template
> inlined** — because codex cannot expand `/wb*`. This is exactly what the wave script already does for
> codex leaf cells:
>
> ```bash
> codex exec -m gpt-5.6-terra \
>   --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
>   "Read .wb/commands/wbWork/wbWork_template.md and execute the procedure described there.
>    Arguments / target: <scope_path> --wave=A -y" \
>   < /dev/null
> ```
>
> `< /dev/null` is **required** — codex reads stdin even when given a prompt argument, and inside a
> script it will otherwise hang.
>
> **Two conditions:**
>
> 1. **Use a big thinker.** The root runs 🧠 Planner and ✅ Validator cells itself — `gpt-5.6-terra` or
>    `gpt-5.6-sol`, never `luna` or a flash tier.
> 2. **The root model must not also appear in your roster as a leaf executor.** The self-validation flip
>    only bites when the root validates a row *it also executed*. Check with `wb-flow model --show`
>    before you start.
>
> **And watch the gates.** The root's real job is classifying cells as INFRA / NO-OP / ATTEMPTED / DONE.
> Re-run each row's `Verify` yourself before ticking a Done box — a gate verdict is a hypothesis, not a
> result.
>
> Fine for a day. Not a new default. Nothing in the code enforces any of this, so the discipline is
> yours.
<!-- ROOT_FALLBACK_TIP_END -->

### Rule — **decided 2026-08-02: root on Claude, delegate leaves**

| Root agent | Verdict |
|---|---|
| **Claude Code (any Opus/Sonnet tier)** | ✅ **The supported root.** Both couplings hold as designed. |
| **A different big thinker** (Kimi K2.7 Code, GLM-5.2) | 🚫 **Declined, not deferred.** The orchestrator-relative executor check that would make this legitimate was scoped and **deliberately not built** — see below. Do not re-propose it as a task. |
| **Gemini 3.1 Pro / any `agy` model** | 🚫 Blocked twice over, independently of the above: `wave` spawns with `opencode run` and cannot dispatch an `agy` name at all, and Antigravity is untrusted as an executor since 2026-07-25. |
| **A fast/cheap model** (DeepSeek V4 Pro, Qwen 3.7 Plus, any Flash) | 🚫 Never a root. Use them as **leaf executors** — that is what the 🔨/📋 rows are for. |

**Delegating a leaf task to a cheap model is the design. Rooting the tree on one is not.**

> **Why the alternative-root work was declined.** Two changes would have been needed: an
> `--orchestrator=<name>` flag so the Done-column check and the Planner lane ask *"is the executor
> the orchestrator?"* rather than *"is the executor Claude?"*, plus a known-outcome acceptance wave
> (four cells with predetermined verdicts — DONE / INFRA / NO-OP / ATTEMPTED — checking whether the
> candidate root's Done boxes match reality). The first is contained; the second is what actually
> separates *permitted* from *safe*. Together they buy the ability to root the tree on a model that
> is cheaper but not better at the one job the root does: judging whether work actually happened.
> That trade was not worth making. **Root on Claude; spend the cheap tier on leaves.**

---

## The Logic — the `--reset` baseline

> **This is what a reset aims at.** `wb-flow model --reset` re-derives from what your machine can
> reach, ranked by the rules below. There is no packaged list of model *names* — that would be
> someone else's subscriptions.

| Role | Preference order (capability), then a **different pool** at each step |
|---|---|
| 🧠 **Planner** | orchestrator → opus → gemini-*-pro → fable → sonnet → mythos → kimi-k3 → kimi-k2.7 → glm-5.2 → grok-4 |
| ✅ **Validator** | orchestrator → opus → gemini-*-pro → fable → kimi-k2.7 → kimi-k3 → glm-5.2 → sonnet |
| 🔨 **Worker** | deepseek-v4-pro → gemini-*-pro → kimi-k2.7-code → qwen*-max → minimax-m3 → glm-5.2 → codex → sonnet → opus → **orchestrator (last resort)** |
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
| `opencode-zen` | metered pay-as-you-go | 5 |
| anything else | incidental credentials | 9 |

Three passes, loosening one constraint at a time: **new pool + new family** → **new pool, family may
repeat** (the same model on a different subscription is the *ideal* fallback: identical capability,
independent limits) → **anything unused**. Never the same model from the same pool twice.

Two consequences worth knowing:

- **Mechanical gets `gemini-*-flash`, not `-pro`.** The role is defined as "no judgment to buy";
  a Pro-tier reasoner there is paying for something you explicitly do not want.
- **Worker and Mechanical end at the orchestrator.** It is a third pool that is never metered and
  never provider-rate-limited, so the chain degrades to "do it here" instead of failing outright.

**Hard fallback** when no roster resolves at all (`bin/wave.js` `DEFAULT_MODELS`) — routing labels it
`built-in DEFAULT_MODELS`, which is a *symptom that your roster was not read*, not a setting:

```
worker         opencode-go/deepseek-v4-pro
mechanical     opencode-go/qwen3.7-plus
selfValidator  opencode-go/kimi-k2.7-code
```

### Dispatch syntax per CLI

```bash
# claude — the in-session root, or headless
claude -p --permission-mode auto --model claude-opus-5 "hi! who are you?"

# agy — bare model name, permissions flag MANDATORY (see Annex B)
agy -p --model gemini-3.1-pro-high --dangerously-skip-permissions "/wbWork <plan.md> --id=1"

# opencode — provider-prefixed slug, slash-command via --command
opencode run -m opencode/deepseek-v4-pro --dangerously-skip-permissions \
  --command wbWork "<plan.md> --id=1 --no-plan-update"

# codex — headless is the `exec` SUBCOMMAND; the prompt must name the template,
# and stdin must be closed. Every one of those three differs from the others.
codex exec -m gpt-5.6-terra --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check -C "$REPO" \
  "Read ~/.wb-flow/commands/wbWork/wbWork_template.md and execute the procedure described there.
Arguments / target: <plan.md> --id=1 --no-plan-update" < /dev/null

# a full fallback chain, tried left to right
agy -p --model gemini-3.1-pro-high --dangerously-skip-permissions "hi! who are you?" \
  || opencode run -m opencode/deepseek-v4-pro --dangerously-skip-permissions "hi! who are you?" \
  || claude -p --permission-mode auto "hi! who are you?"
```

## 🛰️ Verifying a catalog — `wb-flow model --probe --all`

Routing is only half the problem; the other half is knowing which models actually
answer. `--probe` dispatches one trivial prompt per model and reports the result.

| Form | Probes | Output |
|---|---|---|
| `--probe --all` | whole catalog | reachable models only, grouped by role |
| `--probe --all=raw` | whole catalog | everything, streamed, failures included |
| `--probe --all=<provider>` | one provider | grouped by role |
| `--probe --all=<role>` | one role | grouped by role |

`<provider>` is matched against the `provider` field in `models.json`
(`anthropic`, `openai`, `antigravity`, `openrouter`, `opencode-go`, `opencode-zen`,
`github-copilot`); `<role>` is one of `planner`, `validator`, `worker`, `mechanical`.

**The forms behave identically with and without `--pick`** — the interactive picker
and the headless/CI path share one implementation, so a filter narrows the probe in
both, and both route through the table below rather than re-deriving a CLI from the
slug. Before 1.0.2 the headless path did neither, and reported every `anthropic/*`
and `openai/*` model as *"Insufficient balance"* while `claude` and `codex` answered
them instantly.

<!-- CLI_MATRIX_START -->

## 🔌 Invocation matrix — every provider, every language

> **Generated** from [`bin/cli_registry.js`](../../bin/cli_registry.js) by `node bin/gen_cli_matrix.js --write`.
> Do not hand-edit between the markers — `npm test` fails if this block drifts from the code.
> Default prompt throughout: `hi! who are you?`

### Which CLI serves which provider

The `provider` field in `.wb/models.json` decides this — **not** the model name.
`claude-opus-4-6-thinking` is Anthropic-branded but Antigravity-served, and
`gpt-oss-120b-medium` carries a `gpt` prefix while belonging to Google's pool.

| `provider` in models.json | CLI | Model argument | Example slug |
|---|---|---|---|
| `anthropic` | `claude` | **bare** — `claude-opus-5` | `anthropic/claude-opus-5` |
| `openai` | `codex` | **bare** — `gpt-5.6-terra` | `openai/gpt-5.6-terra` |
| `antigravity` | `agy` | **bare** — `gemini-3.1-pro-high` | `gemini-3.1-pro-high` |
| `google` | `gemini` | **bare** — `gemini-3.1-pro` | `gemini-3.1-pro` |
| `github-copilot` | `copilot` | **bare** — `(none)` | `github-copilot/auto` |
| `openrouter` | `opencode` | namespaced — `openrouter/openai/gpt-4o` | `openrouter/openai/gpt-4o` |
| `opencode-go` | `opencode` | namespaced — `opencode-go/deepseek-v4-pro` | `opencode-go/deepseek-v4-pro` |
| `opencode-zen` | `opencode` | namespaced — `opencode/gemini-3.1-pro` | `opencode/gemini-3.1-pro` |

> A provider absent from this table falls back to `opencode`, which is the only
> CLI that accepts an arbitrary `provider/model` slug.

### `claude` — serves `anthropic`

```bash
claude -p --model claude-opus-5 --permission-mode auto "hi! who are you?"
```

```python
import subprocess
r = subprocess.run(
    ['claude', '-p', '--model', 'claude-opus-5', '--permission-mode', 'auto', 'hi! who are you?'],
    capture_output=True, text=True,
)
print(r.stdout)
```

```javascript
const { spawnSync } = require('child_process');
const r = spawnSync('claude', ['-p', '--model', 'claude-opus-5', '--permission-mode', 'auto', 'hi! who are you?'], {
  encoding: 'utf8',
});
console.log(r.stdout);
```

### `codex` — serves `openai`

- **stdin must be closed** (`< /dev/null`) — it reads stdin even with a prompt argument, so inside a script it hangs.
- **expands no slash-command** — the prompt must name the template file itself.

```bash
codex exec -m gpt-5.6-terra --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null
```

```python
import subprocess
r = subprocess.run(
    ['codex', 'exec', '-m', 'gpt-5.6-terra', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'],
    capture_output=True, text=True, stdin=subprocess.DEVNULL,
)
print(r.stdout)
```

```javascript
const { spawnSync } = require('child_process');
const r = spawnSync('codex', ['exec', '-m', 'gpt-5.6-terra', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});
console.log(r.stdout);
```

### `agy` — serves `antigravity`

- **`-p` must be the last flag before the prompt** — Go's `flag` package treats it as `--print` and eats the next argv entry.

```bash
agy --model gemini-3.1-pro-high --dangerously-skip-permissions -p "hi! who are you?"
```

```python
import subprocess
r = subprocess.run(
    ['agy', '--model', 'gemini-3.1-pro-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
    capture_output=True, text=True,
)
print(r.stdout)
```

```javascript
const { spawnSync } = require('child_process');
const r = spawnSync('agy', ['--model', 'gemini-3.1-pro-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], {
  encoding: 'utf8',
});
console.log(r.stdout);
```

### `opencode` — serves `openrouter`

```bash
opencode run -m openrouter/openai/gpt-4o --dangerously-skip-permissions "hi! who are you?"
```

```python
import subprocess
r = subprocess.run(
    ['opencode', 'run', '-m', 'openrouter/openai/gpt-4o', '--dangerously-skip-permissions', 'hi! who are you?'],
    capture_output=True, text=True,
)
print(r.stdout)
```

```javascript
const { spawnSync } = require('child_process');
const r = spawnSync('opencode', ['run', '-m', 'openrouter/openai/gpt-4o', '--dangerously-skip-permissions', 'hi! who are you?'], {
  encoding: 'utf8',
});
console.log(r.stdout);
```

### `gemini` — serves `google`

- does not expand `/wb*` slash-commands.

```bash
gemini -m gemini-3.1-pro -p "hi! who are you?"
```

```python
import subprocess
r = subprocess.run(
    ['gemini', '-m', 'gemini-3.1-pro', '-p', 'hi! who are you?'],
    capture_output=True, text=True,
)
print(r.stdout)
```

```javascript
const { spawnSync } = require('child_process');
const r = spawnSync('gemini', ['-m', 'gemini-3.1-pro', '-p', 'hi! who are you?'], {
  encoding: 'utf8',
});
console.log(r.stdout);
```

### `copilot` — serves `github-copilot`

- does not expand `/wb*` slash-commands.

```bash
copilot --allow-all -p "hi! who are you?"
```

```python
import subprocess
r = subprocess.run(
    ['copilot', '--allow-all', '-p', 'hi! who are you?'],
    capture_output=True, text=True,
)
print(r.stdout)
```

```javascript
const { spawnSync } = require('child_process');
const r = spawnSync('copilot', ['--allow-all', '-p', 'hi! who are you?'], {
  encoding: 'utf8',
});
console.log(r.stdout);
```

### Full fallback chain

A role's chain is tried left to right with bash `||`; each link is whichever
CLI the table above assigns, so one chain routinely spans several CLIs:

```bash
.wb/bin/wbRun claude -p --model claude-opus-5 --permission-mode auto "hi! who are you?" \
  || .wb/bin/wbRun codex exec -m gpt-5.6-terra --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null \
  || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions "hi! who are you?"
```

<!-- CLI_MATRIX_END -->

## 📎 Annex A — Verified model roster (`opencode-go/*`)

> The free/Go tier every 🔨 Worker and 📋 Mechanical dispatch above routes to.
> **Captured 2026-08-02 from `opencode models | grep "^opencode-go/"` — 17 slugs.**
> Re-verify with that exact command; a drifted slug fails at G1 with `Error: Model not found`.

| Slug (use verbatim in `-m`) | Family | Typical role |
|---|---|---|
| `opencode-go/deepseek-v4-pro` | DeepSeek | 🔨 Worker — default |
| `opencode-go/deepseek-v4-flash` | DeepSeek | 📋 Mechanical |
| `opencode-go/kimi-k2.7-code` | Kimi / Moonshot | ✅ Validator — default self-validator |
| `opencode-go/kimi-k2.6` | Kimi / Moonshot | ✅ Validator — previous generation |
| `opencode-go/kimi-k3` | Kimi / Moonshot | ✅ Validator — newest, untested here |
| `opencode-go/glm-5.2` | GLM / Zhipu | 🧠 Planner / ✅ Validator fallback |
| `opencode-go/glm-5.1` | GLM / Zhipu | previous generation |
| `opencode-go/qwen3.7-plus` | Qwen | 📋 Mechanical — default (**no hyphen** after `qwen3`) |
| `opencode-go/qwen3.7-max` | Qwen | 🔨 Worker alternative |
| `opencode-go/qwen3.6-plus` | Qwen | previous generation |
| `opencode-go/grok-4.5` | Grok / xAI | 🧠 Planner — independent lineage |
| `opencode-go/minimax-m3` | MiniMax | 🔨 Worker alternative |
| `opencode-go/minimax-m2.7` | MiniMax | previous generation |
| `opencode-go/mimo-v2.5-pro` | MiMo | 🔨 Worker alternative |
| `opencode-go/mimo-v2.5` | MiMo | 📋 Mechanical alternative |
| `opencode-go/gpt-5.6-luna` | OpenAI (via Go) | 🧠 Planner — independent lineage |
| `opencode-go/hy3` | Hunyuan | untested here |

> ⚠️ **`opencode-go/qwen3.7-plus` has no hyphen after `qwen3`.** The `wb-flow-pro` copy of this
> file carries `opencode-go/qwen-3.7-plus`, which does not exist and fails at G1. This file is correct.

`opencode models` also lists ~656 slugs across other providers (`opencode/*`, paid tiers).
Only the `opencode-go/*` rows above are covered by the Go subscription.

---

## 📎 Annex B — `agy` model roster (Antigravity / Google)

> **Captured 2026-08-02 from `agy models` — 11 models. Syntax below verified in a real terminal.**

| Name (pass to `--model`) | Display |
|---|---|
| `gemini-3.6-flash-high` / `-medium` / `-low` | Gemini 3.6 Flash |
| `gemini-3.5-flash-high` / `-medium` / `-low` | Gemini 3.5 Flash |
| `gemini-3.1-pro-high` | Gemini 3.1 Pro (High) |
| `gemini-3.1-pro-low` | Gemini 3.1 Pro (Low) |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 (Thinking) |
| `claude-opus-4-6-thinking` | Claude Opus 4.6 (Thinking) |
| `gpt-oss-120b-medium` | GPT-OSS 120B (Medium) |

### Verified syntax

```bash
# Pin a model explicitly — deterministic, what a roster dispatch should use
agy -p --model gemini-3.1-pro-high --dangerously-skip-permissions "hi! who are you?"
#   → "You are currently using the **Gemini 3.1 Pro** model."

# Omit --model — agy picks its own default (currently Gemini 3.1 Pro)
agy -p "hi! who are you?"
#   → "I am Antigravity … The underlying model powering me right now is Gemini 3.1 Pro."

# WITHOUT --dangerously-skip-permissions, any prompt needing a tool fails:
agy -p "<prompt that needs a tool>"
#   → "no output produced — a tool required the \"command\" permission that headless
#      mode cannot prompt for, so it was auto-denied."
```

**`--dangerously-skip-permissions` is mandatory for any dispatch that touches files or runs commands.**
Without it, headless mode auto-denies and returns nothing — which looks like an empty success, not an
error. That is the single most confusing `agy` failure mode.

### Other flags worth knowing

| Flag | Use |
|---|---|
| `--effort low / medium / high` | reasoning effort for the session |
| `-c` / `--continue` | continue the most recent conversation |
| `--conversation <ID>` | resume a specific conversation (no way to *list* IDs — capture at creation) |
| `--output-format text / json / stream-json` | machine-readable output |
| `--mode accept-edits / plan` | execution mode |
| `--print-timeout` | default 5m0s |
| `--sandbox` | terminal restrictions |

There is **no persisted default-model setting** — `--model` is per-invocation. The interactive
"Switch Model" picker never appears in `-p` mode.

### ⚠️ Status with `wb-flow wave`

**`agy` works. `wave` cannot dispatch it — that is a gap in `bin/wave.js`, not a fault in `agy`.**
`buildScript` emits `opencode run` for every spawned cell, so an `agy` model name resolves and then
dies at G1 with `Model not found`. Routing warns about this at `--list` time.

Until a `agy` lane exists in the generator, use `agy` for **manual** dispatches and the `||` fallback
chains in this file. See [Provider status](#-provider-status-2026-08-02) — as of today `agy` is the
only *working* delegated executor.

## 📎 Annex C — `claude` CLI

The 🧠 Planner and ✅ Validator lanes dispatch with `claude -p --permission-mode auto "hi! who are you?"`,
which uses whatever model the Claude Code session is configured for. Pin one with `--model`
(`claude -p --model claude-opus-5 …`). **Note the self-delegation rule in §User Models before
writing any `claude -p` dispatch — most of the time you should not spawn one at all.**

---

## 📎 Annex C2 — `codex` CLI (OpenAI Codex)

> **Verified against `codex-cli 0.146.0`, 2026-08-03.** Every claim below was measured, not
> recalled — the flag names in particular are unlike every other CLI here.

### Four ways codex differs from every other lane

| | codex | everything else |
|---|---|---|
| Headless entry | **`codex exec`** — a subcommand | `claude -p`, `agy -p`, `opencode run` |
| `-p` means | **`--profile`** | "print / headless" |
| Skip approvals | `--dangerously-bypass-approvals-and-sandbox` | `--dangerously-skip-permissions` |
| Slash-commands | **none — expands nothing** | `--command` (opencode), skill dispatcher (agy) |

The `-p` collision is the dangerous one. `codex -p "/wbWork …"` does not run headless — it tries to
load a *config profile* named `/wbWork …` and behaves nothing like the dispatch you meant.

### Verified syntax

```bash
# the shape wb-flow emits
codex exec -m gpt-5.6-terra \
  -C "$REPO" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Read <abs path to wbWork_template.md> and execute the procedure described there.
Arguments / target: <plan.md> --id=1 --no-plan-update" < /dev/null
```

**`< /dev/null` is not optional.** codex reads stdin *even when a prompt argument is present*
("Reading additional input from stdin…"). Inside a wave script stdin **is the script**, so an
unredirected dispatch eats the remaining lines and hangs. In Python/Node the equivalent is
`stdio: ['ignore', …]` / `stdin=subprocess.DEVNULL`.

**The prompt names the template because codex expands no slash-command.** Given a real prompt file
at `~/.codex/prompts/x.md` and the prompt `/x`, codex 0.146.0 treated the text literally and went
searching the filesystem for matching entrypoints. So `wb-flow wave` sends codex the same sentence
the `.md` wrappers give Claude and OpenCode — "Read `<template>` and execute it" — instead of
`/wbWork …`.

### Models — and why this list is curated, not queried

**codex has no `models` subcommand.** `opencode models` and `agy models` both enumerate; codex
cannot. wb-flow therefore ships a curated candidate list (`CODEX_CANDIDATES` in `bin/model.js`)
and leaves confirmation to `--probe`.

Entitlement is **per ChatGPT plan**, so the binary knowing a name proves nothing. Probed on the
owner's account, 2026-08-03:

| Model | Status | Notes |
|---|---|---|
| `gpt-5.6-terra` | ✅ answers | the **default**; flagship — 🧠 Planner / ✅ Validator / 🔨 Worker |
| `gpt-5.6-luna` | ✅ answers | mid tier |
| `gpt-5.5` | ✅ answers | previous flagship |
| `gpt-5.4-mini` | ✅ answers | cheap — 📋 Mechanical |
| `gpt-5.6`, `gpt-5.6-sol`, `gpt-5.6-pro` | ❌ refused | *"not supported when using Codex with a ChatGPT account"* |
| `gpt-5.4`, `gpt-5.3-codex`, `gpt-5.2-codex`, `gpt-5.1`, `o3` | ❌ refused | catalogued by the binary, not on this plan |

```bash
wb-flow model --detect --probe      # the only way to learn what YOUR plan serves
codex exec -m gpt-5.6-terra "reply with the single word: ok" < /dev/null
```

Reasoning effort is a config override, not a name suffix (contrast agy's `-high`/`-low`):

```bash
codex exec -m gpt-5.6-terra -c model_reasoning_effort=high "…" < /dev/null
```

### Bare names — the `gpt-oss` trap

codex slugs carry **no provider prefix**, exactly like agy's. Two consequences wb-flow encodes:

- **`gpt-oss-120b-medium` is an *agy* model, not codex**, despite the `gpt` prefix. Only the effort
  suffix separates them, so `AGY_ONLY` is always tested first.
- **A prefixed slug is never codex.** `gpt-5.6-terra` exists under *seven* providers on this
  machine — bare (ChatGPT), `openai/`, `openrouter/openai/`, `github-copilot/`, `opencode/`,
  `opencode-go/`. Same model, six different wallets. Only the bare name bills to your ChatGPT plan.

### G1 gate — codex speaks a different error dialect

codex prints the raw API envelope rather than `Error: …`:

```
ERROR: {"type":"error","status":400,"error":{"type":"invalid_request_error",
        "message":"The 'X' model is not supported when using Codex with a ChatGPT account."}}
```

`INFRA_GREP_PATTERN` matches the **structure** (`^ERROR: {"type":"error"`), not any wording — that
covers 400 entitlement, 401 auth, 429 usage-limit and 5xx alike, and survives OpenAI rewording the
message. Exit codes are honest here (**1** on API error, **2** on a bad flag), unlike `agy`, which
returns 0 on a silent auto-denial.

### Status with `wb-flow wave`

✅ **Fully dispatchable.** `cliFor()` routes bare `gpt-5.*` names to `codex exec`; the chain,
G1 fallback, `--summary` and per-id gates all work. The one unsupported feature is **`--sessions`**:
codex's `resume` keys off its own session ids rather than a title you can set, so codex cells always
run cold. Warm reuse still works on the opencode links of the same chain.

---

## 📎 Annex D — Subscriptions inventory

| Tier | Covers | Priority for |
|---|---|---|
| **Claude Pro** | Claude Code session + `claude -p` | 🧠 Planner, ✅ Validator — highest-complexity judgment |
| **Google One** | `agy` Gemini roster (Annex B) | long context — ⚠️ not dispatchable by `wave` |
| **Go subscription** | all 17 `opencode-go/*` slugs (Annex A) | 🔨 Worker, 📋 Mechanical — flat-rate, $0 marginal |
| **ChatGPT** | `codex exec` — 4 verified models (Annex C2) | any role — a **fourth limit window** to alternate into |
| **Zen / OpenAI, Kimi / Moonshot** | reachable through `opencode-go/*` | second-opinion validators of a different lineage |

> **The Go tier is flat-rate.** Token counts on `opencode-go/*` dispatches cost no marginal money —
> which is why `--sessions` (see `/wbWork`) is a latency-and-consistency lever, not a cost one.
> Real spend lives in the Claude Pro lane: the orchestrator's own context.

---

## 📎 Annex E — Delegated commands: which flags belong where

`--summary` and `--sessions` govern **how a wave is orchestrated**, not how a single agent is
launched. They are flags of `wb-flow wave` and of `/wbWork … --wave=…`. They are **never** flags
of `opencode run`, `agy -p` or `codex exec`.

| What you are dispatching | Carries `--summary` / `--sessions`? | Shape |
|---|---|---|
| A single task to a sub-agent | **No** — unknown flag, the run fails | `wbRun opencode run -m <slug> --dangerously-skip-permissions --command wbWork "<plan> --id=1 --no-plan-update"` |
| A single task to **codex** | **No** | `wbRun codex exec -m gpt-5.6-terra --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "Read <template> …" < /dev/null` |
| A whole wave to a headless Claude | **Yes — inside the prompt string** | `wbRun claude -p --permission-mode auto "/wbWork <plan> --wave=A --sessions"` |
| A wave from your own session | **Yes** | `/wbWork <plan> --wave=A --sessions` |
| The generator directly | **Yes** | `wb-flow wave <plan> --wave=A --summary --sessions` |

`--summary` is **already the default** in wave mode — pass `--no-summary` to get the raw stream
back while debugging one cell. `--sessions` is opt-in and, on the flat-rate Go tier, is a
latency-and-consistency lever rather than a cost one.

---

---

---

## 🐍🟢 Annex F — Calling these from Python and Node

Every command in this manual is a CLI. Python and Node don't *replace* them — they **wrap** them.
So this annex does not restate each command three times: `subprocess.run(["agy", "-p", …])` is the
same command wearing ceremony, and a 3-column table of that would triple the file and halve its use.

What follows is the part that genuinely differs: **parsing, timeouts, and capture**.

> **Every snippet below was executed against this machine on 2026-08-02**, not written from memory:
> the discovery pair both return 17 `opencode-go/*` slugs, the JSON query returns 26 sessions without
> `jq`, and the INFRA regex matches the exact `Insufficient balance` string captured during Wave A.

### The three rules that matter more than the syntax

| Rule | Why |
|---|---|
| **Pass argv as a list — never a shell string** | `shell=True` / `{shell:true}` concatenates instead of escaping. A model slug or prompt containing a quote becomes an injection. Node warns about it (DEP0190). |
| **Always set a timeout** | On 2026-08-02 `opencode-go` inference hung: not an error, no output, just a process that never returns. Without a timeout your script hangs with it. |
| **Read the exit code AND stdout** | A CLI can exit 0 having done nothing — headless `agy` without `--dangerously-skip-permissions` returns empty output with status 0. Neither signal is sufficient alone. |

### Equivalence by task, not by command

#### 1 · Discovery — list what's installed

```bash
opencode models | grep "^opencode-go/"
agy models
opencode providers list
```

```python
import subprocess
out = subprocess.run(["opencode", "models"], capture_output=True, text=True, timeout=45).stdout
go = [l.strip() for l in out.splitlines() if l.startswith("opencode-go/")]
```

```javascript
const { execFileSync } = require("child_process");
const out = execFileSync("opencode", ["models"], { encoding: "utf8", timeout: 45000 });
const go = out.split("\n").map(l => l.trim()).filter(l => l.startsWith("opencode-go/"));
```

**The win over bash:** you get a list, not a stream. No `grep`, and the filter is testable.
Reference implementation: [`bin/model.js`](../../bin/model.js) → `detect()`.

#### 2 · JSON queries — no `jq` dependency

```bash
opencode session list --format json | jq -r '[.[]|select(.title==$t)]|sort_by(.created)|.[-1].id'
```

```python
import json, subprocess
rows = json.loads(subprocess.run(["opencode", "session", "list", "--format", "json"],
                                 capture_output=True, text=True, timeout=45).stdout)
hit = sorted([r for r in rows if r["title"] == title], key=lambda r: r["created"])
sid = hit[-1]["id"] if hit else None
```

```javascript
const rows = JSON.parse(execFileSync("opencode", ["session", "list", "--format", "json"],
                                     { encoding: "utf8", timeout: 45000 }));
const hit = rows.filter(r => r.title === title).sort((a, b) => a.created - b.created);
const sid = hit.length ? hit[hit.length - 1].id : null;
```

**The win:** `jq` stops being a dependency — and its absence is a real failure mode
(`wb-flow wave --sessions` reports it explicitly for that reason).

#### 3 · Probing — does a model actually answer?

```bash
timeout 45 opencode run -m opencode/deepseek-v4-pro --dangerously-skip-permissions "reply ok"
```

```python
import subprocess
def probe(slug, timeout=45):
    try:
        r = subprocess.run(["opencode", "run", "-m", slug,
                            "--dangerously-skip-permissions", "reply with the single word: ok"],
                           capture_output=True, text=True, timeout=timeout)
        return r.returncode == 0            # exit code is the verdict
    except subprocess.TimeoutExpired:
        return False                        # a hang is a failure, not a wait
```

```javascript
const { spawnSync } = require("child_process");
function probe(slug, timeout = 45000) {
  const r = spawnSync("opencode", ["run", "-m", slug,
                      "--dangerously-skip-permissions", "reply with the single word: ok"],
                      { encoding: "utf8", timeout });
  return r.status === 0 && !r.error;        // r.error carries ETIMEDOUT
}
```

**The win:** bash needs `timeout(1)`; both languages have it built in and can *distinguish* a
timeout from a non-zero exit. That distinction is the whole point — catalogued ≠ credentialed ≠
reachable. Reference implementation: [`bin/model.js`](../../bin/model.js) → `probeModel()`.

#### 4 · Dispatch with capture — the shape a wave cell uses

```bash
agy -p --model gemini-3.1-pro-high --dangerously-skip-permissions "/wbWork plan.md --id=1"
```

```python
r = subprocess.run(["agy", "-p", "--model", "gemini-3.1-pro-high",
                    "--dangerously-skip-permissions", "/wbWork plan.md --id=1"],
                   capture_output=True, text=True, timeout=600)
infra = r.returncode != 0 or re.match(r"^Error: (Model not found|Insufficient )", r.stdout, re.M)
```

```javascript
const r = spawnSync("agy", ["-p", "--model", "gemini-3.1-pro-high",
                    "--dangerously-skip-permissions", "/wbWork plan.md --id=1"],
                    { encoding: "utf8", timeout: 600000 });
const infra = r.status !== 0 || /^Error: (Model not found|Insufficient )/m.test(r.stdout || "");
```

**The win:** exit code and stdout arrive together, so the G1/INFRA test is one expression instead of
a temp file plus `PIPESTATUS`. The regex is the same anchored pattern the generator emits — see
`INFRA_GREP_PATTERN` in [`bin/wave.js`](../../bin/wave.js).

### Command-shape equivalence (Annex E, extended)

| What you are dispatching | bash | Python | Node |
|---|---|---|---|
| Single task to a sub-agent | `wbRun opencode run -m <slug> --dangerously-skip-permissions --command wbWork "<args>"` | `subprocess.run([...], timeout=600)` | `spawnSync(..., {timeout: 600000})` |
| A whole wave to headless Claude | `wbRun claude -p --permission-mode auto "/wbWork <plan> --wave=A"` | same argv, prompt as one list item | same argv, prompt as one array item |
| Discovery | `opencode models \| grep ^opencode-go/` | `.stdout.splitlines()` + filter | `.split("\n")` + `.filter()` |
| Session id by title | `… --format json \| jq -r '…'` | `json.loads(...)` | `JSON.parse(...)` |

### What you do **not** need to reimplement

`wb-flow` already wraps all of this, tested:

| Task | Just run |
|---|---|
| detect + rank + write the roster | `wb-flow model --detect` |
| prove a model answers | `wb-flow model --probe` |
| build and run a wave | `wb-flow wave <plan> --wave=A` |
| pin an output | `wb-flow snap <path>` |
| how to run a plan | `wb-flow next <plan>` |

Reach for Python/Node when you are embedding wb-flow **into** something — CI, a dashboard, a
scheduler. For everything else the CLI is the supported surface, and it is the one with tests
behind it.

---

## 🚦 Provider status (2026-08-02)

Measured, not assumed. Re-check with `wb-flow model --probe`.

| Provider | Status | Evidence |
|---|---|---|
| **`agy`** (Google One) | ✅ **WORKS** | `agy -p --model gemini-3.1-pro-high …` answers; 11 models listed |
| **`claude`** (Claude Pro) | ✅ works | in-session root; `claude -p` available |
| **`opencode-go/*`** (Go sub) | ❌ **unreachable** | 5 probes / 4 models / 2 days → `ETIMEDOUT` at 45–150 s |
| **`opencode/*`** (OpenCode Zen) | ❌ **no balance** | `Error: Insufficient balance.` — hit live during Wave A |
| `deepseek/`, `nvidia/`, `github-copilot/`, `openrouter/` | ❓ untested | credentialed per `opencode providers list`; never probed |

> **Consequence:** `agy` is currently the **only working delegated executor**, and `wave` cannot
> dispatch it. Until the generator gets an `agy` lane, delegated waves have no working lane —
> run tasks in-session, or probe the untested `opencode` providers above for one that answers.

### The three things that break a dispatch, in order of how often

1. **No `--dangerously-skip-permissions`** on `agy` → silent empty output, not an error.
2. **Wrong slug prefix** — `opencode-go/qwen3.7-plus` vs `opencode/qwen3.7-plus` are different
   providers with the same model. One times out; the other bills.
3. **Catalogued ≠ reachable** — `opencode models` lists 656 slugs; the catalog says nothing about
   whether the provider answers or has balance.

---

## 🔁 Re-verifying this manual

```bash
opencode models | grep "^opencode-go/"     # Annex A
opencode providers list                     # which providers hold credentials
agy models                                  # Annex B
wb-flow model --detect                      # propose a roster from the above
wb-flow model --probe                       # the ONLY check that proves a model answers
```

---

## 📚 Annex G — Full command glossary

Every `/wb*` command, every `wb-flow` subcommand and flag, and what each looks like from bash,
Python and Node. Rows with no equivalent are listed anyway and say so — an absent alternative is
information.

### The distinction that runs through this whole table

**28 of the 33 `/wb*` commands are agent-only. 5 have a deterministic CLI behind them.**

| | Agent-only | CLI-backed |
|---|---|---|
| What it is | a **prompt** an agent reads and acts on | **code** with tests |
| Reproducible? | no — same input can yield different output | yes — same input, same output |
| Callable from Python/Node? | only by *dispatching an agent* (see the universal shape below) | directly |
| Fails how? | silently, in prose | non-zero exit |

This is why `wb-flow model`, `wave`, `next` and `snap` exist at all: each replaced a step a template
used to ask an agent to improvise, and improvisation is where the drift came from — a hand-rolled
`ln -s`, a mis-escaped `\|\|`, a slug that never existed.

### The universal programmatic shape

Any `/wb*` command — agent-only included — can be invoked programmatically by dispatching it to an
agent CLI. This is the shape referenced as **“dispatch”** throughout the table:

```bash
wbRun opencode run -m <slug> --dangerously-skip-permissions --command wbAudit "<target>"
wbRun agy -p --model <name> --dangerously-skip-permissions "/wbAudit <target>"
```

```python
subprocess.run(["opencode", "run", "-m", slug, "--dangerously-skip-permissions",
                "--command", "wbAudit", target], capture_output=True, text=True, timeout=600)
```

```javascript
spawnSync("opencode", ["run", "-m", slug, "--dangerously-skip-permissions",
          "--command", "wbAudit", target], { encoding: "utf8", timeout: 600000 });
```

> **`agy` differs**: it has no `--command` flag — the slash-command rides inside the prompt string,
> and `--dangerously-skip-permissions` is mandatory or headless mode auto-denies every tool and
> returns empty output with exit 0. See Annex B.

### 1 · The 33 `/wb*` commands

| `/wb*` command | What it does | Deterministic CLI equivalent |
|---|---|---|
| `/wbActOn` | Turns a diagnostic document (audit, plan, review) into a ranked executi… | — *agent-only* |
| `/wbAudit` | Performs a deep, honest, code-based technical audit. | — *agent-only* |
| `/wbBroadcast` | Generates an Announcement Kit and manages version lifecycle status. | — *agent-only* |
| `/wbCheck` | Pre-Flight Context Quiz to verify worker model understanding. | — *agent-only* |
| `/wbClean` | Scans for dead code, unused files, and obsolete dependencies. | — *agent-only* |
| `/wbContext` | Generates a comprehensive Context Report containing identity, dependenc… | — *agent-only* |
| `/wbDebug` | Isolates and fixes errors following the Scientific Method. | — *agent-only* |
| `/wbDeploy` | Orchestrates deployment of consumer apps to web hosts (Vercel, AWS, VPS). | — *agent-only* |
| `/wbDoc` | Injects JSDoc/TSDoc comments and generates README files without modifyi… | — *agent-only* |
| `/wbExplain` | Generate persistent, formatted explanations for a specific task ID, a c… | — *agent-only* |
| `/wbGit` | Analyzes current file changes and generates Conventional Commits. | — *agent-only* |
| `/wbHelp` | Meta-command that catalogs all /wb* commands (no args) or shows the per… | `wb-flow --help` · `wb-flow --list` |
| `/wbIdea` | Tracks, scores, and validates ideas before promoting them to active plans. | — *agent-only* |
| `/wbLicense` | Enforces business logic by injecting premium gating and license checks. | — *agent-only* |
| `/wbModel` | Dynamically updates or displays the active model selections (Planner, V… | `wb-flow model` — `--detect` `--reset` `--pick` `--probe` `--set` `--json` |
| `/wbMonetize` | Bootstraps or maintains the Free/Pro/Dev tier splitting plumbing. | — *agent-only* |
| `/wbNext` | Analyzes the current project state (recent reports, git status, stale T… | `wb-flow next <plan>` — `--embed` `--json` |
| `/wbPlan` | Creates a structured multi-agent task plan for a given problem or objec… | — *agent-only* |
| `/wbPublish` | Executes the final build and NPM deployment based on the wbRelease plan. | — *agent-only* |
| `/wbRefactor` | Restructures and optimizes target code without changing visual behavior… | — *agent-only* |
| `/wbRelease` | Orchestrates the release by resolving circular dependencies and updatin… | — *agent-only* |
| `/wbReview` | Performs a formal quality review of an executed task against an origina… | — *agent-only* |
| `/wbSecure` | Scans for vulnerabilities (secrets, XSS, insecure deps). | — *agent-only* |
| `/wbSetup` | Initializes the Agentic Brain for the target folder by establishing its… | `wb-flow init` — `--scope` `--agents` `--yes` *(wiring only)* |
| `/wbStandup` | Consolidates unfinished work (open tickets, failing audits) into a sing… | — *agent-only* |
| `/wbStopTrack` | Stop session tracking, write final §END section, extract derivative files. | — *agent-only* |
| `/wbTest` | Executes dynamic tests (UNIT, E2E, MANUAL, PERF) to verify code behavior. | — *agent-only* |
| `/wbToWBC` | Rewrites legacy bulky HTML/Vuetify into proprietary WBC-UI2 JSON compon… | — *agent-only* |
| `/wbTrack` | Toggles session tracking ON so every /wb* command produces its normal r… | — *agent-only* |
| `/wbTranslate` | Extracts hardcoded strings and generates localized JSON files (EN, FR,… | — *agent-only* |
| `/wbValid` | Validates a worker's output by running an adversarial review — a second… | — *agent-only* |
| `/wbVision` | Proposes 3 highly innovative, strategic features to build next. | — *agent-only* |
| `/wbWork` | Executes one or more tasks from a plan file as the Worker model, produc… | `wb-flow wave <plan> --wave=<L>` *(only the `--wave` path)* |

*Everything marked agent-only takes the **dispatch** shape above; substitute its own name for
`wbAudit`. Python and Node differ only in `subprocess.run` vs `spawnSync` — see Annex F.*

### 2 · The `wb-flow` CLI surface

| Subcommand | Flags | bash | Python / Node |
|---|---|---|---|
| *(none)* | `--force` `--dry-run` `--list` `--version` `--help` | `wb-flow` | `subprocess.run(["wb-flow"])` / `spawnSync("wb-flow", [])` |
| `init` | `--scope=` `--agents=` `--templates=` `--yes` `--force` `--dry-run` | `wb-flow init --scope=project --agents=detected --yes` | same argv as a list/array |
| `model` | `--detect` `--reset` `--pick`/`-i` `--probe` `--set <role>=<slug>` `--timeout=` `--file=` `--json` `--dry-run` | `wb-flow model --detect --probe` | `subprocess.run(["wb-flow","model","--detect","--json"])` → parse stdout |
| `next` | `--embed` `--json` | `wb-flow next <plan.md> --embed` | `json.loads(...)` / `JSON.parse(...)` on `--json` |
| `snap` | `--label=` `--copy` `--root=` `--list` `--json` `--dry-run` | `wb-flow snap <path> --label=x --copy` | same argv; `--json` returns `{snap,target,kind,label}` |
| `wave` | `--wave=<L>[:<R>]` `--validate` `--summary` / `--no-summary` `--sessions` `--jobs=` `--out=` `--print` `--list` · model overrides `--model=` `--planner=` `--worker=` `--validator=` `--mechanical=` (and `--worker-model=` `--mech-model=` `--validator-model=`) | `wb-flow wave <plan> --wave=A --summary` | `--print` to stdout, then run the script yourself |

> **Short flags on `wave` take `=`, never a space.** `-W=` `-M=` `-p=` `-v=` `-w=` `-m=` are the only
> accepted forms — `-w=zai/glm-4.7` works, **`-w zai/glm-4.7` does not.** A space-separated short flag
> doesn't error: `-w` is dropped and the slug falls into positionals, where it is taken as the *plan
> path*. Note also that `-w=` is `--worker=`; `--wave=` is `-W=`.
>
> `-i` is `--pick` (on `model`), `-n` is `--dry-run` (on `snap` and `init`), and `-M=` is `--model=`.

### 3 · Universal `/wb*` flags

| Flag | Applies to | Deterministic backing |
|---|---|---|
| `--snap` / `--snap-copy` | every command writing under `.wb/workflows/reports/` | `wb-flow snap <path> [--copy]` |
| `--next` | every command | `wb-flow next <plan.md>` |
| `--help` / `-h` | every command | `wb-flow <sub> --help` |
| `--wave=<L>[:<R>]` | `/wbWork` | `wb-flow wave <plan> --wave=<L>[:<R>]` |
| `--summary` / `--no-summary` · `--sessions` | `/wbWork --wave` only | pass-through to `wb-flow wave` |
| `-p=` `-v=` `-w=` `-m=` (per-role model) · `-M=` | dispatching commands | `wb-flow wave … -w=<slug>`; persist with `wb-flow model --set <role>=<slug>` |
| `--id` `--p` `--est` `--done` `--valid` (column filters) | plan-table commands | — *agent-only* |
| `--open` `--def` `--can` (state overrides) | `/wbWork` `/wbValid` `/wbPlan` | — *agent-only* |
| `--as="<styles>"` | `/wbWork` `/wbExplain` | — *agent-only* |
| `--yes` / `-y` | most | `--yes` on `wb-flow init` / `model` |
| `--act` · `--wbPlan` (chaining) | `/wbAudit` `/wbReview` `/wbStandup` `/wbActOn` | — *agent-only* |
| `--no-plan-update` | `/wbWork` `/wbValid` | set automatically by `wb-flow wave` |

### 4 · Discovery commands (not wb-flow, but you need them)

| Task | bash | Python | Node |
|---|---|---|---|
| List opencode models | `opencode models` | `subprocess.run([...]).stdout.splitlines()` | `execFileSync(...).split("\n")` |
| Which providers are credentialed | `opencode providers list` | same, parse the `●` lines | same |
| List agy models | `agy models` | same | same |
| List codex models | **— none.** codex cannot enumerate; use `wb-flow model --detect --probe` | — | — |
| Sessions as JSON | `opencode session list --format json` | `json.loads(...)` | `JSON.parse(...)` |
| Token/cost stats | `opencode stats --days 1 --models` | dispatch + parse | dispatch + parse |







---

<!-- MODEL_CATALOG_START -->

## 📚 Annex H — Complete Model Catalog API Examples

> **Generated** from `models.json` + [`bin/cli_registry.js`](../../bin/cli_registry.js)
> by `node bin/gen_cli_matrix.js --write`. Do not hand-edit between the markers.
>
> Every command below routes through the model's **catalogued provider**, not its name.
> The hand-written version of this annex sent all `anthropic/*` and `openai/*` models to
> `opencode run`, which cannot bill them — the command that produced the phantom
> *"Insufficient balance"*. Ten of thirty-three examples were wrong that way.

### Provider: `anthropic` (Pool: `claude-pro`)

#### `anthropic/claude-opus-5`

`anthropic` → **`claude`** · model arg `claude-opus-5`

**Bash**
```bash
claude -p --model claude-opus-5 --permission-mode auto "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['claude', '-p', '--model', 'claude-opus-5', '--permission-mode', 'auto', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('claude', ['-p', '--model', 'claude-opus-5', '--permission-mode', 'auto', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `anthropic/claude-sonnet-5`

`anthropic` → **`claude`** · model arg `claude-sonnet-5`

**Bash**
```bash
claude -p --model claude-sonnet-5 --permission-mode auto "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['claude', '-p', '--model', 'claude-sonnet-5', '--permission-mode', 'auto', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('claude', ['-p', '--model', 'claude-sonnet-5', '--permission-mode', 'auto', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `anthropic/claude-fable-5`

`anthropic` → **`claude`** · model arg `claude-fable-5`

**Bash**
```bash
claude -p --model claude-fable-5 --permission-mode auto "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['claude', '-p', '--model', 'claude-fable-5', '--permission-mode', 'auto', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('claude', ['-p', '--model', 'claude-fable-5', '--permission-mode', 'auto', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `anthropic/claude-sonnet-4-6`

`anthropic` → **`claude`** · model arg `claude-sonnet-4-6`

**Bash**
```bash
claude -p --model claude-sonnet-4-6 --permission-mode auto "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['claude', '-p', '--model', 'claude-sonnet-4-6', '--permission-mode', 'auto', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('claude', ['-p', '--model', 'claude-sonnet-4-6', '--permission-mode', 'auto', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `anthropic/claude-haiku-4-5-20251001`

`anthropic` → **`claude`** · model arg `claude-haiku-4-5-20251001`

**Bash**
```bash
claude -p --model claude-haiku-4-5-20251001 --permission-mode auto "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['claude', '-p', '--model', 'claude-haiku-4-5-20251001', '--permission-mode', 'auto', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('claude', ['-p', '--model', 'claude-haiku-4-5-20251001', '--permission-mode', 'auto', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `Claude (auto)`

*Sentinel — the orchestrator itself. Nothing is spawned; there is no command to run.*

### Provider: `openai` (Pool: `chatgpt`)

#### `openai/gpt-5.6-sol`

`openai` → **`codex`** · model arg `gpt-5.6-sol`

**Bash**
```bash
codex exec -m gpt-5.6-sol --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null
```

**Python**
```python
import subprocess
subprocess.run(['codex', 'exec', '-m', 'gpt-5.6-sol', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('codex', ['exec', '-m', 'gpt-5.6-sol', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000, stdio: ['ignore','pipe','pipe'] });
```

#### `openai/gpt-5.6-terra`

`openai` → **`codex`** · model arg `gpt-5.6-terra`

**Bash**
```bash
codex exec -m gpt-5.6-terra --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null
```

**Python**
```python
import subprocess
subprocess.run(['codex', 'exec', '-m', 'gpt-5.6-terra', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('codex', ['exec', '-m', 'gpt-5.6-terra', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000, stdio: ['ignore','pipe','pipe'] });
```

#### `openai/gpt-5.6-luna`

`openai` → **`codex`** · model arg `gpt-5.6-luna`

**Bash**
```bash
codex exec -m gpt-5.6-luna --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null
```

**Python**
```python
import subprocess
subprocess.run(['codex', 'exec', '-m', 'gpt-5.6-luna', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('codex', ['exec', '-m', 'gpt-5.6-luna', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000, stdio: ['ignore','pipe','pipe'] });
```

#### `openai/gpt-5.5`

`openai` → **`codex`** · model arg `gpt-5.5`

**Bash**
```bash
codex exec -m gpt-5.5 --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null
```

**Python**
```python
import subprocess
subprocess.run(['codex', 'exec', '-m', 'gpt-5.5', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('codex', ['exec', '-m', 'gpt-5.5', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000, stdio: ['ignore','pipe','pipe'] });
```

#### `openai/gpt-5.3-codex`

`openai` → **`codex`** · model arg `gpt-5.3-codex`

**Bash**
```bash
codex exec -m gpt-5.3-codex --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null
```

**Python**
```python
import subprocess
subprocess.run(['codex', 'exec', '-m', 'gpt-5.3-codex', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('codex', ['exec', '-m', 'gpt-5.3-codex', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000, stdio: ['ignore','pipe','pipe'] });
```

#### `Codex (auto)`

`openai` → **`codex`** · no `--model` (provider default)

**Bash**
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check "hi! who are you?" < /dev/null
```

**Python**
```python
import subprocess
subprocess.run(['codex', 'exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('codex', ['exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000, stdio: ['ignore','pipe','pipe'] });
```

### Provider: `openrouter` (Pool: `openrouter`)

#### `openrouter/openai/gpt-4o`

`openrouter` → **`opencode`** · model arg `openrouter/openai/gpt-4o`

**Bash**
```bash
opencode run -m openrouter/openai/gpt-4o --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'openrouter/openai/gpt-4o', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'openrouter/openai/gpt-4o', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `openrouter/deepseek/deepseek-r1`

`openrouter` → **`opencode`** · model arg `openrouter/deepseek/deepseek-r1`

**Bash**
```bash
opencode run -m openrouter/deepseek/deepseek-r1 --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'openrouter/deepseek/deepseek-r1', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'openrouter/deepseek/deepseek-r1', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `openrouter/deepseek/deepseek-chat`

`openrouter` → **`opencode`** · model arg `openrouter/deepseek/deepseek-chat`

**Bash**
```bash
opencode run -m openrouter/deepseek/deepseek-chat --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'openrouter/deepseek/deepseek-chat', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'openrouter/deepseek/deepseek-chat', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `openrouter/meta-llama/llama-3.3-70b-instruct`

`openrouter` → **`opencode`** · model arg `openrouter/meta-llama/llama-3.3-70b-instruct`

**Bash**
```bash
opencode run -m openrouter/meta-llama/llama-3.3-70b-instruct --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'openrouter/meta-llama/llama-3.3-70b-instruct', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'openrouter/meta-llama/llama-3.3-70b-instruct', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `openrouter/qwen/qwen-2.5-coder-32b-instruct`

`openrouter` → **`opencode`** · model arg `openrouter/qwen/qwen-2.5-coder-32b-instruct`

**Bash**
```bash
opencode run -m openrouter/qwen/qwen-2.5-coder-32b-instruct --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'openrouter/qwen/qwen-2.5-coder-32b-instruct', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'openrouter/qwen/qwen-2.5-coder-32b-instruct', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

### Provider: `opencode-go` (Pool: `opencode-go`)

#### `opencode-go/deepseek-v4-pro`

`opencode-go` → **`opencode`** · model arg `opencode-go/deepseek-v4-pro`

**Bash**
```bash
opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'opencode-go/deepseek-v4-pro', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'opencode-go/deepseek-v4-pro', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `opencode-go/kimi-k3`

`opencode-go` → **`opencode`** · model arg `opencode-go/kimi-k3`

**Bash**
```bash
opencode run -m opencode-go/kimi-k3 --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'opencode-go/kimi-k3', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'opencode-go/kimi-k3', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `opencode-go/kimi-k2.7-code`

`opencode-go` → **`opencode`** · model arg `opencode-go/kimi-k2.7-code`

**Bash**
```bash
opencode run -m opencode-go/kimi-k2.7-code --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'opencode-go/kimi-k2.7-code', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'opencode-go/kimi-k2.7-code', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `opencode-go/qwen3.7-plus`

`opencode-go` → **`opencode`** · model arg `opencode-go/qwen3.7-plus`

**Bash**
```bash
opencode run -m opencode-go/qwen3.7-plus --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'opencode-go/qwen3.7-plus', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'opencode-go/qwen3.7-plus', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `opencode-go/qwen3.7-max`

`opencode-go` → **`opencode`** · model arg `opencode-go/qwen3.7-max`

**Bash**
```bash
opencode run -m opencode-go/qwen3.7-max --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'opencode-go/qwen3.7-max', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'opencode-go/qwen3.7-max', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

### Provider: `opencode-zen` (Pool: `opencode-zen`)

#### `opencode/gemini-3.1-pro`

`opencode-zen` → **`opencode`** · model arg `opencode/gemini-3.1-pro`

**Bash**
```bash
opencode run -m opencode/gemini-3.1-pro --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'opencode/gemini-3.1-pro', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'opencode/gemini-3.1-pro', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `opencode/deepseek-v4-pro`

`opencode-zen` → **`opencode`** · model arg `opencode/deepseek-v4-pro`

**Bash**
```bash
opencode run -m opencode/deepseek-v4-pro --dangerously-skip-permissions "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['opencode', 'run', '-m', 'opencode/deepseek-v4-pro', '--dangerously-skip-permissions', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('opencode', ['run', '-m', 'opencode/deepseek-v4-pro', '--dangerously-skip-permissions', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

### Provider: `antigravity` (Pool: `google-one`)

#### `gemini-3.6-flash-high`

`antigravity` → **`agy`** · model arg `gemini-3.6-flash-high`

**Bash**
```bash
agy --model gemini-3.6-flash-high --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.6-flash-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.6-flash-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gemini-3.6-flash-medium`

`antigravity` → **`agy`** · model arg `gemini-3.6-flash-medium`

**Bash**
```bash
agy --model gemini-3.6-flash-medium --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.6-flash-medium', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.6-flash-medium', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gemini-3.6-flash-low`

`antigravity` → **`agy`** · model arg `gemini-3.6-flash-low`

**Bash**
```bash
agy --model gemini-3.6-flash-low --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.6-flash-low', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.6-flash-low', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gemini-3.5-flash-high`

`antigravity` → **`agy`** · model arg `gemini-3.5-flash-high`

**Bash**
```bash
agy --model gemini-3.5-flash-high --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.5-flash-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.5-flash-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gemini-3.5-flash-medium`

`antigravity` → **`agy`** · model arg `gemini-3.5-flash-medium`

**Bash**
```bash
agy --model gemini-3.5-flash-medium --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.5-flash-medium', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.5-flash-medium', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gemini-3.5-flash-low`

`antigravity` → **`agy`** · model arg `gemini-3.5-flash-low`

**Bash**
```bash
agy --model gemini-3.5-flash-low --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.5-flash-low', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.5-flash-low', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gemini-3.1-pro-high`

`antigravity` → **`agy`** · model arg `gemini-3.1-pro-high`

**Bash**
```bash
agy --model gemini-3.1-pro-high --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.1-pro-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.1-pro-high', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gemini-3.1-pro-low`

`antigravity` → **`agy`** · model arg `gemini-3.1-pro-low`

**Bash**
```bash
agy --model gemini-3.1-pro-low --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gemini-3.1-pro-low', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gemini-3.1-pro-low', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `claude-opus-4-6-thinking`

`antigravity` → **`agy`** · model arg `claude-opus-4-6-thinking`

**Bash**
```bash
agy --model claude-opus-4-6-thinking --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'claude-opus-4-6-thinking', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'claude-opus-4-6-thinking', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `gpt-oss-120b-medium`

`antigravity` → **`agy`** · model arg `gpt-oss-120b-medium`

**Bash**
```bash
agy --model gpt-oss-120b-medium --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--model', 'gpt-oss-120b-medium', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--model', 'gpt-oss-120b-medium', '--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

#### `Antigravity (auto)`

`antigravity` → **`agy`** · no `--model` (provider default)

**Bash**
```bash
agy --dangerously-skip-permissions -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['agy', '--dangerously-skip-permissions', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('agy', ['--dangerously-skip-permissions', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

### Provider: `github-copilot` (Pool: `github-copilot`)

#### `github-copilot/auto`

`github-copilot` → **`copilot`** · no `--model` (provider default)

**Bash**
```bash
copilot --allow-all -p "hi! who are you?"
```

**Python**
```python
import subprocess
subprocess.run(['copilot', '--allow-all', '-p', 'hi! who are you?'],
               capture_output=True, text=True, timeout=60)
```

**Node.js**
```javascript
const { spawnSync } = require('child_process');
spawnSync('copilot', ['--allow-all', '-p', 'hi! who are you?'], { encoding: 'utf8', timeout: 60000 });
```

> **36 models** documented, every one in bash, python and node.

<!-- MODEL_CATALOG_END -->

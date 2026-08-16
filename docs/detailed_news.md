---
title: "wb-flow (v1.0.2) — Detailed Release Innovations & Technical Guide"
description: "This document provides a comprehensive deep-dive with code examples, terminal traces, script logic, and matrix specifications for all new capabilities introduce"
---

# `wb-flow` (v1.0.2) — Detailed Release Innovations & Technical Guide

This document provides a comprehensive deep-dive with code examples, terminal traces, script logic, and matrix specifications for all new capabilities introduced in `wb-flow` (v1.0.2) compared to `v1.0.1`.

---

---

### 🎛️ Universal Model Flags & Cell-Level Wave Targeting *(2026-08-01)*

**Four role flags, one delegation flag, one cell selector — accepted by every `/wb*` command that dispatches work.**

| Flag | Alias | Effect |
|---|---|---|
| `--planner=` | `-p` | Set the 🧠 Planner chain |
| `--validator=` | `-v` | Set the ✅ Validator chain |
| `--worker=` | `-w` | Set the 🔨 Worker chain |
| `--mechanical=` | `-m` | Set the 📋 Mechanical chain |
| `--model=` | `-M` | **Delegate this one run** — highest priority |
| `--wave=<L>:<R>` | `-W` | Run **one cell**: `:P` `:V` `:W` `:M` |

**Role flags persist.** Passing one is exactly equivalent to running `/wbModel` first — the choice is written to `templates/commands/model_recommendations.md` and survives into every later dispatch:

```bash
/wbValid <folder>/ --id="<i>" -v="go:ds4pro" -p="gemini 3.6:"
# ≡  /wbModel -v="go:ds4pro" -p="gemini 3.6:"
#    /wbValid <folder>/ --id="<i>"
```

**`-M` delegates a single invocation** and outranks role routing, the roster, *and* the executor≠validator rule. Run from the Claude CLI, it means Claude dispatches instead of executing:

```bash
/wbWork <folder>/ --id="<i>" -M="go:DSV4pro"
# → opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions "/wbWork …"
```

Because `-M` can override the executor≠validator rule, the override is **printed in the routing line** (`[--model=… — explicitly delegated by the operator]`) so a self-validation can never happen invisibly.

**Cell targeting** addresses one matrix cell by row × column:

```bash
/wbWork <folder>/ --wave="A:W"                      # only A's Worker cell
/wbWork <folder>/ --wave="A:W" -M="claude:opus 5"   # …delegated
/wbWork <folder>/ --wave="A:V" -v="go:ds4pro"       # …and persist the roster
```

An unrecognised role letter **exits non-zero** rather than falling back to the whole row — a typo that quietly runs four cells instead of one is worse than an error.

> ⚠️ **Breaking:** `-w` now means `--worker`, not `--wave`. The four role flags must be symmetrical; a set where three mean *model* and one means *wave* is a trap. **`--wave` takes `-W`.**

**Precedence, highest first:** `-M` → explicit role flag → plan-header roster → `model_recommendations.md` → built-in defaults.

### 📋 Copy/Paste Command Block *(2026-08-01)*

`/wbWork` and `/wbPlan` now print, directly below the `## 🌊 Next Executable Sequence` table, a fenced block of the same commands as **bare runnable lines** — no table markup, no `<br>`, no `*(⏱️ N min)*` annotations, execution order, dispatchable rows only. The matrix is for reading; this block is for running.

## 📋 Quick Navigation
- [1. Local Subshell Output-Error Guarding (`.wb/bin/wbRun`)](#1-local-subshell-output-error-guarding-wbbinwbrun)
- [2. Wave Orchestration Engine & Autonomous Auto-Pilot (`-y` / `--yes`)](#2-wave-orchestration-engine--autonomous-auto-pilot--y---yes)
- [3. Pre-Flight Explanation Blueprints (`--as="<style>"`)](#3-pre-flight-explanation-blueprints---asstyle)
- [4. Dynamic Per-Role Model Override Flags](#4-dynamic-per-role-model-override-flags)
- [5. Persistent Plan Model Roster Headers](#5-persistent-plan-model-roster-headers)
- [6. Matrix Auto-Correction Engine](#6-matrix-auto-correction-engine)
- [7. `/{cmd}` Catalog Expansion & Standardized 9-File Docs Suite](#7-cmd-catalog-expansion--standardized-9-file-docs-suite)
- [8. ~80% Context Window Token Optimization](#8-80-context-window-token-optimization)

---

## 1. Local Subshell Output-Error Guarding (`.wb/bin/wbRun`)

### The Technical Problem in `v1.0.1`
In `v1.0.1`, CLI tools invoked in shell chains (e.g. `opencode run ... || agy -p ...`) relied solely on exit codes (`? != 0`). However, many AI provider CLIs return exit code `0` even when encountering fatal API errors (such as insufficient account credits or quota exhaustion). As a result, the standard `||` operator failed to trigger fallback models, causing silent task execution failure.

### The Solution in `next` (`v1.0.2`)
`wb-flow` introduces `.wb/bin/wbRun`, a zero-dependency local wrapper that executes commands in subshells, intercepts `stdout`/`stderr`, and checks for error strings regardless of return status.

#### Binary Source Code (`.wb/bin/wbRun`):

```bash
#!/usr/bin/env bash
# .wb/bin/wbRun — Output-Guarded Subshell Wrapper for wb-flow

cmd_label="$*"
echo "--------------------------------------------------------------------------------"
echo "▶ Executing: $cmd_label"
echo "--------------------------------------------------------------------------------"

# Capture stdout and stderr
out=$("$@" 2>&1)
res=$?

echo "$out"

# Guard check: non-zero status OR presence of "error:" (case-insensitive)
if [ $res -ne 0 ] || echo "$out" | grep -qi "error:"; then
  echo ""
  echo "⚠️  [wbRun] Error detected in model command: $cmd_label"
  echo "🔄 Switching to next fallback model..."
  echo "--------------------------------------------------------------------------------"
  exit 1
fi

exit 0
```

#### Real-World Fallback Execution Log:

```text
[wissemb11@localhost wb-labs]$ .wb/bin/wbRun opencode run -m openrouter/meta-llama/llama-3.3-70b-instruct --dangerously-skip-permissions "hi" || .wb/bin/wbRun agy --model gemini-3.1-pro-high --dangerously-skip-permissions -p "what s your name as a model"
--------------------------------------------------------------------------------
▶ Executing: opencode run -m openrouter/meta-llama/llama-3.3-70b-instruct --dangerously-skip-permissions hi
--------------------------------------------------------------------------------

> build · meta-llama/llama-3.3-70b-instruct

Error: Insufficient credits. This account never purchased credits. Make sure your key is on the correct account or org, and if so, purchase more at https://openrouter.ai/settings/credits

⚠️  [wbRun] Error detected in model command: opencode run -m openrouter/meta-llama/llama-3.3-70b-instruct --dangerously-skip-permissions hi
🔄 Switching to next fallback model...
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
▶ Executing: agy --model gemini-3.1-pro-high --dangerously-skip-permissions -p what s your name as a model
--------------------------------------------------------------------------------

I am currently using the Gemini 3.1 Pro model. How can I assist you with your coding tasks today?
```

---

## 2. Wave Orchestration Engine & Autonomous Auto-Pilot (`-y` / `--yes`)

### Parallel Background Dispatch (`bin/wave.js`)
When running `/wbWork <plan.md> --wave=A`, `wb-flow` parses the plan's `## 🌊 Next Executable Sequence` DAG matrix, groups independent non-colliding tasks, and generates a background wave script (`wave_A.sh`).

Every task cell in `wave_A.sh` is automatically wrapped with `.wb/bin/wbRun` for fail-fast subshell execution:

```bash
#!/usr/bin/env bash
# Generated wave script: wave_A.sh
.wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions "/wbWork plan.md --id=9 --no-plan-update" &
PID1=$!
wait $PID1
```

### Autonomous Auto-Pilot Mode (`-y` / `--yes`)
In `v1.0.1`, wave script spawning required interactive confirmation prompts from the user. In `next`, the `--yes` (`-y`) flag enables fully autonomous, zero-touch execution:

```bash
# Non-interactive CLI invocation wrapped in wbRun
.wb/bin/wbRun claude -p --permission-mode auto "/wbWork frontEnd/wbc-ui3/packages/ --wave --as='expert.steps,en,fr then diagrams' -y"
```

#### Effects of `--yes` / `-y`:
1. **Auto-Resolves Plan Ambiguities**: Automatically adopts orchestrator recommendations for held options (e.g. license texts, copyright holder strings).
2. **Zero-Touch Script Generation**: Immediately writes `wave_A.sh` and spawns background subshells without pausing for terminal prompts.

---

## 3. Pre-Flight Explanation Blueprints (`--as="<style>"`)

The `--as="..."` flag instructs `wb-flow` to generate an architectural explanation blueprint before executing any code changes.

```bash
/wbWork plan_packages_20260731.md --wave=A --as="expert,steps,en,fr then diagrams"
```

### Handoff Workflow:
1. **Blueprint Generation**: Runs `/wbExplain plan.md --id=9 --as="..."` to produce a bilingual (EN/FR) markdown report with Mermaid flowcharts (`task_9_details_packages_20260731.md`).
2. **Table Linkage**: Updates the `🔗 Details` column in `plan_packages_20260731.md` pointing to the generated blueprint.
3. **Execution Handoff**: Passes control to `/wbWork plan.md --id=9 --no-plan-update` within the same execution lane.

---

## 4. Dynamic Per-Role Model Override Flags

In `v1.0.1`, model assignments were fixed in static recommendation markdown tables. In `next`, users can override model fallback chains dynamically per role via command line arguments across `/wbWork`, `/wbPlan`, and `/wbModel`:

```bash
# Override Worker and Validator models for Wave A
/wbWork packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles when initializing a plan
/wbPlan packages/ --planner="Claude Opus 5" --worker="DeepSeek V4 Pro,Kimi K3" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

### CLI Flag Reference:
- `--planner="<models>"` (`-p`): Set/override **Planner** model fallback chain.
- `--validator="<models>"` (`-v`): Set/override **Validator** model fallback chain.
- `--worker="<models>"` (`-w`): Set/override **Worker** model fallback chain.
- `--mechanical="<models>"` (`-m`): Set/override **Mechanical** helper model fallback chain.

---

## 5. Persistent Plan Model Roster Headers

When a plan is created or updated, `wb-flow` writes the configured model roster block directly into the header of `## 🌊 Next Executable Sequence`:

```markdown
## 🌊 Next Executable Sequence

> **Active Model Roster for this Plan:**
> 🧠 **Planner:** `Claude Opus 5 || Gemini 3.5 Pro`
> ✅ **Validator:** `DeepSeek V4 Pro`
> 🔨 **Worker:** `DeepSeek V4 Pro || Kimi K3`
> 📋 **Mechanical:** `Gemini 3 Flash || DeepSeek V4 Flash`

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A · 🔨 work** | — | — | `/wbExplain plan.md --id=9 --as="expert,steps"`<br>`/wbWork plan.md --id=9`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)* | — |
| **A · ✅ validate** | — | `/wbValid plan.md --id=9`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*<br><sub>pairs A · 9</sub> | — | — |
```

Subsequent runs of `/wbWork` or `/wbValid` on this plan read and preserve this roster automatically.

---

## 6. Matrix Auto-Correction Engine

If a target plan file is missing the `## 🌊 Next Executable Sequence` matrix (or if the matrix was corrupted):

```bash
# Auto-correct plan file and generate wave matrix
/wbPlan plan_packages_20260731.md
```

### Auto-Correction Procedure:
1. Scans the task table in `plan_packages_20260731.md`.
2. Resolves task dependencies via the `Dep` DAG.
3. Constructs parallel wave rows (`Wave A`, `Wave B`, etc.).
4. Injects the `> **Active Model Roster for this Plan:**` header block using active selections from `model_recommendations.md` (or passed CLI flags).
5. Writes the repaired plan file to disk.

---

## 7. `/{cmd}` Catalog Expansion & Standardized 9-File Docs Suite

### `/wbModel` Command Addition
The `/wbModel` command was added to inspect and override model rosters (`/wbModel --validator='DSV4 pro'`).

### Standardized 9-File Documentation Suite
Every command directory under `docs/commands/wb<Command>/` now contains 9 uniform documentation files (306 files total):

```text
wb<Command>/
├── README.md                          # Documentation Hub & Navigation
├── wb<Command>.md                     # Full Specification & Syntax Reference
├── wb<Command>_eli5.md                # Simple Plain-Language Guide (ELI5)
├── wb<Command>_examples_part1.md      # Baseline Invocations & Standard Use Cases
├── wb<Command>_examples_part2.md      # Advanced Dispatches & Role Overrides
├── wb<Command>_exhaustive_simulation.md # Step-by-Step State Trace Simulation
├── wb<Command>_expert.md              # Deep Dive Architecture & Subshell Guarding
├── wb<Command>_live_demo.md           # Authentic Terminal Logs with Visual Separators
└── wb<Command>_practical.md           # Production Recipes & CI/CD Workflows
```

---

## 8. ~80% Context Window Token Optimization

By routing worker execution to background sub-agents (via `--wave`), raw code edits, file diffs, and verbose terminal outputs remain in external subshells.

### Quantitative Comparison:

| Execution Mode | Claude Context Consumption per Task | Context Growth Over 10 Tasks | Primary Model Cost |
|---|---|---|---|
| **Interactive (v1.0.1)** | ~45,000 tokens | ~450,000 tokens (Context Full) | High (Claude API) |
| **Wave Mode (v1.0.2)** | ~1,500 tokens (`task_report.md` only) | ~15,000 tokens (Sustained) | ~80% Lower (Flat-rate Sub-Agents) |

---

---

## 9. Six `wb-flow` CLI Subcommands *(2026-08-01—2026-08-03)*

In `v1.0.1`, `wb-flow` shipped a single `init` subcommand that scaffolded project templates. `v1.0.2`
adds five more, turning `wb-flow` into a standalone CLI that operates on plan files, model rosters,
and the wave execution engine directly — no `/` prefix, no AI context needed.

### 9.1 `wb-flow init <dir>` — Project Initialization

Scaffolds the full 33-command template tree, `model_recommendations.md`, and a wrapper script.
Read-only preview via `--dry --json` outputs the file inventory without touching disk.

```bash
wb-flow init my-project/
# Creates: my-project/.wb/commands/wb<Cmd>/ (33 dirs × 9 files = 306 docs)
#          my-project/.wb/bin/wbRun
#          my-project/templates/commands/model_recommendations.md
#          my-project/templates/commands/composition_toolbox.md
```

**Exit codes:** `0` on success; `1` if the directory already has a `.wb/` or `.claude/` directory
(wb-flow refuses to overwrite an existing install). `--dry --json` always exits `0` and prints JSON
to stdout.

### 9.2 `wb-flow model <scope>` — Role-Model Roster Read/Write

Reads or writes the role-model assignment chain that every `/wb*` command uses to decide which AI
model runs each role (Planner, Validator, Worker, Mechanical).

**Read mode** (no flags):
```bash
wb-flow model deployement/packages/wb-flow/next/core/
# Prints the current roster:
#   🧠 Planner:    Claude (in-session) || claude-opus-4-6-thinking
#   ✅ Validator:  Claude (in-session) || opencode-go/kimi-k2.7-code
#   🔨 Worker:    opencode-go/deepseek-v4-pro || gemini-3.1-pro-high
#   📋 Mechanical: opencode-go/qwen3.7-plus || gemini-3.6-flash-high
```

**Write mode** (any role flag):
```bash
wb-flow model deployement/packages/wb-flow/next/core/ --worker="go:ds4pro,go:kimi"
```
Persists the chain to `<scope>/templates/commands/model_recommendations.md`. The format is
`<cli-prefix>:<model-slug>,<cli-prefix>:<model-slug>` — the first succeeds or the second fires.

**Exit codes:** `0` on success; `1` if `model_recommendations.md` is missing and no role flag was
passed (write to create it). When `--planner` and `--validator` are both set, the file is
atomically replaced via a temp-file rename to prevent partial writes.

**Probe mode** (`--probe --all[=<what>]`) — *added 2026-08-14*:
```bash
wb-flow model --pick --probe --all              # whole catalog, grouped by role, unreachable hidden
wb-flow model --pick --probe --all=raw          # stream everything, failures included (pre-1.0.2)
wb-flow model --pick --probe --all=anthropic    # one provider only
wb-flow model --pick --probe --all=planner      # one role only
wb-flow model --probe --all=anthropic           # identical behaviour headless, for scripts and CI
```

Each line names the **provider, pool and CLI** actually invoked:

```
   MODEL                          PROVIDER                CLI
   ✅ openai/gpt-5.6-terra        openai/chatgpt          codex
   ✅ gemini-3.1-pro-high         antigravity/google-one  agy
   ⚠️  gpt-oss-120b-medium         antigravity/google-one  agy  — substituted: using Gemini 3.1 Pro
```

**Why the columns exist.** Until 1.0.2 routing was re-derived from the slug string, guarded by
`slug.indexOf('/') === -1 && CODEX_ONLY.test(tail)`. Every namespaced catalog entry failed that
guard and fell through to `opencode`, which cannot bill it — so the probe reported
*"Insufficient balance"* for every `anthropic/*` and `openai/*` model, while `claude -p --model
claude-opus-5` and `codex exec -m gpt-5.6-terra` answered them instantly. A misroute was
indistinguishable from a billing failure because nothing on the line said which CLI had been used.

`bin/cli_registry.js` now maps `provider → CLI` and `CLI → argv` once, and is imported by **both**
the picker/probe and the wave dispatcher — so a model cannot be probed through one CLI and
dispatched through another. Uncatalogued slugs still fall back to the old heuristics and are marked
`?` so a guessed route stays attributable.

The `⚠️ substituted` state is separate from ❌ on purpose: a provider that silently answers as a
*different* model is not reachable-as-requested, and must not enter the roster — but calling it a
plain failure would hide the substitution.

### 9.3 `wb-flow wave <plan> --wave=<label>` — Wave Execution Engine

The core engine that converts the plan's `## 🌊 Next Executable Sequence` DAG matrix into
collision-free parallel background dispatches.

**`--list`** previews the routing without spawning anything — one line per cell, naming the lane,
CLI, model, and reason:
```bash
wb-flow wave plan.md --wave=H --list
# 🔨 Worker     opencode-go/deepseek-v4-pro    --id=15   (role routing)
# 📋 Mechanical opencode-go/qwen3.7-plus       --id=19   (role routing)
```

**`--summary`** streams only decision lines per cell — `▶` (dispatch), `G1` (infra), `G2`
(artifact), `G3` (oracle), `VERDICT`, and `PER-ID`. Full transcripts are `tee`'d to:
- `tasks/task_<ID>/task_<ID>_log_YYYYMMDD_hhmmss.log` (per-cell)
- `.wb/workflows/reports/<YYYY>/<MM>/<DD>/waves/logs_<label>_<timestamp>/` (per-wave)

Measured on a real 10-cell wave: **63,002 tokens** unsummarised, of which none changed a single
Done box. `--summary` is the default when `/wbWork` invokes `--wave`; pass `--no-summary` to get
the raw stream back when debugging one cell's behaviour.

**Generated script structure** (what `wave.js` emits for a wave):
```bash
#!/usr/bin/env bash
# wave_H.sh — 2026-08-03
LOG_DIR=.wb/workflows/reports/2026/08/03/waves/logs_H_20260803_1100
mkdir -p "$LOG_DIR"

# Cell: 🔨 Worker / --id=15 → opencode-go/deepseek-v4-pro
( opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions \
    "/wbWork deployement/packages/wb-flow/next/.wb/.../plan.md --id=15 --no-plan-update" \
  ) > >(tee "$LOG_DIR/cell_15_HW.log" | grep -E '^(▶ |G[123] |VERDICT|PER-ID)' ) 2>&1 &
PID_15=$!

# Cell: 📋 Mechanical / --id=19 → opencode-go/qwen3.7-plus
( opencode run -m opencode-go/qwen3.7-plus --dangerously-skip-permissions \
    "/wbWork deployement/packages/wb-flow/next/.wb/.../plan.md --id=19 --no-plan-update" \
  ) > >(tee "$LOG_DIR/cell_19_HM.log" | grep -E '^(▶ |G[123] |VERDICT|PER-ID)' ) 2>&1 &
PID_19=$!

wait $PID_15 $PID_19
```

### 9.4 `wb-flow watch` — Live Wave Monitoring

Monitors running wave executions. Lists cells by state with progress bars, ETA, and `OVER est`
detection.

```bash
wb-flow watch           # interactive, updates every ~30 s
wb-flow watch -1        # one cycle, then exit — non-zero if any cell is still running
wb-flow watch --run=logs_H_20260803_1100  # target a specific wave log directory
```

**Three cell states, never two:**
| State | Meaning | Detection |
|---|---|---|
| `✅ done` | Wrote an `__EXIT__=<rc>` marker | `___EXIT___` file exists in the log directory |
| `🔄 running` | No marker, live process holds it | `pgrep -f -- "--id=<id> "` returns a PID |
| `⚠️ ENDED` | No marker and no live process | Neither condition holds — killed, crashed, or OOM-ed |

**Liveness vs idleness.** `watch` reports `idle` (seconds since log last grew), but this is not a
kill signal on its own: agents buffer while composing, so a thinking cell is indistinguishable
from a dead one by log growth alone. The heuristic uses a composite: the process is alive
(`kill -0`) **and** its CPU time advances between samples (`ps -o times=`). When both signals
look dead, read the log's final lines before concluding — a delegating agent usually names what
it dispatched. Measured: ten concurrently-running validators all showed `idle ≈ 230s`
simultaneously while every one was healthy (one had burned 56s of CPU).

**Exit codes:** `0` when all cells are done with G1≥pass; `1` if the run directory is missing;
`2` if any cell is still running after a `-1` cycle. `--run=` on a nonexistent directory exits
non-zero.

### 9.5 `wb-flow snap <plan>` — State Freezing

Freezes the current plan state into `.wb/snaps/<YYYYMMDD>_<label>/`. Useful before a destructive
wave or plan merge — the snap is git-agnostic and survives plan recomputes.

```bash
wb-flow snap plan.md              # symlink → plan.md + tasks/
wb-flow snap plan.md --copy       # copy content (survives upstream deletion)
wb-flow snap plan.md --label=pre-merge  # names it 20260803_pre-merge/ instead of auto-label
```

Symlinks are the default because they're cheap and traceable; `--copy` is for untracked files
that would disappear with a repo reset.

### 9.6 `wb-flow next <plan> --embed` — What to Dispatch Next

Shells out to derive the current wave inventory from the plan's Done/Valid state and prints:
- The wave inventory (one row per wave, with open cell count and estimated time)
- An ordered command list ready to copy-paste
- The `▶️ How to run this plan` block (when `--embed` is passed, it replaces the block between
  its markers in the plan file itself)

```bash
wb-flow next plan.md           # print to stdout
wb-flow next plan.md --embed   # replace the ▶️ block in the plan file
```

This is run automatically by `/wbWork` and `/wbPlan` after every Done/Valid change — the matrix
and the `▶️` block are derived state and must agree.

---

## 10. Wave Mode Flags: `--summary` and `--sessions`

### 10.1 `--summary` — Decision-Only Streaming (Wave Mode Only)

Passed through to `wb-flow wave`, `--summary` keeps every cell's full transcript in its log file
but streams only the decision lines into the orchestrator's context:

| Streamed line | Meaning |
|---|---|
| `▶ /wbWork plan.md --id=15` | The dispatch command |
| `G1: PASS` | Infra gate — agent ran, no fatal error |
| `G2: PASS` | Artifact gate — task report exists |
| `G3: PASS` | Oracle gate — Verify command exited 0 |
| `VERDICT: DONE` | All three gates passed |
| `PER-ID: DONE=[15]` | Per-id rollup (for merged cells) |

Without `--summary`, every cell's full transcript — template reads, `ls -la` dumps, ANSI escape
sequences — streams into the orchestrator's context. Measured on a real 10-cell wave in this
repository: **63,002 tokens**, of which one cell was 16,824, and none of it changed a single Done
box.

**`--summary` is the default** when `/wbWork` invokes `--wave`. Drop the flag (`--no-summary`)
only while debugging a specific cell's behaviour.

### 10.2 `--sessions` — Warm Session Reuse (Wave Mode Only)

Reuses one warm opencode session per (scope, model), resumed **and forked** so parallel cells
don't share a conversation. Off by default.

```bash
wb-flow wave plan.md --wave=H --sessions
```

**How it works.** The session key is `(scope, model)`. Before dispatching a cell, `wb-flow`
checks whether a session for that `(scope, model)` was started by a prior cell in this wave. If
so, it forks the session — copying the conversation history up to that point — and resumes the
fork. The original session is left untouched for the next cell that needs it.

**⚠️ Bug-5 warning — do not use `--sessions` across plans yet.** The session key currently omits
the plan filename: `sessionKeyFor(scope, model)` does not include `path.basename(planPath)`. On
2026-08-03, this caused two cells to execute the **wrong plan's** tasks — they resumed an 08-02
conversation into an 08-03 dispatch. A third cell **overwrote a validated task report** from the
previous plan. The resumed session's history **outranks the command line**: the agent finds old
context more compelling than new instructions. Until the key includes the plan name, `--sessions`
is unsafe in any scope holding more than one plan file.

**Cost trade-off.** A resumed session replays its full history, so it trades a cold re-read
(startup cost: reading the plan + template + scope files) for a growing transcript (cumulative
cost: all prior cell context). Measure with `opencode stats --days 1 --models` before adopting
it as a habit. For waves with large-cell budgets (≥40 min each), the startup cost is negligible;
for waves with many short cells (≤10 min each), `--sessions` may actually *increase* token
consumption.

---

## 11. The Three-Gate Wave Correctness Contract *(2026-08-03)*

### The Problem It Solves

On 2026-07-31, a wave cell fixing `wbRun`'s unanchored `grep -qi "error:"` was marked ❌ by the
**identical guard** still inlined in `wave.js` — the bug classified its own fix as a failure. In
the same run, three cells that never started were indistinguishable from it by output alone. Of
four cells the old harness called "failed", three had done nothing and one had fully succeeded.

**Output text is never a success signal.** A `/wbWork` log legitimately contains `Error:`,
`failed`, and `cannot` whenever the task is *about* error handling — and those are exactly the
rows where a false verdict costs the most. A cell that never ran produces an empty log (no
`Error:` at all). An unusable model can exit 0 having done nothing. Neither `grep` nor exit
codes are reliable on their own.

### The Three Gates

Every wave cell is classified by three independent checks — none of which inspect the log text
for error strings:

| Gate | Question | Signal |
|---|---|---|
| **1 · Infra** | Did the agent run at all? | CLI exit code + **anchored** fatal patterns: `^Error: Model not found`, insufficient credits, rate limit, quota, authentication. Ungrepped `Error:` is not a signal. |
| **2 · Artifact** | Did it write what it was required to write? | For `/wbWork` and `/wbExplain` cells: the task report (`tasks/task_<ID>/task_<ID>_report_*.md`) exists. For `/wbValid` cells: the validation section was appended, or the plan's `☐ Valid` cell changed. |
| **3 · Oracle** | Does the task's own `Verify` command pass? | Run the row's `Verify` cell verbatim; exit 0 = pass. The G3 oracle runs from the **plan's directory** (not the repo root — bug 2's fix), so plan-relative paths resolve correctly. |

### Verdict Table

| G1 | G2 | G3 | Verdict | Done box |
|---|---|---|---|---|
| ✗ | — | — | **INFRA** — never ran | `⬜` |
| ✓ | ✗ | — | **NO-OP** — ran, produced nothing | `⬜` |
| ✓ | ✓ | ✗ | **ATTEMPTED** — needs a validator or the user | `⬜` |
| ✓ | ✓ | ✓ | **DONE** | `✅` |

Only a 1-2-3 green cell gets its Done box checked. Everything else stays `⬜` with its verdict
and reason in the Wave notes.

### Model Fallback Rule

**Fallback fires on Gate 1 only.** A Gate 2 or Gate 3 failure is reported, never retried with
the next model in the chain: the blocker is the task, not the agent, so a second model meets the
same wall and doubles the spend. Re-dispatch after a Gate 2/3 failure is a human decision.

### Merged Cells & Per-ID Gating

Two rows may share one dispatch when they share a plan file, a model, a role column, **and** are
both small enough that losing the parallelism costs less than paying the agent's start-up context
twice. The generated script runs one agent over both rows and prints a verdict per id plus a
roll-up:

```
G2 [3]: PASS          G3 [3]: PASS          VERDICT [3]: DONE
G2 [8]: NO-OP — no task report at tasks/task_8/task_8_report_*.md
                                               VERDICT [8]: NO-OP
PER-ID: DONE=[3] UNVERIFIED=[] ATTEMPTED=[] NO-OP=[8]
VERDICT: NO-OP — 8
```

The **cell** exits on its worst id, but the `PER-ID:` line is what you read: check `3`'s Done
box, leave `8` at `⬜` with its verdict. Do not fail a merged cell wholesale — a red exit code
routinely carries a genuinely green id.

### Why This Exists

The three-gate contract makes two types of false verdicts structurally impossible:

1. **False negatives** (a cell that succeeded is called failed) — prevented because no gate
   inspects the log text for error patterns. A task fixing error handling will contain the word
   `Error:` by design; the old guard failed it for that.
2. **False positives** (a cell that did nothing is called DONE) — prevented because G2 requires
   a physical artifact. A `wbValid` cell that no-ops lands `NO-OP`, not `DONE`, because bug 3
   extended G2 gating to validators. An unusable model that exits 0 having written nothing lands
   `NO-OP` because no report exists.

The contract is the **harness's truth record**, not the agent's output. A validator that writes
*"✅ All passed"* into its log is not trusted; the validator's own G2 is what determines whether
it succeeded. The agent's claim and the harness's verdict are deliberately independent.

---

← [Back to Documentation Hub](README.md) · [View Concise Overview (new.md)](new.md)


### ⏱️ Wave Execution Session Tracking (`/wbTrack`)
Whenever `/wbWork` or `/wbPlan` is executed with the `--wave=<label>` flag, the execution pipeline automatically wraps the wave dispatches with session tracking:

```bash
# Executing /wbWork <path_scope> --wave=A follows this sequence:
1. /wbTrack <path_scope>   # Starts/joins today's session tracking log
2. wave_A.sh dispatches     # Executes parallel wave tasks
3. /wbTrack --stop          # Stops and finalizes session tracking log
```


### 🚀 Next Wave Execution Command Suggestions
Below the `## 🌊 Next Executable Sequence` matrix and Wave notes, `/wbPlan` and `/wbWork` output a dedicated recommendation block calculating total estimated duration (`Est. Time`) and offering ready-to-run CLI commands tailored for time and cost considerations:

- **Option 1 (Next Wave)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A -y"`
- **Option 2 (With `--as`)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A --as="expert,steps" -y"`
- **Option 3 (All Waves)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=all -y"`

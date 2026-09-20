---
title: "wbPlan — Examples"
description: "Every plan file contains one table."
---

# /wbPlan — Examples

> Self-help. `/wbPlan` is the command you reach for when a task is too big to describe in one sentence. This file shows what the generated plan table actually looks like and what common mistakes produce bad plans.

---

## What /wbPlan is and isn't

- **Is:** a task-decomposer that produces a markdown checklist-table and parks it in `reports/YYYY/MM/DD/plans/`.
- **Isn't:** an executor. It writes the plan; *you* (and other AI sessions) execute it.
- **Isn't:** a replacement for just describing a small task. If the job is < 30 min of work, skip the plan.

## The shape of a plan table

Every plan file contains one table. Columns:

| # | Task | Details | Model | Worker | Validator | Done | Valid |
|---|------|---------|-------|--------|-----------|------|-------|

The Done + Valid checkboxes are the whole point. They're what makes the plan resumable across sessions. Since v5.1, each model in the Worker column includes a per-task cost annotation (`Model · ~$X.XX`) so you can budget AI costs before executing.

---

## Example 1 — `/wbPlan packages/wb-core --task="add WBCodeSlot export"`

Small-ish feature. One concrete deliverable. What a *good* plan looks like.

```text
$ /wbPlan packages/wb-core --task="add WBCodeSlot export"

[AI] Loading context.md + dev.md for wb-core...
[AI] Scanning reports/20260420..20260423/...
[AI] → No open decisions blocking this feature.
[AI] → Existing WBCode export pattern can serve as template.
[AI]
[AI] Decomposing task...
[AI] (not writing any code; output is plan only)
[AI]
[AI] Writing reports/20260423/plans/plan_wbCodeSlot_202604231840.md:
```

```markdown
# Plan: add WBCodeSlot export (wb-core)

Context: follows existing WBCode pattern. Respects 3-mode wbCode
gating (dev / prod / __WBC_DEV__). See context.md section "WBCode".

| # | Task | Details | Model | Worker | Validator | Done | Valid |
|---|-------------------|--------------------------------------------|-------------|--------------------|-----------| ------|-------|
| 1 | scaffold | Create src/components/WBCodeSlot.vue | Qwen3-Coder | Cline · ~$0.03 | the agent | ⬜ | ⬜ |
| 2 | gate-with-WBC_DEV | Wire __WBC_DEV__ gating identical to WBCode.vue | Qwen3-Coder | Cline · ~$0.05 | the agent | ⬜ | ⬜ |
| 3 | export | Add WBCodeSlot to src/index.js | Qwen3-Coder | Cline · ~$0.01 | the agent | ⬜ | ⬜ |
| 4 | update-context | Add WBCodeSlot to context.md API section | the agent | the agent · ~$0.08 | (self) | ⬜ | ⬜ |
| 5 | test | Add unit test covering dev/prod rendering | Qwen3-Coder | Cline · ~$0.04 | the agent | ⬜ | ⬜ |

> ### 💰 Plan Budget Estimate
> | Metric | Value |
> |---|---|
> | **Total tasks** | 5 |
> | **Total estimated time** | 55 min (~1 h) |
> | **Total estimated tokens** | ~38kt |
> | **Est. total cost (workers)** | ~$0.21 |

Expected consumers affected: 0 (new export, no breaking change).
Release impact: MINOR version bump.
```

```text
[AI] Plan written. 5 tasks. Waiting for you to execute.
[AI] Resume with: "Execute task 1 from plan_wbCodeSlot..."
```

**What's worth noticing:**

- Task 4 (update context.md) is in the plan. Most humans forget this step. If the docs don't update, the next `/wbContext` will flag drift against yesterday's code.
- Task 2 is *not* "implement gating" — it's "wire gating **identical** to WBCode.vue". That specificity is what keeps the implementation from re-deriving the pattern differently.
- The "Expected consumers affected: 0" line up front is a release-impact estimate. If it said "3 consumers," you'd want to expand the plan with regression tasks for each.
- No tasks for `dist/` alignment — assumed fine since this is pure source addition, not config change.

---

## Example 2 — `/wbPlan packages/wb-dataviewer --task="fix apiResponse_ cache stale on route change"`

A bug plan. Different structure — investigation first, fix second.

```text
$ /wbPlan packages/wb-dataviewer --task="fix apiResponse_ cache stale on route change"

[AI] Loading context.md + dev.md...
[AI] apiResponse_ caching rule detected (do not re-fetch on project change).
[AI] → This constrains the fix. Route change ≠ project change.
[AI]
[AI] Scanning reports/... checking for past debug on this symptom...
[AI] → 1 related report 2026-04-19: "cache didn't reset on /admin → /viewer"
[AI] Unresolved. Hypothesis was: watcher key mismatch.
[AI]
[AI] Decomposing...
```

```markdown
# Plan: fix apiResponse_ cache stale on route change

Constraint (from dev.md): apiResponse_ must cache fetched data.
Project changes MUST NOT re-fetch. Route changes ≠ project changes
but CAN invalidate the cache. Scope the fix carefully.

Related open report: 2026-04-19 debug (watcher key mismatch hypothesis).

| # | Task | Details | Model | Worker | Validator | Done | Valid |
|---|-------------------|--------------------------------------------|-------------|--------------------|-----------|------|-------|
| 1 | reproduce | Script the exact failing sequence in a test | Qwen3-Coder | Cline · ~$0.05 | the agent | ⬜ | ⬜ |
| 2 | verify-hypothesis | Check 2026-04-19 watcher-key hypothesis | the agent | the agent · ~$0.15 | (self) | ⬜ | ⬜ |
| 3 | fix-root-cause | Implement fix (scope: route-keyed reset only) | Qwen3-Coder | Cline · ~$0.07 | the agent | ⬜ | ⬜ |
| 4 | regression-guard | Ensure project-change path still caches | Qwen3-Coder | Cline · ~$0.04 | the agent | ⬜ | ⬜ |
| 5 | update-dev.md | Document the route-vs-project distinction | the agent | the agent · ~$0.08 | (self) | ⬜ | ⬜ |

Constraint check: does the fix violate apiResponse_? Task 4 enforces no.
```

```text
[AI] Plan written. 5 tasks. Task 1 is intentionally "reproduce first"
[AI] because dev.md forbids fixing without a reproduction.
```

**What's worth noticing:**

- Task 1 is "reproduce" before "fix". This is the plan encoding your engineering discipline — no speculative fixes.
- Task 4 (regression guard) is there because the constraint from `dev.md` cuts both ways. The fix must not break the *correct* caching.
- Task 5 updates `dev.md` to codify the route-vs-project distinction. That rule didn't exist before this bug; after the fix, it should.
- The plan references the 2026-04-19 debug report directly. Closed-loop in action.

---

## Example 3 — `/wbPlan packages/wb-core --task="migrate extractSubObject to structural array handling"`

The big one. An architectural change that's been parked. Shows what a multi-task plan looks like when the constraints are heavy.

```text
$ /wbPlan packages/wb-core --task="migrate extractSubObject to structural array handling"

[AI] Loading context.md + dev.md...
[AI] ⚠ OPEN DECISION FLAGGED in context.md:
[AI] "extractSubObject array handling: leaves vs structural. NOT DECIDED."
[AI]
[AI] dev.md rule triggered:
[AI] "Before changing extractSubObject signature, confirm the
[AI] array-handling decision with the user."
[AI]
[AI] Refusing to auto-plan. Need decision first:
[AI]
[AI] Q1: Are we committing to structural arrays as the new shape?
[AI] (breaking change for current consumers — 4 call sites)
[AI]
[AI] Q2: If yes, what is the migration strategy for existing call sites?
[AI] a. Big-bang: update all 4 call sites in the same release.
[AI] b. Dual API: ship old + new, deprecate old over 2 minor versions.
[AI] c. Feature flag: structural shape opt-in via a second arg.
[AI]
[AI] Waiting for decision before writing the plan.
```

**What's worth noticing:**

- `/wbPlan` refused to generate a plan. This is the correct behavior when a `dev.md` rule says "confirm before extending."
- The AI lists the migration strategies (big-bang / dual API / feature flag) as a structured choice, not a recommendation. Your call.
- Compare to gemini's version: gemini would happily generate a plan and mark tasks as "analyze" and "refactor." That's non-enforcement of your own rules, which is worse than no plan.

---

## Example 4 — the plan file as a live state machine

This is what makes plans valuable. The plan file updates over time.

**Day 1, 10am — plan written:**
```markdown
| 1 | scaffold | ... | ⬜ | ⬜ |
| 2 | gate | ... | ⬜ | ⬜ |
| 3 | export | ... | ⬜ | ⬜ |
```

**Day 1, 3pm — task 1 done:**
```markdown
| 1 | scaffold | ... | ✅ | ⬜ | ← worker marked Done
| 2 | gate | ... | ⬜ | ⬜ |
| 3 | export | ... | ⬜ | ⬜ |
```

**Day 1, 5pm — task 1 validated, task 2 in flight:**
```markdown
| 1 | scaffold | ... | ✅ | ✅ | ← validator signed off
| 2 | gate | ... | 🔨 | ⬜ | ← in progress marker
| 3 | export | ... | ⬜ | ⬜ |
```

**Day 2 — you reopen the session, run /wbStandup:**

```text
[AI] Plan plan_wbCodeSlot_202604231840.md:
[AI] ✅ 1 task validated
[AI] 🔨 1 task in progress (stale > 12h — status unclear)
[AI] ⬜ 1 task pending
[AI] Suggestion: verify task 2 state before proceeding.
```

The checkbox state + timestamps + validator sign-off collectively make the plan durable across sessions. That's the *actual* architectural value of `/wbPlan` — it's not the decomposition (any AI can decompose), it's the persistent state.

---

## The anti-patterns

| Bad plan signal | Why it's bad |
|---|---|
| Task named "refactor X" with no details | No testable state change. Will silently scope-creep. |
| No validator column filled in | Plan degrades to a TODO list; no independent verification. |
| Tasks that depend on each other but are marked for parallel execution | Will race. Someone overwrites work. |
| Plan with 15+ tasks | Too big to track. Split into two plans or admit the scope is a /wbVision, not a /wbPlan. |
| Plan with no context-file update task | Docs will drift. Future sessions see old context. |
| Plan generated without reading `reports/` | Ignores what's already known. Re-does investigation. |

If `/wbPlan` produces any of these, don't execute the plan — fix it first.

---

## Example 5 — reading the budget summary

Every v5.1 plan appends a `💰 Plan Budget Estimate` block after the task table, and each Worker model includes a cost annotation (`Model · ~$X.XX`). Here's how to read it:

```markdown
> ### 💰 Plan Budget Estimate
> | Metric | Value |
> |---|---|
> | **Total tasks** | 8 |
> | **Total estimated time** | 180 min (~3 h) |
> | **Total estimated tokens** | 95k tokens |
> | **Est. cost (fast model worker)** | ~$0.38 |
> | **Est. cost (big thinker worker)** | ~$1.43 |
```

**What's worth noticing:**

- The `95k tokens` tells you this plan will consume roughly 95,000 tokens across all tasks. If your API budget for the day is 500k tokens, this plan is ~19% of it.
- `fast model` = the agent/Flash/DS tier (~$0.004/kt). `big thinker` = the agent/the agent Pro tier (~$0.015/kt). Pick the line matching your assigned workers.
- Validation adds ~30% on top. An 8-task plan at 95k worker tokens ≈ 124k total (worker + validator).
- If the budget looks too high, consider: splitting into two plans, deferring P2/P3 tasks, or downgrading some workers to a faster model tier.
- The `Est. (min · kt)` column on each row lets you spot which individual tasks are expensive. A single `45 · 60k` task in a plan of 5k-average tasks is a red flag — it might need its own sub-plan.

---

---

## Basic Usage

```bash
# Standard command execution
/wbPlan frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbPlan deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbPlan` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbPlan target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbPlan target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbPlan target/"
```


### ⏱️ Matrix Task Duration Estimations
In the `## 🌊 Next Executable Sequence` matrix table, each task dispatch cell appends the estimated task duration extracted from the task table's `Est. (min)` column, formatted as `*(⏱️ <min> min)*`:

```markdown
`/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
```


### 💡 Pre-Flight Explanation Blueprint Gate (`--as`)
- **Standard Mode (default, without `--as`)**: Matrix cells contain **ONLY** the direct execution command:
  ```markdown
  `/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  ```
- **Explanation Mode (with `--as="<style>"`)**: Matrix cells prepend `/wbExplain`:
  ```markdown
  `/wbExplain plan.md --id=B23 --as="expert,steps"`<br>`/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  ```

## 🎛️ Universal model flags *(2026-08-01)*

| Flag | Alias | Effect |
|---|---|---|
| `--planner=` | `-p` | 🧠 Planner chain — **persists** via `/wbModel` |
| `--validator=` | `-v` | ✅ Validator chain — persists |
| `--worker=` | `-w` | 🔨 Worker chain — persists. ⚠️ `-w` is **not** `--wave` |
| `--mechanical=` | `-m` | 📋 Mechanical chain — persists |
| `--model=` | `-M` | **Delegate this run.** Highest priority: outranks role routing, the roster and the executor≠validator rule |
| `--wave=<L>:<R>` | `-W` | Run **one cell** — `:P` Planner · `:V` Validator · `:W` Worker · `:M` Mechanical |

```bash
/wbWork <folder>/ --wave="A:W" -M=$WORKER      # one cell, delegated
/wbValid <folder>/ --id="<i>" -v="go:ds4pro"           # persists the validator roster, then runs
```

Role flags are shorthand for running `/wbModel` first. An unknown role letter in `--wave` exits non-zero rather than silently running the whole row. **Precedence:** `-M` → role flag → plan-header roster → `model_recommendations.md` → defaults.

After the 🌊 matrix, a **copy/paste block** of bare runnable commands is printed — no table markup, no `<br>`, no duration annotations.

---

## Scenario 1: Creating a Plan with Custom Role Models

```bash
/wbPlan packages/ --task="Upgrade LICENSE texts" --planner="Claude Opus 5" --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"
```

### Resulting Matrix Header in `plan_packages_20260731.md`:

```markdown
## 🌊 Next Executable Sequence

> **Active Model Roster for this Plan:**
> 🧠 **Planner:** `Claude Opus 5`
> ✅ **Validator:** `Gemini 3.5 Pro`
> 🔨 **Worker:** `DeepSeek V4 Pro || Kimi K3`
> 📋 **Mechanical:** `Gemini 3 Flash`

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A · 🔨 work** | — | — | `/wbExplain plan.md --id=9 --as="expert,steps"`<br>`/wbWork plan.md --id=9`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)* | — |
| **A · ✅ validate** | — | `/wbValid plan.md --id=9`<br>→ *Gemini 3.5 Pro* *(⏱️ 10 min)* | — | — |
```

---

## Scenario 2: Auto-Correcting a Missing Matrix

If a plan file is missing the `## 🌊 Next Executable Sequence` matrix:

```bash
/wbPlan plan_packages_20260731.md
```

`/wbPlan` reads the task table, parses the `Dep` DAG, constructs the wave rows, writes the `> **Active Model Roster for this Plan:**` header block, and saves the file automatically!


### ⏱️ Wave Execution Session Tracking (`/wbTrack`)
Whenever `/wbWork` or `/wbPlan` is executed with the `--wave=<label>` flag, the execution pipeline automatically wraps the wave dispatches with session tracking:

```bash
# Executing /wbWork <path_scope> --wave=A follows this sequence:
1. /wbTrack <path_scope>   # Starts/joins today's session tracking log
2. wave_A.sh dispatches     # Executes parallel wave tasks
3. /wbTrack --stop          # Stops and finalizes session tracking log
```


### ⏱️ Matrix Task Duration Estimations
In the `## 🌊 Next Executable Sequence` matrix table, each task dispatch cell appends the estimated task duration extracted from the task table's `Est. (min)` column, formatted as `*(⏱️ <min> min)*`:

```markdown
`/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
```


### 💡 Pre-Flight Explanation Blueprint Gate (`--as`)
- **Standard Mode (default, without `--as`)**: Matrix cells contain **ONLY** the direct execution command:
  ```markdown
  `/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  ```
- **Explanation Mode (with `--as="<style>"`)**: Matrix cells prepend `/wbExplain`:
  ```markdown
  `/wbExplain plan.md --id=B23 --as="expert,steps"`<br>`/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  ```


### 🚀 Next Wave Execution Command Suggestions
Below the `## 🌊 Next Executable Sequence` matrix and Wave notes, `/wbPlan` and `/wbWork` output a dedicated recommendation block calculating total estimated duration (`Est. Time`) and offering ready-to-run CLI commands tailored for time and cost considerations:

- **Option 1 (Next Wave)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A -y"`
- **Option 2 (With `--as`)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A --as="expert,steps" -y"`
- **Option 3 (All Waves)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=all -y"`

## 🎛️ Universal model flags *(2026-08-01)*

| Flag | Alias | Effect |
|---|---|---|
| `--planner=` | `-p` | 🧠 Planner chain — **persists** via `/wbModel` |
| `--validator=` | `-v` | ✅ Validator chain — persists |
| `--worker=` | `-w` | 🔨 Worker chain — persists. ⚠️ `-w` is **not** `--wave` |
| `--mechanical=` | `-m` | 📋 Mechanical chain — persists |
| `--model=` | `-M` | **Delegate this run.** Highest priority: outranks role routing, the roster and the executor≠validator rule |
| `--wave=<L>:<R>` | `-W` | Run **one cell** — `:P` Planner · `:V` Validator · `:W` Worker · `:M` Mechanical |

```bash
/wbWork <folder>/ --wave="A:W" -M=$WORKER      # one cell, delegated
/wbValid <folder>/ --id="<i>" -v="go:ds4pro"           # persists the validator roster, then runs
```

Role flags are shorthand for running `/wbModel` first. An unknown role letter in `--wave` exits non-zero rather than silently running the whole row. **Precedence:** `-M` → role flag → plan-header roster → `model_recommendations.md` → defaults.

After the 🌊 matrix, a **copy/paste block** of bare runnable commands is printed — no table markup, no `<br>`, no duration annotations.

# The Daily Playbook — End-of-Day Routine

> This page defines the recommended end-of-day workflow. It covers the three commands you should run before closing your session to validate work, capture progress, and prepare a clean commit.

---

## The Closing Trifecta

```
/wbValid <plan> --task=N  →  /wbStandup <scope>  →  /wbGit <scope>
```

Every productive day ends with these three commands. They ensure nothing is left in an ambiguous state.

---

## Step 1: Validate with `/wbValid`

```text
$ /wbValid plan_wb-core_20260511.md --task=5

[AI] Reviewing task report for Task #5...
[AI] Checking acceptance criteria:
[AI]   ✓ Strategy pattern implemented
[AI]   ✓ Old auth module removed
[AI]   ✓ Tests pass (14/14)
[AI] Verdict: ✅ 9/10
[AI] Rationale: Clean implementation. Minor suggestion: add JSDoc to the strategy interface.
[AI] Appending validation to task report.
```

**What it does:**
- Reads the task report written by `/wbWork`
- Checks whether the acceptance criteria from the plan are met
- Assigns a score (1–10) with rationale
- Appends the validation to the existing report

**Why first:** Validate before you commit. Catching issues now is cheaper than catching them tomorrow.

### Batch Validation

If you completed multiple tasks during the day:

```bash
/wbValid plan_wb-core_20260511.md --task=5,6,7    # validate specific tasks
/wbValid plan_wb-core_20260511.md --task=*          # validate ALL done tasks
```

---

## Step 2: Summarize with `/wbStandup`

```text
$ /wbStandup packages/wb-core

[AI] Scanning today's activity...
[AI] Tasks completed: #5 (refactor auth) — ✅ 9/10
[AI] Tasks started: #6 (add tests) — 🔨 In Progress
[AI] Blockers: None
[AI] Writing reports/2026/05/11/standups/standup_wb-core_20260511.md:
```

**Generated standup:**

```markdown
## Standup: wb-core — 2026-05-11

### ✅ Done today
- Task #5: Refactored auth module to strategy pattern (9/10)

### 🔨 In Progress
- Task #6: Adding unit tests for strategy interface

### 🚧 Blockers
- None

### 📋 Tomorrow
- Complete Task #6, begin Task #7 (docs update)
```

**What it does:**
- Reads today's track file, plan changes, and task reports
- Generates a human-readable standup summary
- Auto-fills the "Tomorrow" section from the plan's open tasks

**Why second:** The standup captures your session state in a format that's useful for team communication and for your future self. Write it before you commit so the standup reflects the final validated state.

---

## Step 3: Commit with `/wbGit`

```text
$ /wbGit packages/wb-core

[AI] Analyzing staged changes...
[AI]   - Modified: src/auth/AuthStrategy.js (new file)
[AI]   - Modified: src/auth/index.js (refactored exports)
[AI]   - Deleted: src/auth/legacyAuth.js
[AI]   - Modified: tests/auth.test.js (14 new tests)
[AI] Generating commit message...
```

**Generated commit:**

```
refactor(wb-core): replace legacy auth with strategy pattern

Implements AuthStrategy interface with JWT and OAuth providers.
Removes legacyAuth.js (0 dependents). Adds 14 unit tests.

Ref: plan_wb-core_20260511.md Task #5
Validated-by: AI (9/10)
```

**What it does:**
- Analyzes your staged changes
- Generates a conventional-commit message
- Outputs the message to stdout — **you** run `git commit`

**Why third:** This is always the last step. The commit message references the validated task, creating a complete audit trail: plan → task → validation → commit.

---

## The Complete Evening in 90 Seconds

```bash
# 1. Did I do it right? (15s)
/wbValid plan_wb-core_20260511.md --task=5

# 2. What did I accomplish? (10s)
/wbStandup packages/wb-core

# 3. Ship it. (10s + manual git commit)
/wbGit packages/wb-core
git commit -m "$(pbpaste)"   # paste the generated message
```

---

## When to Skip Steps

| Situation | Skip |
|---|---|
| Task is trivial (config change) | Skip `/wbValid` — self-validation is acceptable. |
| Solo developer, no team standups | Skip `/wbStandup` — but `/wbTrack` already captures the narrative. |
| No staged changes | Skip `/wbGit` — nothing to commit. |
| End of sprint / major milestone | Add `/wbAudit` before `/wbGit` for a final quality check. |

---

← [Daily Use Hub](README.md) · [Home](../README.md)

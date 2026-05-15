# Zero to App Tutorial — Auditing, Releasing & Beyond

> Part 2 covers completing the remaining tasks, auditing the finished app, and preparing a release using wb-flow commands.

---

## Part 4: Completing the App

### Step 7: Execute Remaining Tasks

```bash
# Task 4: Dark mode (depends on Task 2)
/wbWork plan_my-vue-app_20260511.md --task=4

# AI creates:
#   src/composables/useDarkMode.js (system preference detection)
#   Updates AppLayout.vue with toggle button
#   Adds CSS custom properties for light/dark themes

# Task 5: Error boundary (independent)
/wbWork plan_my-vue-app_20260511.md --task=5

# AI creates:
#   src/components/ErrorBoundary.vue (errorCaptured hook)
#   Updates App.vue to wrap router-view in ErrorBoundary
```

### Step 8: Validate Everything

```bash
/wbValid plan_my-vue-app_20260511.md --task=*

[AI] Batch validation:
[AI]   Task #1: ✅ 10/10
[AI]   Task #2: ✅ 9/10
[AI]   Task #3: ✅ 8/10
[AI]   Task #4: ✅ 9/10
[AI]   Task #5: ✅ 8/10
[AI]
[AI] Overall: 5/5 tasks validated. Average: 8.8/10
```

---

## Part 5: Auditing the Finished App

### Step 9: Run a Final Audit

```bash
/wbAudit .
```

```text
[AI] === Audit Report: my-vue-app ===
[AI]
[AI] Findings:
[AI]   1. [MEDIUM] No unit tests (0% coverage)
[AI]   2. [LOW] No build configuration (vite/webpack)
[AI]   3. [LOW] Missing LICENSE file
[AI]
[AI] Score: 8/10
[AI] Improvement from last audit: N/A (first full audit)
```

The score improved from the initial project state because we've added components, routing, and a layout system. The remaining findings are expected — tests and build config are natural next steps.

---

## Part 6: Preparing a Release

### Step 10: Generate Standup & Commit

```bash
# Summarize the session
/wbStandup .

[AI] ## Standup: my-vue-app — 2026-05-11
[AI]
[AI] ### ✅ Done today
[AI] - Task #1: Created App.vue entry (10/10)
[AI] - Task #2: Created shared layout (9/10)
[AI] - Task #3: Added Vue Router (8/10)
[AI] - Task #4: Added dark mode (9/10)
[AI] - Task #5: Added error boundary (8/10)
[AI]
[AI] ### 📋 Next session
[AI] - Add unit tests (from audit finding #1)
[AI] - Set up Vite build (from audit finding #2)
```

```bash
# Generate commit message
/wbGit .

[AI] feat(my-vue-app): scaffold complete Vue 2.7 application
[AI]
[AI] Adds App.vue entry, AppLayout with dark mode toggle,
[AI] Vue Router with 3 routes (Home, About, Settings),
[AI] and ErrorBoundary component.
[AI]
[AI] 5 tasks completed from plan_my-vue-app_20260511.md
[AI] Average validation score: 8.8/10
```

---

## Summary: Commands Used

| Step | Command | Purpose |
|---|---|---|
| 1 | `npx @wbc-ui2/wb-flow init` | Bootstrap wb-flow |
| 2 | `/wbContext .` | Generate project identity |
| 3 | `/wbIdea .` | Brainstorm features |
| 4 | `/wbPlan . --ingest idea_*.md` | Create plan from ideas |
| 5–7 | `/wbWork plan_*.md --task=N` | Execute each task |
| 8 | `/wbValid plan_*.md --task=*` | Validate all work |
| 9 | `/wbAudit .` | Final quality check |
| 10 | `/wbStandup .` + `/wbGit .` | Summarize and commit |

---

## What You've Learned

| Concept | Where It Was Used |
|---|---|
| **Ideas Pipeline** | Step 3: `/wbIdea` generated scored features |
| **Plan ingestion** | Step 4: `--ingest` converted ideas to tasks |
| **Dependency ordering** | Tasks 2, 3 depended on Task 1 |
| **Batch validation** | Step 8: `--task=*` validated everything |
| **Audit feedback loop** | Step 9: re-audit after completing tasks |
| **Commit generation** | Step 10: `/wbGit` produced conventional commit |

You've now seen the complete wb-flow lifecycle: **idea → plan → work → validate → audit → commit**.

---

← [Start Here Hub](README.md) · [Home](../README.md)

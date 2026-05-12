# The Daily Playbook — Morning Routine

> This page defines the recommended morning workflow for a wb-flow developer. It covers the three commands you should run at the start of every session to establish context, resume work, and begin execution.

---

## The Morning Trifecta

```
/wbTrack <scope>  →  /wbPlan <scope> --resume  →  /wbWork <plan> --task=N
```

Every productive day starts with these three commands, in this exact order.

---

## Step 1: Orient with `/wbTrack`

```text
$ /wbTrack packages/wb-core

[AI] Scanning .wb/workflows/ for wb-core...
[AI] Last session: 2026-05-09 (2 days ago)
[AI] Plan status: plan_wb-core_20260509.md — 4/7 tasks done
[AI] Open tasks: #5 (refactor auth), #6 (add tests), #7 (update docs)
[AI] Writing tracks/2026/05/11/track_wb-core_20260511.md
```

**What it does:**
- Reads the most recent plan, audit, and standup files
- Generates a session narrative: what was done, what's pending, what changed since last session
- Creates a time-stamped track file that serves as your session's "journal"

**Why first:** You need to know where you left off before you can decide what to do next. `/wbTrack` gives you that context in 10 seconds.

---

## Step 2: Resume with `/wbPlan --resume`

```text
$ /wbPlan packages/wb-core --resume

[AI] Found existing plan: plan_wb-core_20260509.md
[AI] Stale check: 2 days old — within tolerance
[AI] Open tasks: #5 (P1), #6 (P1), #7 (P2)
[AI] Appending Entry #2 to plan_wb-core_20260511.md:
[AI]   - Carrying forward 3 open tasks
[AI]   - Recommending: Start with #5 (highest priority, no deps)
```

**What it does:**
- Finds the most recent plan file for the scope
- Checks for stale state (>7 days triggers a warning)
- Creates a new Entry (or a new daily file) that carries forward open tasks
- Adds `/wbNext`-style recommendations

**Why second:** Now that you know where you are (from `/wbTrack`), you need a prioritized work queue. `--resume` gives you that without regenerating the entire plan.

---

## Step 3: Execute with `/wbWork`

```text
$ /wbWork plan_wb-core_20260511.md --task=5

[AI] Claiming Task #5: "Refactor auth module to use strategy pattern"
[AI] Setting ☐ Done to 🔨...
[AI] Reading context.md, source files...
[AI] Executing...
```

**What it does:**
- Claims the task (sets state to 🔨)
- Reads all necessary context
- Executes the work described in the task
- Writes a task report
- Sets state to ✅ Done

**Why third:** With context established and priorities clear, you execute the highest-priority open task.

---

## The Complete Morning in 60 Seconds

```bash
# 1. Where am I? (5s)
/wbTrack packages/wb-core

# 2. What should I do? (10s)
/wbPlan packages/wb-core --resume

# 3. Do it. (varies)
/wbWork plan_wb-core_20260511.md --task=5
```

This sequence is so common that experienced users chain them mentally as a single action: "track → resume → work."

---

## When to Break the Pattern

| Situation | Instead of the trifecta... |
|---|---|
| First day on the project | Run `/wbAudit` first — there's no plan to resume. |
| Plan is >7 days stale | Run `/wbPlan` (full, not `--resume`) to regenerate. |
| Blocked by another package | Run `/wbNext` to get cross-package suggestions. |
| Everything is ✅ Done | Run `/wbAudit` to find new work, or `/wbIdea` to brainstorm. |

---

← [Daily Use Hub](README.md) · [Home](../README.md)

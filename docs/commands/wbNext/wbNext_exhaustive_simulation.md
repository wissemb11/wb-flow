# wb-flow Protocol: /wbNext Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbNext` command. It serves as the definitive reference for how the agent queries the Directed Acyclic Graph (DAG) in active plans to return the absolute highest-priority unblocked task.

---

## 1. Role & Definition Matrix
**Role:** The DAG Navigator & Task Allocator
**Target:** Reads the active `plan_*.md` file to determine the next logical step in the epic.
**Core Protocol:** Strict DAG interpretation. The agent must parse the `Dep` column. A task is only "Next" if its status is `⬜` (Pending) and all its dependencies are `✅` (Valid).

| Scenario | System Behavior |
|---|---|
| Multiple Unblocked Tasks | **[PROCEED]** Defaults to chronological order (Task 1 before Task 2). Can be overridden via sorting flags. |
| All Tasks Blocked | **[HALT]** If no tasks are unblocked, it means the current implementations failed validation. Recommends `/wbDebug`. |
| Plan Complete | **[PROCEED]** Detects all tasks are `✅`. Recommends `/wbRelease` or `/wbGit`. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbNext` uses directory scoping to find the relevant plan.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| No Argument | `Command: /wbNext` | Searches current directory for `plan_*.md`. | Returns the ID of the next local task. |
| Specific Package | `Command: /wbNext packages/wb-core` | Locks onto `wb-core`'s plan. | Returns the next task specific to the core package. |
| Wildcard Glob | `Command: /wbNext apps/*` | Extracts all active plans in consumer apps. | Generates a unified queue of the next available task for *each* app. |
| Natural Language | `Command: /wbNext "what should I do?"` | Fuzzily executes default logic. | "You should work on Task 2: JWT Implementation." |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--sort="<metric>"`| `-s` | Overrides chronological order. Supports `complexity`, `risk`, `priority`. | `Command: /wbNext -s="complexity"` | `[SORT] Task 4 is unblocked and has the lowest LOC estimate. Returning Task 4.` |
| `--act` | `-a` | Automatically executes `/wbWork` on the returned task ID. | `Command: /wbNext -a` | `[ACT] Task 2 is next. Executing /wbWork -i="2".` |
| `--explain` | `-e` | Verbose mode. Explains *why* this task was chosen over others. | `Command: /wbNext -e` | `[EXPLAIN] Task 3 was skipped because Task 1 is still Pending.` |
| `--assign="<user>"`| `-u` | Filters the next task specifically assigned to a specific developer or agent role. | `Command: /wbNext -u="Agentic"` | `[ASSIGN] Returning Task 2 (Assigned to: Agentic Validator).` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Continuous Integration Loop" (`-a -e`)
**Context:** A fully autonomous agent chain wants to find the next task, explain its rationale, and immediately start coding it without human intervention.
**Command Executed:** `/wbNext -a -e`
**Simulated Protocol Chain:**
1. Parses `plan_wb-core_20260504.md`.
2. Evaluates DAG. Task 1 is Valid. Task 2 is Pending. Task 3 is Blocked by 2.
3. Selects Task 2.
4. Explains selection (`-e`).
5. Hands off to `/wbWork` (`-a`).
**Simulated Output:**
```markdown
> Command: /wbNext -a -e

[SYSTEM] Querying DAG for next unblocked node...
[EXPLAIN] Task 1 is complete. Task 3 is blocked. Task 2 is the chronological successor.
[NEXT] Result: Task 2 (Regex Escaping).
[ACT] Handoff confirmed. Executing `/wbWork -i="2"`.
```

### 💠 The "Team Triage" (`apps/* -s="priority"`)
**Context:** A tech lead wants to know the single most important unblocked task across all frontend applications.
**Command Executed:** `/wbNext apps/* -s="priority"`
**Simulated Output:**
```markdown
> Command: /wbNext apps/* -s="priority"

[SYSTEM] Aggregating active plans across apps/*...
[SORT] Applying P0 priority matrix...
[NEXT] Result: Task 1 in md.wbc-ui.com (P0 - Fix Login Crash).
[RECOMMENDATION] Assign immediately.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Circular Dependency | Task 2 depends on 3. Task 3 depends on 2. | `❌ Error: Circular DAG detected. Plan is invalid. Please fix plan_*.md.` |
| Missing Plan | No `plan_*.md` file in target directory. | `❌ Error: No active plan found. Run /wbPlan to generate one.` |
| Stale Statuses | Tasks are marked "Implemented" but not "Valid". | `⚠️ Warning: Task 2 is implemented but pending validation. Run /wbValid before asking for Next.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

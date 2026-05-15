# wb-flow Protocol: /wbNext Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbNext` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Status: `plan_wb-core_20260504.md` exists. Tasks 1 and 2 are marked ✅ Valid. Task 3 is marked ⬜ Pending and depends on 1 and 2.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Multiple Unblocked Tasks | **[INACTIVE]** Only one task is currently pending. |
| All Tasks Blocked | **[INACTIVE]** Task 3's dependencies are cleared. |
| Plan Complete | **[INACTIVE]** Task 3 is still pending. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| No Argument | `Command: /wbNext` | Searches current `wb-core` directory. | `[PROCEED] Querying plan_wb-core_20260504.md for next task.` |
| Specific Package | `Command: /wbNext ../wb-dataviewer` | Locks onto sibling package. | `[PROCEED] Querying dataviewer plan.` |
| Wildcard Glob | `Command: /wbNext ../*` | Extracts all 4 core2 packages. | `[PROCEED] Finding the next available library task across the workspace.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--sort="<metric>"`| `Command: /wbNext -s="priority"` | `[SORT] Chronological override bypassed. Defaulting to Task 3.` |
| `--act` | `Command: /wbNext -a` | `[ACT] Returning Task 3. Auto-triggering /wbWork -i="3".` |
| `--explain` | `Command: /wbNext -e` | `[EXPLAIN] Task 3 selected because its dependencies (1, 2) are ✅ Valid.` |
| `--assign="<user>"`| `Command: /wbNext -u="wissemb11"` | `[ASSIGN] No pending tasks assigned to 'wissemb11'. Halting.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Continuous Integration Loop" (`-a -e`)
**Live Context:** Running this *right now* to autonomously finish the rest of the May 4th plan for `wb-core`.
**Command Executed:** `/wbNext -a -e`
**Live Output:**
```text
> Command: /wbNext -a -e

[SYSTEM] Querying DAG for next unblocked node in wb-core...
[EXPLAIN] Task 1 (JWT) is ✅ Valid. Task 2 (Regex) is ✅ Valid. 
[EXPLAIN] Task 3 (WBC.js Decomposition) is ⬜ Pending. Dependencies cleared.
[NEXT] Result: Task 3.
[ACT] Handoff confirmed. Executing `/wbWork -i="3"`.
```

### 💠 The "Team Triage" (`../* -s="complexity"`)
**Live Context:** A junior developer is looking for the easiest available task across all the core packages.
**Command Executed:** `/wbNext ../* -s="complexity"`
**Live Output:**
```text
> Command: /wbNext ../* -s="complexity"

[SYSTEM] Aggregating active plans across core2/packages...
[SORT] Applying low-complexity matrix...
[NEXT] Result: Task 1 in wb-dataviewer (Fix CSS typo).
[RECOMMENDATION] This task is isolated and requires < 10 lines of code.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Circular Dependency | **[PASS]** `plan_wb-core_20260504.md` DAG is linear (1, 2 -> 3). | Query succeeds. |
| Missing Plan | **[PASS]** Plan exists in current directory. | Query succeeds. |
| Stale Statuses | **[PASS]** Tasks 1 and 2 were explicitly validated via `/wbValid`. | Task 3 correctly identified as unblocked. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

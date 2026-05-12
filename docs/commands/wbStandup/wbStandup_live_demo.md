# wb-flow Protocol: /wbStandup Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbStandup` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2`
**Live State Evaluated:** 
*   Active Directory: `core2` (Monorepo root).
*   Status: `plan_wb-core_20260504.md` exists and contains completed and pending tasks.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Active Blockers Exist | **[ACTIVE]** System will parse `plan_wb-core_20260504.md` to identify DAG dependencies. |
| No Active Plan | **[INACTIVE]** Active plans found in `wb-core`. |
| Cross-Package Status | **[ACTIVE]** Ready to aggregate status across all `core2` apps and packages. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| No Argument | `Command: /wbStandup` | Scans current `core2` root. | `[PROCEED] Generating monorepo-wide morning brief.` |
| Specific Package | `Command: /wbStandup packages/wb-core` | Locks onto `wb-core`. | `[PROCEED] Filtering brief strictly to wb-core progress.` |
| Comma-Separated | `Command: /wbStandup apps/wbc-ui.com,packages/wb-core` | Merges contexts. | `[PROCEED] Reporting on consumer app and upstream library.` |
| Wildcard Glob | `Command: /wbStandup packages/*` | Extracts all 4 packages. | `[PROCEED] Aggregating library-wide sprint status.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--focus="<topic>"` | `Command: /wbStandup -f="completed"` | `[FOCUS] Reporting only on Tasks 1 and 2 from wb-core plan.` |
| `--yesterday` | `Command: /wbStandup -y` | `[YESTERDAY] Extracting "hygiene phase" logs from track_report.md.` |
| `--voice="<tone>"` | `Command: /wbStandup -v="developer"` | `[VOICE] Using technical terms (e.g., AST, JWT, DAG).` |
| `--markdown` | `Command: /wbStandup packages/wb-core -m` | `[MARKDOWN] Saved brief to reports/2026/05/04/standup_core.md.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Monday Morning Exec Brief" (`apps/* -y -v="exec_summary" -m`)
**Live Context:** Running this *right now* to summarize the current state of the frontend apps for a stakeholder meeting.
**Command Executed:** `/wbStandup apps/* -y -v="exec_summary" -m`
**Live Output:**
```text
> Command: /wbStandup apps/* -y -v="exec_summary" -m

[SYSTEM] Initiating Executive Standup for core2 apps...
[YESTERDAY] Loaded weekend track data.
[PLAN] No active blockers found in apps directory.
[VOICE] Formatting as Exec Summary...
[SUCCESS] Generated reports/2026/05/04/standup_exec.md.
```

### 💠 The "Blocker Triage" (`packages/wb-core -f="blockers"`)
**Live Context:** A developer is confused about what to work on next in `wb-core`.
**Command Executed:** `/wbStandup packages/wb-core -f="blockers"`
**Live Output:**
```text
> Command: /wbStandup packages/wb-core -f="blockers"

[SYSTEM] Initiating Triage Standup for wb-core...
[FOCUS] Filtering for DAG blockages...
[REPORT] Task 3 (WBC.js Decomposition) is BLOCKED.
[REASON] Task 3 requires Task 1 and 2 to be marked ✅ Valid.
[RECOMMENDATION] Task 1 is Implemented but not Validated. Run `/wbValid -i="1"`.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Missing Track Data | **[PASS]** `reports/` archive contains data for May. | Proceeding with `-y` injection. |
| Glob Explosion | **[PASS]** Only 4 apps in `core2/apps/`. | Aggregation succeeds. |
| Blank Plan | **[PASS]** `plan_wb-core_20260504.md` contains 3 distinct tasks. | Parsing proceeds. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

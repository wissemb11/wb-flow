# wb-flow Protocol: /wbStandup Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbStandup` command. It serves as the definitive reference for generating automated morning briefs, aggregating cross-package status, parsing blocked DAG tasks, and delivering project-wide context to the developer.

---

## 1. Role & Definition Matrix
**Role:** The Project Manager & Morning Briefer
**Target:** Reads `plan_*.md` files, `track_report.md` histories, and current git statuses to synthesize a high-level briefing.
**Core Protocol:** Strict "Read-Only" operation. `/wbStandup` never alters plans or code. It simply reports the current reality.

| Scenario | System Behavior |
|---|---|
| Active Blockers Exist | **[PROCEED]** Highlights blocked tasks immediately. Proposes diagnostic commands (e.g., `/wbDebug`) to resolve them. |
| No Active Plan | **[PROCEED]** Reports that the workspace is idle. Suggests running `/wbContext` followed by `/wbPlan`. |
| Cross-Package Status | **[PROCEED]** Aggregates data from multiple sub-packages if run from the monorepo root. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbStandup` parses different depths to provide the right level of briefing granularity.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| No Argument | `Command: /wbStandup` | Defaults to current directory. | Generates a standard briefing for the active scope. |
| Specific Package | `Command: /wbStandup packages/wb-core` | Locks onto `wb-core`. | Reports specifically on the core library's progress and backlog. |
| Comma-Separated | `Command: /wbStandup apps/ui,packages/core` | Parses multiple scopes. | Delivers a unified briefing showing the interaction between the app and library. |
| Wildcard Glob | `Command: /wbStandup apps/*` | Extracts all apps. | Massive sprint overview for all consumer-facing applications. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--focus="<topic>"` | `-f` | Forces the standup to highlight a specific domain (e.g., `blockers`, `completed`, `auth`). | `Command: /wbStandup -f="blockers"` | `[FOCUS] Suppressing completed tasks. Showing only 3 blocked DAG nodes.` |
| `--yesterday` | `-y` | Explicitly reads yesterday's `track_report.md` to start the briefing. | `Command: /wbStandup -y` | `[YESTERDAY] "Yesterday we completed the JWT integration..."` |
| `--voice="<tone>"` | `-v` | Adjusts the briefing style (`scrum_master`, `exec_summary`, `developer`). | `Command: /wbStandup -v="exec_summary"` | `[VOICE] Generating high-level bullet points. Skipping technical details.` |
| `--markdown` | `-m` | Outputs the briefing as a formatted `.md` file instead of console text. | `Command: /wbStandup -m` | `[MARKDOWN] Wrote briefing to reports/YYYY/MM/DD/standup.md.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Monday Morning Exec Brief" (`apps/* -y -v="exec_summary" -m`)
**Context:** It's Monday morning. The lead architect wants a massive overview of all frontend apps, referencing Friday's work, formatted for management.
**Command Executed:** `/wbStandup apps/* -y -v="exec_summary" -m`
**Simulated Protocol Chain:**
1. Resolves all `apps/*`.
2. Reads Friday's `track_report.md` (`-y`).
3. Evaluates all active `plan_*.md` files in the apps.
4. Applies Executive Summary tone (`-v`).
5. Writes to disk (`-m`).
**Simulated Output:**
```markdown
> Command: /wbStandup apps/* -y -v="exec_summary" -m

[SYSTEM] Initiating Executive Standup for apps/*...
[YESTERDAY] Loaded track data from last session.
[PLAN] Aggregating 3 active plans...
[VOICE] Formatting as Exec Summary...
[SUCCESS] Generated reports/2026/05/04/standup_exec.md.
```

### 💠 The "Blocker Triage" (`packages/wb-core -f="blockers"`)
**Context:** Developer is stuck. They want the agent to tell them exactly what is blocking progress in the core package right now.
**Command Executed:** `/wbStandup packages/wb-core -f="blockers"`
**Simulated Output:**
```markdown
> Command: /wbStandup packages/wb-core -f="blockers"

[SYSTEM] Initiating Triage Standup...
[FOCUS] Filtering for DAG blockages...
[REPORT] Task 3 (Decomposition) is BLOCKED.
[REASON] Task 2 (Regex Fix) is marked ⬜ Pending.
[RECOMMENDATION] Run `/wbWork -i="2"` to clear the blockage.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Missing Track Data | User runs `-y`, but no track file exists for yesterday. | `⚠️ Warning: No track data found for yesterday. Briefing will rely solely on current plan state.` |
| Glob Explosion | User runs `/wbStandup **/*`. System attempts to read 50 plans. | `❌ Error: Too many active plans found. Scope the standup to a specific workspace.` |
| Blank Plan | Active plan exists but contains 0 tasks. | `⚠️ Warning: Plan is empty. Run /wbAudit -a to generate new tasks.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

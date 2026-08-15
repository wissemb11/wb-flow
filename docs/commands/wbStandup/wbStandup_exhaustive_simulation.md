# /wbStandup — Exhaustive Simulation ()

`/wbStandup` is the morning briefer. It reads — never writes to — plans, reports, and track files, then delivers a synthesized status snapshot. The central design constraint: **read-only**. Unlike `/wbNext` (which recommends and can auto-execute), `/wbStandup` simply reports. It tells you where things stand and lets you decide what to do about it.

Read this if you want to know how the briefing aggregates cross-package data and where the read-only boundary sits.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Project Manager. Reports current reality, never alters it. |
| **Target** | Plan files (`plan_*.md`), track reports (`track_report.md`), and git status — scoped by directory argument. |
| **Cell scope** | None. `/wbStandup` is strictly read-only. |
| **Side effects allowed** | None. Reading files is the only operation. |
| **Side effects forbidden** | Editing plans, running tests, modifying code, writing reports. |

The read-only constraint is load-bearing. `/wbStandup` gets called inside `/wbTrack`'s §0 as a sub-command — its full output gets pasted inline. If it had side effects, the session initialization would mutate state as a byproduct of *describing* state. That would break the observer/actor separation that the whole framework relies on.

---

## 2. Argument resolution

| Form | Example | What `/wbStandup` reads |
|---|---|---|
| No argument | `Command: /wbStandup` | Current directory's plan + reports + tracks. |
| Package path | `Command: /wbStandup packages/wb-core` | wb-core's `.agents/workflows/reports/` tree. |
| Comma-separated | `Command: /wbStandup packages/wb-core,packages/wb-dataviewer` | Both packages. Unified briefing showing cross-package dependencies. |
| Wildcard glob | `Command: /wbStandup apps/*` | All consumer apps. Sprint-level overview. |

The comma-separated form is the interesting one. When you brief on `wb-core,wb-dataviewer` together, the standup doesn't just concatenate two reports — it identifies cross-package dependencies. If wb-dataviewer's plan has a task that depends on wb-core's row 3, and row 3 is `⬜`, that shows up as a cross-package blocker.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--act` | `-a` | Independent and composable with `--wbPlan`. |
| `--wbPlan` | `-P` | Independent and composable with `--act`. |
| `--archive` | `-A` | Universal, and here it means the **fleet-wide sweep**: consolidate into every scope's newest file per category, then retire the superseded folders below the target. Defaults to `--archive=all`. The standup's own `standups/` folder and every `tracks/` folder are never swept. Previews first, and asks before applying. |
| `--dry-run` | `-n` | With `--archive`: print the move list for every scope, move nothing. |
| `--snap` | — | Universal. Pins this run's output into `.wb/snaps/<YYYYMMDD>_<label>/`. |
| `--next` | — | Universal. Prints the `/wbNext` recommendation after the briefing. |

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbStandupSimPipelines = [
  {
    "title": "Morning kickoff with blocker triage",
    "cmd": "/wbStandup packages/wb-core -f=\"blockers\"",
    "logs": [
      {
        "text": "[SYSTEM] Initiating Blocker Triage for packages/wb-core...",
        "type": "sys"
      },
      {
        "text": "[READ] plan_wb-core_20260504.md (3 rows)",
        "type": "gen"
      },
      {
        "text": "[FOCUS] Filtering for DAG blockages and validation failures.",
        "type": "gen"
      },
      {
        "text": "# Standup: wb-core \u2014 Blocker Report",
        "type": "gen"
      },
      {
        "text": "## Blocked Tasks",
        "type": "sys"
      },
      {
        "text": "- **Row 3** (WBC.js decomposition) \u2014 \u2b1c Pending",
        "type": "gen"
      },
      {
        "text": "- Blocked by: nothing (Deps 1, 2 satisfied \u2705)",
        "type": "gen"
      },
      {
        "text": "- Actual status: **unblocked but untouched**",
        "type": "gen"
      },
      {
        "text": "## Validation Gaps",
        "type": "sys"
      },
      {
        "text": "- Row 1 (JWT handshake) \u2014 \u2705 Done, \u2705 Valid",
        "type": "gen"
      },
      {
        "text": "- Row 2 (renderString escape) \u2014 \u2705 Done, \u2705 Valid",
        "type": "gen"
      },
      {
        "text": "## Summary",
        "type": "sys"
      },
      {
        "text": "No hard blockers. 1 unstarted task with satisfied deps.",
        "type": "gen"
      },
      {
        "text": "**Recommendation:** Run `/wbWork --id=\"3\"` to clear the queue.",
        "type": "sys"
      }
    ],
    "note": "The developer starts the day and wants to know exactly what's blocking progress in wb-core:",
    "noteType": "info"
  },
  {
    "title": "Executive summary across all apps",
    "cmd": "/wbStandup apps/* -y -v=\"exec_summary\" -m",
    "logs": [
      {
        "text": "[SYSTEM] Aggregating apps/*...",
        "type": "sys"
      },
      {
        "text": "[READ] plans from: demo.wbc-ui.com, md.wbc-ui.com, wbc-ui.com",
        "type": "gen"
      },
      {
        "text": "[YESTERDAY] Loading track data from 2026-05-04.",
        "type": "gen"
      },
      {
        "text": "[VOICE] Formatting as Executive Summary.",
        "type": "gen"
      },
      {
        "text": "# Executive Standup \u2014 All Consumer Apps (2026-05-05)",
        "type": "gen"
      },
      {
        "text": "## Progress",
        "type": "sys"
      },
      {
        "text": "| App | Tasks Done | Tasks Open | Blockers |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| demo.wbc-ui.com | 2/4 | 2 | 0 |",
        "type": "sys"
      },
      {
        "text": "| md.wbc-ui.com | 5/5 | 0 | 0 \u2705 |",
        "type": "sys"
      },
      {
        "text": "| wbc-ui.com | 1/6 | 5 | 2 (auth, VuePress) |",
        "type": "sys"
      },
      {
        "text": "## Yesterday's Highlights",
        "type": "sys"
      },
      {
        "text": "- md.wbc-ui.com completed architecture stabilization.",
        "type": "gen"
      },
      {
        "text": "- wbc-ui.com hit the VuePress incompatibility wall (parked).",
        "type": "gen"
      },
      {
        "text": "## Risks",
        "type": "sys"
      },
      {
        "text": "- wbc-ui.com has 2 blocked tasks with no clear resolution path.",
        "type": "gen"
      },
      {
        "text": "- The WBDataViewer apiResponse_ cache gap affects consumers downstream.",
        "type": "gen"
      },
      {
        "text": "[WROTE] reports/2026/05/05/standups/standup_apps_20260505.md",
        "type": "gen"
      }
    ],
    "note": "Monday morning. The lead wants a high-level view of all consumer apps for management:",
    "noteType": "info"
  },
  {
    "title": "Deep standup on a package with stale data",
    "cmd": "/wbStandup packages/wb-core -y",
    "logs": [
      {
        "text": "[SYSTEM] Standup for packages/wb-core...",
        "type": "sys"
      },
      {
        "text": "[YESTERDAY] Loading track_wb-core_20260504.md (finalized, 6 sections).",
        "type": "gen"
      },
      {
        "text": "[READ] Current plan state + git status.",
        "type": "gen"
      },
      {
        "text": "# Standup: wb-core \u2014 2026-05-05",
        "type": "gen"
      },
      {
        "text": "## Yesterday (from track file)",
        "type": "sys"
      },
      {
        "text": "- the AI agent: Completed rows 1-2 (JWT handshake, renderString escape).",
        "type": "gen"
      },
      {
        "text": "- the AI agent: Validated rows 1-2. Recommended row 3 as priority.",
        "type": "gen"
      },
      {
        "text": "- Session ended without starting row 3.",
        "type": "gen"
      },
      {
        "text": "## Current State",
        "type": "sys"
      },
      {
        "text": "| # | Task | Done | Valid | Status |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 1 | JWT handshake | \u2705 | \u2705 | Complete |",
        "type": "sys"
      },
      {
        "text": "| 2 | renderString escape | \u2705 | \u2705 | Complete |",
        "type": "sys"
      },
      {
        "text": "| 3 | WBC.js decomposition | \u2b1c | \u2b1c | **Ready** \u2014 deps satisfied |",
        "type": "sys"
      },
      {
        "text": "## Deferred Items",
        "type": "sys"
      },
      {
        "text": "- dist-folder mismatch in wbc-ui2-cdn (project_pkg_dist_mismatch.md)",
        "type": "gen"
      },
      {
        "text": "- apiResponse_ cache invalidation gap (project_wbdataviewer_apiResponse.md)",
        "type": "gen"
      },
      {
        "text": "## Recommendation",
        "type": "sys"
      },
      {
        "text": "Start with `/wbWork --id=\"3\"`. The plan has one remaining task.",
        "type": "gen"
      },
      {
        "text": "After completion, run `/wbValid --id=\"3\"` then `/wbGit` to close the epic.",
        "type": "gen"
      }
    ],
    "note": "The developer suspects yesterday's reports are outdated. They want the standup to also surface *git diff* evidence:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbStandup" titleSuffix="Exhaustive Simulation" :pipelines="wbStandupSimPipelines" />


### 💠 Pipeline Morning kickoff with blocker triage

The developer starts the day and wants to know exactly what's blocking progress in wb-core:


### 💠 Pipeline Executive summary across all apps

Monday morning. The lead wants a high-level view of all consumer apps for management:


### 💠 Pipeline Deep standup on a package with stale data

The developer suspects yesterday's reports are outdated. They want the standup to also surface *git diff* evidence:

---

## 5. Edge cases & refusals

| Trigger | What `/wbStandup` does |
|---|---|
| No plan file in scope | Reports: `⚠️ No active plan found for <scope>. Run /wbContext followed by /wbPlan to generate one.` |
| `**/*` glob (too broad) | `❌ Too many scopes. Narrow to a specific directory or use apps/* or packages/*.` |
| Empty plan (file exists, 0 rows) | `⚠️ Plan exists but contains 0 tasks. Run /wbAudit to generate findings, then /wbPlan.` |
| `/wbStandup` on a scope with no `.agents/workflows/` | `⚠️ No workflow directory found. Run /wbContext <scope> to initialize.` |

The pattern across all of these: **`/wbStandup` never halts on missing data — it degrades gracefully.** Missing track file? Skip the "yesterday" section. Missing plan? Suggest how to create one. Empty plan? Point to the audit command. The standup is the *entry point* for many sessions, so it can't be brittle. Compare to `/wbWork`, which halts aggressively on missing data — the worker can't guess what to implement, but the briefer can always summarize what exists.

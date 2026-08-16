# /wbStandup — Live Demo ()

This is what `/wbStandup` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](wbStandup_exhaustive_simulation.md), but every cell is filled from the *live* state of the repo — real plan files, real track histories, real blocker chains.

---

<CommandLiveDemoAnimation command="wbStandup" />

## 1. Live target

| Field | Live value |
|---|---|
| Active scope | `core2/packages/wb-core` |
| Active plan | `reports/20260504/plans/plan_wb-core_20260504.md` |
| Yesterday's track | `tracks/2026/05/04/track_wb-core_20260504.md` (finalized) |
| Git status | Clean — last commit from yesterday's session |

The plan state right now:

| # | Task | Dep | Done | Valid |
|---|---|---|---|---|
| 1 | JWT handshake in tierEnforcement.js | — | ✅ | ✅ |
| 2 | renderString escape pass | — | ✅ | ✅ |
| 3 | WBC.js decomposition | 1, 2 | ⬜ | ⬜ |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbStandup packages/wb-core` | Reads wb-core's plan + yesterday's track. Reports 2/3 done, 1 unblocked. |
| `/wbStandup` (no arg, from core2) | Reads all package plans. Aggregates cross-package status. |
| `/wbStandup packages/wb-core,packages/wb-dataviewer` | Unified briefing. Would surface the apiResponse_ dependency gap. |
| `/wbStandup apps/*` | Reads plans for demo.wbc-ui.com, md.wbc-ui.com, wbc-ui.com. Sprint overview. |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbStandup packages/wb-core` | Standard briefing. 2 done, 1 ready. No blockers. |
| `/wbStandup packages/wb-core -f="blockers"` | `ℹ️ No blocked tasks. Row 3 is unblocked (deps 1, 2 satisfied). Showing as "stalled" instead.` |
| `/wbStandup packages/wb-core -y` | Includes yesterday's track summary: "the agent completed rows 1-2. the agent validated. Row 3 deferred to today." |
| `/wbStandup packages/wb-core -v="exec_summary"` | `Progress: 67% (2/3 tasks). 0 blockers. ETA: 1 task remaining (~2h).` |
| `/wbStandup packages/wb-core -m` | Writes to `reports/2026/05/05/standups/standup_wb-core_20260505.md`. |

---

## 4. Pipelines

<script setup>
const wbStandupPipelines = [
  {
    "title": "Standard morning standup",
    "cmd": "/wbStandup packages/wb-core",
    "logs": [
      {
        "text": "[SYSTEM] Standup for packages/wb-core...",
        "type": "sys"
      },
      {
        "text": "[READ] plan_wb-core_20260504.md",
        "type": "gen"
      },
      {
        "text": "# Standup: wb-core \u2014 2026-05-05",
        "type": "gen"
      },
      {
        "text": "## Plan Status",
        "type": "sys"
      },
      {
        "text": "| # | Task | Done | Valid | Status |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| 1 | JWT handshake in tierEnforcement.js | \u2705 | \u2705 | Complete |",
        "type": "gen"
      },
      {
        "text": "| 2 | renderString escape pass | \u2705 | \u2705 | Complete |",
        "type": "gen"
      },
      {
        "text": "| 3 | WBC.js decomposition | \u2b1c | \u2b1c | **Ready** (deps satisfied) |",
        "type": "gen"
      },
      {
        "text": "## Progress: 2/3 tasks complete (67%)",
        "type": "sys"
      },
      {
        "text": "**Blockers:** None",
        "type": "sys"
      },
      {
        "text": "**Stalled:** Row 3 \u2014 unblocked since yesterday, not started",
        "type": "sys"
      },
      {
        "text": "## Parked Tech Debt",
        "type": "sys"
      },
      {
        "text": "- dist-folder mismatch in wbc-ui2-cdn (project_pkg_dist_mismatch.md)",
        "type": "gen"
      },
      {
        "text": "- apiResponse_ cache invalidation in wb-dataviewer (parked)",
        "type": "gen"
      },
      {
        "text": "## Recommendation",
        "type": "sys"
      },
      {
        "text": "Row 3 is the only remaining task. Execute:",
        "type": "gen"
      },
      {
        "text": "1. `/wbWork --id=\"3\"` \u2014 implement the decomposition",
        "type": "gen"
      },
      {
        "text": "2. `/wbValid --id=\"3\"` \u2014 validate with a different model",
        "type": "gen"
      },
      {
        "text": "3. `/wbGit` \u2014 commit and close the epic",
        "type": "gen"
      },
      {
        "text": "[OK] Read-only. No files modified.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Cross-package standup with yesterday's context",
    "cmd": "/wbStandup packages/wb-core,packages/wb-dataviewer -y",
    "logs": [
      {
        "text": "[SYSTEM] Unified standup for wb-core + wb-dataviewer...",
        "type": "sys"
      },
      {
        "text": "[YESTERDAY] Loading track_wb-core_20260504.md (6 sections, 2 models).",
        "type": "gen"
      },
      {
        "text": "[READ] Plans for both packages.",
        "type": "gen"
      },
      {
        "text": "# Unified Standup: wb-core + wb-dataviewer \u2014 2026-05-05",
        "type": "gen"
      },
      {
        "text": "## Yesterday (from track file)",
        "type": "sys"
      },
      {
        "text": "- **wb-core:** the agent completed rows 1-2. the agent validated both. Row 3 deferred.",
        "type": "gen"
      },
      {
        "text": "- **wb-dataviewer:** No session tracked yesterday. Last activity: 2026-05-02.",
        "type": "gen"
      },
      {
        "text": "## wb-core",
        "type": "sys"
      },
      {
        "text": "| # | Task | Status |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| 3 | WBC.js decomposition | Ready (deps satisfied) |",
        "type": "gen"
      },
      {
        "text": "## wb-dataviewer",
        "type": "sys"
      },
      {
        "text": "| Status | Detail |",
        "type": "gen"
      },
      {
        "text": "|---|---|",
        "type": "gen"
      },
      {
        "text": "| Active plan | None \u2014 last plan closed on 2026-04-30 |",
        "type": "gen"
      },
      {
        "text": "| Parked issues | apiResponse_ cache invalidation (project_wbdataviewer_apiResponse.md) |",
        "type": "gen"
      },
      {
        "text": "| Recommendation | `/wbAudit packages/wb-dataviewer` to generate fresh findings |",
        "type": "gen"
      },
      {
        "text": "## Cross-Package Dependencies",
        "type": "sys"
      },
      {
        "text": "- wb-dataviewer imports from wb-core's WBC.js",
        "type": "gen"
      },
      {
        "text": "- If row 3 (WBC.js decomposition) changes the export surface, wb-dataviewer tests may break",
        "type": "gen"
      },
      {
        "text": "- **Suggestion:** Run `/wbTest packages/wb-dataviewer` after completing row 3",
        "type": "gen"
      },
      {
        "text": "[OK] Read-only. No files modified.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Exec summary for all apps, written to disk",
    "cmd": "/wbStandup apps/* -v=\"exec_summary\" -m",
    "logs": [
      {
        "text": "[SYSTEM] Executive Standup for apps/*...",
        "type": "sys"
      },
      {
        "text": "[READ] Plans for: demo.wbc-ui.com, md.wbc-ui.com, wbc-ui.com",
        "type": "gen"
      },
      {
        "text": "# Executive Standup \u2014 Consumer Apps (2026-05-05)",
        "type": "gen"
      },
      {
        "text": "| App | Done | Open | Blocked | Health |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| demo.wbc-ui.com | 2/4 | 2 | 0 | \ud83d\udfe1 In Progress |",
        "type": "gen"
      },
      {
        "text": "| md.wbc-ui.com | 5/5 | 0 | 0 | \ud83d\udfe2 Complete |",
        "type": "gen"
      },
      {
        "text": "| wbc-ui.com | 1/6 | 5 | 2 | \ud83d\udd34 At Risk |",
        "type": "gen"
      },
      {
        "text": "## Key Risks",
        "type": "sys"
      },
      {
        "text": "- wbc-ui.com: VuePress incompatibility blocks 2 tasks (no resolution path)",
        "type": "gen"
      },
      {
        "text": "- demo.wbc-ui.com: pending tasks are low-risk, ETA this week",
        "type": "gen"
      },
      {
        "text": "[WROTE] reports/2026/05/05/standups/standup_apps_20260505.md",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbStandup" :pipelines="wbStandupPipelines" />


### 💠 Pipeline Standard morning standup


### 💠 Pipeline Cross-package standup with yesterday's context


### 💠 Pipeline Exec summary for all apps, written to disk

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbStandup packages/nonexistent` | `❌ Directory not found.` |
| `/wbStandup -f="security"` with no security tasks | `ℹ️ No tasks matching "security" in the active plan. The plan covers: JWT handshake, renderString escape, WBC.js decomposition.` |
| `/wbStandup **/*` | `❌ Glob too broad. Use a specific path or apps/* / packages/*.` |
| `/wbStandup -y` when no track exists for yesterday | `⚠️ No track data for 2026-05-04. Briefing based on current plan state only.` (Degrades, doesn't halt.) |

The pattern: `/wbStandup` degrades gracefully on missing data but refuses invalid paths. It's the session entry point — it must always produce *something* useful, even if context is incomplete.

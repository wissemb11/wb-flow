# /wbTrack — Exhaustive Simulation ()

`/wbTrack` is a toggle, not a one-shot. It activates session tracking for the current model — from that point, every `/wb*` command produces its normal report **and** appends a §N narrative section to a universal daily session file. The design decision that matters most: all models share one file per day per scope. There are no `<model>/` subfolders.

Read this if you want to know what "universal daily file" means in practice, why the tracks/reports split exists, and how the multi-model contribution model prevents collisions.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Session Logger. Transforms scattered command outputs into a single-day narrative. |
| **Target** | A package or the monorepo root — determines the scope of the session file. |
| **Cell scope** | None. `/wbTrack` never touches plan cells, never writes reports. It owns `tracks/` exclusively. |
| **Side effects allowed** | Creating the session file, appending §N sections, running `/wbStandup` as a sub-command for §0. |
| **Side effects forbidden** | Modifying reports, editing plans, altering code, running tests. |

The tracks/reports split is the core architectural decision. **Reports** are structured, machine-scannable outputs that `/wbStandup` and `/wbPlan` read. **Tracks** are human-readable narratives with commentary, model recommendations, and strategic analysis. The same `/wbTest` run produces a test report (in `reports/`) and a §N section (in `tracks/`) — two outputs, two audiences, zero overlap.

Why not just add commentary to the report? Because reports need to be append-only and schema-stable for downstream consumers. Commentary is free-form and model-specific — it would pollute the scan surface.

---

## 2. The argument grammar

`/wbTrack` accepts one optional positional argument: the scope.

| Form | Example | Meaning |
|---|---|---|
| No argument | `Command: /wbTrack` | Scope = monorepo root (`core2/`). Session file at `core2/.agents/workflows/tracks/<date>/track_core2_<date>.md`. |
| Package path | `Command: /wbTrack packages/wb-core` | Scope = wb-core. Session file at `packages/wb-core/.agents/workflows/tracks/<date>/track_wb-core_<date>.md`. |
| App path | `Command: /wbTrack apps/demo.wbc-ui.com` | Scope = demo app. Session file in the app's own `.agents/workflows/tracks/`. |

No glob, no comma-separated, no `--id`. The scope is always **one** directory. You track one thing at a time per model — this is a hard rule, not a missing feature. Parallel tracking would produce interleaved §N sections with no clear narrative order.

---

## 3. Flag matrix

`/wbTrack` has exactly two flags. The command's value is in the toggle behavior, not in configuration.

| Flag | Shortcut | Purpose |
|---|---|---|
| `--finalize` | `-f` | On `/wbStopTrack --finalize`: extract derivative files (tips, warnings, importants, commentaries, all_commands, resume) from the session file. Without it, `/wbStopTrack` writes only the §STOP block. |
| `--scope` | `-s` | When the model is already tracking, reports which scope is active. No mutation. |

The `-f` flag is intentionally on `/wbStopTrack`, not on `/wbTrack` itself. Extracting derivatives mid-session would produce partial summaries. The design forces you to finalize at session end — when all §N sections exist.

**What `/wbTrack` doesn't have:** `--date`, `--merge`, `--dry-run`. These exist on the agent's version but are absent here. the agent's `/wbTrack` doesn't need `--date` because you can't retroactively inject yourself into a past session — that's historical fabrication. `--merge` is implicit (Smart Merge always applies when the file exists). `--dry-run` is meaningless for a toggle.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbTrackSimPipelines = [
  {
    "title": "First model starts the day",
    "cmd": "/wbTrack packages/wb-core",
    "logs": [
      {
        "text": "[SYSTEM] Scope: packages/wb-core",
        "type": "sys"
      },
      {
        "text": "[CHECK] tracks/2026/05/04/track_wb-core_20260504.md \u2192 does not exist.",
        "type": "gen"
      },
      {
        "text": "[CREATE] Initializing universal daily session file.",
        "type": "gen"
      },
      {
        "text": "[SUB-COMMAND] Running /wbStandup wb-core (mandatory for \u00a70)...",
        "type": "gen"
      },
      {
        "text": "# Track: wb-core \u2014 2026-05-04",
        "type": "gen"
      },
      {
        "text": "> **Target:** packages/wb-core",
        "type": "gen"
      },
      {
        "text": "> **Created by:** the AI agent via Antigravity",
        "type": "gen"
      },
      {
        "text": "> **Started:** 2026-05-04 09:12",
        "type": "gen"
      },
      {
        "text": "> **Status:** \ud83d\udfe2 ACTIVE",
        "type": "gen"
      },
      {
        "text": "# \u00a70 \u2014 Strategic Vision *(the AI agent \u2014 09:12)*",
        "type": "gen"
      },
      {
        "text": "## Current State",
        "type": "sys"
      },
      {
        "text": "[Reads wb-core source, .agents/workflows/, past reports]",
        "type": "gen"
      },
      {
        "text": "## Past Debt: /wbStandup wb-core output",
        "type": "sys"
      },
      {
        "text": "[Full standup output pasted inline \u2014 not referenced, not summarized]",
        "type": "gen"
      },
      {
        "text": "## My Recommendation",
        "type": "sys"
      },
      {
        "text": "| Order | Command | Why | Recommended Models |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 1 | /wbAudit packages/wb-core -P | tierEnforcement.js has parked tech debt | the agent 4 / the agent 4 |",
        "type": "sys"
      },
      {
        "text": "| 2 | /wbWork --id=\"1\" | JWT handshake is unblocked | the agent 4 |",
        "type": "sys"
      },
      {
        "text": "...",
        "type": "gen"
      },
      {
        "text": "[OK] Tracking ON. Every /wb* command will now append \u00a7N to this file.",
        "type": "ok"
      }
    ],
    "note": "Morning. the AI agent opens a session on `wb-core`. The file doesn't exist yet.",
    "noteType": "info"
  },
  {
    "title": "Second model joins the same session",
    "cmd": "/wbTrack packages/wb-core",
    "logs": [
      {
        "text": "[SYSTEM] Scope: packages/wb-core",
        "type": "sys"
      },
      {
        "text": "[CHECK] tracks/2026/05/04/track_wb-core_20260504.md \u2192 exists (3 sections).",
        "type": "gen"
      },
      {
        "text": "[APPEND] Adding contributor entry.",
        "type": "gen"
      },
      {
        "text": "# \u00a74 \u2014 Contributor Entry *(the AI agent via the agent CLI \u2014 14:30)*",
        "type": "gen"
      },
      {
        "text": "## My Assessment",
        "type": "sys"
      },
      {
        "text": "The morning session (\u00a70\u2013\u00a73) completed rows 1-2 of the plan.",
        "type": "gen"
      },
      {
        "text": "Row 3 (WBC.js decomposition) is now unblocked but was not started.",
        "type": "gen"
      },
      {
        "text": "I disagree with \u00a70's recommendation to defer row 3 \u2014 the decomposition",
        "type": "gen"
      },
      {
        "text": "is a prerequisite for next week's consumer app work.",
        "type": "gen"
      },
      {
        "text": "## Suggested Next Steps",
        "type": "sys"
      },
      {
        "text": "| Priority | Command | Why | Recommended Models |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| \ud83d\udd34 1st | /wbWork --id=\"3\" | Unblocked, prerequisite for apps | the agent 4 |",
        "type": "sys"
      },
      {
        "text": "| \ud83d\udfe1 2nd | /wbValid --id=\"1,2\" | Morning work needs validation | the agent 4 |",
        "type": "sys"
      },
      {
        "text": "[OK] Tracking ON for the AI agent.",
        "type": "ok"
      }
    ],
    "note": "Afternoon. the AI agent opens a session on the same scope. The file already exists.",
    "noteType": "info"
  },
  {
    "title": "Cross-package work during a session",
    "cmd": "/wbTest packages/wb-dataviewer",
    "logs": [
      {
        "text": "[SYSTEM] Tracking: wb-core (active).",
        "type": "sys"
      },
      {
        "text": "[REPORT] Test report \u2192 packages/wb-dataviewer/.agents/workflows/reports/2026/05/04/tests/test_wb-dataviewer_20260504.md",
        "type": "gen"
      },
      {
        "text": "[TRACK] \u00a75 \u2192 packages/wb-core/.agents/workflows/tracks/2026/05/04/track_wb-core_20260504.md",
        "type": "gen"
      },
      {
        "text": "# \u00a75 \u2014 `/wbTest packages/wb-dataviewer` *(the AI agent \u2014 15:20)*",
        "type": "gen"
      },
      {
        "text": "## What the user did",
        "type": "sys"
      },
      {
        "text": "/wbTest packages/wb-dataviewer",
        "type": "gen"
      },
      {
        "text": "## What happened",
        "type": "sys"
      },
      {
        "text": "### Files read",
        "type": "gen"
      },
      {
        "text": "- packages/wb-dataviewer/src/**/*.js",
        "type": "gen"
      },
      {
        "text": "### Files created/modified",
        "type": "gen"
      },
      {
        "text": "| File | Action | What it contains |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| `test_wb-dataviewer_20260504.md` | Created | Unit test results |",
        "type": "sys"
      },
      {
        "text": "## Commentary",
        "type": "sys"
      },
      {
        "text": "- **Outcome:** 14/14 tests passed. The apiResponse_ cache pattern held up.",
        "type": "gen"
      },
      {
        "text": "- **Insights:** The test suite doesn't cover the invalidation path \u2014 parked issue.",
        "type": "gen"
      }
    ],
    "note": "The model is tracking `wb-core` but runs a command on `wb-dataviewer`:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbTrack" titleSuffix="Exhaustive Simulation" :pipelines="wbTrackSimPipelines" />


### 💠 Pipeline First model starts the day

Morning. the AI agent opens a session on `wb-core`. The file doesn't exist yet.


### 💠 Pipeline Second model joins the same session

Afternoon. the AI agent opens a session on the same scope. The file already exists.


### 💠 Pipeline Cross-package work during a session

The model is tracking `wb-core` but runs a command on `wb-dataviewer`:

---

## 5. Edge cases & refusals

| Trigger | What `/wbTrack` does |
|---|---|
| `/wbTrack packages/wb-core` when already tracking `core2` | Halt. `⚠️ Already tracking: core2. Run /wbStopTrack first.` |
| `/wbTrack` with no scope twice (same model) | Halt. Same — already tracking. |
| `/wbStopTrack --finalize` mid-day | Proceeds but prints a warning: `⚠️ Partial session. Derivatives will be incomplete — consider waiting until end of day.` |
| `/wbTrack packages/wb-core` when the folder doesn't have `.agents/workflows/` | Creates the directory structure. Not a refusal — `/wbTrack` is allowed to bootstrap. |
| Two models tracking different scopes simultaneously | Fine. Model A tracks `core2`, Model B tracks `wb-core`. Different files, no collision. |
| Same model tracking the same scope it already stopped | Fine. `/wbStopTrack` just writes §STOP — `/wbTrack` can re-open and append a new contributor entry. |

The unifying principle: **`/wbTrack` is a state toggle with single-scope enforcement per model.** It doesn't have complex filter grammar because it doesn't need it — you're either tracking one thing or you're not. The complexity lives in the §N sections that accumulate during the session, not in the command's own argument parsing.

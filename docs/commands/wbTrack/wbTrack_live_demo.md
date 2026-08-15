# /wbTrack — Live Demo ()

This is what `/wbTrack` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](./wbTrack_exhaustive_simulation), but every cell is filled from the *live* state of the repo — the session files that exist, the models that contributed, the derivative files that were extracted.

---

<CommandLiveDemoAnimation command="wbTrack" />

## 1. Live target

| Field | Live value |
|---|---|
| Active scope | `core2/packages/wb-core` |
| Session file path | `packages/wb-core/.agents/workflows/tracks/2026/05/05/track_wb-core_20260505.md` |
| Prior sessions | `track_wb-core_20260504.md` exists (yesterday — finalized with derivatives) |
| Current model | the AI agent via Antigravity |
| Models that contributed yesterday | the AI agent (§0–§3), the AI agent (§4–§6, via the agent CLI) |

The real state right now: the `wb-core` plan has 3 rows. Rows 1 and 2 were completed yesterday. Row 3 (WBC.js decomposition) was left unblocked but not started — the agent's §4 recommended it, but the session ended before anyone picked it up.

---

## 2. What the argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbTrack packages/wb-core` | Creates `track_wb-core_20260505.md` (new day, new file). Runs `/wbStandup wb-core` as §0 sub-command. |
| `/wbTrack` (no arg) | Creates `track_core2_20260505.md` at monorepo root. Different file, different scope. |
| `/wbTrack packages/wb-dataviewer` | Creates `track_wb-dataviewer_20260505.md`. Independent session — the wb-core session is unrelated. |
| `/wbTrack packages/wb-core` when already tracking core2 | Halt. `⚠️ Already tracking: core2. Run /wbStopTrack first.` |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbTrack packages/wb-core` (no flags) | Creates today's session file. Writes §0 with full `/wbStandup` output. Tracking ON for this model. |
| `/wbTrack -s` (while tracking) | Reports: `🟢 Active scope: packages/wb-core. Session file: track_wb-core_20260505.md. Sections: §0.` |
| `/wbTrack -s` (while not tracking) | Reports: `⚪ Tracking OFF. No active session for this model.` |
| `/wbStopTrack` | Writes §STOP to the session file. Tracking OFF. File remains open for other models. |
| `/wbStopTrack -f` | Writes §STOP + extracts 6 derivative files from the session. |

The derivatives extracted by `-f` for yesterday's session:

| Derivative | Content |
|---|---|
| `track_wb-core_20260504_tips.md` | All `[!TIP]` callouts from §0–§6 |
| `track_wb-core_20260504_warnings.md` | All `[!WARNING]` callouts |
| `track_wb-core_20260504_importants.md` | All `[!IMPORTANT]` callouts |
| `track_wb-core_20260504_commentaries.md` | All Commentary sections, stripped of headers |
| `track_wb-core_20260504_all_commands.md` | Every `/wb*` command executed during the session |
| `track_wb-core_20260504_resume.md` | Last §N's "Recommended Next" table — the handoff document |

---

## 4. Pipelines

<script setup>
const wbTrackPipelines = [
  {
    "title": "Start today's session (first model)",
    "cmd": "/wbTrack packages/wb-core",
    "logs": [
      {
        "text": "[SYSTEM] Scope: packages/wb-core",
        "type": "sys"
      },
      {
        "text": "[CHECK] tracks/2026/05/05/track_wb-core_20260505.md \u2192 does not exist.",
        "type": "gen"
      },
      {
        "text": "[CREATE] Initializing universal daily session file.",
        "type": "gen"
      },
      {
        "text": "[SUB-COMMAND] /wbStandup packages/wb-core...",
        "type": "gen"
      },
      {
        "text": "# Track: wb-core \u2014 2026-05-05",
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
        "text": "> **Started:** 2026-05-05 04:03",
        "type": "gen"
      },
      {
        "text": "> **Status:** \ud83d\udfe2 ACTIVE",
        "type": "gen"
      },
      {
        "text": "# \u00a70 \u2014 Strategic Vision *(the AI agent \u2014 04:03)*",
        "type": "gen"
      },
      {
        "text": "## Current State",
        "type": "sys"
      },
      {
        "text": "wb-core has a 3-row plan. Rows 1-2 (JWT handshake, renderString escape)",
        "type": "gen"
      },
      {
        "text": "are \u2705 Done + \u2705 Valid (validated yesterday by the agent). Row 3 (WBC.js",
        "type": "gen"
      },
      {
        "text": "decomposition) is \u2b1c \u2014 unblocked but untouched. Yesterday's session",
        "type": "gen"
      },
      {
        "text": "(track_wb-core_20260504.md) ended with the agent recommending row 3 as",
        "type": "gen"
      },
      {
        "text": "the immediate priority.",
        "type": "gen"
      },
      {
        "text": "## Past Debt: /wbStandup wb-core output",
        "type": "sys"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Execute work while tracking",
    "cmd": "/wbWork --id=\"3\"",
    "logs": [
      {
        "text": "[REPORT] \u2192 reports/2026/05/05/plans/plan_wb-core_20260505.md (row 3 marked \u2705)",
        "type": "gen"
      },
      {
        "text": "[TRACK] \u2192 tracks/2026/05/05/track_wb-core_20260505.md (\u00a71 appended)",
        "type": "gen"
      },
      {
        "text": "# \u00a71 \u2014 `/wbWork --id=\"3\"` *(the AI agent \u2014 04:15)*",
        "type": "gen"
      },
      {
        "text": "## What the user did",
        "type": "sys"
      },
      {
        "text": "/wbWork --id=\"3\"",
        "type": "gen"
      },
      {
        "text": "**What the user wants:** Implement the WBC.js decomposition task.",
        "type": "sys"
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
        "text": "- core2/packages/wb-core/src/WBC.js (the 1200-line monolith)",
        "type": "gen"
      },
      {
        "text": "### Files created/modified",
        "type": "gen"
      },
      {
        "text": "| File | Action | What it contains |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| `WBC.js` | Modified | Split into 3 modules |",
        "type": "gen"
      },
      {
        "text": "| `WBC.computed.js` | Created | Core initialization |",
        "type": "gen"
      },
      {
        "text": "| `WBC.lifecycle.js` | Created | Event delegation |",
        "type": "gen"
      },
      {
        "text": "## Commentary",
        "type": "sys"
      },
      {
        "text": "- **Outcome:** WBC.js reduced from 1200 \u2192 340 lines. Two new modules extracted.",
        "type": "gen"
      },
      {
        "text": "- **Insights:** The event delegation was tangled with initialization \u2014 separating",
        "type": "gen"
      },
      {
        "text": "them revealed 3 unused handlers that should be cleaned.",
        "type": "gen"
      },
      {
        "text": "- **Decisions:** Kept the original filename for backward compatibility (re-exports).",
        "type": "gen"
      },
      {
        "text": "> [!TIP]",
        "type": "gen"
      },
      {
        "text": "> Run `/wbClean packages/wb-core` to catch the 3 dead handlers revealed by the split.",
        "type": "gen"
      },
      {
        "text": "## Recommended Next",
        "type": "sys"
      },
      {
        "text": "| Priority | Command | Why | Recommended Models |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| \ud83d\udd34 1st | `/wbValid --id=\"3\"` | Validate the decomposition | the agent 4 |",
        "type": "gen"
      },
      {
        "text": "| \ud83d\udfe1 2nd | `/wbClean packages/wb-core` | Dead handlers from the split | Qwen3 Coder |",
        "type": "gen"
      }
    ],
    "note": "With tracking ON, running `/wbWork --id=\"3\"` produces two outputs:",
    "noteType": "info"
  },
  {
    "title": "End of day finalization",
    "cmd": "/wbStopTrack --finalize",
    "logs": [
      {
        "text": "[SYSTEM] Finalizing session for packages/wb-core.",
        "type": "sys"
      },
      {
        "text": "[STOP] Writing \u00a7STOP to track_wb-core_20260505.md.",
        "type": "gen"
      },
      {
        "text": "[DERIVE] Extracting 6 derivative files...",
        "type": "gen"
      },
      {
        "text": "[DERIVE] track_wb-core_20260505_tips.md \u2014 2 tips extracted",
        "type": "gen"
      },
      {
        "text": "[DERIVE] track_wb-core_20260505_warnings.md \u2014 0 warnings",
        "type": "gen"
      },
      {
        "text": "[DERIVE] track_wb-core_20260505_importants.md \u2014 1 important",
        "type": "gen"
      },
      {
        "text": "[DERIVE] track_wb-core_20260505_commentaries.md \u2014 2 commentary blocks",
        "type": "gen"
      },
      {
        "text": "[DERIVE] track_wb-core_20260505_all_commands.md \u2014 3 commands logged",
        "type": "gen"
      },
      {
        "text": "[DERIVE] track_wb-core_20260505_resume.md \u2014 handoff for tomorrow",
        "type": "gen"
      },
      {
        "text": "[OK] Session closed. Files at tracks/2026/05/05/.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbTrack" :pipelines="wbTrackPipelines" />


### 💠 Pipeline Start today's session (first model)


### 💠 Pipeline Execute work while tracking

With tracking ON, running `/wbWork --id="3"` produces two outputs:


### 💠 Pipeline End of day finalization

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbTrack` when already tracking wb-core | `⚠️ Already tracking: packages/wb-core. Run /wbStopTrack first.` |
| `/wbTrack packages/wb-core packages/wb-dataviewer` | Halt. One scope only. No multi-target tracking. |
| `/wbStopTrack` when not tracking | No-op. `⚪ No active session to stop.` |
| `/wbTrack -d="2026-05-01"` | Halt. `❌ Unknown flag -d. /wbTrack has two flags: --finalize (-f) and --scope (-s).` the agent's version doesn't support retroactive date targeting. |
| `/wbTrack packages/nonexistent` | Halt. `❌ Directory packages/nonexistent not found.` |

The pattern: **`/wbTrack` is strict about state (one session per model), permissive about bootstrapping (creates directories if needed), and honest about its flag surface (no inherited flags from the agent's version that don't map to the agent's behavior).** The simplicity is the feature — the command is a toggle with one scope variable.

# /wbHelp — Live Demo ()

This is what `/wbHelp` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](wbHelp_exhaustive_simulation.md), but every cell references the *live* docs tree.

---

<CommandLiveDemoAnimation command="wbHelp" />

## 1. Live target

| Field | Live value |
|---|---|
| Docs directory | `frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/commands/` (18 command folders with claude files) |
| Command reference | `wb_commands_reference.json` (69KB, all 27 commands) |
| Template directory | `frontEnd/wbc-ui/core2/packages/wb-flow/templates/commands/` (31 command folders with templates) |
| Completed claude docs | 18 commands with exhaustive + live demo files |
| Pending claude docs | 12 commands (in progress — this batch) |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbHelp` | Full 27-command catalog from `wb_commands_reference.json`. |
| `/wbHelp wbWork` | Reads `wbWork_template.md` + `wbWork_exhaustive_simulation.md`. Outputs usage guide. |
| `/wbHelp wbWork,wbValid` | Comparative: explains the worker/validator relationship. |
| `/wbHelp -s="DAG"` | Searches docs tree. Finds: wbWork (DAG-blocks), wbNext (DAG navigation), wbPlan (DAG generation), wbStandup (DAG reporting). |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbHelp wbTrack -e` | Pulls examples from `wbTrack_live_demo.md` (just created today). |
| `/wbHelp wbWork -f` | Four flags: `--id`, `--open`, `--def`, `--can`. Compact output. |
| `/wbHelp -s="apiResponse_"` | Finds: wbExplain (Pipeline B), wbValid (Pipeline C), wbStandup (parked debt). |
| `/wbHelp wbActOn -v="eli5"` | "wbActOn reads an audit report and tells you what to fix first, with colors for priority." |

---

## 4. Pipelines

<script setup>
const wbHelpPipelines = [
  {
    "title": "New contributor asks \"what can I do?\"",
    "cmd": "/wbHelp",
    "logs": [
      {
        "text": "[SYSTEM] Loading catalog from wb_commands_reference.json...",
        "type": "sys"
      },
      {
        "text": "# wb-flow Command Arsenal (27 commands)",
        "type": "gen"
      },
      {
        "text": "## Most Relevant Right Now (based on active plans)",
        "type": "sys"
      },
      {
        "text": "- `/wbWork --id=\"3\"` \u2014 Row 3 in wb-core is ready to execute",
        "type": "gen"
      },
      {
        "text": "- `/wbValid` \u2014 Rows 1-2 are done and need validation",
        "type": "gen"
      },
      {
        "text": "- `/wbGit` \u2014 After validation, commit the epic",
        "type": "gen"
      },
      {
        "text": "## Full Catalog",
        "type": "sys"
      },
      {
        "text": "[... 6 groups, 27 commands as shown in exhaustive simulation ...]",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "\"How do worker and validator relate?\"",
    "cmd": "/wbHelp wbWork,wbValid",
    "logs": [
      {
        "text": "[SYSTEM] Comparative help for wbWork + wbValid...",
        "type": "sys"
      },
      {
        "text": "# Worker/Validator Relationship",
        "type": "gen"
      },
      {
        "text": "| Aspect | /wbWork | /wbValid |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| Role | Worker \u2014 implements | Validator \u2014 checks |",
        "type": "gen"
      },
      {
        "text": "| Writes to | `Done` column | `Valid` column |",
        "type": "gen"
      },
      {
        "text": "| Reads | Plan row + source code | Plan row + implementation |",
        "type": "gen"
      },
      {
        "text": "| Model pool | Per feedback_model_selection.md | **Different** from worker |",
        "type": "gen"
      },
      {
        "text": "| Filter grammar | `--id` (deterministic) | `--id` (same grammar) |",
        "type": "gen"
      },
      {
        "text": "| State flags | `--open`, `--def`, `--can` | `--open`, `--def` |",
        "type": "gen"
      },
      {
        "text": "## The Separation Principle",
        "type": "sys"
      },
      {
        "text": "A worker cannot honestly grade its own work. If /wbWork wrote to",
        "type": "gen"
      },
      {
        "text": "Valid, every implementation would be self-approving. The validator",
        "type": "gen"
      },
      {
        "text": "is a separate read by a different model on the same row.",
        "type": "gen"
      },
      {
        "text": "## Chaining Pattern",
        "type": "sys"
      },
      {
        "text": "1. `/wbWork --id=\"2\"` \u2192 implements, marks Done \u2705",
        "type": "gen"
      },
      {
        "text": "2. `/wbValid --id=\"2\"` \u2192 validates, marks Valid \u2705 (or rejects)",
        "type": "gen"
      },
      {
        "text": "3. If rejected: `/wbWork --id=\"2\" -o` to reset Done, fix, retry",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Deep search for a concept",
    "cmd": "/wbHelp -s=\"Smart Merge\"",
    "logs": [
      {
        "text": "[SYSTEM] Searching frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/ for \"Smart Merge\"...",
        "type": "sys"
      },
      {
        "text": "[MATCH] 3 commands implement Smart Merge:",
        "type": "gen"
      },
      {
        "text": "1. **wbTrack** \u2014 Session files: second model reads existing file,",
        "type": "gen"
      },
      {
        "text": "appends contributor entry. No overwrite.",
        "type": "gen"
      },
      {
        "text": "2. **wbActOn** \u2014 Action files: second model reads existing Entry #1,",
        "type": "gen"
      },
      {
        "text": "matches findings by file+function+title overlap, enriches",
        "type": "gen"
      },
      {
        "text": "duplicates, adds only new findings. Builds Consensus Table.",
        "type": "gen"
      },
      {
        "text": "3. **wbPlan** \u2014 Plan files: Smart Merge appends entries to the",
        "type": "gen"
      },
      {
        "text": "same universal daily file, tagged with model + timestamp.",
        "type": "gen"
      },
      {
        "text": "[DEFINITION] Smart Merge = read existing \u2192 match by criteria \u2192",
        "type": "gen"
      },
      {
        "text": "enrich duplicates \u2192 add new only \u2192 never overwrite.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbHelp" :pipelines="wbHelpPipelines" />


### 💠 Pipeline New contributor asks "what can I do?"


### 💠 Pipeline "How do worker and validator relate?"


### 💠 Pipeline Deep search for a concept

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbHelp wbMagic` | `❌ 'wbMagic' is not recognized. Closest matches: wbMonetize, wbTrack.` |
| `/wbHelp -s="function"` | `⚠️ Too broad. "function" appears in 24/27 command docs. Narrow your search.` |
| `/wbHelp wbBroadcast -e` | `⚠️ No the agent-native examples file exists yet for wbBroadcast. Showing template-based help.` (Pending from this batch.) |

The pattern: **`/wbHelp` reads, never recalls.** Every help output is derived from the current docs tree, so it's always in sync with the latest template changes. It's the only command whose accuracy improves when you update the docs — every other command's accuracy depends on the model.

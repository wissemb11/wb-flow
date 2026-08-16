# /wbNext — Live Demo ()

This is what `/wbNext` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](wbNext_exhaustive_simulation.md), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbNext" />

## 1. Live target

| Field | Live value |
|---|---|
| Active package | `core2/packages/wb-core` |
| Active plan | `reports/20260504/plans/plan_wb-core_20260504.md` |
| Plan state | Row 1 ✅✅, Row 2 ✅✅, Row 3 ⬜⬜ (deps satisfied) |
| Deterministic answer | Row 3 (the only eligible task) |

This is the simplest possible DAG state for `/wbNext`: two completed rows, one ready row, zero ambiguity.

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbNext packages/wb-core` | Row 3. Only eligible task. |
| `/wbNext` (from core2 root) | Reads monorepo-level plan (if exists). If none, suggests `/wbPlan`. |
| `/wbNext apps/*` | Per-app next: demo=Task 3, md=complete, wbc-ui=Task 1 (auth fix). |
| `/wbNext packages/wb-core -s="complexity"` | Still Row 3 — only one candidate, sort is a no-op. |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbNext packages/wb-core` | `[NEXT] Task 3: WBC.js decomposition. Run /wbWork --id="3".` |
| `/wbNext packages/wb-core -e` | Adds DAG trace: "Row 1 complete, Row 2 complete, Row 3 eligible (deps 1,2 satisfied)." |
| `/wbNext packages/wb-core -a` | Auto-executes `/wbWork --id="3"`. No confirmation. WBC.js decomposition begins. |
| `/wbNext packages/wb-core -a -e` | DAG trace + auto-execute. Full autonomous mode. |
| `/wbNext packages/wb-core -s="priority"` | Same answer (Row 3 is the only candidate). Warns if no Priority column. |

---

## 4. Pipelines

<script setup>
const wbNextPipelines = [
  {
    "title": "Standard query",
    "cmd": "/wbNext packages/wb-core",
    "logs": [
      {
        "text": "[SYSTEM] Querying DAG...",
        "type": "sys"
      },
      {
        "text": "[READ] plan_wb-core_20260504.md (3 rows)",
        "type": "gen"
      },
      {
        "text": "[NEXT] Task 3: WBC.js decomposition",
        "type": "gen"
      },
      {
        "text": "Status: \u2b1c Pending | Deps: 1, 2 (both \u2705)",
        "type": "gen"
      },
      {
        "text": "[RECOMMENDATION] Run `/wbWork --id=\"3\"` to execute.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Autonomous execution with trace",
    "cmd": "/wbNext packages/wb-core -a -e",
    "logs": [
      {
        "text": "[SYSTEM] Querying DAG for next unblocked node...",
        "type": "sys"
      },
      {
        "text": "[READ] plan_wb-core_20260504.md",
        "type": "gen"
      },
      {
        "text": "[EXPLAIN] DAG evaluation:",
        "type": "gen"
      },
      {
        "text": "Row 1: \u2705 Done, \u2705 Valid \u2014 complete. Skipped.",
        "type": "gen"
      },
      {
        "text": "Row 2: \u2705 Done, \u2705 Valid \u2014 complete. Skipped.",
        "type": "gen"
      },
      {
        "text": "Row 3: \u2b1c Pending, Deps [1, 2] \u2192 both \u2705. ELIGIBLE.",
        "type": "gen"
      },
      {
        "text": "Selection: Row 3 (only candidate \u2014 chronological tiebreak irrelevant).",
        "type": "gen"
      },
      {
        "text": "[NEXT] Task 3: WBC.js decomposition",
        "type": "gen"
      },
      {
        "text": "[ACT] Executing /wbWork --id=\"3\"...",
        "type": "gen"
      },
      {
        "text": "[WORK] Row 3: WBC.js decomposition",
        "type": "gen"
      },
      {
        "text": "Reading core2/packages/wb-core/src/WBC.js (1200 lines)...",
        "type": "gen"
      },
      {
        "text": "Decomposing into WBC.core.js, WBC.events.js...",
        "type": "gen"
      },
      {
        "text": "[VERIFY] Running verify recipe...",
        "type": "gen"
      },
      {
        "text": "[OK] Row 3 verified.",
        "type": "ok"
      },
      {
        "text": "[PLAN] Row 3.Done = \u2705",
        "type": "gen"
      },
      {
        "text": "[SUMMARY] Plan complete. All 3 rows are \u2705 Done.",
        "type": "gen"
      },
      {
        "text": "Next action: /wbValid --id=\"3\" (validate the decomposition).",
        "type": "gen"
      },
      {
        "text": "After validation: /wbGit (commit and close the epic).",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Multi-app next with priority sort",
    "cmd": "/wbNext apps/* -s=\"priority\"",
    "logs": [
      {
        "text": "[SYSTEM] Aggregating plans across apps/*...",
        "type": "sys"
      },
      {
        "text": "[READ] 3 plans found.",
        "type": "gen"
      },
      {
        "text": "[NEXT per plan]",
        "type": "gen"
      },
      {
        "text": "| App | Next Task | ID | Status |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| demo.wbc-ui.com | Configure CDN fallback | 3 | Ready (P1) |",
        "type": "gen"
      },
      {
        "text": "| md.wbc-ui.com | \u2014 | \u2014 | \u2705 Plan complete |",
        "type": "gen"
      },
      {
        "text": "| wbc-ui.com | Fix auth module | 1 | Ready (P0) |",
        "type": "gen"
      },
      {
        "text": "[PRIORITY SORT]",
        "type": "gen"
      },
      {
        "text": "1. wbc-ui.com Task 1 (P0) \u2014 auth module fix",
        "type": "gen"
      },
      {
        "text": "2. demo.wbc-ui.com Task 3 (P1) \u2014 CDN fallback",
        "type": "gen"
      },
      {
        "text": "[RECOMMENDATION] Start with wbc-ui.com: `/wbWork --id=\"1\"` in apps/wbc-ui.com.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbNext" :pipelines="wbNextPipelines" />


### 💠 Pipeline Standard query


### 💠 Pipeline Autonomous execution with trace


### 💠 Pipeline Multi-app next with priority sort

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbNext packages/wb-core` after all rows are ✅ Done + ✅ Valid | `✅ Plan complete. No remaining tasks. Run /wbGit to commit.` |
| `/wbNext packages/wb-core --act` on a plan where all tasks are blocked | `❌ All pending tasks are DAG-blocked. Cannot auto-execute. Fix dependencies first.` |
| `/wbNext packages/nonexistent` | `❌ No plan found in packages/nonexistent.` |
| `/wbNext -s="urgency"` when plan has no Urgency column | `⚠️ Plan lacks "urgency" metadata. Falling back to chronological order.` |

The pattern: **`/wbNext` gives one answer — the right one — or explains why it can't.** No menus, no alternatives, no "you might also consider." That narrowness is what makes it safe for `--act` chains.

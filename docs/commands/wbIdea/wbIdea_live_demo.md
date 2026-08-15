# /wbIdea — Live Demo ()

This is what `/wbIdea` would do on `wb-labs` as the workspace stands today (2026-05-08). Every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbIdea" />

## 1. Live target

| Field | Live value |
|---|---|
| Target package | `core2/packages/wb-dataviewer` |
| Source files | 12 Vue/JS files in `src/` |
| Key modules | WBDataViewer.vue, WBTable.js, search highlighting engine |
| Recent activity | Active plan with 3/5 tasks done. Last audit clean. |
| Idea file | Does not exist yet — `/wbIdea` will create it. |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbIdea packages/wb-dataviewer` | Creates `idea_wb-dataviewer_20260508.md` with 3–5 scored ideas based on current codebase gaps. |
| `/wbIdea packages/wb-dataviewer --task="Add virtual scrolling"` | Appends 1 row with computed score. |
| `/wbIdea packages/wb-dataviewer --resume` | Would fail gracefully (no existing file). Falls back to fresh generation. |
| `/wbIdea idea_wb-dataviewer_20260508.md --id=1 --promote` | Would promote idea #1 to `plan_wb-dataviewer_20260508.md`. |

---

## 3. Pipeline on this exact workspace

<script setup>
const wbIdeaPipelines = [
  {
    "title": "Fresh idea generation for wb-dataviewer",
    "cmd": "/wbIdea packages/wb-dataviewer",
    "logs": [
      {
        "text": "[SYSTEM] Reading .wb/workflows/context.md...",
        "type": "sys"
      },
      {
        "text": "[SYSTEM] Package: @wbc-ui2/wb-dataviewer (Vue 2 data table component)",
        "type": "sys"
      },
      {
        "text": "[SYSTEM] Recent: multi-color search highlighting just shipped (conv 72ea54d6)",
        "type": "sys"
      },
      {
        "text": "[SYSTEM] Recent: table style fixes in progress (conv 7cb5911c)",
        "type": "sys"
      },
      {
        "text": "[SYSTEM] Active plan: 3/5 tasks complete",
        "type": "sys"
      },
      {
        "text": "[SCORE] Generating ideas based on context + gaps...",
        "type": "gen"
      },
      {
        "text": "| # | Score | Idea | P | Est. Time |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| 1 | 8 | Column virtualization for 100+ column tables | P1 | 120 |",
        "type": "gen"
      },
      {
        "text": "| 2 | 7 | Server-side pagination with total count indicator | P2 | 90 |",
        "type": "gen"
      },
      {
        "text": "| 3 | 5 | Sticky column headers during scroll | P2 | 45 |",
        "type": "gen"
      },
      {
        "text": "| 4 | 9 | Row-level virtual scrolling for 10k+ datasets | P1 | 240 |",
        "type": "gen"
      },
      {
        "text": "| 5 | 3 | Add tooltip on truncated cell text | P3 | 15 |",
        "type": "gen"
      },
      {
        "text": "[OUTPUT] idea_wb-dataviewer_20260508.md created (5 ideas).",
        "type": "gen"
      },
      {
        "text": "[NOTE] Idea #4 (virtual scrolling) scores highest: large datasets are a known gap.",
        "type": "gen"
      },
      {
        "text": "Idea #5 (tooltips) scores lowest: cosmetic, low urgency.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Vision auto-registration",
    "cmd": "/wbWork packages/wb-dataviewer \"idea: add dark mode theme tokens\"",
    "logs": [
      {
        "text": "[DETECT] Prefix \"idea:\" found \u2192 routing to idea pipeline",
        "type": "gen"
      },
      {
        "text": "[SCORE] Impact: 5, Feasibility: 8, Urgency: 3 \u2192 Score: 5",
        "type": "gen"
      },
      {
        "text": "[APPEND] Added as idea #6 in idea_wb-dataviewer_20260508.md",
        "type": "gen"
      },
      {
        "text": "[OK] Idea registered. Run /wbWork idea_wb-dataviewer_20260508.md --id=6 to explore.",
        "type": "ok"
      }
    ],
    "note": "If `/wbVision packages/wb-core` were run today, it would: 1. Write `vision_wb-core_20260508.md` with 3 feature proposals. 2. Auto-create `idea_wb-core_20260508.md` with 3 corresponding idea rows. 3. Link each idea back to the vision source file.  ### \ud83d\udca0 Pipeline C \u2014 Inline idea from `/wbWork`",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbIdea" :pipelines="wbIdeaPipelines" />


### 💠 Pipeline Fresh idea generation for wb-dataviewer


### 💠 Pipeline Vision auto-registration

If `/wbVision packages/wb-core` were run today, it would:
1. Write `vision_wb-core_20260508.md` with 3 feature proposals.
2. Auto-create `idea_wb-core_20260508.md` with 3 corresponding idea rows.
3. Link each idea back to the vision source file.

### 💠 Pipeline C — Inline idea from `/wbWork`

---

## 4. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbIdea packages/wb-dataviewer --id=99 --promote` | `❌ Idea #99 not found. File has 5 ideas (1–5).` |
| `/wbIdea packages/wb-dataviewer --id=3 --promote` (Score 5) | Proceeds but warns: `⚠️ Score 5 is below typical promotion threshold (8+). Consider /wbValid first.` |
| `/wbIdea packages/wb-mermaid` | Generates ideas but warns: `⚠️ Very thin context. Ideas may be generic. Consider /wbSetup first.` |

The pattern: **`/wbIdea` captures what might be worth doing, scores it, and provides a pipeline to promote it when the time is right.** The scoring forces honest assessment; the promotion protocol ensures nothing falls through the cracks.

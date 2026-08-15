# /wbIdea — Exhaustive Simulation ()

`/wbIdea` is the scored idea pipeline. It captures, scores, explores, validates, and promotes speculative ideas into actionable plan tasks. Read this for the full argument resolution, flag matrix, and edge cases.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Ideator — captures and scores speculative ideas. |
| **Target** | Package directories, folder scopes, or existing `idea_*.md` files. |
| **Cell scope** | None. `/wbIdea` does not modify source code. |
| **Side effects allowed** | Writing/updating `idea_*.md` files. Promoting ideas to `plan_*.md`. |
| **Side effects forbidden** | Modifying source code, executing tasks, creating task reports. |

---

## 2. Argument resolution

| Form | Example | What `/wbIdea` does |
|---|---|---|
| Folder scope | `/wbIdea packages/wb-core` | AI scans context, proposes scored ideas |
| Manual idea | `/wbIdea packages/wb-core --task="Add retry logic"` | Registers one specific idea with computed score |
| Resume | `/wbIdea packages/wb-core --resume` | Re-reads existing idea file, re-scores based on current context |
| Promote | `/wbIdea packages/wb-core --id=1 --promote` | Promotes idea #1 to today's plan file |
| Reject | `/wbIdea packages/wb-core --id=1,2 --reject` | Marks ideas 1,2 as 🚫 Rejected |
| Defer | `/wbIdea packages/wb-core --id=3 --defer` | Marks idea 3 as ⏸️ Deferred |
| Self-correct | `/wbIdea idea_wb-core_20260508.md` | Normalizes the file, fills gaps, re-scores |

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--task="<desc>"` | `-t` | Register a specific idea with the given description. |
| `--resume` | `-r` | Re-read existing idea file, re-evaluate scores. |
| `--id=<N,M,...>` | `-i` | Target specific idea indices. |
| `--promote` | `-p` | Promote targeted ideas to the plan file. |
| `--reject` | `-x` | Mark targeted ideas as 🚫 Rejected. |
| `--defer` | `-d` | Mark targeted ideas as ⏸️ Deferred. |
| `--scope` | `-s` | Override scope resolution. |

---

## 4. Pipelines

<script setup>
const wbIdeaSimPipelines = [
  {
    "title": "Native idea generation",
    "cmd": "/wbIdea packages/wb-dataviewer",
    "logs": [
      {
        "text": "[SYSTEM] Reading context.md...",
        "type": "sys"
      },
      {
        "text": "[SYSTEM] Reading recent reports/...",
        "type": "sys"
      },
      {
        "text": "[SCORE] Computing impact \u00d7 feasibility \u00d7 urgency for each idea...",
        "type": "gen"
      },
      {
        "text": "[GENERATE] 4 ideas scored:",
        "type": "gen"
      },
      {
        "text": "#1: Score 8 \u2014 Column-level search with multi-color highlighting",
        "type": "gen"
      },
      {
        "text": "#2: Score 6 \u2014 Row grouping by any column value",
        "type": "gen"
      },
      {
        "text": "#3: Score 4 \u2014 CSV/XLSX export button",
        "type": "gen"
      },
      {
        "text": "#4: Score 9 \u2014 Virtual scrolling for 10k+ rows",
        "type": "gen"
      },
      {
        "text": "[OUTPUT] idea_wb-dataviewer_20260508.md created.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Promote-and-ingest cycle",
    "cmd": "/wbIdea packages/wb-dataviewer --id=4 --promote",
    "logs": [
      {
        "text": "[SYSTEM] Reading idea #4 (Score: 9, \u2610 Valid: \u2b1c)...",
        "type": "sys"
      },
      {
        "text": "[PROMOTE] Setting \u2610 Valid to \ud83c\udfaf Promoted 9/10",
        "type": "gen"
      },
      {
        "text": "[PLAN] Locating plan_wb-dataviewer_20260508.md...",
        "type": "gen"
      },
      {
        "text": "[PLAN] Appending as Task #7:",
        "type": "gen"
      },
      {
        "text": "Origin: \ud83d\udca1 /wbIdea #4",
        "type": "gen"
      },
      {
        "text": "Task: Virtual scrolling for 10k+ rows",
        "type": "gen"
      },
      {
        "text": "P: P1 | Est: 240m",
        "type": "gen"
      },
      {
        "text": "[LINK] \u2192 Task = `\u2192 Plan #7`",
        "type": "gen"
      },
      {
        "text": "[OK] Idea #4 promoted to plan.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Self-correct mode",
    "cmd": "/wbIdea idea_wb-dataviewer_20260508.md",
    "logs": [
      {
        "text": "[SYSTEM] Detected self-correct mode (H1 = \"# Idea Backlog:\")",
        "type": "sys"
      },
      {
        "text": "[CHECK] 4 ideas, 1 explored, 0 validated",
        "type": "gen"
      },
      {
        "text": "[FIX] Idea #1: \u2610 Done is \u2b1c but exploration report exists \u2192 setting \u2705",
        "type": "gen"
      },
      {
        "text": "[FIX] Idea #3: Score 4 seems high for CSV export given existing priorities \u2192 re-scoring to 3",
        "type": "gen"
      },
      {
        "text": "[APPEND] Self-corrected: 2026-05-08 15:30 by the AI agent",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbIdea" titleSuffix="Exhaustive Simulation" :pipelines="wbIdeaSimPipelines" />


### 💠 Pipeline Native idea generation


### 💠 Pipeline Promote-and-ingest cycle


### 💠 Pipeline Self-correct mode

---

## 5. Edge cases & refusals

| Trigger | What `/wbIdea` does |
|---|---|
| No context.md exists | Warns: "No context found. Ideas will be generic. Consider /wbSetup first." |
| `--promote` on already-promoted idea | Skips: "Idea #N already promoted → Plan #M." |
| `--promote` on rejected idea | Refuses: "Idea #N was rejected. Use --open first to reopen, then --promote." |
| All ideas already validated | In resume mode: "All ideas validated. Consider /wbPlan --resume to check ingestion." |
| Idea file doesn't exist + `--resume` | Creates fresh file instead: "No existing idea file found. Generating new ideas." |
| `--id=99` (out of range) | Error: "Idea #99 not found. File has 4 ideas (1–4)." |

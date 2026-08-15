---
title: "The Ideas Pipeline — Architecture & Design"
description: "Explains how speculative ideas flow from capture through scoring to execution, promotion, deferral, or rejection."
---

# The Ideas Pipeline — Architecture & Design

> How speculative ideas flow from capture to execution. The missing phase between "that might be worth doing" and "let's do it."

---

<div align="center">
<IdeasPipeline />
*The ideas pipeline in action: ideas enter the funnel, get scored, and emerge as promoted, deferred, or rejected.*
</div>

---

## The Pipeline

Every `/wb*` command exists in a pipeline. Before `/wbIdea`, the pipeline had a gap:

```
 ┌─── GAP ───┐
wbVision │ │ wbPlan ──► wbWork ──► wbValid
 (dream) │ (???) │ (commit) (execute) (verify)
 └───────────┘
```

Ideas from `/wbVision` were free-form text. You either committed immediately to a plan (premature) or forgot the idea (wasteful). `/wbIdea` fills the gap:

```
wbVision ──► wbIdea ──► wbPlan ──► wbWork ──► wbValid
 (dream) (capture) (commit) (execute) (verify)
```

Each stage has a clear semantic boundary:

| Stage | Command | Artifact | What it means |
|---|---|---|---|
| **Dream** | `/wbVision` | `vision_*.md` | Free-form brainstorming. No tracking. No commitment. |
| **Capture** | `/wbIdea` | `idea_*.md` | Scored, tracked, validated. But NOT committed to execution. |
| **Commit** | `/wbPlan` | `plan_*.md` | Worker/validator assignments. DAG dependencies. Execution contract. |
| **Execute** | `/wbWork` | `task_*/idea_*_report_*.md` | Physical code changes (plan) or feasibility analysis (idea). |
| **Verify** | `/wbValid` | Appended to report | PASS/FAIL (plan) or Promote/Recommend/Defer/Reject (idea). |

---

## The Idea File Schema

### Location
```
<target>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/ideas/idea_<scope>_<YYYYMMDD>.md
```

### Table structure

| # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|

### Column semantics

| Column | What it tracks | Key difference from Plan |
|---|---|---|
| **Score** (1–10) | How strongly this should become a task | Plans don't have scores — everything in a plan is committed |
| **☐ Done** | "Has the idea been *explored*?" | In plans, Done means "implemented". In ideas, Done means "analyzed". |
| **☐ Valid** | Verdict: Promote / Recommend / Defer / Reject | In plans, Valid means PASS/FAIL. In ideas, Valid is a *judgment call*. |
| **→ Task** | Link to the promoted plan row | Doesn't exist in plans. This is the bridge between the two pipelines. |

---

## The Scoring Heuristic

Every idea gets a score from 1 to 10, computed as:

```
Score = round(impact × 0.4 + feasibility × 0.3 + urgency × 0.3)
```

| Factor | Weight | Anchors |
|---|---|---|
| **Impact** | 40% | 10 = fundamentally changes UX/DX. 5 = noticeable improvement. 1 = cosmetic. |
| **Feasibility** | 30% | 10 = straightforward, low risk. 5 = moderate complexity. 1 = requires architectural change. |
| **Urgency** | 30% | 10 = blocking other work. 5 = would be nice this sprint. 1 = no timeline pressure. |

The score is advisory, not deterministic. A score of 9 doesn't auto-promote. It informs the validator's judgment.

---

## The Verdict Scale

When an idea is validated (via `/wbValid idea_*.md --id=N`), the validator assigns a verdict:

| Verdict | Score Range | Symbol | What happens |
|---|---|---|---|
| **Promote** | 8–10 | `🎯 Promoted 9/10` | Idea auto-ingested as a plan task by `/wbPlan` |
| **Recommend** | 5–7 | `✅ 7/10` | Idea stays in backlog. Revisit when capacity allows. |
| **Defer** | 3–4 | `⏸️ Deferred 4/10` | Interesting but wrong timing. Context may change. |
| **Reject** | 1–2 | `🚫 Rejected 2/10` | Not worth pursuing. Reasoning documented for future reference. |

The verdict is cumulative — multiple validators can append their scores, and disagreement is signal:

```markdown
| ☐ Valid |
|---|
| ✅ 7/10<br>the AI agent<hr>🎯 Promoted 9/10<br>the AI agent |
```

---

## The Promotion Protocol

This is the bridge mechanism between the two pipelines. When an idea reaches `🎯 Promoted`:

**Column mapping (idea → plan):**

| Idea Column | Plan Column |
|---|---|
| `Idea` | `Task` |
| `P` | `P` |
| `Est. Time` | `Est. Time` |
| — | `Origin` = `💡 /wbIdea #N` (with link) |
| — | `Worker` / `Validator` = from model recommendations |
| — | `☐ Done` = `⬜` |
| — | `☐ Valid` = `⬜` |

The promotion is **unidirectional**: ideas flow *into* plans, never the reverse. A plan task cannot be "demoted" back to an idea.

---

## Producer–Consumer Architecture

### Who generates ideas (producers)

| Source | Mechanism | When |
|---|---|---|
| `/wbIdea` (native) | AI scans context and proposes scored ideas | On demand |
| `/wbVision` | Auto-registers each proposal in `idea_*.md` | **Always** (Phase 4 of vision template) |
| `/wbAudit --ideas` | Routes P3/improvement findings to ideas | When `--ideas` flag is set |
| `/wbWork "idea: ..."` | Manual registration via prefix | When inline desc starts with `idea:` or `💡` |

### Who processes ideas (consumers)

| Consumer | What it does |
|---|---|
| `/wbWork idea_*.md --id=N` | **Explores** the idea: feasibility, impact, implementation sketch. Sets `☐ Done`. |
| `/wbExplain idea_*.md --id=N` | **Explains** the idea in depth. Updates `🔗` column. |
| `/wbValid idea_*.md --id=N` | **Validates** with verdict scale. Can trigger promotion. |
| `/wbPlan` (any mode) | **Ingests** promoted ideas as plan rows on every execution. |
| `/wbIdea --promote` | **Direct promotion** shortcut (skips validation). |

### Data flow

Producers write scored ideas into `idea_*.md`. Consumers read and process them through the pipeline.

---

## Folder Structure

## Folder Structure

Within `.wb/workflows/reports/<YYYY>/<MM>/<DD>/`:

```
reports/<YYYY>/<MM>/<DD>/
├── audits/ ← /wbAudit output
├── contexts/ ← /wbContext snapshots
├── plans/ ← /wbPlan output
│ ├── plan_<scope>_<date>.md
│ └── tasks/
│ └── task_<N>/
│ ├── task_<N>_report_*.md
│ └── task_<N>_details_*.md
├── ideas/ ← /wbIdea output (NEW)
│ ├── idea_<scope>_<date>.md
│ └── ideas_reports/
│ └── idea_<N>/
│ ├── idea_<N>_report_*.md ← /wbWork exploration
│ └── idea_<N>_details_*.md ← /wbExplain detail
├── nexts/ ← /wbNext output
├── standups/ ← /wbStandup output
└── visions/ ← /wbVision output
```

The `ideas/` folder mirrors the `plans/` folder structure. Just as plans have `tasks/task_<N>/`, ideas have `ideas_reports/idea_<N>/`.

---

## From Idea to Performed Task — The Complete Process

### The 8-Step Journey

### Step-by-step commands

| Step | What happens | Command to run | Artifact produced |
|---|---|---|---|
| **1. Birth** | An idea is born (AI-generated or manual) | `/wbIdea <pkg>` or `/wbVision <pkg>` or `/wbAudit <pkg> --ideas` or `/wbWork <pkg> "idea: ..."` | — |
| **2. Capture** | Idea scored and registered in the idea file | (automatic from Step 1) | `idea_<scope>_<date>.md` — row with Score, P, Est. Time |
| **3. Detail** *(optional)* | Deep-dive explanation of the idea | `/wbExplain idea_<scope>_<date>.md --id=N --scope=idea` | `ideas_reports/idea_N/idea_N_details_*.md` |
| **4. Explore** | Feasibility analysis, impact assessment, implementation sketch | `/wbWork idea_<scope>_<date>.md --id=N` | `ideas_reports/idea_N/idea_N_report_*.md` |
| **5. Validate** | Validator reads exploration, assigns verdict | `/wbValid idea_<scope>_<date>.md --id=N` | Appended to `idea_N_report_*.md` |
| **6. Verdict** | Gate decision: Promote / Recommend / Defer / Reject | (automatic from Step 5) | `☐ Valid` column updated |
| **7. Promote** | Idea auto-ingested as a plan task | `/wbPlan <pkg>` (scans idea files) | `plan_<scope>_<date>.md` — new task row with `Origin: 💡 /wbIdea` |
| **8. Execute** | Normal task execution + validation | `/wbWork plan_<scope>_<date>.md --id=N` then `/wbValid plan_<scope>_<date>.md --id=N` | `tasks/task_N/task_N_report_*.md` |

### State transitions (simplified)

### Walk-through (3-day example):

1. **Day 1, morning.** You run `/wbVision packages/wb-dataviewer`. It brainstorms 3 features. Each one auto-registers as a scored idea in `idea_wb-dataviewer_20260508.md`. *(Steps 1–2 complete)*

2. **Day 1, afternoon.** You review the idea file. Idea #2 ("diff view for datasets") has Score 9. You run `/wbWork idea_wb-dataviewer_20260508.md --id=2` to explore it. The exploration report assesses feasibility (high), impact (unique differentiator), and sketches an implementation approach. *(Step 4 complete)*

3. **Day 2, morning.** You run `/wbValid idea_wb-dataviewer_20260508.md --id=2`. The validator reads the exploration report and assigns `🎯 Promoted 9/10` — "This is a genuine differentiator worth building." *(Steps 5–6 complete)*

4. **Day 2, afternoon.** You run `/wbPlan packages/wb-dataviewer`. The plan scans the idea file, finds the `🎯 Promoted` row, and auto-ingests it as Task #N with `Origin: 💡 /wbIdea #2`. The idea file's `→ Task` column now links to the plan. *(Step 7 complete)*

5. **Day 3.** You run `/wbWork plan_wb-dataviewer_20260509.md --id=N`. Normal task execution. Then `/wbValid plan_*.md --id=N` for final validation. *(Step 8 complete — idea is now a performed task)*

---

## Design Principles

### 1. Ideas are NOT tasks

The idea file has no worker/validator assignments, no DAG dependencies, no execution checkboxes. Adding those would make it a plan — and the whole point is that ideas sit *before* that commitment.

### 2. Scores are advisory, not deterministic

A Score of 10 doesn't auto-promote. It strongly *suggests* promotion, but the validator makes the final call. This prevents the system from auto-committing to every flashy idea.

### 3. Promotion is unidirectional

Ideas flow into plans. Plans never flow back into ideas. This prevents the anti-pattern of demoting tasks back to "ideas" to avoid doing them.

### 4. Vision always feeds ideas

`/wbVision` always registers its proposals in `idea_*.md`, not just when asked. This ensures brainstorming output is always trackable, without losing the free-form nature of the vision file.

### 5. One file per day per scope

All ideas for a given scope on a given day go into the same file, regardless of source. This prevents fragmentation and makes daily review simple: one file to scan.

---

## When the Ideas Pipeline is the wrong tool

| Situation | Use instead |
|---|---|
| You have 1 idea and you're ready to build it now | Skip to `/wbPlan` or just describe it directly |
| You want free-form brainstorming with no tracking | `/wbVision` (the ideas will auto-register, but you can ignore them) |
| You found a bug | `/wbDebug` or `/wbPlan` (bugs are not ideas — they're defects) |
| You have 50+ ideas | You have a prioritization problem, not an idea problem. Use `/wbPlan` with a focused scope. |

---

## See Also

### Command docs (6-layer deep-dives)

- [wbIdea — ELI5](../commands/wbIdea/wbIdea_eli5) · [practical](../commands/wbIdea/wbIdea_practical) · [expert](../commands/wbIdea/wbIdea_expert) · [examples](../commands/wbIdea/wbIdea_examples) · [exhaustive](../commands/wbIdea/wbIdea_exhaustive_simulation) · [live](../commands/wbIdea/wbIdea_live_demo)
- [wbVision — practical](../commands/wbVision/wbVision_practical) (brainstorming, feeds ideas)
- [wbPlan — practical](../commands/wbPlan/wbPlan_practical) (committed execution, receives promoted ideas)
- [wbWork — practical](../commands/wbWork/wbWork_practical) (executes ideas or tasks)
- [wbValid — practical](../commands/wbValid/wbValid_practical) (validates and assigns verdicts)
- [wbExplain — practical](../commands/wbExplain/wbExplain_practical) (detailed explanations)

### Related concept docs

- [Plan State Management](plan_state_management) — the `⬜` `✅` `⏸️` `🚫` `🔄` states shared by plans and ideas
- [Command Classification](command_classification) — where `/wbIdea` fits in the 6 functional families
- [Command Composition](command_composition) — how to chain `/wbIdea` with other commands
- [Workflow Architecture](wbWorkflow/workflow_architecture) — the "reports/ folder is the orchestration" principle
- [Ultimate Workflow Lifecycle](wbWorkflow/ultimate_workflow_lifecycle) — full lifecycle from Setup to Broadcast

---

*Authored by the AI agent — Concept deep-dive for the wb-labs agentic workflow. The Ideas Pipeline is command #31 in the system.*

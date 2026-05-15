---
title: "📂 Live Reports Snapshot — 2026-05-13"
description: "Shows a real .wb/workflows/ directory tree after a full day of /wb* commands, with key outputs and consensus tables."
---

# 📂 Live Reports Snapshot — 2026-05-13

> A real `.wb/workflows/` tree after a full day of `/wb*` commands.
>
> **Snapshot taken:** 2026-05-13 21:49 | **Scope:** `flow.wbc-ui.com/`

---

## Key Outputs

| Report | File | What it contains |
|---|---|---|
| Plan | `plan_flow.wbc-ui.com_20260513.md` | 29 tasks across 6 entries: scaffolding, setup, audit findings, demo docs, wbDeploy extras, hub convention. **Tasks 1-5 show cumulative multi-validation** (`<hr>`-separated scores from multiple models). |
| Audit | `audit_flow.wbc-ui.com_20260513.md` | Entry #1 (10/10) + Entry #2 (6/10) + Entry #3 (6/10) — 12 findings with **Consensus Table** across 3 models |
| Idea | `idea_flow.wbc-ui.com_20260513.md` | Scored ideas for documentation improvements |
| Standup | `standup_flow.wbc-ui.com_20260513.md` | Daily state scan across all packages |
| Next | `next_flow.wbc-ui.com_20260513.md` | Ranked recommendations for next actions |
| Review | `review_flow.wbc-ui.com_20260513.md` | PR-style review of specific changes |
| Setup | `setup_flow.wbc-ui.com_20260513.md` | Bootstrap context.md + dev.md for this scope |
| Track | `track_flow.wbc-ui.com_20260513.md` | Session narrative with §0 vision + §N per command |

Task-level detail files generated via `/wbExplain`:
- `task_1_details_en_20260513.md`
- `task_2_details_en_20260513.md`
- `task_3_details_en_20260513.md`
- `task_4_details_en_20260513.md`
- `task_5_details_en_20260513.md`

---

## The Full Tree

```
.wb/workflows/
├── context.md
├── dev.md
├── dev_reference.md
├── reports/
│   └── 2026/05/13/
│       ├── audits/
│       │   └── audit_flow.wbc-ui.com_20260513.md
│       ├── ideas/
│       │   └── idea_flow.wbc-ui.com_20260513.md
│       ├── nexts/
│       │   └── next_flow.wbc-ui.com_20260513.md
│       ├── plans/
│       │   ├── plan_flow.wbc-ui.com_20260513.md
│       │   └── tasks/
│       │       ├── task_1/
│       │       │   ├── task_1_report_flow.wbc-ui.com_20260513.md  ← **2 validations** (Opus 4 + DeepSeek V4)
│       │       │   └── task_1_details_en_20260513.md  ← /wbExplain
│       │       ├── task_2/
│       │       │   ├── task_2_report_flow.wbc-ui.com_20260513.md  ← **2 validations** (Gemini 3.1 Pro + DeepSeek V4)
│       │       │   └── task_2_details_en_20260513.md  ← /wbExplain
│       │       ├── task_3/
│       │       │   ├── task_3_report_flow.wbc-ui.com_20260513.md  ← **2 validations** (Opus 4 + DeepSeek V4)
│       │       │   └── task_3_details_en_20260513.md  ← /wbExplain
│       │       ├── task_4/
│       │       │   ├── task_4_report_flow.wbc-ui.com_20260513.md  ← **2 validations** (Opus 4 + DeepSeek V4)
│       │       │   └── task_4_details_en_20260513.md  ← /wbExplain
│       │       ├── task_5/
│       │       │   ├── task_5_report_flow.wbc-ui.com_20260513.md  ← **2 validations** (Opus 4 + DeepSeek V4)
│       │       │   └── task_5_details_en_20260513.md  ← /wbExplain
│       │       ├── task_6/ … task_34/  ← (32 task folders total)
│       ├── reviews/
│       │   └── review_flow.wbc-ui.com_20260513.md
│       ├── setup/
│       │   └── setup_flow.wbc-ui.com_20260513.md
│       └── standups/
│           └── standup_flow.wbc-ui.com_20260513.md
└── tracks/
    └── 2026/05/13/
        └── track_flow.wbc-ui.com_20260513.md
```

---

## What This Proves

| Property | This tree |
|---|---|
| **Commands create reports** | 7 report types (audit, idea, next, plan, review, setup, standup) |
| **Plans decompose into tasks** | 32 task reports + 5 detail files under `plans/tasks/` |
| **Multi-validation (cumulative)** | Tasks 1-5 each have 2 model validations (`<hr>`-separated in `☐ Valid` column) |
| **Smart Merge** | Audit has 3 entries across 3 models with Consensus Table (12 findings) |
| **/wbExplain expands tasks** | Detail files (`_details_en_`) with full analysis per task |
| **Temporal memory works** | All files under `2026/05/13/` — date-partitioned |
| **Session narrative** | One `tracks/` file with §0 + §N per command |
| **Identity files** | `context.md` + `dev.md` + `dev_reference.md` at root |

---

*This page auto-generated from today's actual `.wb/workflows/` directory.*

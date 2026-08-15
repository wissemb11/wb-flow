---
title: "Concepts"
description: "Architectural ideas behind wb-flow commands, explaining how the 31 tools form a coherent workflow system."
---

# Concepts

> Why the system works the way it does. Read this folder when the daily commands feel arbitrary and you want the underlying logic.

This folder is **not** about how to use commands — it's about the architectural ideas that make those commands cohere. If you skip it, the workflow will feel like 31 unrelated tools. Read it once, and the daily commands stop feeling arbitrary.

---

## What's in this folder

### Core overview

- **[`overview_agentic_workflows`](overview_agentic_workflows)** — the field manual. 33 commands grouped by the question you're asking when you reach for them, plus the "what makes this a loop, not a pipeline" principle. The single most-referenced concept doc.

### Command maps

- **[`command_classification`](command_classification)** — all 33 commands grouped into 6 functional families. What each command acts on, what it produces, which ones feed on their own output.
- **[`command_composition`](command_composition)** — self-application semantics (can a command run on its own output?), chaining notation (pipe `|` and nested forms), stateless vs stateful axis, the 31-row outcome table, and ~10 useful chain recipes.

### Cross-cutting feature deep-dives

- **[`wbPlan_flag`](wbPlan_flag)** — how `--act` and `--wbPlan` compose across `/wbAudit`, `/wbReview`, `/wbStandup`, `/wbActOn`. Read when you want to chain commands without typing each one.
- **[`plan_state_management`](plan_state_management)** — the five task states (`⬜` `✅` `⏸️` `🚫` `🔄`) and the `--open`/`--def`/`--can` override flags shared by `/wbWork`, `/wbValid`, `/wbPlan`. Also the plan file's anatomy — one authored table plus four derived projections — multi-ID merged dispatches, `--wave=A` as a work→validate pair, and the sync oracle. Read when you need to defer, cancel, or re-open tasks without re-executing them.
- **[`report_lifecycle`](report_lifecycle)** — **consolidate, then archive.** After a month a scope holds thirty plan files of which one is live; the rest are decoys, and a stale plan is more dangerous than a missing one. Covers open-item absorption, the `archives/` tree and why its depth mirrors `reports/` exactly, the ordering invariant, and why `/wbStandup` and `/wbTrack` are exempt. Read when your `reports/` folder has become an archaeology site.
- **[`model_recommendations`](model_recommendations)** — which model to point at which `/wb*` command, and why. Per-command gold picks, the four roles, and the one mistake to avoid (defaulting to the agent for everything).
- **[`flags_and_shortcuts`](flags_and_shortcuts)** — the system-wide grammar: long forms (`--execute`), short forms (`-e`), the four generation rules, runtime resolution chain. Read once and you can predict any shortcut without looking it up.
- **[`universal_flags_exhaustive_simulation`](universal_flags_exhaustive_simulation)** — exhaustive simulation of the Universal Super-Flags (Brain Control: `--fresh`, `--stat`, `--budget`, `--no-ki`, `--mem-sync`). Edge cases and interaction matrices.
- **[`ideas_pipeline`](ideas_pipeline)** — the Ideas Pipeline architecture: how `/wbIdea` fills the gap between `/wbVision` (dreaming) and `/wbPlan` (committing). Covers the 8-step process from idea birth to performed task, scoring heuristic, verdict scale, promotion protocol, and producer–consumer architecture.

### The wbWorkflow architecture

- **[`wbWorkflow/workflow_architecture`](wbWorkflow/workflow_architecture)** — the *"reports/ folder is the orchestration"* principle, in detail. Why every command reads `reports/` before acting, and why hand-editing those reports breaks the system.
- **[`wbWorkflow/ultimate_workflow_lifecycle`](wbWorkflow/ultimate_workflow_lifecycle)** — the full lifecycle from `/wbSetup` (Day 1) to `/wbBroadcast` (release day). How the artifacts hand off between phases.

### Audience-tiered presentations

For when you need to **explain the system to someone else** (a teammate, an investor, a junior dev). Same content, three depths:

- **[`presentation/agentic_workflows_eli5`](presentation/agentic_workflows_eli5)** — explain it like I'm 5
- **[`presentation/agentic_workflows_practical`](presentation/agentic_workflows_practical)** — explain it to a working dev
- **[`presentation/agentic_workflows_expert`](presentation/agentic_workflows_expert)** — explain it to a tech lead reviewing the design

The same three-tier breakdown narrowed to the workflow architecture itself:

- **[`wbWorkflow/presentation/wbWorkflow_eli5`](wbWorkflow/presentation/wbWorkflow_eli5)**
- **[`wbWorkflow/presentation/wbWorkflow_practical`](wbWorkflow/presentation/wbWorkflow_practical)**
- **[`wbWorkflow/presentation/wbWorkflow_expert`](wbWorkflow/presentation/wbWorkflow_expert)**

---

## Reading order

If you're reading this folder linearly:

```
overview_agentic_workflows → wbWorkflow/workflow_architecture → wbWorkflow/ultimate_workflow_lifecycle
 (the WHAT) (the HOW) (the WHEN)
```

The cross-cutting deep-dives (`wbPlan_flag`) are reference material — read them when you hit the feature, not in advance.

The `presentation/` files are for output, not input — open them when you need to communicate the system, not when you're learning it.

---

## Which file matches your situation?

| You want to... | Read |
|---|---|
| Understand the 33-command surface in one sitting | [`overview_agentic_workflows`](overview_agentic_workflows) |
| See what each command acts on and produces | [`command_classification`](command_classification) |
| Chain commands or feed output back into itself | [`command_composition`](command_composition) |
| Know why running `/wbX` after `/wbY` matters | [`wbWorkflow/workflow_architecture`](wbWorkflow/workflow_architecture) |
| See the full feature lifecycle end-to-end | [`wbWorkflow/ultimate_workflow_lifecycle`](wbWorkflow/ultimate_workflow_lifecycle) |
| Use `--act` / `--wbPlan` flags correctly | [`wbPlan_flag`](wbPlan_flag) |
| Defer/cancel/re-open plan tasks via `--open` / `--def` / `--can` | [`plan_state_management`](plan_state_management) |
| Understand how ideas flow from capture to execution | [`ideas_pipeline`](ideas_pipeline) |
| Decide which model to use for `/wbX` | [`model_recommendations`](model_recommendations) |
| Use `-e` / `-p` / `-S` shortcuts on `/wb*` commands | [`flags_and_shortcuts`](flags_and_shortcuts) |
| Control token budget, memory isolation, or telemetry | [`universal_flags_exhaustive_simulation`](universal_flags_exhaustive_simulation) |
| Pitch the workflow to a colleague | `presentation/<audience>` |

---

## What this folder is NOT

- Not commands. For "what does `/wbAudit` do," go to [`../commands/wbAudit/`](../commands/wbAudit/).
- Not playbooks. For "what to run at 10am vs. 4pm," go to [`../daily_use/`](../daily_use/).
- Not onboarding. For "I've never used this before," go to [`../start_here/`](../start_here/).

---

*The concepts here change rarely. If you read this folder once, you probably won't need to re-read it for months — unless the system itself evolves (e.g., adding a 32nd command would force a rewrite of `overview_agentic_workflows.md`).*

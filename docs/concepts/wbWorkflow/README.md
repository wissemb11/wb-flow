---
title: "wbWorkflow — Concept Hub"
description: "Explains how wb-flow commands compose into human-directed, repeatable multi-step workflows beyond single-command scope."
---

# wbWorkflow — Concept Hub

> How wb-flow commands compose into repeatable, multi-step workflows.

---

## What is a Workflow?

A **workflow** in wb-flow is a deliberate sequence of commands that accomplishes a goal larger than any single command can handle. While each `/wb*` command is self-contained, the real power emerges when commands are chained with intention.

The key insight: **workflows are not scripts.** They're not automated pipelines. They're human-directed sequences where you choose the next step based on the output of the previous one. The AI executes each step; you steer.

---

## The Three Workflow Layers

| Layer | What It Covers | Key Pages |
|---|---|---|
| **Architecture** | How commands interact, what state they share, what contracts they enforce | [Workflow Architecture](workflow_architecture) |
| **Lifecycle** | The canonical sequence from session start to session close | [Ultimate Workflow Lifecycle](ultimate_workflow_lifecycle) |
| **Sequencing** | How tasks within a plan are ordered and executed using DAG dependencies | [Sequencing](sequencing_work_items) |

---

## The Canonical Daily Workflow

Most days follow this pattern:

```
Orient      →  /wbStandup + /wbContext
Plan        →  /wbPlan (if work is complex)
Execute     →  /wbWork (repeat per task)
Validate    →  /wbValid
Commit      →  /wbGit
Close       →  /wbStopTrack
```

Each step reads state left by the previous step. `/wbStandup` surfaces open tasks; `/wbPlan` decomposes them; `/wbWork` executes them; `/wbValid` checks the result; `/wbGit` commits. The chain is held together by the `reports/` file tree, not by in-memory state.

---

## Presentation Layers

For different depths of explanation:

- [ELI5](presentation/wbWorkflow_eli5) — The workflow concept explained simply
- [Practical](presentation/wbWorkflow_practical) — Real scenarios and command chains
- [Expert](presentation/wbWorkflow_expert) — Architecture, state flow, and design decisions

---

## How This Relates to Other Concepts

| Concept | Relationship |
|---|---|
| [Command Classification](../command_classification) | Defines the role types (Worker, Validator, Critic...) that compose workflows |
| [Command Composition](../command_composition) | Rules for chaining commands (what can follow what) |
| [Plan State Management](../plan_state_management) | How plan files carry state across commands |
| [Session Lifecycle](../../session_lifecycle/) | The start-to-finish session pattern that workflows live inside |

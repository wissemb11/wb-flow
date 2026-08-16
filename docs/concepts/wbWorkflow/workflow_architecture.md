---
title: "AI Workflow Architecture — A the agent Perspective"
description: "Diagrams the AI session path from context loading through complexity assessment to workflow execution and reporting."
---

# AI Workflow Architecture — A the agent Perspective

## The system in one sentence

Every AI session follows the same path: **load context → assess complexity → choose workflow → execute → report.**

The diagram below shows this visually. The annotations after it explain *why* each node exists.

---

## The Diagram

<WorkflowDiagram />

<div align="center">
<ReportsOrchestration />
*Commands don't share memory — they share files. Watch how each command reads from and writes to the `reports/` tree.*
</div>

---

## Why each piece exists

### Global Preferences
Your `shortcuts.md` lives in the AI's system memory, not in any project folder. It controls *how* the AI communicates with you — tone, format, verbosity. This layer is invisible but always active.

**The key insight:** Communication style is separate from project knowledge. You don't want to re-explain "I prefer concise answers" every time you switch projects.

### `/wbContext` (The initialization ritual)
This is the single most important step. Without it, the AI is a generalist — it knows everything about programming but nothing about *your* programming.

After `/wbContext`, the AI knows:
- What this package does (from `context.md`)
- What rules to follow (from `dev.md`)
- What scripts to run (from `dev_reference.md`)

**The key insight:** Context is not optional. It's the difference between "an AI that writes code" and "an AI that writes code *that fits your project*."

### The Temporal Memory Loop
Before acting, every command now scans the `.agents/workflows/reports/` directory. This is the **Short-Term Memory**.
- **Why?** If the AI just failed a test or if a recent audit found technical debt, the AI needs to know about it *before* making a new plan.
- **The key insight:** This turns a linear pipeline into a **Closed-Loop System**. The output of an Audit becomes the automatic input for the next Plan.

### The complexity fork
Not every task needs a project plan. A bug fix needs surgical precision. A migration needs strategic coordination. Using the wrong workflow for the wrong task wastes time either way.

**The key insight:** The AI doesn't decide this — you do. You either describe a problem (→ `dev.md` handles it) or you invoke `/wbPlan` (→ multi-agent orchestration begins).

### The `dev.md` path
This is a tight loop: find the code, change it carefully, verify it compiles, tell the human what happened. No planning documents, no task tables, no validator agents. Just disciplined execution.

The five phases (Discovery → Implementation → Safety → QA → Handoff) exist because each one catches a different class of mistake:
- Discovery prevents editing the wrong file
- Safety prevents deleting important code
- QA prevents shipping broken syntax
- Handoff prevents the human from wondering "what just happened?"

### The `/wbPlan` path
This is a coordination protocol. One AI generates the plan. Different AIs execute different tasks. A separate AI validates each task. The plan file is the single source of truth — everyone reads it, everyone writes to it.

The Worker/Validator loop exists because **no single AI is perfect.** A code-focused model (Qwen3) writes fast but sometimes misses edge cases. A reasoning-focused model (the agent) catches those edges but would be slow and expensive to use for every line of code. The loop combines their strengths.

<div align="center">
<WorkerValidatorLoop />
*The worker/validator loop in action: Plan assigns → Worker writes → Validator reviews → PASS/FAIL → retry or next.*
</div>

### The flag-chained shortcut path
Not a third workflow — an automation that wires the `/wbPlan` path to the output of an upstream report. When you'd otherwise run `/wbAudit` then read findings then `/wbPlan` to scope what's worth coordinating, the chain `/wbAudit <pkg> --act --wbPlan` produces the audit, a ranked action file (5-color triage + TODAY/WEEK/MONTH/LATER buckets), and a plan file with worker/validator tasks for the 🔵 multi-step findings — all from one invocation.

The chain forces the triage discipline *before* planning. A hand-run audit→plan sequence often skips the ranking step entirely; the chain doesn't let you. That's the value, not just keystroke savings.

Composable on `/wbAudit`, `/wbReview`, `/wbStandup`. `/wbActOn <existing-report>` is the standalone form. `/wbPlan --wbPlan` is a no-op (plan-of-a-plan). Manual two-step remains valid for explicit-scope cases. Full reference: [`wbPlan_flag`](../wbPlan_flag.md).

---

## What this architecture prevents

| Without this system | With this system |
|---|---|
| AI writes Vue 3 code in a Vue 2 project | `context.md` specifies the framework version |
| AI runs `npm install` inside a sub-package | `monorepo_rules.md` says "always install from root" |
| AI deletes a file "to clean up" | `dev.md` says "never delete without permission" |
| AI rewrites 500 lines when only 3 needed fixing | `dev.md` says "never overwrite large files completely" |
| You explain your project from scratch every session | `/wbContext` loads everything in one command |
| A massive migration has no paper trail | `/wbPlan` produces task reports and validator scores |

The architecture doesn't make AI smarter. It makes AI *constrained in the right ways.* That's more valuable.

### 🔄 Temporal State Awareness (The Checkbox Rule)
The Temporal Memory is cumulative but **state-aware**. It does not blindly repeat old tasks. 
When an AI reads past plans in the `reports/plans/` folder, it evaluates the checkboxes:
- **`⬜` (Empty Checkbox)**: The task is an open ticket. If an audit created a task and it's still empty, the next `/wbPlan` will carry it over.
- **`✅` (Checked Box)**: The task is a closed ticket. The AI knows the debt has been resolved and will ignore the old audit, starting fresh.
This turns the `reports/` folder into a self-maintaining Jira board.

---

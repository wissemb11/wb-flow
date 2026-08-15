---
title: "The AI Workflow Lifecycle — How It Actually Works"
description:" "Explains the two-phase system where AI agents inherit memory: building context once per project and reusing it.""
---

# The AI Workflow Lifecycle — How It Actually Works

You have built a system where AI agents don't start from zero every time. They inherit memory. This document explains the two distinct phases of that system.

---

## Phase One: Building the Memory (You do this once per project)

Think of this like onboarding a new developer. You wouldn't throw them at the codebase on day one — you'd sit them down, explain the architecture, show them the build scripts, and tell them "we never do X here." That's exactly what Phase One does, except the "new developer" is an AI.

### The sequence:

**Step 1 — Generate the raw context.**
You run `/wbContext packages/wb-core`. The AI reads the actual source code — `package.json`, `index.js`, `vite.config.js` — and writes a `context.md` file that captures what this package *is*, what it depends on, and what constraints it operates under.

If you need depth on a specific subsystem, you add `--focus`:
```
/wbContext packages/wb-core --focus="WBC render engine"
```
This produces a second file (`context_wbc_renderer.md`) that goes deep on just that topic.

**Step 2 — Validate through planning.**
You run `/wbPlan` against the same package. This forces the AI to prove it understood the context by producing a concrete task plan. If the plan looks wrong, the context was wrong — so you refine.

> **Audit-derived plans (later in the lifecycle, when the package has artifacts):** once the package has audit/review/standup reports, the `/wbPlan` step can be derived automatically from those instead of typed by hand. `/wbAudit packages/wb-core/ --act --wbPlan` produces the audit, a ranked action file (5-color triage + TODAY/WEEK/MONTH/LATER buckets), and a plan file scoped to the audit's 🔵 multi-step findings. Same plan structure as a manual `/wbPlan`, but the scope is forced through the triage discipline first. Use the chain when an upstream report exists; use bare `/wbPlan` when planning fresh. Reference: [`wbPlan_flag`](../wbPlan_flag).

**Step 3 — Multi-agent refinement.**
You hand the plan to different AI models. Qwen3 executes tasks, the agent validates them. Each pass tightens the context files. This is iterative — you keep looping Steps 1–3 until the context feels bulletproof.

**Step 4 — Lock it down.**
You read `context.md` yourself. You update `dev.md` if the project taught you new rules. Then you stop. The memory is built.

---

## Phase Two: Using the Memory (You do this every day)

This is where the investment pays off. Every single day starts the same way:

```
/wbContext packages/wb-core
```

That's it. One command. The AI now knows everything it needs to know about this package. No preamble, no "here's some context about my project," no copy-pasting architecture docs.

### Then you work:

**For routine tasks** — just describe what you need in plain language. The AI follows `dev.md` automatically: it searches before editing, it doesn't delete files, it reports what it changed, it tells you how to test.

**For major features** — you run `/wbPlan "description"`. The AI generates a structured task table, and you enter the Worker/Validator loop where multiple agents collaborate on the implementation.

### At the end of the day:

Ask one question: *did the ground truth change?*

If you renamed a folder, added a dependency, or discovered the AI keeps making the same mistake — open `context.md` or `dev.md` and add one line. That line will persist forever. Tomorrow's AI will never make that mistake again.

If nothing changed, just close your laptop. The memory is durable.

---

## The core insight

Most people treat AI sessions as disposable conversations. You've turned them into something closer to a persistent team member. The context files are the team member's notebook — always up to date, always consulted first, never forgotten.

The workflow is simple because the complexity lives in the files, not in your head.

## Temporal Memory & Closed-Loop Integration
This workflow integrates Temporal Memory. All agents must read the `.agents/workflows/reports/` directory to ingest previous feedback (like failed audits or test results) before executing new plans. This creates a closed-loop system where past outputs directly inform future actions.

### 🔄 Temporal State Awareness (The Checkbox Rule)
The Temporal Memory is cumulative but **state-aware**. It does not blindly repeat old tasks. 
When an AI reads past plans in the `reports/plans/` folder, it evaluates the checkboxes:
- **`⬜` (Empty Checkbox)**: The task is an open ticket. If an audit created a task and it's still empty, the next `/wbPlan` will carry it over.
- **`✅` (Checked Box)**: The task is a closed ticket. The AI knows the debt has been resolved and will ignore the old audit, starting fresh.
This turns the `reports/` folder into a self-maintaining Jira board.

---

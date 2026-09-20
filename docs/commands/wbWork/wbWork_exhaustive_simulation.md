---
title: "wb-flow Protocol: /wbWork Execution & Simulation"
description: "Exhaustive behavior matrix and execution specification for the wbWork command."
---

# wb-flow Protocol: /wbWork Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbWork` command. It serves as the definitive reference for deep task execution logic, wildcard ID selection, code generation constraints, and test-driven validation protocols.

---

## 1. Role & Definition Matrix
**Role:** The Implementer & Coder
**Target:** Executes specific tasks from the active `plan_*.md` file.
**Core Protocol:** Strict adherence to the Directed Acyclic Graph (DAG) defined in the plan. Cannot execute tasks out of chronological order if dependencies exist.

| Scenario | System Behavior |
|---|---|
| Target is UI Component | **[PROCEED]** Analyzes `index.css` or design system first. Ensures rich aesthetics, modern typography, and responsive layouts. |
| Target is Core Logic | **[PROCEED]** Employs Test-Driven Development (TDD). Analyzes existing tests and writes new assertions *before* modifying logic. |
| No Active Plan Found | **[HALT]** Protocol strictly forbids rogue coding. Emits "Cannot work without a blueprint" error and suggests `/wbPlan`. |

---

## 2. Argument & Criteria Resolution Matrix
The `/wbWork` command supports complex criteria targeting to allow precise or massive sweeping changes.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Single Task ID | `Command: /wbWork -i="2"` | Locks onto Task #2. Checks `Dep` column for DAG clearance. | Begins implementation of Task 2 exclusively. |
| Multi-Task Array | `Command: /wbWork -i="1,3,4"` | Parses comma-separated IDs. Sorts them chronologically. | Implements Task 1, then Task 3, then Task 4 sequentially. |
| Wildcard (All Tasks) | `Command: /wbWork -i="*"` | Extracts all tasks currently marked `⬜ Done`. | Initiates a massive execution loop, processing every unblocked task in order. |
| Natural Language Selection | `Command: /wbWork "do the UI tasks"` | Parses the string against task descriptions. | Resolves fuzzy match to Task #3. Begins implementation. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--id="<id>"` | `-i` | Explicit task targeting (Supports singular, CSV arrays, and `*` wildcards). | `Command: /wbWork -i="*"` | `[TASK] Wildcard detected. Queuing 4 pending tasks for sequential execution.` |
| `--open` | `-o` | Intercepts execution to ask the user for architectural guidance before coding. | `Command: /wbWork -i="2" -o` | `[PROMPT] How should I handle the API timeout state before writing this component?` |
| `--def` | `-d` | Definitive mode. Executes code immediately using best-judgment without asking questions. | `Command: /wbWork -i="2" -d` | `[DEF] Enforcing default error boundary implementation based on context.md.` |
| `--can` | `-c` | Pre-flight feasibility check. Evaluates if the task is actually codable given current context. | `Command: /wbWork -i="1,2" -c` | `[CAN] Feasibility Check: Yes. Both tasks have sufficient API context to proceed.` |

---

<script setup>
const workSimPipelines = [
  {
    title: "The 'Massive Sweep' (-i=\"*\" -d)",
    cmd: '/wbWork -i="*" -d',
    logs: [
      { text: "[SYSTEM] Wildcard detected. 3 tasks queued.", type: "sys" },
      { text: "[WORK] Implementing Task 1: JWT Handshake.", type: "gen" },
      { text: "[CODE] Updating tierEnforcement.js...", type: "sys" },
      { text: "[PLAN] Marking Task 1 as ✅ Done.", type: "ok" },
      { text: "[WORK] Implementing Task 2...", type: "gen" }
    ],
    note: "User wants the agent to complete every single unblocked task in the plan immediately, without stopping to ask questions.",
    noteType: "warning"
  },
  {
    title: "The 'Surgical Array' (-i=\"1,4\" -o)",
    cmd: '/wbWork -i="1,4" -o',
    logs: [
      { text: "[SYSTEM] Queued Tasks 1 and 4.", type: "sys" },
      { text: "[PROMPT] For Task 1 (Auth), do you prefer a redirect or a modal on failure?", type: "ctx" }
    ],
    note: "User wants to execute two specific, independent tasks but wants to be prompted for design choices on each.",
    noteType: "info"
  },
  {
    title: "The 'Auto-Triage / Inline Task'",
    cmd: '/wbWork packages/wb-core "Implement OAuth Login Flow"',
    logs: [
      { text: "[TRIAGE] Issue is Complex (P0). Context window risk high.", type: "warn" },
      { text: "[PLAN] Added Parent Task #4 to today's plan.", type: "sys" },
      { text: "[DECOMPOSE] Spawning sub-tasks #4.1, #4.2, #4.3.", type: "sys" },
      { text: "[WORK] Implementing Task 4.1: OAuth State Machine.", type: "gen" },
      { text: "[CODE] Updating authStore.js...", type: "sys" },
      { text: "[PLAN] Marking Task 4.1 as ✅ Done.", type: "ok" },
      { text: "[WORK] Implementing Task 4.2: OAuth Endpoints...", type: "gen" },
      { text: "...", type: "sys" },
      { text: "[SYSTEM] Complex inline task fully resolved.", type: "ok" }
    ],
    note: "User bypasses the plan file and passes a raw issue description directly to the command. The system must assess complexity and dynamically route.",
    noteType: "info"
  }
];

const wavePipelines = [
  {
    title: "Executing a Wave Cell (--wave=A:W)",
    cmd: '/wbWork plan.md --wave="A:W" -M=$WORKER',
    logs: [
      { text: "[SYSTEM] Reading plan.md for Wave A, Worker cell...", type: "sys" },
      { text: "[TRIAGE] Delegating to claude:opus 5 (overriding default roster).", type: "warn" },
      { text: "[WORK] Implementing Task B23: Wave A Worker dispatch.", type: "gen" },
      { text: "[OK] Task complete. ⏱️ 15 min elapsed.", type: "ok" },
      { text: "[PLAN] Updating 🌊 Next Executable Sequence matrix...", type: "sys" }
    ],
    tableHeaders: ["Wave", "🧠 Planner", "🔨 Worker", "✅ Validator", "📋 Mechanical"],
    table: [
      { cells: ["Wave A", "✅ Done", "✅ Done (claude:opus 5)", "⬜ Pending", "⬜ Pending"] },
      { cells: ["Wave B", "⬜ Pending", "⬜ Pending", "⬜ Pending", "⬜ Pending"] }
    ],
    note: "The --wave flag lets you surgically execute a single cell in the plan's Next Executable Sequence matrix, delegating on the fly with -M.",
    noteType: "info"
  }
];
</script>

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

<LiveDemoAnimation command="wbWork" titleSuffix="Exhaustive Simulation" :pipelines="workSimPipelines" />

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Blocked Dependency | User runs `/wbWork -i="3"`, but Task 3 depends on Task 2 (which is `⬜`). | `❌ Error: DAG Violation. Cannot execute Task 3 until Task 2 is marked ✅ Valid.` |
| Wildcard DAG Halt | User runs `-i="*"`. Task 1 fails compilation. | `⚠️ Warning: Task 1 failed. Halting wildcard queue to prevent cascading errors in Task 2 and 3.` |
| Code Breakage | Syntax error in generated code chunk. | `⚠️ Warning: AST validation failed. Re-evaluating code implementation.` |
| Invalid ID | User runs `-i="99"` (Task doesn't exist). | `❌ Error: Task ID 99 not found in active plan.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


### ⏱️ Matrix Task Duration Estimations
In the `## 🌊 Next Executable Sequence` matrix table, each task dispatch cell appends the estimated task duration extracted from the task table's `Est. (min)` column, formatted as `*(⏱️ <min> min)*`:

```markdown
`/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
```


### 💡 Pre-Flight Explanation Blueprint Gate (`--as`)
- **Standard Mode (default, without `--as`)**: Matrix cells contain **ONLY** the direct execution command:
  ```markdown
  `/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  ```
- **Explanation Mode (with `--as="<style>"`)**: Matrix cells prepend `/wbExplain`:
  ```markdown
  `/wbExplain plan.md --id=B23 --as="expert,steps"`<br>`/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  ```

## 🎛️ Universal model flags *(2026-08-01)*

| Flag | Alias | Effect |
|---|---|---|
| `--planner=` | `-p` | 🧠 Planner chain — **persists** via `/wbModel` |
| `--validator=` | `-v` | ✅ Validator chain — persists |
| `--worker=` | `-w` | 🔨 Worker chain — persists. ⚠️ `-w` is **not** `--wave` |
| `--mechanical=` | `-m` | 📋 Mechanical chain — persists |
| `--model=` | `-M` | **Delegate this run.** Highest priority: outranks role routing, the roster and the executor≠validator rule |
| `--wave=<L>:<R>` | `-W` | Run **one cell** — `:P` Planner · `:V` Validator · `:W` Worker · `:M` Mechanical |

<LiveDemoAnimation command="wbWork" titleSuffix="Wave Execution" :pipelines="wavePipelines" />

Role flags are shorthand for running `/wbModel` first. An unknown role letter in `--wave` exits non-zero rather than silently running the whole row. **Precedence:** `-M` → role flag → plan-header roster → `model_recommendations.md` → defaults.

After the 🌊 matrix, a **copy/paste block** of bare runnable commands is printed — no table markup, no `<br>`, no duration annotations.

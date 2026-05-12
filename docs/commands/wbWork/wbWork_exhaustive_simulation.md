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

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Sweep" (`-i="*" -d`)
**Context:** User wants the agent to complete every single unblocked task in the plan immediately, without stopping to ask questions.
**Command Executed:** `/wbWork -i="*" -d`
**Simulated Protocol Chain:**
1. System reads active plan. Finds Tasks 1, 2, 3.
2. Evaluates DAG. (Task 3 depends on 1 and 2).
3. Executes Task 1 -> Writes Code -> Marks `✅ Done`.
4. Executes Task 2 -> Writes Code -> Marks `✅ Done`.
5. Executes Task 3 -> Writes Code -> Marks `✅ Done`.
**Simulated Output:**
```markdown
> Command: /wbWork -i="*" -d

[SYSTEM] Wildcard detected. 3 tasks queued.
[WORK] Implementing Task 1: JWT Handshake.
[CODE] Updating tierEnforcement.js...
[PLAN] Marking Task 1 as ✅ Done.
[WORK] Implementing Task 2...
```

### 💠 The "Surgical Array" (`-i="1,4" -o`)
**Context:** User wants to execute two specific, independent tasks but wants to be prompted for design choices on each.
**Command Executed:** `/wbWork -i="1,4" -o`
**Simulated Output:**
```markdown
> Command: /wbWork -i="1,4" -o

[SYSTEM] Queued Tasks 1 and 4.
[PROMPT] For Task 1 (Auth), do you prefer a redirect or a modal on failure?
```

### 💠 The "Auto-Triage / Inline Task" (`<scope> "<issue>"`)
**Context:** User bypasses the plan file and passes a raw issue description directly to the command. The system must assess complexity and dynamically route.
**Command Executed:** `/wbWork packages/wb-core "Implement OAuth Login Flow"`
**Simulated Protocol Chain:**
1. System reads the natural language argument.
2. Evaluates complexity. Determines it is a P0/P1 task (requires multiple files: API, UI, State).
3. Injects Parent Task #4 into today's `plan_*.md`.
4. Spawns dynamic decomposition (`/wbPlan` logic). Creates Sub-tasks #4.1 (State), #4.2 (API), #4.3 (UI).
5. Executes #4.1 -> Writes Code -> Marks `✅ Done`.
6. Executes #4.2 -> Writes Code -> Marks `✅ Done`.
7. Executes #4.3 -> Writes Code -> Marks `✅ Done`.
**Simulated Output:**
```markdown
> Command: /wbWork packages/wb-core "Implement OAuth Login Flow"

[TRIAGE] Issue is Complex (P0). Context window risk high.
[PLAN] Added Parent Task #4 to today's plan.
[DECOMPOSE] Spawning sub-tasks #4.1, #4.2, #4.3.
[WORK] Implementing Task 4.1: OAuth State Machine.
[CODE] Updating authStore.js...
[PLAN] Marking Task 4.1 as ✅ Done.
[WORK] Implementing Task 4.2: OAuth Endpoints...
...
[SYSTEM] Complex inline task fully resolved.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Blocked Dependency | User runs `/wbWork -i="3"`, but Task 3 depends on Task 2 (which is `⬜`). | `❌ Error: DAG Violation. Cannot execute Task 3 until Task 2 is marked ✅ Valid.` |
| Wildcard DAG Halt | User runs `-i="*"`. Task 1 fails compilation. | `⚠️ Warning: Task 1 failed. Halting wildcard queue to prevent cascading errors in Task 2 and 3.` |
| Code Breakage | Syntax error in generated code chunk. | `⚠️ Warning: AST validation failed. Re-evaluating code implementation.` |
| Invalid ID | User runs `-i="99"` (Task doesn't exist). | `❌ Error: Task ID 99 not found in active plan.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

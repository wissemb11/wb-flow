# wb-flow Protocol: /wbRefactor Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbRefactor` command. It serves as the definitive reference for architectural restructuring, component decoupling, and macroscopic logic optimization without altering user-facing behavior.

---

## 1. Role & Definition Matrix
**Role:** The Codebase Optimizer & Architect
**Target:** Transforms existing codebase structures to adhere to DRY principles and modern architectural standards.
**Core Protocol:** Strict adherence to "No Logic Mutation". Functional output must remain identical to pre-refactor state, validated by existing tests.

| Scenario | System Behavior |
|---|---|
| Target is Monolith File | **[PROCEED]** Analyzes AST. Extracts independent functions into dedicated utility files. Generates export bindings. |
| Target is UI Component | **[PROCEED]** Splits massive Vue/React components into smaller, reusable presentational components. |
| Tests are Missing | **[HALT]** Protocol forbids executing a deep refactor on untested logic. Prompts user to run `/wbTest -g` first. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbRefactor` requires targeted scopes to prevent catastrophic, untrackable restructuring.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbRefactor src/WBC.js` | Analyzes file complexity. Identifies logical blocks for extraction. | Splits `WBC.js` into 4 new modules and updates imports. |
| Directory Path | `Command: /wbRefactor src/utils` | Consolidates redundant functions across multiple utility files. | Merges 12 small files into 3 categorized service files. |
| Wildcard Glob | `Command: /wbRefactor src/**/*.vue` | Sweeps all Vue components for duplicated inline templates/styles. | Extracts common UI patterns into a shared `/components` folder. |
| Natural Language | `Command: /wbRefactor "decouple the API calls"` | Fuzzily locates files importing `axios` or `fetch` directly in UI logic. | Extracts API calls into a dedicated `apiService.js`. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--pattern="<str>"` | `-p` | Enforces a specific architectural pattern (e.g., `repository`, `mvc`, `hooks`). | `Command: /wbRefactor src/ -p="repository"` | `[PATTERN] Migrating direct API calls to the Repository Pattern.` |
| `--dry-run` | `-d` | Simulates the refactor and outputs the proposed file structure without altering disk. | `Command: /wbRefactor src/WBC.js -d` | `[DRY-RUN] Would create: wbc_auth.js, wbc_state.js. 0 files changed.` |
| `--wbPlan` | `-P` | Defers the massive refactoring effort into a structured, step-by-step active plan. | `Command: /wbRefactor src/ -P` | `[SYNC] Writing 6 refactoring steps into plan_wb-core_2026.md.` |
| `--strict` | `-s` | Aborts if the refactor requires modifying external packages/consumers. | `Command: /wbRefactor src/ -s` | `[STRICT] Aborted. Refactoring 'auth' would break wbc-ui.com.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Architectural Blueprint" (`src/WBC.js -p="hooks" -P`)
**Context:** The `WBC.js` file is too massive. The user wants to convert its internal logic into modular hooks, but wants to review the plan before any code is touched.
**Command Executed:** `/wbRefactor src/WBC.js -p="hooks" -P`
**Simulated Protocol Chain:**
1. Parses `WBC.js` (1,171 lines).
2. Identifies 4 distinct state domains capable of becoming custom hooks.
3. Defers execution (`-P`). Writes the 4 extraction steps to the active plan.
**Simulated Output:**
```markdown
> Command: /wbRefactor src/WBC.js -p="hooks" -P

[SYSTEM] Analyzing WBC.js monolithic structure...
[PATTERN] Identified 4 domains suitable for React/Vue Hooks.
[SYNC] Generating structured DAG plan.
[SUCCESS] Appended 4 tasks to plan_wb-core_20260504.md. Use /wbWork to execute.
```

### 💠 The "Massive DRY Sweep" (`src/**/*.js -d`)
**Context:** User wants to see how much code could be consolidated across the entire `src` directory without risking actual changes.
**Command Executed:** `/wbRefactor src/**/*.js -d`
**Simulated Output:**
```markdown
> Command: /wbRefactor src/**/*.js -d

[SYSTEM] Glob resolved to 45 files.
[DRY-RUN] Analysis complete. 
[REPORT] Found 6 duplicated date-parsing functions. Can consolidate to dateUtils.js.
[REPORT] Found 3 identical JWT validation blocks.
[SUCCESS] Dry-run complete. Run without -d to execute.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Missing Tests | System detects `auth.js` has no `auth.test.js`. | `❌ Error: Cannot refactor untested core logic. Run /wbTest -g first.` |
| Circular Dependency | Extracted module accidentally imports from its parent. | `⚠️ Warning: Circular dependency detected during AST check. Reverting chunk.` |
| Glob Explosion | `**/*.js` targets > 500 files. | `❌ Error: Scope too broad for a single refactor. Use directory limits.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

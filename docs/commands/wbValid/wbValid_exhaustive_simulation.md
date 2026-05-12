# wb-flow Protocol: /wbValid Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbValid` command. It serves as the definitive reference for how the agent tests, verifies, and formally approves implemented tasks using regression checks, wildcards, and pipeline validations.

---

## 1. Role & Definition Matrix
**Role:** The Quality Assurance Validator
**Target:** Validates code changes against the active `plan_*.md` file.
**Core Protocol:** Tasks cannot be marked `✅ Valid` unless they pass unit/e2e testing and strict architectural linting.

| Scenario | System Behavior |
|---|---|
| Target is UI Component | **[PROCEED]** Injects visual regression checks and evaluates DOM hierarchy compliance. |
| Target is Core Logic | **[PROCEED]** Executes existing Jest/Vitest suites to ensure no regressions occurred. |
| Task is Not Implemented | **[HALT]** Protocol strictly forbids validating tasks that are marked `⬜` or currently `In Progress`. |

---

## 2. Argument & Criteria Resolution Matrix
The `/wbValid` command supports complex criteria targeting to validate specific chunks of work without running the entire suite.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Single Task ID | `Command: /wbValid -i="2"` | Locks onto Task #2. Checks if Task 2 is implemented. | Runs tests specifically associated with Task 2. |
| Multi-Task Array | `Command: /wbValid -i="1,3,4"` | Parses comma-separated IDs. Validates them in batch. | Validates Task 1, then Task 3, then Task 4. |
| Wildcard (All Tasks) | `Command: /wbValid -i="*"` | Extracts all tasks currently marked `IMPLEMENTED` but not `✅ Valid`. | Initiates a massive CI-style regression suite across all modified components. |
| Natural Language | `Command: /wbValid "check the auth"` | Fuzzy matches the "auth" task. | Resolves to Task 1 and executes auth-specific assertions. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--id="<id>"` | `-i` | Explicit task targeting (Supports singular, CSV arrays, and `*` wildcards). | `Command: /wbValid -i="*"` | `[VALID] Wildcard detected. Queuing 4 implemented tasks for batch validation.` |
| `--strict` | `-s` | Fails the validation if even a single console.warn exists in the test output. | `Command: /wbValid -i="2" -s` | `[STRICT] Validation Failed: Detected 1 deprecation warning in console.` |
| `--fix` | `-f` | Automatically attempts to fix minor linting or syntax issues found during validation. | `Command: /wbValid -i="2" -f` | `[FIX] Auto-corrected trailing whitespace. Validation passed.` |
| `--plan-sync` | `-p` | Updates the active plan file with the validation results. | `Command: /wbValid -i="1,2" -p` | `[SYNC] Marking Tasks 1 and 2 as ✅ Valid in plan_*.md.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Release Gate" (`-i="*" -s -p`)
**Context:** User wants to validate all implemented tasks with strict enforcement, and update the plan if successful.
**Command Executed:** `/wbValid -i="*" -s -p`
**Simulated Protocol Chain:**
1. System reads active plan. Finds Tasks 1, 2, 3 are implemented.
2. Runs global unit tests and linter.
3. Strict mode (`-s`) enforces zero warnings.
4. Updates plan (`-p`) only if all tasks pass.
**Simulated Output:**
```markdown
> Command: /wbValid -i="*" -s -p

[SYSTEM] Wildcard detected. 3 implemented tasks found.
[VALID] Running strict test suite...
[SUCCESS] 142 tests passed. 0 warnings.
[SYNC] Marking Tasks 1, 2, and 3 as ✅ Valid.
[GATE] Release gate cleared. Ready for /wbGit.
```

### 💠 The "Partial Array Validation" (`-i="1,2" -f`)
**Context:** User wants to validate two tasks and auto-fix minor issues. Task 1 passes, but Task 2 has a major logic flaw.
**Command Executed:** `/wbValid -i="1,2" -f`
**Simulated Output:**
```markdown
> Command: /wbValid -i="1,2" -f

[VALID] Queued Tasks 1 and 2.
[VALID] Task 1 passed with auto-fix (linting resolved).
[ERROR] Task 2 failed assertions. Cannot auto-fix logic error.
[SYSTEM] Marking Task 1 as ✅ Valid. Task 2 requires /wbDebug.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Premature Validation | User runs `/wbValid -i="3"`, but Task 3 is not implemented yet. | `❌ Error: Cannot validate. Task 3 is still marked ⬜ (Pending).` |
| Wildcard Halt | User runs `-i="*"`. Task 1 passes, Task 2 fails. | `⚠️ Warning: Wildcard halted at Task 2. Tasks 3+ will not be validated until Task 2 is fixed.` |
| Missing Tests | Task has no associated test files. | `⚠️ Warning: No coverage found. Falling back to static AST analysis.` |
| Invalid ID | User runs `-i="99"` (Task doesn't exist). | `❌ Error: Task ID 99 not found in active plan.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wb-flow Protocol: /wbTest Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbTest` command. It serves as the definitive reference for how the agent executes testing suites, generates coverage gaps, operates in strict TDD (Test-Driven Development) mode, and targets wildcards.

---

## 1. Role & Definition Matrix
**Role:** The Test Suite Orchestrator & QA Automation Agent
**Target:** Executes existing tests or generates new assertions for target files/tasks.
**Core Protocol:** Prevents untested code from reaching `/wbGit`. Works tightly with `/wbWork` in TDD cycles.

| Scenario | System Behavior |
|---|---|
| Target is Existing Test | **[PROCEED]** Runs the suite. Parses the output (Jest/Vitest). Reports passes, fails, and coverage metrics. |
| Target is Source File | **[PROCEED]** Scans for a corresponding `.test.js` or `.spec.js`. If none exists, automatically generates a boilerplate test file. |
| TDD Mode Active | **[PROCEED]** Write tests *first*, verifies they fail, then updates the plan for `/wbWork` to implement the logic. |

---

## 2. Argument & Criteria Resolution Matrix
The `/wbTest` command requires precise targets to avoid running a multi-hour monorepo-wide test suite.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Single Task ID | `Command: /wbTest -i="2"` | Locks onto Task #2. Identifies files modified by Task 2. | Runs existing tests for files modified by Task 2. |
| Specific File Path | `Command: /wbTest src/utils/auth.js` | Locates `src/utils/auth.test.js`. | Executes unit tests specifically for `auth.js`. |
| Comma-Separated | `Command: /wbTest src/auth.js,src/state.js` | Locates both test files. | Runs both suites sequentially. |
| Wildcard Glob | `Command: /wbTest src/**/*.js` | Identifies all `.test.js` files within the glob. | Initiates a massive directory-level test suite. |
| Natural Language | `Command: /wbTest "test the login flow"` | Fuzzily matches E2E or integration tests related to login. | Resolves to Cypress/Playwright login suite. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--id="<id>"` | `-i` | Explicit task targeting (Supports singular, CSV arrays, and `*` wildcards). | `Command: /wbTest -i="*"` | `[TEST] Wildcard detected. Finding tests for all 3 tasks in the active plan.` |
| `--generate` | `-g` | Forces generation of missing test files instead of just running existing ones. | `Command: /wbTest src/app.js -g` | `[GENERATE] Creating app.test.js with 4 empty assertions.` |
| `--coverage` | `-c` | Enforces a strict coverage threshold (e.g., 80%). | `Command: /wbTest src/app.js -c="80"` | `[COVERAGE] FAILED: Current coverage is 72%. Need 80%.` |
| `--tdd` | `-t` | Engages Test-Driven Development mode. | `Command: /wbTest -i="1" -t` | `[TDD] Writing failing assertions for Task 1 before implementation.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "TDD Generator Loop" (`-i="1,2" -t -g`)
**Context:** User wants to start working on Tasks 1 and 2, but insists on strict TDD. They want the tests generated and confirmed failing *before* any logic is written.
**Command Executed:** `/wbTest -i="1,2" -t -g`
**Simulated Protocol Chain:**
1. Parses Task 1 and 2 from active plan.
2. Identifies target files (`tierEnforcement.js`, `renderString.js`).
3. Generates (`-g`) test files with mock logic.
4. Runs tests in TDD mode (`-t`). Verifies 100% failure rate (expected).
**Simulated Output:**
```markdown
> Command: /wbTest -i="1,2" -t -g

[SYSTEM] Queued Tasks 1 and 2 for TDD loop.
[GENERATE] Created tierEnforcement.test.js.
[GENERATE] Created renderString.test.js.
[TDD] Running test suites...
[TDD] SUCCESS: 8 tests failed successfully.
[SYNC] Ready for /wbWork to implement logic.
```

### 💠 The "Massive Coverage Check" (`src/**/*.js -c="90"`)
**Context:** Pre-commit hook to ensure the entire `src` directory meets a 90% coverage threshold.
**Command Executed:** `/wbTest src/**/*.js -c="90"`
**Simulated Output:**
```markdown
> Command: /wbTest src/**/*.js -c="90"

[SYSTEM] Glob resolved to 45 source files. Found 32 test files.
[TEST] Running massive suite...
[SUCCESS] 210 tests passed.
[COVERAGE] Threshold Check: 92% > 90%. PASS.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| No Tests Found | User runs `/wbTest` on a file with no `.test.js` without using `-g`. | `❌ Error: No test file found. Use -g to generate one.` |
| Coverage Failure | Target hits 75%, threshold was `-c="80"`. | `❌ Error: Coverage constraint failed. Pipeline blocked.` |
| Glob Explosion | User runs `/wbTest **/*`. Tests take > 10 mins. | `⚠️ Warning: Test suite exceeds timeout limit. Truncating.` |
| Invalid ID | User runs `-i="99"` (Task doesn't exist). | `❌ Error: Task ID 99 not found in active plan.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

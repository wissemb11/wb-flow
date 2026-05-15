# wb-flow Protocol: /wbTest Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbTest` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Current Status: `tierEnforcement.js` lacks an active `.test.js` equivalent. `renderString.js` has legacy tests.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Existing Test | **[ACTIVE]** System ready to execute Jest against `renderString.test.js`. |
| Target is Source File | **[ACTIVE]** System detects missing tests for `tierEnforcement.js`. |
| TDD Mode Active | **[AVAILABLE]** User can enforce TDD generation on Task 3. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Single Task ID | `Command: /wbTest -i="2"` | Targets Task 2. | `[PROCEED] Running existing tests for renderString.` |
| Specific File Path | `Command: /wbTest src/tierEnforcement.js` | Locks onto file. No test found. | `[HALT] Error: No tests found. Use -g to generate.` |
| Comma-Separated | `Command: /wbTest src/WBC.js,src/index.js` | Targets core files. | `[PROCEED] Executing suites for WBC.js and index.js sequentially.` |
| Wildcard Glob | `Command: /wbTest src/**/*.js` | Targets 14 files in `wb-core`. | `[PROCEED] Massive test suite executing across 14 modules.` |
| Natural Language | `Command: /wbTest "test the tier checks"` | Fuzzily matches to Task 1. | `[PROCEED] Resolving to tierEnforcement.js.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--id="<id>"` | `Command: /wbTest -i="*"` | `[TEST] Wildcard detected. Queuing tests for all 3 active tasks.` |
| `--generate` | `Command: /wbTest src/tierEnforcement.js -g` | `[GENERATE] Creating tierEnforcement.test.js with mock JWT data.` |
| `--coverage` | `Command: /wbTest src/WBC.js -c="50"` | `[COVERAGE] Warning: WBC.js coverage is 34%. FAILED threshold.` |
| `--tdd` | `Command: /wbTest -i="1" -t -g` | `[TDD] Generating failing assertions for Task 1 JWT Handshake.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "TDD Generator Loop" (`-i="1" -t -g`)
**Live Context:** Implementing the JWT Handshake from today's plan requires strict TDD behavior to prevent breaking downstream apps.
**Command Executed:** `/wbTest -i="1" -t -g`
**Live Output:**
```text
> Command: /wbTest -i="1" -t -g

[SYSTEM] Queued Task 1 (JWT Handshake).
[GENERATE] Created src/tierEnforcement.test.js.
[GENERATE] Injected 3 assertions: Missing Token, Invalid Token, Valid Handshake.
[TDD] Running Jest...
[TDD] SUCCESS: All 3 assertions failed exactly as expected.
[SYNC] Pipeline clear. Use /wbWork -i="1" to write the implementation logic.
```

### 💠 The "Massive Coverage Check" (`src/**/*.js -c="80"`)
**Live Context:** Running a pre-commit hook to verify `wb-core` has an 80% coverage floor.
**Command Executed:** `/wbTest src/**/*.js -c="80"`
**Live Output:**
```text
> Command: /wbTest src/**/*.js -c="80"

[SYSTEM] Glob resolved to 14 javascript files. Found 9 test files.
[TEST] Running Jest suite...
[SUCCESS] 42 tests passed.
[COVERAGE] Calculating...
[COVERAGE] Threshold Check: 68% < 80%. FAILED.
[ERROR] wb-core does not meet coverage requirements.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| No Tests Found | **[TRIGGERED]** If user runs `/wbTest src/tierEnforcement.js` | Halts execution. Warns user to append `-g`. |
| Coverage Failure | **[PASS]** WBC.js is huge. Coverage fails. | Fails gracefully with coverage report attached. |
| Glob Explosion | **[PASS]** Only 14 files in `wb-core/src`. | Safe to proceed. |
| Invalid ID | **[TRIGGERED]** If user attempts `/wbTest -i="4"`. | `❌ Error: plan_wb-core_20260504.md only contains 3 tasks.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

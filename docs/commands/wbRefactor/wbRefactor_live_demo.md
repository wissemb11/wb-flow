# wb-flow Protocol: /wbRefactor Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbRefactor` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Status: `src/WBC.js` is a massive monolith (1,171 LOC). `src/tierEnforcement.js` is relatively small.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Monolith File | **[ACTIVE]** System is primed to target `WBC.js` for major AST extraction. |
| Target is UI Component | **[INACTIVE]** `wb-core` does not contain Vue/React UI components. |
| Tests are Missing | **[ACTIVE]** System will block refactoring of `tierEnforcement.js` unless `-g` (via `wbTest`) was run previously. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific File Path | `Command: /wbRefactor src/WBC.js` | Locks onto the 1,171 LOC monolith. | `[PROCEED] Decomposing WBC.js into modular exports.` |
| Directory Path | `Command: /wbRefactor src/utils` | Targets utility folder. | `[PROCEED] Consolidating 4 utility files into pure functions.` |
| Wildcard Glob | `Command: /wbRefactor src/**/*.js` | Sweeps all 14 files. | `[PROCEED] Searching for duplicated logic across wb-core.` |
| Natural Language | `Command: /wbRefactor "decouple the tier checks"` | Fuzzily matches `tierEnforcement.js`. | `[PROCEED] Extracting JWT checks into separate service.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--pattern="<str>"` | `Command: /wbRefactor src/WBC.js -p="facade"` | `[PATTERN] Abstracting WBC.js into a Facade pattern for consumers.` |
| `--dry-run` | `Command: /wbRefactor src/**/*.js -d` | `[DRY-RUN] Would consolidate 2 duplicated fetch wrappers. Disk untouched.` |
| `--wbPlan` | `Command: /wbRefactor src/WBC.js -P` | `[SYNC] Writing 4 decomposition tasks to plan_wb-core_20260504.md.` |
| `--strict` | `Command: /wbRefactor src/WBC.js -s` | `[STRICT] Aborted. Refactoring WBC.js breaks exports used by wbc-ui.com.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Architectural Blueprint" (`src/WBC.js -p="facade" -P`)
**Live Context:** The developer knows `WBC.js` needs to be rewritten, but it's too risky to do it all at once. They want the AI to plan the Facade refactoring steps.
**Command Executed:** `/wbRefactor src/WBC.js -p="facade" -P`
**Live Output:**
```text
> Command: /wbRefactor src/WBC.js -p="facade" -P

[SYSTEM] Analyzing WBC.js AST...
[PATTERN] Facade pattern requested. Identifying external API boundaries.
[SYNC] Generating structured DAG plan.
[SUCCESS] Appended Task 4: "Create WBC Facade Interface" and Task 5: "Migrate internal state" to plan_wb-core_20260504.md.
```

### 💠 The "Massive DRY Sweep" (`src/**/*.js -d`)
**Live Context:** Running a safe check across `wb-core` to see if there's any technical debt that can be easily consolidated.
**Command Executed:** `/wbRefactor src/**/*.js -d`
**Live Output:**
```text
> Command: /wbRefactor src/**/*.js -d

[SYSTEM] Glob resolved to 14 files in wb-core.
[DRY-RUN] Analysis complete. 
[REPORT] `renderString.js` and `auth.js` both contain identical string-sanitization functions.
[SUCCESS] Dry-run complete. Run without -d to consolidate into `utils/sanitize.js`.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Missing Tests | **[TRIGGERED]** If user attempts to refactor `tierEnforcement.js`. | `❌ Error: No tests found. Aborting refactor to prevent regression.` |
| Circular Dependency | **[PASS]** Current imports in `wb-core` are strictly unidirectional. | Execution proceeds. |
| Glob Explosion | **[PASS]** `wb-core/src` only has 14 files. | Scope is safe for full AST sweep. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

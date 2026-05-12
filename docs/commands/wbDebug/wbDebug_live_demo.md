# wb-flow Protocol: /wbDebug Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbDebug` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Current Status: Implementation of Task 2 (`renderString.js`) is causing a regex catastrophic backtracking warning in the terminal.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Stack Trace | **[ACTIVE]** System is primed to parse the Regex backtracking warning. |
| Target is Logic Bug | **[ACTIVE]** System ready to inject performance profiling into `renderString.js`. |
| No Context Provided | **[HALT]** Execution blocked if no trace or file is specified. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific File Path | `Command: /wbDebug src/utils/renderString.js` | Locks onto `renderString.js`. | `[PROCEED] Scanning renderString for logical traps.` |
| Error String | `Command: /wbDebug "Regex too complex"` | Triggers codebase search. | `[PROCEED] Resolved 'Regex too complex' to src/utils/renderString.js:84.` |
| Specific Task ID | `Command: /wbDebug -i="2"` | Locks onto Task 2 in active plan. | `[PROCEED] Correlating Task 2 implementation with active bugs.` |
| Comma-Separated | `Command: /wbDebug -i="1,2"` | Parses Task 1 and 2 interaction. | `[PROCEED] Diagnosing state flow between JWT module and render pipeline.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--id="<id>"` | `Command: /wbDebug -i="2"` | `[DEBUG] Isolating the regex escape logic introduced in Task 2.` |
| `--trace="<str>"` | `Command: /wbDebug -t="Warning: backtracking limit reached"` | `[TRACE] Correlating terminal warning to renderString.js execution.` |
| `--act` | `Command: /wbDebug src/utils/renderString.js -a` | `[ACT] Confidence 99%. Applying native String.replace() fix automatically.` |
| `--wbPlan` | `Command: /wbDebug src/tierEnforcement.js -P` | `[SYNC] Writing 'Refactor tier checks' to plan_wb-core_20260504.md.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Auto-Remediation Loop" (`-t="<trace>" -a`)
**Live Context:** A live terminal warning is crashing the Vite dev server for `demo.wbc-ui.com`.
**Command Executed:** `/wbDebug -t="Warning: regex catastrophic backtracking at renderString (src/utils/renderString.js:84)" -a`
**Live Output:**
```text
> Command: /wbDebug -t="Warning: regex catastrophic backtracking at renderString (src/utils/renderString.js:84)" -a

[SYSTEM] Parsing stack trace...
[TRACE] Isolated fault to wb-core/src/utils/renderString.js line 84.
[DIAGNOSIS] Nested quantifier `(?:a+)+` detected in escape string logic.
[ACT] Confidence 99%. Applying fix...
[SUCCESS] Replaced regex with optimized pattern. Dev server stable.
```

### 💠 The "Task Conflict Diagnosis" (`-i="1,2" -P`)
**Live Context:** The JWT handshake (Task 1) works, but it causes the renderString function (Task 2) to lose its context.
**Command Executed:** `/wbDebug -i="1,2" -P`
**Live Output:**
```text
> Command: /wbDebug -i="1,2" -P

[SYSTEM] Queued Task 1 (JWT) and Task 2 (renderString escape).
[DIAGNOSIS] Race condition detected. renderString fires before JWT handshake completes.
[SYNC] Appending Task 4: "Await JWT resolution before string render" to plan_wb-core_20260504.md.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Ambiguous Trace | **[PASS]** Supplied trace contains clear file paths. | Execution proceeds. |
| Silent Failure | **[TRIGGERED]** User types `/wbDebug` with no args. | `❌ Error: Provide a trace, file, or Task ID.` |
| Auto-Fix Danger | **[PASS]** Regex optimization is non-destructive. | `-a` flag executes successfully. |
| Invalid ID | **[TRIGGERED]** If user attempts `/wbDebug -i="4"`. | `❌ Error: plan_wb-core_20260504.md only contains 3 tasks.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

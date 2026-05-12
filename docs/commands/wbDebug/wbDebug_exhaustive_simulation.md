# wb-flow Protocol: /wbDebug Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbDebug` command. It serves as the definitive reference for how the agent parses stack traces, isolates regressions, and utilizes wildcards to run global diagnostic sweeps.

---

## 1. Role & Definition Matrix
**Role:** The Diagnostic Specialist & Triage Agent
**Target:** Identifies the root cause of crashes, test failures, or logical anomalies within the codebase.
**Core Protocol:** Does not blindly rewrite code. Employs a strict "Isolate, Reproduce, Fix" diagnostic loop.

| Scenario | System Behavior |
|---|---|
| Target is Stack Trace | **[PROCEED]** Parses the trace, identifies the offending file, and traces the execution context upwards. |
| Target is Logic Bug | **[PROCEED]** Analyzes the module. Injects temporary logging/breakpoints if needed to verify state. |
| No Context Provided | **[HALT]** Protocol forbids blind debugging. Must provide a file, an error string, or a task ID. |

---

## 2. Argument & Criteria Resolution Matrix
The `/wbDebug` command accepts complex criteria to isolate deeply buried issues.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbDebug src/utils/auth.js` | Locks onto a single file for static anomaly detection. | Scans `auth.js` for common logical traps (e.g., race conditions, unhandled promises). |
| Error String | `Command: /wbDebug "TypeError: undefined is not an object"` | Triggers codebase-wide search for potential origins of this specific error. | Generates a list of 3 suspect files causing the TypeError. |
| Specific Task ID | `Command: /wbDebug -i="2"` | Locks onto a failing task from the active plan. | Cross-references Task 2's generated code against the plan's requirements. |
| Comma-Separated IDs | `Command: /wbDebug -i="1,3"` | Parses the array. Analyzes interaction between the two tasks. | Diagnoses state conflicts between Task 1 and Task 3. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--id="<id>"` | `-i` | Explicit task or issue targeting. | `Command: /wbDebug -i="2"` | `[DEBUG] Isolating logic related to Task 2 implementation.` |
| `--trace="<str>"` | `-t` | Injects a literal stack trace for deep parsing. | `Command: /wbDebug -t="at Object.render (renderString.js:42)"` | `[TRACE] Locking onto line 42 of renderString.js.` |
| `--act` | `-a` | Auto-applies the fix if confidence is >90%. | `Command: /wbDebug src/app.js -a` | `[ACT] Confidence 95%. Auto-fixing null reference exception.` |
| `--wbPlan` | `-P` | Defers the fix by injecting it as a new task into the active plan. | `Command: /wbDebug src/app.js -P` | `[SYNC] Writing Bugfix Task to plan_wb-core_2026.md.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Auto-Remediation Loop" (`-t="<trace>" -a`)
**Context:** The CI pipeline failed with a stack trace. User wants the AI to trace it and fix it immediately without prompting.
**Command Executed:** `/wbDebug -t="Uncaught (in promise) TypeError: Cannot read property 'map' of undefined at processList (src/list.js:15)" -a`
**Simulated Protocol Chain:**
1. Parses trace. Identifies `src/list.js` line 15.
2. Analyzes AST. Realizes `list` variable is not defaulting to `[]`.
3. Confidence check: 98%.
4. Activates `-a` flag. Modifies `list.js`.
**Simulated Output:**
```markdown
> Command: /wbDebug -t="Uncaught (in promise) TypeError: Cannot read property 'map' of undefined at processList (src/list.js:15)" -a

[SYSTEM] Parsing stack trace...
[TRACE] Isolated fault to src/list.js:15.
[DIAGNOSIS] Variable 'list' lacks default array fallback before mapping.
[ACT] Confidence 98%. Applying fix...
[SUCCESS] Injected fallback: `(list || []).map()`. Bug resolved.
```

### 💠 The "Task Conflict Diagnosis" (`-i="1,2" -P`)
**Context:** Task 1 and Task 2 were both implemented, but they break when used together. User wants to diagnose the conflict and add a fix to the plan.
**Command Executed:** `/wbDebug -i="1,2" -P`
**Simulated Output:**
```markdown
> Command: /wbDebug -i="1,2" -P

[SYSTEM] Queued Task 1 (JWT) and Task 2 (renderString).
[DIAGNOSIS] State conflict. Task 1 clears localStorage, breaking Task 2's reliance on cached regex tokens.
[SYNC] Appending Task 4: "Synchronize JWT storage with regex cache" to active plan.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Ambiguous Trace | Stack trace is minified with no source maps. | `⚠️ Warning: Minified trace detected. Diagnosis confidence low. Cannot auto-fix.` |
| Silent Failure | User reports "it doesn't work" with no trace or ID. | `❌ Error: Protocol Fault. Must provide a file, trace, or Task ID.` |
| Auto-Fix Danger | Bug is architectural. Confidence <90%. | `⚠️ Warning: Fix requires architectural change. Auto-fix aborted. Please use -P to plan.` |
| Invalid ID | User runs `-i="99"` (Task doesn't exist). | `❌ Error: Task ID 99 not found in active plan.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wb-flow Protocol: /wbActOn Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbActOn` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Status: We have successfully updated documentation, generated plans, and established strict v4 logic. A user might want to trigger a cleanup chain across the monorepo.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is a Bug Ticket | **[ACTIVE]** System ready to accept Jira/GitHub URLs to patch `wb-core`. |
| Target is a Feature Request | **[ACTIVE]** System ready to parse raw text into `plan_wb-core_20260504.md`. |
| Target is Ambiguous | **[ACTIVE]** Execution blocked if input string lacks clear actionable intent. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Natural Language String | `Command: /wbActOn "Clean up the dead code"` | Resolves intent to `/wbClean`. | `[PROCEED] Triggering aggressive codebase sanitization.` |
| External URL (GitHub) | `Command: /wbActOn "https://github.com/wbc-ui2/issues/10"` | Fetches issue payload. | `[PROCEED] Parsing Issue #10 for wb-core.` |
| File Path (Logs/JSON) | `Command: /wbActOn ../../scratch/error.log` | Parses log file. | `[PROCEED] Extracting trace from error.log to trigger Debug.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--chain="<cmds>"`| `Command: /wbActOn "Fix Regex" -c="wbWork,wbValid"` | `[CHAIN] Enforcing sequential execution of Work -> Valid.` |
| `--supervisor` | `Command: /wbActOn "Refactor WBC.js" -s` | `[SUPERVISOR] Halting after plan generation for human approval.` |
| `--timeout="<min>"`| `Command: /wbActOn "Audit security" -t="10"` | `[TIMEOUT] Setting 10-minute maximum runtime for Audit chain.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Supervised Feature Extraction" (`"Build the Auth Hooks" -s`)
**Live Context:** Running this *right now* to convert a vague feature request from a stakeholder into a structured plan and implementation for `wb-core`.
**Command Executed:** `/wbActOn "Build the Auth Hooks" -s`
**Live Output:**
```text
> Command: /wbActOn "Build the Auth Hooks" -s

[SYSTEM] Parsing natural language input...
[INFERENCE] Deduced optimal chain: /wbPlan -> /wbWork -> /wbExplain.
[CHAIN 1/3] Executing /wbPlan... 
[SUCCESS] Generated 3 tasks in plan_wb-core_20260504.md for Auth Hooks.
[SUPERVISOR] Halting. Do you approve the plan before I run /wbWork? [Y/n]
```

### 💠 The "Autonomous Bug Resolution" (`../../scratch/trace.log -c="wbDebug,wbWork"`)
**Live Context:** A local test run crashed, generating a `trace.log`. The developer wants the agent to automatically diagnose and fix the error based purely on the log file.
**Command Executed:** `/wbActOn "../../scratch/trace.log" -c="wbDebug,wbWork"`
**Live Output:**
```text
> Command: /wbActOn "../../scratch/trace.log" -c="wbDebug,wbWork"

[SYSTEM] Parsing file: scratch/trace.log...
[CHAIN 1/2] Executing /wbDebug... 
[DEBUG] Isolated fault to src/tierEnforcement.js line 42 (undefined reference).
[CHAIN 2/2] Executing /wbWork... 
[WORK] Applied null-check fix to tierEnforcement.js.
[SUCCESS] Chain complete. Bug resolved locally.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Infinite Loop | **[PASS]** Logic fix successfully validated on first try. | Chain completes. |
| URL Fetch Failed | **[TRIGGERED]** User passes private Jira link. | `❌ Error: 401 Unauthorized. Provide raw ticket text instead.` |
| Chain Break | **[PASS]** `/wbPlan` generates tasks successfully. | Handoff to `/wbWork` succeeds. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

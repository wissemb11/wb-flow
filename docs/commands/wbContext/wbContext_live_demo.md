# wb-flow Protocol: /wbContext Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbContext` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Directory exists.
*   `package.json` exists.
*   Existing `.wb/workflows/context.md` found.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Git Root | **[INACTIVE]** Command invoked at package level. |
| Context Already Exists | **[ACTIVE]** System prepares Smart Merge protocol to enhance existing `context.md` without destroying the Vue DevTools rules currently documented there. |

---

## 2. Argument Resolution Matrix (Live Application)

| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| No Argument | `Command: /wbContext` | Targeting `wb-core`. | `[MERGE] Enhancing existing wb-core context with new discoveries.` |
| Deep Dive Request | `Command: /wbContext -f="tier enforcement"` | Targeting specific module. | `[FOCUSED] Generating report on tierEnforcement.js.` |

---

## 3. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Architectural Deep Dive" (`-f="auth" -s="global"`)
**Live Context:** Running this *right now* to trace `wb-core` authentication into the consumer apps.
**Command Executed:** `/wbContext -f="auth" -s="global"`
**Live Output:**
```text
> Command: /wbContext -f="auth" -s="global"

[SYSTEM] Scanning wb-core/src...
[SYSTEM] Cross-referencing imports in apps/wb-core/wbc-ui.com...
[SUCCESS] Global authentication context mapped and saved to reports/2026/05/04/contexts/context_auth_global.md.
```

---

## 4. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Missing `package.json` | **[PASS]** Found in `wb-core`. | Analysis proceeds. |
| Read-Only Filesystem | **[PASS]** Write access confirmed. | Report generated successfully. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

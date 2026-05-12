# wb-flow Protocol: /wbAudit Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbAudit` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Key Files Present: `src/tierEnforcement.js`, `src/WBC.js`, `src/utils/renderString.js`

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Git Root | **[HALT]** Executing from `wb-labs` root without scope will trigger the glob explosion block. |
| Target is Sub-Package | **[ACTIVE]** Executing inside `wb-core`. AST parsers engaged. |
| Target is Specific File | **[ACTIVE]** Ready to deep scan `WBC.js` logic. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific File Path | `Command: /wbAudit src/tierEnforcement.js` | Locks onto `tierEnforcement.js`. | `[PROCEED] Deep scanning tierEnforcement for vulnerabilities.` |
| Directory Path | `Command: /wbAudit src/utils` | Scans all utilities. | `[PROCEED] Auditing 4 files in src/utils.` |
| Comma-Separated | `Command: /wbAudit src/WBC.js,src/tierEnforcement.js` | Extracts both core files. | `[PROCEED] Linking context between WBC.js and tierEnforcement.js.` |
| Wildcard Glob | `Command: /wbAudit src/**/*.js` | Extracts 14 files in `wb-core/src`. | `[PROCEED] Massive sweep initiated across 14 js files.` |
| Natural Language | `Command: /wbAudit "find the monoliths"` | Fuzzily matches size heuristics. | `[PROCEED] Resolved to WBC.js (1,171 LOC).` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--profile="<prof>"`| `Command: /wbAudit src/ -p="performance"` | `[PERF] Detected render blocking logic in renderString.js regex.` |
| `--depth="<level>"` | `Command: /wbAudit src/ -d="shallow"` | `[DEPTH] Completed shallow scan of wb-core in 1.2s. 0 criticals.` |
| `--act` | `Command: /wbAudit src/WBC.js -a` | `[ACT] Generating plan_decomposition_WBC.md automatically.` |
| `--wbPlan` | `Command: /wbAudit src/tierEnforcement.js -P` | `[SYNC] Appending security fix to existing plan_wb-core_20260504.md.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Massive Security Sweep" (`src/**/*.js -p="security" -a`)
**Live Context:** Running this *right now* to secure `wb-core` before shipping.
**Command Executed:** `/wbAudit src/**/*.js -p="security" -a`
**Live Output:**
```text
> Command: /wbAudit src/**/*.js -p="security" -a

[SYSTEM] Glob resolved to 14 javascript files in wb-core.
[PROFILE] Engaging strict Security matrix.
[AUDIT] Scanning...
[ALERT] Found P1 Vulnerability in tierEnforcement.js: Client-side validation bypass risk.
[ACT] Auto-generating remediation plan...
[SUCCESS] Created plan_security_wb-core_20260504.md.
```

### 💠 The "Surgical Perf Check" (`src/WBC.js,src/utils/renderString.js -p="performance"`)
**Live Context:** Profiling specifically the massive monolith and the text renderer.
**Command Executed:** `/wbAudit src/WBC.js,src/utils/renderString.js -p="performance"`
**Live Output:**
```text
> Command: /wbAudit src/WBC.js,src/utils/renderString.js -p="performance"

[SYSTEM] Queued 2 specific target files.
[PROFILE] Engaging Performance matrix.
[AUDIT] WBC.js: O(n) iteration over large dom nodes.
[AUDIT] renderString.js: Heavy regex backtracking detected.
[SUCCESS] Audit complete. No auto-plan triggered.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Glob Explosion | **[PASS]** `wb-core/src/**/*.js` only yields 14 files. | Scan proceeds safely. |
| Profile Conflict | **[PASS]** 'performance' and 'security' are valid profiles. | Profile loaded. |
| Auto-Plan Collision| **[TRIGGERED]** If using `-a`, but `plan_wb-core_20260504.md` is active. | `[SYNC] Reverting to Smart Merge to inject tasks into existing plan.` |
| Dead Links | **[PASS]** Comma-separated files exist. | Execution proceeds. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

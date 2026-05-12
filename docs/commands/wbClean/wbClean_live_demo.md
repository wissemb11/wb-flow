# wb-flow Protocol: /wbClean Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbClean` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Status: Previous developer iterations left several `console.log()` statements inside `WBC.js` and an unused import in `tierEnforcement.js`.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Logic File | **[ACTIVE]** System is primed to strip the unused import from `tierEnforcement.js`. |
| Target is UI Component | **[INACTIVE]** `wb-core` does not contain HTML/CSS files for orphan scanning. |
| Code is Already Clean | **[INACTIVE]** The system detected mess during the AST prescan. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific File Path | `Command: /wbClean src/tierEnforcement.js` | Targets specific file. | `[PROCEED] Removing 1 unused import declaration.` |
| Directory Path | `Command: /wbClean src/` | Scans all `wb-core` source. | `[PROCEED] Sweeping 14 files for debug traces and dead code.` |
| Comma-Separated | `Command: /wbClean src/WBC.js,src/tierEnforcement.js` | Locks onto two files. | `[PROCEED] Cleaning monolith and tier logic.` |
| Wildcard Glob | `Command: /wbClean src/**/*.js` | Engages all logic files. | `[PROCEED] Deep sanitizing all js files in wb-core.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--logs` | `Command: /wbClean src/WBC.js -l` | `[LOGS] Stripped 4 'console.log(tier)' traces.` |
| `--orphans` | `Command: /wbClean src/tierEnforcement.js -o` | `[ORPHANS] Removed unused 'import { oldCheck }'.` |
| `--dry-run` | `Command: /wbClean src/ -d` | `[DRY-RUN] Would remove 4 logs and 1 import. Disk untouched.` |
| `--aggressive` | `Command: /wbClean src/ -A` | `[AGGRESSIVE] Found 0 files with zero dependents. Safe.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Pre-Commit Janitor Sweep" (`src/ -l -o`)
**Live Context:** Running this *right now* to finalize the May 4th work in `wb-core` before pushing to origin.
**Command Executed:** `/wbClean src/ -l -o`
**Live Output:**
```text
> Command: /wbClean src/ -l -o

[SYSTEM] Initiating Pre-Commit Janitor Sweep in wb-core/src.
[LOGS] Scanning ASTs... Removed 4 console.log instances from WBC.js.
[ORPHANS] Scanning ASTs... Removed 1 unused import from tierEnforcement.js.
[SUCCESS] wb-core/src is clean and ready for /wbReview or /wbGit.
```

### 💠 The "Aggressive Orphan Hunt" (`src/ -A -d`)
**Live Context:** Checking if any files in `wb-core` are completely dead and disconnected from the `index.js` export tree.
**Command Executed:** `/wbClean src/ -A -d`
**Live Output:**
```text
> Command: /wbClean src/ -A -d

[SYSTEM] Executing Aggressive Dependency Tree mapping for wb-core...
[DRY-RUN] Tracing exports from src/index.js...
[SUCCESS] All 14 files in wb-core are actively imported in the dependency tree. 0 orphans found.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Dynamic Imports | **[PASS]** `wb-core` does not rely on async dynamic imports. | Clean sweep proceeds normally. |
| CSS Interactivity | **[PASS]** No CSS present in `wb-core`. | Safety check bypassed. |
| Aggressive Misfire | **[PASS]** `src/index.js` correctly flagged as protected entrypoint. | Entrypoint preserved. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

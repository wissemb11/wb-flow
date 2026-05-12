# wb-flow Protocol: /wbSetup Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbSetup` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2`
**Live State Evaluated:** 
*   Active Directory: `core2` (Monorepo root for UI and packages).
*   Status: The `demo.wbc-ui.com` app is currently running. The workspace is active, but a new developer might need to reset their environment.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Monorepo Root | **[ACTIVE]** System is primed to execute NPM workspace installations across `apps/` and `packages/`. |
| Target is Sub-Package | **[ACTIVE]** Ready to isolate `npm install` to a specific child directory. |
| Missing Template | **[PASS]** `.env.example` files exist in `core2/apps/wbc-ui.com`. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific Package | `Command: /wbSetup apps/md.wbc-ui.com` | Locks onto Mobile UI. | `[PROCEED] Bootstrapping mobile UI environment.` |
| Directory Path | `Command: /wbSetup .` | Analyzes `core2` root. | `[PROCEED] Scaffolding entire core2 monorepo.` |
| Comma-Separated | `Command: /wbSetup apps/demo.wbc-ui.com,packages/wb-core` | Targets demo app and core library. | `[PROCEED] Sequential bootstrap of core and demo consumer.` |
| Workspace Glob | `Command: /wbSetup packages/*` | Extracts all 4 packages. | `[PROCEED] Massive setup sweep across wb-core, dataviewer, press2.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--clean` | `Command: /wbSetup packages/wb-core -c` | `[CLEAN] Deleted wb-core/node_modules. Reinstalling.` |
| `--seed` | `Command: /wbSetup apps/wbc-ui.com -s` | `[SEED] Failed. Consumer app has no local database to seed.` |
| `--env` | `Command: /wbSetup apps/wbc-ui.com -e` | `[ENV] Overwriting apps/wbc-ui.com/.env.local with fresh template.` |
| `--dry-run` | `Command: /wbSetup . -d` | `[DRY-RUN] Would run npm install in workspace root. Disk untouched.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Massive Monorepo Reset" (`. -c -e`)
**Live Context:** A developer's local `wbc-ui.com` environment is completely broken with phantom dependency issues. They want to aggressively reset the entire `core2` monorepo.
**Command Executed:** `/wbSetup . -c -e`
**Live Output:**
```text
> Command: /wbSetup . -c -e

[SYSTEM] Initiating Massive Monorepo Reset for core2...
[CLEAN] Scanning for node_modules...
[CLEAN] Purged core2/node_modules.
[CLEAN] Purged core2/apps/wbc-ui.com/node_modules.
[CLEAN] Purged core2/packages/wb-core/node_modules... (7 total purged).
[ENV] Resetting apps/wbc-ui.com/.env.local.
[INSTALL] Running `npm install` across core2 workspaces...
[SUCCESS] Monorepo successfully scaffolded and linked.
```

### 💠 The "Surgical Scaffold" (`apps/demo.wbc-ui.com -d`)
**Live Context:** A UX designer wants to run the `demo.wbc-ui.com` app locally but doesn't want to accidentally delete their existing configuration.
**Command Executed:** `/wbSetup apps/demo.wbc-ui.com -d`
**Live Output:**
```text
> Command: /wbSetup apps/demo.wbc-ui.com -d

[SYSTEM] Executing Dry-Run Scaffolding for demo app...
[DRY-RUN] Target: apps/demo.wbc-ui.com.
[DRY-RUN] Step 1: Detect existing `.env.local` (Found. Skipping overwrite).
[DRY-RUN] Step 2: Execute `npm install` (Local scope only).
[SUCCESS] Dry-run complete. Safe to execute.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Missing .env.example | **[PASS]** `demo.wbc-ui.com` requires no complex env setup. | Scaffolding proceeds. |
| Port Conflict | **[PASS]** Vite dev server running on port 5173. Setup does not trigger boot scripts automatically. | Safe to execute setup. |
| Clean Flag Danger | **[PASS]** Developer confirms `-c` usage. | Aggressive wipe executes. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

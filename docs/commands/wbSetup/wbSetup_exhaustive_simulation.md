# wb-flow Protocol: /wbSetup Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbSetup` command. It serves as the definitive reference for how the agent bootstraps local development environments, installs dependencies, populates `.env` files, and seeds databases.

---

## 1. Role & Definition Matrix
**Role:** The Environment Bootstrapper & Scaffolding Agent
**Target:** Prepares a raw repository clone or specific package for active development.
**Core Protocol:** Strict "Idempotency". The agent must be able to run `/wbSetup` multiple times without breaking an existing, working environment. It checks for existing `.env` files and existing databases before overwriting.

| Scenario | System Behavior |
|---|---|
| Target is Monorepo Root | **[PROCEED]** Executes massive `npm ci` or `npm install`. Uses workspaces. Sets up monorepo-wide symlinks. |
| Target is Sub-Package | **[PROCEED]** Bootstraps only the specific package (dependencies and `.env` clones). |
| Missing Template | **[HALT]** Protocol forbids creating `.env` files from thin air. Must clone from `.env.example` or prompt user for secure injection. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbSetup` is path-sensitive, executing different bootstrapping logic based on the target depth.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific Package | `Command: /wbSetup apps/wbc-ui.com` | Locks onto `wbc-ui.com`. | Runs `npm install` locally. Clones `.env.example` to `.env.local`. |
| Directory Path | `Command: /wbSetup .` | Analyzes CWD. | Scaffolds the current folder. |
| Comma-Separated | `Command: /wbSetup packages/core,apps/ui` | Parses multiple scopes. | Bootstraps both the core library and the UI consumer. |
| Workspace Glob | `Command: /wbSetup apps/*` | Extracts all consumer apps. | Massive parallel installation of dependencies for all frontend applications. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--clean` | `-c` | Destructively deletes `node_modules` and `package-lock.json` before installing. | `Command: /wbSetup . -c` | `[CLEAN] Purged node_modules. Initiating fresh install.` |
| `--seed` | `-s` | Triggers database seeding scripts after dependency installation. | `Command: /wbSetup . -s` | `[SEED] Pushing dummy data to local PostgreSQL instance.` |
| `--env` | `-e` | Forces `.env` regeneration, overwriting existing local variables. | `Command: /wbSetup . -e` | `[ENV] Warning: Overwrote .env.local with fresh .env.example template.` |
| `--dry-run` | `-d` | Lists the bootstrapping steps that would be taken without executing them. | `Command: /wbSetup . -d` | `[DRY-RUN] Would run 'npm i', copy .env, and seed DB. Disk untouched.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Monorepo Reset" (`. -c -e -s`)
**Context:** A developer is switching to a new complex epic. Their local environment is broken. They want to completely nuke the environment and rebuild it from scratch, including database seeds.
**Command Executed:** `/wbSetup . -c -e -s`
**Simulated Protocol Chain:**
1. Validates execution at monorepo root.
2. Engages `-c` (Clean): Deletes all nested `node_modules` and lockfiles.
3. Engages `-e` (Env): Re-clones all `.env.example` files across the monorepo.
4. Executes massive `npm install` across all workspaces.
5. Engages `-s` (Seed): Runs global database seeding script.
**Simulated Output:**
```markdown
> Command: /wbSetup . -c -e -s

[SYSTEM] Initiating Massive Monorepo Reset...
[CLEAN] Purged 14 node_modules directories.
[ENV] Reset 3 .env.local files to match .env.example.
[INSTALL] Running npm install (Workspace Mode)... Done.
[SEED] Injecting 500 dummy rows into local DB.
[SUCCESS] Monorepo scaffolded. Ready for /wbWork.
```

### 💠 The "Surgical Scaffold" (`apps/md.wbc-ui.com -d`)
**Context:** A new backend developer only needs to boot up the mobile UI to test their API. They want to see what steps are required before actually running it.
**Command Executed:** `/wbSetup apps/md.wbc-ui.com -d`
**Simulated Output:**
```markdown
> Command: /wbSetup apps/md.wbc-ui.com -d

[SYSTEM] Executing Dry-Run Scaffolding...
[DRY-RUN] Target: apps/md.wbc-ui.com.
[DRY-RUN] Step 1: Execute `npm install` locally.
[DRY-RUN] Step 2: Copy `.env.example` -> `.env.local`.
[DRY-RUN] Step 3: Prompt user for `VITE_API_TOKEN`.
[SUCCESS] Dry-run complete. Run without -d to execute.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Missing .env.example | User runs `/wbSetup` on an app with no template. | `⚠️ Warning: No .env.example found. Creating empty .env file.` |
| Port Conflict | Seed script fails because PostgreSQL is not running. | `❌ Error: Database connection refused. Ensure local Docker is running.` |
| Clean Flag Danger | User runs `-c` but has unsaved work in `node_modules` (bad practice). | `⚠️ Warning: node_modules wiped. Any manual library edits are lost.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

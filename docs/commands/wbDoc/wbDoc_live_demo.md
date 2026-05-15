# wb-flow Protocol: /wbDoc Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbDoc` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Status: `WBC.js` lacks comprehensive JSDoc strings for its massive monolith structure. `src/utils/` files are undocumented.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Logic File | **[ACTIVE]** System is primed to inject JSDoc into `WBC.js` and `tierEnforcement.js`. |
| Target is Directory | **[ACTIVE]** Ready to aggregate exported types to generate `wb-core/README.md`. |
| Target is API Route | **[INACTIVE]** `wb-core` does not contain Express/Fastify routes for Swagger generation. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific Logic File | `Command: /wbDoc src/tierEnforcement.js` | Locks onto file. | `[PROCEED] Injecting JSDoc above JWT validation methods.` |
| Directory Path | `Command: /wbDoc .` | Analyzes `wb-core` exports. | `[PROCEED] Rewriting packages/wb-core/README.md with active types.` |
| Comma-Separated | `Command: /wbDoc src/WBC.js,src/utils/renderString.js` | Correlates both files. | `[PROCEED] Documenting monolith and utility cross-references.` |
| Wildcard Glob | `Command: /wbDoc src/**/*.js` | Sweeps all 14 files. | `[PROCEED] Massive JSDoc boilerplate injection.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--format="<type>"`| `Command: /wbDoc src/ -f="readme"` | `[FORMAT] Skipping JSDoc injection. Outputting only README.md.` |
| `--strict` | `Command: /wbDoc src/utils/renderString.js -s` | `[STRICT] Failed. regex match output type is loosely defined.` |
| `--dry-run` | `Command: /wbDoc src/WBC.js -d` | `[DRY-RUN] Proposed 150 lines of JSDoc. Disk untouched.` |
| `--sync` | `Command: /wbDoc src/tierEnforcement.js -S` | `[SYNC] JSDoc matches AST perfectly. No changes made.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Massive Directory Documentation" (`src/**/*.js -f="readme" -S`)
**Live Context:** A developer wants to update the `wb-core` `README.md` to reflect the new JWT and Regex logic without touching the actual source code files.
**Command Executed:** `/wbDoc src/**/*.js -f="readme" -S`
**Live Output:**
```text
> Command: /wbDoc src/**/*.js -f="readme" -S

[SYSTEM] Initiating Directory Documentation Sync...
[AST] Parsed exports for 14 files in wb-core.
[FORMAT] Engaging Markdown extraction matrix.
[SYNC] Detected 2 new exports (JWT, renderString).
[SUCCESS] Updated packages/wb-core/README.md with new API table.
```

### 💠 The "Strict Boilerplate Injector" (`src/utils/*.js -f="jsdoc" -s`)
**Live Context:** Running this *right now* to ensure the utilities folder meets the team's strict TypeScript/JSDoc standards before a PR merge.
**Command Executed:** `/wbDoc src/utils/*.js -f="jsdoc" -s`
**Live Output:**
```text
> Command: /wbDoc src/utils/*.js -f="jsdoc" -s

[SYSTEM] Scanning utility files in wb-core for missing JSDoc...
[FORMAT] Injecting JSDoc boilerplate into renderString.js...
[STRICT] Analyzing type inferences...
[ERROR] Strict Mode Failed in renderString.js line 45.
[REMEDY] AST cannot confidently infer return type of custom regex wrapper. Explicit cast required.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Comment Collision | **[PASS]** Legacy `WBC.js` comments detected. | `-S` flag triggers safe merge instead of overwrite. |
| Unparseable Logic | **[PASS]** `wb-core` uses standard ES6 modules. No dynamic `eval()` detected. | AST parses cleanly. |
| Bad Format | **[TRIGGERED]** If user attempts `-f="swagger"` on `wb-core`. | `⚠️ Warning: No HTTP routes detected. Swagger generation aborted.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

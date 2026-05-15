# wb-flow Protocol: /wbClean Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbClean` command. It serves as the definitive reference for how the agent executes aggressive codebase sanitization, removing dead code, orphaned assets, and lingering debug statements without altering logic.

---

## 1. Role & Definition Matrix
**Role:** The Janitor & Sanitization Agent
**Target:** Safely removes unused variables, dead imports, orphaned CSS classes, and `console.log` traces.
**Core Protocol:** Strict adherence to AST validation. The agent must guarantee that no executed code paths are severed during the cleaning process.

| Scenario | System Behavior |
|---|---|
| Target is Logic File | **[PROCEED]** Analyzes AST. Removes unused imports, variables, and comments marked `// REMOVE`. |
| Target is UI Component | **[PROCEED]** Cross-references HTML class names with CSS files. Removes unmapped CSS rules. |
| Code is Already Clean | **[PROCEED]** Scans silently and returns an "All Clear" validation without modifying the disk. |
| Target is `.wb/workflows/` | **[PROCEED]** Scans for stale report files older than 30 days with no inbound links. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbClean` uses aggressive targeting to ensure it doesn't accidentally purge dynamically generated assets.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbClean src/utils/auth.js` | Locks onto a single file for deep sanitization. | Removes 3 unused imports and 1 orphaned function. |
| Directory Path | `Command: /wbClean src/` | Scans the entire directory. | Sweeps directory for empty files, dead imports, and console logs. |
| Comma-Separated | `Command: /wbClean src/app.js,src/index.css` | Maps relationships between provided files. | Cleans orphaned CSS classes specifically not used in `app.js`. |
| Wildcard Glob | `Command: /wbClean **/*.log` | Identifies all `.log` files in the workspace. | Purges 15 local server log files. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--logs` | `-l` | Targets strictly debugging traces (e.g., `console.log`, `debugger`). | `Command: /wbClean src/ -l` | `[LOGS] Removed 42 console.log statements from src/.` |
| `--orphans` | `-o` | Targets strictly dead code (unused variables, uncalled functions). | `Command: /wbClean src/ -o` | `[ORPHANS] Removed 'const temp = null' from state.js.` |
| `--dry-run` | `-d` | Simulates the purge and outputs what *would* be deleted. | `Command: /wbClean src/ -d` | `[DRY-RUN] Would delete 3 unused CSS classes and 1 empty file.` |
| `--aggressive` | `-A` | Overrides safety checks. Deletes files that are not imported anywhere in the project tree. | `Command: /wbClean src/ -A` | `[AGGRESSIVE] Deleting src/old_utils.js (0 dependents found).` |
| `--stale` | `-s` | Targets workflow reports older than N days. | `Command: /wbClean .wb/ -s 30` | `[STALE] Found 12 reports older than 30 days. 4 have no inbound links.` |
| `--empty` | `-e` | Targets files with 0 bytes or only whitespace. | `Command: /wbClean src/ -e` | `[EMPTY] Deleted 3 empty files: config_old.js, temp.md, .keep` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Pre-Commit Janitor Sweep" (`src/ -l -o`)
**Context:** Developer is about to push code, but wants to make sure they didn't leave any messy debug statements or unused imports in the `src/` directory.
**Command Executed:** `/wbClean src/ -l -o`
**Simulated Protocol Chain:**
1. Parses AST for all files in `src/`.
2. Locates and strips 5 `console.log` nodes.
3. Locates and strips 2 `import { oldThing }` nodes.
4. Rewrites files safely.
**Simulated Output:**
```markdown
> Command: /wbClean src/ -l -o

[SYSTEM] Initiating Pre-Commit Janitor Sweep in src/.
[LOGS] Stripped 5 debugging statements.
[ORPHANS] Removed 2 unused import declarations.
[SUCCESS] Directory is clean and ready for /wbGit.
```

### 💠 The "Aggressive Orphan Hunt" (`packages/wb-core -A -d`)
**Context:** The codebase feels bloated. The user wants to see what files are completely dead/unreferenced, but wants to do a dry-run first before actually deleting them.
**Command Executed:** `/wbClean packages/wb-core -A -d`
**Simulated Output:**
```markdown
> Command: /wbClean packages/wb-core -A -d

[SYSTEM] Executing Aggressive Dependency Tree mapping...
[DRY-RUN] File: `src/legacy_tier.js` has 0 dependents.
[DRY-RUN] File: `src/utils/math_old.js` has 0 dependents.
[SUCCESS] Dry-run complete. 2 files flagged for deletion. Run without -d to purge.
```

### 💠 The "Stale Report Cleanup" (`.wb/ -s 14 -d`)
**Context:** The `.wb/workflows/reports/` tree has accumulated months of daily audit, plan, and standup files. The user wants to prune reports older than 14 days that have no inbound links from active plans.
**Command Executed:** `/wbClean .wb/ -s 14 -d`
**Simulated Output:**
```markdown
> Command: /wbClean .wb/ -s 14 -d

[SYSTEM] Scanning .wb/workflows/reports/ for stale files...
[STALE] 23 files older than 14 days found.
[LINK-CHECK] 7 have active inbound links from plan tables — KEPT.
[DRY-RUN] 16 files would be deleted (combined: 84KB).
[SUCCESS] Dry-run complete. Run without -d to purge.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Dynamic Imports | File is not statically imported, but dynamically imported via `import()`. | `⚠️ Warning: Skipping file deletion. Dynamic import path detected nearby.` |
| CSS Interactivity | CSS class is toggled via JS string concatenation, not explicit strings. | `⚠️ Warning: Cannot guarantee CSS class is orphaned. Skipping deletion.` |
| Aggressive Misfire | User runs `-A` on the entrypoint file (`index.js`). | `❌ Error: Cannot delete entrypoint file. Execution halted.` |
| Empty `.gitkeep` | File is 0 bytes but named `.gitkeep`. | `⚠️ Warning: Skipping .gitkeep — these are intentional directory markers.` |
| Circular Dependencies | File A imports B, B imports A, neither is used elsewhere. | `⚠️ Warning: Circular dependency island detected (A ↔ B). Flagged for manual review.` |
| Protected Paths | User targets `node_modules/`, `.git/`, or `package-lock.json`. | `❌ Error: Protected path. /wbClean refuses to operate on vendor or VCS directories.` |

---

## 6. Flag Conflict Resolution Matrix

When multiple flags are combined, conflicts are resolved left-to-right with these precedence rules:

| Combination | Behavior | Rationale |
|---|---|---|
| `-A -d` | Dry-run wins — aggressive scan runs but no deletions occur. | Safety: dry-run is always an override. |
| `-l -o` | Both execute — logs AND orphans are cleaned in a single pass. | Additive: these target different code categories. |
| `-A -e` | Aggressive subsumes empty — all unreferenced files are deleted, including empty ones. | Aggressive is a superset of empty. |
| `-s -o` | Both execute — stale reports AND orphan code are cleaned. | Independent: they target different file types. |
| `-d` alone | No modifications — scan-only mode with a summary report. | Dry-run is a read-only operation by definition. |
| `-A` without scope | `❌ Error: Aggressive mode requires an explicit scope. Refusing to scan the entire monorepo.` | Safety: prevents accidental mass deletion. |

---

## 7. Cross-Reference Table

| Related Command | Relationship to `/wbClean` |
|---|---|
| `/wbAudit` | Run `/wbAudit` first to identify what needs cleaning. `/wbClean` acts on audit findings. |
| `/wbRefactor` | `/wbClean` removes dead code; `/wbRefactor` restructures live code. They are complementary but never overlap. |
| `/wbGit` | Run `/wbClean` before `/wbGit` to ensure only meaningful changes are committed. |
| `/wbValid` | After `/wbClean`, run `/wbValid` to verify that no live code paths were severed. |
| `/wbTest` | `/wbClean` does not run tests. Always run `/wbTest` after aggressive cleaning to catch regressions. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

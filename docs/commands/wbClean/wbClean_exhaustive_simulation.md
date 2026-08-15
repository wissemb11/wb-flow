# /wbClean — Exhaustive Simulation ()

`/wbClean` is the janitor. Its job is **surface-level mess removal**: dead imports, unused vars, trailing whitespace, stray `console.log`, orphaned files. Compared to `/wbRefactor` (structural surgery) it operates one level shallower — it doesn't change shape, it removes what's clearly debris.

Read this if you want to know what counts as "clearly debris" (vs "potentially load-bearing"), why `/wbClean` has no flags, and where cleanup ends and refactor begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Janitor — remove debris without changing structure or behavior. |
| **Target** | A file, a comma-separated set, or a directory (which `/wbRefactor` refuses but `/wbClean` accepts at scale). |
| **Cell scope** | None. |
| **Side effects allowed** | Removing unused imports/vars; removing `console.log`/`debugger`; trimming trailing whitespace; removing orphaned files (with confirmation). |
| **Side effects forbidden** | Changing function signatures; renaming exports; reorganizing files; touching test files (cleanup of tests is its own concern). |

The "no signature changes" rule is the contract with `/wbRefactor`: if cleanup *would* change a function's signature, it's not cleanup, it's refactor. The two commands stay in their lanes; they're chained, not merged.

`/wbClean` differs from `/wbRefactor` in one key respect: it accepts **directory targets** because cleanup scales naturally across files (every file gets the same checks). Refactor does not, because structural changes are file-specific.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbClean` does |
|---|---|---|
| Single file | `Command: /wbClean src/WBC.js` | Pass over one file. Most precise. |
| Comma-separated | `Command: /wbClean src/WBC.js,src/renderString.js` | Both files; report per-file. |
| Directory | `Command: /wbClean core2/packages/wb-core/src/` | Walks the directory; reports per-file. |
| Glob | `Command: /wbClean "core2/packages/*/src/**/*.js"` | Cross-package cleanup. Larger; may produce many small no-op files in the report. |
| Free-text | `Command: /wbClean "the auth code"` | Refused. Cleanup is path-required. |

---

## 3. Flag matrix

`/wbClean` has **no flags**. Every cleanup pass does the same set of checks; there's no profile to filter, no severity to pick. The flag-free design says: cleanup is simple, predictable, and safe by default.

### What `/wbClean` checks for

A fixed checklist applied to every file:

| Category | What gets removed |
|---|---|
| Dead imports | Imports with no reference in the file. |
| Dead vars | `const`/`let` declarations with no read after declaration. |
| Console statements | `console.log`, `console.debug`, `console.warn` not part of intentional logging (heuristic: line has comment "intentional log" → keep). |
| Debugger statements | `debugger;` always removed. |
| Trailing whitespace | Per-line. |
| Orphan trailing newlines | Multiple blank lines collapse to single. |
| Orphan files | `.bak`, `.orig`, `.tmp`, `.old`, `.swp` extensions removed (with confirmation). |

What `/wbClean` does **not** touch:
- Code in comments (might be intentional reference).
- Type-only imports in `.ts` files (type checker may need them).
- Test files (cleanup of tests is `/wbWork` against a test-improvement row).
- Files inside `node_modules`, `dist*`, `.git`.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbCleanSimPipelines = [
  {
    "title": "The \"after refactor\" cleanup",
    "cmd": "/wbClean core2/packages/wb-core/src/tierEnforcement.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: tierEnforcement.js",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading file (post-refactor: 78 lines, was 87)...",
        "type": "gen"
      },
      {
        "text": "[FINDINGS]",
        "type": "gen"
      },
      {
        "text": "- line 4: import { legacyVerify } from './deprecated.js' \u2014 unused.",
        "type": "gen"
      },
      {
        "text": "- line 31: const _debug = false \u2014 never read.",
        "type": "gen"
      },
      {
        "text": "- line 47: console.log('tier check entered', tier) \u2014 no \"intentional\"",
        "type": "gen"
      },
      {
        "text": "marker; treating as debug debris.",
        "type": "gen"
      },
      {
        "text": "- 12 lines have trailing whitespace.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Apply 4 cleanups? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] tierEnforcement.js cleaned.",
        "type": "gen"
      },
      {
        "text": "Removed: 1 unused import, 1 unused var, 1 console.log,",
        "type": "gen"
      },
      {
        "text": "12 trailing-whitespace fixes.",
        "type": "gen"
      },
      {
        "text": "[TEST] All tests pass.",
        "type": "gen"
      },
      {
        "text": "[OK] Cleanup complete. File now 75 lines.",
        "type": "ok"
      }
    ],
    "note": "Right after `/wbRefactor` completes, the touched files often have small debris (a now-unused import, a logging statement that was useful during the refactor). `/wbClean` is the natural next step:",
    "noteType": "info"
  },
  {
    "title": "The directory pass",
    "cmd": "/wbClean core2/packages/wb-core/src/",
    "logs": [
      {
        "text": "[SYSTEM] Walking directory...",
        "type": "sys"
      },
      {
        "text": "[SCAN] 14 files inspected (excluded: tests/, dist*, node_modules).",
        "type": "gen"
      },
      {
        "text": "[FINDINGS by file]",
        "type": "gen"
      },
      {
        "text": "src/index.js: clean.",
        "type": "gen"
      },
      {
        "text": "src/WBC.js: 1 dead import.",
        "type": "gen"
      },
      {
        "text": "src/WBCParser.js: clean.",
        "type": "gen"
      },
      {
        "text": "src/components/WBCode.vue: 1 console.log, 3 trailing whitespace.",
        "type": "gen"
      },
      {
        "text": "src/components/WBCodeSlot.vue: clean.",
        "type": "gen"
      },
      {
        "text": "src/renderString.js: 1 dead var.",
        "type": "gen"
      },
      {
        "text": "src/tierEnforcement.js: clean (cleaned this morning).",
        "type": "gen"
      },
      {
        "text": "... (8 more, mostly clean)",
        "type": "gen"
      },
      {
        "text": "[SUMMARY] 5 files have findings; 9 are clean. Total: 6 changes.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Apply all? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] 5 files updated.",
        "type": "gen"
      },
      {
        "text": "[TEST] All tests pass.",
        "type": "gen"
      },
      {
        "text": "[OK] Cleanup complete across directory.",
        "type": "ok"
      }
    ],
    "note": "A weekly/monthly cleanup ritual across a package:",
    "noteType": "info"
  },
  {
    "title": "The \"orphan file\" prompt",
    "cmd": "/wbClean core2/packages/wb-core/",
    "logs": [
      {
        "text": "[SYSTEM] Walking package root + subdirectories...",
        "type": "sys"
      },
      {
        "text": "[SCAN] ...",
        "type": "gen"
      },
      {
        "text": "[ORPHAN FILES DETECTED]",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-core/src/WBC.js.bak (147KB, modified 6 days ago)",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-core/src/old_render.js.orig (3KB, modified 2 weeks ago)",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Remove these 2 orphan files?",
        "type": "gen"
      },
      {
        "text": "(Both have backup extensions; not referenced in any imports.)",
        "type": "gen"
      },
      {
        "text": "[y/N] >",
        "type": "gen"
      },
      {
        "text": "# Worth showing what happens at \"n\":",
        "type": "gen"
      },
      {
        "text": "> n",
        "type": "gen"
      },
      {
        "text": "[NOTICE] Orphans preserved. Re-run /wbClean to revisit.",
        "type": "gen"
      },
      {
        "text": "[OK] In-file cleanups still applied.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbClean" titleSuffix="Exhaustive Simulation" :pipelines="wbCleanSimPipelines" />


### 💠 Pipeline The "after refactor" cleanup

Right after `/wbRefactor` completes, the touched files often have small debris (a now-unused import, a logging statement that was useful during the refactor). `/wbClean` is the natural next step:


### 💠 Pipeline The directory pass

A weekly/monthly cleanup ritual across a package:


### 💠 Pipeline The "orphan file" prompt

---

## 5. Edge cases & refusals

| Trigger | What `/wbClean` does |
|---|---|
| No target | Halt. `❌ Provide a file, comma-separated list, or directory.` |
| Free-text target | Halt. `❌ Cleanup is path-required.` |
| Empty file | Cleanup is a no-op; reports "nothing to clean." |
| File where every "cleanup" would change behavior | Refuse the change. Cleanup is behavior-preserving by definition. |
| Console statement with "intentional" comment | Kept. |
| Type-only import in `.ts` file | Kept. The type checker may need it. |
| Tests fail post-cleanup | Auto-revert. Surface which check caused the regression for next pass. |
| Target in `dist*` or `node_modules` | Skip silently. |
| Test files in target | Skip with one-line notice. Cleanup of tests is its own work. |
| `--profile`, `--scope`, or any flag attempted | Halt. `/wbClean` has no flags. |

The pattern: **`/wbClean` is debris removal — small, safe, predictable, behavior-preserving.** Fixed checklist, no flags, accepts directories, refuses free-text. It pairs with `/wbRefactor` (cleanup before refactor for a clean diff; cleanup after refactor to remove debris). Where the boundary blurs (does this change a signature? does it touch a test?), `/wbClean` defers — staying narrow is the discipline that makes the command trustworthy.

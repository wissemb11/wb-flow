# /wbClean — Live Demo ()

What `/wbClean` would actually do on `wb-labs` right now. The candidate targets and likely findings below reflect the live workspace.

---

<CommandLiveDemoAnimation command="wbClean" />

## 1. Live target

| Field | Live value |
|---|---|
| Most-touched code package this session | None — current session is documentation work |
| Most-likely-to-have-debris package | `core2/packages/wbc-ui2-cdn/` (per memory: cache-loader still referenced post-restructure, untested apps may have stale logging) |
| Memory-safe target | `core2/packages/wb-core/` (active package, tests in place) |
| Documentation cleanup | `frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/` — but `/wbClean` is for code, not docs. Refuse. |
| Generated-file zones | `dist/`, `dist-dev/`, `node_modules/` — always skipped |

The interesting case is the second row: cleanup on `wbc-ui2-cdn/` is *constrained* by the parked tech debt. The agent will clean within-file debris (orphan imports, console.logs) but will NOT remove anything that would interact with the dist-folder mismatch.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbClean core2/packages/wb-core/src/` | Full directory pass. Likely small findings. |
| `/wbClean core2/packages/wbc-ui2-cdn/` | Allowed but cautious: would clean within-file debris while NOT touching anything related to the parked dist mismatch (e.g., would not "clean up" the unused `dist/` reference in package.json — that's the parked decision). |
| `/wbClean frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/` | Refuse — documentation, not code. |
| `/wbClean core2/packages/wbc-ui2-cdn/vite.config.js` | Cleans within-file debris. The unused `cacheLoader` import (per memory) would be a finding. |
| `/wbClean "the WBC stuff"` | Refuse — free-text. |
| `/wbClean core2/` | Permitted but large; would walk all packages. Would refuse to act on parked-package internals beyond surface debris. |

---

## 3. Per-input behavior, applied live

| Input shape | Live behavior |
|---|---|
| Single file | Standard cleanup pass. |
| Directory | Walks; reports per-file. |
| Cross-package glob | Same; possibly larger report. |
| Parked-tech-debt package | Memory-aware: cleans within-file debris only. Refuses anything that touches the parked decision surface. |
| Documentation target | Refuse with suggestion to use a different tool. |

---

## 4. Pipelines

<script setup>
const wbCleanPipelines = [
  {
    "title": "Cleanup pass on wb-core (the natural target)",
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
        "text": "src/WBC.js: clean.",
        "type": "gen"
      },
      {
        "text": "src/components/WBCode.vue: clean.",
        "type": "gen"
      },
      {
        "text": "src/components/WBCodeSlot.vue: clean.",
        "type": "gen"
      },
      {
        "text": "src/tierEnforcement.js: clean.",
        "type": "gen"
      },
      {
        "text": "src/renderString.js: clean.",
        "type": "gen"
      },
      {
        "text": "... (8 more, all clean)",
        "type": "gen"
      },
      {
        "text": "[SUMMARY] 0 findings. Package is clean.",
        "type": "gen"
      },
      {
        "text": "[OK] No changes needed.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Memory-aware cleanup of wbc-ui2-cdn",
    "cmd": "/wbClean core2/packages/wbc-ui2-cdn/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wbc-ui2-cdn/",
        "type": "sys"
      },
      {
        "text": "[CONTEXT] Memory: project_pkg_dist_mismatch.md (parked dist-folder issue),",
        "type": "ctx"
      },
      {
        "text": "wbc-ui2-tech-debt.md (cache-loader still referenced).",
        "type": "gen"
      },
      {
        "text": "[CAUTION] Will clean within-file debris but NOT touch anything",
        "type": "gen"
      },
      {
        "text": "interacting with parked decisions.",
        "type": "gen"
      },
      {
        "text": "[SCAN] 12 files inspected.",
        "type": "gen"
      },
      {
        "text": "[FINDINGS]",
        "type": "gen"
      },
      {
        "text": "vite.config.js:",
        "type": "gen"
      },
      {
        "text": "- line 31: import { cacheLoader } from 'cache-loader' \u2014 unused.",
        "type": "gen"
      },
      {
        "text": "[MEMORY MATCH] wbc-ui2-tech-debt.md flags this as restructure",
        "type": "gen"
      },
      {
        "text": "cleanup candidate. Memory does NOT mark it as parked. Safe to remove.",
        "type": "gen"
      },
      {
        "text": "index.js: clean.",
        "type": "gen"
      },
      {
        "text": "README.md: not a cleanup target (docs).",
        "type": "gen"
      },
      {
        "text": "[NOT TOUCHED]",
        "type": "gen"
      },
      {
        "text": "package.json: line 6 (main: \"./dist/index.js\") \u2014 this is the PARKED",
        "type": "gen"
      },
      {
        "text": "dist-folder mismatch per memory. Even though \"main\" pointing at a",
        "type": "gen"
      },
      {
        "text": "non-existent dir would normally be a cleanup candidate, /wbClean",
        "type": "gen"
      },
      {
        "text": "refuses to touch it. The parked decision needs an architectural",
        "type": "gen"
      },
      {
        "text": "conversation, not a cleanup pass.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Apply 1 cleanup (remove unused cacheLoader import)? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] vite.config.js: removed unused import.",
        "type": "gen"
      },
      {
        "text": "[TEST] No test runner configured for this package (per memory). Skipped.",
        "type": "gen"
      },
      {
        "text": "[OK] 1 cleanup applied. Parked items preserved.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Refuse cleanup on docs",
    "cmd": "/wbClean frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/",
    "logs": [
      {
        "text": "[REFUSE] Target is documentation, not code.",
        "type": "error"
      },
      {
        "text": "[REASON] /wbClean's checks (dead imports, console.log removal,",
        "type": "gen"
      },
      {
        "text": "debugger statements) don't apply to .md files.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST]",
        "type": "gen"
      },
      {
        "text": "- Markdown lint or formatting: outside this command system.",
        "type": "gen"
      },
      {
        "text": "- Doc structural review: /wbReview frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/",
        "type": "gen"
      },
      {
        "text": "- Doc voice consistency: /wbReview --plan if the transmission spec",
        "type": "gen"
      },
      {
        "text": "plan is in place.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Orphan file confirmation",
    "cmd": "/wbClean core2/packages/wb-core/src/",
    "logs": [
      {
        "text": "[SCAN] 14 files inspected.",
        "type": "gen"
      },
      {
        "text": "[ORPHAN FILES]",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-core/src/WBC.js.bak (modified 4 days ago, 8KB)",
        "type": "gen"
      },
      {
        "text": "[FINDINGS] 0 in-file findings.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Remove orphan file WBC.js.bak?",
        "type": "gen"
      },
      {
        "text": "(It has a backup extension; not referenced in any imports.)",
        "type": "gen"
      },
      {
        "text": "[y/N] >",
        "type": "gen"
      },
      {
        "text": "# At \"n\":",
        "type": "gen"
      },
      {
        "text": "> n",
        "type": "gen"
      },
      {
        "text": "[NOTICE] Orphan preserved. /wbClean exits 0.",
        "type": "gen"
      },
      {
        "text": "[OK] No in-file cleanups needed; orphan kept per user request.",
        "type": "ok"
      }
    ],
    "note": "A hypothetical wb-core scenario where a `.bak` file accumulated:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbClean" :pipelines="wbCleanPipelines" />


### 💠 Pipeline Cleanup pass on wb-core (the natural target)


### 💠 Pipeline Memory-aware cleanup of wbc-ui2-cdn


### 💠 Pipeline Refuse cleanup on docs


### 💠 Pipeline Orphan file confirmation

A hypothetical wb-core scenario where a `.bak` file accumulated:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbClean` (no target) | Halt. |
| `/wbClean "the WBC code"` | Halt — free-text. |
| `/wbClean frontEnd/wbc-ui/core2/packages/wb-flow/templates/` | Refuse — documentation. |
| `/wbClean core2/packages/wbc-ui2-cdn/package.json` (asking to clean the parked-mismatch field) | Refuse — memory says parked. Suggests architectural conversation. |
| `/wbClean core2/packages/wb-core/tests/` | Skip with notice — test-file cleanup is `/wbWork` against a test-improvement row. |
| `/wbClean --profile="aggressive"` | Halt — `/wbClean` has no flags. |
| `/wbClean` directory pass that would auto-revert all changes due to test failure | Auto-revert all edits in the affected files. Reports which file's tests regressed. |

The pattern: **`/wbClean` is debris removal with strong scope discipline.** Fixed checklist, no flags, behavior-preserving by definition. Memory-aware enough to skip parked items even when they look like cleanup candidates. Refuses documentation, refuses free-text, refuses to touch tests. The healthy state is "0 findings" — when `/wbClean` consistently finds debris, the underlying signal is about commit hygiene, not about the command.

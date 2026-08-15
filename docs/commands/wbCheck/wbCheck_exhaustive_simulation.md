# /wbCheck — Exhaustive Simulation ()

`/wbCheck` is the static analyzer. It validates code health (types, signatures) and documentation integrity (broken links, spelling, schema adherence) without executing anything. The hard distinction: `/wbAudit` finds **logic and security flaws** (dynamic analysis), `/wbValid` runs **CI tests** (dynamic execution), `/wbCheck` verifies **syntactic and referential contracts** (purely static). No code runs. No tests execute.

Read this if you want to know which analysis engine fires per file type, what `--fix` can and cannot auto-correct, and why link checking is a first-class feature for a monorepo with 50+ markdown files.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Static Analyzer & Compliance Checker. |
| **Target** | Source code (type checking), markdown (link checking, grammar), JSON/config (schema validation). |
| **Cell scope** | None. `/wbCheck` is purely diagnostic. |
| **Side effects allowed** | With `--fix`: auto-correcting trivial errors (typos, basic type casts). |
| **Side effects forbidden** | Modifying execution logic, running tests, altering plan state. |

The "purely static" constraint means `/wbCheck` can run on any commit, any branch, any state — it doesn't need a running environment, installed dependencies, or a valid build. Compare to `/wbValid` which needs the test suite to execute, or `/wbAudit` which reads runtime behavior.

---

## 2. Argument resolution

The analysis engine is auto-selected by file extension:

| Form | Example | Engine fired |
|---|---|---|
| `.js`/`.ts` file | `Command: /wbCheck src/WBC.js` | Type checker — JSDoc/TypeScript type validation. |
| `.md` file | `Command: /wbCheck docs/readme.md` | Link checker + grammar engine. |
| `.json` file | `Command: /wbCheck tsconfig.json` | Schema validator. |
| Directory | `Command: /wbCheck src/` | Type checker on all `.js`/`.ts` files. |
| Glob | `Command: /wbCheck **/*.md` | Link checker across the entire doc tree. |

The engine selection is deterministic — no guessing. A `.js` file always gets type checking; a `.md` file always gets link checking. To override (e.g., grammar check on a `.js` file's comments), use the flag to force.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--fix` | `-f` | Auto-corrects trivial errors (typos, basic type casts). |

**`--fix` limitations.** Auto-fix handles:
- ✅ Spelling corrections in markdown
- ✅ Simple type widening (`string | undefined` when a param is optional)
- ❌ Ambiguous type inference (won't guess between `number` and `string`)
- ❌ Broken link rewiring (can't know where the file moved to)
- ❌ Logic-level type errors (won't cast `any` to a specific type)

When `--fix` can't resolve an error, it leaves it in place with a `⚠️ Manual fix required` annotation. The principle: **auto-fix is conservative.** A wrong auto-fix is worse than no fix.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbCheckSimPipelines = [
  {
    "title": "Documentation integrity sweep for frontEnd/wbc-ui/core2/packages/wb-flow/templates",
    "cmd": "/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/**/*.md -l -g",
    "logs": [
      {
        "text": "[SYSTEM] Initiating Documentation Integrity Sweep...",
        "type": "sys"
      },
      {
        "text": "[RESOLVE] 54 markdown files found.",
        "type": "gen"
      },
      {
        "text": "[LINKS] Extracting URLs...",
        "type": "gen"
      },
      {
        "text": "[LINKS] Scanned 412 internal links, 23 external URLs.",
        "type": "gen"
      },
      {
        "text": "\u2705 398 internal links resolve correctly.",
        "type": "gen"
      },
      {
        "text": "\u274c 12 broken internal links:",
        "type": "gen"
      },
      {
        "text": "- docs/commands/wbBroadcast/wbBroadcast_practical.md \u2192 file not found",
        "type": "gen"
      },
      {
        "text": "- commands/wbWork/wbWork_examples.md \u2192 moved to docs/",
        "type": "gen"
      },
      {
        "text": "...",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f 2 external URLs returned non-200:",
        "type": "gen"
      },
      {
        "text": "- https://github.com/wbc-ui2/issues/402 \u2192 404 (issue was closed/deleted)",
        "type": "gen"
      },
      {
        "text": "[GRAMMAR] Scanning 54 files (82,000 words)...",
        "type": "gen"
      },
      {
        "text": "\u274c 6 typos found:",
        "type": "gen"
      },
      {
        "text": "- wbTrack_template.md:L145 \u2014 \"seperately\" \u2192 \"separately\"",
        "type": "gen"
      },
      {
        "text": "- wbActOn_template.md:L89 \u2014 \"occured\" \u2192 \"occurred\"",
        "type": "gen"
      },
      {
        "text": "...",
        "type": "gen"
      },
      {
        "text": "[REPORT] 12 broken links, 6 typos. Run with -f to auto-fix typos.",
        "type": "gen"
      }
    ],
    "note": "The `frontEnd/wbc-ui/core2/packages/wb-flow/templates/` directory has 50+ markdown files with extensive cross-linking. After the v4 documentation overhaul, verify nothing is broken:",
    "noteType": "info"
  },
  {
    "title": "Strict type gate on wb-core source",
    "cmd": "/wbCheck core2/packages/wb-core/src/**/*.js -t",
    "logs": [
      {
        "text": "[SYSTEM] Engaging Static Type Analyzer...",
        "type": "sys"
      },
      {
        "text": "[AST] Scanning 18 files for JSDoc type contracts...",
        "type": "gen"
      },
      {
        "text": "[REPORT]",
        "type": "gen"
      },
      {
        "text": "| File | Line | Issue |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| renderString.js | L12 | Parameter `input` in escapeHTML() implicitly has 'any' type |",
        "type": "sys"
      },
      {
        "text": "| renderString.js | L34 | Function renderTemplate() lacks @returns annotation |",
        "type": "sys"
      },
      {
        "text": "| WBC.events.js | L8 | Parameter `handler` typed as Function \u2014 consider narrowing to EventHandler |",
        "type": "sys"
      },
      {
        "text": "[SUMMARY] 3 type violations across 2 files. 16 files are clean.",
        "type": "gen"
      }
    ],
    "note": "The team is migrating from vanilla JS to JSDoc-typed JS. Report all remaining loose types:",
    "noteType": "info"
  },
  {
    "title": "Auto-fix typos after grammar check",
    "cmd": "/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/**/*.md -g -f",
    "logs": [
      {
        "text": "[SYSTEM] Grammar check with auto-fix...",
        "type": "sys"
      },
      {
        "text": "[SCAN] 54 files, 82,000 words.",
        "type": "gen"
      },
      {
        "text": "[FIX] Auto-corrected 6 typos:",
        "type": "gen"
      },
      {
        "text": "\u2705 wbTrack_template.md:L145 \u2014 \"seperately\" \u2192 \"separately\"",
        "type": "gen"
      },
      {
        "text": "\u2705 wbActOn_template.md:L89 \u2014 \"occured\" \u2192 \"occurred\"",
        "type": "gen"
      },
      {
        "text": "\u2705 wbStandup_template.md:L22 \u2014 \"recommand\" \u2192 \"recommend\"",
        "type": "gen"
      },
      {
        "text": "\u2705 wbExplain_exhaustive.md:L67 \u2014 \"absraction\" \u2192 \"abstraction\"",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f wbPlan_template.md:L200 \u2014 \"dependancy\" \u2192 ambiguous (dependency/dependance). Manual fix required.",
        "type": "gen"
      },
      {
        "text": "\u2705 wbValid_live_demo.md:L45 \u2014 \"verifiy\" \u2192 \"verify\"",
        "type": "gen"
      },
      {
        "text": "[RESULT] 5 auto-fixed, 1 requires manual review. Files saved.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbCheck" titleSuffix="Exhaustive Simulation" :pipelines="wbCheckSimPipelines" />


### 💠 Pipeline Documentation integrity sweep for frontEnd/wbc-ui/core2/packages/wb-flow/templates

The `frontEnd/wbc-ui/core2/packages/wb-flow/templates/` directory has 50+ markdown files with extensive cross-linking. After the v4 documentation overhaul, verify nothing is broken:


### 💠 Pipeline Strict type gate on wb-core source

The team is migrating from vanilla JS to JSDoc-typed JS. Report all remaining loose types:


### 💠 Pipeline Auto-fix typos after grammar check

---

## 5. Edge cases & refusals

| Trigger | What `/wbCheck` does |
|---|---|
| `--fix` on an ambiguous type error | `⚠️ Cannot auto-fix implicit 'any' in processToken(). Manual casting required.` |
| Empty directory (no files match glob) | `ℹ️ No files found matching pattern. Nothing to check.` |

The unifying principle: **`/wbCheck` is the integrity layer.** It answers "is the codebase internally consistent?" — do the types match, do the links resolve, is the spelling correct? It's the static complement to `/wbAudit` (dynamic logic) and `/wbValid` (dynamic tests). All three can run on the same codebase and find different classes of problems.

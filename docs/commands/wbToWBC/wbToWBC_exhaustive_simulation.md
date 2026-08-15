# /wbToWBC — Exhaustive Simulation ()

`/wbToWBC` is the architectural translator. It takes generic code (standard Vue/React, raw CSS, native hooks) and converts it into `wbc-ui.com` compliant code — proprietary imports from `@wbc-ui2/wb-core`, WBC design tokens, and ecosystem-specific patterns. The central principle: **framework adherence without logic alteration.** The agent rewrites the *how* (imports, hooks, tokens) without changing the *what* (business logic, data flow, user-facing behavior).

Read this if you want to know what "WBC-compliant" means in practice, and where the boundary sits between translating a framework layer and rewriting business logic.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Pattern Enforcer. Converts generic code to WBC ecosystem patterns. |
| **Target** | Component files (`.vue`, `.jsx`), stylesheets (`.css`), utility files (`.js`). |
| **Cell scope** | None. `/wbToWBC` doesn't interact with plans. |
| **Side effects allowed** | Rewriting imports, swapping hooks, replacing CSS values, updating component exports. |
| **Side effects forbidden** | Changing business logic, altering data flow, modifying test assertions. |

The distinction from `/wbRefactor`: `/wbRefactor` improves code quality within the same framework. `/wbToWBC` changes the framework while preserving behavior. You refactor *after* migration — never during.

---

## 2. Argument resolution

| Form | Example | What `/wbToWBC` does |
|---|---|---|
| Specific file | `Command: /wbToWBC src/components/Button.vue` | Rewrites to use `@wbc-ui2/wb-core` base classes and design tokens. |
| Directory path | `Command: /wbToWBC src/legacy/` | Mass-migrates the entire directory. |
| Comma-separated | `Command: /wbToWBC src/Auth.js,src/Login.js` | Migrates both to use `useWbcAuth()` hook. |
| Wildcard glob | `Command: /wbToWBC **/*.css` | CSS-only sweep: replaces hardcoded colors with `var(--wbc-*)` tokens. |

---

## 3. Flag matrix

`/wbToWBC` declares no flags of its own beyond the universal `-h` / `--help`. The
target is positional — a file, a component, or a directory — and the migration
mode is inferred from what the target contains.

Patterns with no WBC equivalent are left intact with a comment
(`// TODO: No WBC equivalent for indexedDB. Manual migration required.`) rather
than dropped, so a partial migration is always visible in the diff.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbToWBCSimPipelines = [
  {
    "title": "Migrate a generic Vue dashboard to WBC",
    "cmd": "/wbToWBC core2/packages/wb-dataviewer/src/legacy/GenericDashboard.vue -h -c",
    "logs": [
      {
        "text": "[SYSTEM] Full migration: hooks + CSS.",
        "type": "sys"
      },
      {
        "text": "[AST] Parsed: 1 component, 4 composables, 12 CSS rules.",
        "type": "gen"
      },
      {
        "text": "[CSS TRANSLATION]",
        "type": "gen"
      },
      {
        "text": "#FF5722 \u2192 var(--wbc-accent)",
        "type": "gen"
      },
      {
        "text": "#333333 \u2192 var(--wbc-text-primary)",
        "type": "gen"
      },
      {
        "text": "16px \u2192 var(--wbc-spacing-md)",
        "type": "gen"
      },
      {
        "text": "border-radius: 8px \u2192 var(--wbc-radius-lg)",
        "type": "gen"
      },
      {
        "text": "12 rules translated.",
        "type": "gen"
      },
      {
        "text": "[HOOK MIGRATION]",
        "type": "gen"
      },
      {
        "text": "import { ref, onMounted } from 'vue'",
        "type": "gen"
      },
      {
        "text": "\u2192 import { useWbcState, useWbcLifecycle } from '@wbc-ui2/wb-core'",
        "type": "gen"
      },
      {
        "text": "const data = ref(null)",
        "type": "gen"
      },
      {
        "text": "\u2192 const data = useWbcState(null)",
        "type": "gen"
      },
      {
        "text": "onMounted(() => fetchData())",
        "type": "gen"
      },
      {
        "text": "\u2192 useWbcLifecycle('mount', () => fetchData())",
        "type": "gen"
      },
      {
        "text": "[IMPORTS]",
        "type": "gen"
      },
      {
        "text": "+ import { useWbcState, useWbcLifecycle } from '@wbc-ui2/wb-core'",
        "type": "gen"
      },
      {
        "text": "- import { ref, onMounted } from 'vue'",
        "type": "gen"
      },
      {
        "text": "[OK] GenericDashboard.vue is now WBC-compliant.",
        "type": "ok"
      },
      {
        "text": "Business logic unchanged. 4 composables migrated, 12 CSS rules translated.",
        "type": "gen"
      }
    ],
    "note": "A developer copy-pasted a generic open-source dashboard. Convert it to WBC conventions:",
    "noteType": "info"
  },
  {
    "title": "CSS-only sweep across the monorepo",
    "cmd": "/wbToWBC core2/packages/wb-dataviewer/src/**/*.css -c",
    "logs": [
      {
        "text": "[SYSTEM] CSS-only migration across 8 files.",
        "type": "sys"
      },
      {
        "text": "[TRANSLATE]",
        "type": "gen"
      },
      {
        "text": "| File | Replacements | Before \u2192 After |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| DataGrid.css | 6 | #FF0000 \u2192 var(--wbc-error), #00FF00 \u2192 var(--wbc-success), ... |",
        "type": "sys"
      },
      {
        "text": "| ExportPanel.css | 3 | hardcoded spacing \u2192 var(--wbc-spacing-*) |",
        "type": "sys"
      },
      {
        "text": "| ThemeToggle.css | 2 | #1A1A1A \u2192 var(--wbc-bg-dark), #FAFAFA \u2192 var(--wbc-bg-light) |",
        "type": "sys"
      },
      {
        "text": "| ... | ... | ... |",
        "type": "sys"
      },
      {
        "text": "[SUMMARY] 24 replacements across 8 files. All colors and spacing now use WBC tokens.",
        "type": "gen"
      }
    ],
    "note": "Before a theming overhaul, convert all hardcoded colors to design tokens:",
    "noteType": "info"
  },
  {
    "title": "Strict audit of a legacy folder",
    "cmd": "/wbToWBC core2/packages/wb-dataviewer/src/legacy/ -s -d",
    "logs": [
      {
        "text": "[SYSTEM] Strict mode + dry-run.",
        "type": "sys"
      },
      {
        "text": "[AST] Scanning 6 files in legacy/...",
        "type": "gen"
      },
      {
        "text": "[STRICT] \u274c Migration cannot complete.",
        "type": "gen"
      },
      {
        "text": "customCanvas.js:L34 \u2014 raw DOM manipulation (Canvas API). No WBC wrapper exists.",
        "type": "gen"
      },
      {
        "text": "socketHandler.js:L12 \u2014 native WebSocket. WBC uses a different transport layer.",
        "type": "gen"
      },
      {
        "text": "[DRY-RUN] Would migrate 4/6 files. 2 files require manual intervention.",
        "type": "warn"
      },
      {
        "text": "[HALT] Strict mode: incomplete migration. Fix Canvas and WebSocket usage first.",
        "type": "gen"
      }
    ],
    "note": "Can the legacy folder be fully migrated without manual intervention?",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbToWBC" titleSuffix="Exhaustive Simulation" :pipelines="wbToWBCSimPipelines" />


### 💠 Pipeline Migrate a generic Vue dashboard to WBC

A developer copy-pasted a generic open-source dashboard. Convert it to WBC conventions:


### 💠 Pipeline CSS-only sweep across the monorepo

Before a theming overhaul, convert all hardcoded colors to design tokens:


### 💠 Pipeline Strict audit of a legacy folder

Can the legacy folder be fully migrated without manual intervention?

---

## 5. Edge cases & refusals

| Trigger | What `/wbToWBC` does |
|---|---|
| Code is already WBC-compliant | Scans silently. `ℹ️ All patterns are already WBC-compliant. No changes needed.` |
| Unrecognized third-party library | `⚠️ Cannot translate 'lodash.debounce'. Left intact. Consider: @wbc-ui2/wb-core/utils/debounce.` |
| React code in a Vue monorepo | `⚠️ React hooks detected in a Vue ecosystem. /wbToWBC converts to WBC patterns, not between frameworks. Use /wbRefactor for framework migration.` |
| Version mismatch (old Vue 2 syntax) | `❌ Component uses Vue 2 Options API. WBC requires Composition API (Vue 3+). Migrate to Vue 3 first.` |
| CSS is minified/obfuscated | `⚠️ Cannot parse minified CSS. Run a CSS formatter first, then retry.` |

The unifying principle: **`/wbToWBC` migrates the framework layer while preserving the business layer.** It's the bridge from "generic code that works" to "WBC-compliant code that works the same way but uses ecosystem patterns." The migration is always behavior-preserving — if the component rendered a table before, it renders the same table after, just with WBC hooks and design tokens instead of generic ones.

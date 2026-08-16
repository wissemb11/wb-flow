# /wbToWBC — Live Demo ()

This is what `/wbToWBC` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](wbToWBC_exhaustive_simulation.md), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbToWBC" />

## 1. Live target

| Field | Live value |
|---|---|
| Target package | `core2/packages/wb-dataviewer` |
| WBC core library | `@wbc-ui2/wb-core` — provides hooks, design tokens, tier enforcement |
| Legacy code | `src/legacy/` — 6 files, partially migrated |
| Design tokens | `var(--wbc-*)` system in wb-core, 42 token definitions |
| Known blockers | Canvas API in `customCanvas.js`, native WebSocket in `socketHandler.js` |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbToWBC packages/wb-dataviewer/src/legacy/ -d` | Dry-run: shows diff for 6 files, 4 fully migratable. |
| `/wbToWBC packages/wb-dataviewer/src/**/*.css -c` | CSS-only: ~24 color/spacing replacements across 8 stylesheets. |
| `/wbToWBC packages/wb-dataviewer/src/legacy/ -s` | Strict: would halt on Canvas API and WebSocket patterns. |
| `/wbToWBC packages/wb-dataviewer/src/legacy/GenericDashboard.vue -h -c` | Full migration of one component. |

---

## 3. Pipelines on this exact workspace

<script setup>
const wbToWBCPipelines = [
  {
    "title": "Migrate the dashboard component",
    "cmd": "/wbToWBC core2/packages/wb-dataviewer/src/legacy/GenericDashboard.vue -h -c",
    "logs": [
      {
        "text": "[SYSTEM] Full migration: hooks + CSS.",
        "type": "sys"
      },
      {
        "text": "[AST] 1 Vue component, 3 composables, 8 CSS rules.",
        "type": "gen"
      },
      {
        "text": "[CSS] 8 translations:",
        "type": "gen"
      },
      {
        "text": "#4CAF50 \u2192 var(--wbc-success)",
        "type": "gen"
      },
      {
        "text": "#F44336 \u2192 var(--wbc-error)",
        "type": "gen"
      },
      {
        "text": "24px \u2192 var(--wbc-spacing-lg)",
        "type": "gen"
      },
      {
        "text": "...",
        "type": "gen"
      },
      {
        "text": "[HOOKS]",
        "type": "gen"
      },
      {
        "text": "- import { ref, computed, onMounted } from 'vue'",
        "type": "gen"
      },
      {
        "text": "+ import { useWbcState, useWbcComputed, useWbcLifecycle } from '@wbc-ui2/wb-core'",
        "type": "gen"
      },
      {
        "text": "const items = ref([]) \u2192 const items = useWbcState([])",
        "type": "gen"
      },
      {
        "text": "const total = computed(() => ...) \u2192 const total = useWbcComputed(() => ...)",
        "type": "gen"
      },
      {
        "text": "onMounted(fetchData) \u2192 useWbcLifecycle('mount', fetchData)",
        "type": "gen"
      },
      {
        "text": "[OK] GenericDashboard.vue migrated. Business logic unchanged.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "CSS token sweep across wb-dataviewer",
    "cmd": "/wbToWBC core2/packages/wb-dataviewer/src/**/*.css -c",
    "logs": [
      {
        "text": "[SYSTEM] CSS-only sweep: 8 stylesheets.",
        "type": "sys"
      },
      {
        "text": "[REPORT]",
        "type": "gen"
      },
      {
        "text": "| File | Tokens Replaced | Examples |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| DataGrid.css | 6 | #FF0000\u2192var(--wbc-error), 8px\u2192var(--wbc-spacing-sm) |",
        "type": "gen"
      },
      {
        "text": "| ExportPanel.css | 4 | #2196F3\u2192var(--wbc-primary), 12px\u2192var(--wbc-spacing-md) |",
        "type": "gen"
      },
      {
        "text": "| ThemeToggle.css | 3 | #121212\u2192var(--wbc-bg-dark) |",
        "type": "gen"
      },
      {
        "text": "| apiResponse.css | 5 | border-radius:4px\u2192var(--wbc-radius-sm) |",
        "type": "gen"
      },
      {
        "text": "| ... | ... | ... |",
        "type": "gen"
      },
      {
        "text": "[SUMMARY] 24 replacements across 8 files. All hardcoded values now use WBC tokens.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Strict audit reveals migration blockers",
    "cmd": "/wbToWBC core2/packages/wb-dataviewer/src/legacy/ -s -d",
    "logs": [
      {
        "text": "[SYSTEM] Strict + dry-run on 6 files.",
        "type": "sys"
      },
      {
        "text": "[STRICT]",
        "type": "gen"
      },
      {
        "text": "\u2705 GenericDashboard.vue \u2014 fully migratable",
        "type": "gen"
      },
      {
        "text": "\u2705 FilterPanel.vue \u2014 fully migratable",
        "type": "gen"
      },
      {
        "text": "\u2705 DataTable.vue \u2014 fully migratable",
        "type": "gen"
      },
      {
        "text": "\u2705 SearchBar.vue \u2014 fully migratable",
        "type": "gen"
      },
      {
        "text": "\u274c customCanvas.js \u2014 Canvas API (no WBC equivalent)",
        "type": "gen"
      },
      {
        "text": "\u274c socketHandler.js \u2014 native WebSocket (WBC uses wbc-transport)",
        "type": "gen"
      },
      {
        "text": "[HALT] 4/6 files migratable. 2 require manual intervention.",
        "type": "gen"
      },
      {
        "text": "Suggestion: Migrate the 4 clean files first,",
        "type": "gen"
      },
      {
        "text": "then manually wrap Canvas and WebSocket with WBC compatibility layers.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbToWBC" :pipelines="wbToWBCPipelines" />


### 💠 Pipeline Migrate the dashboard component


### 💠 Pipeline CSS token sweep across wb-dataviewer


### 💠 Pipeline Strict audit reveals migration blockers

---

## 4. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbToWBC src/WBC.js` | `ℹ️ WBC.js is already wb-core's own code. Nothing to migrate.` |
| `/wbToWBC src/legacy/customCanvas.js -s` | `❌ Strict: Canvas API has no WBC equivalent. Manual migration required.` |
| `/wbToWBC src/**/*.min.css -c` | `⚠️ Cannot parse minified CSS. Run a formatter first.` |
| `/wbToWBC node_modules/**/*.js` | `❌ Cannot migrate third-party code. Migrate your source, not your dependencies.` |

The pattern: **`/wbToWBC` migrates the framework layer to WBC conventions while guaranteeing behavior preservation.** It's the bridge from generic to proprietary — CSS tokens, ecosystem hooks, WBC imports — without touching the business logic that makes the component work.

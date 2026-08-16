# /wbDoc — Live Demo ()

This is what `/wbDoc` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](wbDoc_exhaustive_simulation.md), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbDoc" />

## 1. Live target

| Field | Live value |
|---|---|
| Target package | `core2/packages/wb-core` |
| Key files needing docs | `src/WBC.js` (1200-line monolith — pre-decomposition), `src/tierEnforcement.js`, `src/renderString.js` |
| Existing JSDoc coverage | Partial — `tierEnforcement.js` has outdated `@param` names from a rename |
| README.md status | Exists but references the pre-decomposition file structure |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbDoc core2/packages/wb-core/src/tierEnforcement.js` | Injects/updates JSDoc for 3 exported functions. Fixes stale `userId` → `uuid` param. |
| `/wbDoc core2/packages/wb-core` | Updates `README.md` to reflect current exports. |
| `/wbDoc core2/packages/wb-core/src/WBC.js -S` | Sync: detects 5 functions with outdated JSDoc, updates params without touching descriptions. |
| `/wbDoc core2/packages/wb-core/src/*.js -s` | Strict: would fail on `renderString.js` (missing `@returns` on `escapeHTML`). |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbDoc src/tierEnforcement.js` | Overwrites existing JSDoc with fresh AST-derived blocks. |
| `/wbDoc src/tierEnforcement.js -S` | Sync: updates only changed params. Preserves hand-written `@description`. |
| `/wbDoc src/*.js -s` | `❌ Strict failed: renderString.js:escapeHTML() lacks @returns.` |
| `/wbDoc src/*.js -d` | Dry-run: previews all JSDoc changes without writing. |
| `/wbDoc packages/wb-core -f="readme"` | Forces README generation even though the directory has `.js` files. |

---

## 4. Pipelines

<script setup>
const wbDocPipelines = [
  {
    "title": "Document the post-decomposition modules",
    "cmd": "/wbDoc core2/packages/wb-core/src/WBC.core.js,src/WBC.events.js",
    "logs": [
      {
        "text": "[SYSTEM] Targeting 2 files.",
        "type": "sys"
      },
      {
        "text": "[AST] WBC.core.js: initWBC(), configureRuntime(), getWBCVersion(), WBCInstance class.",
        "type": "gen"
      },
      {
        "text": "[AST] WBC.events.js: delegateEvent(), removeDelegate(), getEventDelegates().",
        "type": "gen"
      },
      {
        "text": "[INJECT] WBC.core.js \u2014 4 JSDoc blocks:",
        "type": "gen"
      },
      {
        "text": "/**",
        "type": "gen"
      },
      {
        "text": "* Initializes the WBC runtime. Called once per page load.",
        "type": "gen"
      },
      {
        "text": "* @param {WBCConfig} config",
        "type": "gen"
      },
      {
        "text": "* @returns {WBCInstance}",
        "type": "gen"
      },
      {
        "text": "*/",
        "type": "gen"
      },
      {
        "text": "export function initWBC(config) { ... }",
        "type": "gen"
      },
      {
        "text": "[INJECT] WBC.events.js \u2014 3 JSDoc blocks.",
        "type": "gen"
      },
      {
        "text": "[CROSS-LINK] Shared type WBCInstance referenced in both files.",
        "type": "gen"
      },
      {
        "text": "[OK] 7 functions documented across 2 files.",
        "type": "ok"
      }
    ],
    "note": "After row 3 (WBC.js decomposition) is complete, the new modules need documentation:",
    "noteType": "info"
  },
  {
    "title": "Sync stale docs after a rename",
    "cmd": "/wbDoc core2/packages/wb-core/src/tierEnforcement.js -S",
    "logs": [
      {
        "text": "[SYSTEM] Sync mode: comparing JSDoc vs AST.",
        "type": "sys"
      },
      {
        "text": "[DIFF]",
        "type": "gen"
      },
      {
        "text": "validateJWT():",
        "type": "gen"
      },
      {
        "text": "@param userId \u2192 @param uuid (renamed in code)",
        "type": "gen"
      },
      {
        "text": "@description preserved: \"Validates JWT token integrity...\"",
        "type": "gen"
      },
      {
        "text": "enforceTokenScope():",
        "type": "gen"
      },
      {
        "text": "No changes \u2014 JSDoc matches AST.",
        "type": "gen"
      },
      {
        "text": "checkAlgorithm():",
        "type": "gen"
      },
      {
        "text": "NEW function \u2014 no JSDoc exists. Injecting fresh block.",
        "type": "gen"
      },
      {
        "text": "[SYNC] 2 changes:",
        "type": "gen"
      },
      {
        "text": "1. validateJWT() @param renamed",
        "type": "gen"
      },
      {
        "text": "2. checkAlgorithm() JSDoc block added",
        "type": "gen"
      },
      {
        "text": "[OK] Existing descriptions preserved. Only structural changes applied.",
        "type": "ok"
      }
    ],
    "note": "The `tierEnforcement.js` file had a parameter rename (`userId` \u2192 `uuid`) but the JSDoc wasn't updated:",
    "noteType": "info"
  },
  {
    "title": "README generation for the package",
    "cmd": "/wbDoc core2/packages/wb-core -f=\"readme\"",
    "logs": [
      {
        "text": "[SYSTEM] Generating README.md from package exports.",
        "type": "sys"
      },
      {
        "text": "[READ] package.json: name=\"@wbc-ui2/wb-core\", version, main, exports.",
        "type": "gen"
      },
      {
        "text": "[READ] src/index.js: re-exports from WBC.core.js, WBC.events.js, tierEnforcement.js, renderString.js.",
        "type": "gen"
      },
      {
        "text": "# @wbc-ui2/wb-core",
        "type": "gen"
      },
      {
        "text": "> Core runtime library for the wbc-ui2 ecosystem.",
        "type": "gen"
      },
      {
        "text": "## Exports",
        "type": "sys"
      },
      {
        "text": "| Module | Functions | Purpose |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| WBC.core | initWBC, configureRuntime, getWBCVersion | Runtime initialization |",
        "type": "gen"
      },
      {
        "text": "| WBC.events | delegateEvent, removeDelegate | Event delegation layer |",
        "type": "gen"
      },
      {
        "text": "| tierEnforcement | validateJWT, enforceTokenScope, checkAlgorithm | Access control |",
        "type": "gen"
      },
      {
        "text": "| renderString | escapeHTML, renderTemplate | Template rendering |",
        "type": "gen"
      },
      {
        "text": "## Usage",
        "type": "sys"
      },
      {
        "text": "...",
        "type": "gen"
      },
      {
        "text": "[WROTE] core2/packages/wb-core/README.md (updated)",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbDoc" :pipelines="wbDocPipelines" />


### 💠 Pipeline Document the post-decomposition modules

After row 3 (WBC.js decomposition) is complete, the new modules need documentation:


### 💠 Pipeline Sync stale docs after a rename

The `tierEnforcement.js` file had a parameter rename (`userId` → `uuid`) but the JSDoc wasn't updated:


### 💠 Pipeline README generation for the package

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbDoc package.json` | `⚠️ Cannot inject comments into JSON. Skipping.` |
| `/wbDoc src/*.js -s` | `❌ Strict failed. renderString.js:escapeHTML() has implicit return type.` |
| `/wbDoc src/WBC.js -f="swagger"` | `⚠️ WBC.js is not an API route file. Swagger format requires express/fastify routes. Falling back to jsdoc.` |
| `/wbDoc src/legacy/eval_loader.js` | `❌ AST cannot resolve dynamic exports (eval detected). Manual docs required.` |

The pattern: `/wbDoc` writes documentation **with the code's permission** — it reads the AST, respects what it finds, and injects or generates accordingly. It never guesses types, never hallucinates exports, and never modifies execution logic.

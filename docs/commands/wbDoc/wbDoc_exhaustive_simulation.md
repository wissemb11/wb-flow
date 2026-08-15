# /wbDoc — Exhaustive Simulation ()

`/wbDoc` is the technical writer. It reads code and produces documentation — JSDoc blocks, README files, API specs — without ever altering execution logic. The hard constraint: **signature preservation**. The agent injects comments and generates external files; it never touches a function body, return value, or import statement.

Read this if you want to know which output format the agent picks by default and where the boundary sits between `/wbDoc` (generates docs) and `/wbExplain` (generates explanations).

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Technical Writer. Translates code logic into standardized documentation formats. |
| **Target** | Source files (`.js`, `.ts`, `.vue`), directories, or API route files. |
| **Cell scope** | None. `/wbDoc` doesn't interact with plans. |
| **Side effects allowed** | Injecting JSDoc blocks into source files. Creating/updating README.md, swagger.yaml, .mdx files. |
| **Side effects forbidden** | Altering execution logic, renaming variables, changing imports, modifying function signatures. |

The distinction from `/wbExplain`: `/wbDoc` produces **persistent artifacts** (JSDoc in-file, README on disk). `/wbExplain` produces **ephemeral prose** (stdout, no disk writes). Use `/wbDoc` when you want the documentation to live with the code; use `/wbExplain` when you want a one-time understanding.

---

## 2. Argument resolution

| Form | Example | What `/wbDoc` does |
|---|---|---|
| Specific file | `Command: /wbDoc src/utils/auth.js` | Parses AST. Injects JSDoc blocks above every exported function/class. |
| Directory path | `Command: /wbDoc packages/wb-core` | Reads all `index.js` exports. Generates or updates `packages/wb-core/README.md`. |
| Comma-separated | `Command: /wbDoc src/WBC.js,src/tierEnforcement.js` | Documents both files. Cross-links their types where they share interfaces. |
| Wildcard glob | `Command: /wbDoc src/api/**/*.js` | Sweeps all route files. Generates a unified `swagger.json` or `openapi.yaml`. |

The format selection is automatic based on the target type:
- Single `.js`/`.ts` file → JSDoc injection
- Directory → README.md generation
- API route files → OpenAPI/Swagger spec
- Override any default with `--format`

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--format="<type>"` | `-f` | Forces output format: `jsdoc`, `readme`, `swagger`, `mdx`. Overrides auto-detection. |
| `--dry-run` | `-d` | Previews the documentation block without writing to disk. |
| `--sync` | `-S` | Checks if existing docs match the current AST and updates only what changed. |

**`--sync` vs default.** Without `--sync`, `/wbDoc` overwrites existing JSDoc blocks with fresh AST-derived versions. With `--sync`, it diffs the existing docs against the current AST and only updates what actually changed (renamed parameters, new return types, added functions). `--sync` is the safe mode for codebases with hand-tuned JSDoc.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbDocSimPipelines = [
  {
    "title": "JSDoc injection on wb-core's WBC.js",
    "cmd": "/wbDoc core2/packages/wb-core/src/WBC.core.js,src/WBC.events.js",
    "logs": [
      {
        "text": "[SYSTEM] Targeting 2 files for JSDoc injection.",
        "type": "sys"
      },
      {
        "text": "[AST] WBC.core.js: 4 exported functions, 1 class.",
        "type": "gen"
      },
      {
        "text": "[AST] WBC.events.js: 3 exported functions, 0 classes.",
        "type": "gen"
      },
      {
        "text": "[INJECT] WBC.core.js:",
        "type": "gen"
      },
      {
        "text": "/**",
        "type": "gen"
      },
      {
        "text": "* Initializes the WBC runtime environment.",
        "type": "gen"
      },
      {
        "text": "* @param {WBCConfig} config - Configuration object from wb-core settings.",
        "type": "gen"
      },
      {
        "text": "* @returns {WBCInstance} The initialized WBC instance.",
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
        "text": "[INJECT] WBC.events.js:",
        "type": "gen"
      },
      {
        "text": "/**",
        "type": "gen"
      },
      {
        "text": "* Registers a delegated event handler on the WBC container.",
        "type": "gen"
      },
      {
        "text": "* @param {string} eventType - DOM event name (e.g., 'click', 'input').",
        "type": "gen"
      },
      {
        "text": "* @param {string} selector - CSS selector for delegation target.",
        "type": "gen"
      },
      {
        "text": "* @param {Function} handler - Callback receiving the matched element.",
        "type": "gen"
      },
      {
        "text": "*/",
        "type": "gen"
      },
      {
        "text": "export function delegateEvent(eventType, selector, handler) { ... }",
        "type": "gen"
      },
      {
        "text": "[CROSS-LINK] WBC.core.js \u2192 WBC.events.js: shared WBCInstance type.",
        "type": "gen"
      },
      {
        "text": "[OK] JSDoc injected into 2 files. 7 functions documented.",
        "type": "ok"
      }
    ],
    "note": "After the WBC.js decomposition (row 3 in the current plan), the three new modules need documentation:",
    "noteType": "info"
  },
  {
    "title": "Strict mode on utility files before PR merge",
    "cmd": "/wbDoc core2/packages/wb-core/src/utils/*.js -f=\"jsdoc\" -s",
    "logs": [
      {
        "text": "[SYSTEM] Scanning utility files for JSDoc compliance...",
        "type": "sys"
      },
      {
        "text": "[AST] renderString.js: 2 exported functions.",
        "type": "gen"
      },
      {
        "text": "[AST] tierEnforcement.js: 3 exported functions.",
        "type": "gen"
      },
      {
        "text": "[STRICT] \u274c Failed.",
        "type": "gen"
      },
      {
        "text": "renderString.js:L12 \u2014 `escapeHTML(input)` \u2014 parameter `input` has no type annotation.",
        "type": "gen"
      },
      {
        "text": "tierEnforcement.js:L45 \u2014 `validateJWT()` \u2014 missing @returns annotation.",
        "type": "gen"
      },
      {
        "text": "[HALT] 2 violations. Fix type annotations before re-running.",
        "type": "gen"
      }
    ],
    "note": "Enforcing a JSDoc policy across all utility files:",
    "noteType": "info"
  },
  {
    "title": "Sync mode on existing documented code",
    "cmd": "/wbDoc core2/packages/wb-core/src/WBC.js -S",
    "logs": [
      {
        "text": "[SYSTEM] Sync mode: comparing existing JSDoc against current AST.",
        "type": "sys"
      },
      {
        "text": "[DIFF] WBC.js:",
        "type": "gen"
      },
      {
        "text": "- Parameter `userId` renamed to `uuid` in processToken().",
        "type": "gen"
      },
      {
        "text": "- New function `getEventDelegates()` added \u2014 no JSDoc exists.",
        "type": "gen"
      },
      {
        "text": "- Function `legacyInit()` removed \u2014 orphaned JSDoc block.",
        "type": "gen"
      },
      {
        "text": "[SYNC] Updated:",
        "type": "gen"
      },
      {
        "text": "1. processToken() @param: userId \u2192 uuid",
        "type": "gen"
      },
      {
        "text": "2. getEventDelegates() \u2014 new JSDoc block injected",
        "type": "gen"
      },
      {
        "text": "3. legacyInit() \u2014 orphaned JSDoc block removed",
        "type": "gen"
      },
      {
        "text": "[OK] 3 changes synced. Hand-tuned descriptions preserved.",
        "type": "ok"
      }
    ],
    "note": "The code changed but the JSDoc is stale:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbDoc" titleSuffix="Exhaustive Simulation" :pipelines="wbDocSimPipelines" />


### 💠 Pipeline JSDoc injection on wb-core's WBC.js

After the WBC.js decomposition (row 3 in the current plan), the three new modules need documentation:


### 💠 Pipeline Strict mode on utility files before PR merge

Enforcing a JSDoc policy across all utility files:


### 💠 Pipeline Sync mode on existing documented code

The code changed but the JSDoc is stale:

---

## 5. Edge cases & refusals

| Trigger | What `/wbDoc` does |
|---|---|
| File already has up-to-date JSDoc | No-op with `ℹ️ Documentation is current. No changes needed.` (unless `--sync` detects drift). |
| Heavy metaprogramming (`eval()`, dynamic proxies) | `❌ AST cannot resolve dynamic exports. Manual documentation required for <file>.` |
| `-f="xml"` (unsupported format) | `⚠️ XML not supported. Available formats: jsdoc, readme, swagger, mdx. Defaulting to jsdoc.` |
| JSON/config file target | `⚠️ Cannot inject comments into JSON format. Skipping <file>.json.` |
| Directory with no `index.js` | Scans all `.js` files for exports. README generation still works — it just won't have a single entry point to reference. |

The distinction worth naming: `/wbDoc` writes **to the code** (JSDoc) or **next to the code** (README, swagger). `/wbExplain` writes **about the code** (to stdout). `/wbCheck` verifies that what `/wbDoc` wrote is **still accurate** (link checking, type verification). Three commands, three roles, no overlap.

# /wbVision — Live Demo ()

This is what `/wbVision` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](./wbVision_exhaustive_simulation), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbVision" />

## 1. Live target

| Field | Live value |
|---|---|
| Target package | `core2/packages/wb-core` |
| Source files | 18 JS files in `src/` (post WBC.js decomposition) |
| Key modules | WBC.core.js, WBC.events.js, tierEnforcement.js, renderString.js |
| Import graph | index.js re-exports all modules. core imports events + tier. |
| Consumer apps | 3 apps import from wb-core: demo, md, wbc-ui |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbVision packages/wb-core/src/` | Dependency flowchart of 18 files, ~14 edges. Fits under 50-node limit. |
| `/wbVision packages/wb-core/src/ -d="1"` | Top-level only: index.js → 4 direct imports. |
| `/wbVision apps/demo.wbc-ui.com,packages/wb-core` | Cross-boundary: shows which wb-core exports demo actually uses. |
| `/wbVision packages/wb-core/src/tierEnforcement.js -t="sequence"` | Auth flow sequence diagram: validateJWT → checkAlgorithm → enforceTokenScope. |

---

## 3. Pipelines on this exact workspace

<script setup>
const wbVisionPipelines = [
  {
    "title": "Post-decomposition architecture map",
    "cmd": "/wbVision core2/packages/wb-core/src/ -d=\"2\" -o=\"reports/2026/05/05/vision/arch_wb-core_20260505.md\"",
    "logs": [
      {
        "text": "[SYSTEM] Tracing imports (depth: 2)...",
        "type": "sys"
      },
      {
        "text": "[AST] 18 files. 14 import edges.",
        "type": "gen"
      }
    ],
    "note": "The WBC.js monolith was split into 3 modules. Verify the new structure:",
    "noteType": "info"
  },
  {
    "title": "Consumer boundary analysis",
    "cmd": "/wbVision apps/demo.wbc-ui.com,packages/wb-core -t=\"flowchart\"",
    "logs": [
      {
        "text": "[SYSTEM] Cross-boundary analysis...",
        "type": "sys"
      },
      {
        "text": "[AST] demo: 12 component files. wb-core: 18 source files.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Sequence diagram for the JWT flow",
    "cmd": "/wbVision core2/packages/wb-core/src/tierEnforcement.js -t=\"sequence\"",
    "logs": [
      {
        "text": "[SYSTEM] Sequence diagram for tierEnforcement.js...",
        "type": "sys"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbVision" :pipelines="wbVisionPipelines" />


### 💠 Pipeline Post-decomposition architecture map

The WBC.js monolith was split into 3 modules. Verify the new structure:


### 💠 Pipeline Consumer boundary analysis


### 💠 Pipeline Sequence diagram for the JWT flow

---

## 4. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbVision core2/` (entire monorepo) | `❌ Graph too complex (~200 nodes). Use --depth=1 or scope to a specific package.` |
| `/wbVision packages/wb-core -t="er"` | `⚠️ No ORM models in wb-core. ER diagrams require Prisma/Mongoose schemas. Falling back to flowchart.` |
| `/wbVision packages/wb-core -r` (render to SVG) | Depends on headless browser availability. If missing: `⚠️ SVG render failed. Outputting raw Mermaid markdown.` |
| `/wbVision src/legacy/` where files don't import each other | `⚠️ 6 files, 0 import edges. Graph contains only orphaned nodes.` |

The pattern: **`/wbVision` draws what the code declares — every edge is a real import statement.** The post-decomposition diagram above proves the architecture is clean because the graph shows it, not because someone claims it. Visual proof > verbal assurance.

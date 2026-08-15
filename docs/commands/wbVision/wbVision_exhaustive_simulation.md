# /wbVision — Exhaustive Simulation ()

`/wbVision` is the systems cartographer. It transforms code structures (class hierarchies, component trees, API routes, dependency graphs) into visual architectural representations — primarily Mermaid.js diagrams. The hard constraint: **structural accuracy.** If two files don't explicitly import each other, no edge can be drawn between them. The agent traces real `import`/`require` statements, not inferred relationships.

Read this if you want to know which diagram types are supported, what `--depth` controls about the graph size, and why there's a 50-node hard limit.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Architect & Cartographer. Produces visual maps of code structure. |
| **Target** | Source directories, individual files, or ORM model files. |
| **Cell scope** | None. `/wbVision` is read-only. |
| **Side effects allowed** | Writing Mermaid markdown files. |
| **Side effects forbidden** | Modifying code, editing plans, altering imports. |

The "no inferred relationships" rule is what separates `/wbVision` from documentation tools that guess connections. If `WBC.core.js` doesn't explicitly import from `tierEnforcement.js`, no edge appears between them — even if they're in the same folder and logically related. The diagram shows what the code *declares*, not what a human might *assume*.

---

## 2. Argument resolution

| Form | Example | What `/wbVision` does |
|---|---|---|
| Specific file | `Command: /wbVision src/WBC.js` | Internal flowchart: methods, control flow, branching within the monolith. |
| Directory path | `Command: /wbVision packages/wb-core` | Component tree: how files in wb-core relate to each other via imports. |
| Comma-separated | `Command: /wbVision apps/demo,packages/wb-core` | Cross-boundary diagram: visualizes the consumer → library interface. |
| Wildcard glob | `Command: /wbVision src/**/*.js` | Full architectural map of the source directory. |

The comma-separated form is the highest-value use case. Visualizing `apps/demo,packages/wb-core` shows exactly which exports from wb-core are consumed by the demo app — the boundary crossing is the diagram's subject.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--type="<format>"` | `-t` | Forces diagram type: `flowchart`, `er`, `sequence`, `class`. |
| `--depth="<N>"` | `-d` | Limits recursive import tracing to N levels deep. |

**`--type` auto-detection.** Without `--type`, the diagram format is inferred from the target:
- Source directory → `flowchart` (dependency graph)
- ORM models → `er` (entity-relationship)
- API routes → `sequence` (request flow)
- Single class file → `class` (UML class diagram)

**`--depth` and the 50-node limit.** The hard limit exists to prevent browser-crashing diagrams. A monorepo with 200+ files produces a graph that's unreadable even if it renders. `--depth=2` is the sweet spot for most use cases — it shows the target and its immediate + second-degree dependencies without drowning in transitive imports.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbVisionSimPipelines = [
  {
    "title": "wb-core dependency graph after decomposition",
    "cmd": "/wbVision core2/packages/wb-core/src/ -d=\"2\" -o=\"arch_wb-core.md\"",
    "logs": [
      {
        "text": "[SYSTEM] Tracing imports (depth: 2)...",
        "type": "sys"
      },
      {
        "text": "[AST] 18 files parsed. 14 import relationships found.",
        "type": "gen"
      },
      {
        "text": "[GENERATE]",
        "type": "gen"
      }
    ],
    "note": "After the WBC.js decomposition, visualize how the new modules connect:",
    "noteType": "info"
  },
  {
    "title": "Consumer-library boundary crossing",
    "cmd": "/wbVision apps/demo.wbc-ui.com,packages/wb-core -t=\"flowchart\"",
    "logs": [
      {
        "text": "[SYSTEM] Cross-boundary analysis...",
        "type": "sys"
      },
      {
        "text": "[AST] demo: 12 files. wb-core: 18 files.",
        "type": "gen"
      },
      {
        "text": "[FILTER] Only showing edges that cross the boundary.",
        "type": "gen"
      }
    ],
    "note": "Visualize what demo.wbc-ui.com actually uses from wb-core:",
    "noteType": "info"
  },
  {
    "title": "API sequence diagram for the auth flow",
    "cmd": "/wbVision core2/packages/wb-core/src/tierEnforcement.js -t=\"sequence\"",
    "logs": [
      {
        "text": "[SYSTEM] Generating sequence diagram for tierEnforcement.js...",
        "type": "sys"
      },
      {
        "text": "[AST] 3 exported functions. Tracing call chains.",
        "type": "gen"
      }
    ],
    "note": "Visualize the request lifecycle for authentication:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbVision" titleSuffix="Exhaustive Simulation" :pipelines="wbVisionSimPipelines" />


### 💠 Pipeline wb-core dependency graph after decomposition

After the WBC.js decomposition, visualize how the new modules connect:


### 💠 Pipeline Consumer-library boundary crossing

Visualize what demo.wbc-ui.com actually uses from wb-core:


### 💠 Pipeline API sequence diagram for the auth flow

Visualize the request lifecycle for authentication:

---

## 5. Edge cases & refusals

| Trigger | What `/wbVision` does |
|---|---|
| AST identifies >50 nodes | `❌ Graph too complex (N nodes). Use --depth to reduce. Recommended: -d="2".` |
| Render fails (no headless browser) | `⚠️ SVG render failed. Outputting raw Mermaid markdown instead.` |
| Files in scope don't import each other | `⚠️ Graph contains orphaned nodes. No import relationships found between these files.` |
| Single file with no exports | Produces an internal flowchart of the file's control flow (if/else, loops, returns). |
| `-t="er"` on non-ORM files | `⚠️ No ORM models detected. ER diagram requires Prisma/Mongoose/Sequelize schemas. Falling back to flowchart.` |
| Circular imports detected | Renders the cycle with a highlighted edge: `A -->|circular| B`. Warns but doesn't halt. |

The unifying principle: **`/wbVision` draws what the code declares.** Every edge in the diagram traces to a real `import`/`require` statement or a real function call. No inferred, assumed, or hallucinated relationships. If the diagram looks sparse, it's because the code's coupling is actually sparse — and that's information worth having.

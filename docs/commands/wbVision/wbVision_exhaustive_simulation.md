# wb-flow Protocol: /wbVision Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbVision` command. It serves as the definitive reference for how the agent maps code architectures, visualizes database schemas, and generates interactive Mermaid.js diagrams.

---

## 1. Role & Definition Matrix
**Role:** The Systems Architect & Cartographer
**Target:** Transforms complex code structures (class hierarchies, component trees, API routing) into visual architectural representations.
**Core Protocol:** Strict "Structural Accuracy". The agent must never hallucinate relationships. If two files do not explicitly import each other, no edge can be drawn between them in the resulting diagram.

| Scenario | System Behavior |
|---|---|
| Target is Directory | **[PROCEED]** Analyzes ASTs of all files. Generates a Mermaid class/flow diagram showing the dependency graph. |
| Target is Database Schema | **[PROCEED]** Parses ORM models (Prisma/Mongoose/Sequelize) and outputs an Entity-Relationship (ER) diagram. |
| Codebase Too Large | **[HALT]** Protocol forbids rendering > 50 nodes in a single diagram to prevent browser crashing. Prompts user to reduce scope. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbVision` dynamically scales its rendering based on the directory depth provided.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific Logic File | `Command: /wbVision src/WBC.js` | Locks onto file. | Generates a flowchart of the internal methods and control flow within the monolith. |
| Directory Path | `Command: /wbVision packages/wb-core` | Analyzes all file imports. | Generates a Component Tree diagram showing how `wb-core` files relate to each other. |
| Comma-Separated | `Command: /wbVision apps/ui,packages/core` | Correlates two scopes. | Visualizes the boundary crossing between the consumer UI and the core library. |
| Wildcard Glob | `Command: /wbVision src/**/*.js` | Extracts massive AST data. | Compiles a highly detailed architectural map of the entire source folder. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--type="<format>"`| `-t` | Forces the diagram type (`flowchart`, `er`, `sequence`, `class`). | `Command: /wbVision src/api/ -t="sequence"` | `[TYPE] Rendering an API request sequence diagram.` |
| `--output="<path>"`| `-o` | Saves the raw Mermaid markup to a specific markdown file. | `Command: /wbVision src/ -o="arch.md"` | `[OUTPUT] Generated mermaid block and saved to arch.md.` |
| `--render` | `-r` | Attempts to compile the Mermaid string into a local `.svg` or `.png` file. | `Command: /wbVision src/ -r` | `[RENDER] Compiled graph. Saved to architecture.svg.` |
| `--depth="<N>"` | `-d` | Limits the recursive AST parsing to `N` levels deep to simplify the graph. | `Command: /wbVision apps/ -d="2"` | `[DEPTH] Stopped tracing dependencies at level 2.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive API Sequence Map" (`src/api -t="sequence" -o="api_spec.md"`)
**Context:** A new developer is confused about how the authentication flow works. The lead asks the agent to draw a sequence diagram mapping the backend routes.
**Command Executed:** `/wbVision src/api -t="sequence" -o="api_spec.md"`
**Simulated Protocol Chain:**
1. Parses AST for all controllers in `src/api`.
2. Traces execution from `POST /login` -> `AuthService` -> `Database`.
3. Engages Mermaid.js Sequence formatter (`-t`).
4. Writes output securely to the specified markdown file (`-o`).
**Simulated Output:**
```markdown
> Command: /wbVision src/api -t="sequence" -o="api_spec.md"

[SYSTEM] Initiating Architectural Vision...
[AST] Traced execution path for 14 API routes.
[TYPE] Formatting as Mermaid Sequence Diagram.
[OUTPUT] Writing 120 lines of markup to api_spec.md.
[SUCCESS] Architecture successfully mapped.
```

### 💠 The "High-Level Monorepo ERD" (`packages/wb-core -t="class" -r -d="1"`)
**Context:** Creating a presentation for stakeholders. Need a high-level, simplified class diagram of the core library saved as an image.
**Command Executed:** `/wbVision packages/wb-core -t="class" -r -d="1"`
**Simulated Output:**
```markdown
> Command: /wbVision packages/wb-core -t="class" -r -d="1"

[SYSTEM] Extracting High-Level Architecture (Depth 1)...
[AST] Parsed top-level exports only.
[TYPE] Formatting as Mermaid Class Diagram.
[RENDER] Compiling diagram via local headless browser...
[SUCCESS] Generated `architecture.svg`.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Node Overload | AST identifies 400+ distinct files/classes. | `❌ Error: Graph too complex (>50 nodes). Use -d flag to reduce depth.` |
| Render Failure | System lacks the headless browser required to compile `.svg`. | `⚠️ Warning: Local SVG render failed. Outputting raw Markdown instead.` |
| Unlinked Files | User scopes a folder where files do not import each other. | `⚠️ Warning: Graph contains orphaned nodes. No architectural relationships found.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wb-flow Protocol: /wbDoc Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbDoc` command. It serves as the definitive reference for how the agent generates inline JSDoc, updates README files, and produces API contracts from source code.

---

## 1. Role & Definition Matrix
**Role:** The Technical Writer & API Documenter
**Target:** Translates raw code logic into standardized documentation formats (JSDoc, Swagger/OpenAPI, Markdown).
**Core Protocol:** Strict "Signature Preservation". The agent must never alter the execution logic of the code it is documenting. It strictly injects comments or generates external `.md`/`.yaml` files.

| Scenario | System Behavior |
|---|---|
| Target is Logic File | **[PROCEED]** Analyzes AST. Injects JSDoc blocks above every exported function or class. |
| Target is Directory | **[PROCEED]** Reads all exported modules and generates a `README.md` summarizing the directory's purpose. |
| Target is API Route | **[PROCEED]** Parses express/fastify routes and outputs an `openapi.yaml` specification. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbDoc` relies on file types to determine the documentation format.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific Logic File | `Command: /wbDoc src/utils/auth.js` | Locks onto file. Parses AST. | Injects JSDoc strings directly into `auth.js`. |
| Directory Path | `Command: /wbDoc packages/wb-core` | Analyzes all `index.js` exports. | Generates or updates `packages/wb-core/README.md`. |
| Comma-Separated | `Command: /wbDoc src/WBC.js,src/tierEnforcement.js` | Correlates both files. | Generates JSDoc for both and links their types. |
| Wildcard Glob | `Command: /wbDoc src/api/**/*.js` | Sweeps all API routes. | Generates a unified `swagger.json` representing all endpoints. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--format="<type>"`| `-f` | Forces the output format (`jsdoc`, `readme`, `swagger`, `mdx`). | `Command: /wbDoc src/auth.js -f="mdx"` | `[FORMAT] Extracting auth.js logic into a separate auth.mdx file.` |
| `--strict` | `-s` | Aborts if any function is missing TypeScript or JSDoc type definitions. | `Command: /wbDoc src/ -s` | `[STRICT] Failed. Function processToken() lacks explicit return type.` |
| `--dry-run` | `-d` | Previews the documentation block without writing to disk. | `Command: /wbDoc src/WBC.js -d` | `[DRY-RUN] Proposed JSDoc for WBC class. Disk untouched.` |
| `--sync` | `-S` | Checks if existing documentation matches the current AST and updates only what changed. | `Command: /wbDoc src/ -S` | `[SYNC] Updated parameter 'userId' to 'uuid' in 3 JSDoc blocks.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive API Spec Generator" (`src/api/**/*.js -f="swagger" -S`)
**Context:** The backend team added 5 new endpoints. The tech lead wants to instantly update the `swagger.yaml` file to reflect the new payloads without overwriting the existing documented routes.
**Command Executed:** `/wbDoc src/api/**/*.js -f="swagger" -S`
**Simulated Protocol Chain:**
1. Resolves glob to 12 route files.
2. Parses Express AST for `req.body` and `res.send()`.
3. Reads existing `swagger.yaml` (`-S`).
4. Generates OpenAPI schema for the 5 new endpoints.
5. Injects the new paths into the YAML file safely.
**Simulated Output:**
```markdown
> Command: /wbDoc src/api/**/*.js -f="swagger" -S

[SYSTEM] Initiating OpenAPI Spec Generation...
[AST] Parsed 12 route files. Found 5 undocumented endpoints.
[FORMAT] Engaging Swagger/OpenAPI matrix.
[SYNC] Merging with existing swagger.yaml.
[SUCCESS] Spec updated. Run /wbDeploy to publish docs.
```

### 💠 The "Strict Boilerplate Injector" (`src/utils/*.js -f="jsdoc" -s`)
**Context:** Enforcing a strict JSDoc policy on all utility files before merging a PR.
**Command Executed:** `/wbDoc src/utils/*.js -f="jsdoc" -s`
**Simulated Output:**
```markdown
> Command: /wbDoc src/utils/*.js -f="jsdoc" -s

[SYSTEM] Scanning utility files for missing JSDoc...
[FORMAT] Injecting JSDoc boilerplate.
[STRICT] Analyzing type inferences...
[ERROR] Strict Mode Failed. `renderString(input)` has ambiguous type for 'input'.
[REMEDY] Please explicitly cast 'input' or use TypeScript.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Comment Collision | Function already has an outdated JSDoc block. | `⚠️ Warning: Outdated JSDoc detected. Overwriting with AST-derived types.` |
| Unparseable Logic | Heavy metaprogramming (e.g., `eval()`, dynamic proxies). | `❌ Error: AST cannot resolve dynamic exports. Manual documentation required.` |
| Bad Format | User requests `-f="xml"` (Unsupported). | `⚠️ Warning: XML not supported. Defaulting to Markdown.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

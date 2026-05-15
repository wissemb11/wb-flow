# wb-flow Protocol: /wbContext Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbContext` command within the `wb-flow` framework. It serves as the definitive reference for architectural traceability, contextual inference logic, and multi-agent synchronization protocols.

---

## 1. Role & Definition Matrix
**Role:** The Cartographer & Identity Manager
**Target:** Generates a comprehensive `context.md` file containing identity, dependencies, rules, and constraints for the target directory.
**Core Protocol:** `SmartContext Workflow System`

| Scenario | System Behavior |
|---|---|
| Target is Git Root | **[HALT]** The root `wb-labs` is too massive for a single context file. Protocol requires scoping to a specific package or app. |
| Target is Sub-Package | **[PROCEED]** Analyzes `package.json`, `src/`, `vite.config.js` to build an identity matrix. Creates `.wb/workflows/context.md`. |
| Context Already Exists | **[MERGE]** Applies Smart Merge Protocol. Enhances existing `context.md` without destroying manually added architectural rules. |

---

## 2. Argument Resolution Matrix
| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| No Argument | `Command: /wbContext` | Uses CWD. If CWD is a package, reads all local configuration files. | Generates a 200-line `context.md` detailing the package's role, tech stack, and API boundaries. |
| Directory Path | `Command: /wbContext packages/wb-dataviewer` | Scopes analysis strictly to the target folder. | Generates context specific to the data visualization components. |
| Deep Dive Request | `Command: /wbContext "Explain the caching layer"` | Activates "Focused Scope". | Creates `context_caching_2026.md` detailing only the Redis/LRU cache implementation. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

### Structural Flags
| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--focus="<topic>"` | `-f` | Deep dive on a specific topic instead of the whole folder. | `Command: /wbContext -f="State Management"` | `[FOCUSED] Generating context exclusively for 'State Management'.` |
| `--scope="<level>"` | `-s` | Sets the context depth: `local`, `focused`, or `global`. | `Command: /wbContext -s="global"` | `[SCOPE: GLOBAL] Mapping cross-package dependencies.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Architectural Deep Dive" (`-f="auth" -s="global"`)
**Context:** User needs to understand how Authentication works across the *entire* monorepo before planning an epic.
**Command Executed:** `/wbContext -f="auth" -s="global"`
**Simulated Protocol Chain:**
1. System reads `wb-core` auth utilities.
2. System traces imports to `wbc-ui.com` and `md.wbc-ui.com`.
3. Synthesizes a massive, global context report.
**Simulated Output:**
```markdown
> Command: /wbContext -f="auth" -s="global"

# Global Context: Authentication Architecture
- **Core Provider:** `wb-core/src/auth.js`
- **Consumers:** 
  - `wbc-ui.com`: Relies on JWT tokens.
  - `md.wbc-ui.com`: Uses session cookies.
- **Constraints:** Never store tokens in localStorage.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Simulated Protocol Resolution |
|---|---|---|
| Missing `package.json` | Cannot determine dependencies. | `⚠️ Warning: No package.json found. Inferring stack from file extensions.` |
| Read-Only Filesystem | Cannot write `.wb/workflows/context.md` | `❌ Error: Write permission denied. Context outputting to stdout only.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

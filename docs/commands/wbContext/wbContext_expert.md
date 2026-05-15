# wbContext — Expert Architecture

> Deep-dive into `/wbContext` internals: how it reads source code to generate accurate project identity files.

---

## 1. System Role

`/wbContext` is a **code-aware identity generator**. It reads actual source files (`package.json`, `src/index.js`, config files) to produce or update `context.md` — the foundational identity file that every other `/wb*` command depends on.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker (generative) |
| **Input** | Folder path |
| **Output** | `.wb/workflows/context.md` |
| **Mutates files** | Yes — creates or overwrites `context.md` |

---

## 2. Scope Levels

| Level | Flag | What It Reads | Output |
|---|---|---|---|
| **Local** (default) | `--scope=local` | `package.json`, `src/` structure, config files | Single-folder identity |
| **Focused** | `--scope=focused --focus=<topic>` | Deep-dive into one aspect (e.g., dependencies) | Enriched section in context.md |
| **Global** | `--scope=global` | All `context.md` files in the monorepo | Cross-package perspective |

---

## 3. Source Reading Pipeline

```
Folder path → package.json → src/ scan → config detection → Template rendering → context.md
```

| Stage | What It Extracts |
|---|---|
| `package.json` | Name, version, dependencies, scripts, type |
| `src/` scan | File count, directory structure, framework detection |
| Config files | Vue config, Vite config, ESLint, TypeScript settings |
| Template rendering | Fills the Identity/Dependencies/Goals/Rules/Conventions sections |

---

## 4. Framework Detection

| Signal | Detected As |
|---|---|
| `vue` in dependencies | Vue 2.x or 3.x (version-aware) |
| `vite.config.*` present | Vite build tool |
| `webpack.config.*` present | Webpack build tool |
| `tsconfig.json` present | TypeScript project |
| `vitest` in devDependencies | Vitest test runner |

---

## 5. Self-Correct Behavior

When `context.md` already exists, `/wbContext` enters update mode:
- Preserves manually-written `## Goals` and `## Rules` sections
- Updates machine-detectable fields (version, dependency list, file counts)
- Appends a `Last updated` timestamp

---

## 6. Relationship to Other Commands

| Command | How It Uses context.md |
|---|---|
| `/wbAudit` | Reads project identity for contextual analysis |
| `/wbPlan` | Uses goals and rules to prioritize tasks |
| `/wbWork` | Reads conventions to follow coding standards |
| `/wbGit` | Uses package name for commit scope |
| `/wbHelp` | Displays project-specific command suggestions |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

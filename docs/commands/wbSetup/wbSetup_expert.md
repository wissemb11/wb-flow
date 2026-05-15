# wbSetup — Expert Architecture

> How `/wbSetup` bootstraps a new project or package with wb-flow conventions.

---

## 1. System Role

`/wbSetup` is a **scaffolder**. It creates the initial project structure, installs dependencies, and generates configuration files following wb-flow and monorepo conventions.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker (generative) |
| **Input** | Target directory + project type |
| **Output** | Scaffolded project with `.wb/workflows/` |
| **Mutates files** | Yes — creates project structure |

---

## 2. Project Templates

| Template | Flag | Generates |
|---|---|---|
| **Vue 2 Component** | `--type=vue2-component` | Vue 2.7 component library scaffold |
| **Vue 2 App** | `--type=vue2-app` | Vue 2.7 application scaffold |
| **Node Library** | `--type=node-lib` | Node.js library with ESM/CJS |
| **Documentation** | `--type=docs` | Documentation site (VuePress or static) |
| **Bare** | `--type=bare` | Minimal `package.json` + `.wb/` only |

---

## 3. Setup Pipeline

```
Template selection → Directory creation → package.json → Source scaffold → .wb/ init → Context generation
```

| Stage | Creates |
|---|---|
| **Directory** | Project folder with `src/`, `tests/` |
| **package.json** | Name, version, dependencies, scripts |
| **Source** | Template files for the chosen project type |
| **.wb/ init** | `npx @wbc-ui2/wb-flow init` equivalent |
| **Context** | Auto-generates `context.md` from scaffolded project |

---

## 4. Monorepo Integration

When running inside a monorepo:

| Check | Action |
|---|---|
| Detect monorepo root | Read root `package.json` workspaces |
| Add to workspaces | Update root `package.json` if needed |
| Inherit conventions | Copy shared ESLint, TypeScript configs |
| Set tier | Assign tier based on dependency position |

---

## 5. Post-Setup Actions

After `/wbSetup` completes, the recommended workflow:

```bash
/wbSetup packages/my-new-lib --type=vue2-component
/wbContext packages/my-new-lib         # verify context
/wbAudit packages/my-new-lib          # baseline audit
/wbPlan packages/my-new-lib           # first development plan
```

---

## 6. What wbSetup Does NOT Do

| Action | Use Instead |
|---|---|
| Install npm dependencies | User runs `npm install` |
| Initialize git | User runs `git init` |
| Configure CI/CD | `/wbDeploy` |
| Create tests | `/wbWork` with test-related plan tasks |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

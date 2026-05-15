# wbSetup — Practical Walkthrough

> Step-by-step guide to scaffolding a new project with wb-flow conventions.

---

## 1. Create a Vue 2 Component Library

```bash
/wbSetup packages/my-component --type=vue2-component
```

```text
[AI] Creating packages/my-component/...
[AI]   ✓ package.json (@scope/my-component v0.1.0)
[AI]   ✓ src/index.js (entry point)
[AI]   ✓ src/MyComponent.vue (template component)
[AI]   ✓ vite.config.js (library build)
[AI]   ✓ .wb/workflows/ (context.md, dev.md)
[AI]
[AI] Next: npm install && /wbAudit packages/my-component
```

---

## 2. Create a Documentation Site

```bash
/wbSetup apps/my-docs --type=docs
```

Creates a static documentation structure ready for GitHub Pages deployment.

---

## 3. Bare Setup (wb-flow only)

```bash
/wbSetup packages/existing-lib --type=bare
```

Adds only `.wb/workflows/` to an existing project without modifying source files.

---

## 4. Post-Setup Workflow

```bash
/wbSetup packages/my-lib --type=node-lib    # 1. Scaffold
cd packages/my-lib && npm install            # 2. Install deps
/wbContext packages/my-lib                   # 3. Generate context
/wbAudit packages/my-lib                    # 4. Baseline audit
/wbPlan packages/my-lib                     # 5. First plan
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| New component | `/wbSetup packages/my-comp --type=vue2-component` |
| New library | `/wbSetup packages/my-lib --type=node-lib` |
| Add wb-flow to existing | `/wbSetup packages/existing --type=bare` |
| New docs site | `/wbSetup apps/my-docs --type=docs` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

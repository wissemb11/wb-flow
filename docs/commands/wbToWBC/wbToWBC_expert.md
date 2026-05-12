# wbToWBC — Expert Architecture

> How `/wbToWBC` converts standard components into WBC-compliant architecture.

---

## 1. System Role

`/wbToWBC` is a **migration assistant**. It analyzes existing Vue components and generates a migration plan to convert them into WBC (Web Component Core) compliant architecture.

| Property | Value |
|---|---|
| **Role** | 🧠 Planner + 🔨 Worker |
| **Input** | Component file or folder |
| **Output** | Migration plan + converted component files |
| **Mutates files** | Yes — creates converted copies |

---

## 2. WBC Standards

| Standard | Requirement |
|---|---|
| **Naming** | `WB` prefix for all components |
| **Props** | Typed with validators, documented |
| **Events** | Prefixed with component name |
| **Slots** | Named slots with fallback content |
| **Styling** | Scoped CSS, CSS custom properties |
| **Exports** | Named exports via `src/index.js` |

---

## 3. Migration Pipeline

```
Source scan → Standard check → Gap analysis → Migration plan → Code generation
```

| Stage | Action |
|---|---|
| **Scan** | Read component structure, props, events |
| **Check** | Compare against WBC standards |
| **Gaps** | List non-compliant patterns |
| **Plan** | Ordered migration steps |
| **Generate** | Produce converted component |

---

## 4. Conversion Rules

| Before | After |
|---|---|
| `MyTable.vue` | `WBTable.vue` |
| `props: ['data']` | `props: { data: { type: Array, required: true } }` |
| `$emit('change')` | `$emit('wb-table:change')` |
| `<style>` | `<style scoped>` |

---

## 5. Safety

| Guard | Description |
|---|---|
| Non-destructive | Creates new files, doesn't overwrite originals |
| Dry-run | Shows migration plan before executing |
| Incremental | Can migrate one component at a time |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

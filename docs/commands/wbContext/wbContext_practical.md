# wbContext — Practical Walkthrough

> Step-by-step guide to generating, updating, and customizing your project's `context.md`.

---

## 1. First-Time Generation

```bash
/wbContext packages/my-project
```

```text
[AI] Scanning packages/my-project/...
[AI]   Found package.json: @scope/my-project v1.0.0
[AI]   Framework: Vue 2.7 (detected from dependencies)
[AI]   Files: 47 source files across 8 directories
[AI]
[AI] Writing .wb/workflows/context.md
```

---

## 2. Reviewing the Output

Open `.wb/workflows/context.md` and verify:

| Section | Auto-generated? | Should You Edit? |
|---|---|---|
| `## Identity` | Yes (from package.json) | Rarely — correct if wrong |
| `## Dependencies` | Yes (from package.json) | No — auto-updated |
| `## Goals` | Partially (inferred) | **Yes** — add your actual goals |
| `## Rules` | Partially (from configs) | **Yes** — add team conventions |
| `## Conventions` | Yes (from code patterns) | Occasionally |

**The most valuable edit:** Write your own `## Goals` section. This directly influences `/wbPlan` task prioritization.

---

## 3. Updating After Changes

```bash
# After adding new dependencies or restructuring
/wbContext packages/my-project
```

The command preserves your manual edits to `## Goals` and `## Rules` while updating auto-detected fields.

---

## 4. Focused Context

For a deep-dive into one aspect:

```bash
/wbContext packages/my-project --scope=focused --focus=dependencies
```

This produces an enriched dependency analysis section with version constraints, peer deps, and upgrade recommendations.

---

## 5. Global Context

For a monorepo-wide perspective:

```bash
/wbContext . --scope=global
```

This reads all `context.md` files across the monorepo and produces a cross-package dependency map.

---

## 6. Common Patterns

| Pattern | Command |
|---|---|
| First-time setup | `/wbContext .` |
| After refactoring | `/wbContext .` (updates structure) |
| Before planning | `/wbContext .` then `/wbPlan .` |
| Dependency audit | `/wbContext . --scope=focused --focus=dependencies` |
| Monorepo overview | `/wbContext . --scope=global` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

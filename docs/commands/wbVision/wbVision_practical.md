# wbVision — Practical Walkthrough

> How to generate product vision documents and roadmaps.

---

## 1. Generate a Product Vision

```bash
/wbVision packages/my-lib
```

```text
[AI] ## Vision: my-lib
[AI]
[AI] Mission: Provide reusable Vue 2.7 components for data visualization
[AI] Audience: Frontend developers in enterprise settings
[AI]
[AI] Roadmap:
[AI]   Phase 1: Core table and chart components (current)
[AI]   Phase 2: Advanced filtering and export
[AI]   Phase 3: Real-time data streaming
```

---

## 2. Feature Roadmap

```bash
/wbVision packages/my-lib --type=roadmap
```

Produces a prioritized feature list with estimated timelines.

---

## 3. Competitive Analysis

```bash
/wbVision packages/my-lib --type=competitive
```

Compares the project against known alternatives in the ecosystem.

---

## 4. Vision → Plan Pipeline

```bash
/wbVision packages/my-lib           # 1. Create vision
/wbPlan packages/my-lib             # 2. Plan tasks from vision
/wbWork plan_*.md --task=1          # 3. Start executing
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Product vision | `/wbVision .` |
| Roadmap | `/wbVision . --type=roadmap` |
| Competitive analysis | `/wbVision . --type=competitive` |
| Refresh vision | `/wbVision .` (reads latest state) |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

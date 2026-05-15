# wbExplain — Practical Walkthrough

> How to get explanations of code, plan tasks, and concepts at any depth.

---

## 1. Explain a File

```bash
/wbExplain src/utils.js
```

```text
[AI] ## What It Does
[AI] Utility module with 5 exported helper functions for data transformation.
[AI]
[AI] ## Key Functions
[AI] - processData() — transforms raw API response into view model
[AI] - validateInput() — checks required fields
[AI] - formatDate() — locale-aware date formatting
```

---

## 2. Expert Deep-Dive

```bash
/wbExplain src/store.js --as=expert
```

Provides architecture internals, design decisions, and edge cases.

---

## 3. Explain a Plan Task

```bash
/wbExplain --id=7.3 --as=expert
```

Reads the plan task description and explains what needs to be done and why.

---

## 4. ELI5 for Quick Understanding

```bash
/wbExplain "state machine" --as=eli5
```

```text
[AI] A state machine is like a traffic light — it can only be in one
[AI] state at a time (red, yellow, green) and there are rules for
[AI] which state comes next.
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| File overview | `/wbExplain src/utils.js` |
| Deep architecture | `/wbExplain src/store.js --as=expert` |
| Plan task context | `/wbExplain --id=4 --as=practical` |
| Quick concept | `/wbExplain "concept" --as=eli5` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

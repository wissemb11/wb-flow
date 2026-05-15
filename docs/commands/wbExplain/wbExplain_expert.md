# wbExplain — Expert Architecture

> How `/wbExplain` generates multi-depth explanations of code, files, or concepts.

---

## 1. System Role

`/wbExplain` is a **knowledge extractor**. It reads source code or documentation and produces explanations at a specified depth level.

| Property | Value |
|---|---|
| **Role** | 📋 Mechanical (explanation) |
| **Input** | File path, function name, or concept |
| **Output** | Structured explanation |
| **Mutates files** | Never |

---

## 2. Depth Levels

| Level | Flag | Audience | Detail |
|---|---|---|---|
| **ELI5** | `--as=eli5` | Complete beginner | One-paragraph analogy |
| **Practical** | `--as=practical` | Developer using it | Step-by-step how-to |
| **Expert** | `--as=expert` | Architect | Internals, edge cases, design decisions |

---

## 3. Input Types

| Input | Example |
|---|---|
| File | `/wbExplain src/utils.js` |
| Function | `/wbExplain processData` |
| Plan task | `/wbExplain --id=7.3 --as=expert` |
| Concept | `/wbExplain "state machine"` |

---

## 4. Output Structure

```markdown
# Explanation: <subject>

## What It Does
One-sentence summary

## How It Works
Step-by-step breakdown

## Why It Matters
Context and significance

## Related
Links to related code/concepts
```

---

## 5. Integration

| Use Case | Command |
|---|---|
| Understand a plan task | `/wbExplain --id=4 --as=expert` |
| Onboard to a file | `/wbExplain src/store.js --as=practical` |
| Quick overview | `/wbExplain src/api.js --as=eli5` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

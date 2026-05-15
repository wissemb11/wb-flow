# wbRefactor — Expert Architecture

> How `/wbRefactor` analyzes code structure and generates safe, incremental refactoring plans.

---

## 1. System Role

`/wbRefactor` is a **structural analyzer and planner**. It identifies refactoring opportunities in code and generates a step-by-step plan that preserves behavior while improving structure.

| Property | Value |
|---|---|
| **Role** | 🧠 Planner (analytical + generative) |
| **Input** | Folder or file path |
| **Output** | Refactoring plan with ordered steps |
| **Mutates files** | No — generates plan only. `/wbWork` executes. |

---

## 2. Refactoring Categories

| Category | Detection Signal | Example |
|---|---|---|
| **Extract** | Function >50 lines, duplicated blocks | Extract helper function |
| **Rename** | Inconsistent naming, misleading names | Rename `data` → `userRecords` |
| **Move** | File in wrong directory, circular imports | Move utility to shared package |
| **Inline** | Wrapper adds no value, single-use abstraction | Inline trivial helper |
| **Decompose** | God component, mixed concerns | Split into focused components |
| **Modernize** | Deprecated API usage, legacy patterns | Options API → Composition API |

---

## 3. Safety Analysis

Before generating a plan, `/wbRefactor` assesses risk:

| Risk Factor | Assessment |
|---|---|
| **Test coverage** | Higher coverage = safer to refactor |
| **Consumer count** | More consumers = higher risk |
| **Public API surface** | Exports that change = breaking changes |
| **Dependency depth** | Deep dependency chains = cascade risk |

---

## 4. Output Format

```markdown
# Refactoring Plan: <scope>

## Risk Assessment
- Test coverage: 65%
- Consumers: 3 packages
- Risk level: MEDIUM

## Steps
1. [SAFE] Rename internal variables (no export changes)
2. [SAFE] Extract helper function from processData()
3. [MEDIUM] Move utils.js to shared package (3 consumers)
4. [HIGH] Change export signature of createStore()
```

---

## 5. Integration with /wbPlan

A refactoring plan can be ingested into a standard plan:

```bash
/wbRefactor packages/my-lib          # analyze and generate refactoring steps
/wbPlan packages/my-lib --ingest refactor_*.md   # convert to executable plan
/wbWork plan_*.md --task=1           # execute step by step
```

---

## 6. What wbRefactor Does NOT Do

| Action | Use Instead |
|---|---|
| Execute refactoring | `/wbWork` (reads the refactoring plan) |
| Run tests after changes | `/wbTest` |
| Review code quality | `/wbReview` |
| Detect security issues | `/wbSecure` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

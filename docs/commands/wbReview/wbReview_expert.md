# wbReview — Expert Architecture

> How `/wbReview` performs structured code review with quality scoring.

---

## 1. System Role

| Property | Value |
|---|---|
| **Role** | ✅ Validator (review) |
| **Input** | File path, diff, or folder |
| **Output** | Review report with scores and comments |
| **Mutates files** | Never |

---

## 2. Review Categories

| Category | Weight | Checks |
|---|---|---|
| Correctness | 30% | Logic errors, null handling |
| Readability | 25% | Naming, structure, complexity |
| Maintainability | 20% | Coupling, cohesion |
| Performance | 15% | Computation, memory |
| Security | 10% | Validation, exposure |

---

## 3. Verdict Scale

| Verdict | Meaning |
|---|---|
| APPROVE | Ready to merge |
| APPROVE with comments | Minor suggestions |
| REQUEST CHANGES | Must fix before merge |
| REJECT | Fundamental problems |

---

## 4. Output Format

```markdown
# Review: <scope>

## Score: 8/10

### Comments
1. [REQUIRED] src/utils.js:42 — Missing null check on user input
2. [SUGGESTION] src/store.js:15 — Consider extracting to composable
3. [PRAISE] src/api.js — Clean error handling pattern

### Verdict
APPROVE with comments
```

---

## 5. Review Pipeline

```
Input → Scope detection → Category analysis → Comment generation → Scoring → Verdict
```

| Stage | Action |
|---|---|
| **Scope detection** | Determine if reviewing file, diff, or folder |
| **Category analysis** | Score each of the 5 categories independently |
| **Comment generation** | Produce line-level feedback with severity |
| **Scoring** | Weighted average across categories |
| **Verdict** | Map score to verdict (≥9 APPROVE, ≥7 APPROVE with comments, etc.) |

---

## 6. Review vs. Audit

| Aspect | /wbReview | /wbAudit |
|---|---|---|
| **Scope** | Specific changes or files | Entire project |
| **Focus** | Code quality of changes | Overall project health |
| **Output** | Line-level comments | Finding-level report |
| **When** | Before merging code | Before releasing |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

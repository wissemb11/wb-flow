# wbReview — Practical Walkthrough

> Step-by-step guide to reviewing code changes.

---

## 1. Review a File

```bash
/wbReview src/utils.js
```

```text
[AI] Reviewing src/utils.js (142 lines)...
[AI]
[AI] Score: 8/10
[AI]
[AI] Comments:
[AI]   1. [REQUIRED] Line 42: Missing null check
[AI]   2. [SUGGESTION] Line 15: Extract to composable
[AI]   3. [PRAISE] Clean separation of concerns
[AI]
[AI] Verdict: APPROVE with comments
```

---

## 2. Review a Folder

```bash
/wbReview packages/my-lib/src/
```

Reviews all files in the directory and provides aggregate feedback.

---

## 3. After Review

| Verdict | Next Step |
|---|---|
| APPROVE | Merge / commit |
| APPROVE with comments | Address suggestions, then merge |
| REQUEST CHANGES | `/wbWork` to fix issues, then re-review |
| REJECT | Rethink approach, discuss with team |

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| Single file | `/wbReview src/utils.js` |
| Entire package | `/wbReview packages/my-lib/` |
| Pre-commit | `/wbReview .` |
| Focused | `/wbReview src/ --focus=security` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

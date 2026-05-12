# wbCheck — Practical Walkthrough

> Quick pre-commit quality checks for everyday use.

---

## 1. Basic Check

```bash
/wbCheck src/
```

```text
[AI] Checking 12 files...
[AI]   ✓ Syntax: all valid
[AI]   ✗ TODOs: 2 found in src/utils.js
[AI]   ✓ Naming: consistent
[AI]
[AI] Result: FAIL (1 issue)
```

---

## 2. Check Single File

```bash
/wbCheck src/store.js
```

Faster — only checks the specified file.

---

## 3. Pre-Commit Pattern

```bash
# Before every commit:
/wbCheck .          # quick quality gate
/wbGit .            # generate commit message
```

---

## 4. Fix and Re-Check

```text
[AI] ✗ TODOs: 2 found
```

Fix the issues, then re-run:

```bash
/wbCheck src/utils.js    # should now pass
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Pre-commit | `/wbCheck .` |
| Single file | `/wbCheck src/utils.js` |
| After refactor | `/wbCheck src/` |
| CI gate | `/wbCheck . --strict` (fail on warnings) |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

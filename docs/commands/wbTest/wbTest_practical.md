# wbTest — Practical Walkthrough

> How to generate, run, and interpret test results.

---

## 1. Run Existing Tests

```bash
/wbTest packages/my-lib
```

```text
[AI] Detected: Vitest
[AI] Running tests...
[AI]
[AI]   ✓ utils.test.js (4 tests, 12ms)
[AI]   ✓ store.test.js (3 tests, 8ms)
[AI]   ✗ api.test.js (1 failed, 2 passed)
[AI]
[AI] Results: 9/10 passed (90%)
[AI] Failed: api.test.js:25 — expected 200, got 404
```

---

## 2. Generate Tests

```bash
/wbTest packages/my-lib --generate
```

Creates test files for source modules that lack them.

```text
[AI] Generated:
[AI]   tests/utils.test.js (8 test cases)
[AI]   tests/store.test.js (5 test cases)
```

---

## 3. Coverage Report

```bash
/wbTest packages/my-lib --coverage
```

```text
[AI] Coverage: 78% (Good)
[AI]   src/utils.js: 95%
[AI]   src/store.js: 82%
[AI]   src/api.js: 45% ← needs work
```

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| Run all tests | `/wbTest .` |
| Generate missing tests | `/wbTest . --generate` |
| Coverage check | `/wbTest . --coverage` |
| Pre-release | `/wbTest . --coverage` then `/wbRelease .` |
| Single file | `/wbTest src/utils.js` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

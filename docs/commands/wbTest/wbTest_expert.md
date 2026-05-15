# wbTest — Expert Architecture

> How `/wbTest` generates, runs, and validates test suites.

---

## 1. System Role

`/wbTest` is a **test orchestrator**. It can generate test files from source code, execute existing test suites, and report coverage.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker + ✅ Validator |
| **Input** | Folder or file path |
| **Output** | Test results + coverage report |
| **Mutates files** | Yes — generates test files when requested |

---

## 2. Modes

| Mode | Flag | Action |
|---|---|---|
| **Run** (default) | — | Execute existing tests |
| **Generate** | `--generate` | Create test files from source |
| **Coverage** | `--coverage` | Run tests with coverage reporting |
| **Watch** | `--watch` | Continuous test execution |

---

## 3. Test Generation

When generating tests, `/wbTest` reads the source file and creates:

| Source | Generated Test |
|---|---|
| `src/utils.js` | `tests/utils.test.js` |
| `src/MyComponent.vue` | `tests/MyComponent.test.js` |

Generated tests include:
- Import statements for the source module
- Test cases for each exported function
- Edge case tests (null, empty, boundary values)
- Vue component mount tests (if applicable)

---

## 4. Framework Detection

| Signal | Test Runner |
|---|---|
| `vitest` in devDeps | Vitest |
| `jest` in devDeps | Jest |
| `mocha` in devDeps | Mocha |
| None detected | Suggests Vitest installation |

---

## 5. Coverage Thresholds

| Level | Threshold | Meaning |
|---|---|---|
| Excellent | ≥90% | Ship with confidence |
| Good | 70–89% | Acceptable for most projects |
| Needs work | 50–69% | Critical paths may be untested |
| Poor | <50% | Significant risk |

---

## 6. What wbTest Does NOT Do

| Action | Use Instead |
|---|---|
| E2E testing | Manual or Playwright/Cypress |
| Performance testing | `/wbAudit --profile=performance` |
| Security testing | `/wbSecure` |
| Code review | `/wbReview` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

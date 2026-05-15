# wbCheck — Expert Architecture

> How `/wbCheck` performs lightweight pre-commit quality checks on code.

---

## 1. System Role

`/wbCheck` is a **quick linter**. It performs fast, targeted quality checks without the depth of a full audit. Designed to run before every commit.

| Property | Value |
|---|---|
| **Role** | ✅ Validator (quick) |
| **Input** | File or folder path |
| **Output** | Pass/fail with issue list |
| **Mutates files** | Never |

---

## 2. Check Categories

| Category | What It Checks |
|---|---|
| **Syntax** | Valid JS/Vue/JSON, no parse errors |
| **Imports** | No circular imports, no missing modules |
| **Naming** | Consistent conventions (camelCase, PascalCase) |
| **TODOs** | Count and location of TODO/FIXME markers |
| **Size** | Files exceeding 300 lines flagged |
| **Exports** | Unused exports, missing index re-exports |

---

## 3. Check vs. Audit vs. Review

| Aspect | /wbCheck | /wbAudit | /wbReview |
|---|---|---|---|
| **Speed** | Fast (<10s) | Medium (30s+) | Slow (detailed) |
| **Depth** | Surface | Deep | Line-by-line |
| **Scope** | Files changed | Entire project | Specific changes |
| **When** | Pre-commit | Pre-release | Pre-merge |
| **Score** | Pass/fail | 1–10 score | Verdict scale |

---

## 4. Output Format

```text
[AI] Checking src/ (12 files)...
[AI]
[AI] ✓ Syntax: 12/12 valid
[AI] ✓ Imports: no circular dependencies
[AI] ✗ Naming: src/utils.js:15 — `ProcessData` should be camelCase
[AI] ✗ TODOs: 3 markers found
[AI] ✓ Size: all files under 300 lines
[AI]
[AI] Result: FAIL (2 issues)
```

---

## 5. Integration

| Workflow Position | Context |
|---|---|
| Before `/wbGit` | Quick check before commit |
| After editing | Verify changes don't break conventions |
| CI/CD | Lightweight gate in pipeline |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

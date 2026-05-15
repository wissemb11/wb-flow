# wbClean — Practical Walkthrough

> How to clean up stale reports, unused files, and project artifacts.

---

## 1. Basic Cleanup

```bash
/wbClean packages/my-lib
```

```text
[AI] Scanning for stale artifacts...
[AI]
[AI] Found:
[AI]   3 stale reports (>30 days old)
[AI]   2 orphaned track files
[AI]   1 empty report directory
[AI]
[AI] Remove? (dry-run — use --apply to execute)
```

---

## 2. Clean Reports Only

```bash
/wbClean packages/my-lib --reports
```

Removes only stale report files from `.wb/workflows/reports/`.

---

## 3. Clean Build Artifacts

```bash
/wbClean packages/my-lib --build
```

Removes `dist/`, `node_modules/.cache/`, and other build outputs.

---

## 4. Force Clean

```bash
/wbClean packages/my-lib --apply    # skip dry-run
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Dry-run (default) | `/wbClean .` |
| Reports only | `/wbClean . --reports` |
| Build artifacts | `/wbClean . --build` |
| Everything | `/wbClean . --all --apply` |
| Before release | `/wbClean . --build` then `/wbRelease .` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

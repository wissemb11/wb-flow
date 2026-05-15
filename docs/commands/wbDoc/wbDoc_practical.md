# wbDoc — Practical Walkthrough

> How to generate and update project documentation.

---

## 1. Generate a README

```bash
/wbDoc packages/my-lib
```

```text
[AI] Reading package.json...
[AI] Scanning src/ (12 exports found)...
[AI]
[AI] Generated: README.md
[AI]   - Installation section
[AI]   - Usage examples (3)
[AI]   - API reference (12 functions)
[AI]   - Development scripts
```

---

## 2. Generate API Documentation

```bash
/wbDoc packages/my-lib --type=api
```

Creates `API.md` with detailed function signatures, parameters, return types, and usage examples.

---

## 3. Update Existing README

```bash
/wbDoc packages/my-lib   # README.md already exists
```

```text
[AI] Updating README.md...
[AI]   ✓ Preserved: badges, description
[AI]   ✓ Updated: API section (2 new exports)
[AI]   ✓ Updated: Installation (new peer dep)
```

---

## 4. After New Features

```bash
/wbWork plan_*.md --task=5      # implement feature
/wbDoc packages/my-lib          # update docs
/wbGit .                        # commit both
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| New project README | `/wbDoc .` |
| API reference | `/wbDoc . --type=api` |
| Update after changes | `/wbDoc .` (preserves manual edits) |
| Usage guide | `/wbDoc . --type=usage` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

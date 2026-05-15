# wbLicense — Practical Walkthrough

> How to check license compliance and generate attribution files.

---

## 1. Check Compliance

```bash
/wbLicense packages/my-lib
```

```text
[AI] License: MIT (from package.json)
[AI] LICENSE file: ✓ exists, matches
[AI]
[AI] Dependencies (12):
[AI]   11 MIT, 1 Apache-2.0
[AI]   ✓ All compatible with MIT
```

---

## 2. Generate LICENSE File

```bash
/wbLicense packages/my-lib --generate
```

Creates a LICENSE file matching the license field in package.json.

---

## 3. Attribution Report

```bash
/wbLicense packages/my-lib --notice
```

Generates NOTICE.md listing all dependencies requiring attribution.

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| Quick check | `/wbLicense .` |
| Generate LICENSE | `/wbLicense . --generate` |
| Attribution | `/wbLicense . --notice` |
| Pre-release | `/wbLicense .` then `/wbRelease .` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

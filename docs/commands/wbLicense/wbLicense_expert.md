# wbLicense — Expert Architecture

> How `/wbLicense` manages license compliance and attribution across packages.

---

## 1. System Role

`/wbLicense` is a **compliance checker**. It scans dependencies for license information and generates a compliance report.

| Property | Value |
|---|---|
| **Role** | ✅ Validator (compliance) |
| **Input** | Folder path |
| **Output** | License report |
| **Mutates files** | Optionally — can generate LICENSE and NOTICE files |

---

## 2. Scan Capabilities

| Check | Description |
|---|---|
| **Own license** | Verify LICENSE file exists and matches package.json |
| **Dependency licenses** | List all dependency licenses |
| **Compatibility** | Check for license conflicts (e.g., GPL + MIT) |
| **Attribution** | Generate NOTICE file for required attributions |

---

## 3. License Categories

| Category | Licenses | Commercial Safe? |
|---|---|---|
| Permissive | MIT, Apache-2.0, BSD | Yes |
| Weak copyleft | LGPL, MPL | Usually |
| Strong copyleft | GPL, AGPL | Requires review |
| Unknown | Unlicensed packages | Risk |

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| Compliance check | `/wbLicense .` |
| Generate LICENSE | `/wbLicense . --generate` |
| Attribution file | `/wbLicense . --notice` |
| Dependency audit | `/wbLicense . --deps` |

---

## 5. Compliance Pipeline

```
Source → Own license check → Dependency scan → Compatibility matrix → Report
```

| Stage | Action |
|---|---|
| **Own license** | Verify LICENSE file matches `license` field in package.json |
| **Dependency scan** | Read license field from each dependency's package.json |
| **Compatibility** | Cross-check all licenses against the project's own license |
| **Report** | Generate compliance report with pass/fail per dependency |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wbTranslate — Expert Architecture

> How `/wbTranslate` manages internationalization (i18n) workflows.

---

## 1. System Role

`/wbTranslate` is an **i18n assistant**. It extracts translatable strings, generates translation files, and validates translation completeness.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker (extraction + generation) |
| **Input** | Folder path + target languages |
| **Output** | Translation files (JSON/YAML) |
| **Mutates files** | Yes — creates/updates translation files |

---

## 2. Capabilities

| Feature | Description |
|---|---|
| **Extract** | Find translatable strings in Vue templates and JS |
| **Generate** | Create locale files from extracted strings |
| **Validate** | Check for missing translations across locales |
| **Sync** | Update translation files when source changes |

---

## 3. Extraction Pipeline

```
Source scan → String detection → Key generation → Locale file creation
```

| Stage | Action |
|---|---|
| **Scan** | Read `.vue` and `.js` files for text content |
| **Detect** | Identify user-facing strings (not code/logs) |
| **Key gen** | Generate i18n keys from context |
| **Create** | Write `locales/en.json`, `locales/fr.json`, etc. |

---

## 4. Supported Formats

| Format | Extension | Framework |
|---|---|---|
| JSON | `.json` | vue-i18n |
| YAML | `.yml` | vue-i18n |
| PO | `.po` | gettext |

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Extract strings | `/wbTranslate . --extract` |
| Generate locale | `/wbTranslate . --lang=fr` |
| Validate | `/wbTranslate . --validate` |
| Sync after changes | `/wbTranslate . --sync` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

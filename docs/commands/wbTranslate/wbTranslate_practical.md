# wbTranslate — Practical Walkthrough

> How to extract, generate, and validate translations.

---

## 1. Extract Strings

```bash
/wbTranslate packages/my-app --extract
```

```text
[AI] Scanning 23 Vue files...
[AI] Found 47 translatable strings
[AI]
[AI] Generated: locales/en.json (47 keys)
```

---

## 2. Generate a Locale

```bash
/wbTranslate packages/my-app --lang=fr
```

Creates `locales/fr.json` with keys from `en.json` and suggested translations.

---

## 3. Validate Completeness

```bash
/wbTranslate packages/my-app --validate
```

```text
[AI] Validation:
[AI]   en.json: 47/47 (100%)
[AI]   fr.json: 42/47 (89%) — 5 missing
[AI]   ar.json: 35/47 (74%) — 12 missing
```

---

## 4. Sync After Source Changes

```bash
/wbTranslate packages/my-app --sync
```

Adds new keys to all locale files and flags removed keys.

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Initial extraction | `/wbTranslate . --extract` |
| Add French | `/wbTranslate . --lang=fr` |
| Check coverage | `/wbTranslate . --validate` |
| After code changes | `/wbTranslate . --sync` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

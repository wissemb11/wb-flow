# wbDebug — Practical Walkthrough

> How to diagnose errors and get fix suggestions.

---

## 1. Debug an Error

```bash
/wbDebug "TypeError: Cannot read property 'name' of undefined at src/utils.js:42"
```

```text
[AI] Root cause: `data.user` is undefined
[AI]   → API returns null when user not found
[AI]
[AI] Fix: Add optional chaining
[AI]   const name = data?.user?.name ?? 'Unknown'
[AI]
[AI] Also check: src/api.js:30 — add 404 handling
```

---

## 2. Debug a File

```bash
/wbDebug src/utils.js:42
```

Reads the file context around line 42 and analyzes potential issues.

---

## 3. Debug from Log

```bash
/wbDebug logs/error.log
```

Parses the log file, extracts error patterns, and provides a summary of all unique issues.

---

## 4. After Diagnosis

```bash
/wbDebug "error message"          # 1. Diagnose
/wbWork . --focus="fix error"     # 2. Apply fix
/wbTest .                         # 3. Verify fix
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Quick diagnosis | `/wbDebug "error text"` |
| File + line | `/wbDebug src/utils.js:42` |
| Log analysis | `/wbDebug logs/error.log` |
| Build error | `/wbDebug "build failed: ..."` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

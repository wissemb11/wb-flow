# wbDebug — Expert Architecture

> How `/wbDebug` analyzes runtime errors and generates diagnostic reports.

---

## 1. System Role

`/wbDebug` is a **diagnostic analyzer**. It reads error messages, stack traces, and runtime logs to identify root causes and suggest fixes.

| Property | Value |
|---|---|
| **Role** | 🧠 Planner (analytical) |
| **Input** | Error message, stack trace, or file path |
| **Output** | Diagnostic report with root cause and fix |
| **Mutates files** | Never |

---

## 2. Input Types

| Input | How to Provide |
|---|---|
| **Error message** | Paste the error text |
| **Stack trace** | Paste full stack trace |
| **File + line** | `/wbDebug src/utils.js:42` |
| **Log file** | `/wbDebug logs/error.log` |

---

## 3. Diagnostic Pipeline

```
Error input → Pattern matching → Context gathering → Root cause analysis → Fix suggestion
```

| Stage | Action |
|---|---|
| **Pattern matching** | Match against known error patterns |
| **Context gathering** | Read related source files |
| **Root cause** | Trace the error to its origin |
| **Fix suggestion** | Propose code changes |

---

## 4. Common Error Patterns

| Pattern | Root Cause | Fix |
|---|---|---|
| `TypeError: Cannot read property of undefined` | Missing null check | Add optional chaining |
| `Module not found` | Wrong import path | Fix path or install package |
| `Maximum call stack exceeded` | Infinite recursion | Add base case |
| `CORS error` | Missing headers | Configure server CORS |

---

## 5. Output Format

```text
[AI] Diagnostic: TypeError at src/utils.js:42
[AI]
[AI] Root cause: `data.user.name` — `user` is undefined when API returns 404
[AI]
[AI] Fix:
[AI]   const name = data?.user?.name ?? 'Unknown'
[AI]
[AI] Related: src/api.js:30 — missing error handling for 404 response
```

---

## 6. What wbDebug Does NOT Do

| Action | Use Instead |
|---|---|
| Fix the code | `/wbWork` |
| Run debugger | Manual breakpoints |
| Monitor runtime | External APM tools |
| Performance profiling | `/wbAudit --profile=performance` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

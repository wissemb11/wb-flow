# wbActOn — Practical Walkthrough

> How to convert audit findings and review comments into executed fixes.

---

## 1. Act on an Audit Finding

```bash
/wbAudit packages/my-lib               # produces finding F1
/wbActOn audit:F1                       # executes the fix
```

```text
[AI] Finding F1: Missing null check in src/utils.js:42
[AI]
[AI] Action: Add optional chaining
[AI] Preview:
[AI]   - const name = data.user.name
[AI]   + const name = data?.user?.name ?? 'Unknown'
[AI]
[AI] Apply? (dry-run mode — use --apply to execute)
```

---

## 2. Act on a Review Comment

```bash
/wbReview src/store.js                  # produces comment #1
/wbActOn review:1                       # applies suggestion
```

---

## 3. Force Apply

```bash
/wbActOn audit:F1 --apply     # skip dry-run, apply immediately
```

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| Fix audit finding | `/wbActOn audit:F1` |
| Apply review suggestion | `/wbActOn review:1` |
| Fix security alert | `/wbActOn security:alert1` |
| Manual action | `/wbActOn "add validation to api.js"` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

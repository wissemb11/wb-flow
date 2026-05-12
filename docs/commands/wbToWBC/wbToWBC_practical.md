# wbToWBC — Practical Walkthrough

> How to migrate existing components to WBC-compliant architecture.

---

## 1. Analyze a Component

```bash
/wbToWBC src/components/MyTable.vue
```

```text
[AI] Analyzing MyTable.vue...
[AI]
[AI] Gaps found:
[AI]   1. Missing WB prefix → rename to WBTable
[AI]   2. Untyped props → add type + validator
[AI]   3. Unscoped styles → add scoped attribute
[AI]
[AI] Migration plan: 3 steps
```

---

## 2. Execute Migration

```bash
/wbToWBC src/components/MyTable.vue --apply
```

Creates `WBTable.vue` alongside the original (non-destructive).

---

## 3. Batch Migration

```bash
/wbToWBC src/components/
```

Analyzes all components in the directory and produces a consolidated migration plan.

---

## 4. Post-Migration

```bash
/wbToWBC src/components/ --apply     # 1. Migrate
/wbTest .                            # 2. Verify
/wbAudit .                           # 3. Re-audit
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Single component | `/wbToWBC src/MyComp.vue` |
| Batch analysis | `/wbToWBC src/components/` |
| Execute migration | `/wbToWBC src/MyComp.vue --apply` |
| Dry-run | `/wbToWBC src/MyComp.vue` (default) |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

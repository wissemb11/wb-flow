# wbActOn — Expert Architecture

> How `/wbActOn` converts plan recommendations into executable actions.

---

## 1. System Role

`/wbActOn` is an **action executor**. It reads a recommendation from another command (audit finding, review comment, security alert) and converts it into a concrete action — typically a `/wbWork` invocation.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker (bridging) |
| **Input** | Finding ID or recommendation text |
| **Output** | Executed action or plan task |
| **Mutates files** | Yes — applies the recommended fix |

---

## 2. Input Sources

| Source | Example |
|---|---|
| Audit finding | `/wbActOn audit:F1` |
| Review comment | `/wbActOn review:1` |
| Security alert | `/wbActOn security:CVE-2021-23337` |
| Manual | `/wbActOn "add input validation to api.js"` |

---

## 3. Action Pipeline

```
Source → Parse recommendation → Determine action type → Execute or create plan task
```

| Action Type | What Happens |
|---|---|
| **Simple fix** | Direct code change via `/wbWork` |
| **Multi-step** | Creates plan with sub-tasks |
| **Research needed** | Outputs analysis before acting |

---

## 4. Safety

| Guard | Description |
|---|---|
| Dry-run default | Shows what would change before executing |
| Scope limit | Cannot modify files outside the target package |
| Rollback hint | Provides undo instructions |

---

## 5. Integration

| Flow | Commands |
|---|---|
| Audit → Act | `/wbAudit .` → `/wbActOn audit:F1` |
| Review → Act | `/wbReview .` → `/wbActOn review:1` |
| Secure → Act | `/wbSecure .` → `/wbActOn security:alert1` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

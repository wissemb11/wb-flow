# /wbHelp — Expert: Extension & Customization

> Part 2 covers how to extend the help system with custom commands, how contextual help enrichment works, and the relationship between `/wbHelp` and the shortcut grammar.

---

## 6. Adding Help for Custom Commands

To make a new command discoverable via `/wbHelp`:

### Step 1: Create the Template

```
.wb/commands/wbMyCommand/wbMyCommand_template.md
```

### Step 2: Add the HELP GATE

```markdown
<!-- HELP_GATE_START -->
## /wbMyCommand — My Custom Role

**Syntax:** `/wbMyCommand <scope> [flags]`

### Flags
| Flag | Short | Description |
|---|---|---|
| `--custom` | `-c` | Custom flag description |

### Examples
/wbMyCommand packages/my-pkg
/wbMyCommand packages/my-pkg -c

### Related Commands
/wbAudit → /wbMyCommand → /wbPlan
<!-- HELP_GATE_END -->
```

### Step 3: Register in the Catalog

Add an entry to `wb_commands_reference.json`:

```json
{
  "name": "wbMyCommand",
  "role": "Custom Role",
  "group": "Utilities",
  "description": "Does something custom",
  "template": ".wb/commands/wbMyCommand/wbMyCommand_template.md"
}
```

After these steps, `/wbHelp wbMyCommand` and `/wbHelp` (catalog) both include the new command.

---

## 7. Contextual Help Enrichment

When a scope is provided (`/wbHelp wbAudit packages/wb-core`), the help router enriches the output:

### Enrichment Sources

| Source | Data Extracted |
|---|---|
| `context.md` | Package identity, tier, dependencies |
| Recent audit reports | Last audit date, score, open findings |
| Recent plan files | Active plan, open tasks, completion % |
| `package.json` | Version, scripts, dependencies |

### Enrichment Rules

| Rule | Description |
|---|---|
| **Read-only** | Contextual help never writes files. |
| **Best-effort** | Missing sources are silently skipped. |
| **Scoped** | Only reads from the specified scope's `.wb/` tree. |
| **Cached** | If the same scope is queried twice in a session, the second read uses cached data. |

---

## 8. Help and the Shortcut Grammar

The user's shortcut system (`/c`, `/d`, `/wissem`, etc.) does NOT interact with `/wbHelp`. These are independent systems:

| System | Scope | Example |
|---|---|---|
| **Shortcuts** | Response style, tone, format | `/d` = detailed mode |
| **`/wbHelp`** | Command documentation | `/wbHelp wbAudit` = show audit help |
| **`/wb*` commands** | Execution | `/wbAudit packages/wb-core` = run audit |

However, the `--help` intercept DOES work with shortcuts:

```bash
/wbAudit packages/wb-core --help /d
# → Displays help in detailed mode (shortcut applied to help output)
```

---

## 9. Help Output Formats

`/wbHelp` adapts its output format based on the consumer:

| Consumer | Format |
|---|---|
| Interactive chat | Markdown with emoji role badges |
| CI/CD pipeline | Plain text (no emoji, no tables) |
| Documentation site | Full markdown with relative links |

The format is auto-detected based on the agent's runtime context. There is no flag to override it.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

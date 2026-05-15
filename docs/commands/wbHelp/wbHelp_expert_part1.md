# /wbHelp — Expert: Help Router Architecture

> This page documents the internal architecture of the `/wbHelp` command — how it resolves command names, loads help content, and routes between different help modes.

---

## 1. The Help Router

`/wbHelp` is not a content-producing command — it is a **router**. It reads template files and formats their help blocks for display.

```
Input: /wbHelp <commandName> [scope]
  │
  ├─ commandName provided? ──YES──▶ Load template → Extract HELP BLOCK → Display
  │                          NO──▶ Load catalog from wb_commands_reference.json → Display
  │
  └─ scope provided? ──YES──▶ Enrich with context.md → Add suggestions
                        NO──▶ Display generic help
```

---

## 2. Template Resolution

When `/wbHelp wbAudit` is invoked, the router resolves the template path:

```
.wb/commands/wbAudit/wbAudit_template.md
```

It then extracts the content between `<!-- HELP_GATE_START -->` and `<!-- HELP_GATE_END -->` markers.

### Resolution Rules

| Input | Resolved Template |
|---|---|
| `wbAudit` | `.wb/commands/wbAudit/wbAudit_template.md` |
| `/wbAudit` | Same (leading `/` is stripped) |
| `WbAudit` | Same (case-insensitive match) |
| `audit` | `❌ Unknown command` (partial names are not resolved) |

---

## 3. The HELP GATE Protocol

Every `/wb*` command template contains a HELP GATE block:

```markdown
<!-- HELP_GATE_START -->
## /wbAudit — The Technical Inspector

**Syntax:** `/wbAudit <scope> [flags]`
...
<!-- HELP_GATE_END -->
```

### HELP GATE Rules

| Rule | Description |
|---|---|
| **Always first** | The HELP GATE must be the first content block in every template. |
| **Self-contained** | It must not reference external files or variables. |
| **Intercept trigger** | Any `--help`, `-h`, or `--h` flag on any command triggers the gate. |
| **Execution block** | When the gate fires, NO other template logic executes. |
| **Uniform format** | Role, Syntax, Flags table, Examples, Related Commands. |

---

## 4. The Command Registry

The full catalog is loaded from `wb_commands_reference.json`:

```json
{
  "commands": [
    {
      "name": "wbAudit",
      "role": "Inspector",
      "group": "Inspectors",
      "description": "Scans for debt, vulnerabilities, anti-patterns",
      "template": ".wb/commands/wbAudit/wbAudit_template.md"
    }
  ]
}
```

This JSON file is the single source of truth for the command catalog. `/wbHelp` with no arguments renders this file as a grouped table.

---

## 5. Edge Cases

| Scenario | Behavior |
|---|---|
| Template file missing | `❌ Error: Template not found for /wbFoo` |
| HELP GATE markers missing | Falls back to displaying the first 30 lines of the template |
| Multiple `--help` flags | Treated identically to a single `--help` |
| `/wbHelp wbHelp` | Valid — displays help for the help command itself (recursive) |
| Empty command registry | `⚠️ Warning: No commands found in registry.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

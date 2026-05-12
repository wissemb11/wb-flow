# Flags & Shortcuts — The Shortcut Grammar System

> Part 2 documents the user shortcut system — a separate grammar layer that controls response style, tone, and format independently of `/wb*` command flags.

---

## 6. Shortcuts vs. Flags

These are two independent systems that can be combined:

| System | Scope | Syntax | Example |
|---|---|---|---|
| **Flags** | Command behavior | `--flag=value` | `/wbAudit --profile=security` |
| **Shortcuts** | Response style | `/shortcut` or `/shortcut,arg` | `/d` (detailed mode) |

Shortcuts control **how** the AI responds. Flags control **what** the AI does.

---

## 7. Shortcut Grammar

### Basic Syntax

```
/shortcut                  → activate shortcut
/shortcut,arg1,arg2        → shortcut with arguments (no spaces)
```

### Common Shortcuts

| Shortcut | Meaning |
|---|---|
| `/c` | Concise mode — brief responses |
| `/d` | Detailed mode — comprehensive responses |
| `/wissem` | Personal voice — direct, zero-fluff |
| `/final_only` | Only show the final output, no intermediate steps |
| `/answer_only` | Only show the answer, no explanation |
| `/think` | Show reasoning process before answering |
| `/step` | Step-by-step breakdown |

### Aliases

| Alias | Expands To |
|---|---|
| `/ctx` | `/folder` (set context folder) |
| `/f` | `/file` (set context file) |
| `/p` | `/project` (set project scope) |
| `/ep` | `/prompt` (execute prompt) |

---

## 8. Chaining Shortcuts

Multiple shortcuts can be chained in a single invocation:

```bash
/d /ctx,packages/wb-core /wbAudit packages/wb-core
```

This means: "Run `/wbAudit` in detailed mode with context set to `packages/wb-core`."

### Chaining Rules

| Rule | Description |
|---|---|
| Later overrides earlier | `/c /d` → detailed (last wins) |
| Specific overrides general | `/c /d,section3` → detailed for section 3 only |
| Natural language overrides all | "Be brief" overrides `/d` |
| `/final_only` overrides formatting | No intermediate steps regardless of other shortcuts |

---

## 9. Combining Shortcuts with `/wb*` Commands

Shortcuts apply to the command's output format, not its behavior:

```bash
# Detailed audit output
/d /wbAudit packages/wb-core

# Concise plan (just the task table, no commentary)
/c /wbPlan packages/wb-core

# Step-by-step work execution with reasoning shown
/step /think /wbWork plan_*.md --task=5

# Final output only — no progress messages
/final_only /wbGit packages/wb-core
```

### What Shortcuts DON'T Do

| Shortcut | Does NOT |
|---|---|
| `/c` | Reduce the number of tasks in a plan |
| `/d` | Add more tasks to a plan |
| `/final_only` | Skip task execution steps |
| `/think` | Change the quality of output |

---

## 10. The `/ignore_previous` Escape

To disable all active shortcuts and return to default behavior:

```bash
/ignore_previous
```

This resets the shortcut state to zero. All subsequent commands use the default response style (friendly, direct, zero fluff).

---

## 11. Quick Reference

```
/c                → concise
/d                → detailed
/wissem           → personal voice
/final_only       → output only
/answer_only      → answer only
/think            → show reasoning
/step             → step by step
/ignore_previous  → reset all shortcuts
```

The full shortcut catalog (21 sections) is defined in:
`.wb/shortcuts/shortcuts.md`

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

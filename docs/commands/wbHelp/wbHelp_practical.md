---
title: "wbHelp — Practical: Getting Help Effectively"
description: "Returns the full command list grouped by role."
---

# /wbHelp — Practical: Getting Help Effectively

> This walkthrough teaches you how to use `/wbHelp` to quickly find the right command, understand its flags, and discover related workflows.

---

## When to Use `/wbHelp`

| Situation | Command |
|---|---|
| "What commands are available?" | `/wbHelp` |
| "How do I use /wbAudit?" | `/wbHelp wbAudit` |
| "What flags does /wbPlan accept?" | `/wbHelp wbPlan` or `/wbPlan --help` |
| "What should I run on this package?" | `/wbHelp wbAudit packages/wb-core` (contextual) |

---

## The Three Help Modes

### Mode 1: Catalog (no arguments)

```bash
/wbHelp
```

Returns the full command list grouped by role. Use this when you're new to wb-flow or can't remember a command name.

**Pro tip:** The catalog is generated from `wb_commands_reference.json`. If a command is missing, it hasn't been registered yet.

### Mode 2: Command Help (one argument)

```bash
/wbHelp wbClean
```

Returns detailed help for one command: syntax, flags, examples, and related commands. Use this when you know which command you need but want to check the flags.

**Pro tip:** You can also use `--help` directly on any command:
```bash
/wbClean src/ --help    # same as /wbHelp wbClean
```

### Mode 3: Contextual Help (command + scope)

```bash
/wbHelp wbAudit packages/wb-core
```

Returns command help enriched with scope-specific suggestions. Use this when you want the AI to recommend the best flags and options for your specific package.

---

## Common Patterns

### Pattern 1: Discovery Workflow

```bash
/wbHelp                          # browse the catalog
/wbHelp wbAudit                  # learn about /wbAudit
/wbAudit packages/wb-core        # run it
```

### Pattern 2: Quick Flag Lookup

```bash
/wbPlan --help                   # check flags without leaving the flow
/wbPlan packages/wb-core --resume  # use the flag you found
```

### Pattern 3: Troubleshooting

```bash
/wbHelp wbWork                   # check the expected input format
# → Discovers that /wbWork needs a plan file, not a folder
/wbWork plan_wb-core_20260511.md --task=3  # correct invocation
```

---

## Tips

1. **`--help` works everywhere** — you never need to switch to `/wbHelp` explicitly.
2. **Case doesn't matter** — `/wbHelp wbaudit` works the same as `/wbHelp wbAudit`.
3. **Contextual help is optional** — if you don't provide a scope, you get generic help.
4. **Help is always safe** — it never reads your code, writes files, or modifies state.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


---

# /wbHelp — Practical: Help in Multi-Model Workflows

> Part 2 covers using `/wbHelp` when working across multiple AI models, understanding help output differences, and integrating help into automated workflows.

---

## Help Across Models

Different AI models may display `/wbHelp` output differently, but the content is identical because it's sourced from the same template files.

### Model-Specific Behavior

| Model | Help Rendering |
|---|---|
| **AI** | Full markdown tables, emoji badges, collapsible sections |
| **AI** | Full markdown, may inline code examples |
| **Sonnet 4.6** | Compact output, may omit Related Commands section |
| **DeepSeek V4** | Minimal formatting, plain text tables |

### Consistency Rule

Regardless of rendering differences, all models:
- Read the same HELP GATE content from the template
- Respect the same `--help` intercept rule
- Display the same flags, syntax, and examples

---

## Help in Automated Workflows

When building scripts or automation around wb-flow commands, `/wbHelp` can serve as a validation tool:

### Pre-Flight Checks

```bash
# Verify a command exists before running it
/wbHelp wbCustom
# If this returns an error, the command is not registered

# Verify flags are valid
/wbHelp wbPlan | grep -- "--resume"
# If this returns a match, the flag is supported
```

### Onboarding Scripts

```bash
# Show a new team member the 5 most important commands
for cmd in wbAudit wbPlan wbWork wbValid wbGit; do
  echo "=== $cmd ==="
  /wbHelp $cmd
  echo ""
done
```

---

## Frequently Asked Questions

| Question | Answer |
|---|---|
| Can I add help for non-wb commands? | No — `/wbHelp` only routes to `.wb/commands/` templates. |
| Does help work offline? | Yes — it reads local template files, no network required. |
| Can I customize the help format? | No — the format is fixed (Role, Syntax, Flags, Examples, Related). |
| Is help content versioned? | Yes — it changes when the template file changes. Use git to track. |
| Can I search within help? | Not directly — use `grep` on the template files instead. |

---

## Quick Reference Card

```
/wbHelp                    → Full command catalog
/wbHelp <cmd>              → Detailed help for one command
/wbHelp <cmd> <scope>      → Contextual help with suggestions
/<cmd> --help              → Same as /wbHelp <cmd>
/<cmd> -h                  → Same as /wbHelp <cmd>
```

All help operations are **read-only**, **safe**, and **idempotent**.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

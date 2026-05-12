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

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

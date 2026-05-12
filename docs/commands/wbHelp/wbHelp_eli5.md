# wbHelp — ELI5 Guide

## What is this?

The built-in documentation browser for the wb-flow system — lists all available `/wb*` commands with descriptions, usage examples, and links to detailed guides. It's the first command to run when you're stuck or exploring.

The help system is organized by command categories: planning commands (`wbPlan`, `wbNext`, `wbVision`), execution commands (`wbWork`, `wbActOn`, `wbGit`), quality commands (`wbCheck`, `wbTest`, `wbAudit`, `wbReview`), lifecycle commands (`wbSetup`, `wbRelease`, `wbDeploy`), and utility commands (`wbExplain`, `wbContext`, `wbTranslate`). Each command entry includes its syntax, options, and one or more usage examples.

**What It Shows:**
- **Command catalog** — full list of all 31 `/wb*` commands grouped by category (planning, execution, quality, lifecycle)
- **Command details** — for any specific command: description, syntax, options, flags, and examples
- **Quick reference** — common usage patterns and command pipelines (e.g., `/wbSetup > wbPlan > wbWork`)
- **Help block extraction** — reads the help block from the command's template and displays it formatted
- **Search** — keyword search across all command documentation to find relevant commands
- **Version and system info** — wb-flow version, installed templates, and system prerequisites status

**When to use it:** Whenever you need help — whether you're a new user exploring commands or an experienced user who forgot a specific flag.

## Why do I need it?

With 31 commands, nobody remembers all of them. `wbHelp` is your always-available reference — instead of opening the docs website, you type `/wbHelp` in your terminal and get the answer immediately. It's faster than a web search and always shows the version-specific documentation.

**Tips:**
- Use `/wbHelp <command>` for detailed help on a specific command
- Use `--search <keyword>` when you know what you want to do but not which command does it
- Check `/wbHelp --version` when upgrading to see what's changed

## Simple Example

**List all commands:** `/wbHelp` — outputs the full command catalog grouped by category with one-line descriptions.

**Specific command help:** `/wbHelp wbAudit` — shows the detailed help block for `wbAudit` including all flags and a usage example.

**Search by keyword:** `/wbHelp --search "deploy"` — finds all commands related to deployment (`wbDeploy`, `wbPublish`, `wbRelease`) and shows their summaries.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


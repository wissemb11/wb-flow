# wbLog — ELI5 Guide

## What is this?

Displays and filters your wb-flow session logs — a chronological record of all `/wb*` commands you've run, their outputs, timing, and exit status. It's like `git log` but for your agentic workflow sessions.

The log system stores every command execution as a structured entry with timestamp, command name, arguments, duration, exit code, and output excerpts. You can filter, search, and analyze this data to understand your workflow patterns, identify recurring errors, and track performance over time.

**What It Shows:**
- **Command history** — every `/wb*` command you've run with timestamp and duration
- **Exit status** — success, failure, or warning for each command execution
- **Output excerpts** — key output snippets (scores, file paths, error messages) from each command
- **Session grouping** — commands grouped by session or working day for timeline review
- **Error patterns** — recurring errors or failures across commands, highlighting systemic issues
- **Performance metrics** — command execution times, trend lines showing slowdowns over time
- **Search and filter** — find specific commands, errors, or outputs by keyword, date range, or exit code

**When to use it:** When debugging a failed workflow, reviewing what you worked on yesterday, or analyzing your productivity patterns. Also useful for sharing session context when asking for help.

## Why do I need it?

When something goes wrong halfway through a workflow, you need to know what happened. `wbLog` gives you the full audit trail — what commands ran, what they outputted, and where they failed — so you can debug without replaying the entire session. It's also invaluable for retrospectives and productivity analysis.

**Tips:**
- Use `--status error` to focus on what went wrong during a session
- Use `--session latest` to see everything that happened in the most recent session
- The log is stored locally — it never leaves your machine unless you explicitly share it

## Simple Example

**Recent activity:** `/wbLog` — shows the last 20 commands run with timestamp, duration, and exit status.

**Filter by status:** `/wbLog --status error` — shows only failed commands, useful for debugging a session that ended with errors.

**Session replay:** `/wbLog --session latest --verbose` — shows the complete output of every command in the most recent session, letting you trace the full workflow step by step.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


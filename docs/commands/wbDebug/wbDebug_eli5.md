# wbDebug — ELI5 Guide

## What is this?

Walks through a bug report or error trace, analyzes your code, and suggests a fix with a proposed diff. It reads the error message (or your description), traces the code path that leads to the failure, identifies the root cause, and produces a candidate patch.

The debugger uses a multi-step reasoning process: it first parses the error to understand what went wrong, then traces the execution path backward from the crash point to find the root cause, rules out known non-issues, and finally generates a targeted fix. It can also compare the failing behavior against the git history to identify when the bug was introduced.

**How It Works:**
- **Error parsing** — reads stack traces, error codes, or natural-language bug descriptions
- **Code path tracing** — follows the execution path from entry point to failure point using static analysis
- **Root cause isolation** — distinguishes symptom from cause by analyzing data flow and state mutations
- **Fix generation** — produces a targeted code change with explanation of why it fixes the issue
- **Regression guard** — checks whether the proposed fix breaks existing tests or creates new edge cases

**When to use it:** When you encounter any error — from a cryptic stack trace to a vague "it doesn't work" report. The more specific your input, the better the diagnosis.

## Why do I need it?

Debugging is the most time-consuming part of development — finding the root cause often takes hours. `wbDebug` collapses that from hours to minutes by systematically tracing the problem and proposing a solution, even for code you didn't write. It's particularly valuable for onboarding new team members who don't yet know the codebase's failure modes.

**Tips:**
- Paste the full stack trace — not just the error message — for the most accurate diagnosis
- Include reproduction steps with expected vs. actual behavior for logic bugs
- For intermittent bugs, use `--bisect` to find the exact commit that introduced the regression

## Simple Example

**Stack trace debug:** `/wbDebug "TypeError: Cannot read properties of undefined (reading 'map') at UserList.tsx:42"` — traces the undefined variable back to its source and proposes a fix with null guard or default value.

**Bug description:** `/wbDebug "Users can submit the form twice and create duplicate entries"` — finds the submission handler, identifies the missing disable-state guard, and adds debounce logic.

**Regression hunt:** `/wbDebug --bisect abc123..def456 src/utils/` — runs a git bisect across the given commit range to find which change introduced a regression in the specified module.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


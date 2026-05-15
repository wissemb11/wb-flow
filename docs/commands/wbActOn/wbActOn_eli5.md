# wbActOn — ELI5 Guide

## What is this?

Takes a previous output from another `/wb*` command (like `wbAudit`, `wbReview`, or `wbPlan`) and executes the recommended actions. It reads the structured recommendations from the prior command's output and implements them one by one, committing changes as it goes.

The execution engine parses the input — which can be a file or piped output — extracts individual action items, and applies them in dependency order. Each action is checked against the project state before execution to avoid conflicts. Between steps, `wbCheck` runs automatically to catch any issues introduced by the changes.

**How It Works:**
- **Input parsing** — reads the JSON or structured text output from a prior `/wb*` command
- **Action extraction** — identifies individual action items (fix this lint error, refactor this function, add this test)
- **Sequential execution** — applies each change in dependency order, running `wbCheck` between steps
- **Granular commits** — creates one commit per logical change with descriptive messages
- **Progress tracking** — reports which actions succeeded, which failed, and which were skipped
- **Rollback support** — if an action breaks tests, it reverts and reports the failure instead of leaving a broken state

**When to use it:** After running `wbAudit`, `wbReview`, `wbRefactor`, or any command that produces a list of actionable findings. Pipe the output directly for a seamless analysis-to-action workflow.

## Why do I need it?

Getting a report of what to fix is useful, but actually doing the work is still tedious. `wbActOn` closes the loop — it takes the plan and executes it, turning analysis into action without you having to manually edit each file. It's the difference between getting a doctor's diagnosis and actually filling the prescription.

**Tips:**
- Pipe commands directly: `wbAudit src/ | wbActOn` for a single command chain
- Use `--interactive` for changes that need human judgment (renaming APIs, changing behavior)
- Review the resulting commits to make sure the automated fixes are correct

## Simple Example

**Act on audit:** `/wbAudit src/ --format json | wbActOn` — pipes audit findings directly into `wbActOn`, which fixes each issue in order and commits the changes.

**Act on review:** `/wbReview --diff main...HEAD --out review.json && wbActOn review.json` — saves a code review to a file, then applies all auto-fixable suggestions.

**Interactive mode:** `/wbActOn plan.md --interactive` — reads a task plan and presents each action for confirmation before applying it, giving you final say on every change.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


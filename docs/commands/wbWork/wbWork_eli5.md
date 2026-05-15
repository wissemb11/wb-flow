# wbWork — ELI5 Guide

## What is this?

The central orchestration command — it takes a task description, analyzes your project, and executes the work by chaining together the right `/wb*` sub-commands automatically. Think of it as the "just do it" command that handles planning, execution, and verification in one flow.

The orchestration engine works by parsing your task description, identifying the type of work needed (feature, bug fix, refactor, chore), selecting the appropriate sub-commands, and executing them in the correct order. It passes intermediate results between commands and performs verification checks at each stage to catch issues early.

**How It Works:**
- **Task understanding** — parses your natural-language task and identifies the type of work needed
- **Sub-command selection** — picks the relevant `/wb*` commands (Plan, Check, Test, Refactor, etc.) based on the task
- **Sequential execution** — runs each step in the right order, passing results between commands
- **Progress reporting** — shows what step is running, how far along the overall task is, and any issues encountered
- **Verification** — after completing the work, runs checks and tests to confirm nothing is broken
- **Summary** — produces a completion report with what was done, what was skipped, and any warnings

**When to use it:** For any non-trivial task that involves multiple steps — adding a feature, fixing a complex bug, or performing a refactor. It's designed to replace manual multi-command workflows.

## Why do I need it?

Instead of remembering which `/wb*` commands to run and in what order, you just describe what you want done. `wbWork` figures out the plan and executes it — it's the difference between ordering a meal and cooking it yourself. It's especially valuable for complex tasks that span planning, implementation, testing, and review.

**Tips:**
- Be specific in your task description — "Add loading skeleton to the UserProfile component" works better than "Improve UI"
- Review the plan before execution starts — `wbWork` shows you what it's going to do
- For simple one-step tasks, use the specific `/wb*` command directly instead

## Simple Example

**Direct task:** `/wbWork "Add loading skeleton to UserProfile component"` — analyzes the codebase, creates a plan, implements the skeleton, runs tests, and reports completion.

**Bug fix:** `/wbWork "Fix the login button that's not clickable on mobile"` — identifies the CSS/layout issue, fixes it, verifies on mobile viewport, and commits the change.

**Complex task:** `/wbWork "Refactor the API client to use fetch instead of axios, update all imports, and run the test suite"` — handles a multi-step refactor across many files with automatic verification at each stage.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


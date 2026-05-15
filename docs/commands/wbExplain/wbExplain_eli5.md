# wbExplain — ELI5 Guide

## What is this?

Explains any part of your codebase in plain language — a function, a file, a directory, or even a whole module. It reads the code, understands its structure and purpose, and produces a human-readable explanation with context about how it fits into the larger project.

The explanation engine analyzes code at multiple levels: lexical (what individual statements do), structural (how functions and classes relate), and architectural (how the module fits into the broader system). It then translates this analysis into plain English with analogies and examples tailored to your experience level.

**What It Explains:**
- **Functions** — what the function does, its inputs/outputs, side effects, and why it exists
- **Files** — the file's role in the project, its exports, its dependencies, and its consumers
- **Directories** — the module's responsibility, its internal structure, and how it connects to other modules
- **Algorithms** — step-by-step walkthrough of complex logic with plain-English analogies
- **Data flow** — how data moves through the system, from API call to database to UI render
- **Architecture patterns** — which patterns are in use (MVC, hooks, HOCs, middleware) and why they were chosen

**When to use it:** When you encounter unfamiliar code during onboarding, code review, or debugging. Use `wbExplain` before `wbDebug` when you need to understand the code first.

## Why do I need it?

Joining a new project or reading unfamiliar code is the hardest part of development. Instead of tracing through 10 files to understand one function, ask `wbExplain` and get a concise, accurate explanation in seconds. It's like having a senior developer sit beside you and walk through the codebase.

**Tips:**
- Start with `wbExplain src/` to get a project overview before diving into specific files
- Use `--depth architecture` for high-level understanding, omit it for line-level details
- Combine with `wbContext` to get both the big picture and detailed explanations

## Simple Example

**Explain function:** `/wbExplain src/utils/formatDate.ts` — returns a plain-English explanation of what the `formatDate` function does, its parameters, return format, and where it's used in the codebase.

**Explain directory:** `/wbExplain src/hooks/` — describes the hooks directory's purpose (custom React hooks for data fetching, auth state, and form management), lists each hook with a one-line summary.

**Architecture deep-dive:** `/wbExplain src/store/ --depth architecture` — explains the state management architecture, the store structure, middleware chain, and how components consume state.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


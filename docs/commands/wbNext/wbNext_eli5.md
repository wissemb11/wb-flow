# wbNext — ELI5 Guide

## What is this?

Suggests the next most impactful task to work on based on your project's current state, open issues, recent activity, and strategic priorities. It's like having a project manager who always knows what needs to be done next.

The suggestion engine evaluates tasks across multiple dimensions: priority (from issue tracker labels and milestones), recency (what you've been working on recently for context continuity), dependencies (what's blocking other tasks or blocked by them), effort (estimated time to complete), and impact (business value or user benefit). It then ranks and recommends the optimal next task.

**How It Decides:**
- **Priority analysis** — reads your issue tracker labels, milestone assignments, and manual priority tags
- **Dependency awareness** — identifies tasks that are blocking other work and surfaces them first
- **Recent context** — considers what you were working on recently to suggest follow-ups or related tasks
- **Effort estimation** — balances quick wins (small effort, high impact) against long-term projects
- **Strategic alignment** — checks tasks against the project vision or roadmap to ensure work is purposeful
- **WIP limits** — avoids suggesting too many simultaneous tasks, helping you focus and finish
- **Skill matching** — if configured, considers which tasks match your expertise and interests

**When to use it:** At the start of your workday, after finishing a task, or whenever you're unsure what to work on next.

## Why do I need it?

Decision fatigue is real — spending 15 minutes deciding what to work on is wasted energy. `wbNext` eliminates the "what should I do next?" question so you can start working immediately. It also ensures you're always working on the most impactful task rather than whatever happens to be top of mind.

**Tips:**
- Use `--focus bugs` during bug-fix sprints or `--focus features` during development sprints
- The suggestion is a recommendation, not an order — use your judgment
- Configure your issue tracker integration for the best results

## Simple Example

**Get suggestion:** `/wbNext` — analyzes current project state and suggests the optimal next task with a brief rationale.

**By category:** `/wbNext --focus bugs` — suggests the next highest-priority bug to fix, considering your current branch and recent activity.

**Quick wins:** `/wbNext --quick-wins` — filters suggestions to only those estimated to take less than 30 minutes, perfect for the end of a work session or when you need a confidence boost.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


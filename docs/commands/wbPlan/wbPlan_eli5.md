# wbPlan — ELI5 Guide

## What is this?

Breaks a high-level goal into a structured table of tasks with priorities, estimates, and dependencies. It analyzes your goal, considers your project's architecture and existing code, and produces an ordered execution plan that even junior team members can follow.

The planning engine uses a three-step process: scope decomposition (splitting your goal into atomic units of work), dependency resolution (ordering tasks so blockers are surfaced and scheduled first), and resource leveling (adjusting estimates based on parallelization opportunities and team size).

**What It Generates:**
- **Task breakdown** — atomic steps ordered by dependency and logical sequence
- **Priority labels** — P0 (blocker), P1 (important), P2 (nice-to-have) based on critical path analysis
- **Time estimates** — order-of-magnitude estimates (hours/days) per task using historical velocity
- **Dependency graph** — visual map showing which tasks block others
- **Risk flags** — highlights ambiguous requirements, high-complexity tasks, and integration touch-points

**When to use it:** Before starting any multi-step feature, refactor, or migration. Also useful for breaking down vague tickets from your issue tracker into concrete actionable items.

## Why do I need it?

Instead of staring at a big goal overwhelmed, this gives you a clear step-by-step plan with everything ordered. It removes the cognitive load of project planning — you describe the destination, and `wbPlan` figures out the route, the milestones, and the potential detours. No more forgetting steps or realizing halfway through that you need something you didn't prepare.

**Tips:**
- Be specific in your goal description — "Add dark mode" yields a better plan than "Improve UI"
- Use `--deadline` to let the planner flag scope risks if your timeline is too tight
- Review the plan before executing — the output is meant to be edited, not followed blindly

## Simple Example

**Basic planning:** `/wbPlan "Add dark mode support"` — returns a task table with design, implementation, testing, and review steps, each with a priority and estimated effort.

**With constraints:** `/wbPlan "Migrate from Flow to TypeScript" --deadline "2026-06-01" --team-size 3` — adjusts the plan to fit your timeline and team capacity, highlighting scope trade-offs.

**Iterative refinement:** `/wbPlan "Build admin dashboard" --existing-plan ./plan.md` — takes your existing plan, compares it to current project state, and suggests adjustments based on what's changed since planning.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


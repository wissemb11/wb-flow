# /wbPlan — Expert Guide

## Architecture

`wbPlan` uses a three-stage planning pipeline: **Scope decomposition** (splitting a goal into atomic tasks), **Dependency resolution** (ordering tasks by prerequisites), and **Resource leveling** (adjusting for team size and parallelization).

The output is a structured task table with columns for ID, description, priority (P0-P2), estimated effort (hours/days), dependencies, and status. Tasks are ordered by critical path — the longest chain of dependent tasks determines the minimum timeline.

## Key Design Decisions

- **Priority by impact:** P0 = blocking other work, P1 = important but not blocking, P2 = nice-to-have
- **Estimates are ranges:** Each task gets a best-case and worst-case estimate, summed to give a confidence interval
- **Risk flags:** Based on ambiguity in the goal statement, complexity of the affected code, and number of integration points

## When NOT to Use

- For simple one-step tasks (use `wbWork` directly)
- When the goal is already well-defined and broken down in your issue tracker
- For exploratory work where the steps are not yet known

## Edge Cases

- **Vague goals:** Returns a clarification request instead of guessing
- **Impossible deadlines:** Flags the constraint and suggests scope reduction
- **Empty project:** Can still plan but with a warning that estimates are less reliable without project history


## Advanced Usage

### Planning with Constraints

Use `--deadline` to let the planner flag scope risks. If the estimated timeline exceeds the deadline, the planner will suggest scope reductions or parallelization strategies.

### Iterative Refinement

Use `--existing-plan` to update an existing plan as conditions change. The planner will compare the original plan against current project state and suggest adjustments.


## Related

- [wbPlan ELI5](wbPlan_eli5.md) — Beginner-friendly overview
- [wbPlan Practical](wbPlan_practical.md) — Step-by-step walkthrough
- [Commands Overview](../README.md) — Full command catalog


> **Configuration tip:** Customize planning parameters in `.wb/plan-config.json` for team-specific estimation models.

---


← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

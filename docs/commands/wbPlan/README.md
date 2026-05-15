
<!-- MERGED CONTENT FROM commands/wbPlan/wbPlan_examples.md -->

# wbPlan — Canonical Examples

Below are the optimal invocation patterns for `/wbPlan`.

> **v5.1 note**: Every plan table now includes per-model cost annotations in the Worker column (`ModelName · ~$X.XX`). A `💰 Plan Budget Estimate` summary block is appended after the task table. See the template Column Rule #10 for the token heuristic and rate table.

### Creates a plan to add a new feature to wb-press2.
```bash
/wbPlan packages/wb-press2
```

### Plans with a deadline constraint.
```bash
wbPlan "Add dark mode" --deadline 2026-06-01
```

### Refines an existing plan with new context.
```bash
wbPlan "Refactor auth" --existing-plan ./plan.md
```

## Related Commands

`wbPlan` belongs to the **Planners** family. Sibling commands in this family:

- **[WbAudit](../wbAudit/README.md)** — [WbAudit Hub](../wbAudit/README.md)
- **[WbReview](../wbReview/README.md)** — [WbReview Hub](../wbReview/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Follow with `wbWork` for execution, or `wbActOn` to auto-execute the plan.


## Key Options

Output includes task table, dependency graph, risk flags. Use `--deadline` for time-boxed planning.

- Use `--help` or `/wbHelp wbPlan` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

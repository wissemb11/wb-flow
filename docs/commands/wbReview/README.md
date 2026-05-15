
<!-- MERGED CONTENT FROM commands/wbReview/wbReview_examples.md -->

# wbReview — Canonical Examples

Below are the optimal invocation patterns for `/wbReview`.

### Reviews the implementation in wb-press2 against its plan.
```bash
/wbReview packages/wb-press2 packages/wb-press2/.../plan_wb-press2.md
```

### Reviews entire feature branch.
```bash
wbReview --diff main...HEAD
```

### Review with context for better suggestions.
```bash
wbReview --context "Adds OAuth login"
```

## Related Commands

`wbReview` belongs to the **Planners** family. Sibling commands in this family:

- **[WbAudit](../wbAudit/README.md)** — [WbAudit Hub](../wbAudit/README.md)
- **[WbPlan](../wbPlan/README.md)** — [WbPlan Hub](../wbPlan/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run before pushing. Address `wbReview` findings before requesting human review.


## Key Options

Reports severity levels per finding. Use `--diff main...HEAD` for full branch review.

- Use `--help` or `/wbHelp wbReview` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

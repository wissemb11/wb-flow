
<!-- MERGED CONTENT FROM commands/wbAudit/wbAudit_examples.md -->

# wbAudit — Canonical Examples

Below are the optimal invocation patterns for `/wbAudit`.

### Audits the entire core2 monorepo.
```bash
/wbAudit frontEnd/wbc-ui/core2
```

### Audits the specific dev.md file for missing points.
```bash
/wbAudit packages/wb-core/dev.md
```

### Audits a single file for targeted review.
```bash
wbAudit src/components/Button.tsx --depth quick
```

### Compares audit scores against a previous baseline.
```bash
wbAudit . --baseline last-week.json --format summary
```

## Related Commands

`wbAudit` belongs to the **Planners** family. Sibling commands in this family:

- **[WbPlan](../wbPlan/README.md)** — [WbPlan Hub](../wbPlan/README.md)
- **[WbReview](../wbReview/README.md)** — [WbReview Hub](../wbReview/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Pipe results to `wbActOn` for auto-fix: `wbAudit src/ | wbActOn`. Run before and after refactors.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

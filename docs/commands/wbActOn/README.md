
<!-- MERGED CONTENT FROM commands/wbActOn/wbActOn_examples.md -->

# wbActOn — Canonical Examples

Below are the optimal invocation patterns for `/wbActOn`.

### Processes the audit and outputs an execution ranking.
```bash
/wbActOn packages/wb-core/.../audit_wb-core_20260426.md
```

### Finds latest report in the folder to act on.
```bash
/wbActOn packages/wb-core
```

### Pipes audit findings into auto-fix.
```bash
wbAudit src/ --format json | wbActOn
```

### Interactive mode for manual approval.
```bash
wbActOn plan.md --interactive
```

## Related Commands

`wbActOn` belongs to the **Strategists** family. Sibling commands in this family:

- **[WbWork](../wbWork/README.md)** — [WbWork Hub](../wbWork/README.md)
- **[WbPlan](../wbPlan/README.md)** — [WbPlan Hub](../wbPlan/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Chain after `wbAudit`, `wbReview`, or `wbRefactor` for auto-implementation.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

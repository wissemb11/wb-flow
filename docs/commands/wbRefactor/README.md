
<!-- MERGED CONTENT FROM commands/wbRefactor/wbRefactor_examples.md -->

# wbRefactor — Canonical Examples

Below are the optimal invocation patterns for `/wbRefactor`.

### Refactors utils.js for performance.
```bash
/wbRefactor packages/wb-core/src/utils.js
```

### Analyzes a module with high-confidence threshold.
```bash
wbRefactor src/api/ --min-confidence 0.8
```

### Auto-applies safe refactorings.
```bash
wbRefactor src/ --auto-fix --safe-only
```

## Related Commands

`wbRefactor` belongs to the **Workers** family. Sibling commands in this family:

- **[WbWork](../wbWork/README.md)** — [WbWork Hub](../wbWork/README.md)
- **[WbDoc](../wbDoc/README.md)** — [WbDoc Hub](../wbDoc/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run `wbRefactor`, review the plan, then `wbActOn plan.md` to apply changes.


## Key Options

Reports confidence scores per finding. Use `--auto-fix --safe-only` for automatic refactoring.

- Use `--help` or `/wbHelp wbRefactor` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

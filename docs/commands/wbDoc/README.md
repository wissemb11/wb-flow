
<!-- MERGED CONTENT FROM commands/wbDoc/wbDoc_examples.md -->

# wbDoc — Canonical Examples

Below are the optimal invocation patterns for `/wbDoc`.

### Documents index.js with JSDoc.
```bash
/wbDoc packages/wb-core/src/index.js
```

### Generates a comprehensive README for the wb-chart package.
```bash
/wbDoc packages/wb-chart
```

### Generates API documentation for a library.
```bash
wbDoc --api src/lib/ --format markdown --out docs/api/
```

### Updates changelog between git tags.
```bash
wbDoc --changelog --from v1.0.0 --to v1.1.0
```

## Related Commands

`wbDoc` belongs to the **Workers** family. Sibling commands in this family:

- **[WbWork](../wbWork/README.md)** — [WbWork Hub](../wbWork/README.md)
- **[WbRefactor](../wbRefactor/README.md)** — [WbRefactor Hub](../wbRefactor/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run before releases to update changelog. Run after refactors to update API docs.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

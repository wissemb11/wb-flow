
<!-- MERGED CONTENT FROM commands/wbCheck/wbCheck_examples.md -->

# wbCheck — Canonical Examples

Below are the optimal invocation patterns for `/wbCheck`.

### Tests all categories for that package.
```bash
/wbCheck packages/wb-core
```

### Checks only staged files with auto-fix enabled.
```bash
wbCheck --staged --fix
```

### Runs strict mode suitable for CI gating.
```bash
wbCheck . --strict --fail-on warning
```

### Checks a specific module in detail.
```bash
wbCheck src/api/ --depth full
```

## Related Commands

`wbCheck` belongs to the **Critics** family. Sibling commands in this family:

- **[WbTest](../wbTest/README.md)** — [WbTest Hub](../wbTest/README.md)
- **[WbValid](../wbValid/README.md)** — [WbValid Hub](../wbValid/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Configure as a pre-commit hook for automatic enforcement on every commit.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


<!-- MERGED CONTENT FROM commands/wbTest/wbTest_examples.md -->

# wbTest — Canonical Examples

Below are the optimal invocation patterns for `/wbTest`.

### Runs unit tests for wb-core.
```bash
/wbTest packages/wb-core UNIT
```

### Performs E2E manual testing on the demo app.
```bash
/wbTest apps/demo.wbc-ui.com E2E
```

### Retries flaky tests automatically.
```bash
wbTest --retry-flaky
```

### Compares results against main branch.
```bash
wbTest --diff main
```

## Related Commands

`wbTest` belongs to the **Critics** family. Sibling commands in this family:

- **[WbValid](../wbValid/README.md)** — [WbValid Hub](../wbValid/README.md)
- **[WbCheck](../wbCheck/README.md)** — [WbCheck Hub](../wbCheck/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run before pushing. Use `--retry-flaky` first, then investigate remaining failures.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


<!-- MERGED CONTENT FROM commands/wbContext/wbContext_examples.md -->

# wbContext — Canonical Examples

Below are the optimal invocation patterns for `/wbContext`.

### Generates context for the entire wb-core package.
```bash
/wbContext packages/wb-core
```

### Generates specific context for the index.js entry point.
```bash
/wbContext packages/wb-core/src/index.js
```

### Exports context as JSON for tool ingestion.
```bash
wbContext --out /tmp/context.json --format json
```

### Focused context for a specific module.
```bash
wbContext --focus src/auth/ --depth 3
```

## Related Commands

`wbContext` belongs to the **Context Builders** family. Sibling commands in this family:

- **[WbSetup](../wbSetup/README.md)** — [WbSetup Hub](../wbSetup/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Use before any LLM session. Pipe output: `wbContext --out ctx.json`, then reference in your agent prompt.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


<!-- MERGED CONTENT FROM commands/wbDebug/wbDebug_examples.md -->

# wbDebug — Canonical Examples

Below are the optimal invocation patterns for `/wbDebug`.

### Debugs the reactivity loop in App.vue.
```bash
/wbDebug packages/wb-core/src/App.vue
```

### Debugs based on a specific stack trace.
```bash
/wbDebug "TypeError: undefined is not an object"
```

### Debugs from a natural language description.
```bash
wbDebug "Form submits duplicate entries"
```

### Git bisect to find regression origin.
```bash
wbDebug --bisect abc123..def456 src/utils/
```

## Related Commands

`wbDebug` belongs to the **Workers** family. Sibling commands in this family:

- **[WbWork](../wbWork/README.md)** — [WbWork Hub](../wbWork/README.md)
- **[WbDoc](../wbDoc/README.md)** — [WbDoc Hub](../wbDoc/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Start with a stack trace, review the suggested fix, verify with `wbTest`.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

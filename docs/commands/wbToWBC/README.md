
<!-- MERGED CONTENT FROM commands/wbToWBC/wbToWBC_examples.md -->

# wbToWBC — Canonical Examples

Below are the optimal invocation patterns for `/wbToWBC`.

### Converts legacy table to wb-dataviewer JSON prop.
```bash
/wbToWBC legacy-table.vue
```

### Generates config as ES module.
```bash
wbToWBC --out bundler.config.mjs --format esm
```

### Migration diff from Webpack.
```bash
wbToWBC --from webpack --diff
```

## Related Commands

`wbToWBC` belongs to the **Strategists** family. Sibling commands in this family:

- **[WbDeploy](../wbDeploy/README.md)** — [WbDeploy Hub](../wbDeploy/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run once to generate config. Review and customize before committing.


## Key Options

Generates WBC config for Vite/Webpack/Rollup. Detects framework and plugins automatically.

- Use `--help` or `/wbHelp wbToWBC` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


<!-- MERGED CONTENT FROM commands/wbSetup/wbSetup_examples.md -->

# wbSetup — Canonical Examples

Below are the optimal invocation patterns for `/wbSetup`.

### Sets up the agentic context and dev rules for the wb-core package.
```bash
/wbSetup packages/wb-core
```

### Non-interactive setup with stack declaration.
```bash
wbSetup /path/to/project --yes --stack typescript,react,vitest
```

### Reconfigures existing setup.
```bash
wbSetup . --reconfigure
```

## Related Commands

`wbSetup` belongs to the **Context Builders** family. Sibling commands in this family:

- **[WbContext](../wbContext/README.md)** — [WbContext Hub](../wbContext/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

After setup, run `wbValid --quick` to verify, then `wbContext` to load project context.


## Key Options

Idempotent — safe to re-run. Detects framework from package.json. Use `--stack` for explicit config.

- Use `--help` or `/wbHelp wbSetup` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

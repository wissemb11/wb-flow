
<!-- MERGED CONTENT FROM commands/wbClean/wbClean_examples.md -->

# wbClean — Canonical Examples

Below are the optimal invocation patterns for `/wbClean`.

### Scans wb-dataviewer for entropy and dead code.
```bash
/wbClean packages/wb-dataviewer
```

### Shows what would be deleted before cleaning.
```bash
wbClean --dry-run
```

### Deep clean removing node_modules too.
```bash
wbClean --deep
```

## Related Commands

`wbClean` belongs to the **Surgeons** family. Sibling commands in this family:

- **[WbLicense](../wbLicense/README.md)** — [WbLicense Hub](../wbLicense/README.md)
- **[WbSecure](../wbSecure/README.md)** — [WbSecure Hub](../wbSecure/README.md)
- **[WbTranslate](../wbTranslate/README.md)** — [WbTranslate Hub](../wbTranslate/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run before switching branches or after dependency changes for a fresh state.


## Key Options

Use `--dry-run` to preview. Use `--deep` for full clean including node_modules. Framework-aware rules.

- Use `--help` or `/wbHelp wbClean` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

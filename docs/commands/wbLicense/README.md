
<!-- MERGED CONTENT FROM commands/wbLicense/wbLicense_examples.md -->

# wbLicense — Canonical Examples

Below are the optimal invocation patterns for `/wbLicense`.

### Injects Pro tier gating into the PremiumTable component.
```bash
/wbLicense packages/wb-core/src/components/PremiumTable.vue
```

### Compliance audit of all dependencies.
```bash
wbLicense --check
```

### Adds SPDX headers to source files.
```bash
wbLicense --headers --style spdx-mit
```

## Related Commands

`wbLicense` belongs to the **Surgeons** family. Sibling commands in this family:

- **[WbClean](../wbClean/README.md)** — [WbClean Hub](../wbClean/README.md)
- **[WbSecure](../wbSecure/README.md)** — [WbSecure Hub](../wbSecure/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run at project inception. Use `--check` when adding new dependencies.


## Key Options

Use `--check` for compliance audit. Supports MIT, Apache-2.0, GPL-3.0, MPL-2.0, and more.

- Use `--help` or `/wbHelp wbLicense` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

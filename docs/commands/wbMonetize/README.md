
<!-- MERGED CONTENT FROM commands/wbMonetize/wbMonetize_examples.md -->

# wbMonetize — Canonical Examples

Below are the optimal invocation patterns for `/wbMonetize`.

### Bootstraps monetization for dataviewer.
```bash
/wbMonetize packages/wb-dataviewer
```

### Recommends licensing model only.
```bash
wbMonetize --license-only
```

### Adjusts pricing plan by percentage.
```bash
wbMonetize --existing-plan ./pricing.json --adjust +15%
```

## Related Commands

`wbMonetize` belongs to the **Strategists** family. Sibling commands in this family:

- **[WbVision](../wbVision/README.md)** — [WbVision Hub](../wbVision/README.md)
- **[WbLicense](../wbLicense/README.md)** — [WbLicense Hub](../wbLicense/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run early in project lifecycle to inform licensing and pricing decisions.


## Key Options

Reads usage data from `.wb/metrics/`. Produces tier recommendations with revenue projections.

- Use `--help` or `/wbHelp wbMonetize` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

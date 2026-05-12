
<!-- MERGED CONTENT FROM commands/wbSecure/wbSecure_examples.md -->

# wbSecure — Canonical Examples

Below are the optimal invocation patterns for `/wbSecure`.

### Performs red team security scan on wb-core.
```bash
/wbSecure packages/wb-core
```

### Scans only staged changes for secrets.
```bash
wbSecure --staged
```

### Dependencies-only audit for CI.
```bash
wbSecure --deps-only --fail-on high
```

## Related Commands

`wbSecure` belongs to the **Surgeons** family. Sibling commands in this family:

- **[WbClean](../wbClean/README.md)** — [WbClean Hub](../wbClean/README.md)
- **[WbLicense](../wbLicense/README.md)** — [WbLicense Hub](../wbLicense/README.md)
- **[WbTranslate](../wbTranslate/README.md)** — [WbTranslate Hub](../wbTranslate/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run before production deploys. Use `--staged` as a pre-commit hook.


## Key Options

Layered detection: regex patterns, static analysis, CVE database. Use `--staged` for pre-commit.

- Use `--help` or `/wbHelp wbSecure` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

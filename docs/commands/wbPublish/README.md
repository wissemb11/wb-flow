
<!-- MERGED CONTENT FROM commands/wbPublish/wbPublish_examples.md -->

# wbPublish — Canonical Examples

Below are the optimal invocation patterns for `/wbPublish`.

### Builds and publishes the monorepo packages to NPM.
```bash
/wbPublish frontEnd/wbc-ui/core2
```

### Publishes with a custom domain.
```bash
wbPublish --domain docs.myproject.dev
```

### Generates CI workflow for automated publishing.
```bash
wbPublish --ci-only
```

## Related Commands

`wbPublish` belongs to the **Shippers** family. Sibling commands in this family:

- **[WbRelease](../wbRelease/README.md)** — [WbRelease Hub](../wbRelease/README.md)
- **[WbDeploy](../wbDeploy/README.md)** — [WbDeploy Hub](../wbDeploy/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run `--ci-only` once to set up auto-publishing, then never think about it again.


## Key Options

Builds docs, pushes to gh-pages, purges CDN. Use `--ci-only` to generate GitHub Actions workflow.

- Use `--help` or `/wbHelp wbPublish` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

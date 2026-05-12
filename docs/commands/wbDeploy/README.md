
<!-- MERGED CONTENT FROM commands/wbDeploy/wbDeploy_examples.md -->

# wbDeploy — Canonical Examples

Below are the optimal invocation patterns for `/wbDeploy`.

### Deploys the demo app to production.
```bash
/wbDeploy apps/demo.wbc-ui.com production
```

### Deploys a preview for branch review.
```bash
wbDeploy --target netlify --preview --branch feature/dashboard
```

### Deploys with a custom domain to GitHub Pages.
```bash
wbDeploy --target gh-pages --domain docs.myproject.dev
```

## Related Commands

`wbDeploy` belongs to the **Shippers** family. Sibling commands in this family:

- **[WbRelease](../wbRelease/README.md)** — [WbRelease Hub](../wbRelease/README.md)
- **[WbPublish](../wbPublish/README.md)** — [WbPublish Hub](../wbPublish/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Use `--preview` for feature branches, `--prod` for releases. Verify smoke test.


## Key Options

Supports --target (gh-pages, vercel, netlify), --preview for branches, --prod for production.

- Use `--help` or `/wbHelp wbDeploy` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

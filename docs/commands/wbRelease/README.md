
<!-- MERGED CONTENT FROM commands/wbRelease/wbRelease_examples.md -->

# wbRelease — Canonical Examples

Below are the optimal invocation patterns for `/wbRelease`.

### Prepares core2 monorepo for release v1.0.0-r02.
```bash
/wbRelease frontEnd/wbc-ui/core2 v1.0.0-r02
```

### Creates a beta pre-release.
```bash
wbRelease --tag beta --preid beta
```

### Dry run to preview the release.
```bash
wbRelease --dry-run --verbose
```

## Related Commands

`wbRelease` belongs to the **Shippers** family. Sibling commands in this family:

- **[WbPublish](../wbPublish/README.md)** — [WbPublish Hub](../wbPublish/README.md)
- **[WbDeploy](../wbDeploy/README.md)** — [WbDeploy Hub](../wbDeploy/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Always `--dry-run` first. Follow with `wbBroadcast` for team notification.


## Key Options

Calculates semver from conventional commits. Supports --preid for pre-releases. Dry-run to preview.

- Use `--help` or `/wbHelp wbRelease` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


<!-- MERGED CONTENT FROM commands/wbBroadcast/wbBroadcast_examples.md -->

# wbBroadcast — Canonical Examples

Below are the optimal invocation patterns for `/wbBroadcast`.

### Creates announcement kit for wb-press2 release.
```bash
/wbBroadcast packages/wb-press2
```

### Sends audit results to security channel.
```bash
wbAudit . --ci && wbBroadcast --channel security
```

### Custom message broadcast.
```bash
wbBroadcast --message "Staging ready for QA" --channel staging
```

## Related Commands

`wbBroadcast` belongs to the **Strategists** family. Sibling commands in this family:

- **[WbHelp](../wbHelp/wbHelp.md)** — [WbHelp Hub](../wbHelp/wbHelp.md)
- **[WbStandup](../wbStandup/README.md)** — [WbStandup Hub](../wbStandup/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Chain after `wbRelease`, `wbDeploy`, or `wbAudit` for automatic notifications.


## Key Options

Configure channels in `.wb/broadcast.json`. Supports Slack webhooks, Discord, and email SMTP.

- Use `--help` or `/wbHelp wbBroadcast` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

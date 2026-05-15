
<!-- MERGED CONTENT FROM commands/wbStandup/wbStandup_examples.md -->

# wbStandup — Canonical Examples

Below are the optimal invocation patterns for `/wbStandup`.

### Generates a monorepo-wide daily standup report.
```bash
/wbStandup frontEnd/wbc-ui/core2
```

### Team standup for the whole group.
```bash
wbStandup --team --since "yesterday 9am"
```

### Posts standup to Slack channel.
```bash
wbStandup --format slack --channel standup
```

## Related Commands

`wbStandup` belongs to the **Archivists** family. Sibling commands in this family:

- **[WbTrack](../wbTrack/README.md)** — [WbTrack Hub](../wbTrack/README.md)
- **[WbLog](../wbLog/README.md)** — [WbLog Hub](../wbLog/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run at end of day. Review output before posting to add context.


## Key Options

Queries git log, GitHub API, and issue tracker. Supports Slack formatting with `--format slack`.

- Use `--help` or `/wbHelp wbStandup` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

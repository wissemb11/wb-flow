
<!-- MERGED CONTENT FROM commands/wbTrack/wbTrack_examples.md -->

# wbTrack — Canonical Examples

Below are the optimal invocation patterns for `/wbTrack`.

### Standard Execution
```bash
/wbTrack packages/target
```
### Tracks linked to a GitHub issue.
```bash
wbTrack --issue #142 --branch fix/login-timeout
```

### Tracks with estimate and billable flag.
```bash
wbTrack "Build API client" --estimate 4h --billable
```

## Related Commands

`wbTrack` belongs to the **Archivists** family. Sibling commands in this family:

- **[WbStopTrack](../wbStopTrack/README.md)** — [WbStopTrack Hub](../wbStopTrack/README.md)
- **[WbLog](../wbLog/README.md)** — [WbLog Hub](../wbLog/README.md)
- **[WbStandup](../wbStandup/README.md)** — [WbStandup Hub](../wbStandup/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)

---

<!-- MERGED CONTENT FROM commands/wbTrack/wbTrack.md -->

# wbTrack — Reference

> **Purpose:** No description available.
>

---

## Overview
The `/wbTrack` command is a core utility in the WB-Labs Agentic Workflow. It adheres to the 4D Temporal Navigation architecture (`reports/<YYYY>/<MM>/<DD>`) and Smart Merge Protocols.


---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

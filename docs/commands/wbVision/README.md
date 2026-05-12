
<!-- MERGED CONTENT FROM commands/wbVision/wbVision_examples.md -->

# wbVision — Canonical Examples

Below are the optimal invocation patterns for `/wbVision`.

### Proposes next-gen features for wb-code.
```bash
/wbVision packages/wb-code
```

### Refines existing vision document.
```bash
wbVision --refine VISION.md --feedback "focus on mobile"
```

### Diffs current trajectory against vision.
```bash
wbVision --diff v1.0.0..HEAD
```

## Related Commands

`wbVision` belongs to the **Strategists** family. Sibling commands in this family:

- **[WbIdea](../wbIdea/README.md)** — [WbIdea Hub](../wbIdea/README.md)
- **[WbNext](../wbNext/README.md)** — [WbNext Hub](../wbNext/README.md)
- **[WbExplain](../wbExplain/README.md)** — [WbExplain Hub](../wbExplain/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Create at project start, refresh quarterly. Use `--diff` to track alignment.


## Key Options

Produces vision statement, strategic goals, principles, timeline. Refresh quarterly.

- Use `--help` or `/wbHelp wbVision` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


<!-- MERGED CONTENT FROM commands/wbValid/wbValid_eli5.md -->

# /wbValid — Explain Like I'm 5

Imagine you are building a really awesome Lego spaceship, and your friend gives you a set of instructions (that's the **Plan**). 

Another friend actually snaps all the Lego pieces together to build the ship (that's the **Worker**, using `/wbWork`).

When they finish, how do you know they didn't put the wings on backwards or forget the rockets? You need an inspector to double-check! 

That's exactly what **`/wbValid`** does! It's the friendly Lego Inspector. It looks at the instructions, looks at the finished spaceship, and checks if they match perfectly. If everything looks great, it puts a big green checkmark (✅) on the plan. If something is wrong, it tells the builder exactly how to fix it!

### Quick pre-flight validation.
```bash
wbValid --quick
```

### Auto-fixes common configuration issues.
```bash
wbValid --fix
```

## Related Commands

`wbValid` belongs to the **Critics** family. Sibling commands in this family:

- **[WbTest](../wbTest/README.md)** — [WbTest Hub](../wbTest/README.md)
- **[WbCheck](../wbCheck/README.md)** — [WbCheck Hub](../wbCheck/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Run after `wbSetup` and before filing bug reports. First step in troubleshooting.


## Key Options

Runs 7 categories of checks. Use `--quick` for pre-flight. Use `--fix` for auto-correction.

- Use `--help` or `/wbHelp wbValid` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

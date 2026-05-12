
<!-- MERGED CONTENT FROM commands/wbWork/wbWork_eli5.md -->

# /wbWork — Explain Like I'm 5

Imagine you have a big coloring book, and on the very first page is a list of instructions:
1. Color the sun yellow.
2. Color the grass green.
3. Draw a little bird in the sky.

This list is your **Plan**. 

Now, imagine you have a magical robot friend holding a box of crayons. If you tell the robot, "Please do step number 2!" the robot will pick up the green crayon, find the grass, color it in perfectly, and then put a big checkmark next to step 2 on your list.

That magical robot friend is **`/wbWork`**! 

It's the tool that actually reads the instructions and does the hard work. You tell it which task to do by giving it an ID (like `--id=2`), and it writes the code, updates the files, and checks off the box so you know it's done!

*(New magic trick!)* You can also just give the robot a brand new problem (like `"Fix the broken toy!"`). The robot is smart enough to think: "Is this easy? I'll just fix it and add it to the list." or "Is this hard? I better write down a mini-plan first, and then do the steps one by one!"

### Fixes a specific bug with analysis.
```bash
wbWork "Fix login button not clickable on mobile"
```

### Multi-step refactor with verification.
```bash
wbWork "Refactor API client to use fetch instead of axios"
```

## Related Commands

`wbWork` belongs to the **Workers** family. Sibling commands in this family:

- **[WbRefactor](../wbRefactor/README.md)** — [WbRefactor Hub](../wbRefactor/README.md)
- **[WbDoc](../wbDoc/README.md)** — [WbDoc Hub](../wbDoc/README.md)
- **[WbDebug](../wbDebug/README.md)** — [WbDebug Hub](../wbDebug/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

The central orchestrator — use for multi-step tasks instead of chaining commands manually.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

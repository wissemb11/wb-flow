
<!-- MERGED CONTENT FROM commands/wbIdea/wbIdea_eli5.md -->

# /wbIdea — ELI5

Imagine you have a spark of inspiration—a feature that could be amazing, but you're not ready to lock it into a concrete task yet. That's exactly where `/wbIdea` shines.

Think of `/wbIdea` as a high-powered **incubator for your thoughts**. Instead of getting lost in a chat history or cluttering up your active execution plan, your idea is captured, scored, and tracked. 

It sits perfectly between dreaming and doing:

```
wbVision ──► wbIdea ──► wbPlan ──► wbWork ──► wbValid
 (dream)    (capture)  (commit)   (execute)  (verify)
```

Every idea gets an advisory score from 1 to 10 based on its impact, feasibility, and urgency. When you're ready, you or an AI agent can evaluate the idea. If it's brilliant and timely, it gets marked as `🎯 Promoted` and automatically transforms into an actionable task in your `/wbPlan` the very next time you plan. 

It's your bridge from "what if" to "let's build it."

## Related Commands

`wbIdea` belongs to the **Strategists** family. Sibling commands in this family:

- **[WbVision](../wbVision/README.md)** — [WbVision Hub](../wbVision/README.md)
- **[WbNext](../wbNext/README.md)** — [WbNext Hub](../wbNext/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Capture ideas as they come. Review and promote to `wbPlan` weekly.


## Key Options

Ideas are stored in `.wb/ideas/`. Promote to `wbPlan` for execution. Tag with priority and category.

- Use `--help` or `/wbHelp wbIdea` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

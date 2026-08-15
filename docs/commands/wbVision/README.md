# /wbVision — Command Hub

`/wbVision` produces high-level strategic analysis of a product's direction, competitive position, and roadmap recommendations. It synthesizes from README, commits, issues, and architecture into a structured document. Unlike `/wbPlan` which produces tactical task lists, `/wbVision` operates at the product strategy level — answering *what should we build and why*, not *how do we build it*.

## 🎯 Strategic Position

`/wbVision` operates above the tactical layer of the command suite. While `/wbPlan` tells you how to build something and `/wbAudit` tells you how healthy the code is, `/wbVision` answers the question that should come before either: what should exist in the first place, and why. Create it at project start, refresh it quarterly, and use `--diff` to check whether development trajectory aligns with the stated direction.

- **At project start** — create the initial vision document.
- **Quarterly** — refresh and validate the strategic direction.
- **Before a major roadmap decision** — check alignment.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Create** | `/wbVision <project>` | Strategic document synthesized from README, commits, issues, architecture |

| **Trajectory** | `/wbVision --diff` | Alignment check: is development matching the stated direction? |

## ✅ What a useful vision document contains

A useful vision document includes at minimum:

1. **Product direction** — what are we building and for whom.
2. **Competitive positioning** — where this fits in the market landscape.
3. **Roadmap recommendations** with rationale — priorities, not just a list.
4. **Source traceability** — synthesis grounded in README, commits, issues, and architecture.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Plan tactical tasks | [`/wbPlan`](../wbPlan/README.md) |
| Audit code quality | [`/wbAudit`](../wbAudit/README.md) |

It also does not execute any changes — it is analysis only.

## 📚 Reading Order

1. **[ELI5](wbVision_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbVision_practical.md)** — step-by-step walkthrough on a real project.
3. **[Expert](wbVision_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbVision_examples.md)** — annotated transcripts ([Part 1](wbVision_examples.md), [Part 2](wbVision_examples.md)).
5. **[Exhaustive simulation](wbVision_exhaustive_simulation.md)** · **[Live demo](wbVision_live_demo.md)**.

## 🔗 Related

- [`wbVision.md`](wbVision.md) — the command reference this hub orients you around.
- [`/wbPlan`](../wbPlan/README.md) — turn strategic direction into tactical tasks.
- [`/wbAudit`](../wbAudit/README.md) — score the code that implements the vision.

## Quick Reference

```bash
/wbVision my-project/              # create a vision from project sources

/wbVision --diff                   # check if current work aligns with vision
/wbVision <project> --snap=<label> # pin output to .wb/snaps/
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

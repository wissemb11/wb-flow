# /wbReview — Command Hub

`/wbReview` performs a targeted review of specific code changes against a plan. It verifies that every task marked complete was *actually* completed, catching the single failure mode an audit misses: checkbox optimism. Unlike `/wbAudit` which evaluates an entire codebase holistically, `/wbReview` zooms in on a specific diff or plan, making it faster and more focused for day-to-day verification.

## 🎯 Strategic Position

The default failure mode of an AI worker is marking tasks ✅ without finishing them. `/wbReview` is the adversarial second pass that asks: *"assume the worker was lazy. Where did they cut corners?"* It requires a plan file — without one you're at the wrong command.

- **After an AI worker finishes a plan** — verify every checkbox against code.
- **After executing a plan yourself** — your own work is what you're least qualified to judge.
- **Post-hoc on a hotfix** — quick check against the brief plan written under pressure.
- **After a docs rewrite** — verify nothing was hallucinated.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Standard** | `/wbReview <target> --plan=<plan>` | PASS / PASS WITH DEBT / FAIL verdict with task-level detail |
| **Act** | `/wbReview <target> --plan=<plan> --act` | Verdict plus automatic fix-up of failed tasks |
| **Chain to plan** | `/wbReview <target> --plan=<plan> --wbPlan` | Verdict plus next-step plan generation |

## ✅ What a useful review contains

1. A **verdict**: 🟢 PASS, 🟡 PASS WITH DEBT, or 🔴 FAIL.
2. **Task-level detail** — which checkbox claims passed but the code didn't.
3. A **"what the review found that the plan missed"** section — side effects, new deps, regressions.
4. A **score** (1–10) with a merge / don't-merge recommendation.
5. **Re-opened checkboxes** in the plan file for failed tasks.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Audit the entire codebase | [`/wbAudit`](../wbAudit/README.md) |
| Run tests | [`/wbTest`](../wbTest/README.md) |
| Fix issues automatically | Combine with `--act` flag |
| Is this file good? | [`/wbAudit <file>`](../wbAudit/README.md) |
| Pre-release sanity check | [`/wbAudit`](../wbAudit/README.md) |

It refuses if the plan file is missing, malformed, or if the current code state has no detectable relationship to the plan.

## 📚 Reading Order

1. **[ELI5](wbReview_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbReview_practical.md)** — step-by-step on a real project.
3. **[Expert](wbReview_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbReview_examples.md)** · **[Part 1](wbReview_examples.md)** · **[Part 2](wbReview_examples.md)** — annotated transcripts.
5. **[Exhaustive simulation](wbReview_exhaustive_simulation.md)** · **[Live demo](wbReview_live_demo.md)**.

## 🔗 Related

- [`wbReview.md`](wbReview.md) — the command reference this hub orients you around.
- [`/wbAudit`](../wbAudit/README.md) — holistic assessment when you don't have a plan.
- [`/wbPlan`](../wbPlan/README.md) — the plan you review against.
- [`/wbTest`](../wbTest/README.md) — runtime verification after review passes.

## Quick Reference

```bash
/wbReview <target> --plan=<plan.md>            # verify plan execution
/wbReview <target> --plan=<plan.md> --act      # verify and autofix
/wbReview <target> --plan=<plan.md> --wbPlan   # verify and generate next steps
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

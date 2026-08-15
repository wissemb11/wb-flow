# /wbVision — Practical

## Two forms

```
/wbVision <package> # package-specific feature ideas
/wbVision core2/ # cross-package / monorepo-wide ideas
```

The cross-package form is generally more useful than the per-package form.

## When to run

- Occasionally (monthly or less). Daily use flattens your own judgment.
- After a major release cycle closed, when queue is genuinely empty.
- Before `/wbSetup` on a new package — ask what this package *should* contain.

## When *not* to run

- Daily. Brainstorming on a clock dulls intuition.
- As a substitute for `/wbStandup` ("what should I do today?"). Standup reconciles existing work; vision invents new work. Different questions.
- When you already have a plan. The plan is the answer; don't re-brainstorm.

## Reading the output

Each idea should have:

- **Premise** — one-sentence description.
- **Value** — why it matters.
- **Risk** — what could go wrong.
- **Effort** — SMALL / MEDIUM / LARGE.

If any field is missing, the idea is underspecified. Push back: *"re-run but put all 4 fields on every idea."*

## The filtering step is the command's actual value

You read 6 ideas. You discard 4 as obvious or generic. You discard 1 more as "interesting but wrong timing." The 1 that remains is the vision output. If all 6 survive, you haven't filtered hard enough.

## The anti-pattern

**Running `/wbVision` on a package that has open work.** If `/wbStandup` shows open plans and unresolved findings, the "what next?" question has an answer already. Vision is for when the answer is genuinely empty.

## The most useful invocation

Cross-package (`/wbVision core2/`) with a focus on integration ideas — things that couldn't be seen at package scope. This is where `/wbVision` earns its place over "just brainstorm with an AI."

## When /wbVision is the wrong command

- Reconcile state → `/wbStandup`.
- Execute on committed work → `/wbPlan`.
- Fix a bug → `/wbDebug`.
- Business / market / user research → `/wbVision` can't see these; do it yourself.

---

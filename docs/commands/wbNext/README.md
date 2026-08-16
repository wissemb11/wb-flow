# /wbNext — Command Hub

`/wbNext` is the WB-Labs decision-support engine. It reads recent workflow state — audits, plans, task reports, git history — and recommends the single most impactful next move. Unlike `/wbPlan` which produces a full roadmap, `/wbNext` answers one question: *"I'm standing here, what should I do right now?"*

![The closed feedback loop](../../public/diagrams_claude/ClosedLoopAnimation.gif)

*`/wbNext` is the closing edge of the loop: it reads the reports the other commands left behind and tells you which verb comes next.*

## 🎯 Strategic Position

`/wbNext` exists because the default failure mode of an AI-assisted workflow is choice paralysis. After running an audit, finishing a plan row, or returning from a break, the set of possible next actions is too large. `/wbNext` computes value × urgency across the report tree and returns one ranked recommendation — plus a list of alternatives it considered and rejected, so you can disagree if your judgment differs.

- **You just sat down** — whole-monorepo scan, single recommendation.
- **End of a logical unit of work** — finished a thing; what's the next thing?
- **After a long absence** — back from vacation, no idea what state the repo is in.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Monorepo-wide** | `/wbNext` | One recommendation + considered-and-rejected alternatives, based on all recent reports |
| **Package-scoped** | `/wbNext <package-path>` | Same, narrowed to a single package's report tree |
| **Self-correct** | `/wbNext <previous_output_file>` | Re-ranks suggestions, fills missing fields, preserves user annotations |

## ✅ What a useful next-action recommendation contains

1. A **specific command** to run — not "review code" but `/wbAudit packages/wb-core/`.
2. A **why** section — the signals that led to this recommendation (stale audit, new commits, clean test gate).
3. A **considered and rejected** section — the alternatives that were evaluated and why they ranked lower.
4. The **time window** it scanned (default: `--since=7d`).

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Produce a multi-step roadmap | [`/wbPlan`](../wbPlan/README.md) or [`/wbVision`](../wbVision/README.md) |
| List everything in flight | [`/wbStandup`](../wbStandup/README.md) |
| Execute the suggested command | Describe the task directly to the AI |
| Track session state across runs | [`/wbTrack`](../wbTrack/README.md) |

## 📚 Reading Order

1. **[ELI5](wbNext_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbNext_practical.md)** — step-by-step on a real project.
3. **[Expert](wbNext_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbNext_examples.md)** — annotated transcripts from actual sessions.
5. **[Exhaustive simulation](wbNext_exhaustive_simulation.md)** · **[Live demo](wbNext_live_demo.md)**.

## 🔗 Related

- [`wbNext.md`](wbNext.md) — the command reference this hub orients you around.
- [`/wbPlan`](../wbPlan/README.md) — multi-step roadmap from audits and reviews.
- [`/wbStandup`](../wbStandup/README.md) — everything in flight across the project.
- [`/wbAudit`](../wbAudit/README.md) — the most common source signal for `/wbNext`.
- [`/wbContext`](../wbContext/README.md) — run first if no `reports/` exist yet.

## Quick Reference

```bash
/wbNext                   # whole-monorepo recommendation
/wbNext <package-path>    # narrowed to one package
/wbNext --since=14d       # scan the last 14 days of reports
```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

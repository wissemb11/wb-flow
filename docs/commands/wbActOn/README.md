# /wbActOn — Command Hub

`/wbActOn` is the command reference resolver that bridges diagnosis and execution. It reads an audit, review, or plan file and produces a Ranked Execution Order — converting passive findings into active, prioritized tasks. It is read-only and never modifies the source diagnostic file.

## 🎯 Strategic Position

Every diagnostic command tells you what is *wrong*. `/wbActOn` tells you what to *do first*. Without it, findings sit in a report file while you decide which one matters most. With it, you get a numbered execution thread ranked by severity, cost, and dependency.

- **After `/wbAudit`** — turns 23 findings into a 3-rank execution thread.
- **After `/wbReview`** — triages review comments into act / push-back / defer.
- **After `/wbPlan`** — re-ranks plan steps by your actual constraints.
- **On any third-party doc** — competitor analysis, security report, design memo.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Mirror** | `/wbActOn <file under .wb/workflows/reports/>` | Action file anchored in the same target's report tree |
| **Side-car** | `/wbActOn <file anywhere else>` | Action file anchored at monorepo root |
| **Pick-then-process** | `/wbActOn <folder>` | Lists recent reports, asks which (skips if one) |
| **Action + Plan** | `/wbActOn <input> --wbPlan` | Action file + sibling plan file (one task table per 🔵 finding) |

## ✅ What a useful action walkthrough contains

1. A **self-declared model identity** at the top (`# I am <ModelName>...`).
2. A **🧭 Decision Tree** with the 5-color classification (🟢 🟡 🔴 🟣 🔵).
3. A **🚦 §0 — If I Were You** ranked execution thread with justifications and time windows.
4. **Annotated source** — original content unchanged, with `[<ModelName> action]` callouts on every finding.
5. An **Action Tally** appendix with count per color and recommended-model mix.
6. A **"How to use"** footer with the 5-step method.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Execute code or apply fixes | The prompts/commands `/wbActOn` produced |
| Modify the source diagnostic file | Read-only — never touches the original |
| Validate ranked actions are correct | [`/wbValid`](../wbValid/README.md) |
| Invent findings not in the source | Fix the source first; `/wbActOn` annotates, not authors |
| Replace the upstream diagnostic | [`/wbAudit`](../wbAudit/README.md), [`/wbReview`](../wbReview/README.md), [`/wbPlan`](../wbPlan/README.md) |

## 📚 Reading Order

1. **[ELI5](wbActOn_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbActOn_practical.md)** — the two modes and when each applies.
3. **[Expert](wbActOn_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbActOn_examples.md)** — annotated action walkthrough transcripts.
5. **[Exhaustive simulation](wbActOn_exhaustive_simulation.md)** · **[Live demo](wbActOn_live_demo.md)**.

## 🔗 Related

- [`wbActOn.md`](wbActOn.md) — the command reference this hub orients you around.
- [`/wbAudit`](../wbAudit/README.md) — produces the audits `/wbActOn` most often processes.
- [`/wbReview`](../wbReview/README.md) — review comments triaged into ranked actions.
- [`/wbPlan`](../wbPlan/README.md) — chains into plan generation via `--wbPlan`.
- [`/wbNext`](../wbNext/README.md) — ranks what to do once an action walkthrough lands.

## Quick Reference

```bash
/wbActOn audit_wb-core_20260426.md       # process a specific diagnostic file
/wbActOn packages/wb-core                 # folder — auto-picks latest report
/wbActOn <input> --wbPlan                 # action file + sibling plan file
/wbAudit <pkg> --act                      # chain from audit (calls /wbActOn internally)
/wbReview <pkg> --act                     # chain from review
```

---
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

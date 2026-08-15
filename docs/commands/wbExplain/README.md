# /wbExplain — Command Hub

`/wbExplain` produces detailed, depth-controlled explanations of code — from ELI5 plain-language summaries to expert architectural deep-dives. It works on plan rows (explain a task before executing), on folders (understand a subsystem), and on arbitrary natural-language questions. Every explanation is grounded in actual code, cites file paths and line numbers, and is saved as a versioned artifact rather than ephemeral chat.

## 🎯 Strategic Position

`/wbExplain` is the "read before you write" gate. It bridges the gap between a vague plan row and a confident `/wbWork` invocation. It also serves onboarding — giving new contributors structured understanding of the codebase at their chosen depth level.

- **Before `/wbWork`** — explain a task row so you execute with confidence.
- **Before touching a subsystem** — understand how it works before making changes.
- **For onboarding** — batch-explain all open tasks at a contributor's language and depth.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Plan-row** | `/wbExplain plan.md --id=1 --as=eli5` | Task explanation with summary + deep dive + recommended approach |
| **Subsystem** | `/wbExplain packages/wb-core/ "How does...?" --as=expert` | Deep dive on a folder, citing file paths and line numbers |
| **Multi-persona** | `/wbExplain plan.md --id=1 --as=eli5,fr,ar` | Multi-language explanation in one file |
| **Wildcard batch** | `/wbExplain packages/wb-core/ * --as=expert` | One explanation per open task row |

## ✅ What a useful explanation contains

1. A **high-level summary** — what this code or task is about.
2. A **deep dive** with file paths and line numbers from actual code.
3. A **recommended approach** (for plan-row mode) — structured steps for `/wbWork`.
4. **Source grounding** — cites real code, not invented examples.
5. **Smart-merge** — if the same slug was already explained today, appends to existing file.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Modify code — it only explains | [`/wbWork`](../wbWork/README.md) |
| Audit code quality | [`/wbAudit`](../wbAudit/README.md) |
| Generate documentation | [`/wbDoc`](../wbDoc/README.md) |
| Trace bug root causes | [`/wbDebug`](../wbDebug/README.md) |

Batch wildcard (`*`) is for onboarding, not a daily ritual. If every plan row feels vague enough to need batch-explaining, the problem is the plan rows — rewrite them in `/wbPlan`.

## 📚 Reading Order

1. **[ELI5](wbExplain_eli5.md)** ⏳ — the one-paragraph mental model.
2. **[Practical](wbExplain_practical.md)** ⏳ — step-by-step walkthrough on a real project.
3. **[Expert](wbExplain_expert.md)** ⏳ — architecture, edge cases, and when NOT to use.
4. **[Examples](wbExplain_examples.md)** — annotated explanation transcripts (part [1](wbExplain_examples.md) · [2](wbExplain_examples.md)).
5. **[Exhaustive simulation](wbExplain_exhaustive_simulation.md)** · **[Live demo](wbExplain_live_demo.md)**.

## 🔗 Related

- [`wbExplain.md`](wbExplain.md) — the command reference this hub orients you around.
- [`/wbWork`](../wbWork/README.md) — execute tasks after understanding them; integrates `/wbExplain` via `--as` flag.
- [`/wbDebug`](../wbDebug/README.md) — debug after understanding the code; use `/wbExplain` first.

## Quick Reference

```bash
/wbExplain plan_wb-core_20260503.md --id=1 --as=eli5           # explain one task
/wbExplain packages/wb-core/ "How does WBC.js work?" --as=expert # subsystem deep dive
/wbExplain plan.md --id=1 --as=eli5,fr,ar                       # multi-language
/wbExplain packages/wb-core/ * --as=expert                      # batch onboarding
```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

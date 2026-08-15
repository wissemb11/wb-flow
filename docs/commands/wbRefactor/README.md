# /wbRefactor — Command Hub

`/wbRefactor` is the WB-Labs structural surgeon. It analyzes code structure and executes targeted improvements — extracting functions, splitting files, removing dead code, modernizing syntax — while preserving external behavior exactly. Unlike `/wbDebug` which fixes broken code, `/wbRefactor` improves working code without changing what it does.

## 🎯 Strategic Position

`/wbRefactor` exists because the default failure mode of cleanup is "while I'm here" scope creep. The command enforces a strict contract: public signatures, error behavior, observable side effects, and performance characteristics are preserved; only internal structure changes. It should only run when an audit has flagged structural debt, tests exist and pass, and no debug reports are open on the target.

- **After an audit flags structural debt** — the audit-refactor-test-audit bracketing sequence.
- **One file at a time** — entire package refactors in one go are dangerous. Split into file-level operations.
- **In the polish phase** — not during feature work, not in response to a bug.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Refactor** | `/wbRefactor <file-or-folder>` | Structural transformation with a before/after comparison report |
| **Self-correct** | `/wbRefactor <previous_output_file>` | Verifies and repairs a prior refactor report in place |

## ✅ What a useful refactor report contains

1. A **before/after comparison** — what structural changes were made, with file references.
2. An explicit statement that the **external API remains identical** — props, emits, error behavior preserved.
3. A list of **what was preserved** — public signatures, error behavior, side effects, performance.
4. A list of **what was changed** — internal structure, naming, dead code, formatting.
5. The **verification command** — typically `/wbTest <target>` to confirm tests still pass.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Fix broken code or investigate bugs | [`/wbDebug`](../wbDebug/README.md) |
| Add new features | Describe the feature directly |
| Clean dead code without behavior context | [`/wbClean`](../wbClean/README.md) |
| Rename a function used across the monorepo | [`/wbPlan`](../wbPlan/README.md) — coordinate the blast radius |
| Convert Vuetify components to wbc-ui2 | [`/wbToWBC`](../wbToWBC/README.md) |

## 📚 Reading Order

1. **[ELI5](wbRefactor_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbRefactor_practical.md)** — step-by-step on a real project.
3. **[Expert](wbRefactor_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbRefactor_examples.md)** — annotated transcripts from actual sessions.
5. **[Exhaustive simulation](wbRefactor_exhaustive_simulation.md)** · **[Live demo](wbRefactor_live_demo.md)**.

## 🔗 Related

- [`wbRefactor.md`](wbRefactor.md) — the command reference this hub orients you around.
- [`/wbAudit`](../wbAudit/README.md) — the mandatory before-and-after gate for any refactor.
- [`/wbDebug`](../wbDebug/README.md) — fix bugs; do not refactor buggy code.
- [`/wbToWBC`](../wbToWBC/README.md) — specialized Vuetify-to-wbc-ui2 migration.
- [`/wbTest`](../wbTest/README.md) — confirm behavior parity after refactor.
- [`/wbNext`](../wbNext/README.md) — ranked next action after refactor.

## Quick Reference

```bash
/wbRefactor <file-or-folder>                # restructure, preserve behavior

```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

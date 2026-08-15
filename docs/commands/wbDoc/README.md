# /wbDoc — Command Hub

`/wbDoc` generates human-facing documentation grounded in actual code. It reads source files, call sites, and project conventions (`dev.md`/`context.md`) — then produces JSDoc, READMEs, and API reference docs that match the current state of the project. It refuses to document code that's about to be refactored, and it refuses to invent usage patterns not found in existing consumer code.

## 🎯 Strategic Position

Documentation written by "AI, add comments" is noise. `/wbDoc` draws from actual code structure, existing call sites, and project-level conventions. The result is documentation that reflects what the code actually does — not what someone imagines it should do.

- **After a refactor** — regenerate docs to match the new structure.
- **When docs have drifted** — rebuild README sections that are months out of date.
- **Before onboarding** — ensure public API surfaces have grounded JSDoc.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **File-scoped** | `/wbDoc packages/wb-core/src/index.js` | JSDoc on one file, grounded in call sites |
| **Folder-level** | `/wbDoc packages/wb-dataviewer` | README regen for an entire package |

## ✅ What useful docs contain

1. **JSDoc** with `@param`, `@returns`, `@remarks` — not generic filler.
2. **Examples drawn from actual call sites** — not invented usage patterns.
3. **Project conventions surfaced** — `:wbCode="false"` defaults, caching models, etc.
4. **Before/after diff** (for JSDoc) or **full proposal** (for README).
5. **Pointer to context.md sync** — docs and context agree.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Generate agent-facing `context.md` | [`/wbContext`](../wbContext/README.md) |
| Plan documentation structure | [`/wbPlan`](../wbPlan/README.md) |
| Translate docs to other languages | [`/wbTranslate`](../wbTranslate/README.md) |
| Document code that needs refactoring | [`/wbRefactor`](../wbRefactor/README.md) first, then `/wbDoc` |

When an audit flags a file for refactoring, `/wbDoc` refuses to document the current structure — the docs would be stale within a week. Fix the code first, then document.

## 📚 Reading Order

1. **[ELI5](wbDoc_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbDoc_practical.md)** — step-by-step walkthrough on a real project.
3. **[Expert](wbDoc_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbDoc_examples.md)** — annotated doc generation transcripts (part [1](wbDoc_examples.md) · [2](wbDoc_examples.md)).
5. **[Exhaustive simulation](wbDoc_exhaustive_simulation.md)** · **[Live demo](wbDoc_live_demo.md)**.

## 🔗 Related

- [`wbDoc.md`](wbDoc.md) — the command reference this hub orients you around.
- [`/wbContext`](../wbContext/README.md) — generates agent-facing context, not human docs.
- [`/wbRefactor`](../wbRefactor/README.md) — refactor before documenting when audit flags issues.
- [`/wbTranslate`](../wbTranslate/README.md) — translate existing docs.

## Quick Reference

```bash
/wbDoc packages/wb-core/src/index.js                    # JSDoc on one file
/wbDoc packages/wb-dataviewer                           # README regen for a package

/wbDoc --focus apiResponse_ packages/wb-dataviewer/     # focus on a specific topic
```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

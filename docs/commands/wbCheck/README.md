# /wbCheck — Command Hub

`/wbCheck` runs a lightweight, fast validation before heavier commands like `/wbAudit` or `/wbRelease`. It operates as a pre-flight context quiz — generating questions from a private answer key, having the worker model answer them from source code alone, and producing a pass/fail verdict. The command catches wrong assumptions before they produce damage.

## 🎯 Strategic Position

You have many `/wb*` commands and multiple AI models. Some models are cheap but may not understand your codebase. If you send `/wbRefactor` to a model that doesn't know the framework version, it will rewrite things incorrectly. `/wbCheck` catches this with a 30-second quiz *before* damage happens.

- **Using a new model on a package** — verify it understands the codebase.
- **Using a cheap/free model** — the cheaper the model, the more likely it hallucinates.
- **After a major refactor** — re-verify that models still understand the changed codebase.
- **First time using any model on the monorepo** — establish a baseline.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Monorepo-wide quiz** | `wbcheck` (no args) | 6 questions from all category banks |
| **Full package quiz** | `wbcheck wb-core` | ~9 questions covering all categories for that package |
| **Command-specific quiz** | `wbcheck wb-core wbTest` | 4–6 questions targeted to that command's required categories |

## ✅ What a useful check contains

1. **Quiz questions** generated from a private answer key the worker cannot access.
2. **Worker answers** produced by reading actual source code — not training data.
3. **Pass/fail verdict** — 80%+ passes, 60-79% is marginal, <60% fails.
4. **Keyword matching** — exact numbers from source files prove the model read them.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Produce a scored, ranked audit | [`/wbAudit`](../wbAudit/README.md) |
| Fix issues it finds | It only flags them — use the appropriate `/wb*` command |
| Test runtime behaviour | [`/wbTest`](../wbTest/README.md) |
| Produce a structured output report | The quiz is interactive; it ends with a verdict, not a report file |
| Replace persistent context models | Models like Antigravity/Opus with persistent context don't need quizzing |

## 📚 Reading Order

1. **[ELI5](wbCheck_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbCheck_practical.md)** — step-by-step quiz walkthrough.
3. **[Expert](wbCheck_expert.md)** — security model, grading rules, and answer-key management.
4. **[Examples](wbCheck_examples.md)** — annotated quiz transcripts.
5. **[Exhaustive simulation](wbCheck_exhaustive_simulation.md)** · **[Live demo](wbCheck_live_demo.md)**.

## 🔗 Related

- [`wbCheck.md`](wbCheck.md) — the command reference this hub orients you around.
- [`/wbTrack`](../wbTrack/README.md) — optionally start a tracked session after passing.
- [`/wbContext`](../wbContext/README.md) — builds context from code; `/wbCheck` tests if the model already has it.
- [`/wbTest`](../wbTest/README.md) — tests runtime behaviour, not model understanding.

## Quick Reference

```bash
wbcheck                            # monorepo-wide quiz (6 questions)
wbcheck wb-core                    # all categories for a package (~9 questions)
wbcheck wb-core wbTest             # targeted quiz for one command (4–6 questions)
```

---
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

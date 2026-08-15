# /wbStandup — Command Hub

`/wbStandup` produces a structured end-of-session summary by reading recent workflow artifacts — task reports, audit findings, plan updates — and compiling what was done, what is blocked, and what is next. It is designed for handoffs, ensuring the next session picks up exactly where the current one left off, without manual note-taking.

## 🎯 Strategic Position

`/wbStandup` doesn't add information. Every finding it lists already exists in `reports/`. Its value is making you *see* it at the moment you're choosing what to do next. It cures choice paralysis by scanning the monorepo for unfinished work and giving you a single, ranked agenda.

- **Every morning** — first thing, before `/wbContext`.
- **After interruptions** — back from lunch, returning to a stale branch.
- **Before starting a new feature** — clear the backlog view first.
- **Do NOT run** multiple times per hour — it's a fresh-pair-of-eyes command.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Monorepo-wide** | `/wbStandup <monorepo-root>/` | Every package's open work, ranked by priority |
| **Package-scoped** | `/wbStandup <package>/` | One package's open work only |

## ✅ What a useful standup contains

1. **Unresolved findings** (BLOCKER / CRITICAL) — top priority, always first.
2. **Stale reports** — tasks marked 🔨 in progress for over 24 hours.
3. **Open plans** — ongoing work you can resume.
4. A **suggested next action** — with model recommendations ordered best → budget.
5. The **standup → context handoff**: standup tells you *which* package; `/wbContext` loads *what* the AI knows about it.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Plan next steps | [`/wbPlan`](../wbPlan/README.md) or [`/wbNext`](../wbNext/README.md) |
| Track session state persistently | [`/wbTrack`](../wbTrack/README.md) |
| Audit code quality | [`/wbAudit`](../wbAudit/README.md) |
| "What does package X do?" | [`/wbContext <x>`](../wbContext/README.md) |
| "Is package X good?" | [`/wbAudit <x>`](../wbAudit/README.md) |
| "What should I build next?" | [`/wbVision`](../wbVision/README.md) |

## 📚 Reading Order

1. **[ELI5](wbStandup_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbStandup_practical.md)** — step-by-step on a real project.
3. **[Expert](wbStandup_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbStandup_examples.md)** · **[Part 1](wbStandup_examples.md)** · **[Part 2](wbStandup_examples.md)** — annotated transcripts.
5. **[Exhaustive simulation](wbStandup_exhaustive_simulation.md)** · **[Live demo](wbStandup_live_demo.md)**.

## 🔗 Related

- [`wbStandup.md`](wbStandup.md) — the command reference this hub orients you around.
- [`/wbContext`](../wbContext/README.md) — the depth you need after standup tells you breadth.
- [`/wbTrack`](../wbTrack/README.md) — persistent session tracking.
- [`/wbNext`](../wbNext/README.md) — ranked forward-looking actions from this standup.
- [`/wbVision`](../wbVision/README.md) — strategic direction (standup reconciles existing work).

## Quick Reference

```bash
/wbStandup <monorepo-root>/              # monorepo-wide — morning default
/wbStandup <package>/                    # package-scoped — afternoon re-orient
/wbStandup <monorepo-root>/ --act        # standup plus auto-fix actionable items
/wbStandup <monorepo-root>/ --wbPlan     # standup plus next-step plan generation
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

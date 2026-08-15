# /wbStandup — Practical

## Two forms

```
/wbStandup core2/ # monorepo-wide — morning default
/wbStandup <package>/ # package-scoped — afternoon re-orient
```

## When to run

- **Every morning.** Literally first thing. Before `/wbContext`.
- **After interruptions.** Back from lunch, back from a meeting, returning to a branch you haven't touched in a week.
- **Before starting a new feature.** Clear the backlog view first, so you don't forget an open blocker.

## When *not* to run

- Multiple times per hour. It's a fresh-pair-of-eyes command; reading the same standup twice adds no value.
- Right after you've done 10 commits. Your memory is still hot; you don't need the standup to remind you.

## Reading the output

Four sections, ranked by what should grab your attention:

1. **Unresolved findings** (BLOCKERs / CRITICAL) — top priority
2. **Stale reports** (🔨 in progress > 24h) — verify before continuing
3. **Open plans** — ongoing work you can resume
4. **Suggested next action** — AI opinion, you decide

## The value is in the surface

`/wbStandup` doesn't add information. Every finding it lists already exists in `reports/`. Its value is making you *see* it, at the moment you're choosing what to do next. Without the standup, you'd probably forget the 8-day-old security finding.

## The `/wbStandup` → `/wbContext` handoff

Standup is *breadth*. Context is *depth*. Sequence:

1. `/wbStandup core2/` — tells you which package needs attention.
2. `/wbContext <that-package>` — loads the AI's detailed knowledge of that package.
3. Execute.

Skipping the first → you work on the wrong package. Skipping the second → the AI works on the right package with stale context.

## When /wbStandup is the wrong command

- "What does package X do?" → `/wbContext <x>`.
- "Is package X good?" → `/wbAudit <x>`.
- "What should I build next?" → `/wbVision`, not standup (standup reconciles existing work).
- "Did the AI finish its plan?" → `/wbReview <plan>`.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbStandup --execute` and `/wbStandup -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--act` | `-a` |
| `--wbPlan` | `-P` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

---
title: Opening a New Session
description: Protocol and triggers for starting a fresh AI chat session with the right setup.
---

# Opening a New Session — 

> Starting a fresh chat is structurally different from continuing one. The cheap part is opening the window. The valuable part is the protocol that runs once you do.

---

## When to open one

The trigger is **any of these**, in priority order:

1. You just [closed the previous session](2_closing_the_session.md) — even if "just" means 30 seconds ago. The whole point of the close was to start fresh.
2. You hit a [Golden Save Point](1_the_golden_save_point.md) and decided to start a major new feature.
3. New day. (Trivially.)
4. The current session is over ~150 messages and the AI is visibly drifting — repeating itself, mis-remembering recent code, hallucinating function names. This is the *forced* trigger; the others are *planned*.

## The SOP (3 steps)

### 1. Open a fresh chat thread

In the agent Desktop / the agent Code / claude.ai — whichever client you use — start a new thread. Don't reuse the previous one's title or seed prompt; it carries no actual state, but it tempts you to mentally continue rather than restart.

### 2. Decide whether to track

```
/wbTrack <target>/
```

`/wbTrack` toggles session-wide logging — every subsequent `/wb*` invocation appends a `§N` section to a shared session walkthrough. Useful when:

- You're learning the workflow and want a transcript to re-read.
- You're going to ship something user-visible and want a clean changelog source.
- You're going to run 5+ commands and want them aggregated.

Skip it for one-off sessions ("close one bug, commit, leave"). The tracker file becomes overhead-with-no-payoff if the session is short.

### 3. Run the orientation pair

If it's a **new day** or **new package**:

```
/wbStandup core2/
/wbContext <package>
```

`/wbStandup` is breadth (what's in flight across the monorepo). `/wbContext` is depth (the package you're about to touch). Run breadth first — you might learn that the package you *thought* you'd work on isn't the one with the highest priority.

If it's a **same-day continuation** at a Golden Save Point: skip `/wbStandup` (you wrote one when closing the last session — read that file instead) and only run `/wbContext` if the package changed.

## The same-day edge case

> *"I closed at 11am, opened a new session at 11:30am. Will `/wbTrack` overwrite my morning's tracker?"*

**No.** The tracker, standup, plan, and audit files are all keyed by `<scope>_<YYYYMMDD>` — calendar date, not session. If a file already exists for today, the protocol is **append, not overwrite**:

- `track_core2_20260503.md` already exists from this morning → second run **appends** a `## 🔁 Run @ HH:MM` section after a `---` separator. Same file. No `_v2` suffix.
- `standup_core2_20260503.md` already exists → second run **appends** a new section. No new file.
- `plan_core2_20260503.md` already exists → `/wbPlan` will explicitly ask whether to extend or create a sibling.

This is the "Cumulative Append" protocol, and it's deliberate: the calendar-day is the unit of persistence. If you end up running 4 sessions in one day on `core2/`, the morning's logs stay intact and the day's narrative reads top-to-bottom.

The exception: if you change scope (`core2/` in the morning, `wb-press/` in the afternoon), you get separate files because the scope token differs (`track_core2_…` vs `track_wb-press_…`). That's also correct — those *are* separate threads of work.

## What this looks like as a loop

```
[close session] → [walk away or open new chat] → /wbTrack (?) → /wbStandup + /wbContext → work → [close session]
 ↑ ↓
 └──────────────────────────────────────────────────────────────────────────────────┘
```

The arrows are the only continuity that matters. Everything inside the box is ephemeral. Everything outside the box (the `reports/`, `tracks/`, `context.md`, `dev.md` artifacts) is what persists.

---

**Next:** [`4_publishing_a_release`](4_publishing_a_release.md) — when one of those well-bracketed sessions exists to ship a package, the publishing pipeline is the arc that runs inside it.

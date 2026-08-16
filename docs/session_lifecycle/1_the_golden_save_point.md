---
title: The Golden Save Point
description: How to recognize the safe repository state for starting risky work or stopping guilt-free.
---

# The Golden Save Point — 

> A specific, recognizable repository state. Not a metaphor. Not a celebration. A checkpoint you should learn to spot, because it's the only safe moment to start something risky.

---

## How to recognize it

You're at a Golden Save Point when **all three** are true:

1. **Every task in the active plan is `✅ Valid`** (not just `✅ Done` — `/wbValid` has signed off).
2. **The repo has no dirty parking lot.** No half-moved files, no `*.orig`, no stale `chat_*.md` at the root, no `dist/` ↔ `dist-dev/` mismatch (you know the wbc-ui2 quirk).
3. **`context.md` and `dev.md` reflect the actual code.** Last `/wbContext` was on this code, not three commits ago.

`/wbNext` is the cheapest detector: when its top recommendation is *"start a new feature"* rather than *"clean X"* or *"fix Y"*, you're there.

If only 2 of the 3 are true, you're not at the save point — you have one chore left. Do it.

## Why it matters

It's the only state from which a `git reset` is meaningful. If you start `wb-sync` (or any large new feature) on a dirty foundation, the next bug could be from your new code, the inherited mess, or both — and you can't bisect them apart.

The save point separates *previous-session debt* from *this-session work*. Without that line, every session inherits the previous one's noise.

## What to do at it

Three things, in order. The first two are non-negotiable; the third is a judgment call.

### 1. Commit, then stop

`/wbGit <target>/` reads the diff, drafts a Conventional Commit message, and (if you say so) runs `git add` + `git commit` + `git push`. It is the **only** `/wb*` command that touches git for you.

The commit message at a save point should describe the hygiene work — the chores you cleared, the docs you synced, the agents you re-wired. Not the new feature you haven't started yet. Future-you bisecting a bug needs to know that THIS commit was the clean baseline.

### 2. Close the session

The save point is also the cheapest moment to close the AI session — your context window is mostly full of *cleanup* tokens, not *feature* tokens. Carrying that into the next phase is wasteful. Move to [`2_closing_the_session`](2_closing_the_session.md).

### 3. Decide whether to keep going

The trap is treating the save point as a *finish line* (great, I'm done!) or as a *starting gun* (great, time to ship `wb-sync`!). Both miss the point.

The right move is usually to **stop**. The save point is rare. The next session will be sharper if it starts from a clean context with a clean repo, even if "stop" means "in two hours, after lunch, with a fresh chat."

If you do continue, [open a new session](3_opening_a_new_session.md) — don't ride the current one into a 4-hour mega-thread. The math on that is in `2_closing_the_session.md`.


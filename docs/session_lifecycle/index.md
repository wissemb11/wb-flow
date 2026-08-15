---
title: Session Lifecycle
description: Guide to starting and stopping AI sessions and managing context-window economics.
---

# Session Lifecycle — 

> The discipline of **starting** and **stopping** AI sessions. Most workflow docs assume you're already in a session — these three files cover what happens at the seams.

---

## Why this folder exists

The `/wb*` commands are tools you run *inside* a session. But the session itself has a lifecycle — open, work, save-point, close — and that lifecycle has its own economics (context-window cost) and its own mistakes (mega-threads, mid-task closes, forgotten standups).

The three docs in this folder are about that meta-layer.

## The four docs

1. **[`1_the_golden_save_point`](1_the_golden_save_point)** — how to recognize the rare repository state where everything is clean and validated. The only safe moment to start a major new feature, or to stop guilt-free.
2. **[`2_closing_the_session`](2_closing_the_session)** — the 3-step SOP for ending a working session. Snapshot, finalize tracker, **close the window**. The third step is the one that actually does the work.
3. **[`3_opening_a_new_session`](3_opening_a_new_session)** — the protocol for starting fresh. Includes the same-day "Cumulative Append" rule for tracker/standup/plan files (calendar-day = unit of persistence).
4. **[`4_publishing_a_release`](4_publishing_a_release)** — the publishing pipeline as a session-bracketing event: `/wbAudit` + `/wbTest` → `/wbRelease` → `npm pack --dry-run` → `/wbPublish` → `/wbRelease --restore` → handoff. Includes the one cleanup step people skip and the failure modes that result.

## Reading order

Linear: `1 → 2 → 3 → 4`. Each one ends with a pointer to the next.

If you only read one, read [`2_closing_the_session`](2_closing_the_session) — closing is the step people skip most often, and the one with the highest cost-per-skip (context-window economics compound across sessions).

## What this folder is NOT

- Not about specific commands. For per-command details, see [`../commands/`](../commands/).
- Not about daily flow. For "10am vs. 4pm," see [`../daily_use/the_daily_playbook`](../daily_use/the_daily_playbook).
- Not onboarding. For "I've never done this," see [`../start_here/`](../start_here/).

## Why this matters more than it looks

The cost of a bad session-close compounds. One bloated session is annoying. Five sessions that each forgot to close is a thread of half-derived state where the AI starts every response by re-figuring out what's true. The fix is cheap (close the window). The damage from skipping it is not.

<div align="center">
<SessionLifecycle />
*The session lifecycle from Open to Seal. Watch the tracker file grow as commands execute.*
</div>

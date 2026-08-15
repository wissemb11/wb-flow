# /wbStopTrack — Practical Guide

> Three scenarios for clean session closure.

---

## 1. End-of-Day Close

The most common use case. You've finished your work and want to create a clean boundary.

```bash
/wbStopTrack .
```

**What it produces:**

```markdown
--- SESSION FINALIZED ---
Sealed at: 2026-05-13 18:30:00

## Session Summary
- Duration: 6h 15m
- Commands executed: 14
- Tasks completed: 4 of 5
- Log entries: 3
```

**Next morning:** When you run `/wbTrack .`, it creates a fresh tracker for the new day. Yesterday's sealed file sits in `reports/2026/05/13/` as a complete, self-contained record.

---

## 2. Context Switch Between Projects

You've been working on `wb-core` all morning and need to switch to `wb-press` for the afternoon.

```bash
# Close the wb-core session
/wbStopTrack packages/wb-core

# Start fresh on wb-press
/wbTrack packages/wb-press
```

**Why this matters:** Without the stop, both projects' activity would merge into one tracker, making it impossible to calculate per-project time or cost.

---

## 3. Pre-Release Session Boundary

Before running `/wbRelease`, seal the development session to create a clean audit trail.

```bash
# Seal development work
/wbStopTrack .

# Start release activities in a new session
/wbTrack .
/wbRelease packages/wb-core
```

**Why this matters:** The release tracker will contain only release-related commands, making it a clean record for the changelog.

---

## The Rhythm

A typical day looks like this:

```
Morning:   /wbStandup core2/        → What's open?
           /wbTrack .               → Start recording
           
Work:      /wbContext, /wbPlan, /wbWork, /wbLog ...

Evening:   /wbGit                   → Commit the work
           /wbStopTrack .           → Seal the day
```

`/wbStopTrack` is always the last command. It's the signal that today is done and tomorrow starts clean.

---

## What If You Forget?

The system doesn't break. But:
- Tomorrow's commands append to today's tracker
- The standup report can't separate today's work from yesterday's
- Cost estimates span multiple sessions without boundaries

Making `/wbStopTrack` habitual is a discipline, not a technical requirement.

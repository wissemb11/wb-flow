---
title: "wbStandup — End-of-session summary"
description: "/wbStandup produces a structured standup report summarizing what was done, what is blocked, and what is next."
---
# /wbStandup — End-of-session summary

## Overview

`/wbStandup` produces a structured standup report summarizing what was done, what is blocked, and what is next. It reads recent workflow artifacts — task reports, audit findings, plan updates — to compile an accurate session summary without requiring manual note-taking. The command is designed for end-of-day handoffs, ensuring that the next session can pick up exactly where the current one left off.

## When to Use

**Run this when:** You are ending a work session and need to capture progress for the next person or session.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbStandup_eli5.md](wbStandup_eli5.md) | What this command does in plain English |
| Practical | [wbStandup_practical.md](wbStandup_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbStandup_expert.md](wbStandup_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbStandup_exhaustive_simulation.md](wbStandup_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbStandup_live_demo.md](wbStandup_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not plan next steps — use `/wbPlan` or `/wbNext` for that.
- ❌ Does not track session state — use `/wbTrack` for persistent tracking.
- ❌ Does not audit quality — it only summarizes activity.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbStandup` in a workflow


## How It Works

Queries git log, GitHub API, and issue tracker for comprehensive daily summary.

## 🗄️ Why the standup is never itself archived

Every other daily-history command (`/wbPlan`, `/wbAudit`, `/wbIdea`, `/wbVision`, …) keeps one live
file per category and retires the rest. **`/wbStandup` and `/wbTrack` are exempt**, and this is a
deliberate asymmetry, not an oversight:

A standup's entire content is *"here is what was open yesterday, here is today."* A track is the
session narrative. Both derive their value from **the series** — the eighth consecutive standup
listing the same blocker is the signal, and it is the whole reason to read one. Keep only the newest
and you have thrown away the thing that made it worth reading, while keeping the entry that says
least.

## `--archive` — the fleet-wide sweep

So the standup series stays whole, and `/wbStandup` takes the **inverse** role instead: the one
command that sweeps everything *else*.

```bash
/wbStandup <monorepo-root>/            # unchanged — the daily agenda
/wbStandup <monorepo-root>/ --archive  # …then one live file per category, per scope
```

With `--archive`, a PHASE 5 runs after the recommendation:

1. **Consolidate into every keeper first** — for each scope and each non-exempt category, absorb the
   still-open items from older files into the newest one.
2. **Cross-check against the PHASE 1 scan** — *every open item listed in the agenda must now appear
   in exactly one live file.* An agenda item with no live home means consolidation missed it; stop.
3. **Preview and ask** — `wb-flow archive <target> --recursive --all --dry-run`, printed in the chat,
   then wait for a go.
4. **Apply and report** — results land in the standup file under `## 🗄️ Archive Sweep`, one row per
   moved folder, plus a link to `archives/archive_log.md`.

**Step 2 is why this belongs in the standup** rather than in a standalone command: PHASE 1–3 already
built the complete inventory of what is open everywhere, and that inventory is the only cross-check
that makes a fleet-wide sweep safe.

**Step 3 is not optional.** A per-command `--archive` moves a handful of folders in one scope; this
moves every superseded folder in every scope below the target — easily a hundred in a monorepo. It is
reversible one folder at a time, which is little comfort at that volume.

The standup file thereby becomes the index of the sweep, which is the right home for it: the standup
is already the document whose job is to say where everything stands. Full model:
[Report Lifecycle](../../concepts/report_lifecycle.md).

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--act` | `-a` |
| `--wbPlan` | `-P` |
| `--archive` | `-A` | **Universal, and here it means the fleet-wide sweep.** Consolidate into every scope's newest file per category, then retire all superseded folders below the target. Defaults to `--archive=all`. `standups/` and `tracks/` are never swept. Always previews and asks before applying. See `_shared/output_conventions.md` §13.5. |
| `--dry-run` | `-n` | With `--archive`: print the move list for every scope, move nothing. |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

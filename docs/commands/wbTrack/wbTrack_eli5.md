# wbTrack — ELI5 Guide

## What is this?

Starts a time tracking session for your current task, linking it to a branch, issue, or custom description. It records when you start, what you're working on, and which project context you're in — so you can later see exactly where your time went.

When you start a session, `wbTrack` takes a snapshot of the current state: the timestamp, the branch name, any uncommitted changes, and the task description you provide. This context is saved alongside the session data so you can reconstruct exactly what you were doing during each tracked period.

**What It Records:**
- **Start timestamp** — when you began working (automatic or manual)
- **Task identification** — branch name, issue number (e.g., `#142`), or free-text description
- **Project context** — the Git project, subdirectory, and any tag or label you assign
- **Initial state** — current git status snapshot for context (branch, uncommitted changes)
- **Configuration** — billable rate category, client if applicable, and estimated duration

**When to use it:** At the start of any focused work session. Track by feature, by bug fix, or by meeting — whatever granularity makes sense for your reporting needs.

## Why do I need it?

If you don't track time, you don't know where it goes. `wbTrack` makes it effortless to start a session so you can build accurate time data — for billing, for sprint planning, or just to understand your own productivity patterns. Even a week of accurate time tracking can reveal surprising insights about where your day actually goes.

**Tips:**
- Track at the task level, not the project level — "implement search" not "working on app"
- Use `--issue` to link sessions to tickets for automatic billing and reporting
- Start tracking before you begin work, not after — the data is more accurate

## Simple Example

**Start tracking task:** `/wbTrack "Implement search bar component"` — starts a tracking session for the given task description and records the start time.

**Track by issue:** `/wbTrack --issue #142 --branch fix/login-timeout` — links the session to a specific GitHub issue and branch, creating traceability between time and work.

**Track with estimate:** `/wbTrack "Build API client" --estimate 4h --billable` — starts tracking with a time estimate and marks the session as billable for client invoicing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


# wbStopTrack — ELI5 Guide

## What is this?

Stops the currently running time tracking session and saves the recorded time data to your tracking log. It captures the session duration, the task or branch being worked on, and any notes you've added during the session.

When you stop a session, `wbStopTrack` snapshots the current state: it records the exact start and end times, calculates the elapsed duration, collects any notes you've made during the session, and appends the entry to your time tracking log file. The log is stored in a structured format (JSON or CSV) that can be exported for billing or analysis.

**What It Captures:**
- **Session duration** — exact start and end time, total elapsed time rounded to the nearest minute
- **Task context** — the branch name, task description, or issue number associated with the session
- **Activity log** — key commits and files touched during the session for automatic activity summary
- **Status notes** — any mid-session notes, blockers, or achievements logged during the session
- **Billing metadata** — project, client, and billable/non-billable flags if configured

**When to use it:** When you finish a task, switch contexts, or end your workday. Always stop the current session before starting `wbTrack` with a new task.

## Why do I need it?

Time tracking only works if you actually stop the clock. `wbStopTrack` closes the session cleanly, saves all data, and ensures your time log is accurate — no more guessing how long you spent on that feature three days ago. It also prevents the common problem of forgetting to stop tracking and ending up with a 12-hour session.

**Tips:**
- Use `--note` to capture your current status before switching tasks
- Use `--next` to chain stop-and-start without interruption
- Review your tracking log weekly with `wbLog --type time` to spot inaccuracies

## Simple Example

**Stop current session:** `/wbStopTrack` — stops the active session, saves the time log, and displays a summary of what was tracked.

**Stop with note:** `/wbStopTrack --note "Finished API integration, blocked on auth flow"` — stops tracking and attaches a note explaining current progress and blockers.

**Stop and start new:** `/wbStopTrack --next "WIP: Dashboard filters"` — stops the current session and immediately starts a new one with the given task description.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


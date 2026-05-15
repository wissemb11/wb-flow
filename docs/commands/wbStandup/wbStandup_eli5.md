# wbStandup — ELI5 Guide

## What is this?

Generates a daily standup report from your commit activity and project events. It reads your git log, PR activity, and issue tracker to produce a summary of what you worked on, what you accomplished, and what's blocked.

The standup engine queries multiple data sources: your local git history for commits, the GitHub/GitLab API for PR and issue activity, and your issue tracker (Jira, Linear, GitHub Issues) for task status. It then compiles everything into a structured report organized by what you did, what's in progress, and what's blocked.

**What It Gathers:**
- **Commits** — all commits from the last working day grouped by branch and project
- **PR activity** — opened, merged, and reviewed PRs with links and status
- **Issues resolved** — closed issues and tickets with cross-reference to commits
- **Blockers** — detects stalled PRs, unresolved review comments, and failing CI runs
- **Time distribution** — percentage of time spent on features vs. bugs vs. maintenance vs. chores

**When to use it:** At the end of your workday, or before your morning standup meeting. Use `--team` to generate reports for your whole team.

## Why do I need it?

Standups are valuable but writing them up every day feels like overhead. `wbStandup` removes the friction by generating a factual, complete report from your actual activity — no more "I don't remember what I did yesterday." It also catches things you might forget to mention, like that bug fix that took longer than expected.

**Tips:**
- Run at the end of the day so your activity is captured accurately
- Use `--format slack` to post directly to your team's standup channel
- Review the output before posting — add context for the non-obvious items

## Simple Example

**Quick standup:** `/wbStandup` — generates a standup summary from the last 24 hours of git and PR activity.

**Team standup:** `/wbStandup --team --since "yesterday 9am"` — generates standup reports for all team members by scanning their commits and PRs, useful for a lead compiling the team daily.

**Slack post:** `/wbStandup --format slack --channel standup` — formats the standup as a Slack message and posts it directly to the standup channel.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


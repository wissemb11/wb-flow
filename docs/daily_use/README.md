# Daily Use —

Guides for the day-to-day rhythm of operating within the WB-Labs agentic workflow. These documents cover the practical sequencing of commands from morning standup to evening release.

## Index

| File | Coverage |
|---|---|
| [the_daily_playbook_part1.md](the_daily_playbook_part1.md) | Full daily cycle: 🌅 Morning context & standup → ☀️ Midday planning & execution → 🌆 Afternoon verification → 🌃 Evening shipping |

## Quick Reference: The Day in 4 Acts

| Act | Time | Primary Commands |
|---|---|---|
| **🌅 Morning** | Start of session | `/wbContext`, `/wbStandup` |
| **☀️ Midday** | Core work hours | `/wbActOn`, `/wbPlan`, `/wbWork` |
| **🌆 Afternoon** | Verification | `/wbReview`, `/wbAudit`, `/wbTest` |
| **🌃 Evening** | Shipping | `/wbRelease`, `/wbPublish`/`/wbDeploy`, `/wbGit` |

See [the_daily_playbook_part1.md](the_daily_playbook_part1.md) for the full breakdown with exact command sequences.


## Common Workflow

Use `wbPlan` for daily task planning, `wbTrack` for time tracking, and `wbStandup` for end-of-day reports.


## Key Options

Configure daily use shortcuts in `.wb/shortcuts/`. Run `wbPlan` each morning and `wbStandup` each evening.


## Daily Workflow

A typical day with wb-flow follows this rhythm:

1. **Morning:** Run `/wbNext` to decide what to work on, then `/wbTrack` to start tracking
2. **Throughout the day:** Use `/wbWork` for multi-step tasks, `/wbCheck` before commits, `/wbTest` before pushing
3. **End of day:** Run `/wbStandup` to generate your daily report, then `/wbStopTrack` to close the session

## Related Resources

- **[Start Here](../start_here/README.md)** — Getting started with wb-flow
- **[Commands](../commands/README.md)** — Full command catalog
- **[Session Lifecycle](../session_lifecycle/README.md)** — Managing agent sessions
- **[Demo Apps](../demo_apps/README.md)** — See wb-flow in action

---

← [Home](../README.md) · [Commands](../README.md#the-command-catalog) · [Install](../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

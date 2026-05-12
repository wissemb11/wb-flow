# wbBroadcast — ELI5 Guide

## What is this?

Sends structured notifications about project events — releases, deployments, audit findings, and review requests — to your team's communication channels. You configure your channels once in `.wb/broadcast.json`, then `wbBroadcast` formats each message appropriately for Slack (rich text blocks), Discord (embeds), email (HTML), or plain text without you having to think about it.

The real feature is event-aware formatting. A release announcement gets a version badge, changelog highlights, and upgrade instructions. An audit broadcast gets a score card, trend arrow (improved/declined), and a count of critical vs. high findings. A test-results broadcast shows pass/fail counts and flaky-test ratios. Same underlying data, different presentation per channel and per event type.

**What It Sends:**
- Release announcements — new version, changelog highlights, upgrade path, npm/GitHub Release links
- Deployment notifications — environment (staging/production), commit range, deploy duration, smoke-test result
- Audit summaries — score vs. previous run, new critical/high findings, trend direction, top-3 remediation items
- Test results — pass/fail/skip counts, flaky-test ratio, duration change vs. last run
- Review reminders — PRs awaiting review sorted by age, with direct links and author tags
- Custom messages — anything you pass with `--message` for ad-hoc team communication

**When to use it:** After any significant project event worth sharing. Configure automatic broadcasts in CI for zero-effort team updates — every deploy and every audit run becomes an automatic channel post.

## Why do I need it?

Keeping a team informed without creating noise is a constant trade-off. Too few updates and nobody knows what's live; too many and people mute the channel. `wbBroadcast` sends the right information at the right time — structured, contextual, and never redundant. It replaces the "did anyone see the deploy?" Slack message and the "what's the audit score this week?" email chain with automated, consistent notifications that everyone can reference.

**Tips:**
- Configure channels once in `.wb/broadcast.json` — you can set different channels for deploys, security alerts, and general updates
- Use `--dry-run` to preview the formatted message before it goes to the team
- Chain with other commands: `wbRelease && wbBroadcast` for release-to-announcement in one line

## Simple Example

**Deploy and announce:** `/wbDeploy --target gh-pages --prod && wbBroadcast` — deploys to production and automatically posts a formatted release notification to the team's configured Slack channel with version, commit range, and deploy duration.

**Security broadcast:** `/wbAudit . --ci && wbBroadcast --channel security` — runs a CI audit, and only if the audit completes successfully, broadcasts the security findings to the dedicated security channel. If the audit fails (score below threshold), no announcement goes out — the CI failure itself is the signal.

**Custom message:** `/wbBroadcast --message "Staging deploy is live — ready for QA on the dashboard redesign" --channel staging` — sends a formatted custom message to the `#staging` channel without coupling to another command's output.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Broadcasting everything.** Every deploy, every audit, every test run creates notification fatigue. Configure channel-level filters in `.wb/broadcast.json` so only meaningful events (production deploys, score drops, critical security issues) make it to the team.

**Not testing the format before sending.** Slack blocks, Discord embeds, and HTML email all render differently. Run `--dry-run` first and check how the notification looks in each target channel.

**Forgetting to rotate webhook URLs.** If a Slack webhook or Discord token leaks, rotate it in `.wb/broadcast.json` and update the channel config. Consider using environment variables for webhook URLs instead of hardcoding them.

**Chaining commands without guards.** `wbRelease && wbBroadcast` announces even a failed release if the exit code isn't checked. Use `wbRelease --dry-run` first, or wrap in a script that gates broadcast on release success.

**Over-customizing per channel.** The built-in formatters handle Slack, Discord, and email well. Writing custom templates for every channel type is maintenance overhead — use defaults unless you have a strong reason not to.

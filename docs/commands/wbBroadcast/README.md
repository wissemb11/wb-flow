# /wbBroadcast — Command Hub

`/wbBroadcast` generates announcement content for npm, GitHub, social media, and documentation sites after a successful `/wbRelease`. It takes release artifacts — changelogs, version numbers, and feature summaries — and formats them into channel-specific posts. The command handles the communication layer of shipping, ensuring stakeholders and users hear about new releases in the right format.

## 🎯 Strategic Position

Releases that nobody hears about might as well not have shipped. `/wbBroadcast` sits at the end of the release pipeline as the final communication step — after code is shipped, but before anyone knows.

- **After `/wbRelease` + `/wbPublish`** — announce a user-visible release.
- **After `/wbDeploy`** — announce a user-facing app change.
- **When declaring lifecycle status** — PREVIEW → LTS, or LTS → OBSOLETE.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Package announcement** | `/wbBroadcast <package>` | Channel-specific posts for the latest release |
| **Monorepo-wide** | `/wbBroadcast <monorepo-root>/` | Monorepo-wide announcement kit |
| **Lifecycle status** | `/wbBroadcast <target> --status=<lts\|preview\|obsolete>` | Status-change announcement + VERSION_STATUS.md update |

## ✅ What a useful broadcast contains

1. **LinkedIn post** — conversational, explains the "why."
2. **X (Twitter) post** — compressed, action-oriented.
3. **GitHub release notes** — structured Highlights / Changes / Breaking / Credits.
4. **Blog paragraph** — 3-paragraph narrative (what's new / why it matters / what to do).
5. **VERSION_STATUS.md update proposal** — if lifecycle status should change.
6. **"Did NOT generate"** section — channels the command doesn't cover (email, video, Slack/Discord).

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Publish packages to npm | [`/wbPublish`](../wbPublish/README.md) |
| Create changelogs or release artifacts | [`/wbRelease`](../wbRelease/README.md) |
| Verify the release is valid before broadcasting | [`/wbValid`](../wbValid/README.md) |
| Auto-post to social media | Human review required — the command writes copy, you post |
| Pre-announce before shipping | The command refuses; pre-announcement is a marketing decision |

It also refuses internal-only releases ("consumers don't care about this") and premature announcements ("pre-announce elsewhere").

## 📚 Reading Order

1. **[ELI5](wbBroadcast_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbBroadcast_practical.md)** — step-by-step walkthrough on a real release.
3. **[Expert](wbBroadcast_expert.md)** — lifecycle management and VERSION_STATUS.md interaction.
4. **[Examples](wbBroadcast_examples.md)** — annotated broadcast transcripts.
5. **[Exhaustive simulation](wbBroadcast_exhaustive_simulation.md)** · **[Live demo](wbBroadcast_live_demo.md)**.

## 🔗 Related

- [`wbBroadcast.md`](wbBroadcast.md) — the command reference this hub orients you around.
- [`/wbRelease`](../wbRelease/README.md) — produces the release artifacts to broadcast.
- [`/wbPublish`](../wbPublish/README.md) — publishes packages to npm.
- [`/wbDeploy`](../wbDeploy/README.md) — deploys apps (another broadcast trigger).
- [`/wbVision`](../wbVision/README.md) — "Coming Soon" teasers for broadcast content.

## Quick Reference

```bash
/wbBroadcast packages/wb-press2                  # announce latest package release
/wbBroadcast <monorepo-root>/                              # monorepo-wide announcement
/wbBroadcast <target> --status=lts                # declare LTS status

```

---
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# /wbBroadcast — Practical

## Three forms

```
/wbBroadcast <package> # announce latest release
/wbBroadcast core2/ # monorepo-wide announcement
/wbBroadcast <target> --status=<lts|preview|obsolete>
```

## When to run

- Immediately after `/wbRelease` + `/wbPublish` on a user-visible release.
- Immediately after `/wbDeploy` on a user-facing app change.
- When declaring a lifecycle status change (PREVIEW → LTS, or LTS → OBSOLETE).

## When *not* to run

- After an internal refactor nobody will notice.
- After a patch release that doesn't change user-facing behavior.
- After a failed release (do not announce what didn't ship).
- Before the release has actually shipped (pre-announcement is a marketing decision the command won't make).

## What the output contains

- **LinkedIn post** — conversational, explains the "why."
- **X (Twitter) post** — compressed, action-oriented.
- **GitHub release notes** — structured Highlights / Changes / Breaking / Credits.
- **Blog paragraph** — 3-paragraph narrative (what's new / why it matters / what to do).
- **VERSION_STATUS.md update proposal** (optional) — if lifecycle status should change.
- **"Did NOT generate"** — channels the command doesn't cover (email, video, Slack/Discord).

## The human-in-the-loop requirement

The command writes copy. You:
1. Review every post. AI voice isn't your voice.
2. Fact-check specifics (version numbers, feature names, behavior claims).
3. Edit for tone.
4. Post manually.

If the command ever skips the "waiting for review" pause and auto-posts, that's a bug — AI auto-posting is the road to embarrassing mistakes.

## The VERSION_STATUS.md interaction

`/wbBroadcast` reads VERSION_STATUS.md and can propose updates:
- PREVIEW → LTS after 3+ months of stable minor releases, no breaking changes.
- LTS → OBSOLETE when deprecating.
- PREVIEW stays until the package is actually stable.

These are proposals. Apply manually if you agree.

## When /wbBroadcast refuses

- Internal-only release. Refuses with "consumers don't care about this."
- No release has shipped yet. Refuses with "pre-announce elsewhere."
- Lifecycle status change requested but validation fails (package isn't actually stable). Refuses with specifics.

## When /wbBroadcast is the wrong command

- Internal status reports to your team → different format; use a custom doc.
- Customer email → template in your email tool; AI copy here is wrong audience.
- User feedback collection → not a broadcast; use a survey tool.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbBroadcast --execute` and `/wbBroadcast -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--status` | `-s` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

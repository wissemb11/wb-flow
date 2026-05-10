# /wbBroadcast: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbBroadcast`

## Three forms

```
/wbBroadcast <package>                      # announce latest release
/wbBroadcast core2/                         # monorepo-wide announcement
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

> For deeper reading: [`docs_claude/commands/wbBroadcast/wbBroadcast_practical_claude.md`](../../docs/docs_claude/commands/wbBroadcast/wbBroadcast_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--status` | `-s` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-s` → `--status`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Herald
**TARGET:** The provided package, app, or monorepo root.

## ━━━ OBJECTIVE ━━━
Your job is to translate technical code changes into human-centric excitement. You are responsible for creating the "Announcement Kit" and managing the public-facing version status of the product.

## ━━━ PHASE 1: EVIDENCE INGESTION ━━━
1. Read the latest `/wbRelease` report to see what was shipped.
2. Read the latest `/wbAudit` report to understand the "Value Proposition" (why it matters).
3. Check `/wbVision` reports for any "Coming Soon" teasers.

## ━━━ PHASE 2: LIFECYCLE MANAGEMENT ━━━
1. Analyze the version number. Is this a Breaking Change (Major), a Feature (Minor), or a Patch?
2. Suggest an update to the root `VERSION_STATUS.md`. Declare if the version is:
   - **[LTS]**: Long Term Support (Stable).
   - **[PREVIEW]**: Beta/Coming Soon.
   - **[OBSOLETE]**: No longer maintained.

## ━━━ PHASE 3: THE ANNOUNCEMENT KIT ━━━
Generate a master announcement kit:
- **Path:** `.wb/workflows/reports/<YYYY>/<MM>/<DD>/broadcasts/broadcast_<target>_<YYYYMMDD>.md`
- **No `<model>/` subfolder.** Create-or-append: if the file exists, append your broadcast as the next Entry #N tagged `*(ModelName — HH:MM)*`.
- **Contents:**
  - **Social Media:** Draft posts for LinkedIn and X (Twitter).
  - **Release Notes:** A professional GitHub Release summary.
  - **Blog Post:** A 3-paragraph "What's New" story for the community.

## ━━━ PHASE 4: REPORT ━━━
Summarize the broadcast readiness.

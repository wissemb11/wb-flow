---
title: "wbBroadcast — Examples"
description: "Examples and usage patterns for generating release announcements using wbBroadcast."
---

# /wbBroadcast — Examples

> Self-help. `/wbBroadcast` generates release announcement kits: social posts, GitHub release notes, blog paragraphs, and updates to `VERSION_STATUS.md`. Run it after `/wbRelease`/`/wbPublish`/`/wbDeploy` on user-visible changes.

---

## When /wbBroadcast is the right command

- A release actually shipped (npm or deploy succeeded).
- The release is user-visible (new feature, user-facing bug fix, API addition).
- The user-visibility justifies public communication.

When it's the wrong command:
- Internal refactor that users don't notice.
- Infrastructure change.
- Failed release ("we tried but rolled back" — don't announce).
- You haven't actually released yet ("pre-announcing" is a marketing choice the command doesn't make for you).

---

## Example 1 — `/wbBroadcast packages/wb-dataviewer` (after v2.2.0 release)

```text
$ /wbBroadcast packages/wb-dataviewer

[AI] Loading most recent /wbRelease report...
[AI] release_202604232315.md
[AI] wb-dataviewer: 2.1.0 → 2.2.0 (minor — apiResponse_ cache fix)
[AI] /wbPublish confirmed successful
[AI]
[AI] Loading most recent /wbAudit report...
[AI] audit_wb-dataviewer_202604232000.md (score 8.0/10)
[AI] Key findings surfaced: apiResponse_ cache refinement
[AI]
[AI] Version lifecycle check...
[AI] Current VERSION_STATUS.md says: PREVIEW
[AI] Should it change? Minor release on a mature package — suggest LTS.
[AI]
[AI] Generating announcement kit...
[AI] Writing reports/20260424/broadcasts/announcement_kit_wb-dataviewer_202604241000.md:
```

```markdown
# Announcement Kit — @wbc/wb-dataviewer 2.2.0

## Proposed VERSION_STATUS.md update

Change @wbc/wb-dataviewer from [PREVIEW] to [LTS].
Rationale: 3 consecutive minor releases with no major API changes.

## Social media — LinkedIn

> Shipped @wbc/wb-dataviewer 2.2.0 today.
> 
> The big change: apiResponse_ now respects route changes without
> throwing away the whole cache. Project changes stay cached; route
> changes trigger fresh fetches. This was a long-standing ambiguity
> that consumers of wb-dataviewer had been working around.
>
> If you use WBDataViewer and have been calling clearCache() defensively
> on route changes, you can now remove those calls.
>
> npm install @wbc/wb-dataviewer@2.2.0

## Social media — X (Twitter)

> @wbc/wb-dataviewer 2.2.0 out:
> 
> apiResponse_ cache now handles route changes correctly. Project
> changes stay cached; routes trigger fresh fetches.
>
> Drop your clearCache() workaround.
>
> npm i @wbc/wb-dataviewer@2.2.0

## GitHub Release Notes

### Highlights
- **`apiResponse_` route-aware cache invalidation**
 Cache now resets on route change but preserves on project change.
 Resolves a class of "stale data" bugs seen by consumers.

### Changes
- Fix: route changes now invalidate `apiResponse_` cache
- Fix: project-change-triggered refetch prevented (regression guard)
- Docs: `dev.md` updated to distinguish route vs project invalidation

### Breaking changes
None. Existing consumers with `clearCache()` workarounds will
continue to work; they can now safely be removed.

### Credits
See commit history 2.1.0..2.2.0.

## Blog paragraph (3-paragraph format)

**What's new**

@wbc/wb-dataviewer 2.2.0 fixes a subtle but longstanding cache
behavior: route changes now correctly invalidate the internal
apiResponse_ cache, while project prop changes continue to preserve
it. This distinction matters because these two user intents produced
identical side effects in earlier versions.

**Why it matters**

Consumers of WBDataViewer have been writing defensive clearCache()
calls on route transitions to avoid stale data. That workaround is
no longer needed. The cache now handles it automatically. Apps
using WBDataViewer as a persistent component across routes will
see correct fresh data on each view.

**What to do**

Upgrade to 2.2.0. Remove any clearCache() calls you added purely
to handle route transitions. Project-change scenarios are unaffected.

## What this kit did NOT generate
- Email newsletter copy (different tone, different audience)
- Video script
- Discord/Slack announcement (channel-specific tone)
```

```text
[AI] Kit written.
[AI] NEXT:
[AI] 1. Review the copy. AI-generated social posts are a starting point,
[AI] not a finished product. Your voice should edit.
[AI] 2. Apply VERSION_STATUS.md change if you agree.
[AI] 3. Post on each platform manually (command doesn't auto-post).
```

**What's worth noticing:**

- The AI proposes a VERSION_STATUS.md change (PREVIEW → LTS) based on release history. It doesn't auto-apply. You decide.
- Each platform has tailored copy. LinkedIn is conversational; Twitter is compressed; GitHub is structured; blog is narrative. Not one-text-for-all.
- "What this kit did NOT generate" names missing channels. Gives you explicit awareness of what's still your job.
- The command does not post. Explicitly a human-in-the-loop step.

---

## Example 2 — `/wbBroadcast` refused on internal refactor

```text
$ /wbBroadcast packages/wb-core

[AI] Loading most recent release...
[AI] wb-core 1.4.3 (patch — dist/ vs dist-dev/ alignment)
[AI]
[AI] Analyzing user-visibility of changes...
[AI] Changes in this release: internal build config fix.
[AI] Public API: unchanged.
[AI] Runtime behavior: unchanged.
[AI]
[AI] REFUSING to generate broadcast.
[AI] Reason: this is an internal fix with no user-visible effect.
[AI] Announcing it would be noise. Consumers don't care about
[AI] build-output paths.
[AI]
[AI] Suggested: let this release propagate silently. Save broadcast
[AI] credit for a release that users will actually feel.
```

**What's worth noticing:**

- Not every release warrants a broadcast. The AI reads the release notes and decides whether user-visibility is real.
- Refusal is specific: "consumers don't care about build-output paths." Concrete reason, not vague.
- "Save broadcast credit" — announcing trivial releases dilutes attention for meaningful ones.

---

## Example 3 — `/wbBroadcast core2/ --status=lts` (status declaration)

Declaring a package as LTS (or PREVIEW, or OBSOLETE) is itself broadcast-worthy.

```text
$ /wbBroadcast core2/ --status=lts

[AI] Loading VERSION_STATUS.md...
[AI] wb-code: currently [PREVIEW]
[AI] Change requested: → [LTS]
[AI]
[AI] Validation:
[AI] - Last major release: 2026-01-15 (3+ months stable) ✅
[AI] - No critical audits in last 30 days ✅
[AI] - API surface stable (no breaking changes in last 3 minors) ✅
[AI]
[AI] LTS declaration is appropriate.
[AI]
[AI] Generating status-change announcement:
```

```markdown
# @wbc/wb-code is now LTS

After 3 months of stable minor releases with no breaking API changes,
@wbc/wb-code is promoted from PREVIEW to LTS (Long Term Support).

## What this means
- API is now considered stable. Future minor releases preserve backward
 compatibility.
- Breaking changes will only happen in major version bumps, with
 migration guides.
- Critical fixes will continue to ship on the LTS line.

## Pinning recommendation
Consumers can now safely pin to `^2.x` without worrying about silent
breaking changes.

## What this announcement did NOT cover
- Deprecation timeline for anything (nothing is being deprecated).
- Migration from prior packages (wb-code has always been its current name).
```

**What's worth noticing:**

- Status change has validation gates (3+ months stable, no recent criticals, stable API). The AI checks before generating. Refuses if the package isn't actually ready.
- Announcement is formal, not exciting. Status changes matter to integrators; hype is counterproductive.

---

## The pattern

Every `/wbBroadcast` run has:

1. **Verify a real release happened** — reads recent release/publish/deploy reports.
2. **Assess user-visibility** — refuse if purely internal.
3. **Multi-platform copy** — LinkedIn / X / GitHub / blog, each with different voice.
4. **Optional lifecycle updates** — VERSION_STATUS.md changes proposed.
5. **"Did NOT generate"** — names missing channels.
6. **No auto-post** — human applies the final edits and posts.

---

---

## Basic Usage

```bash
# Standard command execution
/wbBroadcast frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbBroadcast deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbBroadcast` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbBroadcast target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbBroadcast target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbBroadcast target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbBroadcast packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbBroadcast apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbBroadcast` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbBroadcast frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

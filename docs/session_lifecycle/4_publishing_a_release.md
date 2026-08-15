---
title: wb-flow Publishing Lifecycle
description: The deterministic six-step pipeline for publishing an npm package from a clean working tree.
---

# wb-flow Publishing Lifecycle — 

> The deterministic chain that turns a green working tree into a published npm package. Six steps, one of which (`--restore`) is the one people skip and then spend a morning recovering from.

---

## Why this is a session-lifecycle topic, not a per-command topic

Publishing isn't `/wbPublish`. Publishing is `/wbAudit` + `/wbTest` → `/wbRelease` → `npm pack --dry-run` → `/wbPublish` → `/wbRelease --restore`, run as a single arc. Each command in that chain is documented elsewhere. What this file covers is the **shape of the arc** — which command feeds which, why the order matters, and the one cleanup step that, if skipped, leaves your monorepo in a broken state until you notice.

It lives in `session_lifecycle/` because publishing is a session-bracketing event: you typically open a focused session for it, run the chain, and close. Mid-session publishes are a code smell.

---

## The pipeline

<div align="center">
<PublishPipeline />
*The 6-step publishing pipeline. Step 5 (`--restore`) flashes red — it's the one everyone forgets.*
</div>



## Step-by-step

### 1. Pre-flight: `/wbAudit` + `/wbTest`

Run both. Don't skip the audit just because tests pass — `/wbAudit` catches the things tests can't (premium-tier leaks, missing license headers, dead exports, license file mismatches). Don't skip tests just because the audit's clean — auditors read code, they don't run it.

`/wbAudit` produces a verdict: **Shippable / Not shippable**. If P0 blockers exist, fix them and re-audit. Do not negotiate with the audit verdict. The whole point of the audit being a separate command is that it's allowed to say "no" to you in a way that the publish chain itself isn't.

### 2. Release orchestration: `/wbRelease <pkg>`

This is the file-mutating step. `/wbRelease`:

- Picks the version bump (patch/minor/major) by reading recent Conventional Commits.
- Updates `CHANGELOG.md` with the new entry.
- **Replaces every `workspace:*` and `file:../../` dependency in `package.json` with the real upcoming npm version.** This is the part that, if not later restored, will break your local dev loop.
- Writes a `release_<pkg>_<date>.md` report.

The `workspace:*` rewrite is what makes the published tarball self-contained. It's also what makes step 6 mandatory.

### 3. Tarball verification: `npm pack --dry-run`

Manual step. No `/wb*` wrapper for it — and intentionally so, because the value is in *you* eyeballing the file list. What you're looking for:

- No `.env`, no `.env.local`, no `node_modules/`, no `.git/`.
- No internal-only files that slipped past `.npmignore` / `files` in `package.json`.
- The `dist/` (or whichever output dir) actually contains what you expect.

If the dry-run looks wrong, fix `.npmignore` or the `files` field in `package.json` and re-run. Do not proceed to publish on a bad tarball — npm publishes are immutable; you can't quietly fix an over-shipped file.

### 4. Publish execution: `/wbPublish <pkg>`

Builds production assets (if a build is configured) and runs `npm publish` for each package in topological order — leaf packages first, packages that depend on them next. Writes a `publish_<pkg>_<date>.md` report.

If a publish in the middle of the chain fails (network, npm registry hiccup, version-already-exists), the report tells you exactly which packages were published and which weren't, so you can resume rather than restart.

### 5. ⚠️ Post-publish cleanup: `/wbRelease <pkg> --restore` (THE ONE PEOPLE FORGET)

This puts the `workspace:*` links back into your local `package.json` files.

If you skip it: your local dev loop will start consuming the *published npm versions* of your own packages instead of the local source. You'll edit a file in `packages/wb-core/`, run the demo app, and see no change — because the demo app is now resolving `wb-core` from `node_modules/`, not from your working tree. The diagnostic is confusing because nothing is "broken" — every command runs, every test passes, edits just don't take effect.

The fix is one command. The cost of skipping is the time it takes to figure out *why* nothing is updating. Don't skip.

### 6. Post-publish handoff

The publish itself is over; now handle the ripple effects:

- **`/wbDeploy <consumer-app>`** — push docs sites or apps that depend on the newly published package. `flow.wbc-ui.com` is a typical target.
- **`/wbBroadcast <pkg>`** — generate the announcement kit (release notes, social posts, changelog blurb). Needed before users notice the new version on npm and ask what changed.
- **`/wbVision <pkg>`** — only if this release closes a milestone and you genuinely don't know what's next. Otherwise skip; `/wbVision` is the weakest command in the system and shouldn't be run reflexively.
- **`/wbNext`** or **`/wbStandup`** — re-orient. After a publish, the planning state often needs a refresh.

---

## Failure modes worth naming

| Mistake | What it looks like | Fix |
|---|---|---|
| Skip `--restore` | Local edits stop showing up in the demo app | Run `/wbRelease <pkg> --restore` |
| Skip `npm pack --dry-run` | Ship `.env` or 200MB of test fixtures to npm | Unpublish (within 72h) or publish a corrective patch + deprecate the bad version |
| Audit said "not shippable", you published anyway | The thing the audit warned about is now in the wild | Patch + republish; update audit thresholds if the warning was wrong |
| Publish in the middle of a feature session | Half-done changes get bundled into the release | Only publish from a Golden Save Point (see [`1_the_golden_save_point`](1_the_golden_save_point)) |
| Run `/wbPublish` without `/wbRelease` first | `workspace:*` literals end up in the published `package.json`; consumers can't install | npm rejects the publish in most cases; if it slips through, patch + republish |

---

## What this is not

- **Not the runtime spec for the commands.** For per-command behavior, see the `commands/wbRelease/`, `commands/wbPublish/`, and `commands/wbAudit/` folders.
- **Not a CI script.** This is a local, human-driven sequence. CI integration is a separate concern (and currently not standardized across the wb-flow ecosystem).
- **Not a one-size-fits-all chain.** Single-package repos can collapse steps 2 and 4. Packages with no `workspace:*` deps can skip step 5. The shape above is the maximal version.

---

*Authored by the AI agent — Self-help field manual for the wb-labs agentic workflow*

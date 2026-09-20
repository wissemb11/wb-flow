---
title: "wbRelease — 5 Examples"
description: "It operates on the entire monorepo (core2/), not on a single package."
---

# /wbRelease — 5 Examples

> Self-help. `/wbRelease` is the command that handles the `workspace:*` ↔ npm-version tension. This file is what you re-read when you've forgotten why it's monorepo-wide and not per-package.

---

## The one critical fact about /wbRelease

**It operates on the entire monorepo (`core2/`), not on a single package.** If you type `/wbRelease packages/wb-core`, you're using the wrong scope. `/wbRelease core2/` is almost always right.

Why: workspace protocols (`workspace:*`) in package.json are what the monorepo uses *during development*. But published packages on npm can't resolve `workspace:*` — they need actual version numbers. `/wbRelease` unpicks the workspace links, writes real version numbers, and coordinates the bumps across all affected packages. Per-package release breaks this.

---

## Example 1 — `/wbRelease core2/` (standard flow)

```text
$ /wbRelease core2/

[AI] Scanning for packages with unreleased changes...
[AI] → 2 packages flagged:
[AI] - @wbc/wb-core (git commits since last release: 8)
[AI] - @wbc/wb-dataviewer (git commits since last release: 3)
[AI]
[AI] Gathering pre-release gates from reports/...
[AI] ✅ /wbTest on wb-core: passed 2026-04-23
[AI] ✅ /wbTest on wb-dataviewer: passed 2026-04-23
[AI] ⚠ /wbAudit on wb-core: 2 blockers flagged 2026-04-23
[AI]
[AI] REFUSING to proceed with release.
[AI] wb-core audit has 2 blockers:
[AI] 1. dist/ vs dist-dev/ mismatch
[AI] 2. WBCode/WBC.js gating divergence
[AI]
[AI] Fix blockers, re-audit, then re-run /wbRelease.
```

**What's worth noticing:**

- `/wbRelease` refuses when an audit has open blockers. This is the right behavior — the closed loop means recent audit findings gate release.
- The refusal is not "failed"; it's "not ready." Fix blockers → re-audit → re-release. No state left behind.

---

## Example 2 — `/wbRelease core2/` after fixing blockers

```text
$ /wbRelease core2/

[AI] Scanning...
[AI] ✅ /wbTest passed
[AI] ✅ /wbAudit clean (6.5 → 8.0, blockers resolved)
[AI]
[AI] Computing version bumps via conventional commits...
[AI] wb-core: 1.4.2 → 1.4.3 (patch — fix for dist mismatch)
[AI] wb-dataviewer: 2.1.0 → 2.2.0 (minor — new apiResponse_ cache behavior)
[AI]
[AI] Dependency graph check...
[AI] wb-dataviewer depends on wb-core via workspace:*
[AI] → wb-dataviewer's published deps must reference wb-core@1.4.3
[AI]
[AI] Unpicking workspace protocols (temporary):
[AI] wb-dataviewer/package.json: "workspace:*" → "^1.4.3" for @wbc/wb-core
[AI]
[AI] Writing release report reports/20260423/releases/release_202604232315.md
[AI] Ready for /wbPublish.
[AI]
[AI] After /wbPublish completes, restore workspace: links with:
[AI] /wbRelease core2/ --restore
```

**What's worth noticing:**

- Conventional commits drive version bumps. Patch for fixes, minor for new behavior, major for breaking. Not automatic-heuristic guessing.
- The workspace-unpick step is the whole reason `/wbRelease` exists. It's temporary — `--restore` puts it back after publish.
- The dependency graph is respected: wb-dataviewer's deps must reference the *new* wb-core version, not the old one.

---

## Example 3 — `/wbRelease core2/ --dry-run` (preview)

Shows what would happen without actually changing anything.

```text
$ /wbRelease core2/ --dry-run
```

```markdown
# Release preview (dry-run)

## Packages that would be released
- @wbc/wb-core 1.4.2 → 1.4.3 (patch)
- @wbc/wb-dataviewer 2.1.0 → 2.2.0 (minor)

## Files that would be modified
- packages/wb-core/package.json
- packages/wb-dataviewer/package.json (version + dep reference)
- core2/CHANGELOG.md (aggregate)

## Files that would NOT be modified
- Any package without git commits since last release (18 other packages)

## Gates
- /wbTest status: PASS
- /wbAudit status: CLEAN
- /wbClean suggestion: 1 dead file in wb-dataviewer/src/examples/ (not release-blocking)

## Safe to proceed with real release.
```

**What's worth noticing:**

- Dry-run is cheap safety. Always use it before a real release, especially if you're unsure which packages will be affected.
- The "files that would NOT be modified" list is useful — confirms you didn't accidentally flag more than you meant to.

---

## Example 4 — `/wbRelease core2/ --restore` (after publish)

The reverse of Example 2. Puts workspace protocols back so development continues using them.

```text
$ /wbRelease core2/ --restore

[AI] Reading most recent release report...
[AI] → release_202604232315.md — unpicked 3 workspace: refs
[AI]
[AI] Restoring workspace: protocols...
[AI] wb-dataviewer/package.json: "^1.4.3" → "workspace:*" for @wbc/wb-core
[AI]
[AI] Writing reports/20260423/releases/release_restore_202604232340.md
[AI] Done. Dev workspace is back to normal.
```

**What's worth noticing:**

- `--restore` is a separate step. Not automatic after publish. Rationale: in case publish fails partway, you don't want workspace links restored while some packages aren't actually published.
- Always run `--restore` after `/wbPublish` succeeds. Leaving unpicked protocols in the tree will confuse `pnpm install` (it'll fetch from npm instead of using the local workspace copy).

---

## Example 5 — When to NOT use /wbRelease

```text
Situation: "I fixed a typo in wb-core's README"
→ No release needed. Git commit is fine.

Situation: "I want to test a change on npm before committing to a real version"
→ Use `npm publish --tag=canary` manually, not /wbRelease. Release is for real version bumps.

Situation: "I'm shipping an app, not a package"
→ Apps aren't released. They're deployed. Use /wbDeploy.

Situation: "I renamed a file; no behavior change"
→ No release. Commit and move on.

Situation: "I want to publish a pre-release version"
→ /wbRelease --prerelease=beta (produces 1.5.0-beta.0)
```

**What's worth noticing:**

- Most commits do not warrant a release. Releases are for packages where *consumers* care about the change. Internal refactors, README fixes, and non-published files should stay out of release cycles.

---

## The pattern

`/wbRelease` is really three operations in one:

1. **Gate check** — test + audit + clean must pass.
2. **Version computation** — conventional commits + dependency graph → semver bumps.
3. **Workspace unpicking** — temporarily convert `workspace:*` to concrete versions.

If any of the three fail, `/wbRelease` refuses cleanly and leaves no partial state.

The `/wbPublish` command takes over after step 3. `/wbRelease --restore` reverses step 3 once `/wbPublish` succeeds.

---

---

## Basic Usage

```bash
# Standard command execution
/wbRelease frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbRelease deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbRelease` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbRelease target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbRelease target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbRelease target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbRelease packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbRelease apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbRelease` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbRelease frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

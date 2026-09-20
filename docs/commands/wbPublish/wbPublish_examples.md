---
title: "wbPublish — Examples"
description: "It builds the package and pushes the tarball to npm."
---

# /wbPublish — Examples

> Self-help. `/wbPublish` is what you run after `/wbRelease` has unpicked workspace protocols. This file shows what success + failure look like.

---

## /wbPublish's narrow job

It builds the package and pushes the tarball to npm. That's all. It does *not*:
- Bump versions (that's `/wbRelease`)
- Restore workspace protocols (that's `/wbRelease --restore`)
- Deploy apps (that's `/wbDeploy`)
- Run tests (that's `/wbTest`)

If any of these need doing, you're at the wrong step in the release workflow.

---

## Example 1 — `/wbPublish packages/wb-core` (happy path)

```text
$ /wbPublish packages/wb-core

[AI] Verifying /wbRelease has been run in this cycle...
[AI] ✅ reports/20260423/releases/release_202604232315.md exists
[AI] ✅ wb-core/package.json version matches release report (1.4.3)
[AI] ✅ workspace: protocols already unpicked (good — pre-publish state)
[AI]
[AI] Pre-build checks:
[AI] dist/ exists (build artifact present)
[AI] dist/index.js referenced by main matches package.json ✅
[AI]
[AI] Building...
[AI] npm run build → success (18s)
[AI]
[AI] Publishing...
[AI] npm publish --access=public
[AI] → @wbc/wb-core@1.4.3 published
[AI]
[AI] Writing reports/20260423/publishes/publish_wb-core_202604232330.md
[AI] ✅ Done.
[AI]
[AI] NEXT: run /wbRelease core2/ --restore to put workspace: protocols back.
```

**What's worth noticing:**

- First check verifies `/wbRelease` ran. Publishing without release means no version bump, which means you'd publish the same version as last time and npm would reject. The check catches this before bothering to build.
- `dist/` vs `dist-dev/` alignment is confirmed pre-build. The wbc-ui2 footgun surfaces again — if dist is stale, the published tarball will be stale code.
- Ends with a pointer to `--restore`. Publishing without restore = broken dev tree.

---

## Example 2 — `/wbPublish` refuses because /wbRelease wasn't run

```text
$ /wbPublish packages/wb-core

[AI] Verifying /wbRelease has been run in this cycle...
[AI] ❌ No release report in reports/20260423/releases/
[AI] ❌ package.json still contains workspace: references
[AI]
[AI] REFUSING to publish.
[AI] Reason: publishing with workspace: refs produces broken installs.
[AI]
[AI] Run /wbRelease core2/ first. If you wanted to re-publish
[AI] the same version, use `npm publish` directly (but verify version
[AI] wasn't already published).
```

**What's worth noticing:**

- Refusal is specific about *why* and gives the correct next command.
- The fallback ("use `npm publish` directly") acknowledges edge cases but flags the risk — version-already-published is a common accidental re-publish bug.

---

## Example 3 — `/wbPublish` with --dry-run

Useful when you want to verify the build + packaging without actually pushing.

```text
$ /wbPublish packages/wb-core --dry-run
```

```markdown
# Publish preview (dry-run)

## Would publish
- @wbc/wb-core@1.4.3

## Tarball contents (what npm would see)
- package.json (main: dist/index.js ✅)
- dist/index.js (45 KB)
- dist/index.js.map
- dist/styles.css
- README.md
- LICENSE

## Not included (filtered by .npmignore or files field)
- src/* (source not shipped)
- tests/*
- .agents/* (metadata not shipped)
- vite.config.js

## Version check
- Current: 1.4.3
- npm registry latest: 1.4.2
- Safe to publish (new version).

## Build
- Would run: npm run build
- Expected duration: ~18s (based on recent runs)

## Not actually published. Safe to review.
```

**What's worth noticing:**

- Tarball contents listing catches "what did I accidentally include?" mistakes. Source files, test files, or `.agents/` leaking into npm packages is surprisingly common.
- Version check against npm registry catches re-publish attempts before they fail server-side.

---

## Example 4 — `/wbPublish` fails partway

```text
$ /wbPublish packages/wb-dataviewer

[AI] Verifying release... ✅
[AI] Building... ✅
[AI] Publishing to npm...

[AI] ❌ ERROR: npm publish failed
[AI] Reason: authentication required (no npm token in environment)
[AI]
[AI] Current state:
[AI] - Build artifact written to dist/
[AI] - Version bumped in package.json (still 2.2.0)
[AI] - workspace: refs still unpicked
[AI] - NOT published to npm
[AI]
[AI] Recovery options:
[AI] 1. Fix auth (npm login or set NPM_TOKEN), retry /wbPublish
[AI] 2. Abandon publish: run /wbRelease --restore to recover
[AI] the workspace protocols. Version bump will remain in git.
[AI]
[AI] DO NOT run a fresh /wbRelease — the version is already bumped.
```

**What's worth noticing:**

- When publish fails, the command gives explicit recovery paths. Not "try again" — specific options with consequences.
- The warning "DO NOT run a fresh /wbRelease" is important. Double-bumping is a real mistake users make when recovering from auth failures.

---

## The pattern

A successful `/wbPublish` always has:
1. **Pre-check** — `/wbRelease` ran, version matches, protocols unpicked.
2. **Build** — pipe through the project's configured build.
3. **Publish** — `npm publish` with the configured access level.
4. **Post-pointer** — reminder to run `--restore`.

If step 1 fails, refuse. If step 2 fails, fix the build and retry (no cleanup needed — nothing published yet). If step 3 fails, offer recovery paths — do not silently retry.

---

---

## Basic Usage

```bash
# Standard command execution
/wbPublish frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbPublish deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbPublish` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbPublish target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbPublish target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbPublish target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbPublish packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbPublish apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbPublish` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbPublish frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

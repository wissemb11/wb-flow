---
title: "wbDeploy — Examples"
description: "Mixing: publishing an app to npm = dead code nobody installs."
---

# /wbDeploy — Examples

> Self-help. `/wbDeploy` is for apps. `/wbPublish` is for packages. This file clarifies the distinction and shows real flows.

---

## The critical distinction

| Packages (code others import) | Apps (things users visit) |
|---|---|
| `/wbRelease` → `/wbPublish` | `/wbDeploy` |
| Goes to npm | Goes to GitHub Pages / CDN / host |
| Has versions that matter | Has a URL that matters |
| No visual output | Has visual output |

Mixing: publishing an app to npm = dead code nobody installs. Deploying a package to a URL = nobody ever visits it. Use the right one.

---

## Example 1 — `/wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com` (standard)

```text
$ /wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com

[AI] Reading context.md + dev.md for the app...
[AI] Reading .agents/workflows/deploy.md (if present)...
[AI] → target: github-pages
[AI] → repo: wbc-ui/wbdataviewer2-demo
[AI] → branch: gh-pages
[AI]
[AI] Pre-deploy gates:
[AI] ✅ /wbTest on this app passed 2026-04-23
[AI] ⚠ /wbAudit has 1 MAJOR finding: hardcoded API URL in src/App.vue
[AI]
[AI] Proceed with deploy despite the audit finding? (y/n)
[AI] (this is a MAJOR, not a BLOCKER — your call)
```

User answers `y`:

```text
[AI] Building (mode: production)...
[AI] npm run build → dist/ written (1.8 MB)
[AI]
[AI] Verifying build:
[AI] index.html references hashed assets ✅
[AI] dist/assets/ contains 12 files ✅
[AI]
[AI] Deploying to GitHub Pages...
[AI] Pushing dist/ to gh-pages branch of wbc-ui/wbdataviewer2-demo
[AI] → Push successful
[AI]
[AI] GitHub Pages will serve the new version within ~2 minutes at:
[AI] https://wbc-ui.com/wbdataviewer2/
[AI]
[AI] Writing reports/20260423/deployments/deploy_wbdataviewer2_202604232400.md
[AI] ✅ Done.
[AI]
[AI] Follow-up: verify the site loads, then mark the audit finding resolved.
```

**What's worth noticing:**

- MAJOR audit findings are advisory, not blocking. The AI asks; you decide. BLOCKER findings *would* block.
- The deploy target is read from an app-level `deploy.md`, not inferred. Explicit config.
- The AI tells you the live URL and the ETA. Follow-up verification is the user's job — the AI can't see the live site.

---

## Example 2 — `/wbDeploy ... --dry-run` (preview)

```text
$ /wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com --dry-run
```

```markdown
# Deploy preview (dry-run)

## Would deploy
- App: wbdataviewer2.wbc-ui.com
- Target: GitHub Pages
- Repo: wbc-ui/wbdataviewer2-demo
- Branch: gh-pages
- URL: https://wbc-ui.com/wbdataviewer2/

## Build
- Mode: production
- Expected output: ~1.8 MB (based on recent builds)
- Duration: ~25s

## Gates
- /wbTest: PASS
- /wbAudit: 1 MAJOR (non-blocking), 0 BLOCKERS
- /wbClean: 2 dead files in src/examples/ (not deploy-blocking)

## What would be deployed
- dist/index.html
- dist/assets/* (hashed)
- dist/favicon.ico

## What would NOT be deployed
- src/* (source not shipped)
- .agents/* (metadata not shipped)
- examples/drafts/* (.gitignore'd)

## Not actually deploying.
```

**What's worth noticing:**

- `--dry-run` shows the same rigor as real deploy but without the push. Always use before a risky deploy.
- "What would NOT be deployed" catches the same accidental-inclusion bugs as `/wbPublish --dry-run`.

---

## Example 3 — `/wbDeploy ... --target=local` (local preview)

Not everything goes to production. Sometimes you want to serve the prod build locally to verify it works before pushing.

```text
$ /wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com --target=local

[AI] Building (mode: production)...
[AI] dist/ written
[AI]
[AI] Starting local server on http://localhost:4173/wbdataviewer2/
[AI] (this is the PRODUCTION build served locally, not dev server)
[AI]
[AI] Test the following before /wbDeploy --target=github:
[AI] - Does / load without console errors?
[AI] - Do deep links (/examples) work on refresh?
[AI] - Do assets resolve? (check network tab)
[AI] - Does the base URL match what GitHub Pages will serve?
[AI]
[AI] Server PID: 12345. Stop with Ctrl+C when done.
```

**What's worth noticing:**

- Local deploy is production build + local server. The distinction from `npm run dev` is crucial — dev server uses different module resolution, different base URL, no minification. Local prod-build preview catches deploy-specific bugs.
- The checklist (deep links, base URL, console errors) is what typically breaks when moving from dev to prod. Deep-link 404 on refresh is the #1 GitHub Pages bug.

---

## Example 4 — deploy refusal on BLOCKER

```text
$ /wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com

[AI] Pre-deploy gates:
[AI] ❌ /wbTest: 2 failures
[AI] - apiResponse_ cache test
[AI] - Example_wbPress render test
[AI]
[AI] REFUSING to deploy.
[AI] Fix tests first (or investigate whether they're test-wrong vs
[AI] code-wrong via /wbDebug). Do not override this refusal.
```

**What's worth noticing:**

- Test failures are BLOCKERS for deploy, full stop. Unlike audit findings (which can be MAJOR-but-advisory), broken tests refuse cleanly.
- The refusal suggests `/wbDebug` as the next move, not "run tests again hoping they pass."

---

## The pattern

Every `/wbDeploy` has:
1. **Gate check** — `/wbTest` must pass. `/wbAudit` advisory.
2. **Build** (production mode, always).
3. **Target routing** — GitHub Pages / local preview / other.
4. **Push** (or local serve).
5. **Post-deploy pointer** — URL + follow-up verification.

The command does not verify the deployed site works. That's a manual step. The AI cannot see the live URL.

---

---

## Basic Usage

```bash
# Standard command execution
/wbDeploy frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbDeploy deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbDeploy` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbDeploy target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbDeploy target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbDeploy target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbDeploy packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbDeploy apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbDeploy` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbDeploy frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

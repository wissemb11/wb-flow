# /wbDeploy — Expert

## What `/wbDeploy` architecturally is

A **target-routing deploy command** for apps. Reads per-app `deploy.md` config, runs the production build, and pushes output to the configured target (default: GitHub Pages). Gated on `/wbTest` passing and `/wbAudit` having no BLOCKERS.

The design choice worth naming: target-routing rather than target-specialization. One command, multiple possible targets, config-driven. The alternative (dedicated `/wbDeployGHPages`, `/wbDeployNetlify`, etc.) proliferates commands for no gain — the deploy *workflow* is identical; only the *last step* differs.

## The separation from /wbPublish

The architectural intuition: things that go to a registry (npm) and things that go to a URL (hosting) are different enough to need different commands, but not so different that they need unrelated abstractions.

- Both: build + push.
- `/wbPublish`: push is `npm publish` to a registry.
- `/wbDeploy`: push is `git push` (or similar) to a host.

Shared: gate-check phase, build phase, post-push reporting.
Different: what the push does, what success looks like, what recovery looks like.

Keeping them separate allows each to enforce target-specific gates (npm version conflicts vs. GitHub Pages base-url mismatches) without cross-contamination.

## Three design decisions worth naming

### 1. `--target=local` as a first-class mode
Production build + local server is functionally a staging environment. Most deploy tools expect a separate "preview deploy" URL for this. `/wbDeploy` folds staging into the same command by parameterizing the target. Cheaper + safer than a real preview host for the solo-dev case.

The tradeoff: local can't catch CORS / DNS / GitHub-caching bugs. For those, you still need a scratch-repo deploy. But local catches 80% of prod-specific bugs at 0% of the cost.

### 2. `deploy.md` as the per-app config
Not inferred from `package.json`, not hard-coded, not in the command invocation. A separate dedicated config file per app. This lets the command stay stateless (no memory across apps) and makes deploy targets auditable (the config is a file you can read).

### 3. Gated on reports, not on fresh checks
`/wbDeploy` reads recent `/wbTest` and `/wbAudit` reports to gate the deploy. It doesn't re-run them. Trade-off: faster deploys + trust in the report corpus. If reports are stale (>24h), the AI warns; very stale (>7d), it refuses until a fresh check.

## How the default target actually publishes

GitHub Pages serves from a single branch, so the push step is a branch replacement rather than a commit:

1. Build to `dist/`.
2. Create a throwaway git worktree at a temp location.
3. Copy `dist/` contents in as the **branch root** — not nested under `dist/`.
4. Force-push to `gh-pages`.
5. Remove the temp worktree.

The consequence worth internalizing: `gh-pages` is always "whatever the latest `dist` was," with no history of dev commits. Deploy history lives in `reports/.../deployments/`, not in the branch. This is also why rollback is another deploy rather than an undo — there is no prior state on the branch to return to.

## When GitHub Pages is the wrong target

It is a static-file host: point it at a branch and it serves whatever HTML/JS/CSS is there. It is **not** a build server (Actions can build; Pages itself cannot), **not** a server-side runtime, and **not** a CDN with arbitrary routing. So it is the wrong target when the app needs server-side rendering, API routes, redirects or rewrites beyond the SPA fallback, or is larger than roughly 1 GB. Any of those means switching `target:` in `deploy.md` to a real host — Vercel, Netlify, Cloudflare — which is exactly the extension path that leaks 3 and 4 below make awkward.

## Where the command leaks

1. **Post-deploy verification is manual.** The AI tells you the URL; it can't load it. Broken deploys are caught by the user clicking the link, not by the command. Possible mitigation: `--verify` flag that does a headless load + screenshot. Not implemented.

2. **Rollback is manual.** There's no "redeploy the previous version" command. You'd have to git checkout the previous `gh-pages` commit and force-push. Users under pressure do risky rollbacks.

3. **Target-specific gates live in the AI's prompt, not in schema.** Adding a new target (e.g., Netlify) requires updating `wbDeploy_template.md` with Netlify-specific gates. No formal extension mechanism.

4. **SPA fallback handling is GitHub-Pages-specific, embedded in the command.** If you deploy to a host that doesn't need the fallback (or needs a different mechanism), the logic is in the wrong place. Should be per-target plugin, isn't.

5. **No cross-deploy consistency check.** Deploy wb-dataviewer to `/wbdataviewer2/`, deploy wb-press to `/wb-press/`. If the base-urls are inconsistent (e.g., one ends in `/`, the other doesn't), nothing detects it. Users discover the inconsistency by clicking between apps.

What `wb-flow-docs`'s playbook gets wrong about `/wbDeploy`: treating it as app deployment only, when the actual scope includes the 3-tier build matrix (dev/free/pro) with WBC_PRO gating — which means deploy is as much about licensing enforcement as about pushing files to a server.

## One-paragraph verdict

A target-routing deploy command whose architectural contribution is correctly separating from `/wbPublish` (registry vs. URL), folding local-staging into the same command via `--target=local`, and trusting the report-corpus for gates. Weakest in post-deploy verification (manual), rollback mechanics (manual), and target-extension formality (prompt-level, not schema-level). The SPA-fallback coupling to GitHub Pages is the most concerning leak — adding a new target means modifying command logic, not just config. Correct for solo monorepo work with a small number of deploy targets; would need a plugin architecture and rollback tooling to scale to multiple hosts.

---

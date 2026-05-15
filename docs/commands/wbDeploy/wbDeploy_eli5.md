# wbDeploy — ELI5 Guide

## What is this?

Publishes your app to a web host (GitHub Pages, Vercel, Netlify, etc.) in a single command. It handles the full deployment pipeline — build, asset optimization, environment variable injection, upload, CDN purge, and a post-deploy smoke test to confirm the site is live and working.

The deployment pipeline runs sequentially: it first executes your framework's production build, then optimizes the output assets, injects environment variables from your secrets store, uploads only the changed files for speed, purges the CDN cache, and finally runs a smoke test against the live URL to confirm everything is operational. If any step fails, the entire deployment is aborted and the previous version remains live.

**What It Handles:**
- **Build step** — runs your framework's build command (Next.js, Vite, Astro, etc.) with production settings
- **Asset optimization** — minifies JS/CSS, compresses images, generates sourcemaps (optional)
- **Environment injection** — sets production environment variables from your `.env.production` or secrets manager
- **Upload & sync** — uploads the build output, syncs only changed files for fast incremental deploys
- **CDN cache purge** — invalidates CDN edge caches so users see the latest version immediately
- **Smoke test** — hits the deployed URL and verifies HTTP 200, SSL certificate, and response time

**When to use it:** Every time you ship. For production deploys, always use `--prod`. For feature branches, use `--preview` to get a staging URL for review.

## Why do I need it?

Deployment has many steps — build, configure, upload, verify — this bundles them so you can ship without errors. Manual deployment is error-prone (wrong branch, missing env vars, stale cache), and scripting it yourself takes days. `wbDeploy` gives you a production-grade pipeline in one command, with rollback protection built in.

**Tips:**
- Always verify the smoke test output — a 200 response doesn't mean the page renders correctly
- Use `--preview` for feature branches to get early feedback without affecting production
- Configure your secrets manager once — `wbDeploy` reads from it automatically on each deploy

## Simple Example

**GitHub Pages:** `/wbDeploy --target gh-pages` — builds the app and deploys to the `gh-pages` branch, then purges the CDN.

**Vercel:** `/wbDeploy --target vercel --prod` — deploys to Vercel production, injecting Vercel-specific environment variables from your config.

**Netlify preview:** `/wbDeploy --target netlify --preview --branch feature/new-dashboard` — creates a preview deployment with a unique URL for branch review, perfect for getting client feedback before merging.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


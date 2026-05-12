# wbPublish — ELI5 Guide

## What is this?

Handles publishing your documentation site to GitHub Pages — building the site, pushing to the `gh-pages` branch, and configuring the publish source. It's specifically designed for documentation projects that use VuePress, VitePress, Docusaurus, or similar SSGs.

The publishing pipeline handles the unique requirements of GitHub Pages: setting the correct base URL (especially for project sites hosted under a username), generating the `.nojekyll` file to prevent Jekyll processing, and ensuring the commit history on the `gh-pages` branch stays clean and manageable.

**What It Handles:**
- **Site build** — runs the documentation site builder (VuePress, VitePress, etc.) with production settings
- **Base URL configuration** — sets the correct `base` path for GitHub Pages sub-path hosting
- **GitHub Pages push** — commits the built output to the `gh-pages` branch with a clean history
- **Workflow integration** — can output the GitHub Actions workflow YAML for CI-based deployment
- **Custom domain** — applies `CNAME` file if you have a custom domain configured
- **Post-deploy verification** — checks that the published site returns HTTP 200 and contains expected content
- **Branch protection** — warns if `gh-pages` needs branch protection rules adjusted

**When to use it:** After updating documentation content. Run it locally for immediate publishing, or use `--ci-only` to set up automated publishing on push.

## Why do I need it?

Publishing docs to GitHub Pages involves several fiddly steps: building with the right base URL, pushing to a specific branch, configuring the Pages settings. `wbPublish` makes this a one-command operation so you focus on content, not infrastructure. No more "the CSS is broken because the base URL is wrong."

**Tips:**
- Use `--ci-only` to generate a GitHub Actions workflow and commit it — then publishing is automatic forever
- If you use a custom domain, configure it once with `--domain` and `wbPublish` will remember it
- After publishing, check the "Environments" tab on GitHub to see the deployment status

## Simple Example

**Publish docs:** `/wbPublish` — builds the documentation site and publishes it to GitHub Pages with automatic base URL detection.

**Custom domain:** `/wbPublish --domain docs.myproject.dev` — publishes with a custom domain configured via CNAME file.

**CI workflow:** `/wbPublish --ci-only` — doesn't publish itself but outputs a complete GitHub Actions workflow that will build and publish on every push to `main`, suitable for adding to `.github/workflows/`.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


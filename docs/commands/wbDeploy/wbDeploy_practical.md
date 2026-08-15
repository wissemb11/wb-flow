# /wbDeploy — Practical

## Three forms

```
/wbDeploy <app> # deploy to configured target (usually gh-pages)
/wbDeploy <app> --dry-run # preview, no push
/wbDeploy <app> --target=local # build + serve locally for testing
```

## The safe flow

```
/wbDeploy <app> --target=local # build + preview locally
# test in browser, confirm no prod-specific bugs
/wbDeploy <app> --dry-run # preview what would deploy
/wbDeploy <app> # real deploy
```

Skipping the local step is the #1 cause of "works in dev, broken in prod" deploys.

## Prerequisites

The app must have `.agents/workflows/deploy.md` filled in with target, repo, branch, base-url. `/wbDeploy` refuses if missing. For GitHub Pages — the default target in this monorepo — the minimum is:

```markdown
# Deploy config

- target: github-pages
- repo: <org>/<repo>
- branch: gh-pages
- base-url: https://wbc-ui.com/<app-slug>/
- build-output: dist/
- spa-fallback: true # creates 404.html for SPA deep links
```

Two of these fields cause almost every broken GitHub Pages deploy:

- **`base-url` must match `vite.config.js`'s `base`**, with leading *and* trailing slash. Mismatch means assets resolve to `/assets/*` at the domain root, 404, and the page renders blank with only the HTML loaded. `/wbDeploy` compares the two and warns if they disagree.
- **`spa-fallback: true`** generates the `404.html` that redirects deep links back to `index.html`. Without it, refreshing on `/examples` asks GitHub Pages for `/examples/index.html`, which does not exist. Verify after deploying by refreshing on a deep link: a brief flash of the 404 page then the real page means the fallback works; a permanent 404 means it is not wired.

If `base-url` is a custom domain, the `gh-pages` branch root needs a `CNAME` file. `/wbDeploy` generates it from `base-url` unless you set `generate-cname: false` and maintain it yourself — set one or the other, or the CNAME disappears on every deploy.

## First deploy to a new repo

Before the very first `/wbDeploy`:

1. [ ] Repo exists on GitHub.
2. [ ] `gh-pages` branch exists (can be empty; `/wbDeploy` populates it).
3. [ ] Repo Settings → Pages → Source = `gh-pages` branch.
4. [ ] Custom domain only: DNS CNAME record points at `<user>.github.io`.
5. [ ] `deploy.md` filled in with the correct repo, branch, and base-url.
6. [ ] `vite.config.js` `base` matches that base-url.

Then wait 2–5 minutes for GitHub Pages to recognize the branch.

## Gates the AI checks before deploy

1. `/wbTest` must have passed recently. Failures BLOCK.
2. `/wbAudit` BLOCKERS block. MAJORS are advisory.
3. Build output is present (`dist/`).
4. Deploy config is complete.

If any gate fails, the command refuses with a specific fix.

## After a successful deploy

The AI tells you the live URL. **Open it.** The AI cannot verify the live site works — that's your job. Click around. Check the console. Refresh on a deep link.

If the live site is broken but local-test passed, the issue is deploy-specific (base URL, CORS, DNS, GitHub Pages caching). Start with hard refresh + 5 min wait.

## When to deploy

- After `/wbAudit` on the app is clean.
- After user-facing changes.
- As part of a release cycle for apps bundled with package releases.
- NOT after internal refactors nobody will see.
- NOT for experimental changes. Create a scratch deploy target if needed.

## When /wbDeploy is the wrong command

- Package (code others import) → `/wbPublish`.
- Just want to see your changes locally → `npm run dev`. That's different from `--target=local`.
- Want to stage to a preview URL → set up a scratch deploy target in `deploy.md`, don't deploy to prod.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbDeploy --execute` and `/wbDeploy -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--dry-run` | `-d` |
| `--prod` | `-P` |
| `--target` | `-t` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

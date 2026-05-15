# wbDeploy — Practical Walkthrough

> Step-by-step guide to deploying a project to GitHub Pages or other platforms.

---

## 1. Deploy to GitHub Pages

```bash
/wbDeploy packages/my-docs --target=gh-pages
```

```text
[AI] Detected: VuePress documentation site
[AI] Build: npm run docs:build → dist/
[AI]
[AI] Generated: .github/workflows/deploy.yml
[AI]
[AI] Next steps:
[AI]   1. git add .github/workflows/deploy.yml
[AI]   2. git push origin main
[AI]   3. Enable GitHub Pages in repo Settings → Pages → Source: gh-pages
```

---

## 2. Deploy to Vercel

```bash
/wbDeploy packages/my-app --target=vercel
```

Generates `vercel.json` with the correct framework preset and build configuration.

---

## 3. Static Site Deploy

```bash
/wbDeploy packages/my-docs --target=gh-pages
```

For static sites (no build step), the deployment config points directly to the source directory.

---

## 4. Pre-Deploy Checklist

| Step | Command |
|---|---|
| Build locally first | `npm run build` |
| Verify output | `ls dist/` |
| Audit | `/wbAudit .` |
| Deploy | `/wbDeploy . --target=gh-pages` |

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| GitHub Pages | `/wbDeploy . --target=gh-pages` |
| Vercel | `/wbDeploy . --target=vercel` |
| Dry-run | `/wbDeploy . --dry-run` (shows config without writing) |
| Custom output dir | `/wbDeploy . --target=gh-pages --outdir=build` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

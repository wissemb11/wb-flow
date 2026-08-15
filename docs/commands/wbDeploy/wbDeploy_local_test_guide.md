# /wbDeploy — Local Test Guide

> Self-help. Guide for using `/wbDeploy --target=local` to validate a production build before pushing it live. Catches deploy-specific bugs that `npm run dev` misses.

---

## Why local-deploy-test matters

`npm run dev` and `npm run build` produce materially different artifacts:

| Dev | Prod (build) |
|---|---|
| Unminified | Minified |
| Source maps inline | External or stripped |
| Module resolution via HMR | Static, filesystem-based |
| Base URL usually `/` | Whatever `vite.config.base` says |
| Env vars from `.env.development` | From `.env.production` |
| Import aliases resolved by vite dev server | Resolved by rollup at build time |

Code that "works in dev" regularly breaks in prod because of one of these differences. The local-deploy-test exists to catch those before pushing to GitHub Pages.

---

## The basic flow

```
/wbDeploy <app> --target=local
```

What it does:
1. Runs `npm run build` (production mode).
2. Starts a static server on `localhost:4173` (vite's default preview port).
3. Serves the `dist/` output using the configured `base-url` path.
4. Prints the URL to open in a browser.

What it does **not** do:
- Run the dev server (that's `npm run dev`).
- Hot-reload on source changes (prod build is static).
- Verify the site actually works (you test in the browser).

---

## The manual test checklist

After `/wbDeploy --target=local`, open the browser and check:

### Rendering
- [ ] Root URL loads without console errors.
- [ ] All images / fonts / icons load (check network tab).
- [ ] No 404s for any asset.
- [ ] CSS is applied (page isn't unstyled).

### Routing (for SPAs)
- [ ] Deep link works on first load (e.g., `localhost:4173/app/examples`).
- [ ] Deep link works on refresh.
- [ ] Browser back/forward works.
- [ ] Router navigation doesn't reload the page.

### Behavior
- [ ] Primary user flow works (for wbdataviewer2: can you view an example?).
- [ ] Examples that use `:wbCode="false"` stay collapsed (wb-labs convention).
- [ ] API calls work (if the app has them).
- [ ] Console is clean. No warnings, no errors.

### wbc-ui2 specifics
- [ ] `apiResponse_` caching works (navigate + come back, see cached state).
- [ ] `WBCode` components render correctly (dev-only markers shouldn't leak).
- [ ] VuePress apps (wb-press): markdown tables render without the inline-wrap bug.

---

## Common prod-only bugs to watch for

1. **Base URL mismatch.** Dev server serves at `/`, prod build at `/<app-slug>/`. If vite `base` isn't set, assets reference `/assets/*` which 404s in prod.

2. **Import of node built-ins.** Dev tolerates some; prod doesn't. If `node:fs` or similar leaks into client code, build silently strips it and runtime errors.

3. **Environment variables.** `import.meta.env.VITE_FOO` works in dev if `.env.development` has it, but fails in prod if `.env.production` doesn't.

4. **Minification + dev-only imports.** Code gated by `if (import.meta.env.DEV)` should tree-shake out in prod. If it doesn't, `__WBC_DEV__` leaks and the dev-only code runs in production.

5. **Dynamic imports with non-static paths.** `import(somePath)` can't be analyzed by rollup; prod won't find the chunk. Use static strings.

6. **Case-sensitive imports.** macOS dev is case-insensitive. Linux (where GitHub Pages lives) is case-sensitive. `import Component from './component'` that works locally breaks on deploy.

---

## When to skip the local test

- Docs changes only (no code). Prod build is identical.
- Trivial CSS tweaks. Low risk of prod-specific breakage.
- Emergency hotfixes where deploy rollback is easy.

For anything touching routing, imports, env vars, or feature gates, don't skip.

---

## If local test passes but deploy fails

The ~1 difference remaining is *serving path*. GitHub Pages serves at `https://wbc-ui.com/<slug>/`. Local server serves at `http://localhost:4173/<slug>/`. They should behave identically if `base-url` is configured, but:

- CORS + protocol: if your API calls assume `https://`, local test on `http://` won't catch CORS issues.
- Absolute redirects: `window.location = 'https://...'` hardcoded in code will break on local but pass on deploy (or vice versa).

For these, the only real test is staging or a dry-run on a scratch deploy repo.

---

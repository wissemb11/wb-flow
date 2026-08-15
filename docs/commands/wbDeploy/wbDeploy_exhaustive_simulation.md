# /wbDeploy — Exhaustive Simulation ()

`/wbDeploy` is the shipper of **apps**, not packages. Apps are the things end users hit — domain names, build artifacts uploaded to a host, environment variables on a cloud provider. `/wbPublish` handles npm packages; `/wbDeploy` handles deployments to Vercel/Cloudflare/AWS/whatever the target is. The two commands stay separate because the failure modes are different.

Read this if you want to know what `--prod` actually changes vs `--target`, why `--dry-run` is the safest default for first-time use, and where deploy ends and release coordination (`/wbRelease`) begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Shipper — pushes apps to hosting environments. |
| **Target** | An app directory (e.g., `apps/wbc-ui.com`), comma-separated set, glob, or environment shorthand (`staging`, `production`). |
| **Cell scope** | None directly. Plan rows about deployment exist; `/wbDeploy` doesn't mutate them. |
| **Side effects allowed** | Building the app; uploading artifacts; setting environment variables on the cloud provider; updating DNS aliases (with confirmation). |
| **Side effects forbidden** | Modifying source code; mutating git state (no commits, no tags — that's `/wbRelease`'s job); running migrations against shared databases without explicit confirmation; modifying deploys outside the target list. |

The "no source modifications" rule is the contract with `/wbRelease`. `/wbDeploy` ships *what's already in the working tree*. If the working tree is dirty, the agent warns; if a version bump is needed, that's `/wbRelease`'s job, not `/wbDeploy`'s.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbDeploy` does |
|---|---|---|
| App directory | `Command: /wbDeploy apps/wbc-ui.com` | Deploys one app. |
| Comma-separated | `Command: /wbDeploy apps/wbc-ui.com,apps/admin` | Deploys both, parallel where the host supports it. |
| Glob | `Command: /wbDeploy "apps/*"` | Deploys every app. Slow; warns about scope. |
| Environment shorthand | `Command: /wbDeploy production` | **Refused.** Environment must be a flag (`--prod`/`-P`), not a target. |
| Free-text | `Command: /wbDeploy "the main site"` | Refused. |

The "environment as flag, not target" distinction exists because conflating them produces ambiguity: `/wbDeploy production` could mean "deploy to production" or "deploy the app named production." Forcing the flag form removes the ambiguity.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--target="<env>"` | `-t` | Names the deployment target environment: `preview` (default), `staging`, or any custom env declared in the host config. |
| `--prod` | `-P` | Shorthand for `--target="production"` with extra confirmation gates. Capitalized to signal high-stakes. |
| `--dry-run` | `-d` | Builds the app and validates the deploy steps but does not actually upload. Reports what *would* happen. |

### How `--target` and `--prod` interact

| Combination | Behavior |
|---|---|
| no flag | Deploys to `preview`. Produces a unique preview URL. Safe by default. |
| `--target="staging"` | Deploys to staging. One confirmation. |
| `--target="production"` | Deploys to production. **Two** confirmations + dry-run encouraged. |
| `--prod` | Equivalent to `--target="production"` but the flag itself is loud — anyone reading the command sees "production." |
| `--target="custom-env"` | Honors the custom env if declared in host config. Fails honestly if not. |

The confirmation count scales with risk: preview = none, staging = 1, production = 2. Production deploys are the irreversible ones — once traffic routes to a new build, rollback is *another* deploy, not an undo.

### How `--dry-run` validates

| Step | Live | Dry-run |
|---|---|---|
| Build | Runs build command. | Runs build command. |
| Validate config | Checks env vars, host credentials. | Checks env vars, host credentials. |
| Upload | Actually uploads. | Skipped; logs what *would* upload (file list, size). |
| Switch traffic | Updates DNS/aliases. | Skipped; logs what *would* switch. |
| Notify | Sends release notes if configured. | Skipped. |

The build runs on dry-run because build failures are the most common deploy blocker. Catching them in `--dry-run` is the point.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbDeploySimPipelines = [
  {
    "title": "The first preview deploy of a new app",
    "cmd": "/wbDeploy apps/wbc-ui.com",
    "logs": [
      {
        "text": "[SYSTEM] Target: apps/wbc-ui.com",
        "type": "sys"
      },
      {
        "text": "[ENV] Target environment: preview (default).",
        "type": "gen"
      },
      {
        "text": "[CHECK] Working tree is clean? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Host credentials configured? Yes (vercel via .vercelrc).",
        "type": "gen"
      },
      {
        "text": "[BUILD] Running pnpm --filter wbc-ui.com build...",
        "type": "gen"
      },
      {
        "text": "Output: apps/wbc-ui.com/dist/ (147KB)",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] All required env vars present.",
        "type": "gen"
      },
      {
        "text": "[UPLOAD] Pushing artifacts to Vercel preview...",
        "type": "gen"
      },
      {
        "text": "[DNS] Preview URL: https://wbc-ui.com-abc123.vercel.app",
        "type": "gen"
      },
      {
        "text": "[DEPLOY] Build successful. Preview URL is live.",
        "type": "gen"
      },
      {
        "text": "[OK] Preview deployed. URL: https://wbc-ui.com-abc123.vercel.app",
        "type": "ok"
      },
      {
        "text": "[NOTE] This is a preview only. Run with --prod for production.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The production deploy with double-gate",
    "cmd": "/wbDeploy apps/wbc-ui.com --prod",
    "logs": [
      {
        "text": "[SYSTEM] Target: apps/wbc-ui.com",
        "type": "sys"
      },
      {
        "text": "[ENV] PRODUCTION (--prod). High-stakes deploy.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Working tree clean? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Most recent commit is on main? Yes (commit a1b2c3d).",
        "type": "gen"
      },
      {
        "text": "[CHECK] Tests pass on the current commit? Last /wbTest run was clean.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Host credentials configured? Yes.",
        "type": "gen"
      },
      {
        "text": "[STRONG SUGGESTION] Run --dry-run first if you haven't yet:",
        "type": "gen"
      },
      {
        "text": "/wbDeploy apps/wbc-ui.com --prod --dry-run",
        "type": "gen"
      },
      {
        "text": "[CONFIRM 1/2] You are about to deploy commit a1b2c3d to production",
        "type": "gen"
      },
      {
        "text": "wbc-ui.com. This will route traffic to the new build.",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[BUILD] Running pnpm --filter wbc-ui.com build (production mode)...",
        "type": "gen"
      },
      {
        "text": "[BUILD] Output: apps/wbc-ui.com/dist/ (151KB, prod-optimized).",
        "type": "gen"
      },
      {
        "text": "[CONFIRM 2/2] Build artifact is ready. Upload + switch DNS to make",
        "type": "gen"
      },
      {
        "text": "this build live? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[UPLOAD] Pushing artifacts to Vercel production project...",
        "type": "gen"
      },
      {
        "text": "[DNS] Switching wbc-ui.com \u2192 new build (build ID: prod-2026-05-04-001).",
        "type": "gen"
      },
      {
        "text": "[DEPLOY] Production traffic now routed to new build.",
        "type": "gen"
      },
      {
        "text": "[OK] Production deployed.",
        "type": "ok"
      },
      {
        "text": "[ROLLBACK] If something breaks, the previous build (prod-2026-05-04-000)",
        "type": "gen"
      },
      {
        "text": "can be re-promoted. Rollback isn't an undo \u2014 it's another",
        "type": "gen"
      },
      {
        "text": "deploy. Use /wbDeploy apps/wbc-ui.com --prod with the",
        "type": "gen"
      },
      {
        "text": "previous artifact ID if you set up build tracking.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The dry-run before production",
    "cmd": "/wbDeploy apps/wbc-ui.com --prod --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run \u2014 no upload will occur.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Working tree clean? Yes.",
        "type": "gen"
      },
      {
        "text": "[BUILD] Running production build...",
        "type": "gen"
      },
      {
        "text": "[BUILD] Success. Output: 151KB.",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] Env vars present? All required values found.",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] Host credentials? Verified.",
        "type": "gen"
      },
      {
        "text": "[UPLOAD] Skipped (dry-run).",
        "type": "gen"
      },
      {
        "text": "Would upload: apps/wbc-ui.com/dist/ (151KB)",
        "type": "gen"
      },
      {
        "text": "Would switch: wbc-ui.com \u2192 new build.",
        "type": "gen"
      },
      {
        "text": "[OK] Dry run passed. The real --prod deploy would succeed.",
        "type": "ok"
      },
      {
        "text": "[NEXT] /wbDeploy apps/wbc-ui.com --prod",
        "type": "gen"
      }
    ],
    "note": "The recommended pattern for production deploys:",
    "noteType": "info"
  },
  {
    "title": "Multi-app deploy",
    "cmd": "/wbDeploy apps/wbc-ui.com,apps/md.wbc-ui.com,apps/admin --prod",
    "logs": [
      {
        "text": "[SYSTEM] Production deploy of 3 apps.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Working tree clean? Yes.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM 1/2] Deploy 3 apps to production? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[BUILD] Running 3 builds in parallel...",
        "type": "gen"
      },
      {
        "text": "wbc-ui.com: success, 151KB.",
        "type": "gen"
      },
      {
        "text": "md.wbc-ui.com: success, 132KB.",
        "type": "gen"
      },
      {
        "text": "admin: BUILD FAILED. TypeScript error in src/Routes.tsx:42.",
        "type": "gen"
      },
      {
        "text": "[HALT] One of three builds failed. Refusing to partial-deploy.",
        "type": "gen"
      },
      {
        "text": "[NO UPLOADS]",
        "type": "gen"
      },
      {
        "text": "[ERROR] admin build error:",
        "type": "error"
      },
      {
        "text": "src/Routes.tsx:42 \u2014 Property 'foo' does not exist on type 'Bar'.",
        "type": "gen"
      },
      {
        "text": "[NEXT] Fix the admin build, then re-run. Multi-deploy is all-or-nothing.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbDeploy" titleSuffix="Exhaustive Simulation" :pipelines="wbDeploySimPipelines" />


### 💠 Pipeline The first preview deploy of a new app


### 💠 Pipeline The production deploy with double-gate


### 💠 Pipeline The dry-run before production

The recommended pattern for production deploys:


### 💠 Pipeline Multi-app deploy

---

## 5. Edge cases & refusals

| Trigger | What `/wbDeploy` does |
|---|---|
| No target | Halt. |
| Free-text target | Halt. |
| Working tree dirty (uncommitted changes) | Warn prominently; ask confirmation. The deploy will reflect uncommitted state if proceed. |
| `--prod` on a commit that isn't on main | Refuse. Production deploys must be from a known-good branch. |
| Missing host credentials | Halt with explicit setup instructions. |
| `--target="<unknown>"` | Halt. Lists known environments. |
| `--prod --dry-run` | Permitted; safest combination for "preview the production behavior." |
| Build fails | Halt; no upload. |
| Upload fails partway | Reports clearly which app/env succeeded and which didn't. |
| Multi-app deploy with one build failure | Refuse all uploads. Atomic-by-build. |
| Free-text "rollback" | Refuse — rollback isn't an undo, it's a deploy. Suggests the explicit re-deploy of the previous artifact. |

### Post-deploy symptoms (GitHub Pages)

These land *after* the command reports success, which is why the practical layer insists you open the URL yourself — no gate catches any of them.

| Symptom | Likely cause | Fix |
|---|---|---|
| Page blank, assets 404 | vite `base` ≠ deploy `base-url` | Match them, including both slashes |
| Refresh on a deep link → 404 | `spa-fallback` not set | Set `spa-fallback: true`, redeploy |
| "Page not found" at the root | `gh-pages` branch empty | Check Settings → Pages → Source |
| CSS loads but JS doesn't | `type="module"` served with the wrong MIME | GitHub Pages quirk; usually self-resolves after a rebuild |
| Push succeeded but old content shows | GitHub Pages cache | Wait 5–10 min, then hard refresh |
| CNAME disappears every deploy | `generate-cname: false` with no manual file | Either auto-generate or commit the CNAME |

The pattern: **`/wbDeploy` is the irreversible operation in the QA chain.** Multiple gates, dry-run encouraged, `--prod` is loud, atomic-by-build for multi-app deploys, and rollback is *another* deploy (not undo). It refuses to deploy from dirty trees without explicit acknowledgment, refuses to deploy to unknown environments, refuses to partially deploy when builds fail. The boundary with `/wbRelease` (version bumps, git tags) and `/wbPublish` (npm) is hard: deploy ships apps; release coordinates versions; publish ships packages.

# wb-flow Protocol: /wbDeploy Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbDeploy` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/apps`
**Live State Evaluated:** 
*   Active Environment: `wb-labs`
*   Status: `demo.wbc-ui.com` is actively running a dev server (uptime: 2h+). `md.wbc-ui.com` and `wbc-ui.com` are ready for deployment.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Frontend (Vercel) | **[ACTIVE]** System is primed to route consumer apps to Vercel pipelines. |
| Target is Backend (AWS/Docker) | **[INACTIVE]** `core2` monorepo currently contains frontend consumers, not Docker APIs. |
| Missing Environment Variables | **[ACTIVE]** Validating `VITE_API_URL` presence before allowing push. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific Package | `Command: /wbDeploy apps/wbc-ui.com` | Locks onto main UI app. | `[PROCEED] Initiating deployment for wbc-ui.com.` |
| Comma-Separated | `Command: /wbDeploy apps/wbc-ui.com,apps/md.wbc-ui.com` | Extracts both consumer apps. | `[PROCEED] Parallel deployment queued.` |
| Environment Name | `Command: /wbDeploy staging` | Defaults to deploying current `main` branch state. | `[PROCEED] Targeting Vercel 'staging' slots.` |
| Wildcard Glob | `Command: /wbDeploy apps/*` | Extracts all 3 apps. | `[PROCEED] Massive deployment of the core2 UI ecosystem.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--target="<env>"` | `Command: /wbDeploy apps/demo.wbc-ui.com -t="preview"` | `[TARGET] Pushing demo app to ephemeral preview URL.` |
| `--rollback` | `Command: /wbDeploy apps/wbc-ui.com -r` | `[ROLLBACK] Aliasing wbc-ui.com to previous stable Vercel deployment.` |
| `--env-sync` | `Command: /wbDeploy -e` | `[ENV] Parsing .env.production and syncing with Vercel secrets.` |
| `--dry-run` | `Command: /wbDeploy apps/wbc-ui.com -d` | `[DRY-RUN] Vite build completed in 4.2s. Bundle size OK. Aborted push.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Massive Production Release" (`apps/* -t="production" -e`)
**Live Context:** The `wb-core` package was updated with the new JWT Handshake and Regex fixes. The user wants to push these updates to all 3 consumer apps simultaneously.
**Command Executed:** `/wbDeploy apps/* -t="production" -e`
**Live Output:**
```text
> Command: /wbDeploy apps/* -t="production" -e

[SYSTEM] Initiating Massive Production Rollout for core2 ecosystem...
[ENV] Synced VITE_JWT_SECRET to Vercel Production scope.
[DEPLOY] Building apps/wbc-ui.com... [Vercel Node: Active]
[DEPLOY] Building apps/md.wbc-ui.com... [Vercel Node: Active]
[DEPLOY] Building apps/demo.wbc-ui.com... [Vercel Node: Active]
[SUCCESS] All 3 apps deployed successfully. DNS alias active.
```

### 💠 The "Panic Rollback" (`apps/wbc-ui.com -t="production" -r`)
**Live Context:** The new Regex fix in `wb-core` actually broke Safari rendering on the main app. Need to revert immediately.
**Command Executed:** `/wbDeploy apps/wbc-ui.com -t="production" -r`
**Live Output:**
```text
> Command: /wbDeploy apps/wbc-ui.com -t="production" -r

[SYSTEM] Panic Rollback initiated for wbc-ui.com.
[ROLLBACK] Fetching Vercel deployment history...
[ROLLBACK] Targeting `v4.5.1` (Last stable).
[ACT] Instant Alias routing engaged.
[SUCCESS] wbc-ui.com reverted to previous state.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Build Failure | **[PASS]** Local `npm run build` succeeds for all apps. | Cloud deployment proceeds safely. |
| Health Check Timeout | **[PASS]** Vercel edge functions responding in < 50ms. | Deployment marked successful. |
| Invalid Credentials | **[PASS]** `VERCEL_TOKEN` is active in system memory. | Handshake accepted. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

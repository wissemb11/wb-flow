# wb-flow Protocol: /wbDeploy Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbDeploy` command. It serves as the definitive reference for how the agent manages cloud infrastructure rollouts, environment variables, blue/green deployments, and catastrophic rollbacks.

---

## 1. Role & Definition Matrix
**Role:** The Infrastructure & Deployment Orchestrator
**Target:** Pushes built artifacts to hosting environments (Vercel, AWS, Cloudflare) and manages domain/DNS routing.
**Core Protocol:** Strict adherence to "Zero-Downtime". The agent must verify health checks before traffic is officially routed to the new build.

| Scenario | System Behavior |
|---|---|
| Target is Frontend (Vercel) | **[PROCEED]** Validates build size. Pushes to Preview URL. Runs Lighthouse. Promotes to Production. |
| Target is Backend (AWS/Docker) | **[PROCEED]** Builds Docker image. Pushes to ECR. Triggers ECS rolling update. |
| Missing Environment Variables | **[HALT]** Protocol forbids deploying if required `.env` keys (e.g., DB_URI) are missing from the cloud provider. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbDeploy` targets specific infrastructure blocks rather than codebase files.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific Package | `Command: /wbDeploy packages/wbc-ui.com` | Locks onto the specific app. | Deploys only the UI consumer app. Leaves core packages untouched. |
| Comma-Separated | `Command: /wbDeploy md.wbc-ui.com,wbc-ui.com` | Resolves both apps. | Deploys both frontend apps simultaneously via parallel CI workers. |
| Environment Name | `Command: /wbDeploy staging` | Translates semantic name to configuration. | Deploys current `main` branch to the `staging` Vercel project. |
| Wildcard Glob | `Command: /wbDeploy apps/*` | Extracts all deployable consumer applications. | Massive synchronized deployment of the entire frontend ecosystem. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--target="<env>"` | `-t` | Explicitly sets the deployment tier (`preview`, `staging`, `production`). | `Command: /wbDeploy wbc-ui.com -t="production"` | `[TARGET] Bypassing preview. Pushing directly to production domain.` |
| `--rollback` | `-r` | Instantly reverts the specified environment to the previous stable build ID. | `Command: /wbDeploy wbc-ui.com -r` | `[ROLLBACK] Reverting traffic from Build #402 to Build #401.` |
| `--env-sync` | `-e` | Pushes local `.env.production` keys securely to the cloud provider before building. | `Command: /wbDeploy -e` | `[ENV] Synced 4 new secure variables to Vercel.` |
| `--dry-run` | `-d` | Simulates the build step without actually pushing to the cloud. | `Command: /wbDeploy wbc-ui.com -d` | `[DRY-RUN] Build successful. Bundle size: 1.2MB. Upload aborted.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Production Release" (`apps/* -t="production" -e`)
**Context:** The epic is complete. The developer needs to update the environment variables and deploy all consumer apps to production simultaneously.
**Command Executed:** `/wbDeploy apps/* -t="production" -e`
**Simulated Protocol Chain:**
1. Validates AWS/Vercel credentials.
2. Glob resolves to 3 deployable apps (`wbc-ui.com`, `md.wbc-ui.com`, `admin`).
3. Syncs `.env` keys to cloud (`-e`).
4. Triggers parallel production builds (`-t="production"`).
**Simulated Output:**
```markdown
> Command: /wbDeploy apps/* -t="production" -e

[SYSTEM] Initiating Massive Production Rollout for 3 apps...
[ENV] Synced JWT_SECRET and DB_HOST to Vercel Production.
[DEPLOY] Building wbc-ui.com...
[DEPLOY] Building md.wbc-ui.com...
[DEPLOY] Building admin...
[SUCCESS] All builds passed. Traffic routed to new deployments.
```

### 💠 The "Panic Rollback" (`md.wbc-ui.com -t="production" -r`)
**Context:** A critical bug slipped into production. User needs to instantly revert traffic.
**Command Executed:** `/wbDeploy md.wbc-ui.com -t="production" -r`
**Simulated Output:**
```markdown
> Command: /wbDeploy md.wbc-ui.com -t="production" -r

[SYSTEM] Panic Rollback initiated for md.wbc-ui.com (Production).
[ROLLBACK] Identifying last known stable build... (Build ID: v4.1.0).
[ACT] Re-routing DNS aliases...
[SUCCESS] Rollback complete. Production is stable.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Build Failure | Vite/Next.js fails during cloud compilation. | `❌ Error: Build failed due to syntax error. Deployment aborted.` |
| Health Check Timeout | App deploys but `/api/health` returns 500. | `⚠️ Warning: Health check failed. Auto-triggering Rollback.` |
| Invalid Credentials | Missing Vercel Token. | `❌ Error: Unauthorized. Run /wbSetup to configure cloud credentials.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

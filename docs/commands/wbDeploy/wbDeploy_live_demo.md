# /wbDeploy — Live Demo ()

What `/wbDeploy` would actually do on `wb-labs` right now. The live state of working tree, host credentials, and the absence/presence of deployable apps below is real.

---

<CommandLiveDemoAnimation command="wbDeploy" />

## 1. Live target

| Field | Live value |
|---|---|
| Working tree | Heavily dirty — many uncommitted docs files in `frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/` |
| Existing apps in workspace | Not obvious in current `core2/` layout. Apps may live elsewhere (`frontEnd/wbc-ui/`) per memory's user_profile note |
| Host credentials configured | Unknown — would surface during `--prod` checks |
| Existing deploy infrastructure | Not visibly active in this session; `/wbDeploy` would surface "no host config detected" if run |
| Memory rules | `feedback_no_git.md` (no git ops); `feedback_model_selection.md` (declare model); release/deploy rules implicit in the docs convention |

The "dirty working tree" reality is the most relevant constraint. Any production deploy attempt right now would warn loudly because the docs sync isn't yet committed.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbDeploy apps/wbc-ui.com` | Halt or warn — apps/ may not exist in current layout. If found, would warn about dirty tree. |
| `/wbDeploy --prod` (no target) | Halt — target required. |
| `/wbDeploy production` | Halt — environment-as-target refused; needs `-P` flag. |
| `/wbDeploy frontEnd/wbc-ui/` (per memory user profile mentioning the @wbc-ui2 ecosystem) | Permitted *if* an app is identified there. Otherwise halts with "no app config detected." |
| `/wbDeploy "the main site"` | Halt — free-text. |
| `/wbDeploy apps/wbc-ui.com --dry-run` | Safest first invocation in this state. Would surface tree-dirty warning + any build issues. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| (no flag) | Default to preview env. Single confirmation. Tree-dirty warning. |
| `--target="staging"` | One confirmation. Tree-dirty warning. |
| `--prod` | Two confirmations. Strong "run dry-run first" suggestion. Refuses if HEAD isn't on main. |
| `--dry-run` | No upload. Build only. Useful to validate config without risk. |
| `--prod --dry-run` | Recommended pre-prod combination. |

---

## 4. Pipelines

<script setup>
const wbDeployPipelines = [
  {
    "title": "The \"tree-dirty\" warning on first attempt",
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
        "text": "[CHECK] Working tree clean? **NO** \u2014 uncommitted changes detected:",
        "type": "gen"
      },
      {
        "text": "17 new files in frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/",
        "type": "gen"
      },
      {
        "text": "3 modified files in frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/, docs/",
        "type": "gen"
      },
      {
        "text": "[WARN] Production deploy from a dirty working tree is risky:",
        "type": "warn"
      },
      {
        "text": "(a) the deployed build won't match git HEAD,",
        "type": "gen"
      },
      {
        "text": "(b) the docs sync work would not be reflected anywhere",
        "type": "gen"
      },
      {
        "text": "except the live build,",
        "type": "gen"
      },
      {
        "text": "(c) rollback would re-deploy the *committed* state,",
        "type": "gen"
      },
      {
        "text": "losing your uncommitted work from the deploy lineage.",
        "type": "gen"
      },
      {
        "text": "[STRONG SUGGESTION] Commit first:",
        "type": "gen"
      },
      {
        "text": "/wbGit -r -e -p",
        "type": "gen"
      },
      {
        "text": "Then re-run /wbDeploy.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Proceed anyway with dirty tree? [y/N] >",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The `--dry-run` first",
    "cmd": "/wbDeploy apps/wbc-ui.com --prod --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run \u2014 no upload will occur.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Working tree clean? NO (warning, not blocking in dry-run).",
        "type": "gen"
      },
      {
        "text": "[CHECK] HEAD on main? Yes (commit e07bb93).",
        "type": "gen"
      },
      {
        "text": "[CHECK] Host credentials? **Not detected**.",
        "type": "gen"
      },
      {
        "text": "Looked for: .vercelrc, netlify.toml, AWS_PROFILE in env.",
        "type": "gen"
      },
      {
        "text": "[HALT] Cannot dry-run without host credentials. Build alone doesn't",
        "type": "gen"
      },
      {
        "text": "validate the deploy path; we need to know where it would go.",
        "type": "gen"
      },
      {
        "text": "[NEXT] Configure host credentials or use a tool that doesn't require",
        "type": "gen"
      },
      {
        "text": "cloud auth (e.g., local preview via `pnpm --filter wbc-ui.com dev`).",
        "type": "gen"
      }
    ],
    "note": "The recommended path in this state:",
    "noteType": "info"
  },
  {
    "title": "The \"no apps here\" honesty",
    "cmd": "/wbDeploy \"apps/*\"",
    "logs": [
      {
        "text": "[SYSTEM] Glob target.",
        "type": "sys"
      },
      {
        "text": "[SCAN] Looking for apps/... not found in workspace root.",
        "type": "gen"
      },
      {
        "text": "[SCAN] Memory note (user_profile): user is creator of @wbc-ui2 npm",
        "type": "gen"
      },
      {
        "text": "ecosystem \u2014 apps may live elsewhere or be planned but not yet",
        "type": "gen"
      },
      {
        "text": "built.",
        "type": "gen"
      },
      {
        "text": "[HALT] No deployable apps found at the glob target.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] If apps live in a non-standard location:",
        "type": "gen"
      },
      {
        "text": "/wbDeploy <explicit-path>",
        "type": "gen"
      },
      {
        "text": "If you want to bootstrap a deployable app:",
        "type": "gen"
      },
      {
        "text": "/wbSetup --focus=\"new-app-deploy\" (creates the scaffolding)",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "A clean rollback (hypothetical)",
    "cmd": "/wbDeploy apps/wbc-ui.com --prod",
    "logs": [
      {
        "text": "(with intent to roll back to a previous build)",
        "type": "gen"
      },
      {
        "text": "[SYSTEM] Production deploy.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Tree clean? Yes (post-/wbGit).",
        "type": "gen"
      },
      {
        "text": "[CHECK] HEAD on main? Yes.",
        "type": "gen"
      },
      {
        "text": "[NOTICE] If you are intending to ROLLBACK rather than deploy a new",
        "type": "gen"
      },
      {
        "text": "build, use the explicit previous-artifact form. Rollback",
        "type": "gen"
      },
      {
        "text": "isn't an undo \u2014 it's another deploy with a previous artifact.",
        "type": "gen"
      },
      {
        "text": "[QUESTION] Are you deploying:",
        "type": "gen"
      },
      {
        "text": "(a) The current commit (a1b2c3d) \u2192 new build.",
        "type": "gen"
      },
      {
        "text": "(b) A previous build artifact (rollback) \u2192 which build ID?",
        "type": "gen"
      },
      {
        "text": "[Answer: b, prod-2026-05-04-000]",
        "type": "gen"
      },
      {
        "text": "[ROLLBACK MODE] Re-deploying artifact prod-2026-05-04-000.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM 1/2] Roll production traffic back to artifact prod-2026-05-04-000?",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[CONFIRM 2/2] DNS will switch from current build to previous. Last call.",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[DNS] Switching wbc-ui.com \u2192 prod-2026-05-04-000.",
        "type": "gen"
      },
      {
        "text": "[OK] Rollback complete. Production now serving previous build.",
        "type": "ok"
      },
      {
        "text": "[NOTE] git HEAD is unchanged. The git history doesn't reflect the",
        "type": "gen"
      },
      {
        "text": "rollback \u2014 only the deployed artifact does. Document the",
        "type": "gen"
      },
      {
        "text": "rollback in /wbBroadcast or release notes if appropriate.",
        "type": "gen"
      }
    ],
    "note": "If apps were configured and live, a rollback is a re-deploy of a previous artifact:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbDeploy" :pipelines="wbDeployPipelines" />


### 💠 Pipeline The "tree-dirty" warning on first attempt


### 💠 Pipeline The `--dry-run` first

The recommended path in this state:


### 💠 Pipeline The "no apps here" honesty


### 💠 Pipeline A clean rollback (hypothetical)

If apps were configured and live, a rollback is a re-deploy of a previous artifact:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbDeploy` (no target) | Halt. |
| `/wbDeploy production` (env as target) | Halt — env must be a flag. |
| `/wbDeploy "the main site"` | Halt — free-text. |
| `/wbDeploy apps/wbc-ui.com --prod` (right now, dirty tree) | Warn, asks confirmation. |
| `/wbDeploy apps/wbc-ui.com --prod` (HEAD not on main) | Refuse — production must come from main. |
| `/wbDeploy --target="<unknown-env>"` | Halt. |
| `/wbDeploy <multi-app>` with one build failure | Atomic refuse — no uploads. |
| `/wbDeploy "rollback please"` (free-text) | Refuse with rollback-shape suggestion (re-deploy with previous artifact). |
| `/wbDeploy` with no host credentials configured | Halt with setup instructions. |

The pattern: **`/wbDeploy` is the irreversible op with multi-gate safety.** Refuses fuzzy targets, refuses partial deploys, refuses rollback-as-undo (rollback is just another deploy). In this exact workspace today, the right next step before any deploy attempt is to commit the docs sync via `/wbGit -r -e -p` — most deploy concerns trace back to "your tree doesn't match what you think you're shipping."

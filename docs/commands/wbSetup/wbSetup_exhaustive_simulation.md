# /wbSetup — Exhaustive Simulation ()

`/wbSetup` is the architect. Its job is to **bootstrap a new package's agentic context layer** — create the `.agents/workflows/` directory, scaffold the `context.md`, set up the convention files (i18n stub, dev-mode flag, package.json metadata) so the package is *ready to receive `/wb*` commands*. It's a one-time-per-package operation; `/wbContext` (recurring) builds on what `/wbSetup` (initial) creates.

Read this if you want to know what `--focus` actually scopes during setup, why `/wbSetup` is rare and intentional, and where setup ends and the first `/wbContext` begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Architect — bootstraps the agentic context layer for a new package. |
| **Target** | A directory that *will become* a package (already has `package.json` or will get one). |
| **Cell scope** | None — `/wbSetup` doesn't create plan files. The first plan happens via `/wbPlan` after setup. |
| **Side effects allowed** | Creating `.agents/workflows/` directory; scaffolding `context.md`; adding boilerplate config files (i18n stub, dev-mode flag in vite/build config); editing `package.json` for agent-aware metadata. |
| **Side effects forbidden** | Editing source code; running tests; mutating other packages' configs; touching git state. |

The "one-time-per-package" framing is what makes `/wbSetup` rare. Once a package is set up, every subsequent operation uses `/wbContext` (refresh state) or `/wbWork`/`/wbValid`/etc. (do work). Running `/wbSetup` on an already-bootstrapped package is a corner case — supported but with a confirmation gate.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbSetup` does |
|---|---|---|
| Directory | `Command: /wbSetup core2/packages/new-package/` | Bootstraps the agentic layer for the target. |
| Free-text intent | `Command: /wbSetup "a new authentication library"` | Refused. Setup is path-required; intent → planning, not bootstrapping. |
| Already-bootstrapped target | `Command: /wbSetup core2/packages/wb-core/` | Confirms whether to *re-run* (rare) or use `/wbContext --refresh` (more common). |

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--focus="<area>"` | `-f` | Scopes the setup to a specific concern: `dev-gate` (sets up __WBC_DEV__ pattern), `i18n` (initial locale file scaffolding), `agent-context` (agentic layer only, no other concerns). Default: full setup (all areas). |
| `--scope="<level>"` | `-s` | `local` (default — single package) or `global` (rare — repo-wide conventions, like adding a CONTRIBUTING.md template). |

The default is "full setup": every area gets bootstrapped. `--focus` is for partial setup when the user has done some areas manually and only needs help with a specific one.

### What "full setup" produces

A package post-`/wbSetup` has:

| File | Purpose |
|---|---|
| `<pkg>/.agents/workflows/context.md` | Initial context. Filled in via the same logic as `/wbContext`. |
| `<pkg>/.agents/workflows/conventions.md` | Pulled from memory + workspace conventions. Lists the `__WBC_DEV__` rule, model-selection rule, and other workspace-wide refusals. |
| `<pkg>/i18n/en.json` (if package is UI-bearing) | Empty source-locale stub. Populated later via `/wbTranslate`. |
| `<pkg>/.gitignore` (or appended to) | Standard agent-aware ignores: `dist*`, `.agents/cache/`, `i18n/<locale>.tmp.json`. |
| `<pkg>/package.json` (modified) | Adds `wbc:` metadata block (agent-readable hints about the package's role, dev-gate status, i18n status). |

The `wbc:` metadata block is interesting — it's the package's **declaration to the agent system** about how it should be treated. Agents read this block first when operating on the package; `/wbContext` updates it as the package matures.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbSetupSimPipelines = [
  {
    "title": "Bootstrapping a new package",
    "cmd": "/wbSetup core2/packages/new-feature/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/new-feature/",
        "type": "sys"
      },
      {
        "text": "[CHECK] package.json exists? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Already bootstrapped? No (no .agents/workflows/ directory).",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading sibling packages (wb-core) for convention inheritance...",
        "type": "ctx"
      },
      {
        "text": "[CONTEXT] Reading memory: feedback_wbCode_dev_only.md, feedback_model_selection.md, project_docs_edition.md.",
        "type": "ctx"
      },
      {
        "text": "[PROPOSAL] Full setup. Will create:",
        "type": "gen"
      },
      {
        "text": "1. .agents/workflows/context.md \u2014 initial context.",
        "type": "gen"
      },
      {
        "text": "2. .agents/workflows/conventions.md \u2014 inherited rules from memory.",
        "type": "gen"
      },
      {
        "text": "3. i18n/en.json \u2014 empty stub (assumes UI-bearing; can override with --focus).",
        "type": "gen"
      },
      {
        "text": "4. .gitignore \u2014 appended (or created) with agent-aware ignores.",
        "type": "gen"
      },
      {
        "text": "5. package.json \u2014 add `wbc:` metadata block.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Proceed? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[CREATE] core2/packages/new-feature/.agents/workflows/context.md",
        "type": "gen"
      },
      {
        "text": "[CREATE] core2/packages/new-feature/.agents/workflows/conventions.md",
        "type": "gen"
      },
      {
        "text": "[CREATE] core2/packages/new-feature/i18n/en.json (empty {})",
        "type": "gen"
      },
      {
        "text": "[EDIT] core2/packages/new-feature/.gitignore (appended)",
        "type": "gen"
      },
      {
        "text": "[EDIT] core2/packages/new-feature/package.json (added wbc: block)",
        "type": "gen"
      },
      {
        "text": "[OK] Setup complete. Package is now agentic-aware.",
        "type": "ok"
      },
      {
        "text": "[NEXT STEPS]",
        "type": "gen"
      },
      {
        "text": "1. /wbContext core2/packages/new-feature/ \u2014 populate context with",
        "type": "gen"
      },
      {
        "text": "more detail as the package grows.",
        "type": "gen"
      },
      {
        "text": "2. /wbPlan --focus=\"<feature>\" \u2014 make the first plan for this package.",
        "type": "gen"
      },
      {
        "text": "3. /wbWork --id=\"*\" \u2014 start the first development cycle.",
        "type": "gen"
      }
    ],
    "note": "A user has just created `core2/packages/new-feature/` with a `package.json` and an empty `src/`. They want the agentic layer set up:",
    "noteType": "info"
  },
  {
    "title": "`--focus=\"agent-context\"` only",
    "cmd": "/wbSetup core2/packages/new-feature/ --focus=\"agent-context\"",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/new-feature/",
        "type": "sys"
      },
      {
        "text": "[FOCUS] agent-context \u2014 only the .agents/workflows/ scaffolding.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Existing files in target...",
        "type": "gen"
      },
      {
        "text": "i18n/en.json exists (manual setup respected).",
        "type": "gen"
      },
      {
        "text": "package.json has __WBC_DEV__ flag (manual setup respected).",
        "type": "gen"
      },
      {
        "text": ".agents/workflows/ does not exist.",
        "type": "gen"
      },
      {
        "text": "[PROPOSAL] Will create only:",
        "type": "gen"
      },
      {
        "text": "1. .agents/workflows/context.md",
        "type": "gen"
      },
      {
        "text": "2. .agents/workflows/conventions.md",
        "type": "gen"
      },
      {
        "text": "3. package.json: add wbc: block (alongside existing fields).",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[CREATE] context.md",
        "type": "gen"
      },
      {
        "text": "[CREATE] conventions.md",
        "type": "gen"
      },
      {
        "text": "[EDIT] package.json (wbc: block added)",
        "type": "gen"
      },
      {
        "text": "[OK] Agentic layer scaffolded. Other areas (i18n, dev-gate) preserved",
        "type": "ok"
      },
      {
        "text": "as you set them up.",
        "type": "gen"
      }
    ],
    "note": "The user has already manually set up i18n and dev-gating; they only want the agentic layer:",
    "noteType": "info"
  },
  {
    "title": "The \"already bootstrapped\" gate",
    "cmd": "/wbSetup core2/packages/wb-core/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/",
        "type": "sys"
      },
      {
        "text": "[CHECK] Already bootstrapped:",
        "type": "gen"
      },
      {
        "text": "- .agents/workflows/context.md exists (modified 6 days ago).",
        "type": "gen"
      },
      {
        "text": "- .agents/workflows/conventions.md exists.",
        "type": "gen"
      },
      {
        "text": "- i18n/en.json exists.",
        "type": "gen"
      },
      {
        "text": "- package.json has wbc: block.",
        "type": "gen"
      },
      {
        "text": "[NOTICE] This package is already set up. /wbSetup is one-time-per-package",
        "type": "gen"
      },
      {
        "text": "by design.",
        "type": "gen"
      },
      {
        "text": "[OPTIONS]",
        "type": "gen"
      },
      {
        "text": "(a) Refresh context only: /wbContext core2/packages/wb-core/ --refresh",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Halted.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Free-text refusal",
    "cmd": "/wbSetup \"a new authentication library\"",
    "logs": [
      {
        "text": "[REFUSE] Setup is path-required. Intent without a target is a",
        "type": "error"
      },
      {
        "text": "planning conversation.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST]",
        "type": "gen"
      },
      {
        "text": "- Create the package first: pnpm create or manual mkdir + pnpm init.",
        "type": "gen"
      },
      {
        "text": "- Then: /wbSetup core2/packages/<name>/",
        "type": "gen"
      },
      {
        "text": "- Or: /wbVision \"auth library\" if you want to brainstorm the feature",
        "type": "gen"
      },
      {
        "text": "before committing to a package.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbSetup" titleSuffix="Exhaustive Simulation" :pipelines="wbSetupSimPipelines" />


### 💠 Pipeline Bootstrapping a new package

A user has just created `core2/packages/new-feature/` with a `package.json` and an empty `src/`. They want the agentic layer set up:


### 💠 Pipeline `--focus="agent-context"` only

The user has already manually set up i18n and dev-gating; they only want the agentic layer:


### 💠 Pipeline The "already bootstrapped" gate


### 💠 Pipeline Free-text refusal

---

## 5. Edge cases & refusals

| Trigger | What `/wbSetup` does |
|---|---|
| No target | Halt. |
| Free-text target | Halt — path required. |
| Target is not a directory | Halt. |
| Target has no `package.json` | Halt — `/wbSetup` operates on package-shape directories. |
| Already bootstrapped | Notice + suggest `/wbContext --refresh`. |
| `--focus="<unknown-area>"` | Halt. Lists the supported areas. |
| Memory contradicts the setup (e.g., a refusal rule missing for a UI-bearing package) | Surface the contradiction; let user decide whether to inherit the convention. |
| Target is in `node_modules/` or a vendored path | Halt — setup is for owned packages. |
| `--scope="global"` | Permitted but rare; warns about repo-wide effect. |

The pattern: **`/wbSetup` is the one-time bootstrap for the agentic layer.** It refuses re-runs without explicit override, refuses non-package targets, refuses free-text intent. It inherits conventions from memory + sibling packages, and produces a package that's ready for `/wbContext`/`/wbPlan`/`/wbWork` to operate on. The next-steps section in the output is part of the contract — setup is the *start* of a workflow, and the agent makes that workflow visible.

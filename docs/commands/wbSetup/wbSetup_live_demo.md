# /wbSetup — Live Demo ()

What `/wbSetup` would actually do on `wb-labs` right now. The package state below — bootstrapped vs un-bootstrapped — reflects the live workspace.

---

<CommandLiveDemoAnimation command="wbSetup" />

## 1. Live target

| Field | Live value |
|---|---|
| Existing packages in `core2/packages/` | wb-core, wb-dataviewer, wbc-ui2-cdn, wbc-ui2 (per memory) and possibly more |
| Bootstrapped status | None obvious — no `.agents/workflows/` directories visible in current workspace state |
| Memory rules to inherit | `feedback_wbCode_dev_only.md`, `feedback_model_selection.md`, `project_docs_edition.md` (english-only docs), `feedback_no_git.md` (no git ops) |
| Sibling-package convention source | wb-core if it had a context.md, but it doesn't — full bootstrap from memory |
| Most-likely setup target if user runs now | A *new* package the user is creating; existing core2 packages are the un-bootstrapped state, but bootstrapping them retroactively is also valid |

The "no .agents/workflows/ directories visible" reality is interesting: `/wbSetup` would treat every existing core2 package as "not yet bootstrapped" and offer to set them up. That's a real onboarding ritual the user could run as a follow-up to the docs sync.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbSetup core2/packages/wb-core/` | Standard setup. Inherits conventions from memory. |
| `/wbSetup core2/packages/wbc-ui2-cdn/` | Setup permitted but **memory caution**: package has parked tech debt. Setup proceeds; the conventions file would name the parked items as "what NOT to touch." |
| `/wbSetup core2/packages/<new>/` | Standard setup, no inherited package state. |
| `/wbSetup "a new auth lib"` | Halt — free-text. |
| `/wbSetup core2/packages/wb-core/ --focus="agent-context"` | Subset setup; only scaffolds the agentic layer. |
| `/wbSetup core2/packages/wb-core/ --scope="global"` | Halt — global scope is for repo-wide setup, not a single package. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| (no flag) | Full setup of target package. |
| `--focus="agent-context"` | Only `.agents/workflows/` and `wbc:` metadata. |
| `--focus="i18n"` | Only `i18n/en.json` stub. |
| `--focus="dev-gate"` | Only the __WBC_DEV__ pattern boilerplate (per memory rule). |
| `--scope="global"` | Halt unless a global-scope target makes sense (rare). |

---

## 4. Pipelines

<script setup>
const wbSetupPipelines = [
  {
    "title": "Retroactive setup of wb-core",
    "cmd": "/wbSetup core2/packages/wb-core/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/",
        "type": "sys"
      },
      {
        "text": "[CHECK] package.json exists? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Already bootstrapped? No (.agents/workflows/ missing).",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading memory:",
        "type": "ctx"
      },
      {
        "text": "- feedback_wbCode_dev_only.md (3-mode __WBC_DEV__ gating)",
        "type": "gen"
      },
      {
        "text": "- feedback_model_selection.md (the agent/the agent declaration)",
        "type": "gen"
      },
      {
        "text": "- feedback_wbCode_rule.md (:wbCode=\"false\" in examples)",
        "type": "gen"
      },
      {
        "text": "- project_docs_edition.md (the documentation docs)",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] No sibling package has a context.md to inherit from; full",
        "type": "ctx"
      },
      {
        "text": "memory-based bootstrap.",
        "type": "gen"
      },
      {
        "text": "[PROPOSAL] Full setup will create:",
        "type": "gen"
      },
      {
        "text": "1. core2/packages/wb-core/.agents/workflows/context.md",
        "type": "gen"
      },
      {
        "text": "\u2014 initial context (will be richer than fresh because the package",
        "type": "gen"
      },
      {
        "text": "has 6 days of history; existing src/, tests/ scanned).",
        "type": "gen"
      },
      {
        "text": "2. core2/packages/wb-core/.agents/workflows/conventions.md",
        "type": "gen"
      },
      {
        "text": "\u2014 inherited rules:",
        "type": "gen"
      },
      {
        "text": "* __WBC_DEV__ 3-mode gating (full / dev / hidden)",
        "type": "gen"
      },
      {
        "text": "* Examples use :wbCode=\"false\"",
        "type": "gen"
      },
      {
        "text": "* Model declaration: the agent (simple) / the agent (complex)",
        "type": "gen"
      },
      {
        "text": "* English-only docs convention for any added .md",
        "type": "gen"
      },
      {
        "text": "3. core2/packages/wb-core/i18n/en.json",
        "type": "gen"
      },
      {
        "text": "\u2014 empty stub (UI-bearing per package role).",
        "type": "gen"
      },
      {
        "text": "4. core2/packages/wb-core/.gitignore",
        "type": "gen"
      },
      {
        "text": "\u2014 appended: dist*, .agents/cache/, i18n/*.tmp.json",
        "type": "gen"
      },
      {
        "text": "5. core2/packages/wb-core/package.json",
        "type": "gen"
      },
      {
        "text": "\u2014 added \"wbc:\" metadata block:",
        "type": "gen"
      },
      {
        "text": "{",
        "type": "gen"
      },
      {
        "text": "\"wbc\": {",
        "type": "gen"
      },
      {
        "text": "\"role\": \"core component library\",",
        "type": "gen"
      },
      {
        "text": "\"devGate\": \"WBC_DEV\",",
        "type": "gen"
      },
      {
        "text": "\"i18n\": { \"source\": \"en\", \"targets\": [] },",
        "type": "gen"
      },
      {
        "text": "\"tier\": \"foundation\",",
        "type": "gen"
      },
      {
        "text": "\"agentic\": true",
        "type": "gen"
      },
      {
        "text": "}",
        "type": "gen"
      },
      {
        "text": "}",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Proceed? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[CREATE] context.md (uses /wbContext logic for content)",
        "type": "gen"
      },
      {
        "text": "[CREATE] conventions.md (rules from memory)",
        "type": "gen"
      },
      {
        "text": "[CREATE] i18n/en.json (empty {})",
        "type": "gen"
      },
      {
        "text": "[EDIT] .gitignore (appended)",
        "type": "gen"
      },
      {
        "text": "[EDIT] package.json (wbc: block added)",
        "type": "gen"
      },
      {
        "text": "[OK] wb-core bootstrapped.",
        "type": "ok"
      },
      {
        "text": "[NEXT STEPS]",
        "type": "gen"
      },
      {
        "text": "1. /wbContext core2/packages/wb-core/ --refresh",
        "type": "gen"
      },
      {
        "text": "(immediate refresh produces a richer context.md with the existing",
        "type": "gen"
      },
      {
        "text": "src/ scan)",
        "type": "gen"
      },
      {
        "text": "2. /wbPlan would now resolve to wb-core context if invoked there.",
        "type": "gen"
      },
      {
        "text": "3. Repeat for siblings:",
        "type": "gen"
      },
      {
        "text": "/wbSetup core2/packages/wb-dataviewer/",
        "type": "gen"
      },
      {
        "text": "/wbSetup core2/packages/wbc-ui2-cdn/ (memory caution applies)",
        "type": "gen"
      }
    ],
    "note": "The most useful live invocation: bootstrap the existing wb-core package's agentic layer.",
    "noteType": "info"
  },
  {
    "title": "Memory-aware setup of a parked package",
    "cmd": "/wbSetup core2/packages/wbc-ui2-cdn/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wbc-ui2-cdn/",
        "type": "sys"
      },
      {
        "text": "[CHECK] package.json exists? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Already bootstrapped? No.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading memory:",
        "type": "ctx"
      },
      {
        "text": "- project_pkg_dist_mismatch.md (dist-folder mismatch \u2014 parked)",
        "type": "gen"
      },
      {
        "text": "- wbc-ui2-tech-debt.md (cache-loader, vuepress crash, untested apps)",
        "type": "gen"
      },
      {
        "text": "[NOTICE] This package has multiple parked items per memory.",
        "type": "gen"
      },
      {
        "text": "Setup will include a prominent \"What NOT to touch\" section",
        "type": "gen"
      },
      {
        "text": "in conventions.md.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Proceed with cautious setup? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[CREATE] .agents/workflows/context.md",
        "type": "gen"
      },
      {
        "text": "[CREATE] .agents/workflows/conventions.md (with parked-items section)",
        "type": "gen"
      },
      {
        "text": "[EDIT] .gitignore (appended)",
        "type": "gen"
      },
      {
        "text": "[EDIT] package.json (wbc: block with role: \"parked-cdn-package\")",
        "type": "gen"
      },
      {
        "text": "[OK] Setup complete.",
        "type": "ok"
      },
      {
        "text": "[CONVENTIONS WRITTEN]",
        "type": "gen"
      },
      {
        "text": "Excerpt from conventions.md:",
        "type": "gen"
      },
      {
        "text": "## What NOT to touch in this package",
        "type": "sys"
      },
      {
        "text": "Multiple architectural decisions are PARKED here. Do not propose",
        "type": "gen"
      },
      {
        "text": "fixes without first re-opening the parked conversation:",
        "type": "gen"
      },
      {
        "text": "- **dist-folder mismatch** (package.json `main` vs vite outDir).",
        "type": "gen"
      },
      {
        "text": "Source: project_pkg_dist_mismatch.md.",
        "type": "gen"
      },
      {
        "text": "- **cache-loader reference** still in vite.config.js though unused.",
        "type": "gen"
      },
      {
        "text": "Source: wbc-ui2-tech-debt.md.",
        "type": "gen"
      },
      {
        "text": "- **vuepress crash** under specific conditions; untested apps.",
        "type": "gen"
      },
      {
        "text": "Source: wbc-ui2-tech-debt.md.",
        "type": "gen"
      },
      {
        "text": "Treat this package as read-only for routine /wb* operations until",
        "type": "gen"
      },
      {
        "text": "the parked decisions are resolved.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "`--focus=\"agent-context\"` for an existing manual setup",
    "cmd": "/wbSetup core2/packages/wb-core/ --focus=\"agent-context\"",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/",
        "type": "sys"
      },
      {
        "text": "[FOCUS] agent-context only.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Existing manual setup detected:",
        "type": "gen"
      },
      {
        "text": "- i18n/en.json exists (preserved).",
        "type": "gen"
      },
      {
        "text": "- .gitignore has standard ignores (will not modify).",
        "type": "gen"
      },
      {
        "text": "- package.json: no wbc: block (will add).",
        "type": "gen"
      },
      {
        "text": "[PROPOSAL]",
        "type": "gen"
      },
      {
        "text": "1. Create .agents/workflows/context.md",
        "type": "gen"
      },
      {
        "text": "2. Create .agents/workflows/conventions.md",
        "type": "gen"
      },
      {
        "text": "3. Add wbc: block to package.json (preserving other fields).",
        "type": "gen"
      },
      {
        "text": "4. NOT touching: i18n/, .gitignore.",
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
        "text": "[OK] Agentic layer scaffolded. Other manual setup preserved.",
        "type": "ok"
      }
    ],
    "note": "A user has already manually set up wb-core's i18n and gitignore, and just wants the agentic layer:",
    "noteType": "info"
  },
  {
    "title": "The \"already bootstrapped\" notice",
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
        "text": "- .agents/workflows/context.md (modified just now)",
        "type": "gen"
      },
      {
        "text": "- .agents/workflows/conventions.md",
        "type": "gen"
      },
      {
        "text": "- package.json has wbc: block",
        "type": "gen"
      },
      {
        "text": "[NOTICE] This package is already set up.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST]",
        "type": "gen"
      },
      {
        "text": "(a) Refresh context: /wbContext core2/packages/wb-core/ --refresh",
        "type": "gen"
      },
      {
        "text": "(b) Update conventions: edit conventions.md manually (memory may",
        "type": "gen"
      },
      {
        "text": "have changed since first setup)",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Halted.",
        "type": "gen"
      }
    ],
    "note": "After Pipeline A, running `/wbSetup` again on wb-core:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbSetup" :pipelines="wbSetupPipelines" />


### 💠 Pipeline Retroactive setup of wb-core

The most useful live invocation: bootstrap the existing wb-core package's agentic layer.


### 💠 Pipeline Memory-aware setup of a parked package


### 💠 Pipeline `--focus="agent-context"` for an existing manual setup

A user has already manually set up wb-core's i18n and gitignore, and just wants the agentic layer:


### 💠 Pipeline The "already bootstrapped" notice

After Pipeline A, running `/wbSetup` again on wb-core:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbSetup` (no target) | Halt. |
| `/wbSetup "an idea I have"` | Halt — free-text. |
| `/wbSetup core2/packages/<missing>/` | Halt — directory doesn't exist. |
| `/wbSetup core2/packages/<exists-but-no-package.json>/` | Halt — not a package shape. |
| `/wbSetup` on already-bootstrapped target | Notice + suggest `/wbContext --refresh`. |
| `/wbSetup --focus="<unknown>"` | Halt — lists supported focus areas. |
| `/wbSetup --scope="global"` on a single package | Halt — scope/target mismatch. |
| Setup on a parked package (wbc-ui2-cdn) | Permitted with cautious convention output. |
| Setup proposed creates files that already exist | Asks per-file: keep or overwrite? |

The pattern: **`/wbSetup` is one-time-per-package agentic-layer bootstrapping.** It refuses fuzzy targets, refuses to silently re-run on bootstrapped packages, refuses to overwrite manual setup without confirmation. Memory awareness is at its strongest here — the conventions file inherits every relevant rule, and parked items appear prominently in the "What NOT to touch" section. The output sets up the package for everything that follows: `/wbContext`, `/wbPlan`, `/wbWork`, all of which read what `/wbSetup` writes.

# /wbLicense — Exhaustive Simulation ()

`/wbLicense` is the IP guardian. It scans dependency trees for compliance conflicts. The central principle: **fail-closed**. If a GPL dependency sneaks into a proprietary package, `/wbLicense` doesn't warn — it halts. The assumption is that deploying a copyleft violation is always worse than delaying a release.

Read this if you want to know what the allow-list contains and how the compliance audit classifies a dependency.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Open-Source Compliance & IP Guardian. |
| **Target** | Source files (headers), `node_modules` trees (audit), or directories (LICENSE generation). |
| **Cell scope** | None. `/wbLicense` doesn't interact with plans. |
| **Side effects allowed** | Prepending headers to source files. Creating LICENSE/NOTICE files. |
| **Side effects forbidden** | Modifying code logic, removing dependencies, altering `package.json` (except `license` field). |

`--audit` is read-only — it scans and reports, and never writes to a source file. A compliance audit that also mutated the tree would be unusable as a gate: it might reveal that you shouldn't have been writing to those files at all (wrong license type for the package).

---

## 2. Argument resolution

| Form | Example | What `/wbLicense` does |
|---|---|---|
| Specific file | `Command: /wbLicense src/WBC.js` | Prepends the standardized copyright header to line 1. |
| Directory path | `Command: /wbLicense packages/wb-core` | Scans wb-core's dependency tree for compliance conflicts. |
| Comma-separated | `Command: /wbLicense src/app.js,src/index.css` | Injects headers in both files using correct comment syntax (`// ...` vs `/* ... */`). |
| Workspace glob | `Command: /wbLicense apps/*` | Generates a unified Compliance Report across all consumer apps. |

The comment syntax adaptation is non-trivial. `/wbLicense` picks the right comment format per file extension: `//` for `.js`/`.ts`, `/* */` for `.css`, `<!-- -->` for `.html`, `#` for `.py`/`.sh`. JSON files get skipped with a warning — JSON has no comment syntax.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--audit` | `-a` | Scans `node_modules` for license compliance. Read-only — no file modifications. |
| `--dry-run` | `-d` | Simulates the run without writing to disk. |

**The allow-list.** The compliance audit checks every dependency's license against a hardcoded allow-list:
- ✅ Allowed: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, Unlicense
- ❌ Blocked: GPL-2.0, GPL-3.0, AGPL-3.0, LGPL (when used in a proprietary package)
- ⚠️ Review required: No license declared, custom license text, dual-licensed

The wb-labs monorepo uses the `__WBC_DEV__` 3-mode gating pattern — the tier system means some packages are proprietary (`enterprise` tier) and some are open (`free` tier). `/wbLicense --audit` respects this distinction: a GPL dependency in a `free`-tier package is a warning; in an `enterprise`-tier package it's a halt.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbLicenseSimPipelines = [
  {
    "title": "Pre-release compliance gate on all apps",
    "cmd": "/wbLicense apps/* -a",
    "logs": [
      {
        "text": "[SYSTEM] Initiating Compliance Audit for apps/*...",
        "type": "sys"
      },
      {
        "text": "[CRAWL] demo.wbc-ui.com: 142 dependencies...",
        "type": "gen"
      },
      {
        "text": "[CRAWL] md.wbc-ui.com: 89 dependencies...",
        "type": "gen"
      },
      {
        "text": "[CRAWL] wbc-ui.com: 201 dependencies...",
        "type": "gen"
      },
      {
        "text": "[REPORT]",
        "type": "gen"
      },
      {
        "text": "| App | Total Deps | Allowed | Blocked | Review |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| demo.wbc-ui.com | 142 | 141 | 0 | 1 (no license) |",
        "type": "sys"
      },
      {
        "text": "| md.wbc-ui.com | 89 | 89 | 0 | 0 |",
        "type": "sys"
      },
      {
        "text": "| wbc-ui.com | 201 | 199 | 1 | 1 |",
        "type": "sys"
      },
      {
        "text": "[ALERT] wbc-ui.com:",
        "type": "gen"
      },
      {
        "text": "\u274c BLOCKED: `cool-pdf-generator@2.1.0` \u2014 licensed under GNU GPL v3.",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f REVIEW: `legacy-utils@0.9.0` \u2014 no license field declared.",
        "type": "gen"
      },
      {
        "text": "[HALT] Deployment blocked. Remove `cool-pdf-generator` or obtain a commercial exception.",
        "type": "gen"
      }
    ],
    "note": "Before pushing to production, verify no developer accidentally installed a restrictive package:",
    "noteType": "info"
  },
  {
    "title": "Header injection after entity name change",
    "cmd": "/wbLicense core2/packages/wb-core/src/**/*.js -i=\"proprietary\"",
    "logs": [
      {
        "text": "[SYSTEM] Resolving glob: 18 .js files.",
        "type": "sys"
      },
      {
        "text": "[TEMPLATE] Proprietary header (Year: 2026, Entity: WBC Inc.)",
        "type": "gen"
      },
      {
        "text": "[SYNC] 12 files have existing headers (outdated entity name). Overwriting.",
        "type": "gen"
      },
      {
        "text": "[INJECT] 6 files have no header. Prepending.",
        "type": "gen"
      },
      {
        "text": "[RESULT]",
        "type": "gen"
      },
      {
        "text": "Updated: 12 files (old header \u2192 new header)",
        "type": "gen"
      },
      {
        "text": "Injected: 6 files (no header \u2192 new header)",
        "type": "gen"
      },
      {
        "text": "Skipped: 0",
        "type": "gen"
      },
      {
        "text": "[OK] 18 files now carry the current proprietary header.",
        "type": "ok"
      }
    ],
    "note": "The company updated its legal entity name. All wb-core source files need updated headers:",
    "noteType": "info"
  },
  {
    "title": "Dry-run before a mass header change",
    "cmd": "/wbLicense core2/packages/wb-core/src/**/*.js -i=\"MIT\" -d",
    "logs": [
      {
        "text": "[DRY-RUN] Would affect 18 files.",
        "type": "warn"
      },
      {
        "text": "[PREVIEW]",
        "type": "gen"
      },
      {
        "text": "src/WBC.js:",
        "type": "gen"
      },
      {
        "text": "+ // MIT License",
        "type": "gen"
      },
      {
        "text": "+ // Copyright (c) 2026 WBC Inc.",
        "type": "gen"
      },
      {
        "text": "+ // Permission is hereby granted...",
        "type": "gen"
      },
      {
        "text": "src/tierEnforcement.js:",
        "type": "gen"
      },
      {
        "text": "- // Copyright 2025 WBC Labs (old proprietary header)",
        "type": "gen"
      },
      {
        "text": "+ // MIT License (replacing)",
        "type": "gen"
      },
      {
        "text": "[DRY-RUN] Disk untouched. Run without -d to apply.",
        "type": "warn"
      }
    ],
    "note": "Before committing to 18 file changes, preview what would happen:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbLicense" titleSuffix="Exhaustive Simulation" :pipelines="wbLicenseSimPipelines" />


### 💠 Pipeline Pre-release compliance gate on all apps

Before pushing to production, verify no developer accidentally installed a restrictive package:


### 💠 Pipeline Header injection after entity name change

The company updated its legal entity name. All wb-core source files need updated headers:


### 💠 Pipeline Dry-run before a mass header change

Before committing to 18 file changes, preview what would happen:

---

## 5. Edge cases & refusals

| Trigger | What `/wbLicense` does |
|---|---|
| Unlicensed dependency in `node_modules` | `⚠️ Package 'mystery-lib' has no license declared. Human review required.` |
| Header injection into `.json` file | `⚠️ Cannot inject comments into JSON format. Skipping config.json.` |
| `-i="custom"` but no custom template in `.agents/` | `❌ License template 'custom' not found. Available: MIT, proprietary, apache.` |
| GPL dependency in a `free`-tier package | `⚠️ GPL detected in free-tier package. Copyleft is tolerable here but document the obligation.` (Warning, not halt.) |
| GPL dependency in an `enterprise`-tier package | `❌ HALT. GPL in proprietary code. Remove the dependency or obtain a commercial license.` |

The unifying principle: **`/wbLicense` treats IP compliance as a fail-closed gate.** Uncertainty is always escalated to a human (unlicensed deps get `⚠️ review`), clear violations halt execution (GPL in proprietary gets `❌`), and header injection adapts to file format without the user specifying comment syntax.

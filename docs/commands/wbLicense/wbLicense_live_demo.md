# /wbLicense — Live Demo ()

This is what `/wbLicense` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](wbLicense_exhaustive_simulation.md), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbLicense" />

## 1. Live target

| Field | Live value |
|---|---|
| Target package | `core2/packages/wb-core` |
| Current license | Proprietary (header referencing "WBC Inc.") |
| Tier | Enterprise — copyleft dependencies are hard-blocked |
| Source files in scope | 18 `.js` files under `src/` |
| Header status | 12 files have outdated headers (old entity name), 6 have no header |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbLicense packages/wb-core -a` | Audits wb-core's `node_modules`. Scans ~180 transitive deps. |
| `/wbLicense packages/wb-core/src/WBC.js` | Checks/injects header on a single file. |
| `/wbLicense apps/* -a` | Cross-app compliance sweep: demo, md, wbc-ui. |
| `/wbLicense packages/wb-core/src/*.js -i="proprietary"` | Mass header injection across all source files. |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbLicense packages/wb-core -a` | Scans 180 deps. Reports compliance status per dependency. |
| `/wbLicense src/*.js -i="proprietary"` | Updates 12 stale headers, injects 6 new ones. |
| `/wbLicense src/*.js -i="proprietary" -d` | Dry-run: previews all changes without writing. |
| `/wbLicense packages/wb-core -g` | Creates/updates `LICENSE` and `NOTICE` files at package root. |

---

## 4. Pipelines

<script setup>
const wbLicensePipelines = [
  {
    "title": "Compliance audit before release",
    "cmd": "/wbLicense packages/wb-core -a",
    "logs": [
      {
        "text": "[SYSTEM] Auditing packages/wb-core dependency tree...",
        "type": "sys"
      },
      {
        "text": "[CRAWL] 180 transitive dependencies resolved.",
        "type": "gen"
      },
      {
        "text": "[REPORT]",
        "type": "gen"
      },
      {
        "text": "| Status | Count | Details |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| \u2705 Allowed (MIT/Apache/BSD/ISC) | 177 | Clean |",
        "type": "gen"
      },
      {
        "text": "| \u26a0\ufe0f Review (no license) | 2 | `legacy-helper@0.3.1`, `internal-shim@1.0.0` |",
        "type": "gen"
      },
      {
        "text": "| \u274c Blocked | 1 | `deep-merge-gpl@2.0.0` (GPL-3.0) |",
        "type": "gen"
      },
      {
        "text": "[ALERT]",
        "type": "gen"
      },
      {
        "text": "\u274c BLOCKED: `deep-merge-gpl@2.0.0` \u2014 GNU GPL v3.",
        "type": "gen"
      },
      {
        "text": "Location: node_modules/deep-merge-gpl/",
        "type": "gen"
      },
      {
        "text": "Required by: wbc-theme-engine@1.2.0 \u2192 deep-merge-gpl",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f REVIEW: `legacy-helper@0.3.1` \u2014 no license field in package.json.",
        "type": "gen"
      },
      {
        "text": "Risk: Unknown. Contact maintainer or inspect source.",
        "type": "gen"
      },
      {
        "text": "[HALT] Enterprise-tier package. GPL dependency is a compliance violation.",
        "type": "gen"
      },
      {
        "text": "Action: Replace `deep-merge-gpl` with `deepmerge` (MIT) or `lodash.merge`.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Mass header update",
    "cmd": "/wbLicense core2/packages/wb-core/src/**/*.js -i=\"proprietary\"",
    "logs": [
      {
        "text": "[SYSTEM] Resolving glob: 18 .js files.",
        "type": "sys"
      },
      {
        "text": "[TEMPLATE] Proprietary Header:",
        "type": "gen"
      },
      {
        "text": "// Copyright (c) 2026 WBC Inc.",
        "type": "gen"
      },
      {
        "text": "// All rights reserved. Proprietary and confidential.",
        "type": "gen"
      },
      {
        "text": "// See LICENSE for terms.",
        "type": "gen"
      },
      {
        "text": "[SYNC]",
        "type": "gen"
      },
      {
        "text": "Updated headers: 12 files (entity name \"WBC Labs\" \u2192 \"WBC Inc.\")",
        "type": "gen"
      },
      {
        "text": "New headers: 6 files (WBC.core.js, WBC.events.js, + 4 utilities)",
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
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Cross-app audit for the full monorepo",
    "cmd": "/wbLicense apps/* -a",
    "logs": [
      {
        "text": "[SYSTEM] Cross-app compliance audit...",
        "type": "sys"
      },
      {
        "text": "[CRAWL] demo.wbc-ui.com: 142 deps | md.wbc-ui.com: 89 deps | wbc-ui.com: 201 deps",
        "type": "gen"
      },
      {
        "text": "[REPORT]",
        "type": "gen"
      },
      {
        "text": "| App | Tier | Allowed | Blocked | Review |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| demo.wbc-ui.com | Free | 141 | 0 | 1 |",
        "type": "gen"
      },
      {
        "text": "| md.wbc-ui.com | Free | 89 | 0 | 0 \u2705 |",
        "type": "gen"
      },
      {
        "text": "| wbc-ui.com | Enterprise | 199 | 1 | 1 |",
        "type": "gen"
      },
      {
        "text": "[ALERT] wbc-ui.com:",
        "type": "gen"
      },
      {
        "text": "\u274c `cool-pdf-generator@2.1.0` \u2014 GPL-3.0 in Enterprise tier.",
        "type": "gen"
      },
      {
        "text": "[NOTE] demo.wbc-ui.com:",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f `no-license-util@0.1.0` \u2014 Free tier, so GPL would be acceptable,",
        "type": "gen"
      },
      {
        "text": "but this package has NO license. Review required.",
        "type": "gen"
      },
      {
        "text": "[HALT] wbc-ui.com deployment blocked.",
        "type": "gen"
      },
      {
        "text": "[PASS] demo.wbc-ui.com \u2014 proceed with caution (review the unlicensed dep).",
        "type": "gen"
      },
      {
        "text": "[PASS] md.wbc-ui.com \u2014 clean. \u2705",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbLicense" :pipelines="wbLicensePipelines" />


### 💠 Pipeline Compliance audit before release


### 💠 Pipeline Mass header update


### 💠 Pipeline Cross-app audit for the full monorepo

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbLicense src/config.json -i="MIT"` | `⚠️ Cannot inject comments into JSON format. Skipping.` |
| `/wbLicense packages/wb-core -i="custom"` | `❌ Template 'custom' not found. Available: MIT, proprietary, apache.` |
| `/wbLicense packages/wb-core -a -i="MIT"` | Allowed. Audit runs first. If audit halts (GPL detected), injection is skipped. Audit is the gate. |
| `/wbLicense packages/wb-core -a` with no `node_modules/` | `❌ No node_modules found. Run npm install first.` |

The pattern: **`/wbLicense` protects IP by failing closed.** Ambiguity escalates to human review. Clear violations halt execution. Header injection is smart about file formats and existing headers. The tier system determines severity — same dependency, different risk level depending on the package's commercial classification.

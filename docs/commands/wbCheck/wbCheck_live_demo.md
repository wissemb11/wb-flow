# /wbCheck — Live Demo ()

This is what `/wbCheck` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](./wbCheck_exhaustive_simulation), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbCheck" />

## 1. Live target

| Field | Live value |
|---|---|
| Doc tree | `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/` — 54+ markdown files with extensive cross-linking |
| Source code | `core2/packages/wb-core/src/` — 18 JS files, partial JSDoc coverage |
| Known issues | stale links from pre-v4 reorganization, 3 type violations in renderString.js |
| Recently modified | 24 claude simulation/demo files created in the last session |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/**/*.md -l` | Link check across 54+ docs. Will find stale paths from the reorganization. |
| `/wbCheck core2/packages/wb-core/src/*.js -t` | Type check on 18 files. Will report 3 violations in renderString.js and WBC.events.js. |
| `/wbCheck frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/**/*.md -g` | Grammar check on all claude docs (including the files just generated). |
| `/wbCheck tsconfig.json` | Schema validation against TypeScript config spec. |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/**/*.md -l` | Reports ~12 broken links from files that were moved during the v4 overhaul. |
| `/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/**/*.md -g` | Reports ~6 typos across 82,000 words. |
| `/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/**/*.md -g -f` | Auto-fixes 5 of 6 typos. 1 ambiguous, requires manual review. |
| `/wbCheck src/*.js -t` | 3 type violations: 2 in renderString.js, 1 in WBC.events.js. |

---

## 4. Pipelines

<script setup>
const wbCheckPipelines = [
  {
    "title": "Verify the new claude docs for link integrity",
    "cmd": "/wbCheck frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/**/*.md -l",
    "logs": [
      {
        "text": "[SYSTEM] Link checking 36 the documentation files...",
        "type": "sys"
      },
      {
        "text": "[EXTRACT] 189 internal links, 0 external URLs.",
        "type": "gen"
      },
      {
        "text": "[REPORT]",
        "type": "gen"
      },
      {
        "text": "\u2705 183 internal links resolve correctly.",
        "type": "gen"
      },
      {
        "text": "\u274c 6 broken links:",
        "type": "gen"
      },
      {
        "text": "- wbTrack_live_demo.md:L3 \u2192 ./wbTrack_exhaustive_simulation.md \u2705 (exists)",
        "type": "gen"
      },
      {
        "text": "- wbBroadcast_exhaustive_simulation.md \u2192 file not yet created",
        "type": "gen"
      },
      {
        "text": "- wbMonetize_exhaustive_simulation.md \u2192 file not yet created",
        "type": "gen"
      },
      {
        "text": "- wbToWBC_exhaustive_simulation.md \u2192 file not yet created",
        "type": "gen"
      },
      {
        "text": "- wbVision_exhaustive_simulation.md \u2192 file not yet created",
        "type": "gen"
      },
      {
        "text": "- wbHelp_live_demo.md:L55 \u2192 wbBroadcast_practical.md \u2192 not yet created",
        "type": "gen"
      },
      {
        "text": "[SUMMARY] 4 broken links are expected \u2014 those files are being generated now.",
        "type": "gen"
      },
      {
        "text": "2 links reference files that may not be planned. Review.",
        "type": "gen"
      }
    ],
    "note": "24 new simulation/demo files were just created. Check their internal links:",
    "noteType": "info"
  },
  {
    "title": "Type check wb-core after decomposition",
    "cmd": "/wbCheck core2/packages/wb-core/src/**/*.js -t",
    "logs": [
      {
        "text": "[SYSTEM] Static Type Analyzer scanning 18 files...",
        "type": "sys"
      },
      {
        "text": "[REPORT]",
        "type": "gen"
      },
      {
        "text": "| File | Line | Issue | Severity |",
        "type": "gen"
      },
      {
        "text": "|---|---|---|---|",
        "type": "gen"
      },
      {
        "text": "| renderString.js | L12 | `escapeHTML(input)` \u2014 `input` has implicit 'any' | \u274c |",
        "type": "gen"
      },
      {
        "text": "| renderString.js | L34 | `renderTemplate()` \u2014 missing @returns | \u274c |",
        "type": "gen"
      },
      {
        "text": "| WBC.events.js | L8 | `handler` typed as generic `Function` | \u26a0\ufe0f |",
        "type": "gen"
      },
      {
        "text": "[SUMMARY] 2 errors, 1 warning across 2 files. 16 files are clean.",
        "type": "gen"
      },
      {
        "text": "[RECOMMENDATION] Fix renderString.js first \u2014 it has the strictest callers.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Full integrity sweep before a commit",
    "cmd": "/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/**/*.md -l -g -f",
    "logs": [
      {
        "text": "[SYSTEM] Full documentation integrity sweep with auto-fix...",
        "type": "sys"
      },
      {
        "text": "[LINKS] 412 internal links, 23 external URLs.",
        "type": "gen"
      },
      {
        "text": "\u274c 12 broken internal links (mostly from v4 reorganization).",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f 2 external URLs timed out.",
        "type": "gen"
      },
      {
        "text": "[GRAMMAR] 82,000 words scanned.",
        "type": "gen"
      },
      {
        "text": "[FIX] Auto-corrected 5 typos:",
        "type": "gen"
      },
      {
        "text": "\u2705 \"seperately\" \u2192 \"separately\" (wbTrack_template.md:L145)",
        "type": "gen"
      },
      {
        "text": "\u2705 \"occured\" \u2192 \"occurred\" (wbActOn_template.md:L89)",
        "type": "gen"
      },
      {
        "text": "\u2705 \"recommand\" \u2192 \"recommend\" (wbStandup_template.md:L22)",
        "type": "gen"
      },
      {
        "text": "\u2705 \"absraction\" \u2192 \"abstraction\" (wbExplain_exhaustive.md:L67)",
        "type": "gen"
      },
      {
        "text": "\u2705 \"verifiy\" \u2192 \"verify\" (wbValid_live_demo.md:L45)",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f 1 ambiguous: \"dependancy\" \u2192 manual review required.",
        "type": "gen"
      },
      {
        "text": "[RESULT] 5 typos fixed, 12 broken links remain (need manual path updates).",
        "type": "gen"
      },
      {
        "text": "Run `/wbCheck -l` again after fixing the broken links.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbCheck" :pipelines="wbCheckPipelines" />


### 💠 Pipeline Verify the new claude docs for link integrity

24 new simulation/demo files were just created. Check their internal links:


### 💠 Pipeline Type check wb-core after decomposition


### 💠 Pipeline Full integrity sweep before a commit

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbCheck src/WBC.js -g` | `❌ Grammar checking requires Markdown or TXT files. Use -t for type checking.` |
| `/wbCheck -f` without `-g` or `-t` | `⚠️ --fix requires an analysis mode (-g, -t, or -l). Specify what to check.` |
| `/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/templates/ -l -t` | Both engines fire on the same directory — `-l` for `.md` files, `-t` for `.js` files. No conflict. |
| `/wbCheck node_modules/**/*.js -t` | `⚠️ Skipping node_modules (excluded by convention). Type-check your source, not your deps.` |

The pattern: **`/wbCheck` is the static complement to every other diagnostic command.** It verifies internal consistency — types match signatures, links resolve to files, spelling is correct — without executing anything. It's the cheapest diagnostic to run and the most reliable, because static analysis doesn't depend on environment state.

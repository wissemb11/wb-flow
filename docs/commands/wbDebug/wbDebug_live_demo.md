# /wbDebug — Live Demo ()

What `/wbDebug` would actually produce on `wb-labs` today (2026-05-04). The candidate symptoms below are real — drawn from the parked tech debt and known issues currently in the workspace.

---

<CommandLiveDemoAnimation command="wbDebug" />

## 1. Live target

| Field | Live value |
|---|---|
| Workspace state | Many uncommitted docs files in `frontEnd/wbc-ui/core2/packages/wb-flow/templates/`; no recent code edits in `core2/` |
| Known live symptoms (from memory) | (1) WBDataViewer apiResponse_ stale on route change; (2) wbc-ui2-cdn dist-folder mismatch; (3) cache-loader unused but still referenced in core2 packages |
| Recent test runs | None this session — `/wbDebug` would have no fresh test output to draw on |
| Memory available | All 12 leaf memory files; especially `project_wbdataviewer_apiResponse.md`, `project_pkg_dist_mismatch.md`, `wbc-ui2-tech-debt.md` |

`/wbDebug` is the most memory-dependent command in this group. It reads code, but the *interpretation* of what's broken often lives in memory. The dist-folder mismatch is "a bug" if you don't know about the parked decision; it's "expected current state" once you read the memory note.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `"WBDataViewer apiResponse_ stale"` | Maps to `core2/packages/wb-dataviewer/src/WBDataViewer.vue` + memory note. Diagnosis is concrete. |
| `"Cannot resolve dist/index.js"` | Maps to the dist-folder mismatch. Memory says "do not fix in isolation." |
| `"WBC.js is hard to extend"` | Honest "no concrete symptom; this is a design opinion." Suggests `/wbExplain` or `/wbReview` instead. |
| Pasted vue/vite stack trace pointing at any core2 package | Parses, follows to source, cross-checks memory. |
| `"all my tests fail"` | Refuse. `/wbDebug` is single-failure-at-a-time. Suggest `/wbTest` to enumerate first. |

---

## 3. Per-input behavior, applied live

`/wbDebug` has no flags. The "behavior matrix" here is by input shape:

| Input shape | Live behavior |
|---|---|
| Symptom string + memory match | Diagnosis cites memory; recommends consistent action. |
| Symptom string + no memory match | Diagnosis cites source code only; flags absence of memory record as something the user should consider adding after the fix. |
| Stack trace + matching memory | Diagnosis names the parked nature and suggests the workaround, not the patch. |
| Stack trace + no memory | Standard frame-walk diagnosis. |
| Test name (no current failure run) | Reads the test source and the code under test; produces a *prospective* diagnosis ("this test would fail under conditions X, Y"). |

---

## 4. Pipelines

<script setup>
const wbDebugPipelines = [
  {
    "title": "The apiResponse_ stale-cache, diagnosed live",
    "cmd": "/wbDebug \"WBDataViewer apiResponse_ stale on route change\"",
    "logs": [
      {
        "text": "[DIAGNOSE] Symptom: data viewer shows previous project's response",
        "type": "gen"
      },
      {
        "text": "after navigation.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading project_wbdataviewer_apiResponse.md (memory)...",
        "type": "ctx"
      },
      {
        "text": "Pattern documented: apiResponse_ caches fetched data so",
        "type": "gen"
      },
      {
        "text": "subsequent project changes don't refire the network.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading core2/packages/wb-dataviewer/src/WBDataViewer.vue...",
        "type": "ctx"
      },
      {
        "text": "[CONTEXT] Reading core2/packages/wb-dataviewer/src/App.vue (consumer)...",
        "type": "ctx"
      },
      {
        "text": "## Theory",
        "type": "sys"
      },
      {
        "text": "The watcher on `props.project` reads `apiResponse_.value` first and",
        "type": "gen"
      },
      {
        "text": "returns early if it's truthy. That's a presence check, not a",
        "type": "gen"
      },
      {
        "text": "freshness check. The cache is filled on first fetch and never",
        "type": "gen"
      },
      {
        "text": "invalidated when the project changes.",
        "type": "gen"
      },
      {
        "text": "## Evidence chain",
        "type": "sys"
      },
      {
        "text": "1. WBDataViewer.vue:34 \u2014 `const apiResponse_ = ref(null)` (instance-scoped).",
        "type": "gen"
      },
      {
        "text": "2. WBDataViewer.vue:51 \u2014 watcher early-returns on",
        "type": "gen"
      },
      {
        "text": "`if (apiResponse_.value) return apiResponse_.value`.",
        "type": "gen"
      },
      {
        "text": "3. There is no key comparison. The watcher never asks \"is this",
        "type": "gen"
      },
      {
        "text": "cached response *for the current project*?\"",
        "type": "gen"
      },
      {
        "text": "4. Memory note describes the cache as \"fetched-once-per-component\"",
        "type": "gen"
      },
      {
        "text": "\u2014 which is technically what the code does, but the assumed",
        "type": "gen"
      },
      {
        "text": "semantics (\"project changes blow the cache implicitly via",
        "type": "gen"
      },
      {
        "text": "route remount\") only holds if the route remounts the component.",
        "type": "gen"
      },
      {
        "text": "In production, the App.vue parent does not remount on every",
        "type": "gen"
      },
      {
        "text": "project change.",
        "type": "gen"
      },
      {
        "text": "## Why production fails but the memory note seems coherent",
        "type": "sys"
      },
      {
        "text": "The memory note assumes route remount blows the cache. But in App.vue,",
        "type": "gen"
      },
      {
        "text": "the WBDataViewer is mounted once and receives `project` as a prop. The",
        "type": "gen"
      },
      {
        "text": "prop changes in place; no remount; cache survives. The note is",
        "type": "gen"
      },
      {
        "text": "coherent under one mental model and wrong under the actual mounting",
        "type": "gen"
      },
      {
        "text": "shape.",
        "type": "gen"
      },
      {
        "text": "## Recommended next step (do not fix here \u2014 propose a plan row)",
        "type": "sys"
      },
      {
        "text": "Title: WBDataViewer.apiResponse_ \u2014 invalidate on project key change",
        "type": "gen"
      },
      {
        "text": "Files: core2/packages/wb-dataviewer/src/WBDataViewer.vue:34, :51",
        "type": "gen"
      },
      {
        "text": "Fix shape: change cache from `ref<T|null>` to",
        "type": "gen"
      },
      {
        "text": "`ref<{key:string, value:T} | null>`. Watcher checks",
        "type": "gen"
      },
      {
        "text": "`cached?.key === newProject` before returning.",
        "type": "gen"
      },
      {
        "text": "Verify: navigate between two projects in the demo app; second",
        "type": "gen"
      },
      {
        "text": "project's response renders without manual refresh.",
        "type": "gen"
      },
      {
        "text": "Memory follow-up: update project_wbdataviewer_apiResponse.md to",
        "type": "gen"
      },
      {
        "text": "record the key-match invariant.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Diagnosis only.",
        "type": "gen"
      }
    ],
    "note": "This is the most useful single-bug example in the workspace. The memory describes the *pattern*; `/wbDebug` describes what's *wrong* with the current implementation:",
    "noteType": "info"
  },
  {
    "title": "The dist-folder mismatch, diagnosed honestly",
    "cmd": "/wbDebug \"Cannot resolve module 'core2/packages/wbc-ui2-cdn/dist/index.js'\"",
    "logs": [
      {
        "text": "[DIAGNOSE] Trace points at: missing dist/index.js in wbc-ui2-cdn.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading project_pkg_dist_mismatch.md (memory)...",
        "type": "ctx"
      },
      {
        "text": "PARKED tech debt \u2014 the package declares main:dist/ but",
        "type": "gen"
      },
      {
        "text": "vite writes to dist-dev/. Both candidate fixes have",
        "type": "gen"
      },
      {
        "text": "unresolved trade-offs.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading wbc-ui2-cdn/package.json (line 6, main field)...",
        "type": "ctx"
      },
      {
        "text": "[CONTEXT] Reading wbc-ui2-cdn/vite.config.js (line 18, outDir)...",
        "type": "ctx"
      },
      {
        "text": "## Theory",
        "type": "sys"
      },
      {
        "text": "This is the parked mismatch. Not a regression. Not your environment.",
        "type": "gen"
      },
      {
        "text": "## Evidence chain",
        "type": "sys"
      },
      {
        "text": "1. package.json:6 \u2014 \"main\": \"./dist/index.js\"",
        "type": "gen"
      },
      {
        "text": "2. vite.config.js:18 \u2014 build.outDir = \"dist-dev\"",
        "type": "gen"
      },
      {
        "text": "3. ls core2/packages/wbc-ui2-cdn/dist/ \u2192 does not exist",
        "type": "gen"
      },
      {
        "text": "4. Memory note explicitly records this as parked.",
        "type": "gen"
      },
      {
        "text": "## Why this isn't fixed yet",
        "type": "sys"
      },
      {
        "text": "The two candidate fixes are:",
        "type": "gen"
      },
      {
        "text": "(a) Update package.json main to \"./dist-dev/index.js\" \u2014 leaks the",
        "type": "gen"
      },
      {
        "text": "dev-mode convention into consumer apps that don't care about",
        "type": "gen"
      },
      {
        "text": "dist vs dist-dev.",
        "type": "gen"
      },
      {
        "text": "(b) Reconfigure vite to write to dist/ \u2014 collides with the existing",
        "type": "gen"
      },
      {
        "text": "dev-mode flow that depends on dist-dev/ for hot module reload.",
        "type": "gen"
      },
      {
        "text": "Neither is one-liner-correct. The team parked the decision pending",
        "type": "gen"
      },
      {
        "text": "a broader build-config conversation.",
        "type": "gen"
      },
      {
        "text": "## Recommended next step",
        "type": "sys"
      },
      {
        "text": "**Do not patch this in isolation.** Per the memory note:",
        "type": "sys"
      },
      {
        "text": "- If the build is blocking work *right now*, run `pnpm build` from",
        "type": "gen"
      },
      {
        "text": "inside the package directory \u2014 that path writes dist/ correctly via",
        "type": "gen"
      },
      {
        "text": "a different toolchain.",
        "type": "gen"
      },
      {
        "text": "- If you believe the parked decision should be revisited, open an",
        "type": "gen"
      },
      {
        "text": "architecture thread, don't patch.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Diagnosis only. Memory note is the source of truth.",
        "type": "gen"
      }
    ],
    "note": "User pastes a build error pointing at `core2/packages/wbc-ui2-cdn/dist/index.js`:",
    "noteType": "info"
  },
  {
    "title": "The \"test would fail under X\" prospective diagnosis",
    "cmd": "/wbDebug \"WBCodeSlot test that checks dev gating \u2014 under what conditions would it fail?\"",
    "logs": [
      {
        "text": "[DIAGNOSE] Reading hypothetical test pattern for WBCodeSlot...",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading core2/packages/wb-core/src/components/WBCodeSlot.vue...",
        "type": "ctx"
      },
      {
        "text": "[CONTEXT] Memory: feedback_wbCode_dev_only.md (3-mode gating pattern).",
        "type": "ctx"
      },
      {
        "text": "## Theory (prospective)",
        "type": "sys"
      },
      {
        "text": "Such a test would fail under two specific conditions:",
        "type": "gen"
      },
      {
        "text": "**Condition 1 \u2014 module cache contamination**",
        "type": "sys"
      },
      {
        "text": "If WBCodeSlot was imported in a previous test suite with __WBC_DEV__",
        "type": "gen"
      },
      {
        "text": "= false, the module-level capture of __WBC_DEV__ at setup time means",
        "type": "gen"
      },
      {
        "text": "the component's `isDev` value is sealed at \"false\" for any subsequent",
        "type": "gen"
      },
      {
        "text": "test that doesn't reset module cache. Setting __WBC_DEV__ in",
        "type": "gen"
      },
      {
        "text": "beforeEach has no effect because the component already captured the",
        "type": "gen"
      },
      {
        "text": "old value.",
        "type": "gen"
      },
      {
        "text": "**Condition 2 \u2014 SSR/CSR boundary**",
        "type": "sys"
      },
      {
        "text": "__WBC_DEV__ is set on `window`. Under SSR the component runs without",
        "type": "gen"
      },
      {
        "text": "a window; the optional-chaining `globalThis?.__WBC_DEV__` would",
        "type": "gen"
      },
      {
        "text": "return undefined; isDev would be falsy. Tests that mock `window`",
        "type": "gen"
      },
      {
        "text": "late see this.",
        "type": "gen"
      },
      {
        "text": "## Evidence chain",
        "type": "sys"
      },
      {
        "text": "1. Memory note: feedback_wbCode_dev_only.md describes the 3-mode",
        "type": "gen"
      },
      {
        "text": "pattern (full / dev / hidden) but doesn't specify whether the",
        "type": "gen"
      },
      {
        "text": "gate re-reads on render.",
        "type": "gen"
      },
      {
        "text": "2. Vue setup() runs once per component instance. A `const isDev =",
        "type": "gen"
      },
      {
        "text": "condition` captures at setup; it doesn't re-evaluate per render.",
        "type": "gen"
      },
      {
        "text": "3. The test pattern works *only* if the test forces a fresh import",
        "type": "gen"
      },
      {
        "text": "of WBCodeSlot after setting __WBC_DEV__.",
        "type": "gen"
      },
      {
        "text": "## Recommended fix shape if the test fails",
        "type": "sys"
      },
      {
        "text": "Change the gate to a computed: `const isDev = computed(() => globalThis?.__WBC_DEV__)`.",
        "type": "gen"
      },
      {
        "text": "This re-reads on every render and is robust to test ordering.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Prospective diagnosis only \u2014 no test was actually run.",
        "type": "gen"
      },
      {
        "text": "The fix shape applies regardless of whether the test exists today.",
        "type": "gen"
      }
    ],
    "note": "User wants to understand what conditions break a test, before they run it:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbDebug" :pipelines="wbDebugPipelines" />


### 💠 Pipeline The apiResponse_ stale-cache, diagnosed live

This is the most useful single-bug example in the workspace. The memory describes the *pattern*; `/wbDebug` describes what's *wrong* with the current implementation:


### 💠 Pipeline The dist-folder mismatch, diagnosed honestly

User pastes a build error pointing at `core2/packages/wbc-ui2-cdn/dist/index.js`:


### 💠 Pipeline The "test would fail under X" prospective diagnosis

User wants to understand what conditions break a test, before they run it:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbDebug` with no symptom | Halt. Provide a stack trace, error string, test name, or symptom description. |
| `/wbDebug "fix the apiResponse_ thing"` | Polite refuse — `/wbDebug` diagnoses; `/wbWork` fixes. Suggest plan + work flow. |
| `/wbDebug "the build is broken"` | Halt. Too vague. Ask for a specific error line or behavior description. |
| `/wbDebug` on a stack trace pointing entirely at vue's internals (no user code frames) | Diagnose the *call site* if discoverable; flag that the upstream may be the cause but is out of scope. |
| `/wbDebug "all tests fail"` | Refuse. Run `/wbTest` to enumerate; come back with one failure name. |
| `/wbDebug https://github.com/.../issues/42` | Refuse. No external fetch. Paste the issue body into the argument. |

The pattern: **`/wbDebug` is a single-failure, evidence-citing, no-mutation diagnostic.** It reads memory before proposing fixes, refuses to patch when memory says "parked," and is honest when the situation is too vague to diagnose. The output is always a handoff document — never an applied change.

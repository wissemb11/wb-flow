# /wbDebug — Exhaustive Simulation ()

`/wbDebug` is the diagnostician. Its job is **root-cause analysis, not patch attempts**. It reads a stack trace, a failing test, or a description of unwanted behavior, and produces a *theory of what's broken and why* — citing evidence at every step. It does not fix. It hands the diagnosis to `/wbWork` (or to the user) with enough context that the fix can be made deliberately.

Read this if you want to know why `/wbDebug` has *no flags*, what counts as a usable diagnosis, and where the boundary sits between "diagnose" and "fix."

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Diagnostician — root cause + evidence chain. |
| **Target** | A failing test name, a stack trace, an error message, a user-described symptom, or a file the user suspects. |
| **Cell scope** | None. Output is a diagnosis report, not a plan mutation. |
| **Side effects allowed** | Reading code, reading test output, reading logs, running read-only diagnostic commands (`grep`, file inspection). |
| **Side effects forbidden** | Editing source code, applying fixes, mutating plan cells, running anything that changes state. |

The "no patch attempts" rule is the design center. A diagnostic that says "I think it's broken here, and I fixed it" loses both the *theory* (because the user can't follow the reasoning) and the *fix* (because the fix is now bundled with potentially-wrong reasoning). `/wbDebug` separates the two: a diagnosis you can read and verify, then `/wbWork --id="<row>"` to actually fix it.

---

## 2. Argument resolution matrix

`/wbDebug` is intentionally *forgiving* on input format because real debug starts from messy evidence. It accepts whatever the user has.

| Form | Example | What `/wbDebug` does |
|---|---|---|
| Stack trace (multi-line) | Pasted JS/Python/Vue trace in argument | Parses frames, identifies the deepest user-code frame, follows from there. |
| Error message string | `Command: /wbDebug "Cannot read property 'map' of undefined"` | Searches workspace for code paths that could produce this error; ranks by likelihood. |
| Failing test name | `Command: /wbDebug "WBCodeSlot.spec.js > renders empty slot"` | Reads the test, reads the code under test, walks the assertion that fails. |
| Symptom description | `Command: /wbDebug "WBDataViewer apiResponse_ stale on route change"` | Maps symptom to candidate code areas using both source and memory. |
| Suspect file | `Command: /wbDebug core2/packages/wb-core/src/WBC.js` | Treats the file as the locus; looks for issues consistent with the user's framing. |
| Bug report URL | (e.g., a GitHub issue number) | Refuses if the URL isn't local. `/wbDebug` does not fetch external resources. |

The forgiving input is paired with a strict output contract: every diagnosis names a **specific file/line/symbol**, a **specific cause**, and an **evidence chain**. Vague inputs are fine; vague outputs are not.

---

## 3. Flag matrix

`/wbDebug` has **no flags** (per the canonical the agent flag map). This is deliberate. Debugging that needs flags to refine its output usually wants `/wbAudit --profile="<x>"` instead — a flag-driven adversarial scan, not a diagnostic. `/wbDebug`'s output shape is fixed: theory + evidence + recommended next step.

| What you might want | What to use instead |
|---|---|
| "Just fix it for me" | `/wbDebug` to diagnose, then `/wbWork --id="<row>"` to fix. |
| "Scan many files for similar issues" | `/wbAudit --profile="correctness"`. |
| "Diagnose and add a row to the plan" | `/wbDebug` (read the diagnosis), then `/wbPlan --task="bugfix" "<diagnosis summary>"`. |
| "Find all failing tests" | `/wbTest --profile="all"`. `/wbDebug` is for *one* failure at a time. |

The single-failure-at-a-time rule is the second design center. Debugging a batch of failures together produces shallower diagnoses than debugging them individually — the agent's attention dilutes. The convention is: run `/wbTest` to enumerate failures, then `/wbDebug` per failure.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbDebugSimPipelines = [
  {
    "title": "The WBDataViewer apiResponse_ stale-cache symptom",
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
        "text": "[CONTEXT] Reading core2/packages/wb-dataviewer/src/App.vue...",
        "type": "ctx"
      },
      {
        "text": "[CONTEXT] Reading core2/packages/wb-dataviewer/src/WBDataViewer.vue...",
        "type": "ctx"
      },
      {
        "text": "## Theory",
        "type": "sys"
      },
      {
        "text": "The `apiResponse_` ref is component-scoped and has no invalidation",
        "type": "gen"
      },
      {
        "text": "hook. When the route changes the `project` prop, the watcher reads",
        "type": "gen"
      },
      {
        "text": "the existing `apiResponse_` cache and writes it back without",
        "type": "gen"
      },
      {
        "text": "re-fetching. The cache key is implicit (component instance lifetime),",
        "type": "gen"
      },
      {
        "text": "which means: same component instance \u2192 same cached response, regardless",
        "type": "gen"
      },
      {
        "text": "of which project is active.",
        "type": "gen"
      },
      {
        "text": "## Evidence chain",
        "type": "sys"
      },
      {
        "text": "1. core2/packages/wb-dataviewer/src/WBDataViewer.vue:34",
        "type": "gen"
      },
      {
        "text": "`const apiResponse_ = ref(null)` \u2014 instance-scoped ref, declared",
        "type": "gen"
      },
      {
        "text": "at component setup time.",
        "type": "gen"
      },
      {
        "text": "2. core2/packages/wb-dataviewer/src/WBDataViewer.vue:51",
        "type": "gen"
      },
      {
        "text": "`watch(() => props.project, async (newProject) => {",
        "type": "gen"
      },
      {
        "text": "if (apiResponse_.value) return apiResponse_.value",
        "type": "gen"
      },
      {
        "text": "apiResponse_.value = await fetchProject(newProject)",
        "type": "gen"
      },
      {
        "text": "})`",
        "type": "gen"
      },
      {
        "text": "The early-return on `apiResponse_.value` is the bug. The cache is",
        "type": "gen"
      },
      {
        "text": "never invalidated when `props.project` changes; it only fills once.",
        "type": "gen"
      },
      {
        "text": "3. Memory note `project_wbdataviewer_apiResponse.md` describes",
        "type": "gen"
      },
      {
        "text": "apiResponse_ as cache-on-mount. The early-return logic violates",
        "type": "gen"
      },
      {
        "text": "that intent: it caches on first *write*, not on mount.",
        "type": "gen"
      },
      {
        "text": "## Why this happens",
        "type": "sys"
      },
      {
        "text": "The watcher was likely written to \"avoid re-fetching the same project,\"",
        "type": "gen"
      },
      {
        "text": "but the implementation conflates \"same project\" with \"have a value at",
        "type": "gen"
      },
      {
        "text": "all.\" A correct check would be `if (apiResponse_.cachedFor === newProject)`",
        "type": "gen"
      },
      {
        "text": "\u2014 a key match \u2014 not a presence check.",
        "type": "gen"
      },
      {
        "text": "## Recommended next step",
        "type": "sys"
      },
      {
        "text": "Add a row to the plan:",
        "type": "gen"
      },
      {
        "text": "> Title: WBDataViewer apiResponse_ \u2014 replace presence check with",
        "type": "gen"
      },
      {
        "text": "> project-key match",
        "type": "gen"
      },
      {
        "text": "> Verify: navigate between two projects, confirm second project's",
        "type": "gen"
      },
      {
        "text": "> response renders without manual refresh.",
        "type": "gen"
      },
      {
        "text": "> Files: core2/packages/wb-dataviewer/src/WBDataViewer.vue:51",
        "type": "gen"
      },
      {
        "text": "This is a 5-line fix, but the **memory note** should also be updated",
        "type": "gen"
      },
      {
        "text": "to record the key-match invariant. Do not fix without updating memory.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Diagnosis only. Run /wbWork after the row is added.",
        "type": "gen"
      }
    ],
    "note": "A real symptom that surfaces in this workspace: the project changes via the route, but the data viewer keeps showing the previous project's response. The memory note `project_wbdataviewer_apiResponse.md` *describes* the cache pattern but doesn't say what's wrong. The user runs `/wbDebug` to find out:",
    "noteType": "info"
  },
  {
    "title": "Stack trace from a failing build",
    "cmd": "/wbDebug \"Error: ENOENT: no such file or directory, open '/home/wissemb11/Allprojects/wb-labs/core2/packages/wbc-ui2-cdn/dist/index.js'",
    "logs": [
      {
        "text": "at Object.openSync (node:fs:600:3)",
        "type": "gen"
      },
      {
        "text": "at readFileSync (node:fs:468:35)",
        "type": "gen"
      },
      {
        "text": "at resolveExports (vite/dist/node/chunks/dep-IQS-Va32.js:54218:14)\"",
        "type": "gen"
      },
      {
        "text": "[DIAGNOSE] Trace points at: missing dist/index.js in wbc-ui2-cdn.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading core2/packages/wbc-ui2-cdn/package.json...",
        "type": "ctx"
      },
      {
        "text": "[CONTEXT] Reading core2/packages/wbc-ui2-cdn/vite.config.js...",
        "type": "ctx"
      },
      {
        "text": "[CONTEXT] Memory: project_pkg_dist_mismatch.md",
        "type": "ctx"
      },
      {
        "text": "## Theory",
        "type": "sys"
      },
      {
        "text": "This is the parked dist-folder mismatch. The package.json declares",
        "type": "gen"
      },
      {
        "text": "`main: \"./dist/index.js\"`, vite is configured to write to `dist-dev/`.",
        "type": "gen"
      },
      {
        "text": "The consumer (whatever app is doing the import that triggered this",
        "type": "gen"
      },
      {
        "text": "trace) is resolving `main` and finding nothing.",
        "type": "gen"
      },
      {
        "text": "## Evidence chain",
        "type": "sys"
      },
      {
        "text": "1. core2/packages/wbc-ui2-cdn/package.json:6 \u2014 main = \"./dist/index.js\"",
        "type": "gen"
      },
      {
        "text": "2. core2/packages/wbc-ui2-cdn/vite.config.js:18 \u2014 outDir = \"dist-dev\"",
        "type": "gen"
      },
      {
        "text": "3. ls core2/packages/wbc-ui2-cdn/dist/ \u2192 no such directory",
        "type": "gen"
      },
      {
        "text": "4. Memory note `project_pkg_dist_mismatch.md` records this as parked.",
        "type": "gen"
      },
      {
        "text": "## Recommended next step",
        "type": "sys"
      },
      {
        "text": "**Do NOT fix this.** Memory says the issue is parked because both",
        "type": "sys"
      },
      {
        "text": "candidate fixes have unresolved trade-offs. If the build is blocking",
        "type": "gen"
      },
      {
        "text": "your work *right now*, the workaround per the memory note is:",
        "type": "gen"
      },
      {
        "text": "- `pnpm build` from the package (writes dist/ via a different code path)",
        "type": "gen"
      },
      {
        "text": "- OR pull from a git tag where dist/ was committed.",
        "type": "gen"
      },
      {
        "text": "If the underlying parked decision needs to be revisited, that is an",
        "type": "gen"
      },
      {
        "text": "architecture conversation, not a bug fix. Open a discussion thread,",
        "type": "gen"
      },
      {
        "text": "do not patch package.json or vite.config.js in isolation.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Diagnosis only.",
        "type": "gen"
      }
    ],
    "note": "A vite build fails with an obscure trace. The user pastes it:",
    "noteType": "info"
  },
  {
    "title": "A test failure with no obvious cause",
    "cmd": "/wbDebug \"WBCodeSlot.spec.js > renders code with __WBC_DEV__ true\"",
    "logs": [
      {
        "text": "[DIAGNOSE] Reading core2/packages/wb-core/tests/WBCodeSlot.spec.js...",
        "type": "gen"
      },
      {
        "text": "[DIAGNOSE] Reading core2/packages/wb-core/src/components/WBCodeSlot.vue...",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Memory: feedback_wbCode_dev_only.md (3-mode gating pattern).",
        "type": "ctx"
      },
      {
        "text": "## Theory",
        "type": "sys"
      },
      {
        "text": "The test sets `__WBC_DEV__ = true` at module load, but the component",
        "type": "gen"
      },
      {
        "text": "captures `__WBC_DEV__` at *setup* time, not at *render* time. If the",
        "type": "gen"
      },
      {
        "text": "test runner imports the component before the test sets the flag, the",
        "type": "gen"
      },
      {
        "text": "component sees `false` regardless of what the test does.",
        "type": "gen"
      },
      {
        "text": "## Evidence chain",
        "type": "sys"
      },
      {
        "text": "1. tests/WBCodeSlot.spec.js:8",
        "type": "gen"
      },
      {
        "text": "`beforeEach(() => { window.__WBC_DEV__ = true })`",
        "type": "gen"
      },
      {
        "text": "2. src/components/WBCodeSlot.vue:14",
        "type": "gen"
      },
      {
        "text": "`const isDev = window.__WBC_DEV__` \u2014 read at setup, never re-read.",
        "type": "gen"
      },
      {
        "text": "3. The intermittence comes from test runner module-cache behavior:",
        "type": "gen"
      },
      {
        "text": "when WBCodeSlot is fresh-imported in the test, it captures the",
        "type": "gen"
      },
      {
        "text": "current flag; when it's cached from a previous suite, it captures",
        "type": "gen"
      },
      {
        "text": "whatever the flag was *then*.",
        "type": "gen"
      },
      {
        "text": "## Why this is intermittent",
        "type": "sys"
      },
      {
        "text": "Test runner module caching is order-dependent. Run the test in",
        "type": "gen"
      },
      {
        "text": "isolation: it passes (fresh import, flag is true). Run it after",
        "type": "gen"
      },
      {
        "text": "another suite that imported WBCodeSlot: it fails (cached, flag was",
        "type": "gen"
      },
      {
        "text": "false at original import). The failure reproduces only in CI's",
        "type": "gen"
      },
      {
        "text": "specific suite ordering.",
        "type": "gen"
      },
      {
        "text": "## Recommended next step",
        "type": "sys"
      },
      {
        "text": "Two options, in order of preference:",
        "type": "gen"
      },
      {
        "text": "1. Make `isDev` a getter, not a captured constant:",
        "type": "gen"
      },
      {
        "text": "`const isDev = computed(() => window.__WBC_DEV__)`.",
        "type": "gen"
      },
      {
        "text": "This re-reads on every render. Cleanest fix.",
        "type": "gen"
      },
      {
        "text": "2. Add `vi.resetModules()` to the test's beforeEach \u2014 fragile, only",
        "type": "gen"
      },
      {
        "text": "masks the symptom.",
        "type": "gen"
      },
      {
        "text": "Option 1 is correct. Add a plan row, fix in src/components/WBCodeSlot.vue:14,",
        "type": "gen"
      },
      {
        "text": "verify with the existing test (which should now pass deterministically).",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Diagnosis only.",
        "type": "gen"
      }
    ],
    "note": "A unit test fails intermittently. The user pastes the test name:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbDebug" titleSuffix="Exhaustive Simulation" :pipelines="wbDebugSimPipelines" />


### 💠 Pipeline The WBDataViewer apiResponse_ stale-cache symptom

A real symptom that surfaces in this workspace: the project changes via the route, but the data viewer keeps showing the previous project's response. The memory note `project_wbdataviewer_apiResponse.md` *describes* the cache pattern but doesn't say what's wrong. The user runs `/wbDebug` to find out:


### 💠 Pipeline Stack trace from a failing build

A vite build fails with an obscure trace. The user pastes it:


### 💠 Pipeline A test failure with no obvious cause

A unit test fails intermittently. The user pastes the test name:

---

## 5. Edge cases & refusals

| Trigger | What `/wbDebug` does |
|---|---|
| No symptom/target provided | Halt. `❌ Provide a stack trace, error message, test name, or symptom description.` |
| User asks `/wbDebug` to fix the bug | Refuse politely. `/wbDebug` produces diagnoses; fixes are `/wbWork`'s job. |
| Symptom matches no code or test in the workspace | Honest "could not localize." Suggests checking dependencies or build artifacts. |
| Multiple plausible causes | Rank by evidence strength; present the top theory plus 1-2 alternatives. |
| Memory contradicts the user's framing (e.g., "X is broken" but memory says "X was deliberately removed") | Surface the contradiction. Ask whether the user wants to revive X or accept that it's gone. |
| External URL given | Refuse. `/wbDebug` does not fetch. Paste the relevant content into the argument. |
| Stack trace from a dependency (no user code in the trace) | Diagnose the *call site* in user code, not the dependency. Note that the upstream may be broken but is out of scope. |

The unifying rule: **`/wbDebug` produces theories, not patches.** Every diagnosis is a hypothesis the user can verify against the cited evidence. When the agent is uncertain, it says so; when memory contradicts the framing, it surfaces that contradiction. The diagnosis is a *handoff document*, not a finished work item.

# /wbTest — Exhaustive Simulation ()

`/wbTest` is the runner. Its job is narrow: invoke the existing test suites, parse the output, and report what passed, what failed, and what didn't run. It does not write tests, does not generate assertions, does not patch failures. Test-creation is a `/wbWork` task; test-debugging is `/wbDebug`'s job.

Read this if you want to know which test runner profiles the agent recognizes, why `--task="<id>"` scopes by *plan row* rather than by file, and what counts as a clean run.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The test runner — invoke existing suites, parse output. |
| **Target** | A directory, a glob, a plan row ID (via `--task`), or no argument (test the active package). |
| **Cell scope** | None directly. The Verify recipe inside a plan row may call `/wbTest`, but `/wbTest` itself doesn't write to plan cells. |
| **Side effects allowed** | Spawning the test runner, reading the runner's output. |
| **Side effects forbidden** | Editing tests, generating new tests, patching failures, mutating plan cells, snapshotting/blessing test output. |

The "no test creation" rule keeps `/wbTest` separate from `/wbWork`. A worker writing a test for a row it's also implementing is fine — that's TDD inside one row. But `/wbTest` *invoking* the runner is read-only on test sources by design. It runs what exists; it doesn't add what's missing.

`/wbTest` is also the only command in the QA group that can *legitimately fail* on a clean repository. Every other QA command produces output; this one can fail because a test failed. The exit-code semantics are part of the contract.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbTest` does |
|---|---|---|
| No argument | `Command: /wbTest` | Detects active package via CWD; runs that package's full test suite. |
| Directory | `Command: /wbTest core2/packages/wb-core/` | Scopes to one package's tests. |
| Glob | `Command: /wbTest "core2/packages/*/tests/**/*.spec.js"` | Cross-package selection by file pattern. |
| File | `Command: /wbTest core2/packages/wb-core/tests/WBCodeSlot.spec.js` | One spec file. |
| Free-text | `Command: /wbTest "the dev gate suite"` | Refused. Test selection is not free-text — too easy to silently miss a suite. |

The free-text refusal is the interesting boundary. `/wbExplain` accepts free-text because explanations are cheap to be wrong. `/wbTest` refuses it because "running the wrong tests" produces a green check that isn't actually verifying what the user thought they were verifying. False confidence is worse than no answer.

---

## 3. Flag matrix

`/wbTest` has two flags. Both are scope-shapers, not behavior-shapers — they tell the runner *what* to test, not *how*.

| Flag | Shortcut | Purpose |
|---|---|---|
| `--profile="<runner>"` | `-p` | Selects a test runner profile when the package supports more than one. Values: `unit`, `e2e`, `integration`, `all`. Default: `unit`. |
| `--task="<id>"` | `-t` | Scopes the run to tests *associated with a specific plan row*. The row's Verify column names which tests apply. |

### How `--profile` actually selects

The profile maps to runner configurations declared in the package's `package.json` scripts or vitest config:

| Profile | Looks for |
|---|---|
| `unit` | Pure-function tests, component logic tests. Default. Runs fastest. |
| `integration` | Tests that mount components against a real DOM, hit a real (or mocked) network. Medium runtime. |
| `e2e` | Playwright/Cypress against a running dev server. Slow. Refuses if dev server isn't already running — won't auto-spawn. |
| `all` | Sequential `unit` → `integration` → `e2e`. Aborts the chain on first profile failure. |

The "won't auto-spawn dev server" rule is a safety convention. Auto-spawning means `/wbTest` is now a *deployment* command in disguise, with port collisions, env state, and sub-process lifecycle. `/wbTest --profile="e2e"` is "run e2e against what's already running" — predictable, narrow.

### How `--task` actually selects

The plan row's Verify column is parsed for test references. Common shapes:

| Verify cell content | What `--task="<id>"` runs |
|---|---|
| `tests/WBCodeSlot.spec.js` | That single spec file. |
| `WBCodeSlot.spec.js > "renders dev mode"` | That single test case within the file. |
| `unit` (just a profile name) | Equivalent to `--profile="unit"` for that row's package scope. |
| `manual: navigate between projects, observe refresh` | **Refused.** `/wbTest --task="<id>"` exits with a notice that the row's Verify is manual; suggests the user run the manual steps. |

Manual verifies are valid plan content — some rows have no automatable test. `/wbTest` is honest about this rather than pretending to verify them.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbTestSimPipelines = [
  {
    "title": "The pre-commit \"is this package green?\" check",
    "cmd": "/wbTest core2/packages/wb-core/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/",
        "type": "sys"
      },
      {
        "text": "[PROFILE] unit (default)",
        "type": "gen"
      },
      {
        "text": "[RUN] Spawning vitest with --run --reporter=json...",
        "type": "gen"
      },
      {
        "text": "Suites: 8 / 8 passed",
        "type": "gen"
      },
      {
        "text": "Tests: 42 / 42 passed",
        "type": "gen"
      },
      {
        "text": "Time: 1.4s",
        "type": "gen"
      },
      {
        "text": "[OK] Clean run. Safe to commit.",
        "type": "ok"
      }
    ],
    "note": "The most common shape: before running `/wbGit -P -e -p`, run the active package's test suite and check it's clean.",
    "noteType": "info"
  },
  {
    "title": "Scoped to a plan row's Verify recipe",
    "cmd": "/wbTest --task=\"2\"",
    "logs": [
      {
        "text": "[SYSTEM] Reading plan_<package>_<date>.md row 2.",
        "type": "sys"
      },
      {
        "text": "[VERIFY] Verify recipe: tests/WBCodeSlot.spec.js > \"renders dev mode\"",
        "type": "gen"
      },
      {
        "text": "[RUN] vitest --run -t \"renders dev mode\" tests/WBCodeSlot.spec.js",
        "type": "gen"
      },
      {
        "text": "Suites: 1 / 1 passed",
        "type": "gen"
      },
      {
        "text": "Tests: 1 / 1 passed",
        "type": "gen"
      },
      {
        "text": "Time: 0.3s",
        "type": "gen"
      },
      {
        "text": "[OK] Row 2's Verify recipe passes. Use /wbValid --id=\"2\" to record.",
        "type": "ok"
      }
    ],
    "note": "A plan row's Verify column says `tests/WBCodeSlot.spec.js > \"renders dev mode\"`. The user wants to run *only that test*:",
    "noteType": "info"
  },
  {
    "title": "Refuse the ambiguous",
    "cmd": "/wbTest \"the WBCode tests\"",
    "logs": [
      {
        "text": "[REFUSE] Free-text test selection is not supported.",
        "type": "error"
      },
      {
        "text": "[REASON] Running the wrong tests silently is worse than running none.",
        "type": "gen"
      },
      {
        "text": "Three plausible matches in workspace:",
        "type": "gen"
      },
      {
        "text": "(1) core2/packages/wb-core/tests/WBCode.spec.js",
        "type": "gen"
      },
      {
        "text": "(2) core2/packages/wb-core/tests/WBCodeSlot.spec.js",
        "type": "gen"
      },
      {
        "text": "(3) core2/packages/wbc-ui2-cdn/tests/wbcode-cdn.spec.js",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] Pass an explicit path:",
        "type": "gen"
      },
      {
        "text": "/wbTest core2/packages/wb-core/tests/WBCode.spec.js",
        "type": "gen"
      },
      {
        "text": "OR",
        "type": "gen"
      },
      {
        "text": "/wbTest core2/packages/wb-core/ (whole package)",
        "type": "gen"
      }
    ],
    "note": "A user reaches for `/wbTest \"the WBCode tests\"` thinking it'll find the right suite:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbTest" titleSuffix="Exhaustive Simulation" :pipelines="wbTestSimPipelines" />


### 💠 Pipeline The pre-commit "is this package green?" check

The most common shape: before running `/wbGit -P -e -p`, run the active package's test suite and check it's clean.


### 💠 Pipeline Scoped to a plan row's Verify recipe

A plan row's Verify column says `tests/WBCodeSlot.spec.js > "renders dev mode"`. The user wants to run *only that test*:


### 💠 Pipeline Refuse the ambiguous

A user reaches for `/wbTest "the WBCode tests"` thinking it'll find the right suite:

---

## 5. Edge cases & refusals

| Trigger | What `/wbTest` does |
|---|---|
| No active package, no argument | Halt. `❌ /wbTest needs a target. CWD is not a package.` |
| Free-text target | Refused with disambiguation. |
| `--profile="e2e"` with no dev server running | Refuse. Won't spawn. Tells the user to start the dev server explicitly. |
| `--task="<id>"` where the row's Verify is manual | Notice: "Verify is manual — see plan row." Exits 0 (not a failure, just nothing to run). |
| Test runner not found in package | Halt. `❌ No test runner detected. Looked for: vitest, jest, mocha, playwright.` |
| Test runner found but config is broken | Halt. Surfaces the runner's own error. Doesn't try to "fix" the config. |
| Tests pass | Exit 0 with raw counts. |
| Tests fail | Exit non-zero. Full failing test names + first lines of failure output. Suggests `/wbDebug "<failing test name>"` for diagnosis. |
| `--profile="all"` and unit fails | Aborts the chain. Doesn't run integration or e2e. The `all` profile is sequential-on-success. |
| `--task="99"` (row doesn't exist) | Halt. Same error as `/wbWork --id="99"`. |

The pattern: **`/wbTest` is a runner, not a fixer.** It refuses fuzzy targets, refuses to auto-spawn infrastructure, refuses to bless or ignore failures. The output is the runner's truth, surfaced cleanly. When something goes wrong, the next command is named (`/wbDebug`, `/wbValid`) — but `/wbTest` itself stays in its lane.

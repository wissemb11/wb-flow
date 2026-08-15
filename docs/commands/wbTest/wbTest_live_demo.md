# /wbTest — Live Demo ()

What `/wbTest` would actually do on `wb-labs` today (2026-05-04). The packages, runners, and live state below are real.

---

<CommandLiveDemoAnimation command="wbTest" />

## 1. Live target

| Field | Live value |
|---|---|
| Active package (CWD-derived) | `wb-labs` root — *not* a package directly testable |
| Most-tested package | `core2/packages/wb-core/` (vitest configured) |
| Untested packages (per memory) | `core2/packages/wbc-ui2-cdn/` and several others — `wbc-ui2-tech-debt.md` flags untested apps as parked |
| Active dev server | None running this session — would refuse `--profile="e2e"` |
| Test runner | vitest (across core2 packages); no e2e infrastructure live in this workspace |

The "untested apps" memory note is the operational truth here: `/wbTest` is a productive command in `wb-core` but partially silent in the rest of `core2/`, and that's known and parked.

---

## 2. What each target form would resolve to today

| Target | Live resolution |
|---|---|
| `/wbTest` (no arg, from wb-labs root) | Halt — root is not a package. |
| `/wbTest core2/packages/wb-core/` | Spawns vitest. Real run. |
| `/wbTest core2/packages/wbc-ui2-cdn/` | Refused — no test runner config in this package per the parked-tech-debt note. |
| `/wbTest "core2/packages/*/tests/**/*.spec.js"` | Glob expands across packages with vitest configured; skips the rest with a notice. |
| `/wbTest core2/packages/wb-core/tests/WBCodeSlot.spec.js` | Single spec, single file. |
| `/wbTest "the WBCode tests"` | Refused — free-text not supported. |
| `/wbTest --task="2"` | Reads `plan_wb-core_20260504.md` row 2's Verify column. (All rows currently have placeholder Verify content; would handoff to manual.) |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| `core2/packages/wb-core/` | Default profile (unit). Vitest runs. |
| `core2/packages/wb-core/ --profile="unit"` | Same as above; explicit profile. |
| `core2/packages/wb-core/ --profile="e2e"` | Refused — no dev server running. |
| `core2/packages/wb-core/ --profile="all"` | Runs unit; aborts if unit fails; otherwise tries integration; e2e refused for same reason. |
| `--task="2"` (no path arg) | Reads active plan, finds row 2, parses Verify. If Verify is manual → notice + exit 0. |
| `--task="2" --profile="unit"` | Same as `--task="2"` if the row's Verify is testable; profile is informational only. |

---

## 4. Pipelines

<script setup>
const wbTestPipelines = [
  {
    "title": "A clean wb-core unit pass",
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
        "text": "[RUN] Spawning vitest --run --reporter=json...",
        "type": "gen"
      },
      {
        "text": "Suites: 6 / 6 passed",
        "type": "gen"
      },
      {
        "text": "Tests: 28 / 28 passed",
        "type": "gen"
      },
      {
        "text": "Time: 1.1s",
        "type": "gen"
      },
      {
        "text": "[OK] Clean run. Safe to commit.",
        "type": "ok"
      }
    ],
    "note": "The realistic shape: tests for wb-core are configured, the suite is small, the run is fast.",
    "noteType": "info"
  },
  {
    "title": "The \"this package isn't tested yet\" case",
    "cmd": "/wbTest core2/packages/wbc-ui2-cdn/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wbc-ui2-cdn/",
        "type": "sys"
      },
      {
        "text": "[REFUSE] No test runner configured in this package.",
        "type": "error"
      },
      {
        "text": "[CONTEXT] Memory note `wbc-ui2-tech-debt.md` records this package as",
        "type": "ctx"
      },
      {
        "text": "\"untested apps\" \u2014 flagged but parked since the core2/ monorepo",
        "type": "gen"
      },
      {
        "text": "reorganization.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] If this package needs tests, that's a planning conversation",
        "type": "gen"
      },
      {
        "text": "(/wbPlan), not a /wbTest invocation.",
        "type": "gen"
      },
      {
        "text": "Add a row: \"Add vitest config + initial unit suite to wbc-ui2-cdn\"",
        "type": "gen"
      },
      {
        "text": "[NO RUN] No tests executed. Exit 0 (not a failure \u2014 just nothing to run).",
        "type": "gen"
      }
    ],
    "note": "Running against wbc-ui2-cdn surfaces the parked-untested-apps tech debt:",
    "noteType": "info"
  },
  {
    "title": "Refuse the e2e profile honestly",
    "cmd": "/wbTest core2/packages/wb-core/ --profile=\"e2e\"",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/",
        "type": "sys"
      },
      {
        "text": "[PROFILE] e2e",
        "type": "gen"
      },
      {
        "text": "[CHECK] Looking for running dev server on configured ports... none.",
        "type": "gen"
      },
      {
        "text": "[REFUSE] e2e requires a running dev server. /wbTest will not spawn one.",
        "type": "error"
      },
      {
        "text": "[REASON] Auto-spawning dev servers turns /wbTest into a deployment",
        "type": "gen"
      },
      {
        "text": "command. Port collisions, env state, and sub-process lifecycle",
        "type": "gen"
      },
      {
        "text": "are out of scope for a test runner.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] In one terminal: pnpm --filter wb-core dev",
        "type": "gen"
      },
      {
        "text": "In another: /wbTest core2/packages/wb-core/ --profile=\"e2e\"",
        "type": "gen"
      },
      {
        "text": "[NO RUN] Exit 0.",
        "type": "gen"
      }
    ],
    "note": "A user requests e2e without starting the dev server first:",
    "noteType": "info"
  },
  {
    "title": "`--task` with a manual Verify recipe",
    "cmd": "/wbTest --task=\"1\"",
    "logs": [
      {
        "text": "[SYSTEM] Reading plan_wb-core_20260504.md row 1.",
        "type": "sys"
      },
      {
        "text": "[VERIFY] Verify recipe: \"manual: navigate between two projects,",
        "type": "gen"
      },
      {
        "text": "observe refresh\"",
        "type": "gen"
      },
      {
        "text": "[NOTICE] This row has a manual Verify recipe. /wbTest cannot run it.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] Run the manual steps yourself:",
        "type": "gen"
      },
      {
        "text": "1. pnpm --filter wb-dataviewer dev",
        "type": "gen"
      },
      {
        "text": "2. Open in browser; navigate between projects",
        "type": "gen"
      },
      {
        "text": "3. Confirm second project's response renders",
        "type": "gen"
      },
      {
        "text": "Then mark the row with /wbValid --id=\"1\" if observed correctly.",
        "type": "gen"
      },
      {
        "text": "[NO RUN] Exit 0. (Manual verifies are valid; nothing went wrong.)",
        "type": "gen"
      }
    ],
    "note": "A plan row's Verify column says \"manual: navigate between two projects, observe refresh.\" The user runs:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbTest" :pipelines="wbTestPipelines" />


### 💠 Pipeline A clean wb-core unit pass

The realistic shape: tests for wb-core are configured, the suite is small, the run is fast.


### 💠 Pipeline The "this package isn't tested yet" case

Running against wbc-ui2-cdn surfaces the parked-untested-apps tech debt:


### 💠 Pipeline Refuse the e2e profile honestly

A user requests e2e without starting the dev server first:


### 💠 Pipeline `--task` with a manual Verify recipe

A plan row's Verify column says "manual: navigate between two projects, observe refresh." The user runs:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbTest` from wb-labs root with no arg | Halt — wb-labs is not a package. |
| `/wbTest core2/` (whole monorepo) | Halt — too broad, ambiguous which package's runner to use. |
| `/wbTest "the WBCode tests"` | Refuse with disambiguation list. |
| `/wbTest core2/packages/wbc-ui2-cdn/` | Refuse + cite memory note. Exit 0. |
| `/wbTest --profile="e2e"` without dev server | Refuse + reasoning. Exit 0. |
| `/wbTest --task="99"` | Halt — row doesn't exist. |
| `/wbTest core2/packages/wb-core/` after a real failure | Exit non-zero with failing test names + first lines + suggestion to run `/wbDebug "<failing test>"`. |

The pattern: **`/wbTest` is a runner with strong opinions about what's in scope.** It refuses fuzzy targets, refuses to auto-spawn infrastructure, distinguishes "no run" from "failed run" in exit codes, and hands off to `/wbDebug` or `/wbValid` rather than trying to do their work.

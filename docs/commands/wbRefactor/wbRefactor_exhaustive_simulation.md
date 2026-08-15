# /wbRefactor — Exhaustive Simulation ()

`/wbRefactor` is the surgeon. Its job is **structural surgery on a specific file** — change the *shape* of the code (decomposition, rename, extraction, pattern application) without changing what it does. The boundary that defines the command: behavior under tests stays identical; structure under reading changes.

Read this if you want to know why `/wbRefactor` has no flags, what counts as "behavior-preserving," and where refactor ends and `/wbClean` (cleanup) or `/wbWork` (feature change) begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Surgeon — structural transformation of one file or one tightly-coupled set of files. |
| **Target** | A specific file path; optionally a comma-separated set of files that will be transformed *together* atomically. |
| **Cell scope** | None directly. `/wbRefactor` does not mutate plan cells; the work it does should usually correspond to a plan row that `/wbWork` calls into. |
| **Side effects allowed** | Editing the targeted file(s); running existing tests to confirm behavior preservation. |
| **Side effects forbidden** | Adding new functionality; expanding scope to "while I'm here" cleanup; touching files outside the explicit target list. |

The "no scope creep" rule is what separates `/wbRefactor` from `/wbClean`. A surgeon doesn't decide mid-operation to also fix the patient's posture. If the refactor surfaces an unrelated mess, the agent *names* it (logs it as a candidate plan row) but does not act on it.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbRefactor` does |
|---|---|---|
| Single file | `Command: /wbRefactor core2/packages/wb-core/src/WBC.js` | Surgical transformation of one file. Most common shape. |
| Comma-separated | `Command: /wbRefactor src/WBC.js,src/WBCSlot.js` | Atomic transformation of two tightly-coupled files. Both succeed or both revert. |
| Free-text intent | `Command: /wbRefactor "extract the parser from WBC.js"` | Refused. Refactor is target-required. Intent without a file target is a planning conversation, not a refactor. |
| Directory | `Command: /wbRefactor core2/packages/wb-core/src/` | Refused. Refactor is file-level by design. |

The directory refusal is intentional. A "refactor everything in this directory" command is really a *planning* operation that should produce multiple plan rows, each refactoring a specific file. `/wbRefactor` keeps its scope narrow on purpose.

---

## 3. Flag matrix

`/wbRefactor` has **no flags**. The lack of flags is the design statement: every refactor is *behavior-preserving on a specific target*. There is no profile to choose, no severity to filter, no mode to toggle. The only question is "which file?" — and that's an argument, not a flag.

| What you might want | What to use instead |
|---|---|
| Refactor *and* fix lint warnings | `/wbRefactor` first, `/wbClean` after. Two commits, two clean intentions. |
| Refactor *and* add a feature | `/wbWork --id="<row>"` against a plan row that says so. Don't bundle. |
| Refactor *that the tests don't cover* | Ask the question first. `/wbRefactor` against untested code is dangerous; the agent will warn but proceed if explicitly told to. |
| Multi-file transformation | Comma-separated target. Atomic. |

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbRefactorSimPipelines = [
  {
    "title": "The deferred WBC.js decomposition (when the architecture conversation has happened)",
    "cmd": "/wbRefactor core2/packages/wb-core/src/WBC.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/src/WBC.js",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading file (412 lines, 8 exports)...",
        "type": "gen"
      },
      {
        "text": "[TEST] Running existing tests against this file...",
        "type": "gen"
      },
      {
        "text": "core2/packages/wb-core/tests/WBC.spec.js: 14 passed.",
        "type": "gen"
      },
      {
        "text": "[BASELINE] Test baseline captured. Refactor must preserve.",
        "type": "gen"
      },
      {
        "text": "[ANALYZE] Identifying surgical decomposition candidates:",
        "type": "gen"
      },
      {
        "text": "- Lines 14-89: parser logic (could become WBCParser.js)",
        "type": "gen"
      },
      {
        "text": "- Lines 91-178: orchestrator (stays in WBC.js)",
        "type": "gen"
      },
      {
        "text": "- Lines 180-302: render delegate (could become WBCRenderer.js)",
        "type": "gen"
      },
      {
        "text": "- Lines 304-412: state machine (could become WBCState.js)",
        "type": "gen"
      },
      {
        "text": "[REFACTOR PROPOSAL]",
        "type": "gen"
      },
      {
        "text": "Split into 4 files:",
        "type": "gen"
      },
      {
        "text": "- src/WBC.js: orchestrator (slim, ~90 lines)",
        "type": "gen"
      },
      {
        "text": "- src/WBCParser.js: parser (~75 lines)",
        "type": "gen"
      },
      {
        "text": "- src/WBCRenderer.js: render delegate (~120 lines)",
        "type": "gen"
      },
      {
        "text": "- src/WBCState.js: state machine (~110 lines)",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Proceed with this decomposition? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] Writing 4 files...",
        "type": "gen"
      },
      {
        "text": "Updating imports in 6 consumer files (no behavior change)...",
        "type": "gen"
      },
      {
        "text": "[TEST] Re-running existing tests...",
        "type": "gen"
      },
      {
        "text": "core2/packages/wb-core/tests/WBC.spec.js: 14 passed.",
        "type": "gen"
      },
      {
        "text": "core2/packages/wb-core/tests/*.spec.js: 28 passed (other suites).",
        "type": "gen"
      },
      {
        "text": "[OK] Behavior preserved. Refactor complete.",
        "type": "ok"
      },
      {
        "text": "[NOTE] No new functionality added. No tests added or removed.",
        "type": "gen"
      },
      {
        "text": "Plan row 3's Done is for /wbWork to mark, not /wbRefactor.",
        "type": "gen"
      }
    ],
    "note": "The active plan in this workspace defers row 3 (WBC.js decomposition) pending architectural discussion. *After* that discussion happens and a clear shape emerges, `/wbRefactor` is the right tool to execute it:",
    "noteType": "info"
  },
  {
    "title": "The atomic two-file rename",
    "cmd": "/wbRefactor src/utils/escape.js,src/renderString.js",
    "logs": [
      {
        "text": "[SYSTEM] Atomic transformation across 2 files.",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading both files...",
        "type": "gen"
      },
      {
        "text": "[ANALYZE] escape.js exports `escapeHTML`. renderString.js imports it.",
        "type": "gen"
      },
      {
        "text": "Proposal: move escapeHTML's body to renderString.js as a",
        "type": "gen"
      },
      {
        "text": "private helper; delete escape.js if it has no other consumers.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Other consumers of escape.js: 0.",
        "type": "gen"
      },
      {
        "text": "[BASELINE] Tests pass at this commit.",
        "type": "gen"
      },
      {
        "text": "[REFACTOR]",
        "type": "gen"
      },
      {
        "text": "- Move escapeHTML's body into renderString.js (now private).",
        "type": "gen"
      },
      {
        "text": "- Delete src/utils/escape.js.",
        "type": "gen"
      },
      {
        "text": "- Remove the import from renderString.js.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Two-file atomic refactor (one delete, one edit)? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] renderString.js updated.",
        "type": "gen"
      },
      {
        "text": "[DELETE] src/utils/escape.js removed.",
        "type": "gen"
      },
      {
        "text": "[TEST] All tests pass.",
        "type": "gen"
      },
      {
        "text": "[OK] Atomic refactor complete. Both succeeded.",
        "type": "ok"
      }
    ],
    "note": "A function moved from one file to another, and both files need to be edited together to preserve the import graph:",
    "noteType": "info"
  },
  {
    "title": "The \"refactor surfaces a separate problem\" path",
    "cmd": "/wbRefactor core2/packages/wb-core/src/tierEnforcement.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: tierEnforcement.js",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading file (87 lines)...",
        "type": "gen"
      },
      {
        "text": "[REFACTOR PROPOSAL] Extract the 3-tier check into a strategy table.",
        "type": "gen"
      },
      {
        "text": "[NOTICE] During scan, observed:",
        "type": "gen"
      },
      {
        "text": "- tierEnforcement.js:42 \u2014 accepts `alg:\"none\"` JWT (security finding,",
        "type": "gen"
      },
      {
        "text": "out of scope for this refactor \u2014 this is a behavior change).",
        "type": "gen"
      },
      {
        "text": "- tierEnforcement.js:71 \u2014 unused import `legacyVerify` (cleanup",
        "type": "gen"
      },
      {
        "text": "candidate, out of scope for this refactor).",
        "type": "gen"
      },
      {
        "text": "[FOCUS] Continuing with the refactor only. The two notices above are",
        "type": "gen"
      },
      {
        "text": "logged but NOT addressed.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Proceed with strategy-table refactor? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] Refactor applied.",
        "type": "gen"
      },
      {
        "text": "[TEST] All tests pass.",
        "type": "gen"
      },
      {
        "text": "[OK] Refactor complete.",
        "type": "ok"
      },
      {
        "text": "[FOLLOW-UPS]",
        "type": "gen"
      },
      {
        "text": "Logged for the user (not auto-actioned):",
        "type": "gen"
      },
      {
        "text": "1. Security: alg:\"none\" acceptance at line 42.",
        "type": "gen"
      },
      {
        "text": "Suggest: /wbAudit core2/packages/wb-core/src/tierEnforcement.js --profile=\"security\"",
        "type": "gen"
      },
      {
        "text": "2. Cleanup: unused legacyVerify import at line 71.",
        "type": "gen"
      },
      {
        "text": "Suggest: /wbClean core2/packages/wb-core/src/tierEnforcement.js",
        "type": "gen"
      }
    ],
    "note": "Mid-refactor, the agent notices something unrelated:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbRefactor" titleSuffix="Exhaustive Simulation" :pipelines="wbRefactorSimPipelines" />


### 💠 Pipeline The deferred WBC.js decomposition (when the architecture conversation has happened)

The active plan in this workspace defers row 3 (WBC.js decomposition) pending architectural discussion. *After* that discussion happens and a clear shape emerges, `/wbRefactor` is the right tool to execute it:


### 💠 Pipeline The atomic two-file rename

A function moved from one file to another, and both files need to be edited together to preserve the import graph:


### 💠 Pipeline The "refactor surfaces a separate problem" path

Mid-refactor, the agent notices something unrelated:

---

## 5. Edge cases & refusals

| Trigger | What `/wbRefactor` does |
|---|---|
| No target | Halt. `❌ /wbRefactor needs a file or comma-separated file list.` |
| Directory target | Halt. `❌ Refactor is file-level. Use /wbPlan to break a directory into rows.` |
| Free-text intent | Halt. `❌ Refactor needs a target file, not just intent.` |
| Target file has no test coverage | Warn explicitly. Asks user to confirm proceeding. Auto-rollback isn't possible without a baseline. |
| Multi-file target where some files don't exist | Halt. Atomic refactor refuses partial targets. |
| Tests fail after refactor | **Auto-revert all edits.** Reports which test failed. The atomic guarantee is the safety. |
| User asks to add a feature mid-refactor | Refuse. Suggests `/wbWork --id="<row>"` against a plan row, not bundling into the refactor. |
| Refactor surfaces unrelated issues | Logs them as follow-ups with suggested next commands. Does not act. |

The pattern: **`/wbRefactor` is behavior-preserving by contract.** No flags, file-level only, atomic across multi-file targets, auto-reverts on test failure, refuses to expand scope. The only question it answers is "can the same behavior be expressed with a clearer structure?" Anything else is a different command.

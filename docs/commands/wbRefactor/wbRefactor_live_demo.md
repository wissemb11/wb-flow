# /wbRefactor — Live Demo ()

What `/wbRefactor` would actually do on `wb-labs` right now. The candidate target files and their tests are real.

---

<CommandLiveDemoAnimation command="wbRefactor" />

## 1. Live target

| Field | Live value |
|---|---|
| Most-refactor-worthy file in the active plan | `core2/packages/wb-core/src/WBC.js` (row 3, deferred) |
| Refactor-worthy *despite* being deferred | Yes — the plan defers row 3 because the *architectural shape* needs discussion, not because the surgery is unsafe |
| Test coverage on WBC.js | Existing — `core2/packages/wb-core/tests/WBC.spec.js` (per typical layout) |
| Memory note flagging caution | `wbc-ui2-tech-debt.md` records the parked nature of certain restructure work |
| Other refactor candidates | `tierEnforcement.js` (security finding mixed with structural concern); various sibling-package files in `core2/packages/wbc-ui2-cdn/` (parked, do not refactor) |

The first row is the most useful — there's a real candidate (WBC.js) where the refactor is *deferred*, so `/wbRefactor` would correctly refuse pre-conversation.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbRefactor core2/packages/wb-core/src/WBC.js` | Would propose decomposition shape; ask for confirmation. **Memory-aware caveat:** the row is deferred — agent surfaces this and asks if the architectural conversation has happened. |
| `/wbRefactor core2/packages/wb-core/src/tierEnforcement.js` | Would propose strategy-table refactor; flag (but not fix) the security and cleanup findings. |
| `/wbRefactor core2/packages/wbc-ui2-cdn/src/index.js` | Refuse — memory says this package is parked tech debt. Refactoring would re-trigger the dist-folder mismatch conversation. |
| `/wbRefactor "extract the parser"` | Halt — file-required. |
| `/wbRefactor core2/packages/wb-core/` | Halt — directory targets refused. |
| `/wbRefactor src/index.js,src/types.ts` (atomic) | Permitted if both files exist; atomic transformation. |

---

## 3. Per-input behavior, applied live

`/wbRefactor` has no flags. The behavior matrix is by input shape:

| Input shape | Live behavior |
|---|---|
| Single file with passing tests | Standard refactor flow: propose → confirm → edit → test → report. |
| Single file with no test coverage | Warns prominently; asks to confirm. Suggests adding a test first. |
| File where memory says "parked" | Refuse. Explains why; suggests the architectural conversation as the actual blocker. |
| Two-file atomic target | Both must exist; both succeed or both revert. |
| Directory target | Halt. |
| Free-text only | Halt. |

---

## 4. Pipelines

<script setup>
const wbRefactorPipelines = [
  {
    "title": "The right refusal for WBC.js right now",
    "cmd": "/wbRefactor core2/packages/wb-core/src/WBC.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/src/WBC.js",
        "type": "sys"
      },
      {
        "text": "[CONTEXT] Reading active plan: plan_wb-core_20260504.md...",
        "type": "ctx"
      },
      {
        "text": "Row 3 (WBC.js decomposition) is currently \u23f8\ufe0f Deferred.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading memory wbc-ui2-tech-debt.md and feedback rules...",
        "type": "ctx"
      },
      {
        "text": "[REFUSE] The refactor target corresponds to a deferred plan row.",
        "type": "error"
      },
      {
        "text": "[REASON] Row 3's deferral isn't about *whether* WBC.js should be",
        "type": "gen"
      },
      {
        "text": "decomposed \u2014 it's about *what shape* the decomposition",
        "type": "gen"
      },
      {
        "text": "should take. Running /wbRefactor before that conversation",
        "type": "gen"
      },
      {
        "text": "locks in a shape unilaterally.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] Two paths:",
        "type": "gen"
      },
      {
        "text": "1. Have the architectural conversation; capture the agreed shape",
        "type": "gen"
      },
      {
        "text": "in a plan row's task description; reactivate row 3 with",
        "type": "gen"
      },
      {
        "text": "/wbPlan --id=\"3\" -o; then /wbRefactor.",
        "type": "gen"
      },
      {
        "text": "2. If you genuinely just want to explore decomposition shapes,",
        "type": "gen"
      },
      {
        "text": "use /wbExplain WBC.js --as=\"senior architect, 3 candidate",
        "type": "gen"
      },
      {
        "text": "decompositions\" to draft options without editing.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Refactor not started.",
        "type": "gen"
      }
    ],
    "note": "Running `/wbRefactor` on the deferred row's target file:",
    "noteType": "info"
  },
  {
    "title": "The \"surface findings, refactor only\" pipeline on tierEnforcement.js",
    "cmd": "/wbRefactor core2/packages/wb-core/src/tierEnforcement.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: tierEnforcement.js",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading file (87 lines, 1 export: enforceTier)...",
        "type": "gen"
      },
      {
        "text": "[TEST] Running tests...",
        "type": "gen"
      },
      {
        "text": "tierEnforcement.spec.js: 8 passed.",
        "type": "gen"
      },
      {
        "text": "[BASELINE] Test baseline captured.",
        "type": "gen"
      },
      {
        "text": "[ANALYZE]",
        "type": "gen"
      },
      {
        "text": "Current shape: 3 nested if-elif blocks for the 3 tiers.",
        "type": "gen"
      },
      {
        "text": "Proposed shape: strategy table { tier: validatorFn }, single dispatch.",
        "type": "gen"
      },
      {
        "text": "[NOTICE] During scan, observed (out of scope for refactor):",
        "type": "gen"
      },
      {
        "text": "- line 42: alg:\"none\" not in JWT denylist (security finding)",
        "type": "gen"
      },
      {
        "text": "- line 71: import `legacyVerify` from removed module \u2014 currently",
        "type": "gen"
      },
      {
        "text": "unused",
        "type": "gen"
      },
      {
        "text": "[FOCUS] These are NOT in scope. Logged as follow-ups.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Apply strategy-table refactor? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] tierEnforcement.js rewritten with strategy dispatch.",
        "type": "gen"
      },
      {
        "text": "[TEST] All 8 tests still pass.",
        "type": "gen"
      },
      {
        "text": "[OK] Refactor complete. Same behavior, clearer structure.",
        "type": "ok"
      },
      {
        "text": "[FOLLOW-UPS LOGGED]",
        "type": "gen"
      },
      {
        "text": "1. Security: alg:\"none\" acceptance at line 42 (now line 38 post-refactor).",
        "type": "gen"
      },
      {
        "text": "Suggest: /wbAudit core2/packages/wb-core/src/tierEnforcement.js --profile=\"security\"",
        "type": "gen"
      },
      {
        "text": "2. Cleanup: unused `legacyVerify` import.",
        "type": "gen"
      },
      {
        "text": "Suggest: /wbClean core2/packages/wb-core/src/tierEnforcement.js",
        "type": "gen"
      }
    ],
    "note": "Assuming the architectural conversation happened and tierEnforcement.js is on the table for a strategy-table refactor:",
    "noteType": "info"
  },
  {
    "title": "The atomic two-file move",
    "cmd": "/wbRefactor core2/packages/wb-core/src/utils/escape.js,core2/packages/wb-core/src/renderString.js",
    "logs": [
      {
        "text": "[SYSTEM] Atomic refactor across 2 files.",
        "type": "sys"
      },
      {
        "text": "[SCAN]",
        "type": "gen"
      },
      {
        "text": "utils/escape.js: 18 lines, 1 export (escapeHTML).",
        "type": "gen"
      },
      {
        "text": "renderString.js: imports escapeHTML, single usage at line 11.",
        "type": "gen"
      },
      {
        "text": "[CONSUMERS] grep across workspace: only renderString.js consumes escape.js.",
        "type": "gen"
      },
      {
        "text": "[TEST] All tests pass at baseline.",
        "type": "gen"
      },
      {
        "text": "[PROPOSAL]",
        "type": "gen"
      },
      {
        "text": "- Inline escapeHTML's body into renderString.js as a private helper.",
        "type": "gen"
      },
      {
        "text": "- Delete utils/escape.js.",
        "type": "gen"
      },
      {
        "text": "- No external API change (escapeHTML was not re-exported).",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Atomic two-file refactor (one rewrite, one delete)? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] renderString.js updated.",
        "type": "gen"
      },
      {
        "text": "[DELETE] utils/escape.js removed.",
        "type": "gen"
      },
      {
        "text": "[TEST] All tests pass.",
        "type": "gen"
      },
      {
        "text": "[OK] Atomic refactor complete. Both edits succeeded.",
        "type": "ok"
      }
    ],
    "note": "Hypothetical but realistic: `escape.js` is a one-function utility and `renderString.js` is its only consumer. Time to inline:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbRefactor" :pipelines="wbRefactorPipelines" />


### 💠 Pipeline The right refusal for WBC.js right now

Running `/wbRefactor` on the deferred row's target file:


### 💠 Pipeline The "surface findings, refactor only" pipeline on tierEnforcement.js

Assuming the architectural conversation happened and tierEnforcement.js is on the table for a strategy-table refactor:


### 💠 Pipeline The atomic two-file move

Hypothetical but realistic: `escape.js` is a one-function utility and `renderString.js` is its only consumer. Time to inline:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbRefactor` (no target) | Halt. Refactor is target-required. |
| `/wbRefactor core2/packages/wb-core/` | Halt. Directory targets refused. |
| `/wbRefactor "extract the parser"` | Halt. File required. |
| `/wbRefactor core2/packages/wbc-ui2-cdn/src/index.js` | Refuse + memory citation (parked tech debt). |
| `/wbRefactor core2/packages/wb-core/src/WBC.js` | Memory-aware refuse: row 3 deferred pending architectural conversation. |
| `/wbRefactor` on a file with no test coverage | Warn prominently; asks to confirm. Suggests `/wbTest` first if helpers exist. |
| `/wbRefactor` proposal that changes external API | Halt — external API change is a `/wbWork` job (corresponds to a plan row), not a refactor. |
| Tests fail post-refactor | Auto-revert. Edit-set rolled back atomically. |

The pattern: **`/wbRefactor` is behavior-preserving, target-required, memory-aware, and atomic.** No flags, no scope creep, no silent feature additions. It refuses targets that memory marks as parked, and refuses scope shapes (directories, free-text) that would dilute the surgical premise. When unrelated findings surface during scan, they're logged as follow-ups with the right next command — never auto-actioned.

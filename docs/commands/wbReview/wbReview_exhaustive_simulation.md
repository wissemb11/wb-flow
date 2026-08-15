# /wbReview — Exhaustive Simulation ()

`/wbReview` is the inspector. Its job is the **plan-vs-reality diff**: read what was supposed to happen (the plan), read what actually happened (the diff or the current state), and surface where they disagree. Unlike `/wbAudit`, which judges code against universal standards, `/wbReview` judges code against *intent*. Same code can pass an audit and fail a review — or vice versa — because the questions are different.

Read this if you want to know what `--plan` does that `/wbAudit --wbPlan` doesn't, why `--act` and `--wbPlan` are independent flags here too, and where review ends and refactor begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Inspector — surgical plan-vs-reality check. |
| **Target** | An uncommitted diff, a recent commit, a directory, or a plan row. |
| **Cell scope** | None directly. Review produces a *report*; chaining (`--act` / `--wbPlan`) routes the report into actionable artifacts. |
| **Side effects allowed** | Reading code, reading the active plan, comparing diff to plan row descriptions, reading recent reports under `reports/<date>/`. |
| **Side effects forbidden** | Editing source code, applying suggestions, mutating plan cells directly. |

The **plan-vs-reality** framing is the design center. Three concrete asymmetries follow from it:

- **Scope creep is reviewable.** If a plan row asks for "fix regex escape" and the diff also includes a CSS class change, `/wbReview` flags it. `/wbAudit` would not — extra CSS isn't audit-worthy on its own.
- **Missing work is reviewable.** If the plan row says "add denylist + tests" and the diff includes the denylist but no tests, `/wbReview` flags it. `/wbAudit` looks at what's there, not what's missing.
- **Style consistency with the rest of the codebase is reviewable.** If the diff introduces a pattern alien to the existing code, `/wbReview` surfaces the divergence even when the new pattern is "fine on its own."

These three together give review its distinct lane.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbReview` does |
|---|---|---|
| No argument | `Command: /wbReview` | Reviews uncommitted changes (`git status` + diff). Maps each touched file back to the most-recent plan row that owns it. |
| Plan row ID | `Command: /wbReview --plan` (alone) | Equivalent: review uncommitted changes through the plan lens. |
| Specific commit | `Command: /wbReview <sha>` | Reviews a single commit. Maps to plan rows referenced in the commit body. |
| Directory | `Command: /wbReview core2/packages/wb-core/` | Reviews all files in the directory against the plan rows that touch them. |
| Free-text scope | `Command: /wbReview "the auth changes"` | Refused. Same reasoning as `/wbAudit` — adversarial review is too sensitive to fuzzy targeting. |

**Key behavior:** when reviewing a diff, the agent resolves "which plan row owns this change" by reading recent `reports/<date>/plans/plan_*.md` files and matching files-touched against the row's description. If no plan row claims a touched file, that file is reviewed under "scope-creep" by default.

---

## 3. Flag matrix

| Flag | Shortcut | Mode | What it does |
|---|---|---|---|
| `--plan` | `-p` | Filter | Strict plan-conformance mode. Failures on any deviation (scope creep, missing required artifact, style divergence). |
| `--act` | `-a` | Chain | Routes review output through `/wbActOn` — produces a sibling action file ranking review findings by impact/effort. |
| `--wbPlan` | `-P` | Chain | Routes review output through `/wbActOn`'s plan-generation engine — appends new rows to the active plan, one per critical finding. |

`--act` and `--wbPlan` are **independent and composable**, same shape as `/wbAudit`.

### How `--plan` changes the verdict

Without `--plan`, `/wbReview` is *advisory*: it flags issues but doesn't refuse. With `--plan`, it gates: any finding becomes a hard "review failed" verdict.

| Mode | Scope creep finding | Missing artifact | Style divergence |
|---|---|---|---|
| Default (advisory) | Flagged with severity | Flagged with severity | Flagged with severity |
| `--plan` (strict) | Hard fail | Hard fail | Hard fail |

The advisory/strict split exists because reviews happen at different points in the workflow. Mid-task, advisory is more useful (you want to know without being blocked). Pre-merge or pre-release, strict is what you want.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbReviewSimPipelines = [
  {
    "title": "The mid-session \"am I drifting?\" check",
    "cmd": "/wbReview",
    "logs": [
      {
        "text": "[SYSTEM] Target: uncommitted changes (git diff against HEAD).",
        "type": "sys"
      },
      {
        "text": "[CONTEXT] Active plan: plan_<package>_<date>.md (rows 1-3).",
        "type": "ctx"
      },
      {
        "text": "[MAP] Touched files \u2192 owning rows:",
        "type": "gen"
      },
      {
        "text": "core2/packages/wb-core/src/tierEnforcement.js \u2192 row 1 (JWT)",
        "type": "gen"
      },
      {
        "text": "core2/packages/wb-core/src/renderString.js \u2192 row 2 (escape)",
        "type": "gen"
      },
      {
        "text": "core2/packages/wb-core/src/components/UnrelatedButton.vue \u2192 \u26a0\ufe0f no row claims this",
        "type": "gen"
      },
      {
        "text": "## Findings (advisory)",
        "type": "sys"
      },
      {
        "text": "### 1 \u2014 Scope creep on UnrelatedButton.vue",
        "type": "gen"
      },
      {
        "text": "**Severity:** P2 (advisory)",
        "type": "sys"
      },
      {
        "text": "**File:** core2/packages/wb-core/src/components/UnrelatedButton.vue",
        "type": "sys"
      },
      {
        "text": "**Why:** No plan row touches components in this session. The diff",
        "type": "sys"
      },
      {
        "text": "adds a 30-line button component that isn't named in any row's",
        "type": "gen"
      },
      {
        "text": "description.",
        "type": "gen"
      },
      {
        "text": "**Why this is advisory, not strict:** the file might be necessary",
        "type": "sys"
      },
      {
        "text": "infrastructure for row 2 (renderString uses code slots which use",
        "type": "gen"
      },
      {
        "text": "buttons). But the plan row doesn't say so explicitly. Worth a",
        "type": "gen"
      },
      {
        "text": "30-second judgment call.",
        "type": "gen"
      },
      {
        "text": "**Recommendation:** Either (a) add a plan row for the button, or",
        "type": "sys"
      },
      {
        "text": "(b) split it into a separate commit, or (c) defer the button work",
        "type": "gen"
      },
      {
        "text": "to a later session.",
        "type": "gen"
      },
      {
        "text": "### 2 \u2014 Missing test for row 1",
        "type": "gen"
      },
      {
        "text": "**Severity:** P1",
        "type": "sys"
      },
      {
        "text": "**File:** core2/packages/wb-core/src/tierEnforcement.js (changes present)",
        "type": "sys"
      },
      {
        "text": "core2/packages/wb-core/tests/tierEnforcement.spec.js (no changes)",
        "type": "gen"
      },
      {
        "text": "**Why:** Row 1's Verify column reads \"unit test asserts alg:'none'",
        "type": "sys"
      },
      {
        "text": "rejected.\" The implementation is here; the test is not.",
        "type": "gen"
      },
      {
        "text": "**Recommendation:** Add the test before /wbValid. Without it, the",
        "type": "sys"
      },
      {
        "text": "validator has nothing to run.",
        "type": "gen"
      },
      {
        "text": "[OK] 2 findings, advisory. No mutation. Run with --plan to gate.",
        "type": "ok"
      }
    ],
    "note": "A `/wbWork` session has been running for an hour. The user wants a quick advisory pass: did anything I just did stray from what the plan asked for?",
    "noteType": "info"
  },
  {
    "title": "The strict pre-validation gate",
    "cmd": "/wbReview --plan",
    "logs": [
      {
        "text": "[SYSTEM] Target: uncommitted changes.",
        "type": "sys"
      },
      {
        "text": "[MODE] strict \u2014 any finding gates.",
        "type": "gen"
      },
      {
        "text": "## Findings (strict)",
        "type": "sys"
      },
      {
        "text": "### \u274c FAIL \u2014 Scope creep on UnrelatedButton.vue",
        "type": "gen"
      },
      {
        "text": "(Same finding as advisory mode, but now a hard fail.)",
        "type": "gen"
      },
      {
        "text": "### \u274c FAIL \u2014 Missing test for row 1",
        "type": "gen"
      },
      {
        "text": "(Same finding, hard fail.)",
        "type": "gen"
      },
      {
        "text": "[REVIEW FAILED] 2 hard failures. /wbValid would be premature.",
        "type": "gen"
      },
      {
        "text": "[NEXT STEP]",
        "type": "gen"
      },
      {
        "text": "- Address scope creep: split or add plan row.",
        "type": "gen"
      },
      {
        "text": "- Add the missing test.",
        "type": "gen"
      },
      {
        "text": "- Re-run /wbReview --plan to confirm clean.",
        "type": "gen"
      }
    ],
    "note": "Same situation, but the user is about to run `/wbValid` and wants to be sure nothing slips:",
    "noteType": "info"
  },
  {
    "title": "The chained \"review \u2192 plan rows for the gaps\"",
    "cmd": "/wbReview --plan --wbPlan",
    "logs": [
      {
        "text": "[SYSTEM] Target: uncommitted changes.",
        "type": "sys"
      },
      {
        "text": "[MODE] strict + chain to plan engine.",
        "type": "gen"
      },
      {
        "text": "## Findings (3 hard failures, see report)",
        "type": "sys"
      },
      {
        "text": "## Plan rows added to plan_<package>_<date>.md",
        "type": "sys"
      },
      {
        "text": "| # | Task | Verify | Dep |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 4 | Add unit test for alg:\"none\" rejection in tierEnforcement | test passes | \u2014 |",
        "type": "sys"
      },
      {
        "text": "| 5 | Move UnrelatedButton work to a separate session/PR | new plan row created | \u2014 |",
        "type": "sys"
      },
      {
        "text": "| 6 | Document the renderString output contract (review surfaced ambiguity) | reviewer confirms doc matches behavior | 2 |",
        "type": "sys"
      },
      {
        "text": "[OK] Review report saved: reports/<date>/reviews/review_<package>_<date>.md",
        "type": "ok"
      },
      {
        "text": "[OK] 3 plan rows added. Review failures are now tracked work.",
        "type": "ok"
      }
    ],
    "note": "A long session has accumulated review findings that warrant follow-up work. Instead of fixing in place, route the findings into new plan rows:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbReview" titleSuffix="Exhaustive Simulation" :pipelines="wbReviewSimPipelines" />


### 💠 Pipeline The mid-session "am I drifting?" check

A `/wbWork` session has been running for an hour. The user wants a quick advisory pass: did anything I just did stray from what the plan asked for?


### 💠 Pipeline The strict pre-validation gate

Same situation, but the user is about to run `/wbValid` and wants to be sure nothing slips:


### 💠 Pipeline The chained "review → plan rows for the gaps"

A long session has accumulated review findings that warrant follow-up work. Instead of fixing in place, route the findings into new plan rows:

---

## 5. Edge cases & refusals

| Trigger | What `/wbReview` does |
|---|---|
| No diff, no commit, no target | Halt. `❌ Nothing to review — no uncommitted changes, no commit specified.` |
| Free-text target | Refused with disambiguation list. |
| Target file genuinely matches no plan row | Reviewed under "scope-creep." Not a refusal — the user might be fixing typos that don't need a row. |
| Diff includes only generated files (`dist-*`, lock files) | One-line notice. Generated diffs aren't review-worthy on their own. |
| `/wbReview --plan` with no active plan | Halt. Strict mode requires a plan to compare against. |
| `--plan --wbPlan` with no findings | Produces an empty review report; no plan rows added. The chained mutation is conditional on findings. |
| Target commit references a plan row that no longer exists in the active plan | Notice that the row is missing; reviews against commit body's description verbatim instead. |

The pattern: **`/wbReview` is a plan-aware critic.** It reads intent (the plan) and reality (the diff), names where they disagree, and either advises or gates depending on `--plan`. The chaining flags turn findings into either ranked actions (`--act`) or new plan rows (`--wbPlan`), so review failures become tracked work rather than friction. The unifying principle: **a review without intent is just an opinion**; the plan is what makes it adjudicable.

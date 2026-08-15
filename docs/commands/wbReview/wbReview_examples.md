---
title: "wbReview — Examples"
description: "---"
---

# /wbReview — Examples

> Self-help. `/wbReview` is the command people confuse with `/wbAudit`. This file shows the difference in practice.

---

## /wbReview vs /wbAudit — the one-line distinction

| `/wbAudit` | `/wbReview` |
|---|---|
| "Is this code ready to ship?" | "Did the worker do what the plan said?" |
| No plan required | Requires a `--plan=<path>` reference |
| Scope: whole package or file | Scope: the diff/changes since the plan started |
| Verdict: score + ship/don't | Verdict: PASS / PASS-WITH-DEBT / FAIL |

If you don't have a plan, you don't want `/wbReview`. Use `/wbAudit`.

---

## Example 1 — `/wbReview packages/wb-core --plan=reports/20260423/plans/plan_wbCodeSlot_202604231840.md`

Reviewing the wbCodeSlot plan from the wbPlan examples.

```text
$ /wbReview packages/wb-core --plan=reports/20260423/plans/plan_wbCodeSlot_202604231840.md

[AI] Loading plan file...
[AI] Plan task count: 5
[AI] Tasks marked Done: 5 (all ✅)
[AI] Tasks marked Valid: 4 (one still ⬜)
[AI]
[AI] For each plan task, checking the actual code...
[AI] Writing reports/20260424/reviews/review_wbCodeSlot_202604240900.md:
```

```markdown
# Review: plan_wbCodeSlot (against packages/wb-core)

## Verdict: 🟡 PASS WITH DEBT

## Task-by-task verification

### Task 1: scaffold — Create src/components/WBCodeSlot.vue
- Plan said Done ✅
- Actual: file exists, 34 lines. Matches expected shape.
- ✅ CONFIRMED

### Task 2: gate-with-WBC_DEV
- Plan said: "Wire __WBC_DEV__ gating identical to WBCode.vue"
- Actual: gating exists, but uses `if (__WBC_DEV__)` while WBCode.vue
 uses `if (__WBC_DEV__ === true)`. Same runtime behavior for bools,
 but the plan specified "identical" — and this isn't identical.
- ⚠ DEBT: not blocking but violates stated task spec

### Task 3: export — Add WBCodeSlot to src/index.js
- Plan said Done ✅
- Actual: export exists on line 23.
- ✅ CONFIRMED

### Task 4: update-context — Add to context.md API section
- Plan said Done ✅
- Actual: context.md has a new "WBCodeSlot" entry, but no 3-mode
 gating note (which every other component entry has).
- ⚠ DEBT: consistency gap

### Task 5: test — Unit test covering dev/prod rendering
- Plan said Done ✅
- Actual: test file exists, but only covers the dev-mode render.
 Prod-mode path (non-__WBC_DEV__ branch) is not exercised.
- ❌ FAIL: task claimed complete, actual coverage is partial

## What the review found that the plan missed
- New dependency on `@wbc/wb-core/utils/extractPath` in WBCodeSlot.vue.
 This wasn't mentioned in the plan. Minor — but worth knowing.

## Recommendation
Task 5 must be finished before merge. Tasks 2 and 4 can ship as
tracked debt. Plan file should be re-opened: set Task 5 back to ⬜
and re-execute.
```

```text
[AI] Review complete. Verdict: PASS WITH DEBT (Task 5 failed).
[AI] Plan file marked: task 5 needs re-work.
```

**What's worth noticing:**

- Task 2 passed by gemini's audit standard ("gating works") but fails by `/wbReview` standard ("gating identical to WBCode.vue"). The review is bound by the *plan's language*, not generic code quality.
- Task 5 is the interesting case: worker marked it ✅ Done, but review checked the actual file and found partial coverage. This is the whole point of /wbReview — catching mismatches between claimed and actual completion.
- "What the review found that the plan missed" (the new utility dependency) surfaces unplanned side-effects without treating them as failures.

---

## Example 2 — `/wbReview packages/wb-dataviewer --plan=reports/20260420/plans/plan_apiResponse_cache_fix.md`

Reviewing a bug fix plan. Different review focus — regression guards matter more than feature completeness.

```text
$ /wbReview packages/wb-dataviewer --plan=reports/20260420/plans/plan_apiResponse_cache_fix.md
```

```markdown
# Review: plan_apiResponse_cache_fix

## Verdict: 🟢 PASS

## Task-by-task verification

### Task 1: reproduce — Script failing sequence in a test
- Actual: reports/20260420/debugs/apiResponse_repro.test.js exists.
 Runs, fails as expected before fix. Passes after fix.
- ✅ CONFIRMED (this is what "reproduce before fix" should look like)

### Task 2: verify-hypothesis — Check watcher-key hypothesis
- Actual: inline comment in fix references hypothesis. Fix matches.
- ✅ CONFIRMED

### Task 3: fix-root-cause — Scope: route-keyed reset only
- Actual: fix adds route-watcher that invalidates cache only on
 route change. Does NOT invalidate on project change.
- ✅ CONFIRMED — the scope restriction was honored

### Task 4: regression-guard — Ensure project-change path still caches
- Actual: new test "project change preserves apiResponse_ cache"
 added. Passes.
- ✅ CONFIRMED — this is the critical task; it passed

### Task 5: update-dev.md — Document route-vs-project distinction
- Actual: dev.md updated with the rule "route change invalidates
 cache; project change must not."
- ✅ CONFIRMED

## Regression check (review-initiated, not in plan)
- No other tests broke as a side effect.
- ✅ CLEAN

## Recommendation
Merge. Plan executed fully and correctly.
```

**What's worth noticing:**

- Every task confirmed. A good fix plan produces a clean review.
- Review added a regression check the plan didn't explicitly list. That's part of `/wbReview`'s job — catching things the plan author didn't think to enforce.
- The comment on Task 1 ("this is what reproduce-before-fix should look like") is the kind of validation that teaches you what good execution looks like for future plans.

---

## Example 3 — `/wbReview docs/ai_reference/commands/wbPlan/wbPlan_template.md --plan=reports/.../plan_template_rewrite.md`

Reviewing a non-code change. Documentation plans get reviewed the same way.

```text
$ /wbReview docs/.../wbPlan_template.md --plan=reports/.../plan_template_rewrite.md
```

```markdown
# Review: plan_template_rewrite (against wbPlan_template.md)

## Verdict: 🟡 PASS WITH DEBT

## Task-by-task verification

### Task 1: add-validator-column — New schema for plan tables
- ✅ CONFIRMED — column added, with example row

### Task 2: clarify-atomic-task-rule — Spec: tasks must be testable
- Plan said: "write a clear definition of what counts as atomic"
- Actual: definition added, but uses prose rather than examples.
 Contrast: the existing template uses examples heavily.
- ⚠ DEBT: inconsistent with template's pedagogical style

### Task 3: add-failure-mode-examples — Negative examples to avoid
- ✅ CONFIRMED — 3 anti-pattern examples added

## What the review caught that the plan missed
- Two existing sections no longer make sense after the rewrite
 (they assumed no validator column). Not flagged in plan.
 Either update them or delete them. Can't just leave them.

## Recommendation
Resolve Task 2 style mismatch and the orphaned-sections issue before
this becomes the canonical template. The content is right; the
consistency isn't.
```

**What's worth noticing:**

- Review works on docs exactly like code. "Did you do what the plan said?" is the question regardless of file type.
- The "orphaned sections" finding is the kind of thing a review catches that a plan author forgets — cascading effects of a change.

---

## Example 4 — reviewing a plan that shouldn't have been approved

The reviewer catches a failure the worker was hoping no one would notice.

```text
$ /wbReview packages/wb-core --plan=reports/20260421/plans/plan_quick_fix.md
```

```markdown
# Review: plan_quick_fix

## Verdict: 🔴 FAIL — DO NOT MERGE

## Problems

### The plan itself is underspecified
Task 1 is named "fix the thing" with no details. There is no way
to verify this was done — "the thing" isn't defined.

### The implementation bypassed dev.md rules
The fix modifies vite.config.js outDir without updating package.json
main: field. dev.md has a rule forbidding this without confirmation.

### Worker marked all tasks ✅ but no validator signed off
Tasks have Done but no Valid column entries. This is supposed to
block merge by convention.

### No regression tests
Worker fixed a symptom. No test was added to ensure the root cause
is actually gone. This issue will return.

## Recommendation
Do not merge. Send back to planning. The plan was too vague, the
execution violated rules, and there's no regression guard. Start over
with /wbPlan --task="<specific description>".
```

**What's worth noticing:**

- This is what `/wbReview` should look like when things are actually wrong. Not polite hedging — direct "do not merge."
- The review catches four separate problems (underspec plan, rule violation, no validator, no regression). Each is independently merge-blocking.
- the agent-style review would often soft-ball this as "pass with notes." The the documentation names the failure.

---

## The pattern

Every `/wbReview` asks three questions:

1. Does the actual code match what the plan tasks said would happen?
2. Did the worker violate any rules that the plan didn't explicitly invoke?
3. Are there cascade effects the plan didn't anticipate?

The verdict (PASS / PASS-WITH-DEBT / FAIL) should reflect the answer to all three, not just the first.

---

---

## Basic Usage

```bash
# Standard command execution
/wbReview frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbReview deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbReview` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbReview target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbReview target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbReview target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbReview packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbReview apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbReview` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbReview frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

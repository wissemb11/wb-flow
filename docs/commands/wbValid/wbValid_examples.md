# /wbValid — Examples

> Annotated transcripts. Same shape as the `examples` file for any other command.

---

## Example 1 — `/wbValid plan_wb-core_20260503.md` (status check)

**User:** `/wbValid plan_wb-core_20260503.md`

**Agent does:** reads the plan, lists tasks where `Done` is `✅` but `Valid` is `⬜`. No mutations.

**Output:**

```
Plan: plan_wb-core_20260503.md

Done-but-not-Valid:
 - Task 2 (Add version getter) worker: claude-sonnet-4-6
 - Task 4 (Update README badges) worker: claude-sonnet-4-6
 - Task 6 (Memoize computed prop) worker: deepseek-v4-pro

3 tasks pending validation.
Suggested: /wbValid plan_wb-core_20260503.md *
```

**What to notice:** different worker models per task. The validator can use a single model to validate all three (good — adversarial against each); using the same models that wrote them would defeat the purpose.

---

## Example 2 — `/wbValid plan_wb-core_20260503.md --id=2` (PASS)

**User (with the AI agent selected):** `/wbValid plan_wb-core_20260503.md --id=2`

**Agent does:**
1. Reads `tasks/task_2/task_2_report_wb-core_<YYYYMMDD>.md` (worker's claim).
2. Opens `packages/wb-core/src/WBCore.js`, finds the getter.
3. Verifies it reads from `package.json` per the plan's contract.
4. Appends to the report:

```markdown
## ✅ Validation by claude-opus-4-7 — 2026-05-03 14:32

PASS. Verified at src/WBCore.js:42-58. The getter:
- Reads package.json at module load time (not on each access — appropriate for a version)
- Returns the `version` string field
- Handles missing package.json gracefully (returns "0.0.0-unknown")

The "graceful fallback" behavior is beyond the plan's contract but
reasonable. No change requested.
```

5. Updates the plan's `Valid` cell for row 2 → `✅<br>claude-opus-4-7`.

**What to notice:** the validator names a behavior beyond the contract (the fallback) and explicitly notes it as acceptable. This is the kind of nuance you don't get from a binary CI check.

---

## Example 3 — `/wbValid plan_wb-core_20260503.md --id=4` (FAIL)

**User:** `/wbValid plan_wb-core_20260503.md --id=4`

**Agent does:**
1. Reads `tasks/task_4/task_4_report_wb-core_<YYYYMMDD>.md`. Worker claims README badges added.
2. Opens `packages/wb-core/README.md`, sees badges added.
3. Opens the plan row 4 — contract says: *"Add npm version, license, and CI badges in this order."*
4. Sees the actual order is: license, npm version, CI. Worker's claim ("badges added") is true; the order is wrong.
5. Appends:

```markdown
## ❌ Validation by claude-opus-4-7 — 2026-05-03 14:35

FAIL — wrong badge order.

Plan contract: "npm version, license, CI" (in that order).
Actual: "license, npm version, CI"

Worker's claim ("3 badges added") is technically true. The order is
not. This is the kind of small difference that downstream automation
(badge-screenshot tooling, README-quality linters) would catch.

Action: re-run /wbWork plan_wb-core_20260503.md --id=4 to fix the order.
The worker's report has been preserved; both attempts will be visible.
```

6. Resets plan row 4: `Done` cell → `⬜`, `Valid` cell stays `⬜`.

**What to notice:** the validator caught a precision failure that "pass-by-vibes" review would miss. The fix path is explicit. The original worker report stays untouched above the FAIL note.

---

## Example 4 — `/wbValid plan_X.md *` (validate all done-but-not-valid)

**User:** `/wbValid plan_X.md *`

**Agent does:** finds every row with `Done=✅` and `Valid=⬜`, validates each in `#` order. For 3 such tasks, that's 3 inspections, 3 appended verdicts.

**Output (summary):**

```
Validation summary for plan_X.md:
 Task 2: ✅ PASS
 Task 4: ❌ FAIL — see report for fix instructions
 Task 6: ✅ PASS

2 PASSED, 1 FAILED. Plan updated:
 - Tasks 2, 6: Valid → ✅<br>claude-opus-4-7
 - Task 4: Done reset to ⬜
 
Next: /wbWork plan_X.md --id=4
```

**What to notice:** mixed results in one batch. The plan reflects each outcome independently — task 4's failure doesn't block 2 and 6 from being validated.

---

## Example 5 — Attempting to re-validate a `✅ Valid` task

**User:** `/wbValid plan_X.md --id=2` (task 2 is already `Valid=✅`).

**Agent does:** reads the plan row, sees `Valid=✅`, refuses.

**Output:**

```
Task 2 is already validated by claude-opus-4-7 (2026-05-03 14:32).
Re-validation refused — validated work is frozen.

If you really want to re-validate, manually reset the plan row's
Valid cell from ✅<br>claude-opus-4-7 back to ⬜, then re-invoke.
```

**What to notice:** the refusal is opinionated. The system trusts validated work; if you want to override, you do it explicitly.

---

## Example 6 — The dialectic in action (multiple validators)

**Setup:** Task 8 is `Done` (worker: the agent). You run `/wbValid` with the agent, it PASSes. A teammate, suspicious, runs `/wbValid` again with the agent.

**The report after both validations:**

```markdown
# Task 8: Implement adapter for new wb-press v3 API

[worker's original report]

## ✅ Validation by claude-opus-4-7 — 2026-05-03 14:32
PASS — adapter signature matches the spec at src/wb-press/api/v3.ts.

## ❌ Validation by gemini-3.1-pro — 2026-05-03 16:08
FAIL — adapter signature matches v3, but the v3 API requires async error
handling on the connect() call. The current implementation throws
synchronously, which will surface as unhandled rejections in production.

Disagreement with claude-opus-4-7's PASS: opus inspected the signature
match but did not inspect runtime error semantics. Both inspections are
correct; the contract requires both.

Action: see plan row 8 — Done reset, validation downgraded to FAIL.
```

**What to notice:** the system handles the disagreement gracefully. Plan row 8's `Valid` reverts to `⬜` because *the latest validator's verdict wins*, but both verdicts stay in the report. Future readers see the dialectic.

This is the strongest validation pattern: two validators from different vendors, with the disagreement preserved.

---

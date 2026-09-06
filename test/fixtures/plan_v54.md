---
type: 🧠 Planner
emits: mixed
scope: deployement/packages/wb-flow/next/
date: 2026-09-04
---

# Plan Backlog: next — 2026-09-04

> **Target:** [next/](../../../../../../../)
> **Origin Command:** `/wbPlan deployement/packages/wb-flow/next/ --task="R1: anchor REFUSAL_GREP_PATTERN and add a negative control proving a permissions-related task is not scored REFUSED" --no-plan-update`
> **Source:** [review_next_20260904.md](../reviews/review_next_20260904.md) R1
> **Model:** Opus 4 complex · **Client:** Codex · **Time:** 2026-09-04 14:17 CET
> **Status:** ✅ CLOSED (All tasks completed & validated) — 2/2 done and independently validated. `npm test` green; lint **9/9** on this plan and on the closed 09/03 plan.

> [!NOTE]
> This plan is intentionally scoped to the new R1 follow-up only. Prior `next/` plans were scanned; the only carried row is a malformed-table cancellation record from 2026-09-02 that the linter still sees as open. `--no-plan-update` means the originating review matrix is left untouched.

---

## 📋 Executive Summary

R1 found that `REFUSAL_GREP_PATTERN` is unanchored in [wave_constants.js](../../../../../../../core/bin/wave_constants.js), while its only consumer in [wave_generator.js](../../../../../../../core/bin/wave_generator.js) treats any sandboxed output match as `VERDICT: REFUSED`. That currently catches genuine permission/tool refusal lines, but it also matches normal task prose that discusses permissions, sandbox mode, approvals, or refused tool calls.

The fix is a narrow source-and-test change: make the refusal pattern line-scoped or marker-scoped enough that ordinary task text cannot trip it, and add a negative control in the wave module tests proving a permissions-related task is not scored `REFUSED`.

## 🎛️ Active Model Roster

> 🧠 **Planner:** `anthropic/claude-opus-5 || openai/gpt-5.6-sol || gemini-3.1-pro-high || opencode/deepseek-v4-pro`
> ✅ **Validator:** `openai/gpt-5.6-terra || anthropic/claude-sonnet-5 || gemini-3.1-pro-high || opencode/minimax-m3`
> 🔨 **Worker:** `openai/gpt-5.5 || anthropic/claude-fable-5 || gemini-3.1-pro-high || opencode/kimi-k2.7-code`
> 📋 **Mechanical:** `gemini-3.6-flash-high || openai/gpt-5.6-luna || anthropic/claude-haiku-4-5-20251001 || opencode/deepseek-v4-flash`

```bash
P=deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md
PLANNER=anthropic/claude-opus-5,openai/gpt-5.6-sol,gemini-3.1-pro-high,opencode/deepseek-v4-pro
VALIDATOR=openai/gpt-5.6-terra,anthropic/claude-sonnet-5,gemini-3.1-pro-high,opencode/minimax-m3
WORKER=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high,opencode/kimi-k2.7-code
MECHANICAL=gemini-3.6-flash-high,openai/gpt-5.6-luna,anthropic/claude-haiku-4-5-20251001,opencode/deepseek-v4-flash
```

> ⚠️ `$WORKER[0]` and `$VALIDATOR[0]` are both OpenAI/ChatGPT-pool models, so the paired validation below pins `anthropic/claude-sonnet-5` for cross-provider review.

> ⚠️ **One row was removed by the orchestrator on absorption review.** The generating worker copied the `🚫 Cancelled` row 2 of [plan_next_20260903.md](../../03/plans/plan_next_20260903.md) into this file. Per `_shared/output_conventions.md` §13.2, `🚫 Cancelled` and `⏸️ Deferred` rows are **decided, not open**, and stay in the plan that decided them — absorbing one duplicates a closed record into a fresh backlog. Its subject (a 2026-09-02 verifier defect) is unrelated to R1.


> ✅ **The known-red note is retired.** This plan shipped failing `lint` step-0 by design — it reported *"open row 27 … is not absorbed"* for a `🚫 Cancelled` row that `splitRow()` mis-parsed. **Row 2 fixed the parser and step-0 now passes**, so the gate is green without anyone absorbing a decided row into a live backlog.

## 🧭 Proposed Changes

1. In [wave_constants.js](../../../../../../../core/bin/wave_constants.js), replace the unanchored refusal regex with an anchored pattern that matches actual refusal/status lines rather than arbitrary prose.
2. In [wave_modules.js](../../../../../../../core/test/wave_modules.js), add a negative control for permissions-related task text that mentions sandbox, permission bypass, approval, and `REFUSED`, and assert it is not classified by `REFUSAL_GREP_PATTERN`.
3. Keep the existing positive controls: genuine permission/tool denial output must still classify as a refusal, and sandboxed dispatches must still produce a `VERDICT: REFUSED` path.

## 📊 Task Table

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [1](tasks/task_1/task_1_report_next_20260904.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=1 --as=expert">📄</span> | **Anchor `REFUSAL_GREP_PATTERN` and add the negative control from R1.** Update `core/bin/wave_constants.js` so sandbox refusal matching is line-anchored or marker-scoped, not a broad prose grep. Extend `core/test/wave_modules.js` with positive refusal samples and a negative control proving a permissions-related task/output sentence is not scored `REFUSED`. Do not weaken sandbox behaviour: actual permission/tool denial still exits through the `REFUSED` verdict path. | `cd ../../../../../../../core && node -e "const fs=require('fs');const c=require('./bin/wave_constants.js');const re=new RegExp(c.REFUSAL_GREP_PATTERN,'i');const yes=['G1: REFUSED - sandboxed dispatch could not proceed without permission bypass','ERROR: permission denied for this tool','Tool use blocked - approval required'];const no=['Task: add sandbox docs; permission bypass flags are omitted; refused tool calls score REFUSED','Do not block the override; emit a warning when operator permission is required','Approval is required before publishing, per the plan trust model'];for(const s of yes){if(!re.test(s))throw new Error('missed refusal: '+s)}for(const s of no){if(re.test(s))throw new Error('false refusal: '+s)}const src=fs.readFileSync('test/wave_modules.js','utf8');if(!/permissions-related task.*not.*REFUSED/i.test(src)&&!/not scored REFUSED/i.test(src))throw new Error('negative control test missing')" && node test/wave_modules.js && npm test >/dev/null 2>&1` | P1 | 30 | $WORKER · ~$0.06 *(chain head estimate)* | $VALIDATOR · ~$0.18 *(chain head estimate; matrix pins cross-provider)* | ✅<br>openai/gpt-5.5 | ✅ 10/10<br>anthropic/claude-sonnet-5 |
| [2](tasks/task_2/task_2_report_next_20260904.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=2 --as=expert">📄</span> | **`lint` `splitRow()` desynchronises on an odd backtick count, mis-reading a `🚫 Cancelled` row as open.** Found 2026-09-04 while auditing the worker that generated this plan — **the worker was not sloppy, it was obeying a broken gate.** [lint.js:76](../../../../../../../core/bin/lint.js) tracks `inBacktick` and refuses to split on `\|` inside backticks, which is correct in principle. Row 27 of [plan_next_20260902.md](../../02/plans/plan_next_20260902.md) contains **19 backticks — odd** — so the toggle never closes and the row's tail is mis-sliced: `parseTaskTable` returns `done: "⬜"` instead of `"🚫 Cancelled"`, and `valid` becomes a fragment of the `Verify` command. `isOpen()` is then correctly applied to incorrect data, so **step-0 demands a decided row be absorbed into every future plan in this scope, permanently.** ℹ️ **Scope measured, do not overstate it:** 1 row of 146 across the scope has an odd backtick count. Low incidence, but the effect does not expire. ⚠️ **This contradicts the standing claim that mis-columned rows are cosmetic** — `plan_next_20260903.md` row 6 argued P1-not-P0 because `wave_parser.js:228` reads Done positionally from the END and is *"immune to middle extras"*. That is true of `wave_parser`; it is **not** true of `lint`, whose backtick-aware splitter desyncs first. Fix `splitRow` to be resilient (balance-check, or fall back to a naive unescaped-pipe split when the backtick count is odd) **and** repair row 27's cell. ⛔ Do not fix only the data — the parser will meet another odd row. | `cd ../../../../../../../core && node -e "const fs=require('fs');const src=fs.readFileSync('bin/lint.js','utf8');eval(src.match(/function splitRow[\s\S]*?\n}\n/)[0]+src.match(/function parseTaskTable[\s\S]*?\n}\n/)[0]);const rows=parseTaskTable(fs.readFileSync('../.wb/workflows/reports/2026/09/02/plans/plan_next_20260902.md','utf8'));const r=rows.find(x=>x.id==='27');if(!r)throw new Error('row 27 not parsed');if(!/\u{1F6AB}/u.test(r.done))throw new Error('row 27 done still mis-parsed as '+JSON.stringify(r.done))" && node bin/lint.js ../.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md 2>&1 \| grep -q 'LINT OK'` | P2 | 25 | openai/gpt-5.5 · ~$0.08 | anthropic/claude-sonnet-5 · ~$0.09 | ✅<br>openai/gpt-5.5 | ✅ 10/10<br>anthropic/claude-sonnet-5 |

## 💰 Plan Budget Estimate

| Metric | Value |
|---|---|
| **Total rows** | 2 (1 work · 1 🚫 cancelled) |
| **Open tasks** | 1 |
| **Total estimated time** | 30 min (~0.5 h) |
| **Total estimated tokens** | ~15 kt |
| **Est. cost (fast model worker)** | ~$0.06 |
| **Est. cost (big thinker worker)** | ~$0.23 |
| **Est. validation pass (+30%)** | ~$0.07 |

*Token estimates are approximate. Actual usage varies with context window size, code complexity, and iteration count. Validation passes add ~30% to the worker token count.*


## 🌊 Next Executable Sequence

> **All tasks complete — nothing to schedule.**

> 📝 **Wave Notes & Collision Analysis:** See [waves.md](tasks/waves.md)

---

<!-- HOW_TO_RUN_START -->
## ▶️ How to run this plan

**One wave · 2 rows**, both from the 2026-09-04 review and its follow-up audit. Both oracles fail today, so neither is a tautology.

### 📋 Copy/Paste Execution Scenarios

#### 1. Next wave execution (with --wave flag — work + valid)
```bash
/wbWork deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --wave=A -y
```

#### 2. Next wave dispatches (without --wave flag — grouped by model)
```bash
/wbWork  deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --id=1,2 -M="openai/gpt-5.5"
/wbValid deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --id=1,2 -M="anthropic/claude-sonnet-5"
```

#### 3. All remaining waves execution (with --wave flag)
```bash
/wbWork deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --wave=all -y
```

#### 4. All remaining waves dispatches (without --wave flag)
```bash
/wbWork  deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --id=1,2 -M="openai/gpt-5.5"
/wbValid deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --id=1,2 -M="anthropic/claude-sonnet-5"
```

### Why not `--wave=all`

Only one wave exists, so they are equivalent. ⛔ **Do not route the validator to `openai/gpt-5.6-terra`** (the `$VALIDATOR` head): it shares the `chatgpt` pool with the worker, which is a same-provider validation.

### Flags

- `--jobs=4` is the default and must not be lowered to 0.
<!-- HOW_TO_RUN_END -->

---

## 🔗 Action Types

| Type | Meaning |
|---|---|
| 🧠 Planner | Produce a decision, ADR or plan. Output is recorded rationale, not a diff. |
| ✅ Validator | Verify, re-measure and score work against its stated oracle. |
| 🔨 Worker | Change product source or release configuration, tests kept green. |
| 📋 Mechanical | Run a command or edit records only; no product-source change. |

## 🧭 What's Next?

**Progress:** 2/2 tasks completed, 2/2 validated.

🔨 **Worker** — Run Wave A to anchor the refusal pattern and add the negative control. → `/wbWork deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --wave=A -y`

✅ **Validator** — After the worker report exists, validate with a cross-provider model pinned off the OpenAI worker head. → `/wbValid deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md --id=1 -M="anthropic/claude-sonnet-5"`

📋 **Mechanical** — Archive remains available for closed older plan folders, but was not run here. → `/wbPlan deployement/packages/wb-flow/next/.wb/workflows/reports/2026/09/03/plans/plan_next_20260903.md --archive --dry-run`

---

## 📂 Generated Files (20260904)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files

| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent identity and architecture |
| Foundational | [dev.md](../../../../../dev.md) | Permanent development commands and status |
| Active Plan | **plan_next_20260904.md** *(this file)* | Current executable backlog |
| Last Plan | [plan_next_20260903.md](../../03/plans/plan_next_20260903.md) | Previous closed plan |

<details>
  <summary>📄 Local Reports</summary>

| Category | File (2026-09-04) | File (2026-09-03) | Source Command |
|---|---|---|---|
| Reports | [review_next_20260904.md](../reviews/review_next_20260904.md) | [review_next_20260903.md](../../03/reviews/review_next_20260903.md) | `/wbReview` |
| Reports | [standup_next_20260904.md](../standups/standup_next_20260904.md) | — | `/wbStandup` |
| Reports | **plan_next_20260904.md** *(this file)* | [plan_next_20260903.md](../../03/plans/plan_next_20260903.md) | `/wbPlan` |
| Reports | — | [audit_next_20260903.md](../../03/audits/audit_next_20260903.md) | `/wbAudit` |
| Reports | — | [test_next_20260903.md](../../03/tests/test_next_20260903.md) | `/wbTest` |
| Notes | [waves.md](tasks/waves.md) | [waves.md](../../03/plans/tasks/waves.md) | collision analysis |

</details>

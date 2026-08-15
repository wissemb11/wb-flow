---
type: 🧠 Planner
emits: mixed
---

# Plan Backlog: wb-flow — 2026-08-09

> **Target:** [core/](../../../../../../../)
> **Status:** 🟢 OPEN (2 open — rows 2, 3 · 8 done, 6 validated · row 6 🚫 cancelled — premise disproved)
> **Mode:** Fresh-Plan — recursive sub-plan of [plan_wb-core_20260809.md](../../../../../../../../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/plans/plan_wb-core_20260809.md) row 14
> **Origin Command:** `/wbPlan deployement/packages/wb-flow/next/core "fix the three live wave/next defects and make the 7-point checklist executable"`
> **Source:** [standup_wb-core_20260809.md](../../../../../../../../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/standups/standup_wb-core_20260809.md) §B-1 · §B-2 · §B-3
> **Model:** Claude Opus 5 — *(Model1, 2026-08-09)*

---

## 🔍 Why this plan exists

Three defects in **this package** were found by wb-core's 08-09 plan (row 12, the Antigravity
re-audit) and have had **no owner in any scope** since — this package's `reports/` tree stopped at
2026-08-01. They are tooling defects, so every scope in the monorepo pays for them.

**The framework is currently lying about validation.** That is the whole reason this plan is P0.

### The defects, with evidence

| # | Defect | Evidence |
|---|---|---|
| **D1** 🔴 | `--wave=<L>` runs **work only** — the `validate` sub-row never dispatches | `bin/wave.js:195` sets `kind:'work'` as a *default*, so `subrowKind` is never falsy and `:387`'s `['work','validate']` branch is unreachable |
| **D2** | `wb-flow next` duplicates id lists, **miscounts Wave B cells (2 vs 1)**, and on a closed plan emits empty scenarios under a live "run this" preamble | row 11's validation, wb-core 08-09 |
| **D4** 🔴 | A merged `/wbValid --id=X,Y,Z` cell is routed from **one** id's executor and prints a false reason → **self-validation** | caught live 2026-08-09: `--id=13,15,16` routed to Claude with *"a non-Claude model executed all ids"*, but Claude executed row 15 |
| **D5** | **The `/wbPlan` template's prescribed CLOSED wording FAILS the shared sync oracle** | `wbPlan_template.md` (DYNAMIC "WHAT NEXT" §3) says a closed plan reports *`Progress: All 5/5 tasks completed & validated!`*, but `sync_check.sh` greps for `Progress: <D>/<T> tasks completed, <V>/<T> validated`. Following the template makes the oracle fail. Hit live 2026-08-09 closing `plan_wb-core_20260809.md` |
| **D6** 🔴 | **A roster change never reaches the dispatchers** — `wave.js` and `next.js` keep the old models, and they disagree with each other | measured 2026-08-09 23:5x: `next.js` emits `-M="opencode-go/deepseek-v4-pro"` for row 7 while `wave.js` routes the same cell to `codex Codex (auto)`; `wave.js` sends `--id=2,3,5` to `opencode-go/kimi-k2.7-code` citing *"plan header"*, a model absent from the header. **`opencode` is out of balance, so both dispatch into a dead lane** |
| **D3** | **Nothing enforces the 7-point self-correct checklist** — it is documented and unexecuted | `sync_check.sh` contains **zero** references to it |

### D1 is confirmed three times over, twice by direct measurement

1. Row 12's audit named `wave.js:195` as the cause (`8c` 🔴 BROKEN).
2. **2026-08-09, packages scope** — `/wbWork … --wave=A -y` dispatched `wbWork 1,2,3,5` and **zero**
   validate cells.
3. **2026-08-09, wb-core scope** — the generated `wave_A_wb-core.sh` was audited before running:
   `grep -c wbValid` → **0**.

`_shared/output_conventions.md` §10.2 rule 13 states the opposite: *"Running `--wave=A` sequentially
executes `--wave=A.work` followed by `--wave=A.valid`."*

> ⚠️ **Consequence to state plainly:** every `--wave` run in this repo's history validated nothing
> unless a human dispatched `/wbValid` by hand. Plans' `☐ Valid` columns are systematically emptier
> than their authors believed — and a wave that reports success while skipping validation is a
> hollow-pass generator at the framework level.

---

## 📋 Task Table

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [1](tasks/task_1/task_1_report_wb-flow_20260809.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=1 --as=expert">📄</span> | **🔴 P0 — D1: make `--wave=<L>` expand to `work` + `validate`.** `bin/wave.js:195` initialises `kind:'work'` in `parseArgs`' defaults. `:387` reads `const targetKinds = subrowKind ? [...] : ['work','validate']` — with a non-null default, the else branch is **dead code**. Fix: default `kind` to `null` (or introduce a separate `explicitKind` flag set only when the user writes `--wave=A.work` / `A.valid`), so an unqualified `--wave=A` reaches `['work','validate']`. **Preserve** the explicit forms: `--wave=A.work` and `--wave=A.valid` must still narrow to one sub-row, and `--wave=A:W` role-narrowing must be unaffected. **Fail-first is mandatory:** record the current `grep -c wbValid` on a generated script (**0**) before the change, and after. | `cd ../../../../../../../ && ! grep -qE "kind: *'work'" bin/wave.js && R=.wb/workflows/reports/2026/08/09/plans/tasks/task_1/task_1_report_wb-flow_20260809.md && test -f "$R" && grep -qiE "fail.first\|before:" "$R"` | **P0** | 40 | opencode-go/deepseek-v4-pro · ~$0.10 / opencode-go/kimi-k2.7-code · ~$0.10 / Model1 | Claude Opus 5 · ~$0.20 / opencode-go/kimi-k2.7-code · ~$0.08 / Validator1 | ✅<br>opencode-go/deepseek-v4-pro | ✅ 9/10<br>Claude Opus 5 |
| [2](tasks/task_2/task_2_report_wb-flow_20260809.md) | ✅ Validator | 1 | <span title="Run: /wbExplain --id=2 --as=expert">📄</span> | **Prove D1's fix at runtime, not by reading the diff.** Generate a wave script for a plan with **both** sub-rows populated and assert: **(a)** the script contains at least one `wbValid` dispatch; **(b)** `--wave=A.work` still yields **0** validate cells; **(c)** `--wave=A.valid` yields **only** validate cells; **(d)** `--wave=A:W` still narrows to the Worker column. ⚠️ **A grep proving the code changed is NOT the verdict** — that is exactly how the original defect survived nine change-sets. Run the generator four times and diff the outputs. _Validation cleared 2026-08-10: re-review after the new harness fixes land ([review_wb-flow_20260810.md](../../10/reviews/review_wb-flow_20260810.md))._ | `R=tasks/task_2/task_2_report_wb-flow_20260809.md; test -f "$R" && [ "$(grep -cE '^\\\|.*(a\\\|b\\\|c\\\|d)\\\)' "$R")" -ge 4 ] && grep -qiE 'PASS\\\|FAIL' "$R"` | **P0** | 30 | Claude Opus 5 · ~$0.25 / opencode-go/kimi-k2.7-code · ~$0.10 / Validator1 | Codex (auto) · ~$0.10 / Validator2 | ✅<br>Claude Opus 5 | ❌ 4/10<br>Codex (auto) |
| [3](tasks/task_3/task_3_report_wb-flow_20260809.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=3 --as=expert">📄</span> | **D2 — `bin/next.js`: three output defects.** **(a)** duplicated id lists in the risk text (`:309` builds `--id=` from `entry.ids.join(',')`; the same ids are re-emitted elsewhere); **(b)** **Wave-cell miscount** — `:98` computes `spawned` by filtering `route.lane !== 'claude'`, but `:334` prints `w.cells` and `w.spawned` from different derivations, so a wave with one spawned cell can report 2; **(c)** on a **closed** plan it emits empty scenario blocks under a live "run this" preamble — it must print a single "nothing to dispatch" line instead. Fix all three; each needs its own assertion. _Validation cleared 2026-08-10: re-review after the new harness fixes land ([review_wb-flow_20260810.md](../../10/reviews/review_wb-flow_20260810.md))._ | `cd ../../../../../../../ && R=.wb/workflows/reports/2026/08/09/plans/tasks/task_3/task_3_report_wb-flow_20260809.md; test -f "$R" && [ "$(grep -cE "\\(a\\)\|\\(b\\)\|\\(c\\)" "$R")" -ge 3 ] && grep -qiE "fail.first\|before:" "$R" && node bin/next.js ../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/plans/plan_wb-core_20260809.md --json \| node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);process.exit(j.waves.some(w=>w.spawned>w.cells)?1:0)})"` | P1 | 45 | opencode-go/deepseek-v4-pro · ~$0.14 / opencode-go/kimi-k2.7-code · ~$0.14 / Model1 | Codex (auto) · ~$0.10 / Validator1 | ✅<br>kimi-k2.7-code → Claude Opus 5 | ❌ 6/10<br>Codex (auto) |
| [4](tasks/task_4/task_4_report_wb-flow_20260809.md) | 🧠 Planner | — | <span title="Run: /wbExplain --id=4 --as=expert">📄</span> | **D3 — decide HOW to enforce the 7-point self-correct checklist; change no behaviour.** `sync_check.sh` is the only executable oracle in `_shared/` and mentions the checklist **zero** times. Decide between: **(i)** extend `sync_check.sh` with 7 more checks (one script, one entry point, but it already conflates "is this plan self-consistent" with "was self-correct run properly"); **(ii)** a sibling `selfcorrect_check.sh` invoked by the `/wbPlan` template's step 5; **(iii)** fold the points into `wb-flow` as a real subcommand (`wb-flow lint <plan.md>`) so it is callable outside a template. **Also fold in D5**: the template's own CLOSED wording (*`Progress: All N/N tasks completed & validated!`*) is rejected by `sync_check.sh`, which requires `Progress: <D>/<T> tasks completed, <V>/<T> validated`. Decide which is canonical and make the other conform — a template instruction that fails the repo's own oracle is the same defect class as an unenforced checklist. Weigh: which points are even machine-checkable? Write `_meta/adr_selfcorrect_enforcement.md` with the decision and a per-point checkable/not-checkable table. **Decide, do not implement** — row 5 implements. | `test -f ../../../../../../../_meta/adr_selfcorrect_enforcement.md && [ "$(grep -cE '^\\\| *[0-9]' ../../../../../../../_meta/adr_selfcorrect_enforcement.md)" -ge 7 ]` | P1 | 35 | Claude Opus 5 · ~$0.35 / opencode-go/kimi-k3 · ~$0.35 / Model1 | Claude Opus 5 · ~$0.12 / Validator1 | ✅<br>Claude Opus 5 | ✅ 9/10<br>Claude Opus 5 |
| [5](tasks/task_5/task_5_report_wb-flow_20260809.md) | 🔨 Worker | 4 | <span title="Run: /wbExplain --id=5 --as=expert">📄</span> | **Implement row 4's decision — make the machine-checkable points fail loudly.** Each new check must be **mutant-proved in both directions**: break the thing it guards and watch it turn red; restore and watch it turn green. Record both runs in the report. Points row 4 classifies as not machine-checkable stay documented as such — **do not fake a check that always passes**, which is exactly the hollow shape this whole plan is about. _Validation cleared 2026-08-10: re-review after the new harness fixes land ([review_wb-flow_20260810.md](../../10/reviews/review_wb-flow_20260810.md))._ | `R=tasks/task_5/task_5_report_wb-flow_20260809.md; test -f "$R" && grep -qi 'mutant' "$R" && [ "$(grep -cE 'red\\\|green\\\|RED\\\|GREEN' "$R")" -ge 2 ]` | P1 | 50 | opencode-go/deepseek-v4-pro · ~$0.16 / opencode-go/kimi-k2.7-code · ~$0.16 / Model1 | Codex (auto) · ~$0.18 / Validator1 | ✅<br>deepseek-v4-pro → Claude Opus 5 | ✅ 10/10<br>Codex (auto) |
| 6 | 📋 Mechanical | — | <span title="Run: /wbExplain --id=6 --as=expert">📄</span> | **🚫 CANCELLED 2026-08-09 — the contradiction does not exist.** *(premise disproved during row 14's validation)* This row came from row 12's audit finding #9, which cited `wbPlan_template.md:362` vs `:430`/`:700`. **Checked all three:** `:430` is a path spec, `:700` is the task re-run rule — neither mentions block ordering. The only surviving *"immediately before `## 🧭 What's Next?`"* text in the whole corpus is [output_conventions.md:645](../../../../../../../templates/commands/_shared/output_conventions.md), and it is the **supersession note that already resolves it**. The audit cited **stale line numbers** — the exact failure mode recorded in `[[project_ui3_vue2_leftover_predicates]]` (*don't cite line numbers in reports*). Nothing to fix. | `cd ../../../../../../../ && ! grep -nE 'immediately before .*What.s Next' templates/commands/wbPlan/wbPlan_template.md` | P2 | 20 | opencode-go/qwen3.7-plus · ~$0.03 / opencode-go/deepseek-v4-flash · ~$0.03 / Model1 | opencode-go/kimi-k2.7-code · ~$0.03 / Validator1 | 🚫 Cancelled | 🚫 Cancelled |
| [7](tasks/task_7/task_7_report_wb-flow_20260809.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=7 --as=expert">📄</span> | **🔴 D4 — `route()` classifies a merged `/wbValid` cell from ONE id and prints a FALSE reason, silently producing a self-validation.** Caught live 2026-08-09 on [plan_wb-core_20260809.md](../../../../../../../../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/plans/plan_wb-core_20260809.md): the cell `/wbValid --id=13,15,16` resolved to **`claude (in-session)`** with the reason *"Done column says a non-Claude model executed all ids"*. That reason is **false** — rows 13 and 16 were executed by Qwen 3.7 Plus but **row 15 was executed by Claude Opus 5**, so the route made Claude validate its own work. `_shared/output_conventions.md` §3 step 4 already predicts this exact failure (*"route() classifies a merged validate cell from one id and applies that verdict to the whole batch, which silently produces a self-validation"*) — it was documented as a hazard and never guarded. **Fix:** when a `/wbValid` cell carries multiple ids, resolve the executor set across **every** id; if the chosen validator appears in that set, either (a) pick a validator absent from it, or (b) refuse to merge and emit one cell per distinct executor. **The printed reason must quantify honestly** — "no id was executed by X", never "all ids" derived from one sample. ⚠️ **Fail-first:** reproduce the false reason on the wb-core plan above before changing anything, and record the exact string. _Validation cleared 2026-08-10: re-review after the new harness fixes land ([review_wb-flow_20260810.md](../../10/reviews/review_wb-flow_20260810.md))._ | `cd ../../../../../../../ && R=.wb/workflows/reports/2026/08/09/plans/tasks/task_7/task_7_report_wb-flow_20260809.md; test -f "$R" && grep -q "executed all ids" "$R" && grep -qiE "fail.first\|before:" "$R" && node bin/wave.js ../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/plans/plan_wb-core_20260809.md --wave=A --list 2>&1 \| grep -A1 "id=13,15,16" \| tail -1 \| grep -qv "claude"` | **P0** | 40 | Codex (auto) · ~$0.10 / Claude (auto) · ~$0.10 / Model1 | Claude (auto) · ~$0.15 / Codex (auto) · ~$0.15 / Validator1 | ✅<br>Claude Opus 5 | ✅ 10/10<br>Codex (auto) |
| [8](tasks/task_8/task_8_report_wb-flow_20260809.md) | 📋 Mechanical | — | <span title="Run: /wbExplain --id=8 --as=expert">📄</span> | **D5 — the template's prescribed CLOSED wording FAILS the shared sync oracle.** `wbPlan_template.md:812` tells the agent to report `Progress: All 5/5 tasks completed & validated!`, but [sync_check.sh](../../../../../../../templates/commands/_shared/sync_check.sh) requires `Progress: <D>/<T> tasks completed, <V>/<T> validated`. **An agent that follows the template makes the oracle fail** — the two shipped artifacts contradict each other, so closing a plan correctly per the template guarantees a red oracle. Verified live 2026-08-09 closing [plan_wb-core_20260809.md](../../../../../../../../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/plans/plan_wb-core_20260809.md). **Fix the template, not the oracle:** the oracle's form is the one every open plan already uses, and it carries the done/valid counts separately. Sweep the whole corpus for the incompatible wording — `:812` is unlikely to be its only instance. ⚠️ **Fail-first:** write a closed-plan progress line in the template's form, run `sync_check.sh` on it, and record the RED before changing anything. | `cd ../../../../../../../ && ! grep -q "tasks completed & validated!" templates/commands/wbPlan/wbPlan_template.md && R=.wb/workflows/reports/2026/08/09/plans/tasks/task_8/task_8_report_wb-flow_20260809.md && test -f "$R" && grep -qiE "fail.first\|before:" "$R"` | P2 | 20 | opencode-go/qwen3.7-plus · ~$0.03 / opencode-go/deepseek-v4-flash · ~$0.03 / Model1 | Claude (auto) · ~$0.03 / Validator1 | ✅<br>opencode-go/qwen3.7-plus | ✅ 10/10<br>Claude Opus 5 |
| [9](tasks/task_9/task_9_report_wb-flow_20260809.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=9 --as=expert">📄</span> | **🔴 P0 — D6: a roster change does not reach the dispatchers.** Changing the roster (via `/wbModel` or `wb-flow model`, which writes `model_recommendations.md`) leaves `bin/wave.js` and `bin/next.js` dispatching to the **old** models. Two independent symptoms, both measured 2026-08-09 23:5x after the roster moved to `Claude/Codex`: **(a)** `next.js` emits `-M="opencode-go/deepseek-v4-pro"` for row 7 while `wave.js` routes the very same cell to `codex Codex (auto)` — two tools, one plan, one cell, different executors, and the copy/paste block is the one a human follows; **(b)** `wave.js` routes `/wbValid --id=2,3,5` to `opencode opencode-go/kimi-k2.7-code` and labels the source *"plan header"*, but that model appears **nowhere** in the plan header — it is the hardcoded `DEFAULT_MODELS.selfValidator`. **This is not cosmetic: `opencode` is out of balance, so both paths dispatch into a dead lane** — and it returns **exit 0**, so Gate 1 cannot see it. Fix: resolve executor models from the active roster (plan header → `model_recommendations.md` → built-in) in **one** shared function used by both files; `DEFAULT_MODELS` becomes the last resort, not the first answer. ⚠️ **Fail-first:** record both mismatches before changing anything. ⚠️ **Antigravity is rostered again and 1st for Mechanical; verify its cells by artifact mtime, not gate colour, because a no-op can return exit 0 and score as PASS.** **3rd symptom, measured 2026-08-10 by the orchestrator:** `wave --list` and the **generated script disagree about the same cell.** For Wave A's validate cell (`--id=2,3,5`), `--list` prints `→ opencode opencode-go/kimi-k2.7-code · plan header`, but `wave_A_wb-flow.sh` emits `CHAIN=Codex (auto)` / `-m 'Codex (auto)'` for it. `kimi-k2.7-code` is in **neither** the roster nor the plan header — so `--list` is reading a third, stale source. Whichever is right, **the preview a human approves is not what runs**, which makes the confirm-before-spawning gate meaningless. Add an assertion that `--list` and the generated script name the same model for every cell. _Validation cleared 2026-08-10: re-review after the new harness fixes land ([review_wb-flow_20260810.md](../../10/reviews/review_wb-flow_20260810.md))._ | `cd ../../../../../../../ && R=.wb/workflows/reports/2026/08/09/plans/tasks/task_9/task_9_report_wb-flow_20260809.md; test -f "$R" && grep -qiE "fail.first\|before:" "$R" && ! node bin/next.js .wb/workflows/reports/2026/08/09/plans/plan_wb-flow_20260809.md 2>/dev/null \| grep -q "opencode-go/"` | **P0** | 35 | Codex (auto) · ~$0.15 / Claude (auto) · ~$0.20 / Model1 | Claude (auto) · ~$0.18 / Validator1 | ✅<br>Claude Opus 5 | ✅ 10/10<br>Codex (auto) |


## 🌊 Next Executable Sequence

> **Active Model Roster for this Plan:** — **migrated 2026-08-09 23:24** from the opencode roster
> 🧠 **Planner:** `Claude (auto) || Codex (auto)`
> ✅ **Validator:** `Claude (auto) || Codex (auto)`
> 🔨 **Worker:** `Codex (auto)`
> 📋 **Mechanical:** `Codex (auto) || Claude (auto)`
>
> ⚠️ **Antigravity is rostered again and is 1st for Mechanical.** Its cells require verification by
> artifact mtime, not gate colour: a no-op can return exit 0 and score as PASS. The tooling does not
> make that distinction automatically, so inspect the required report artifact and its mtime.
>
> ⚠️ **The old roster is not merely stale — it cannot run.** `opencode` is **out of balance**:
> ```
> $ opencode run -m opencode-go/kimi-k2.7-code 'reply with exactly: PONG'
> Error: Insufficient balance.        # ← and it exits 0
> ```
> Every `opencode-go/*` assignment in this plan's history is therefore dead. `codex` was probed at the
> same time and answered normally, which is why it takes the Worker lane.

> ✅ **Row 1 landed 2026-08-09 — `--wave=<L>` now expands to `work` + `validate`.** Re-measured on this
> plan after the fix: `--wave=A` → 3 work + 2 validate cells (was 4 work + **0** validate);
> `--wave=A.work` → 0 validate; `--wave=A.valid` → validate only; `--wave=A:W` → Worker column only.
> The ✅ cells below no longer need dispatching by hand.

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A · ✅ validate** | — | `/wbValid deployement/packages/wb-flow/next/core/.wb/workflows/reports/2026/08/09/plans/plan_wb-flow_20260809.md --id=2,3 -M="Codex (auto)"`<br>→ *Codex (auto)* *(⏱️ 75 min)*<br><sub>Rows 2 and 3 remain scheduled because their latest validations are FAILING.</sub> | — | — |
> 📝 **Wave Notes & Collision Analysis:** See [waves.md](tasks/waves.md)



<!-- HOW_TO_RUN_START -->
## ▶️ How to run this plan

> Generated by `wb-flow next` — **derived from this plan**, not authored. Regenerate after
> every edit: a hand-written run-book goes stale the moment a task changes wave, and a stale
> one tells you to dispatch something that is now blocked.

| Wave | Cells | Spawned | Est. | Nature |
|---|---|---|---|---|
| **A** | 1 | 1 | — | **go/no-go gate** |


### Why not `--wave=all`

- **Wave A is a gate, not a step** — task 2, 3 exists so a human decides whether to continue.

The template rule behind all of these: *a half-failed wave makes the next wave meaningless.*

**This is a refusal with an alternative, not a dead end.** Scenario 3 above already carries the closest safe equivalent: the same waves, in the same order, one `--wave=<label>` per line, with a `⏸` pause line before each wave that produced a bullet here. Run it top to bottom and stop at the pauses — that is `--wave=all` minus the part that makes it unsafe.

> ⚠️ One command per wave. `--wave=` takes a **single** label — `--wave=C,D` is parsed as the literal label `C,D`, matches no row, and exits non-zero.

### Flags

- `--summary` is **already the default** in wave mode. Add `--no-summary` only when
  debugging one cell — the full stream costs orchestrator context, once per cell.
- `--sessions` buys little here — no wave spawns enough cells to amortise a warm session.
- `--snap` / `--snap-copy` on any run you want to find again.
<!-- HOW_TO_RUN_END -->

---

## 🔗 Action Types

> Tags used in the `Requires` column. See [The Logic](../../../../../../../templates/commands/model_recommendations.md#the-logic) for canonical definitions and current model picks.

- 🧠 **Planner** — Deep reasoning, strategy, multi-step decomposition
- ✅ **Validator** — Big-thinker code-quality judgment, scoring
- 🔨 **Worker** — Coder/executor: code generation, file edits
- 📋 **Mechanical** — Run command, read output, format report

---

## 🧭 What's Next?

**Progress: 8/8 tasks completed, 6/8 validated.** *(row 6 🚫 cancelled · rows 2 and 3 remain open after failing re-validation)*

Status is 🟢 **OPEN**. Rows 2 and 3 require re-validation; every other active row is genuinely closed.

- ✅ **Validator** — Re-validate rows 2 and 3 after their failing scores. → `/wbValid $P --id=2,3 -M="Codex (auto)"`

**Roster migrated 2026-08-09 23:24 — and it was forced, not preferred.** `opencode` returns
`Error: Insufficient balance` (**at exit 0**), so every `opencode-go/*` assignment in this plan is
dead. `codex` was probed at the same moment and answered normally, so it takes the Worker lane and the
non-Claude Validator slots. Closed rows keep their original `Worker (Suggested)` values as the
historical record of what actually ran; only the open row (7) was re-routed.

⚠️ **Antigravity is rostered again and 1st for Mechanical.** Verify its cells by artifact mtime, not
gate colour, because a no-op can return exit 0 and score as PASS.

**One latent self-validation was fixed by the migration.** Row 5's `Validator (Suggested)` read
`Claude Opus 5` while Claude is also what finished row 5 — validating it as suggested would have been
a self-validation on a 🔨 Worker row, which has no Planner exemption. It is now `Codex (auto)`.

**Row 7 got larger, not smaller.** Two independent confirmations of D4 were found while running this
wave, both wider than the plan's original description:

1. `route()` prints *"pairs a 🧠 Planner row — Planner rows may be self-validated"* for `--id=3,8` and
   `--id=7`. Rows 3 and 7 are `🔨 Worker`; row 8 is `📋 Mechanical`. **None is a Planner row** — the
   false reason is emitted for whole classes of row, and it routes them to Claude, producing
   self-validation silently.
2. `route()` ignores the plan's own `Validator (Suggested)` column and substitutes the
   `model_recommendations.md` default chain, which resolves to `Codex (auto) || Antigravity (auto)`.
   Antigravity is now trusted and rostered again. Plans that pin a validator are unaffected; plans
   that don't inherit a banned fallback.

**Debt this plan repays:** every `--wave` run before today dispatched work without validation. That is
fixed and proved at runtime. The `☐ Valid` columns of *existing* plans remain unfilled — those
validations were never run — and backfilling them is a separate exercise, still not in scope here.

**Infrastructure note (2026-08-09 23:20):** the `opencode` worker lane stopped responding mid-wave. A
trivial `opencode run -m opencode-go/kimi-k2.7-code 'reply with exactly: PONG'` did not return within
90 s. Two cells on two different models died to it; rows 3 and 5 were completed in-session instead.
Re-probe before dispatching row 7.

Run [`/wbNext deployement/packages/wb-flow/next/core/`](../../../../../../../) for the ranked list.

---

## 📂 Generated Files (2026-08-09)

> Auto-appended per `_shared/output_conventions.md` §5.

### 📚 Base Reference Files

| Type | File | Description |
|---|---|---|
| Parent Plan | [plan_wb-core_20260809.md](../../../../../../../../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/plans/plan_wb-core_20260809.md) | Row 14 — the row that commissioned this sub-plan |
| Source | [standup_wb-core_20260809.md](../../../../../../../../../../../../frontEnd/wbc-ui3/packages/wb-core/.wb/workflows/reports/2026/08/09/standups/standup_wb-core_20260809.md) | Where D1–D3 were surfaced |
| Last Plan | [plan_wb-flow_20260801.md](../../01/plans/plan_wb-flow_20260801.md) | Previous plan in this scope |
| Last Release | [release_wb-flow_20260801.md](../../01/releases/release_wb-flow_20260801.md) | Previous release report |

<details>
  <summary>📄 Local Reports — <code>wb-flow/next/core</code> scope</summary>

| Category | File (2026-08-09) | File (2026-08-01) | Source Command |
|---|---|---|---|
| Reports | **plan_wb-flow_20260809.md** *(this file)* | [plan_wb-flow_20260801.md](../../01/plans/plan_wb-flow_20260801.md) | `/wbPlan` |
| Reports | — | [release_wb-flow_20260801.md](../../01/releases/release_wb-flow_20260801.md) | `/wbRelease` |
| Task report | [task_1_report_wb-flow_20260809.md](tasks/task_1/task_1_report_wb-flow_20260809.md) | — | `/wbWork --wave=A` (row 1 · deepseek-v4-pro) |
| Task report | [task_4_report_wb-flow_20260809.md](tasks/task_4/task_4_report_wb-flow_20260809.md) | — | `/wbWork --wave=A` (row 4 · Claude Opus 5) |
| Wave notes | [waves.md](tasks/waves.md) | — | `/wbWork --wave=A` (orchestrator) |
| Decision | [adr_selfcorrect_enforcement.md](../../../../../../../_meta/adr_selfcorrect_enforcement.md) | — | row 4's deliverable — `wb-flow lint` chosen |

</details>

### 🌊 Wave A run log (2026-08-09)

| Cell | Executor(s) | Verdict | Evidence |
|---|---|---|---|
| row 1 · 🔨 Worker | deepseek-v4-pro | ✅ **DONE** · ✅ **VALID 9/10** | `wave.js` `kind:'work'` → `null`; re-proved behaviourally, 4/4 |
| row 4 · 🧠 Planner | Claude Opus 5 | ✅ **DONE** · ✅ **VALID 9/10** | ADR written; ⚠️ self-validated under the Planner exemption, declared |
| row 2 · ✅ Validator | Claude Opus 5 | ✅ **DONE** | D1 runtime proof, 4/4 assertions PASS on a fixture with a spawnable validator |
| row 8 · 📋 Mechanical | qwen3.7-plus | ✅ **DONE** | D5 fixed + corpus-swept; correctly left the `Status:` callout alone |
| row 3 · 🔨 Worker | deepseek → kimi → **Claude** | ✅ **DONE** | (a)(b)(c) verified after change, + 2 unplanned defects fixed with a both-directions mutant proof |
| row 5 · 🔨 Worker | deepseek → **Claude** | ✅ **DONE** | `wb-flow lint` works; 3 mutants RED→GREEN re-run first-hand |
| row 6 · 📋 Mechanical | — | ⏭️ **not dispatched** | `🚫 Cancelled`; the generator scheduled it anyway and it was pulled by hand |
| row 7 · 🔨 Worker | — | ⬜ **OPEN** | 🔴 P0 · the last open row. Held out of both passes: it writes `bin/wave.js`, which row 2 measures at runtime |

> ⚠️ **`opencode` worker lane went down mid-wave (2026-08-09 ~18:20).** A trivial
> `opencode run -m opencode-go/kimi-k2.7-code 'reply with exactly: PONG'` did not return within 90 s
> (exit 143). Rows 3 and 5 lost their agents to it after their file work had landed but before their
> reports were written; both were completed in-session. **Re-probe before dispatching row 7.**
> Full account in [waves.md](tasks/waves.md).

# ADR — How to enforce the 7-point self-correct checklist

> **Status:** ✅ Accepted — 2026-08-09
> **Decision by:** Claude Opus 5 (🧠 Planner, in-session)
> **Origin:** [plan_wb-flow_20260809.md](../.wb/workflows/reports/2026/08/09/plans/plan_wb-flow_20260809.md) row 4 (D3)
> **Implements:** nothing — row 5 implements this decision. This file decides only.

---

## Context

`/wbPlan`'s **Consolidate & Structure Repair Mode** defines a seven-step checklist
(steps **0–6** of `wbPlan_template.md`'s self-correct block). It is prose. Nothing runs it.

The only executable oracle in `_shared/` is [sync_check.sh](../templates/commands/_shared/sync_check.sh)
— 48 lines, five checks — and it mentions the checklist **zero** times. Measured:

```
$ grep -ci 'self-correct\|checklist' templates/commands/_shared/sync_check.sh
0
```

What `sync_check.sh` actually covers is a subset of **step 5 alone** (derived-block sync).
Steps 0, 1, 2, 3, 4 and 6 have no executable check of any kind.

The template already states the cost of this shape, in its own words:

> 🔴 *"For weeks this checklist existed with no executable check, and plans still shipped literal
> `<placeholder>` matrix cells, broken relative links, and a What's Next progress line contradicting
> its own task table … A checklist nothing runs is decoration."*

That paragraph is attached to step 5 — the one step that *did* get an oracle. The other six
still have the property it describes.

---

## Options considered

| Option | Shape | Verdict |
|---|---|---|
| **(i)** | Extend `sync_check.sh` with the missing checks | ❌ Rejected |
| **(ii)** | Sibling `selfcorrect_check.sh`, invoked from the `/wbPlan` template's step 5 | ❌ Rejected |
| **(iii)** | **`wb-flow lint <plan.md>` — a real subcommand** | ✅ **Accepted** |

**Why (i) is rejected.** The plan row already names the objection and it holds: `sync_check.sh`
answers *"is this plan file internally consistent right now?"* — a question with a yes/no answer
derivable from the file alone. The checklist answers *"was the repair procedure carried out?"* —
a question about a **process**, some of whose steps (0, 6) require reading other files or knowing
which flags were passed. Fusing them produces one script with two exit-code meanings.

**Why (ii) is rejected.** It reproduces the exact failure being fixed. `sync_check.sh` is itself a
sibling script in `templates/commands/_shared/`, reachable only by prose reference — and it took
until 2026-08-09 for anything to actually run it. A second file in the same folder, invoked only
from a template step, inherits the same discoverability: no wave cell, no CI step, and no other
`/wb*` command can call it without hard-coding a path into a `templates/` directory.

**Why (iii) wins.**

1. **Callable outside a template.** `wb-flow` is already on PATH and is already how `wave`, `next`,
   `archive` and `snap` are invoked. A wave cell, a validator, or the user can run
   `wb-flow lint <plan.md>` directly; a `templates/_shared/*.sh` cannot be reached that way.
2. **It keeps the two questions separate.** `lint` is the process oracle; `sync_check.sh` stays the
   file-consistency oracle and is **called by** `lint` as its step-5 check, unchanged. Option (i)'s
   conflation is avoided without duplicating its logic.
3. **It reuses the existing parsers.** `next.js` and `wave.js` already parse the task table and the
   🌊 matrix. `sync_check.sh` re-implements that parse in `awk` (`$(NF-2)` / `$(NF-1)` column
   indexing) — a **third** independent parser is a drift source, and column-index parsing breaks the
   moment a column is added. `lint` in JS shares one parser with the tools that consume the result.
4. **It can be made non-optional later.** A subcommand can be invoked by `wave`'s generated script
   or by `/wbPlan` itself. A prose step cannot.

**Retained from (i):** `sync_check.sh` is **not** deleted, **not** modified, and **not** reimplemented.
`lint` shells out to it. Anything already relying on it keeps working.

---

## Per-point checkability

**Legend:** ✅ machine-checkable · ⚠️ partially checkable (a real check exists, but it cannot
certify the whole step) · ❌ not machine-checkable from the artifact.

**The ⚠️ and ❌ rows are the point of this table.** Row 5 must implement the ✅ column and the
*stated* half of each ⚠️ row, and must leave ❌ documented as unenforced. A check that always passes
is the hollow shape this entire plan exists to remove — writing one here would be self-parody.

| # | Checklist step | Checkable? | The check to implement (or why not) |
|---|---|---|---|
| 0 | **Open-task absorption** — pull every `⬜` row from older `plan_<scope>_*.md` in the tree | ⚠️ | **Do:** walk `<scope>/.wb/workflows/reports/**/plan_<scope>_*.md`; for every row with `⬜` Done/Valid, assert its task text appears in this file; assert ids are contiguous from 1; assert every `Dep` value names an id that exists. The Dep check is the highest-value one — the template names a stale `Dep` as "the one way this step corrupts a plan". **Cannot do:** decide whether two differently-worded rows were the same task and were *correctly* merged. That is semantic. |
| 1 | **Link & href repair** (§1, §1.1, §1.2) | ✅ | Fully mechanical, and the template already specifies it as a four-rule test. For every markdown link: flag if label == href, label contains a non-trailing `/`, label holds `..`/`…`/`./`, or label is absolute. Separately: resolve every relative href against the file's directory and flag the misses. This catches the `[../../05/09/plans/plan_X.md](…)` shape that survived a Gemini pass, and the scope-root depth error recorded in `[[reference_wb_report_scope_root_depth]]`. |
| 2 | **Structural alignment** — mandatory sections present in canonical order | ✅ | Assert the ordered header sequence (front-matter → status callout → summary → task table → 🌊 matrix → waves.md callout → `HOW_TO_RUN` markers → 🔗 Action Types → 🧭 What's Next → 📂 Generated Files). Order is checkable, not just presence: §10.4 makes ordering load-bearing (block 2 derives from block 1). |
| 3 | **Missing-section insertion & wave externalization** | ✅ | Assert no inline `### Wave notes` heading survives; assert the `> 📝 **Wave Notes…` callout exists and its `tasks/waves.md` target resolves on disk. *(Live example: this plan carried the callout while `tasks/waves.md` did not exist — a link the check would have caught immediately.)* |
| 4 | **Cell batching & 4-scenario recomputation** (§10.4) | ⚠️ | **Do:** assert all four Copy/Paste scenario blocks are present; assert no matrix cell contains a `<placeholder>`; assert every dispatch carries an explicit `-M=`. **And the D4 invariant, which is the valuable one:** for every merged `/wbValid --id=X,Y,…` cell, resolve the executor of *each* id from the Done column and fail if the routed validator appears among them. That is a genuine self-validation detector, and it is exactly the live defect row 7 fixes in `route()`. **Cannot do:** judge whether the batching chosen was *optimal* — merge-vs-split is a cost/parallelism trade-off with no single right answer. |
| 5 | **Derived-block sync + run the §10.4 oracle** | ✅ | Already exists. `lint` shells out to `sync_check.sh` and adopts its exit code. **One honest caveat to record rather than fake:** whether the author *ran* the oracle is unknowable from the file — only whether the file currently *passes* it. Making `lint` run it converts the unanswerable question into an enforced one. |
| 6 | **Archive sweep** — only when `--archive` was passed | ❌ | Not checkable from the plan file. Whether `--archive` was passed is invocation state that leaves no trace in the artifact, and steps 0–5 must have succeeded first. A file that was never meant to be swept is indistinguishable from one that should have been and wasn't. **Do not add a check here.** `lint` prints it as `— (not enforceable)` so the gap is visible instead of silently absent. |

**Score: 3 of 7 fully checkable (1, 2, 3), 3 partially (0, 4, 5-with-caveat), 1 not at all (6).**
Reporting this as "7/7 enforced" would be the same lie the plan was written to stop.

---

## Consequences

- **Row 5 implements:** `bin/lint.js` + `wb-flow lint <plan.md>` dispatch, covering steps 0–5 as
  scoped above. Each check must be **mutant-proved in both directions** (break it → red;
  restore → green), per row 5's own Verify.
- **Step 6 stays unenforced and is labelled as such** in `lint`'s output.
- **`sync_check.sh` is unchanged** and becomes `lint`'s step-5 backend.
- **Exit contract:** `0` = all enforceable points pass; non-zero = count of failed points; each
  failure names its checklist step number, so the output maps 1:1 onto the template's own steps.
- **Not in scope:** wiring `lint` into `wave`'s generated scripts or into `/wbPlan` automatically.
  That is a follow-up — shipping a callable oracle first is what makes the wiring decision testable
  rather than theoretical.

---

## Links

- [wbPlan_template.md](../templates/commands/wbPlan/wbPlan_template.md) — the seven steps (0–6)
- [output_conventions.md](../templates/commands/_shared/output_conventions.md) — §3, §10.4
- [sync_check.sh](../templates/commands/_shared/sync_check.sh) — the existing step-5 oracle

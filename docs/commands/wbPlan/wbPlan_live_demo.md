# /wbPlan — Live Demo ()

What `/wbPlan` (v5.1 — Cost-Aware) would actually do on `wb-labs` right now. The active plan, prior reports, and memory state below are real. Plans now include `Est. (min · kt)` token estimates and a `💰 Budget Summary`.

---

<CommandLiveDemoAnimation command="wbPlan" />

## 1. Live target

| Field | Live value |
|---|---|
| Active plan | `reports/<date>/plans/plan_wb-core_20260504.md` (3 rows, all `⬜` Done & Valid) |
| Most recent prior plan | (none — this is the only active plan in the workspace) |
| Open continue-tomorrow handover | None recorded |
| Memory rules for planning | `feedback_model_selection.md` (the agent/the agent declaration before action), `project_docs_edition.md` (docs structural rules) |
| Live multi-session work | The current docs v4 sync — uncommitted but not yet captured in any plan |

The third row is the noteworthy one. The current docs work is happening *without* a corresponding plan, which is the situation `/wbPlan --focus="docs_v4_sync"` would address.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `"WBC.js decomposition steps"` | Reads memory + the existing wb-core plan; would produce 3-5 rows for a planned decomposition. Likely conflicts with row 3 of the active plan (which already names this work). |
| `"docs v4 sync remaining work"` | New plan, focus=docs. ~24 rows (the QA group remainder + 5 other groups). |
| `core2/packages/wb-core/src/WBC.js` | File-as-target — produces refactor rows for that file. |
| `--resume` | Halt — no prior plan to resume from. |
| `--id="3" -d` (against active plan) | Both cells of row 3 → `⏸️`. Row 3 (WBC.js decomposition) gets deferred. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| `"docs v4 sync remaining"` (no flag) | Plan written; uses default scope=local (which means wb-core context). Imperfect — docs work isn't a wb-core task. Better to add `--focus`. |
| `"docs v4 sync remaining" --focus="docs"` | Plan written under the right focus. Memory rules from `project_docs_edition.md` apply. |
| `--focus="docs" --continue-tomorrow` | Same as above + handover header summarizing today's progress. |
| `--id="3" -d` against active plan | Both cells of row 3 (WBC.js decomposition) → `⏸️`. Useful given row 3 is currently DAG-blocked anyway. |
| `--id="3" -c` against active plan | Both cells → `🚫`. Cancels the WBC.js decomposition row entirely. Riskier — the work might still be needed; `-d` is usually the right call. |
| `--wbPlan` flag | Rejected: self-chaining is circular. |
| `--resume` | Halt — no prior plan in scope. |

---

## 4. Pipelines on this exact workspace

<PlanLiveDemoAnimation />

### 💠 Pipeline A — Create a docs-specific plan (the right plan for this session)

The current docs work is happening without a plan. Running `/wbPlan --focus="docs_v4_sync" --continue-tomorrow` ingests memory rules (`project_docs_edition.md`) and calculates task rows with token & budget estimates (`~$1.44` fast model / `~$5.40` big thinker).

> **Key Takeaway**: The handover header generated in the plan file is what makes multi-day sessions seamless if work is paused overnight.

### 💠 Pipeline B — Defer row 3 of the active wb-core plan

Running `/wbPlan --id="3" -d` is an explicit state-only mutation. Both cells (`Done` and `Valid`) flip to `⏸️ Deferred` without executing code.

> **Key Takeaway**: Using `-d` records "this work is on hold intentionally" in `.wb/` reports, preventing DAG-blocked tasks from looking like passive neglect in standup reviews.

### 💠 Pipeline C — The `--resume` refusal & carryover

When launching a new session with `/wbPlan --resume`, `wb-flow` scans prior plan state:
- Incomplete rows (`⬜ Done / ⬜ Valid`) are carried over to tomorrow's new plan file.
- Explicitly deferred rows (`⏸️`) are **NOT carried over by design**.

> **Key Takeaway**: `--resume` is for carrying incomplete work (`⬜`), respecting explicit deferral decisions (`⏸️`). If you wish to reactivate a deferred row later, use `/wbPlan --id="3" -o`.

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbPlan` with no description | Halt — need a target or `--resume`. |
| `/wbPlan --resume` (no prior plan) | Halt — currently no resumable plan in this workspace. |
| `/wbPlan --wbPlan` | Rejected — self-chaining is circular. |
| `/wbPlan --id="3"` without a state flag | Halt — `--id` on /wbPlan only valid with `-o`/`-d`/`-c`. |
| `/wbPlan --id="99" -d` | Halt — row doesn't exist. |
| `/wbPlan --task="magic"` | Halt — unknown category. |
| `/wbPlan --scope="monorepo" "fix everything"` | Warns about coarse-grained plans being hard to action; produces the plan anyway with the warning recorded in the handover header. |
| `/wbPlan "implement WBC.js decomposition"` (already covered by row 3) | Notice: row 3 already exists for this work. Does not duplicate; suggests `/wbWork --id="3"` or `/wbPlan --id="3" -o` to revive if deferred. |

The pattern: **`/wbPlan` is the dual-cell authority and the source of every plan file.** It refuses to duplicate existing rows, refuses circular self-chaining, refuses to fabricate work for vague inputs, and treats deferred rows as "do not auto-resume" by design. The plan file is a snapshot, the handover header is the narrative, and the dual-cell privilege is the cleanup primitive that no other command can perform.

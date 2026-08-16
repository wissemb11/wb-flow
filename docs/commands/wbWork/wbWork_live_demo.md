# /wbWork — Live Demo ()

This is what `/wbWork` actually does on `wb-labs` as the workspace stands today (2026-05-04). The matrix below mirrors the [exhaustive simulation](wbWork_exhaustive_simulation.md), but every cell is filled from the *live* state of the repo — the active plan that exists, the rows that exist, the deps that are actually in the file.

---

<CommandLiveDemoAnimation command="wbWork" />

## 1. Live target

| Field | Live value |
|---|---|
| Active package | `core2/packages/wb-core` |
| Active plan | `reports/20260504/plans/plan_wb-core_20260504.md` |
| Worker pool | the AI agent (per `feedback_model_selection.md` — the agent for complex, the agent for simple) |
| Validator pool | Distinct pool — the worker/validator separation is enforced at the model level, not just the cell level |

The plan rows the worker would see if invoked right now:

| # | Task | Dep | Done | Valid |
|---|---|---|---|---|
| 1 | JWT handshake in tierEnforcement.js | — | ⬜ | ⬜ |
| 2 | renderString escape pass | — | ⬜ | ⬜ |
| 3 | WBC.js decomposition | 1, 2 | ⬜ | ⬜ |

---

## 2. What `--id` resolves to, against this plan

| Filter | What matches today |
|---|---|
| `--id="1"` | Row 1. Eligible — Dep is empty. |
| `--id="2"` | Row 2. Eligible — Dep is empty. |
| `--id="3"` | Row 3. **DAG-blocked** — Deps 1 and 2 are still `⬜`. |
| `--id="*"` | Rows 1 and 2 only. Row 3 is filtered out by the unblocked check. |
| `--id="1 && 3"` | Atomic-fails. Row 3 is DAG-blocked, so the entire batch refuses. |
| `--id=">2"` | Row 3 only — also DAG-blocked, also refuses. |
| `--id="!=3"` | Same set as `*` for this plan. |

The interesting case is `--id="*"` versus `--id=">0"`. They're not the same. `*` is "all unblocked rows"; `>0` is "all rows" — and the DAG check then rejects row 3. The wildcard pre-filters; the range does not.

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `--id="1"` (no state flag) | Worker reads row 1, edits `tierEnforcement.js`, runs row 1's Verify recipe, writes `Done = ✅`. |
| `--id="3" -d` | Skips work entirely. `Done = ⏸️ Deferred`. `/wbStandup` will stop listing it. |
| `--id="3" -c` | Skips work. `Done = 🚫 Cancelled`. Permanent — re-add as new row to revive. |
| `--id="1" -o` | No-op-ish: row 1 is already `⬜`. Writes `⬜` again. Useful semantically (signals intent) but not strictly necessary. |
| no `--id` | Halt. `❌ /wbWork is selector-required.` |

---

<script setup>
const workPipelines = [
  {
    title: "Pipeline A — Run Unblocked Queue",
    cmd: '/wbWork --id="*"',
    logs: [
      { text: "[SYSTEM] Plan: reports/20260504/plans/plan_wb-core_20260504.md", type: "sys" },
      { text: "[DAG] Unblocked: rows 1, 2. Blocked: row 3 (Deps 1, 2 still ⬜).", type: "ctx" },
      { text: "[WORK] Row 1: JWT handshake in tierEnforcement.js\n Editing core2/packages/wb-core/src/tierEnforcement.js...\n Verify: <row 1's verify command>", type: "gen" },
      { text: "[OK] Row 1 verified.", type: "ok" },
      { text: "[PLAN] plan_wb-core_20260504.md row 1.Done = ✅", type: "sys" },
      { text: "[WORK] Row 2: renderString escape pass\n Editing core2/packages/wb-core/src/renderString.js...", type: "gen" },
      { text: "[OK] Row 2 verified.", type: "ok" },
      { text: "[PLAN] row 2.Done = ✅", type: "sys" },
      { text: "[OK] 2 rows done. Row 3 (Deps now satisfied) is now eligible.\n Run /wbValid --id=\"*\" before promoting Row 3 work.", type: "ok" }
    ],
    note: "The ordering is plan-order (1 then 2), not declaration order in --id. CSV --id=\"2,1\" produces the same trace.",
    noteType: "info"
  },
  {
    title: "Pipeline B — Defer Row 3 (-d)",
    cmd: '/wbWork --id="3" -d',
    logs: [
      { text: "[STATE-ONLY] Skipping work execution.", type: "warn" },
      { text: "[PLAN] row 3.Done = ⏸️ Deferred", type: "sys" },
      { text: "[OK] Row 3 is now invisible to /wbStandup. Reactivate later with -o.", type: "ok" }
    ],
    note: "After this, --id=\"*\" still queues only rows 1 and 2. Row 3 is deferred (not blocked). The wildcard treats both as \"skip\" without distinguishing.",
    noteType: "warning"
  },
  {
    title: "Pipeline C — Cancel Rows (-c)",
    cmd: '/wbWork --id=">5" -c',
    logs: [
      { text: "[STATE-ONLY] No work execution.", type: "warn" },
      { text: "[MATCH] Rows 6, 7, 8.", type: "ctx" },
      { text: "[CONFIRM] Cancel 3 rows? [y/N]\n> y", type: "sys" },
      { text: "[PLAN] row 6.Done = 🚫\n[PLAN] row 7.Done = 🚫\n[PLAN] row 8.Done = 🚫", type: "error" },
      { text: "[OK] Plan now has 5 active rows. Cancelled rows preserved for history.", type: "ok" }
    ],
    note: "Cancel preserves the history (the row is still visible in the file with 🚫), unlike deletion. This matters because plan files are append-only by convention.",
    noteType: "info"
  }
];
</script>

<LiveDemoAnimation command="wbWork" :pipelines="workPipelines" />

### 💠 Pipeline A — Run the unblocked queue right now

Running `/wbWork --id="*"` executes all unblocked tasks in the current plan. The system evaluates the DAG, identifies rows 1 and 2 as unblocked, and executes them in plan-order while skipping DAG-blocked row 3.

### 💠 Pipeline B — Defer row 3, narrow scope to today's two rows

If WBC.js decomposition (row 3) needs more design discussion, defer it explicitly with `/wbWork --id="3" -d`. This skips work and mutates the plan state to `⏸️ Deferred` so `/wbStandup` doesn't flag it as neglected.

### 💠 Pipeline C — Cancel out-of-scope rows after a plan rewrite

If rows 6-8 are about a feature that was descoped, cancel them in one pass with `/wbWork --id=">5" -c`. This mutates the state to `🚫 Cancelled` while preserving the rows for historical record.

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbWork` with no `--id` | Halt. `/wbWork` is selector-required. |
| `/wbWork --id="3"` | Halt. `❌ DAG: row 3 depends on 1, 2 — both still ⬜.` |
| `/wbWork --id="4"` | Halt. `❌ Row 4 not found in plan_wb-core_20260504.md (3 rows total).` |
| `/wbWork "decompose WBC.js"` | Halt. NL targeting is `/wbExplain`'s job. Use `--id="3"` (which would then fail the DAG check, but for the *right* reason). |
| `/wbWork --id="1"` re-run after row 1 is already `✅` | No-op with a single-line "already done" notice. To re-execute, run `/wbWork --id="1" -o` first. |

The pattern across all of these: `/wbWork` is **strict at the boundary, not strict at the failure**. It refuses bad inputs upfront with a clear error — but when work fails partway through (verify failure, single-row error inside a wildcard), it continues the queue and reports failures at the end. The contract is "tell me exactly what to do, and I'll tell you exactly what happened." No surprises in either direction.

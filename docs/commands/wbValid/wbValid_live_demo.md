# /wbValid — Live Demo ()

This is what `/wbValid` would do on `wb-labs` as the workspace stands today (2026-05-04). The matrix below mirrors the [exhaustive simulation](./wbValid_exhaustive_simulation), filled from the actual plan that exists right now.

---

<CommandLiveDemoAnimation command="wbValid" />

## 1. Live target

| Field | Live value |
|---|---|
| Active package | `core2/packages/wb-core` |
| Active plan | `reports/20260504/plans/plan_wb-core_20260504.md` |
| Validator pool | Distinct from worker pool (the agent for routine validation, the agent for design-impact rows) |
| Worker pool | Whoever last ran `/wbWork` on this plan (recorded in row metadata) |

The plan rows the validator would see if invoked right now:

| # | Task | Done | Valid |
|---|---|---|---|
| 1 | JWT handshake in tierEnforcement.js | ⬜ | ⬜ |
| 2 | renderString escape pass | ⬜ | ⬜ |
| 3 | WBC.js decomposition | ⬜ | ⬜ |

**Validator-eligibility check on current state:** zero rows. All three rows have `Done = ⬜`, so `/wbValid --id="*"` would match nothing right now. The validator runs *after* the worker, not in parallel.

---

## 2. What `--id` resolves to, against this plan

| Filter | What matches today |
|---|---|
| `--id="1"` | Row 1, but **refused** — `Done = ⬜`. Validator can't grade unimplemented work. |
| `--id="*"` | Empty match set — no `Done = ✅` rows yet. The wildcard reports "no candidates" rather than failing. |
| `--id="3" -d` | Bypasses eligibility; writes `Valid = ⏸️` directly. State-only flags don't require `Done = ✅`. |
| `--id="!=3"` | Tries rows 1 and 2, both refused for the same reason as above. |

**The hypothetical case that matters.** If someone ran `/wbWork --id="1,2"` first and both rows landed `Done = ✅`, then:

| Filter | Match set after /wbWork |
|---|---|
| `--id="*"` | Rows 1 and 2. |
| `--id="3"` | Refused — row 3 still `⬜`. |
| `--id="<3"` | Rows 1 and 2 (eligible). |
| `--id=">2"` | Empty (row 3 not yet `Done`). |

---

## 3. Per-flag behavior, applied live

Assuming `/wbWork --id="1,2"` has already run and rows 1-2 are `Done = ✅, Valid = ⬜`:

| Flag | If invoked now |
|---|---|
| `--id="1"` (no state flag) | Validator re-reads the row description, re-runs the Verify recipe, compares the diff to what the row claimed. Writes `✅` or `❌` to `Valid`. |
| `--id="*"` | Same, applied to rows 1 and 2 in plan order. |
| `--id="1" -d` | Skips inspection entirely. `Valid = ⏸️ Deferred`. The standup will list row 1 under "validation skipped on purpose." |
| `--id="1" -o` | `Valid = ⬜`. No-op-ish here (already empty), but signals "I want this re-validated next pass." |
| no `--id` | Halt. Selector-required. |

---

## 4. Pipelines

<script setup>
const wbValidPipelines = [
  {
    "title": "Release-gate the morning's work",
    "cmd": "/wbValid --id=\"*\"",
    "logs": [
      {
        "text": "[SYSTEM] Plan: reports/20260504/plans/plan_wb-core_20260504.md",
        "type": "sys"
      },
      {
        "text": "[VALID] Eligible: rows 1, 2 (Done=\u2705, Valid=\u2b1c).",
        "type": "gen"
      },
      {
        "text": "[VALID] Row 1: JWT handshake.",
        "type": "gen"
      },
      {
        "text": "Re-running Verify recipe... assertions pass.",
        "type": "gen"
      },
      {
        "text": "Diff matches the description: ratchet check + token-shape contract.",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 1.Valid = \u2705",
        "type": "gen"
      },
      {
        "text": "[VALID] Row 2: renderString escape pass.",
        "type": "gen"
      },
      {
        "text": "Re-running Verify recipe... assertions pass.",
        "type": "gen"
      },
      {
        "text": "Diff escapes <, >, & \u2014 matches description.",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 2.Valid = \u2705",
        "type": "gen"
      },
      {
        "text": "[OK] 2/2 validated. Plan ready for /wbGit -P -e -p.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "A real the agent-pool divergence",
    "cmd": "/wbValid --id=\"1\"",
    "logs": [
      {
        "text": "[VALID] Row 1: JWT handshake.",
        "type": "gen"
      },
      {
        "text": "[INSPECT] Reading tierEnforcement.js diff...",
        "type": "gen"
      },
      {
        "text": "\u274c The implementation accepts tokens with `alg: \"none\"`.",
        "type": "gen"
      },
      {
        "text": "Row description specified \"ratchet rejects 'none' algorithm\".",
        "type": "gen"
      },
      {
        "text": "The worker's edit added a header check but didn't include",
        "type": "gen"
      },
      {
        "text": "the algorithm denylist.",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 1.Valid = \u274c",
        "type": "gen"
      },
      {
        "text": "[OK] 1 candidate, 1 rejection. Run /wbWork --id=\"1\" -o to re-queue.",
        "type": "ok"
      }
    ],
    "note": "What makes this pipeline interesting: the worker for row 1 was the AI agent (per `feedback_model_selection.md`, JWT handshake is \"complex\"). The validator is the AI agent. Different eyes.  A plausible failure scenario, run live:",
    "noteType": "info"
  },
  {
    "title": "Validation deferred for genuinely uncheckable work",
    "cmd": "/wbValid --id=\"1\" -d",
    "logs": [
      {
        "text": "[STATE-ONLY] Skipping inspection (validator can't run a browser).",
        "type": "warn"
      },
      {
        "text": "[PLAN] row 1.Valid = \u23f8\ufe0f Deferred",
        "type": "gen"
      },
      {
        "text": "[NOTE] /wbStandup will categorize this as \"needs human validation.\"",
        "type": "gen"
      },
      {
        "text": "[OK] Plan honestly reflects: implemented, validation pending human.",
        "type": "ok"
      }
    ],
    "note": "A row in a different plan: \"Fix the WBDataViewer apiResponse_ stale-cache issue when project changes\" (real entry from `project_wbdataviewer_apiResponse.md` memory). The fix requires a running browser session with the dev server; the validator can read the diff but can't actually trigger the route-change scenario.",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbValid" :pipelines="wbValidPipelines" />


### 💠 Pipeline Release-gate the morning's work


### 💠 Pipeline A real the agent-pool divergence

What makes this pipeline interesting: the worker for row 1 was the AI agent (per `feedback_model_selection.md`, JWT handshake is "complex"). The validator is the AI agent. Different eyes.

A plausible failure scenario, run live:


### 💠 Pipeline Validation deferred for genuinely uncheckable work

A row in a different plan: "Fix the WBDataViewer apiResponse_ stale-cache issue when project changes" (real entry from `project_wbdataviewer_apiResponse.md` memory). The fix requires a running browser session with the dev server; the validator can read the diff but can't actually trigger the route-change scenario.

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbValid` with no `--id` | Halt. Selector-required. |
| `/wbValid --id="1"` right now | Halt. `❌ Cannot validate: row 1 is not yet ✅ Done.` (All three rows currently `⬜`.) |
| `/wbValid --id="*"` right now | No-op with notice. `[VALID] No candidates: 0 rows are Done=✅ with Valid=⬜.` |
| `/wbValid --id="4"` | Halt. `❌ Row 4 not found in plan_wb-core_20260504.md (3 rows total).` |
| `/wbValid "the JWT one"` | Halt. NL targeting refused. |
| `/wbValid --id="1"` after row 1 already has `Valid = ✅` | One-line "already validated as ✅" notice. Use `-o` first to re-validate. |

The pattern across `/wbValid` and `/wbWork` together: **selector-required, deterministic grammar, refuses when state is wrong**. The two commands form a producer/consumer pair around the plan, each writing its own dedicated cell, neither able to forge the other's verdict.

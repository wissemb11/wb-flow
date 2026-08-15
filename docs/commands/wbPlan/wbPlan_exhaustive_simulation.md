# /wbPlan — Exhaustive Simulation ()

`/wbPlan` is the general. Its job is to **produce the plan file that every other QA-group command reads from**. The plan is the source of truth for what work is queued, what's done, what's validated, and what's deferred — and `/wbPlan` is the one command that creates and structures it. Workers and validators only ever *mutate cells* in plans they didn't author; the plan's *shape* is `/wbPlan`'s alone.

Read this if you want to know why `/wbPlan` is the only command that can mutate **both** `Done` and `Valid` cells, what `--focus` actually scopes, and where planning ends and orchestration (`/wbActOn`) begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The General — coordinates workers and validators by structuring their tasks and estimating execution cost. |
| **Target** | A free-text description of what should be planned, or a `--resume` flag to carry over yesterday's incomplete work. |
| **Cell scope** | **Both** `Done` and `Valid` cells (state-only flags). This is the unique privilege; `/wbWork` writes only `Done`, `/wbValid` writes only `Valid`, `/wbPlan` can transition either or both. |
| **Side effects allowed** | Writing new `plan_<package>_<date>.md` files; appending rows to existing plans; mutating both cells of a row via state-only flags; computing `Est. (min · kt)` token estimates and `💰 Budget Summary` per plan. |
| **Side effects forbidden** | Editing source code; running tests; making non-plan-related decisions. |

The "both cells" privilege is what makes `/wbPlan` the recovery tool. If the worker/validator pair gets into a bad state — a row marked `Done = ✅, Valid = 🚫` that should actually be `Done = ⏸️, Valid = ⏸️` — only `/wbPlan` can correct both cells in one operation. `/wbWork --id="N" -d` would only fix `Done`; `/wbValid --id="N" -d` only `Valid`. The plan command is the cleanup primitive.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbPlan` does |
|---|---|---|
| Free-text description | `Command: /wbPlan "implement WBC.js decomposition"` | Reads `context.md` for the active package, breaks the description into rows, assigns model tiers per `feedback_model_selection.md`. |
| File reference | `Command: /wbPlan core2/packages/wb-core/src/WBC.js` | Treats the file as the *target of planning* — produces rows for refactoring/extending it. |
| Audit/review report | `Command: /wbPlan reports/<date>/audits/audit_<...>.md` | Reads the report's findings and produces rows that address them. (This is what `/wbAudit --wbPlan` does internally — `/wbPlan` accepts the report directly when chaining hasn't happened.) |
| `--resume` flag | `Command: /wbPlan --resume` | Reads yesterday's plan, extracts incomplete rows (`Done ≠ ✅` or `Valid ≠ ✅`), carries them into a fresh `plan_*_<today>.md` with renumbered IDs. |
| `--id="<filter>"` + state flag | `Command: /wbPlan --id="3" -d` | State-only mutation: writes `⏸️` to **both** `Done` and `Valid` of row 3. |

The state-only path is operationally important. It exists because the most common cleanup case is "this row is irrelevant now; clear both cells in one go." Doing it via two separate commands (`/wbWork ... -d` then `/wbValid ... -d`) is correct but ceremonious; `/wbPlan ... -d` is the one-step.

---

## 3. Flag matrix

`/wbPlan` has the largest flag surface in the QA group — it's the most-configurable command because planning intent varies most.

### Structural flags

| Flag | Shortcut | Purpose |
|---|---|---|
| `--focus="<sub-system>"` | `-f` | Scopes the plan to a specific sub-system (e.g., `--focus="auth"`, `--focus="docs"`). Filters rows so they all relate to the focus. |
| `--scope="<level>"` | `-s` | Architectural scope: `local` (one package), `cross-package`, `monorepo`. Default: `local`. |
| `--resume` | `-r` | Carries over incomplete rows from the most recent plan in the same scope. |
| `--continue-tomorrow` | (none) | Marks the current plan with a handover header for tomorrow's `--resume`. The header summarizes context and pending decisions. |

### Row-shaping flags

| Flag | Shortcut | Purpose |
|---|---|---|
| `--task="<type>"` | `-t` | Forces a row category: `feature`, `bugfix`, `refactor`, `audit-followup`, `docs`. Affects the Verify column template. |
| `--id="<id>"` | `-i` | When state-only flags are present, scopes the mutation to specific rows. |

### State-only flags (the dual-cell privilege)

| Flag | Shortcut | Effect when paired with `--id` |
|---|---|---|
| `--open` | `-o` | Both cells → `⬜`. Re-opens the row entirely. |
| `--def` | `-d` | Both cells → `⏸️ Deferred`. |
| `--can` | `-c` | Both cells → `🚫 Cancelled`. |

### Chaining flags

| Flag | Shortcut | Purpose |
|---|---|---|
| `--act` | `-a` | Routes the new plan through `/wbActOn` to produce a ranked execution order. |
| `--wbPlan` | `-P` | **Error / no-op** here — `/wbPlan` already produces a plan; chaining its output back into itself is meaningless. The flag exists for grammar consistency across commands but is rejected with a notice. |

The `--wbPlan` no-op is an interesting case. Other commands (`/wbAudit`, `/wbReview`, `/wbStandup`) take this flag as "convert findings into plan rows." `/wbPlan`'s findings *are* plan rows. The flag would be circular; the agent rejects it explicitly rather than silently ignoring.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbPlanSimPipelines = [
  {
    "title": "The Monday morning resume",
    "cmd": "/wbPlan --resume",
    "logs": [
      {
        "text": "[SYSTEM] Looking for most recent plan in scope `local`...",
        "type": "sys"
      },
      {
        "text": "[FOUND] reports/<friday>/plans/plan_wb-core_<friday>.md",
        "type": "gen"
      },
      {
        "text": "[ANALYZE] Row state in friday's plan:",
        "type": "gen"
      },
      {
        "text": "Row 1: Done=\u2705 Valid=\u2705 \u2014 closed.",
        "type": "gen"
      },
      {
        "text": "Row 2: Done=\u2705 Valid=\u2705 \u2014 closed.",
        "type": "gen"
      },
      {
        "text": "Row 3: Done=\u2705 Valid=\u274c \u2014 re-work needed.",
        "type": "gen"
      },
      {
        "text": "Row 4: Done=\u2b1c \u2014 never started.",
        "type": "gen"
      },
      {
        "text": "Row 5: Done=\u2705 Valid=\u2b1c \u2014 validation pending.",
        "type": "gen"
      },
      {
        "text": "[CARRY] Carrying rows 3, 4, 5 into today's plan.",
        "type": "gen"
      },
      {
        "text": "[RENUMBER] 3\u21921, 4\u21922, 5\u21923.",
        "type": "gen"
      },
      {
        "text": "[WRITE] reports/<today>/plans/plan_wb-core_<today>.md created.",
        "type": "gen"
      },
      {
        "text": "| # | Task | Verify | Dep | Done | Valid |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 1 | (was friday row 3) Re-work ... | ... | \u2014 | \u2b1c | \u2b1c |",
        "type": "sys"
      },
      {
        "text": "| 2 | (was friday row 4) Implement ... | ... | \u2014 | \u2b1c | \u2b1c |",
        "type": "sys"
      },
      {
        "text": "| 3 | (was friday row 5) Validate ... | ... | \u2014 | \u2705 | \u2b1c |",
        "type": "sys"
      },
      {
        "text": "[OK] Resume complete. Note row 3's Done=\u2705 \u2014 only Valid was pending.",
        "type": "ok"
      },
      {
        "text": "Run /wbValid --id=\"3\" to close that row.",
        "type": "gen"
      }
    ],
    "note": "Friday's plan had 5 rows; 3 done, 2 incomplete. Monday, the user wants to start with those 2 carried forward into a fresh plan:",
    "noteType": "info"
  },
  {
    "title": "The audit-driven plan (no chaining required)",
    "cmd": "/wbPlan reports/<date>/audits/audit_wb-core_security_<date>.md",
    "logs": [
      {
        "text": "[SYSTEM] Reading audit report...",
        "type": "sys"
      },
      {
        "text": "[FINDINGS] 3 findings extracted (1 P0, 2 P1).",
        "type": "gen"
      },
      {
        "text": "[GENERATE] Producing plan rows from findings:",
        "type": "gen"
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
        "text": "| N+1 | Add alg denylist to JWT verify (P0 finding) | unit test rejects alg:\"none\" | \u2014 |",
        "type": "sys"
      },
      {
        "text": "| N+2 | Move token from localStorage to httpOnly cookie (P1) | manual: localStorage empty post-login | N+1 |",
        "type": "sys"
      },
      {
        "text": "| N+3 | Replace innerHTML with structured insert in sanitize.js (P1) | XSS payload rejected | \u2014 |",
        "type": "sys"
      },
      {
        "text": "[ROW NUMBERING] Appending to existing plan_wb-core_<date>.md (already",
        "type": "gen"
      },
      {
        "text": "has 3 rows). New rows: 4, 5, 6.",
        "type": "gen"
      },
      {
        "text": "[OK] Plan now has 6 rows total. /wbWork --id=\"4,6\" can run unblocked.",
        "type": "ok"
      }
    ],
    "note": "`/wbAudit --wbPlan` is the chained shortcut, but the user can also do it explicitly: run audit, produce report, then `/wbPlan` directly from the report:",
    "noteType": "info"
  },
  {
    "title": "The dual-cell cleanup",
    "cmd": "/wbPlan --id=\"4\" -c",
    "logs": [
      {
        "text": "[SYSTEM] Reading plan_<package>_<date>.md row 4.",
        "type": "sys"
      },
      {
        "text": "[STATE-ONLY] Both cells \u2192 \ud83d\udeab Cancelled.",
        "type": "warn"
      },
      {
        "text": "[CONFIRM] Cancel row 4? Both Done and Valid will be set to \ud83d\udeab. [y/N]",
        "type": "gen"
      },
      {
        "text": "> y",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 4.Done = \ud83d\udeab",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 4.Valid = \ud83d\udeab",
        "type": "gen"
      },
      {
        "text": "[OK] Row 4 cancelled at both cells. /wbStandup will skip it.",
        "type": "ok"
      },
      {
        "text": "[NOTE] Cancelled rows preserve history \u2014 visible in plan with \ud83d\udeab.",
        "type": "gen"
      },
      {
        "text": "Re-add as new row to revive.",
        "type": "gen"
      }
    ],
    "note": "A row is in a confused state (e.g., `Done=\u2705, Valid=\u274c` because the work landed but failed validation, then the team decided the row was wrong-shaped to begin with). One command fixes both cells:",
    "noteType": "info"
  },
  {
    "title": "Plan with --focus and --continue-tomorrow",
    "cmd": "/wbPlan --focus=\"docs_v4_sync\" --continue-tomorrow",
    "logs": [
      {
        "text": "[SYSTEM] Plan focus: docs v4 sync.",
        "type": "sys"
      },
      {
        "text": "[CONTEXT] Reading project_docs_docs_edition.md (memory rules).",
        "type": "ctx"
      },
      {
        "text": "[GENERATE] Plan rows scoped to docs work...",
        "type": "gen"
      },
      {
        "text": "[HANDOVER HEADER] Writing continue-tomorrow header:",
        "type": "gen"
      },
      {
        "text": "# Plan: docs v4 sync (continued)",
        "type": "gen"
      },
      {
        "text": "## Handover state (2026-05-04 \u2192 2026-05-05)",
        "type": "sys"
      },
      {
        "text": "- Part 1 (wbGit + flags) complete.",
        "type": "gen"
      },
      {
        "text": "- Part 2: 7 of 30 commands generated (Execution & QA mid-run).",
        "type": "gen"
      },
      {
        "text": "- Next: complete QA group (3 commands remaining), then groups 2-6.",
        "type": "gen"
      },
      {
        "text": "- Open decisions: none.",
        "type": "gen"
      },
      {
        "text": "- Memory updated: project_docs_edition.md still authoritative.",
        "type": "gen"
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
        "text": "| 1 | Generate wbReview dual files | files exist + read by /wbReview | \u2014 |",
        "type": "sys"
      },
      {
        "text": "| 2 | Generate wbPlan dual files | files exist + read by /wbExplain | \u2014 |",
        "type": "sys"
      },
      {
        "text": "...",
        "type": "gen"
      },
      {
        "text": "[OK] Plan written. Tomorrow's /wbPlan --resume will read the",
        "type": "ok"
      },
      {
        "text": "handover header and pick up from \"QA group complete: 7 of 10.\"",
        "type": "gen"
      }
    ],
    "note": "A multi-day session on docs work needs explicit handover state:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbPlan" titleSuffix="Exhaustive Simulation" :pipelines="wbPlanSimPipelines" />


### 💠 Pipeline The Monday morning resume

Friday's plan had 5 rows; 3 done, 2 incomplete. Monday, the user wants to start with those 2 carried forward into a fresh plan:


### 💠 Pipeline The audit-driven plan (no chaining required)

`/wbAudit --wbPlan` is the chained shortcut, but the user can also do it explicitly: run audit, produce report, then `/wbPlan` directly from the report:


### 💠 Pipeline The dual-cell cleanup

A row is in a confused state (e.g., `Done=✅, Valid=❌` because the work landed but failed validation, then the team decided the row was wrong-shaped to begin with). One command fixes both cells:


### 💠 Pipeline Plan with --focus and --continue-tomorrow

A multi-day session on docs work needs explicit handover state:

---

## 5. Edge cases & refusals

| Trigger | What `/wbPlan` does |
|---|---|
| Free-text input that's vague (e.g., "make things better") | Halt. `❌ Need a more specific description. What sub-system? What outcome?` |
| `--resume` with no prior plan in scope | Halt. `❌ No plan to resume from in scope=local.` |
| `--id` without a state flag | Halt. `❌ --id on /wbPlan only valid with -o/-d/-c (state mutation).` |
| `--wbPlan` flag | Reject with notice. Self-chaining is circular. |
| Plan generation produces zero rows | Honest "nothing to plan." Does not fabricate filler rows. |
| `--task="<unknown>"` | Halt. Lists supported categories. |
| `--continue-tomorrow` on a plan that's already complete | Plan is written with handover header noting "all rows closed; next session free to choose direction." |
| `--scope="monorepo"` | Permitted but warns: "monorepo plans tend to be too coarse for `/wbWork` to action; consider per-package plans." |

The pattern: **`/wbPlan` is the structural authority, the only dual-cell command, and the source of every plan file every other command reads.** It refuses circular self-chaining, refuses to fabricate rows for vague descriptions, and treats the `--continue-tomorrow` header as a first-class handover artifact. Planning is the foundation; everything else operates on what `/wbPlan` produces.

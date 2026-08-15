# /wbValid — Exhaustive Simulation ()

`/wbValid` is the validator. Its job is the mirror of `/wbWork`: read a row whose work has been done, decide whether the work actually matches the row's description, and write the verdict into **one cell only** — the row's `Valid` column. It never edits the `Done` column. That separation is the whole point.

Read this if you want to know exactly when validation refuses to run, why "validate everything" still skips half the plan, and what the three state-only flags do to a `Valid` cell.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The validator. One responsibility: confirm or reject implemented work. |
| **Target** | Rows in the active `plan_*.md` whose `Done` is `✅`. |
| **Cell scope** | `Valid` only. Never writes to `Done`. Never edits `Task`/`Dep`/`Verify`. |
| **Side effects allowed** | Reading code, running the row's verify recipe, comparing diffs to the task description. |
| **Side effects forbidden** | Editing source code (validator catches problems, doesn't patch them); mutating `Done`. |

If the validator could fix the code it's checking, it would stop being a check. The "fix it for me" reflex is `/wbDebug` or a follow-up `/wbWork` round, not `/wbValid`. This is also why **the validator runs on a different model pool than the worker** when invoked through the orchestrator — same-model self-grading collapses to "looks fine to me." Different lenses, different verdicts.

---

## 2. The `--id` filter grammar

Identical to `/wbWork`'s grammar. Same operators, same deterministic parsing, same no-fuzzy-fallback rule.

| Form | Example | Meaning when applied to `/wbValid` |
|---|---|---|
| Single integer | `Command: /wbValid --id="2"` | One row. Refuses if `Done ≠ ✅`. |
| CSV array | `Command: /wbValid --id="1,3,5"` | Iterates plan-order; each row independently checked. |
| Wildcard | `Command: /wbValid --id="*"` | Every row where `Done = ✅` and `Valid = ⬜`. Skips deferred and cancelled rows automatically. |
| Range | `Command: /wbValid --id="<3"` | Rows with ID < 3, then filter to validation-eligible. |
| Negation | `Command: /wbValid --id="!=2"` | Everything except 2, then validation-eligibility filter. |
| Boolean OR | `Command: /wbValid --id="1 \|\| 3"` | First match wins for single-target ops. |
| Natural language | `Command: /wbValid "the JWT one"` | **Refused.** No fuzzy fallback. |

Wildcards are stricter on `/wbValid` than on `/wbWork`. The wildcard for `/wbWork` is "every unblocked row" (DAG check); the wildcard for `/wbValid` is "every row whose work is `✅` but verdict is `⬜`" (state check). You will frequently get smaller match sets from `/wbValid --id="*"` than you expect — that's the safety, not a bug.

---

## 3. Flag matrix (isolated semantics)

Same four-flag surface as `/wbWork`, same state-only/selector split, same rightmost-wins tie-breaking. The difference is which cell gets written.

| Flag | Shortcut | Mode | What happens |
|---|---|---|---|
| `--id="<filter>"` | `-i` | Selector | Required. Halts without it. |
| `--open` | `-o` | State-only | `Valid = ⬜`. Use after a rejection to reset for re-review (typically after `/wbWork` patches the implementation). |
| `--def` | `-d` | State-only | `Valid = ⏸️ Deferred`. Validation intentionally postponed (validator on PTO, blocked on external info). |
| `--can` | `-c` | State-only | `Valid = 🚫 Cancelled`. Permanent — validation will not be re-attempted. |

The state-only flags exist because **a plan row can have `Done = ✅` and never receive a `Valid` verdict**. Real example: a row that fixed a bug, but the bug was reproduced only on a customer's machine, and the validator can't re-run that environment. `/wbValid --id="N" -d` records "validation intentionally skipped" instead of leaving an indefinitely empty cell that distorts standup metrics.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbValidSimPipelines = [
  {
    "title": "The \"release gate\" (`/wbValid --id=\"*\"` after a session of `/wbWork`)",
    "cmd": "/wbValid --id=\"*\"",
    "logs": [
      {
        "text": "[SYSTEM] Plan: reports/<date>/plans/plan_<package>_<date>.md",
        "type": "sys"
      },
      {
        "text": "[VALID] Eligible (Done=\u2705 and Valid=\u2b1c): rows 1, 2, 4.",
        "type": "gen"
      },
      {
        "text": "[VALID] Row 1: reading <task description>...",
        "type": "gen"
      },
      {
        "text": "[VALID] Re-running row 1's Verify recipe with a fresh shell.",
        "type": "gen"
      },
      {
        "text": "OK \u2014 assertions match the description.",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 1.Valid = \u2705",
        "type": "gen"
      },
      {
        "text": "[VALID] Row 2: reading...",
        "type": "gen"
      },
      {
        "text": "OK.",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 2.Valid = \u2705",
        "type": "gen"
      },
      {
        "text": "[VALID] Row 4: reading...",
        "type": "gen"
      },
      {
        "text": "\u274c Diff includes a CSS change the row description doesn't mention.",
        "type": "gen"
      },
      {
        "text": "Reason: scope creep. Row 4's task was about the regex, not the",
        "type": "gen"
      },
      {
        "text": "button class.",
        "type": "gen"
      },
      {
        "text": "[PLAN] row 4.Valid = \u274c",
        "type": "gen"
      },
      {
        "text": "[OK] 3 candidates: 2 \u2705, 1 \u274c. Row 4 needs a /wbWork --id=\"4\" -o pass.",
        "type": "ok"
      }
    ],
    "note": "The end-of-session ritual. After `/wbWork` has produced one or more `\u2705 Done` rows, `/wbValid --id=\"*\"` checks them all in one pass before the user runs `/wbGit -P -e -p`.",
    "noteType": "info"
  },
  {
    "title": "The \"post-rejection reset\" (`/wbValid --id=\"4\" -o`)",
    "cmd": "/wbValid --id=\"4\" -o",
    "logs": [
      {
        "text": "[STATE-ONLY] Skipping inspection.",
        "type": "warn"
      },
      {
        "text": "[PLAN] row 4.Valid = \u2b1c",
        "type": "gen"
      },
      {
        "text": "[OK] Row 4 ready for fresh /wbValid inspection.",
        "type": "ok"
      }
    ],
    "note": "Row 4 was rejected (Pipeline A above). The developer fixed the scope creep, but row 4 still shows `Valid = \u274c`. Reset it before the next validation pass:",
    "noteType": "info"
  },
  {
    "title": "The \"validation deferred\" (`/wbValid --id=\"3\" -d` for environment-locked work)",
    "cmd": "/wbValid --id=\"3\" -d",
    "logs": [
      {
        "text": "[STATE-ONLY] No inspection.",
        "type": "warn"
      },
      {
        "text": "[PLAN] row 3.Valid = \u23f8\ufe0f Deferred",
        "type": "gen"
      },
      {
        "text": "[OK] /wbStandup will show row 3 under \"validation deferred \u2014 needs human.\"",
        "type": "ok"
      }
    ],
    "note": "Row 3 fixed a bug that only reproduces under macOS Sonoma's Quick Look extension API. The validator (running in a Linux sandbox) genuinely cannot re-verify. Recording the \"I can't check this\" state honestly:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbValid" titleSuffix="Exhaustive Simulation" :pipelines="wbValidSimPipelines" />


### 💠 Pipeline The "release gate" (`/wbValid --id="*"` after a session of `/wbWork`)

The end-of-session ritual. After `/wbWork` has produced one or more `✅ Done` rows, `/wbValid --id="*"` checks them all in one pass before the user runs `/wbGit -P -e -p`.


### 💠 Pipeline The "post-rejection reset" (`/wbValid --id="4" -o`)

Row 4 was rejected (Pipeline A above). The developer fixed the scope creep, but row 4 still shows `Valid = ❌`. Reset it before the next validation pass:


### 💠 Pipeline The "validation deferred" (`/wbValid --id="3" -d` for environment-locked work)

Row 3 fixed a bug that only reproduces under macOS Sonoma's Quick Look extension API. The validator (running in a Linux sandbox) genuinely cannot re-verify. Recording the "I can't check this" state honestly:

---

## 5. Edge cases & refusals

| Trigger | What `/wbValid` does |
|---|---|
| `--id` missing | Halt. Selector-required. |
| `--id="N"` when row N has `Done = ⬜` | Halt. `❌ Cannot validate: row N is not yet ✅ Done.` |
| `--id="*"` and one row's verify fails | Continue queue; record `❌` for that row; full report at end. No early halt. |
| `--id="N"` when row N already has `Valid ≠ ⬜` | One-line "already verified as ✅/❌/⏸️/🚫" notice. Use `-o` first if re-validation is the goal. |
| `--id="99"` when plan has 5 rows | Halt. `❌ Row 99 not found.` |
| Natural-language target | Refused. No fuzzy fallback, by design. |
| Worker model identity == validator model identity | The orchestrator (`/wbActOn` chains, `/wbStandup`) emits a warning that same-model self-grading is happening. Validation still runs but the warning is recorded. |
| `-o -d -c` on the same call | Rightmost wins. Agent prints which flag was applied. |

Two of these refusals are worth understanding together. `/wbValid` refuses to validate `Done = ⬜` rows (you can't grade work that doesn't exist), and refuses to silently overwrite a non-empty `Valid` cell (you can't quietly change a verdict). Both refusals have the same shape: **the validator preserves the historical record of the validation pass**, and treats overwrites as something the user must explicitly opt into via `-o`. The validator's audit trail is part of what makes the plan a useful record after the fact.

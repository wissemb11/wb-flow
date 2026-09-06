# /wbPlan — Practical

## When to reach for /wbPlan

| Situation | Use /wbPlan? |
|---|---|
| "Fix the padding on this button" | No — one sentence |
| "Add a CSV export button" | Maybe — borderline, 3-4 tasks |
| "Migrate wb-core to structural array handling" | Yes — multi-step, architectural |
| "Debug this crash in WBDataViewer" | Yes, but plan starts with `reproduce` task |
| "Clean up this package" | No — that's `/wbClean` |
| "Refactor this file" | Maybe — if > 1 file affected |

Rule of thumb: if the work will span multiple sessions, you want a plan. If it fits in one session, just describe the work.

## The three forms

```
/wbPlan <pkg> # AI infers the task from context
/wbPlan <pkg> --task="<description>" # explicit task framing (recommended)
/wbPlan <pkg> --resume # read existing open plan, continue
```

## Reading a plan file

Every plan has a table. Three columns matter most:

- **Details** — must be specific enough that another session could execute without asking questions.
- **Validator** — who verifies the task is done. If empty, the plan is weak.
- **Done / Valid** — checkboxes. The state machine.

Skim these before executing. If the details are vague, the plan is bad; fix it before running anything.

## Resuming a plan

```
/wbPlan <pkg> --resume
```

The AI reads the existing plan file, sees which rows are ✅ / ⬜ / 🔨, and tells you which task is next. If a row is 🔨 (in progress) and stale (> 12h old), the AI will ask: "verify this task's actual state before proceeding." Don't skip that check — state rot happens.

## When /wbPlan refuses to write a plan

This is correct behavior, not a bug. `/wbPlan` refuses when:

- Your `dev.md` contains a rule like "confirm decision X before extending" and the task would require extending.
- The task contradicts an existing open decision in `context.md`.
- The task is too vague to decompose ("make it better", "improve performance").

When refused, answer the question the AI asks. Don't work around it.

## The one mistake to avoid

**Generating a plan and then ignoring the validator column.** Without independent validation, the plan degrades to a TODO list. The whole point of the worker/validator split is that a second pass catches what the first misses. Use a different model for validation when possible; use the same model with an adversarial prompt when not.

## When /wbPlan is the wrong command

- You want to *do* the work → describe the task, skip the plan.
- You want to *know* if the code is good → `/wbAudit`.
- You want to *find* why something's broken → `/wbDebug`.
- You want to *brainstorm* features → `/wbVision`.

`/wbPlan` answers one question: *"Given this goal, what are the steps?"* Not "is this goal worth it?" (that's `/wbVision`) and not "is this work done correctly?" (that's `/wbAudit`).

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Documented shortcuts are listed below.

| Long form | Shortcut |
|---|---|
| `--resume` | `-r` |
| `--scope` | `-s` |
| `--task` | `-t` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

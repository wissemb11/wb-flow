# /wbIdea — Practical

## Where it fits

```
wbVision ──► wbIdea ──► wbPlan ──► wbWork ──► wbValid
 (dream) (capture) (commit) (execute) (verify)
```

`/wbVision` brainstorms broadly. `/wbIdea` captures specific ideas with scores. `/wbPlan` commits to execution. The gap between "that might be worth doing" and "let's do it" is where `/wbIdea` lives.

## The four forms

```
/wbIdea <pkg> # AI scans context and proposes ideas
/wbIdea <pkg> --task="<description>" # Register a specific idea manually
/wbIdea <pkg> --resume # Re-read existing idea file, re-score
/wbIdea <pkg> --id=1 --promote # Promote idea #1 to today's plan file
/wbIdea <pkg> --id=1,2 --reject # Mark ideas 1,2 as 🚫 Rejected
/wbIdea <pkg> --id=1 --defer # Mark idea 1 as ⏸️ Deferred
```

## When to run

- You have an improvement that isn't urgent enough for a plan.
- After `/wbVision` — to formalize the 1–2 good ideas into trackable rows (this happens automatically).
- After `/wbAudit --ideas` — to capture P3/cosmetic findings as improvement ideas.
- When you want to build a backlog of possibilities without plan overhead.

## When NOT to run

- The idea fits in one sentence and you're ready to execute → just do it.
- You have open plan tasks → finish those first.
- You want free-form brainstorming → `/wbVision`.
- You need to decompose into steps → `/wbPlan`.

## Reading an idea file

Four columns matter most:

- **Score** — 1–10. How badly this should become a task. 10 = implement now. 1 = nice-to-have.
- **Idea** — must be specific enough to promote without re-reading the source.
- **☐ Valid** — the verdict: `🎯 Promoted`, `✅ Recommend`, `⏸️ Deferred`, `🚫 Rejected`.
- **→ Task** — the bridge. When promoted, this becomes a link to the plan row.

## The lifecycle

1. **Register** — idea appears in `idea_*.md` with a score. `☐ Done: ⬜`, `☐ Valid: ⬜`.
2. **Explore** — `/wbWork idea_*.md --id=N` writes an exploration report. `☐ Done: ✅`.
3. **Validate** — `/wbValid idea_*.md --id=N` assigns a verdict. `☐ Valid: 🎯 Promoted` or `✅ Recommend` etc.
4. **Promote** — if `🎯 Promoted`, the idea appears as a task in `plan_*.md` next time `/wbPlan` runs.

## The one mistake to avoid

**Treating the idea file as a plan.** Ideas are speculative. They don't have worker/validator assignments. They don't have DAG dependencies. If you're ready to execute, promote first — then use `/wbWork` on the plan, not the idea.

## When /wbIdea is the wrong command

- You want to *do* the work → describe it directly.
- You want to *commit* to execution → `/wbPlan`.
- You want to *brainstorm broadly* → `/wbVision`.
- You want to *audit* code → `/wbAudit`.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

| Long form | Shortcut |
|---|---|
| `--resume` | `-r` |
| `--scope` | `-s` |
| `--task` | `-t` |
| `--id` | `-i` |
| `--promote` | `-p` |
| `--reject` | `-x` |
| `--defer` | `-d` |

`-h`, `--h`, and `--help` print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

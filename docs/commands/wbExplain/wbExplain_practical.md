# /wbExplain — Practical

## The forms

```
/wbExplain <plan-file> --id=<N> # explain task N from a plan
/wbExplain <plan-file> --id=<N> --as=eli5 # ...at ELI5 depth
/wbExplain <folder>/ "<question>" # explain a subsystem
/wbExplain <folder>/ "<question>" --as=expert # ...at expert depth
/wbExplain <folder>/ --id=<N> --as=eli5,fr,ar # multi-style: ELI5 + French + Arabic
/wbExplain <folder>/ * # batch: explain ALL outstanding tasks
/wbExplain <folder>/ * --as=expert,fr # batch + style composition
```

`--as=` accepts persona tokens defined in ``frontEnd/wbc-ui/core2/packages/wb-flow/templates/shortcuts/shortcuts``. Common ones: `eli5`, `practical`, `expert`, `advanced`, `technical`, `fr`, `ar`. Comma-compose them when you want multiple sections in one output.

The bare `*` (or `--id=*`) is the **wildcard batch** form. It locates the active `plan_*.md` for the target, finds every outstanding row (`Done` is `⬜`), and generates one explanation file per task in a single run. Use it for onboarding sweeps, not for daily work — it produces a lot of output, fast.

## When to run

- **Before `/wbWork --id=N`** when the task description is vague or you suspect the plan author was over-confident. A 30-second explanation prevents a 2-hour wrong execution.
- **When you encounter a `/wbAudit` finding you don't fully grasp.** Pipe the finding ID through `/wbExplain --as=expert` rather than asking the AI conversationally.
- **When you need to onboard someone else** to a chunk of the codebase — generate the explanation file once, share the artifact.

## When *not* to run

- For **trivial tasks**. If task #4 is "rename `foo` to `bar`," running `/wbExplain --id=4` is theatre. Run `/wbWork`.
- For **chat-shaped questions** with no follow-up value. If you're going to read the answer and forget it, ask the AI directly. `/wbExplain` is for explanations worth keeping.
- As a **substitute for `/wbWork`**. `/wbExplain` never modifies code; if you wanted code changed, you wanted `/wbWork`.

## What it does, in order

1. **Detects intent.** `--id=` means task-explain. Free-text positional means subsystem-explain. Both forms accept `--as=`.
2. **Reads the source material.** For task mode: the plan row + any linked task report. For subsystem mode: the folder's code + `context.md` + `dev.md`.
3. **Generates a structured explanation:**
 - `## 1. High-Level Summary` (1 paragraph)
 - `## 2. Deep Dive` (the breakdown)
 - `## 3. Recommended Approach` (only if it's a task explanation — what `/wbWork` should actually do)
4. **Writes the artifact:**
 - **Task mode:** `<target>/.agents/workflows/reports/<YYYY>/<MM>/<DD>/plans/tasks/task_<N>/task_<N>_details_<scope>_<YYYYMMDD>.md`
 - **Subsystem mode:** `<target>/.agents/workflows/reports/<YYYY>/<MM>/<DD>/plans/explanations/explain_<slug>_<YYYYMMDD>.md`
5. **Smart-merges** if the file already exists for today: appends a new section before the `## 🧭 What's Next?` footer rather than fragmenting into `_v2.md`.
6. **Auto-links the plan row** (task mode only). Finds the row for `--id=N` in the active `plan_*.md` and upgrades its `🔗` column from the inactive `<span>📄</span>` placeholder to a live markdown link tagged with the styles you used (e.g. `` `📄 expert,fr` ``). Re-running with new styles re-merges into the same link.

## What you get back

A persistent markdown file. Three sections (or two for question-mode), one auto-appended `## 📂 Generated Files` cross-link footer (the standard Tier-1 layout shared with all `/wb*` reports).

The file is *the output*. The chat reply is just a pointer to it. Re-read the file later; don't re-read the chat.

## What `/wbExplain` will refuse to do

- **Modify code.** It's a query command, not a mutator. Even if you ask it to "and also fix the bug," it won't.
- **Skip the artifact.** No "just answer in chat" mode. The whole point is the persistent record.
- **Run twice for the same slug on the same day** as separate files. It will detect the existing file and append.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

| Long form | Shortcut |
|---|---|
| `--id` | `-i` |
| `--as` | `-a` |

`--id` accepts comma lists, comparators, and booleans (same syntax as `/wbWork`). `--as` accepts comma-separated persona tokens. Universal: `-h` / `--help` / `--h` print this manual.
<!-- FLAGS_SHORTCUTS_END -->

## The mistake to avoid

Running `/wbExplain` on every task before `/wbWork`. It's an antibody for *vague* tasks, not a default ritual for *all* tasks. If the task description is one clear sentence, `/wbExplain` is overhead — it'll generate three sections of explanation that recap what the plan row already said.

The corollary: when authoring `/wbPlan` rows, write them clearly enough that `/wbExplain` would be redundant. Vague rows aren't fixed by a downstream explanation pass; they're fixed by rewriting the plan.


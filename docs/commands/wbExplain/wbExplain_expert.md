# /wbExplain — Expert

> The architectural reasoning behind a *Teacher* command in a system whose other commands are *Mutators* or *Critics*. Read this if you're considering modifying the template, adding new persona styles, or wondering why this command exists at all.

---

## Why a separate command, rather than a flag on `/wbWork`?

The first instinct is *"`/wbWork --explain` would do the same thing."* Three reasons it wouldn't:

1. **`/wbWork` is a mutator.** Its contract is: read a plan row, execute it, generate a `task_<ID>.md` report, flip `Done` to `✅`. Adding an `--explain` flag that *aborts* execution and emits a different kind of artifact violates the contract — `/wbWork` would no longer be reliably "the thing that ticks rows."
2. **Explanations don't always have a plan row.** *"How does the recursive pipe parser work?"* is a valid `/wbExplain` query and a nonsensical `/wbWork` invocation. A flag on `/wbWork` couldn't accept free-text questions without a plan file.
3. **The artifact lives elsewhere.** Task reports go to `tasks/task_<N>/`. Explanations go to `plans/explanations/` (or `tasks/task_<N>/` as details). Mixing them in one folder under one command would corrupt the per-command-per-folder convention every other command obeys.

The general principle: **command-query separation**. `/wbWork`, `/wbRefactor`, `/wbPublish` are commands. `/wbExplain`, `/wbAudit`, `/wbReview`, `/wbCheck` are queries. Mixing them produces tools that are convenient for the immediate use case and wrong for the architecture.

## The two invocation modes

The template branches at the top:

```
if --id present:
 mode = task-explain
 source = plan row + linked task report
else:
 mode = subsystem-explain
 source = folder code + context.md + dev.md
```

Both modes generate the same three-section structure (Summary, Deep Dive, Recommended Approach) — except subsystem-mode has no Recommended Approach (there's no task to recommend an approach to; the answer to a free-text question is itself the recommendation).

## The `--as=` persona system

`--as=` reads from ``frontEnd/wbc-ui/core2/packages/wb-flow/templates/shortcuts/shortcuts``, which defines persona tokens like `eli5`, `expert`, `advanced`, `fr`, `ar`. Comma-composition produces multi-section output:

- `--as=eli5` → one section, ELI5 voice
- `--as=eli5,fr` → ELI5 in English + ELI5 in French
- `--as=expert,fr,ar` → expert in three languages

The persona registry is intentionally separate from the command. New personas are added by editing `shortcuts.md`, not the `wbExplain_template.md`. This keeps `/wbExplain` agnostic about *which* personas exist; it just consumes them.

## Smart Merge

If `explain_<slug>_<YYYYMMDD>.md` already exists for today, the new run *appends* a new persona section (or new question) into the same file rather than creating `explain_<slug>_<YYYYMMDD>_v2.md`.

The append point is *before* the auto-appended `## 📂 Generated Files` cross-link footer. The footer always lives at the bottom; new content goes above it.

This is the same Cumulative-Append protocol as `/wbTrack`, `/wbStandup`, and `/wbPlan`. The calendar-day is the unit of persistence; multiple runs in one day extend the same file.

## Plan auto-linking (task mode only)

After writing the explanation file, the template performs a second mutation: it edits the active `plan_*.md` and upgrades the task row's `🔗` column.

The plan row arrives with an *inactive placeholder*:

```html
<span title="Run: /wbExplain plan.md --id=4 --as=expert">📄</span>
```

After `/wbExplain ... --id=4 --as=expert,fr` runs, the column is rewritten to a live link tagged with the styles used:

```markdown
**Output file:** `task_N_details_<scope>_<YYYYMMDD>.md` (written to `tasks/task_N/` folder)
```

Subsequent re-runs that smart-merge into the same file **also re-merge into the same link** — the tag list grows (`expert,fr` → `expert,fr,ar`) rather than producing a second link. The link is the row's permanent pointer to the explanation artifact, regardless of how many persona styles eventually accumulate inside it.

Subsystem-mode (free-text query, no `--id`) skips this step — there is no plan row to edit.

The two mutations (Smart Merge of the artifact, auto-link of the plan) are intentionally coupled: explanation files and plan rows stay in sync without the human having to reach for the plan. This is why `/wbExplain` is, by design, the *only* read-shaped command in the system that writes to a plan file. `/wbAudit`, `/wbReview`, `/wbCheck` are pure-read; `/wbExplain` is read-shaped but plan-mutating because the link-back is part of the artifact's identity.

## Wildcard batch (`*` / `--id=*`)

The template recognizes a bare `*` (or `--id=*`) as a request to explain every outstanding task in the active plan. Runtime:

1. Locate the active `plan_*.md` for the target folder.
2. Filter rows where `Done` is `⬜` (open). Skip `✅`, `⏸️`, `🚫`.
3. For each row, run task-mode `/wbExplain` end-to-end: generate the file, smart-merge if it already exists, auto-link the plan row.
4. Emit one combined chat reply pointing at all generated files.

Batch mode is sequential, not parallel — the plan file is rewritten between iterations and parallel writes would corrupt it. On a 20-task plan with `--as=expert,fr,ar` you're generating 60 sections of content; expect minutes, not seconds.

The reasonable use case is **onboarding a new contributor**: one batch run produces a complete blueprint set in their preferred languages. The unreasonable use case is running it daily — explanations for tasks you already understand are noise that compounds across reports folders.

## What the template explicitly forbids

- Outputting a code block containing the entire codebase. Explanations are *about* code, not *of* code. Snippets are fine; full-file dumps are not.
- Modifying source code. Even with explicit user request mid-explanation. The only valid response to *"and also fix it"* is "run `/wbWork` for that."
- Re-writing the auto-appended footer. The Tier-1 cross-link footer is shared across all `/wb*` reports; deviating breaks the report-folder index.

## Where this fits in the workflow

```
/wbAudit → produces findings (some clear, some unclear)
/wbExplain → resolves the unclear ones into persistent artifacts
/wbPlan → converts cleared findings into task rows
/wbWork → executes the rows
/wbValid → validates the executions
/wbExplain (?) → re-engaged when validation rejects a task and the worker doesn't know why
```

`/wbExplain` is a *unblocker*. It runs when one of the other commands produced output the human (or the worker AI) can't act on. It's not a default phase of the day; it's a tool you reach for when something is opaque.

## Failure mode to watch

The template is generous with persona-token interpretation. `--as=foo` where `foo` isn't in `shortcuts.md` is currently silently mapped to "practical." This is by design (forgiving) but it means typos don't fail loudly — `--as=expret` produces a "practical" explanation rather than an error. If you're scripting `/wbExplain`, validate the persona token client-side before invoking.

What `wb-flow-docs`'s playbook gets wrong about `/wbExplain`: overstating it as "knowledge distillation" — a structured dump of what the model already computed is not a novel synthesis. The real value is in unblocking workers when validation rejects a task and the failure reason is opaque.

## One-paragraph verdict

A pure query command whose existence reflects a deliberate architectural boundary (command-query separation) rather than user demand. The "knowledge distillation" framing from the overstates the ambition — this is a structured dump of what the model already computed, not a novel synthesis. Most useful when debugging a failed `/wbWork` task, least useful when the user already understands why a decision was made. Weakest in scenarios where the explanation duplicates what the task report already says — the content overlap can approach 70%. Use for opaque failures; skip for transparent ones.

---

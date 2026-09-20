---
title: "Report Lifecycle — Consolidate, Then Archive"
description: "Overview of the report lifecycle, consolidating scattered daily reports, and archiving historical workflow artifacts."
---

# Report Lifecycle — Consolidate, Then Archive

> Every `/wb*` command writes one dated file per day per scope. After a month of work a scope holds
> thirty plan files, twenty audits and a dozen idea files — of which **exactly one of each is live**.
> This page is about the other twenty-nine.

---

## The problem: a folder full of decoys

```
packages/wb-core/.wb/workflows/reports/2026/
├── 07/25/plans/plan_wb-core_20260725.md     ← 3 open tasks
├── 07/26/plans/plan_wb-core_20260726.md     ← 1 open task
├── 07/31/plans/plan_wb-core_20260731.md     ← all closed
├── 08/04/plans/plan_wb-core_20260804.md     ← 2 open tasks
├── 08/05/plans/plan_wb-core_20260805.md     ← all closed
├── 08/07/plans/plan_wb-core_20260807.md     ← 4 open tasks
├── 08/08/plans/plan_wb-core_20260808.md     ← 1 open task
└── 08/09/plans/plan_wb-core_20260809.md     ← today
```

Nothing here is *wrong*. Every one of those files was correct on the day it was written. But ask the
practical question — **"what is open in wb-core right now?"** — and there is no file that answers it.
The answer is spread across five of them, and the newest file is not a superset of the others.

Worse, both a human and an agent will reach for the wrong one. Open `plan_wb-core_20260807.md`
because it is the one you remember, and you work from a backlog where four tasks are open that were
closed two days ago. The file does not look stale — it looks like a plan.

**A stale file is more dangerous than a missing one.** A missing file makes you go looking. A stale
one answers confidently and wrongly.

---

## The two halves

The fix has two halves, and the relationship between them is the whole point of this page.

| Half | What it does | Reversible? | Trigger |
|---|---|---|---|
| **Consolidate** | absorb every **still-open** item from every older file of this category into today's file, then repair that file's structure and links | n/a — purely additive | passing an existing output file with no other flags |
| **Archive** | move the now-superseded `<DD>/<category>/` folders out of `reports/` into `archives/` | yes, per folder | `--archive`, never implied |

```bash
/wbPlan  <plan_file.md>              # half one: consolidate
/wbPlan  <plan_file.md> --archive    # half one, then half two
```

### Consolidate: make one file worth reading

Passing an existing output file with no other flags means *"make this the one file I have to read."*

1. **Repair in place** — the full [self-correct](self_correct_mode.md) pass: link beautification,
   canonical hrefs, missing sections inserted in canonical order, `Requires` column and Action Types
   legend present, derived blocks re-synced and the sync oracle run.
2. **Absorb** — walk the scope's *entire* `reports/` tree for prior files of the same category and
   merge every still-open item into this one.
3. **Recompute** — the 🌊 matrix, the how-to-run block, and What's Next, over the merged set.

What counts as "still open" is per-category, because the categories mean different things:

| Category | An item is still open when… |
|---|---|
| plans | `☐ Done` or `☐ Valid` is `⬜` or `🔨` — **never** `⏸️ Deferred` / `🚫 Cancelled`, those are decided |
| audits · reviews · security | the finding is 🔴/🟡 and no later file records it resolved |
| ideas | status is not `🎯 Promoted`, `🚫 Rejected` or `✅ Shipped` |
| visions | the proposal was never promoted to an idea or a plan task |
| tests | the case is failing or skipped |

Two rules do the real work here:

- **Merge, don't concatenate.** A task carried forward for four days appears **once**, bearing its
  oldest origin link — not four times.
- **De-duplicate on the item's *text*, not its ID.** IDs are per-file and restart at 1, so
  de-duplicating by ID silently collapses four unrelated tasks into one. This is the single most
  destructive way to get consolidation wrong.

Absorbed rows keep their wording, `Requires`, `Dep`, priority and estimate, and gain an origin link:

```markdown
| 7 | 🔨 Worker | 4 | Port the WBChart renderer *(from `plan_wb-core_20260805.md`)* | … |
```

**The source files are never modified.** Consolidation copies. Only `--archive` moves.

### Archive: retire what is now redundant

Once consolidation has run, the older folders hold nothing that is not also in today's file. `--archive`
moves them:

```
<scope>/.wb/workflows/
├── reports/<YYYY>/<MM>/<DD>/<category>/     ← live: the newest date per category
└── archives/<YYYY>/<MM>/<DD>/<category>/    ← history: same path, same depth
```

---

## 🔴 The ordering invariant

> **Consolidate always runs before archive, in the same invocation, and archive is skipped if
> consolidation did not complete.**

Archiving first does not delete an open task — it makes it **invisible**. The task still exists, on
disk, in a file nobody will open: nothing live references it, and the next `/wbStandup` no longer
scans the tree it sits in. Six weeks later you rediscover it and cannot tell whether it was dropped
on purpose.

This is the one destructive failure mode of the whole feature, and it is why:

- archiving is **opt-in** (`--archive`) rather than automatic;
- no other flag implies it;
- a [self-correct](self_correct_mode.md) pass **never** archives — repair is safe to run unattended
  and runs often; moving folders is not and should not;
- the CLI's dry-run prints a `(kept: …)` column, and a row reading `⚠️ no current file in this
  category` is the signal that consolidation has not run. Archiving anyway is exactly the failure
  above.

---

## Three properties of the archive tree

Each of these is load-bearing. None is aesthetic.

### 1. Same depth as `reports/`

`archives/` is a **sibling of `reports/`** under `.wb/workflows/`, and the
`<YYYY>/<MM>/<DD>/<category>/` path below it is *identical* to the one the folder had while live.

```
.wb/workflows/reports/2026/08/07/plans/plan_x_20260807.md    ← 7 dirs to scope root
.wb/workflows/archives/2026/08/07/plans/plan_x_20260807.md   ← 7 dirs to scope root
```

Every relative href inside a moved file that pointed at something moving *with* it still resolves
after the move, **unchanged and unrewritten**. A plan's ``task 1`` link works from
the archive exactly as it worked live. A shorter or prettier archive location would break every link
in every file it stores.

### 2. The unit is the folder, never the file

A plan's `tasks/`, `waves/` and `explanations/` live *inside* `<DD>/plans/`, beside the `.md`:

```
2026/08/07/plans/
├── plan_x_20260807.md
├── tasks/task_1/task_1_report_x_20260807.md   ← the plan links here
├── tasks/waves.md
└── waves/wave_A_x.sh
```

Move the `.md` alone and every task report it links to is orphaned. So `<DD>/<category>/` moves
whole, or not at all.

### 3. The original date is preserved

A plan dated `20260807` archives to `archives/2026/08/07/`, **not** to today's date. The archive
records *when the work happened*, not when someone got round to tidying.

---

## What a move leaves behind

Each archived `.md` is stamped once, immediately below its front-matter (never above it — a banner
before `---` breaks the YAML parse):

```markdown
> 🗄️ **ARCHIVED 2026-08-09** — this file is history, not live state.
> Superseded by `plan_wb-core_20260809.md`.
> Moved from `.wb/workflows/reports/2026/08/07/plans` by `wb-flow archive`. …
```

and one row is appended to `archives/archive_log.md`:

| Date | Category | Archived from | Archived to | Superseded by |
|---|---|---|---|---|
| 2026-08-09 | `plans` | `…/reports/2026/08/07/plans` | `…/archives/2026/08/07/plans` | `plan_wb-core_20260809.md` |

So a reader who lands on an old file via a stale bookmark knows immediately that it is history and
can reach its replacement in one click — and every move is individually reversible:

```bash
wb-flow archive --restore=.wb/workflows/archives/2026/08/07/plans
```

---

## The two exemptions: `/wbStandup` and `/wbTrack`

Every other daily-history command keeps one live file and retires the rest.
**`standups/` and `tracks/` are never swept**, and this is not an oversight waiting to be fixed.

A standup's entire content is *"here is what was open yesterday, here is today."* A track is the
session narrative. Both derive their value from **the series** — the eighth consecutive standup
listing the same blocker is the signal; that is the whole reason to read it. Keep only the newest and
you have thrown away the thing that made it worth reading, while keeping the one entry that says
least.

So the series stays whole, and `/wbStandup` takes the **inverse** role instead.

### `/wbStandup --archive` — the fleet-wide sweep

```bash
/wbStandup <monorepo-root>/            # unchanged — the daily agenda
/wbStandup <monorepo-root>/ --archive  # …then one live file per category, per scope
```

It is the right command to own the sweep because it has already done the hard part. PHASE 1–3 build
the complete inventory of what is open across every scope — and **that inventory is what makes the
sweep safe**, because it is the cross-check:

> Every open item listed in the agenda must now appear in exactly one live file. An agenda item with
> no live home means consolidation missed it — stop before sweeping.

Because it spans every scope rather than one, it always previews and **asks before applying**. A
per-command `--archive` moves a handful of folders; this one can move a hundred, and per-folder
reversibility is little comfort at that volume.

---

## The CLI

Templates shell out to `wb-flow archive` rather than hand-rolling `mv` — the same rule that makes
`wb-flow snap` the only writer of pin symlinks, except this one moves work product, so the stakes are
higher.

```bash
wb-flow archive <scope> --type=plans --dry-run   # always preview first
wb-flow archive <scope> --type=plans             # apply
wb-flow archive <plan_file.md>                   # a FILE pins itself as the keeper
wb-flow archive <scope> --recursive --all        # every scope below, every category
wb-flow archive --list                           # what is already archived
wb-flow archive --restore=<folder>               # undo one move
```

| Flag | Effect |
|---|---|
| `--type=<a,b>` | Categories to sweep (default: every non-exempt one found) |
| `--keep=<N>` | Keep the N newest dates per category (default 1) |
| `--before=<YYYYMMDD>` | Only archive dates strictly before this one |
| `--recursive` / `-R` | Sweep every scope with a `.wb/` below the target (fleet mode) |
| `--include-standups` · `--include-tracks` · `--all` | Opt the exempt categories in explicitly |
| `--no-banner` · `--no-log` | Skip the stamp / the log row |
| `--restore=<path>` · `--list` | Undo one move · show what is archived |
| `--dry-run` / `-n` · `--json` | Preview · machine-readable |

It resolves the `.wb/` root, refuses to touch the newest folder in each category, refuses to clobber
an existing archive entry, skips the exempt categories, prunes the empty `<YYYY>/<MM>/<DD>` shells it
leaves behind, writes the banner and the log, and exits non-zero on a bad target. An agent
reimplementing this with `mv` gets none of that, and its first mistake costs a plan.

### Passing a file pins the keeper

```bash
wb-flow archive .wb/workflows/reports/2026/08/05/plans/plan_x_20260805.md
```

The named file becomes the keeper for `plans/`: everything **older** is archived, everything
**newer** is left alone. Sweeping forward from a hand-picked keeper would destroy work the caller
never mentioned — so it doesn't.

---

## Reading a dry run

```
📋 DRY RUN — nothing will move

  packages/wb-core/
   audits      .wb/workflows/reports/2026/08/04/audits
               → .wb/workflows/archives/2026/08/04/audits   (kept: audit_wb-core_20260807.md)
   plans       .wb/workflows/reports/2026/08/07/plans
               → .wb/workflows/archives/2026/08/07/plans   (kept: plan_wb-core_20260809.md)
   · standups: exempt — it is the log (use --include-standups or --all)

   2 folder(s) would move.
```

Two things to check before you apply:

1. **The `(kept: …)` name is the file you expect to be live.** Note that `audits` and `plans` resolve
   *different* keeper dates — keepers are per-category, so a category with no recent activity keeps
   its own newest file rather than being dragged out by a busier neighbour.
2. **No row reads `⚠️ no current file in this category`.** That means nothing live supersedes the
   folder, which almost always means consolidation has not run.

---

## Related

- [self_correct_mode.md](self_correct_mode.md) — the repair half, and why it never archives
- [plan_state_management.md](plan_state_management.md) — which states count as "open"
- [cli-subcommands.md](cli-subcommands.md) — `wb-flow archive` beside the other subcommands
- [live_reports_snapshot.md](live_reports_snapshot.md) — how the reports tree is laid out

---

← [Concepts](README.md) · [Home](../README.md) | [flow.wbc-ui.com](https://flow.wbc-ui.com)

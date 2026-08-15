---
title: "Self-Correct Mode"
description: "Explains the dual-mode design of /wbX commands — fresh report vs. verify-and-repair — and when to use each."
---

# Self-Correct Mode — 

> Every `/wbX` command that produces a structured output file is **dual-mode**: pass it a scope folder, you get a fresh report; pass it a previous report from the same command, you get a verify-and-repair pass on that report. This document explains why that exists, when to use it, and the one place where it doesn't apply.

<div align="center">
<SelfCorrectAnimation />
*Self-correct mode: pass a report back to its own command for gap-filling, link repair, and checkbox ticking.*
</div>

## The two modes, side by side

```bash
/wbPlan packages/wb-core # NORMAL — produce a fresh plan_*.md
/wbPlan plan_wb-core_20260509.md # SELF-CORRECT — verify & repair that plan in place
```

The detection is **content-based, not filename-based**: the command reads the input file's first H1 and matches it against its own output schema (e.g. `# Plan Backlog: <scope> — <date>`). If the H1 matches, self-correct fires. If it doesn't, the input is treated as a normal scope path. This means you can rename your plans freely — what triggers self-correct is the file's *header*, not its name.

Canonical reference: ``../../../../packages/wb-flow/templates/commands/_shared/output_conventions`` §3.

## Consolidation: the pass is not only about *this* file

Since output_conventions v1.12, passing an existing output file with no other flags means more than "tidy it". It means **"make this the one file I have to read."** Before any repair step runs, self-correct walks the scope's *entire* `reports/` tree for other files of the same category and absorbs every item still open into this one:

```bash
/wbPlan  plan_wb-core_20260809.md    # repair + absorb every older open task
/wbAudit audit_wb-core_20260809.md   # repair + absorb every unresolved older finding
/wbIdea  idea_wb-core_20260809.md    # repair + absorb every unpromoted older idea
```

Two rules keep the merge honest:

- **De-duplicate on the item's *text*, not its ID.** IDs are per-file and restart at 1, so de-duplicating by ID silently collapses unrelated items. A task carried forward for four days appears **once**, bearing its oldest origin link.
- **Sources are read, never written.** Absorption copies. The old files stay exactly as they were.

`⏸️ Deferred` and `🚫 Cancelled` rows are *decided*, not open — they stay where they are.

> 🔴 **Self-correct never archives.** Repair is safe to run unattended and is expected to run often; moving folders is neither. A sweep happens only under an explicit `--archive` and is never implied by any other flag. What self-correct *does* do is notice the mess and offer the command: `📋 Mechanical — 4 superseded plan folders hold no open tasks. → /wbPlan <this file> --archive`. Full model: [Report Lifecycle](report_lifecycle).

## What it actually fixes

Self-correct is **not** a re-run. It does not call the model to re-analyze the package. It only walks the existing report and:

1. **Fills missing fields** the template requires (validator names, scores, model-recs cells).
2. **Normalizes link style** — plain-text paths become relative markdown links per §1 of output_conventions.
3. **Expands bare commands** — `Origin: /wbAudit` becomes `Origin: /wbAudit packages/wb-core` per §2.
4. **Ticks `☐ Done` checkboxes** for tasks whose `tasks_reports/task_<N>_*.md` exists on disk.
5. **Fills `☐ Valid` cells** for tasks whose worker report has a validator score appended.
6. **Re-emits the `📂 Generated Files` footer** with the current snapshot of sibling reports.
7. **Adds (or updates) a `## 🧭 What's Next?` section** so the report stays actionable.

## What it refuses to do

| It will NOT… | Why |
|---|---|
| Re-run the underlying analysis | That's the job of the normal-mode command. Self-correct is a janitor, not an analyst. |
| Delete or rewrite content the user (or a previous model) authored | Audit trails are sacred — you can rerun the analysis if you want a different opinion, but you can't silently overwrite an existing one. |
| Change task IDs, dependencies, or priorities | Those are decisions, not gaps. |
| Stack multiple `Self-Correct Findings` sections | Each new run **updates the existing one in place** — the file grows §N narrative entries, not Findings entries. |

## Which commands have it

The `_shared/output_conventions.md §3` cheatsheet lists the explicit detection markers. As of v1.1:

| Command | Detection marker (first H1) |
|---|---|
| `/wbPlan` | `# Plan Backlog: <scope> — <date>` |
| `/wbIdea` | `# Idea Backlog: <scope> — <date>` |
| `/wbAudit` | `# Audit Report: <scope> — <date>` |
| `/wbReview` | `# Review: <scope> — <date>` |
| `/wbTest` | `# Test Report: <scope> — <date>` |
| `/wbContext` | `# Context: <scope> — <date>` |
| `/wbNext` | `# Next: <scope> — <date>` |
| `/wbTrack` | `# Track: <scope> — <date>` *(limited mode — see below)* |

Other structured-output commands (`/wbStandup`, `/wbReview`, `/wbAudit` and friends) define their own marker in their `wbX_template.md` Detection block. Commands without a structured output (`/wbCheck`, `/wbGit`, `/wbHelp`, `/wbBroadcast`, `/wbMonetize`, `/wbToWBC`, `/wbTranslate`) **do not** support self-correct — there's no schema to verify against.

## The one limited case: `/wbTrack`

Track files are **append-only narratives** with §0 strategic vision + §N contributor entries from multiple models. If self-correct could rewrite the body of a §N section, it would let one model overwrite another model's reasoning — destroying the multi-model audit trail.

So `/wbTrack <track_file>` runs in **limited self-correct**:
- ✅ Verifies §N order, model-tag formatting, footer presence, link integrity, status freshness.
- ✅ Auto-repairs bare `/wbX` in `Recommended Next` tables and plain-text paths in `Files read/created`.
- ❌ Does **NOT** rewrite §N body content, even if a link inside it is broken — broken links are listed in a `## ⚠️ Self-Correct Findings` section near the bottom for a human (or the original author) to repair.

The author rule: **only the original author of a §N may hand-edit that §N's body** to fix mechanical bugs (typos, broken links). A different model wanting to disagree appends a new §N+1 instead.

## When to actually use it

| Situation | Use self-correct? |
|---|---|
| You ran `/wbWork` and want to reflect completed tasks back into the source plan | ✅ `/wbPlan plan_*.md` ticks the `☐ Done` boxes |
| Validator scores landed in `tasks_reports/` but the plan still shows blank `☐ Valid` | ✅ Same — `/wbPlan plan_*.md` |
| You hand-edited a plan and added a row without filling the model-recs cell | ✅ Same — fills it from `model_recommendations.md` |
| You want a *fresh* analysis because the package changed | ❌ Re-run the command in normal mode (`/wbX <scope>`) — self-correct is not a re-analysis |
| The file's H1 doesn't match the command's marker | ❌ Self-correct won't fire — command runs in normal mode and treats your `.md` as a scope path (likely produces a bogus output path) |

## When it's the wrong choice

- **You think the plan is fundamentally wrong.** Self-correct only fills gaps; it won't restructure the plan. Run `/wbPlan <scope>` in normal mode for a re-do.
- **You want a different model's perspective on the same plan.** Self-correct preserves the existing analysis. To get a second opinion, append a §N from a different model (e.g. via `/wbReview plan_*.md`), don't self-correct.
- **The file is from a different command.** `/wbAudit` won't self-correct a plan file — the markers are command-specific.

## The honest critique

Self-correct is a **mechanical janitor**, not a reasoner. If your plan has a wrong dependency edge, self-correct won't catch it — it just makes sure the dependency cell isn't blank. The real value is in the boring cases: tick boxes, fill links, normalize syntax. Don't expect insight; expect tidy.

It also has a hidden trap: **the rule only applies to the original output schema**. If you renamed `Plan Backlog:` to `Plan v2:` in a custom workflow, detection silently fails and your `/wbPlan plan_v2_*.md` invocation creates a *new* file in `reports/plans/` with the original H1 you never asked for. Stick to the standard headers if you want self-correct to work.

---

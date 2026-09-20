# ADR — Gate 3 runs a Verify oracle from the plan file's directory

> **Status:** Accepted · 2026-09-11
> **Decision:** **plan-dir stays canonical.** The generator does not change; the template and the
> conventions are corrected to state what it already does.
> **Decided by:** Opus 5 (🧠 Planner cell, plan task 3) · [plan_wb-flow_20260911.md](../../.wb/workflows/reports/2026/09/11/plans/plan_wb-flow_20260911.md)
> **Implemented by:** task 4. That task implements this decision; it does not re-open it.

## Context

[wave_generator.js:369-374](../../bin/wave_generator.js#L369) runs every Gate 3 oracle as:

```bash
(cd '<plan dir>' && bash -c '<the row's Verify cell>')
```

This is deliberate — the code carries a comment saying so — and it lets a Verify cell reach sibling
task folders and fixtures with short relative paths.

But [wbPlan_template.md:612](../../templates/commands/wbPlan/wbPlan_template.md#L612), the document
that teaches authors how to write a Verify cell, illustrates them as:

```
`[ "$(ls docs/commands | wc -l)" -eq 33 ]`
```

— a **repo-root-relative** path. Nothing in the template, in `output_conventions.md`, or in the
generated script says which directory the cell will actually run from.

The cost of that silence is not theoretical. On 2026-09-11 a `wb-core` plan had all 16 Verify cells
written repo-root-relative, following the template. Gate 3 reported **`ATTEMPTED — oracle failed`**
on task 8, whose work was in fact correct and whose oracle exits 0 when run from the repo root. The
verdict was wrong in the direction that says *your work is broken*, and it would have been wrong for
every row in that plan.

## The deciding fact

The question is which convention the corpus already follows, because the loser pays a migration.
Measured across the whole monorepo — 265 plan files, 207 with parsable Verify columns:

| Verify cell shape | Cells | Files | Status today |
|---|---:|---:|---|
| **plan-relative** (`cd ../…`) | **710** | **99** | ✅ works |
| repo-relative (`cd <path>/…`) | 65 | 12 | 🔴 **silently failing Gate 3** |
| cwd-agnostic (bare command) | 2432 | — | ✅ unaffected either way |

The plan-relative cells are spread across months (463 in August, 79 in September, 167 in undated
trees), so this is an established convention, not an artifact of one recent plan.

**Switching to repo-root would break 710 cells in 99 files. Keeping plan-dir leaves 65 cells in 12
files to fix.** An 11:1 ratio is not a close call.

## Decision

1. **Plan-dir remains canonical.** `wave_generator.js` is not changed.
2. **The contract must be stated where an author writes the cell** — in `wbPlan_template.md`'s
   Column Rule #5 and in `output_conventions.md` §10.4 — not left implicit in the generator.
3. **The template's examples are rewritten** to plan-relative form. An example that contradicts the
   runtime is worse than no example: agents copy the example, which is exactly how the wb-core plan
   acquired 16 wrong cells.
4. **Scope-root is reached with `../../../../../../../`** (7 up from `…/<YYYY>/<MM>/<DD>/plans/`),
   the same depth `output_conventions.md` §1.2 already defines for links. One number, two uses.

## Consequences

- No behaviour change for the 710 working cells, and no fleet migration.
- **12 plan files are revealed to have been silently failing Gate 3** — some since 2026-05. They are
  listed below; repairing them is follow-up work, not part of this decision.
- The template gains an explicit cwd statement, so the next author does not repeat this.
- Gate 3's `SKIPPED`/`ATTEMPTED` messages should eventually name the cwd they used. Not decided here.

### The 12 files with repo-root-relative Verify cells

`plan_core_20260519.md` (2) · `plan_core_20260520.md` (14) · `plan_wb-pay_20260523.md` (1) ·
`plan_wbc-ui2_20260605.md` (7) · `plan_wb-press_20260610.md` (4) · `plan_wb-press_20260614.md` (1) ·
`plan_job_apply_fullstack_app_20260715.md` (15) · `plan_wb-core_20260731.md` (4) ·
`plan_wb-latex_20260809.md` (5) · `plan_wb-core_20260818.md` (2) · `plan_broadcast_20260824.md` (2) ·
`plan_wb-js_20260626.md` (8)

## Alternative considered and rejected

**Make the oracle cwd-independent** by resolving every Verify cell against the repo root at generation
time (rewriting `cd ../…` prefixes). Rejected: it makes the generated script harder to read, breaks
the property that a cell is copy-pasteable by a human from the plan's own folder, and still requires
the template fix — so it adds machinery without removing the documentation gap that caused the bug.

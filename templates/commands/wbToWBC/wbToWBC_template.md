# /wbToWBC: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbToWBC`

## Two forms

```
/wbToWBC <file>             # migrate one file
/wbToWBC <folder>/          # per-component analysis + selective migration
```

## When to run

- Inheriting legacy code that should integrate with wbc-ui2.
- Modernizing pages still using raw HTML tables, vanilla Vuetify, or pre-wbc-ui2 patterns.
- Onboarding external code (acquired component, bought template) into the ecosystem.

## When *not* to run

- On code that already uses wbc-ui2. Refused.
- On a component without a clear wbc-ui2 equivalent (animation-heavy, drag-drop, niche UI). Refused.
- As a "make code better" lever. Migration is structural change; "better" is `/wbAudit` then `/wbRefactor`.
- Twice on the same file. One-shot.

## What you'll see in the output

- **Pre-migration analysis** — what kind of component is this? Does a wbc-ui2 equivalent exist?
- **Proposed rewrite** — config-driven version of the same behavior.
- **Preserved / Changed / Lost** — what survived, what's intentionally different, what's gone.
- **Orphaned files** — components/utilities the migration makes redundant.
- **Caveats** — what to verify before committing.
- **Cleanup pointers** — files to delete, audits to run.

## After migration

1. **Visually verify.** Open the page in the browser. Same behavior?
2. **Delete orphaned files.** The migration may make filter panels, utility functions, etc. redundant.
3. **`/wbAudit`** — confirm no regressions in code quality.
4. **`/wbTest`** — if tests existed for the legacy component, run them. They should still pass (behavior is preserved).
5. **`/wbGit`** — commit the migration with a clear message: `refactor(<scope>): migrate to wbc-ui2 (XYZ → WBDataViewer)`.

## The mistake to avoid

**Running `/wbToWBC` on a component that doesn't need migrating.** Migration changes the code substantially. Even if the AI succeeds, you've spent verification time + committed a large diff. If the legacy code is working and not on a deprecation path, leave it alone.

## When /wbToWBC is the wrong command

- Code is fine; just messy → `/wbAudit` + `/wbRefactor`.
- Behavior bug → `/wbDebug` + fix.
- New feature → just describe and build.
- Already wbc-ui2; want a different config → describe the change directly.
- Want to *remove* wbc-ui2 (de-migrate) → not supported. Manual rewrite.

`/wbToWBC` answers exactly one question: *"can this legacy component be expressed as wbc-ui2?"* If the answer is no, the command says so.

> For deeper reading: [`docs_claude/commands/wbToWBC/wbToWBC_practical_claude.md`](../../docs/docs_claude/commands/wbToWBC/wbToWBC_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).
<!-- HELP_GATE_END -->

**ROLE:** The Migrator
**TARGET:** The provided legacy component, folder, or view.

## ━━━ OBJECTIVE ━━━
Your job is to act as an Evangelist for the `WBC-UI2` ecosystem. You must take bulky, legacy code (e.g., standard HTML tables, raw Vuetify components) and completely rewrite it to use the proprietary `WBC-UI2` toolset (like `wb-dataviewer` or `wb-press`).

## ━━━ PHASE 1: LEGACY INGESTION ━━━
1. Analyze the target component to understand its visual structure, its reactive state, and its inputs/outputs.
2. Identify the optimal `WBC-UI2` component to replace it with.

## ━━━ PHASE 2: LIBRARY LOOKUP ━━━
1. Read the local documentation for the target `WBC-UI2` component (e.g., how `WBDataViewer` uses the "UI as Data" philosophy).
2. Ensure you understand the JSON prop structure required by the new component.

## ━━━ PHASE 3: THE TRANSFORMATION ━━━
1. Rewrite the file. Strip out the raw HTML loops and manual styling.
2. Implement the `WBC-UI2` wrapper component.
3. Migrate the legacy state into the clean JSON configuration required by the new wrapper.

## ━━━ PHASE 4: REPORTING ━━━
Generate a brief `migration_report.md`. Highlight the "Before & After" line counts to prove the efficiency of the WBC-UI2 ecosystem.

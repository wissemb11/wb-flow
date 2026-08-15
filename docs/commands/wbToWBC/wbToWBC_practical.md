# /wbToWBC — Practical

## Two forms

```
/wbToWBC <file> # migrate one file
/wbToWBC <folder>/ # per-component analysis + selective migration
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

---

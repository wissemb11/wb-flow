# /wbRefactor — Practical

## One form

```
/wbRefactor <file-or-folder>
```

## When to run

Only when all of these are true:
- A recent `/wbAudit` flagged this target as needing restructure.
- Tests exist and currently pass.
- No open `/wbDebug` report on this target.
- You're in the polish phase, not the feature phase.

If any of these aren't true, don't run it. The command will likely refuse; you save time by not trying.

## When *not* to run

- Response to a bug → `/wbDebug` first, then fix, then audit.
- Code you just wrote and haven't tested → write tests first.
- Code that works but "looks old" without audit backing → wait for audit.
- Entire package refactors in one go → split into file-level refactors.

## The audit-refactor sequence

```
/wbAudit <pkg> # identifies what needs restructure
# review the audit findings
/wbRefactor <specific-file> # restructure one file at a time
/wbTest <pkg> # confirm tests still pass
/wbAudit <pkg> # confirm refactor improved things
/wbGit # commit the refactor
```

Note the *bracketing audits*. The first says "needs refactor." The second confirms "refactor helped." Without the second audit, you might ship a refactor that cleaned one thing while making another worse.

## What /wbRefactor preserves

- **Public signatures.** Exported functions keep their arguments and return types.
- **Error behavior.** Same throws for same inputs.
- **Observable side effects.** Network calls, storage writes, events emitted.
- **Performance characteristics.** Approximately — refactor shouldn't make things 10× slower.

## What /wbRefactor changes

- Internal structure (file splits, function extractions).
- Internal naming (private function names can change).
- Dead code removal (if clearly dead and tests confirm).
- Formatting and comments.

## The mistake to avoid

**Using `/wbRefactor` to "improve" code that isn't broken.** If there's no audit finding, don't refactor. Every refactor carries non-zero risk of introducing subtle behavior changes. Random cleanup of working code is pure downside.

## When /wbRefactor is the wrong command

- Bug fix → `/wbDebug` then describe the fix.
- New feature → just describe the feature.
- Renaming a function used across the monorepo → the blast radius is too big; use `/wbPlan` to coordinate.
- Converting legacy Vuetify to wbc-ui2 components → `/wbToWBC` (the specialized version of this).

---

# /wbClean — Practical

## One form

```
/wbClean <pkg-or-app>
```

No flags. The command is narrow: scan, report, done.

## When to run

- End of day / end of a work session — catches what you left behind while still fresh.
- Before `/wbAudit` in the afternoon polish phase — clean first, then audit the clean result.
- Before `/wbRelease` — confirm no `console.log` or debug code leaking to npm.
- After inheriting a package — baseline the debt.

## When *not* to run

- Before starting work — nothing to clean.
- On a package you rarely touch — low signal, wastes a report slot in `reports/`.
- As a substitute for `/wbAudit` — clean finds debris; audit finds design flaws. Different problems.

## Reading the output

Five report sections:

1. **Forgotten dev artifacts** — `console.log`, `debugger`, `TODO: hack` comments. Almost always safe to delete. HIGH confidence.
2. **Dead files** — 0 import references detected. MEDIUM confidence (could be dynamic).
3. **Unused imports** — imported, never referenced. HIGH confidence.
4. **Commented-out blocks** — still there from weeks ago. MEDIUM confidence — sometimes intentional.
5. **TODOs** — informational. Not a delete candidate; just a visibility surface.

Also mandatory: **"What this clean did NOT check"** section declaring coverage gaps (dynamic refs, build-time includes, historical context).

## The deletion step

`/wbClean` doesn't delete. To actually remove things, follow up with an explicit instruction in the same session:

```
"Delete all HIGH-confidence items from the last clean report."
```

The two-step discipline (detect, then remove) prevents silent loss of code the AI misclassified.

## The one mistake to avoid

**Auto-deleting everything the report flags.** `/wbClean` can be wrong about dead files (dynamic imports, reflective code, build-time string references). HIGH-confidence items are nearly always safe; MEDIUM items need a human glance. A 10-second sanity check per MEDIUM item is cheap.

## When /wbClean is the wrong command

- Restructuring code without changing behavior → `/wbRefactor`.
- Finding a specific bug → `/wbDebug`.
- Verifying release-readiness → `/wbAudit`.
- Checking tests pass → `/wbTest`.

`/wbClean` answers one question: *"what debris should I delete?"*

---

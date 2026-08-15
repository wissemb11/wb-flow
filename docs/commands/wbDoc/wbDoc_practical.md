# /wbDoc — Practical

## Two forms

```
/wbDoc <file> # JSDoc on functions + inline comments
/wbDoc <folder> # README + JSDoc across the folder
```

## When to run

- Before `/wbRelease` + `/wbPublish` — so npm users get current docs.
- When adding a new public export (document it immediately, before consumers depend on undocumented behavior).
- When `/wbAudit` flags missing JSDoc.
- Monthly-ish on actively-edited packages — docs drift fast.

## When *not* to run

- On a file that `/wbAudit` flagged for refactor — docs will be stale in a week.
- On internal helpers that aren't exported — documenting private is noise.
- On boilerplate — `package.json`, `vite.config.js`, etc. don't need generated docs.

## What good output looks like

- JSDoc with `@param`, `@returns`, `@example`, and `@remarks` for gotchas.
- Examples drawn from actual call sites, not invented.
- Explicit mention of open architectural decisions when relevant.
- Conventions from `dev.md` surfaced in the README (the `:wbCode="false"` rule, the `apiResponse_` cache, the `__WBC_PRO__` gate).

## What bad output looks like

- "This function takes a parameter" — restatement.
- "Use this carefully" — vague warning without specifics.
- Invented examples that don't match any real usage.
- Examples missing the `:wbCode="false"` you always apply.

If you see any of these, re-prompt: *"ground examples in actual call sites. Name the project-specific conventions. Drop generic prose."*

## The context.md sync

After `/wbDoc`, check that `context.md` API section matches what you just documented. If they disagree, pick one and fix the other — they should always agree.

## When /wbDoc is the wrong command

- Code review → `/wbAudit`.
- Finding dead code → `/wbClean`.
- Understanding how something works → read the code or `/wbContext --focus=<x>`.
- Writing user-facing marketing copy → `/wbBroadcast`, not `/wbDoc`.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbDoc --execute` and `/wbDoc -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

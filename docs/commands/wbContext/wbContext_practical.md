# /wbContext — Practical

## Three invocation forms

```
/wbContext <path> # standard — per-package
/wbContext <path> --focus="<subsystem>" # + focused sidecar file
/wbContext core2/ --scope=global # monorepo-wide survey
```

## When to run each

| Situation | Form |
|---|---|
| Start of a fresh AI session | `/wbContext <current-pkg>` |
| After pulling changes from git (if applicable) | `/wbContext <touched-pkgs>` |
| Before touching a complex subsystem | `/wbContext <pkg> --focus="<subsystem>"` |
| Monthly sanity check across the monorepo | `/wbContext core2/ --scope=global` |
| You rewrote a lot of a package | `/wbContext <pkg>` (re-run, not `/wbSetup`) |

## What you'll see in the output

1. **Baseline load** — age of stored context.md / dev.md. If > 30 days and the package is active, flag it.
2. **Drift report** — what changed between stored understanding and current code.
3. **Questions** — if drift requires a decision (e.g., "did you rename this on purpose?"), AI asks before updating.
4. **Report ingestion** — recent audits / debug reports surfaced into working memory.

## The one mistake to avoid

**Not answering the drift questions.** If the AI asks "was the rename intentional?" and you ignore it, `context.md` stays out of date. Every future session starts with the same stale baseline until you answer. Answer once, save yourself later.

## When /wbContext is *not* the right command

- You want to create context for a brand-new package → `/wbSetup`, not `/wbContext`.
- You want to know what everyone else has been doing → `/wbStandup`, not `/wbContext`.
- You want to verify everything is release-ready → `/wbAudit`, not `/wbContext`.

`/wbContext` answers one question only: *"Is my stored understanding of this package still correct?"* Use it for that. Don't overload it.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbContext --execute` and `/wbContext -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |
| `--scope` | `-s` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

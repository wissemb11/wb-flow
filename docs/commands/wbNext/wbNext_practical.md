# /wbNext — Practical

## When to run it

- **You sat down and don't know what to do.** This is the entire job of `/wbNext`.
- **End of a logical unit of work** — you finished a thing; what's the next thing?
- **After a long absence** — back from vacation, no idea what state the repo is in.

Do NOT run it:

- When you already have a `/wbPlan` open. Execute the next unchecked row instead.
- When you have a clear priority. The command's job is to break ties; don't ask it to override your judgment.
- More than once per session. Re-running it produces the same answer 95% of the time.

## The two forms

```
/wbNext # whole-monorepo scan, single recommendation
/wbNext <package-path> # narrowed to one package
```

## What it does, in order

1. **Reads recent `reports/`** (default: `--since=7d`). Looks for the latest `audit`, `plan`, `debug`, `standup`, `review`.
2. **Reads `git status`** and the last 3 commits. Has anything been started but not committed?
3. **Reads `dev.md`** for the target package(s). Are there refusals that flag work?
4. **Computes a single recommendation** with three things: *what* to run, *why* it's the best next move, and *what other options were considered and rejected*.

## The output shape

```text
Recommendation: /wbAudit packages/wb-core/

Why:
- Last /wbAudit on wb-core was 14 days ago.
- 8 commits since then; 3 touch the public API.
- /wbTest passed yesterday, so the gate is green for an audit.
- /wbStandup last week flagged "wb-core context drift" — audit will catch it.

Considered and rejected:
- /wbContext: stale-but-not-blocking; audit covers more ground.
- /wbDebug: no open errors in reports/.
- /wbRefactor: refactor without audit is the #1 mistake (see playbook).
```

The "considered and rejected" section is the real value. Without it, you're trusting a black box. With it, you can disagree if your judgment differs.

## When `/wbNext` will refuse to recommend

- **Working tree is dirty with uncommitted, unrelated changes.** First clean up; mixed states make every recommendation noisy.
- **No `reports/` exist for the target.** Run `/wbContext` first; `/wbNext` needs at least one prior signal.
- **Conflicting signals** (e.g., audit says ship, secure says don't). The command names the conflict and asks you to resolve it before recommending.

## When `/wbNext` is the wrong command

- You want a roadmap, not a single step → `/wbPlan` or `/wbVision`.
- You want a list of *everything* in flight → `/wbStandup`, not `/wbNext`.
- You want the AI to *do* the work instead of recommending it → describe the task directly.

## The one mistake to avoid

**Running `/wbNext` and then ignoring its recommendation because you "had a feeling."** Either run what it suggests, or take 60 seconds to articulate why your alternative is better. The articulation often reveals you were going to make the second-best choice for vibes-based reasons.

That said: `/wbNext` doesn't know about external pressure (deadlines, support tickets, what your boss said this morning). Override is fine when you have outside information; override is dangerous when you have only intuition.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbNext --execute` and `/wbNext -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--scope` | `-s` |
| `--since` | `-S` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

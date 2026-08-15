# /wbGit — Practical

## The 10-flag surface

```
/wbGit # draft commit message, no execution

# Information extraction
/wbGit --from-plan # -P : infer commit from today's plan
/wbGit --scan-recent # -r : infer from files modified < 2h
/wbGit --diff-file="diff.txt" # -d : read a user-provided patch

# Architectural context
/wbGit --amend # -A : amend the previous commit

# Execution
/wbGit --execute # -e : add + commit (confirmation)
/wbGit --push # -p : push current branch (confirmation)
/wbGit --force # -F : force push (refused unless overridden)
/wbGit --no-verify # -n : skip hooks (refused unless overridden)
```

Or use natural language: *"commit it"*, *"push"*, *"commit and push"*, *"commit as mixed change"*. Same surface — the AI parses intent and maps to flags.

## 🚀 Pro combinations (the chains worth memorizing)

Three chains carry 80% of the daily value:

| Chain | Command | What it does |
|---|---|---|
| **Daily Sync** (the EOD habit) | `/wbGit -P -e -p` | Plan-context → commit → push. Run this once per session. |
| **Deep Scan** (no plan, just diff) | `/wbGit -r -P` | Cross-reference recent file activity with the plan, then draft. |
| **Hotfix** (correcting last commit) | `/wbGit -A -p` | Amend the previous commit with current changes, then push. |

The Daily Sync is the one to lock into muscle memory. End of session → `/wbGit -P -e -p` → done. The plan file gets referenced in the commit body, the diff gets staged, the push happens — all under one confirmation gate.

## 💡 Natural-language pipes

Phrasing acts as a flag-equivalent. The AI parses these into the same 10-flag grammar:

| You say… | Effective flag(s) | Result |
|---|---|---|
| *"commit as mixed change"* | (forces `chore:` prefix) | Bypasses the mixed-change check; produces `chore: …` |
| *"commit in French"* / *"as expert, fr"* | (forces locale + voice) | Generates a long-form French message body |
| *"amend the last one"* | `--amend` | Rewrites HEAD instead of creating a new commit |

The natural-language path is for interactive use; the flag path is for scripts and chained commands. They produce identical output.

## When to run

- After every logical unit of work (one task done, one bug fixed, one example added).
- Before lunch / end of day — don't leave uncommitted work overnight.
- After `/wbRelease` — to commit version bumps and tag the release.
- After `/wbDeploy` — to commit any deploy-config changes.

## When *not* to run

- Mid-task, with half-done changes you'll throw away.
- Just to "save progress" — that's what stash is for, not commit.
- When tests are failing (commit broken code only if you're explicitly leaving a known-broken marker for tomorrow-you).

## The good rhythm

3-6 commits per working day. Less = you're batching too much (commits will mix purposes). More = you're commit-spamming (granular noise).

## The mandatory provenance header

Every the agent-generated commit message includes a `<!-- wbGit ... -->` block with five fields after the subject line: `date`, `model`, `session`, `plan`, `notes`. The block is HTML-comment-fenced so GitHub hides it visually but `git log` and `grep` still see it.

Example (real format):

```text
fix(wb-dataviewer): apiResponse_ cache stale on route change

<!-- wbGit
date: 2026-04-25 11:08
model: claude-opus-4-7
session: claude
plan: —
notes: resolves debug 20260419/debugs/apiResponse_loop.md
-->

Watcher key was reading apiResponse_ and writing it back...
```

Why every commit needs it: 6 months from now, `git blame` shows you which model drafted the message, which plan it advanced, and any salient notes (like "user authorized mixed-change override"). Without the header, you lose all that context.

Full header schema lives in `wbGit_template`. The `notes` field is the most useful day-to-day — fill it with anything future-you should know, otherwise write `—`.

## What `/wbGit` will refuse to do

- **Force push.** No `--force`. If your branch diverged, resolve it; don't overwrite.
- **Skip hooks.** No `--no-verify`. If a hook fails, the hook is right or the code is right; either way, fix the underlying issue.
- **Bundle unrelated changes silently.** If the diff has multiple unrelated purposes, the command surfaces this and asks you to split (or explicitly acknowledge the mix with a `chore:` message).
- **Auto-push to main on a protected branch.** If main is protected and you don't have permission, the command surfaces the failure rather than attempting workarounds.

## The mixed-change check

If the AI sees that one diff spans:
- A feature change
- A bug fix
- A docs update

…it will refuse to commit as one and propose splitting. This is hygiene, not paranoia. Mixed commits are unreviewable in PR; conventional changelogs depend on per-commit categorization; `git revert` becomes destructive.

If you genuinely want a mixed commit (rare — usually after a long forgotten branch), tell the AI explicitly: *"commit as mixed change"*. It will use a `chore:` prefix that acknowledges the mix.

## The `/wbGit` ↔ closed-loop interaction

`/wbGit` reads recent `reports/` to enrich commit messages. If a commit corresponds to a plan task, the message references the plan file. If it corresponds to a debug report, the message references the debug. This makes git history *queryable* against the report system.

## When /wbGit is the wrong command

- Stash unfinished work → use `git stash` directly (this is one of the few git commands you might do yourself; ask the user, don't reach for /wbGit).
- Resolve a merge conflict → don't auto-resolve; do it manually.
- Cherry-pick / rebase / interactive history rewrites → don't use `/wbGit`. These are user-driven operations.
- Initial repo setup → done once, manually.

`/wbGit` is for the daily commit/push rhythm. Anything more involved is yours.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbGit --execute` and `/wbGit -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--execute` | `-e` |
| `--force` | `-F` |
| `--no-verify` | `-n` |
| `--push` | `-p` |
| `--from-plan` | `-P` |
| `--diff-file` | `-d` |
| `--scan-recent` | `-r` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

# /wbGit: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbGit`

## Three forms

```
/wbGit                             # draft commit message, no execution
/wbGit --from-plan                 # infer commit from today's plan
/wbGit --diff-file="diff.txt"      # read user-provided patch
/wbGit --scan-recent               # infer from recently modified files
/wbGit --execute                   # add + commit (asks for confirmation)
/wbGit --push                      # push current branch (asks for confirmation)
```

Or use natural language: *"commit it"*, *"push"*, *"commit and push"*. Same result, AI parses intent.

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

Every Claude-generated commit message includes a `<!-- wbGit ... -->` block with five fields after the subject line: `date`, `model`, `session`, `plan`, `notes`. The block is HTML-comment-fenced so GitHub hides it visually but `git log` and `grep` still see it.

Example (real format):

```text
fix(wb-dataviewer): apiResponse_ cache stale on route change

<!-- wbGit
date:    2026-04-25 11:08
model:   claude-opus-4-7
session: claude
plan:    —
notes:   resolves debug 20260419/debugs/apiResponse_loop.md
-->

Watcher key was reading apiResponse_ and writing it back...
```

Why every commit needs it: 6 months from now, `git blame` shows you which model drafted the message, which plan it advanced, and any salient notes (like "user authorized mixed-change override"). Without the header, you lose all that context.

Full header schema lives in [wbGit_template_claude](../wbGit_template_claude.md). The `notes` field is the most useful day-to-day — fill it with anything future-you should know, otherwise write `—`.

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

> For deeper reading: [`docs_claude/commands/wbGit/wbGit_practical_claude.md`](../../docs/docs_claude/commands/wbGit/wbGit_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--execute` | `-e` |
| `--force` | `-F` |
| `--no-verify` | `-n` |
| `--push` | `-p` |
| `--from-plan` | `-P` |
| `--diff-file` | `-d` |
| `--scan-recent` | `-r` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-e` → `--execute`
- `-F` → `--force`
- `-n` → `--no-verify`
- `-p` → `--push`
- `-P` → `--from-plan`
- `-d` → `--diff-file`
- `-r` → `--scan-recent`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Archivist
**TARGET:** The current working directory repository.

## ━━━ OBJECTIVE ━━━
Your job is to manage version control safely and professionally. You must analyze the current file changes and generate standard Conventional Commits.

## ━━━ PHASE 1: RECONNAISSANCE ━━━
1. Determine the source of changes based on flags:
   - **Default**: You are forbidden from running terminal git commands. Ask the user for a summary.
   - **`--from-plan`**: Read the most recent `plan_*.md` and extract `✅ Done` tasks.
   - **`--diff-file="<path>"`**: Read the specified patch file directly.
   - **`--scan-recent`**: Find and read files modified in the last 2 hours.
2. Cross-reference the changes with any recent `plans/` or `standups/` to understand the context.

## ━━━ PHASE 2: COMMIT GENERATION ━━━
1. Draft a strict Conventional Commit message (e.g., `feat(wb-core): add logging capabilities`, `fix(dataviewer): resolve infinite loop in pagination`).
2. Include an optional body explaining *why* the change was made if it is complex.

## ━━━ PHASE 3: EXECUTION (Optional) ━━━
If instructed by the user, execute the `git add`, `git commit`, and `git push` sequence. If generating a Pull Request, write a comprehensive PR description detailing the architectural changes.

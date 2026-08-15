# /wbGit — Examples

> Self-help. `/wbGit` is the ONLY command that touches git for you. Every other command in the system is read-only against the working tree. This file shows how to use it without losing the "AI doesn't run git" safety rule.

---

## Six high-level scenarios (the v4 catalog)

Quick-reference: pick the scenario that matches your current need and copy the command. Each scenario uses one or more of the 10 supported flags. The detailed annotated transcripts that follow this section show what the AI actually outputs.

### 1. The Plan-Driven Commit (`-P -i="WBC-42"`)

**Scenario:** You completed plan tasks and want the commit to reference both the plan and a Linear/Jira ticket.
**Command:** `/wbGit -P -i="WBC-42"`
**What the agent does:** Reads today's `plan_*.md`, extracts `✅ Done` rows, drafts a multi-bullet body, appends `Refs: WBC-42`. No execution — drafting only.
**Why it's a strength:** the agent's strict parsing of the 4D plan layout means the commit body matches the plan's structure exactly (1 task = 1 bullet, no paraphrasing).

### 2. Knowledge Graph Synergy (`-L`)

**Scenario:** You want the commit to permanently link to the `Understand-Anything` graph snapshot of the architecture at this point in time.
**Command:** `/wbGit -L -e`
**What the agent does:** Captures the local Vite dashboard URL + token, embeds it in the `<!-- wbGit ... -->` provenance header under `notes:`, then runs add+commit (with confirmation).
**Why it's a strength:** The graph URL is captured at *commit time*, not retroactively, so future archaeologists see the exact state of the codebase being committed.

### 3. The Multilingual Expert Commit (`-l="fr"` via NL pipe)

**Scenario:** A French-speaking reviewer needs a long-form architectural rationale, not a one-line subject.
**Command:** `/wbGit --from-plan "as expert, fr"`
**What the agent does:** Generates the standard subject in French (`refactor(core): migration vers …`), writes a 3-4 paragraph body in French, keeps the `<!-- wbGit -->` header in English (machine-readable).
**Why it's a strength:** the agent separates *human-facing prose* (translatable) from *machine-facing metadata* (always English). No locale leakage into the provenance block.

### 4. The Hotfix Amend (`-A -p`)

**Scenario:** You just committed, then realized you forgot a file or had a typo in the message. You haven't pushed yet.
**Command:** `/wbGit -A -p`
**What the agent does:** Stages new changes onto HEAD, runs `git commit --amend`, then pushes. Two confirmation gates (amend, push) — the agent refuses to amend a *pushed* commit unless you also pass `--force`, which itself requires explicit override.
**Why it's a strength:** the agent treats `--amend` after `git push` as a destructive op (history rewrite). The default refusal protects shared branches.

### 5. The Mixed-Change Override (NL pipe)

**Scenario:** A short branch accumulated a feature + an unrelated docs tweak; splitting isn't worth the ceremony.
**Command:** `/wbGit "commit as mixed change" -e`
**What the agent does:** Skips the standard mixed-change refusal, prefixes the message with `chore:`, lists every category in the body so reviewers see the mix wasn't accidental.
**Why it's a strength:** The `chore:` prefix is the documented escape hatch — the agent won't silently produce a `feat:` for a mixed diff. The override is loud, not hidden.

### 6. The Deep Recent-Activity Scan (`-r -P -L`)

**Scenario:** Long session, no plan checkpoint, several scattered file edits. You want one commit that synthesizes everything.
**Command:** `/wbGit -r -P -L`
**What the agent does:** Cross-references files modified in the last 2 hours (`-r`) with whatever plan exists (`-P` falls back gracefully if no `✅` rows), embeds the dashboard URL (`-L`), drafts a synthesis commit. No execution.
**Why it's a strength:** The three flags compose without conflict because they're all *information sources* — the agent merges them into a single coherent message instead of producing three separate paragraphs.

---

## The cardinal rule

**The AI does not run `git` unless you invoke `/wbGit`.** This is a project-wide feedback rule: memory says "never use git commands." `/wbGit` is the single exception, and its design explicitly respects that:

- `/wbGit` with no execution flag = *propose* a commit message. Does not run git.
- `/wbGit --execute` (or natural-language equivalents like "commit and push") = actually run git commands.
- The two are separate. Drafting is default; executing requires a deliberate request.

---

## Example 1 — `/wbGit` (draft mode, no execution)

You finished a logical unit of work. You want to know what the commit message should be.

```text
$ /wbGit

[AI] Running: git status (read-only, allowed) ...
[AI] Modified: packages/wb-core/src/components/WBCodeSlot.vue
[AI] Modified: packages/wb-core/src/index.js
[AI] New: packages/wb-core/tests/WBCodeSlot.spec.js
[AI]
[AI] Running: git diff --cached + git diff (read-only)...
[AI] 3 files changed, +187 / -4
[AI]
[AI] Cross-referencing with reports/ ...
[AI] plan_wbCodeSlot_202604231840.md: tasks 1-5 completed
[AI] Context: this diff implements the plan
[AI]
[AI] Generated commit message:

feat(wb-core): add WBCodeSlot component with dev-only gating

<!-- wbGit
date: 2026-04-25 17:42
model: claude-opus-4-7
session: claude
plan: reports/20260423/plans/plan_wbCodeSlot_202604231840.md
notes: closes plan tasks 1-5; one task validated independently
-->

Implements WBCodeSlot following the existing WBCode pattern with
strict __WBC_DEV__ gating. Exported from src/index.js; covered by
new test suite.

Refs plan_wbCodeSlot_202604231840.md.

[AI] NOT executing. To actually commit, run:
[AI] /wbGit --execute
[AI] OR tell me: "commit with this message"
```

**What's worth noticing:**

- Only `git status` and `git diff` were run — both read-only. No `git add`, `git commit`, `git push`.
- The commit message follows Conventional Commits (`feat(scope): summary` + body + refs).
- The message references the plan file — closed loop in git history.
- Explicit pointer to how to actually execute. No hidden behavior.

---

## Example 2 — `/wbGit --execute` (actually commit)

```text
$ /wbGit --execute

[AI] Re-running draft... (same output as Example 1)
[AI]
[AI] You're asking me to execute. I will now run:
[AI] git add packages/wb-core/src/components/WBCodeSlot.vue
[AI] git add packages/wb-core/src/index.js
[AI] git add packages/wb-core/tests/WBCodeSlot.spec.js
[AI] git commit -m "feat(wb-core): add WBCodeSlot component..."
[AI]
[AI] NOT running git push. Pushing is a separate step.
[AI] To push, tell me explicitly: "push".
[AI]
[AI] Proceed with add + commit? (y/n)
```

User confirms `y`:

```text
[AI] Executing...
[AI] ✅ git add (3 files)
[AI] ✅ git commit (sha: a1b2c3d)
[AI]
[AI] Done. Commit a1b2c3d on branch main.
[AI] Push is still pending. Run: "push" or /wbGit --push.
```

**What's worth noticing:**

- The AI *separates* add/commit from push. Never combines them silently. Push is a different risk class.
- Even with `--execute`, a final confirmation is asked. The user can still back out.
- The AI names exact commands before running. No hidden steps.

---

## Example 3 — `/wbGit` refuses to commit because changes are mixed

Multiple unrelated changes in one commit is a code-review anti-pattern. The command catches this.

```text
$ /wbGit

[AI] git diff analysis:
[AI] File 1: packages/wb-core/src/components/WBCodeSlot.vue (+145 -2)
[AI] → feature: new component
[AI] File 2: packages/wb-dataviewer/src/App.vue (+3 -4)
[AI] → bug fix: apiResponse_ cache invalidation
[AI] File 3: frontEnd/wbc-ui/core2/packages/wb-flow/templates/.../README.md (+40 -8)
[AI] → docs: unrelated update to command docs
[AI]
[AI] ⚠ Detected 3 unrelated changes in one working tree.
[AI] A Conventional Commit expects ONE logical change per commit.
[AI]
[AI] Options:
[AI] 1. Split into 3 commits. I can stage each one separately:
[AI] - feat(wb-core): WBCodeSlot component
[AI] - fix(wb-dataviewer): apiResponse_ cache invalidation
[AI] - docs: update command reference README
[AI]
[AI] 2. Commit as one anyway. Override with:
[AI] "commit as mixed change" — and I'll write a "chore:" style
[AI] message that acknowledges the mix.
[AI]
[AI] 3. Review manually and tell me which files go together.
[AI]
[AI] Not committing yet. Waiting for your direction.
```

**What's worth noticing:**

- The AI analyzes the diff *semantically*, not just by file. It recognizes that the three changes have different purposes.
- Three options: split, mixed with acknowledgment, or manual. Defaults to split because that's better hygiene.
- Does not silently commit a mixed change. Forces user awareness.

---

## Example 4 — `/wbGit --push` (pushing, with safeguards)

```text
$ /wbGit --push

[AI] Current branch: main
[AI] Commits ahead of origin/main: 3
[AI] a1b2c3d feat(wb-core): add WBCodeSlot component
[AI] b2c3d4e fix(wb-dataviewer): apiResponse_ cache invalidation
[AI] c3d4e5f docs: update command reference README
[AI]
[AI] Target: push to origin/main.
[AI]
[AI] Safeguards I will NOT bypass:
[AI] - No --force push
[AI] - No --no-verify
[AI] - If main is protected, I will fail honestly rather than
[AI] attempting workarounds
[AI]
[AI] Proceed? (y/n)
```

User confirms `y`:

```text
[AI] Executing: git push origin main
[AI] ✅ pushed 3 commits
[AI]
[AI] Writing reports/20260424/gits/git_push_202604241100.md
```

**What's worth noticing:**

- The AI lists exact commits before pushing. User can spot a surprise commit before it goes live.
- Explicit declaration that `--force` and `--no-verify` are off the table. These are destructive and require user override, not AI discretion.
- If hooks fail, the AI surfaces the failure — does not try `--no-verify` as a workaround.

---

## Example 5 — `/wbGit` refused because hooks failed

```text
$ /wbGit --execute

[AI] Running pre-commit hooks...
[AI] ❌ eslint failed on src/components/WBCodeSlot.vue:45
[AI] "unused variable 'foo'"
[AI]
[AI] Commit blocked by pre-commit hook.
[AI]
[AI] I will NOT skip the hook with --no-verify. If the hook is
[AI] wrong, fix the hook. If the code is wrong, fix the code.
[AI] Skipping hooks hides problems.
[AI]
[AI] Current state:
[AI] - No commit was created.
[AI] - Files are still staged.
[AI] - You can edit and re-run /wbGit --execute.
```

**What's worth noticing:**

- Hook failure = no commit. Period. No silent `--no-verify`.
- The AI explains *why* — skipping hooks hides problems. Same principle as refusing `--force`.
- State is preserved: staged files stay staged. User fixes and retries.

---

## The pattern

Every `/wbGit` run has:

1. **Read-only git inspection** — `git status`, `git diff`. Always safe.
2. **Semantic diff analysis** — what kind of change is this?
3. **Conventional Commit message draft** — `type(scope): summary`.
4. **Cross-reference with reports/** — if a plan matches, reference it.
5. **Mixed-change detection** — refuse silent batching.
6. **Execution gate** — `--execute` or explicit confirmation required.
7. **Push separately** — never bundled with commit.
8. **No destructive flags** — `--force`, `--no-verify` require user override.

---

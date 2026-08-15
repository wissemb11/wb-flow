# /wbGit — Expert

## What `/wbGit` architecturally is

A **safety-bounded git proxy** that splits message generation from command execution. Only command in the system that mutates the git index. Bound by an explicit safety envelope: no destructive flags, no silent batching, no hook bypassing, no auto-push to protected branches.

The architectural contribution is the *bounded exception*. The project's standing rule (from user feedback memory) is "AI does not run git." `/wbGit` is the single carve-out. Its design — explicit invocation, separate confirm-then-execute, hard-coded refusal of destructive operations — preserves the spirit of the rule while making one specific use case ergonomic.

## The bounded-exception design pattern

Most "AI tooling" treats git as available by default. The AI runs `git add` / `git commit` / `git push` whenever it thinks helpful. This is fine for low-stakes operations and disastrous for production repos.

This project inverts the default. Git is *not* available by default. The AI cannot reach git through any other command. To get to git, you must:

1. Type `/wbGit` (or natural-language equivalent).
2. Receive a draft.
3. Explicitly authorize execution (`--execute`, `--push`, or "commit it").
4. Pass each safety gate (mixed-change detection, hook respect, branch protection check).

This pattern — *bounded delegation with mandatory user friction* — is the right model for any AI doing high-stakes operations. It's slower than auto-everything; it's safer.

## Three design decisions worth naming

### 1. Draft-then-execute as default
Calling `/wbGit` without any flag never runs git mutations. It produces a proposed commit message and stops. To actually commit, the user must add a flag or natural-language confirmation. This separation is the friction that prevents accidents.

### 2. Hard-coded refusal of destructive flags
The command's prompt explicitly forbids `--force`, `--no-verify`, `--no-gpg-sign`. Even if the user asks for these, the command should refuse and explain why (history rewrite, hook bypass, signature bypass — all are user-must-do operations, not AI-can-do).

The user can override by running `git --force` themselves. The command just declines to do it on their behalf.

### 3. Conventional Commits as the message contract
Every generated message follows `type(scope): summary` + body + optional refs. Not because the AI is dogmatic about formats, but because this format is what `/wbRelease` reads to compute version bumps. `/wbGit` and `/wbRelease` form a contract — git messages drive semver computation.

If the project's commit convention is different, `/wbGit`'s template would need to change. The contract is what makes the integration work.

## The semantic-diff analysis

the agent's expert version mentions "AST mutations to Semantic Versioning triggers." That's overly technical. What's actually happening:

- The AI reads the diff content (not the AST formally).
- It classifies each changed file by intent (feature / fix / refactor / docs / test / config).
- It groups changes that share intent into one commit candidate.
- It flags inter-group differences as "mixed" and refuses silent batching.

This is *semantic understanding of the diff*, not formal AST analysis. Calling it AST overstates what's really LLM diff-reading.

## Where the command leaks

1. **Semantic diff classification can be wrong.** The AI says "this is a refactor" and you know it's a behavior change. The classification drives the commit message; misclassification produces misleading messages. Always read the proposed message before authorizing.

2. **No interactive add support.** `/wbGit` adds all-or-nothing per file. If part of a file should be in one commit and part in another, you need `git add -p` manually. The command doesn't handle this granularity.

3. **No branch context awareness.** The command doesn't know if you're on a feature branch vs. main. It will commit the same way to either. Branch-aware logic (e.g., "this is main; ask for confirmation harder") would be useful.

4. **Hook output may be opaque.** If a pre-commit hook fails with a cryptic error, the command surfaces the error but can't always interpret it. User has to read the hook output themselves.

5. **No commit signing handling.** GPG signing is configured at the git level, not by `/wbGit`. If signing is required and not configured, the commit fails. The command doesn't help configure signing.

## The interaction with the no-git rule

The user feedback memory says "do not run git commands." This is a hard rule outside `/wbGit`. Inside `/wbGit`, the rule is preserved as:

- `git status`, `git diff`, `git log` (read-only) — always allowed within the command.
- `git add`, `git commit`, `git tag` (writes to local repo) — only with explicit `--execute` or confirmation.
- `git push` — only with explicit `--push` or confirmation, separate from commit.
- `git reset --hard`, `git rebase`, `git push --force` — never. User must do these themselves.

The architectural insight is that "no git" really means "no destructive or surprising git." Read-only git is fine; bounded write git is fine; destructive git is not. `/wbGit` encodes this distinction.

What `wb-flow-docs`'s playbook gets wrong about `/wbGit`: treating it as a full git client, when the Claude edition constrains it to diff analysis + commit message drafting + optional commit/push. The refusal to do interactive rebase, branch management, or force-push is a safety boundary, not a feature gap.

## One-paragraph verdict

A safety-bounded git proxy whose architectural contribution is the *bounded exception* pattern — turning a project-wide "no AI git" rule into a single explicit command with hard safety gates. Correct in the draft-then-execute split, in the hard refusal of destructive flags, and in the Conventional Commits contract with `/wbRelease`. The "AST mutations to SemVer triggers" framing from gemini overstates what's really LLM diff-reading. Weakest in semantic-diff misclassification (always read the message), interactive-add granularity, branch-aware confirmation, hook-output interpretation, and signing configuration. Correct for solo monorepo development under the "AI doesn't run git" discipline; would need branch-protection-aware logic for team-scale.

---

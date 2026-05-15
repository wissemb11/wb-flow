# /wbGit — Expert Guide

## Architecture

`wbGit` is a **non-execution command** — it never runs git commands directly. It reads staged diffs via `git diff --cached`, analyzes the patch content, and generates a commit message in Conventional Commits format (`type(scope): description`).

The analysis pipeline: **Diff parsing** → **Change classification** (feat/fix/refactor/etc.) → **Scope inference** (from file paths) → **Breaking change detection** (API signature analysis) → **Message composition**.

## Key Design Decisions

- **Safety first:** Never modifies git state. The user runs `git commit` manually after reviewing the message.
- **Scope inference:** Uses directory structure, not heuristics. `src/auth/login.ts` → scope `auth`.
- **Breaking changes:** Detected via pattern matching on function signatures, type exports, and config files.

## When NOT to Use

- When you need to craft a narrative across multiple commits (use interactive rebase instead)
- For trivial changes where the message is obvious (`fix typo`)
- In CI environments where commits are automated (use `--yes` with caution)

## Edge Cases

- **Empty diffs:** Returns a message saying no changes detected
- **Binary files:** Skipped with a warning
- **Large diffs:** Samples the diff to stay within context limits
- **Merge commits:** Detected and handled separately (uses merge message conventions)


## Advanced Usage

For complex commits with changes across multiple modules, run `/wbGit` once per logical change area. This produces cleaner commit history with accurate scopes.

### Configuration

You can customize the commit format via `.wb/git-config.json`:
- `max-line-length`: Maximum line length for the commit description (default 72)
- `scope-map`: Custom mapping of directory patterns to scope names
- `type-map`: Custom mapping of change patterns to commit types


## Related

- [wbGit ELI5](wbGit_eli5.md) — Beginner-friendly overview
- [wbGit Practical](wbGit_practical.md) — Step-by-step walkthrough
- [Commands Overview](../README.md) — Full command catalog

---


← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

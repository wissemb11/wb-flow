# wbGit — ELI5 Guide

## What is this?

Analyzes your staged changes and writes a conventional commit message based on the diff content. It inspects every changed line, identifies the type of change (feature, fix, refactor, docs, etc.), the affected module or area, and crafts a message that follows the Conventional Commits specification.

The analysis works in stages: first it examines the diff to understand the change's purpose, then it classifies the type, infers the scope from file paths, and checks for breaking changes by looking at API surface modifications. The result is a properly formatted commit message ready for review or direct use.

**What It Analyzes:**
- **Diff content** — reads every added and removed line to understand the change's purpose
- **File paths** — uses directory structure to determine the scope/module (e.g., `src/auth/` → `auth`)
- **Change type** — classifies as `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, or `style`
- **Breaking changes** — detects API signature changes, removed exports, or config format shifts
- **Scope inference** — maps files to known project areas (components, hooks, utilities, pages)

**When to use it:** Before every commit. Run `wbGit` instead of manually typing `git commit -m`, especially when you've made many small changes and want consistent, well-formatted messages across the team.

## Why do I need it?

Writing good commit messages is hard — this reads what you changed and writes a clear, conventional message for you. Consistent commits make changelogs automatic, code reviews faster, and `git bisect` much more informative. Teams that adopt conventional commits see significantly fewer "what does this commit do?" questions in PR reviews.

**Tips:**
- Use `--review` for the first few times to build trust in the generated messages
- If the scope detection seems off, organize related changes in separate commits before running `wbGit`
- The command does NOT commit automatically by default — review the message first unless you use `--yes`

## Simple Example

**Basic usage:** `/wbGit` — stages everything and generates a commit message like `feat(auth): add login endpoint`.

**Specific files only:** `/wbGit src/components/ src/hooks/` — only considers changes in the given paths for the commit message, useful when you've made unrelated changes in other areas.

**Message review mode:** `/wbGit --review` — generates the proposed message and shows you the diff summary so you can confirm or adjust before the commit is made. Prevents accidental mislabeled commits.

**Breaking change detection:** `/wbGit --breaking` — explicitly asks the analyzer to check for breaking API changes, which adds a `BREAKING CHANGE:` footer to the message if detected.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


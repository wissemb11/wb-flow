# wbCheck — ELI5 Guide

## What is this?

Runs a quick pre-commit or pre-push check to catch common issues before they reach your repository. It executes a battery of lightweight validations on your staged or working changes — linting, type checking, formatting, and secret scanning — and reports any problems with fix suggestions.

The check engine is designed for speed — it only scans changed files rather than the entire project, uses incremental type checking where possible, and parallelizes independent checks. Most checks complete in under 5 seconds even on large repositories, making it practical to run before every commit.

**What It Checks:**
- **Lint violations** — runs ESLint (or your configured linter) on changed files only for speed
- **Type errors** — checks TypeScript types in the changed scope without a full `tsc --noEmit`
- **Formatting** — verifies Prettier/dprint formatting on staged files
- **Secret leaks** — scans diffs for API keys, tokens, passwords, and private keys using regex patterns
- **Import validity** — checks that all imported modules resolve correctly
- **File size** — warns about abnormally large files that should not be committed
- **Merge conflicts** — detects leftover conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)

**When to use it:** Before every commit. Add it as a git pre-commit hook for automatic enforcement. Run it in CI as a fast first-pass gate before the full test suite.

## Why do I need it?

Catches silly mistakes before they pollute your git history or break CI. Running `wbCheck` before every commit is like spell-check before sending an email — it prevents the embarrassment of a broken `main` branch and saves the 10-minute CI round-trip. Teams that adopt pre-commit checks see significantly fewer "fix lint" and "fix types" follow-up commits.

**Tips:**
- Use `--fix` to auto-apply safe corrections (lint autofix, formatting) — review the changes before committing
- Configure your IDE to run `wbCheck --staged` on file save for instant feedback
- Run `--strict` in CI to enforce a higher bar than local development

## Simple Example

**Pre-commit check:** `/wbCheck` — scans all staged files and returns a pass/fail report with line-level annotations for each issue found.

**Check specific path:** `/wbCheck src/components/ --fix` — checks only the components directory and auto-fixes lint and formatting issues where possible.

**CI gate:** `/wbCheck . --strict --fail-on warning` — runs on the entire working tree with strict mode (warnings treated as errors), suitable for CI pipeline gating before merge.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


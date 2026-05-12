# wbReview — ELI5 Guide

## What is this?

Performs a thorough code review of your changes — analyzing diff size, logic correctness, test coverage, and adherence to project conventions. It produces a structured review report with specific, actionable comments that human reviewers can use as a first pass.

The review engine checks each changed line against dozens of rules organized by category: correctness (will this work?), style (does this match our conventions?), performance (will this be fast enough?), and security (does this introduce risk?). Each finding includes a severity level and a concrete suggestion for improvement.

**What It Reviews:**
- **Logic correctness** — checks for off-by-one errors, null dereferences, race conditions, and incorrect conditionals
- **Test coverage** — verifies new code has corresponding tests and existing tests still pass
- **Code style** — validates naming conventions, file organization, import ordering, and consistent patterns
- **Performance** — flags expensive operations in hot paths, unnecessary re-renders, and N+1 queries
- **Security** — checks for injection vulnerabilities, auth bypasses, and unsafe data exposure
- **Error handling** — ensures try/catch blocks actually handle errors instead of swallowing them
- **Documentation** — requires docstrings for new public APIs and updated comments for changed logic

**When to use it:** Before submitting a PR for human review. Use it as your personal pre-review checklist to catch obvious issues before your teammates see them.

## Why do I need it?

Code reviews catch bugs, but thorough reviews take time — and tired reviewers miss things. `wbReview` acts as an always-vigilant first pass, catching the obvious issues so human reviewers can focus on architecture, design, and product concerns instead of missing semicolons. Teams using automated pre-review report fewer review rounds per PR.

**Tips:**
- Provide context with `--context` to help the reviewer understand your intent
- Review the output before sharing — some auto-generated comments may need human judgment
- Use `--diff main...HEAD` to review the entire feature branch, not just staged changes

## Simple Example

**Review staged changes:** `/wbReview` — analyzes all staged changes and produces a structured review with comments, severity levels, and fix suggestions.

**Review branch:** `/wbReview --diff main...HEAD` — reviews every change on the current branch compared to `main` and includes a summary of overall diff health (size, risk level, test coverage percentage).

**Review with context:** `/wbReview --context "This adds OAuth login with Google and GitHub"` — provides additional context so the review understands your intent and can give more relevant feedback about implementation choices.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


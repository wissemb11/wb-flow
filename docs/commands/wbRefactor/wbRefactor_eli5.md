# wbRefactor — ELI5 Guide

## What is this?

Analyzes your code for structural improvements — dead code, duplication, overly complex functions, and naming issues — and produces a refactoring plan with proposed changes. It's like having a senior developer walk through your code and leave sticky notes on everything that needs improvement.

The analysis engine evaluates code against established software design principles. It calculates cyclomatic complexity, measures coupling and cohesion, detects code clones, and flags violations of common patterns like DRY, KISS, and the Single Responsibility Principle. Each finding is rated by confidence and impact so you know what to fix first.

**What It Finds:**
- **Dead code** — unused exports, unreachable branches, unused parameters, and commented-out blocks
- **Duplication** — identical or near-identical code blocks that should be extracted into shared utilities
- **Complexity hotspots** — functions exceeding cyclomatic complexity thresholds, deeply nested conditionals, and excessive indirection
- **Naming issues** — misleading variable names, inconsistent naming conventions, magic numbers and strings
- **Structural smells** — god classes, feature envy, shotgun surgery patterns, and inappropriate intimacy between modules
- **Type safety gaps** — implicit `any` types, missing generics, over-broad type assertions
- **Testability concerns** — tightly coupled code, side-effect-heavy functions, and hard-to-mock dependencies

**When to use it:** Before tackling a new feature in an old codebase — cleaning up the area first reduces accidental complexity. Also useful during dedicated refactoring sprints.

## Why do I need it?

Code quality degrades slowly — each PR adds a little complexity, a little duplication, a little dead code. Over months, the codebase becomes hard to change. `wbRefactor` gives you an objective, prioritized list of what to fix so you can pay down technical debt intentionally instead of letting it accumulate silently.

**Tips:**
- Start with `--min-confidence 0.8` to get only high-confidence findings and avoid noise
- Use `--auto-fix --safe-only` for the easy wins (rename, extract, inline) and review the rest manually
- Run `wbRefactor` before and after a big feature to measure the impact on code health

## Simple Example

**Analyze file:** `/wbRefactor src/utils/helpers.ts` — analyzes the file for code smells and returns a prioritized refactoring plan with line-level suggestions.

**Analyze module:** `/wbRefactor src/api/ --min-confidence 0.8` — scans the entire `api` module and reports only findings with high confidence (>80%), filtering out noise.

**Auto-refactor:** `/wbRefactor src/ --auto-fix --safe-only` — automatically applies safe refactorings (rename, extract, inline) while skipping transformations that could change behavior.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


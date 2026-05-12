# wbDoc — ELI5 Guide

## What is this?

Generates and updates documentation for your project — README files, API docs, inline code comments, and changelogs — by reading your actual source code. It keeps documentation in sync with your code so you never have a stale README again.

The documentation engine extracts information from multiple sources: JSDoc/TSDoc comments for API signatures, conventional commits for changelogs, package.json for project metadata, and source code structure for architecture docs. It can generate new files from scratch or update existing ones by merging new content with preserved hand-written sections.

**What It Generates:**
- **README files** — project overview, setup instructions, API reference, and contribution guide
- **API documentation** — function signatures, parameter descriptions, return types, and usage examples extracted from JSDoc/TSDoc
- **Changelog entries** — structured release notes from conventional commit history
- **Code comments** — inline explanations for complex functions, algorithms, or non-obvious logic
- **Architecture docs** — module dependency diagrams, data flow descriptions, and component hierarchy
- **Migration guides** — step-by-step upgrade paths when APIs change between major versions

**When to use it:** Before every release to ensure changelogs are complete. After significant refactors to update architecture docs. Onboarding new contributors who need project documentation.

## Why do I need it?

Nobody likes writing docs, and docs get stale fast. `wbDoc` treats documentation as a generated artifact — write code, get docs. It catches undocumented public APIs, outdated examples, and missing edge-case notes before your users file complaints. Teams using `wbDoc` report significantly fewer "this is not documented" issues and faster onboarding for new members.

**Tips:**
- Start with `--readme` to get a solid foundation, then customize the generated output
- Use `--api` regularly to maintain API docs as your interfaces evolve
- Hand-write usage examples and edge cases — `wbDoc` captures signatures but humans capture intent

## Simple Example

**Generate README:** `/wbDoc --readme` — reads your package.json (name, description, deps), scans the source tree, and generates a comprehensive README with setup, API reference, and examples.

**Update API docs:** `/wbDoc --api src/lib/ --format markdown --out docs/api/` — generates markdown API documentation for every exported function in `src/lib/` with signatures and parameter descriptions.

**Changelog update:** `/wbDoc --changelog --from v1.0.0 --to v1.1.0` — parses conventional commits between two git tags and produces a formatted changelog section.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


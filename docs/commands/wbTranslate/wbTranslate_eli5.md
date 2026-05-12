# wbTranslate — ELI5 Guide

## What is this?

Translates your source code or documentation from one programming language or human language to another, preserving structure, conventions, and idiomatic patterns. It understands both the source and target ecosystems and produces code that looks native.

The translation engine works at the AST (Abstract Syntax Tree) level rather than as text replacement. This means it understands the semantics of your code — not just the syntax — and can produce idiomatic equivalents in the target language. For framework migrations, it maps patterns between ecosystems (e.g., React lifecycle methods to hooks).

**What It Translates:**
- **Programming languages** — TypeScript to Python, JavaScript to Rust, Java to Kotlin, and many more pairs
- **Framework migrations** — React class components to hooks, Vue Options API to Composition API, Redux to Zustand
- **Human languages** — translates documentation, comments, and user-facing strings between languages
- **API surface preservation** — maintains the same function signatures, export structure, and type interfaces where possible
- **Idiom mapping** — translates patterns to target-language equivalents (e.g., Array.map in JS to list comprehension in Python)
- **Test translation** — translates test files preserving assertions and coverage intent

**When to use it:** When migrating between languages or frameworks, or when you need documentation in multiple human languages. Not recommended for one-off small code snippets.

## Why do I need it?

Rewriting code in another language is tedious and error-prone. Manual translation introduces subtle bugs and misses language-specific idioms. `wbTranslate` handles the mechanical translation so you can focus on reviewing correctness and performance. A full TypeScript-to-Python translation that would take days can be done in minutes.

**Tips:**
- Review the output carefully — automated translation handles the common cases but edge cases need human attention
- Use `--in-place` carefully — make sure you have a clean git state first
- For human language translation, provide context about the audience (technical vs. general)

## Simple Example

**Translate file:** `/wbTranslate src/auth.js --target python --out src/auth.py` — translates the auth module from JavaScript to idiomatic Python.

**Translate docs:** `/wbTranslate README.md --lang fr` — translates your project README to French while preserving markdown formatting and code blocks.

**Translate project:** `/wbTranslate src/ --from js --to ts --in-place` — converts an entire JavaScript project to TypeScript, adding type annotations inferred from usage patterns and JSDoc comments.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


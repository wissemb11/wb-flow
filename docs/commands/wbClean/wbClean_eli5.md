# wbClean — ELI5 Guide

## What is this?

Removes clutter and temporary artifacts from your project — `node_modules`, build output, cache directories, coverage reports, and generated files. It understands your project's framework and cleans only what's safe to delete, preserving configuration and source files.

The cleaner uses a framework-aware ruleset — for a Next.js project it knows to clean `.next/` and `out/`, for a Vue project it targets `dist/`, for a Rust project it removes `target/`. It also respects `.gitignore` patterns to avoid deleting files that are intentionally tracked.

**What It Cleans:**
- **Dependency directories** — `node_modules`, `.pnpm-store`, `.yarn/cache` (with `--deep` flag)
- **Build output** — `dist/`, `build/`, `.next/`, `out/`, `.nuxt/`, `target/` depending on framework
- **Cache folders** — `.cache/`, `.eslintcache`, `.parcel-cache`, `.turbo/`, `coverage/`
- **Generated files** — TypeScript declaration files (`*.d.ts`) in source directories, CSS-in-JS runtime artifacts
- **Temporary artifacts** — `.DS_Store`, `*.log`, `*.tsbuildinfo`, `.terraform/*.tfstate.backup`
- **Lock file orphans** — warns about stale `yarn.lock` entries for removed packages

**When to use it:** After major dependency changes, before switching branches, or when disk space is tight. Run `--dry-run` first if you're unsure what will be deleted.

## Why do I need it?

Your project accumulates junk over time — build artifacts, cached data, temporary files. This reclaims disk space and ensures your next build is truly fresh. A clean project also avoids weird bugs caused by stale caches or leftover build artifacts that confuse your tools. A typical project can reclaim 200-500 MB or more with a deep clean.

**Tips:**
- Use `--dry-run` the first time to see exactly what would be deleted
- Run `--deep` only when debugging build issues — removing `node_modules` means a full reinstall
- Add `wbClean` to your weekly dev hygiene routine along with `git gc`

## Simple Example

**Standard clean:** `/wbClean` — removes common build output and cache directories, keeping source and config files untouched.

**Deep clean:** `/wbClean --deep` — removes `node_modules` and lock files too, requiring a full `npm install` on the next build. Useful for debugging dependency-related issues.

**Dry run preview:** `/wbClean --dry-run` — shows exactly which files and directories would be deleted without actually removing anything. Run this first if you're nervous about what `wbClean` might delete.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


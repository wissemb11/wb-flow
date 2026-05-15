# wbToWBC — ELI5 Guide

## What is this?

Generates a production-ready WebBundlerConfig (WBC) by reading your `package.json`, `tsconfig.json`, and project structure — no manual config writing required. It detects whether you're using React, Vue, Svelte, or vanilla TypeScript, then selects the right loaders, plugins, and optimization settings for your stack.

Instead of dumping a 200-line config file and leaving you to figure it out, the output is organized into clearly named sections with inline comments explaining each choice. It also generates separate development and production presets — sourcemaps and HMR for dev, code splitting and tree shaking for prod — so you never accidentally ship debug config to production.

**What It Generates:**
- Framework-appropriate entry point detection (e.g., `src/main.tsx` for React, `src/main.js` for Vue)
- Loader chains for TypeScript, JSX, CSS modules, images, and fonts — no manual `rules` array fiddling
- Production optimizations: code splitting via dynamic imports, tree-shaking, CSS extraction, and content-hashed filenames
- TypeScript path alias resolution mapped to bundler-compatible resolve aliases
- A `.nojekyll` marker and correct `publicPath` if deploying to GitHub Pages sub-path hosting
- Polyfill injection based on your `browserslist` config or API usage in source code

**When to use it:** When starting a new project or adding a build system to an existing one. Also useful when migrating from Webpack or Parcel — `--from webpack --diff` shows a side-by-side mapping of the old config to the new one.

## Why do I need it?

Bundler configuration is the most copy-pasted, least-understood part of modern web development. Webpack configs routinely hit 200+ lines of incantations copied from Stack Overflow. `wbToWBC` eliminates this by generating the config from what your project already says about itself — your dependencies, your TypeScript paths, your browser targets. No more "I don't know why this loader is here, but removing it breaks the build."

**Tips:**
- Review the generated config — it's designed to be human-readable, not a black box
- Use `--from webpack --diff` when migrating to understand exactly what's changing
- Commit the generated config to version control so the team can review and modify it as the project evolves

## Simple Example

**Generate config:** `/wbToWBC` — detects your framework (React, Vue, Svelte, or vanilla TS) from `package.json` and generates a complete WBC configuration file with dev and production presets.

**Custom output:** `/wbToWBC --out bundler.config.mjs --format esm` — generates the config as an ES module with a custom filename, useful when integrating with an existing toolchain that expects a specific entry point.

**Migration assist:** `/wbToWBC --from webpack --diff` — reads your existing `webpack.config.js`, maps each option to the equivalent WBC setting, and outputs a diff showing exactly what changes. Catches options that have no direct equivalent so you can address them manually.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Assuming the generated config is optimal without review.** Auto-detection gets 90% right, but custom loaders or unusual project layouts may need manual adjustment.

**Not testing both dev and production modes.** A config that builds fine in dev may fail in production due to missing plugins or incorrect `publicPath` — always run both modes before deploying.

**Forgetting to regenerate after adding new file types.** If you add SASS or images to a project that previously only handled TypeScript, re-run `wbToWBC` to pick up the new loader rules.

**Relying on `--from webpack --diff` as a complete migration plan.** Some Webpack plugins have no WBC equivalent — the diff flag only maps what it can. Review unmapped options separately.

**Committing without checking in CI.** A malformed WBC config can silently fall back to defaults. Add `wbValid` to your CI to catch issues before they reach production.

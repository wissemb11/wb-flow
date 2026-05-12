# wbRelease — ELI5 Guide

## What is this?

Manages the entire release process — version bumping, changelog generation, tagging, and publishing — with safety checks at every step. It reads your commit history, determines the next version based on conventional commits, and executes the release workflow.

The release pipeline follows semantic versioning rules: `fix:` commits trigger a patch bump, `feat:` commits trigger a minor bump, and commits with `BREAKING CHANGE:` trigger a major bump. Pre-release versions (`beta`, `alpha`, `rc`) are supported with the `--preid` flag. Each step has built-in validation to prevent common release failures.

**What It Does:**
- **Version calculation** — reads conventional commits since the last tag and determines the next semver version
- **Changelog generation** — groups commits by type (Features, Fixes, Breaking Changes, etc.) into readable format
- **Version bump** — updates version in `package.json`, `Cargo.toml`, or other manifest files
- **Git tag creation** — creates an annotated git tag with the version number and changelog excerpt
- **Publication** — publishes to npm (or your package registry) with `--otp` support for 2FA
- **GitHub Release** — optionally creates a GitHub Release with the changelog body
- **Pre-flight checks** — verifies clean git status, all tests pass, and no uncommitted changes

**When to use it:** Every time you ship a new version. Use `--dry-run` first to preview what will happen, especially for major version bumps.

## Why do I need it?

Releasing software is a ritual with many steps — bump, changelog, tag, publish, announce. Miss any step and you get broken releases, wrong versions, or angry users. `wbRelease` automates the entire ritual so you ship consistently every time. No more "I forgot to update the changelog" or "why is this showing the wrong version number?"

**Tips:**
- Always run `--dry-run` first for major or breaking releases to verify the version calculation
- Use `--tag beta` for pre-release versions that shouldn't be installed by default
- Configure the OTP (one-time password) method in your environment for 2FA-protected packages

## Simple Example

**Standard release:** `/wbRelease` — reads commits, bumps version, generates changelog, creates tag, and publishes to npm with default settings.

**Release with dist-tag:** `/wbRelease --tag beta --preid beta` — creates a prerelease version (e.g., `1.2.0-beta.1`) and publishes with the `beta` dist-tag so early adopters can install it.

**Dry run:** `/wbRelease --dry-run --verbose` — shows exactly what would happen (new version, changelog content, publish payload) without actually doing anything. Use this to preview before committing to a release.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


# wbValid — ELI5 Guide

## What is this?

Runs a battery of pre-flight checks against your project to confirm it's ready for `/wb*` commands. It verifies that the `.wb/` directory has the right structure, configuration files parse correctly, required tools are installed at minimum versions, workflow templates haven't drifted from the canonical set, and agent file permissions are correctly set.

Each check produces a clear pass/fail with a specific error message — not a cryptic stack trace. If `AGENTS.md` is missing, it tells you exactly that. If a YAML config has a syntax error, it shows the line number and the parser error. The output is designed to be actionable: you know exactly what's wrong and what command or file change fixes it.

**What It Validates:**
- **Directory structure** — presence of `.wb/workflows/`, `.wb/commands/`, `.wb/shortcuts/` and their required subdirectories
- **Config integrity** — every JSON/YAML file in `.wb/` parses correctly and has all required fields (e.g., `identity.json` needs `name`, `owner`, `repo`)
- **Tooling requirements** — Node.js ≥18, git ≥2.30, and any framework-specific tools your project needs (e.g., `vuepress` for docs projects)
- **Template sync** — checks that local workflow templates in `.wb/workflows/` match the canonical set from `wb-flow`'s template package. Flags missing, extra, or modified templates
- **Cross-reference health** — validates that internal links between documentation files resolve correctly (catches broken `[link](../other.md)` references)
- **Agent permissions** — verifies the agent process can read/write `.wb/` files without sudo or group-permission issues

**When to use it:** Immediately after `wbSetup` to verify the setup succeeded. Before filing a bug report — if `wbValid` finds issues, fix those first. After upgrading wb-flow to check for template or config changes.

## Why do I need it?

When a `/wb*` command fails, the cause is almost never a bug in the command itself — it's a missing file, a misconfigured setting, or a version mismatch. `wbValid` diagnoses these in seconds and tells you exactly what to fix. Without it, you'd guess through cryptic error messages, checking `AGENTS.md` manually, wondering whether the `.wb/` directory is correctly structured. It's the first troubleshooting step written down formally: before asking "why did this command fail?", run `wbValid`.

**Tips:**
- Run `wbValid` immediately after `wbSetup` to catch setup issues before they cause mysterious failures later
- Use `--fix` to auto-correct common problems (create missing directories, fix file permissions, regenerate missing templates)
- Check `--quick` for a fast pre-flight that skips deep checks (template sync, cross-references) — useful during active development when you don't want false positives from in-progress changes

## Simple Example

**Full validation:** `/wbValid` — runs all checks across structure, config, dependencies, templates, and permissions, returning a pass/fail for each category with detailed error messages for any failures found.

**Quick pre-flight:** `/wbValid --quick` — runs only the essential checks (directory exists, config files parse, required tools are installed) and skips deep validation like template sync and cross-reference resolution. Completes in under a second for rapid iteration.

**Auto-fix mode:** `/wbValid --fix` — validates the project and automatically repairs common issues: creates missing directories with correct permissions, regenerates missing template files from the canonical set, and fixes file permission issues. Effective for re-running after a disrupted setup.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Running it before every command.** `wbValid` is a diagnostic, not a ritual. Run it when something breaks or after setup — not between every `wbPlan` and `wbWork` call.

**Assuming `--fix` handles everything.** Auto-fix covers the common cases (missing dirs, permissions), but won't fix semantic config errors (wrong project name, incorrect framework setting). Review the fix report to see what was changed and what still needs manual attention.

**Ignoring "Cross-reference health" warnings.** Broken links in documentation files silently accumulate. A `README.md` that links to a deleted doc page gives new contributors a 404. Fix these as they appear.

**Skipping template sync after upgrades.** When you upgrade wb-flow, the canonical templates may change. Local templates that drifted from the new canonical set will cause inconsistent behavior. Run `wbValid` after every upgrade.

**Not running `--quick` during active development.** Full validation on every run is unnecessary overhead. Use `--quick` for day-to-day checks and full mode only when diagnosing problems.

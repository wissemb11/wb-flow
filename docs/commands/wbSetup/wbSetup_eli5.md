# wbSetup — ELI5 Guide

## What is this?

Initializes the wb-flow agentic framework in a project — creating workflow files, identity, and configuration. It scaffolds the entire `.wb/` directory structure, writes the `AGENTS.md` file with project-specific rules, installs the workflow templates, and verifies that all prerequisites are satisfied.

The setup process is idempotent — running it multiple times is safe. It detects existing `.wb/` directories and merges changes rather than overwriting. It also detects your tech stack (from package.json, tsconfig, etc.) and tailors the generated configurations accordingly.

**What It Creates:**
- **`.wb/` directory** — the canonical workflow folder with `workflows/`, `commands/`, and `shortcuts/` subdirectories
- **`AGENTS.md`** — project-level agent instructions tailored to your tech stack and team conventions
- **Workflow templates** — the full set of 31 `/wb*` command workflows in `.wb/workflows/`
- **Identity file** — `.wb/identity.json` with project name, owner, and repository URL for attribution
- **Command wrappers** — shell-level wrappers so `/wb*` commands work from any subdirectory
- **Validation report** — checks Node.js version, package manager, and required dependencies

**When to use it:** Once per project at the start. Run it again with `--reconfigure` when upgrading wb-flow to a new major version or when switching team conventions.

## Why do I need it?

Before you can use any `/wb*` command, your project needs to be set up — this does it in one go. Without setup, the commands have no context about your project structure, conventions, or identity. Running `/wbSetup .` is the single prerequisite for the entire wb-flow ecosystem. Think of it as laying the foundation before building the house.

**Tips:**
- Run with `--yes` for non-interactive setup in CI/CD or containerized environments
- Use `--stack` to explicitly declare your tech stack if auto-detection misses something
- After setup, run `wbValid` to verify everything is correctly configured

## Simple Example

**Basic setup:** `/wbSetup .` — sets up the current directory with the full wb-flow framework, interactive prompts for customizing conventions.

**Quick (non-interactive):** `/wbSetup /path/to/project --yes --stack typescript,react,vitest` — sets up a project non-interactively with predefined tech stack choices.

**Reconfigure:** `/wbSetup . --reconfigure` — rebuilds the `.wb/` directory from scratch, useful when upgrading wb-flow or switching team conventions.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


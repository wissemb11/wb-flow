# wbLicense — ELI5 Guide

## What is this?

Helps you choose, generate, and manage open-source licenses for your project. It explains what each license allows and requires, generates the license file, and ensures your project follows the license terms correctly.

The license engine provides guidance through the licensing landscape: it explains the trade-offs between permissive licenses (MIT, Apache-2.0 — users can do almost anything), copyleft licenses (GPL-3.0, AGPL-3.0 — derivatives must stay open), and weak-copyleft licenses (MPL-2.0, LGPL-3.0 — file-level copyleft). It then generates the appropriate legal text with your project metadata filled in.

**What It Does:**
- **License selection** — asks about your goals (permissive, copyleft, commercial) and recommends the best fit
- **License generation** — creates the `LICENSE` file with correct year, author, and project name
- **License comparison** — shows side-by-side differences between licenses (MIT vs. Apache-2.0 vs. GPL-3.0)
- **Compliance check** — scans your dependencies' licenses to identify conflicts or copyleft "infection" risks
- **Attribution generation** — creates a `NOTICE` or `THIRD-PARTY-LICENSES` file from your dependency tree
- **License header insertion** — adds the correct SPDX header to every source file if required
- **Dual licensing** — helps configure projects that offer both open-source and commercial licenses

**When to use it:** At project inception for new projects. For existing projects, run a compliance check after adding new dependencies to ensure license compatibility.

## Why do I need it?

Licensing is legally important, easy to get wrong, and easy to ignore. A missing license file or incompatible dependency license can block corporate adoption or create legal risk. `wbLicense` makes licensing a mechanical step rather than a legal research project. Most projects should use MIT (permissive) or GPL-3.0 (copyleft) unless they have specific requirements.

**Tips:**
- MIT is the safest choice for most projects — it's widely understood and accepted
- Use `--check` after adding new dependencies to catch license conflicts early
- For corporate projects, Apache-2.0 includes an explicit patent grant that legal teams prefer

## Simple Example

**Choose and generate:** `/wbLicense` — interactively walks you through license options and generates the appropriate `LICENSE` file with correct metadata.

**Compliance audit:** `/wbLicense --check` — scans all dependencies, reads their licenses from `node_modules`, and reports any that conflict with your chosen license or have missing license fields.

**Header update:** `/wbLicense --headers --style spdx-mit` — adds or updates SPDX license headers in every source file, useful when switching licenses or adding a new project to an organization that requires headers.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


# wbAudit — ELI5 Guide

## What is this?

Runs a structured, repeatable technical audit of your entire project — source code, config files, dependencies, and directory layout — and scores each area for quality, security, and maintainability. Unlike a linter that checks formatting or a security scanner that checks for secrets, this is a holistic assessment: ~40 individual checks across five dimensions, each producing a categorized finding with a severity level and a concrete remediation step.

The audit works in three phases. First, it maps your project's anatomy: file tree, framework type, language distribution, dependency graph, and test coverage. Second, it runs the checks — everything from cyclomatic complexity hotspots to CVE lookups on your dependency tree. Finally, it aggregates results into a weighted score (0–100) per dimension and an overall project health score. Scores are calculated to be comparable across runs, so you can track whether your codebase is actually improving week over week.

**What It Checks:**
- **Code quality** — cyclomatic complexity, dead code, code duplication, naming consistency, magic numbers and strings
- **Security** — hardcoded secrets, known-vulnerable dependency versions (CVE database), injection-prone patterns (SQL, command injection, XSS sinks)
- **Maintainability** — test coverage gaps, documentation debt, module coupling (afferent/efferent coupling metrics), file size anomalies
- **Configuration** — CI/CD config validity, linter ruleset completeness, framework-specific settings (e.g., Next.js `next.config.js` correctness)
- **Dependency health** — outdated packages (compared to latest semver-compatible releases), unused imports, deprecated APIs in use, license compatibility risks

**When to use it:** Run a full audit before major refactors to establish a baseline score. Add to your weekly CI pipeline to track quality trends and catch regressions before they compound.

## Why do I need it?

Manual code review is great for catching logic errors, but it's terrible at measuring system-level health. Nobody notices that the average function complexity crept up 15% over three months, or that test coverage dropped in one module every sprint. `wbAudit` gives you objective, repeatable metrics so you can prove your codebase is getting better — or catch it sliding before it becomes a crisis. The real win is the before-and-after comparison: run it, do a refactor, run it again, and point to the score improvement as evidence the refactor was worth it.

**Tips:**
- Run `wbAudit` before and after a major refactor to measure the impact on code health numerically
- Use `--format json` in CI to feed scores into dashboards or trend charts
- Always fix "Critical" and "High" findings first — they represent the highest risk and the easiest score improvements

## Simple Example

**Standard audit:** `/wbAudit src/` — audits all source files in `src/` and returns a scored report with findings grouped by category, each with a severity level, affected file path, and suggested fix.

**Full-depth CI audit:** `/wbAudit . --depth full --format json` — runs every check including transitive dependency analysis (not just direct dependencies) and outputs machine-readable JSON for ingestion into a dashboard or metrics pipeline.

**Baseline comparison:** `/wbAudit . --baseline last-week.json` — runs a fresh audit, compares scores and findings against the previous run, and highlights what improved, regressed, or stayed the same. The report shows deltas per dimension (e.g., "Code quality: +3 points, Security: -1 point") so you can see week-over-week trends at a glance.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Running it once and never again.** A single audit gives you a snapshot, not a trend. The value is in tracking scores over time — add to CI and review the weekly trend.

**Focusing only on the overall score.** The dimension scores matter more than the composite. A project can have 95/100 code quality but 40/100 security. Fix the low-scoring dimensions, not the average.

**Ignoring low-severity findings.** A single "info" finding isn't urgent, but 50 of them indicate a systemic pattern. Group low-severity findings by category and address the root cause.

**Not establishing a baseline before a refactor.** Without a before-audit, you can't measure whether the refactor actually improved things. Run the audit, refactor, run it again.

**Treating the score as a target.** A perfect 100 isn't the goal — diminishing returns kick in hard past ~85. Focus on fixing findings, not optimizing the score for its own sake.

**Running without `--baseline` on repeat audits.** Without a baseline comparison, you can't tell if your scores are trending up or down. Always pass the previous report for delta context.

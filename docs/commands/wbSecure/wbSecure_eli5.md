# wbSecure — ELI5 Guide

## What is this?

Scans your project for security vulnerabilities, secrets exposure, and unsafe coding patterns. It combines multiple detection strategies — regex patterns, static analysis rules, and dependency database lookups — to identify risks before they reach production.

The security engine runs layered checks: surface-level regex scans for obvious secrets (API keys, tokens, passwords), deeper static analysis for injection vulnerabilities and insecure patterns, and external database lookups against CVE sources for dependency vulnerabilities. Results are aggregated by severity with clear remediation steps.

**What It Scans For:**
- **Hardcoded secrets** — API keys, tokens, passwords, private keys, database connection strings, and OAuth credentials in source files
- **Vulnerable dependencies** — checks `package.json`, `requirements.txt`, `Cargo.toml` against CVE databases
- **Injection vulnerabilities** — SQL injection, command injection, XSS sinks in template files and API routes
- **Insecure configuration** — open CORS policies, missing HTTPS redirects, permissive CSP headers
- **Authentication flaws** — hardcoded JWT secrets, weak password requirements, missing rate limiting
- **Data exposure** — sensitive data in logs, client-side secrets, excessive API response payloads
- **Supply chain risks** — typo-squatting dependency names, unverified package sources, pinned versions with known issues

**When to use it:** Before every production deploy. Run as a CI step on every PR to catch issues before merge. Run a full scan weekly for ongoing monitoring.

## Why do I need it?

Security vulnerabilities are inevitable in any non-trivial project. Manual security review is slow and inconsistent. `wbSecure` gives you a continuous, automated security scan that catches issues early when they're cheap to fix — a secret committed to git is much harder to remediate than one caught before the commit.

**Tips:**
- Use `--staged` as a pre-commit hook to catch secrets before they enter git history
- Run `--deps-only --fail-on high` in CI to block PRs with critical dependency vulnerabilities
- Review the full report even on a passing scan — new low-severity findings can indicate emerging patterns

## Simple Example

**Quick scan:** `/wbSecure` — scans the entire project and returns a report with severity ratings, affected files, and fix recommendations.

**Dependency audit:** `/wbSecure --deps-only --fail-on high` — checks only dependencies for known vulnerabilities and exits with a non-zero code if any high-severity issues are found (useful in CI).

**Pre-commit scan:** `/wbSecure --staged` — scans only staged changes for secrets and injection patterns, running fast enough to use as a pre-commit hook.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


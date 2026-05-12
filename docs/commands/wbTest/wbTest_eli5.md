# wbTest — ELI5 Guide

## What is this?

Runs your test suite and classifies each failure — flaky, regression, or new bug — with suggested fixes. It executes your configured test runner (Jest, Vitest, Mocha, etc.), captures the output, and applies pattern matching and historical analysis to categorize every failure.

The classification engine works by comparing test results against a stored baseline from the last known-good run. Tests that fail intermittently are flagged as flaky and retried automatically. Tests that passed before but fail now are marked as regressions. Tests on new code that fail consistently are flagged as bugs. Each category gets a different recommended action.

**What It Classifies:**
- **Flaky tests** — tests that pass intermittently — detected by rerunning them and comparing results across runs
- **Regressions** — code that was working but broke due to a recent change — identified by comparing against the last green run
- **New bugs** — genuine defects in newly written code — flagged when a test fails consistently with no prior passing record
- **Configuration errors** — test setup or mocking issues — caught when failures trace back to test infrastructure rather than application logic
- **Timing/race conditions** — async test failures caused by timing — identified by analyzing test patterns and error stack traces

**When to use it:** After making changes, before pushing. Run it in CI on every PR to automatically classify failures instead of having a developer manually investigate each red X.

## Why do I need it?

Failed tests are noisy and confusing — this tells you what kind of failure it is and what to do about it. Instead of spending 20 minutes debugging a flaky test, you get an instant classification and fix suggestion. It turns CI noise into actionable signals and reduces the "not my problem, it's flaky" mentality.

**Tips:**
- Run `--retry-flaky` before reporting a CI failure to rule out flakiness
- Use `--diff main` on PR branches to isolate regressions introduced by your changes
- Review the flaky test report weekly — flaky tests erode trust in the test suite

## Simple Example

**Basic run:** `/wbTest` — runs the full test suite and returns a classified report of all failures with fix suggestions.

**Targeted retry:** `/wbTest --retry-flaky` — runs the suite, identifies flaky tests, reruns them up to 3 times, and reports only the consistently failing ones.

**Regression diff:** `/wbTest --diff main` — runs tests on the current branch and compares results against the `main` branch to isolate which failures are new regressions vs. pre-existing issues.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Not reviewing the output before acting.** Always read the report before making changes — automated suggestions are starting points, not gospel.

**Using the wrong scope.** Be specific about what you target (a file, a directory, the whole project) to avoid unnecessary processing or missed issues.

**Skipping prerequisites.** Many commands require a clean git state or specific tools — run `wbValid` first if you get unexpected errors.

**Ignoring warnings.** Yellow-flagged items often foreshadow red-flagged failures in later steps — address them early.

**Running without context.** For commands that analyze project state, running from the wrong directory or without proper setup produces misleading results.


# /wbTest — Expert

## What `/wbTest` architecturally is

A **test harness invoker with report generation**. Executes the project's configured test runner, captures structured output, classifies failures by likely cause (test-wrong vs. code-wrong vs. config-wrong), and writes a dated report to `reports/YYYY/MM/DD/tests/`.

The architectural contribution is not the test running (trivial). It's the structured classification of failures — which a raw test runner doesn't produce — and the persistence of results across dates for trend tracking.

## The classification that matters

Raw test runners output "X tests failed." `/wbTest` adds a layer:
- **Code-wrong**: test assertion is correct; code violates it.
- **Test-wrong**: code is correct; test encodes outdated expectation.
- **Config-wrong**: tests never executed because setup is broken.
- **Architecture-blocked**: failure is a known consequence of an undecided design question.

This classification turns "2 tests failed" from noise into signal. You know which failures are code bugs (fix now) vs. test bugs (fix test) vs. design debt (defer with xit()).

The classification is heuristic — the AI reads the test, the code, and the context/dev files and makes a judgment. It can be wrong. The value is that it forces a first-pass triage instead of handing you unclassified red output.

## Where `/wbTest` sits in the closed loop

- **Before**: fresh test results don't exist yet.
- **During**: report written to `reports/YYYY/MM/DD/tests/`.
- **After**: `/wbPlan`, `/wbDebug`, `/wbRelease`, `/wbDeploy` all read this report. A failing test in the most recent report *blocks* `/wbDeploy` by convention.

The cross-command conventions are where the real design sits. `/wbTest` in isolation is just a test runner with structured output. `/wbTest` as part of the loop is a gate that downstream commands honor.

## Three design decisions worth naming

### 1. Failure classification beyond pass/fail
Discussed above. The single most useful architectural choice.

### 2. Coverage gaps reported separately from failures
A missing test is not a failed test. Collapsing them into "test health" overweights things that aren't failures. Separating lets you triage independently.

### 3. Profile as a flag, not a separate command
`--profile` adds timing/memory data but doesn't change the verdict model. Profile results are signals, not pass/fail. Keeping them optional keeps the common case fast.

## Where the command leaks

1. **Classification is not verified.** The AI says "this is config-wrong" and nothing checks. If the classification is wrong, you chase the wrong failure.

2. **No mutation testing.** Tests passing doesn't mean tests are meaningful. A test that always asserts `true` passes. `/wbTest` doesn't detect this.

3. **Flaky tests poison the loop.** A test that fails 10% of the time will intermittently block `/wbDeploy`, but nothing marks it as flaky. User has to notice the pattern manually.

4. **Coverage metric is threshold-based, not value-based.** 90% coverage is not the same as 90% meaningful coverage. `/wbTest` reports the former because that's what runners compute.

5. **No concept of integration vs. unit.** Failures are treated uniformly. A failing integration test (slow to fix, often caused by environment) shouldn't block the same way a failing unit test does, but `/wbTest` doesn't distinguish.

What `wb-flow-docs`'s playbook gets wrong about `/wbTest`: framing it as pass/fail reporting, when the Claude edition classifies failures into 'test-wrong' vs 'code-wrong' — a critical distinction determining whether you fix the test or fix the source. Without this, you might patch a correct test instead of the underlying bug.

## One-paragraph verdict

A structured test harness whose architectural contribution is *classification* of failures rather than test execution itself. Correct in the four-way classification (code/test/config/architecture), in separating coverage gaps from failures, and in binding its output to downstream command gates. Weakest in classification verification, mutation coverage, flaky detection, and integration-vs-unit distinction. Correct for solo pre-release checks; would need CI-grade tooling (mutation testing, flake detection, matrix builds) to survive in a team-scale reliability-critical environment.

---

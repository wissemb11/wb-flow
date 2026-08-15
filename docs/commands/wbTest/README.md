# /wbTest — Command Hub

`/wbTest` manages test execution, coverage reporting, and failure classification. It validates that code changes don't break existing functionality and produces structured reports on pass/fail status, coverage metrics, and regression risks — the gate you run before merging.

## 🎯 Strategic Position

Every other command in the suite tells you whether code *looks* correct. `/wbTest` is the one that proves it by running actual tests. Its key job is failure classification: a test runner tells you something broke; `/wbTest` tells you whether it was flaky, a regression, a bug, a config problem, or a timing issue.

- **Before merging** — verify no regressions.
- **Before releasing** — full coverage and pass/fail report.
- **After a change that could ripple** — confirm existing behavior holds.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Standard** | `/wbTest <path>` | Pass/fail report, coverage metrics, failure classification |
| **Profiling** | `/wbTest <path> --profile` | Standard output + runtime performance data per test |
| **Task-scoped** | `/wbTest <path> --task` | Test results filtered to a specific task context |

## ✅ What a useful test run contains

A useful test report includes at minimum:

1. **Pass/fail status** per test suite.
2. **Coverage metrics** broken down by file.
3. **Classified failures** — each tagged as flaky, regression, bug, config, or timing.
4. **Regression risk** assessment for the changeset.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Fix failing tests | [`/wbDebug`](../wbDebug/README.md) |
| Audit code quality | [`/wbAudit`](../wbAudit/README.md) |
| Review code changes | [`/wbReview`](../wbReview/README.md) |

## 📚 Reading Order

1. **[ELI5](wbTest_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbTest_practical.md)** — step-by-step walkthrough on a real project.
3. **[Expert](wbTest_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbTest_examples.md)** — annotated transcripts ([Part 1](wbTest_examples.md), [Part 2](wbTest_examples.md)).
5. **[Exhaustive simulation](wbTest_exhaustive_simulation.md)** · **[Live demo](wbTest_live_demo.md)**.

## 🔗 Related

- [`wbTest.md`](wbTest.md) — the command reference this hub orients you around.
- [`/wbDebug`](../wbDebug/README.md) — root-cause analysis for failing tests.
- [`/wbReview`](../wbReview/README.md) — human-style code review of changes.
- [`/wbAudit`](../wbAudit/README.md) — scored readiness assessment.

## Quick Reference

```bash
/wbTest packages/my-package/           # standard: run + coverage + classification
/wbTest packages/my-package/ --profile # add runtime performance data
/wbTest packages/my-package/ -p        # shortcut for --profile
/wbTest packages/my-package/ --task    # task-scoped execution
/wbTest <path> --snap=<label>          # pin output to .wb/snaps/
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# /wbTest — Practical

## Two forms

```
/wbTest <pkg> # run existing tests, report results
/wbTest <pkg> --profile # same + timing/memory profile
```

## When to run

- Before `/wbRelease` — must pass.
- Before `/wbDeploy` — must pass.
- After `/wbRefactor` — verify nothing broke.
- After `/wbDebug` produces a fix — confirm the fix landed.
- When `reports/` shows recent test failures you haven't addressed.

## When *not* to run

- To check code quality → `/wbAudit`.
- To verify plan execution → `/wbReview`.
- To add missing coverage → `/wbPlan --task="add tests for X"` followed by execution.
- Before starting work on a feature → tests won't tell you what to build.

## Reading the output

Three bands:
- **All pass, no coverage gaps** — you're good. Proceed.
- **Some fail** — triage first. Is it test-wrong or code-wrong? Don't reflexively "fix the test."
- **Fails to run at all** — config bug, not code bug. Fix the test setup.

## The test vs. code question

When a test fails, ask in this order:
1. Was the test correct? (Does the expected behavior match what was actually agreed?)
2. Is the code wrong against that expected behavior?
3. Is this a symptom of an open architectural decision that blocks cleanly passing the test?

If (3), mark the test as `xit()` with a comment referencing the open decision. Don't delete.

## The most common mistake

**Fixing the test to match the code.** If the code produces `<div class="wbcode-placeholder">` but the test expects `<code>`, the default instinct is "update the test." That's often wrong. The test was written to match an earlier agreed-on behavior. If code drifted, the test is the witness, not the culprit. Investigate the code change first.

## When /wbTest refuses

- Test config is broken (no plugin, no runner) — refuses, tells you to fix config.
- No tests exist — reports "0 tests found, coverage is 0%". Not a failure, just a note. Doesn't auto-generate tests.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbTest --execute` and `/wbTest -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--profile` | `-p` |
| `--task` | `-t` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

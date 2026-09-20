---
title: "wbTest — Examples"
description: "If you expect /wbTest to write tests, you want /wbPlan --task=\"add test coverage for X\" followed by execution."
---

# /wbTest — Examples

> Self-help. `/wbTest` is the least glamorous command in the set and the most frequently misunderstood. This file shows what it actually does and where it breaks.

---

## What /wbTest is and isn't

| Is | Isn't |
|---|---|
| Runs existing tests + produces a report | A test *writer* (it doesn't add missing coverage) |
| Reports coverage gaps + failing cases | A code reviewer (that's `/wbAudit`) |
| Verifies regressions before release | A substitute for `/wbReview` after a plan |

If you expect `/wbTest` to *write* tests, you want `/wbPlan --task="add test coverage for X"` followed by execution.

---

## Example 1 — `/wbTest packages/wb-core` (pre-release)

```text
$ /wbTest packages/wb-core

[AI] Reading dev_reference.md for test command...
[AI] → npm run test (per dev_reference.md)
[AI] Running tests...
[AI] → 42 passed, 2 failed, 3 skipped
[AI]
[AI] Scanning reports/ for prior test reports...
[AI] → 2026-04-21: same 2 failures. Unresolved.
[AI]
[AI] Writing reports/20260423/tests/test_wb-core_202604232300.md:
```

```markdown
# Test run: @wbc/wb-core (2026-04-23)

## Summary
- Passed: 42
- Failed: 2 (same as 2026-04-21 — no progress)
- Skipped: 3

## Failures

### 1. extractSubObject array-handling/leaves
Test expects leaves-only traversal. Code matches.
Failure: the test uses an array of objects and asserts flat output.
Root cause: test incorrect for current behavior, OR code is supposed
to flatten and doesn't. Open architectural decision blocks fix.
**Action:** leave xit() until decision resolved.

### 2. WBCode prod-mode render
Test expects `<code>` output in prod mode.
Actual: `<div class="wbcode-placeholder">`. Recent change?
**Action:** git blame on WBCode.vue to find when this changed.

## Coverage gaps (not failures)
- src/utils/extractPath.js: 0% coverage (added 2 days ago, no tests)
- WBCodeSlot.vue: dev-mode covered, prod-mode not

## Recommendation
Do not /wbRelease with #2 failing. #1 can defer. Coverage gaps are
/wbPlan territory.
```

**What's worth noticing:**

- Same-failures-as-last-time is surfaced. Closed-loop in action — a failing test from 2 days ago isn't rediscovered, it's tracked.
- Failures ≠ coverage gaps. The report separates them because they're different problems. Failures block release; coverage gaps are debt.
- Failure #1 references an open architectural decision as the reason it can defer. Rules from `context.md` influence test triage.

---

## Example 2 — `/wbTest apps/wb-dataviewer/wbdataviewer2.wbc-ui.com --profile`

The `--profile` flag turns `/wbTest` into a performance check. Different output shape.

```text
$ /wbTest apps/wb-dataviewer/wbdataviewer2.wbc-ui.com --profile
```

```markdown
# Test + Profile: wbdataviewer2.wbc-ui.com

## Test results
- All passed.

## Profile results

### Slow tests (>500ms)
- Example_wbPress render: 1200ms (90% spent in WBDataViewer table rendering)
- Example_wbLatex render: 800ms (75% spent in katex)

### Memory
- Peak heap: 180MB during Example_wbPress (high, inspect)

## Not checked by this command
- Real-user rendering performance (need a live load profile)
- Bundle size (use /wbDeploy --dry-run)
```

**What's worth noticing:**

- `--profile` is narrow. It measures test-execution time, not real user performance. The "not checked" section is explicit about that.
- Slow tests aren't failures — they're signals. The AI flags the 90%-spent-in-table-rendering finding as a hypothesis for `/wbDebug` to follow up on.

---

## Example 3 — /wbTest failing because test config is broken

Not every red result is a code bug. Sometimes it's the test setup.

```text
$ /wbTest packages/wb-press
```

```markdown
# Test run: @wbc/wb-press

## Summary
- All tests failed to RUN (exit code 1 before any test executed)

## Root cause
vitest.config.js references vue@3 compiler. This package is Vue 2.
Tests never compile.

## This is a config bug, not a code bug
Do not re-run tests hoping for different output. Fix the config first.

## Recommendation
Either migrate wb-press to Vue 3 (big project), or configure vitest
with @vitejs/plugin-vue2. The context.md for this package already
flags Vue 2 as the expected runtime — test config missed that.
```

**What's worth noticing:**

- The report catches a config/code mismatch and refuses to treat it as a test failure. That distinction matters — "fix tests" work is different from "fix config" work.
- Cross-references the package's `context.md` rule (Vue 2 expected) to show the config is wrong, not the code.

---

## The pattern

Every `/wbTest` run produces:
1. **Pass/fail count** (mechanical).
2. **Failures with hypothesized root cause** (not just "test X failed").
3. **Coverage gaps** (separate from failures).
4. **"Not checked by this command" section** (like audit — declares its limits).
5. **Pointer to the next command** (`/wbPlan`, `/wbDebug`, `/wbRelease` permission or refusal).

The minimum useful output is the failure list with root causes. Everything else is optional polish.

---

---

## Basic Usage

```bash
# Standard command execution
/wbTest frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbTest deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbTest` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbTest target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbTest target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbTest target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbTest packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbTest apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbTest` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbTest frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

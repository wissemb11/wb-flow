---
title: "wbRefactor — Examples"
description: "Behavior-preserving transformations only."
---

# /wbRefactor — Examples

> Self-help. `/wbRefactor` restructures code without changing behavior. This file shows the crucial discipline: refactor only after audit, never before, and never as a response to a bug.

---

## The cardinal rule

**Behavior-preserving transformations only.** If the output behaves differently from the input, it's not a refactor — it's a rewrite. `/wbRefactor` must refuse to change behavior, even if the current behavior looks wrong.

If behavior is wrong, that's `/wbDebug` + a fix. Not refactor.

---

## Example 1 — `/wbRefactor packages/wb-core/src/renderers/renderString.js`

The 688-line monster. Good candidate for refactor after audit flagged cyclomatic complexity.

```text
$ /wbRefactor packages/wb-core/src/renderers/renderString.js

[AI] Reading current file (688 lines)...
[AI] Loading recent audit reports...
[AI] ✅ 2026-04-20 audit flagged: cyclomatic complexity, pipe-split fragility
[AI] (audit exists; refactor has a reason)
[AI]
[AI] Loading context_wbc_renderer.md (focused context)...
[AI] Call sites: 11 across wb-core + consumers
[AI] Test coverage: 87% (tests will validate behavior preservation)
[AI]
[AI] Proposed restructure:
[AI] - Extract pipe-parsing into utils/parsePipeSyntax.js
[AI] - Extract escape handling into utils/escapeSequences.js
[AI] - renderString.js becomes dispatch-only (120 lines → target)
[AI] - Public signature UNCHANGED: renderString(input, context)
[AI] - Return type UNCHANGED
[AI] - Error behavior UNCHANGED (same throws for same inputs)
[AI]
[AI] Safeguards:
[AI] 1. Run existing tests before mutation (capture baseline).
[AI] 2. Apply restructure.
[AI] 3. Run tests again. Must produce identical results.
[AI] 4. If any test fails, revert — refactor failed.
[AI]
[AI] Proceed? (y/n)
```

User answers `y`:

```text
[AI] Baseline: 42/42 tests pass ✅
[AI] Applying restructure...
[AI] src/renderers/renderString.js: 688 → 127 lines
[AI] src/utils/parsePipeSyntax.js: new, 198 lines
[AI] src/utils/escapeSequences.js: new, 143 lines
[AI] Sum: 468 lines (net -220 from dedup)
[AI]
[AI] Running tests on refactored code...
[AI] 42/42 tests pass ✅
[AI] Behavior preserved.
[AI]
[AI] Writing reports/20260424/refactors/refactor_renderString_202604240300.md
[AI] 
[AI] NEXT: /wbAudit packages/wb-core to verify the refactor didn't
[AI] introduce new debt. Then /wbGit to commit.
```

**What's worth noticing:**

- Baseline test run *before* the refactor. Any test that's failing before isn't the refactor's fault — but the AI captures this so you can distinguish pre-existing failures from refactor-induced ones.
- Public signature and error behavior are named as preserved. These are the contract; breaking either = rewrite, not refactor.
- Refactor produced a net *reduction* in total lines (deduplication paid off). Not all refactors do this — sometimes breaking up a file adds lines. Line count is not the goal.
- Follow-up `/wbAudit` is the recommended next step. Refactor might have cleaned *too much* or missed something — audit catches regressions in code-quality terms.

---

## Example 2 — `/wbRefactor src/components/DataViewerExport.vue` (refused)

Not every target is refactorable. The command should refuse when the signal is wrong.

```text
$ /wbRefactor src/components/DataViewerExport.vue

[AI] Reading file...
[AI] Scanning recent reports/...
[AI] ❌ No /wbAudit finding for this file.
[AI] ❌ Active /wbDebug report: "export button errors on click"
[AI] (unresolved, 2 hours ago)
[AI]
[AI] REFUSING to refactor.
[AI] Reasons:
[AI] 1. No audit identified this file as a refactor target.
[AI] 2. There's an OPEN bug report on this file.
[AI] Refactoring code with known bugs risks locking in the bug
[AI] or silently deleting the buggy path during restructuring.
[AI]
[AI] Fix the bug first (/wbDebug + implement fix). Then audit.
[AI] If audit flags messiness, *then* refactor.
```

**What's worth noticing:**

- The refusal names two distinct reasons. Either alone would be enough.
- Bug + refactor = worst combination. Refactoring code with active bugs either embeds the bug in the new structure or silently rewrites it in a way that hides the original cause.
- The sequence is explicit: debug → fix → audit → refactor. Never mix.

---

## Example 3 — `/wbRefactor` on code with no tests

```text
$ /wbRefactor src/utils/extractPath.js

[AI] Reading file...
[AI] Checking for tests...
[AI] ❌ No tests found for extractPath.js
[AI]
[AI] REFUSING to refactor.
[AI] Reason: without tests, I cannot verify that the refactor
[AI] preserves behavior. Any refactor of untested code is
[AI] structurally indistinguishable from a rewrite.
[AI]
[AI] Options:
[AI] 1. Write tests first. Then refactor.
[AI] /wbPlan <pkg> --task="add tests for extractPath"
[AI] 2. If you're willing to accept the risk, use a different command:
[AI] describe the restructure directly. This makes it explicit
[AI] that you're rewriting without guarantees.
```

**What's worth noticing:**

- "No tests → no refactor" is the strictest rule in this command. Untested refactoring is bug-introduction with extra steps.
- The refusal offers two paths, not a single prescription. Sometimes you accept the risk knowingly — but the command makes you declare that explicitly.

---

## Example 4 — partial refactor: preserve what's messy, restructure what's clear

```text
$ /wbRefactor packages/wb-core/src/WBC.js

[AI] Reading file (500+ lines)...
[AI] Loading audit...
[AI] 2026-04-20 audit: flagged 3 sections
[AI] - syncVNodes logic (can be extracted, no behavior concern)
[AI] - type-dispatch switch (messy but correct)
[AI] - event handler setup (shared mutable state — do not touch)
[AI]
[AI] Proposed scope (REDUCED based on audit):
[AI] - Extract syncVNodes → utils/vnodeSync.js ✅ safe
[AI] - Clean up type-dispatch formatting ✅ safe
[AI] - LEAVE event handler setup as-is ⚠ shared state
[AI]
[AI] I'm refusing to restructure the event-handler section because
[AI] the audit flagged it as "shared mutable state." Refactors on
[AI] shared mutable state often introduce subtle timing bugs that
[AI] tests don't catch.
[AI]
[AI] Apply partial refactor? (y/n)
```

**What's worth noticing:**

- Refactor scope is *reduced* based on audit findings. Not everything that looks refactorable is safe to refactor.
- The AI names *why* the third section is off-limits (shared mutable state). Generic refusal would be unhelpful; specific refusal teaches you where the traps are.
- Partial refactor is fine. You don't have to restructure the whole file in one pass.

---

## The pattern

Every valid `/wbRefactor` run has:

1. **Audit reference** — prior audit flagged this target.
2. **Test baseline** — existing tests pass before mutation.
3. **Signature preservation** — public API unchanged.
4. **Behavior preservation** — tests pass after mutation.
5. **No bug overlap** — no open `/wbDebug` on the target.
6. **Report written** — reports/YYYY/MM/DD/refactors/.

If any of 1-5 fail, the command refuses. The refusal is the feature.

---

---

## Basic Usage

```bash
# Standard command execution
/wbRefactor frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbRefactor deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbRefactor` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbRefactor target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbRefactor target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbRefactor target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbRefactor packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbRefactor apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbRefactor` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbRefactor frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

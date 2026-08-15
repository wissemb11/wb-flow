# /wbRefactor — Expert

## What `/wbRefactor` architecturally is

A **behavior-preserving structural-transformation command** gated by six preconditions: audit-flagged target, tests exist, tests pass at baseline, no open `/wbDebug`, signature preserved in proposal, test pass after mutation. Refuses unless all gates clear.

The architectural contribution is the *refusal discipline*. Most refactor tooling will happily restructure untested code, mix refactors with bug fixes, or operate on active-debug targets. `/wbRefactor` refuses these cases because each one is a well-known source of silent regressions.

## Why refactoring buggy code is worse than not refactoring

Refactoring + bug is the worst combination in software change management. Three reasons:

1. **Evidence destruction.** The bug was located in specific code. After refactor, "that code" no longer exists — you have new code with (probably) the same bug in a different location. The original debug investigation's findings no longer map to the file.
2. **Silent rewrite.** A refactor that "cleans up" a buggy path might inadvertently fix the bug *or* reinforce it. You won't know which. Tests that were failing for the wrong reason might now pass by accident.
3. **Cognitive load fusion.** You can't tell, after the fact, whether a diff was "cleanup" or "fix" or both. Future `git blame` becomes useless for this change.

Refusing to refactor buggy code forces sequence: debug → fix → audit → refactor. Each step has a single purpose and a clean diff.

## The test-coverage gate

The rule "no tests → no refactor" isn't strict bureaucracy. It's acknowledgment that:

- Refactoring is defined by behavior preservation.
- Behavior is knowable through tests (or other runtime observation).
- Untested refactoring is guessing whether behavior is preserved.
- Guessing whether behavior is preserved is called "rewriting."

If the target is critical and untested, the honest path is: acknowledge you're rewriting, not refactoring. A rewrite isn't forbidden — it's just different work with different risks.

## Three design decisions worth naming

### 1. Six-gate refusal up front
Before any mutation attempt, check all six preconditions. Fail fast. This avoids the "halfway through refactor, tests fail, what now?" state where recovery is ambiguous.

### 2. Public signature as an inviolable contract
Internal structure can change arbitrarily; external interface cannot. This bound is what makes refactor different from redesign. Redesign is a separate conversation — usually a `/wbPlan` + intentional breaking change.

### 3. Bracketing audits (pre-refactor + post-refactor)
The workflow assumes two audits. Pre says "needs refactor." Post confirms "refactor helped." Skipping the post-audit means you might ship a refactor that improved one metric while worsening another.

## Where the command leaks

1. **Test coverage is binary in the gate.** "Tests exist → pass gate." But a package with 5% coverage technically passes. The gate should ideally measure coverage of the refactored code specifically, not just coverage existence.

2. **Behavior preservation is test-verified only.** Un-tested behaviors (timing, memory, specific error messages) can shift. Subtle consumers that depend on exact error-message text can break.

3. **No scope limit enforcement.** A user can `/wbRefactor <big-folder>` and the command tries to restructure everything. Ideally, large refactors should be split into file-level operations with individual verification.

4. **Partial refactor acceptance is convention-based.** The example where the AI refused to touch a "shared mutable state" section is pattern-match in the prompt, not a formal guard. A different prompt might accept.

5. **No rollback primitive.** If tests fail post-refactor, the AI "reverts," but revert mechanics are implicit in the tool use. On some tool configurations, partial writes can leave the working tree in a half-refactored state.

What `wb-flow-docs`'s playbook gets wrong about `/wbRefactor`: framing it as code transformation, when the Claude edition constrains it to behavior-preserving changes only, enforced by the /wbTest verification step. Without the verify gate, refactor degrades into rewrite, which is what /wbToWBC is for.

## One-paragraph verdict

A behavior-preserving transformation command whose architectural contribution is *refusal discipline* — six preconditions that prevent common misuse patterns. Correct in treating buggy-code refactor as forbidden, in forcing tests as the behavior-preservation proof, and in preserving public signatures as inviolable. The "zero-sum mutation" framing from gemini overstates what's really "behavior-preserving as far as tests can prove." Weakest in coverage-depth measurement, test-gap-induced silent changes, scope limits, and rollback primitives. Correct for solo monorepo work with disciplined test coverage; would benefit from coverage-aware gating and explicit rollback for larger-scale use.

---

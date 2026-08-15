# /wbReview — Expert

## What `/wbReview` architecturally is

A **plan-conformance verifier**. Takes a target (code or docs) plus a reference plan file, compares the actual state against each plan task's claimed outcome, and emits a verdict (PASS / PASS-WITH-DEBT / FAIL) with per-task findings.

The architectural contribution: separating *claimed completion* (checkbox state in the plan file) from *actual completion* (code state on disk). Most development workflows conflate these; `/wbReview` makes them separately verifiable.

## The separation from /wbAudit

The two commands are often confused. The distinction matters architecturally:

- **`/wbAudit`**: evaluates code against *standards*. No plan required. Stateless w.r.t. plan history. Good for "should I ship?"
- **`/wbReview`**: evaluates code against a *specific plan*. Plan required. Bound by the plan's stated tasks. Good for "did we do what we said we'd do?"

Architecturally, audit is absolute (compare to ideal), review is relative (compare to spec). Both are necessary; neither replaces the other.

## The "Red-Team Validation Protocol" claim

the agent's version frames `/wbReview` as enforcing creator-vs-auditor separation. The principle is right but overclaimed:

- **Real:** reviewing one's own work is a weaker signal than reviewing someone else's. A separate session (ideally a different model) catches more.
- **Overclaimed:** "physically and logically separates the creator from the auditor" — the separation is prompt-based, not architectural. Nothing prevents the same AI from doing both roles in one chat. The discipline is convention.

The useful reframe: `/wbReview`'s value is not enforced separation; it's the *structured comparison prompt* that the plan file enables. A reviewer with a checklist catches more than a reviewer with free-form instructions, regardless of who the reviewer is.

## The "Deep Static Integrity" claim

The the documentation lists coupling density, state management, and checklist atomicity as review checks. These are real checks, but calling them "deep static integrity" or "AST analysis" overstates:

- No actual AST parsing happens unless the AI chooses to do it. The reviews are natural-language code reading, not formal analysis.
- Coupling and state management checks are heuristic, not provable.
- Checklist atomicity — checking if each ✅ is really complete — is the actual differentiator. This is what `/wbReview` uniquely does.

Trim the marketing and you get: structured checklist verification, plus general code reading for side effects.

## Three design decisions worth naming

### 1. Plan file as the contract
The plan file is the spec. The review is bound by what the plan said, not by general standards. If the plan said "make it work," the review cannot fail tasks for not being elegant. If the plan said "match pattern X exactly," the review fails tasks that implement functionally-equivalent-but-different patterns.

This constrains the review in a useful way — it prevents scope creep and forces accountability to what was actually asked.

### 2. Three-level verdict (PASS / PASS-WITH-DEBT / FAIL)
Not binary. The middle state reflects reality: most reviews find minor issues that shouldn't block merge but should be tracked. Collapsing to binary pass/fail forces either merge-blocking on trivialities or tolerating real problems.

### 3. "What the review found that the plan missed"
Mandatory section in the output. Catches cascade effects, new dependencies, side effects. Without it, the review degrades to pure checkbox verification, which misses 80% of the interesting findings.

## Where the command leaks

1. **Rubber-stamping is harder to detect than in /wbAudit.** Because the review is bounded by the plan, a lazy reviewer can just verify the literal plan tasks and miss everything else. The "what the review found that the plan missed" section is supposed to catch this — but if the reviewer is also lazy about that section, the review passes everything.

2. **No enforcement of different reviewer vs. worker.** You can review your own plan execution. The command doesn't track who did what. Discipline, not architecture.

3. **Plan file staleness is a quiet failure mode.** If the plan was written 3 weeks ago and the code has drifted since, the review verifies against a plan that no longer reflects intent. No detection.

4. **Verdicts can be gamed via plan underspecification.** A plan with vague tasks ("fix the thing") produces reviews that pass easily because there's nothing concrete to verify. The fix is upstream: reject vague plans at `/wbPlan` stage.

5. **Three-level verdict creates a "tracked debt" loophole.** "PASS WITH DEBT" can become the default for messy work. Debt that's tracked but never resolved is just indefinitely-deferred failure. No half-life on debt items.

What `wb-flow-docs`'s playbook gets wrong about `/wbReview`: framing it as generic code review, when the Claude edition scopes it to plan-task verification: review the diff against the specific task's acceptance criteria, not the entire codebase. This prevents scope creep that makes reviews take 3x longer than the original task.

## One-paragraph verdict

A plan-conformance verifier whose architectural contribution is separating claimed completion from actual completion. Correct in binding review to the plan file (not general standards), in the three-level verdict, and in the mandatory cascade-effects section. The "Red-Team Validation Protocol" framing overstates what's really prompt-based discipline; the "Deep Static Integrity" framing dresses up natural-language code reading in AST clothing. The single most valuable check is checklist-atomicity — confirming that ✅ tasks are really done. Weakest leaks: rubber-stamp still possible, no enforced reviewer-worker separation, plan staleness undetected, gameable via vague plans, tracked-debt loophole. Correct for solo monorepo work when paired with discipline; needs independent-reviewer assignment and debt TTLs to survive at team-scale.

---

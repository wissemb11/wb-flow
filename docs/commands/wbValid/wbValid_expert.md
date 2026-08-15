# /wbValid — Expert

## What this command actually is

`/wbValid` is the **third leg of the Plan→Work→Valid triplet** and the only one whose value comes from being run by a *different model* than its predecessor. Every other command in the suite is model-agnostic — pick the right tier and go. `/wbValid` is model-relational: its quality depends on the gap between itself and `/wbWork`.

This is unusual. Most "validation" tools (linters, type-checkers, test runners) are deterministic and produce the same answer regardless of who runs them. `/wbValid` is judgment-based — it reads the worker's claim, reads the code, and decides whether they match. Two models will reach different verdicts on the same evidence.

The system leans into this. The PASS/FAIL is appended to the worker's report along with the validator's model name, so future readers (human or AI) can see who said what.

## The append-only invariant

`/wbValid` **never overwrites** the worker's report. It always appends:

```markdown
## ✅ Validation by claude-opus-4-7 — 2026-05-03 14:30

PASS — verified by reading src/WBCore.js:42-58. Getter implementation
matches the plan's contract. Tests pass.
```

or

```markdown
## ❌ Validation by claude-opus-4-7 — 2026-05-03 14:30

FAIL — getter exists but returns a hardcoded "1.0.0" instead of reading
package.json. Plan said "returns the package.json version string."
Worker's claim ("done, returns version") is technically true (a string
is returned) but doesn't match the contract.

Action: re-run /wbWork plan_X.md --id=2 with the contract clarified.
```

This append-only structure has a payoff most users miss: **it builds a versioned audit trail**. When a task is validated, fails, gets re-worked, and validated again, the report shows the entire history at the bottom. You can reconstruct what went wrong on attempt 1 even after attempt 2 succeeded.

## The reset semantics

When `/wbValid` returns FAIL:
- The worker's `Done` cell resets from `✅<br>WorkerModel` to `⬜`.
- The `Valid` cell stays `⬜` (it was never `✅` to begin with).
- The task report stays in place, with the FAIL note appended.

The reset is what makes `/wbWork --id=<ID>` re-runnable. Without the reset, `/wbWork` would refuse (it skips already-Done tasks). With the reset, the next `/wbWork` invocation sees task X as pending again, reads the existing report (including the FAIL note), and ideally produces a better attempt.

## What this command can't do

- **Validate intent.** If the plan said "add a getter" and the worker added a getter, but the *plan was wrong* (you actually wanted a setter), `/wbValid` will PASS the implementation. The contract is the plan; the validator is verifying against the plan, not against your unspoken intent.
- **Catch regressions in unrelated code.** `/wbValid --id=2` only verifies task 2. If task 2's implementation broke something in task 5's territory, `/wbValid` won't catch it. That's `/wbTest`'s job.
- **Validate creative work.** "Write a good README" is not a validatable contract. `/wbValid` is for tasks with concrete success criteria. If the plan row's `Verify` column is hand-wavy, validation will be hand-wavy.

## The model-pairing matrix

| Worker model | Recommended validator |
|---|---|
| the agent the AI agent | the AI agent (deeper reasoning, same family) OR the AI agent (different family entirely) |
| the AI agent | the AI agent (cross-vendor adversarial check) |
| the AI agent | the agent the AI agent (cross-vendor) |
| the AI agent | the AI agent (only equivalent-tier alternative) |

Avoid: same model on both sides. Even the agent→the agent is risky because token-level pattern recognition leaks across calls.

## Why no `--strict` flag

You might expect `/wbValid --strict` to apply higher scrutiny. It doesn't exist, by design.

The argument was: "strict" validation is what `/wbValid` already is. Adding `--strict` would imply the default is "lenient," which would create a perverse incentive to never use `--strict` (because lenient passes more often, and humans like green checks). Better to ship one mode and call it the validator.

If you need a second opinion beyond `/wbValid`, run it twice with two different validator models. The second model's append shows up below the first's. Two `✅` from different models is much stronger than one `✅<br>strict`.

## When this command is the wrong tool

| You want | Use instead |
|---|---|
| Run unit tests | `/wbTest` |
| Code-quality review (not plan-vs-work) | `/wbAudit` |
| Re-execute a task | `/wbWork --id=<ID>` (after reset, which `/wbValid` does on FAIL) |
| Verify a security property | `/wbSecure` |
| Quick sanity check before commit | `/wbCheck` |

the agent's edition treats `/wbValid` as "QA after `/wbWork`." That's correct but incomplete. The interesting design is that **validation is human-readable and append-only**, which means the validator's reasoning is visible to future humans and AIs. A black-box pass/fail (like a CI green tick) has no provenance; `/wbValid`'s appended verdict explains *why* it passed or failed, in narrative form.

This is also why the rotate-models discipline matters more than it first seems: a single-model `/wbWork`+`/wbValid` produces a report where the same voice writes both halves. Adversarial pairing produces dialectic — the worker says X, the validator interrogates X, and the artifact contains both.

## One-paragraph verdict

What `wb-flow-docs`'s playbook gets wrong about `/wbValid`: treating it as a simple pass/fail gate, when `/wbValid` is the keystone of the agentic loop's trustworthiness. The Plan→Work pair is just AI doing AI things; the third leg is what makes it auditable. The append-only structure is its best feature — failures aren't erased, they're preserved as part of the task's history. Its weakness is that it can't validate intent (only contract), so a sloppy plan produces sloppy validation. Pair it with a validator model from a different vendor than the worker, and the system catches its own mistakes.

---

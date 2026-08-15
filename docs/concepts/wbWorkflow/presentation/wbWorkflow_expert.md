# /wbWorkflow — Expert Architect View

Formal model of the workflow, plus the parts the diagrams don't show.

## The state machine, precisely

```
States: { UNINIT, CTX_LOADED, PATH_CHOSEN (A|B), EXECUTING, DONE }

Transitions:
 UNINIT --/wbContext--> CTX_LOADED
 CTX_LOADED --nl-msg--> PATH_CHOSEN(A)
 CTX_LOADED --/wbPlan--> PATH_CHOSEN(B)
 PATH_CHOSEN(A)--write+check--> EXECUTING
 PATH_CHOSEN(B)--plan-generated-->EXECUTING
 EXECUTING(A) --handoff--> DONE
 EXECUTING(B) --worker+validator loop-->EXECUTING(B) // self-loop until all tasks ✅
 EXECUTING(B) --all-passed--> DONE

Invariants:
 - Every transition writes a report to .agents/workflows/reports/YYYY/MM/DD/<kind>/
 - No transition back to UNINIT mid-session (context is monotonic)
 - PATH_CHOSEN does not flip (you cannot upgrade from A to B mid-execution
 without restarting the session)
```

That last invariant is the one most people violate. Mid-execution, you realize the job is bigger than you thought; the right move is not to "add a plan" on top — it's to abort, start a new session, `/wbContext` + `/wbPlan` from scratch. Trying to bolt `/wbPlan` onto an already-executing Path A session produces a half-state where some work is planned and some isn't, and `reports/` becomes inconsistent.

## Why this is a state machine and not a chat

Ordinary AI chat sessions have exactly two states: **before-message** and **after-message**. Context is whatever is in the current conversation window. When the window rolls over, state is lost.

`wbWorkflow` imposes four additional properties:

1. **Externalized state** — context and history live on disk, not in the conversation.
2. **Typed transitions** — you can't go from `UNINIT` to `EXECUTING` without passing through `CTX_LOADED` and `PATH_CHOSEN`.
3. **Idempotent re-entry** — running `/wbContext` twice produces the same loaded state. Running it mid-session is how you recover from drift.
4. **Report-driven backward references** — current-session execution reads prior sessions' reports. The "state" includes the filesystem's memory, not just this conversation.

These four properties are what make it a workflow instead of a chat. Remove any one and you've degraded back to a chat session with extra steps.

## The Worker/Validator loop, architecturally

This is the only genuinely interesting part of the workflow design.

Traditional software has a CI pipeline: code is written, then separately evaluated by an automated system (tests, linters, review bots). Neither the code-writer nor the evaluator shares state with the other during the act of writing/evaluating. This is the decoupling that makes CI work — you cannot lint your own output *while* you're producing it without biasing both.

The Worker/Validator loop ports this decoupling to the AI-agent space by exploiting **model diversity**. A different model, running a different evaluation prompt, on a fresh context, will flag things the original model wouldn't. Crucially, this only works if all three conditions hold:

- **Different model.** the agent-validating-the agent is weak. the agent-validating-Qwen3 is strong.
- **Different context window.** The validator must not see the worker's chain of thought. It sees the output (the report + the code) and nothing else.
- **Different prompt framing.** The worker's prompt is "produce X." The validator's prompt is "assume X is wrong — find what's wrong." Without the adversarial framing, the validator drifts into agreeing.

If any condition is violated, the loop degrades to rubber-stamping. The architecture doesn't enforce the conditions; you do.

## The "constraint injection" claim, honestly

The gemini expert version claims the workflow "eliminates 90% of hallucinated CLI commands and incorrect framework assumptions." That number is invented. The honest version:

- `dev.md` + `dev_reference.md` measurably reduce framework drift, because the AI is forced to acknowledge them before code generation. Estimate: large reduction, but the real rate depends entirely on how specific `dev.md` is.
- CLI hallucination is reduced *only when* the command the AI wants to run is listed in `dev_reference.md`. For novel commands, hallucination persists. The reduction is coverage-limited.
- Both reductions erode over time as `dev.md` drifts from reality. A 6-month-old `dev.md` that forbids npm when you've switched to pnpm will cause *more* confusion than no `dev.md` at all. Freshness matters more than thoroughness.

So: measurable effect, yes; 90% number, made up; needs active maintenance.

## The architectural weaknesses worth naming

1. **No transaction semantics.** If a `/wbPlan` task is half-executed when the session dies, `plan.md` has a ✅ next to work that wasn't finished. There's no rollback.
2. **The "Validator" role is a prompt, not a contract.** Nothing prevents a validator from being lazy; you're relying on model diversity and prompt quality to simulate adversarial review.
3. **`reports/` is append-only but not versioned.** If someone edits yesterday's audit report by hand, every subsequent command reads the edited version as truth. No provenance, no integrity check.
4. **Session boundaries are implicit.** You can't tell from looking at `reports/` whether two entries came from the same session or different ones. For solo work this doesn't matter; for any kind of audit trail, it does.

## One-paragraph verdict on the workflow specifically

A pragmatic four-state pipeline that externalizes context to disk, uses typed transitions to prevent AI drift, and borrows the worker/validator separation from traditional CI. Its novelty is applying that separation to LLM agents via model-diversity, but the novelty only pays off if you actually use different models — a discipline the architecture can't enforce. The three real risks are session-death mid-plan, rubber-stamp validation, and staleness of `dev.md`. All solvable by convention, none solvable by the architecture. Correct for solo monorepo work; would need real locking and provenance to survive team-scale.

---

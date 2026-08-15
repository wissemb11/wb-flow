# /wbDebug — Expert

## What `/wbDebug` architecturally is

A **forced-hypothesis-first investigation command**. Takes an error symptom or file target, loads context + recent reports, emits a hypothesis with evidence-to-check, and *pauses* before proposing a fix. Its structural contribution is the pause — the deliberate interruption between theorize and act.

the agent's version frames this as "Chain-of-Thought prompting." That's true but small. The interesting design is not that the AI reasons — all modern AIs reason. It's that the reasoning is externalized into a checkable artifact before action, and the action is gated on verification.

## Why the pause matters

LLMs are reinforcement-trained to produce helpful outputs, which in coding contexts means proposing fixes. Left unprompted, they fix first and explain second. This is a reasonable default for low-stakes tasks. For debugging, it's inverted: the *explanation* is what you want, because:

- A wrong fix for the right problem wastes 5 minutes.
- A wrong fix for the wrong problem wastes 2 hours and introduces new bugs.
- A hypothesis that turns out to be wrong wastes 1 minute and teaches you something.

The pause converts unchecked fixes (high downside) into hypotheses (low downside). The economic asymmetry is what makes this command structurally different from "just ask the AI what's wrong."

## The "Chain-of-Thought" claim, honestly

the agent's expert version: "utilizes CoT prompting to significantly increase zero-shot accuracy." The claim is:

- **Partially true.** Structured reasoning does improve LLM accuracy on logic-heavy tasks.
- **Partially misleading.** The accuracy gain is not from "CoT" as a prompting technique — it's from *structural constraints on output*. The command forces hypothesis-before-fix. Whether that's CoT, ReAct, or any other named technique is irrelevant to the user. What matters is the structure.
- **Quantitatively unsupported.** "Significantly increases" has no number. Actual accuracy gains on debugging tasks depend heavily on the specific bug class; some improve dramatically, some barely at all.

Trim the marketing: the command forces sequential reasoning, which prevents the failure mode of "fix-first-explain-never."

## Three design decisions worth naming

### 1. Hypothesis is an artifact, not an internal reasoning step
The AI must *write down* the hypothesis. User can see it, push back, accept, or refute. Internal reasoning that isn't surfaced is unverifiable. The command's value comes from the externalization.

### 2. Evidence-to-check is separate from hypothesis
"My hypothesis is X. Here's how you can check if X is true." These are different. A hypothesis without verification steps is just a guess presented confidently.

### 3. Open-decision refusal
If the bug maps to an open architectural decision, the command refuses to fix. This prevents the silent-commitment failure where a "simple bug fix" actually resolves an architectural question without user input. Correct posture; rarely automatic in other debugging tools.

## Where the command leaks

1. **Hypothesis quality varies wildly.** The AI can produce a confident hypothesis that's completely wrong. The command's guarantee is that the hypothesis is *visible*, not that it's *correct*. You still have to verify.

2. **Rubber-stamp refutation.** User says "hypothesis is wrong" with no reason. AI reforms, but without new evidence, the new hypothesis is often just a synonym of the first. Need to give real refuting evidence for the reform to be useful.

3. **No persistence of refuted hypotheses.** If today's debug session refuted hypothesis X, tomorrow's session might propose the same hypothesis. The report captures the refutation, but nothing prevents the AI from re-proposing.

4. **Context depth depends on `reports/`.** A package with thin `reports/` produces weaker hypotheses. The command's effectiveness correlates with closed-loop investment.

5. **No bisection support.** For regressions, the natural debugging move is "when did this break?" via `git bisect`. `/wbDebug` has no integration with git history — it operates on current state only.

What `wb-flow-docs`'s playbook gets wrong about `/wbDebug`: framing it as a linear investigation tool, when the real design is hypothesis-driven: you state a theory, the agent gathers evidence for or against it, then refines. This is fundamentally different from a checklist-based debug workflow.

## One-paragraph verdict

A forced-hypothesis-first debugging command whose structural contribution is the *pause* — converting unchecked fixes into externalized, verifiable theories. The Chain-of-Thought framing from gemini is technically correct but understates what's really a workflow-level design: hypothesis as artifact, evidence-to-check as separate step, open-decision refusal as mandatory behavior. Weakest in hypothesis quality (still wrong sometimes), refutation handling without evidence, lack of cross-session learning, dependency on `reports/` depth, and no git-bisect integration. Correct for solo debugging discipline; would benefit from regression-aware history analysis for production-class use.

---

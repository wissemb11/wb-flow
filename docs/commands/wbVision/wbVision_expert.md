# /wbVision — Expert

## What `/wbVision` architecturally is

A **high-temperature ideation command** that reads package context + recent activity and emits a structured set of feature proposals with value/risk/effort triage. Output is consumable by humans for selection, and by `/wbPlan` if a selected idea graduates to execution.

the agent's version calls this "traversing adjacent possibilities in the feature space." The framing is accurate in spirit — the command does try to generate ideas that are adjacent to existing capabilities, not wildly out-of-scope. Whether that framing helps or not depends on your tolerance for AI-product-manager jargon.

## Why I've been calling this the weakest command

LLMs are good at fluent text generation. They're mediocre at novel ideation. "Brainstorming" output from an LLM tends toward:

- **Generic**: ideas that would work for any software project (dark mode, AI integration, cache layer).
- **Obvious**: ideas the user would have had anyway if given 5 minutes.
- **Wrong-scaled**: ideas that ignore effort constraints (rewrite in Rust, ship a mobile app).

This isn't a model-quality issue. It's a fundamental limitation of pattern-matching as a substitute for product intuition. Even GPT-5 or the agent 6 won't fix this; it's the task, not the model.

`/wbVision` mitigates by:
- Grounding in package context (less generic).
- Structuring with Value/Risk/Effort (forces triage).
- Flagging obvious ideas as obvious.
- Emitting a "my pick" with actual reasoning.

The mitigation makes output usable. It doesn't make output impressive.

## Three design decisions worth naming

### 1. Structured idea format (Premise/Value/Risk/Effort)
Without structure, brainstorming outputs collapse into marketing prose ("revolutionary AI-powered!"). The structure forces specificity. Each field being checkable makes bad ideas fail checking, not pass uncommented.

### 2. "Obvious" as a first-class tag
Explicitly labeling obvious ideas as obvious prevents the user from being buried in "dark mode, accessibility, i18n" low-novelty ideas. Still surfaces them (sometimes you do want to be reminded), but doesn't pretend they're novel.

### 3. "What this vision did NOT consider" section
Names the epistemic limits: business impact, competitive positioning, user feedback. These are outside what the AI can know from reading code. Mandatory acknowledgment prevents users from treating the output as if it incorporated those signals.

## Why cross-package invocations are more valuable

Single-package vision is weak because the AI has only package-local signals. Ideas tend toward "add feature X to this package."

Cross-package vision (`/wbVision core2/`) is better because:
- Integration ideas emerge (how do wb-core and wb-chart interact?).
- Monorepo-wide tooling ideas (dashboards, integration tests, unified CLIs) only make sense at this scope.
- Invisible-from-single-package opportunities (architectural patterns that span packages) surface.

If you're only going to run `/wbVision` once a month, run it at cross-package scope.

## The "high temperature generative" framing

the agent's expert doc mentions "high temperature." The claim is roughly right — brainstorming benefits from model sampling that explores less-likely outputs. But:

- The command doesn't explicitly configure a temperature parameter. It relies on prompt structure to encourage variation.
- Users calling `/wbVision` through different clients (Antigravity, Cline, etc.) may get deterministically similar outputs because the underlying temperature is fixed at the client level.
- "High temperature" as a design claim is really a prompt-engineering heuristic, not an architectural property.

Trim the marketing: the command prompts for variety; temperature is an implementation detail not under this command's control.

## Where the command leaks

1. **Pattern-match ceiling.** The AI can't generate ideas that require domain knowledge it doesn't have. Your deep knowledge of what customers actually want won't show up in output.

2. **No learning across runs.** Previous `/wbVision` reports exist in `reports/`, but the command doesn't condition heavily on what ideas you've already rejected. You may see the same 4 ideas next month.

3. **Effort estimates are hand-wavy.** SMALL/MEDIUM/LARGE is 3 buckets. Real effort can vary by 10x within a bucket. The estimates are starting points, not commitments.

4. **No market signal.** "Vuetify has this feature" or "competitors charge for this" are out-of-scope. You need to bring that information.

5. **Risk analysis is shallow.** "Risk: bundle size" without quantifying how much. "Risk: scope creep" is always true. The risk column often doesn't add as much as it claims.

What `wb-flow-docs`'s playbook gets wrong about `/wbVision`: treating it as strategic planning, when the Claude edition is more honest — it calls /wbVision 'the weakest command in the system' because brainstorming without execution context produces unfocused output. The honest critique is the feature, not the brainstorming.

## One-paragraph verdict

A high-temperature ideation command whose structural contributions (Premise/Value/Risk/Effort, obvious-tagging, "my pick", "didn't consider" section) make LLM brainstorming usable despite the fundamental weakness of LLMs at novel ideation. The "traversing adjacent possibilities" and "high temperature" framings from gemini are jargon around what's really a well-prompted brainstorm. Most valuable at cross-package scope; least valuable at narrow-package scope. Weakest in pattern-match ceiling, cross-run learning, effort-estimate precision, market-signal blindness, and shallow risk analysis. Correct as an occasional tool for filling an empty queue; wrong as a roadmap generator.

---

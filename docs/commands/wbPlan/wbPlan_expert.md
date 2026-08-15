# /wbPlan — Expert

## What `/wbPlan` architecturally is

A **task-graph externalizer**. It takes a natural-language goal and emits a durable, checkbox-tracked, markdown-typed table of subtasks to `reports/YYYY/MM/DD/plans/`. The durability + checkbox-state is what makes it more than a decomposer — it turns the plan file into a persistent state machine that can be read and mutated by multiple AI sessions across days.

Two separable concerns:
- **Decomposition quality** (how well the AI breaks down the goal).
- **State durability** (how reliably the plan survives across sessions).

Most "AI planning" tools nail the first and ignore the second. `/wbPlan`'s real contribution is the second.

## The dual-agent split, honestly

The the documentation calls this "Dual-Agent Asynchronous Orchestration" and claims planning + coding "cannot" occur in the same inference cycle without "context collapse." The claim is directionally correct, overstated in magnitude:

- **Real:** an LLM producing a plan while also producing code tends to cut plan quality. Attention is divided; architectural intent degrades as syntactic detail intensifies.
- **Overstated:** "cannot" is too strong. A sufficiently capable model *can* do both, just less well. For trivial tasks, integrated plan+code is fine. The separation is a quality optimization, not a hard architectural requirement.
- **Genuinely useful:** the separation makes the plan *reviewable* by a human or second AI before code is written. That's the real gain — not LLM attention mechanics, but human/second-AI insertion points.

## The "Atomic Commitment" claim

the agent's expert doc argues every task must represent "a single, testable state change." The principle is right; the naming is grandiose.

Practically: a task named "add dark mode" is a planning failure because it can't be validated. A task named "extract hardcoded colors to CSS variables" *can* be validated — you either extracted them or you didn't. The decomposition target is not atomicity in the distributed-systems sense; it's **testability**. If the task produces no discrete thing a validator can point at, the task is too big.

## Three design decisions worth naming

### 1. The plan is a file, not a session artifact
Plans live in `reports/YYYY/MM/DD/plans/` and outlast the session that created them. This sounds mundane. It's the entire reason `/wbPlan` is different from "ask ChatGPT to break down my task." The file-on-disk + checkbox state + dated folder = resumability across arbitrarily long time gaps.

### 2. Checkboxes as concurrency control (weakly)
When two AI sessions run in parallel on the same plan, they read the checkboxes to know which tasks are claimed. This is *optimistic* concurrency — nothing prevents a race. But in the solo-developer monorepo case, it's sufficient. Two sessions won't typically be running the same plan simultaneously.

### 3. Validator as a column, not a separate command
The plan bakes validation into its schema. Every task has a `Validator` column. This forces you to *name* who (which model, which session) will verify each task before you start executing. It converts "I should review this" from good intentions into scheduled work.

## Where the command leaks

1. **The model-assignment column is aspirational.** `/wbPlan` writes "Model: Qwen3-Coder" in the table. Nothing enforces that a Qwen3-Coder session actually executes the task. If you run it in the agent, the assignment is fiction.

2. **Stale plans accumulate.** A plan from 2 weeks ago with 3 unchecked tasks still sits in `reports/`. `/wbStandup` should surface it; it sometimes doesn't. No expiration.

3. **Cross-plan dependencies are invisible.** If plan A depends on plan B's completion, there's no link. You're expected to know. In practice you forget.

4. **The `🔨 in progress` marker has no TTL.** A crashed session leaves `🔨` permanently. Next session can't distinguish "paused" from "abandoned" without asking you.

5. **Validator rubber-stamping is undetectable.** If the validator model lazily approves every task, the Valid column becomes noise. No downstream check catches this — the plan "passes" but the code is broken.

What `wb-flow-docs`'s playbook gets wrong about `/wbPlan`: framing it as roadmap generation, when the Claude edition is a task table with cost annotations, worker/validator model assignments, and recursive sub-plan support. The budget estimate (kt x model rate) is a practical constraint the sibling edition omits entirely.

## One-paragraph verdict

A task-graph externalizer whose real innovation is the durable-state design, not the decomposition quality. Correct in using markdown + checkboxes for cheap persistence; correct in forcing the Validator column; correct in writing plans as separate files per date. Weakest in cross-plan dependency tracking, stale-plan cleanup, and validator accountability. The gemini "Atomic Commitment" and "Dual-Agent" framings name real patterns but overstate them; the actual value is the plan-as-file, checkbox-as-state, validator-as-column triad. Works for solo monorepo; would need locking and TTL for concurrent use.

---

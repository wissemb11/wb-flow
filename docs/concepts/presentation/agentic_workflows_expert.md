# AI Workflows — Expert Architect View

For when you want to know what's *actually* novel about this design and what's borrowed.

## What this system is, in systems-design terms

A **convention-driven agent coordination layer** where state is externalized to the filesystem and commands are idempotent-ish readers/writers of that state. No central orchestrator. No in-memory session state. The `reports/YYYY/MM/DD/<kind>/` directory is the entire runtime.

Concretely: a convention stack, not a framework. Each layer is independently useful; breaking any one degrades the others without killing them.

## The five design decisions that matter

### 1. Filesystem as the coordination substrate
Every command reads and writes the same `reports/` tree. That's the whole coordination mechanism. No queue, no pubsub, no daemon. The tradeoff: simple to bootstrap, fragile to concurrent writes (if two AI agents run simultaneously, they can race on the same date folder). Acceptable for a solo-developer monorepo; wouldn't survive a team.

### 2. Commands as specialists, not generalists
Each `/wb*` command has a single job and a dedicated template. This resists the temptation to build one "do-everything" AI command that becomes a black box. The price is 16 commands to learn. The payoff is that each one is predictable and reviewable — you can read `wbAudit_template.md` and know exactly what an audit will do.

### 3. Context as enforcement, not documentation
`context.md` describes the package; `dev.md` *forbids things the AI would otherwise do*. This is the key inversion. Most "AI context" systems store descriptive facts. This one stores negative constraints. The difference matters: "this is a Vue 3 project" is ambient info the AI might follow; "do not propose Vue 2 syntax under any circumstance" is an enforceable rule.

### 4. Closed-loop via stateless commands
Commands don't share memory; they share the filesystem. A `/wbAudit` failure today becomes a `/wbPlan` input tomorrow, not because anyone wired them up but because both commands agreed to read `reports/` on startup. That's architecturally closer to Unix (composable, file-based, stateless processes) than to Langchain-style agent graphs (in-memory, stateful, graph-based).

### 5. Multi-model verification via report grouping
Reports are tagged by producing model. You can run `/wbAudit` with the agent and `/wbAudit` with the agent on the same code, and the reports sit side-by-side in the same date folder. The system is agnostic to which model produced which report, which is how you catch a single model's blind spots. The downside: you have to actually do the cross-check; the system doesn't force it.

## What's genuinely new vs. what's borrowed

**Borrowed (not new, still correct):**
- Event-sourcing-style append-only state (the `reports/` folder is essentially an event log).
- Unix-style command composability.
- Worker/validator separation (a 1970s distributed-systems idea).
- Convention-over-configuration (from Rails era).

**Genuinely new-ish (in the AI-agent space specifically):**
- Treating `dev.md` as *executable refusals* rather than aspirational docs. Most AI-agent frameworks treat the system prompt as the whole story; this one treats per-package `dev.md` as a compile-time constraint set.
- The `--scope=global` vs. per-package context split. Usually agent systems bundle everything into one huge context window; the monorepo design forces hierarchical context that the AI must navigate, not slurp.
- The 4-step `/wb*` naming convention as a vocabulary contract between the human and the agent. The commands aren't just shortcuts; they're a shared noun-set that reduces ambiguity. Saying "I'll `/wbAudit` it" is a commitment to a specific behavior, not a vague intent.

## Where this design leaks

Worth naming because these will hurt eventually:

- **No concurrency model.** Two AI sessions writing to `reports/YYYY/MM/DD/plans/` at the same time can produce conflicting plan tables. Mitigated by discipline, not architecture.
- **Report retention is unbounded.** The "closed loop" gets slower to close over time as more historical reports pile up. A `--since` flag or a retention cron is eventually needed.
- **`workspace:*` and npm publishing are structurally in tension.** `/wbRelease` exists specifically to paper over that — unpicking workspace links before publish and restoring them after. This is a symptom of relying on pnpm/yarn workspace semantics that don't survive the npm registry boundary. Workable; not elegant.
- **The multi-model verification requires manual cross-checking.** Grouping reports by model is necessary but not sufficient; without a diff/compare command (there isn't one), the verification is whatever the human chooses to do.
- **`dev.md` rules are not formally validated.** Nothing prevents a rule from contradicting another, or from being stale. "Never use Vue 2" + a rule elsewhere referencing Vue 2 components will silently coexist until an AI session notices.

## The one-paragraph verdict

A pragmatic, file-based convention stack for solo monorepo development with AI agents. Borrows correctly from Unix and event-sourcing, invents a useful inversion around per-package negative constraints, and ships with the right compromises for a one-developer operation. It will start showing seams at team-scale — specifically around concurrent writes, report retention, and rule validation — but for its intended scope, the design is sound and the vocabulary is learnable in a week.

---

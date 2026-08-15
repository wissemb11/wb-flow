# /wbStandup — Expert

## What `/wbStandup` architecturally is

A **global state reconciler** over the distributed `reports/` tree. Traverses the last N days of dated report folders across the target scope, classifies each report by status (open, unresolved, stale, archived), ranks by severity, and emits a unified daily view.

the agent's version calls this the "Global State Resolver." That naming is actually accurate for once. The command resolves the distributed nature of `reports/` — which is great for write-time locality (each command writes to its own folder) but terrible for read-time synthesis (you'd have to read 20+ folders to know the state). Standup centralizes the read.

## Why distributed writes need a centralized reader

The `reports/` design optimizes for:
- Each command writing to its own kind folder (`audits/`, `plans/`, `debugs/`...) → no cross-command write contention.
- Each day getting its own date folder → no overwrite of historical state.
- Each package having its own reports (when package-scoped) → locality.

This design is right. But it creates a *read problem*: "what's the current state of all in-flight work?" requires reading N folders × M days × P packages, classifying each report, and cross-referencing. Without a dedicated reader, each human session does this ad-hoc and inconsistently.

`/wbStandup` is the dedicated reader. It's the one command whose output is a summary of the system's current state, not a new piece of state.

## Three design decisions worth naming

### 1. 7-day default window
Reports older than 7 days are assumed archived / irrelevant. This is a heuristic — sometimes a 30-day-old unresolved finding matters — but most state decays. The default prevents the standup from becoming a long history recap.

Override with an explicit flag if needed (not well-documented; the command supports `--window=30d` by convention).

### 2. Severity-ranked output, not chronological
Standup lists BLOCKERs and CRITICAL first, regardless of age. Chronological ordering would burry a high-severity finding under recent low-severity activity. Severity-first matches user attention economics.

### 3. "Suggested next action" as opinion, not mandate
The AI offers a recommendation, but the standup output includes secondary options and explicitly preserves user autonomy. This distinguishes standup from a task queue — the human picks; the AI just surfaces.

## The "Global State Resolver" framing, honestly

The name fits. The architectural pattern this implements is a well-known one:

- **Event-sourced systems** separate write path (append events) from read path (project events into views).
- `reports/` is the event log; each command's output is an event.
- `/wbStandup` is the projection.

This is event sourcing, applied to the filesystem, applied to AI-agent workflows. The pattern wasn't invented here, but its application to solo-developer monorepo management is novel enough to be interesting.

## Where the command leaks

1. **Classification is heuristic, not deterministic.** "Stale" is `🔨 > 24h`. "Unresolved" is audit BLOCKER not mentioned in a later resolution note. Edge cases (a BLOCKER that was silently fixed without a follow-up report) slip through.

2. **7-day window is arbitrary.** Some findings should persist longer (security CRITICAL, for instance). Window doesn't adapt per-kind.

3. **No dependency reasoning.** If plan A is blocked on plan B, standup shows both as open but doesn't note the dependency. User has to remember the connection.

4. **Doesn't detect report corruption.** If someone hand-edited a report file and broke its structure, standup either skips it silently or produces garbled output. No integrity check.

5. **No cross-monorepo view.** If you have multiple monorepos (core2, core1, backend), each needs its own standup. No unified view across them.

What `wb-flow-docs`'s playbook gets wrong about `/wbStandup`: treating it as a simple status report, when the Claude edition's value is in differential analysis — what has changed since the last standup, not everything-in-flight. Without the differential, every standup rewrites the same list and nothing gets actioned.

## One-paragraph verdict

A global state reconciler implementing event-sourcing-style projection over the distributed `reports/` tree. Correct in the distributed-writes / centralized-reads split, in severity-first ordering, and in preserving user autonomy (suggestion, not mandate). The "Global State Resolver" framing from gemini is actually accurate. Weakest in classification edge cases, adaptive windows, dependency reasoning, corruption detection, and cross-monorepo views. Correct for solo monorepo work; would benefit from schema-validated reports and dependency graphs for team-scale.

---

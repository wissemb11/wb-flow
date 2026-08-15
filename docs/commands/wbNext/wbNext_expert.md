# /wbNext — Expert

## What `/wbNext` is, architecturally

A **selection command** with no own work product — it doesn't write artifacts to the codebase, only a recommendation to stdout (and a single small report to `reports/YYYY/MM/DD/nexts/`). Its real job is **decision compression**: the user has 26 commands available, an unknown number of in-flight tasks, and a finite attention budget. `/wbNext` collapses that decision tree into one suggested action.

The novelty isn't the recommendation itself — any LLM can produce one. The novelty is **the rejected-alternatives section**. By forcing the model to articulate which other commands were considered and *why* they were rejected, the user can disagree intelligently. A black-box recommendation is unfalsifiable; a recommendation with rejected alternatives is auditable.

## The pattern `/wbNext` enforces

1. **Scope detection.** No arg = monorepo; arg = single package. The scope determines which `reports/` are read.
2. **Signal collection.** Three independent sources:
 - `reports/` (the closed loop's memory)
 - `git status` + recent commits (the live state)
 - `dev.md` (the prescriptive constraints — work the user already declared important)
3. **Candidate generation.** Pull all `/wb*` commands, filter to ones whose preconditions are satisfied (e.g., `/wbPublish` requires a recent `/wbRelease`).
4. **Ranking.** Score each candidate against three axes: blocker severity, time-since-last-run, and dependency satisfaction.
5. **Justification.** Top candidate becomes the recommendation. Top 3 alternatives become the rejected-alternatives section.

The key discipline: **the same scoring function must produce the recommendation AND the rejected list.** No special-casing, no "tie-breakers from intuition." If the model can't articulate why X was rejected, it shouldn't have considered X.

## Where `/wbNext` overlaps and differs from `/wbStandup`

Both read `reports/` to produce a status view. The difference:

| Aspect | `/wbStandup` | `/wbNext` |
|---|---|---|
| Output shape | List of N in-flight items | Single recommendation |
| Audience | "What's the team doing?" | "What should I do now?" |
| Gating | None — informational | Refuses on conflicting signals or dirty tree |
| Frequency | Daily morning | Several times per session |
| Failure mode | Becomes noise when run too often | Becomes redundant when run twice in a session |

`/wbNext` is **opinionated**; `/wbStandup` is descriptive. They complement, not compete.

## The "Considered and rejected" section as the architectural keystone

Most "next-action" tools fail because they hide their reasoning. The user is told *what*, never *why-not-the-alternatives*. The result: users either follow the recommendation blindly or override it on instinct. Neither is good calibration.

By forcing the model to enumerate top-3 rejected alternatives, `/wbNext` produces:

- **Falsifiable recommendations.** If the user says "you missed `/wbDebug` — there's an open error in `reports/debugs/`," the model can be wrong on a verifiable axis.
- **Self-correcting feedback.** If users repeatedly override the recommendation in a particular signal pattern, the rejection logic can be tuned. Without rejected-alternatives, there's no signal to tune against.
- **Educational output.** A new user reads "considered `/wbRefactor` but rejected because no audit flagged messiness" and learns the rule without being told. The ranking IS the lesson.

This is the same design principle as `/wbAudit`'s opinionated framing — surface the reasoning, not just the conclusion.

## The failure modes

1. **Stale `reports/`.** If reports are >2 weeks old, `/wbNext` will still recommend based on them. Mitigation: the report date appears in the justification; user can override. Better mitigation: an explicit "last fresh signal" timestamp at the top of every recommendation.

2. **Recommendation thrash on a noisy repo.** When 5 commands have similar scores, small input changes flip the recommendation. The rejection list helps (user sees the closeness) but the underlying issue is real. Counter: when scores are within 10%, the recommendation explicitly says "two near-equivalent options" and lists both.

3. **The "obvious" trap.** `/wbNext` will sometimes recommend `/wbContext` when the user is staring at a clear bug they want to fix. The recommendation isn't wrong (context is genuinely stale), but it's not what the user wants to hear. Counter: the user overrides; `/wbNext` should not be sticky.

4. **Doesn't see external pressure.** Deadlines, support tickets, "the CEO is demoing this Friday" — none of that is in `reports/`. The command is honest about this in its docs but doesn't enforce humility in the output. Counter: every recommendation includes the line *"this assumes only repo-internal signals; override if external pressure says otherwise."*

## What `/wbNext` cannot do

- It cannot rank tasks against each other (that's `/wbActOn`'s job — given a list of findings, sort them).
- It cannot generate work that doesn't exist in any signal (that's `/wbVision`).
- It cannot replace the user's domain judgment. It compresses a decision tree, but the user still owns the decision.

What `wb-flow-docs`'s playbook gets wrong about `/wbNext`: presenting it as a static suggestion engine, when the real design is temporal — it scans recent reports/ for audits, plans, and standups, then ranks by value x urgency. Without the 'considered and rejected' section explaining why alternatives were passed over, it's a black box.

## One-paragraph verdict

A small but architecturally important command. The single insight worth preserving — *recommendations must include rejected alternatives* — generalizes beyond `/wbNext` and probably belongs in `/wbActOn`'s scoring outputs too. The command's failure modes (stale reports, thrash, obvious-trap) are real but mostly self-correcting because the user is explicitly invited to override. Don't over-use it. One run per session is the right cadence; running it after every command ruins the signal.

---

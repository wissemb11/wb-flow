# /wbAudit — Expert

## What `/wbAudit` architecturally is

An **adversarial role-prompt command** that forces the LLM into a critical evaluation posture, scoped to a folder or file, and writes a structured report to `reports/YYYY/MM/DD/audits/`. The architectural novelty is not the audit itself (plenty of tools do static analysis). It's the *role-flip against LLM default agreeableness* combined with persistence of findings across sessions.

## The role-flip, honestly

the agent's version calls this the "Red-Team Validation Pattern" and frames it as forcing the LLM to abandon its "helpful and polite persona." The principle is real; the framing is theatrical.

What's actually happening:

- LLMs trained with RLHF default to diplomatic framings. A neutral prompt produces a neutral-to-positive review.
- `/wbAudit`'s template prepends explicit adversarial instructions ("be brutal," "assume customer hates this," etc.). This shifts the output distribution toward critical findings.
- The shift is measurable but not complete. A single-pass audit still rubber-stamps roughly 30-40% of the time, which is why re-prompting "harsher" is a documented counter-move, not an edge case.

The role flip is a *mitigation*, not a fix. The underlying issue (LLM agreeableness in evaluation tasks) cannot be solved by prompting alone.

## The "Dynamic Scoping Heuristics" claim

the agent's expert doc names folder-vs-file scoping as dynamic heuristics. It's simpler than that:

- **Folder audit** → evaluate against architectural + release standards. Output: strategic findings + score.
- **File audit** → evaluate against code-quality + correctness standards. Output: flaws + existing/suggested diff.

Two templates. Neither is "dynamic" in any meaningful sense. The command picks template based on the input type. Calling it "heuristic" inflates what's essentially an if-folder-else-file branch.

Useful fact, though: the two templates solve genuinely different problems. Folder audits answer "should I ship?" File audits answer "how should I fix this specific thing?" Mixing them (using a folder audit to evaluate one file, or a file audit to evaluate a package) produces useless output.

## The "Inspired Suggestion Paradigm"

The requirement that file audits produce Existing/Suggested tables is real and valuable. It does what gemini claims: proves the AI has a concrete alternative vision, not just complaints.

The refinement worth naming: the Suggested column is a *recommendation*, not a spec. Many audits produce Suggested code that doesn't quite compile or slightly misses the context. Treat suggestions as starting points, not drop-ins. This is exactly where the validator step in `/wbPlan` earns its keep — an audit suggestion becomes a plan task, and the plan task gets validated.

## Three design decisions worth naming

### 1. Score + recommendation, not just findings
Every folder audit produces a numeric score and a ship/don't-ship recommendation. This forces the audit to commit to a verdict, not just list things. Without it, "6 major issues" could mean "definitely don't ship" or "ship anyway, these aren't blockers." The score + recommendation disambiguates.

The score is not calibrated against any external standard — it's a relative judgment within the audit template. 6.5/10 from audit A and 6.5/10 from audit B are not strictly comparable. Don't overtreat the number.

### 2. The "did NOT check" section
Mandatory limit-naming. An audit that doesn't declare its coverage gaps is implicitly claiming total coverage, which it never has. This section is the command's integrity mechanism.

### 3. Severity ranking, not just lists
BLOCKER / MAJOR / MINOR forces the AI to commit to triage. Bug reports that are all "major" are useless; ranking forces distinction.

## Where the command leaks

1. **Score inconsistency across sessions.** Running `/wbAudit` twice on unchanged code can produce scores that differ by 1-2 points. The evaluation is not deterministic. Use scores as directional, not absolute.

2. **Rubber-stamp still happens.** The adversarial prompt mitigates, doesn't eliminate. The "harsher, re-run" pattern is a required discipline, not an occasional one.

3. **Findings can hallucinate references.** An audit claims "line 47 has an issue" when the issue is on line 52, or the file only has 40 lines. Always verify line references.

4. **No differential audit mode.** An audit of a package today re-audits everything, even things that were already audited and unresolved. No "what's new since last audit" filter. You get a full re-surface every time.

5. **Open-decision handling is convention-dependent.** The audit template says "surface open decisions, don't resolve." If the template is weakened (or a session reinterprets it), the audit will silently pick a side on an architectural question. Catch with close reading.

What `wb-flow-docs`'s playbook gets wrong about `/wbAudit`: treating it as a standard code review, when the key design difference is the adversarial re-prompt ('assume a paying customer who hates this codebase') as a first-class mechanism — without it, default LLM agreeableness produces rubber-stamp audits.

## One-paragraph verdict

An adversarial-prompt command whose real value is forcing the LLM out of default agreeableness and into structured criticism — plus persisting findings across sessions via `reports/`. The role-flip is a mitigation, not a fix; "harsher" is a required prompt discipline, not an edge-case recovery. The score+recommendation+severity+did-not-check discipline is what separates useful audits from rubber-stamps. Weakest in score consistency, hallucinated line references, and lack of differential mode. The "Red-Team" and "Dynamic Scoping" framings from gemini's version are theatrical relabels of straightforward mechanisms. Correct for solo pre-release checks; needs ground truth (tests, user reports) to stay honest over time.

---

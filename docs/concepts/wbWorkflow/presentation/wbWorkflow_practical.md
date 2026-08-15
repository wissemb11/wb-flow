# /wbWorkflow — Practical

How the state machine behaves in real daily use. Use this when you've noticed a session going sideways and want to understand *which transition went wrong*.

## The four real-world transitions

### Transition 1: Fresh session → context loaded
**Trigger:** you type `/wbContext <pkg>`.

**What should happen:** AI reads `.agents/workflows/context.md` + `dev.md`, then scans `reports/YYYY/MM/DD/` for the last 1–3 days.

**What indicates it went wrong:** the AI proposes a framework version that doesn't match the package (e.g., Vue 3 syntax for wb-press). That's a sign `dev.md` wasn't actually ingested — either the file is missing rules, or the session started without `/wbContext`.

**How to recover:** re-run `/wbContext`. If it still drifts, `/wbContext --refresh` to force a full re-scan.

### Transition 2: Context loaded → path chosen
**Trigger:** your next message. Either a natural-language description (→ Path A, small job) or `/wbPlan <pkg>` (→ Path B, big job).

**What should happen:** the AI commits to one path and doesn't flip-flop. Path A goes direct to implementation; Path B produces a plan table and stops.

**What indicates it went wrong:** AI starts writing code when you asked for a plan, or starts planning when you asked for a fix. Usually because your phrasing was ambiguous ("can you figure out how to add X?" sounds like planning but lands like implementation).

**How to recover:** be explicit. "Plan this, don't implement yet" or "Implement this directly, no plan."

### Transition 3: Path A (direct) → completion
**Trigger:** AI finishes the small job.

**What should happen:** AI reports what changed, how to test, and stops. No "shall I also fix X while I'm here?" sprawl.

**What indicates it went wrong:** the diff is larger than you expected. The AI "noticed an opportunity to improve" something unrelated. Every time this happens, a rule is missing from `dev.md`. Add it.

**How to recover:** tell it explicitly "revert the unrelated changes." Then amend `dev.md` so next session doesn't need the reminder.

### Transition 4: Path B (plan) → worker/validator loop
**Trigger:** you execute a task from the plan table.

**What should happen:** worker AI writes the code and saves `task_report.md`. You hand the report to validator AI. Validator reads both the code and the report, and either ✅ (pass) or sends back with notes.

**What indicates it went wrong:** validator rubber-stamps everything. Usually because the validator is the same model as the worker, or because your prompt to the validator didn't include the "be harsh" framing.

**How to recover:** make validator a different model. Explicitly prompt: "be brutally honest. Would this pass a review from someone who hates this code?"

### Transition 5: Upstream report → flag-chained shortcut → Path B
**Trigger:** you append `--act --wbPlan` (or just `--wbPlan`) to `/wbAudit`, `/wbReview`, or `/wbStandup`.

**What should happen:** the upstream command produces its normal output, then the `/wbActOn` engine fires automatically — produces a sibling action file (5-color triage of every finding, ranked into TODAY/WEEK/MONTH/LATER), then a sibling plan file scoped to the 🔵 multi-step findings only. The plan file lands in Path B's worker/validator loop the same way a manual `/wbPlan` would.

**What indicates it went wrong:** the plan file has 0 sections (no 🔵 findings in the source — the chain is silently a no-op for plans), OR the plan file has 10+ sections (every finding got marked 🔵 because the source's 5-color triage was sloppy). Both are signs to re-read the action file before executing the plan.

**How to recover:** if 0 sections, drop `--wbPlan` and just use `--act` for ranked actions. If 10+ sections, manually narrow scope with `/wbPlan <pkg>` against a hand-picked subset, treating the chained plan as a draft.

## The practical truth about the Worker/Validator loop

The architecture assumes you're the human bridge between worker and validator sessions. In practice:

- If you're solo with one AI model (just the agent or just the agent), you simulate the loop by asking the same AI to "now review what you just wrote as if you didn't write it." This works but is weak — the same model rarely catches its own blind spots.
- The loop gets real teeth when worker and validator are *different* models. the agent validating Qwen3's output catches class-of-error patterns the agent wouldn't have written in the first place.
- If you skip the validator step entirely ("it looks fine, ship it"), you're using Path B wrong. Without the validator, Path B is just Path A with more paperwork.

## Morning routine, actually

```
/wbContext core2/ # sync at the monorepo level
# look at the standup output
/wbContext <package-you-chose> # sync at the package level
```

Two context calls, not one. The first tells you *what's going on*; the second tells the AI *what you're working on today*. the agent's playbook collapses these into one step and you lose the standup info.

## When to stop following the workflow

The workflow is a default, not a law. Stop following it when:

- You're doing throwaway exploration. Context/audit/plan are all overhead for work you'll delete.
- You're in flow and the AI is executing well on a small job. Don't interrupt a good flow with a forced `/wbPlan`.
- You've done the same sequence 50 times and you know what every step will output. Skip the steps whose output you can predict.

Rigidly following the workflow at all times is a sign you haven't internalized it yet.

---

# /wbActOn — Expert

## What `/wbActOn` is, architecturally

A **post-processor command** with a strict separation of concerns: it never modifies source content, never invents findings, and never executes the actions it ranks. Its single job is **decision compression with auditable ranking** — turning a long document of N findings into a 1️⃣→N execution thread where every rank is justified and every finding has an exact prompt or command attached.

The architectural insight is that **triage is a different cognitive task than discovery**. `/wbAudit` discovers; `/wbActOn` triages. Collapsing them (as some "all-in-one" tools do) produces audits that drift toward whatever the model thinks is easy to fix, rather than the real findings. By keeping the engines separate, the audit stays brutal and the triage stays focused.

The novelty is **engine reuse via flags**. The same triage logic runs as `/wbActOn <file>` (standalone) and as `--act` on `/wbAudit`, `/wbReview`, `/wbStandup` (chained). Same color taxonomy, same 5 prioritization rules, same output skeleton. One engine, multiple entry points.

## The pattern `/wbActOn` enforces

1. **Input mode detection.** No flag — type-detected:
 - File under `.agents/workflows/reports/` → **Mirror mode** (output goes next to source)
 - File anywhere else → **Side-car mode** (output anchored at monorepo root)
 - Folder → **Pick-then-process** (lists candidates, asks user)
2. **Color-code each finding** using the 5-color taxonomy (one and only one per callout).
3. **Rank globally** using the 5 prioritization rules in fixed order.
4. **Annotate the source copy** with `[<ModelName> action]` blockquotes after every paragraph, plus an action column in every table.
5. **Synthesize the action file** — §0 ranked thread + annotated source + tally + footer.
6. **Optionally generate a sibling plan file** (`--wbPlan`) with worker/validator tasks for 🔵 findings only.

The 5 colors are **non-overlapping by design**. A finding cannot be both 🟢 (one-sentence) and 🔵 (multi-step). This forces the model to commit to a category, which is what makes the rank justifiable.

## The 5 prioritization rules (fixed order, not optimization criteria)

```
1. Stop the bleeding first
2. Cheap before expensive
3. Unblockers next
4. Strategy in parallel
5. Defer the deferable
```

These are applied **in order**, not weighted. A 🔴 production breakage outranks every 🟢 / 🟡 / 🟣 / 🔵 below it, regardless of how cheap the others are. This is opinionated by design — it's how a senior engineer actually triages, not how an optimizer would minimize total cost.

The "what I would NOT touch" section is the inverse list — findings explicitly de-prioritized. Including this is the same principle as `/wbNext`'s rejected-alternatives section: surface the negative space so the user can disagree.

## Why "Recommended Model" per rank matters

Each rank gets a recommended model (the agent 4 / Qwen3 Coder / the agent the agent 4 / the AI agent). This isn't model-marketing — it's calibration:

- Simple syntactic fixes (🟢 quick) → cheap model, lower context
- Subtle logic (🟢 inline but tricky) → the agent
- Console errors (🔴) → the agent (root-cause reasoning)
- File-level mess (🟡) → Qwen3 (volume work)
- Strategic memos (🟣) → the agent / the agent Pro (long-form synthesis)
- Multi-step coordination (🔵) → the agent for decomposition; varies per task

Without per-rank model assignment, users default to "use the strongest model for everything" — which is wasteful for 🟢 and 🟡, and undermines the whole "cheap before expensive" rule.

The recommendation is **advisory** — the user can override. But always state one explicitly; never leave it as "you decide" — that's where decision fatigue eats the workflow.

## The flag matrix and what it tells you about the design

| Command | (no flag) | `--act` | `--wbPlan` | `--act --wbPlan` |
|---|---|---|---|---|
| `/wbAudit <pkg>` | audit only | audit + action | audit + plan | audit + action + plan |
| `/wbReview <pkg>` | review only | + action | + plan | + action + plan |
| `/wbStandup <pkg>` | standup only | + action | + plan | + action + plan |
| `/wbPlan <pkg>` | plan only | re-ranked plan | **error** | **error** |
| `/wbActOn <file>` | action only | (always acts) | + plan | (always acts) + plan |

Two design choices visible in this table:

1. **`/wbPlan --wbPlan` errors as no-op.** A plan already IS a plan; you can't plan a plan. The fact that this is an error rather than silent acceptance is the discipline.

2. **Other `/wb*` commands don't take these flags** because they either *do* the work directly (`/wbDebug`, `/wbDeploy`, `/wbRefactor`, `/wbTest`, `/wbClean`, `/wbGit`) or describe state without producing actionable findings (`/wbContext`, `/wbSetup`, `/wbVision`). The flags only attach to commands that produce actionable output.

This matrix is the API contract for the triage engine. If a new command is added that produces findings, it should expose `--act` and `--wbPlan` automatically.

## Multi-model entries — the Smart Merge consensus pattern

The same source can be processed by N different models. Each appends a new Entry #N to the same file, tagged `*(ModelName — HH:MM)*`. The user diffs entries to compare opinions.

This is the **only place** in the workflow where Smart Merge produces real consensus value. When `/wbAudit` runs twice on the same package, the second run's findings rarely contradict the first's at a categorical level. But when `/wbActOn` runs from the agent vs. the agent on the same audit, the *ranking* often diverges — which is signal. The user reading both rankings learns more about the source than either ranking alone reveals.

## The failure modes

1. **Inventing findings.** The hardest discipline. The annotated source must add no information that wasn't in the original. Counter: the action file's tally counts findings; if the tally exceeds source-finding count, the model invented some. Re-run with explicit "no inventions."

2. **Over-coloring.** Every paragraph wants a callout. Some don't deserve one. Counter: the §0 ranked thread should be shorter than the source, not 1:1. If §0 has 23 ranks for 23 findings, the model didn't actually triage — it just renumbered.

3. **Strategic findings hidden under tactical.** The 🟣 (strategic) color exists to surface findings that *aren't slash-command tasks* — they need a memo, a meeting, a roadmap update. Models tend to under-flag these because they don't fit the "actionable" frame. Counter: the tally must include "X of Y findings are not slash-command tasks" — quantifying the strategic surface.

4. **Acting on every callout.** The user reads §0 and feels obligated to fix everything. The whole point of §0 is *you stop at the first 🔴/TODAY rank and ship that*. The tally exists to prove the surface is bigger than the work — believe it.

## What `/wbActOn` cannot do

- It cannot triage zero-structure documents (free-form notes, untitled markdown). Fix the source first.
- It cannot generate new findings (that's the upstream `/wb*` command's job).
- It cannot execute the actions (run the prompts/commands it produced).
- It cannot replace user judgment on rank order — the user can override ranks; the model logs the override in the next entry.

What `wb-flow-docs`'s playbook gets wrong about `/wbActOn`: framing it as general-purpose prioritization when the actual design is triage from structured diagnostic inputs — it reads audit/plan/next files, not free-form text. The 'action_plan' output is a re-ranked execution order, not a new plan document.

## One-paragraph verdict

The most important post-processor in the workflow. Its discipline (never modify source, never invent findings, always state recommended model, always include rejected alternatives) is what makes its output trustworthy enough to act on. The fixed-order priority rules — not weighted, not optimized — match how senior engineers actually triage and produce more useful rankings than any cost-minimization function would. Engine reuse via `--act` flag is the right architectural choice; it keeps audit-vs-triage separation while removing the friction of running them as separate commands. The biggest risk is invented findings; the tally is the only safeguard. Don't run it on unstructured input.

---

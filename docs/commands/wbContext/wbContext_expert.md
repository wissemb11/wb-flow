# /wbContext — Expert

## What `/wbContext` actually is

A **drift detection + rehydration command** over per-package metadata. The job is not to generate context from scratch (that's `/wbSetup`) — it's to reconcile stored understanding with current reality, surface the delta, and ingest recent report activity into the session's working memory.

Two outputs:
- **In-place update** of `.agents/workflows/context.md` (if drift was acknowledged).
- **Dated report** in `reports/YYYY/MM/DD/contexts/` capturing the full drift analysis.

The dated report is the audit trail; the in-place file is the canonical baseline.

## The architectural value

Most context systems solve the *initial loading* problem and ignore the *staleness* problem. `/wbSetup` handles the first. `/wbContext` handles the second — which is quantitatively the larger problem in a monorepo that's been touched for more than a month.

The design choice worth naming: `/wbContext` does not silently rewrite `context.md` when it finds drift. It asks. That inversion matters. A silent rewriter assumes the AI is more correct than the stored rules. An asking rewriter assumes the stored rules encode *intent* that current code may have drifted from — and intent beats accidental state.

## The "90% architectural drift reduction" claim

Invented number, same as every other the documentation in this corpus. The honest version:

- `/wbContext` measurably reduces one *specific* failure mode: the AI proposing framework or convention choices that contradict stored rules. Reduction is large but unquantifiable without telemetry.
- It does *not* prevent drift caused by `dev.md` being stale. Stale rules enforced confidently are *worse* than no rules.
- It does not prevent convention drift when `context.md` lists a convention but the AI is given instructions that implicitly contradict it. Example: "refactor this to be more idiomatic Vue" can silently override "we use `wb-button`, not `v-btn`" because the instruction frames the override as virtue.

Real drift reduction is a function of: rule freshness, rule specificity (negative > positive), and user discipline in answering the drift questions.

## The three design decisions that matter

### 1. Asking, not rewriting
Covered above. The inversion that makes the command trustworthy.

### 2. Drift as a structured diff, not a vibe check
The command does not produce "I think your context is mostly right." It produces a list: manifest unchanged, exports +2, config changed `X → Y`. Each drift item is individually acknowledgeable. This structure is what lets the command scale — the user can triage, not just accept-or-reject wholesale.

### 3. Report ingestion into working memory
The part everyone underestimates. When the AI reads `reports/20260422/audits/` into this session, it's not just loading documents — it's conditioning its own subsequent generation on recent known issues. A `/wbContext` that skips this step degrades to a static-docs loader, which is what every other "AI context" tool actually is.

## Where the command leaks

1. **The drift check uses heuristics, not a schema.** "exports +2" is detected by diffing source AST; "convention drift" is detected by prompt inference. The latter is weak. A subtle convention violation (e.g., new code that *sometimes* uses `apiResponse_` and *sometimes* doesn't) won't reliably surface.

2. **No provenance on `context.md`.** If someone (or a past AI) hand-edited the file, `/wbContext` can't tell. It treats the file as canonical even if it was corrupted two sessions ago.

3. **Questions are optional to answer.** The command asks, but nothing enforces answering. A user who consistently ignores questions ends up with a permanently stale baseline that no number of `/wbContext` runs will fix.

4. **Focused sidecar files multiply.** `context_extractSubObject.md`, `context_wbc_renderer.md`, `context_routing.md`... over time these accumulate. No garbage-collection mechanism. A 2-year-old sidecar may silently contradict current reality with no signal to the user.

5. **Global scope writes a survey, not an update.** This is correct behavior but surprising the first time. Users who run `/wbContext core2/ --scope=global` expecting per-package files to update will be confused. The command is correctly scoped; the UX leaks.

What `wb-flow-docs`'s playbook gets wrong about `/wbContext`: treating it as a generic snapshot, when the Claude edition distinguishes between permanent identity (context.md, created once by /wbSetup) and session-scoped snapshots (`context_<scope>_<date>.md`, created by /wbContext). Collapsing them loses the architectural distinction.

## One-paragraph verdict

A drift-detection command built on the correct inversion — ask, don't rewrite; structured diff, not vibe check; condition session generation on recent reports, not just static docs. The three design decisions are sound; the "Fractal" and "90%" framings in gemini's version are marketing on top of real substance. Weakest leaks are convention-drift detection (hard problem), no provenance on the baseline file, and user discipline gaps around the question/answer loop. Correct for solo monorepo work; needs answer-enforcement and baseline-integrity tooling to survive at team-scale. The command does what it claims; the claims are slightly larger than what it does.

---

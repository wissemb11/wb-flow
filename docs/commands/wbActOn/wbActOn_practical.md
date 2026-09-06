# /wbActOn — Practical

## One command, three input modes + one flag

```
/wbActOn <file-path> # action file only
/wbActOn <file-path> --wbPlan # action file + sibling plan file
/wbActOn <folder-path> [--wbPlan] # list recent reports, ask which (skip if one)
```

The mode is **detected from the input type**:

| Input | Mode | Output path |
|---|---|---|
| File under `.agents/workflows/reports/` | **Mirror** | `<target>/.agents/workflows/reports/<date>/actions/action_<name>_<date>.md` (Entry #N) |
| File anywhere else | **Side-car** | Anchored at monorepo root: `frontEnd/wbc-ui/core2/.agents/workflows/reports/<date>/actions/action_<name>_<date>.md` (Entry #N) |
| Folder | **Pick-then-process** | Lists `*.md` under `<folder>/.agents/workflows/reports/`, asks which |

**With `--wbPlan`:** also appends a plan entry to `plans/plan_<name>_<date>.md` — one file with N sections (one per 🔵 finding), worker/validator model pairs per task.

**Outputs never go to `docs/ai_reference/`** — that folder is canon-only. The reference walkthrough at `start_here/from_audit_to_action_wb-core_walkthrough.md` is a hand-curated example, not a runtime output location.

**Multi-model:** the same source can be processed by N different models — each appends a new Entry #N to the same file, tagged `*(ModelName — HH:MM)*`. Diff entries to compare opinions.

## When to run it

- **After every `/wbAudit`** — turns 23 findings into a 3-rank execution thread.
- **After `/wbReview`** — triages review comments into act / push-back / defer.
- **After `/wbPlan`** — re-ranks plan steps by your actual constraints.
- **On any third-party doc** — competitor analysis, security report, design memo.

Skip it after: `/wbDebug`, `/wbDeploy`, `/wbGit`, `/wbClean`, `/wbRefactor`, `/wbTest`, `/wbContext`. These either *do* the work or describe state — there's nothing to triage.

## What it produces (always the same skeleton)

1. **`# I am <ModelName>...`** opener — the active triage model self-declares.
2. **🧭 Decision tree** at the top (the 5 colors).
3. **🚦 §0 — If I Were You** — ranked thread (1️⃣ → N) with justifications, time windows (TODAY / THIS WEEK / THIS MONTH / LATER), "what I would NOT touch", 60-second mental model, ROI estimate, **and a `Recommended Model` column per rank**.
4. **Annotated source** — original content unchanged, with `[<ModelName> action]` blockquotes after every paragraph and a `<ModelName> action` column appended to every table. Every callout includes a `Recommended model: <name>` line.
5. **Action Tally appendix** — counts per color **+ recommended-model mix**, with the insight ("X of Y findings are not slash-command tasks").
6. **"How to use" footer** — the 5-step method for next time.

**With `--wbPlan`:** also a sibling plan file with N sections (one per 🔵 finding), each section's task table has a `Worker Model` and `Validator Model` column per row.

## The 5 colors (every callout uses exactly one) + recommended models

| Color | Decision | Output includes | Default recommended model |
|---|---|---|---|
| 🟢 | One-sentence work (simple) | Exact one-shot prompt to paste back | the agent 4 / Qwen3 Coder |
| 🟢 | One-sentence work (subtle logic) | Same | the agent the agent 4 |
| 🔴 | Console error | `/wbDebug "<exact error>"` | the agent the agent 4 |
| 🟡 | File-level mess (sweep) | `/wbClean <pkg>` | Qwen3 Coder / the agent Flash |
| 🟡 | File-level mess (refactor) | `/wbRefactor <file>` with target prompt | the agent the agent 4 |
| 🟣 | Strategic / business | One-shot prompt to draft the strategy memo | the agent the agent 4 / the AI agent |
| 🔵 | Multi-step coordinated (decomposition) | `/wbPlan` invocation with goal / constraints / out-of-scope | the agent the agent 4 |
| 🔵 | Multi-step coordinated (per-task execution) | Per-task entries in the plan file | varies — assigned per task |

The recommended model is **advisory** — the user can override. But always state one explicitly; never leave it as "you decide."

## The 5 prioritization rules (applied in this fixed order)

1. **Stop the bleeding first** — consumer-facing breakage and high CVEs outrank everything.
2. **Cheap before expensive** — a 30-min 🔴 fix outranks a 1-day 🟡 refactor.
3. **Unblockers next** — fix the test runner before any refactor.
4. **Strategy in parallel, not serial** — strategic memos run in their own lane; they don't block code work.
5. **Defer the deferable** — P2 always loses to P0/P1.

## Hard rules

- **Never modifies the source.** The annotated copy is the only artifact.
- **Never invents findings** that aren't in the source. Annotates; doesn't author.
- **Always includes the exact prompt or command.** A callout that says "you should refactor this" without the command is useless.
- **Always justifies the rank.** Each numbered rank in §0 has a Justification cell.
- **If the source has no obvious actions** (e.g., a pure context/state report), §0 says "No actions — this is a state snapshot." Doesn't manufacture work.

## Flag matrix on upstream commands (`--act` and `--wbPlan`)

The `/wbActOn` engine is also exposed via flags on a small set of upstream commands. The flags are **independent and composable**:

| Command | (no flag) | `--act` | `--wbPlan` | `--act --wbPlan` |
|---|---|---|---|---|
| `/wbAudit <pkg>` | audit only | audit + action file | audit + plan file | audit + action + plan (chain of three) |
| `/wbReview <pkg>` | review only | review + action file | review + plan file | review + action + plan |
| `/wbStandup <pkg>` | standup only | standup + action file | standup + plan file | standup + action + plan |
| `/wbPlan <pkg>` | plan only | re-ranked plan | **error: no-op** | **error: no-op** |

Why both flags and not collapsed:

- `--act` alone is the cheap path — triage without committing to a multi-section plan file.
- `--wbPlan` alone is the direct path — skip triage when you already know what's worth planning.
- `--act --wbPlan` together is the obvious chain (triage *then* plan the 🔵s).

Other `/wb*` commands don't take these flags because they either *do* the work directly (`/wbDebug`, `/wbDeploy`, `/wbRefactor`, `/wbTest`, `/wbClean`, `/wbGit`) or describe state without producing actionable findings (`/wbContext`, `/wbSetup`, `/wbVision`). For those, run `/wbActOn` standalone if needed.

## When `/wbActOn` is the wrong command

- The source has zero structure (free-form notes, untitled markdown) → fix the source first; `/wbActOn` needs sections, tables, or numbered items to triage.
- You want to *generate* a new audit/plan/review → use the upstream `/wb*` command. `/wbActOn` is the post-processor.
- You want to *execute* the actions, not just rank them → run the prompts/commands `/wbActOn` produced. The triage doesn't replace the work.

## The one mistake to avoid

**Acting on every callout.** The whole point of §0 is that **you stop at the first 🔴 / TODAY rank** and ship that before opening anything below. The tally exists to prove the surface is bigger than the work — believe it.

## Reference

2. **Follow the walkthrough.** If you haven't seen the end-to-end flow, read [First Run Walkthrough](../../start_here/first_run_walkthrough.md).

Built from `/wbAudit packages/wb-core/` on 2026-04-26. Every future `/wbActOn` run matches its structure, density, and tone exactly.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Documented shortcuts are listed below.

| Long form | Shortcut |
|---|---|
| `--act` | `-a` |
| `--wbPlan` | `-P` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

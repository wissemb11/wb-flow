# /wbActOn: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbActOn`

## One command, three input modes + one flag

```
/wbActOn <file-path>                    # action file only
/wbActOn <file-path> --wbPlan           # action file + sibling plan file
/wbActOn <folder-path> [--wbPlan]       # list recent reports, ask which (skip if one)
```

The mode is **detected from the input type**:

| Input | Mode | Output path |
|---|---|---|
| File under `.wb/workflows/reports/` | **Mirror** | `<target>/.wb/workflows/reports/<date>/actions/action_<name>_<date>.md` (Entry #N) |
| File anywhere else | **Side-car** | Anchored at monorepo root: `frontEnd/wbc-ui/core2/.wb/workflows/reports/<date>/actions/action_<name>_<date>.md` (Entry #N) |
| Folder | **Pick-then-process** | Lists `*.md` under `<folder>/.wb/workflows/reports/`, asks which |

**With `--wbPlan`:** also appends a plan entry to `plans/plan_<target>_<date>.md` — one file per day per scope (no extra suffixes), with N sections (one per 🔵 finding), worker/validator model pairs per task. If the plan file already exists, append as Entry #N.

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
| 🟢 | One-sentence work (simple) | Exact one-shot prompt to paste back | Sonnet 4 / Qwen3 Coder |
| 🟢 | One-sentence work (subtle logic) | Same | Claude Opus 4 |
| 🔴 | Console error | `/wbDebug "<exact error>"` | Claude Opus 4 |
| 🟡 | File-level mess (sweep) | `/wbClean <pkg>` | Qwen3 Coder / Gemini Flash |
| 🟡 | File-level mess (refactor) | `/wbRefactor <file>` with target prompt | Claude Opus 4 |
| 🟣 | Strategic / business | One-shot prompt to draft the strategy memo | Claude Opus 4 / Gemini 3.1 Pro |
| 🔵 | Multi-step coordinated (decomposition) | `/wbPlan` invocation with goal / constraints / out-of-scope | Claude Opus 4 |
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

## Reference example

The canonical, working output is:
[from_audit_to_action_wb-core_walkthrough.md](../../../start_here/from_audit_to_action_wb-core_walkthrough.md)

Built from `/wbAudit packages/wb-core/` on 2026-04-26. Every future `/wbActOn` run matches its structure, density, and tone exactly.

> For deeper reading: [`docs_claude/commands/wbActOn/wbActOn_practical_claude.md`](../../docs/docs_claude/commands/wbActOn/wbActOn_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--act` | `-a` |
| `--wbPlan` | `-P` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbActOn <scope_folder>           # normal mode — produce a fresh output file
/wbActOn <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbActOn` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-a` → `--act`
- `-P` → `--wbPlan`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Triage Officer
**TARGET:** Any markdown file (typically a `/wb*` report — audit, plan, review, standup, context — but works on any structured document, including third-party reports, design docs, competitor analyses).
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the action and plan files this command produces (relative links, full-syntax commands, self-correct mode, **§9 Action Type Tagging** — preserve / propagate the `Requires` column when re-ranking; if the source file pre-dates v1.8 or has the older `🔗 Type` column with per-row links, normalize to the plain-text `Requires` column with a single `## 🔗 Action Types` legend).

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# I am <ModelName>. If I Were At Your Place — Action Walkthrough for <scope>` (action file)
or `# Plan — <scope> (recommended by <ModelName>)` (companion plan from `--wbPlan`).

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

ActOn-specific gap-fills:

- Bare `/wbX` in callouts → full-syntax `/wbX <target>` per §2.
- Plain-text source/target file references → relative markdown links per §1.
- Missing `Recommended model` line on a callout → fill from the per-action recommendation table in Phase 2.

---

## ━━━ OBJECTIVE ━━━

Turn a **diagnostic document** into an **execution order**.

Apply a 5-color decision tree to every section / paragraph / table-row of the input. Output an annotated copy that opens with a single ranked execution thread (`§0 — If I Were You`) and continues with per-section `[<Model> action]` callouts containing exact prompts/commands the user can copy-paste.

This is the "from theory to practice" bridge for any document the user reads.

**Multi-model design:** The active model self-declares its identity (per `feedback_model_selection`) and every callout label uses that identity. Multiple models running `/wbActOn` on the same source on the same day append their entries to the same universal daily file — tagged with `*(ModelName — HH:MM)*`. Diff the entries to compare opinions.

**`--wbPlan` flag:** When passed, also produces a sibling plan file containing one task table per 🔵 finding from the action file. The plan file's task table has a `Recommended Model` column per row (independent of the planner's identity).

---

## ━━━ THE DECISION TREE (canonical) ━━━

For every finding, idea, paragraph, or table row, ask in this order:

```
Is the console red? (any error message, failing build, broken state)
├── Yes  →  🔴 /wbDebug "<exact error message>"
└── No   →  Continue

Is the work small enough to describe in one sentence?
├── Yes  →  🟢 Inline. Provide the exact one-shot prompt. Skip /wbPlan.
└── No   →  Continue

Did the source flag messiness in a specific file? (>1000 LOC, dead code, monolith)
├── Yes  →  🟡 /wbClean <package> THEN /wbRefactor <that file> (provide both commands)
└── No   →  Continue

Is this a strategic / commercial / positioning / business-model decision?
├── Yes  →  🟣 No slash command. Open a doc; user decides; Claude advises.
└── No   →  🔵 /wbPlan <target> (multi-step, multi-file, coordinated work)
```

**Color legend** (used throughout the output):
- 🟢 **Inline / one-sentence** — describe + exact prompt
- 🔴 **/wbDebug** — console error
- 🟡 **/wbClean + /wbRefactor** — file-level mess
- 🟣 **Strategic** — human decision, no command
- 🔵 **/wbPlan** — multi-step coordinated work

---

## ━━━ PHASE 1: INGEST ━━━

1. **Read the input file end-to-end.** Do not skim.
2. **Identify document type** from filename + headers. Common types and their cues:
   - `audit_*` / `audit-*` / "Technical Audit" → audit
   - `plan_*` / "Plan" / numbered task table → plan
   - `review_*` / "Review" / "PR Review" → review
   - `standup_*` / "Daily Standup" → standup
   - `context_*` / "Context Report" → context
   - Anything else → "other" (third-party report, design doc, competitor analysis, etc.)
3. **Inventory the structure.** Note:
   - Tables (will need a `Claude action` column appended)
   - Enumerated lists / numbered items (will need per-item rank)
   - Prose paragraphs (will need a trailing `[Claude action]` callout)
4. **Temporal-memory pass.** Scan `<target_folder>/.wb/workflows/reports/` for prior `actions/` outputs on the same source — if one exists, reference it and only re-rank if the source has changed.

---

## ━━━ PHASE 2: DECIDE ━━━

For every finding, walk the decision tree above. For each callout:

- 🔴 → quote the **exact error message** that triggered it
- 🟢 → write the **exact one-shot prompt** the user would paste back to the recommended model
- 🟡 → write **both commands**: `/wbClean <pkg>` and `/wbRefactor <file>` with target prompt
- 🟣 → write the **decision question** + a one-shot prompt to draft the strategy memo
- 🔵 → write the **`/wbPlan` invocation** with goal, constraints, out-of-scope

**Add a `<Model> action` column** to every table in the source (where `<Model>` is the active triage model — e.g., `Claude action`, `Gemini action`). One row of action per row of input.

**Wrap each prose paragraph** with a `> [<Model> action — <where>]:` blockquote. Use the section anchor as `<where>` (e.g., `§4.1`, `§7 #3`).

**Per-action model recommendation (mandatory).** Every callout — table row or blockquote — must include a `recommended model` field. The model is picked by task complexity:

| Task type | Recommended model | Why |
|---|---|---|
| 🟢 One-shot inline (deterministic, narrow) | **Sonnet 4** or **Qwen3 Coder** | Fast, cheap, enough capability |
| 🟢 One-shot inline (touches subtle logic) | **Claude Opus 4** | Pays off for correctness on tricky one-liners |
| 🔴 /wbDebug | **Claude Opus 4** | Root-cause analysis benefits from reasoning |
| 🟡 /wbClean (sweep) | **Qwen3 Coder** or **Gemini Flash** | Repetitive, high-throughput |
| 🟡 /wbRefactor (file-level) | **Claude Opus 4** | Cross-file judgment, behavior preservation |
| 🟣 Strategic memo | **Claude Opus 4** or **Gemini 3.1 Pro** | Long-form synthesis |
| 🔵 /wbPlan (task decomposition) | **Claude Opus 4** | Coordination + dependency reasoning |
| 🔵 /wbPlan (per-task execution) | varies — assign per task in the plan | See §"--wbPlan flag" below |

The recommendation is advisory; the user can override. But always state one explicitly — never leave it as "you decide."

---

## ━━━ PHASE 3: RANK (the "If I Were You" thread) ━━━

Build a new top-of-file section called **`§0 — If I Were You: The Execution Order`** containing all actions ranked **1️⃣ → N**.

**Apply these prioritization rules in this fixed order:**

1. **Stop the bleeding first.** Anything that breaks current consumers (publish bugs, high CVEs, broken main branch) outranks anything that's "merely ugly."
2. **Cheap before expensive.** A 30-min fix on a 🔴 outranks a 1-day refactor on a 🟡.
3. **Unblockers next.** Fix the test runner / broken build / missing tooling before any refactor — refactoring without trustworthy tests is gambling.
4. **Strategy in parallel, not serial.** Strategic memos run in their own lane; they don't block code work.
5. **Defer the deferable.** P2 items always lose to P0/P1.

**Group ranks into time windows:**
- **TODAY** (≤ 2 hr total) — bleeding only
- **THIS WEEK** (parallel lanes — pick one per day) — clear-the-table items
- **THIS MONTH** (pick **one**, not all) — big-thing work
- **LATER** (P1/P2 — defer freely) — only if ahead of plan

**Always include a `What I would NOT touch` block** listing things the source explicitly said are working and should be left alone. This prevents reactive over-refactoring.

**Always include a 60-second mental model** at the bottom of §0:
```
Rank 1-N      (today)      → STOP THE BLEEDING       → X hours
Rank N+1-M    (this week)  → CLEAR THE TABLE         → Y hours
Rank M+1-K    (this month) → ONE BIG THING           → pick one
Rank K+1-end  (later)      → ONLY IF AHEAD OF PLAN   → defer freely
```

**Estimate the ROI** of doing only TODAY's ranks (e.g., "audit score moves from X → ~Y with Z hours of effort").

---

## ━━━ PHASE 4: WRITE ━━━

### Output paths (v2 — Universal Daily File)

The `docs/ai_reference/` folder is **reference-only** — never write outputs there. All `/wbActOn` outputs live in the per-target reports tree.

> **No `<model>/` subfolder.** All models contribute to ONE file per type per day.
> **Create-or-Append:** If the file exists, append your action/plan as the next Entry #N.

**Action file (always written):**
```
<target>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/actions/action_<short_name>_<YYYYMMDD>.md
```

**Plan file (only if `--wbPlan` flag is passed):**
```
<target>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_<target_scope>_<YYYYMMDD>.md
```

**STRICT NAMING RULE (plan files):** The plan filename MUST be exactly `plan_<folder_scope>_<YYYYMMDD>.md`. Do NOT append issue names, source types, or any other suffixes. ONE plan file per day per scope — append as Entry #N if the file already exists.

**Filename rules:**
- `<short_name>` = source basename minus type prefix and timestamp (e.g., `wb-core`, not `audit_wb-core_202604260500`)
- `<target_scope>` for plan files = the folder scope only (e.g., `wb-core`), no issue/source qualifiers
- `<target>` = the original source's package/app folder; for non-`/wb*` sources outside any target, use the monorepo root: `frontEnd/wbc-ui/core2/.wb/workflows/reports/`
- Model identity is in the **Entry #N header**, not the filename

**Example outputs** for `/wbActOn audit_wb-core_20260429.md --wbPlan` run by Claude Opus 4.7:
```
packages/wb-core/.wb/workflows/reports/20260429/actions/action_wb-core_20260429.md  ← Entry #1 by Claude Opus 4.7
packages/wb-core/.wb/workflows/reports/20260429/plans/plan_wb-core_20260429.md      ← Entry #1 by Claude Opus 4.7
```
If Gemini runs the same command later, it appends Entry #2 to the same files — but with **Smart Merge**:

### Smart Merge Protocol (finding-based commands only)

When you are the **second (or Nth) model** appending to an existing action or plan file, you MUST:

1. **READ** the entire existing file before writing.
2. **EXTRACT** all ranked findings from the existing §0 and action callouts.
3. **For each finding you identified**, check if it matches an existing finding:
   - **Match criteria:** ≥2 of: same file referenced, same function/method, >70% title token overlap.
   - **MATCH FOUND →** Do NOT create a duplicate. Instead add your ranking/model-recommendation/severity vote to a **Model Votes** detail section and update the **Consensus Table**.
   - **NO MATCH →** Add as a new finding.
4. **Build/update the Consensus Table** at the top with columns: `# | Finding | Confidence | Models | Color (consensus) | Recommended Model (consensus)`
   - Confidence: `🟢 N/N` (all models agree), `🟡 K/N` (partial).
   - Color: when models disagree on the 5-color category, use the **more actionable** color (🔴 > 🔵 > 🟡 > 🟢 > 🟣).
5. **Add a merge log** at the bottom: `> *Merged by <ModelName> — HH:MM — X duplicates enriched, Y new findings added*`

> **First model?** Just write normally as Entry #1. No Consensus Table needed — it will be created by the second model.

### Action file structure (mandatory)

```markdown
# I am <ModelName>. If I Were At Your Place — Action Walkthrough for <Short Name>

> **Active triage model:** <ModelName> (self-declared)
> **Source:** [<basename>](<relative path>) — generated by <command> on <date>
> **What this is:** <1 sentence>
> **How to read this file:** Black-text blocks are the source unchanged. Every `> [<ModelName> action]` blockquote is my annotation. Every `Recommended model` field tells you which model fits the task — not necessarily me.

---

## 🧭 The Decision Tree

<paste the canonical decision tree from this template>

---

## 🚦 §0 — If I Were You: The Execution Order

<the ranked thread per Phase 3 — every numbered rank includes a "Recommended model" cell>

---

# <Source title> (annotated)

<source content, section by section, with [<ModelName> action] callouts and "<ModelName> action" columns added; every callout has a "Recommended model: ..." line>

---

# Appendix: Action Tally

| Decision | Count | Examples | Recommended model mix |
|---|---|---|---|
| 🟢 Inline | N | <2-3 examples> | <e.g., 5× Sonnet 4, 3× Opus 4> |
| 🔴 /wbDebug | N | ... | <e.g., 1× Opus 4> |
| 🟡 /wbClean + /wbRefactor | N | ... | <e.g., 2× Opus 4 (refactor) + 1× Qwen3 (clean)> |
| 🟣 Strategic | N | ... | <e.g., 9× Opus 4> |
| 🔵 /wbPlan | N | ... | <e.g., 3× Opus 4 (planner) + per-task mix> |

> **Reading the tally:** State whether the source's surface is bigger than the actual work. (Often it is.)

---

## How to use this walkthrough

1. After every <command>, the action file lives next to the source under `actions/`.
2. Walk through it section by section, applying the 🧭 decision tree as a sanity check.
3. Tally the actions. If the tally has >5 🔵 /wbPlan items, the source is over-scoped — re-rank by P0/P1/P2 and defer.
4. Execute in order: 🟢 inline first → 🔴 debug second → 🟡 clean+refactor third → 🔵 plan last → 🟣 strategy in parallel (always). Use the recommended model per task.
5. Re-run the source command after each P0 lands. Use the source's scorecard (if any) as your only metric.
```

### Plan file structure (only when `--wbPlan` flag is passed)

```markdown
# Plan — <Short Name> (recommended by <ModelName>)

> **Source action file:** [<action_basename>](<relative path>)
> **Planner identity:** <ModelName>
> **Scope:** all 🔵 /wbPlan-class findings from the source action file. Inline 🟢, debug 🔴, refactor 🟡, and strategic 🣣 items are not in this plan — they execute outside the planning loop.

---

## Plan Index

| # | Requires | 🔵 Source Finding | Source Rank in §0 | Recommended Model | Estimated Effort |
|---|---|---|---|---|---|
| 1 | 🧠 Planner | <finding name> | <rank N> | <model> | <hours/days> |
| 2 | 🔨 Worker | ... | ... | ... | ... |

> **`Requires` column** (mandatory per `_shared/output_conventions.md` §9.3): plain-text action-type tag (`🧠 Planner` / `✅ Validator` / `🔨 Worker` / `📋 Mechanical`). Default for 🔵 /wbPlan-class items is `🧠 Planner` since they trigger sub-planning; non-planning rows take the tag of the actual sub-task. The file MUST also include a `## 🔗 Action Types` legend before the Generated Files footer.

---

## Plan §1 — <Finding 1 name>

**From source rank:** <N> · **Recommended model:** <model> · **Estimated effort:** <X>

| Task # | Task | Worker Model | Validator Model | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|
| 1 | <atomic step 1> | <model> | <model> | ⬜ | ⬜ |
| 2 | <atomic step 2> | <model> | <model> | ⬜ | ⬜ |
| 3 | <atomic step 3> | <model> | <model> | ⬜ | ⬜ |

**Goal:** <1-sentence>
**Constraints:** <bullet list>
**Out of scope:** <bullet list>

---

## Plan §2 — <Finding 2 name>

<same structure>

---

## How to execute

1. Each plan §N is independent — run them in priority order from the source action file's §0.
2. Worker model writes; Validator model checks (different model = independent perspective).
3. Mark ☐ Done when worker finishes, ☐ Valid when validator confirms.
4. If a plan §N reveals subtasks that themselves need planning, run `/wbActOn <this plan> --wbPlan` to recurse.
```

The plan file mirrors your existing `smartprompt_plan_*` task-table convention (worker/validator pattern from `wb-press2_wbdataviewer2`).

---

## ━━━ REFERENCE EXAMPLE ━━━

The canonical, working example is:
**[from_audit_to_action_wb-core_walkthrough.md](../../0_start_here/from_audit_to_action_wb-core_walkthrough.md)** (kept under `docs/ai_reference/0_start_here/` as a **reference document**, not a runtime output — runtime outputs go under `<target>/.wb/workflows/reports/`)

Built from `/wbAudit packages/wb-core/` output on 2026-04-26 by Claude Opus 4.7. Match its **structure, tone, and density of action callouts** exactly. Notable patterns to replicate:
- Per-section blockquote callouts (every prose section gets one)
- `<Model> action` column appended to every table — column header uses the active triage model's name
- Every callout (table row or blockquote) includes a **`Recommended model: <name>`** line
- Strategic findings get `🟣 No command — <Model> advises` with a one-shot prompt to draft the memo
- Every 🟢 inline item includes a **complete, copy-pasteable prompt**
- Every 🟡 item includes **both commands** (`/wbClean` + `/wbRefactor`) with the refactor target's exact prompt
- Every 🔵 item includes a **`/wbPlan` invocation** with goal/constraints/out-of-scope
- §0 always cross-links each rank to its source finding (e.g., "§4.1, §7 #3")
- §0 includes a `Recommended Model` column for every numbered rank

---

## ━━━ HARD RULES ━━━

1. **Never invent findings** that aren't in the source. Annotate; don't author.
2. **Always include the exact prompt or command** — a callout that says "you should refactor this" without the command is useless.
3. **Always justify the rank.** Each numbered rank in §0 has a Justification cell explaining *why* that order.
4. **Always preserve source headings and section numbers** so the user can cross-reference.
5. **Never modify the source file.** Always write to the output path; the source is read-only.
6. **If the source has no obvious actions** (e.g., a pure context/state report), produce a §0 that says "No actions — this is a state snapshot. Use it as input to a future command, not as a task list." Don't manufacture work.
7. **Respect feedback_no_git** — never embed git commands in any callout. For commit-related callouts, point to `/wbGit` (which produces commit-message text only).
8. **Respect feedback_model_selection** — see the per-action recommendation table in Phase 2; always state a model explicitly.
9. **Outputs go to `.wb/workflows/reports/`, never to `docs/ai_reference/`.** The reference folder is for canonical examples only.
10. **Self-declare model identity at the top of every output.** First line of the file is `# I am <ModelName>. ...` — this is the contract that lets parallel-model runs coexist in the same folder.

---

## ━━━ INVOCATION ━━━

```
/wbActOn <file-or-folder-path>                  # action file only
/wbActOn <file-or-folder-path> --wbPlan         # action file + sibling plan file
```

**Inputs:**
- If a **file** is given → process it directly.
- If a **folder** is given → list the most recent `*.md` files under `<folder>/.wb/workflows/reports/` and ask which to act on. If only one candidate exists, proceed without asking.

**End every action file with:**

## 🧭 What's Next?

Run `/wbNext <target_folder>` for a current, ranked list of next actions across all reports — `/wbActOn` ranks within one source, `/wbNext` ranks across them.

**Flags:**
- `--wbPlan` — also produce a plan entry (one task table per 🔵 finding from the action file). Same universal daily file convention with `plan_` prefix, lives under `plans/` instead of `actions/`.

**Multi-model runs:** the same source can be processed by multiple models — each appends an entry to the same file, tagged with `*(ModelName — HH:MM)*`. Diff the entries to compare opinions.

The user supplies the source; this command supplies the execution order — and optionally the plan to execute it.

---

## ━━━ EXTENSION TO OTHER COMMANDS (`--act` and `--wbPlan`) ━━━

The `/wbActOn` engine is also exposed via flags on a small set of upstream commands. The flags are **independent and composable**:

| Command | Flag | Behavior |
|---|---|---|
| `/wbAudit <target>` | (no flag) | Just the audit |
| `/wbAudit <target> --act` | | Audit + sibling action file (calls `/wbActOn` engine internally) |
| `/wbAudit <target> --wbPlan` | | Audit + sibling plan file (no intermediate action file) |
| `/wbAudit <target> --act --wbPlan` | | Audit + action file + plan file (chain of three) |
| `/wbReview` | same matrix | |
| `/wbStandup` | same matrix | |
| `/wbPlan <target> --act` | | Re-ranked version of the input plan |
| `/wbPlan <target> --wbPlan` | | **Error: no-op** — the output is already a plan; use `--act` alone |

The flag matrix is intentionally limited to these 4 commands. Other `/wb*` commands either *do* the work directly (e.g., `/wbDebug`, `/wbDeploy`, `/wbRefactor`, `/wbTest`, `/wbClean`, `/wbGit`) or describe state without producing actionable findings (`/wbContext`, `/wbSetup`, `/wbVision`). For those, run `/wbActOn` standalone if needed.

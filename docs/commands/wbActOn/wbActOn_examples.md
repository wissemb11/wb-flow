---
title: "wbActOn — Examples"
description: "---"
---

# /wbActOn — Examples

> Self-help. `/wbActOn` is the **triage layer** for any markdown file. It doesn't generate findings — it ranks them, attaches exact prompts/commands, and produces an annotated copy that opens with a single execution thread (`§0 — If I Were You`).
>
> Mental model: every `/wb*` command produces *diagnosis*. `/wbActOn` produces *prescription*.

---

## What /wbActOn actually does

**All outputs go under `<target>/.agents/workflows/reports/`** — never under `docs/ai_reference/`. The reference folder is canon-only; runtime artifacts live next to the source they came from, mirroring the `/wbAudit` and `/wbPlan` convention.

Two distinct modes, picked by the input type:

| Input type | Mode | Output path |
|---|---|---|
| File under `.agents/workflows/reports/` (a `/wb*` report) | **Mirror** | `<target>/.agents/workflows/reports/<YYYY>/<MM>/<DD>/actions/action_<name>_<YYYYMMDD>.md` (Entry #N) |
| File anywhere else (third-party doc, strategy memo, competitor analysis) | **Side-car** | Same path pattern, anchored at the monorepo root: `frontEnd/wbc-ui/core2/.agents/workflows/reports/<YYYY>/<MM>/<DD>/actions/action_<name>_<YYYYMMDD>.md` (Entry #N) |
| Folder | **Pick-then-process** | Lists recent `*.md`, asks which (skips ask if only one) |

**With `--wbPlan` flag:** also appends a plan entry to `plans/plan_<name>_<YYYYMMDD>.md`.

**Filename rules:**
- `<name>` = source short name (e.g., `wb-core`)
- Model identity goes in the **Entry #N header**, not the filename
- The same source can be processed by multiple models — each appends a new Entry #N to the same file, tagged `*(ModelName — HH:MM)*`. Diff entries to compare opinions.

The decision tree applied to every finding is constant:

```
🔴 console red? → /wbDebug "<error>"
🟢 one-sentence? → inline + exact prompt
🟡 file mess? → /wbClean + /wbRefactor (both commands)
🟣 strategic? → no command — <ModelName> advises
🔵 multi-step? → /wbPlan + invocation
```

**Per-action model recommendation (mandatory).** Every callout includes a `Recommended model` field — the model is picked by *task complexity*, independent of which model is doing the triage. Defaults:

| Task type | Recommended model | Why |
|---|---|---|
| 🟢 One-shot inline (simple) | the agent 4 / Qwen3 Coder | Fast, cheap, enough |
| 🟢 One-shot inline (subtle logic) | the agent the agent 4 | Correctness on tricky one-liners |
| 🔴 /wbDebug | the agent the agent 4 | Root-cause needs reasoning |
| 🟡 /wbClean (sweep) | Qwen3 Coder / the agent Flash | Repetitive, high-throughput |
| 🟡 /wbRefactor (file-level) | the agent the agent 4 | Cross-file judgment |
| 🟣 Strategic memo | the agent the agent 4 / the AI agent | Long-form synthesis |
| 🔵 /wbPlan (decomposition) | the agent the agent 4 | Coordination + dependency reasoning |
| 🔵 /wbPlan (per-task execution) | varies — see plan task table | Each task has its own worker/validator pair |

Every output file has the same skeleton: `# I am <ModelName>...` opener → §0 ranked thread (with Recommended Model column) → annotated source → action tally (with model mix) → "how to use" footer.

---

## Example 1 — `/wbActOn <audit_file>` (mirror mode, no flag)

```text
$ /wbActOn packages/wb-core/.agents/workflows/reports/20260426/audits/claude_opus_4_7/audit_wb-core_202604260500.md

[the AI agent] 7. Triaging this audit.
[AI] Phase 1: ingest...
[AI] Source type: audit (matched on filename + "Technical Audit" header)
[AI] Findings: 7 sections, 8 tables, 23 distinct findings
[AI] Temporal scan: no prior actions/ output for this source
[AI]
[AI] Phase 2: decide (walking decision tree per finding)...
[AI] §1 verdict row 1 (architecture) → 🟣 strategic | recommended: the agent the agent 4 (memo)
[AI] §1 verdict row 2 (code quality) → 🟡 refactor | recommended: the agent the agent 4
[AI] §1 verdict row 3 (security model) → 🟣 strategic | recommended: the agent the agent 4 (memo)
[AI] §1 verdict row 4 (deps) → 🟢 inline | recommended: the agent 4
[AI] §1 verdict row 5 (tests) → 🔴 /wbDebug | recommended: the agent the agent 4
[AI] §1 verdict row 6 (docs) → 🔵 /wbPlan | recommended: the agent the agent 4 (planner)
[AI] §1 verdict row 7 (publish) → 🟢 inline | recommended: the agent 4 (one-line edit)
[AI] ...23 findings classified, each with recommended model
[AI]
[AI] Phase 3: rank (applying 5 prioritization rules)...
[AI] Bleeding (publish + high CVE) → ranks 1-2 | the agent 4, the agent 4
[AI] Unblocker (test runner) → rank 3 | the agent the agent 4
[AI] Cheap clear-the-table (this week) → ranks 4-7 | mix
[AI] Big work (this month, pick one) → ranks 8-10 | the agent the agent 4
[AI] Defer (P1/P2) → ranks 11-14
[AI] ROI estimate: ranks 1-3 only → audit score 6.4 → ~7.2 with 2 hr effort
[AI]
[AI] Phase 4: write...
[AI] Output: packages/wb-core/.agents/workflows/reports/20260429/actions/action_wb-core_20260429.md
[AI] (Entry #1 by the AI agent)
[AI] Tally: 🟢 8 inline | 🔴 1 debug | 🟡 2 refactor | 🟣 9 strategic | 🔵 3 plan
[AI] Model mix: the agent 4 ×6, the agent the agent 4 ×16, Qwen3 Coder ×1
[AI] "Half the audit's findings are not slash-command tasks." (appendix)
[AI] No --wbPlan flag passed → no plan file written. Pass --wbPlan to also generate one.
```

**What's worth noticing:**

- The opener `7` is the model self-declaring per `feedback_model_selection`. The filename suffix matches.
- Phase 2 now shows the **recommended model per finding** — a finding can be triaged by the agent and recommend the agent 4 for execution if the task is simple. The triage model is not the executor.
- Phase 3 propagates model recommendations into the rank list — §0 in the output file has a `Recommended Model` column for every numbered rank.
- The output path is now under the source target's `.agents/workflows/reports/` — never under `docs/ai_reference/`. The walkthrough in `start_here/` is a **reference example**, not a runtime location.
- The final note about `--wbPlan` is the prompt for Example 4 below.

---

## Example 2 — `/wbActOn <folder>` (pick-then-process)

```text
$ /wbActOn packages/wb-dataviewer/

[AI] Folder mode. Scanning packages/wb-dataviewer/.agents/workflows/reports/ for *.md...
[AI]
[AI] Found 4 candidates (most recent first):
[AI] 1. legacy_migration_20260426/plan_wb-press2_wbdataviewer2/smartprompt_plan_wb-press2_wbdataviewer2.md (plan, 119 lines)
[AI] 2. legacy_migration_20260426/plan_wb-press2_wbdataviewer2/valid9.md (validation, 38 lines)
[AI] 3. legacy_migration_20260426/plan_wb-press2_wbdataviewer2/task9_gemini_3_1_pro.md (task report, 52 lines)
[AI] 4. legacy_migration_20260426/plan_wb-press2_wbdataviewer2/API.md (design doc, 187 lines)
[AI]
[AI] Which to act on? (1-4, or "all" to process each separately)
```

```text
[user] 1

[AI] Selected: smartprompt_plan_wb-press2_wbdataviewer2.md (plan)
[AI] Phase 1: ingest...
[AI] Source type: plan (matched on filename + numbered task table)
[AI] Findings: 10 tasks, 9 ✅ done, 1 ⬜ open (Task 10: Publish to npm)
[AI]
[AI] Phase 2: decide...
[AI] The 9 done tasks → 🟣 strategic (no action — historical record)
[AI] Task 10 (open) → 🟢 inline (single npm-publish dry-run)
[AI] + 🟣 strategic dependency: dist/ mismatch from audit §5
[AI] must be fixed first or dry-run will list phantom entry point
[AI]
[AI] Phase 3: rank — short list
[AI] 1. Fix dist/ mismatch in packages/wb-press/package.json (cross-link to audit)
[AI] 2. Run `npm publish --dry-run` from packages/wb-press/
[AI] 3. Add wb-press to root workspaces array (per context_core2 finding)
[AI]
[AI] Phase 4: write...
[AI] Output: packages/wb-dataviewer/.agents/workflows/reports/20260429/actions/action_wb-press2_20260429.md
[AI] (Entry #1 by the AI agent)
[AI] action_plan_wb-press2_202604261845_claude_opus_4_7.md
[AI] Tally: 🟢 2 inline | 🟣 1 cross-link
```

**What's worth noticing:**

- Folder mode never guesses; it always asks (unless one candidate). Better to ask once than annotate the wrong file.
- A plan with 9-of-10 done collapses to a 3-step §0 — `/wbActOn` doesn't manufacture work for completed items. They get a single 🟣 callout: "historical record, no action."
- Cross-document insight: the open task depends on a finding from a different report (the audit's dist/ mismatch). `/wbActOn` flags the cross-link; the user is not surprised by the dry-run failing.

---

## Example 3 — `/wbActOn` on a non-`/wb*` doc (side-car mode)

```text
$ /wbActOn docs/strategy/competitor_landscape_2026.md

[the AI agent] 7. Triaging this strategy doc.
[AI] Phase 1: ingest...
[AI] Source type: doc (no /wb* convention markers; treating as generic structured markdown)
[AI] Findings: 12 competitor entries in a table, 3 prose paragraphs of analysis
[AI] Temporal scan: source is outside .agents/workflows/reports/ — anchor at monorepo root
[AI]
[AI] Phase 2: decide...
[AI] Most rows: 🟣 strategic (competitor positioning is by definition human-decided)
[AI] | recommended: the agent the agent 4 (memo)
[AI] 2 rows mention specific feature gaps wb-core could close
[AI] → 🔵 /wbPlan candidates | recommended: the agent the agent 4 (planner)
[AI] 1 paragraph mentions a dead competitor (acquired, sunset)
[AI] → 🟢 inline (delete the row) | recommended: the agent 4
[AI]
[AI] Phase 3: rank...
[AI] Strategy lane (parallel): pick 1 of the 2 feature-gap /wbPlans this quarter
[AI] Hygiene: delete the dead-competitor row in next doc edit
[AI]
[AI] Phase 4: write...
[AI] Output: frontEnd/wbc-ui/core2/.agents/workflows/reports/20260429/actions/action_competitor_landscape_20260429.md
[AI] (Entry #1 by the AI agent)
[AI] action_doc_competitor_landscape_202604261910_claude_opus_4_7.md
[AI] Note: source is read-only. Output is anchored at the monorepo root because the source
[AI] lives outside any specific target package.
```

**What's worth noticing:**

- Non-`/wb*` sources work without any special handling. The source-type detector falls back to "doc" if no convention markers match, and the rest of the pipeline is unchanged.
- A strategy doc legitimately produces mostly 🟣 callouts. `/wbActOn` doesn't pretend to convert positioning analysis into code tasks. It surfaces the 1-2 things that *can* be acted on (the feature gaps) and leaves the rest as advisory.
- Output is anchored at the monorepo root's `.agents/workflows/reports/` — never under `docs/ai_reference/`. The reference walkthrough in `start_here/` is canon-only; runtime artifacts always go to the reports tree.

---

## Example 4 — `/wbActOn <audit_file> --wbPlan` (action + plan, chain of two)

```text
$ /wbActOn packages/wb-core/.agents/workflows/reports/20260426/audits/claude_opus_4_7/audit_wb-core_202604260500.md --wbPlan

[the AI agent] 7. Triaging + planning this audit.
[AI] Phases 1-4: same as Example 1 — produces action file at:
[AI] packages/wb-core/.agents/workflows/reports/20260426/actions/claude_opus_4_7/
[AI] action_audit_wb-core_202604261830_claude_opus_4_7.md
[AI]
[AI] Phase 5 (--wbPlan): generating sibling plan file...
[AI] Filtering action file for 🔵 /wbPlan-class findings only:
[AI] - Rank 11: pipe-| escape syntax design (was: §3, §7 #7)
[AI] - Rank 12: API reference docs generation (was: §7 #9)
[AI] - Rank 14: Vue 3 migration (was: §6, §7 #8)
[AI] 3 plan sections will be written.
[AI]
[AI] Per-task model assignment (worker / validator pairs):
[AI] Plan §1 (escape syntax)
[AI] T1: design escape rule | the agent the agent 4 / the AI agent
[AI] T2: implement in renderString | Qwen3 Coder / the agent the agent 4
[AI] T3: tests + docs | the agent the agent 4 / the agent the agent 4
[AI] Plan §2 (API docs)
[AI] T1: pick tool (typedoc?) | the agent the agent 4 / —
[AI] T2: JSDoc audit + fixes | Qwen3 Coder / the agent the agent 4
[AI] T3: build + publish pipeline | the agent Flash / the agent the agent 4
[AI] Plan §3 (Vue 3 migration) | DEFERRED — pre-req: rank 10 positioning doc
[AI]
[AI] Output: packages/wb-core/.agents/workflows/reports/20260429/plans/plan_wb-core_20260429.md
[AI] (Entry #1 by the AI agent)
[AI] Cross-link in action file's §0: each 🔵 rank now points to its plan §N.
```

**What's worth noticing:**

- The flag is `--wbPlan` (not `--withPlan`) — matches the upstream `/wbPlan` command name.
- The plan file is **one file with three sections**, not three plan files. Each section corresponds to one 🔵 finding from the action file.
- Each task in each section gets a **worker/validator pair** of different models — same pattern as `wb-press2_wbdataviewer2`'s smartprompt plan. Independent perspectives catch errors a single model would miss.
- Plan §3 is marked DEFERRED with the pre-requisite called out — `/wbActOn` recognizes that "Vue 3 migration" depends on a strategic decision (rank 10 positioning doc) that hasn't been made yet. It plans the section anyway, with the dependency noted, so when the strategy lands, the plan is ready.
- The action file's §0 is amended with cross-links (`Rank 11 → Plan §1`) so the user can navigate from triage to plan with a single click.

---

## The pattern

Every `/wbActOn` run has:

1. **Phase 1: ingest.** Read end-to-end, identify type, inventory structure (tables, lists, paragraphs), check for prior actions on the same source.
2. **Phase 2: decide.** Walk the 5-color decision tree per finding. Output the verdict-per-finding **with a recommended model** so the user can audit the triage.
3. **Phase 3: rank.** Apply 5 prioritization rules in order, group into TODAY / THIS WEEK / THIS MONTH / LATER, estimate ROI of TODAY's items.
4. **Phase 4: write action file.** Mirror or side-car mode → annotated copy with §0 thread + per-section callouts + tally appendix. All under `<target>/.agents/workflows/reports/<date>/actions/action_<name>_<date>.md` (Entry #N).
5. **Phase 5 (only if `--wbPlan`): write plan file.** One file with N sections (one per 🔵 finding), worker/validator model pair per task. Lives at `<target>/.agents/workflows/reports/<date>/plans/plan_<name>_<date>.md` (Entry #N).

**Hard rules:**
- `/wbActOn` never modifies the source. The source is read-only; the annotated copy is the artifact.
- Outputs **never** go to `docs/ai_reference/` — that folder is reference-only.
- Every output opens with `# I am <ModelName>...` so the active model is identifiable within the shared file.
- Every callout includes a `Recommended model` field — the model is picked by task complexity, independent of the triage model.
- §5 #2 — Link Integrity — Correct broken markdown links in docs. See [First Run Walkthrough](../../start_here/first_run_walkthrough.md).
 — kept under `docs/ai_reference/start_here/` as a **canonical example** (a hand-curated reference document, not a runtime output).

---

---

## Basic Usage

```bash
# Standard command execution
/wbActOn frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbActOn deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbActOn` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbActOn target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbActOn target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbActOn target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbActOn packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbActOn apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbActOn` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbActOn frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

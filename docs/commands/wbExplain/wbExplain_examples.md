---
title: "wbExplain — Examples"
description: "You opened a fresh planwb-core20260503."
---

# /wbExplain — Examples

> Real-shaped invocations from this monorepo. Pick the one that matches your situation, run it, then read the file in `explanations/`.

---

## 1. The plan row is vague — explain before working

You opened a fresh `plan_wb-core_20260503.md` and task #1 reads: *"Resolve Tier Bypass error in recursive parser."* Vague enough that running `/wbWork` blind is a coin-flip.

```
/wbExplain plan_wb-core_20260503.md --id=1 --as=eli5
```

You get a file at:
`packages/wb-core/.agents/workflows/reports/2026/05/03/plans/tasks/task_1/task_1_details_wb-core_20260503.md`

Three sections: what the bug is in plain language, where in the parser it lives, and what `/wbWork` would actually do. Now you can run `/wbWork --id=1` with confidence.

## 2. Subsystem question, no plan row involved

You're touching the `wb-press` cron scheduler for the first time and need to understand it before the audit run.

```
/wbExplain packages/wb-press/ "How does the cron scheduler decide when to fire?" --as=expert
```

Output: `packages/wb-press/.agents/workflows/reports/2026/05/03/plans/explanations/explain_cron-scheduler_20260503.md`

Two sections (no Recommended Approach, since this isn't a task): summary + deep dive. The deep dive cites file paths and line numbers from the actual code, not invented examples.

## 3. Multi-persona, multi-language for onboarding

Onboarding a new contributor who's stronger in French than English. You want one file with three angles.

```
/wbExplain packages/wb-core/ "What does WBC.js do?" --as=eli5,fr,ar
```

Output is a single file with three sections — ELI5 in English, ELI5 in French, ELI5 in Arabic. Smart-merge: if you already ran `/wbExplain` against this slug today, the new sections append to the existing file rather than spawning `explain_what-does-wbcjs-do_20260503_v2.md`.

## 4. Re-engaging after a `/wbValid` rejection

`/wbValid` rejected task #4. The worker AI doesn't know why. You don't either.

```
/wbExplain plan_core2_20260503.md --id=4 --as=expert
```

The explanation will read the plan row, the worker's task report, AND the validator's appended PASS/FAIL note. Output is a root-cause analysis, not a re-execution. Once you've read it, decide whether to:

- `/wbWork plan_core2_20260503.md --id=4 --open` (reset and retry; you now know what to fix)
- `/wbPlan plan_core2_20260503.md --id=4 --def` (defer; the issue is real but bigger than this row)

## 5. Wildcard batch — onboarding sweep

For onboarding a contributor who needs the full picture in their language, the bare `*` (or `--id=*`) generates one explanation per outstanding task in one shot:

```
/wbExplain packages/wb-core/ * --as=expert,fr
```

What runs:

1. Locates `plan_wb-core_20260503.md` for that target.
2. Filters rows where `Done` is `⬜`. Skips `✅`, `⏸️`, `🚫`.
3. For each open row, generates `task_<N>_details_wb-core_20260503.md` with both English-expert and French-expert sections.
4. Auto-links each plan row's `🔗` column to its newly created file (tagged `[📄 expert,fr]`).

Output (8 open rows in this example):

```
✅ Generated 8 explanation files:
 - tasks/task_1/task_1_details_wb-core_20260503.md (linked to row 1)
 - tasks/task_2/task_2_details_wb-core_20260503.md (linked to row 2)
 - tasks/task_3/task_3_details_wb-core_20260503.md (linked to row 3)
 ...
```

The plan file's `🔗` column now shows live `[📄 expert,fr]` links on every open row.

**Use this for onboarding, not for daily work.** Eight tasks × two languages = sixteen sections of generated content. Reading-and-actioning that volume in one sitting isn't realistic. The day-to-day pattern is one `/wbExplain` per task you genuinely don't understand.

If you find yourself reaching for `*` weekly, the plan rows are the problem — they're being written too vague, and the fix is in `/wbPlan`, not in batch-explanation.

## 5b. Bulk explain as anti-ritual — *don't*

The wildcard is supported. Running it as a *daily ritual* on every plan is the anti-pattern. Each unread explanation file is a chunk of `explanations/` you'll never read again, plus a plan-row link that suggests "this row is understood" when nothing happened in your head.

If 8 rows feel vague enough to need batch-explain on the same day they were written, the plan is the bug — rewrite the rows. `/wbExplain *` is a reader's tool, not a plan-author's smell-cover.

## 6. The chatty antipattern

```
/wbExplain plan.md --id=1
# (read it)
/wbExplain plan.md --id=2
# (read it)
/wbExplain plan.md --id=3
# (read it)
/wbWork plan.md *
```

Three explanations, one mass-execution. The plan rows must be vague enough that you needed three explainers, in which case you shouldn't trust `*` execution either. If you really need three explanations to read a plan, rewrite the plan first; *then* execute.

---

---

## Basic Usage

```bash
# Standard command execution
/wbExplain frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbExplain deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbExplain` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbExplain target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbExplain target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbExplain target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbExplain packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbExplain apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbExplain` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbExplain frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

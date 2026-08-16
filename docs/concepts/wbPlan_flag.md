---
title: "`--wbPlan` — Cross-Command Flag Reference"
description: "Single source of truth for the --wbPlan flag across all commands, covering semantics, output structure, and examples."
---

# `--wbPlan` — Cross-Command Flag Reference

> **Single source of truth** for the `--wbPlan` flag. The flag exists on multiple commands; this is the one place that documents the full surface — semantics, output structure, flag matrix, and the 4 mini-examples (one per command that accepts it).
>
> **Per-command examples files are not duplicates of this** — they only document each command's local handling. For the cross-command picture, read here.

---

## 1. What `--wbPlan` does (in one sentence)

When a command produces a markdown report (audit, review, standup, action-walkthrough), `--wbPlan` also appends a **plan entry** to `<target>/.agents/workflows/reports/<date>/plans/plan_<name>_<date>.md` — one universal daily plan file, with each model's contribution as a numbered Entry #N containing one section per 🔵 finding, each with a worker/validator task table.

The flag is **independent and composable** with `--act`. Both flags route through the same `/wbActOn` engine internally.

---

## 2. Flag matrix (every command × every flag combination)

| Command | (no flag) | `--act` | `--wbPlan` | `--act --wbPlan` |
|---|---|---|---|---|
| `/wbAudit <pkg>` | audit only | audit + action file | audit + plan file | audit + action + plan (chain of 3) |
| `/wbReview <pkg>` | review only | review + action file | review + plan file | review + action + plan |
| `/wbStandup <pkg>` | standup only | standup + action file | standup + plan file | standup + action + plan |
| `/wbActOn <file>` | action file only | n/a (always acts) | action file + plan file | n/a |
| `/wbPlan <pkg>` | plan only | re-ranked plan | **error: no-op** | error: no-op (the `--act` portion still runs) |

**Why `/wbPlan --wbPlan` errors:** the output of `/wbPlan` is already a plan; chaining `--wbPlan` on top would be recursive. Use `--act` alone to re-rank an existing plan with the active model's judgment.

**Other `/wb*` commands don't accept these flags** because they either *do* the work directly (`/wbDebug`, `/wbDeploy`, `/wbRefactor`, `/wbTest`, `/wbClean`, `/wbGit`) or describe state without producing actionable findings (`/wbContext`, `/wbSetup`, `/wbVision`). For those, run `/wbActOn` standalone after the fact if you want triage.

---

## 3. Plan file structure (always identical, regardless of source command)

Every `--wbPlan` invocation produces **one plan file** with this skeleton:

```markdown
# Plan — <Short Name> (recommended by <ModelName>)

> **Source action file:** <path>
> **Planner identity:** <ModelName>
> **Scope:** all 🔵 /wbPlan-class findings from the source. Inline 🟢, debug 🔴, refactor 🟡, and strategic 🣣 items are not in this plan — they execute outside the planning loop.

## Plan Index

| # | 🔵 Source Finding | Source Rank in §0 | Recommended Model | Estimated Effort |
|---|---|---|---|---|
| 1 | <finding name> | <rank N> | <model> | <hours/days> |
| ... |

## Plan §1 — <Finding 1 name>

**From source rank:** <N> · **Recommended model:** <model> · **Estimated effort:** <X>

| Task # | Task | Worker Model | Validator Model | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|
| 1 | <atomic step> | <model> | <model> | ⬜ | ⬜ |
| ... |

**Goal:** <1-sentence>
**Constraints:** <bullets>
**Out of scope:** <bullets>

## Plan §2, §3, ... (one section per 🔵 finding from the source)
```

**Key design choices:**
- **One file, N sections.** Not N files — readers see all `--wbPlan` work for one source in a single document.
- **Worker/validator per task.** Different models = independent perspectives; mirrors the existing `wb-press2_wbdataviewer2` smartprompt convention.
- **Source rank is preserved.** Each plan section cross-links back to its rank in the action file's §0 — readers can navigate from "rank 11 — escape syntax" → "Plan §1 (escape syntax)" → individual tasks.
- **Recommended model column** in the plan index is the *task complexity recommendation*, not the planner's identity (which is in the filename).

---

## 4. Output paths (v2 — Universal Daily File)

```
<target>/.agents/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_<short_name>_<YYYYMMDD>.md
```

> **No `<model>/` subfolder.** All models contribute to ONE file per day.
> **Create-or-Append:** If the file exists, append your plan as the next Entry #N, tagged `*(ModelName — HH:MM)*`.

**Where:**
- `<short_name>` = source basename minus type prefix and timestamp (e.g., `wb-core`, not `audit_wb-core_202604260500`)
- `<target>` = the original source's package/app folder; for non-`/wb*` sources outside any target, anchored at monorepo root (`.agents/workflows/reports/`)
- Model identity is in the Entry #N header, not the filename

**Outputs never go to `docs/ai_reference/`** — that folder is canon-only.

---

## 5. Mini-examples (one per command that accepts `--wbPlan`)

### `/wbAudit packages/wb-core/ --wbPlan`

```text
[AI] Phase 1-N: standard /wbAudit produces audit_wb-core_<ts>_claude_opus_4_7.md
[AI] Phase N+1 (--wbPlan): scanning audit for 🔵 findings...
[AI] Found 3 🔵 findings:
[AI] §3, §7 #7 → "pipe-| escape syntax design" → Plan §1
[AI] §7 #9 → "API reference docs (typedoc)" → Plan §2
[AI] §6, §7 #8 → "Vue 3 migration" → Plan §3 (DEFERRED — pre-req)
[AI] Output: packages/wb-core/.agents/workflows/reports/20260429/plans/plan_wb-core_20260429.md
[AI] (Entry #1 by the AI agent)
```

### `/wbReview <PR> --wbPlan`

```text
[AI] Standard /wbReview produces review_<PR>_<ts>_claude_opus_4_7.md
[AI] --wbPlan: 2 🔵 findings (a multi-file refactor request, a deps cleanup)
[AI] Output: <target>/.agents/workflows/reports/<date>/plans/plan_<PR>_<date>.md
[AI] (Entry #N by the AI agent)
[AI] 2 plan sections, each with 3-5 tasks (worker = Qwen3 Coder, validator = the agent the agent)
```

### `/wbStandup core2/ --wbPlan`

```text
[AI] Standard /wbStandup finds 1 open ticket (Task 10: publish wb-press2 to npm)
[AI] --wbPlan: 1 🔵 finding (the open ticket itself, since "publish" needs sub-tasks)
[AI] Output: core2/.agents/workflows/reports/<date>/plans/plan_core2_<date>.md
[AI] (Entry #N by the AI agent)
[AI] 1 plan section with 5 tasks: pre-flight dist/ check, package.json prep, README, .npmignore, dry-run
```

### `/wbActOn <existing_audit> --wbPlan`

```text
[AI] /wbActOn produces action_audit_<name>_<ts>_<model>.md
[AI] --wbPlan: same engine extracts 🔵 findings → plan file
[AI] Same output structure as /wbAudit --wbPlan above. The chain order (--act before --wbPlan)
[AI] is invisible to the user — both files appear at the end.
```

---

## 6. When NOT to use `--wbPlan`

- The source has zero 🔵 findings → no plan to generate; the flag is a silent no-op (or warns).
- You only want triage, not a planning artifact → use `--act` alone.
- The source is itself a plan (`/wbPlan --wbPlan`) → the flag errors with "no-op" message.
- The work is genuinely 🟢 inline → do it; don't plan it. Plan files for one-line edits are bureaucracy.

The bar for `--wbPlan` is "this finding is multi-step, multi-file, coordinated work" — same bar as the 🔵 color in the `/wbActOn` decision tree. If the source has only 🟢/🔴/🟡/🟣 findings, `--act` is the right flag and `--wbPlan` adds noise.

---

## 7. Cross-references

For per-command details, see each command's own examples files:

- [`wbAudit/wbAudit_examples`](../commands/wbAudit/wbAudit_examples.md)
- [`wbReview/wbReview_examples`](../commands/wbReview/wbReview_examples.md)
- [`wbStandup/wbStandup_examples`](../commands/wbStandup/wbStandup_examples.md)
- [`wbActOn/wbActOn_examples`](../commands/wbActOn/wbActOn_examples.md) — the engine; deepest treatment of `--wbPlan`
- [`wbPlan/wbPlan_examples`](../commands/wbPlan/wbPlan_examples.md) — explains why `/wbPlan --wbPlan` errors

For the `--act` companion flag, see [Command Classification](command_classification.md) (Sibling Actions section).

---

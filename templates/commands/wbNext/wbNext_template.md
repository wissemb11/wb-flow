# wbNext Template v1.0 — Dynamic "What Should I Do Next?"


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbNext`

## When to run it

- **You sat down and don't know what to do.** This is the entire job of `/wbNext`.
- **End of a logical unit of work** — you finished a thing; what's the next thing?
- **After a long absence** — back from vacation, no idea what state the repo is in.

Do NOT run it:

- When you already have a `/wbPlan` open. Execute the next unchecked row instead.
- When you have a clear priority. The command's job is to break ties; don't ask it to override your judgment.
- More than once per session. Re-running it produces the same answer 95% of the time.

## The two forms

```
/wbNext                   # whole-monorepo scan, single recommendation
/wbNext <package-path>    # narrowed to one package
```

## What it does, in order

1. **Reads recent `reports/`** (default: `--since=7d`). Looks for the latest `audit`, `plan`, `debug`, `standup`, `review`.
2. **Reads `git status`** and the last 3 commits. Has anything been started but not committed?
3. **Reads `dev.md`** for the target package(s). Are there refusals that flag work?
4. **Computes a single recommendation** with three things: *what* to run, *why* it's the best next move, and *what other options were considered and rejected*.

## The output shape

```text
Recommendation: /wbAudit packages/wb-core/

Why:
- Last /wbAudit on wb-core was 14 days ago.
- 8 commits since then; 3 touch the public API.
- /wbTest passed yesterday, so the gate is green for an audit.
- /wbStandup last week flagged "wb-core context drift" — audit will catch it.

Considered and rejected:
- /wbContext: stale-but-not-blocking; audit covers more ground.
- /wbDebug: no open errors in reports/.
- /wbRefactor: refactor without audit is the #1 mistake (see playbook).
```

The "considered and rejected" section is the real value. Without it, you're trusting a black box. With it, you can disagree if your judgment differs.

## When `/wbNext` will refuse to recommend

- **Working tree is dirty with uncommitted, unrelated changes.** First clean up; mixed states make every recommendation noisy.
- **No `reports/` exist for the target.** Run `/wbContext` first; `/wbNext` needs at least one prior signal.
- **Conflicting signals** (e.g., audit says ship, secure says don't). The command names the conflict and asks you to resolve it before recommending.

## When `/wbNext` is the wrong command

- You want a roadmap, not a single step → `/wbPlan` or `/wbVision`.
- You want a list of *everything* in flight → `/wbStandup`, not `/wbNext`.
- You want the AI to *do* the work instead of recommending it → describe the task directly.

## The one mistake to avoid

**Running `/wbNext` and then ignoring its recommendation because you "had a feeling."** Either run what it suggests, or take 60 seconds to articulate why your alternative is better. The articulation often reveals you were going to make the second-best choice for vibes-based reasons.

That said: `/wbNext` doesn't know about external pressure (deadlines, support tickets, what your boss said this morning). Override is fine when you have outside information; override is dangerous when you have only intuition.

> For deeper reading: [`docs_claude/commands/wbNext/wbNext_practical_claude.md`](../../docs/docs_claude/commands/wbNext/wbNext_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--scope` | `-s` |
| `--since` | `-S` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbNext <scope_folder>           # normal mode — produce a fresh output file
/wbNext <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbNext` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-s` → `--scope`
- `-S` → `--since`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **Purpose:** When the user is stuck, mid-flow, or returning to a project, `/wbNext` analyzes the current state and produces a **ranked, actionable** list of suggestions — tailored to *this* project at *this* moment, not a static template.
> **How to use**: Copy the prompt below, replace `__PLACEHOLDERS__`, paste to any AI agent.
> Read [`../_shared/output_conventions.md`](../_shared/output_conventions.md) before producing output. Includes §9 **Action Type Tagging** — every suggested next-step row MUST carry a `Requires` tag (🧠/✅/🔨/📋, plain text) and the file MUST declare `type:` + `emits:` in YAML front-matter and include a `## 🔗 Action Types` legend.

---

## Filename & Folder Convention

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/nexts/next_<target>_<YYYYMMDD>.md`

- No args → `<target_folder>` is the **monorepo root** (`core2/`).
- `<folder_scope>` arg → `<target_folder>` is that folder.
- `<existing_file>` arg (matches the next-output schema) → **self-correct mode** (see [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3): re-rank, fill missing fields, do not change structure.

**Cumulative behavior:**
- Same day → if `next_<target>_<YYYYMMDD>.md` exists, **append a new section** `## 🔁 Run @ <HH:MM>` rather than overwriting.
- New day → new file.

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Next: <scope> — <YYYY-MM-DD>`

In self-correct mode, the command:
- Re-ranks suggestions based on the current state of the project (some may now be done, blockers may have cleared).
- Fills missing `Origin`, `Verify`, `Est. Time`, `Suggested Worker` cells.
- Converts plain-text file references to relative markdown links per [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §1.
- Does **not** delete or reorder rows the user has annotated.
- Appends one trailing line: `> _Self-corrected: <YYYY-MM-DD HH:MM> by <model>_`

---

## 🚀 The Suggestion Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbNext v1.0 ━━━━━━━━━━━━━

📁 SCOPE: __TARGET_FOLDER_OR_MONOREPO_ROOT__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__
📂 OUTPUT FILE: __TARGET_FOLDER__/.wb/workflows/reports/__YYYY__/__MM__/__DD__/nexts/next___TARGET_NAME_____YYYYMMDD__.md

━━━ INPUT ━━━

If invoked with no args → analyze the monorepo root.
If invoked with a folder → analyze that folder.
If invoked with a file matching the next-output schema → SELF-CORRECT MODE
  (see ../_shared/output_conventions.md §3).

━━━ CONTEXT TO SCAN ━━━

1. Most recent files under `<scope>/.wb/workflows/reports/`:
   - `plans/plan_*.md` — what tasks are pending? Which are blocked? Which Done-but-not-Valid?
   - `audits/audit_*.md` — any P1 findings without a corresponding plan task?
   - `reviews/review_*.md` — any unresolved review comments?
   - `tasks_reports/task_*.md` — any tasks claiming Done but the report is missing or empty?
2. Read `<scope>/.wb/workflows/context.md` for project state.
3. Check `../model_recommendations.md` for worker/validator suggestions.
4. Look for stale TODOs in code (>30 days), unresolved merge conflicts, broken tests in CI.

━━━ OUTPUT FORMAT ━━━

Produce a markdown file at the OUTPUT FILE path above with this exact structure:

# Next: <scope> — <YYYY-MM-DD>

> **Target:** <relative-link-to-scope-folder>
> **Created by:** <model> via <client>
> **Time:** <YYYY-MM-DD HH:MM>

---

## 🧭 Situation Summary

<2–4 sentences: where the project stands right now, what just happened, what is blocked.>

## 🎯 Suggested Next Actions (ranked)

| # | Requires | Suggestion | Target | Why now | Origin | Verify | Est. Time | Suggested Worker | Blockers |
|---|---|-----------|--------|---------|--------|--------|-----------|------------------|----------|
| 1 | 🔨 Worker | <short imperative, e.g. "Validate task 1 of today's plan"> | <relative-link to file/folder> | <1 sentence: why this is the most valuable next move> | <full /wbX command that surfaced this, OR `—` if /wbNext-native> | <full /wbX command to confirm done> | <e.g. 15m, 2h, 0.5d> | <e.g. Opus 4.7 / Gemini 3.1 Pro / human> | <relative-link or `—`> |
| 2 | ✅ Validator | ... | ... | ... | ... | ... | ... | ... | ... |

**Column rules:**
- **Requires**: plain-text action-type tag (`🧠 Planner` / `✅ Validator` / `🔨 Worker` / `📋 Mechanical`) per `_shared/output_conventions.md` §9.3. Mandatory; the file MUST also include a `## 🔗 Action Types` legend before the Generated Files footer. Self-correct mode (§3) MUST insert this column on legacy files.
- **Target**: relative markdown link from THIS file's directory (per output_conventions.md §1). Apply §1.1 link beautification: basename label, full relative href.
- **Origin**: full invocable command (per output_conventions.md §2). Use `—` when the suggestion is /wbNext-native (no upstream command surfaced it).
- **Verify**: always fillable — the command that proves the action is done.
- **Suggested Worker**: pull from model_recommendations.md; include `human` when the action requires judgment beyond an AI agent.
- **Blockers**: relative link to the blocking file/issue, or `—` if none.

## 💡 Tips & Warnings

| Type | Note |
|---|---|
| 💡 Tip | <optional: a non-obvious observation, e.g. "Task 3 has the same fix pattern as last week's task 7 — reuse that worker."> |
| ⚠️ Warning | <optional: a risk, e.g. "Plan file has 4 Done-but-not-Valid tasks older than 24h — validation drift risk."> |

---

> _Generated by /wbNext at <YYYY-MM-DD HH:MM> via <model>._

━━━ RULES ━━━

1. Suggestions must be SPECIFIC. "Run tests" is bad. "Run /wbTest apps/wb-core/md.wbc-ui.com/ --scope=task-1 to verify ARCH-1 fix" is good.
2. Rank by VALUE × URGENCY, not by ease. The #1 suggestion should unblock the most downstream work.
3. Maximum 7 suggestions. If you need more, the project is too broad — split the scope.
4. Always include at least one Verify command per row.
5. Apply relative-link rule (output_conventions.md §1) to EVERY local file mention.
6. If self-correcting an existing file, preserve user-authored notes verbatim; only fill cells that are blank or stale.
━━━ AUTO-APPEND FOOTER ━━━

At the VERY END of the file (after "What's Next?"), you MUST append the `## 📂 Generated Files (__YYYYMMDD__)` cross-link footer. Do NOT use simple tables. You MUST use the rich "Tier 1" layout from `_shared/output_conventions.md` §5.

Format required:
```markdown
---
## 📂 Generated Files (__YYYYMMDD__)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files
| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`core2/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```
```

---

## Worked Example

See [`wbNext_examples_claude.md`](../../docs/docs_claude/commands/wbNext/wbNext_examples_claude.md) (or the gemini edition) for full input/output samples.

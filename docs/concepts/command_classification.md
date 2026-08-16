---
title: "Command Classification: The 30-Command Ecosystem"
description:" "Answers four classification questions about every /wb* command: what it acts on, output type, re-entrancy, and sibling commands.""
---

# Command Classification: The 30-Command Ecosystem

> **Audience:** Developers who already use `/wb*` commands and want the full map.
> **Authoritative source:** `frontEnd/wbc-ui/core2/packages/wb-flow/templates/commands/wb_commands_reference.json` — single source of truth.
> **Related:** [Overview](overview_agentic_workflows.md) · [Daily Playbook](../daily_use/the_daily_playbook.md) · [Flags & Shortcuts](flags_and_shortcuts.md) · [Command Composition](command_composition.md)

This page answers four questions:

1. **What does each command act on?** (file, folder, monorepo, plan task, session…)
2. **Does it produce a persistent output file?** (and what type)
3. **Can it act on its own previous output?** (re-entrant / self-feeding)
4. **Which commands are siblings?** (so you sequence or substitute correctly)

All 30 commands covered. No padding.

<ClassificationAnimation />

---

## How to read the columns

| Column | Meaning |
|---|---|
| **Acts on** | The input type: a **file**, a **folder/package**, the **monorepo parent**, a **plan task ID**, a **session**, etc. |
| **Output file** | The persistent artifact under `.agents/workflows/reports/<YYYY>/<MM>/<DD>/…/`. "Console" = terminal only, no file. |
| **Self-acting?** | Whether the command reads or feeds on its own previous output. See the four patterns at the bottom. |
| **Sibling commands** | Commands you might confuse with this one or chain after it. |

---

## Group 1 — Strategy, Planning & Coordination

The "thinking" commands. They decompose problems and set priorities. They almost never modify code.

| # | Command | Acts on | Output file | Self-acting? | Sibling commands |
|---|---|---|---|---|---|
| 01 | `/wbStandup` | Folder or monorepo parent | `standup_<scope>_<date>.md` | ✅ Reads all `reports/` to build the agenda | `/wbNext`, `/wbActOn` |
| 02 | `/wbPlan` | Folder + goal/audit findings | `plan_<scope>_<date>.md` (task table) | ✅ Recursive sub-plans (#3 → #3.1, #3.2…); `--resume` re-enters its own file | `/wbAudit`, `/wbVision` |
| 03 | `/wbNext` | Folder (codebase + reports state) | `next_<scope>_<date>.md` (ranked recommendation) | ✅ Reads previous `reports/` to rank | `/wbStandup`, `/wbActOn` |
| 04 | `/wbVision` | Folder/package | `vision_<scope>_<date>.md` (3 strategic features) | ❌ Creative, fresh each time | `/wbPlan`, `/wbAudit` |
| 05 | `/wbExplain` | File, folder, **or** plan task ID (`--id=N`) | `explain_<scope/task>_<date>.md` (4 layers) | ✅ Explains tasks **inside** a `plan_*.md` | `/wbDoc`, `/wbCheck` |

> **Rule of thumb:** don't know what to do → `/wbStandup` (project) or `/wbNext` (one folder). Know the *what* but not *how* → `/wbPlan`.

---

## Group 2 — Diagnosis, Audit & QA

The "critics." They produce evidence, not code. Gatekeepers between *"I think it works"* and *"it ships."*

| # | Command | Acts on | Output file | Self-acting? | Sibling commands |
|---|---|---|---|---|---|
| 06 | `/wbAudit` | File **or** folder | `audit_<scope>_<date>.md` (9-section, Smart-Merge) | ✅ Temporal memory — reads prior audits for delta comparison (Entry #N append) | `/wbReview`, `/wbSecure`, `/wbCheck` |
| 07 | `/wbSecure` | Folder/package | `security_<scope>_<date>.md` | ❌ One-shot adversarial scan | `/wbAudit` |
| 08 | `/wbDebug` | Error string, stack trace, or file | `debug_<scope>_<date>.md` (root-cause analysis) | ❌ Per-incident | `/wbTest`, `/wbAudit` |
| 09 | `/wbReview` | Folder **+ `plan_*.md`** (required) | `review_<scope>_<date>.md` (plan vs reality) | ✅ Requires `plan_*.md` as input — strictly second-pass | `/wbAudit`, `/wbValid` |
| 10 | `/wbValid` | Plan task ID (`--id=N`) | Appends QA section to `tasks/task_N/task_N_report_*.md` | ✅ Reads `plan_*.md`, validates worker reports | `/wbReview`, `/wbWork` |
| 11 | `/wbTest` | Folder (test config) or file | `test_<scope>_<date>.md` + runner output | ❌ Per-run test log | `/wbDebug`, `/wbAudit` |
| 12 | `/wbCheck` | Worker model's understanding (pre-flight) | Console only (Q&A transcript) | ❌ Pre-flight gate | `/wbExplain` |

> `/wbAudit` ≠ `/wbReview`. Audit is unconstrained: *"is this code good?"*. Review is constrained by a plan: *"did the worker do what they said?"*. No plan file → you want `/wbAudit`.

---

## Group 3 — Execution & Refactoring

The "workers." The only commands that should make you nervous — they edit code.

| # | Command | Acts on | Output file | Self-acting? | Sibling commands |
|---|---|---|---|---|---|
| 13 | `/wbWork` | Plan task ID (`--id=N`) | `tasks/task_N/task_N_report_<scope>_<date>.md` + ticks `☐ Done` | ✅ Lives **inside** `plan_*.md` (worker side of worker/validator loop) | `/wbValid`, `/wbRefactor` |
| 14 | `/wbRefactor` | Single file (>200 LOC ideal) | `refactor_<scope>_<date>.md` + edited file(s) | ❌ One-shot surgery | `/wbClean`, `/wbToWBC` |
| 15 | `/wbClean` | Folder/package | `clean_<scope>_<date>.md` (dead-code list) + optional deletions | ❌ Sweep | `/wbRefactor`, `/wbAudit` |
| 16 | `/wbTranslate` | UI component (`.vue`/`.tsx`) | `i18n/{en,fr,ar}.json` + `translate_<scope>_<date>.md` | ❌ i18n bootstrap | `/wbDoc` |
| 17 | `/wbToWBC` | Legacy file (HTML/Vuetify) | `migration_report.md` + new `.wbc.json` component | ❌ One-shot conversion | `/wbRefactor` |

> **Worker/Validator pair:** `/wbWork` and `/wbValid` are the only two commands that read and write inside an existing `plan_*.md`. Everything else creates a new artifact.

---

## Group 4 — Infrastructure, Identity & Documentation

Bootstrapping and explaining. Run once per package, or when identity drifts.

| # | Command | Acts on | Output file | Self-acting? | Sibling commands |
|---|---|---|---|---|---|
| 18 | `/wbSetup` | New package folder | `.agents/workflows/context.md` + `dev.md` | ❌ One-time bootstrap | `/wbContext` |
| 19 | `/wbContext` | File or folder | `context_<scope>_<date>.md` (state sync) | ✅ Updates existing context when re-run | `/wbSetup` |
| 20 | `/wbDoc` | Folder/package | `README.md` + `doc_<scope>_<date>.md` | ❌ Scribe pass | `/wbExplain`, `/wbTranslate` |
| 21 | `/wbHelp` | Command name (or none) | Console output only | ❌ Static reference (`/wbHelp wbX` ≡ `/wbX -h`) | `/wbExplain` |

> `/wbSetup` *creates* the agentic identity (one-time). `/wbContext` *refreshes* it (recurring).

---

## Group 5 — Release Lifecycle

Commands that shepherd code from "merged" to "live." Small ordered chain: `/wbRelease` → `/wbPublish` → `/wbDeploy` → `/wbBroadcast`.

| # | Command | Acts on | Output file | Self-acting? | Sibling commands |
|---|---|---|---|---|---|
| 22 | `/wbRelease` | Monorepo parent (multi-package) | `release_<scope>_<date>.md` (changelog + version plan) | ❌ Coordinator | `/wbPublish`, `/wbBroadcast` |
| 23 | `/wbPublish` | Package folder | `publish_<scope>_<date>.md` (NPM log) | ✅ Requires a recent `release_*.md` as input | `/wbRelease`, `/wbDeploy` |
| 24 | `/wbDeploy` | App folder | `deploy_<scope>_<date>.md` (URL/log) | ❌ Push to live (Vercel/AWS/VPS) | `/wbPublish` |
| 25 | `/wbBroadcast` | Package or app | `broadcast_<scope>_<date>.md` (announcement kit) | ✅ Reads `release_*.md` + `audit_*.md` to draft | `/wbRelease`, `/wbDoc` |
| 26 | `/wbGit` | Working tree (CWD) | Console only — commit message text *(user runs git, not the agent)* | ❌ Message generator | `/wbRelease` |
| 27 | `/wbMonetize` | Package folder | `monetize_<scope>_<date>.md` + edits `package.json` | ❌ Tier scaffolding | `/wbLicense` |
| 28 | `/wbLicense` | Component name | `license_<scope>_<date>.md` + injected gate code | ✅ Requires `/wbMonetize` marker | `/wbMonetize` |

> `/wbGit` deliberately does not run git commands. Per project rule, it produces commit-message text only.

---

## Group 6 — Meta-Commands & Session Triage

Commands about the agentic process itself, not about code.

| # | Command | Acts on | Output file | Self-acting? | Sibling commands |
|---|---|---|---|---|---|
| 29 | `/wbActOn` | **Any diagnostic file** (`audit_*.md`, `plan_*.md`, `review_*.md`, `next_*.md`…) | `action_<source>_<date>.md` and/or `plan_<source>_<date>.md` | ✅ Universal triage engine — consumes nearly every other command's output | `/wbStandup`, `/wbNext` |
| 30 | `/wbTrack` | Active session | `walkthroughs/track_<scope>_<date>.md` | ✅ Appends `§N` for every subsequent `/wb*` command in the session | `/wbStopTrack` |
| 30b | `/wbStopTrack` | Active tracking session | Final `§END` + extracts (`tips/`, `warnings/`, `commentaries/`, `all_commands/`, `resume/`) | ✅ Companion finalizer for `/wbTrack` | `/wbTrack` |

> `/wbActOn` is the most powerful self-feeding command. Any report → ranked TODO or fresh sub-plan via `--act`/`--wbPlan` flags, or `/wbActOn <report.md>` directly.

---

## The four "self-acting" architectural patterns

A command is **self-acting** when it reads or appends to artifacts produced by itself or another command. There are exactly four patterns:

| # | Pattern | Commands involved | What happens |
|---|---|---|---|
| 1 | **Triage chain** | `/wbActOn` ← any of `/wbAudit`, `/wbPlan`, `/wbReview`, `/wbStandup`, `/wbNext` | Diagnostic file in → ranked execution order out. Universal consumer. |
| 2 | **Recursive planning** | `/wbPlan` | A task in a plan can itself be `/wbPlan`-ned, producing nested sub-tasks (#3 → #3.1, #3.2). Plan grows from inside. |
| 3 | **Temporal memory** | `/wbAudit`, `/wbStandup`, `/wbContext`, `/wbNext` | Before writing, the command scans `reports/` for prior versions and uses Smart Merge (Entry #N append) to compare. |
| 4 | **Worker/Validator loop** | `/wbWork` ↔ `/wbValid` (both inside `plan_*.md`) | Only commands that *live inside* an existing planning artifact: `/wbWork` ticks `☐ Done`; `/wbValid` ticks `☐ Valid`. |

A command outside these four patterns is **single-shot**: fresh inputs, fresh output, no awareness of history. (Examples: `/wbDebug`, `/wbRefactor`, `/wbSecure`, `/wbTest`.)

---

## Quick reference — what to run when

| If you want to… | Run | Acts on |
|---|---|---|
| …understand a project for the first time | `/wbContext` then `/wbAudit` | Folder |
| …turn audit findings into a TODO | `/wbActOn audit_*.md` (or `/wbAudit --act`) | Existing audit file |
| …decompose a feature request into tasks | `/wbPlan` | Folder + goal |
| …execute a single task from a plan | `/wbWork --id=N` | Plan task ID |
| …validate a single completed task | `/wbValid --id=N` | Plan task ID |
| …independently verify a whole completed plan | `/wbReview --plan=…` | Folder + plan file |
| …unstick a debugging session | `/wbDebug` | Stack trace |
| …prepare to ship | `/wbAudit`, `/wbTest`, `/wbSecure`, then `/wbRelease`+`/wbPublish` | Folder, then monorepo |
| …know what to do next | `/wbNext` (one folder) or `/wbStandup` (whole monorepo) | Folder / monorepo |
| …record what happened in a session | `/wbTrack` … `/wbStopTrack` | Active session |

---

* — companion to the [Overview](overview_agentic_workflows.md) and the [Daily Playbook](../daily_use/the_daily_playbook.md).*

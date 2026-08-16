---
title: wb-flow Documentation
description: Official documentation for the 33-command /wb* agentic workflow system — a field manual for developers.
---

# wb-flow Documentation

> The official documentation for the 33-command `/wb*` agentic workflow system.
>
> This is a field manual — opinionated, direct, and written for developers who actually use these commands rather than just read about them.

<WorkflowDiagram src="/diagrams/daily_workflow_loop.png" alt="The Daily Workflow Loop — Orient → Plan → Execute → Validate → Commit → Close" />

---

## Who is this for?

**Stack-agnostic.** wb-flow runs on any project where you have source files and markdown — Vue, React, Svelte, Solid, Next.js, Nuxt, Astro, Django, FastAPI, Rails, Go, Rust, anything. The 33 commands operate on `package.json`, source trees, and report folders; none of them care which framework wrote the code they're reading.

**The one exception:** `/wbToWBC` converts code to use the wbc-ui2 component primitives, which are Vue-based. If you're not on Vue, ignore that one command. The other 32 are universal.

**Why examples skew Vue.** This documentation was authored within a Vue monorepo (`wb-core`, `wb-press`, `wbdataviewer2.wbc-ui.com`), so every worked example draws from there. The patterns transfer one-for-one — `/wbAudit` reads source code the same way whether the source is `.vue`, `.tsx`, or `.py`.

**What you need on day one:**

- A folder with code in it (any language)
- A way to run the commands (any AI agent environment that accepts prompts)
- Nothing else — no Node version requirement, no framework lock-in

---

## How outputs are tagged (v1.8+)

Every output file from a *suggestion-emitting* command (`/wbPlan`, `/wbAudit`, `/wbReview`, `/wbVision`, `/wbIdea`, `/wbStandup`, `/wbNext`, `/wbActOn`) carries three metadata layers:

**1. YAML front-matter:**

```yaml
---
type: 🔨 Worker     # the dominant action type
emits: mixed         # `pure` or `mixed`
---
```

**2. A `Requires` column in every recommendation table:**

| # | Requires | Suggestion | … |
|---|---|---|---|
| 1 | 🔨 Worker | Refactor `bin/install.js` | … |
| 2 | ✅ Validator | Audit the new auth middleware | … |
| 3 | 📋 Mechanical | Run `npm pack --dry-run` | … |

**3. The four canonical action types:**

- 🧠 **Planner** — Deep reasoning, strategy, multi-step decomposition
- ✅ **Validator** — Big-thinker code-quality judgment, scoring
- 🔨 **Worker** — Coder/executor: surgical code edits, refactors
- 📋 **Mechanical** — Run command, parse output, format report. No judgment

See [`concepts/model_recommendations`](concepts/model_recommendations.md) for which model to use per role.

---

## How to read this documentation

| Folder | When to read it |
|---|---|
| [`start_here/`](start_here/README.md) | First time using the system, or returning after weeks away |
| [`concepts/`](concepts/README.md) | When you want to understand *why* the system works the way it does |
| [`daily_use/`](daily_use/README.md) | When you've forgotten which command to run at 10am vs. 4pm |
| [`commands/`](commands/README.md) | Per-command deep-dives — seven reading files per command |
| [`session_lifecycle/`](session_lifecycle/README.md) | When and how to start and stop AI sessions cleanly |

The seven files per command:

| File | Length | Read when |
|---|---|---|
| **hub** (`wbX.md`) | 1 page | Quick overview: purpose, invocation, what happens |
| **eli5** | 1–2 paragraphs | One-line mental model |
| **practical** | 1 page | About to run the command, need trade-offs |
| **expert** | 2–3 pages | Considering modifying the template |
| **examples** | 3–5 pages | Forgot what the output looks like |
| **exhaustive** | 4–6 pages | Need the definitive edge-case simulation |
| **live_demo** | 2–4 pages | Want the command grounded in an actual workspace |

---

## Reading order for a new user

1. [`start_here/installation`](start_here/installation.md) — NPM, NPX, or Git installation
2. [`start_here/getting_started`](start_here/getting_started.md) — 30-day onboarding plan
3. [`start_here/first_run_walkthrough`](start_here/first_run_walkthrough.md) — Annotated first session
4. [`start_here/bootstrapping_existing_project`](start_here/bootstrapping_existing_project.md) — Inheriting code without `/wbSetup`
5. [`concepts/overview_agentic_workflows`](concepts/overview_agentic_workflows.md) — Commands grouped by the question they answer
6. [`daily_use/the_daily_playbook`](daily_use/the_daily_playbook.md) — Morning → midday → afternoon → evening shape
7. [`commands/<cmd>/<cmd>_practical`](commands/README.md) — Pick the command you're about to use; read its `practical` file

If you only ever read one of these, read the daily playbook.

---

## Concept deep-dives

Cross-cutting ideas that don't belong in any single command's docs:

- [`concepts/agentic_vs_manual`](concepts/agentic_vs_manual.md) — When structured commands beat freeform prompting (and when they don't)
- [`concepts/command_classification`](concepts/command_classification.md) — All 33 commands grouped into functional families
- [`concepts/command_composition`](concepts/command_composition.md) — Self-application, chaining notation, chain recipes
- [`concepts/wbPlan_flag`](concepts/wbPlan_flag.md) — How `--act` and `--wbPlan` compose across commands
- [`concepts/plan_state_management`](concepts/plan_state_management.md) — The five task states (`⬜` `✅` `⏸️` `🚫` `🔄`) and override flags
- [`concepts/ideas_pipeline`](concepts/ideas_pipeline.md) — The 8-step Ideas Pipeline from birth to execution
- [`concepts/model_recommendations`](concepts/model_recommendations.md) — Which model to use per command role
- [`concepts/flags_and_shortcuts`](concepts/flags_and_shortcuts.md) — System-wide flag→shortcut grammar
- [`concepts/universal_flags_exhaustive_simulation`](concepts/universal_flags_exhaustive_simulation.md) — Brain Control super-flags simulation
- [`concepts/wbWorkflow/`](concepts/wbWorkflow/README.md) — Workflow architecture, lifecycle, and task sequencing
- [`session_lifecycle/`](session_lifecycle/README.md) — Golden Save Point, session boundaries, publishing arcs

---

## The 33-command catalog

Grouped by the question you're asking when you reach for them.

### "What is this codebase?" — Context Builders

| # | Command | Purpose | Hub |
|---|---|---|---|
| 01 | `/wbSetup` | Write `context.md` + `dev.md` for a new package | [hub](commands/wbSetup/wbSetup.md) |
| 02 | `/wbContext` | Refresh package context against current code | [hub](commands/wbContext/wbContext.md) |
| 03 | `/wbStandup` | Monorepo-wide scan: what's in-flight, what's stale | [hub](commands/wbStandup/wbStandup.md) |

### "What should I do next?" — Planners

| # | Command | Purpose | Hub |
|---|---|---|---|
| 04 | `/wbPlan` | Break a goal into a worker/validator task table | [hub](commands/wbPlan/wbPlan.md) |
| 05 | `/wbVision` | Brainstorm features when the queue is empty | [hub](commands/wbVision/wbVision.md) |
| 06 | `/wbIdea` | Capture and score speculative ideas | [hub](commands/wbIdea/wbIdea.md) |
| 07 | `/wbNext` | Pick the next optimal command based on repo state | [hub](commands/wbNext/wbNext.md) |
| 08 | `/wbHelp` | Print the command catalog or per-command help | [hub](commands/wbHelp/wbHelp.md) |
| 09 | `/wbActOn` | Triage a diagnostic doc into ranked actions | [hub](commands/wbActOn/wbActOn.md) |
| 10 | `/wbExplain` | Generate a persistent explanation of code or a task | [hub](commands/wbExplain/wbExplain.md) |

### "Execute and validate" — Workers & Validators

| # | Command | Purpose | Hub |
|---|---|---|---|
| 11 | `/wbWork` | Execute tasks defined in a plan file | [hub](commands/wbWork/wbWork.md) |
| 12 | `/wbValid` | Audit `/wbWork` output against the plan — PASS/FAIL | [hub](commands/wbValid/wbValid.md) |

### "Is this any good?" — Critics

| # | Command | Purpose | Hub |
|---|---|---|---|
| 13 | `/wbAudit` | Brutal review against production standards | [hub](commands/wbAudit/wbAudit.md) |
| 14 | `/wbReview` | PR-style review of a change vs. its plan | [hub](commands/wbReview/wbReview.md) |
| 15 | `/wbTest` | Run tests, classify failures | [hub](commands/wbTest/wbTest.md) |
| 16 | `/wbCheck` | Pre-flight quiz to verify AI understanding | [hub](commands/wbCheck/wbCheck.md) |

### "Clean this up" — Surgeons

| # | Command | Purpose | Hub |
|---|---|---|---|
| 17 | `/wbClean` | Find dead code, stale files, forgotten `console.log` | [hub](commands/wbClean/wbClean.md) |
| 18 | `/wbRefactor` | Restructure code without changing behavior | [hub](commands/wbRefactor/wbRefactor.md) |
| 19 | `/wbDebug` | Hypothesize then investigate a specific error | [hub](commands/wbDebug/wbDebug.md) |
| 20 | `/wbDoc` | Generate JSDoc + READMEs from code | [hub](commands/wbDoc/wbDoc.md) |

### "Ship it" — Shippers

| # | Command | Purpose | Hub |
|---|---|---|---|
| 21 | `/wbRelease` | Bump versions, unpick `workspace:*` | [hub](commands/wbRelease/wbRelease.md) |
| 22 | `/wbPublish` | Build + push a package to npm | [hub](commands/wbPublish/wbPublish.md) |
| 23 | `/wbDeploy` | Build + push an app to a web host | [hub](commands/wbDeploy/wbDeploy.md) |
| 24 | `/wbLicense` | Inject premium gating and license checks | [hub](commands/wbLicense/wbLicense.md) |
| 25 | `/wbBroadcast` | Generate release announcement kit | [hub](commands/wbBroadcast/wbBroadcast.md) |
| 26 | `/wbMonetize` | Bootstrap Free/Pro/Dev tier plumbing | [hub](commands/wbMonetize/wbMonetize.md) |

### "Version control" — Archivist

| # | Command | Purpose | Hub |
|---|---|---|---|
| 27 | `/wbGit` | Analyze diff, draft Conventional Commit | [hub](commands/wbGit/wbGit.md) |
| 28 | `/wbModel` | Set or show the active model roster (Planner / Validator / Worker / Mechanical) | [hub](commands/wbModel/wbModel.md) |

### "Protect & cross-cut" — Security, Translation, Migration

| # | Command | Purpose | Hub |
|---|---|---|---|
| 29 | `/wbSecure` | Red-team scan: secrets, XSS, insecure deps | [hub](commands/wbSecure/wbSecure.md) |
| 30 | `/wbTranslate` | Pull hardcoded strings to i18n keys | [hub](commands/wbTranslate/wbTranslate.md) |
| 31 | `/wbToWBC` | Rewrite legacy/Vuetify into wbc-ui2 components | [hub](commands/wbToWBC/wbToWBC.md) |

### "Session telemetry" — Tracking

| # | Command | Purpose | Hub |
|---|---|---|---|
| 32 | `/wbTrack` | Toggle session-wide logging of `/wb*` invocations | [hub](commands/wbTrack/wbTrack.md) |
| 33 | `/wbStopTrack` | Finalize session, archive tracker, prepare for closure | [hub](commands/wbStopTrack/wbStopTrack.md) |

---

## What this documentation is NOT

- **Not the runtime templates.** The source-of-truth `_template.md` files that define what each command actually does live in `packages/wb-flow/templates/commands/`. This documentation covers *how to use* them.
- **Not API documentation.** Every file is hand-authored for human readers.
- **Not exhaustive on flags.** If a command has 12 flags but only 3 matter daily, the docs cover the 3. The full flag list is in the runtime template.

---

*wb-flow documentation — [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [wi-bg.com](https://www.wi-bg.com)*

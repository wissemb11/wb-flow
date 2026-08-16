---
title: First-Run Walkthrough — From core2/ to a Package
description: Concrete worked example showing which wb-flow commands to run and in what order on first use.
---

# First-Run Walkthrough — From core2/ to a Package

> Self-help. You've read [getting_started](getting_started.md) and [bootstrapping_existing_project](bootstrapping_existing_project.md). Now you want a **concrete worked example**: which commands, in what order, the first time you sit down with this monorepo.
>
> Worked example throughout: **`wb-core`**. The same pattern applies to any other package — see Section 3 for the `wb-press` edge case.

---

## TL;DR

**Two commands at the monorepo root, then drop into a package and run four more.**

```
core2/ packages/wb-core/
├── /wbStandup core2/ → ├── /wbContext packages/wb-core/
└── /wbContext core2/ → ├── /wbAudit packages/wb-core/
 ├── (do actual work)
 └── /wbGit
```

If you stop at the dotted line on the left, you've oriented but not produced anything. If you stop at the dotted line on the right, you've shipped your first day.

---

## Section 1 — At the monorepo root (`core2/`)

The root is for **orientation and shipping only**. You will run exactly two commands here on a first run, then leave.

### Step 1.1 — `/wbStandup core2/`

```
/wbStandup core2/
```

**What it does:** breadth scan. Walks every package's `reports/**/plans/*.md` and `reports/**/audits/*.md`, pulls open checkboxes (⬜) and FAIL audits, writes an aggregated agenda to `core2/.agents/workflows/reports/<YYYY>/<MM>/<DD>/standups/standup_core2_<YYYYMMDD>.md` (universal daily file — no model subfolder).

**Why it's first:** you cannot pick which package to work on if you don't know what's in flight across all of them. Standup is breadth; everything that follows is depth.

**What you should see:** a short report with at most a handful of open tickets, grouped by package, ending with a recommendation like *"run `/wbPlan packages/X/...`"*.

**What to do with the output:** read it. Pick one package to focus on today. That's the only decision this command supports.

### Step 1.2 — `/wbContext core2/`

```
/wbContext core2/
```

**What it does:** scans the **monorepo topology** — workspace declarations in root `package.json`, the 3-tier (dev/free/pro) build system, the `tools/pkg_cli/` orchestrators, cross-cutting rules in `.agents/workflows/monorepo_rules.md`. Writes to `core2/.agents/workflows/reports/<YYYY>/<MM>/<DD>/contexts/context_core2_<YYYYMMDD>.md` (universal daily file).

**Why it's second, not first:** standup tells you *what's open*. Context tells you *what the system is*. You need both, but you read standup first because it surfaces the urgent thing.

**What you should see:** a report describing the workspace (12 libraries, ~7 apps), the 3-tier license gate, the known `dist/` vs `dist-dev/` mismatch, the workspace linking rules.

**What to do with the output:** read it once, confirm nothing is wrong. If something is wrong, fix the *source* (`monorepo_rules.md`, root `context.md`) — not the report. The report is a snapshot, not a baseline.

### Why no other command at root — the table

| Command | Run at root? | Why not |
|---|---|---|
| `/wbAudit core2/` | ❌ | Audits debt *inside code*. Code lives in packages. At root it surfaces tooling noise. |
| `/wbPlan core2/` | ❌ | Plans are tactical. A monorepo-wide plan is either refused or a 200-row useless list. |
| `/wbClean core2/` | ❌ | Dead code lives in packages. |
| `/wbRefactor core2/` | ❌ | Restructuring the workspace itself. Not a routine move. |
| `/wbDebug` | ❌ | Needs an error message, not a folder. |
| `/wbVision core2/` | ⚠️ | Only when low-energy and seeking ideation. Not orientation. |
| `/wbTest core2/` | ⚠️ | Pre-ship gate (`npm run test:all`). Not orientation. |
| `/wbSecure core2/` | ⚠️ | Pre-ship gate. |
| `/wbRelease core2/` | ⚠️ | Monorepo-wide *by design*, but only at evening when actually shipping. |
| `/wbSetup core2/` | ❌ | Per-package scaffold. Never on the root. |

The pattern: **root commands are for orientation (Standup, Context) and shipping (Release). Everything else belongs inside a package.**

### ━━━ STOP HERE ━━━

You've done the morning orientation. Now pick a package and drop in. For this walkthrough, that package is `wb-core`.

---

## Section 2 — Inside the package (worked example: `wb-core`)

`wb-core` is the **anchor** of the monorepo — most other libraries depend on it. That makes it the right first package for a beginner: clean, foundational, no in-flight migration.

You'll run four commands. Two of them sync state, one produces a debt list, one commits your work. Between them, you do the actual work.

### Step 2.1 — `/wbContext packages/wb-core/`

```
/wbContext packages/wb-core/
```

**What it does:** re-reads `wb-core/package.json`, scans `src/`, compares against the stored `packages/wb-core/.agents/workflows/context.md`. Surfaces drift. Writes a fresh context report to `packages/wb-core/.agents/workflows/reports/<YYYY>/<MM>/<DD>/contexts/context_wb-core_<YYYYMMDD>.md` (universal daily file).

**Why this and not `/wbAudit` first:** context syncs the AI's mental model of the package. Auditing without fresh context = audit against last-week's understanding = noise.

**What you should see:** a report listing what `wb-core` is (foundational utilities, store, licensing gate), what it depends on, what conventions it enforces. If `context.md` has drifted from the code, `/wbContext` will surface that and ask you to confirm updates. **Answer the questions.**

**Open architectural decisions** in `context.md` (e.g., `extractSubObject` array-handling: leaves vs. structural) **stay open**. `/wbContext` will not silently resolve them. That's correct behavior.

### Step 2.2 — `/wbAudit packages/wb-core/`

```
/wbAudit packages/wb-core/
```

**What it does:** brutal review. Produces a debt list — old items carried over from before, new drift since the last audit, code-smell findings, missing tests, undocumented public API.

**Why this comes second, not later:** you want the debt visible *before* you start work, not as a surprise during shipping. The audit's job is to make debt visible — not to demand you fix it all at once.

**What you should see:** a list of findings, severity-ranked. Most will be advisory; a few will be CRITICAL.

**What to do with the output:**
- **CRITICAL** findings → don't ship until fixed.
- **Advisory** findings → fix as you naturally edit the package, not in a sweep.
- If the first pass feels too gentle, push back: *"harsher. Assume I'm shipping this to a paying customer."*

### Step 2.3 — Do actual work

This is the largest step by time and the smallest by command count. You have four sub-tools, used as needed:

```
Is the work small enough to describe in one sentence?
├── Yes → Just describe it. Skip /wbPlan.
└── No → /wbPlan packages/wb-core/

Is the console red?
├── Yes → /wbDebug "<exact error message>"
└── No → Continue

Did the audit flag messiness in a specific file?
├── Yes → /wbClean packages/wb-core/ then /wbRefactor <that file>
└── No → Skip both
```

**The single biggest mistake here:** running `/wbRefactor` *before* `/wbAudit`. The refactor changes structure → audit reviews refactored version → audit is happy because refactored code looks clean → you miss the original logic bug. **Always audit the original. Then refactor if the audit asked for it.**

### Step 2.4 — `/wbGit` to commit logical units

```
/wbGit
```

**What it does:** reads `git diff`, drafts a Conventional Commit message. With your approval, runs `git add` + `git commit`. **It is the only command that touches git.** No other command will modify the working tree.

**When to run it:** after each *logical unit* of work — one task from a plan, one bug fixed, one example added. Not at end-of-day with a 40-file diff.

**Good rhythm:** 3–6 commits per working day. Zero commits = drift. Twenty commits = too granular.

> **Memory note:** this project's user has a hard rule against AI-run git commands. `/wbGit` here means **the agent produces the commit-message text; you run `git commit` yourself.** Don't expect or allow the agent to invoke git on its behalf.

### ━━━ STOP HERE ━━━

That's a complete first day on `wb-core`. You oriented (Section 1), synced depth (2.1), surfaced debt (2.2), did real work (2.3), committed (2.4). Six commands total: `/wbStandup`, `/wbContext`×2, `/wbAudit`, optionally `/wbPlan` / `/wbDebug` / `/wbClean` / `/wbRefactor`, and `/wbGit`.

---

## Section 3 — Same pattern, different package (note on `wb-press`)

The pattern in Section 2 applies to **any** package. But `wb-press` is a teaching edge case worth flagging.

### What's different about `wb-press`

`wb-press` is **mid-migration to `wb-press2`**. Today's standup confirms: there is exactly one open ticket in the whole monorepo, and it's *Task 10 — publish `wb-press2` to npm*. The plan lives at:

```
packages/wb-dataviewer/.agents/workflows/reports/legacy_migration_20260426/plan_wb-press2_wbdataviewer2/
```

(Yes — the `wb-press2` migration plan lives under `wb-dataviewer/`, not under `wb-press/`. That's intentional: `wb-press2` is being rebuilt as a `WBDataViewer` consumer.)

### What changes in the four-step flow

If you swapped `wb-core` for `wb-press` in Section 2:

| Step | What's different |
|---|---|
| **2.1 `/wbContext`** | Will surface the migration as known context, not as drift. Don't try to "fix" it. |
| **2.2 `/wbAudit`** | Will likely flag legacy-style code (HTML tables, Vuetify components) as findings. Those are **tracked work**, not new debt — they're being addressed by the `wb-press2` rewrite. |
| **2.3 Work** | If you're closing Task 10, the right command is `/wbPlan` against the existing plan folder above, not new planning. |
| **2.4 Commit** | Same. |

### The rule

When a package is mid-migration, **the audit's findings about the legacy version are not actionable in-place**. The migration plan supersedes them. Cross-check audit findings against any active plan before treating them as work.

This is also why "should I focus on one package or both?" answers itself: **start with `wb-core` (clean case) to learn the pattern.** `wb-press` is a graduate-level example, not a beginner one.

---

## Section 4 — What you DON'T do on day one

| Command | Why not on day one |
|---|---|
| `/wbRelease` | Evening / shipping command. You haven't built anything to release yet. |
| `/wbPublish` | Same, and refused without a prior `/wbRelease` in the same cycle. |
| `/wbDeploy` | App-level shipping command. Refused if `/wbTest` failed. |
| `/wbBroadcast` | Post-release announcement. Refused without a successful release. |
| `/wbVision` | Long-horizon ideation. Use deliberately on low-energy afternoons, not on day one. |
| `/wbSetup` | Only on packages with **no** `context.md` yet. Never to "refresh" an existing one — it overwrites hand-authored rules in `dev.md`. |
| `/wbToWBC` | Cross-cutting legacy migration. Save for after you understand the system. |
| `/wbTranslate` | i18n extraction. Save for when you're adding a user-facing component. |
| `/wbLicense` | Licensing audit. Brown-belt territory. |
| `/wbReview` | PR review. Needs a PR first. |
| `/wbMonetize` | Strategy command. Black-belt territory. |
| `/wbStandup` *for any path other than `core2/`* | Standup is breadth across the monorepo. Running it on a single package degenerates into "list the open items in this folder," which `/wbContext` already covers. |

**The rule:** if you don't yet know *why* you'd run a command, don't run it. The 6-command loop in Sections 1–2 covers ~80% of daily work. The other 15 commands optimize the remaining 20%.

---

## Summary table

| Step | Command | Where | Why |
|---|---|---|---|
| 1.1 | `/wbStandup core2/` | Root | Breadth — what's open monorepo-wide |
| 1.2 | `/wbContext core2/` | Root | Topology — workspace + cross-cutting rules |
| — | *(pick a package)* | — | Decision point |
| 2.1 | `/wbContext packages/<pkg>/` | Package | Depth — sync AI's model of this package |
| 2.2 | `/wbAudit packages/<pkg>/` | Package | Debt — make accumulated debt visible |
| 2.3 | *(do work, with `/wbPlan` / `/wbDebug` / `/wbClean` / `/wbRefactor` as needed)* | Package | The actual work |
| 2.4 | `/wbGit` *(text only, you run git)* | Package | Commit logical units |

That's it. Six steps, one walkthrough.

---

## The honest framing

The first day is the slowest. You'll spend more time reading the reports than doing work. That's expected — you're loading state into your head and into the AI's. Day two is faster because the baselines are now fresh. By day five, you'll skip Section 1 most days (standup is morning-only, context only when switching packages) and live in Section 2.

Resist the urge to do the "complete" first day — running every command on every package "to be thorough." That's how you spend a week orienting and never ship. Pick `wb-core`, run six commands, commit something, close the laptop. The system converges through use, not through preparation.

---

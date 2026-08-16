---
title: Daily Use
description: Planning index of daily workflow scenarios — the most-opened folder in the documentation.
---

# Daily Use

> Field-manual answer sheet. When you've forgotten which command to run, this folder tells you. Plan-driven: scenarios in, sequences out.

This folder is the most-opened in the documentation. Bookmark it.

The single source file you'll re-read most is [`the_daily_playbook`](the_daily_playbook.md). This README is its planning index — a pre-curated scenario lookup so you don't have to scan the playbook to find the right entry point.

---

## The day, as a shape

<DayShapeAnimation />

`/wbGit` runs twice a day: midday to commit logical units, evening after release to tag. It is the only command that touches git for you.

Three guarantees about this shape:
1. **You will not use every command every day.** Most days you use 3–5. The shape is a menu, not a checklist.
2. **The order matters.** Running `/wbDeploy` in the morning before `/wbStandup` defeats the point — you'd be shipping without knowing what's in flight.
3. **Each phase ends in a hand-off artifact** (context file → plan → audit → release). The artifacts stitch the phases together across days.

Full deep-dive: [`the_daily_playbook`](the_daily_playbook.md).

---

## Scenario index — pick the row that matches your day

Each row is a real situation. Click the sequence to jump to the corresponding section in the playbook.

### Daily rhythms

| Scenario | Sequence | Timing |
|---|---|---|
| Normal Tuesday — feature in progress | `/wbStandup` → `/wbContext` → describe task → `/wbDebug?` → `/wbGit` × N → `/wbAudit` → `/wbGit` | 8h day |
| Just got back from a week off | `/wbStandup core2/ --since=14d` → `/wbContext <pkg>` → re-read open plans | 30 min orient |
| Morning standup only — no actual work today | `/wbStandup core2/` → close laptop | 10 min |
| Quick bug fix between meetings | `/wbContext <pkg>` → `/wbDebug "<error>"` → fix → `/wbGit` | 30 min |
| Polish day — already shipped, want to clean up | `/wbClean <pkg>` → `/wbAudit <pkg>` → `/wbRefactor <file>?` → `/wbGit` | 1–2h |
| Doc-only day — no code changes | `/wbDoc <pkg>` → `/wbGit` | 1h |

### Shipping flows

| Scenario | Sequence | Risk level |
|---|---|---|
| Ship a package to npm | `/wbDoc` → `/wbTest` → `/wbSecure` → `/wbRelease core2/` → `/wbPublish <pkg>` → `/wbRelease core2/ --restore` → `/wbGit` → `/wbBroadcast?` | High — needs `--restore` |
| Ship an app to the web | `/wbDoc` → `/wbTest` → `/wbSecure` → `/wbDeploy <app> --target=local` → `/wbDeploy <app>` → `/wbGit` | Medium — local-test catches most issues |
| Hotfix release (one-line patch on prod) | `/wbDebug` → fix → `/wbTest <pkg>` → `/wbRelease core2/` → `/wbPublish <pkg>` → `/wbRelease --restore` → `/wbGit` | Highest — skip nothing, even under pressure |
| Pre-release / canary | `/wbRelease core2/ --prerelease=beta` → `/wbPublish` → manual install test → `/wbRelease --restore` | Low — meant for dry-runs |

### Stuck / blocked

| Scenario | First move | Why |
|---|---|---|
| Hit an error you don't understand | `/wbDebug "<exact error>"` | Hypothesis before fix. Always. |
| Code is messy, don't know where to start | `/wbAudit <pkg>` then read § 0 | Audit picks the priorities; you don't |
| Have a long audit, don't know which finding to fix first | `/wbActOn <audit-file>` or `/wbAudit <pkg> --act` | Triage 23 findings into 3 ranks |
| Don't know what to run next | `/wbNext` | Single recommendation + rejected alternatives |
| Plan went stale; tasks no longer match reality | `/wbAudit <pkg> --act --wbPlan` | Generate a fresh plan from current state |
| Test is failing but you "know" the code is right | `/wbTest <pkg>` (let it classify) → `/wbDebug "<failing assertion>"` | Test-wrong vs. code-wrong — don't reflexively patch the test |

### Cross-cutting refactors

| Scenario | Command | Cadence |
|---|---|---|
| Adding a new user-facing component | `/wbTranslate <component>` | Once per component, before merge |
| Modernizing legacy HTML/Vuetify code | `/wbToWBC <legacy-file>` | Once per file, never twice |
| Setting up a brand-new package | `/wbSetup <new-pkg>` | Once, ever |
| Adding Pro-tier gating to an unmonetized package | `/wbMonetize <pkg>` | Once (bootstrap), then advisory only |
| Auditing tier consistency | `/wbLicense <file-or-folder>` | When monetization changes |

### Communication / output

| Scenario | Command | When |
|---|---|---|
| Just shipped a user-visible release | `/wbBroadcast <pkg>` | Right after `/wbPublish` |
| Daily status report for collaborators | `/wbStandup core2/` (paste output) | End of day, ad-hoc |
| Need to explain the system to someone | `concepts/presentation/` | Before the meeting |
| Internal refactor, no user-visible change | **Skip /wbBroadcast** | Don't announce internal work |

---

## The four phases — quick lookup

### 🌅 Morning · orient

```
You don't know what state things are in.

 /wbStandup core2/ (10 min — what's in flight everywhere)
 ↓
 /wbContext <chosen-pkg> (30 sec — sync the AI on the package)
```

The temptation: skip `/wbContext` because "I know what I'm working on." Don't. It catches drift.

### ☀️ Midday · execute

```
You know what to do. Now do it.

 Already have a plan? ──yes──→ Execute next unchecked row
 ↓ no
 Task fits in one sentence? ──yes──→ Just describe it
 ↓ no
 /wbPlan <pkg> (break into worker/validator tasks)
 ↓
 IF console red: /wbDebug "<error>" (hypothesis → verify → fix)
 ↓
 Every logical unit: /wbGit (commit. 3–6/day is the right rhythm)
```

### 🌆 Afternoon · polish

```
The code works, but it's ugly.

 /wbClean <pkg> (find dead code, console.log, stale files)
 ↓
 /wbAudit <pkg> (the brutal review — re-prompt "harsher" if too gentle)
 ↓
 /wbRefactor <file>? (only if audit flagged the file. Never preemptive.)
```

The single biggest mistake: running `/wbRefactor` before `/wbAudit`. Refactor changes structure, audit reviews the *refactored* version, audit is happy because clean-looking code, you ship the original bug.

**Always audit the original. Then refactor if audit asked.**

### 🌃 Evening · ship

```
 PACKAGE TO NPM APP TO WEB

 /wbDoc /wbDoc (optional)
 ↓ ↓
 /wbTest (must pass) /wbTest (must pass)
 ↓ ↓
 /wbSecure (CRITICAL blocks) /wbSecure (CRITICAL blocks)
 ↓ ↓
 /wbRelease core2/ /wbDeploy <app> --target=local
 ↓ ↓ (clicks around locally)
 /wbPublish <pkg> /wbDeploy <app>
 ↓ ↓
 /wbRelease core2/ --restore ← critical! /wbGit
 ↓
 /wbGit (commit + tag)
 ↓
 /wbBroadcast <pkg> (only if user-visible)
```

The mandatory refusals (each step refuses if a prior step had blockers):

- `/wbDeploy` refuses if `/wbTest` recently failed
- `/wbPublish` refuses if `/wbRelease` hasn't run in this cycle
- `/wbPublish` / `/wbDeploy` refuse if `/wbSecure` has CRITICAL findings
- Refuse to ship on `dist/` vs `dist-dev/` mismatch
- `/wbBroadcast` refuses without successful release/publish in same cycle

---

## The belt system (when to learn what)

<BeltProgression />

Exit criterion per belt is concrete (ship a feature, the first thing you type on an error is `/wbDebug`, you shipped a real release, etc.) — see [`the_daily_playbook`](the_daily_playbook.md) for the criteria.

---

## The rule that beats the belt system

**If you only ever use `/wbContext` at the start of a session, `/wbAudit` before shipping, and `/wbGit` to commit, you're already at 80%.**

The other 18 commands optimize the remaining 20%. Don't feel pressure to use them just because they exist.

---

## What this folder is NOT

- Not a reference. For per-command details, go to [`../commands/`](../commands/README.md).
- Not a concept primer. For *why* commands work this way, go to [`../concepts/`](../concepts/README.md).
- Not a tutorial. For first-time onboarding, go to [`../start_here/`](../start_here/README.md).

The playbook is opinionated and expects you've already learned the commands. If a sequence above mentions a command you've never run, look it up in `commands/<NN>_<cmd>/<cmd>_practical.md` first.

---

## One honest warning

Playbooks lie slightly. The real day has interruptions, meetings, half-finished tasks, priority shifts. You will not march through morning → midday → afternoon → evening in a clean line. You will jump from midday straight to evening because a deploy deadline moved. You will run `/wbAudit` at 9am because you forgot yesterday.

The playbook's job is not to dictate the day. It's to give you a *default* for moments when you don't know what to do next. When you have a clear priority, ignore the playbook and follow the priority.

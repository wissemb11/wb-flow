---
title: "Agentic Workflows — Overview"
description: "Reference card for the 21 slash-commands, their four-step shape, and the loop-vs-pipeline principle that makes the system coherent."
---

# Agentic Workflows — Overview

> Self-help reference. Open this when you've forgotten which command does what, or when you're about to invent a new command and want to know why that's probably a bad idea.
>
> Format: dense reference card. Not a tutorial.

---

## The whole system in one paragraph

You have 21 slash-commands. They all follow the same four-step shape (*read → think → write a report → sometimes act*). They write to `.agents/workflows/reports/YYYY/MM/DD/<kind>/`. Every new command reads the `reports/` folder before acting, which is what makes this a loop rather than a pipeline. The `frontEnd/wbc-ui/core2/packages/wb-flow/templates/` directory (where you are now) describes *how* the commands behave; the `core2/.agents/workflows/` directory stores *what has been done*.

That paragraph is the whole system. Everything below is annotation.

---

## The commands, grouped by function

Not alphabetized. Grouped by the question you're asking when you reach for them.

### "What is this codebase?" — Context builders
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbSetup` | Create `.agents/workflows/context.md` + `dev.md` from scratch | target package | Once per new package |
| `/wbContext` | Refresh context against current code state | `reports/YYYY/MM/DD/contexts/` | Start of session / after big changes |
| `/wbStandup` | Monorepo-wide scan: what's in-progress, what's stale | `reports/YYYY/MM/DD/standups/` | Morning, weekly |

**Rule of thumb:** if you're opening a package for the first time this week, run `/wbContext` on it. If you've never run `/wbSetup` on it, run that first. The order matters — `/wbContext` reads what `/wbSetup` wrote.

### "What should I do next?" — Planners
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbPlan` | Break a goal into a task table, assign worker + validator roles | `reports/YYYY/MM/DD/plans/` | Once per feature or migration |
| `/wbVision` | Brainstorm features when the queue is empty | `reports/YYYY/MM/DD/visions/` | Rarely; when bored |

**Rule of thumb:** `/wbPlan` is for work you've already committed to. `/wbVision` is for work you haven't.

### "Is this any good?" — Critics
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbAudit` | Opinionated, harsh review against Pro standards | `reports/YYYY/MM/DD/audits/` | Before release |
| `/wbReview` | Surgical PR-style review of a specific change | `reports/YYYY/MM/DD/reviews/` | After implementing a feature |
| `/wbTest` | Run tests, report failures with fix suggestions | `reports/YYYY/MM/DD/tests/` | Before release, after refactor |

**The real difference:** `/wbAudit` asks *"would this code survive a pro review?"*. `/wbReview` asks *"did you implement what you said you'd implement?"*. `/wbTest` doesn't ask — it runs the existing tests.

### "Clean this up" — Surgeons
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbClean` | Find dead code, stale files, forgotten `console.log` | `reports/YYYY/MM/DD/cleans/` | End of day, before merging |
| `/wbRefactor` | Restructure code without changing behavior | `reports/YYYY/MM/DD/refactors/` | After audit flags messiness |
| `/wbDebug` | Hypothesize + investigate a specific error | `reports/YYYY/MM/DD/debugs/` | When stuck |
| `/wbDoc` | Generate JSDoc + README content from code | `reports/YYYY/MM/DD/docs/` | Before release |

**The real difference:** `/wbClean` removes things. `/wbRefactor` moves things. `/wbDebug` finds things. `/wbDoc` writes things about things. Don't mix them up — using `/wbRefactor` to fix a bug is how you silently delete a feature.

### "Ship it" — Shippers
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbRelease` | Bump versions across the monorepo, unpick `workspace:*` links | `reports/YYYY/MM/DD/releases/` | When ready to publish |
| `/wbPublish` | Build + push to npm | `reports/YYYY/MM/DD/publishes/` | After `/wbRelease` |
| `/wbDeploy` | Build + push to the web (GitHub Pages, etc.) | `reports/YYYY/MM/DD/deployments/` | For apps, not packages |
| `/wbLicense` | Manage tier gating (free/Pro) across the ecosystem | `reports/YYYY/MM/DD/licenses/` | Rarely; when monetization changes |
| `/wbBroadcast` | Generate announcement kit (social posts, release notes, blog) | `reports/YYYY/MM/DD/broadcasts/` | After `/wbRelease`, user-facing releases only |

**Rule of thumb:** `/wbRelease` → `/wbPublish` is for packages. `/wbDeploy` is for apps. Mixing them (publishing an app to npm or deploying a package to the web) is almost always a mistake. `/wbBroadcast` is only for user-visible changes — don't announce internal refactors.

### "Version control" — Archivist
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbGit` | Analyze diff, draft Conventional Commit, optionally commit/push | `reports/YYYY/MM/DD/gits/` | After every logical unit of work |

**Rule of thumb:** `/wbGit` is the only command that *touches git for you*. It is also the primary reason you might ever want the AI to run `git add` / `git commit` — by default, in this project, the AI does not run git commands unless invoked via `/wbGit`.

### "Protect it" — Security + integrity
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbSecure` | Red-team scan for secrets, XSS, insecure deps, missing tier checks | `reports/YYYY/MM/DD/security/` | Before deploy of anything user-facing |

**Rule of thumb:** `/wbSecure` is `/wbAudit`'s adversarial sibling. Audit asks "is this code good?"; secure asks "can this code be exploited?". Different hat, different output.

### "Translate / migrate" — Cross-cutting refactors
| Command | One-line | Writes to | How often |
|---|---|---|---|
| `/wbTranslate` | Extract hardcoded strings → i18n keys + EN/FR/AR JSON files | `reports/YYYY/MM/DD/translations/` | When adding UI or preparing multilingual release |
| `/wbToWBC` | Rewrite legacy/Vuetify code to use WBC-UI2 components (WBDataViewer, etc.) | `reports/YYYY/MM/DD/migrations/` | When modernizing legacy pages or onboarding external code |

**Rule of thumb:** Both are *cross-cutting refactors* — they touch many files for one goal. `/wbTranslate` = one-off per component. `/wbToWBC` = one-off per legacy surface. Neither should run repeatedly on the same target.

---

## The argument-resolution rules

Every command resolves its target the same way. Memorize this once and you can use any command without rereading its docs.

| Form | Example | Means |
|---|---|---|
| `/<cmd>` | `/wbPlan` | Act on the current working directory |
| `/<cmd> -w <workspace>` | `/wbPlan -w @wbc/wb-core` | Resolve via root `package.json` workspaces |
| `/<cmd> <file>` | `/wbAudit src/App.vue` | Act on that specific file's contents |
| `/<cmd> <folder>` | `/wbPlan packages/wb-core/` | Act on the folder's source code, not its hidden `.agents/` folder |

**The trap** — the folder form. It does not mean "only touch the metadata files." The AI will read `context.md` to learn the rules, then edit the *real* code. If you want metadata-only, use `--scope=global` or name the file explicitly.

---

## Default report windows

Every command that reads `reports/` honors a `--since=<window>` flag. The defaults differ by command class so daily commands stay fast and shipping commands see enough history:

| Command class | Default window | Override examples |
|---|---|---|
| Daily (`/wbStandup`, `/wbContext`, `/wbDebug`) | `--since=7d` | `--since=30d` for a deep look-back |
| Polish (`/wbAudit`, `/wbReview`, `/wbClean`, `/wbTest`) | `--since=14d` | `--since=all` to ignore the cutoff |
| Shipping (`/wbRelease`, `/wbPublish`, `/wbDeploy`, `/wbBroadcast`) | `--since=30d` | `--since=90d` for quarterly retrospectives |
| Survey (`/wbStandup core2/`, `/wbContext --scope=global`) | `--since=7d` | `--since=2026-01-01` for date-anchored scope |

Override syntax:

- `--since=7d` / `14d` / `30d` / `90d` — relative window.
- `--since=YYYY-MM-DD` — absolute cutoff.
- `--since=all` — no window (use sparingly; slow on aged repos).

**Why bounded reads, not bounded writes.** Reports are append-only and small individually; deleting them is risky (you might lose the one historical signal that mattered). Bounding *reads* gives the same performance benefit without the risk. If disk pressure becomes real, archive `reports/<old-date>/` manually to cold storage — you don't need a `/wbPrune` command for that.

---

## What makes this a loop, not a pipeline

Every command scans `.agents/workflows/reports/` before acting. That one behavior is what separates this from a Unix-style pipe.

<div align="center">
<ClosedLoopAnimation />
*Commands don't call each other — they read from and write to the `reports/` folder. The folder is the orchestrator.*
</div>

- `/wbAudit` writes a report flagging 3 issues.
- You run `/wbPlan` a day later. It reads that audit report and adds 3 tasks to the plan automatically.
- You run `/wbTest` two days later. It sees one of those tasks is marked ✅ and doesn't re-test the fix.
- You run `/wbDeploy`. It sees a recent failing `/wbTest` report and refuses to deploy.

No scheduler orchestrates this. The `reports/` folder *is* the orchestration. Every command is both a reader and a writer of that shared state.

**What breaks this:** hand-editing reports, or deleting them to "clean up." The state is the point.

---

## Where things live

```text
frontEnd/wbc-ui/core2/
├── docs/ai_reference/ ← HOW commands behave (this directory)
│ ├── README.md ← entry point / reading guide
│ ├── start_here/ ← onboarding tutorials (one-time reads)
│ ├── concepts/ ← what the system is + workflow diagrams
│ ├── daily_use/ ← playbooks consulted during work
│ └── commands/ ← per-command templates + examples
│
├── .agents/workflows/ ← WHAT has been done (per-package)
│ ├── context.md ← what this package is
│ ├── dev.md ← what the AI must refuse to do
│ └── reports/YYYY/MM/DD/ ← temporal memory by date
│ ├── contexts/
│ ├── plans/
│ ├── audits/
│ └── ...
│
└── packages/<pkg>/.agents/workflows/ ← per-package version of the same
```

**Identity of a package** = its local `context.md` + `dev.md`.
**Memory of the monorepo** = the root `reports/` folder.
**Logic of the commands** = this directory.

Three things. Don't blur them.

---

## Honest critique of this system (from the agent)

Not everything about this design is obviously good. Worth naming the tradeoffs so you don't get blindsided when they bite:

1. **The `reports/YYYY/MM/DD/` folder grows without bound, but reads are bounded.** Files accumulate; nothing deletes them. The bounded-read mitigation is the universal `--since=<window>` default (see "Default report windows" below). Disk grows; reads stay fast. Periodic manual archiving is still your job.

2. **21 commands is a lot.** The Belt System in [the_daily_playbook](../daily_use/the_daily_playbook) mitigates this, but realistically: `/wbContext`, `/wbPlan`, `/wbAudit`, `/wbDebug`, `/wbGit`, `/wbRelease` carry 90% of the daily load. The other 15 exist for occasional or situational use. That's fine — but don't feel pressure to use them just because they exist. Growth from 16 → 21 also validates critique #1 below: the vocabulary is creeping, and this makes "don't invent a 22nd command" harder advice to follow.

3. **The closed-loop design assumes commands actually read `reports/`.** If an AI implementation skips that step (or you use a different AI client that doesn't honor it), the whole "system" reverts to unrelated one-shot commands. There's no enforcement; it's a convention.

4. **`/wbVision` is the weakest command.** Brainstorming features is a place where AI is confidently average — it'll produce 10 "make it real-time," "add AI" ideas that sound good and are mostly noise. Use it as a prompt, not a plan.

5. **The "Brutal critic" framing of `/wbAudit` fights the default LLM agreeableness.** It works, but you'll sometimes need to re-prompt: "harsher." Don't trust a first-pass audit that says everything is fine.

---

## The 4-step feature lifecycle (the actual one you'll use)

Ignore the 4-step version in the gemini overview. Here's what actually happens:

1. **`/wbContext <package>`** — sync the AI's understanding of the package.
2. **Describe the feature in one sentence**, or run `/wbPlan` if it's bigger than a sentence.
3. **Write the code.** The AI follows `dev.md` automatically because `/wbContext` loaded it.
4. **`/wbAudit` + `/wbTest`**, then `/wbRelease` or `/wbDeploy`.

Between steps 3 and 4, you'll iterate — run `/wbDebug`, `/wbRefactor`, `/wbClean` as needed. The lifecycle is not linear; steps 1 + 4 bookend a messy middle.

---

## One rule that matters more than the rest

**Don't invent new commands to solve small frustrations.** The power of this system is that 21 commands cover a huge surface with a still-memorable vocabulary. The recent growth from 16 to 21 (adding `/wbGit`, `/wbSecure`, `/wbBroadcast`, `/wbTranslate`, `/wbToWBC`) is already pushing the upper limit of what you can hold in your head. A 22nd command had better earn its place. Nine times out of ten, the right move is: extend an existing command's `_template.md` to handle the edge case.

The templates are the API. The commands are the handles. Add handles sparingly.

---

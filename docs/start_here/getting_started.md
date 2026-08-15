---
title: Getting Started — A Tutorial
description: Opinionated 30-day onboarding plan teaching which /wb* commands to learn first and in what order.
---

# Getting Started — A Tutorial

> Self-help. You have 21 commands. You don't need most of them at once. This file tells you which commands to learn first, in what order, and what a typical day looks like once you've internalized them.
>
> Format: opinionated tutorial, not a reference. For reference, see [overview_agentic_workflows](../concepts/overview_agentic_workflows).

---

## The TL;DR

**Three commands cover 80% of daily work:**

1. **`/wbContext <package>`** — start every session with this.
2. **`/wbAudit <package>`** — run before shipping anything.
3. **`/wbGit`** — commit your work in logical units throughout the day.

If you only ever learn these three, you can ship features. The other 18 commands optimize the remaining 20%.

---

## The 6 commands you actually use daily

After the initial learning curve, your daily rotation will be these:

| Command | When | Why |
|---|---|---|
| **`/wbStandup core2/`** | First thing every morning | Reconcile what was in flight yesterday |
| **`/wbContext <pkg>`** | After picking today's package | Sync the AI's understanding of it |
| **`/wbPlan <pkg>`** | When the task is bigger than one sentence | Break work into resumable subtasks |
| **`/wbDebug "<error>"`** | The moment you hit any error | Hypothesis before fix |
| **`/wbAudit <pkg>`** | Before merging or shipping | Brutal review of what you did |
| **`/wbAudit <pkg> --act --wbPlan`** | When you'd otherwise run audit then plan back-to-back | Audit + ranked actions + plan in one run. See [`wbPlan_flag`](../concepts/wbPlan_flag) |
| **`/wbGit`** | After every logical unit of work | Commit — the only command that touches git |

These six form a complete daily loop: orient → load → work → debug-as-needed → review → save. Most days, you won't touch the other 15.

---

## The first week: White Belt

**Goal:** ship one feature using just three commands.

### Day 1 — `/wbContext`

Pick a package you know reasonably well. Run:

```
/wbContext packages/wb-core
```

Read the output. The AI is loading what it knows about the package — what it is, what's been done recently, what conventions matter. If anything looks wrong, fix it. The next sessions will inherit this baseline.

**Exit criterion for the day:** you understand what `context.md` and `dev.md` contain, and you trust that the AI has read them.

### Day 2-3 — describe a small task

In the same package, find a task you'd ship anyway (small bug fix, small feature). Describe it in one or two sentences. Let the AI implement.

```
/wbContext packages/wb-core
# wait for it to finish loading
"There's a bug in renderString.js where empty strings throw. Fix it."
```

Watch what happens. The AI should follow rules from `dev.md` automatically (no deletes without permission, no Vue 3 syntax in Vue 2 packages, etc.). If it violates a rule, that's a sign your `dev.md` is missing the rule.

**Exit criterion:** you finished a task without re-explaining your project.

### Day 4-5 — `/wbAudit` before shipping

After your task is done, run:

```
/wbAudit packages/wb-core
```

The output will be opinionated. If it says "looks good" on the first pass, push back: *"harsher. Assume a paying customer hates this code."* Real audits always find something.

Fix what audit flagged. Don't ship until major findings are addressed.

> 💡 **Once you're comfortable with `/wbAudit` standalone**, try the chained form: `/wbAudit packages/wb-core --act --wbPlan`. Same audit, plus a sibling action file ranking findings into TODAY/THIS WEEK/THIS MONTH/LATER, plus a plan file with worker/validator tasks for the multi-step ones. Useful when audit + plan would otherwise be two separate commands. Full reference: [`concepts/wbPlan_flag`](../concepts/wbPlan_flag). The standalone form remains valid; flags are convenience.

**Exit criterion:** you shipped a small feature where audit had to be re-run after fixes.

### Day 6-7 — `/wbGit` to commit

When the work is done and audit is clean, run:

```
/wbGit
```

The AI proposes a Conventional Commit message. If you like it, tell it: *"commit it"*. If not, edit the message and re-run.

`/wbGit` is the only command that actually runs git. Everything else is read-only against your working tree.

**Exit criterion:** you've shipped a feature end-to-end (`/wbContext` → describe → `/wbAudit` → `/wbGit`) without re-reading any docs.

---

## Switching from manual git to /wbGit (a 1-week migration)

If your current habit is something like:

```bash
git add *
git commit -m "<yyyymmddhhss>"
git push
```

…this section is for you. The new workflow keeps your speed but fixes three problems your future self will hit: timestamp messages tell you nothing in 6 months, `git add *` can quietly stage `.env` / build artifacts / `.agents/` reports, and bundled mixed changes break `/wbReview`/`/wbAudit` categorization downstream.

### Pre-flight check (do this once, today)

Before your first `/wbGit`, audit what `git add *` has been picking up:

```bash
git status
git ls-files | grep -E "(\.env|\.agents/|dist/|node_modules/)"
```

If anything in those last three categories is tracked, your `.gitignore` is missing entries. Fix `.gitignore` *before* switching to `/wbGit` — the command will faithfully respect whatever is gitignored, so wrong gitignore = wrong commits.

### The replacement, command-for-command

| Old | New |
|---|---|
| `git add *` | `/wbGit` reads the diff, proposes which files to stage |
| `git commit -m "<timestamp>"` | `/wbGit --execute` writes a Conventional Commit message |
| `git push` | `/wbGit --push` (separate step, separate confirmation) |
| All three at once | `/wbGit then commit and push` |

### The 7-day onboarding

Don't rip-and-replace day one. Migrate gradually:

**Days 1-2 — read-only mode**

```
/wbGit
```

Don't add the `--execute` flag. The AI proposes a message but doesn't run anything. Compare its message to the timestamp you'd have written. Notice: the message tells you what changed, not when.

Continue committing manually for now (`git commit -m "..."`). The point of these days is to *see* what `/wbGit` produces.

**Days 3-4 — let it execute**

```
/wbGit --execute
```

Now the AI runs `git add` (specific files, not `*`) and `git commit`. Confirms before each step. You still push manually.

This is when you'll hit the **mixed-change refusal**. If you've worked on a feature *and* a doc fix *and* a config tweak, `/wbGit` will refuse to bundle them and propose splitting. First instinct: override. Resist. Split commits are easier to review and revert later.

**Days 5-7 — full pipeline**

```
/wbGit then push
```

Or in your phrasing: `/wbGit then commit and push`. The AI does add + commit + push in sequence, with confirmation gates. You stop typing git commands directly.

### What you lose

Speed. Your timestamp habit was fast — no thinking about format. `/wbGit` adds 10-15 seconds because the AI has to read the diff. Real-world impact: ~2 extra minutes per workday across 6 commits.

If that bothers you, override the message:

```
/wbGit "fix(wb-core): typo in render"
```

You get the safety envelope (no `git add *`, no force-push, no mixed-change bundling) without waiting for the AI to compose.

### What you gain

- **Readable `git log`.** Six months from now, "feat(wb-core): add WBCodeSlot export" tells you something. "20260415_1430" doesn't.
- **Conventional Commits → automatic semver bumps.** When `/wbRelease` runs, it reads commit prefixes (`fix:` / `feat:` / `feat!:`) and computes patch/minor/major automatically. Timestamp messages can't do this.
- **Refusal of dangerous operations.** No `--force`, no `--no-verify`, no auto-push to protected branches. The safety envelope is non-overridable.
- **Closed-loop integration.** Plan-related commits reference the plan file path. Debug-related commits reference the debug report. Your git history becomes queryable against the report system.

### After the 7 days

Manual git still works (you're not blocked from typing `git commit`). But you'll find yourself reaching for `/wbGit` because it's better for the same effort. The transition isn't ideological — it's just that `/wbGit` produces history you can actually use.

The exception: `git stash`, `git rebase -i`, `git cherry-pick`, conflict resolution. These stay manual. `/wbGit` is for the daily commit/push rhythm; anything more involved is yours.

---

## The second week: Blue Belt

You've shipped a feature. Now learn what to do when things go wrong.

Add three commands:

### `/wbDebug "<error>"`

The moment you see an error you don't immediately understand:

```
/wbDebug "Maximum recursive updates exceeded"
```

The AI will produce a hypothesis. **Wait.** Don't accept a fix until the hypothesis makes sense. If the AI skips straight to a fix, push back: *"first tell me why you think this is the cause."*

Hypothesis → verify → fix. Never fix → hope.

### `/wbClean <pkg>`

End of a working session. Run:

```
/wbClean packages/wb-core
```

You'll get a list of things you forgot: `console.log`, dead files, unused imports. Read the list, decide what to delete (the command never deletes for you), then delete the obvious stuff.

### `/wbRefactor <file>`

Only after `/wbAudit` flagged that a specific file is messy. Refactor changes structure without changing behavior. Tests must pass before AND after.

```
/wbRefactor packages/wb-core/src/renderers/renderString.js
```

The command will refuse if there are no tests, if a `/wbDebug` is open on the file, or if no audit identified the file. The refusal is the feature.

**Exit criterion for the week:** the first thing you type when you hit an error is `/wbDebug`, not a manual grep.

---

## The third week: Brown Belt — shipping

You can build and fix. Now learn to ship.

Add the shipping pipeline:

### `/wbDoc <pkg>`

Before any release, regenerate JSDoc and READMEs:

```
/wbDoc packages/wb-core
```

The AI reads call sites and conventions, writes docs that reflect actual usage. Reviews each one before applying.

### `/wbTest <pkg>`

Before any release, confirm tests pass:

```
/wbTest packages/wb-core
```

If anything fails, the AI classifies (test-wrong vs. code-wrong vs. config-wrong) and you decide. Don't reflexively "fix the test" — sometimes the code is wrong and the test is the witness.

### `/wbSecure <pkg>` *(for user-facing code)*

Critical for apps and packages handling user input:

```
/wbSecure apps/wbdataviewer_github
```

CRITICAL findings block deploy. WARNING findings should be tracked. Run before any deploy of user-facing code.

### `/wbRelease core2/` then `/wbPublish <pkg>`

For packages going to npm:

```
/wbRelease core2/ # bumps versions, unpicks workspace:*
/wbPublish packages/wb-core
/wbRelease core2/ --restore # put workspace: protocols back
```

The `--restore` step is critical. Skipping it breaks your dev environment.

### `/wbDeploy <app>`

For apps going to the web:

```
/wbDeploy apps/wbdataviewer2.wbc-ui.com --target=local # test locally first
/wbDeploy apps/wbdataviewer2.wbc-ui.com # actual deploy
```

`--target=local` runs the prod build on your laptop. Catches deploy-specific bugs (base URL, deep links, asset paths) before they ship.

**Exit criterion for the week:** you shipped a real release end-to-end. npm or web, your choice.

---

## The fourth week onward: Black Belt — orchestration

You've covered building, fixing, and shipping. The remaining commands are situational.

Learn as you need:

- **`/wbStandup core2/`** — when you have multiple in-flight things and need a daily reconciliation. Run first thing.
- **`/wbVision <pkg>`** — when the queue is genuinely empty. **Use rarely.** Most "vision" output is mediocre.
- **`/wbSetup <new-pkg>`** — when creating a brand-new package. Run once.
- **`/wbReview <target> --plan=<path>`** — when verifying a plan was actually executed (not just claimed done).
- **`/wbBroadcast <pkg>`** — after a user-visible release, to draft announcement copy.
- **`/wbLicense <file-or-folder>`** — when adding Pro-tier features or auditing tier consistency.
- **`/wbTranslate <component>`** — when adding a user-facing component to a multilingual app.
- **`/wbToWBC <legacy-file>`** — when migrating legacy code to wbc-ui2 components.

You won't use all of these. Some you may never use. That's fine.

---

## A typical day, end to end

Here's what a productive day looks like for someone who's past the learning curve:

### 08:00 — Morning routine (5 minutes)

```
/wbStandup core2/
```

Read the output. It tells you:
- What was in flight yesterday.
- What's blocked on you.
- What CRITICAL findings haven't been addressed.

Decide which package to work on.

```
/wbContext packages/wb-core
```

Sync the AI's understanding of that package. If there's drift (you made changes the stored context doesn't reflect), answer the AI's questions.

### 09:00 — Pick a task

Two paths:

**Small task** (fits in a sentence):
> "Fix the bug in renderString.js where empty strings throw."

The AI implements. You review the diff. If it looks right, you continue.

**Big task** (multi-step):
```
/wbPlan packages/wb-core --task="add WBCodeSlot export"
```

The AI generates a task table. You execute task by task.

### 10:00–12:00 — Work

You're implementing. The AI is following `dev.md` rules automatically. If you hit an error:

```
/wbDebug "<error>"
```

Wait for the hypothesis. Verify it. Then fix.

### 12:00 — Lunch break, but first:

```
/wbGit
```

Commit what you've finished so far. Even half-completed plans should commit *closed* tasks, not the whole thing.

### 13:00–16:00 — More work

Same pattern. Run `/wbGit` again when you complete another logical unit.

### 16:00 — Polish

```
/wbClean packages/wb-core
```

Finds leftover `console.log`, dead files, etc. You decide what to delete.

```
/wbAudit packages/wb-core
```

The brutal review. If audit finds blockers, fix them. If audit looks too gentle, push back: *"harsher."*

```
/wbGit
```

Commit the polish.

### 17:00 — End of day

Either:
- **You're not shipping today.** Just `/wbGit` your work and close the laptop.
- **You're shipping today.** Continue to the shipping flow:

 ```
 /wbDoc packages/wb-core # regen docs
 /wbTest packages/wb-core # tests must pass
 /wbSecure packages/wb-core # security gate (if user-facing)
 /wbRelease core2/ # version bump
 /wbPublish packages/wb-core # to npm
 /wbRelease core2/ --restore # restore workspace: refs
 /wbGit # commit version bump + tag
 /wbBroadcast packages/wb-core # if user-visible release
 ```

 Each step refuses if a prior step had blockers. The pipeline self-protects.

---

## Three rules that beat the belt system

After a few weeks, you'll notice these patterns hold:

### 1. The 80% rule

If you only use `/wbContext` at session start, `/wbAudit` before shipping, and `/wbGit` to commit, you're already at 80% of the system's value. The other 18 commands optimize the remaining 20%.

Don't feel behind because you're not using all 21 every day.

### 2. The "AI doesn't run git" rule

Outside `/wbGit`, the AI does not touch git. No `git add`, no `git commit`, no `git push`. This is a project-wide rule. If a command tries to run git outside `/wbGit`, that's a bug — flag it.

### 3. The hypothesis-before-fix rule

Whenever you hit an error, the first command is `/wbDebug`, not a fix attempt. The hypothesis pause is what separates 10-minute bugs from 2-hour bugs.

---

## Common mistakes when starting

### Skipping `/wbContext`

You think "I know what I'm working on, I don't need to load context." Run it anyway. It takes 30 seconds and catches drift you don't know about.

### Trusting first-pass `/wbAudit`

Default LLM agreeableness produces gentle audits. Always re-prompt: *"harsher. Pretend a paying customer is about to file a bug report."* The real findings are there but require asking.

### Running `/wbRefactor` to fix bugs

Refactor changes structure, not behavior. Bug fixes change behavior. Mixing them is how you silently delete a feature. Sequence: `/wbDebug` → fix → `/wbAudit` → `/wbRefactor` (only if audit says so).

### Not running `/wbRelease --restore` after `/wbPublish`

Without `--restore`, your dev tree has pinned versions instead of `workspace:*`. Next `pnpm install` fetches from npm instead of using local packages. Your local edits stop showing up downstream.

### Treating `/wbVision` as a daily command

It's not. Daily brainstorming flattens your judgment. Use `/wbVision` rarely (monthly or less), at cross-package scope, when the queue is genuinely empty.

### Bundling unrelated changes in one commit

`/wbGit` will detect this and refuse. If you've worked on a feature and a doc fix and a bug, commit them separately. The command makes splitting easy; resist the urge to override into one mixed commit.

---

## When to refer to which doc

- **This file** — first time using the system, or returning after a break.
- **[overview_agentic_workflows](../concepts/overview_agentic_workflows)** — quick reference: which command does what.
- **[the_daily_playbook](../daily_use/the_daily_playbook)** — when you've forgotten what to run at 10am vs. 4pm.
- **[`<cmd>/<cmd>_practical`](../commands/)** — when you've forgotten when to use a command.

If you're going to bookmark one, bookmark `the_daily_playbook.md`. It's the one you'll re-read most.

---

## A 30-day plan

If you want a concrete schedule:

| Days | Goal | Commands learned |
|---|---|---|
| **1–7** | Ship one small feature | `/wbContext`, `/wbAudit`, `/wbGit` |
| **8–14** | Handle a bug + a refactor | + `/wbDebug`, `/wbClean`, `/wbRefactor` |
| **15–21** | Ship a real release | + `/wbDoc`, `/wbTest`, `/wbSecure`, `/wbRelease`, `/wbPublish`, `/wbDeploy` |
| **22–30** | Add the orchestration commands | + `/wbStandup` (daily morning), `/wbPlan` (for bigger work). Others as needed. |

After day 30, you've used the system enough that you'll know which commands you actually need. The remaining few (`/wbVision`, `/wbBroadcast`, `/wbTranslate`, `/wbToWBC`, `/wbLicense`, `/wbReview`) are situational — learn them when a situation calls for them, not before.

---

## The honest truth about getting started

The system has 21 commands. You'll resist learning them because 21 is a lot. That's fine.

**Start with three.** Use them daily. Add commands as you need them. The system serves you, not the other way around. If a command isn't pulling its weight in your workflow, ignore it.

Six months in, you'll have a personal subset of 8-10 commands that are second nature. The other 11-13 will exist for occasional use. That's the natural state of the system. Nobody uses all 21 every day.

---

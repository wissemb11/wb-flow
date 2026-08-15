---
title: Bootstrapping an Existing Project
description: Guidance for existing users adopting the formal wb-flow system without deleting their current setup.
---

# Bootstrapping an Existing Project

> Self-help. You've built up `context.md`, `dev.md`, and `reports/` files over time, but the system is messy. You're wondering: should I delete and start fresh, or keep what's there?
>
> This file answers that question. Companion to [getting_started](getting_started), which is for *brand-new* users; this one is for *existing* users adopting the formal command system. For a practical example, see [wbSetup_practical](../commands/wbSetup/wbSetup_practical).

---

## TL;DR

**Don't delete anything. Take the train while it's running.**

The system is designed to converge from messy → clean *while you work*, not by resetting. Each `/wbContext` + `/wbAudit` + actual edit cycle leaves a package slightly cleaner than you found it. Packages you don't touch stay at their current baseline — which is fine, because if you don't touch them, drift doesn't hurt you.

<DriftCorrectionAnimation />

---

## Why "delete and start fresh" is the wrong move

You'd lose three classes of artifact, all of which are hard to recreate:

### 1. Hand-edited rules in `dev.md`

These captured project knowledge over time. They were *forged against actual mistakes you've already made* — the rule "never rename `main:` without updating `vite.config.outDir`" exists because someone (maybe you) hit that bug and codified the lesson. Deleting `dev.md` discards the lessons.

### 2. Closed-loop history in `reports/`

Past audit findings, debug hypotheses, plan execution traces. Deleting them resets the loop's memory to zero. The next `/wbStandup` will think the project has no history. Past unresolved CRITICAL findings stop bubbling up because nothing references them.

### 3. Decisions parked in `context.md`

Open architectural decisions (e.g., `extractSubObject` array-handling: leaves vs. structural) are *explicit* "we haven't decided yet" markers. Deleting them invites the next session to silently resolve them — which is the failure mode the parking was designed to prevent.

The cost of regenerating all this from scratch is high. `/wbSetup` infers from current code, but it can't infer the *history* of why you chose what you chose. The cost of keeping it is zero — files just sit on disk.

---

## Why "delete + fresh `/wbSetup`" is also wrong

`/wbSetup` is designed for *new packages*, not for re-bootstrapping existing ones. Running it on a package that already has `context.md` + `dev.md` will overwrite hand-authored rules. You'd lose the same things as the delete option, just one package at a time.

The [wbSetup_practical](../commands/wbSetup/wbSetup_practical) doc actively flags this:

> "Do NOT run it 'to refresh' an existing, working package. That's `/wbContext`, not `/wbSetup`. Running `/wbSetup` on a package that already has a tuned `dev.md` risks overwriting hand-authored rules."

---

## The right approach: drift-correction in place

Six steps, executed over time as you naturally work, not in one push:

### Step 1 — Survey what you have

```
/wbStandup core2/
```

Once. Today. This tells you:
- Which packages have stale baselines.
- Which have unresolved findings from prior audits.
- Which haven't been touched in months.

You learn the current state without changing anything. The output is informational; nothing breaks if you ignore it. But you'll see immediately which packages have accumulated debt.

### Step 2 — Identify the package you'll work on first

Pick **one** package — the one you're most likely to actually edit this week. Don't try to clean up all 23 packages at once. Convergence is per-package and per-edit.

### Step 3 — Run `/wbContext` on that package

```
/wbContext packages/<chosen-pkg>
```

If the stored `context.md` has drifted from current code, `/wbContext` will surface the drift and ask you to confirm the updates. **Answer the questions.** After this turn, that package's baseline is fresh.

If you have an open architectural decision in `context.md`, it stays open — `/wbContext` won't silently resolve it. Good.

### Step 4 — Run `/wbAudit` on the same package

```
/wbAudit packages/<chosen-pkg>
```

This produces a list of debt items:
- Some will be old (carried over from before you adopted the system).
- Some will be new (drift since the last audit).

You don't fix them all at once. You fix them as you naturally edit the package. The audit's job is to make the debt *visible*, not to demand immediate cleanup.

### Step 5 — Actually do work

Implement a feature, fix a bug, whatever you'd be doing anyway. Use `/wbDebug`, `/wbRefactor`, `/wbClean` as needed. Commit with `/wbGit`.

Each round leaves the package slightly cleaner than you found it. After 3-5 work sessions on a package, it'll be noticeably tighter than when you started.

### Step 6 — Repeat for the next package, when its turn comes

You don't sweep across all packages on a calendar. A package gets cleaner only when you happen to work on it. Packages you never touch stay at their current baseline.

---

## What about the `reports/` folder?

**Leave it.** Old reports don't hurt anything.

The `--since=<window>` defaults (documented in [overview_agentic_workflows](../concepts/overview_agentic_workflows)) mean commands only read the last 7-30 days anyway. Old reports stop influencing new sessions automatically. They sit on disk as a historical archive.

If disk pressure ever becomes real (it won't, for years), you can `mv` old `reports/<old-date>/` folders to cold storage. That's a 1-line operation, not a workflow concern.

---

## What about packages you've never run `/wbSetup` on?

Those *should* get `/wbSetup`. **Run it once per such package, on the day you first work on it.**

Don't preemptively `/wbSetup` all 23 packages now — bootstrapping packages you're not actively touching is wasted effort. If you don't edit `wb-mermaid` for the next 6 months, it doesn't need a context file for those 6 months. The day you finally touch it, run `/wbSetup` first, then proceed.

---

## Day 1 of the new workflow — concrete plan

If you want a single day's worth of action, do this:

1. **Morning, ~5 min.** Run `/wbStandup core2/`. Read the output. Pick one package to focus on.
2. **Mid-morning, ~10 min.** Run `/wbContext packages/<that-pkg>`. Answer drift questions. Run `/wbAudit packages/<that-pkg>`. Read findings.
3. **Rest of the day.** Do actual work on that package. Use `/wbDebug` on errors, `/wbGit` to commit logical units, `/wbClean` + `/wbAudit` before shipping.
4. **End of day.** `/wbGit` to commit anything outstanding. Close the session.

That's it. No grand cleanup. No mass-`/wbSetup`. The system converges through use, not through preparation.

---

## The honest framing

Most engineering systems require setup before they're useful. This one doesn't. The setup *is* the daily work. You'll never have a moment where the project is "clean and ready for the new workflow" — you'll just notice, after a few weeks, that the workflow has been running smoothly for a while.

Resist the urge to do a big cleanup pass. It's the most expensive way to do the least useful work.

---

## Summary table

| Question | Answer |
|---|---|
| Delete `context.md` / `dev.md` / `reports/`? | **No.** You'd lose project history. |
| Run `/wbSetup` on existing packages to refresh? | **No.** That's not what `/wbSetup` does; it'll overwrite hand-authored rules. |
| Take the train while running, using `/wbContext` + `/wbAudit`? | **Yes.** This is the intended convergence path. |
| Anything to do today? | **Just `/wbStandup core2/`** to survey. Then pick one package and run `/wbContext` on it when you actually work on it. |

---

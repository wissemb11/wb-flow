---
title: Closing the Session
description: Why and how to properly end a chat session to avoid context-bloat costs.
---

# Closing the Session — 

> Ending a chat is a workflow step, not a chore. If you skip it, the next session pays the cost — in slower responses, more hallucinations, and (literally) more dollars per token.

---

## Why bother

The AI's context window is finite. Every message you send carries the entire prior thread. By message 200 of a working session, you're paying for:

<div align="center">
<ContextBloatAnimation />
*A 200-message session accumulates ~28K tokens of stale context. A fresh session starts at ~5K. Closing isn't hygiene — it's economics.*
</div>

- Old code that's already been written and committed.
- Discarded ideas, rejected suggestions, abandoned approaches.
- Tool outputs from `/wbAudit` runs whose findings are now resolved.
- Multiple `context.md` re-reads as the AI re-grounds itself.

None of that helps the next response. All of it slows generation, raises cost, and increases the odds the AI hallucinates a function name from earlier in the thread that no longer exists.

A clean session-close cuts the rope. The next session loads `context.md` fresh, reads `reports/` fresh, and has nothing to forget.

## The SOP (3 steps, ~2 minutes)

### 1. Snapshot the day

```
/wbStandup <target>/
```

Aggregates today's reports into `reports/<YYYY>/<MM>/<DD>/standups/standup_<target>_<date>.md`. This is the **only** thing tomorrow-you (or tomorrow-AI) will read to figure out what happened today.

If you skip it, tomorrow's session has to re-derive today's state from raw `git log` + scattered audit/plan files. That works, but it's slow and lossy.

### 2. Finalize the tracker

```
/wbStopTrack --finalize
```

If you ran `/wbTrack` at session start, this closes the tracker. It writes a final `§END` section summarizing the session, then extracts derivative files (`tips/`, `warnings/`, `commentaries/`, `all_commands/`, `resume/`) into `walkthroughs/`.

The tracker is `🔴 CLOSED` after this. New `/wb*` commands won't append to it — they'll start a fresh tracker if `/wbTrack` is invoked again.

If you didn't run `/wbTrack` at the start, skip this step. There's nothing to finalize.

### 3. Close the chat window

This is the step that actually clears the AI's working memory. **The previous two steps wrote files; this one releases tokens.**

If you keep the window open and "just ask one more question tomorrow," the cost-per-token math is brutal:

- Fresh window @ 5K tokens of context = cheap, fast.
- Same window with 200 messages of history = expensive, slow, prone to drift.

Most clients won't volunteer this. You have to do it manually.

## When NOT to close

- **You're mid-task.** Closing during execution loses the in-flight reasoning. Finish the task, then close.
- **You're debugging something subtle.** The AI's mental model of the bug is in the thread; a fresh session will re-derive it from scratch and may miss the same nuance.
- **Closing would force a re-onboarding.** If the next session is in 5 minutes for one quick question, the close-then-reopen cost outweighs the context-tax savings.

The rough rule: close when the cost of carrying the context forward exceeds the cost of re-loading it. By default, that's at the [Golden Save Point](1_the_golden_save_point.md) and at end-of-day.

---

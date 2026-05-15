# Opening a New Session

## When to Open a New Session
You open a new session in a fresh AI chat window after you have successfully [closed the previous one](2_closing_the_session.md). 

This could be:
- The start of a brand new day.
- Right after hitting a [Golden Save Point](1_the_golden_save_point.md) and deciding to tackle a major new feature (e.g., spending the morning cleaning bugs, and the afternoon building `wb-sync`).

## How to Open a New Session (SOP)

1. **Open a Fresh Chat Thread** in your AI client.
2. **Initialize Tracking**:
   Run `/wbTrack <target>`
   *Why?* The AI needs to start logging its actions. 

### ⚠️ The "Same Day" Edge Case
**What happens if I open a new session on the exact same day I just closed one? Will the AI overwrite my files?**

**NO.** The agentic workflow is strictly non-destructive. If you run `/wbTrack core2/` or `/wbPlan core2/` multiple times in a single day, the AI will use **Cumulative Behavior**:
- The file names stay exactly the same (e.g., `track_core2_20260503.md`). They do NOT get `-v2` suffixes.
- Instead of overwriting, the AI will **APPEND** to the existing file.
- It will inject a clear separator, usually formatted as `---` followed by a timestamp header like `## 🔁 Run @ 14:30` or `# Track Session 2`.

This guarantees that all your activities for `2026-05-03` remain consolidated in a single file without destroying the morning's history.

## Starting the Work
Once tracking is initialized, you can immediately begin:
- Run `/wbPlan <target> "Build the new X feature"` to scaffold the architecture.
- Run `/wbWork <target>` to execute.


## Why This Matters

A well-opened session starts with full context: the project state, the previous session's outcomes, and the current goal. Without this, the AI agent wastes the first several turns catching up on what happened before.

## Related Concepts

- **[The Golden Save Point](1_the_golden_save_point.md)** — The ideal state before closing the previous session
- **[Closing the Session](2_closing_the_session.md)** — How to close formally
- **[Session Lifecycle Hub](README.md)** — Full lifecycle overview
- **[Daily Use](../daily_use/README.md)** — Daily operational procedures


## Common Pitfalls

- **Skipping the Golden Save Point:** Opening a new session without closing the previous one properly causes context bleed
- **Missing context:** Always run `/wbContext` at the start of a new session to load full project state
- **Uncommitted changes:** Make sure all changes are committed before closing a session

---
← [Session Lifecycle Hub](README.md) · [Home](../README.md)


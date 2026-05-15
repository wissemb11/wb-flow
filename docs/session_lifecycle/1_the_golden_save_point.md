# The Golden Save Point

## What is it?
The **"Golden Save Point"** is a specific, highly-desirable state in the agentic workflow. You have reached this state when:
1. All tasks in the active `/wbPlan` are completed and marked as `✅ Valid`.
2. The repository has no lingering tech debt, unresolved bugs, or "dirty" legacy AI files littering the root.
3. The `context.md` and `dev.md` files are fully up-to-date and accurately reflect the current system.

When `/wbNext` outputs that the repository is **"fully sanitized"** and ready for **"proactive feature development,"** you have hit the Golden Save Point.

## Why is it important?
Think of this like a video game save point right before a major boss battle. If you start a massive new feature (like `wb-sync` CRDTs) without saving, and the AI hallucinates or breaks the build, rolling back is chaotic. 

The Golden Save Point ensures you have a pristine, working foundation. 

## What to do when you reach it:
Do not immediately start coding new features. Instead:

1. **Commit to Git**: This is the perfect time for a clean commit. 
   - Run `/wbGit <target>` to let the AI draft a commit message explaining the hygiene improvements.
   - Run `git add .`, `git commit`, and `git push`.
2. **Close the Session**: You need to formally close out the AI tracker so the next feature starts with a fresh brain. (See `2_closing_the_session.md`).


## What's Next?

After reaching a Golden Save Point, proceed to close the session (`2_closing_the_session.md`) to formally end the AI tracker. Then open a new session (`3_opening_a_new_session.md`) for the next feature.

## Related Concepts

- **[Session Lifecycle Hub](README.md)** — Overview of the full session lifecycle
- **[Closing the Session](2_closing_the_session.md)** — How to close formally and commit
- **[Opening a New Session](3_opening_a_new_session.md)** — Starting fresh with full context
- **[Daily Use](../daily_use/README.md)** — Daily operational procedures



## Summary

The Golden Save Point is the ideal state before closing a session: all tasks complete, no tech debt, documentation up to date. Always reach this state before starting a new major feature.


## Related

- [Session Lifecycle Hub](README.md) — Overview of the full lifecycle
- [Closing the Session](2_closing_the_session.md) — Next step after reaching the golden save point


---

---
← [Session Lifecycle Hub](README.md) · [Home](../README.md)

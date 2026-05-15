# wb-flow Protocol: /wbStopTrack Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbStopTrack` command.

---

## 1. Role & Definition Matrix

**Role:** The Session Finalizer
**Target:** Seals and archives session tracker files.

| Scenario | System Behavior |
|---|---|
| Active tracker exists | **[PROCEED]** Appends seal, generates summary, archives. |
| No active tracker | **[BLOCK]** ❌ Error: No active session. Use `/wbTrack .` first. |
| Tracker already sealed | **[BLOCK]** ⚠️ Warning: Already finalized. |

---

## 2. Argument Resolution Matrix

| Argument Type | Example | Parsing Logic |
|---|---|---|
| Folder path | `Command: /wbStopTrack .` | Locates tracker for this scope. |
| Specific scope | `Command: /wbStopTrack packages/wb-core` | Locates tracker for that scope. |

---

## 3. Summary Block Simulation

```markdown
--- SESSION FINALIZED ---
Date: 2026-05-12 18:30
Tasks completed: 6/6
Models used: Opus 4 complex
Est. cost: ~$0.15
Next recommended: /wbTrack . to start new session
```

---

## 4. Edge Cases

| Fault | Resolution |
|---|---|
| Tracker has no entries | ✅ Still creates summary with 0 tasks. |
| Multiple trackers for same day | Merges into a single daily archive. |
| File permission error | ❌ Error: Cannot write to reports directory. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

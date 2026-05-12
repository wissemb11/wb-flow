# wb-flow Protocol: /wbLog Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbLog` command. It serves as the definitive reference for how the agent appends log entries to session trackers.


## Key Takeaways

`wbLog` is essential for debugging failed workflows and auditing agent activity. Use `--status error` to focus on failures and `--session latest` for full replay.

---

## 1. Role & Definition Matrix

**Role:** The Session Annotator
**Target:** Appends timestamped notes to active tracker files.

| Scenario | System Behavior |
|---|---|
| Active tracker exists | **[PROCEED]** Appends `[LOG]` entry with timestamp. |
| No active tracker | **[PROCEED]** Creates minimal tracker, then appends. |
| Tracker is sealed (post-`/wbStopTrack`) | **[BLOCK]** ❌ Error: Session is finalized. Start new session with `/wbTrack`. |

---

## 2. Argument Resolution Matrix

| Argument Type | Example | Parsing Logic |
|---|---|---|
| Single message | `Command: /wbLog . "note"` | Treats everything after the path as the message string. |
| Multi-word path | `Command: /wbLog packages/my-app "note"` | First arg = path, rest = message. |

---

## 3. Flag Processing Matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--dry-run` | `-D` | Shows what would be logged without writing |

---

## 4. Edge Cases

| Fault | Resolution |
|---|---|
| Empty message | ❌ Error: Message cannot be empty |
| Tracker file locked | ⚠️ Warning: Delayed write, retry |
| Very long message (>1KB) | ✂️ Truncated to 1KB with `...[truncated]` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

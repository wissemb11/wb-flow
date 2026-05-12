# wbStopTrack — Expert Architecture

> How `/wbStopTrack` finalizes session trackers, generates summaries, and prepares for session closure.

---

## 1. System Role

`/wbStopTrack` is a **session finalizer**. It seals the active tracker, generates a summary block, and archives the file to the reports tree.

| Property | Value |
|---|---|
| **Role** | 📋 Mechanical (finalization) |
| **Input** | Folder path |
| **Output** | Sealed track file in `reports/YYYY/MM/DD/` |
| **Mutates files** | Yes (seals + archives) |

---

## 2. Finalization Protocol

1. **Seal marker** — Appends `--- SESSION FINALIZED ---` with timestamp
2. **Summary block** — Computes task count, model usage, cost estimate
3. **File archive** — Moves tracker from `.wb/workflows/tracks/` to `reports/YYYY/MM/DD/`
4. **Context purge** — Removes active-tracker flag from `.wb/workflows/context.md`

---

## 3. Summary Block Format

```markdown
--- SESSION FINALIZED ---
Date: 2026-05-12 18:30
Tasks completed: 6/6
Models used: Opus 4 complex
Est. cost: ~$0.15
Next recommended: /wbTrack . to start new session
```

---

## 4. Lifecycle Diagram

```
⬜ Session starts → /wbTrack creates tracker → /wbLog appends notes
                                                      ↓
                                         /wbStopTrack seals & archives
                                                      ↓
                                         Next session starts fresh with /wbTrack
```

---

## 5. Edge Cases

| Scenario | Behavior |
|---|---|
| No active tracker | ❌ Error: No active session to finalize |
| Already finalized | ⚠️ Warning: Session was already closed. No action taken. |
| Tracker has no entries | ✅ Still creates summary with 0 tasks |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

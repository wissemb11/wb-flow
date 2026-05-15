# wbLog — Expert Architecture

> How `/wbLog` appends structured entries to session trackers without disrupting the tracking protocol.

---

## 1. System Role

`/wbLog` is a **session annotator**. Unlike `/wbTrack` which captures full state snapshots, `/wbLog` writes lightweight, timestamped entries into the active tracker file. It never creates new files or modifies existing state beyond appending.

| Property | Value |
|---|---|
| **Role** | 📋 Mechanical (annotation) |
| **Input** | Folder path + message string |
| **Output** | Append-only entry in tracker file |
| **Mutates files** | Yes (appends to active track file) |

---

## 2. Log Entry Format

Each log entry follows a strict format in the tracker:

```markdown
[LOG] 2026-05-12 14:30:00 — Switched from Sonnet to Opus for refactor
```

| Field | Source | Example |
|---|---|---|
| **Timestamp** | System clock | `2026-05-12 14:30:00` |
| **Message** | User-provided argument | `Switched from Sonnet to Opus for refactor` |

---

## 3. Append Protocol

Unlike `/wbTrack --save` which creates a new file, `/wbLog`:

1. Locates the active tracker via `.wb/workflows/context.md`
2. Reads the last line of the tracker file
3. Appends the `[LOG]` entry with a blank line separator
4. Updates no metadata or state counters

---

## 4. Coexistence with `/wbTrack`

| Aspect | `/wbTrack` | `/wbLog` |
|---|---|---|
| **Granularity** | Full session state | Single note |
| **File operation** | Create / overwrite | Append only |
| **Cost tracking** | Included in budget | Excluded from budget |
| **Output** | Track file in `reports/` | Inline in active tracker |

---

## 5. Edge Cases

| Scenario | Behavior |
|---|---|
| No active tracker | Creates a minimal tracker file first, then appends log |
| Empty message | Rejected with `❌ Error: Message is required` |
| Special characters | Preserved as-is (no escaping) |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

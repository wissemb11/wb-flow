# wbTrack — Expert Architecture

> How `/wbTrack` maintains session continuity across model switches and conversation boundaries.

---

## 1. System Role

`/wbTrack` is a **session recorder**. It captures the current state of work (active plan, completed tasks, model used, open questions) so that a future session — potentially with a different model — can resume seamlessly.

| Property | Value |
|---|---|
| **Role** | 📋 Mechanical (recording) |
| **Input** | Folder path |
| **Output** | Track file in `reports/YYYY/MM/DD/tracks/` |
| **Mutates files** | No (creates new track file only) |

---

## 2. What Gets Tracked

| Field | Source | Example |
|---|---|---|
| **Active plan** | Most recent plan file | `plan_my-project_20260511.md` |
| **Task state** | Plan table Done/Valid columns | `3/7 done, 2/7 validated` |
| **Current task** | Last 🔨 in-progress task | `Task #4 in progress` |
| **Model** | Current conversation model | `AI` |
| **Open questions** | Unresolved decisions or blockers | `API design for v2 endpoint` |
| **Session time** | Estimated time spent | `~45 min` |

---

## 3. Track File Format

```markdown
# Track: <scope> — YYYY-MM-DD HH:MM

## Session State
- **Plan:** plan_my-project_20260511.md
- **Progress:** 3/7 done, 2/7 validated
- **Model:** AI
- **Time spent:** ~45 min

## Completed This Session
- Task #1: Add unit tests (✅ 9/10)
- Task #2: Remove unused exports (✅ 10/10)
- Task #3: Add JSDoc (✅ 8/10)

## In Progress
- Task #4: Fix package.json (started, not finished)

## Open Questions
- Should description match npm or GitHub?

## Resumption Hint
Next session: finish Task #4, then /wbValid --task=*
```

---

## 4. Resume Protocol

When starting a new session, the model reads the most recent track file:

```bash
/wbTrack packages/my-project   # reads last track, shows state
```

This enables:
- **Cross-model handoff** — switch from one model to another mid-project
- **Cross-conversation continuity** — pick up where you left off
- **Multi-day projects** — no context loss between days

---

## 5. Start vs. Stop

| Command | Action |
|---|---|
| `/wbTrack .` | Read last track + show current state |
| `/wbTrack . --save` | Save current state as new track file |
| `/wbStopTrack .` | Finalize session and write closing track |

---

## 6. Integration

| Workflow Position | Context |
|---|---|
| **Start of session** | `/wbTrack .` to resume context |
| **Before model switch** | `/wbTrack . --save` to preserve state |
| **End of session** | `/wbStopTrack .` before closing |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

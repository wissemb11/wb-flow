# /wbStopTrack — Command Hub

> ⚠️ **Planned — no runtime template yet.** This command is documented for future implementation. The behavior described below reflects the intended design; the actual `/wbStopTrack` command is not available in the current `wb-flow` runtime.

> **Purpose:** Finalize an active session tracker, archive the log, and prepare the workspace for closure.
>
> **Family:** Session Lifecycle · **Output:** Report
>
> **Related:** [`/wbTrack`](../wbTrack/README.md)

---

## When to Use

Use `/wbStopTrack` when you are done with a work session and want to:

- Seal the day's tracker file so no further entries are appended
- Generate a session summary (tasks completed, time elapsed, model costs)
- Archive the tracker to the session's `.wb/workflows/reports/` tree
- Signal that the next `/wbTrack` call should start a **new** session file

**Do not use** `/wbStopTrack` mid-session if you plan to resume the same day — `/wbTrack` handles cumulative appending automatically.

---

## Invocation

```bash
/wbStopTrack <target>
```

| Argument | Required | Description |
|---|---|---|
| `<target>` | ✅ | Folder path (e.g., `packages/wb-core`, `.`) |

---

## What Happens

1. **Tracker sealed** — Appends a `--- SESSION FINALIZED ---` marker with timestamp
2. **Summary block generated** — Task count, model usage, cost estimate
3. **File archived** — Moved to `reports/<YYYY>/<MM>/<DD>/track_<target>_<YYYYMMDD>.md`
4. **Context purged** — Removes active-tracker flag from `.wb/workflows/context.md`

---

## Example

```bash
/wbStopTrack .
```

Result: `track_core2_20260512.md` is sealed, summarized, and archived.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbStopTrack/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

---

## Layer Files

- [ELI5](wbStopTrack_eli5.md) — What `/wbStopTrack` does in one sentence
- [Practical](wbStopTrack_practical.md) — When to finalize a session
- [Expert](wbStopTrack_expert.md) — Tracker lifecycle and archiving internals
- [Exhaustive Simulation](wbStopTrack_exhaustive_simulation.md) — All scenarios
- [Live Demo](wbStopTrack_live_demo.md) — End-to-end session close walkthrough

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

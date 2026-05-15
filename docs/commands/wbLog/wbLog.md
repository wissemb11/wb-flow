# /wbLog — Command Hub

> ⚠️ **Planned — no runtime template yet.** This command is documented for future implementation. The behavior described below reflects the intended design; the actual `/wbLog` command is not available in the current `wb-flow` runtime.

> **Purpose:** Append a free-form log entry to the current session tracker without triggering a full `/wbTrack` report.
>
> **Family:** Session Lifecycle · **Output:** Report (append)
>
> **Related:** [`/wbTrack`](../wbTrack/README.md) · [`/wbStopTrack`](../wbStopTrack/README.md)

---

## When to Use

Use `/wbLog` when you need to:

- Jot a quick observation, decision, or blocker during a session
- Record a model switch or context purge event
- Add a human note that doesn't fit the structured `/wbTrack` format
- Keep an audit trail of informal but important session events

**Prefer `/wbTrack`** for formal session openings, standups, or milestone reports.

---

## Invocation

```bash
/wbLog <target> <message>
```

| Argument | Required | Description |
|---|---|---|
| `<target>` | ✅ | Folder path (e.g., `packages/wb-core`, `.`) |
| `<message>` | ✅ | Free-text log entry |

---

## What Happens

1. **Entry appended** — Adds a timestamped `[LOG]` block to the current tracker file
2. **No report generated** — Unlike `/wbTrack`, this does not produce a full context or summary
3. **No cost estimate** — Log entries are excluded from budget calculations

---

## Example

```bash
/wbLog . "Switched from Sonnet to Opus for the refactor task — token context was getting tight."
```

Result: A `[LOG]` entry appears in `track_core2_20260512.md`.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbLog/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

---

## Layer Files

- [ELI5](wbLog_eli5.md) — What `/wbLog` does in one sentence
- [Practical](wbLog_practical.md) — When and how to log during a session
- [Expert](wbLog_expert.md) — Architecture of the session tracker and log format
- [Exhaustive Simulation](wbLog_exhaustive_simulation.md) — All log scenarios with expected behavior
- [Live Demo](wbLog_live_demo.md) — Real-time logging walkthrough

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

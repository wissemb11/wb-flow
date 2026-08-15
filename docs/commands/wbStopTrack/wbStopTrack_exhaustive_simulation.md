# /wbStopTrack — Exhaustive Simulation

> Complete behavior matrix for every `/wbStopTrack` input scenario.

---

## 1. Role & Definition Matrix

**Role:** Session Finalizer
**Contract:** Seal the active tracker, generate a summary, archive the file, and clear the active reference.

| Precondition | System Behavior |
|---|---|
| Active tracker exists, not sealed | ✅ **PROCEED** — Seals, summarizes, archives |
| No active tracker | ❌ **BLOCK** — "No active session. Use `/wbTrack` first." |
| Tracker already sealed | ❌ **BLOCK** — "No active session." |
| Target path does not exist | ❌ **BLOCK** — "Target directory not found." |

---

## 2. Argument Resolution Matrix

| Input | Resolution |
|---|---|
| `/wbStopTrack .` | Current directory scope |
| `/wbStopTrack packages/wb-core` | Package-level scope |
| `/wbStopTrack` (no args) | ❌ Error: Target is required |
| `/wbStopTrack . --note "done for today"` | Seals with note appended before the seal marker |

---

## 3. Flag Processing Matrix

| Flag | Short | Purpose |
|---|---|---|
| `--note` | `-n` | Append a final note before sealing |
| `--dry-run` | `-D` | Show what the summary would contain without sealing |

---

<script setup>
const stopTrackSimPipelines = [
  {
    title: "Scenario A — Normal Session Close",
    cmd: '/wbStopTrack .',
    logs: [
      { text: "Input:  /wbStopTrack .\nState:  Active tracker with 14 commands, 3 log entries, 6h duration", type: "ctx" },
      { text: "Result:\n  1. Appends: --- SESSION FINALIZED ---\n  2. Generates summary: 14 commands, 3 logs, 6h 15m, ~85K tokens\n  3. Archives to: reports/2026/05/13/track_core2_20260513.md\n  4. Clears active_tracker in context.md", type: "sys" },
      { text: "Exit: ✅ Session sealed. Duration: 6h 15m. Archived to reports/2026/05/13/", type: "ok" }
    ],
    note: "Normal sealing of a productive session.",
    noteType: "info"
  },
  {
    title: "Scenario B — Empty Session",
    cmd: '/wbStopTrack .',
    logs: [
      { text: "Input:  /wbStopTrack .\nState:  Active tracker with no commands (opened but never used)", type: "ctx" },
      { text: "Result:\n  1. Seals the tracker\n  2. Summary: 0 commands, 0 logs, 0 duration\n  3. Archives normally", type: "sys" },
      { text: "Exit: ✅ Session sealed. Duration: 0m. (No commands were executed.)", type: "ok" }
    ],
    note: "Sealing an empty tracker.",
    noteType: "info"
  },
  {
    title: "Scenario C — No Active Session",
    cmd: '/wbStopTrack .',
    logs: [
      { text: "Input:  /wbStopTrack .\nState:  No active tracker (either never started or already sealed)", type: "ctx" },
      { text: "Exit: ❌ No active session. Use /wbTrack to start one.", type: "error" }
    ],
    note: "Attempting to seal when no active session exists.",
    noteType: "error"
  },
  {
    title: "Scenario D — Work in Progress",
    cmd: '/wbStopTrack .',
    logs: [
      { text: "Input:  /wbStopTrack .\nState:  Active tracker, /wbWork task is currently executing", type: "ctx" },
      { text: "⚠️ Warning: Active work detected (task 3 in progress). The seal will not interrupt the running task, but its output will not be captured in this session's tracker.\n\nProceeds with sealing on confirmation.", type: "warn" }
    ],
    note: "Gracefully handles background execution.",
    noteType: "warning"
  },
  {
    title: "Scenario E — Multiple Sessions",
    cmd: '/wbStopTrack .',
    logs: [
      { text: "Input:  /wbStopTrack .\nState:  First session already archived as track_core2_20260513.md", type: "ctx" },
      { text: "Result:\n  Archives as: track_core2_20260513_2.md", type: "sys" },
      { text: "Exit: ✅ Session sealed. This is session #2 for today.", type: "ok" }
    ],
    note: "Auto-increments the file name to avoid overwriting today's earlier session.",
    noteType: "info"
  }
];
</script>

## 4. Output Scenarios

<LiveDemoAnimation command="wbStopTrack" titleSuffix="Exhaustive Simulation" :pipelines="stopTrackSimPipelines" />

---

## 5. Summary Block Schema

The generated summary follows a fixed format:

```markdown
## Session Summary
- Duration: <HH>h <MM>m
- Commands executed: <N>
- Tasks completed: <N> of <total>
- Log entries: <N>
- Estimated token usage: ~<N>K tokens
- Files modified: <N>
```

| Field | Calculation |
|---|---|
| Duration | Last timestamp minus first timestamp |
| Commands executed | Count of `[TRACK]` entries |
| Tasks completed | Count of `✅` in linked plans (if any) |
| Log entries | Count of `[LOG]` entries |
| Token usage | Sum of cost estimates from track entries |
| Files modified | Unique file paths mentioned in track entries |

---

## 6. Post-Seal State

After `/wbStopTrack` completes:

| Property | State |
|---|---|
| Active tracker path | `null` (cleared in context.md) |
| Archived file | Immutable — no command will modify it |
| Next `/wbTrack` call | Creates fresh tracker file |
| Next `/wbLog` call | ❌ Rejected until new `/wbTrack` session starts |
| Next `/wbStandup` call | Reads archived file as historical data |

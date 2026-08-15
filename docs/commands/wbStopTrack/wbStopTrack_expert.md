# /wbStopTrack — Expert Architecture

> The session finalizer that transforms an open-ended tracker into a sealed, archivable record.

---

## 1. Architectural Position

`/wbStopTrack` is the **terminal node** in the session lifecycle. It transitions a tracker from "active" to "archived" state — a one-way operation that cannot be reversed.

| Property | Value |
|---|---|
| **Role** | Session Finalizer |
| **Classification** | Mechanical (summary generation is formulaic, not analytical) |
| **Input** | Folder path |
| **Output** | Sealed tracker + summary block |
| **Side effects** | Archives file, clears active-tracker reference |
| **Reversibility** | None — once sealed, the tracker cannot be reopened |

---

## 2. Seal Protocol

The finalization follows four invariant steps:

### Step 1: Append Seal Marker

```markdown
--- SESSION FINALIZED ---
Sealed at: 2026-05-13 18:30:00
```

The marker is a horizontal rule followed by the exact text `SESSION FINALIZED`. This serves as a machine-readable boundary — any tool scanning for active vs. archived trackers checks for this marker.

### Step 2: Generate Summary Block

The summary is calculated from the tracker's content:

| Metric | Source |
|---|---|
| Duration | Difference between first and last timestamp in the file |
| Commands executed | Count of `[TRACK]` entries |
| Tasks completed | Count of completed checkbox items (`✅`) in linked plan files |
| Log entries | Count of `[LOG]` entries |
| Estimated cost | Sum of cost estimates from `[TRACK]` entries (if present) |

### Step 3: Archive the File

The sealed tracker is moved (not copied) to its canonical location:

```
.wb/workflows/reports/YYYY/MM/DD/track_<target>_<YYYYMMDD>.md
```

If a file already exists at that path (e.g., from a previous session on the same day), a numeric suffix is appended: `track_<target>_<YYYYMMDD>_2.md`.

### Step 4: Clear Active Reference

The `active_tracker` field in `.wb/workflows/context.md` is set to `null`, signaling that no session is in progress.

---

## 3. State Transitions

```
/wbTrack       →  Tracker: ACTIVE    →  Accepts /wbLog, /wbTrack appends
/wbStopTrack   →  Tracker: SEALED    →  Rejects /wbLog, rejects /wbTrack appends
/wbTrack       →  New Tracker: ACTIVE →  Fresh file, new session
```

The lifecycle is strictly linear: open → active → sealed. There is no "paused" state and no way to reopen a sealed tracker.

---

## 4. Interaction with Other Commands

| Command | Behavior After `/wbStopTrack` |
|---|---|
| `/wbLog` | ❌ Rejected — "Session is finalized" |
| `/wbTrack` | ✅ Creates new tracker (new session) |
| `/wbStandup` | ✅ Reads archived tracker as historical data |
| `/wbStopTrack` (again) | ❌ Rejected — "No active session" |

---

## 5. Edge Cases

| Scenario | Behavior |
|---|---|
| No active tracker | ❌ Rejected — "No active session. Use `/wbTrack` first." |
| Tracker is empty (no entries) | ✅ Sealed with summary showing 0 commands, 0 duration |
| Multiple sealed files on same day | Appends numeric suffix: `_2.md`, `_3.md` |
| `/wbStopTrack` during active `/wbWork` | ⚠️ Warning — "Active work detected. Seal anyway? This will not interrupt the work." |

---

## 6. Design Rationale

**Why one-way sealing instead of a "pause/resume" model?**

Because sessions are cognitive boundaries, not technical ones. Pausing implies you'll return to the exact same mental context — which never happens in practice. A fresh tracker on resume is more honest: it forces you to re-orient via `/wbContext` and `/wbStandup` rather than pretending continuity.

**Why move instead of copy?**

To enforce the single-source-of-truth principle. If both the active and archived copies existed, any tool scanning for "active sessions" could find a stale reference. Move eliminates the ambiguity.

What `wb-flow-docs`'s playbook gets wrong about `/wbStopTrack`: treating session sealing as an optional cleanup step, when the Claude edition enforces one-way sealing as a cognitive-boundary mechanism. Pausing implies you return to the same mental context — which never happens. A fresh tracker on resume forces honest re-orientation via `/wbContext` and `/wbStandup`.

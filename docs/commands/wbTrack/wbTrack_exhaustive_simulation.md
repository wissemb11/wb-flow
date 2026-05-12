# wb-flow Protocol: /wbTrack Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbTrack` command. It serves as the definitive reference for how the agent monitors session activity, writes to the `reports/YYYY/MM/DD` structure, and enforces the Smart Merge protocol.

---

## 1. Role & Definition Matrix
**Role:** The Session Logger & Workflow Footprinter
**Target:** Records daily AI interactions, completed tasks, and architectural decisions into the universal tracker.
**Core Protocol:** Strict adherence to "Smart Merge". It must never overwrite an existing daily track file. It reads the existing file, deduplicates new findings, and intelligently appends them.

| Scenario | System Behavior |
|---|---|
| Target is Active Directory | **[PROCEED]** Analyzes git diffs, chat logs, and active plans to summarize recent activity. |
| Target is Date Range | **[PROCEED]** Compiles historical track files into a macroscopic summary. |
| Tracker Doesn't Exist | **[PROCEED]** Creates the missing `YYYY/MM/DD` folder structure and initializes `track_report.md`. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbTrack` relies on temporal logic to append and retrieve logs.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| No Argument | `Command: /wbTrack` | Defaults to today's date and current directory. | Appends the last 2 hours of work to today's track file. |
| Specific Date | `Command: /wbTrack -d="2026-05-01"` | Locks onto a historical date. | Retrieves or retroactively writes to May 1st's track file. |
| Directory Path | `Command: /wbTrack packages/wb-core` | Locks scope to the package. | Generates a package-specific track entry. |
| Wildcard Glob | `Command: /wbTrack apps/*` | Aggregates logs across consumers. | Creates a massive multi-app daily summary. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--date="<YYYY-MM-DD>"`| `-d` | Targets a specific date directory instead of today. | `Command: /wbTrack -d="2026-04-29"` | `[DATE] Loading track data from reports/2026/04/29/.` |
| `--sync` | `-s` | Forces a hard sync between the `git diff` and the `track_report.md` to capture manual user changes. | `Command: /wbTrack -s` | `[SYNC] Found 14 unlogged commits. Injecting into today's track.` |
| `--merge` | `-m` | Explicitly triggers the Smart Merge protocol to resolve duplicated log entries. | `Command: /wbTrack -m` | `[MERGE] Deduplicated 3 redundant 'Task 1 Completed' entries.` |
| `--dry-run` | `-D` | Generates the track summary in the console without writing to disk. | `Command: /wbTrack -D` | `[DRY-RUN] Would append 12 lines to track_report.md.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "End of Day Sync" (`apps/* -s -m`)
**Context:** The developer is logging off. They want the agent to scan all apps, merge all manual and AI changes, and write a perfectly deduplicated daily track report.
**Command Executed:** `/wbTrack apps/* -s -m`
**Simulated Protocol Chain:**
1. Resolves all apps in scope.
2. Cross-references git history and active chat memory (`-s`).
3. Reads existing `reports/2026/05/04/track_report.md`.
4. Executes Smart Merge (`-m`) to prevent rewriting what was tracked this morning.
5. Appends the new afternoon block.
**Simulated Output:**
```markdown
> Command: /wbTrack apps/* -s -m

[SYSTEM] Initiating End of Day Sync...
[SYNC] Extracted 4 manual commits and 2 AI task completions.
[MERGE] Reading existing track_report.md...
[MERGE] Stripped 1 redundant entry.
[TRACK] Appended new block to reports/2026/05/04/track_report.md.
[SUCCESS] Day tracked successfully.
```

### 💠 The "Historical Audit" (`-d="2026-04-29" -D`)
**Context:** The developer wants to know exactly what happened last week without altering any files.
**Command Executed:** `/wbTrack -d="2026-04-29" -D`
**Simulated Output:**
```markdown
> Command: /wbTrack -d="2026-04-29" -D

[SYSTEM] Accessing historical archive...
[DATE] Parsed reports/2026/04/29/track_report.md.
[DRY-RUN] Summary of 2026-04-29:
- Completed Epic #42 (JWT Handshake)
- Pushed 3 hotfixes to wbc-ui.com.
[SUCCESS] Read-only execution complete.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Merge Conflict | User manually edited `track_report.md` simultaneously. | `⚠️ Warning: Write conflict. Appending new data as an unsynced block.` |
| Invalid Date Format | User runs `-d="Yesterday"`. | `❌ Error: Date must be YYYY-MM-DD format.` |
| Missing History | User requests `-d="2020-01-01"` (Before project existed). | `⚠️ Warning: No reports directory found for 2020/01/01.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

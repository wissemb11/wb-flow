# /wbTrack: Practical Guide 🛠️

## Quick Start

```bash
/wbTrack packages/wb-core # start tracking (create or join today's file)
/wbTest wb-core # creates report + §N *(Your Model — HH:MM)* in session
/wbAudit wb-core # creates report + §N *(Your Model — HH:MM)* in session
/wbStopTrack # §STOP for your model (file stays open for others)
```

## The Rule of Two Outputs

When tracking is ON, every command produces **two things**:

| Output | Location | Purpose |
|---|---|---|
| **Report file** | `reports/<date>/<type>/<type>_<target>_<date>.md` | Structured data, scanned tomorrow |
| **§N in session** | `walkthroughs/<date>/session_<target>_<date>.md` | Narrative with commentary (shared by all models) |

When tracking is OFF, only the report is created.

## Create vs Append

| Situation | Behavior |
|---|---|
| First model today runs `/wbTrack` | **Creates** the file + writes §0 |
| Later model runs `/wbTrack` same scope | **Appends** contributor entry to existing file |
| Any model runs `/wb*` while tracking | **Appends** §N tagged with model name + time |

## Scoping Cheat Sheet

| You type | Session file lives at | §0 reads |
|---|---|---|
| `/wbTrack packages/wb-core` | `wb-core/.agents/workflows/walkthroughs/<date>/session_wb-core_<date>.md` | wb-core code + reports |
| `/wbTrack` | `core2/.agents/workflows/walkthroughs/<date>/session_core2_<date>.md` | All packages |

## Common Mistakes

❌ Expecting a `<model>/` subfolder under `walkthroughs/` → there is none in v2
❌ Expecting reports to go to `walkthroughs/` → they always go to `reports/`
❌ Using `/wbTrack` for a single command → overkill, just run the command
❌ Running `/wbStopTrack --finalize` mid-day → extracts partial derivatives (wait until end of day)

## When NOT to Track

- Quick one-off `/wbTest` or `/wbGit`
- Commands you've run dozens of times
- When you don't need commentary (just the facts)

## Re-running on a track file (limited self-correct)

As of 2026-05-09, `/wbTrack` joins the dual-mode club — pass it a track file instead of a scope folder, and it runs in **verify-and-repair** mode:

```bash
/wbTrack packages/wb-core # NORMAL — create or join today's file
/wbTrack <path>/track_wb-core_20260509.md # SELF-CORRECT — verify the existing file
```

**Limited** because track files are append-only multi-model narratives. Self-correct will check §N order, model-tag formatting, footer presence, link integrity, status freshness, and auto-repair bare `/wbX` in `Recommended Next` tables — but it will **not** rewrite the body of any §N (that would let one model overwrite another's reasoning, breaking the audit trail). Broken links inside §N bodies are flagged in a `## ⚠️ Self-Correct Findings` section near the bottom; the original author of the §N may hand-edit to fix mechanical bugs, while a different model wanting to disagree appends a new §N+1 instead.

See [`../../concepts/self_correct_mode`](../../concepts/self_correct_mode.md) for the full dual-mode protocol shared by all `/wbX` commands.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbTrack --execute` and `/wbTrack -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--finalize` | `-f` |
| `--scope` | `-s` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

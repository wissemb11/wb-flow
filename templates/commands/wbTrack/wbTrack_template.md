# /wbTrack — Session Tracking (v2: Universal Daily Session)


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbTrack`

# /wbTrack: Practical Guide 🛠️ (Claude version)

## Quick Start

```bash
/wbTrack packages/wb-core    # start tracking (create or join today's file)
/wbTest wb-core               # creates report + §N *(Your Model — HH:MM)* in session
/wbAudit wb-core              # creates report + §N *(Your Model — HH:MM)* in session
/wbTrack --stop               # §STOP for your model (file stays open for others)
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
| `/wbTrack packages/wb-core` | `wb-core/.wb/workflows/walkthroughs/<date>/session_wb-core_<date>.md` | wb-core code + reports |
| `/wbTrack` | `core2/.wb/workflows/walkthroughs/<date>/session_core2_<date>.md` | All packages |

## Common Mistakes

❌ Expecting a `<model>/` subfolder under `walkthroughs/` → there is none in v2
❌ Expecting reports to go to `walkthroughs/` → they always go to `reports/`
❌ Using `/wbTrack` for a single command → overkill, just run the command
❌ Running `/wbTrack --stop --finalize` mid-day → extracts partial derivatives (wait until end of day)

## When NOT to Track

- Quick one-off `/wbTest` or `/wbGit`
- Commands you've run dozens of times
- When you don't need commentary (just the facts)

> For deeper reading: [`docs_claude/commands/wbTrack/wbTrack_practical_claude.md`](../../docs/docs_claude/commands/wbTrack/wbTrack_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--finalize` | `-f` |
| `--scope` | `-s` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbTrack <scope_folder>           # normal mode — produce a fresh output file
/wbTrack <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbTrack` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-f` → `--finalize`
- `-s` → `--scope`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **Command #25** in the `/wb*` suite
> **Purpose**: Toggle session tracking ON. Every `/wb*` command produces its normal report AND gets logged into a **universal daily session file** with strategic commentary.
> **Companion**: `/wbTrack --stop` ends this model's tracking and writes a §STOP block.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — every §N section appended to the session file MUST follow the relative-link rule (§1) and full-syntax-command rule (§2). Self-correct mode (§3) applies in a **limited** form: see the Detection block below — gap-fill only, never rewrites existing §N bodies.

---

## Convention Notes for Session Entries

When writing each §N section to the session file:

- **Relative links (§1):** Every `Files read`, `Files created/modified`, and `Report file` reference MUST be a relative markdown link computed from the session file's directory. Plain-text paths are forbidden.
- **Full-syntax commands (§2):** The `# §N — \`/wbCommand target [flags]\`` heading and every entry in the `Recommended Next` table MUST use the full invocable form (e.g., `/wbTest packages/wb-core --scope=task-1`, not bare `/wbTest`).
- **Limited self-correct on the session file itself:** Re-running `/wbTrack` on an existing track file (when the path is passed *as the argument*, not as the scope) triggers the Detection block below — verify-and-repair only. Re-running `/wbTrack` on the *scope folder* still appends a new contributor entry (§N) and never rewrites previous entries.

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

**Trigger:** `$ARGUMENTS` resolves to a file (not a folder) AND that file's first H1 matches:

```
# Track: <scope> — <YYYY-MM-DD>
```

When triggered, switch from "create / append contributor" mode to **verify-and-repair mode**. Behavior is governed by [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3, with these track-specific gap-fills.

### What track self-correct CHECKS

1. **§N order:** sections numbered §0, §1, §2, … with no gaps. Flag (do not renumber) if a §N is missing — could be intentional from another model.
2. **Model-tag formatting:** every `# §N — ... *(<Model> — <HH:MM>)*` heading has both model name and time in italics+parens.
3. **Footer present:** the `## 📂 Generated Files (<YYYYMMDD>)` block exists at the bottom with at least the Base Reference Files table.
4. **Link integrity:** every relative markdown link in the file resolves to an actual on-disk file from the session file's directory. Broken links → list them under a `## ⚠️ Self-Correct Findings` section near the bottom (do NOT edit the original §N bodies — see "What it does NOT do" below).
5. **Bare /wbX in `Recommended Next` tables:** expand to full-syntax `/wbX <target> [flags]` per §2 of output_conventions.
6. **Plain-text file references in `Files read` / `Files created`:** convert to relative markdown links per §1.
7. **Status freshness:** if the front-matter `> **Status:**` is `🟢 ACTIVE` but the most recent §N is > 24h old, change to `🟡 STALE` and note the lag in `## ⚠️ Self-Correct Findings`.

### What track self-correct does NOT do

- Does NOT rewrite the body text of any §N (preserve each model's voice and audit trail).
- Does NOT add or delete §N sections.
- Does NOT change the §0 strategic vision content.
- Does NOT re-run `/wbStandup` or any sub-command (no new analysis).
- Does NOT delete broken-link references — only flags them in the Findings section.

### Where self-correct WRITES

Append (or update if it exists) a **single section** at the bottom of the file, just above the `## 📂 Generated Files` footer:

```markdown
## ⚠️ Self-Correct Findings *(<Model> — <YYYY-MM-DD HH:MM>)*

**Verified:** §N order, model-tag formatting, footer present (✅ all clean) OR list specific issues found.

**Auto-repaired:**
- bare `/wbX` → full-syntax in §<N> "Recommended Next" table (rows: …)
- plain-text path `<old>` → relative link `[<text>](<rel>)` in §<N>

**Flagged (NOT auto-repaired — needs human decision):**
- Broken link in §<N>: `<bad-link>` → no file at resolved path `<resolved>`
- §<N> missing model tag — last edited by ?

> _Self-corrected: <YYYY-MM-DD HH:MM> by <Model>_
```

If a previous self-correct run already wrote this section, **update it in place** (do not stack multiple Findings sections — the file is meant to grow §N entries, not Findings entries).

---

---

## How It Works

`/wbTrack` is a **toggle**, not a one-shot command. It changes the model's behavior for the rest of the session.

| State | What happens when you run a `/wb*` command |
|---|---|
| **Tracking OFF** (default) | Command creates its report in `reports/<date>/<type>/<type>_<target>_<date>.md` (universal daily file). Nothing else. |
| **Tracking ON** (`/wbTrack` active) | Command creates its report **AND** appends a §N section to the **universal daily session file**. |

**Key principle:** Commands always produce their normal reports. Tracking is an **addition**, never a replacement.

### v2: One File Per Day Per Scope

In v2, **all models share a single session file per day**. There is no `<model>/` subfolder under `tracks/`.

| v1 (old) | v2 (current) |
|---|---|
| `tracks/<date>/<model_slug>/track_<target>_<timestamp>.md` | `tracks/<date>/track_<target>_<date>.md` |
| One file per model per session | **One file per day per scope, all models contribute** |
| 4 models = 4 files + 24 derivatives | 4 models = **1 file** + 6 derivatives |

---

## Scoping Rules

### Syntax
```bash
/wbTrack <target>       # scoped to a specific package/app
/wbTrack                # scoped to the monorepo root (core2)
```

### What the target arg controls

| | `/wbTrack packages/wb-core` | `/wbTrack` (no args) |
|---|---|---|
| **§0 reads** | wb-core's source, reports, `.agents/` | Monorepo-wide state |
| **Session file lives in** | `packages/wb-core/.wb/workflows/tracks/` | `.wb/workflows/tracks/` (core2 root) |
| **Best for** | Focused session on one package | Cross-package session |

### One session at a time (per model)

If tracking is already active for this model:
```
/wbTrack packages/wb-dataviewer

⚠️ Already tracking: core2
   Run /wbTrack --stop first, then start a new session.
```

You cannot run two `/wbTrack` sessions in parallel from the same model. Stop the current one before starting another.

### Multi-model sessions (v2 change)

Multiple **different** models can track the **same scope on the same day**. They all contribute to the same file:

```
Model A (Opus 4.7 via Cline):    /wbTrack core2  → creates session file + writes §0
Model B (Gemini 3.1 Pro via AG):  /wbTrack core2  → file exists → appends contributor entry
Model C (DeepSeek V4 via OC):     /wbTrack core2  → file exists → appends contributor entry
```

But each model can only track **one scope at a time**. Model A tracking `core2` cannot also start tracking `wb-core` — it must `/wbTrack --stop` first.

### Different scopes are different files

Different models tracking different scopes write to **different files** — this is fine:
```
Model A tracks core2:    → core2/.wb/workflows/tracks/20260429/track_core2_20260429.md
Model B tracks wb-core:  → packages/wb-core/.wb/workflows/tracks/20260429/track_wb-core_20260429.md
```

### Cross-package work during a session

If you're tracking `wb-core` and run `/wbTest packages/wb-dataviewer`:
- The **test report** goes to `packages/wb-dataviewer/.wb/workflows/reports/.../tests/` (normal behavior — report always goes to the target package)
- The **§N section** gets appended to the wb-core session file (because wb-core is the active tracking target)

This is fine — the session file is a narrative of what **you did**, not where the reports land.

---

## 🚀 The /wbTrack Prompt (copy to model ↓)

```
━━━━━━━━━━━━━ /wbTrack v2 ━━━━━━━━━━━━━

📁 TARGET: __TARGET_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__ (Cline / Antigravity / OpenCode / Gemini CLI / etc.)

━━━ TRACKING MODE ACTIVATED ━━━

From this point forward, you are in session tracking mode.

1. LOCATE the universal session file at:
   __TARGET_PATH__/.wb/workflows/tracks/__TODAY_YYYY__/__TODAY_MM__/__TODAY_DD__/track___TARGET_NAME_____TODAY_YYYY__/__TODAY_MM__/__TODAY_DD__.md

   NOTE: `tracks/` is a SIBLING of `reports/`, NOT inside it.
   NOTE: There is NO `<model_slug>/` subfolder — one file per day per scope.

2. CHECK if the file already exists:

   ┌─────────────────────────────────────────────────────────────┐
   │ FILE DOES NOT EXIST → CREATE (you are the first model today)│
   └─────────────────────────────────────────────────────────────┘

   Create the file with this header:

   # Track: __TARGET_NAME__ — __TODAY__

   > **Target:** Monorepo root (`frontEnd/wbc-ui/__TARGET_PATH__/`)
   > **Created by:** __YOUR_MODEL_NAME__ via __YOUR_CLIENT__
   > **Started:** __TODAY__ __CURRENT_TIME__
   > **Status:** 🟢 ACTIVE

   ---

   Then write §0 — your strategic vision BEFORE I give you any commands:

   # §0 — Strategic Vision *(__YOUR_MODEL_NAME__ — __CURRENT_TIME__)*

   ## Current State
   [Read the package/app source code, .wb/workflows/ files, and past reports.
   Summarize: What is the current state of this target? What was done before?
   What is broken, pending, or deferred?]

   ## Past Debt: `/wbStandup __TARGET_NAME__` output
   **MANDATORY:** Execute `/wbStandup __TARGET_NAME__` as a sub-command RIGHT NOW.
   Paste its FULL output below — do NOT summarize, do NOT reference a report file.
   This gives subsequent models the complete context without needing to re-run standup.

   ```
   [PASTE FULL /wbStandup OUTPUT HERE]
   ```

   ## My Recommendation
   [If you were working on this package today, what would YOU do?
   Prioritize based on: blockers first, then technical debt, then new features.
   List 5-8 commands in recommended order with reasoning.
   **For each recommendation, specify 2-3 models** from `commands/model_recommendations.md`, ordered best → budget.]

   ## Suggested Command Sequence

   | Order | Command | Why | Recommended Models (ordered) | Alternatives |
   |---|---|---|---|---|
   | 1 | `/wbStandup __TARGET_NAME__` | Resume from last session | ⚡ Gemini 3 Flash / DeepSeek V4 Flash | `/wbContext` if no prior session |
   | 2 | `...` | `...` | 💻 Model1 / Model2 / Model3 | `...` |
   | ... | | | | |

   ## First Command

   **Recommended:** `/wbXxx __TARGET_NAME__ [flags]`
   **Recommended Model:** `Model1 (1st) / Model2 (2nd)` — [why this model for this task]
   **Why this first:** [1-2 sentences]
   **Alternative:** `/wbYyy __TARGET_NAME__` — [why this is also valid]

   > [!NOTE]
   > This is my suggestion. You decide what to run. Tell me your first command.

   ┌─────────────────────────────────────────────────────────────┐
   │ FILE ALREADY EXISTS → APPEND (another model started today) │
   └─────────────────────────────────────────────────────────────┘

   Read the existing session file. Determine the next §N number.
   Append a contributor entry:

   ---

   # §N — Contributor Entry *(__YOUR_MODEL_NAME__ via __YOUR_CLIENT__ — __CURRENT_TIME__)*

   > **Model:** __YOUR_MODEL_NAME__
   > **Client:** __YOUR_CLIENT__
   > **Joined:** __TODAY__ __CURRENT_TIME__

   ## My Assessment
   [Read the existing session file + current source code state.
   What has changed since the last entry? What do you see differently?
   Agreement/disagreement with previous §0 or §N recommendations.]

   ## My Recommendation
   [If you were continuing this session, what would you do next?
   How does your view differ from the previous contributor(s)?]

   ## Suggested Next Steps

   | Priority | Command | Why | Recommended Models (ordered) | Alternative |
   |---|---|---|---|---|
   | 🔴 1st | ... | ... | ... | ... |
   | 🟡 2nd | ... | ... | ... | ... |

   > [!NOTE]
   > This is my perspective. Previous contributors may have different priorities.

3. For EVERY /wb* command I give you:

   a) Execute the command normally and create its report in the universal daily file:
      __TARGET_PATH__/.wb/workflows/reports/__TODAY_YYYY__/__TODAY_MM__/__TODAY_DD__/<type>/<type>___TARGET_NAME_____TODAY_YYYY__/__TODAY_MM__/__TODAY_DD__.md

   b) THEN append a §N section to the universal session file in this exact format:

   # §N — `/wbCommandName target [flags]` *(__YOUR_MODEL_NAME__ — __CURRENT_TIME__)*

   ## What the user did

       /wbCommandName target [flags]

   **What the user wants:** [1-2 sentences]

   ## What happened

   ### Files read (input)
   [List files you read]

   ### Files created/modified (output)
   | File | Action | What it contains |
   |---|---|---|

   ### Report file
   [Path to the report entry in reports/<date>/<type>/<type>_<target>_<date>.md — specify Entry #N]

   ## Commentary

   - **Outcome:** (What went well / What went wrong / Final result)
   - **Insights:** (Lesson learned / Key finding / Self-correction note)
   - **Decisions:** (Why this command now / Why this matters / What was NOT produced)
   - **Status:** (Conclusion / Current state)
   - **Next Step:** (Next step used / Next meaningful step)

   > [!TIP/WARNING/IMPORTANT]
   > [High-value strategic callout]

   ## Recommended Next

   | Priority | Command | Why | Recommended Models (ordered) | Alternative |
   |---|---|---|---|---|
   | 🔴 1st | `/wbXxx target` | [reason based on what just happened] | 💻 Model1 / Model2 | `/wbYyy target` |
   | 🟡 2nd | `/wbZzz target` | [reason] | ⚡ Model1 / Model2 | — |
   | 🟢 3rd | `/wbAaa target` | [reason] | 💻 Model1 / Model2 | — |

4. You are NOT a passive logger. You are a strategic agent:
   - Analyze outcomes: say WHY it matters, not just what happened
   - Provide vision: compare what the AI saw vs. what is actually true
   - Decide next steps: if a command reveals a critical issue, suggest course correction
   - After EVERY section, suggest what comes next (the "Recommended Next" table)

━━━ AUTO-APPEND FOOTER ━━━

At the VERY END of the file (after "What's Next?"), you MUST append the `## 📂 Generated Files (__YYYYMMDD__)` cross-link footer. Do NOT use simple tables. You MUST use the rich "Tier 1" layout from `_shared/output_conventions.md` §5.

Format required:
```markdown
---
## 📂 Generated Files (__YYYYMMDD__)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files
| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`core2/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```
```

---

## Variables to Replace

| Variable | Description | Example |
|---|---|---|
| `__TARGET_PATH__` | Path to the package or app | `packages/wb-core` |
| `__TODAY__` | Today's date (YYYY-MM-DD) | `2026-04-29` |
| `__TODAY_YYYY__/__TODAY_MM__/__TODAY_DD__` | Today's date (no dashes) | `20260429` |
| `__YOUR_MODEL_NAME__` | Model running the session | `DeepSeek V4 Pro` |
| `__YOUR_CLIENT__` | AI client/tool being used | `Antigravity` / `Cline` / `OpenCode` / `Gemini CLI` |
| `__MODEL_SLUG__` | Lowercase model name for report folder paths | `deepseek-v4-pro` |
| `__TARGET_NAME__` | Short name for filenames | `wb-core` |
| `__CURRENT_TIME__` | Current time (HH:MM) | `22:38` |

---

## Directory Structure

```
.wb/workflows/
├── reports/                               ← command outputs (scanned by /wbStandup, /wbPlan, etc.)
│   └── 20260429/
│       ├── tests/deepseek-v4-pro/test_wb-core_unit_*.md        ← from /wbTest
│       ├── plans/gemini-3.1-pro/plan_wb-core_*.md              ← from /wbPlan
│       ├── audits/opus-4.7/audit_wb-core_*.md                  ← from /wbAudit
│       └── standups/gemini-3.1-pro/standup_wb-core_*.md        ← from /wbStandup
│
└── tracks/                          ← session narratives (universal daily file)
    └── 20260429/
        ├── track_wb-core_20260429.md              ← ONE file, ALL models contribute
        ├── track_wb-core_20260429_tips.md          ← derivative (all models' tips)
        ├── track_wb-core_20260429_warnings.md
        ├── track_wb-core_20260429_importants.md
        ├── track_wb-core_20260429_commentaries.md
        ├── track_wb-core_20260429_all_commands.md
        └── track_wb-core_20260429_resume.md
```

### The Key Principle

| Folder | Contains | Scanned by | Purpose |
|---|---|---|---|
| `reports/<date>/<type>/<type>_<target>_<date>.md` | Structured command outputs (universal daily file) | `/wbStandup`, `/wbContext`, `/wbPlan`, `/wbAudit` | Data for automation |
| `tracks/<date>/` | Universal session narrative | Humans, future sessions, all models | Audit trail + learning |

**Reports** = what happened (facts, scores, file lists).
**Walkthroughs** = why it happened (analysis, decisions, recommendations) — **from all models' perspectives**.

---

## Best Practice: Daily Session Pattern

The recommended workflow is: **one universal session file per day per scope, contributed to by all models**.

```
Morning (Model A — Opus 4.7 via Cline):
  /wbTrack                              ← creates file + writes §0

Mid-day (Model B — Gemini 3.1 Pro via Antigravity):
  /wbTrack                              ← file exists → appends contributor entry
  /wbPlan wb-core                       ← report + §N (tagged as Gemini)
  /wbTest wb-core                       ← report + §N (tagged as Gemini)
  /wbTrack --stop                       ← §STOP for Gemini

Evening (Model C — DeepSeek V4 via OpenCode):
  /wbTrack                              ← file exists → appends contributor entry
  /wbRefactor wb-core src/WBC.js        ← report + §N (tagged as DeepSeek)
  /wbTrack --stop --finalize            ← §STOP for DeepSeek + extract derivatives
  /wbGit                                ← commit everything
```

This gives you a **single daily narrative** with contributions from all models — like a relay journal. Tomorrow, `/wbStandup` scans `reports/` for the facts, and you can read the session file for the multi-model story.

---

## When to Use /wbTrack

| Situation | Use /wbTrack? |
|---|---|
| Starting a full day's work with a model | ✅ Yes — run once at the start |
| Long session with 5+ commands | ✅ Yes — you want a trail |
| Learning a new package | ✅ Yes — commentary helps future you |
| Documenting a workflow for the team | ✅ Yes — produces shareable session files |
| Quick one-off command (e.g., `/wbTest`) | ❌ No — just run the command |
| Running `/wbGit` at end of day | ❌ No — no need to track a commit |
| Model already verified via `/wbCheck` | ✅ Optional — `/wbTrack` adds value independently |

---

## Relationship with Other Commands

| Command | Relationship |
|---|---|
| `/wbCheck` | Independent. `/wbCheck` verifies the model. `/wbTrack` logs the session. You can use either or both. |
| `/wbStandup` | Scans `reports/` — unaffected by tracking. Session files live in `tracks/`. |
| `/wbPlan` | Creates plan in `reports/plans/`. If tracking is ON, §N documents the plan creation. |
| `/wbTest` | Creates test report in `reports/tests/`. If tracking is ON, §N documents the test results. |
| `/wbTrack --stop` | Ends tracking **for this model**. Optionally extracts derivatives with `--finalize`. |

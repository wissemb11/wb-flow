---
title: "wbTrack — Examples"
description: "Scenario: Day 2 session on wb-core with the AI agent."
---

# /wbTrack — Examples

> `/wbTrack` is the session logger. It watches every `/wb*` command and documents what happened, why, and what should come next. Reports still go to `reports/`. The narrative goes to `walkthroughs/`. **All models share one session file per day per scope.**

---

## /wbTrack vs other commands

| `/wbTrack` | `/wbCheck` | `/wbStandup` |
|---|---|---|
| "Log everything I do with commentary" | "Does the model understand my code?" | "What happened yesterday?" |
| Toggle ON/OFF during session | One-shot quiz | One-shot scan |
| Produces session narrative in `walkthroughs/` | No files produced | Produces standup in `reports/` |
| Reads reports as they're created | Reads source code only | Reads past reports |
| **Shared file — all models contribute** | Per-model quiz | Per-model report |

---

## Example 1 — Scoped to a package: `/wbTrack packages/wb-core`

**Scenario:** Day 2 session on `wb-core` with the AI agent. You're the first model today.

**You type:**
```
/wbTrack packages/wb-core
```

**File check:** `walkthroughs/20260429/session_wb-core_20260429.md` does NOT exist → **CREATE**.

**Model writes §0 — Strategic Vision:**
```markdown
# Session: wb-core — 2026-04-29

> **Target:** `packages/wb-core`
> **Created by:** the AI agent via OpenCode
> **Started:** 2026-04-29 17:30
> **Status:** 🟢 ACTIVE

---

# §0 — Strategic Vision *(the AI agent — 17:30)*

## Current State
wb-core has 365 tests (13 failing). Day 1 closed 3 plans.
Audit score improved from 6.4 to 7.5. isNonEmpty mock bug unresolved.

## Past Debt: `/wbStandup wb-core` output
**[Executed `/wbStandup wb-core` as sub-command — full output below:]**

> ## wb-core — Standup 2026-04-29
> **Tests:** 365 total, 352 pass, 13 fail (same 3 files as Day 1)
> **Audit Score:** 7.5/10 (up from 6.4)
> **Completed:** 8/8 GLM-5.1 remediation tasks, renderObject.js refactor (-52% LOC)
> **Blockers:** isNonEmpty mock bug (root cause of 11/13 test failures)
> **Open Plans:** wb-press2 1/10 remaining, cookie forgery fix pending
> ...

## Suggested Command Sequence
| Order | Command | Why | Recommended Models (ordered) | Alternatives |
|---|---|---|---|---|
| 1 | `/wbStandup wb-core` | Resume from yesterday | ⚡ the agent Flash / the agent V4 Flash | — |
| 2 | `/wbTest wb-core` | Verify test state | 💻 Any model | — |
| 3 | `/wbDebug wb-core tests/renderObject...` | Fix root cause | 💻 the AI agent / the agent V4 | `/wbRefactor` |

## First Command
**Recommended:** `/wbStandup wb-core`
**Why this first:** See what Day 1 left unfinished.
```

**Then you work:**
```
/wbStandup wb-core → report in reports/standups/ + §1 *(the AI agent — 17:35)* in session
/wbTest wb-core → report in reports/tests/ + §2 *(the AI agent — 17:42)* in session
/wbStopTrack → §STOP for the AI agent
```

**Result:**
```
packages/wb-core/.agents/workflows/
├── reports/20260429/
│ ├── standups/deepseek-v4-pro/standup_wb-core_*.md ← /wbStandup can scan this tomorrow
│ └── tests/deepseek-v4-pro/test_wb-core_unit_*.md ← /wbTest report, scannable
│
└── walkthroughs/20260429/
 └── session_wb-core_20260429.md ← ONE file (§0, §1, §2, §STOP)
```

**What's worth noticing:**
- Reports and walkthroughs are in **separate folders**. `/wbStandup` tomorrow scans `reports/` and finds both the standup and test reports — the walkthrough doesn't interfere.
- No `<model_slug>/` subfolder under `walkthroughs/` — the file is shared.

---

## Example 2 — Multi-model relay (v2 key feature)

**Scenario:** Three models work on wb-core throughout the day. One file captures the full story.

**Morning — the AI agent creates the file:**
```
/wbTrack packages/wb-core ← file doesn't exist → CREATE + §0
/wbPlan wb-core ← §1 *(the AI agent — 09:15)*
/wbStopTrack ← §STOP for the AI agent
```

**Afternoon — the agent joins the existing file:**
```
/wbTrack packages/wb-core ← file exists → APPEND contributor entry (§2)
/wbTest wb-core ← §3 *(the AI agent — 14:30)*
/wbStopTrack ← §STOP for the agent
```

**Evening — the agent finishes the day:**
```
/wbTrack packages/wb-core ← file exists → APPEND contributor entry (§4)
/wbAudit wb-core ← §5 *(the agent V4 — 20:00)*
/wbStopTrack --finalize ← §STOP for the agent + extract ALL derivatives
```

**What's worth noticing:**
- All three models wrote to the **same file**: `session_wb-core_20260429.md`
- Each model's sections are clearly tagged with model name and time
- Only the last model used `--finalize` to extract derivatives from ALL contributions

---

## Example 3 — No scope: `/wbTrack` (monorepo-wide)

**Scenario:** Cross-package session — you'll work on `wb-core` then `wb-dataviewer`.

**You type:**
```
/wbTrack
```

**Model creates/appends** to `core2/.agents/workflows/walkthroughs/20260429/session_core2_20260429.md`.

**You work across packages:**
```
/wbTest packages/wb-core → report to wb-core/reports/tests/
 §N appended to core2 session file

/wbContext packages/wb-dataviewer → report to wb-dataviewer/reports/contexts/
 §N appended to core2 session file

/wbStopTrack
```

**What's worth noticing:**
- Reports go to each package's own `reports/` folder (normal behavior)
- The session narrative is centralized at the monorepo root
- Use this when you're doing cross-cutting work

---

## Example 4 — Second model joins (append behavior)

**Scenario:** You already tracked with the agent earlier today. Now you open the agent.

**You type:**
```
/wbTrack packages/wb-core
```

**File check:** `walkthroughs/20260429/session_wb-core_20260429.md` ALREADY EXISTS → **APPEND**.

**the agent reads the existing file, then appends:**
```markdown
---

# §4 — Contributor Entry *(the AI agent via Antigravity — 22:38)*

> **Model:** the AI agent
> **Client:** Antigravity (VS Code)
> **Joined:** 2026-04-29 22:38

## My Assessment
the AI agent completed the plan and the agent ran tests. The mock issue
persists. I agree with the agent's prioritization but disagree on model
choice for the debug task — the agent the agent excels at mock pattern analysis.

## My Recommendation
Focus on `/wbDebug` for the mock issue before any more refactoring.

## Suggested Next Steps
| Priority | Command | Why | Recommended Models (ordered) | Alternative |
|---|---|---|---|---|
| 🔴 1st | `/wbDebug wb-core tests/renderObject...` | Root cause | 💻 the AI agent | the agent V4 |
```

**What's worth noticing:**
- the agent **doesn't rewrite §0** — it adds a new §N contributor entry
- It can agree/disagree with previous models' recommendations
- The file now has contributions from multiple perspectives

---

## Example 5 — `/wbCheck` + `/wbTrack` combo (full ceremony)

**Scenario:** New model (GLM-5), first time on wb-core, long documented session.

```
Step 1: wbcheck wb-core ← terminal: generate quiz
Step 2: Paste to model ← model answers
Step 3: Grade → PASS → "yes" ← model verified
Step 4: /wbTrack packages/wb-core ← start tracking (create or append)
Step 5: /wbAudit wb-core ← report + §N *(GLM-5 — 10:30)*
Step 6: /wbPlan wb-core ← report + §N *(GLM-5 — 10:45)*
Step 7: /wbRefactor wb-core ← report + §N *(GLM-5 — 11:20)*
Step 8: /wbStopTrack ← §STOP for GLM-5
```

**Key:** `/wbCheck` and `/wbTrack` are independent. You can use one without the other:
- `/wbCheck` only → verify + work normally
- `/wbTrack` only → skip quiz, start logging directly
- Both → full ceremony (verify then track)

---

## Example 6 — No tracking at all (default)

**Scenario:** Quick one-off command.

```
/wbTest wb-core
```

Creates `reports/tests/modelA/test_*.md`. No session file. No walkthrough overhead.

**When to skip tracking:**
- One-off commands
- End-of-day `/wbGit`
- Commands you've run many times before

---

## The Dual Output Rule

This is the most important concept in `/wbTrack`:

```
/wbTest wb-core (tracking ON)
 │
 ├─► reports/tests/gemini-3.1-pro/test_*.md ← ALWAYS created
 │ (structured data, scanned by /wbStandup etc.)
 │
 └─► walkthroughs/.../session_wb-core_20260429.md → §N appended ← ONLY when tracking
 (narrative + commentary + recommended next, tagged with model name)
```

The report is the **fact**. The session section is the **story**. Both exist, neither replaces the other.

---

## Decision Matrix

| Goal | Commands |
|---|---|
| Quick task, no trail | Just `/wb*` directly |
| New model, verify first | `/wbCheck` → `/wb*` |
| Long session, want documentation | `/wbTrack` → `/wb*` → `/wbStopTrack` |
| New model + documented session | `/wbCheck` → `/wbTrack` → `/wb*` → `/wbStopTrack` |
| Cross-package work | `/wbTrack` (no args) → `/wb*` on any package → `/wbStopTrack` |
| Multi-model relay | Each model: `/wbTrack` → `/wb*` → `/wbStopTrack`. Last: `--finalize` |

---

## Basic Usage

```bash
# Standard command execution
/wbTrack frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbTrack deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbTrack` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbTrack target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbTrack target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbTrack target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbTrack packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbTrack apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbTrack` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbTrack frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

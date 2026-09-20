---
title: "wbStandup — Examples"
description: "Examples and output structures for daily progress tracking with wbStandup."
---

# /wbStandup — Examples

> Self-help. `/wbStandup` is the first command of the day. It tells you what was in flight when you stopped yesterday, and what needs attention before you pick a new task.

---

## What /wbStandup does

Scans `reports/` across the target scope and produces a structured report with four sections:

1. **Open plans** — `plan_*.md` files with unchecked tasks.
2. **Unresolved findings** — audit BLOCKERS, security CRITICAL, debug hypotheses that never got a fix.
3. **Stale reports** — files with `🔨 in progress` older than 24 hours (state rot).
4. **Suggested next action** — the AI's opinion on what to work on first.

It does not write code. It does not commit. It's pure state reconciliation.

---

## Example 1 — `/wbStandup core2/` (monorepo-wide morning standup)

```text
$ /wbStandup core2/

[AI] Scanning core2/.agents/workflows/reports/ ...
[AI] Scanning all packages'/.agents/workflows/reports/ ...
[AI] Reading last 7 days (2026-04-17 to 2026-04-24)...
[AI]
[AI] Writing reports/20260424/standups/standup_core2_202604240800.md:
```

```markdown
# Standup — core2 (2026-04-24 08:00)

## Open plans (2)

### plan_wbCodeSlot_202604231840 — @wbc/wb-core
- 4/5 tasks done, 3/5 validated
- Task 5 (prod-mode test coverage) failed review yesterday
- OWNER: you
- NEXT: finish task 5, re-run /wbReview

### plan_apiResponse_cache_fix_202604201030 — @wbc/wb-dataviewer
- 5/5 tasks done, 5/5 validated ✅
- Can be marked archive

## Unresolved findings (3)

### 🔴 BLOCKER — @wbc/wb-core audit 2026-04-23
- dist/ vs dist-dev/ mismatch
- Blocking next /wbRelease

### 🔴 BLOCKER — @wbc/wb-core audit 2026-04-23
- WBCode vs WBC.js gating divergence (`if (__WBC_DEV__)` vs `if (__WBC_DEV__ === true)`)

### 🟡 MAJOR — wbdataviewer2 audit 2026-04-23
- Hardcoded API URL in src/App.vue

## Stale reports (1)

### 🔨 plan_template_rewrite — 🔨 on task 2 since 2026-04-21 (3 days stale)
- Risk: status unclear. Verify before proceeding.

## Cross-cutting signal

- wb-press last touched 8 days ago. Likely safe to ignore today.
- @wbc/wb-core has the most open findings. Consider making it today's focus.

## Suggested next action

Close the two BLOCKERS in wb-core this morning. Then the release
queue is unblocked. The apiResponse_ plan can be archived in parallel.

Secondary option: finish Task 5 of plan_wbCodeSlot first if you want
to close one plan before opening blocker work.
```

```text
[AI] Standup written.
[AI] NEXT: /wbContext packages/wb-core to load the target package.
```

**What's worth noticing:**

- Open plans are enumerated with their state (4/5 done, 3/5 validated). This matches the plan file's checkbox state — makes it actionable at a glance.
- BLOCKERs from yesterday's audit are surfaced *on today's standup*. Without this, you'd open VSCode, forget the audit, and ship the broken thing.
- The 🔨 stale marker for plan_template_rewrite names the date and duration. 3-day stale is a soft flag — verify, don't assume.
- "Suggested next action" gives a recommendation but also names a secondary option. Preserves user autonomy.

---

## Example 2 — `/wbStandup packages/wb-dataviewer` (package-scoped)

Narrower scope. Good for afternoon re-orientations.

```text
$ /wbStandup packages/wb-dataviewer
```

```markdown
# Standup — @wbc/wb-dataviewer (2026-04-24 14:30)

## Open plans (1)

### plan_csv_export_202604221100
- 2/4 tasks done
- Task 3 (test the export) in flight
- NEXT: complete task 3

## Unresolved findings (1)

### 🟡 MAJOR — audit 2026-04-23
- Hardcoded API URL in src/App.vue

## Recent activity (last 3 days)

- 2026-04-22: new example Example_wbPress.vue added
- 2026-04-23: /wbAudit produced above finding
- 2026-04-23: /wbDeploy to local succeeded
- 2026-04-24: (nothing yet)

## Suggested next action

Fix the hardcoded URL finding before /wbDeploy again.
Task 3 of csv_export plan can proceed in parallel.
```

**What's worth noticing:**

- Package-scoped standup adds a "recent activity" section that wouldn't be useful at monorepo scope (too noisy). At package scope it's a lightweight timeline.
- Only 1 open plan, 1 finding. Narrow scope = less to reconcile.

---

## Example 3 — `/wbStandup` surface a problem you forgot

This is the most important value of the command. You didn't remember; the standup did.

```text
$ /wbStandup core2/
```

```markdown
## Unresolved findings (1)

### 🔴 CRITICAL — /wbSecure 2026-04-16 (8 days ago!)
- Hardcoded API key found in apps/wbdataviewer_github/src/deploy.js:14
- NOT YET ADDRESSED
- Recommendation: rotate the key TODAY; remove from source; add to .env.
```

**What's worth noticing:**

- 8 days between the security finding and today. Without `/wbStandup` surfacing it, you'd probably never notice the original report.
- CRITICAL findings should bubble to the top and stay bubbled. The command makes this automatic.
- Concrete recommendation: rotate, remove, env. Not just "address the finding."

---

## Example 4 — `/wbStandup` when there's nothing to do

```text
$ /wbStandup core2/
```

```markdown
# Standup — core2 (2026-04-24 08:00)

## Open plans
None open. Last plan (plan_apiResponse_cache_fix) closed 2026-04-22.

## Unresolved findings
None.

## Stale reports
None.

## Observations
- 3 recent clean audits across packages
- All tests passing
- Last release was 2026-04-22 (wb-dataviewer 2.2.0)

## Suggested next action

Queue is empty. Options:
1. Start something new (pick from /wbVision backlog, if any)
2. Run maintenance sweep: /wbLicense on premium packages, /wbSecure
 across user-facing apps, /wbDoc drift check
3. Close the laptop. Not every day needs output.
```

**What's worth noticing:**

- Empty standup is a real outcome. Don't force work that isn't needed.
- Three options listed including "close the laptop." This is the right posture — the system serves you, not the other way.

---

## The pattern

Every `/wbStandup` run has:

1. **Read `reports/`** across scope + last 7 days.
2. **Classify state** — open / unresolved / stale / archived.
3. **Rank by severity** — BLOCKERs and CRITICAL first.
4. **Suggest next action** — AI opinion, not mandate.
5. **Report written** — `reports/YYYY/MM/DD/standups/`.

The standup report itself becomes part of `reports/` and informs future commands. Closed loop.

---

---

## Basic Usage

```bash
# Standard command execution
/wbStandup frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbStandup deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbStandup` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbStandup target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbStandup target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbStandup target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbStandup packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbStandup apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbStandup` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbStandup frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

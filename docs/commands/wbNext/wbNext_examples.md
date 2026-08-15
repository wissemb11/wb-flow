---
title: "wbNext — Examples"
description: "---"
---

# /wbNext — Examples

> Self-help. The format is the same as `/wbSetup_examples.md`: realistic transcripts with margin notes about what the AI is actually doing.
>
> Use this when you've forgotten what `/wbNext` produces, or when you want to calibrate whether to trust its recommendation.

---

## Example 1 — `/wbNext` after a clean morning standup

You ran `/wbStandup core2/` 10 minutes ago. Now you don't know which package to focus on.

```text
$ /wbNext

[AI] Scanning reports/ since 2026-04-19 (--since=7d)...
[AI] wb-core: last audit 14d ago, 8 commits since
[AI] wb-dataviewer: last audit 3d ago, clean
[AI] wbdataviewer2: last audit 5d ago, 2 console.log flagged
[AI] wb-press: last audit 60d+ ago, no recent commits
[AI]
[AI] Scanning git status... clean working tree.
[AI] Scanning dev.md files... no overdue refusals.
```

```markdown
# Recommendation: /wbAudit packages/wb-core/

## Why
- 14 days since last audit; 8 commits in the window.
- 3 of those commits touch public API (`extractSubObject`, `WBCode.vue`).
- /wbTest passed 2 days ago, gate is green.
- /wbStandup this morning didn't flag wb-core, but staleness alone justifies a re-audit.

## Considered and rejected
- **/wbAudit packages/wb-press/** — older audit (60d+), but zero recent commits. Auditing a frozen package = noise.
- **/wbClean apps/wbdataviewer2.wbc-ui.com** — 2 console.log flagged. Cheap fix, but lower-impact than catching api drift in wb-core.
- **/wbContext packages/wb-core** — would be useful but audit subsumes context refresh as a side effect.

## Caveat
This recommendation assumes only repo-internal signals. Override if you have external pressure (deadline, support ticket, demo).
```

**What's worth noticing:**

- The recommendation isn't the *most overdue* audit (that would be wb-press). It's the *most overdue audit weighted by recent change*. The scoring function correctly prefers signal over staleness.
- The "considered and rejected" list is tight — three real candidates that almost won, each with a one-line rejection. No filler ("considered: do nothing").
- The final caveat is mandatory in every output. `/wbNext` only sees the repo; the user sees the world.

---

## Example 2 — `/wbNext packages/wb-core` after a debug session

You spent the morning debugging `extractSubObject`. `/wbDebug` wrote a report, you fixed the bug, you committed.

```text
$ /wbNext packages/wb-core
```

```markdown
# Recommendation: /wbAudit packages/wb-core/ --act --wbPlan

## Why
- /wbDebug closed 2h ago — root cause was missing null guard in `extractSubObject`.
- The fix touched 1 file, 12 lines. Audit will verify the fix didn't introduce new issues.
- The `--act --wbPlan` flags chain audit → ranked actions → plan, because:
 - Audit alone risks finding 5 things you'll forget by tomorrow.
 - --act ranks them with TODAY/WEEK/MONTH/LATER buckets.
 - --wbPlan gives executable task tables for the multi-step ones.

## Considered and rejected
- **/wbTest packages/wb-core** — would also verify the fix, but only against existing tests. Audit catches what tests don't.
- **/wbGit** — already committed; nothing pending to commit.
- **/wbRefactor src/utils/extractSubObject.js** — would address the function's general messiness, but refactor-without-audit is the #1 mistake (see playbook).

## Caveat
This assumes only repo-internal signals. If the bug came from a customer ticket and they're waiting on a release, run /wbRelease instead.
```

**What's worth noticing:**

- The recommendation includes a **flag combination** (`--act --wbPlan`), not just a bare command. `/wbNext` knows about the cheap-chain pattern from the daily playbook and applies it where it fits.
- The rejection of `/wbRefactor` cites the playbook directly. The recommendation doesn't just say "no" — it points to the rule.
- The caveat is concrete this time ("customer ticket → /wbRelease"), not generic. When `/wbNext` knows the likely external pressure, it names it.

---

## Example 3 — `/wbNext` refuses on a dirty tree

You have uncommitted work on three unrelated files.

```text
$ /wbNext

[AI] Scanning git status...
[AI] M packages/wb-core/src/utils/extractSubObject.js
[AI] M apps/wbdataviewer2/src/App.vue
[AI] M docs/CHANGELOG.md
```

```markdown
# REFUSING to recommend.

## Why
Three unrelated files modified, no commits.

A recommendation right now is noisy:
- A wb-core change implies one set of next steps (audit wb-core).
- A wbdataviewer2 change implies a different set (deploy local test).
- A docs change implies neither.

Mixed working states make recommendations unreliable.

## What to do instead
Run `/wbGit` first. It will detect the mixed state and propose splitting into 3 commits. After committing, re-run `/wbNext` — the recommendation will be much sharper.

## Override
If you really want a recommendation right now, use `/wbNext --force`. The output will name the dominant change set and recommend against that, but accuracy is reduced.
```

**What's worth noticing:**

- The refusal is *informative*, not just a stop. It tells you why, and what the recommended workflow is.
- The override exists (`--force`) but explicitly degrades the output's accuracy. The cost of skipping the discipline is named.
- This is the closed-loop principle in action — `/wbNext` reads `git status`, recognizes the mixed state, and routes you to `/wbGit` which is the command designed to handle it. Two commands working together; no human orchestration needed.

---

## Example 4 — `/wbNext` on a stale repo

You haven't touched the repo in 6 weeks. `reports/` is mostly old.

```text
$ /wbNext

[AI] Scanning reports/ since 2026-04-19 (--since=7d)...
[AI] No reports in window.
[AI] Extending search to --since=90d...
[AI] Most recent: /wbAudit packages/wb-core/ on 2026-03-12 (52d ago)
```

```markdown
# Recommendation: /wbStandup core2/

## Why
- No reports in the last 7 days.
- Most recent signal is 52 days old (audit on wb-core, 2026-03-12).
- This is "returning from absence" mode. The right first move is /wbStandup, not a specific command.
- /wbStandup will tell you what was in flight 6 weeks ago, what got finished by other models in the meantime, and what was abandoned.

## Considered and rejected
- **/wbAudit packages/wb-core/** — overdue but premature. Auditing without knowing what changed since you left is wasted work.
- **/wbContext packages/wb-core** — also premature for the same reason. Context will rebuild from current state, but you don't know yet which package to focus on.
- **/wbNext --force without scope narrowing** — would have to guess. Better to refuse and route to standup.

## Caveat
After /wbStandup, re-run /wbNext. With fresh signal, the recommendation will sharpen.
```

**What's worth noticing:**

- The recommendation is **self-effacing** — it explicitly says "re-run me after standup, my output will improve." That's the right behavior when input quality is low.
- The recommended command (`/wbStandup`) isn't even on the standard `/wbNext` candidate list (standup is usually a daily morning thing, not a "what next" thing). The selection logic correctly extends to "what command do you run when you have nothing to go on?"
- The "returning from absence" framing is explicit. The user knows they triggered a different code path; no hidden state.

---

## Example 5 — When `/wbNext` is the wrong question to ask

You're 4 hours into implementing a feature. You have an open `/wbPlan` with 6 unchecked tasks.

```text
$ /wbNext

[AI] Scanning reports/...
[AI] /wbPlan packages/wb-core/ open 2026-04-25 — 6/8 tasks unchecked
```

```markdown
# Recommendation: Execute the next unchecked row of your open /wbPlan.

## Why
You already answered the "what next" question 4 hours ago when you ran /wbPlan. The plan IS the answer. /wbNext is for when you don't have a plan, not for when you have one and are doubting it.

The next unchecked row is:

> Task 3 of 8 — "Add null guard to extractSubObject array path"
> Worker: the agent 4 / Qwen3 Coder
> Validator: the agent the agent 4

Continue from there.

## If you're stuck on that task
Run /wbDebug "<the specific blocker>" — not /wbNext. /wbNext is too high-level when the issue is one task.

## If the plan itself is wrong
Run /wbAudit packages/wb-core/ --act --wbPlan to re-rank. But verify your plan is *actually wrong*, not just hard. Plans feel wrong when tasks are difficult.
```

**What's worth noticing:**

- This is the meta-recommendation: *don't run me, run the plan you already have.* `/wbNext` correctly de-escalates instead of inventing a new direction.
- The "if you're stuck → /wbDebug, not /wbNext" line is preventive. Without it, the user will run `/wbNext` again in 30 minutes and get the same answer.
- The "if the plan is wrong" branch warns about a common failure: **plans feel wrong when tasks are difficult**. The recommendation explicitly tests for that confusion before allowing a re-plan.

---

## The pattern across all five

The common shape of `/wbNext` is:

1. **Scope detection** (monorepo vs. package).
2. **Signal collection** (reports/, git, dev.md).
3. **Refuse-vs-recommend gate** (dirty tree, stale signals, conflicting state).
4. **Score-and-rank** all viable candidates.
5. **Output:** recommendation + rejected alternatives + caveat.

What makes the command useful isn't the recommendation itself — most experienced users would have picked the same one. It's the **rejected alternatives section**: it forces the model to say *why not the other reasonable options*, which is where calibration happens.

When in doubt about whether to trust the recommendation, read the rejected list. If a candidate you would have picked isn't there, the model missed something — push back: *"why didn't you consider /wbX?"*. That's how you calibrate the command's signal over time.

---

---

## Basic Usage

```bash
# Standard command execution
/wbNext frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbNext deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbNext` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbNext target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbNext target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbNext target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbNext packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbNext apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbNext` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbNext frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

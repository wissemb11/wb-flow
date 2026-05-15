# Command Composition — Real-World Chain Examples

> Part 2 shows complete, annotated chain examples from real wb-flow usage, demonstrating how composition works in practice.

---

## 6. The Daily Workflow Chain

This is the chain most developers run every day:

```
Morning:  /wbTrack → /wbPlan --resume → /wbWork --task=N
Evening:  /wbValid --task=N → /wbStandup → /wbGit
```

### Annotated Walkthrough

```text
# MORNING — Establish context
$ /wbTrack packages/wb-core
→ Creates: tracks/2026/05/11/track_wb-core_20260511.md
→ Reads: latest plan, last standup

$ /wbPlan packages/wb-core --resume
→ Reads: plan_wb-core_20260509.md (last plan)
→ Creates: plan_wb-core_20260511.md (today's entry)
→ Carries forward: 3 open tasks

$ /wbWork plan_wb-core_20260511.md --task=5
→ Reads: plan table, context.md, source code
→ Modifies: src/auth/AuthStrategy.js
→ Creates: tasks/task_5/task_5_report_wb-core_20260511.md
→ Updates: plan table ☐ Done = ✅

# EVENING — Close the loop
$ /wbValid plan_wb-core_20260511.md --task=5
→ Reads: task_5_report_wb-core_20260511.md
→ Appends: validation score (9/10)

$ /wbStandup packages/wb-core
→ Reads: today's track, plan changes, task reports
→ Creates: standups/standup_wb-core_20260511.md

$ /wbGit packages/wb-core
→ Reads: staged git changes
→ Outputs: commit message text (stdout)
```

---

## 7. The Feature Development Chain

When building a new feature from scratch:

```
/wbIdea → /wbPlan → /wbWork (×N) → /wbValid (×N) → /wbAudit → /wbGit
```

### Step-by-Step

| Step | Command | Output | Next Step Reads |
|---|---|---|---|
| 1 | `/wbIdea packages/wb-core` | `idea_wb-core_20260511.md` | Step 2 |
| 2 | `/wbPlan packages/wb-core` | `plan_wb-core_20260511.md` | Step 3 |
| 3 | `/wbWork --task=1` | `task_1_report_*.md` | Step 4 |
| 4 | `/wbValid --task=1` | (appended to task report) | Step 3 (next task) |
| ... | (repeat 3–4 for each task) | | |
| N-1 | `/wbAudit packages/wb-core` | `audit_wb-core_20260511.md` | Step N |
| N | `/wbGit packages/wb-core` | Commit message (stdout) | User runs git |

---

## 8. The Emergency Hotfix Chain

When you need to fix something fast:

```
/wbDebug → /wbWork (inline task) → /wbGit
```

This skips the plan step entirely — acceptable for single-file fixes where formal planning is overhead.

**When this is acceptable:**
- Single-file bug fix
- Configuration change
- Typo correction

**When this is NOT acceptable:**
- Multi-file refactor (needs a plan for coordination)
- Breaking change (needs audit trail)
- Anything requiring validation from another model

---

## 9. Chain Failure Recovery

When a chain breaks mid-execution:

| Failure Point | Symptom | Recovery |
|---|---|---|
| `/wbPlan` fails | No plan file created | Check context.md exists. Run `/wbContext` first. |
| `/wbWork` crashes | Task stuck in 🔨 state | Run `/wbPlan --id=N --open` to reset, then retry. |
| `/wbValid` scores < 7 | Low quality detected | Re-execute: `/wbWork --task=N` (auto-resets state). |
| `/wbGit` has no staged changes | No commit message | Stage changes with `git add` first. |

### The Recovery Principle

> If any command in a chain fails, you can always restart from that point. Earlier steps don't need to be re-run — their output files are still on disk.

---

## 10. Composition Best Practices

| Practice | Rationale |
|---|---|
| **Always start with context** | Run `/wbContext` or `/wbTrack` before anything else. |
| **One task at a time** | Don't run `/wbWork` on multiple tasks simultaneously. |
| **Validate before committing** | The Valid → Git sequence catches issues before they're permanent. |
| **Re-audit after major changes** | Closing the feedback loop ensures nothing was missed. |
| **Use `/wbNext` when stuck** | It reads your current state and suggests the best next command. |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

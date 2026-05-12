# Plan State Management — Edge Cases & Advanced Patterns

> Part 2 covers the non-obvious behaviors of the plan state machine: re-execution flows, validator conflicts, stale state detection, and recursive task state propagation.

---

## Re-Execution (Task Reset)

When a user requests re-execution of a completed task, the system performs a full state reset:

### The Reset Protocol

```bash
/wbWork <scope> --task=N   # where Task N is already ✅ Done
```

**Steps performed automatically:**

| Step | Action |
|---|---|
| 1 | Revert the `#` column from `[N](tasks/task_N/...)` back to plain `N`. |
| 2 | Reset `☐ Done` from `✅ ModelName` to `⬜`. |
| 3 | Reset `☐ Valid` from `✅ Score/10 ValidatorName` to `⬜` (clearing ALL validators). |
| 4 | The old report file (`task_N_report_*.md`) is considered stale — a fresh report replaces it. |

### When to Re-Execute

| Scenario | Action |
|---|---|
| Validation score < 7/10 | Re-execute. The validator found significant issues. |
| Requirements changed after completion | Re-execute with updated task description. |
| Different model needed | Re-execute. The new worker overwrites the Done column. |
| Validator disagrees with a previous validator | Do NOT re-execute. Add your validation score (cumulative). |

---

## Validator Override Patterns

The Valid column supports multiple independent assessments. This creates nuanced quality signals:

### Scenario A: Consensus

```
☐ Valid:
✅ 9/10
AI

✅ 10/10
AI
```

**Interpretation:** Strong consensus. Task is definitively complete.

### Scenario B: Disagreement

```
☐ Valid:
✅ 9/10
AI

✅ 5/10
AI
```

**Interpretation:** Significant disagreement (spread > 3 points). The lower score's rationale should be reviewed. Common causes:
- Different interpretation of acceptance criteria
- Validator found edge cases the first validator missed
- Validator applied stricter standards

**Resolution:** The task owner (user) decides. Options:
1. Accept the higher score and move on
2. Re-execute to address the lower validator's concerns
3. Add a third validator to break the tie

### Scenario C: Self-Validation

```
☐ Done: ✅ AI
☐ Valid: ✅ 8/10 AI
```

**Interpretation:** Same model validated its own work. This is allowed but weak — the plan template recommends using a different model for validation whenever possible. Self-validation is acceptable for:
- Trivial tasks (config tweaks, renames)
- Tasks where only one model has the necessary context
- Time-critical situations where a second pass isn't feasible

---

## Stale State Detection

A task's state can become stale when:

| Condition | Detection Rule | Action |
|---|---|---|
| **Stale In-Progress** | `🔨` for > 12 hours with no report file | System asks: "Verify this task's actual state before proceeding." |
| **Orphaned Done** | `✅ Done` but the linked report file doesn't exist | Reset to ⬜. The Done state is invalid without a report. |
| **Phantom Valid** | `✅ Valid` but `☐ Done` is still ⬜ | Invalid state — cannot validate unfinished work. Reset Valid to ⬜. |
| **Stale Plan** | Plan file is > 7 days old with open tasks | `/wbPlan --resume` flags it: "This plan has stale open tasks." |

### The Self-Correct Recovery

When `/wbPlan` runs in self-correct mode on a plan file, it automatically detects and repairs these states:

```bash
/wbPlan <existing_plan_file.md>   # triggers self-correct

[AI] Scanning plan table for state inconsistencies...
[AI] ⚠️ Task #3: Done=✅ but report file missing → resetting to ⬜
[AI] ⚠️ Task #7: In-Progress for 18 hours → flagging for review
[AI] ✅ Task #5: Done=✅, report exists, Valid=✅ — consistent
```

---

## Recursive Task State Propagation

When a parent task is expanded into sub-tasks (e.g., Task #7 → 7.1, 7.2, 7.3), special state rules apply:

### Parent State Rules

| Parent State | Condition |
|---|---|
| `⬜ Expanded → 7.1–7.3` | Initial state after expansion. |
| `✅ Done` | ALL sub-tasks (7.1, 7.2, 7.3) are ✅ Done. |
| `⬜` (not expanded) | At least one sub-task is still ⬜ or 🔨. |

A parent task is **never** directly executed — executing or validating the parent ID is equivalent to executing or validating all of its children.

### Batch Operations on Parents

```bash
# Execute parent = execute all children sequentially
/wbWork <scope> --task=7      # runs 7.1, then 7.2, then 7.3

# Defer parent = defer all children
/wbPlan <scope> --id=7 --def  # sets 7.1, 7.2, 7.3 all to ⏸️

# Cancel parent = cancel all children  
/wbPlan <scope> --id=7 --can  # sets 7.1, 7.2, 7.3 all to 🚫
```

### Partial Completion

If some sub-tasks are done and others are open, the parent remains in its expanded state. There is no "partially done" symbol — the parent is either fully ⬜ Expanded or fully ✅ Done.

---

## State Interaction with Other Commands

| Command | Reads State | Writes State |
|---|---|---|
| `/wbPlan` | Reads all columns to determine progress | Writes Done/Valid via `--open`, `--def`, `--can` |
| `/wbWork` | Reads Done to detect re-execution | Writes Done to ✅ on completion |
| `/wbValid` | Reads Done to verify task is complete | Appends to Valid column |
| `/wbNext` | Reads Done/Valid to suggest next actions | Does not write state |
| `/wbAudit` | Does not read plan state | May generate findings that become new tasks |
| `/wbTrack` | Reads Done/Valid for session narrative | Does not write state |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

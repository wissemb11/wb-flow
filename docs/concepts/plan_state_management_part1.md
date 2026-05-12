# Plan State Management — The Task Lifecycle

> This page defines the state machine governing every task in a wb-flow plan. Understanding these states and their transitions is essential for operating `/wbPlan`, `/wbWork`, and `/wbValid` correctly.

---

## The Five States

Every task in a plan table has two independent state columns: **☐ Done** and **☐ Valid**. Each column can hold one of five values:

| State | Symbol | Meaning |
|---|---|---|
| **Open** | ⬜ | Task is available for execution. No work has begun. |
| **In Progress** | 🔨 | A worker has claimed the task and is actively executing it. |
| **Done** | ✅ | Work is complete. A task report exists. |
| **Deferred** | ⏸️ | Intentionally postponed. Will be revisited in a future session. |
| **Cancelled** | 🚫 | Permanently abandoned. Will not be executed. |

---

## The State Machine

```
                    ┌─────────────┐
                    │   ⬜ Open    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ 🔨 In    │ │ ⏸️ Defer │ │ 🚫 Cancel│
        │ Progress │ │          │ │          │
        └────┬─────┘ └──────────┘ └──────────┘
             │
             ▼
        ┌──────────┐
        │ ✅ Done   │
        └──────────┘
```

### Valid Transitions

| From | To | Trigger | Who |
|---|---|---|---|
| ⬜ Open | 🔨 In Progress | `/wbWork --task=N` starts executing | Worker |
| ⬜ Open | ⏸️ Deferred | `/wbPlan --id=N --def` | User |
| ⬜ Open | 🚫 Cancelled | `/wbPlan --id=N --can` | User |
| 🔨 In Progress | ✅ Done | Worker writes `task_N_report_*.md` | Worker |
| 🔨 In Progress | ⬜ Open | Worker aborts without report (implicit) | System |
| ⏸️ Deferred | ⬜ Open | `/wbPlan --id=N --open` | User |
| 🚫 Cancelled | ⬜ Open | `/wbPlan --id=N --open` | User |
| ✅ Done | ⬜ Open | Re-execution requested (task reset) | User |

### Invalid Transitions

| Attempted | Why It's Invalid |
|---|---|
| ⬜ → ✅ directly | Cannot skip execution. A report file must exist. |
| ✅ → ⏸️ | Cannot defer completed work. Use `--open` to reset first. |
| 🚫 → ✅ directly | Cannot complete cancelled work. Re-open first. |

---

## The Done Column

When a task is marked ✅ Done:

1. **The `#` column becomes a link** to the task report:
   ```
   | [3](tasks/task_3/task_3_report_wb-core_20260510.md) | ...
   ```

2. **The worker name appears below the checkbox:**
   ```
   ✅
   AI
   ```

3. **The overwrite rule applies:** The Done column is NOT cumulative. If a different model re-executes the task, it completely replaces the previous worker name. Only one worker can be the ultimate executor.

---

## The Valid Column

Validation is independent of execution. A task can be:
- ✅ Done but not yet validated (☐ Valid = ⬜)
- ✅ Done and validated (☐ Valid = ✅ 9/10)
- ✅ Done with multiple validators

### Validation Format

```
✅ 9/10
AI

✅ 8/10
AI
```

Unlike Done, the Valid column **is cumulative** — multiple validators can append their scores. This creates an independent quality assessment from different perspectives.

### Validation Rules

| Rule | Description |
|---|---|
| **Independence** | A validator should be a different model than the worker when possible. |
| **Self-skip** | If your name is already in the Valid column and the task hasn't changed, skip validation. |
| **Score range** | 1–10. Below 7 typically triggers a re-execution cycle. |
| **No report file** | Validators append their findings to the existing worker report — they do NOT create a separate file. |

---

## The Dependency Column (Dep)

The `Dep` column in the plan table controls execution ordering:

| Value | Meaning |
|---|---|
| `—` | No dependencies. Can execute immediately. |
| `2` | Blocked until Task #2 is ✅ Done. |
| `2, 5` | Blocked until BOTH #2 AND #5 are ✅ Done. |

Tasks with the same parent are siblings and execute in **parallel** unless explicitly linked via the Dep column.

---

## State Override Commands

Users can directly manipulate state using `/wbPlan` flags:

```bash
# Set tasks 1 and 2 to Open (reset)
/wbPlan <scope> --id=1,2 --open

# Defer task 3
/wbPlan <scope> --id=3 --def

# Cancel all tasks assigned to a specific worker
/wbPlan <scope> --worker=AI --can
```

All state overrides set **both** ☐ Done and ☐ Valid simultaneously. You cannot defer only the validation — the entire task is deferred.

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

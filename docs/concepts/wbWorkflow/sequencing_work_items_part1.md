# Sequencing Work Items — The DAG Dependency Model

> This page explains how wb-flow determines the execution order of plan tasks using a Directed Acyclic Graph (DAG) dependency model.

---

## 1. The Dep Column

Every plan task has a `Dep` column that specifies which tasks must be completed before it can start:

| Task | Dep | Meaning |
|---|---|---|
| Task #1 | `—` | No dependencies — can start immediately |
| Task #2 | `1` | Blocked until Task #1 is ✅ Done |
| Task #3 | `1, 2` | Blocked until BOTH Tasks #1 and #2 are ✅ Done |
| Task #4 | `—` | No dependencies — can run in parallel with #1–#3 |

---

## 2. The Dependency Graph

Dependencies form a DAG — a graph with no cycles:

```
Task #1 ──→ Task #2 ──→ Task #3
                    ↗
Task #4 ──────────
```

### Graph Rules

| Rule | Description |
|---|---|
| **No cycles** | A → B → A is invalid. The system detects and rejects cycles. |
| **Transitive** | If A → B → C, then C depends on A (transitively). |
| **Fan-in** | Multiple tasks can depend on the same predecessor. |
| **Fan-out** | One task can have multiple dependents. |
| **Independent** | Tasks with `Dep = —` can all run in parallel. |

---

## 3. Execution Ordering

The system determines execution order using topological sort:

```
Level 0: Tasks with Dep = —           (can start immediately)
Level 1: Tasks whose deps are Level 0  (can start after Level 0 completes)
Level 2: Tasks whose deps are Level 1  (can start after Level 1 completes)
```

### Example: A 7-Task Plan

| Task | Dep | Level | Can Start After |
|---|---|---|---|
| #1 | — | 0 | Immediately |
| #2 | — | 0 | Immediately |
| #3 | 1 | 1 | Task #1 |
| #4 | 1, 2 | 1 | Tasks #1 AND #2 |
| #5 | 3 | 2 | Task #3 |
| #6 | 4 | 2 | Task #4 |
| #7 | 5, 6 | 3 | Tasks #5 AND #6 |

**Execution visualization:**

```
Level 0:  #1  #2
Level 1:      #3  #4
Level 2:          #5  #6
Level 3:              #7
```

---

## 4. Parallel vs. Serial Execution

### Parallel (Independent Tasks)

Tasks at the same level with no shared dependencies can be executed in parallel:

```bash
# Level 0 — both can run simultaneously
/wbWork plan_*.md --task=1   # parallel
/wbWork plan_*.md --task=2   # parallel
```

In practice, "parallel" means the user can execute them in any order — wb-flow doesn't actually run commands concurrently.

### Serial (Dependent Tasks)

Tasks with dependencies must be executed in order:

```bash
/wbWork plan_*.md --task=1   # must complete first
/wbWork plan_*.md --task=3   # blocked until #1 is done
/wbWork plan_*.md --task=5   # blocked until #3 is done
```

If you try to execute a blocked task, `/wbWork` will report the blocking dependency.

---

## 5. Dependency Validation

When a plan is created, the system validates the dependency graph:

| Check | Detection | Action |
|---|---|---|
| **Cycle detected** | A → B → A | `❌ Error: Circular dependency` |
| **Missing dependency** | Dep references Task #99 (doesn't exist) | `⚠️ Warning: Unknown dependency #99` |
| **Self-dependency** | Task #3 depends on Task #3 | `❌ Error: Self-dependency` |
| **Over-constrained** | Every task depends on the previous one | `⚠️ Warning: Fully serial plan — consider parallelizing` |

---

← [Concepts Hub](README.md) · [Home](../README.md)

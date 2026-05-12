# Sequencing Work Items — Real-World Examples

> Part 2 shows real-world sequencing patterns from multi-package refactors, cross-scope dependencies, and how `/wbNext` uses the DAG to recommend actions.

---

## 6. Example: Documentation Rewrite (This Project)

The `wb-flow-docs` content rewrite demonstrates sequencing in practice:

```
Parent tasks (independent):
  Task #7 (commands)  — Dep: —
  Task #8 (concepts)  — Dep: —
  Task #9 (start_here) — Dep: —
  Task #10 (misc)      — Dep: —

Sub-tasks of #9 (sequential):
  9.1 (bootstrapping)         — Dep: —
  9.2 (first_run_walkthrough) — Dep: 9.1
  9.3 (tutorial_zero_to_app)  — Dep: 9.2
  9.4 (daily_playbook)        — Dep: —
```

**Key insight:** Tasks 7, 8, 9, and 10 are independent — they can be executed in any order. But within Task 9, sub-tasks 9.1 → 9.2 → 9.3 are sequential because each tutorial builds on concepts from the previous one.

---

## 7. Example: Multi-Package Refactor

When refactoring shared code across packages:

```
Task #1: Update wb-core API     — Dep: —
Task #2: Update wb-press2       — Dep: 1   (uses wb-core)
Task #3: Update wb-dataviewer   — Dep: 1   (uses wb-core)
Task #4: Update wb-flow         — Dep: 1   (uses wb-core)
Task #5: Integration tests      — Dep: 2, 3, 4  (all consumers updated)
Task #6: Release wb-core        — Dep: 5   (tests pass)
```

**Graph:**

```
        ┌→ #2 ─┐
#1 ─────┤→ #3 ─┤→ #5 → #6
        └→ #4 ─┘
```

This is a fan-out / fan-in pattern — common in monorepo refactors.

---

## 8. How `/wbNext` Uses the DAG

`/wbNext` reads the plan's dependency graph and current state to recommend the optimal next action:

```text
$ /wbNext plan_wb-core_20260511.md

[AI] Analyzing plan state...
[AI]   Task #1: ✅ Done
[AI]   Task #2: ⬜ Open (deps satisfied: #1 ✅)
[AI]   Task #3: ⬜ Open (deps satisfied: #1 ✅)
[AI]   Task #4: ⬜ Open (deps satisfied: #1 ✅)
[AI]   Task #5: ⬜ Open (deps NOT satisfied: #2 ⬜, #3 ⬜, #4 ⬜)
[AI]
[AI] Recommended next action:
[AI]   /wbWork plan_*.md --task=2   (P1, deps satisfied, 20 min est.)
[AI]
[AI] Also available:
[AI]   /wbWork plan_*.md --task=3   (P1, deps satisfied, 15 min est.)
[AI]   /wbWork plan_*.md --task=4   (P2, deps satisfied, 10 min est.)
```

### `/wbNext` Ranking Algorithm

| Factor | Weight | Description |
|---|---|---|
| **Dependencies satisfied** | Required | Only suggest unblocked tasks |
| **Priority** | 40% | P1 tasks rank higher than P2 |
| **Time estimate** | 30% | Shorter tasks rank higher (quick wins) |
| **Dependency count** | 20% | Tasks that unblock more downstream tasks rank higher |
| **Recency** | 10% | Tasks in the same category as last completed task rank higher |

---

## 9. Cross-Scope Dependencies

wb-flow plans are scoped to a single folder, so cross-scope dependencies must be managed manually:

| Pattern | How to Handle |
|---|---|
| Package A depends on Package B changes | Create separate plans. Complete Plan B first. |
| Shared component update | Create a plan for the shared component, then plans for consumers. |
| Documentation references code changes | Execute code plan first, then docs plan. |

### Cross-Scope Annotation

You can annotate cross-scope deps in the task description:

```markdown
| 2 | 🔨 Worker | ⚠️ External: wb-core #1 | Update imports after wb-core API change | ... |
```

The `⚠️ External:` prefix signals that this dependency is outside the current plan's scope.

---

## 10. Sequencing Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| **Fully serial** | Every task depends on the previous one | Identify truly independent tasks and remove unnecessary deps |
| **No dependencies** | All tasks have `Dep: —` | Add deps where order matters (e.g., API before consumers) |
| **Hidden dependencies** | Task #3 actually needs #2's output but has no dep | Add the missing dep to prevent execution failures |
| **Circular deps** | A → B → C → A | Restructure into a linear chain or break the cycle |

---

← [Concepts Hub](README.md) · [Home](../README.md)

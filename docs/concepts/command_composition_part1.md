# Command Composition — How Commands Chain Together

> This page explains the conceptual model behind command composition in wb-flow. For the formal specification, see [command_composition_spec_v1](../_specs/command_composition_spec_v1_part1.md).

---

## 1. The Core Idea

wb-flow commands don't work in isolation — they form **chains** where the output of one command feeds into the next. Understanding these chains is the difference between using wb-flow as a collection of tools and using it as a system.

### The Simplest Chain

```
/wbAudit → /wbPlan → /wbWork → /wbValid
```

This four-step chain is the backbone of wb-flow:

| Step | Command | What happens |
|---|---|---|
| 1 | `/wbAudit` | Scans code, produces findings |
| 2 | `/wbPlan` | Decomposes findings into tasks |
| 3 | `/wbWork` | Executes one task at a time |
| 4 | `/wbValid` | Verifies the task was done correctly |

Each step consumes the previous step's output. No step can be skipped.

---

## 2. The Three Composition Patterns

### Pattern A: Linear Chain

```
A → B → C → D
```

Each command runs once, in order. This is the most common pattern for a single work unit.

**Example:** Fix a bug from audit to commit.
```
/wbAudit → /wbPlan → /wbWork --task=1 → /wbValid --task=1 → /wbGit
```

### Pattern B: Fan-Out

```
      ┌→ B₁
A ────┤→ B₂
      └→ B₃
```

One command's output triggers multiple parallel executions. This happens when a plan has multiple independent tasks.

**Example:** Execute three independent tasks from one plan.
```
/wbPlan → /wbWork --task=1  (parallel)
        → /wbWork --task=2  (parallel)
        → /wbWork --task=3  (parallel)
```

### Pattern C: Feedback Loop

```
A → B → C → A (re-check)
```

The chain loops back to verify the original findings are resolved. This is used for iterative quality improvement.

**Example:** Audit-fix-reaudit cycle.
```
/wbAudit → /wbPlan → /wbWork → /wbAudit (re-run)
                                    ↓
                              Score improved? → Done
                              Score same?     → /wbPlan (new tasks)
```

---

## 3. File-Mediated Communication

Commands communicate exclusively through the file system. There is no in-memory state shared between commands.

```
/wbAudit writes → audit_wb-core_20260511.md
                           ↓
/wbPlan reads  → audit_wb-core_20260511.md
/wbPlan writes → plan_wb-core_20260511.md
                           ↓
/wbWork reads  → plan_wb-core_20260511.md
/wbWork writes → task_1_report_wb-core_20260511.md
```

### Why File-Mediated?

| Reason | Benefit |
|---|---|
| **Resumable** | If you close the session, the files persist. Pick up where you left off. |
| **Auditable** | Every decision is recorded in a file. Full traceability. |
| **Model-agnostic** | Any AI model can read the files. Switch models mid-chain. |
| **Debuggable** | If something goes wrong, inspect the intermediate files. |

---

## 4. The Scope Rule

All commands in a chain must target the same **scope** (folder). Cross-scope composition is invalid:

```
✅ /wbAudit packages/wb-core → /wbPlan packages/wb-core
❌ /wbAudit packages/wb-core → /wbPlan packages/wb-press2
```

The scope ensures that all files in the chain live in the same `.wb/workflows/reports/` tree, maintaining link integrity.

---

## 5. When to Compose vs. When to Run Standalone

| Situation | Approach |
|---|---|
| Systematic quality improvement | Full chain: Audit → Plan → Work → Valid |
| Quick cleanup | Standalone: `/wbClean` (no plan needed) |
| Brainstorming | Standalone: `/wbIdea` |
| End-of-day summary | Standalone: `/wbStandup` |
| New project setup | Mini-chain: `/wbContext` → `/wbAudit` |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

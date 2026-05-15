# Command Classification — Role Interactions & Edge Cases

> Part 2 covers how roles interact in multi-command workflows, edge cases in role assignment, and the dual-role behavior of `/wbAudit`.

---

## Role Interaction Matrix

Not all role combinations are valid in a composition chain. This matrix shows which transitions are permitted:

| From → To | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **🧠 Planner** | ✅ (recursive plan) | ❌ (nothing to validate) | ✅ (execute tasks) | ✅ (summarize plan) |
| **✅ Validator** | ✅ (re-plan on low score) | ❌ (no double-validation) | ✅ (re-execute on fail) | ✅ (report results) |
| **🔨 Worker** | ❌ (workers don't plan) | ✅ (validate completed work) | ❌ (no chained execution) | ✅ (commit, standup) |
| **📋 Mechanical** | ✅ (next → plan) | ❌ (mechanical can't validate) | ❌ (mechanical can't execute) | ✅ (track → standup) |

### Key Restrictions

| Rule | Rationale |
|---|---|
| Workers cannot chain to other Workers | Prevents unbounded execution. Each task is atomic. |
| Validators cannot chain to Validators | One validation pass per task is sufficient per model. |
| Mechanical cannot trigger Workers | Mechanical commands are advisory only. |

---

## The `/wbAudit` Dual-Role

`/wbAudit` is unique — it behaves as two different roles depending on context:

### As 🧠 Planner (Initial Audit)

```bash
/wbAudit packages/wb-core          # first time auditing this scope
```

- Creates a new audit report with findings
- Findings can be ingested into a plan via `/wbPlan`
- Acts as a **producer** of work items

### As ✅ Validator (Re-Audit)

```bash
/wbAudit packages/wb-core          # after plan tasks are completed
```

- Compares current state against previous audit findings
- Reports which issues were resolved and which persist
- Acts as a **quality gate** before release

### How the System Detects the Mode

| Condition | Role |
|---|---|
| No previous audit report exists for this scope | 🧠 Planner (initial) |
| Previous audit exists AND plan tasks are ✅ Done | ✅ Validator (re-audit) |
| Previous audit exists AND plan tasks are ⬜ Open | 🧠 Planner (refresh findings) |

---

## Role Assignment for Custom Commands

When creating a new `/wb*` command, assign its role based on this checklist:

| Question | If YES → Role |
|---|---|
| Does it create task tables or backlogs? | 🧠 Planner |
| Does it review and score completed work? | ✅ Validator |
| Does it modify source code or write task reports? | 🔨 Worker |
| Does it only produce text summaries? | 📋 Mechanical |

If a command fits multiple roles, split it into separate commands or implement dual-role detection like `/wbAudit`.

---

## Role and Model Affinity

Different AI models are better suited to different roles:

| Role | Best Model | Rationale |
|---|---|---|
| 🧠 Planner | AI / AI | Strategic decomposition requires deep reasoning |
| ✅ Validator | Different model than the Worker | Independent perspective catches blind spots |
| 🔨 Worker | Depends on task complexity | Simple tasks → Sonnet 4.6; complex → AI |
| 📋 Mechanical | Sonnet 4.6 / DeepSeek V4 | Low-stakes output; optimize for cost |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Pattern |
|---|---|---|
| Worker validates its own output | No independent review | Use a different model as Validator |
| Planner executes the tasks it created | Planner bias toward its own plan | Hand off to a Worker |
| Mechanical command modifies files | Violates read-only constraint | Use a Worker instead |
| Validator rewrites failing code | Validators don't write code | Score low → trigger Worker re-execution |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

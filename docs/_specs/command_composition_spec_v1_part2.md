# Command Composition Specification v1 — Validation & Error Handling

> Part 2 covers the validation rules for command compositions, error handling for invalid chains, and the formal constraints that prevent composition mistakes.

---

## 6. Composition Validation Rules

Before executing a chain, the system validates each link. A composition is valid only if every transition passes these checks:

### Pre-Condition Checks

| Check | Rule | Error on Failure |
|---|---|---|
| **Scope exists** | The target folder must exist on disk. | `❌ Error: Scope 'packages/nonexistent/' not found.` |
| **Context exists** | The target must have a `.wb/workflows/context.md`. | `⚠️ Warning: No context.md. Run /wbContext first.` |
| **Input file exists** | If the command consumes a file (e.g., `/wbWork` needs a plan), that file must exist. | `❌ Error: Plan file not found. Run /wbPlan first.` |
| **Task exists** | For `--task=N`, the task index must exist in the plan table. | `❌ Error: Task #7 not found in plan table.` |
| **Task is open** | For `/wbWork --task=N`, the task's Done column must be ⬜ or 🔨. | `⚠️ Warning: Task #3 is already ✅ Done. Re-executing will reset state.` |
| **No circular deps** | The Dep column must form a DAG (no cycles). | `❌ Error: Circular dependency detected: #2 → #5 → #2.` |

### Post-Condition Checks

| Check | Rule | Error on Failure |
|---|---|---|
| **Output created** | The command must produce its expected output file. | `❌ Error: Expected output file was not created.` |
| **Output schema valid** | The output file must match the command's schema (correct H1, required sections). | `⚠️ Warning: Output file is missing required sections.` |
| **Links resolve** | All relative markdown links in the output must point to existing files. | `⚠️ Warning: Broken link detected in output.` |

---

## 7. Invalid Composition Patterns

### 7.1 Skipping the Plan

```
/wbAudit <scope>  →  /wbWork <scope>      ❌ INVALID
```

**Why:** `/wbWork` requires a plan file with a task table. It cannot execute audit findings directly. The correct chain is:

```
/wbAudit <scope>  →  /wbPlan <scope>  →  /wbWork <plan> --task=N    ✅ VALID
```

### 7.2 Validating Before Executing

```
/wbPlan <scope>  →  /wbValid <plan> --task=N      ❌ INVALID
```

**Why:** `/wbValid` requires a task report to validate. The task must be ✅ Done first.

### 7.3 Circular Composition

```
/wbAudit <scope>  →  /wbPlan <scope>  →  /wbAudit <scope>      ⚠️ VALID but caution
```

**Why:** This is technically valid — you can re-audit after planning to verify the plan addresses all findings. However, this creates an infinite loop if automated. Always include a termination condition (e.g., "re-audit only once").

### 7.4 Cross-Scope Composition

```
/wbAudit packages/wb-core  →  /wbPlan packages/wb-press2      ❌ INVALID
```

**Why:** The audit findings are scoped to `wb-core`. Creating a plan for `wb-press2` based on `wb-core` findings is a scope mismatch. The source link would be invalid.

---

## 8. Error Recovery Patterns

| Error | Recovery |
|---|---|
| Missing plan file | Run `/wbPlan <scope>` to create one. |
| Missing context.md | Run `/wbContext <scope>` to bootstrap identity. |
| Stale plan (>7 days) | Run `/wbPlan <scope> --resume` to refresh state. |
| Broken task report link | Run `/wbPlan <plan_file>` in self-correct mode. |
| Task stuck in 🔨 | Run `/wbPlan <scope> --id=N --open` to reset. |
| Validation score < 7 | Re-execute with `/wbWork <plan> --task=N`. |

---

## 9. Composition Constraints Summary

| Constraint | Description |
|---|---|
| **Acyclic** | Composition chains must not loop (except deliberate re-audit). |
| **Scope-local** | A command's output must stay within the target scope's `.wb/` tree. |
| **File-mediated** | All inter-command communication is via the file system. |
| **Date-partitioned** | Outputs are partitioned by `YYYY/MM/DD`. Cross-day references use relative links. |
| **Schema-enforced** | Every output file has a detectable H1 pattern for self-correct mode. |
| **Append-only** | Same-day re-runs append (Entry #N) rather than overwrite. |
| **Human-in-the-loop** | No command modifies git state. `/wbGit` outputs text; the user runs `git commit`. |

---

## 10. Version History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-05-10 | Initial specification. Covers 11 commands, 4 canonical chains, 7 constraints. |

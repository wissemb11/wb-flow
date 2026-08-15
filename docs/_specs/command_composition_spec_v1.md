---
title: "Command Compositionv1 — Grammar & Contracts"
description: "---"
---

# Command Composition Specification v1 — Grammar & Contracts

> This specification defines the formal rules for composing wb-flow commands into execution chains. It covers input/output contracts, the chaining grammar, and the canonical composition patterns.

---

## 1. Core Principle

Every `/wb*` command follows a strict **Input → Process → Output** contract. Commands compose by connecting the output of one command to the input of another. The composition is always explicit — there is no implicit piping.

---

## 2. Input/Output Contract Table

| Command | Input Type | Output Type | Output Location |
|---|---|---|---|
| `/wbAudit` | Folder path | Audit report (`.md`) | `reports/<date>/audits/` |
| `/wbPlan` | Folder path OR audit report | Plan file (`.md`) | `reports/<date>/plans/` |
| `/wbWork` | Plan file + `--task=N` | Task report (`.md`) | `reports/<date>/plans/tasks/task_N/` |
| `/wbValid` | Plan file + `--task=N` | Appended validation score | (modifies existing task report) |
| `/wbClean` | Folder path | Clean report (`.md`) | `reports/<date>/cleans/` |
| `/wbGit` | Folder path | Commit message (text) | stdout (not saved) |
| `/wbIdea` | Folder path | Idea backlog (`.md`) | `reports/<date>/ideas/` |
| `/wbNext` | Folder path | Suggestion list (text) | stdout (not saved) |
| `/wbTrack` | Folder path | Session narrative (`.md`) | `tracks/<date>/` |
| `/wbContext` | Folder path | Context snapshot (`.md`) | `reports/<date>/contexts/` |
| `/wbStandup` | Folder path | Standup summary (`.md`) | `reports/<date>/standups/` |

---

## 3. The Chaining Grammar

### Formal Syntax

```
chain := command ( "→" command )*
command := "/" commandName scope [ flags ]
scope := folderPath | filePath
flags := ( "--" flagName [ "=" value ] )*
```

### Canonical Chains

**The Audit-Fix Chain (most common):**
```
/wbAudit <scope>  →  /wbPlan <scope>  →  /wbWork <plan> --task=N  →  /wbValid <plan> --task=N
```

**The Ideation Chain:**
```
/wbVision <scope>  →  /wbIdea <scope>  →  /wbPlan <scope>  →  /wbWork <plan> --task=N
```

**The Session Chain (daily workflow):**
```
/wbTrack <scope>  →  /wbPlan <scope> --resume  →  /wbWork <plan> --task=N  →  /wbStandup <scope>  →  /wbGit <scope>
```

**The Clean-Ship Chain:**
```
/wbClean <scope>  →  /wbAudit <scope>  →  /wbGit <scope>
```

---

## 4. Composition Rules

### Rule 1: Output Locality
Every command writes its output to the target scope's `.wb/workflows/reports/` tree. The output path is deterministic — given the scope, date, and command type, the output file path is fully predictable.

### Rule 2: ONE FILE PER DAY
Each command produces at most one output file per scope per day. If a command is run twice on the same day, it appends (via Entry #N sections) rather than creating a new file.

### Rule 3: Explicit Linking
When Command B consumes the output of Command A, it must include a relative markdown link to Command A's output in its `> **Source:**` header. This creates a traceable provenance chain.

### Rule 4: No Implicit State
Commands do not share runtime state. The only communication mechanism between commands is the file system. Command B reads Command A's output file — there is no in-memory handoff.

### Rule 5: Idempotent Self-Correct
Any command can be re-run on its own output file. When it detects its own output schema (via the H1 pattern), it enters self-correct mode: gap-fills, fixes links, and normalizes — but never rewrites authored content.

---

## 5. The Composition Graph

```
                    ┌──────────┐
                    │ /wbVision│
                    └────┬─────┘
                         │ (ideas)
                         ▼
┌──────────┐       ┌──────────┐       ┌──────────┐
│ /wbAudit │──────▶│ /wbPlan  │◀──────│ /wbIdea  │
└──────────┘       └────┬─────┘       └──────────┘
  (findings)            │ (tasks)
                        ▼
                  ┌──────────┐
                  │ /wbWork  │
                  └────┬─────┘
                       │ (reports)
              ┌────────┼────────┐
              ▼        ▼        ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ /wbValid │ │ /wbClean │ │ /wbGit   │
        └──────────┘ └──────────┘ └──────────┘
```

### Node Roles
- **Producers** (create new work): `/wbAudit`, `/wbVision`, `/wbIdea`
- **Orchestrators** (decompose work): `/wbPlan`
- **Executors** (do the work): `/wbWork`, `/wbClean`
- **Validators** (verify the work): `/wbValid`, `/wbAudit` (re-run)
- **Finalizers** (close the loop): `/wbGit`, `/wbStandup`, `/wbTrack`


## Command Composition Specification v1 — Validation & Error Handling

> Part 2 covers the validation rules for command compositions, error handling for invalid chains, and the formal constraints that prevent composition mistakes.

---

### 6. Composition Validation Rules

Before executing a chain, the system validates each link. A composition is valid only if every transition passes these checks:

#### Pre-Condition Checks

| Check | Rule | Error on Failure |
|---|---|---|
| **Scope exists** | The target folder must exist on disk. | `❌ Error: Scope 'packages/nonexistent/' not found.` |
| **Context exists** | The target must have a `.wb/workflows/context.md`. | `⚠️ Warning: No context.md. Run /wbContext first.` |
| **Input file exists** | If the command consumes a file (e.g., `/wbWork` needs a plan), that file must exist. | `❌ Error: Plan file not found. Run /wbPlan first.` |
| **Task exists** | For `--task=N`, the task index must exist in the plan table. | `❌ Error: Task #7 not found in plan table.` |
| **Task is open** | For `/wbWork --task=N`, the task's Done column must be ⬜ or 🔨. | `⚠️ Warning: Task #3 is already ✅ Done. Re-executing will reset state.` |
| **No circular deps** | The Dep column must form a DAG (no cycles). | `❌ Error: Circular dependency detected: #2 → #5 → #2.` |

#### Post-Condition Checks

| Check | Rule | Error on Failure |
|---|---|---|
| **Output created** | The command must produce its expected output file. | `❌ Error: Expected output file was not created.` |
| **Output schema valid** | The output file must match the command's schema (correct H1, required sections). | `⚠️ Warning: Output file is missing required sections.` |
| **Links resolve** | All relative markdown links in the output must point to existing files. | `⚠️ Warning: Broken link detected in output.` |

---

### 7. Invalid Composition Patterns

#### 7.1 Skipping the Plan

```
/wbAudit <scope>  →  /wbWork <scope>      ❌ INVALID
```

**Why:** `/wbWork` requires a plan file with a task table. It cannot execute audit findings directly. The correct chain is:

```
/wbAudit <scope>  →  /wbPlan <scope>  →  /wbWork <plan> --task=N    ✅ VALID
```

#### 7.2 Validating Before Executing

```
/wbPlan <scope>  →  /wbValid <plan> --task=N      ❌ INVALID
```

**Why:** `/wbValid` requires a task report to validate. The task must be ✅ Done first.

#### 7.3 Circular Composition

```
/wbAudit <scope>  →  /wbPlan <scope>  →  /wbAudit <scope>      ⚠️ VALID but caution
```

**Why:** This is technically valid — you can re-audit after planning to verify the plan addresses all findings. However, this creates an infinite loop if automated. Always include a termination condition (e.g., "re-audit only once").

#### 7.4 Cross-Scope Composition

```
/wbAudit packages/wb-core  →  /wbPlan packages/wb-press2      ❌ INVALID
```

**Why:** The audit findings are scoped to `wb-core`. Creating a plan for `wb-press2` based on `wb-core` findings is a scope mismatch. The source link would be invalid.

---

### 8. Error Recovery Patterns

| Error | Recovery |
|---|---|
| Missing plan file | Run `/wbPlan <scope>` to create one. |
| Missing context.md | Run `/wbContext <scope>` to bootstrap identity. |
| Stale plan (>7 days) | Run `/wbPlan <scope> --resume` to refresh state. |
| Broken task report link | Run `/wbPlan <plan_file>` in self-correct mode. |
| Task stuck in 🔨 | Run `/wbPlan <scope> --id=N --open` to reset. |
| Validation score < 7 | Re-execute with `/wbWork <plan> --task=N`. |

---

### 9. Composition Constraints Summary

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

### 10. Version History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-05-10 | Initial specification. Covers 11 commands, 4 canonical chains, 7 constraints. |

---


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

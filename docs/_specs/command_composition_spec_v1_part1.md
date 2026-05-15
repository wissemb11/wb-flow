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

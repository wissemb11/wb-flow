# /wbHelp — Examples: Basic Help Output

> These annotated transcripts demonstrate the most common `/wbHelp` invocations: getting help for a specific command and browsing the full command catalog.
> *Context: We are operating within `packages/wb-core`.*

---

## Example 1: Help for a Specific Command

```text
$ /wbHelp wbAudit

[AI] Loading help for /wbAudit...
```

**Generated Output:**

```markdown
## /wbAudit — The Technical Inspector & Debt Analyzer

**Role:** 🔍 Inspector
**Action:** Scans codebases for technical debt, security vulnerabilities, and architectural anti-patterns.
**Output:** Audit report in `reports/<date>/audits/`

### Syntax
/wbAudit <scope> [flags]

### Flags
| Flag | Short | Description |
|---|---|---|
| `--profile` | `-p` | Apply a scan profile: `security`, `performance`, `architecture` |
| `--depth` | `-d` | Scan depth: `shallow` (files only) or `deep` (AST analysis) |
| `--plan` | — | Auto-generate a `/wbPlan` from findings |

### Examples
/wbAudit packages/wb-core                  # full audit
/wbAudit packages/wb-core -p security      # security-focused
/wbAudit packages/wb-core --plan           # audit + auto-plan

### Related Commands
/wbPlan (consumes audit findings) → /wbWork (executes plan tasks)
```

**Annotations:**
- `/wbHelp <command>` always returns the same structured format: Role, Syntax, Flags table, Examples, Related Commands.
- The output is generated from the command's template file, not hardcoded — so it stays current with template updates.

---

## Example 2: Full Command Catalog

```text
$ /wbHelp

[AI] Loading wb-flow command catalog...
```

**Generated Output:**

```markdown
## wb-flow Command Catalog

### 🔍 Inspectors
| Command | Role | Description |
|---|---|---|
| `/wbAudit` | Technical Inspector | Scans for debt, vulnerabilities, anti-patterns |
| `/wbValid` | Quality Validator | Validates completed task reports against criteria |

### 🧠 Planners
| Command | Role | Description |
|---|---|---|
| `/wbPlan` | Strategic Planner | Decomposes work into task tables |
| `/wbIdea` | Idea Incubator | Generates and scores improvement ideas |
| `/wbVision` | Strategic Visionary | Produces long-term vision documents |

### 🔨 Executors
| Command | Role | Description |
|---|---|---|
| `/wbWork` | Task Executor | Executes individual plan tasks |
| `/wbClean` | Code Janitor | Removes dead code, orphaned assets |
| `/wbRefactor` | Code Restructurer | Restructures live code |

### 📋 Utilities
| Command | Role | Description |
|---|---|---|
| `/wbGit` | Commit Author | Generates conventional commit messages |
| `/wbTrack` | Session Tracker | Writes session narratives |
| `/wbStandup` | Standup Reporter | Generates daily standup summaries |
| `/wbContext` | Identity Builder | Generates context.md files |
| `/wbNext` | Advisor | Suggests next actions |
| `/wbHelp` | Help Router | Displays command help (this command) |

---
Type `/wbHelp <command>` for detailed help on any command.
```

**Annotations:**
- No-argument `/wbHelp` returns the role-grouped catalog.
- Commands are grouped by their classification role (Inspector, Planner, Executor, Utility).

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

---
title: "wbHelp — Examples: Basic Help Output"
description: "Annotated transcript examples demonstrating common wbHelp invocations and catalog browsing."
---

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

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


## /wbHelp — Examples: Advanced Queries

> Part 2 covers advanced `/wbHelp` scenarios: help with flags, contextual help, and the `--help` intercept rule.

---

### Example 3: Help with `--help` Flag Intercept

Any `/wb*` command with `--help` or `-h` triggers the help router instead of executing:

```text
$ /wbPlan packages/wb-core --help

[AI] HELP INTERCEPT: Displaying help for /wbPlan instead of executing.
```

**Generated Output:** (same as `/wbHelp wbPlan`)

**Annotations:**
- This is the **HELP GATE** — documented in every command template between `<!-- HELP_GATE_START -->` and `<!-- HELP_GATE_END -->`.
- When intercepted, NO file reads, writes, or report generation occur.
- The intercept applies to `--help`, `-h`, and `--h` uniformly.

---

### Example 4: Contextual Help (Command + Scope)

```text
$ /wbHelp wbAudit packages/wb-core

[AI] Loading help for /wbAudit...
[AI] Enriching with context from packages/wb-core...
```

**Generated Output:**

```markdown
### /wbAudit — Help (scoped to wb-core)

#### Context-Aware Suggestions
Based on `wb-core/context.md`:
- **Recommended profile:** `architecture` (wb-core is a foundational package)
- **Last audit:** 2026-05-09 (2 days ago, score: 8.5/10)
- **Known issues:** 3 open findings from previous audit

#### Suggested Commands
/wbAudit packages/wb-core -p architecture    # re-audit architecture
/wbAudit packages/wb-core --plan             # audit + auto-plan for open findings
```

**Annotations:**
- Adding a scope to `/wbHelp` triggers **contextual help** — the output includes scope-specific suggestions.
- This reads `context.md` and recent reports to provide actionable recommendations.

---

### Example 5: Unknown Command

```text
$ /wbHelp wbDeploy

[AI] ❌ Unknown command: /wbDeploy
[AI] Did you mean one of these?
[AI]   /wbDebug — The Debugger & Root Cause Analyst
[AI]   /wbClean — The Janitor & Sanitization Agent
[AI] 
[AI] Type /wbHelp for the full command catalog.
```

**Annotations:**
- Fuzzy matching suggests the closest commands by Levenshtein distance.
- The error is non-fatal — help is always a safe operation.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wbStandup — Expert Architecture

> How `/wbStandup` aggregates session activity into a structured daily summary.

---

## 1. System Role

`/wbStandup` is a **summarizer**. It reads today's reports (task reports, audit reports, plan updates) and produces a concise session summary.

| Property | Value |
|---|---|
| **Role** | 📋 Mechanical (summary) |
| **Input** | Folder path |
| **Output** | Standup report in `reports/YYYY/MM/DD/standups/` |
| **Mutates files** | No (creates new report only) |

---

## 2. Data Sources

`/wbStandup` reads from today's report directory:

| Source | What It Extracts |
|---|---|
| `plans/tasks/task_*/` | Completed tasks, validation scores |
| `audits/` | Audit findings and score changes |
| `plans/plan_*.md` | Task table state (done/open counts) |
| `tracks/` | Session tracking data if available |

---

## 3. Output Structure

```markdown
## Standup: <scope> — YYYY-MM-DD

### Done today
- Task #1: <title> (score)
- Task #2: <title> (score)

### In progress
- Task #3: started, not completed

### Blocked
- Task #5: waiting on Task #4

### Next session
- Recommended actions from /wbNext analysis
```

---

## 4. Aggregation Rules

| Rule | Description |
|---|---|
| **Time window** | Only includes reports from today (UTC date boundary) |
| **Deduplication** | Same task completed and validated = one entry |
| **Score display** | Shows validation score if available |
| **Blocking detection** | Identifies tasks with unsatisfied dependencies |

---

## 5. Multi-Scope Standups

For monorepo-wide summaries:

```bash
/wbStandup .   # root scope — aggregates all packages
```

This scans all child `reports/` directories and produces a consolidated summary across packages.

---

## 6. Integration

| Workflow Position | Context |
|---|---|
| **After** `/wbValid --task=*` | Summarize validated work |
| **Before** `/wbGit` | Summary informs commit message |
| **End of day** | Final action before stopping work |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

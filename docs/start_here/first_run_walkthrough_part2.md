# First Run Walkthrough — Understanding the Output

> Part 2 explains how to read the output files, understand the plan table format, and continue executing remaining tasks.

---

## 5. Understanding the Plan Table

Open your plan file and you'll see a table like this:

```markdown
| # | Requires | Dep | Task | Verify | P | Est. Time | Worker | Validator | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 🔨 Worker | — | Add unit tests | npm test | P1 | 30 | AI | AI | ✅ AI | ✅ 9/10 AI |
| 2 | 🔨 Worker | — | Remove unused exports | grep check | P1 | 10 | AI | AI | ⬜ | ⬜ |
| 3 | 🔨 Worker | — | Add JSDoc | grep check | P2 | 45 | AI | AI | ⬜ | ⬜ |
| 4 | 🔨 Worker | — | Fix package.json | npm validate | P2 | 5 | AI | — | ⬜ | ⬜ |
```

### Column Guide

| Column | Meaning |
|---|---|
| `#` | Task number (links to report when done) |
| `Requires` | Role needed (🔨 Worker, 🧠 Planner, ✅ Validator) |
| `Dep` | Which task(s) must finish first (`—` = none) |
| `Task` | What needs to be done |
| `Verify` | Command to check the work |
| `P` | Priority (P1 = highest) |
| `Est. Time` | Estimated minutes |
| `Worker` | Suggested AI model for execution |
| `Validator` | Suggested AI model for validation |
| `☐ Done` | ⬜ = pending, 🔨 = in progress, ✅ = complete |
| `☐ Valid` | ⬜ = not validated, ✅ = validated with score |

---

## 6. Continuing with Remaining Tasks

Now execute the rest of your plan:

```bash
# Task #2 — quick win (10 min estimate)
/wbWork plan_my-project_20260511.md --task=2

# Task #3 — larger task (45 min)
/wbWork plan_my-project_20260511.md --task=3

# Task #4 — trivial (5 min)
/wbWork plan_my-project_20260511.md --task=4
```

### Tips for Execution Order

| Strategy | When to Use |
|---|---|
| **By priority** (P1 first) | Default — always a safe choice |
| **By time** (shortest first) | When you want quick wins for momentum |
| **By dependency** (unblocked first) | When tasks have `Dep` entries |

---

## 7. After All Tasks Are Done

When every task shows ✅ in the Done column:

```bash
# Validate all at once
/wbValid plan_my-project_20260511.md --task=*

# Generate a standup summary
/wbStandup packages/my-project

# Prepare commit message
/wbGit packages/my-project
```

---

## 8. Your Report Tree

After the cycle, your `.wb/workflows/reports/` tree contains:

```
reports/2026/05/11/
├── audits/
│   └── audit_my-project_20260511.md    ← what was found
├── plans/
│   ├── plan_my-project_20260511.md     ← what was planned
│   └── tasks/
│       ├── task_1/
│       │   └── task_1_report_*.md       ← what was done
│       ├── task_2/
│       ├── task_3/
│       └── task_4/
└── standups/
    └── standup_my-project_20260511.md   ← session summary
```

Every step is documented. Every decision is traceable. This is the wb-flow audit trail.

---

## 9. What's Next?

| Goal | Command |
|---|---|
| Continue improving the project | `/wbAudit` (find new issues) |
| Brainstorm improvements | `/wbIdea` (generate scored ideas) |
| Set up daily workflow | Read [The Daily Playbook](../daily_use/the_daily_playbook_part1.md) |
| Build a feature from scratch | Read [Zero to App Tutorial](./tutorial_zero_to_app_part1.md) |

---

← [Start Here Hub](README.md) · [Home](../README.md)

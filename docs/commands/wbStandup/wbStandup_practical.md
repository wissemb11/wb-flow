# wbStandup — Practical Walkthrough

> How to generate and use daily standup summaries.

---

## 1. End-of-Day Standup

```bash
/wbStandup packages/my-project
```

```text
[AI] ## Standup: my-project — 2026-05-11
[AI]
[AI] ### Done today
[AI] - Task #1: Add unit tests (✅ 9/10)
[AI] - Task #2: Remove unused exports (✅ 10/10)
[AI] - Task #3: Add JSDoc (✅ 8/10)
[AI]
[AI] ### Next session
[AI] - Task #4: Fix package.json description (5 min)
[AI] - Re-audit for score improvement
```

---

## 2. When to Run

| Timing | Purpose |
|---|---|
| End of work session | Capture what was accomplished |
| Before `/wbGit` | Summary informs the commit message |
| Start of next session | Review yesterday's standup for context |

---

## 3. The Evening Trifecta

The recommended end-of-day sequence:

```bash
/wbValid plan_*.md --task=*    # 1. Validate all work
/wbStandup .                   # 2. Generate summary
/wbGit .                       # 3. Prepare commit message
```

---

## 4. Reading Past Standups

Previous standups are in the reports tree:

```
reports/2026/05/11/standups/standup_my-project_20260511.md
reports/2026/05/10/standups/standup_my-project_20260510.md
```

Use these for sprint retrospectives or progress tracking.

---

## 5. Monorepo Standup

```bash
/wbStandup .   # from monorepo root
```

Aggregates activity across all packages into one summary, showing which packages had work done today.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

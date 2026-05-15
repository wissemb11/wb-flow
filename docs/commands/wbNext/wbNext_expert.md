# wbNext — Expert Architecture

> How `/wbNext` reads the plan DAG, evaluates task readiness, and recommends the optimal next action.

---

## 1. System Role

`/wbNext` is a **read-only advisor**. It analyzes the current plan state and recommends what to do next. It never modifies files or executes tasks.

| Property | Value |
|---|---|
| **Role** | 📋 Mechanical (advisory) |
| **Input** | Plan file or folder path |
| **Output** | Ranked list of recommended next actions |
| **Mutates files** | Never |

---

## 2. Decision Algorithm

```
1. Find the most recent plan file for the given scope
2. Parse the task table and dependency graph
3. Filter to tasks where: Done = ⬜ AND all Deps are ✅
4. Rank by: Priority (40%) + Unblock count (20%) + Time estimate (30%) + Recency (10%)
5. Present top 3 recommendations with rationale
```

---

## 3. Ranking Factors

| Factor | Weight | Description |
|---|---|---|
| **Priority** | 40% | P1 tasks rank higher than P2, P3 |
| **Time estimate** | 30% | Shorter tasks rank higher (quick wins) |
| **Unblock count** | 20% | Tasks that unblock more downstream tasks rank higher |
| **Recency** | 10% | Tasks in the same category as the last completed task rank higher (flow state) |

---

## 4. Output Format

```text
[AI] Analyzing plan: plan_my-project_20260511.md
[AI]   7 tasks total: 3 ✅ Done, 4 ⬜ Open
[AI]
[AI] Recommended next:
[AI]   1. /wbWork --task=4  (P1, 10 min, unblocks #6 and #7)
[AI]   2. /wbWork --task=5  (P1, 15 min, unblocks #7)
[AI]   3. /wbValid --task=1,2,3  (validate completed work)
```

---

## 5. No-Plan Fallback

When no plan exists for the given scope:

```text
[AI] No active plan found for packages/my-project.
[AI]
[AI] Suggested actions:
[AI]   1. /wbAudit packages/my-project  (assess current state)
[AI]   2. /wbPlan packages/my-project   (create a plan)
[AI]   3. /wbIdea packages/my-project   (brainstorm improvements)
```

---

## 6. Integration Points

| Scenario | What /wbNext Recommends |
|---|---|
| All tasks done, none validated | `/wbValid --task=*` |
| All tasks done and validated | `/wbStandup` then `/wbGit` |
| Plan is stale (>7 days) | `/wbPlan --resume` or new `/wbAudit` |
| No plan exists | `/wbAudit` → `/wbPlan` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

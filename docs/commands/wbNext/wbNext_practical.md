# wbNext — Practical Walkthrough

> How to use `/wbNext` to stay in flow and always know what to do next.

---

## 1. Basic Usage

```bash
/wbNext packages/my-project
```

```text
[AI] Analyzing plan_my-project_20260511.md...
[AI]   10 tasks: 6 ✅, 4 ⬜
[AI]
[AI] Recommended next:
[AI]   1. /wbWork --task=7  (P1, deps satisfied, 15 min)
[AI]   2. /wbWork --task=8  (P1, deps satisfied, 20 min)
[AI]   3. /wbValid --task=4,5,6 (3 unvalidated tasks)
```

---

## 2. When to Use

| Situation | Run /wbNext? |
|---|---|
| Starting a new session | ✅ Yes — see where you left off |
| Just finished a task | ✅ Yes — get next recommendation |
| Unsure what to do | ✅ Yes — let the DAG decide |
| Mid-task | ❌ No — finish current task first |

---

## 3. Interpreting Recommendations

The output tells you:
- **Task number** — which task to execute
- **Priority** — P1 tasks always appear first
- **Dependencies** — confirms all prerequisites are met
- **Time estimate** — helps you pick based on available time

---

## 4. Common Patterns

```bash
# Morning start — what should I do first?
/wbNext .

# After completing a task — what's next?
/wbWork plan_*.md --task=7
/wbNext .

# End of day — anything left?
/wbNext .
# If empty: /wbStandup then /wbGit
```

---

## 5. With No Active Plan

```bash
/wbNext packages/new-project
```

```text
[AI] No active plan found.
[AI] Suggested: /wbAudit packages/new-project
```

This is the expected starting point for any new project — audit first, then plan, then work.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

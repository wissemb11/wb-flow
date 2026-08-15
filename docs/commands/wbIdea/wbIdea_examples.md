# /wbIdea — Examples

> `/wbIdea` captures speculative ideas with scores. This file shows three scenarios: registering ideas natively, ideas from `/wbVision`, and the full promote-to-plan lifecycle.

---

## Example 1 — `/wbIdea packages/wb-dataviewer`

```text
$ /wbIdea packages/wb-dataviewer

[AI] Loading context.md...
[AI] Loading recent reports/...
[AI] - Last audit: clean, 2 P3 cosmetic findings
[AI] - Active plan: 3/5 tasks done
[AI]
[AI] Writing reports/2026/05/08/ideas/idea_wb-dataviewer_20260508.md:
```

```markdown
# Idea Backlog: wb-dataviewer — 2026-05-08

## 💡 Ideas — AI-generated for wb-dataviewer *(the AI agent via Antigravity — 14:30)*
> **Model:** the AI agent
> **Date:** 2026-05-08

| # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 8 | 📄 | Add column-level search with multi-color highlighting | P1 | 45 | the AI agent via /wbIdea | ⬜ | ⬜ | — |
| 2 | 6 | 📄 | Support row grouping by any column value | P2 | 120 | the AI agent via /wbIdea | ⬜ | ⬜ | — |
| 3 | 4 | 📄 | Add CSV/XLSX export button to toolbar | P2 | 30 | the AI agent via /wbIdea | ⬜ | ⬜ | — |
| 4 | 9 | 📄 | Implement virtual scrolling for 10k+ row datasets | P1 | 240 | the AI agent via /wbIdea | ⬜ | ⬜ | — |
```

**What's worth noticing:**
- Scores range from 4 to 9. The model didn't inflate everything to 8+.
- Idea #4 (virtual scrolling) scores highest because it's high-impact + high-urgency for large datasets.
- Idea #3 (CSV export) scores 4 — nice-to-have but low urgency.

---

## Example 2 — Ideas auto-registered from `/wbVision`

```text
$ /wbVision packages/wb-core

[AI] Writing vision file...
[AI] Auto-registering 3 ideas in idea_wb-core_20260508.md...
```

The idea file now has a `/wbVision`-sourced entry:

```markdown
## 💡 Ideas — /wbVision proposals *(the AI agent via Cline — 10:15)*
> **Source:** `vision_wb-core_20260508.md`
> **Origin Command:** `/wbVision packages/wb-core/`
> **Ideas registered:** 3

| # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 7 | 📄 | Server-driven view config (admin pushes layout without rebuild) | P2 | 120 | the AI agent via /wbVision | ⬜ | ⬜ | — |
| 2 | 9 | 📄 | Diff view (compare two dataset snapshots row-by-row) | P1 | 480 | the AI agent via /wbVision | ⬜ | ⬜ | — |
| 3 | 3 | 📄 | Dark mode theme tokens | P3 | 30 | the AI agent via /wbVision | ⬜ | ⬜ | — |
```

**What's worth noticing:**
- Each idea links back to the vision file.
- Scores reflect the vision's own Effort/Value assessment (diff view = high value, scored 9).

---

## Example 3 — Full lifecycle: Explore → Validate → Promote

### Step 1: Explore idea #4

```text
$ /wbWork idea_wb-dataviewer_20260508.md --id=4

[AI] Reading idea #4: "Implement virtual scrolling for 10k+ row datasets"
[AI] Exploring...
[AI] Writing ideas_reports/idea_4/idea_4_report_wb-dataviewer_20260508.md
[AI] Updated ☐ Done to ✅
```

### Step 2: Validate idea #4

```text
$ /wbValid idea_wb-dataviewer_20260508.md --id=4

[AI] Reading exploration report...
[AI] Verdict: 🎯 Promote (9/10)
[AI] "Virtual scrolling is critical for the 10k+ dataset use case.
[AI] Feasibility is high — existing row rendering can be wrapped.
[AI] Recommend P1 priority in plan."
[AI] Appended validation to idea_4_report.
[AI] Updated ☐ Valid to: 🎯 Promoted 9/10
[AI] Executing Promotion Protocol...
[AI] → Added as Task #6 in plan_wb-dataviewer_20260508.md
[AI] → Updated → Task column: `→ Plan #6`
```

### The idea file now shows:

```markdown
| `4` | 9 | 📄 | Virtual scrolling for 10k+ rows | P1 | 240 | the AI agent via /wbIdea | ✅<br>the AI agent | 🎯 Promoted 9/10<br>the agent 4.6 | `→ Plan #6` |
```

### The plan file now shows (auto-ingested):

```markdown
| 6 | 💡 `/wbIdea #4` | Virtual scrolling for 10k+ rows | /wbTest packages/wb-dataviewer --scope=task-6 | P1 | 240 | the AI agent · ~$0.20 | the AI agent | ⬜ | ⬜ |
```

---

## The pattern

1. **Register** → ideas appear with scores in `idea_*.md`.
2. **Explore** → `/wbWork idea_*.md --id=N` writes a feasibility report.
3. **Validate** → `/wbValid idea_*.md --id=N` assigns a verdict (promote/recommend/defer/reject).
4. **Promote** → `🎯 Promoted` ideas auto-ingested by `/wbPlan` as task rows.
5. **Execute** → normal `/wbWork plan_*.md --id=N` on the promoted task.

---

# /wbIdea — Expert

## What `/wbIdea` architecturally is

A **scored idea pipeline** between `/wbVision` (dreaming) and `/wbPlan` (committing). It provides the missing lifecycle phase: speculative ideas tracked with advisory scores, validated through exploration, and promoted to plan tasks only when justified.

```
wbVision ──► wbIdea ──► wbPlan ──► wbWork ──► wbValid
 (dream) (capture) (commit) (execute) (verify)
```

**Ideas are not tasks.** No worker/validator assignments, no cost estimates, no DAG dependencies. They have scores, verdicts, and a promotion protocol. The idea file is a staging area; the plan file is the execution contract.

## Three design decisions

### 1. Advisory Score (1–10) vs Priority (P0–P3)
Score = "should this become a task?" Priority = "how urgently should we evaluate it?" A P1/Score-3 idea means "evaluate urgently, but the idea is marginal." Scoring heuristic: `impact × 0.4 + feasibility × 0.3 + urgency × 0.3`.

### 2. Promotion Protocol (ideas → plan)
When `/wbValid` gives `🎯 Promoted`, the idea's `→ Task` column links to the plan. When `/wbPlan` runs, it scans for promoted ideas and auto-ingests them. Unidirectional: ideas flow into plans, never reversed.

### 3. Dual-pipeline with `/wbVision`
`/wbVision` always registers its ideas in `idea_*.md`. Two outputs: free-form vision file (human reading) + tracked idea rows (pipeline processing).

## Verdict scale

| Verdict | Score | Meaning |
|---|---|---|
| `🎯 Promote` | 8–10 | Deserves a plan row. Auto-promotes. |
| `✅ Recommend` | 5–7 | Good idea. Revisit when capacity allows. |
| `⏸️ Defer` | 3–4 | Wrong timing. Context may change. |
| `🚫 Reject` | 1–2 | Not worth pursuing. Reasoning documented. |

## Producer/Consumer integration

**Producers:** `/wbIdea` (native), `/wbVision` (always), `/wbAudit --ideas`, `/wbWork "idea:..."`, `/wbNext --ideas`.

**Consumers:** `/wbWork idea_*.md` (explores), `/wbExplain` (details), `/wbValid` (verdict + promotion), `/wbPlan` (ingestion).

## Where it leaks

1. **Score inflation** — models tend toward 6–8. Counter: "re-score assuming you implement it this week."
2. **Idea drift** — 30-day-old rows never validated. Run `--resume` monthly.
3. **Vision spam** — cross-package vision adds 6–10 rows. By design; validation filters.
4. **Promotion without exploration** — `--promote` skips feasibility analysis.

What `wb-flow-docs`'s playbook gets wrong about `/wbIdea`: framing it as a brainstorming tool, when the actual design is score-gated — ideas are evaluated and scored before promotion. The promotion protocol (idea to plan task) is the key innovation, not the idea capture itself.

## One-paragraph verdict

Fills the gap between brainstorming and planning. Score, verdict scale, and promotion protocol create a lightweight lifecycle for speculative improvements. Most valuable when ideas exceed capacity. Least valuable when ideas are few and obvious — skip to `/wbPlan`.

---

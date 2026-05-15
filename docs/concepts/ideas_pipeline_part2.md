# The Ideas Pipeline — Scoring Algorithm & Handoff Protocol

> Part 2 covers the scoring algorithm internals, the promotion-to-plan handoff protocol, and edge cases in the Ideas Pipeline lifecycle.

---

## 7. Scoring Algorithm Deep Dive

The scoring formula is a weighted composite of four factors:

```
Score = (Impact × 0.4) + (Urgency × 0.3) + (Feasibility × 0.2) + (Alignment × 0.1)
```

### Factor Definitions

#### Impact (40%)
| Score | Criteria |
|---|---|
| 9–10 | Fixes a critical bug or eliminates major technical debt |
| 7–8 | Significant improvement to performance, DX, or security |
| 4–6 | Nice-to-have feature or minor improvement |
| 1–3 | Cosmetic change or marginal benefit |

#### Urgency (30%)
| Score | Criteria |
|---|---|
| 9–10 | Currently blocking other work or causing production issues |
| 7–8 | Will become blocking within 1–2 sprints |
| 4–6 | Important but not time-sensitive |
| 1–3 | No time pressure |

#### Feasibility (20%)
| Score | Criteria |
|---|---|
| 9–10 | Can be done in <1 hour with existing tools |
| 7–8 | Straightforward implementation, <1 day |
| 4–6 | Requires research or new dependencies |
| 1–3 | Requires architectural changes or external approvals |

#### Alignment (10%)
| Score | Criteria |
|---|---|
| 9–10 | Directly mentioned in context.md goals |
| 7–8 | Clearly supports stated project direction |
| 4–6 | Neutral — neither aligned nor misaligned |
| 1–3 | Orthogonal to project goals |

### Score Calibration

The AI doesn't use arbitrary numbers. It anchors scores against known patterns:

| Context Signal | Impact on Score |
|---|---|
| Issue mentioned in recent `/wbAudit` | +2 to Urgency |
| Feature mentioned in context.md roadmap | +2 to Alignment |
| Similar idea rejected in a past session | −1 to overall Score |
| Dependency already in package.json | +1 to Feasibility |

---

## 8. The Promotion Handoff Protocol

When `/wbValid` issues a 🎯 Promote verdict, the handoff follows a strict protocol:

### Step 1: Create Task Entry

The system appends a new row to the active plan:

```markdown
| 4 | 💡 [/wbIdea #1](../ideas/idea_auth-service_20260511.md) | Distributed rate limiting | /wbTest --scope=task-4 | P1 | 180 | AI · ~$0.23 | AI | ⬜ | ⬜ |
```

Note the `💡` prefix in the Requires column — this marks the task as originating from the Ideas Pipeline.

### Step 2: Update Idea File

```markdown
| [1](ideas_reports/...) | 9 | 📄 | ... | P1 | 180 | ... | ✅ AI | 🎯 Promoted 8/10 AI | [→ Plan #4](../plans/...) |
```

### Step 3: Cross-Link

Both files link to each other, creating a bidirectional traceability chain:
- Idea → Plan (via `→ Task` column)
- Plan → Idea (via `Requires` column with `💡` prefix)

---

## 9. Edge Cases

### 9.1: Duplicate Ideas

If `/wbIdea` generates an idea that already exists in the backlog:

| Detection | Action |
|---|---|
| Exact title match | Skip — do not add duplicate |
| Semantic overlap (>80% similar) | Add with `⚠️ May duplicate #N` flag |
| Related but distinct | Add normally with cross-reference |

### 9.2: Promoted Idea Fails in Execution

If a promoted idea's plan task fails (validation score < 7):

```
Idea (Promoted) → Plan Task (Failed) → ?
```

Options:
1. **Re-execute** the plan task with a different worker
2. **Demote** — return the idea to the pipeline with status `🔄 Rework`
3. **Cancel** — mark both the plan task and idea as 🚫

### 9.3: Multi-Source Ideas

When the same idea comes from both `/wbIdea` and `/wbVision`:

```markdown
| 5 | 8 | 📄 | Distributed rate limiting | P1 | 180 | AI via /wbIdea, /wbVision | ⬜ | ⬜ | — |
```

The `Suggested By` column lists both sources. The score is the **higher** of the two scores.

### 9.4: Empty Pipeline

If `/wbIdea` generates zero ideas:

```
[AI] ✅ No improvement opportunities detected for auth-service.
[AI] The package appears well-maintained. Consider running /wbVision for strategic ideas.
```

This is a valid outcome — not an error.

---

## 10. Pipeline Metrics

Track pipeline health with these metrics:

| Metric | Formula | Healthy Range |
|---|---|---|
| **Capture Rate** | Ideas generated per session | 3–8 per scope |
| **Promotion Rate** | Promoted ÷ Captured | 30–50% |
| **Time-to-Promote** | Days from capture to promotion | < 3 days |
| **Execution Rate** | Completed tasks from promoted ideas | > 80% |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

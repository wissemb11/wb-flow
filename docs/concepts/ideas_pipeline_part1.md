# The Ideas Pipeline — The 5-Stage Lifecycle

> The Ideas Pipeline is wb-flow's structured incubation system. It transforms raw brainstorming into validated, executable plan tasks through a deterministic 5-stage lifecycle.

---

## 1. The Five Stages

```
Capture → Score → Explore → Validate → Promote
```

| Stage | Command | Input | Output | Decision |
|---|---|---|---|---|
| **Capture** | `/wbIdea` | Folder scope | Idea backlog file | Ideas are recorded |
| **Score** | (automatic) | Context analysis | Score 1–10 per idea | Priority ranking |
| **Explore** | `/wbWork --idea=N` | Idea entry | Exploration report | Feasibility assessed |
| **Validate** | `/wbValid --idea=N` | Exploration report | Verdict + rationale | Promote / Reject / Defer |
| **Promote** | (automatic) | Validated idea | Plan task entry | Idea becomes work |

---

## 2. Stage 1: Capture

```bash
/wbIdea packages/auth-service
```

The AI reads `context.md`, recent audit reports, and source code to generate a scored list of improvement ideas.

### Output Format

```markdown
## 💡 Ideas — AI-generated for auth-service

| # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 9 | 📄 | Implement distributed rate limiting | P1 | 180 | AI | ⬜ | ⬜ | — |
| 2 | 5 | 📄 | Add WebAuthn support | P2 | 360 | AI | ⬜ | ⬜ | — |
```

### Capture Sources

Ideas can enter the pipeline from three sources:

| Source | How |
|---|---|
| **Native** | `/wbIdea <scope>` — AI brainstorms based on context |
| **Vision** | `/wbVision <scope>` — Strategic vision auto-registers ideas |
| **Manual** | User adds rows directly to the idea file |

---

## 3. Stage 2: Score

Scoring happens automatically during capture. Each idea receives a score (1–10) based on:

| Factor | Weight | Description |
|---|---|---|
| **Impact** | 40% | How much does this improve the codebase? |
| **Urgency** | 30% | Is this blocking other work or causing issues now? |
| **Feasibility** | 20% | Can this be done with current resources and knowledge? |
| **Alignment** | 10% | Does this fit the project's stated goals in context.md? |

### Score Interpretation

| Score | Meaning | Action |
|---|---|---|
| 8–10 | High value, urgent | Explore immediately |
| 5–7 | Moderate value | Explore when bandwidth allows |
| 1–4 | Low value or high risk | Defer or discard |

---

## 4. Stage 3: Explore

```bash
/wbWork idea_auth-service_20260511.md --idea=1
```

The AI conducts a feasibility study:
- Analyzes the codebase for implementation complexity
- Identifies dependencies and potential conflicts
- Generates an implementation sketch
- Estimates effort and risk

### Exploration Report Structure

```markdown
# Exploration: Idea #1 — Distributed Rate Limiting

## Feasibility: ✅ High
## Risk: 🟡 Medium (Redis dependency)
## Estimated Effort: 180 mins (original estimate accurate)

## Implementation Sketch
1. Add Redis client to package.json
2. Create RateLimiter service with sliding window algorithm
3. Integrate with auth middleware
4. Add configuration to context.md

## Dependencies
- Redis server (external dependency)
- @redis/client ^4.0.0 (new package)

## Risks
- Redis connection failure → fallback to in-memory limiting
- Cluster synchronization latency in multi-node deployments
```

---

## 5. Stage 4: Validate

```bash
/wbValid idea_auth-service_20260511.md --idea=1
```

A validator (ideally a different model) reviews the exploration report and issues a verdict:

| Verdict | Symbol | Meaning |
|---|---|---|
| **Promote** | 🎯 | Idea is validated. Ingest into the active plan. |
| **Reject** | ❌ | Idea is not viable. Remove from pipeline. |
| **Defer** | ⏸️ | Idea is viable but not now. Revisit later. |
| **Rework** | 🔄 | Exploration was insufficient. Re-explore. |

---

## 6. Stage 5: Promote

When an idea receives a 🎯 Promote verdict, the system automatically:

1. **Creates a plan task** in the active plan file
2. **Links** the idea to the task via the `→ Task` column
3. **Updates** the idea's `☐ Valid` column with the verdict and score

### Before Promotion

```markdown
| 1 | 9 | 📄 | Distributed rate limiting | P1 | 180 | AI | ✅ | ⬜ | — |
```

### After Promotion

```markdown
| [1](ideas_reports/idea_1/...) | 9 | 📄 | Distributed rate limiting | P1 | 180 | AI | ✅ | 🎯 8/10 | [→ Plan #4](../plans/plan_*.md) |
```

The idea has graduated from incubation into the execution pipeline.

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

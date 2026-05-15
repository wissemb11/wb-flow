# /wbIdea — Expert: Ideas Pipeline Architecture

> This page documents the internal architecture of `/wbIdea` — how it generates ideas, the scoring algorithm, and the data flow from capture through promotion.

---

## 1. Execution Flow

```
/wbIdea <scope>
  │
  ├─ 1. Read context.md (identity, goals, dependencies)
  ├─ 2. Read recent audit reports (open findings)
  ├─ 3. Read recent plan files (completed tasks, open tasks)
  ├─ 4. Scan source code (surface-level, not AST)
  │
  ├─ 5. Generate candidate ideas (8–15 raw candidates)
  ├─ 6. Score each candidate (weighted composite)
  ├─ 7. Rank and filter (top 4–8 by score)
  ├─ 8. Format as idea table
  │
  └─ 9. Write idea_<scope>_<date>.md
```

---

## 2. Context Signal Priority

The AI weighs different context sources differently when generating ideas:

| Source | Weight | What It Provides |
|---|---|---|
| **Recent audit findings** | High | Known issues → high-urgency ideas |
| **context.md goals** | High | Strategic direction → aligned ideas |
| **Completed tasks** | Medium | Avoids re-suggesting solved problems |
| **Source code patterns** | Medium | Anti-patterns → refactoring ideas |
| **Package dependencies** | Low | Upgrade opportunities → maintenance ideas |

---

## 3. The Scoring Engine

Each candidate idea is scored using a 4-factor weighted formula:

```
Score = round(Impact×0.4 + Urgency×0.3 + Feasibility×0.2 + Alignment×0.1)
```

### Scoring Calibration Anchors

The AI doesn't score in a vacuum — it anchors against these known patterns:

| Pattern Detected | Score Adjustment |
|---|---|
| Audit finding with severity "critical" | Urgency +3 |
| Feature mentioned in context.md roadmap | Alignment +2 |
| Idea rejected in previous session | Overall −1 |
| Dependency already in package.json | Feasibility +1 |
| Idea requires new external service | Feasibility −2 |
| Similar code exists in sibling packages | Impact +1 (can share) |

---

## 4. Deduplication Logic

Before writing the final idea table, the engine checks for duplicates:

| Check | Method | Action |
|---|---|---|
| Exact title match | String comparison | Skip (do not add) |
| Semantic overlap >80% | Embedding similarity | Add with `⚠️ May duplicate #N` |
| Related concept | Keyword overlap | Add with cross-reference link |

---

## 5. Output Schema

Every idea file follows this exact schema:

```markdown
# Idea Backlog: <scope> — <YYYY-MM-DD>

## 💡 Ideas — AI-generated for <scope> *(Model via wb-flow — HH:MM)*
> **Model:** <model name>
> **Date:** <YYYY-MM-DD>

| # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|
```

### Schema Rules

| Field | Rule |
|---|---|
| `#` | Sequential integer starting at 1 |
| `Score` | 1–10 integer |
| `🔗` | Always `📄` (links to exploration report when done) |
| `P` | P1/P2/P3 derived from Score (8+ → P1, 5-7 → P2, 1-4 → P3) |
| `→ Task` | `—` until promoted, then `[→ Plan #N](...)` |

---

## 6. Multi-Source Merging

When ideas come from multiple commands (`/wbIdea`, `/wbVision`, manual), they merge into a single file:

```markdown
## 💡 Ideas — AI-generated *(AI — 09:15)*
| 1 | 9 | 📄 | Rate limiting | P1 | 180 | AI via /wbIdea | ...

## 💡 Ideas — /wbVision proposals *(AI — 11:30)*
| 2 | 8 | 📄 | Retry mechanism | P1 | 120 | AI via /wbVision | ...

## 💡 Ideas — Manual additions
| 3 | 7 | 📄 | Dashboard widget | P2 | 240 | User (manual) | ...
```

Each source gets its own `## 💡 Ideas` section with a distinct header.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

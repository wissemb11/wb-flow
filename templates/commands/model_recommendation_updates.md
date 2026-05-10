# Model Recommendation Updates — Summary

> **Date:** 2026-04-29
> **Scope:** All `/wb*` command templates that recommend models for next steps

---

## What Was Changed

### 1. `/wbPlan` template (`wbPlan/wbPlan_template.md`)

**Before:** Single generic model per role (e.g., "Qwen3 Coder 480B", "Gemini 2.5 Flash")
**After:** 2-3 ordered models per role from the user's actual inventory

| Role | 🏆 1st Pick | 🥈 2nd Pick | 💰 3rd (Budget) |
|---|---|---|---|
| 🧠 Planning | Claude Opus 4.6 | Gemini 3.1 Pro | — |
| 💻 Code Worker | DeepSeek V4 Pro (free) | Claude Sonnet 4.6 ($3) | GLM-5.1 (free) |
| ✅ Validator | Claude Sonnet 4.6 ($3) | DeepSeek V4 Pro (free) | Claude Opus 4.6 (critical) |
| ⚡ Mechanical | Gemini 3 Flash ($0.50) | DeepSeek V4 Flash (free) | GPT 5 Nano (free) |
| 🔍 Debug | Claude Sonnet 4.6 ($3) | DeepSeek V4 Pro (free) | Gemini 3.1 Pro ($2) |
| 🌍 Translation | GLM-5.1 (free) | Qwen3.6 Plus ($0.50) | — |

**Example task rows updated** to use real model names:
```
💻 DeepSeek V4 Pro/Claude Sonnet 4.6/Model1
⚡ Gemini 3 Flash/DeepSeek V4 Flash/Model2
```

### 2. `/wbTrack` template (`wbTrack/wbTrack_template.md`)

**Three additions:**

1. **"Suggested Command Sequence"** table — added `Recommended Models (ordered)` column
2. **"My Recommendation"** section — added rule: "For each recommendation, specify 2-3 models"
3. **"First Command"** section — added `Recommended Model:` field
4. **"Recommended Next"** table (in each §N section) — added `Recommended Models (ordered)` column

---

## Commands That Recommend Models Downstream

These are all the `/wb*` commands whose output reports suggest/recommend models for next steps:

| Command | Where it recommends models | What was updated |
|---|---|---|
| `/wbPlan` | Plan task table (Worker Model / Validator Model columns) | ✅ Model Selection Guide updated with 2-3 picks per role |
| `/wbTrack` | §0 Suggested Command Sequence + each §N Recommended Next | ✅ Added "Recommended Models (ordered)" column to all tables |
| `/wbStandup` | Suggests next commands (informational only) | ℹ️ No template change needed — reads from reports |
| `/wbAudit` | "Top 10 Actions" may suggest worker models | ℹ️ No template change — auditor uses model_recommendations.md |
| `/wbReview` | May suggest follow-up commands | ℹ️ No template change — reviewer uses model_recommendations.md |

> [!NOTE]
> Commands like `/wbTest`, `/wbClean`, `/wbGit`, `/wbPublish`, `/wbDeploy` do NOT recommend models — they are mechanical and execute in isolation.

---

## The Ordering Rule

All model recommendations in output reports MUST follow this pattern:

```
🏆 Best (performance) → 🥈 Good (balance) → 💰 Budget (cheap/free)
```

Example in a plan task row:
```
💻 DeepSeek V4 Pro / Claude Sonnet 4.6 / GLM-5.1
    ^                  ^                   ^
    Free (Go sub)      $3/M (Zen)         Free (Go sub)
    Best coder         Best debugger       Good multilingual
```

The **first model is always the recommended pick** — agents should default to it unless there's a specific reason to use an alternative.

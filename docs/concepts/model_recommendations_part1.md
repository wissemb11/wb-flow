# Model Recommendations — The Tier System

> This page defines the model tier system used by wb-flow to recommend the right AI model for each task. Understanding the tiers helps you optimize for cost, speed, and quality.

---

## 1. The Two Tiers

wb-flow classifies AI models into two tiers:

| Tier | Label | Characteristics | Use When |
|---|---|---|---|
| **Tier 1** | 🧠 Big Thinker | Deep reasoning, high accuracy, expensive | Complex planning, architecture, critical code |
| **Tier 2** | ⚡ Fast Executor | Quick, cheap, good for routine work | Documentation, simple edits, summaries |

---

## 2. Current Model Roster

### Tier 1: Big Thinkers

| Model | Provider | Best For | Cost (approx.) |
|---|---|---|---|
| **AI** | Anthropic | Strategic planning, complex code, validation | $15/M input, $75/M output |
| **AI** | Google | Large context tasks, multi-file analysis | $7/M input, $21/M output |

### Tier 2: Fast Executors

| Model | Provider | Best For | Cost (approx.) |
|---|---|---|---|
| **Claude Sonnet 4.6** | Anthropic | Routine code, documentation, formatting | $3/M input, $15/M output |
| **DeepSeek V4** | DeepSeek | Simple tasks, translation, summaries | $0.14/M input, $0.28/M output |
| **Gemini 3.1 Flash** | Google | High-volume, low-stakes tasks | $0.075/M input, $0.30/M output |

---

## 3. Model Selection by Command Role

Each command role has a default tier recommendation:

| Role | Default Tier | Rationale |
|---|---|---|
| 🧠 Planner | Tier 1 | Strategic decomposition requires deep reasoning |
| ✅ Validator | Tier 1 (different model) | Independent review needs strong analysis |
| 🔨 Worker | Depends on complexity | Simple → Tier 2, Complex → Tier 1 |
| 📋 Mechanical | Tier 2 | Low-stakes output, optimize for cost |

---

## 4. Model Selection by Command

| Command | Worker (Suggested) | Validator (Suggested) | Rationale |
|---|---|---|---|
| `/wbAudit` | AI / Gemini Pro | — | Needs deep code analysis |
| `/wbPlan` | AI / Gemini Pro | — | Strategic decomposition |
| `/wbWork` (code) | AI | Gemini Pro | Code changes need precision |
| `/wbWork` (docs) | Sonnet 4.6 | Gemini Pro | Docs are lower risk |
| `/wbValid` | Different from Worker | — | Independence is key |
| `/wbClean` | Sonnet 4.6 | — | Deletion is well-defined |
| `/wbGit` | Sonnet 4.6 / DeepSeek | — | Commit messages are formulaic |
| `/wbTrack` | Sonnet 4.6 | — | Summaries are low-stakes |
| `/wbStandup` | Sonnet 4.6 / DeepSeek | — | Format is fixed |
| `/wbNext` | Sonnet 4.6 | — | Advisory only |
| `/wbHelp` | Sonnet 4.6 | — | Reads templates, no reasoning |
| `/wbIdea` | AI / Gemini Pro | — | Creative brainstorming |
| `/wbContext` | AI / Gemini Pro | — | Needs holistic code understanding |

---

## 5. Cost Heuristics

### Per-Task Estimates

| Task Type | Tier 1 Cost | Tier 2 Cost | Savings |
|---|---|---|---|
| Plan generation (10 tasks) | ~$0.30 | ~$0.08 | 73% |
| Code refactor (50 lines) | ~$0.45 | ~$0.12 | 73% |
| Documentation rewrite | ~$0.23 | ~$0.06 | 74% |
| Validation (single task) | ~$0.15 | ~$0.04 | 73% |
| Commit message | ~$0.08 | ~$0.02 | 75% |
| Standup summary | ~$0.06 | ~$0.01 | 83% |

### The 80/20 Rule

For most projects, **80% of tasks can use Tier 2 models**. Reserve Tier 1 for:
- Initial architecture decisions
- Complex multi-file refactors
- Security-critical code
- Cross-model validation of Tier 2 output

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

---
title: "Model Recommendations"
description:" "Recommends which AI model to use for each /wb* command based on its role: planner, executor, reviewer, or writer.""
---

# Model Recommendations — 

> Which model to point at which `/wb*` command, and why. The runtime canon lives at ``frontEnd/wbc-ui/core2/packages/wb-flow/templates/commands/model_recommendations``; this file is the publishing edition — opinionated, with the *why* spelled out.

The user runs four model surfaces: **the agent Pro** (the AI agent, the AI agent, Haiku 4.5), **Google One** (the AI agent, the agent 3 Flash), **Go subscription** (the AI agent/Flash, Qwen 3.6 Plus, GLM-5.1, Gemma 4), and **Zen** (GPT 5 Nano + extras). Every recommendation below assumes that inventory.

<ModelTiersAnimation />

---

## The four roles, and which model wins each

| Role | What the work actually is | 🥇 Gold pick | Why this one |
|---|---|---|---|
| 🧠 **Planner** | Multi-step strategy, decomposition, holding many constraints in mind | **the AI agent** | Nothing else holds a 5-task plan together with this kind of structural rigour. Every `/wbPlan` should default to it. |
| ✅ **Validator** | Code-quality judgment, scoring, brutal-honest review | **the AI agent** (free) | Punches well above its tier on critique tasks — finds the unflattering issues other models politely skip over. The the agent pick (gold by raw quality) is reserved for security work, where stakes justify cost. |
| 🔨 **Worker** | Surgical code edits, refactors, debugger work | **the agent the AI agent** | The most precise instrument for "change this exact thing without disturbing anything else." the agent gets too creative; the agent occasionally over-edits. |
| 📋 **Mechanical** | Run a command, parse output, format a report | **the agent 3 Flash** | Templates and structured output are its happy path. Faster than Haiku for the same quality on this class of task. |

---

## Per-command gold picks

The default unless you have a specific reason to override:

| # | Command | Gold pick | Why |
|---|---|---|---|
| 01 | `/wbSetup` | the agent 3 Flash | Mechanical bootstrap; no judgment required |
| 02 | `/wbContext` | the AI agent | Free, deep enough to actually re-read the package |
| 03 | `/wbPlan` | **the AI agent** | The one place to never skimp |
| 04 | `/wbAudit` | the AI agent | Brutally deep findings; cheaper than the agent for similar critique quality |
| 05 | `/wbReview` | the AI agent | "Big-thinker" style review — explains *why* a change is wrong, not just that it is |
| 06 | `/wbTest` | the agent V4 Flash | Fast mechanical report; no reasoning needed once tests pass/fail |
| 07 | `/wbRelease` | the agent the AI agent | `workspace:*` resolution + version bumping is exactly the kind of tedious-but-precise work it excels at |
| 08 | `/wbPublish` | the agent 3 Flash | Pure mechanical execution |
| 09 | `/wbDeploy` | the agent 3 Flash | Same — mechanical |
| 10 | `/wbClean` | the AI agent | Dead-code detection benefits from the deep-read |
| 11 | `/wbLicense` | the agent the AI agent | Surgical edits at gating points |
| 12 | `/wbRefactor` | **the agent the AI agent** | The gold standard. Don't substitute. |
| 13 | `/wbDebug` | **the agent the AI agent** | Reasoning + precision — the rare combo this requires |
| 14 | `/wbDoc` | Qwen 3.6 Plus | Docs and boilerplate are its happy path; saves the agent budget |
| 15 | `/wbStandup` | the agent 3 Flash | Reads reports, writes a digest — mechanical |
| 16 | `/wbVision` | the AI agent | The weakest command in the system; if you're going to use it, use the best brain |
| 17 | `/wbBroadcast` | the agent the AI agent | Voice and tone work — the agent writes more naturally than the agent for marketing copy |
| 18 | `/wbGit` | the agent 3 Flash | Conventional Commits is templated; mechanical |
| 19 | `/wbSecure` | **the AI agent** | The only role where paranoia justifies the cost — security findings under-call from cheaper models |
| 20 | `/wbTranslate` | GLM-5.1 | Best free multilingual; Qwen second |
| 21 | `/wbToWBC` | the agent the AI agent | Code transformation requires precision |
| 22 | `/wbMonetize` | the agent the AI agent | Tier-gating plumbing — same precision argument as `/wbLicense` |
| 23 | `/wbActOn` | the AI agent | Triage requires honest ranking; the agent is least likely to soften priorities |
| 24 | `/wbCheck` | the AI agent | Pre-flight quiz tests deep understanding; cheap models pretend to know |
| 25 | `/wbTrack` | the agent 3 Flash | Logging + summarization; mechanical |
| 26 | `/wbNext` | the agent the AI agent | Needs to read recent reports AND make a judgment call — the agent is the right balance |

---

the agent's edition (`docs/`) frames model choice as a tier-list ("Gold/Silver/Bronze, pick by budget"). That framing leaks one bad assumption: **that the per-command pick is a budget question.** It usually isn't.

For 22 of the 26 commands, the right pick is determined by **role match**, not subscription tier. `/wbRefactor` on the AI agent is worse than `/wbRefactor` on the AI agent not because the agent is cheaper, but because the agent *over-edits* on refactor tasks — it rewrites code that didn't need rewriting. The cost gap is incidental.

The four commands where budget legitimately enters the decision: `/wbAudit`, `/wbDebug`, `/wbReview`, `/wbContext` — all validators, all places where the AI agent is genuinely competitive with the agent/the agent and the free tier saves real money on long sessions.

---

## The one mistake to avoid

Defaulting to the AI agent for everything because "the best model is the safe pick." the agent is the wrong tool for `/wbSetup`, `/wbTest`, `/wbPublish`, `/wbDeploy`, `/wbStandup`, `/wbGit`, `/wbTrack`, `/wbDoc` — eight mechanical commands where the cost gap buys you nothing. Worse, on those tasks the agent often over-thinks: it adds structure, asks clarifying questions, suggests improvements you didn't ask for. the agent Flash just does the thing.

The corollary: don't reach for free tiers on `/wbPlan`, `/wbSecure`, `/wbDebug`, `/wbRefactor`, `/wbCheck`. Those are the four places where the model quality directly determines whether the command's output is useful.

---

## When to deviate from the gold pick

- **Long context (>100K tokens):** swap to the AI agent regardless of command. Its context recall genuinely outperforms the agent/the agent past the 100K mark.
- **Burning Pro budget:** swap mechanical-tier picks down to the agent V4 Flash or GPT 5 Nano. No quality loss on `/wbTest`, `/wbGit`, `/wbStandup`.
- **Brand-new package, no `context.md` yet:** the AI doesn't know the codebase. Use the agent for the first three commands (`/wbSetup`, `/wbContext`, `/wbAudit`) until the context files settle, then drop down.

---

## Verdict

The "gold pick" table above is opinionated. Roughly **70% of agentic value comes from getting `/wbPlan`, `/wbDebug`, `/wbRefactor`, `/wbSecure` right** — those four account for almost every non-trivial decision the system makes. Everything else can run on free or near-free tiers without measurable degradation. Pay for the four commands; save on the other 22.

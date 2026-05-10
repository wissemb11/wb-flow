# Model Recommendations per `/wb*` Command

> **Date:** 2026-05-09 (updated — full 32-command roster)
> **Based on:** Go + Zen + Google One + Claude Pro
> **Planning model (fixed):** Claude Opus 4.7 (Antigravity)

---

## The Logic

| Role | What it needs | 🏆 Top 3 (best, regardless of budget) | Budget sweet spot |
|---|---|---|---|
| 🧠 **Planner** | Deep reasoning, strategy, multi-step | Claude Opus 4.7 / Gemini 3.1 Pro / DeepSeek V4 Pro | Claude Opus 4.7 |
| ✅ **Validator** | **Big Thinker**: Deep reasoning, code quality judgment, score | Claude Opus 4.7 / Gemini 3.1 Pro / DeepSeek V4 Pro | Claude Opus 4.7 / Gemini 3.1 Pro |
| 🔨 **Worker** | **Coder/Executor**: Code generation, file edits, execution | Claude Sonnet 4.7 / DeepSeek V4 Pro / Qwen 3.6 Plus | Claude Sonnet 4.7 / DeepSeek V4 Pro |
| 📋 **Mechanical** | Run command, read output, format report | Gemini 3 Flash / DeepSeek V4 Flash / Gemini 3.1 Pro | Gemini 3 Flash / DeepSeek V4 Flash |

---

## Command → Model Table (v4.6 — full roster)

> Numbering follows the canonical order in `wb_commands_reference.json` plus `wbIdea` (template-only) and `wbStopTrack` (sibling of `wbTrack`). Total: **32 commands**.

| # | Command | Role | Complexity | 🏆 Best (Zen/Pro) | 🥈 Best (G-One/Go) | 💰 Budget | 🎯 My Pick | Why this one |
|---|---|---|---|---|---|---|---|---|
| 01 | `/wbSetup` | 📋 Mechanical | Low | Claude Haiku 4.5 | Gemini 3 Flash ★ | GPT 5 Nano | **Gemini 3 Flash** | Fast & reliable |
| 02 | `/wbContext` | ✅ Validation | Medium | Claude Sonnet 4.7 | DeepSeek V4 Pro ★ | Qwen3.6 Plus | **DeepSeek V4 Pro** | Free & deep |
| 03 | `/wbPlan` | 🧠 Strategy | **High** | **Claude Opus 4.7** ★ | Gemini 3.1 Pro | DeepSeek V4 Pro | **Claude Opus 4.7** | The gold standard |
| 04 | `/wbAudit` | ✅ Validation | **High** | Claude Opus 4.7 | DeepSeek V4 Pro ★ | Gemini 3.1 Pro | **DeepSeek V4 Pro** | Brutally deep findings |
| 05 | `/wbReview` | ✅ Validation | **High** | Claude Sonnet 4.7 | Gemini 3.1 Pro ★ | DeepSeek V4 Pro | **Gemini 3.1 Pro** | Excellent "big thinker" |
| 06 | `/wbTest` | 📋 Mechanical | Low | Claude Haiku 4.5 | DeepSeek V4 Flash ★ | Gemini 3 Flash | **DeepSeek V4 Flash** | Fast mechanical report |
| 07 | `/wbRelease` | 📋 Mechanical | Medium | Claude Sonnet 4.7 | Gemini 3 Flash ★ | DeepSeek V4 Flash | **Gemini 3 Flash** | Versioning + changelog template work |
| 08 | `/wbPublish` | 📋 Mechanical | Low | Claude Haiku 4.5 | Gemini 3 Flash ★ | DeepSeek V4 Flash | **Gemini 3 Flash** | npm publish is mechanical |
| 09 | `/wbDeploy` | 📋 Mechanical | Medium | Claude Sonnet 4.7 | Gemini 3 Flash ★ | DeepSeek V4 Pro | **Gemini 3 Flash** | Run command + format report |
| 10 | `/wbClean` | 📋 Mechanical | Low | Claude Haiku 4.5 | DeepSeek V4 Flash ★ | GPT 5 Nano | **DeepSeek V4 Flash** | Pure file deletion |
| 11 | `/wbLicense` | 📋 Mechanical | Low | Claude Haiku 4.5 | Gemini 3 Flash ★ | GPT 5 Nano | **Gemini 3 Flash** | Header insertion is templated |
| 12 | `/wbRefactor` | 🔨 Worker | **High** | **Claude Sonnet 4.7** ★ | DeepSeek V4 Pro | Gemma 4 | **Claude Sonnet 4.7** | Best surgical code edits |
| 13 | `/wbDebug` | 🔨 Worker | **High** | **Claude Sonnet 4.7** ★ | DeepSeek V4 Pro | Gemini 3.1 Pro | **Claude Sonnet 4.7** | Reasoning + Precision |
| 14 | `/wbDoc` | 🔨 Worker | Medium | Claude Sonnet 4.7 | Qwen 3.6 Plus ★ | DeepSeek V4 Pro | **Qwen 3.6 Plus** | Strong doc/boilerplate generator |
| 15 | `/wbStandup` | ✅ Validation | Medium | Claude Sonnet 4.7 | Gemini 3.1 Pro ★ | DeepSeek V4 Pro | **Gemini 3.1 Pro** | Long-context summarization across reports |
| 16 | `/wbVision` | 🧠 Strategy | **High** | **Claude Opus 4.7** ★ | Gemini 3.1 Pro | DeepSeek V4 Pro | **Claude Opus 4.7** | Long-horizon strategy framing |
| 17 | `/wbBroadcast` | 📋 Mechanical | Low | Claude Haiku 4.5 | Gemini 3 Flash ★ | DeepSeek V4 Flash | **Gemini 3 Flash** | Templated multi-channel post |
| 18 | `/wbGit` | 📋 Mechanical | Low | Claude Haiku 4.5 | DeepSeek V4 Flash ★ | Gemini 3 Flash | **DeepSeek V4 Flash** | Run git, parse output |
| 19 | `/wbSecure` | ✅ Validation | **High** | Claude Opus 4.7 ★ | Gemini 3.1 Pro | DeepSeek V4 Pro | **Claude Opus 4.7** | Paranoid security judgment |
| 20 | `/wbTranslate` | 🔨 Worker | Medium | Claude Sonnet 4.7 | GLM 5.1 ★ | Qwen 3.6 Plus | **GLM 5.1** | Multilingual fidelity at $0 |
| 21 | `/wbToWBC` | 🔨 Worker | **High** | **Claude Sonnet 4.7** ★ | DeepSeek V4 Pro | Gemini 3.1 Pro | **Claude Sonnet 4.7** | Surgical conversion to WBC primitives |
| 22 | `/wbMonetize` | 🧠 Strategy | **High** | **Claude Opus 4.7** ★ | Gemini 3.1 Pro | DeepSeek V4 Pro | **Claude Opus 4.7** | Pricing + GTM reasoning |
| 23 | `/wbActOn` | ✅ Validation | Medium | Claude Sonnet 4.7 | Gemini 3.1 Pro ★ | DeepSeek V4 Pro | **Gemini 3.1 Pro** | Re-rank + annotate plan files |
| 24 | `/wbCheck` | 📋 Mechanical | Low | Claude Haiku 4.5 | DeepSeek V4 Flash ★ | Gemini 3 Flash | **DeepSeek V4 Flash** | Status probe + format |
| 25 | `/wbWork` | 🔨 Worker | **High** | **Claude Sonnet 4.7** ★ | DeepSeek V4 Pro | GLM 5.1 | **Claude Sonnet 4.7** | Plan execution = surgical edits |
| 26 | `/wbValid` | ✅ Validation | **High** | Claude Opus 4.7 ★ | Gemini 3.1 Pro | DeepSeek V4 Pro | **Claude Opus 4.7** | Score-per-task needs the deepest judge |
| 27 | `/wbExplain` | ✅ Validation | Medium | Claude Sonnet 4.7 | Gemini 3.1 Pro ★ | DeepSeek V4 Pro | **Gemini 3.1 Pro** | Pedagogical clarity at long context |
| 28 | `/wbHelp` | 📋 Mechanical | Low | Claude Haiku 4.5 | Gemini 3 Flash ★ | GPT 5 Nano | **Gemini 3 Flash** | Read catalog → format help text |
| 29 | `/wbNext` | ✅ Validation | Medium | Claude Sonnet 4.7 | Gemini 3.1 Pro ★ | DeepSeek V4 Pro | **Gemini 3.1 Pro** | Reads many reports to recommend next step |
| 30 | `/wbTrack` | 📋 Mechanical | Medium | Claude Sonnet 4.7 | Gemini 3.1 Pro ★ | DeepSeek V4 Flash | **Gemini 3.1 Pro** | Append-only walkthrough; long context wins |
| 31 | `/wbStopTrack` | 📋 Mechanical | Medium | Claude Sonnet 4.7 | Gemini 3.1 Pro ★ | DeepSeek V4 Pro | **Gemini 3.1 Pro** | Derivative extraction across whole session |
| 32 | `/wbIdea` | 🧠 Strategy | **High** | **Claude Opus 4.7** ★ | Gemini 3.1 Pro | DeepSeek V4 Pro | **Claude Opus 4.7** | Open-ended ideation = deepest reasoning |

---

## Role-Based Summary (Top 10)

> Ranks 1–5 are pulled directly from the v4.6 command table above. Ranks 6–10 are **honorable mentions** — models not currently in the user's primary subscriptions but widely available in OSS rotations (marked *ext* for "external"). Swap them with models you actually have access to.

### 🧠 Planning / Strategic Validation (Big Thinkers)
| Rank | Model | Tier | Price/1M | Why |
|---|---|---|---|---|
| 🥇 #1 | **Claude Opus 4.7** | Pro | (Sub) | Best reasoning, multi-step strategy. Wins on rows 03/16/19/22/26/32. |
| 🥈 #2 | **Gemini 3.1 Pro** | G-One | (Sub) | Strong reasoning + 200K+ context champion. Best 2nd pick on long-doc audits. |
| 🥉 #3 | **DeepSeek V4 Pro** | Go | (Free) | Great reasoning for $0. Wins row 04 (`/wbAudit`) outright. |
| 4 | **Claude Sonnet 4.7** | Pro | (Sub) | Solid Zen/Pro fallback when Opus is overkill (rows 04, 19, 26 podium). |
| 5 | **GLM 5.1** | Go | (Free) | Free reasoning backstop when DeepSeek is busy; strong on multilingual reasoning. |
| 6 | **GPT 5 Pro** | *ext* | $$$ | Independent second-opinion on Opus's strategic calls; different training lineage = different blind spots. |
| 7 | **Grok 4** | *ext* | $$ | Long-form reasoning; useful when you want a non-mainstream perspective on `/wbVision` / `/wbMonetize`. |
| 8 | **Mistral Large 3** | *ext* | $$ | EU-hosted reasoner; reliable backup planner if you need data-residency. |
| 9 | **Llama 4 Maverick** | *ext* | (Self) | Self-hostable big thinker; useful if subscription budget is tight and you have GPU. |
| 10 | **Command R+** | *ext* | $ | RAG-tuned reasoner; shines when planning over very large doc corpuses. |

### 🔨 Worker (Coders / Executors)
| Rank | Model | Tier | Price/1M | Why |
|---|---|---|---|---|
| 🥇 #1 | **Claude Sonnet 4.7** | Pro | (Sub) | Most precise code generator. Wins rows 12/13/21/25. |
| 🥈 #2 | **DeepSeek V4 Pro** | Go | (Free) | Free powerhouse for refactoring; consistent 2nd pick across worker rows. |
| 🥉 #3 | **Qwen 3.6 Plus** | Go | (Free) | Great for docs/boilerplate (row 14 winner). |
| 4 | **GLM 5.1** | Go | (Free) | Multilingual fidelity; wins row 20 (`/wbTranslate`). |
| 5 | **Gemma 4** | Go | (Free) | Budget refactor backup (row 12 budget slot). |
| 6 | **Codestral 3** | *ext* | $ | Code-specialized model from Mistral; strong on TS/Vue surgical edits. |
| 7 | **GPT 5 Codex** | *ext* | $$ | Reliable second-opinion worker; pairs well with Sonnet for cross-validation. |
| 8 | **DeepSeek V4 Flash** | Go | (Free) | Heavy-mechanical worker (rename refactors, batch edits) when V4 Pro is busy. |
| 9 | **Llama 4 Code** | *ext* | (Self) | Self-hosted coder; viable for sensitive code that can't leave your infra. |
| 10 | **StarCoder 3** | *ext* | (Self) | Last-resort OSS coder for boilerplate; weaker on novel logic. |

### 📋 Mechanical
| Rank | Model | Tier | Price/1M | Why |
|---|---|---|---|---|
| 🥇 #1 | **Gemini 3 Flash** | G-One | (Sub) | Template master. Wins rows 01/07/08/09/11/17/28. |
| 🥈 #2 | **DeepSeek V4 Flash** | Go | (Free) | Fast & free output parser. Wins rows 06/10/18/24. |
| 🥉 #3 | **Gemini 3.1 Pro** | G-One | (Sub) | Long-context mechanical work (rows 30/31 winner; tracking + derivative extraction). |
| 4 | **Claude Haiku 4.5** | Pro | (Sub) | Best Zen/Pro fallback on most mechanical rows. |
| 5 | **GPT 5 Nano** | Zen | Free | Single-command tasks; ultra-cheap budget slot. |
| 6 | **Qwen 3.6 Plus** | Go | (Free) | Pulls double-duty as mechanical formatter when worker queue is full. |
| 7 | **Mistral Small 3** | *ext* | $ | Cheap, fast, EU-hosted; good for status reports and CI summaries. |
| 8 | **Gemma 4 Flash** | *ext* | (Self) | Self-hosted templating; viable for offline / air-gapped runs. |
| 9 | **GPT 4.1 Mini** | *ext* | $ | Legacy mechanical fallback; reliable but slower than Gemini 3 Flash. |
| 10 | **Phi 5 Mini** | *ext* | (Self) | Tiny self-hosted formatter; last resort when nothing else is reachable. |

---

## 🛡️ User Subscriptions Inventory
1. **Claude Pro**: Opus 4.7, Sonnet 4.7 (Priority for High Complexity).
2. **Google One**: Gemini 3.1 Pro, Gemini 3 Flash (Priority for Long Context/Mechanical).
3. **Go Subscription**: DeepSeek V4 Pro/Flash (Default free workers).

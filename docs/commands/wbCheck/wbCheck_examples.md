---
title: "wbCheck — Examples"
description: "Generates 6 monorepo-wide questions."
---

# /wbCheck — Examples

> `/wbCheck` is the only command you run BEFORE another command. It's a gate, not a task.
> ⚠️ Examples use a **fictional package "wb-demo"** to avoid leaking real answer-key data.

---

## /wbCheck vs other commands

| `/wbCheck` | `/wbTrack` | `/wbReview` | `/wbAudit` |
|---|---|---|---|
| "Does the model understand my code?" | "Log every command with commentary" | "Did the model do what the plan said?" | "Is this code ready to ship?" |
| Runs BEFORE the task | Runs DURING the session | Runs AFTER the task | Runs independently |
| Tests the MODEL | Tracks the SESSION | Tests the OUTPUT | Tests the CODE |
| 30-second quiz | Toggle on/off | 5-minute inspection | 15-minute deep dive |

---

## Example 1 — `wbcheck` (no args) → Monorepo quiz

**Terminal:**
```bash
$ wbcheck
```
Generates 6 monorepo-wide questions. You copy them.

**Model chat (OpenCode with Qwen3):**

You paste the `/wbCheck` prompt with the 6 questions. Qwen reads the workspace, answers, and ends with:
> "I have answered all the quiz questions. Did I pass? (yes/no)"

**Score: 5/6 = ✅ PASS**

```
You: yes
Model: ✅ Verified and ready. Send me any /wb* command.
```

**That's it.** No walkthrough question. No extra steps. The model is verified and you start working.

---

## Example 2 — `wbcheck wb-demo wbTest` → Targeted quiz → Quick start

**Terminal:**
```bash
$ wbcheck wb-demo wbTest
```
6 questions (3 identity + 3 testing).

**Model chat:** Model answers → asks "Did I pass?" → 6/6 → You say "yes" → ✅ Verified.

**Next:** You send `/wbTest packages/wb-demo` directly.

---

## Example 3 — `wbcheck wb-demo wbAudit` → FAIL

**Terminal:**
```bash
$ wbcheck wb-demo wbAudit
```

**Model chat (GPT 5 Nano):**
- Hallucinated the framework version → ❌
- Fabricated a sanitization approach → ❌

Model asks: "Did I pass?" → You say: `no`

**Model:** "Understood. This session ends here."

**You close the window.** Switch to a stronger model.

---

## Example 4 — /wbCheck + /wbTrack (independent combo)

**Scenario:** New model, long documented session.

```
Step 1: wbcheck wb-core ← terminal: generate questions
Step 2: Paste to model ← model answers quiz
Step 3: You grade → PASS → "yes" ← model is verified
Step 4: /wbTrack packages/wb-core ← start tracking (separate command)
Step 5: /wbTest wb-core ← creates report + §1 in session
Step 6: /wbStopTrack ← ends session, extracts derivatives
```

**Key:** `/wbCheck` and `/wbTrack` are independent commands. You can use one without the other.

---

## The Pattern

Every `/wbCheck` answers three meta-questions:

1. **Does the model know WHAT this is?** (identity questions)
2. **Does the model know HOW it works?** (architecture/testing/build)
3. **Can it give SPECIFIC facts, not generic statements?** (numbers, filenames, exact versions)

If the answers are specific and correct → the model read your code.
If the answers are vague or wrong → the model is guessing from training data.

---

## Basic Usage

```bash
# Standard command execution
/wbCheck frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbCheck deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbCheck` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbCheck target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbCheck target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbCheck target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbCheck packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbCheck apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbCheck` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbCheck frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

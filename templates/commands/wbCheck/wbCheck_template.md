# /wbCheck — Pre-Flight Context Quiz


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbCheck`

# /wbCheck: Practical Guide 🛠️ (Claude version)

## The problem /wbCheck solves

You have 23 `/wb*` commands and multiple AI models. Some models are cheap but may not understand your codebase. If you send `/wbRefactor` to a model that doesn't know Vue 2.7 from Vue 3, it will rewrite your Options API as Composition API and break everything.

**The fix:** A 30-second quiz that catches this before damage happens.

## The security model

```
YOU:   Have the answer key ([private quiz tool])
WORKER: Only has access to workspace files (source code)
RULE:  Worker must prove understanding from CODE, not from a cheat sheet
```

The worker never sees the answers. It can only pass by actually reading `WBC.js`, `package.json`, `TEST_REPORT.md`, etc. If it fabricates answers, you catch it because you have the keywords to compare against.

## Real example (generic — no answer-key data shown)

Before running `/wbTest` with DeepSeek V4 Flash:

```bash
$ wbcheck wb-core wbTest

# Script outputs 6 random questions (3 identity + 3 testing)
# You copy them to DeepSeek
# DeepSeek reads the source code and answers
# You press Enter → compare against your private answer key
```

How you grade:
- If the model gives **exact numbers** matching TEST_REPORT.md → ✅ (it read the file)
- If the model gives **round numbers or wrong counts** → ❌ (hallucinating from training data)

## Command-category mapping

The script knows which topics matter for each command:

| Command | What it asks about | Why |
|---|---|---|
| `/wbTest` | identity + testing | Must know test runner, counts, failing files |
| `/wbRefactor` | identity + architecture | Must know mixins, this-binding, Vue version |
| `/wbAudit` | identity + architecture + security | Must know everything |
| `/wbSecure` | identity + security | Must know safeEval, DOMPurify, tier bypass |
| `/wbRelease` | identity + build | Must know dist folders, npm name, Vite |

## When to skip

Don't quiz a model you've already verified on this package with no code changes since. Don't quiz Opus/Antigravity (it has persistent context). Only quiz new or cheap models on unfamiliar packages.

> For deeper reading: [`docs_claude/commands/wbCheck/wbCheck_practical_claude.md`](../../docs/docs_claude/commands/wbCheck/wbCheck_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).
<!-- HELP_GATE_END -->

> **Command #24** in the `/wb*` suite
> **Purpose**: Verify that a worker model understands the target context before you assign it a real task.
> **Who runs it**: **You** (the human orchestrator).
> **Note on conventions**: `/wbCheck` does NOT produce a structured output report — it runs a quiz interactively. The shared [`output_conventions.md`](../_shared/output_conventions.md) (relative links, full-syntax commands, self-correct mode) does **not** apply here. The quiz ends with a verdict, not a report file.

---

## How It Works — Two Parts

### Part A: Terminal (Node.js script)
The script generates quiz questions + answer key. That's all it does.
```bash
wbcheck                   # monorepo-wide quiz (6 questions)
wbcheck wb-core           # all categories for that package (~9 questions)
wbcheck wb-core wbTest    # command-specific quiz (4-6 questions)
```

### Part B: Model Chat (this prompt template)
You copy the quiz questions from terminal → paste to the model. The model answers.
You grade manually using the answer key. Then you tell the model if it passed or failed.

---

## 🚀 The /wbCheck Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbCheck ━━━━━━━━━━━━━

📁 TARGET: __TARGET_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__

━━━ SECURITY RULES (READ FIRST) ━━━

⛔ You MUST NOT run, read, access, or reference `~/.wbcheck/` or any file within it.
⛔ You MUST NOT run `node ~/.wbcheck/wbcheck.js` or any variant of that command.
⛔ You MUST NOT attempt to find, locate, or read the answer key in any way.
⛔ You MUST NOT use terminal commands to search for quiz-related files outside the workspace.

Your ONLY source of truth is the actual source code in the workspace.
If you attempt any of the above, you automatically FAIL this quiz.

━━━ CONTEXT QUIZ ━━━

I need to verify that you understand this codebase before assigning you tasks.
Answer these questions by reading the SOURCE CODE ONLY.
Do NOT guess — say "NOT FOUND" if unsure.

__PASTE_QUESTIONS_HERE__

Format: number + answer. Be concise.

IMPORTANT: At the END of your answer (in the SAME message), you MUST finish with:

  "I have answered all the quiz questions. Did I pass? (yes/no)"

━━━ AFTER I RESPOND ━━━

After I respond to your quiz answers with my verdict:

→ If I say "no":
  Respond: "Understood. This session ends here."
  Do NOT continue. Do NOT offer alternatives. The conversation is over.

→ If I say "yes":
  Respond: "✅ Verified and ready. Send me any /wb* command."
  Stay in this chat. I will give you tasks normally.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Variables to Replace

| Variable | Description | Example |
|---|---|---|
| `__TARGET_PATH__` | Path to the package or app | `packages/wb-core` |
| `__TODAY__` | Today's date (YYYY-MM-DD) | `2026-04-28` |
| `__YOUR_MODEL_NAME__` | Model you're testing | `DeepSeek V4 Flash` |
| `__PASTE_QUESTIONS_HERE__` | Questions from `wbcheck` terminal output | *(copy/paste from terminal)* |

---

## Security Model

```
~/.wbcheck/wbcheck.js         ← PRIVATE (outside workspace, worker CANNOT access this)
  └── contains questions + answers embedded in the script

~/Allprojects/wb-labs/         ← WORKSPACE (workers can read everything here)
  └── frontEnd/wbc-ui/core2/   ← worker reads code here to answer questions
```

The worker **cannot see the answer key**. It can only prove understanding by reading the actual source code.

> [!CAUTION]
> **Known risk:** Models with terminal access (OpenCode, Cline, Antigravity) may attempt to run `node ~/.wbcheck/wbcheck.js` to see the answer key. The prompt's `━━━ SECURITY RULES ━━━` section explicitly forbids this. If a model attempts it anyway, **reject the terminal command** and consider the quiz FAILED — a model that tries to cheat on the quiz will cut corners on real tasks too.

---

## The 3 Quiz Modes

### Mode 1: No args → Monorepo-wide
```bash
wbcheck
```
Tests general monorepo understanding: directory structure, naming, build tools, tier system. 6 questions from the monorepo bank.

### Mode 2: Package only → Full package quiz
```bash
wbcheck wb-core
```
Tests ALL categories for that package (identity + testing + architecture + security + build + history). ~9 questions.

### Mode 3: Package + Command → Targeted quiz
```bash
wbcheck wb-core wbTest
```
Tests only the categories relevant to that command. 4–6 questions.

---

## Command → Category Mapping

| Command | Categories used | Questions picked |
|---|---|---|
| *(no command)* | all 6 categories | 2+2+2+1+1+1 = 9 |
| `/wbTest` | identity + testing | 3 + 3 = 6 |
| `/wbRefactor` | identity + architecture | 2 + 3 = 5 |
| `/wbAudit` | identity + architecture + security | 2 + 2 + 2 = 6 |
| `/wbReview` | identity + architecture + history | 2 + 2 + 2 = 6 |
| `/wbSecure` | identity + security | 2 + 3 = 5 |
| `/wbDoc` | identity + architecture | 2 + 2 = 4 |
| `/wbRelease` | identity + build | 2 + 3 = 5 |
| `/wbContext` | identity + architecture + build | 2 + 2 + 2 = 6 |
| Any other | identity only | 3 |

---

## Grading Rules

| Worker says... | Your verdict |
|---|---|
| Contains key terms from the `🔑 Keywords` list | ✅ Correct |
| Right idea but different wording | ✅ Correct |
| Wrong, fabricated, or contradicts the code | ❌ Wrong |
| "NOT FOUND" (honest about not knowing) | 🟡 Honest — model may need more file access |

### Pass/Fail Thresholds

| Score | Verdict | Action |
|---|---|---|
| **80%+** (e.g. 5/6) | ✅ PASS | Tell the model "yes" |
| **60-79%** (e.g. 4/6) | 🟡 MARGINAL | Give more context files, re-quiz |
| **<60%** (e.g. 3/6) | ❌ FAIL | Tell the model "no", close the chat, switch model |

---

## When to Use /wbCheck

| Situation | Run /wbCheck? |
|---|---|
| Using a **new model** on this package for the first time | ✅ Yes |
| Using a **cheap/free** model (GPT Nano, DS Flash) | ✅ Yes |
| After a **major refactor** changed the codebase | ✅ Yes |
| First time using **any model** on the monorepo | ✅ Yes (no args) |
| Model already passed last time + no code changes | ❌ Skip |
| Using Antigravity (your planner) directly | ❌ Skip |
| Model you trust (Opus, Sonnet) on a familiar package | ❌ Skip |

---

## Related Commands

| Command | Relationship |
|---|---|
| `/wbTrack` | After passing `/wbCheck`, optionally start a tracked session |
| `/wbStandup` | Scans `reports/` for yesterday's outputs — `/wbCheck` has no reports |
| `/wbContext` | Builds context from code — `/wbCheck` tests if the model already has context |

---

## Adding a New Package

Edit `~/.wbcheck/wbcheck.js` and add a new entry to the `BANKS` object:

```javascript
const BANKS = {
  'wb-core': { ... },       // already exists

  'wb-dataviewer': {         // add this
    identity: [
      { id: 'ID-01', q: '...', a: '...', keywords: ['...'] },
      ...
    ],
    testing: [ ... ],
    architecture: [ ... ],
  },
};
```

Or ask Antigravity: _"Generate wbCheck questions for packages/wb-dataviewer"_ — it will read the code and produce a new bank.

---

## Updating Questions

When the codebase changes (new test count, new files, new architecture), update the corresponding answers in `~/.wbcheck/wbcheck.js`:

```javascript
// Example: test count changed after fixing bugs
{
  id: 'TS-03',
  q: 'How many total tests exist, and how many currently fail?',
  a: '<new_total> total, <new_fail> fail, <new_pass> pass',   // ← update
  keywords: ['<new_total>', '<new_fail>', '<new_pass>']         // ← update
}
━━━ AUTO-APPEND FOOTER ━━━

At the VERY END of the file (after "What's Next?"), you MUST append the `## 📂 Generated Files (__YYYYMMDD__)` cross-link footer. Do NOT use simple tables. You MUST use the rich "Tier 1" layout from `_shared/output_conventions.md` §5.

Format required:
```markdown
---
## 📂 Generated Files (__YYYYMMDD__)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files
| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`core2/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```
```

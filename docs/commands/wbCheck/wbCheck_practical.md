# /wbCheck: Practical Guide 🛠️

## The problem /wbCheck solves

You have 23 `/wb*` commands and multiple AI models. Some models are cheap but may not understand your codebase. If you send `/wbRefactor` to a model that doesn't know Vue 2.7 from Vue 3, it will rewrite your Options API as Composition API and break everything.

**The fix:** A 30-second quiz that catches this before damage happens.

## The security model

```
YOU: Have the answer key ([private quiz tool])
WORKER: Only has access to workspace files (source code)
RULE: Worker must prove understanding from CODE, not from a cheat sheet
```

The worker never sees the answers. It can only pass by actually reading `WBC.js`, `package.json`, `TEST_REPORT.md`, etc. If it fabricates answers, you catch it because you have the keywords to compare against.

## Real example (generic — no answer-key data shown)

Before running `/wbTest` with the agent V4 Flash:

```bash
$ wbcheck wb-core wbTest

# Script outputs 6 random questions (3 identity + 3 testing)
# You copy them to the agent
# the agent reads the source code and answers
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

Don't quiz a model you've already verified on this package with no code changes since. Don't quiz the agent/Antigravity (it has persistent context). Only quiz new or cheap models on unfamiliar packages.

---

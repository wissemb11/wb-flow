# /wbCheck: Expert Deep Dive 🎓

## Why this exists

The multi-model workflow has a trust problem. You use 5+ models. Each sees your workspace files, but you have no guarantee it understood them correctly.

A model can:
- **Hallucinate** file contents it never read
- **Confuse** your project with training data
- **Apply wrong patterns** (Vue 3 on a Vue 2 project)

`/wbCheck` solves this with an **asymmetric knowledge test**: you hold the answer key, the model holds only the source code.

## The information asymmetry

```
 YOU (planner) WORKER MODEL
 ✅ Questions ✅ Questions (you sent them)
 ✅ Answers ❌ Answers (never sent)
 ✅ Keywords ❌ Keywords (never sent)
 ✅ Source code ✅ Source code (workspace)
```

The ONLY way the worker can answer correctly is by reading the real source code.

## What makes a good question

| Good question | Bad question |
|---|---|
| "How many tests fail?" (forces reading TEST_REPORT.md) | "Do tests work?" (yes/no) |
| "Name the 6 renderer files" (proves directory traversal) | "What files exist?" (vague) |
| "What does enforceTierLimits emit?" (implementation detail) | "Does tier enforcement exist?" (trivial) |

**Rule:** If answerable with yes/no, it's a bad question.

## Scaling to new packages

1. Run `/wbContext` on the new package
2. Ask Antigravity to generate questions from context.md
3. 3. Add to your private question bank

What `wb-flow-docs`'s playbook gets wrong about `/wbCheck`: presenting it as a comprehensive readiness verification, when the actual scope is deliberately narrow — existence and structure checks only. It cannot validate content correctness (that's /wbReview) or test execution (that's /wbTest). Calling it 'verification' oversells what is fundamentally a pre-flight grep.

## One-paragraph verdict

A lightweight, low-hallucination command that does one thing and does it well — checking existence and structure of expected artifacts. Its value is in the negative signal: a ✅ from `/wbCheck` is weak evidence (the template might still be broken in ways a script can't detect), but a ❌ is strong evidence something is missing. The main risk is scope creep ("let's also check for X, Y, Z") turning it into a swamp of ad-hoc checks. Maintain the discipline of one-check-per-flag, and it stays sharp. Weakest in semantic understanding — it can't tell if a file's content is correct, only that it exists.

---

# /wbValid — Reference Guide

Welcome to the **`/wbValid` Reference Guide**! This document provides everything you need to know to harness the power of the AI Validator in the wb-labs monorepo.

## 🌟 What is `/wbValid`?

`/wbValid` is your automated Quality Assurance expert. It works hand-in-hand with `/wbWork` to ensure that every implemented feature, fix, or refactor perfectly matches the specifications laid out in your `/wbPlan`. It's the ultimate gatekeeper for code quality!

## 🚀 When to Use It

You should trigger `/wbValid` immediately after a worker model has completed a task using `/wbWork`. 
- **The Worker** says "I'm done" by marking the `☐ Done` column as `✅`.
- **The Validator** (this command) verifies the claim and marks the `☐ Valid` column as `✅` if the code passes inspection, or rejects it with feedback.

## 📋 The Command Syntax

```bash
/wbValid <plan_file> --id=<task_id>
```

### Magic Flags & Shortcuts

| Flag | Shortcut | What it does |
|---|---|---|
| `--id` | `-i` | **Required.** Tells the validator which task row(s) to inspect. Supports ranges (`--id=1-3`) and wildcards (`*`). |
| `--open` | `-o` | Instantly resets the `Valid` state to `⬜` (Open). |
| `--def` | `-d` | Marks the validation state as `⏸️` (Deferred). |
| `--help` | `-h` | Pops open the handy help block! |

## 💡 Pro Tips for Success

1. **Use a Different Model:** For the most rigorous validation, always have a different LLM model run `/wbValid` than the one that ran `/wbWork`. If Gemini 3 Flash wrote the code, have DeepSeek V4 Pro or Claude Sonnet 4.7 validate it. Fresh eyes catch more bugs!
2. **Review the Task Reports:** `/wbValid` will generate a detailed validation report in the `tasks/task_<N>/` folder. Always read this report to understand *why* a task passed or failed.
3. **Embrace Rejection:** If `/wbValid` rejects a task, it's doing its job! Use the feedback to run `/wbWork` again and perfect the implementation.

Happy validating!



## Option Categories

Validation options control which checks run, how results are reported, and whether auto-fix is applied. Use `--quick` for pre-flight checks, `--fix` for auto-correction.

## Related

- [wbValid ELI5](wbValid_eli5.md) — Plain English overview
- [wbValid Practical](wbValid_practical.md) — Step-by-step walkthrough
- [wbValid Expert](wbValid_expert.md) — Architecture and edge cases

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

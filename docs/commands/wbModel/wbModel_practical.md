---
title: "wbModel — Practical Recipes & Best Practices"
description: "## Recipe 1: Nightly Batch Execution"
---

# `/wbModel` — Practical Recipes & Best Practices

## Recipe 1: Nightly Batch Execution
Run `/wbModel` across all waves non-interactively using `.wb/bin/wbRun`:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbModel deployement/apps/wb-jobs/ --wave=all -y"
```

## Recipe 2: Custom Heavy Refactoring
Route Worker tasks to DeepSeek V4 Pro and Validator to Claude Sonnet 4.7:

```bash
/wbModel frontEnd/wbc-ui3/ --wave=A --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" -y
```

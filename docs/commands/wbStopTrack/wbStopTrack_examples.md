---
title: "wbStopTrack — Standard Examples (Part 1)"
description: "This guide covers baseline invocations and standard command options for `/wbStopTrack`."
---

# `/wbStopTrack` — Standard Examples (Part 1)

This guide covers baseline invocations and standard command options for `/wbStopTrack`.

## Basic Usage

```bash
# Standard command execution
/wbStopTrack frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbStopTrack deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbStopTrack` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbStopTrack target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbStopTrack target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbStopTrack target/"
```


## `/wbStopTrack` — Advanced Examples (Part 2)

This guide covers role model overrides, wave mode dispatches, and autonomous execution.

### Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
## Override Worker and Validator models
/wbStopTrack packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

## Override all 4 roles simultaneously
/wbStopTrack apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

### Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbStopTrack` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbStopTrack frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

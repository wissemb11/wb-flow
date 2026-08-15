---
title: "wbModel — Expert Guide"
description: "`/wbModel` is the orchestration control panel for the `wb-flow` multi-agent engine."
---

# /wbModel — Expert Guide

`/wbModel` is the orchestration control panel for the `wb-flow` multi-agent engine. 

## Architectural Role

In the v5.3 release, model selection was decoupled from static text templates and unified under the `User Models (Active Contractual Reference)` contract in `commands/model_recommendations.md`. `/wbModel` provides the runtime interface to inspect and modify this contract.

## Multi-CLI Binary Routing Strategy

The system segregates execution binaries based on vendor capabilities and CLI optimizations:

| Provider CLI | Managed Models | Primary Strengths |
|---|---|---|
| **`agy`** (Antigravity) | Claude Opus 5, Claude Fable, Gemini 3.5 Pro, Gemini 3 Flash | High reasoning, surgical edits, 2M+ token contexts |
| **`codex`** (ChatGPT / OpenAI) | GPT-5 Pro, GPT-5 Codex, Codex-O3, GPT-5 Nano | High throughput code generation, reasoning |
| **`opencode`** (Go / Open Source) | DeepSeek V4 Pro/Flash, Kimi K3, Qwen 4, GLM 5.1 | Cost efficiency, open weights, massive log analysis |

## High-Availability `||` Fallback Chains

When `/wbModel` writes to `model_recommendations.md`, it formats each role with a 3-tier fallback chain:

```bash
`primary_cli run -m model1 "<args>" || secondary_cli run -m model2 "<args>" || tertiary_cli run -m model3 "<args>"`
```

If the primary CLI or model experiences rate limiting, network timeout, or service unavailability, bash automatically fails over to the next tier model without interrupting the automated orchestration loop.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md)

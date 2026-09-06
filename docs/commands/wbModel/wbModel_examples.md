# `/wbModel` — Standard Examples (Part 1)

This guide covers baseline invocations and standard command options for `/wbModel`.

## Basic Usage

```bash
# Standard command execution
/wbModel frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbModel deployement/apps/wb-jobs/ --id=1,2,3

# Interactive Provider Selection & API Reachability Probing
wb-flow model --pick --probe --all

# Same, but stream every result including unreachable models (legacy output)
wb-flow model --pick --probe --all=raw

# Probe only one provider — far fewer live calls, so far less time and credit
wb-flow model --pick --probe --all=anthropic
wb-flow model --pick --probe --all=openai

# Probe only the models eligible for one role
wb-flow model --pick --probe --all=planner
wb-flow model --pick --probe --all=mechanical

# Every form also works headless, without --pick (for scripts and CI)
wb-flow model --probe --all=anthropic
```

**Example Output:**
```text
📄 Using custom models catalog: /home/wissemb11/Allprojects/wb-labs/.wb/models.json

🛰️  Pre-probing all catalog model(s) to verify reachability & balance…
   ❌ anthropic/claude-opus-5                        — 🧠 Lead Architect & Planner — (Insufficient balance)
   ❌ openai/gpt-5.6-sol                             — 🧠 Lead Architect & Planner — (Insufficient balance)
   ✅ openrouter/qwen/qwen-2.5-coder-32b-instruct    — 💻 Great Coder Worker
   ✅ opencode-go/deepseek-v4-pro                    — 🧠 Big Planner & Deep Thinker
   ✅ gemini-3.6-flash-high                          — ⚡ Fast Mechanical Worker

   ✓ Probed catalog: 4 of 54 models verified reachable with sufficient balance.

  Step 0 — Select your active provider subscriptions
  (Use ↑/↓ to move, Space to toggle rank, 'a' to select/deselect all, Enter to confirm)

   ❯ [1] ◉ 💳 📁 anthropic                 [claude-pro]
     [2] ◉ 💳 📁 openai                    [chatgpt]
         ◯ 💳 📁 openrouter                [openrouter]
     [3] ◉ 💳 📁 opencode-go               [opencode-go]
     [4] ◉ 💳 📁 antigravity               [google-one]
         ◯ 💳 📁 github-copilot            [github-copilot]

      chain: anthropic || openai || opencode-go || antigravity

   ✓ Enabled subscriptions: anthropic, openai, opencode-go, antigravity

🎛️  Pick a chain per role. Each link should draw from a DIFFERENT
   billing pool — three models on one subscription is one point of
   failure wearing three hats.
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbModel` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbModel target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbModel target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbModel target/"
```


## `/wbModel` — Advanced Examples (Part 2)

This guide covers role model overrides, wave mode dispatches, and autonomous execution.

### Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
## Override Worker and Validator models
/wbModel packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

## Override all 4 roles simultaneously
/wbModel apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

### Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbModel` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbModel frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

## Filling the catalog

`/wbModel` picks from what the catalog holds. To change what it holds:

```bash
wb-flow model --sync-catalog     # refresh every known provider
wb-flow model --add=zen,codex    # add specific ones (aliases accepted)
```

`--add codex --from-picker` handles Codex, which cannot enumerate itself.

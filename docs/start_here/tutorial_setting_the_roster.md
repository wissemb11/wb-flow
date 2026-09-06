---
title: "Setting the roster by hand"
description: "Why --set beats --pick once you know what you want, what the model tiers mean, and how to build a chain that survives an outage."
---

# Setting the roster by hand

`wb-flow model --pick` walks you through an interactive picker. It is the right tool the first time
and the wrong one every time after: it needs a TTY, it re-asks every question, and it teaches you
nothing about *why* a chain is ordered the way it is.

`--set` takes the whole chain in one line, and has always accepted a comma-separated list:

```bash
wb-flow model --set worker=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high
```

This page is about the judgement behind that line.

> **The *why* lives elsewhere.** Pool alternation, the executor≠validator rule and its 🧠 Planner
> exemption, and how fallback advances are argued in
> [`concepts/model-fallback-chains.md`](../concepts/model-fallback-chains.md). This page is the
> **how**: the syntax, what the model names mean, and one worked example.
>
> §1 below **names** those rules as a checklist — you cannot apply a rule you cannot see — and gives
> one line of consequence each. It does not re-derive them. Where the two pages differ, the concept
> page is authoritative; if you find yourself explaining *why* here, it belongs there instead.

---

## §1 · Five rules, and the failure each prevents

**1. Every step changes billing pool.**
A chain that stays inside one provider dies to the single rate-limit it exists to survive. Measured
on 2026-09-02: a SuperGrok balance hit `402 Payment Required` mid-run; the chain's next entry was on
a different provider and the work continued. Had positions 1 and 2 both been xai, nothing would have
run.

**2. Never rank a metered model above its flat-rate twin — and never route to a metered duplicate at
all.**
Metered marketplaces resell the same models you already hold on a subscription. Routing there is
identical capability at a per-token price. The rule must be derived from *the pools you hold*, never
a hard-coded list: a user without a Claude subscription should keep the metered Claude, because for
them it is the only route to it, not a duplicate.

**3. Worker's head ≠ Validator's head.**
A model grading its own work is an echo chamber. Note the rule compares **heads** — a chain that
falls two deep can still land on the executor's provider, which is why the dispatcher resolves this
at dispatch time rather than trusting the ordering.

**4. Depth 5 is the ceiling.**
Past that you are describing a catastrophe, not a fallback.

**5. Match the model's *tier* to the role, and spend where failure is silent.**

| Role | What you are buying | What failure looks like | Tier |
|---|---|---|---|
| ✅ **Validator** | skepticism, independence | **a false PASS — ships silently** | 🧠 best |
| 🧠 **Planner** | judgement under ambiguity | a coherent plan solving the wrong problem — found hours later | 🧠 best |
| 🔨 **Worker** | instruction-following, code fluency | **a test fails — loud, immediate, cheap** | 💻 coder |
| 📋 **Mechanical** | nothing; there is no judgement to buy | the oracle catches it | ⚡ fast |

**The best model belongs on the Validator, not on the code.** Worker failures announce themselves in
minutes. Validator failures are invisible and permanent — this project's own history records a wave
where *"of 11 delegated cell-ids, the gate was right about 3."*

---

## §2 · What the model names mean

You cannot apply rule 5 without knowing which model is which. `wb-flow model --pick` annotates every
entry with its tier; these are the same annotations.

| Tier | For | Representative models | Typical pool | Billing |
|---|---|---|---|---|
| 🧠 Lead Architect & Planner | decomposition, trade-offs | `claude-opus-*`, `gpt-5.6-sol`, `grok-4.6`, `gemini-3.1-pro-high` | claude-pro · chatgpt · supergrok · google-one | flat |
| 🧠 Big Planner / Deep Thinker | judgement, scoring | `claude-sonnet-*`, `gpt-5.6-terra`, `grok-4.5`, `deepseek-v4-pro` | as above · opencode pools | flat or metered |
| 💻 Great Coder Worker | writing code that compiles | `claude-fable-*`, `gpt-5.5`, `gpt-5.3-codex`, `kimi-k2.7-code` | claude-pro · chatgpt · opencode pools | flat or metered |
| 🔨 Heavy Worker | long refactors | `kimi-k3`, `qwen*-max` | opencode pools | usually metered |
| ⚡ Fast Mechanical | run, read, format | `claude-haiku-*`, `gpt-5.6-luna`, `gemini-*-flash-*`, `qwen*-plus` | all | flat or metered |

Three distinctions that trip people up:

**(a) A coder-tier model is not a weaker planner.** `claude-fable-5` is a coding specialist, not a
lesser `claude-opus-5`. "Use the strongest model everywhere" is wrong in *both* directions — it wastes
judgement-grade quota on mechanical work and puts a generalist where a specialist belongs.

**(b) Flat-rate and metered are two different cost axes.** On a flat pool the scarce resource is the
**limit window**, not dollars. An over-tiered *fallback* on a flat pool costs nothing in money and
plenty in quota — burning planner-grade window on Worker retries leaves none for planning.

**(c) ⚠️ The pool name is not the slug prefix.**

```
📁 opencode-zen  [opencode-zen]        ← pool name (metered)
   └── 📄 opencode/kimi-k2.7-code      ← slug prefix

📁 opencode-go   [opencode-go]         ← pool name (flat-rate)
   └── 📄 opencode-go/kimi-k2.7-code
```

**The pool *without* the qualifier is the metered one.** `opencode/kimi-k2.7-code` and
`opencode-go/kimi-k2.7-code` are the same model on opposite billing models. This is not hypothetical:
it has put a metered twin at a Worker head while the flat-rate twin sat unselected.

---

## §3 · A worked example

**Assume you hold** a Claude subscription, a ChatGPT/Codex plan, a Google One plan, and a metered
opencode marketplace account. Your own holdings will differ — the *shape* is what transfers.

```bash
# 🧠 Planner — judgement is the product; head on your strongest.
wb-flow model --set planner=anthropic/claude-opus-5,openai/gpt-5.6-sol,gemini-3.1-pro-high,opencode/deepseek-v4-pro

# ✅ Validator — 🧠 tier throughout. Head deliberately NOT the Planner's provider.
wb-flow model --set validator=openai/gpt-5.6-terra,anthropic/claude-sonnet-5,gemini-3.1-pro-high,opencode/minimax-m3

# 🔨 Worker — 💻 coder tier first.
wb-flow model --set worker=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high,opencode/kimi-k2.7-code

# 📋 Mechanical — ⚡ tier; no judgement to buy.
wb-flow model --set mechanical=gemini-3.6-flash-high,openai/gpt-5.6-luna,anthropic/claude-haiku-4-5-20251001,opencode/deepseek-v4-flash

wb-flow model --probe      # verify the heads answer — real calls
```

The pool-walk, annotated:

```
Planner    claude-pro → chatgpt   → google-one → opencode (metered tail)
Validator  chatgpt    → claude-pro → google-one → opencode (metered tail)
Worker     chatgpt    → claude-pro → google-one → opencode (metered tail)
Mechanical google-one → chatgpt   → claude-pro → opencode (metered tail)
```

Every chain walks three flat-rate pools before touching a metered one, and each metered tail is the
**cheapest** model that can still do the role — a tail is reached only when everything you pay for is
exhausted, which makes it unbudgeted spend by definition.

⚠️ **Worker and Validator both head on `chatgpt` here.** With four roles and three flat providers that
is unavoidable, and it means a Worker row executed by `gpt-5.5` would be validated by
`gpt-5.6-terra` — same house. That is rule 3's *obliged* case: legitimate, but it must be **marked**
in the dispatch, never passed over silently.

**Verify what you set:**

```bash
wb-flow model            # print the roster
wb-flow model --probe    # confirm the heads actually answer
```

---

## When `--pick` is still the right tool

- Your first run, before you know what the catalog holds.
- After `wb-flow model --sync-catalog` adds a provider and you want to see the new options.
- When you want the tier annotations in front of you while choosing.

`--set` is for when you already know. Both write the same file.

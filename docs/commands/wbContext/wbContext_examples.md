---
title: "wbContext — Examples"
description: "---"
---

# /wbContext — Examples

> Self-help. `/wbContext` is the command you run more than any other. This file is the cheat sheet for "what's actually happening when I type it."
>
> Format: annotated transcripts, same as [wbSetup_examples](../wbSetup/wbSetup_examples).

---

## The core distinction: /wbSetup vs /wbContext

| `/wbSetup` | `/wbContext` |
|---|---|
| Creates `context.md` + `dev.md` for the first time | Refreshes `context.md` against current code |
| Run once per package, ever | Run every session, and after any non-trivial change |
| Can overwrite hand-authored rules (risky) | Safe to re-run — diffs before writing |
| Focus: what *is* this package? | Focus: does my stored understanding still match reality? |

If you find yourself re-running `/wbSetup`, you probably want `/wbContext --refresh` instead.

---

## Example 1 — `/wbContext packages/wb-core` (start of session, no changes since yesterday)

The cheapest, most common invocation. You just opened a fresh AI chat.

```text
$ /wbContext packages/wb-core

[AI] Reading .agents/workflows/context.md (baseline)...
[AI] → 11 sections, dated 2026-04-18 (5 days old)
[AI] Reading .agents/workflows/dev.md (rules)...
[AI] → 14 rules, dated 2026-04-18
[AI] Scanning reports/20260418..20260423/ ...
[AI] → 2 audit reports, 1 debug report in range
[AI]
[AI] Checking drift...
[AI] package.json: unchanged
[AI] src/index.js exports: unchanged
[AI] vite.config.js outDir: unchanged
[AI]
[AI] ✅ No drift. context.md still accurate.
[AI] ✅ Ingested 3 recent reports; notable:
[AI] - 2026-04-22 audit flagged: extractSubObject tests incomplete
[AI] - 2026-04-21 debug report: __WBC_DEV__ leaking in dev build
[AI]
[AI] Ready. I know this package.
```

**What's worth noticing:**

- When nothing changed, `/wbContext` is a 2-second operation. It's not regenerating context; it's *verifying* it and ingesting recent reports.
- The 2 flagged items (incomplete tests, `__WBC_DEV__` leak) are now in the AI's working memory for this session. Without `/wbContext`, the AI would have no idea.
- If you skip this command and jump into "implement X," the AI will implement X but miss the leak regression risk.

---

## Example 2 — `/wbContext packages/wb-core` (you've been editing all week)

Same command, different situation. You've made 30 commits since the last context refresh.

```text
$ /wbContext packages/wb-core

[AI] Reading baseline context.md...
[AI] → dated 2026-04-15 (8 days old)
[AI]
[AI] Checking drift...
[AI] package.json: vue 3.4.0 → 3.5.2 (changed)
[AI] src/index.js: +2 new exports (changed)
[AI] WBCode, WBCodeSlot
[AI] src/utils/: +1 file (extractPath.js)
[AI] vite.config.js: outDir: dist → dist-dev (changed!)
[AI]
[AI] ⚠ Drift detected in 4 places.
[AI]
[AI] Questions:
[AI] 1. The vite outDir change from dist/ → dist-dev/:
[AI] is this intentional? package.json main: still says dist/.
[AI] (This is the footgun your dev.md warns about.)
[AI] 2. WBCodeSlot is a new export but not documented. Should I
[AI] add it to context.md's public API list?
[AI] 3. extractPath.js — new utility or should this be part of
[AI] extractSubObject?
[AI]
[AI] Waiting for your answers before rewriting context.md.
```

**What's worth noticing:**

- The AI doesn't silently rewrite. Drift → questions. This is the right posture: your intent is privileged, not the AI's interpretation.
- Question #1 is the *whole point* of `dev.md` — the rule "don't rename main without updating vite" fires here and catches a real regression in progress.
- `/wbContext` without answering the questions is safe (it just reads); answering lets it *update* `context.md` with the new reality.

---

## Example 3 — `/wbContext packages/wb-core --focus="extractSubObject"` (deep dive)

You're about to touch `extractSubObject`. You want the AI loaded up on just that function.

```text
$ /wbContext packages/wb-core --focus="extractSubObject"

[AI] Running standard context check first... (see Example 1)
[AI] Baseline confirmed.
[AI]
[AI] Focus requested: extractSubObject
[AI] Checking for existing focused file...
[AI] .agents/workflows/context_extractSubObject.md (2026-04-10, 13 days)
[AI]
[AI] Diffing against current code:
[AI] Function signature: unchanged
[AI] Test coverage: unchanged
[AI] Call sites: 3 → 4 (new caller in @wbc/wb-press)
[AI]
[AI] ⚠ Open decision tracker: the array-handling question
[AI] (leaves vs. structural) is still UNRESOLVED.
[AI] No consumer has yet used the structural shape.
[AI] Signature-stability risk is low for now.
[AI]
[AI] Updating context_extractSubObject.md:
[AI] - Refreshed call site count
[AI] - Noted new wb-press consumer
[AI] - Open decision re-stated (unchanged)
[AI]
[AI] ✅ Done. Focused context ready. Non-focused context.md
[AI] untouched.
```

**What's worth noticing:**

- Focused context is *additive*. `--focus` creates/updates a sidecar file, never rewrites the base `context.md`.
- The "open decision tracker" is a pattern worth preserving: undecided architectural questions get parked explicitly, not silently resolved.
- The new wb-press consumer is worth flagging in its own right — it means the next `/wbRelease` needs to verify `wb-press` still works.

---

## Example 4 — `/wbContext apps/wb-dataviewer/wbdataviewer2.wbc-ui.com` (the demo app)

Context refresh on an app, not a package. Different output shape because apps have different concerns.

```text
$ /wbContext apps/wb-dataviewer/wbdataviewer2.wbc-ui.com

[AI] Reading baseline context.md...
[AI] Reading dev.md...
[AI]
[AI] Drift check against:
[AI] package.json: unchanged
[AI] src/App.vue: +15 lines (new example)
[AI] src/examples/: +1 file (Example_wbPress.vue)
[AI] vite.config.js: unchanged
[AI] apiResponse_ usage: still caches fetched data ✅
[AI] :wbCode="false": still used on all demo instances ✅
[AI]
[AI] Reports scan (last 3 days):
[AI] - No test failures.
[AI] - No deploy failures.
[AI]
[AI] Question:
[AI] The new Example_wbPress.vue uses :wbCode="true" (not false).
[AI] dev.md rule says all examples default to false. Is this
[AI] intentional (demonstrating wbCode) or oversight?
[AI]
[AI] Waiting for answer before updating context.md.
```

**What's worth noticing:**

- The AI catches a `:wbCode="true"` instance and asks. It doesn't auto-"fix" — that's a feature. You might be demonstrating the toggle on purpose.
- The `apiResponse_` caching pattern and `:wbCode="false"` default are both *positive* checks (✅). The AI verifies the convention is still followed, not just flags violations.
- App context tracks different things than package context. Demo apps care about `examples/`, `App.vue`, rendering shape. Libraries care about `src/index.js` and exports.

---

## Example 5 — `/wbContext core2/ --scope=global` (monorepo-level)

Rare. Expensive. Don't run this often.

```text
$ /wbContext core2/ --scope=global

[AI] Reading core2/.agents/workflows/monorepo_rules.md...
[AI] → dated 2026-03-01 (53 days old!)
[AI]
[AI] Surveying 23 packages in packages/...
[AI] Surveying 8 apps in apps/...
[AI]
[AI] Systemic drift check:
[AI] Vue 3 across packages: 22/23 ✅ (wb-press on Vue 2: expected)
[AI] workspace:* for @wbc/* imports: 31/31 ✅
[AI] dist/ vs dist-dev/ alignment: 14/16 ⚠ (2 misaligned)
[AI] wb-core: dist-dev (should be dist)
[AI] wb-code: dist-dev (should be dist)
[AI] wbCode dev-only gating: 17/17 ✅
[AI] monorepo_rules.md freshness: STALE (>30 days)
[AI]
[AI] Recommendations:
[AI] 1. monorepo_rules.md needs a refresh pass.
[AI] 2. 2 packages have misaligned main vs. build output. Fix before
[AI] next /wbRelease.
[AI]
[AI] Monorepo-level context report written to:
[AI] reports/20260423/contexts/context_global_202604231700.md
[AI]
[AI] Per-package context.md files NOT modified (use /wbContext
[AI] <package> for that).
```

**What's worth noticing:**

- Global context is a *survey*, not an update. It tells you which rules are being followed and which aren't. You decide what to fix.
- 53-day-old `monorepo_rules.md` is a soft failure. No alarm, just a note. In 6 months, this file will be wrong in ways you don't notice until a `/wbRelease` breaks.
- The 2 misaligned `dist/dist-dev` packages are pre-ship blockers. This report would catch them before they reach users.

---

## The pattern across examples

`/wbContext` is always doing three things in order:

1. **Load baseline** — read the stored `context.md` + `dev.md`.
2. **Check drift** — diff the stored understanding against the current code.
3. **Ingest recent reports** — pull in the last 1–3 days of `reports/` into working memory.

The output shape depends on drift:
- **No drift** → quick ✅, proceed.
- **Drift found** → questions, wait for answers, then update.
- **Global scope** → survey report, no per-package updates.

Pattern variation: `--focus=` adds a fourth step (update the focused sidecar file), `--scope=global` replaces step 2 with a systemic survey.

---

## When `/wbContext` fails silently

Three failure modes worth knowing about:

1. **You skip it.** The AI has *no* stored understanding. It'll make generic suggestions that ignore your conventions (propose Vue 3 syntax for wb-press, propose Chart.js alongside D3, etc.).
2. **The baseline is months old.** `/wbContext` loads stale rules. The AI confidently follows them. You discover months later that `dev.md` forbids something you no longer do.
3. **You run it but don't answer the drift questions.** Next session opens with the same drift because `context.md` was never updated. Fix: always answer, even if the answer is "don't update, keep old baseline — I'll fix the code instead."

Mitigation for all three: treat `/wbContext` as a required session-opener. Not optional.

---

---

## Basic Usage

```bash
# Standard command execution
/wbContext frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbContext deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbContext` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbContext target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbContext target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbContext target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbContext packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbContext apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbContext` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbContext frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

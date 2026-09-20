---
title: "wbDebug — Examples"
description: "Hypothesis before fix."
---

# /wbDebug — Examples

> Self-help. `/wbDebug` is the command you reach for the *second* you hit an error. Not the third. This file shows what "hypothesis first" looks like in practice.

---

## The cardinal rule

**Hypothesis before fix.** Every `/wbDebug` run must produce an explicit hypothesis (what + where + why) before touching any code. This is the whole point — the command exists specifically to prevent the "try random things until the error goes away" pattern.

If the AI skips hypothesis and jumps to fix, the run is invalid. Re-prompt: *"first tell me what you think is wrong and why, before proposing any change."*

---

## Example 1 — `/wbDebug "Maximum recursive updates exceeded in <DataViewer>"`

```text
$ /wbDebug "Maximum recursive updates exceeded in <DataViewer>"

[AI] Loading context.md + dev.md for wb-dataviewer...
[AI] apiResponse_ caching convention noted
[AI]
[AI] Scanning reports/ for related debug reports...
[AI] → 2026-04-19: "apiResponse_ cache invalidation" — similar symptom
[AI] Hypothesis there: watcher key mismatch. Partially resolved.
[AI]
[AI] Forming hypothesis for current error...
[AI]
[AI] HYPOTHESIS:
[AI] A watcher on apiResponse_ is triggering a reactive write to
[AI] the same value it's watching. This is the classic Vue "mutate
[AI] inside watcher" loop.
[AI]
[AI] Most likely location: src/composables/useApiCache.js (line 34),
[AI] where the watcher both reads apiResponse_ and calls setApiResponse_
[AI] inside the callback.
[AI]
[AI] EVIDENCE TO CHECK:
[AI] 1. Open src/composables/useApiCache.js
[AI] 2. Find the watcher — confirm it writes to apiResponse_
[AI] 3. Check the trigger: is the watcher firing on every render?
[AI]
[AI] NOT YET PROPOSING A FIX. Waiting for you to verify or refute
[AI] the hypothesis first.
```

User confirms hypothesis by opening the file and checking:

```text
$ "confirmed, the watcher does write to apiResponse_"

[AI] Hypothesis confirmed. Now proposing fix.
[AI]
[AI] FIX:
[AI] The watcher should read apiResponse_ but NOT write to it. The
[AI] intended behavior is: when the underlying data changes,
[AI] compute a derived value, store THAT in a separate ref.
[AI]
[AI] Existing vs Suggested:
```

```js
// Existing (line 34)
watch(apiResponse_, (newVal) => {
 apiResponse_.value = normalizeData(newVal); // <-- loop
});

// Suggested
const normalizedResponse = computed(() => normalizeData(apiResponse_.value));
```

```text
[AI] Additional check: all 3 consumer sites use apiResponse_.value
[AI] directly. You'll need to migrate them to normalizedResponse.
[AI]
[AI] Writing reports/20260424/debugs/debug_apiResponse_loop_202604240400.md
[AI] 
[AI] NEXT:
[AI] 1. Apply the fix (describe "apply the suggested fix").
[AI] 2. /wbTest to confirm the loop is gone.
[AI] 3. /wbGit to commit.
```

**What's worth noticing:**

- The AI pauses after the hypothesis and waits for verification. This is the critical gate. Without it, the "fix" would be based on a possibly-wrong guess.
- Related reports from prior days are surfaced automatically. The 2026-04-19 report is connected to the same root cause area.
- The proposed fix is specific (line 34) + comes with an awareness of downstream consumers that need migration. Closed loop in action.

---

## Example 2 — `/wbDebug packages/wb-core/src/utils/extractSubObject.js` (file-scoped, no error message)

Sometimes you know *where* but not *what*. Point at the file with no error text.

```text
$ /wbDebug packages/wb-core/src/utils/extractSubObject.js

[AI] Reading the file...
[AI] Checking reports/ for open complaints about extractSubObject...
[AI] → 2026-04-22 audit: test coverage gap at line 47
[AI] → 2026-04-20 user report (in standup): "extractSubObject
[AI] returns undefined for deeply nested paths"
[AI]
[AI] HYPOTHESIS (based on reports, not on running code):
[AI] The user-reported symptom is consistent with the array-handling
[AI] open decision. If the path traverses through an array of
[AI] objects, the current code treats arrays as leaves — so it
[AI] returns the array itself, not the value inside.
[AI]
[AI] Example: extractSubObject({users: [{name: 'x'}]}, 'users.0.name')
[AI] Expected: 'x'
[AI] Actual: undefined (because 'users' returns the array, and '.0.name'
[AI] can't traverse it under current logic)
[AI]
[AI] EVIDENCE TO CHECK:
[AI] 1. Confirm the failing case by running it
[AI] 2. If hypothesis is correct, this is NOT a bug — it's the
[AI] documented open decision about array handling
[AI]
[AI] REFUSING TO FIX until you decide the array-handling question.
[AI] This is a design decision, not a bug. Fixing it silently
[AI] would commit the codebase to one side of the open decision.
[AI]
[AI] Options:
[AI] a. Close the decision: structural arrays → apply fix
[AI] b. Keep arrays as leaves → document as known limitation, add
[AI] a helpful error message
[AI] c. Defer: wait until more evidence accumulates
```

**What's worth noticing:**

- The hypothesis references both an audit report AND a standup note. Closed loop draws from multiple report types.
- The AI *refuses to fix* because the symptom maps to an open decision. This is the right posture — silently "fixing" the symptom would resolve an architectural question without your input.
- Three options listed for the user. The command doesn't decide; it surfaces.

---

## Example 3 — `/wbDebug` when the hypothesis is wrong

Half the value of hypothesis-first is discovering the hypothesis is wrong without writing a bad fix.

```text
$ /wbDebug "apiResponse_ is not defined on component mount"

[AI] Forming hypothesis...
[AI]
[AI] HYPOTHESIS:
[AI] apiResponse_ is being accessed before the cache is hydrated.
[AI] Most likely: a child component mounts before the parent's
[AI] apiResponse_ ref is assigned.
```

User checks:

```text
$ "hypothesis is wrong. apiResponse_ is fine on mount. The error
 fires later, after a route change."

[AI] Hypothesis refuted. Reforming.
[AI]
[AI] NEW HYPOTHESIS (based on new evidence):
[AI] A route change triggers a component unmount that nullifies
[AI] apiResponse_, but a lingering Promise resolves after the
[AI] unmount and tries to access the now-nulled value.
[AI]
[AI] EVIDENCE TO CHECK:
[AI] 1. Is there an async operation (fetch, setTimeout) that fires
[AI] in beforeRouteLeave or similar?
[AI] 2. Does it access apiResponse_ without a null check?
```

**What's worth noticing:**

- The AI explicitly acknowledges the refutation and reforms. No saving face, no "well actually I was right" hedging.
- The new hypothesis is genuinely different — not just a reworded version of the first one. It incorporates the user's new evidence (route change timing).
- This is the debugging behavior you want: iteratively refined hypotheses, not a single-shot guess.

---

## Example 4 — `/wbDebug` when there's no report and no tests

The command still works, but the output is weaker.

```text
$ /wbDebug "TypeError: Cannot read property 'map' of undefined"

[AI] Checking context.md + reports...
[AI] Minimal context available.
[AI] No related debug reports.
[AI] Error message is generic (applies to many situations).
[AI]
[AI] HYPOTHESIS (low confidence — not enough context):
[AI] Somewhere in the code, .map() is being called on a variable
[AI] that's supposed to be an array but is currently undefined.
[AI] This typically happens when:
[AI] a. API response is still pending but the component tries to
[AI] render the data
[AI] b. A prop is named wrong (undefined by default)
[AI] c. Destructuring from an object that doesn't have the expected key
[AI]
[AI] NOT ENOUGH INFORMATION to narrow further without a stack trace
[AI] or file path.
[AI]
[AI] PLEASE PROVIDE:
[AI] - Stack trace (full)
[AI] - File + line where the error originates
[AI] - Recent changes (git diff) if any
```

**What's worth noticing:**

- The AI refuses to guess when it genuinely doesn't have enough signal. Better to ask than to propose three random fixes.
- The hypothesis is framed as "X typically happens when..." — it's listing possibilities, not committing to one.
- Explicit request for more information. This is acceptable; debugging is collaborative.

---

## The pattern

Every `/wbDebug` has:

1. **Context load** — read `context.md`, recent reports, related debug history.
2. **Hypothesis** — what + where + why. Specific.
3. **Evidence-to-check list** — how you can verify/refute the hypothesis.
4. **Wait** — no fix until hypothesis is confirmed.
5. **Fix proposal** (if hypothesis confirmed) or **refusal** (if hypothesis maps to open decision) or **reform** (if refuted).
6. **Report written** — to `reports/YYYY/MM/DD/debugs/`.

The pause between hypothesis and fix is non-negotiable. That pause is the command.

---

---

## Basic Usage

```bash
# Standard command execution
/wbDebug frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbDebug deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbDebug` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbDebug target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbDebug target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbDebug target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbDebug packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbDebug apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbDebug` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbDebug frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

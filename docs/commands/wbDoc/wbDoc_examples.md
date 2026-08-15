---
title: "wbDoc — Examples"
description: "---"
---

# /wbDoc — Examples

> Self-help. `/wbDoc` generates JSDoc + README. This file shows what good generation looks like vs. the generic "add more comments" noise that fills most AI-generated docs.

---

## What /wbDoc does (and what it refuses to do)

- **Does:** JSDoc on public functions, README sections for package surfaces, prop/emit tables for Vue components, usage examples drawn from existing code.
- **Refuses:** documenting private helpers, restating what the code name already says, inventing usage patterns not grounded in actual consumer code.

The second list is why `/wbDoc` is better than "AI, add comments."

---

## Example 1 — `/wbDoc packages/wb-core/src/utils/extractSubObject.js`

The function is central, has 4 call sites, no JSDoc. Prime target.

```text
$ /wbDoc packages/wb-core/src/utils/extractSubObject.js

[AI] Reading function + 4 call sites...
[AI] Reading context_extractSubObject.md (focused context)...
[AI] Open decision flagged: array-handling (leaves vs structural)
[AI]
[AI] Generating JSDoc...
```

```js
// BEFORE
function extractSubObject(obj, path, opts) {
 // ...
}

// AFTER
/**
 * Traverse an object by dot-path and return the value at the leaf.
 *
 * @param {object} obj - Source object to traverse.
 * @param {string} path - Dot-separated path (e.g., "user.profile.name").
 * @param {object} [opts] - Optional configuration.
 * @param {*} [opts.default] - Value returned if the path is unreachable.
 * Without this, unreachable paths return undefined.
 *
 * @returns {*} The value at the leaf, or opts.default, or undefined.
 *
 * @remarks
 * Arrays are currently treated as leaves (returned as-is, not traversed
 * index-wise). This is a documented open decision; see
 * context_extractSubObject.md. Do not rely on the current array
 * behavior for forward compatibility.
 *
 * @example
 * extractSubObject({user: {name: 'x'}}, 'user.name') // 'x'
 * extractSubObject({a: {b: 1}}, 'a.c', {default: 0}) // 0
 * extractSubObject({ids: [1, 2]}, 'ids') // [1, 2] — array returned as-is
 */
function extractSubObject(obj, path, opts) {
 // ...
}
```

```text
[AI] Additional suggestion: this JSDoc should be matched by the
[AI] entry in context.md's API section. Update context.md?
[AI]
[AI] Writing reports/20260424/docs/doc_extractSubObject_202604240500.md
```

**What's worth noticing:**

- The `@remarks` section names the open decision. Users of the function learn they shouldn't rely on current array behavior — directly from the JSDoc.
- Examples are grounded — three actual examples including the array edge case. Not generic "returns the value" prose.
- Follow-up suggestion to update `context.md` ties docs into the closed loop.

---

## Example 2 — `/wbDoc packages/wb-dataviewer` (folder-level README regen)

```text
$ /wbDoc packages/wb-dataviewer

[AI] Reading package.json...
[AI] Reading src/index.js exports...
[AI] Exports: WBDataViewer, WBDataViewerConfig, createDataViewer
[AI] Reading context.md...
[AI] apiResponse_ caching convention
[AI] :wbCode="false" default convention
[AI] Reading current README.md...
[AI] Last updated 2026-02-10 (2+ months old)
[AI]
[AI] Proposed new README.md...
```

```markdown
# @wbc/wb-dataviewer

Data-driven table component for the WBC-UI2 ecosystem. Renders tabular
data with built-in caching, filtering, and example mode.

## Install

```bash
pnpm add @wbc/wb-dataviewer
```

## Quick start

```vue
<template>
 <WBDataViewer :data="users" :wbCode="false" />
</template>

<script setup>
import { WBDataViewer } from '@wbc/wb-dataviewer';
const users = [/* ... */];
</script>
```

## The `apiResponse_` caching model

`WBDataViewer` internally caches fetched API data in `apiResponse_`.
Project changes (config prop updates) do NOT trigger re-fetch — the
cached response is re-used. This is intentional; it's what makes the
viewer fast on large datasets.

If you need fresh data, reset the cache explicitly:

```js
dataViewer.value.clearCache();
```

## The `wbCode` prop — DEV ONLY

The `wbCode` prop exposes an inspection view of the rendered data.
It should **never** be exposed to end users. Always default it to
`false`.

```vue
<WBDataViewer :data="x" :wbCode="false" /> <!-- correct -->
<WBDataViewer :data="x" /> <!-- also correct (default) -->
<WBDataViewer :data="x" :wbCode="true" /> <!-- dev mode only -->
```

In production builds, `wbCode="true"` has no effect unless
`__WBC_DEV__` is set.

## API

| Export | Type | Purpose |
|-------------------------|----------------|----------------------------|
| `WBDataViewer` | Vue component | Main data-table component |
| `WBDataViewerConfig` | Type | Configuration object shape |
| `createDataViewer` | Factory | Imperative creation helper |

## License

See LICENSE.
```

```text
[AI] Key additions over previous README:
[AI] - apiResponse_ caching section (was absent)
[AI] - wbCode dev-only section (was absent; misuse risk)
[AI] - :wbCode="false" shown on every example (per dev.md rule)
[AI]
[AI] Want me to apply this? (y/n)
```

**What's worth noticing:**

- The README surfaces project-specific conventions that are in `dev.md` but weren't in the old README. This is the exact drift `/wbDoc` is meant to catch.
- Every example uses `:wbCode="false"` per your convention. The AI picks this up from `dev.md` rather than re-inventing.
- The "key additions" summary lets you review at a glance what's new.

---

## Example 3 — `/wbDoc` refused because docs would outrun code

```text
$ /wbDoc packages/wb-core/src/renderers/renderString.js

[AI] Reading file (688 lines)...
[AI]
[AI] REFUSING to document this file in its current state.
[AI]
[AI] Reason: the function is flagged in audit (2026-04-20) as
[AI] "cyclomatic complexity hazard; needs refactor." Documenting
[AI] the current structure would codify a structure that's about
[AI] to change. The docs will be stale within a week.
[AI]
[AI] Recommendation:
[AI] /wbRefactor this file first. Then /wbDoc the refactored
[AI] version. Your docs will match the post-refactor code.
```

**What's worth noticing:**

- Docs that will be invalidated by an imminent refactor are worse than no docs. The command refuses because writing them is negative-value work.
- Refusal is specific about the audit reference and the sequence (refactor then doc).

---

## The pattern

Every `/wbDoc` has:

1. **Read source + context + call sites** — same as audit.
2. **Check for impending refactors** — if audit flagged this file, hold off.
3. **Generate docs grounded in conventions** — draw from `dev.md`/`context.md`, not generic prose.
4. **Show before/after** for JSDoc, or full proposal for README.
5. **Pointer to context.md sync** — docs and context often need to agree.

---

---

## Basic Usage

```bash
# Standard command execution
/wbDoc frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbDoc deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbDoc` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbDoc target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbDoc target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbDoc target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbDoc packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbDoc apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbDoc` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbDoc frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

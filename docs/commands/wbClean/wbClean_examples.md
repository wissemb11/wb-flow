---
title: "wbClean — Examples"
description: "/wbClean reports; you delete."
---

# /wbClean — Examples

> Self-help. `/wbClean` finds dead code / stale files / forgotten `console.log`. This file shows what it does and (importantly) what it does *not* do.

---

## The cardinal rule

**`/wbClean` reports; you delete.** The command does not remove anything by default. It produces a list of candidates. You make the call on each.

This is intentional. "Unused" is often wrong (reflection, dynamic imports, build-time references). Letting the AI auto-delete would silently break things.

---

## Example 1 — `/wbClean packages/wb-core`

```text
$ /wbClean packages/wb-core

[AI] Scanning for dead code, stale files, forgotten dev artifacts...
[AI] Writing reports/20260423/cleans/clean_wb-core_202604240100.md:
```

```markdown
# Clean candidates for @wbc/wb-core

## Forgotten dev artifacts (HIGH confidence to remove)
- src/WBC.js:245 → `console.log('WBC render called', props)` — dev-only log
- src/components/WBCode.vue:89 → `console.warn('TODO: handle edge case')` — left from debugging
- src/utils/extractPath.js:12 → `debugger` statement

## Dead files (MEDIUM confidence — verify before deleting)
- src/utils/oldExtractor.js (0 references — likely replaced by extractSubObject)
- src/renderers/deprecatedRenderer.vue (only referenced from a .md docs comment)

## Unused imports (HIGH confidence)
- src/WBC.js: `import { unusedHelper } from './utils'` (never called)
- src/components/WBCodeSlot.vue: `import debounce from 'lodash'` (never used)

## Commented-out code blocks (MEDIUM — you decide)
- src/utils/extractSubObject.js:67-82 (16 lines commented out)
- src/renderers/renderString.js:210-235 (old regex version of pipe-split)

## What this clean did NOT check
- Whether the "dead file" might be needed for a future feature
- Whether commented-out code has historical value you want kept
- Git history — I can't tell if these were just added

## Recommended deletions (safe)
All "HIGH confidence" items. Commented blocks need your judgment.
```

**What's worth noticing:**

- Confidence levels matter. `console.log` is HIGH confidence; "dead file" is MEDIUM because it might be referenced dynamically or kept for a planned feature.
- Commented-out code blocks are reported but not auto-flagged for deletion. You might be keeping them on purpose as historical reference.
- "What this clean did NOT check" section is mandatory — same discipline as audit.

---

## Example 2 — `/wbClean apps/wb-dataviewer/wbdataviewer2.wbc-ui.com`

```text
$ /wbClean apps/wb-dataviewer/wbdataviewer2.wbc-ui.com
```

```markdown
# Clean candidates for wbdataviewer2

## Forgotten dev artifacts
- src/App.vue:52 → `console.log('apiResponse_', data)` — debugging apiResponse_ cache
- src/examples/Example_wbPress.vue:14 → `// XXX: hack, fix before demo`

## Dead example files
- src/examples/Example_oldTable.vue (not imported anywhere; `examples/index.js`
 registers 18 examples, this isn't one of them)
- src/examples/Example_broken.vue (file exists, contains only `<template></template>`)

## Comments worth a look (not necessarily dead)
- src/examples/Example_wbLatex.vue:8 → `// TODO: add more math examples`
 (this has been here since 2026-02, just reminding you)

## What this clean did NOT check
- Whether example files are intentionally unregistered (draft/WIP)
- Whether the XXX comment was addressed and the comment forgotten
```

**What's worth noticing:**

- Dead files caught via `examples/index.js` registry analysis — the clean understands the project's own convention.
- The old TODO from 2 months ago is surfaced but not flagged as "delete." Some TODOs are intentional parking; the AI notes the age.

---

## Example 3 — `/wbClean` on a package that's actually clean

```text
$ /wbClean packages/wb-gis
```

```markdown
# Clean candidates for @wbc/wb-gis

No candidates found.

## Quick stats
- 0 console.log / debugger statements
- 0 unused imports
- 0 files with no references
- 2 TODO comments (both recent, both actionable)

Package appears well-maintained.
```

**What's worth noticing:**

- Clean outputs are often short. A well-maintained package has little to clean.
- Even "nothing to clean" has metrics attached. Useful for baselining which packages accumulate debt fastest.

---

## Example 4 — `/wbClean --delete` (the dangerous form)

There's no `--delete` flag. The command does not auto-delete.

If you want the AI to actually remove things, you do it in a separate step: read the clean report, then tell the AI explicitly:

```
"Delete the HIGH-confidence items from the last /wbClean report:
unused imports, debugger statements, console.logs.
Leave the MEDIUM and the commented-out blocks alone."
```

This keeps the clean phase (detection) separate from the remove phase (action). You can run clean freely without fearing accidental deletion.

---

## The pattern

Every `/wbClean` report has:

1. **Forgotten dev artifacts** — high confidence. Almost always safe to remove.
2. **Dead files** — medium confidence. Verify nothing dynamic references them.
3. **Unused imports** — high confidence. Modern linters catch these but not always.
4. **Commented-out code** — medium confidence. Your call; some is intentional.
5. **TODOs** — informational, not actionable by the AI.
6. **"What this clean did NOT check"** — mandatory boundary statement.

The command is a reporter, not an editor. Use it as the first step in cleanup; the second step is you (or a separate AI invocation) making deletion decisions.

---

---

## Basic Usage

```bash
# Standard command execution
/wbClean frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbClean deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbClean` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbClean target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbClean target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbClean target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbClean packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbClean apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbClean` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbClean frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

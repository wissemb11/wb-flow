---
title: "wbVision — Examples"
description: "---"
---

# /wbVision — Examples

> Self-help. `/wbVision` brainstorms features. I've called this out elsewhere as the weakest command — LLMs confidently generate average-quality feature ideas. This file shows how to use it anyway, by being harsh about what survives.

---

## The honest framing

`/wbVision` produces 5–10 feature ideas. Most will be obvious ("add dark mode"), generic ("use AI for X"), or unshippable ("rewrite everything in Rust"). Your job is to filter. The command's value is not the full list — it's the 1–2 ideas you'd never have thought of yourself.

Keep 1. Discard the rest. Don't treat the output as a roadmap.

---

## Example 1 — `/wbVision packages/wb-dataviewer`

```text
$ /wbVision packages/wb-dataviewer

[AI] Loading context.md...
[AI] Loading recent reports/...
[AI] - 2 recent audits, both clean
[AI] - 1 plan closed last week
[AI] - No open complaints
[AI]
[AI] Writing reports/20260424/visions/vision_wb-dataviewer_202604240900.md:
```

```markdown
# Vision — @wbc/wb-dataviewer

## Input signals
- Package is stable (clean audits, closed plans)
- apiResponse_ caching works
- Current surface: rendering + filter + basic examples

## Generated ideas (6)

### 1. Server-driven view config
**Premise**: today all config is client-side props. What if the server
could push a view config (columns, filters, formatters) and the
viewer auto-adopted it?
**Value**: admin-panel style use cases. Config without rebuild.
**Risk**: API surface expansion, caching conflicts with apiResponse_.
**Effort**: MEDIUM.

### 2. Dark mode
**Premise**: users want dark mode.
**Value**: standard feature.
**Risk**: CSS tokens work needed.
**Effort**: SMALL.
*(obvious idea — flagged for completeness but low novelty)*

### 3. Inline row-level AI summary
**Premise**: click a row → AI summarizes the row in one sentence in a
popover.
**Value**: exploratory data analysis without a separate query UI.
**Risk**: requires per-row AI call, which is expensive.
**Effort**: LARGE.
*(high novelty, but cost / latency is a real concern)*

### 4. Column virtualization
**Premise**: for tables with 100+ columns, only render visible.
**Value**: perf on wide tables.
**Risk**: breaks position:sticky patterns in existing examples.
**Effort**: MEDIUM.

### 5. Export to Excel (not just CSV)
**Premise**: CSV export exists; .xlsx doesn't.
**Value**: user convenience (less Excel-formatting work).
**Risk**: bundle size (xlsx libraries are heavy).
**Effort**: SMALL, with bundle cost.

### 6. Diff view (compare two datasets)
**Premise**: show row-level adds/removes/changes between two arrays.
**Value**: a genuinely unique feature — most dataviewers don't have this.
**Risk**: UI design is hard. No existing pattern to copy.
**Effort**: LARGE.

## My pick

**#6 (diff view)** is the most distinctive. Most data-table libraries
don't do this; having it would be a real differentiator. But it's
LARGE, and the UI design is the hard part (not the code).

**#1 (server-driven config)** is the safer choice. MEDIUM effort, clear
value, fits the existing "UI as data" philosophy of wbc-ui2.

**#2 (dark mode)** is table stakes — do it in parallel if you haven't.

## What this vision did NOT consider
- Business priorities (revenue, retention impact)
- Competitive landscape (what Vuetify/PrimeVue do)
- User feedback (you have none in the standup reports)
```

**What's worth noticing:**

- Each idea has Premise / Value / Risk / Effort. Structured. Lets you triage at a glance.
- Obvious ideas are flagged as obvious. Novelty isn't pretended.
- The "my pick" section is opinionated. Two choices + a reason. Not "all 6 are great."
- "What this vision did NOT consider" names the limits. Business / competitive / user feedback are out of scope for a code-reading AI.

---

## Example 2 — `/wbVision` where nothing survives

Sometimes the output is weak, and that's OK.

```text
$ /wbVision packages/wb-mermaid
```

```markdown
# Vision — @wbc/wb-mermaid

## Input signals
- Package is small (single-purpose: render mermaid diagrams)
- No active plans, no recent audits
- Very thin context.md

## Generated ideas (5)

### 1. Support more mermaid v10 features
**Assessment**: tracking upstream. Not really a "vision" — it's maintenance.

### 2. Custom theme support
**Assessment**: mermaid already supports this via its own API. We'd just
be passing through. No value add.

### 3. Interactive diagram editing
**Assessment**: would require a different package entirely. Out of scope
for a render-only wrapper.

### 4. AI-generated diagrams from text description
**Assessment**: this is an LLM feature, not a mermaid feature. Belongs in
a different layer (app code, not library).

### 5. Export to PNG/SVG
**Assessment**: mermaid supports this. Pass-through.

## My pick

**Nothing stands out.** This package is narrow by design — it's a
render wrapper. "Visioning" new features for it is the wrong exercise.

Better use of your time: leave this package stable, focus vision
work on packages with more surface (wb-dataviewer, wb-core).
```

**What's worth noticing:**

- The AI acknowledges the output is weak. "Nothing stands out" is a valid result.
- Every idea gets an "Assessment" that explains why it's not compelling. Transparent reasoning.
- Recommendation is: stop. Don't force a vision onto a package that doesn't need one.

---

## Example 3 — `/wbVision core2/` (cross-package vision)

This is where /wbVision is genuinely useful — ideas that span multiple packages and couldn't come from looking at any single one.

```text
$ /wbVision core2/
```

```markdown
# Vision — core2 (cross-package)

## Generated ideas (4)

### 1. Unified `wbc` CLI
**Premise**: today each package has its own scripts. What if `wbc <cmd>
<pkg>` were a global CLI that wrapped all the per-package operations?
**Value**: consistent dev experience across packages.
**Risk**: scope creep; CLI becomes its own maintenance burden.
**Effort**: MEDIUM.

### 2. Shared design system doc
**Premise**: wb-core, wb-dataviewer, wb-chart, wb-alert all share design
primitives but there's no single reference for them.
**Value**: consumers (and contributors) understand the ecosystem.
**Risk**: docs drift — this would need /wbDoc rigor.
**Effort**: MEDIUM.

### 3. Monorepo-wide `/wbTest` coverage dashboard
**Premise**: each package's test coverage is visible in its reports, but
you can't see the whole monorepo at a glance.
**Value**: identifies weakest packages fast.
**Risk**: yet another dashboard to maintain.
**Effort**: SMALL (mostly aggregation).

### 4. Integration test suite
**Premise**: packages are unit-tested but cross-package integration
isn't. wb-dataviewer + wb-core breakage would be caught late.
**Value**: confidence on /wbRelease.
**Risk**: slow test suite.
**Effort**: LARGE.

## My pick

**#3 (coverage dashboard)** is the highest leverage lowest cost. SMALL
effort, immediate visibility gain, fits existing `reports/` culture.

**#1 (unified CLI)** is tempting but contradicts the philosophy that
each command is independently useful. You've already got 21 commands;
a 22nd orchestrator is the wrong direction.
```

**What's worth noticing:**

- Cross-package ideas surface opportunities invisible at package scope. The test dashboard or integration tests only make sense from the monorepo view.
- The AI pushes back on the "unified CLI" idea using knowledge of your system's philosophy (21 commands, each independent). This is the kind of principled refusal that's valuable.

---

## The pattern

Every `/wbVision` run has:

1. **Input signals** — context, recent activity, user complaints (if any).
2. **5–10 ideas** — each with Premise / Value / Risk / Effort.
3. **Obvious ideas flagged** as obvious.
4. **A "my pick"** with actual reasoning.
5. **"What this vision did NOT consider"** — business, competitive, user feedback.

The output is a menu, not a roadmap. The filtering step (you keep the 1 good idea) is where the value is.

---

---

## Basic Usage

```bash
# Standard command execution
/wbVision frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbVision deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbVision` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbVision target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbVision target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbVision target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbVision packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbVision apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbVision` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbVision frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

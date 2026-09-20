---
title: "wbLicense — Examples"
description: "Examples and scenarios for auditing and applying tier gating with wbLicense."
---

# /wbLicense — Examples

> Self-help. `/wbLicense` manages the free/Pro tier gating that runs through the wbc-ui2 ecosystem. This file shows how it interacts with the `__WBC_PRO__` and `__WBC_DEV__` gating conventions you already use.

---

## What /wbLicense actually does

Two distinct jobs, picked by target type:

| Target | Mode | Output |
|---|---|---|
| A single file (`WBCodeSlot.vue`) | Inject tier gates | File is modified to add `__WBC_PRO__` checks around premium code paths |
| A folder/package | Audit tier consistency | Report flags components that expose Pro features to Free users |

Both modes reference `monorepo_rules.md` and the package's `dev.md` to know what "Pro-tier" means for this package.

---

## Example 1 — `/wbLicense packages/wb-dataviewer` (audit mode)

```text
$ /wbLicense packages/wb-dataviewer

[AI] Loading monorepo_rules.md tier definitions...
[AI] Free tier: basic rendering, public data
[AI] Pro tier: premium features (export, advanced filters, custom themes)
[AI]
[AI] Loading context.md + dev.md for wb-dataviewer...
[AI] wbCode dev-only gating convention: __WBC_DEV__
[AI] Pro gating convention: __WBC_PRO__ (per monorepo_rules.md)
[AI]
[AI] Scanning all components for tier-gated code paths...
[AI] Writing reports/20260424/licenses/license_wb-dataviewer_202604240200.md:
```

```markdown
# License audit: @wbc/wb-dataviewer

## Verdict: 🟡 DEBT — 2 leaks, 3 inconsistent gates

## Findings

### [LEAK] Pro feature accessible on Free tier
- src/components/DataViewerExport.vue:45
 Uses `export-to-csv` library unconditionally. Free users can access
 CSV export via prop. Should be gated with `__WBC_PRO__`.

### [LEAK] Pro feature on Free tier (indirect)
- src/composables/useAdvancedFilter.js:12
 Exported publicly. Used by src/App.vue without tier check. Any
 consumer can import it and bypass the gate.

### [INCONSISTENT] Gate pattern divergence
- src/components/ThemeSelector.vue:22
 Uses `if (window.__WBC_PRO__)` — reads global
- src/components/ExportButton.vue:15
 Uses `if (import.meta.env.VITE_WBC_PRO)` — reads env
- src/components/PremiumToggle.vue:8
 Uses `if (__WBC_PRO__ === true)` — strict check
 These should all match. Pick one, codify in dev.md.

### [OK] Correctly gated
- src/components/AdvancedChart.vue — uses __WBC_PRO__ correctly
- src/components/BulkEdit.vue — uses __WBC_PRO__ correctly
- 11 more ...

## What this audit did NOT check
- Runtime bypass via Vue DevTools (can flip __WBC_PRO__ in console)
- Server-side validation (the Pro check is client-side only)
- Whether the Pro features are worth Pro pricing (business decision)

## Recommended next commands
/wbLicense src/components/DataViewerExport.vue # fix the leak
/wbLicense src/composables/useAdvancedFilter.js # fix the leak
/wbPlan packages/wb-dataviewer --task="standardize Pro gate pattern"
```

**What's worth noticing:**

- The audit separates leaks (Pro code runs for Free users) from inconsistencies (gates work but diverge in pattern). Both matter; different severity.
- The "did NOT check" section explicitly names that `__WBC_PRO__` is *client-side*. Runtime bypass via DevTools is a known limitation — gating is a deterrent, not a security boundary.
- Next-command pointers turn audit findings into actionable work.

---

## Example 2 — `/wbLicense src/components/DataViewerExport.vue` (inject mode)

```text
$ /wbLicense src/components/DataViewerExport.vue

[AI] Reading current file...
[AI] Current export logic runs unconditionally (line 45).
[AI]
[AI] Proposed change:
[AI] Wrap the export handler in __WBC_PRO__ check.
[AI] Show upgrade CTA when user clicks and is not Pro.
[AI]
[AI] Existing vs Suggested:
```

```markdown
## Existing (lines 42-50)

```js
handleExport() {
 const csv = toCSV(this.data);
 downloadFile(csv, 'export.csv');
}
```

## Suggested

```js
handleExport() {
 if (typeof __WBC_PRO__ === 'undefined' || !__WBC_PRO__) {
 this.$emit('pro-required', { feature: 'CSV export' });
 return;
 }
 const csv = toCSV(this.data);
 downloadFile(csv, 'export.csv');
}
```

## Note on runtime behavior
- Free users who click Export get a `pro-required` event (parent
 shows an upgrade dialog).
- Pro users get CSV download as before.
- The `typeof` check is intentional: in dev without the define
 plugin, `__WBC_PRO__` is undefined (treated as Free).
```

```text
[AI] Applied the change.
[AI] Writing reports/20260424/licenses/license_DataViewerExport_202604240215.md
[AI] 
[AI] Follow-up recommended: add `pro-required` event handler to
[AI] consumer components (App.vue).
```

**What's worth noticing:**

- The gate emits an event instead of silently failing. This is the wbc-ui2 convention — Pro-required actions surface as events the parent can handle with an upgrade CTA.
- The `typeof` check handles the dev case. Without this, running in a dev env that doesn't define `__WBC_PRO__` throws a ReferenceError.
- The follow-up pointer acknowledges that gating one file creates a ripple — the consumer needs a handler for the emitted event.

---

## Example 3 — `/wbLicense packages/wb-core` (a package with no Pro features)

Not every package has Pro features. The audit should confirm that.

```text
$ /wbLicense packages/wb-core
```

```markdown
# License audit: @wbc/wb-core

## Verdict: 🟢 CLEAN

## Findings
No Pro-tier code paths detected. No leaks possible.

## Observations
- 0 occurrences of `__WBC_PRO__` in source
- 0 imports of tier-check utilities
- context.md confirms: "wb-core is foundation — Pro gating lives
 in higher-level packages (wb-dataviewer, wb-chart, etc.)"

## What this audit did NOT check
- Whether wb-core *should* have Pro features. That's a product
 decision, not a license audit.

## Recommendation
No changes. Re-run after next feature add that might be premium.
```

**What's worth noticing:**

- Clean verdicts are short. No action = no words.
- The audit references `context.md` to confirm the Pro-free status is intentional, not accidental. Prevents future false alarms.

---

## The pattern

Every `/wbLicense` run has:

1. **Tier definitions loaded** — from `monorepo_rules.md`.
2. **Scan for premium code paths** — either existing (in audit mode) or candidate (in inject mode).
3. **Check gate consistency** — pattern drift (env vs. global vs. strict) is a separate finding class from leaks.
4. **Report or inject** — folders → report; files → modify with Existing/Suggested diff.
5. **"What this audit did NOT check"** — especially the client-side-only limitation.

---

---

## Basic Usage

```bash
# Standard command execution
/wbLicense frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbLicense deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbLicense` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbLicense target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbLicense target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbLicense target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbLicense packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbLicense apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbLicense` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbLicense frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

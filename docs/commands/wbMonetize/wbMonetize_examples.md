---
title: "wbMonetize — Examples"
description: "---"
---

# /wbMonetize — Examples

> Self-help. `/wbMonetize` bootstraps the 3-tier (Dev / Free / Pro) system into a package — once. Subsequent runs verify and repair the plumbing without touching the feature split (that's the user's manual decision after bootstrap).

---

## What /wbMonetize actually does

Two distinct modes, picked by **detection** (not by a flag):

| State of target | Mode | What happens |
|---|---|---|
| No `wbMonetize` marker, no gating constants in source | **Bootstrap** | Inject the full tier system, propose feature split, write marker |
| `wbMonetize` marker present + gating constants present | **Maintenance** | Verify plumbing, repair drift vs current `monorepo_rules.md`, advise on features |
| Marker absent BUT gating constants present | **Abort** | Manual gating exists outside the convention — bootstrapping would corrupt it. Ask the user. |

The marker is written to `package.json` under a `wbMonetize` key:

```json
{
 "name": "@wbc/wb-dataviewer",
 "wbMonetize": {
 "version": "1.0",
 "tier": "premium",
 "bootstrappedAt": "2026-04-25T18:00:00Z",
 "rulesVersion": "monorepo_rules.md@<hash>",
 "lastVerifiedAt": "2026-04-25T18:00:00Z"
 }
}
```

Both modes reference `monorepo_rules.md` §3 (Tier System) and §4 (Licensing Flow) as the source of truth.

---

## Example 1 — `/wbMonetize packages/wb-dataviewer` (first run, bootstrap mode)

```text
$ /wbMonetize packages/wb-dataviewer

[AI] Phase 1: detecting monetization state...
[AI] package.json::wbMonetize → ABSENT
[AI] .wb-monetized.json → ABSENT
[AI] __WBC_DEV__ in source → 0 occurrences
[AI] isWbDataviewerPro in source → 0 occurrences
[AI] _wb_dataviewer_auth cookie → 0 occurrences
[AI] created() license hook → not present
[AI] Verdict: BOOTSTRAP mode (no marker, no heuristic gating).
[AI]
[AI] Working tree clean ✓
[AI] Branch: feature/monetize-dataviewer (not main) ✓
[AI]
[AI] Phase 2: proposing feature split...
[AI] Reading WBDataViewer.vue + composables + child components...
```

```markdown
## Proposed feature split for wb-dataviewer

| Feature / file | Tier | Reason |
|---|---|---|
| Basic data rendering (`WBDataViewer.vue` core) | Free | Core value, drives adoption |
| Sub-object extraction (`extractSubObject.js`) | Free | Foundational, low cost |
| Project/cache reactivity (`apiResponse_`) | Free | Foundational |
| CSV/Excel export (`useExport.js`) | **Pro** | Common monetization point; clear user value |
| Advanced filters (`useAdvancedFilter.js`) | **Pro** | Power-user feature |
| Custom themes (`ThemeSelector.vue`) | **Pro** | Polish feature, low gating cost |
| Live-edit panel (`LiveEditPanel.vue`) | **Dev only** | Internal tooling; not for end-users |
| `wbCode` toggle | **Dev only** | Per `feedback_wbCode_dev_only.md` — gated by `__WBC_DEV__` |

Confirm this split, or describe changes (e.g., "move themes to Free; add bulk-edit to Pro").
```

```text
[user] Confirmed. Move ThemeSelector to Free.

[AI] Updated split. Proceeding with bootstrap...
[AI]
[AI] Phase 2 (continued): injecting plumbing...
[AI] ✓ Added __WBC_DEV__ resolution to WBDataViewer.vue:created()
[AI] ✓ Added isWbDataviewerPro store-getter consumption (computed)
[AI] ✓ Wired simulation keys: WBDataviewer_SIMULATE_PRO, WBC_SIMULATE_PRO
[AI] ✓ Added cookie persistence: _wb_dataviewer_auth (1d TTL)
[AI] ✓ Implemented created() license hook per monorepo_rules.md §4
[AI] ✓ Added free-fallback slot to ExportButton.vue, AdvancedFilter.vue
[AI] ✓ Wrote package.json::wbMonetize marker
[AI]
[AI] Test impact (NOT auto-fixed):
[AI] - tests/export.spec.js uses export unconditionally — will fail under Free
[AI] - tests/filters.spec.js uses advanced filters unconditionally — will fail under Free
[AI] These tests need explicit Pro-mode setup. Fix manually or run /wbTest.
[AI]
[AI] Writing reports/20260425/monetize/monetize_wb-dataviewer_180000.md
```

**What's worth noticing:**

- The detection phase outputs every signal it checked, not just the verdict. If something looks wrong, you can see why the AI decided what it did.
- The proposed split is a *proposal*, not a fait accompli. The user adjusted (ThemeSelector → Free) before any code was written.
- Test breakage is surfaced, not silently fixed. The command's job is plumbing; tests are the user's call.
- The marker is written with `rulesVersion` so future maintenance runs can detect rule evolution.

---

## Example 2 — `/wbMonetize packages/wb-dataviewer` (second run, maintenance mode)

Same package, three months later. `monorepo_rules.md` has changed in the meantime — the canonical cookie name was updated from `_wb_[pkg]_auth` to `_wbc_[pkg]_auth`.

```text
$ /wbMonetize packages/wb-dataviewer

[AI] Phase 1: detecting monetization state...
[AI] package.json::wbMonetize → PRESENT
[AI] bootstrappedAt: 2026-01-22T10:30:00Z
[AI] rulesVersion: monorepo_rules.md@a1b2c3d
[AI] Heuristic scan → 14 gating constants, 3 cookies, hook present ✓
[AI] Verdict: MAINTENANCE mode.
[AI]
[AI] Phase 3: reporting current state...
```

```markdown
## Current tier split (no changes proposed)

| Feature | Tier | Source |
|---|---|---|
| Core rendering | Free | WBDataViewer.vue:42-89 |
| Sub-object extraction | Free | extractSubObject.js |
| CSV/Excel export | Pro | useExport.js (gated) |
| Advanced filters | Pro | useAdvancedFilter.js (gated) |
| Custom themes | Free | ThemeSelector.vue |
| Live-edit panel | Dev | LiveEditPanel.vue (__WBC_DEV__) |
| Bulk edit | Pro | BulkEdit.vue (gated) ← added manually since bootstrap |

Feature movement is manual. This run will not change tier assignments.
```

```text
[AI] Phase 3 (continued): verifying plumbing vs current monorepo_rules.md...
[AI] ✓ __WBC_DEV__ resolution — matches current rules
[AI] ✓ isWbDataviewerPro getter — matches current rules
[AI] ✓ Simulation keys — matches current rules
[AI] ✗ Cookie name: _wb_dataviewer_auth — DRIFT (rules now require _wbc_dataviewer_auth)
[AI] ✓ created() hook structure — matches current rules
[AI]
[AI] Repairing drift...
[AI] ✓ Renamed cookie: _wb_dataviewer_auth → _wbc_dataviewer_auth (3 sites)
[AI] ✓ Added one-time migration in created(): reads old cookie, rewrites under new name
[AI] ✓ Updated marker rulesVersion to current
[AI]
[AI] Phase 3 (advisory pass): feature-movement suggestions...
```

```markdown
## Advisory (no changes applied)

- `BulkEdit.vue` is currently **Pro**. Usage analytics (if you have them) would tell you if this is the right tier — bulk edits are often a power-user feature that drives upgrades. Keep monitoring.
- `ThemeSelector.vue` is **Free**. Consider whether premium theme packs (a subset) could be Pro while keeping the base selector Free. Common pattern.
- No leaks detected — gates are consistent.

These are suggestions only. Move features manually if you choose.
```

```text
[AI] Writing reports/20260425/monetize/monetize_wb-dataviewer_180530.md
[AI] Marker updated: lastVerifiedAt = 2026-04-25T18:05:30Z
[AI]
[AI] Recommended next:
[AI] - /wbTest packages/wb-dataviewer (verify cookie migration works)
[AI] - Manual review of advisory suggestions
```

**What's worth noticing:**

- The maintenance run does not propose to reorganize features. `BulkEdit.vue` was added manually after bootstrap; the command notices and reports it but leaves it alone.
- Drift repair is surgical: cookie name changed, plus a migration shim so existing users' cookies still work. The command does not silently break production users.
- Advisory section is clearly separated from "applied changes". The user reads it as a suggestion list, not a diff.

---

## Example 3 — `/wbMonetize packages/wb-core` (abort case)

```text
$ /wbMonetize packages/wb-core

[AI] Phase 1: detecting monetization state...
[AI] package.json::wbMonetize → ABSENT
[AI] Heuristic scan → __WBC_DEV__ found in 3 files, but no
[AI] isWbCorePro, no cookies, no created() hook
[AI] Verdict: ABORT — partial gating without marker.
[AI]
[AI] wb-core has __WBC_DEV__ usage (legitimate dev gates per the
[AI] feedback_wbCode_dev_only.md convention) but no Pro tier infrastructure.
[AI]
[AI] This is expected for foundational packages. wb-core is not meant to be
[AI] a premium package — it's the substrate. Per monorepo_rules.md §3, only
[AI] premium packages need full tier systems.
[AI]
[AI] If you intended to monetize wb-core (which would be unusual), confirm
[AI] explicitly with --force-bootstrap. Otherwise, no action needed.
[AI]
[AI] No changes made. No report written.
```

**What's worth noticing:**

- The hybrid detection caught a legitimate case where the heuristic *would* have triggered (one of the three constants was present) but the package isn't actually meant to be tier-gated.
- Aborting and explaining beats silently bootstrapping. The user can override with a flag if they really mean it.
- No report file is written for an abort — there's nothing to record.

---

## The pattern

Every `/wbMonetize` run has:

1. **Phase 1: detect.** Marker + heuristic scan reconciled into one of three verdicts: BOOTSTRAP, MAINTENANCE, ABORT.
2. **Phase 2 or 3 (mutually exclusive).** Bootstrap injects the full tier system once. Maintenance verifies and repairs without touching feature placement.
3. **Phase 4: report.** Write a dated report with the mode, the changes applied (or not), the test impact (bootstrap only), and recommended next commands.
4. **Marker discipline.** The marker is the source of truth for "has this package been bootstrapped?" Heuristic is the safety net.

---

---

## Basic Usage

```bash
# Standard command execution
/wbMonetize frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbMonetize deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbMonetize` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbMonetize target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbMonetize target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbMonetize target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbMonetize packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbMonetize apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbMonetize` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbMonetize frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

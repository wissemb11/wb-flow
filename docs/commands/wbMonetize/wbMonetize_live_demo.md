# /wbMonetize — Live Demo ()

This is what `/wbMonetize` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](./wbMonetize_exhaustive_simulation), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbMonetize" />

## 1. Live target

| Field | Live value |
|---|---|
| Tier system | `tierEnforcement.js` in wb-core — 3 tiers: free, pro, enterprise |
| `__WBC_DEV__` gating | 3-mode: `dev` (all unlocked), `staging` (tier-enforced), `prod` (tier-enforced + Stripe) |
| Currently gated features | ExportPanel (enterprise), AdvancedFilters (pro), BulkExport (pro) |
| Ungated features | BasicView, DataGrid, ThemeToggle |
| Stripe config | `.env.STRIPE_KEY` configured for staging, not yet for production |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbMonetize ExportPanel.vue -t="enterprise"` | Already gated at enterprise. No-op with `ℹ️ Already gated.` |
| `/wbMonetize ThemeToggle.vue -t="pro"` | Would wrap ThemeToggle with pro-tier gate. |
| `/wbMonetize AdvancedFilters.vue -r` | Would strip the pro gate, making it free. |
| `/wbMonetize "make dark mode pro"` | Fuzzy-matches → ThemeToggle.vue, wraps dark-mode branch. |

---

## 3. Pipelines on this exact workspace

<script setup>
const wbMonetizePipelines = [
  {
    "title": "Gate dark mode to Pro tier",
    "cmd": "/wbMonetize core2/packages/wb-dataviewer/src/components/ThemeToggle.vue -t=\"pro\" -s",
    "logs": [
      {
        "text": "[SYSTEM] Gating ThemeToggle.vue at Pro tier.",
        "type": "sys"
      },
      {
        "text": "[AST] Parsed: 1 default export (ThemeToggle component).",
        "type": "gen"
      },
      {
        "text": "[GATE]",
        "type": "gen"
      },
      {
        "text": "import { withTierGate } from '@wbc-ui2/wb-core/tierEnforcement'",
        "type": "gen"
      },
      {
        "text": "import { useStripeCheckout } from '@wbc-ui2/wb-core/billing'",
        "type": "gen"
      },
      {
        "text": "export default withTierGate(ThemeToggle, {",
        "type": "gen"
      },
      {
        "text": "tier: 'pro',",
        "type": "gen"
      },
      {
        "text": "fallback: () => StripeUpgradeModal({ feature: 'Dark Mode' })",
        "type": "gen"
      },
      {
        "text": "})",
        "type": "gen"
      },
      {
        "text": "[OK] ThemeToggle is now Pro-gated with Stripe checkout.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Free up AdvancedFilters for engagement",
    "cmd": "/wbMonetize core2/packages/wb-dataviewer/src/components/AdvancedFilters.vue -r",
    "logs": [
      {
        "text": "[SYSTEM] Removing tier gate from AdvancedFilters.vue...",
        "type": "sys"
      },
      {
        "text": "[AST] Found: withTierGate(AdvancedFilters, { tier: 'pro' })",
        "type": "gen"
      },
      {
        "text": "[REMOVE] Stripped wrapper + 2 unused imports.",
        "type": "gen"
      },
      {
        "text": "[OK] AdvancedFilters is now free for all users.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Audit all gated features (dry-run)",
    "cmd": "/wbMonetize core2/packages/wb-dataviewer/src/**/*.vue -t=\"pro\" -d",
    "logs": [
      {
        "text": "[DRY-RUN] Scanning 12 Vue components...",
        "type": "warn"
      },
      {
        "text": "[STATUS]",
        "type": "gen"
      },
      {
        "text": "Already gated (pro): AdvancedFilters.vue, BulkExport.vue",
        "type": "gen"
      },
      {
        "text": "Already gated (enterprise): ExportPanel.vue",
        "type": "gen"
      },
      {
        "text": "Would gate (pro): DataPipeline.vue, ScheduledReports.vue, ThemeToggle.vue",
        "type": "gen"
      },
      {
        "text": "Already free: BasicView.vue, DataGrid.vue, + 4 others",
        "type": "gen"
      },
      {
        "text": "[DRY-RUN] 3 files would be modified. 2 already at requested tier. Disk untouched.",
        "type": "warn"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbMonetize" :pipelines="wbMonetizePipelines" />


### 💠 Pipeline Gate dark mode to Pro tier


### 💠 Pipeline Free up AdvancedFilters for engagement


### 💠 Pipeline Audit all gated features (dry-run)

---

## 4. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbMonetize BasicView.vue -t="premium"` | `❌ Tier 'premium' not found. Available: free, pro, enterprise.` |
| `/wbMonetize ExportPanel.vue -r` (enterprise feature) | Proceeds. `[REMOVE] Stripping enterprise gate.` (No confirmation for destructive action — use `-d` first.) |
| `/wbMonetize src/WBC.js -t="pro"` | `⚠️ WBC.js is a core runtime file, not a feature component. Gating it would break all consumers. Confirm intent?` |

The pattern: **`/wbMonetize` is the per-feature application of the tier system.** `tierEnforcement.js` defines the tiers; `/wbMonetize` connects individual components to those tiers. The `__WBC_DEV__` mode determines runtime behavior — in dev mode, all gates pass regardless of tier assignment.

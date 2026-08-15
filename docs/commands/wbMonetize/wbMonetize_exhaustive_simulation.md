# /wbMonetize — Exhaustive Simulation ()

`/wbMonetize` is the commercialization agent. It wraps existing UI components or API routes with tier-based access gates (Free, Pro, Enterprise). The central design principle: **fail-closed security.** If the monetization check errors, access to the premium feature is denied by default. A broken paywall that lets everyone in is worse than a broken paywall that lets no one in.

Read this if you want to know how the AST wrapping works, why `--remove` exists as a separate destructive flag, and how the `__WBC_DEV__` 3-mode gating pattern interacts with monetization.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Commercializer. Wraps features in subscription-based access gates. |
| **Target** | UI components (Vue/React), API routes, or specific feature branches. |
| **Cell scope** | None. `/wbMonetize` doesn't interact with plans. |
| **Side effects allowed** | Wrapping component exports, injecting middleware, adding billing imports. |
| **Side effects forbidden** | Modifying the feature's business logic, changing data flow, altering test behavior. |

The key architectural detail: `/wbMonetize` works with wb-core's existing `__WBC_DEV__` 3-mode gating system. The `free`/`pro`/`enterprise` tiers are already defined in `tierEnforcement.js`. `/wbMonetize` connects features to those tiers — it doesn't create a new gating system.

---

## 2. Argument resolution

| Form | Example | What `/wbMonetize` does |
|---|---|---|
| Specific file | `Command: /wbMonetize src/components/ExportData.vue` | Wraps the component export with a tier-checking HOC/wrapper. |
| Directory path | `Command: /wbMonetize src/api/premium/` | Injects billing middleware into all routes. |
| Comma-separated | `Command: /wbMonetize src/Dashboard.vue,src/Reports.vue` | Same tier gate on both features. |
| Natural language | `Command: /wbMonetize "make dark mode a pro feature"` | Fuzzy-matches → finds ThemeToggle.vue, wraps the dark mode branch. |

Natural language targeting is supported here (unlike `/wbWork`) because monetization decisions are often described in product terms ("make X a pro feature") rather than file paths. The risk of a wrong match is low — the user reviews the diff before committing.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--stripe` | `-s` | Injects Stripe Checkout integration instead of a generic paywall lock. |
| `--dry-run` | `-d` | Simulates the wrapping and shows a diff without modifying files. |
| `--remove` | `-r` | Destructive: un-gates the feature, making it free for all users. |

**`--remove` strips the gate entirely** — no wrapper, no billing imports, no runtime check. It is the inverse of a normal `/wbMonetize` run, not a softer version of one: use it when the gate should never have existed.

**`--stripe` vs generic paywall.** The generic paywall shows a "locked" UI with no payment flow. `--stripe` adds Stripe Elements, Payment Intent hooks, and a checkout modal. Use generic during development; switch to `--stripe` before production launch.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbMonetizeSimPipelines = [
  {
    "title": "Gate the WBDataViewer export feature to Enterprise",
    "cmd": "/wbMonetize core2/packages/wb-dataviewer/src/components/ExportPanel.vue -t=\"enterprise\" -s",
    "logs": [
      {
        "text": "[SYSTEM] Targeting ExportPanel.vue for Enterprise tier gating.",
        "type": "sys"
      },
      {
        "text": "[AST] Parsed component: 1 default export, 3 methods.",
        "type": "gen"
      },
      {
        "text": "[GATE] Wrapping export with tier check:",
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
        "text": "// Original: export default ExportPanel",
        "type": "gen"
      },
      {
        "text": "export default withTierGate(ExportPanel, {",
        "type": "gen"
      },
      {
        "text": "tier: 'enterprise',",
        "type": "gen"
      },
      {
        "text": "fallback: () => StripeUpgradeModal({ feature: 'Export to PDF' })",
        "type": "gen"
      },
      {
        "text": "})",
        "type": "gen"
      },
      {
        "text": "[INJECT] Added Stripe Checkout modal as fallback UI.",
        "type": "gen"
      },
      {
        "text": "[OK] ExportPanel is now Enterprise-gated with Stripe integration.",
        "type": "ok"
      }
    ],
    "note": "The export-to-PDF feature in WBDataViewer should be Enterprise-only. It uses the `apiResponse_` cached data, so the gate needs to wrap the export action, not the data display:",
    "noteType": "info"
  },
  {
    "title": "Democratize a formerly paid feature",
    "cmd": "/wbMonetize core2/packages/wb-dataviewer/src/components/BasicView.vue -r",
    "logs": [
      {
        "text": "[SYSTEM] Removing tier gate from BasicView.vue...",
        "type": "sys"
      },
      {
        "text": "[AST] Found: withTierGate(BasicView, { tier: 'pro' })",
        "type": "gen"
      },
      {
        "text": "[REMOVE] Stripping withTierGate wrapper.",
        "type": "gen"
      },
      {
        "text": "[REMOVE] Cleaning unused imports: withTierGate, useStripeCheckout.",
        "type": "gen"
      },
      {
        "text": "[OK] BasicView is now available to all users. No billing code remains.",
        "type": "ok"
      }
    ],
    "note": "The basic data view in WBDataViewer was Pro-only but is being moved to Free for engagement:",
    "noteType": "info"
  },
  {
    "title": "Dry-run before a mass monetization change",
    "cmd": "/wbMonetize core2/packages/wb-dataviewer/src/premium/**/*.vue -t=\"pro\" -d",
    "logs": [
      {
        "text": "[DRY-RUN] Resolving glob: 5 Vue components.",
        "type": "warn"
      },
      {
        "text": "[DRY-RUN] Would wrap:",
        "type": "warn"
      },
      {
        "text": "AdvancedFilters.vue \u2192 withTierGate(..., { tier: 'pro' })",
        "type": "gen"
      },
      {
        "text": "BulkExport.vue \u2192 withTierGate(..., { tier: 'pro' })",
        "type": "gen"
      },
      {
        "text": "CustomDashboard.vue \u2192 withTierGate(..., { tier: 'pro' })",
        "type": "gen"
      },
      {
        "text": "DataPipeline.vue \u2192 withTierGate(..., { tier: 'pro' })",
        "type": "gen"
      },
      {
        "text": "ScheduledReports.vue \u2192 withTierGate(..., { tier: 'pro' })",
        "type": "gen"
      },
      {
        "text": "[DRY-RUN] 5 files would be modified. Disk untouched.",
        "type": "warn"
      }
    ],
    "note": "Before gating an entire directory, preview the impact:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbMonetize" titleSuffix="Exhaustive Simulation" :pipelines="wbMonetizeSimPipelines" />


### 💠 Pipeline Gate the WBDataViewer export feature to Enterprise

The export-to-PDF feature in WBDataViewer should be Enterprise-only. It uses the `apiResponse_` cached data, so the gate needs to wrap the export action, not the data display:


### 💠 Pipeline Democratize a formerly paid feature

The basic data view in WBDataViewer was Pro-only but is being moved to Free for engagement:


### 💠 Pipeline Dry-run before a mass monetization change

Before gating an entire directory, preview the impact:

---

## 5. Edge cases & refusals

| Trigger | What `/wbMonetize` does |
|---|---|
| Missing `BillingProvider` at root | `⚠️ BillingProvider not found in root App. Gated features will crash at runtime. Add <BillingProvider> first.` |
| File exports multiple functions (ambiguous) | `❌ Ambiguous export. ExportPanel.vue exports 3 named functions — specify which to gate, or use a default export.` |
| `-r` on a file that isn't gated | `ℹ️ BasicView.vue has no tier gate. No changes needed.` |
| `-t="premium"` (nonexistent tier) | `❌ Tier 'premium' not found. Available tiers: free, pro, enterprise.` |
| Gating a file that's already gated at a different tier | Proceeds: updates the tier. `[UPGRADE] ExportPanel: pro → enterprise.` |
| `--stripe` without a configured Stripe key | `⚠️ No Stripe publishable key found in .env. Stripe checkout will fail at runtime. Configure STRIPE_KEY.` |

The unifying principle: **`/wbMonetize` connects features to the existing tier system — it doesn't create one.** The `__WBC_DEV__` 3-mode gating and `tierEnforcement.js` are the infrastructure; `/wbMonetize` is the per-feature application layer. It wraps the AST, injects the right imports, and lets the existing enforcement logic do the runtime work.

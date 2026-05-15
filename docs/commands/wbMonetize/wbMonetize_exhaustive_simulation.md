# wb-flow Protocol: /wbMonetize Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbMonetize` command. It serves as the definitive reference for how the agent automatically injects paywalls, wraps features in subscription checks, and integrates Stripe billing components into the frontend architecture.

---

## 1. Role & Definition Matrix
**Role:** The Commercialization & Paywall Agent
**Target:** Wraps existing UI components or backend API routes with tier-based access gates (e.g., Free, Pro, Enterprise).
**Core Protocol:** Strict "Fail-Closed" security. The agent must ensure that if the monetization check fails or errors, access to the premium feature is denied by default.

| Scenario | System Behavior |
|---|---|
| Target is UI Component | **[PROCEED]** Analyzes AST. Wraps the component export in a Higher-Order Component (HOC) like `withPaywall(Component, 'pro_tier')`. |
| Target is API Route | **[PROCEED]** Injects subscription-checking middleware into the route controller. |
| Code Already Gated | **[PROCEED]** Modifies the existing gate (e.g., upgrading a 'pro' feature to 'enterprise'). |

---

## 2. Argument & Criteria Resolution Matrix
`/wbMonetize` requires precise scoping to prevent accidentally paywalling core free functionality.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbMonetize src/components/ExportData.jsx` | Locks onto the specific feature. | Wraps the `ExportData` component with a Stripe checkout trigger. |
| Directory Path | `Command: /wbMonetize src/api/premium/` | Sweeps the directory. | Injects billing middleware into all routes within the premium folder. |
| Comma-Separated | `Command: /wbMonetize src/Dashboard.js,src/Reports.js` | Parses multiple scopes. | Applies the same tier gate to both dashboard and reporting features. |
| Natural Language | `Command: /wbMonetize "make the dark mode a pro feature"` | Fuzzily matches logic. | Identifies `ThemeToggle.js` and applies a paywall to the dark mode branch. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--tier="<name>"` | `-t` | Explicitly sets the required subscription tier (`free`, `pro`, `enterprise`). | `Command: /wbMonetize src/Export.js -t="enterprise"` | `[TIER] Gating Export feature. Required: Enterprise.` |
| `--stripe` | `-s` | Injects boilerplate Stripe Checkout integration instead of a generic paywall lock. | `Command: /wbMonetize src/Upgrade.js -s` | `[STRIPE] Added Stripe Elements and Payment Intent hooks.` |
| `--dry-run` | `-d` | Simulates the AST wrapping without modifying the actual source code. | `Command: /wbMonetize src/App.js -d` | `[DRY-RUN] Would wrap App in BillingProvider. Disk untouched.` |
| `--remove` | `-r` | Destructively un-gates the feature, making it free for all users. | `Command: /wbMonetize src/Feature.js -r` | `[REMOVE] Stripped withPaywall HOC. Feature is now Free.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Pro-Tier Lockdown" (`src/premium/**/*.js -t="pro" -s`)
**Context:** A product manager decides that an entire folder of experimental features is ready for commercialization. They want all features locked behind the "Pro" tier and integrated with Stripe.
**Command Executed:** `/wbMonetize src/premium/**/*.js -t="pro" -s`
**Simulated Protocol Chain:**
1. Resolves glob to 8 React components.
2. AST Parsing: Imports the `withPaywall` HOC and `useStripe` hooks.
3. Wraps the default export of every file.
4. Injects a fallback UI ("Upgrade to Pro to unlock this feature") if the user is Free.
**Simulated Output:**
```markdown
> Command: /wbMonetize src/premium/**/*.js -t="pro" -s

[SYSTEM] Initiating Massive Pro-Tier Lockdown...
[AST] Parsed 8 component files.
[TIER] Applying 'pro' access requirement.
[STRIPE] Injecting Checkout modal fallback UI.
[SYNC] Rewriting ASTs...
[SUCCESS] 8 features successfully monetized.
```

### 💠 The "Feature Democratization" (`src/BasicExport.js -r`)
**Context:** A formerly paid feature is being moved to the Free tier to drive user engagement.
**Command Executed:** `/wbMonetize src/BasicExport.js -r`
**Simulated Output:**
```markdown
> Command: /wbMonetize src/BasicExport.js -r

[SYSTEM] Initiating Feature Democratization...
[AST] Locating `withPaywall(BasicExport, 'pro')`.
[REMOVE] Stripping HOC wrapper and unused billing imports.
[SUCCESS] BasicExport is now available to all users.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Missing Billing Context | Feature is monetized, but the root `<App />` lacks `<BillingProvider>`. | `⚠️ Warning: BillingProvider missing from root. Features will crash if triggered.` |
| Syntax Error | File exports multiple functions; AST cannot determine which to wrap. | `❌ Error: Ambiguous export detected. Use named exports or manually apply HOC.` |
| Remove Misfire | User runs `-r` on a file that isn't currently paywalled. | `⚠️ Warning: Feature is already Free. No changes made.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

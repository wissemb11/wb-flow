# /wbSecure — Exhaustive Simulation ()

`/wbSecure` is the red team. It wears the **opposite hat** from `/wbAudit`: where `/wbAudit --profile="security"` is a defensive scan ("are there known vulnerabilities here?"), `/wbSecure` is offensive ("how would I attack this?"). The two complement each other; both produce reports, neither writes plan cells.

Read this if you want to know what makes `/wbSecure` different from `/wbAudit`'s security profile, why `--force-past-security` is a name that signals destructive intent, and where security review ends and the security work begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Red Team — adversarial security review from an attacker's perspective. |
| **Target** | A file, directory, glob, or sub-system focus. |
| **Cell scope** | None directly. Output is a security report + optional follow-up plan rows via chaining (not via direct mutation). |
| **Side effects allowed** | Reading code, reading dependency manifests, reading auth flows, simulating attack paths in prose. |
| **Side effects forbidden** | Editing source code, running actual exploit attempts, fetching CVE databases (no external calls), modifying secrets/env files. |

The "opposite hat" framing is the design center. `/wbAudit --profile="security"` looks for known patterns of vulnerability — they're checklist items: "is `eval` used? is `innerHTML` used? are tokens in localStorage?" `/wbSecure` instead asks "as an attacker, what would I try?" The output is reasoning chains: "I'd start with the auth flow, look for X, escalate via Y."

The two are valuable together. A defensive checklist might miss a vulnerability that's specific to *this* code's logic; an offensive scenario might miss a generic pattern that's everywhere. Run both for high-stakes code (auth, payments, tier enforcement).

---

## 2. Argument resolution matrix

| Form | Example | What `/wbSecure` does |
|---|---|---|
| File | `Command: /wbSecure core2/packages/wb-core/src/tierEnforcement.js` | Deep adversarial review of one file; threat-models its inputs and call paths. |
| Directory | `Command: /wbSecure core2/packages/wb-core/src/auth/` | Walks the auth-relevant code; produces attack scenarios per entry point. |
| Glob | `Command: /wbSecure "core2/packages/*/src/**/auth*.{js,ts}"` | Cross-package; expensive; warns about scope. |
| Free-text scope | `Command: /wbSecure "the JWT handshake"` | Resolves keyword across workspace; refuses if ambiguous. |
| `--focus="<topic>"` | `Command: /wbSecure --focus="payment flow"` | Same as free-text but explicit. |

---

## 3. Flag matrix

`/wbSecure` has two flags. Both shape *what's in scope*, not how the review behaves.

| Flag | Shortcut | Purpose |
|---|---|---|
| `--focus="<topic>"` | `-f` | Scopes the review to one sub-system (auth, tier-enforcement, payment, data export). |
| `--force-past-security` | `-F` | **Override flag.** Tells `/wbSecure` to proceed even when the agent would otherwise refuse (e.g., reviewing code with known sensitive secrets visible, or reviewing in a context where the report would be immediately consumable by an attacker). Capitalized to signal destructive intent. |

### What `--force-past-security` actually unblocks

The flag exists for a narrow set of cases the agent would otherwise refuse:

| Refusal | What `-F` overrides |
|---|---|
| File contains literal secrets in source | Agent normally refuses to include the file in the report. `-F` allows inclusion. |
| Review target is a third-party dependency | Agent normally refuses (third-party security is upstream's responsibility). `-F` lets you proceed for a vendored/forked dep you need to review. |
| Adversarial output would be high-detail attack steps | Agent normally produces high-level threat models. `-F` allows step-by-step attack chains (only for code you control). |

The flag's name is uncomfortable on purpose. "force" + "past security" reads as a warning — using it should require a moment of "am I sure?"

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbSecureSimPipelines = [
  {
    "title": "Adversarial review of tier enforcement",
    "cmd": "/wbSecure core2/packages/wb-core/src/tierEnforcement.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: tierEnforcement.js",
        "type": "sys"
      },
      {
        "text": "[MODE] Adversarial \u2014 assume attacker wants to bypass tier checks.",
        "type": "gen"
      },
      {
        "text": "[SCAN] Reading file (87 lines, exports enforceTier)...",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Reading callers via grep: 6 call sites across wb-core.",
        "type": "ctx"
      },
      {
        "text": "## Threat model",
        "type": "sys"
      },
      {
        "text": "The file's job is \"given a JWT and a requested action, decide whether",
        "type": "gen"
      },
      {
        "text": "the caller's tier permits it.\" An attacker's goals would be:",
        "type": "gen"
      },
      {
        "text": "1. Escalate from Free \u2192 Paid tier without paying.",
        "type": "gen"
      },
      {
        "text": "2. Bypass the check entirely (tier='admin' regardless of JWT).",
        "type": "gen"
      },
      {
        "text": "3. Replay a Paid-tier token after subscription expiry.",
        "type": "gen"
      },
      {
        "text": "## Attack paths considered",
        "type": "sys"
      },
      {
        "text": "### Path 1 \u2014 Algorithm confusion (`alg:\"none\"`)",
        "type": "gen"
      },
      {
        "text": "**Severity:** High",
        "type": "sys"
      },
      {
        "text": "**File:** tierEnforcement.js:42",
        "type": "sys"
      },
      {
        "text": "**Attack:** Craft a JWT with header `{\"alg\":\"none\"}` and tier=\"admin\"",
        "type": "sys"
      },
      {
        "text": "in payload. If the verify function accepts `alg:\"none\"`, no signature",
        "type": "gen"
      },
      {
        "text": "is required.",
        "type": "gen"
      },
      {
        "text": "**Status in current code:** The verify code does NOT include an",
        "type": "sys"
      },
      {
        "text": "algorithm denylist. `jwt.verify()` is called without `algorithms: ['HS256']`",
        "type": "gen"
      },
      {
        "text": "constraint.",
        "type": "gen"
      },
      {
        "text": "**Verdict:** **Vulnerable.** This is the same finding that came up",
        "type": "sys"
      },
      {
        "text": "in /wbAudit security profile \u2014 both lenses surface it because it's",
        "type": "gen"
      },
      {
        "text": "both a known-pattern issue and an obvious attack path.",
        "type": "gen"
      },
      {
        "text": "### Path 2 \u2014 Tier confusion via JSON injection",
        "type": "gen"
      },
      {
        "text": "**Severity:** Low",
        "type": "sys"
      },
      {
        "text": "**Attack:** If tier is parsed from a string field that allows",
        "type": "sys"
      },
      {
        "text": "escape sequences, an attacker might inject control characters that",
        "type": "gen"
      },
      {
        "text": "fool downstream string compares.",
        "type": "gen"
      },
      {
        "text": "**Status in current code:** Tier is read from `decoded.tier` (a JS",
        "type": "sys"
      },
      {
        "text": "object property), not from a raw string. No injection surface.",
        "type": "gen"
      },
      {
        "text": "**Verdict:** Not exploitable as written.",
        "type": "sys"
      },
      {
        "text": "### Path 3 \u2014 Replay after expiry",
        "type": "gen"
      },
      {
        "text": "**Severity:** Medium",
        "type": "sys"
      },
      {
        "text": "**Attack:** A token signed correctly today is valid until its `exp`",
        "type": "sys"
      },
      {
        "text": "claim. If the user downgrades tomorrow, the token's tier is still",
        "type": "gen"
      },
      {
        "text": "the old one until expiry.",
        "type": "gen"
      },
      {
        "text": "**Status in current code:** No revocation list. Standard JWT",
        "type": "sys"
      },
      {
        "text": "behavior \u2014 tokens are valid until `exp`.",
        "type": "gen"
      },
      {
        "text": "**Verdict:** Acceptable for small `exp` windows (\u22641 hour). For",
        "type": "sys"
      },
      {
        "text": "longer-lived tokens, add a revocation check or use server-side sessions.",
        "type": "gen"
      },
      {
        "text": "## Recommendations",
        "type": "sys"
      },
      {
        "text": "1. **Path 1 fix:** Add `algorithms: ['HS256']` to the verify call.",
        "type": "gen"
      },
      {
        "text": "This is also a /wbAudit P0 finding.",
        "type": "gen"
      },
      {
        "text": "2. **Path 3 evaluation:** Confirm the deployed `exp` window. If >1h,",
        "type": "gen"
      },
      {
        "text": "plan the revocation work; if \u22641h, document the trade-off.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Report only. To track findings as plan rows:",
        "type": "gen"
      },
      {
        "text": "/wbSecure ... --wbPlan (chains through /wbActOn).",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The `--force-past-security` override",
    "cmd": "/wbSecure vendor/jwt-helper/",
    "logs": [
      {
        "text": "[SYSTEM] Target: vendor/jwt-helper/",
        "type": "sys"
      },
      {
        "text": "[CONTEXT] Path matches \"vendor/\" pattern \u2014 likely third-party code.",
        "type": "ctx"
      },
      {
        "text": "[REFUSE] /wbSecure normally declines third-party reviews.",
        "type": "error"
      },
      {
        "text": "[REASON] Third-party security is upstream's responsibility; reviewing",
        "type": "gen"
      },
      {
        "text": "vendored copies tends to surface findings that should be",
        "type": "gen"
      },
      {
        "text": "reported upstream rather than patched locally.",
        "type": "gen"
      },
      {
        "text": "[OVERRIDE] If you've forked this dep and own its security surface",
        "type": "gen"
      },
      {
        "text": "in this workspace, use:",
        "type": "gen"
      },
      {
        "text": "/wbSecure vendor/jwt-helper/ --force-past-security",
        "type": "gen"
      },
      {
        "text": "[NO REVIEW] Halted.",
        "type": "gen"
      }
    ],
    "note": "A user wants to review a vendored dependency they've forked into the workspace:",
    "noteType": "info"
  },
  {
    "title": "Cross-cutting focus (`--focus=\"auth\"`)",
    "cmd": "/wbSecure --focus=\"auth\"",
    "logs": [
      {
        "text": "[SYSTEM] Focus: auth",
        "type": "sys"
      },
      {
        "text": "[SCAN] Cross-referencing auth-related code across the workspace...",
        "type": "gen"
      },
      {
        "text": "[FOUND] 3 packages touch auth:",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-core/src/tierEnforcement.js (verifier)",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-dataviewer/src/auth.js (consumer)",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wbc-ui2-cdn/src/login.vue (UI entry point)",
        "type": "gen"
      },
      {
        "text": "[WARN] Cross-package security reviews are larger and slower; this",
        "type": "warn"
      },
      {
        "text": "run will take ~3 minutes.",
        "type": "gen"
      },
      {
        "text": "# Adversarial review: auth subsystem (cross-package)",
        "type": "gen"
      },
      {
        "text": "## Trust boundaries",
        "type": "sys"
      },
      {
        "text": "- Browser \u2192 wbc-ui2-cdn login flow \u2192 wb-core verifier \u2192 wb-dataviewer",
        "type": "gen"
      },
      {
        "text": "consumer.",
        "type": "gen"
      },
      {
        "text": "- The trust boundary is at the verifier (wb-core/tierEnforcement.js).",
        "type": "gen"
      },
      {
        "text": "Everything past it assumes a valid token.",
        "type": "gen"
      },
      {
        "text": "## Attack paths",
        "type": "sys"
      },
      {
        "text": "### Path 1 \u2014 Same as Pipeline A (alg:\"none\" on verifier)",
        "type": "gen"
      },
      {
        "text": "[... details ...]",
        "type": "gen"
      },
      {
        "text": "### Path 4 \u2014 Login UI sends token to wrong endpoint",
        "type": "gen"
      },
      {
        "text": "**Status:** Worth checking. login.vue posts to a hardcoded URL.",
        "type": "sys"
      },
      {
        "text": "What if the URL were swapped? (DNS rebinding, host header injection.)",
        "type": "gen"
      },
      {
        "text": "### Path 5 \u2014 wb-dataviewer trusts decoded.tier without re-verifying",
        "type": "gen"
      },
      {
        "text": "**Severity:** Medium",
        "type": "sys"
      },
      {
        "text": "**Reason:** The consumer reads `decoded.tier` directly from a token",
        "type": "sys"
      },
      {
        "text": "that was verified upstream. If the upstream verifier has any flaw,",
        "type": "gen"
      },
      {
        "text": "the consumer inherits it without independent check. (This is by",
        "type": "gen"
      },
      {
        "text": "design \u2014 depth-defense isn't this architecture's pattern \u2014 but worth",
        "type": "gen"
      },
      {
        "text": "naming.)",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Report saved.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbSecure" titleSuffix="Exhaustive Simulation" :pipelines="wbSecureSimPipelines" />


### 💠 Pipeline Adversarial review of tier enforcement


### 💠 Pipeline The `--force-past-security` override

A user wants to review a vendored dependency they've forked into the workspace:


### 💠 Pipeline Cross-cutting focus (`--focus="auth"`)

---

## 5. Edge cases & refusals

| Trigger | What `/wbSecure` does |
|---|---|
| No target | Halt. |
| Target contains literal secrets in source | Refuse without `-F`. |
| Target is a third-party (`node_modules/`, `vendor/`) | Refuse without `-F`. |
| Free-text target with 3+ unrelated matches | Halt with disambiguation. Adversarial review is bias-amplifying when fuzzy-matched. |
| `--focus=""` | Halt — empty focus. |
| Cross-package review with no relevant code found | Honest "no auth-related code in target." Suggests narrowing. |
| Review request that would produce step-by-step attack instructions | Default: high-level only. `-F` permits step-by-step (for code the user owns). |
| Memory contradicts the framing (e.g., user asks about a feature memory says was removed) | Surface the contradiction; ask whether the user wants a historical or current review. |

The pattern: **`/wbSecure` is the offensive lens — adversarial reasoning, not pattern-matching.** It complements `/wbAudit --profile="security"` by surfacing code-specific attack paths the checklist might miss. The `-F` override is named to signal destructive intent and is recorded in every report it produces. The output is reasoning the user can follow and verify; `/wbSecure` doesn't fix things, doesn't generate exploit code, and doesn't fetch external CVE data — it stays inside the workspace and the user's threat model.

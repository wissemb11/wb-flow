# /wbSecure — Live Demo ()

What `/wbSecure` would actually surface on `wb-labs` right now. The candidate targets and likely attack paths below are real for the current state.

---

<CommandLiveDemoAnimation command="wbSecure" />

## 1. Live target

| Field | Live value |
|---|---|
| Most-security-relevant code | `core2/packages/wb-core/src/tierEnforcement.js` (gates privileged ops) |
| Cross-package auth surface | wb-core (verifier) + hypothetical consumer in wb-dataviewer |
| Known live security finding | JWT alg-denylist gap in tierEnforcement.js (per `/wbAudit --profile="security"` simulation in earlier files) |
| Third-party / vendored code | None obvious in `core2/`; would refuse without `-F` if requested |
| Memory rules | `feedback_no_git.md` (no git ops), `feedback_model_selection.md` (the agent for complex/auth work) — declared the agent for /wbSecure runs |

The first row is the natural target. tierEnforcement.js is the highest-value file in the workspace from a security perspective — anything that bypasses it bypasses every tier check.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbSecure core2/packages/wb-core/src/tierEnforcement.js` | Standard adversarial review. Would surface alg:"none" (Path 1) plus replay considerations (Path 3) plus tier-confusion check (Path 2: not exploitable as written). |
| `/wbSecure --focus="auth"` | Cross-package; would warn about the multi-package scope, then run. |
| `/wbSecure --focus="payment"` | Honest "no payment code found." Suggests `/wbVision` if exploring future payment work. |
| `/wbSecure node_modules/jsonwebtoken/` | Refuse — third-party; suggests `-F` only if user owns the fork. |
| `/wbSecure "the JWT thing"` | Halt — too ambiguous; lists candidate files. |
| `/wbSecure core2/packages/wbc-ui2-cdn/` | Permitted but cautious — memory flags this package as parked. Would scan for security issues but NOT auto-promote findings to plan. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| (no flag, file target) | Standard adversarial review. |
| `--focus="auth"` | Cross-package walk; warning about scope. |
| `-F` alone, on a vendored target | Required override; recorded in report header. |
| `-F` on a file with literal secrets | Override accepted; secrets quoted in the report (which is itself sensitive). |
| `--focus=""` | Halt. |

---

## 4. Pipelines

<script setup>
const wbSecurePipelines = [
  {
    "title": "Adversarial review of tierEnforcement.js (the high-value target)",
    "cmd": "/wbSecure core2/packages/wb-core/src/tierEnforcement.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/src/tierEnforcement.js",
        "type": "sys"
      },
      {
        "text": "[MODEL] the AI agent declared (per feedback_model_selection.md \u2014 auth work is complex)",
        "type": "gen"
      },
      {
        "text": "[MODE] Adversarial \u2014 assume attacker wants to bypass tier checks.",
        "type": "gen"
      },
      {
        "text": "[SCAN] Reading file...",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] grep for callers across wb-core and consumers...",
        "type": "ctx"
      },
      {
        "text": "## Threat model",
        "type": "sys"
      },
      {
        "text": "The file's responsibility: given a JWT and a requested tier-gated",
        "type": "gen"
      },
      {
        "text": "action, decide whether the caller's tier permits the action.",
        "type": "gen"
      },
      {
        "text": "Attacker's wins:",
        "type": "gen"
      },
      {
        "text": "1. Forge a token that makes them appear higher-tier than they are.",
        "type": "gen"
      },
      {
        "text": "2. Bypass the check entirely.",
        "type": "gen"
      },
      {
        "text": "3. Use a stale token whose tier no longer matches the user's",
        "type": "gen"
      },
      {
        "text": "subscription state.",
        "type": "gen"
      },
      {
        "text": "## Attack paths",
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
        "text": "**File:** core2/packages/wb-core/src/tierEnforcement.js (verify call site)",
        "type": "sys"
      },
      {
        "text": "**Attack:** Craft a JWT with `{\"alg\":\"none\"}` header and `{\"tier\":\"admin\"}`",
        "type": "sys"
      },
      {
        "text": "payload. If `jwt.verify()` is called without an `algorithms` constraint,",
        "type": "gen"
      },
      {
        "text": "the verify function will accept the unsigned token.",
        "type": "gen"
      },
      {
        "text": "**Status:** Likely vulnerable \u2014 the canonical /wbAudit security simulation",
        "type": "sys"
      },
      {
        "text": "flagged this finding. /wbSecure confirms it from the offensive angle.",
        "type": "gen"
      },
      {
        "text": "**How to verify:** Run a unit test that passes a token with alg:\"none\"",
        "type": "sys"
      },
      {
        "text": "and asserts rejection. If the test fails (acceptance), the vulnerability",
        "type": "gen"
      },
      {
        "text": "is live.",
        "type": "gen"
      },
      {
        "text": "### Path 2 \u2014 Tier-string injection",
        "type": "gen"
      },
      {
        "text": "**Severity:** Low (not exploitable as written)",
        "type": "sys"
      },
      {
        "text": "**Reasoning:** The tier value is read as `decoded.tier` from the",
        "type": "sys"
      },
      {
        "text": "parsed JSON. JS object property access doesn't have an injection",
        "type": "gen"
      },
      {
        "text": "surface unless the consumer downstream concatenates `decoded.tier`",
        "type": "gen"
      },
      {
        "text": "into a SQL query, a regex, or a shell command. Worth checking",
        "type": "gen"
      },
      {
        "text": "consumers (Path 5).",
        "type": "gen"
      },
      {
        "text": "### Path 3 \u2014 Replay after subscription downgrade",
        "type": "gen"
      },
      {
        "text": "**Severity:** Medium",
        "type": "sys"
      },
      {
        "text": "**Attack:** A user pays for Paid tier, gets a token with `tier:\"paid\"`",
        "type": "sys"
      },
      {
        "text": "and `exp:` 1 hour from now. They downgrade. The token is still valid",
        "type": "gen"
      },
      {
        "text": "until `exp`. They use it for the remaining hour to access Paid features.",
        "type": "gen"
      },
      {
        "text": "**Status:** Standard JWT trade-off. Acceptable for short `exp` windows;",
        "type": "sys"
      },
      {
        "text": "problematic for longer ones.",
        "type": "gen"
      },
      {
        "text": "**Mitigation paths:** (a) shorten `exp`; (b) add server-side revocation;",
        "type": "sys"
      },
      {
        "text": "(c) re-check tier server-side per request.",
        "type": "gen"
      },
      {
        "text": "### Path 4 \u2014 Verifier returns truthy on parse error",
        "type": "gen"
      },
      {
        "text": "**Severity:** Conditional \u2014 depends on error-handling shape",
        "type": "sys"
      },
      {
        "text": "**Attack:** Pass malformed JSON. If the verifier catches the parse",
        "type": "sys"
      },
      {
        "text": "error and returns a default-truthy value (e.g., empty object), downstream",
        "type": "gen"
      },
      {
        "text": "code might read `decoded.tier` as undefined and accidentally pass a",
        "type": "gen"
      },
      {
        "text": "free-tier check.",
        "type": "gen"
      },
      {
        "text": "**Status:** Need to read the actual error-handling. If the function",
        "type": "sys"
      },
      {
        "text": "re-throws or returns false, not exploitable. If it returns `{}`, exploitable.",
        "type": "gen"
      },
      {
        "text": "### Path 5 \u2014 Consumer trust without re-verification",
        "type": "gen"
      },
      {
        "text": "**Severity:** Medium (architectural)",
        "type": "sys"
      },
      {
        "text": "**Reasoning:** Any consumer that reads `decoded.tier` directly from",
        "type": "sys"
      },
      {
        "text": "a verified token inherits the verifier's flaws. If the verifier ever",
        "type": "gen"
      },
      {
        "text": "has a false-positive case, every consumer is vulnerable.",
        "type": "gen"
      },
      {
        "text": "**Mitigation:** Defense-in-depth (consumer re-checks signature) or",
        "type": "sys"
      },
      {
        "text": "single-point-of-trust (consumers trust the verifier absolutely; verifier",
        "type": "gen"
      },
      {
        "text": "is bulletproof). Current code uses the latter; that's a valid choice",
        "type": "gen"
      },
      {
        "text": "but it raises the stakes on the verifier itself.",
        "type": "gen"
      },
      {
        "text": "## Recommendations",
        "type": "sys"
      },
      {
        "text": "1. **Path 1 fix (P0):** Constrain verify with `algorithms: ['HS256']`",
        "type": "gen"
      },
      {
        "text": "(or whatever the issuer uses). Add a test that asserts alg:\"none\"",
        "type": "gen"
      },
      {
        "text": "rejection.",
        "type": "gen"
      },
      {
        "text": "2. **Path 4 confirmation (P1):** Read the actual error-handling code.",
        "type": "gen"
      },
      {
        "text": "If it returns truthy on parse error, fix.",
        "type": "gen"
      },
      {
        "text": "3. **Path 3 evaluation (informational):** Document the `exp` window",
        "type": "gen"
      },
      {
        "text": "trade-off in code or memory.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Report saved: reports/<date>/security/secure_tierEnforcement_<date>.md",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Cross-package focus",
    "cmd": "/wbSecure --focus=\"auth\"",
    "logs": [
      {
        "text": "[SYSTEM] Focus: auth (cross-package)",
        "type": "sys"
      },
      {
        "text": "[WARN] Cross-package security review is large; will take longer.",
        "type": "warn"
      },
      {
        "text": "[SCAN] Auth-relevant code in:",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-core/src/tierEnforcement.js (verifier)",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-dataviewer (consumer of tier checks; hypothetical)",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wbc-ui2-cdn/src/login.vue (UI entry point;",
        "type": "gen"
      },
      {
        "text": "memory: parked package \u2014 scan but don't auto-promote findings)",
        "type": "gen"
      },
      {
        "text": "## Trust boundaries",
        "type": "sys"
      },
      {
        "text": "The architecture has a single trust boundary: the verifier",
        "type": "gen"
      },
      {
        "text": "(tierEnforcement.js). Everything downstream trusts the decoded",
        "type": "gen"
      },
      {
        "text": "token. UI upstream sends the raw token; UI does no validation.",
        "type": "gen"
      },
      {
        "text": "## Attack paths (cross-cutting)",
        "type": "sys"
      },
      {
        "text": "### Path A \u2014 Login UI sends token to wrong endpoint",
        "type": "gen"
      },
      {
        "text": "The UI in wbc-ui2-cdn (parked package) hardcodes a verify endpoint.",
        "type": "gen"
      },
      {
        "text": "What if a man-in-the-middle redirects the verify request? Standard",
        "type": "gen"
      },
      {
        "text": "TLS/CORS mitigations apply; not exploitable in a properly-configured",
        "type": "gen"
      },
      {
        "text": "deploy.",
        "type": "gen"
      },
      {
        "text": "### Path B \u2014 Consumer relies on token without re-decoding",
        "type": "gen"
      },
      {
        "text": "Same as Path 5 in Pipeline A \u2014 consumers inherit verifier flaws.",
        "type": "gen"
      },
      {
        "text": "### Path C \u2014 Cache poisoning of the apiResponse_ pattern",
        "type": "gen"
      },
      {
        "text": "**Severity:** Medium (architectural concern, not directly exploitable)",
        "type": "sys"
      },
      {
        "text": "**Reasoning:** Per `project_wbdataviewer_apiResponse.md` memory, the",
        "type": "sys"
      },
      {
        "text": "WBDataViewer caches API responses indefinitely once fetched. If an",
        "type": "gen"
      },
      {
        "text": "attacker could poison the cache once (e.g., via XSS that sets the ref",
        "type": "gen"
      },
      {
        "text": "manually), they'd persist that poison across all subsequent project",
        "type": "gen"
      },
      {
        "text": "changes within the component's lifetime.",
        "type": "gen"
      },
      {
        "text": "**Status:** Not a direct vulnerability; an existing pattern to watch.",
        "type": "sys"
      },
      {
        "text": "[NO MUTATION] Cross-package report saved.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Refuse vendored review without `-F`",
    "cmd": "/wbSecure node_modules/jsonwebtoken/",
    "logs": [
      {
        "text": "[REFUSE] Target is in node_modules/ \u2014 third-party code.",
        "type": "error"
      },
      {
        "text": "[REASON] Third-party security is upstream's responsibility. Reviewing",
        "type": "gen"
      },
      {
        "text": "vendored deps that you don't own tends to produce findings",
        "type": "gen"
      },
      {
        "text": "you can't act on (you'd need to upstream the report or fork).",
        "type": "gen"
      },
      {
        "text": "[OVERRIDE] If this is a forked/vendored copy you own and need to",
        "type": "gen"
      },
      {
        "text": "audit, use:",
        "type": "gen"
      },
      {
        "text": "/wbSecure node_modules/jsonwebtoken/ --force-past-security",
        "type": "gen"
      },
      {
        "text": "[NO REVIEW] Halted.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbSecure" :pipelines="wbSecurePipelines" />


### 💠 Pipeline Adversarial review of tierEnforcement.js (the high-value target)


### 💠 Pipeline Cross-package focus


### 💠 Pipeline Refuse vendored review without `-F`

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbSecure` (no target) | Halt. |
| `/wbSecure "the JWT thing"` | Halt with disambiguation. |
| `/wbSecure node_modules/...` | Refuse without `-F`. |
| `/wbSecure file_with_literal_secret.js` | Refuse without `-F`. |
| `/wbSecure core2/packages/wbc-ui2-cdn/` | Permitted but flagged "memory: parked package; findings will not auto-promote to plan." |
| `/wbSecure --force-past-security` (no other args) | Halt — `-F` is an override for an existing target/refusal, not a target itself. |
| `/wbSecure --focus="payment"` | Honest "no payment code in workspace." Suggests `/wbVision` for exploration. |
| Adversarial output that would constitute step-by-step exploit instructions | Default: high-level threat model only. `-F` permits step-by-step (for owned code). |

The pattern: **`/wbSecure` is the offensive complement to `/wbAudit --profile="security"`.** It produces reasoning chains, not pattern matches; refuses third-party code by default; treats `-F` as a recorded override; and stays inside the workspace + memory (no external CVE lookups). Run both `/wbAudit -p="security"` and `/wbSecure` for high-value code — they'll overlap on known patterns, diverge on code-specific paths, and together cover more ground than either alone.

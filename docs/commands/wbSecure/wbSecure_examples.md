---
title: "wbSecure — Examples"
description: "Examples illustrating security vulnerability scanning and exploit analysis with wbSecure."
---

# /wbSecure — Examples

> Self-help. `/wbSecure` is the adversarial counterpart to `/wbAudit`. Audit asks "is this code good?"; secure asks "can this code be exploited?". This file shows what real findings look like vs. the security-theater output most AI scanners produce.

---

## /wbSecure vs /wbAudit vs /wbLicense

| `/wbAudit` | `/wbLicense` | `/wbSecure` |
|---|---|---|
| Generic code quality | Tier-gate consistency | Vulnerability scan |
| Pre-release | Pre-Pro-feature ship | Pre-deploy of user-facing |
| Severity: BLOCKER/MAJOR/MINOR | LEAK/INCONSISTENT/OK | CRITICAL/WARNING/SAFE |
| Adversarial framing: "imagine a hostile reviewer" | Convenience-barrier framing | Adversarial: "imagine an attacker" |

If your output mixes vocabulary from these (e.g., a security finding flagged as "MAJOR"), the tool was used wrong.

---

## Example 1 — `/wbSecure apps/wbdataviewer_github` (pre-deploy)

```text
$ /wbSecure apps/wbdataviewer_github

[AI] Loading monorepo_rules.md...
[AI] Loading security checklist...
[AI] Hardcoded secrets/keys
[AI] XSS vectors (innerHTML, v-html, raw render)
[AI] Insecure direct object references
[AI] Missing tier checks (cross-ref with monorepo_rules tiers)
[AI] Outdated/insecure dependencies
[AI]
[AI] Scanning apps/wbdataviewer_github...
[AI] Writing reports/20260425/security/security_wbdataviewer_github_202604250100.md:
```

```markdown
# Security audit: wbdataviewer_github (2026-04-25)

## Verdict: 🔴 CRITICAL — DO NOT DEPLOY

## Findings

### [CRITICAL] Hardcoded API token in source
- src/deploy.js:14
 ```js
 const GITHUB_TOKEN = "ghp_AbCdEf1234567890..."
 ```
- This token is currently in your git history (committed 2026-04-16).
- **Immediate action**:
 1. Revoke the token at github.com/settings/tokens RIGHT NOW.
 2. Generate a new token, place in `.env.local` (gitignored).
 3. Update src/deploy.js to read from `import.meta.env.VITE_GITHUB_TOKEN`.
 4. Commit the source change.
 5. Note: revoking is enough; rewriting git history to remove the
 leaked token is a separate (large) operation. Token rotation is
 the priority.

### [CRITICAL] v-html with unsanitized user input
- src/components/UserComment.vue:38
 ```vue
 <div v-html="comment.body"></div>
 ```
- `comment.body` comes from API response, not sanitized.
- Attacker-controlled comment can execute scripts in viewer's browser.
- **Fix**: render as text, OR sanitize with DOMPurify before v-html.

### [WARNING] Outdated lodash
- package.json: lodash@4.17.15
- CVE-2020-8203 (prototype pollution) affects 4.17.20 and below.
- Upgrade to lodash@4.17.21 or later.

### [WARNING] Missing rate limit on export endpoint
- src/api/export.js
- Export-to-CSV endpoint accepts unlimited request size.
- An attacker could request a CSV of "all data" repeatedly to DoS.
- **Fix**: add server-side rate limit (this is a server change, not
 client). Coordinate with backend.

### [SAFE] Tier checks consistent across components
- 11 components correctly gate Pro features with `__WBC_PRO__`.
- Caveat: client-side gating only. Real Pro enforcement must be
 server-side.

## What this scan did NOT check
- Server-side endpoints (this is a client-only scan).
- Authentication / session handling (out of scope without seeing the API).
- Browser compatibility-driven security (e.g., older browsers' weaker CSP).
- Supply-chain attacks via transitive deps (use `npm audit`).
- Runtime tampering via DevTools (gating is a deterrent, not protection).

## Recommendations, in order of urgency
1. Revoke the leaked token. Now. Before reading further.
2. Sanitize the v-html in UserComment.vue before next deploy.
3. Bump lodash.
4. Server-side rate limit (separate ticket).

## Refusal
/wbDeploy on this app is BLOCKED until findings 1 and 2 are fixed.
```

```text
[AI] Security report written.
[AI] /wbDeploy refusal recorded — next deploy attempt will read this.
```

**What's worth noticing:**

- CRITICAL = action required NOW. The first sentence of finding 1 is "revoke the token RIGHT NOW." Not buried in steps.
- The "git history" caveat is correct: revoking is critical, rewriting history is secondary. Most users would conflate these and waste time on history rewrites while the token is still live.
- v-html finding includes both diagnosis AND two fix paths (text rendering OR DOMPurify). User can pick based on use case.
- The SAFE finding for tier checks is also useful — confirms what's working AND names the limitation (client-side only).
- The refusal is recorded so `/wbDeploy` can read it. Closed loop in action.

---

## Example 2 — `/wbSecure packages/wb-core` (a library, not an app)

Library security has different concerns than app security.

```text
$ /wbSecure packages/wb-core
```

```markdown
# Security audit: @wbc/wb-core (2026-04-25)

## Verdict: 🟢 SAFE — minor warnings

## Findings

### [WARNING] eval-like patterns in renderString
- src/renderers/renderString.js:412
 Uses `new Function(userTemplate)` to compile template strings.
 This is functionally `eval` for strings the consumer provides.
- **Risk**: if a consumer passes user-controlled strings as templates,
 they're enabling code execution.
- **Mitigation**: this is a documented design decision (templating
 language). Document the risk in the consumer-facing API: "do not
 pass untrusted data as a template string."
- Action: update README/JSDoc to flag this. No code change needed.

### [SAFE] No hardcoded secrets
- 0 instances of API keys, tokens, or credential patterns.

### [SAFE] No XSS vectors in library code itself
- The library can be USED to create XSS vulnerabilities (consumers
 who feed user data to renderString without escaping). The library
 itself doesn't introduce vectors.

## What this scan did NOT check
- How CONSUMERS of this library use it (their app's responsibility).
- Sandbox-escape via `new Function`. The library trusts the runtime.
- Specific template-injection attacks. `/wbSecure --focus=injection`
 on consumer code might surface those.
```

**What's worth noticing:**

- Library security is mostly about *consumer-facing risk surface* and *documentation*, not about the library code being vulnerable in isolation.
- The `new Function` finding is a documented design, not a bug. Action is "update docs," not "remove the feature."
- Distinction between "the library has XSS" (no) and "the library can be misused to create XSS in consumer code" (yes) matters for triage.

---

## Example 3 — `/wbSecure` finding nothing real, refusing to invent

```text
$ /wbSecure packages/wb-mermaid
```

```markdown
# Security audit: @wbc/wb-mermaid (2026-04-25)

## Verdict: 🟢 SAFE

## Findings
None.

## Stats
- 0 hardcoded secrets
- 0 XSS vectors
- 0 outdated dependencies (mermaid@10.6.1 is current)
- 0 missing tier checks (no Pro features in this package)

## What this scan did NOT check
- Mermaid's own security (this wraps mermaid; mermaid bugs are
 outside our control)
- Server-side anything (none in this package)

## Note
This is a thin wrapper. Most security concerns delegate to mermaid.js
itself. Track upstream CVEs.
```

**What's worth noticing:**

- A clean security audit is short. The AI doesn't pad with imaginary findings.
- Statistics confirm what was checked. "0 hardcoded secrets" is meaningful evidence; "no findings" alone could mean "no scan happened."
- The "Note" delegates real security to upstream — the package can't be more secure than its wrapped library.

---

## Example 4 — `/wbSecure --focus=auth` (focused scan)

When you have a specific concern, narrow the scan.

```text
$ /wbSecure apps/auth-portal --focus="session and authentication"
```

```markdown
# Focused security: auth-portal (focus: session/auth)

## Findings

### [CRITICAL] Session token stored in localStorage
- src/auth/session.js:22
- localStorage is accessible to any script on the page (XSS attacks
 exfiltrate it instantly).
- **Fix**: use httpOnly cookies for session tokens.

### [WARNING] No CSRF token on state-changing endpoints
- src/api/*.js POST/PUT/DELETE calls
- If session uses cookies, CSRF token is required to prevent
 cross-site forgery.

### [WARNING] Password reset token has long TTL
- src/auth/passwordReset.js: 24-hour TTL
- Industry default is 15min-1h. Long TTL widens the attack window.

## What this focused scan did NOT check
- General XSS / dependency / hardcoded secrets (run `/wbSecure` without
 focus for full scan).
- Server-side enforcement of auth rules (this is client-side only).
- Identity provider integration (OAuth, SAML, etc.).
```

**What's worth noticing:**

- `--focus` narrows the scan. Doesn't widen — generic findings outside the focus area are explicitly excluded.
- Auth-specific findings (localStorage tokens, CSRF, TTL) require domain knowledge that wouldn't surface in a general scan.

---

## The pattern

Every `/wbSecure` run has:

1. **Load security checklist** — secrets, XSS, IDOR, tier-checks, dep CVEs.
2. **Scan against checklist** — file by file.
3. **Severity classification** — CRITICAL (must fix before deploy), WARNING (should fix soon), SAFE (verified OK).
4. **"Did NOT check" section** — naming gaps (server-side, supply chain, runtime tampering).
5. **Refusal recording** — `/wbDeploy` reads `/wbSecure` reports and refuses on CRITICAL.
6. **Specific fix recommendations** — not "address the issue" but "use httpOnly cookies."

---

---

## Basic Usage

```bash
# Standard command execution
/wbSecure frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbSecure deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbSecure` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbSecure target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbSecure target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbSecure target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbSecure packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbSecure apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbSecure` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbSecure frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

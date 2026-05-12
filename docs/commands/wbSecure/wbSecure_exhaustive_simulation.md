# wb-flow Protocol: /wbSecure Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbSecure` command. It serves as the definitive reference for automated vulnerability patching, secrets scanning, dependency sanitization, and strict architectural hardening.

---

## 1. Role & Definition Matrix
**Role:** The Security Architect & Hardener
**Target:** Scans and aggressively patches vulnerabilities within the codebase, specifically targeting OWASP top 10 vectors.
**Core Protocol:** Differentiates from `/wbAudit` (which only *reports* vulnerabilities). `/wbSecure` actually *rewrites* code to enforce security paradigms (e.g., stripping `innerHTML`, masking logs, purging tokens).

| Scenario | System Behavior |
|---|---|
| Target is UI Logic | **[PROCEED]** Analyzes DOM bindings. Replaces all instances of `.innerHTML` with `.innerText` or `.textContent`. |
| Target is Backend API | **[PROCEED]** Injects CSRF protections, enforces strict CORS headers, and sanitizes input vectors. |
| Target is Dependencies | **[PROCEED]** Scans `package.json` against known CVEs. Proposes lockfile upgrades. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbSecure` is highly destructive by design. It requires strict targeting.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbSecure src/utils/auth.js` | Locks onto a single file for deep cryptographic analysis. | Upgrades hashing algorithms or strips hardcoded tokens from `auth.js`. |
| Directory Path | `Command: /wbSecure src/` | Scans all files inside the directory bounds. | Performs a massive sweep for injection vectors in `src/`. |
| Wildcard Glob | `Command: /wbSecure **/*.json` | Sweeps all configuration files. | Strips exposed API keys from local config blobs. |
| Natural Language | `Command: /wbSecure "harden the login"` | Fuzzy matches authentication and login routes. | Applies brute-force rate limiting to login controllers. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--tokens` | `-t` | Specifically targets and purges hardcoded secrets, AWS keys, or JWT tokens. | `Command: /wbSecure src/ -t` | `[TOKENS] Stripped 1 exposed GitHub PAT from local.config.js.` |
| `--xss` | `-x` | Specifically hunts and sanitizes cross-site scripting vulnerabilities. | `Command: /wbSecure src/ -x` | `[XSS] Replaced 14 instances of v-html with v-text.` |
| `--deps` | `-D` | Scans `package.json` for CVEs and attempts automatic `npm audit fix`. | `Command: /wbSecure . -D` | `[DEPS] Patched 3 moderate vulnerabilities in node_modules.` |
| `--dry-run` | `-d` | Simulates the patching process without altering the disk. | `Command: /wbSecure src/ -t -d` | `[DRY-RUN] Would strip 1 exposed API key. Disk untouched.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Pre-Deployment Hardening" (`src/ -x -t`)
**Context:** User is about to push code to production and wants to guarantee no XSS vectors or hardcoded API keys are accidentally shipped.
**Command Executed:** `/wbSecure src/ -x -t`
**Simulated Protocol Chain:**
1. System parses all files in `src/`.
2. Engages token regex (`-t`). Purges any string matching AWS/GitHub key heuristics.
3. Engages AST parsing (`-x`). Replaces all risky DOM injection methods.
**Simulated Output:**
```markdown
> Command: /wbSecure src/ -x -t

[SYSTEM] Initiating Pre-Deployment Hardening loop...
[TOKENS] Scanning for secrets...
[TOKENS] SUCCESS: No hardcoded secrets found.
[XSS] Scanning AST for injection vectors...
[XSS] ALERT: Found `element.innerHTML = userInput`.
[ACT] Rewriting to `element.textContent = userInput`.
[SUCCESS] Directory secured. Ready for deployment.
```

### 💠 The "Dependency Lockdown" (`. -D -d`)
**Context:** Checking if the project dependencies have any critical CVEs before shipping, without mutating the lockfile yet.
**Command Executed:** `/wbSecure . -D -d`
**Simulated Output:**
```markdown
> Command: /wbSecure . -D -d

[SYSTEM] Initializing CVE scanner against package.json...
[DEPS] Found critical vulnerability in `lodash < 4.17.21`.
[DRY-RUN] Would execute `npm install lodash@^4.17.21`.
[SUCCESS] Dry-run complete. Run without -d to apply patch.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Regex Misfire | Token scanner identifies a dummy string (`"API_KEY_HERE"`) as a secret. | `⚠️ Warning: Replaced placeholder string with ENV binding.` |
| XSS False Positive | Developer explicitly requires `innerHTML` for a rich text editor. | `❌ Error: Sanitization broke editor logic. Use `// wb-ignore-xss` to bypass.` |
| NPM Audit Failure | `npm audit fix` requires a major breaking version change. | `⚠️ Warning: Cannot auto-patch dependencies. Major version bump required.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

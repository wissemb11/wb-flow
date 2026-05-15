# wb-flow Protocol: /wbAudit Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbAudit` command. It serves as the definitive reference for deep technical analysis, profile-based security/performance scanning, wildcard directory sweeps, and auto-plan generation.

---

## 1. Role & Definition Matrix
**Role:** The Technical Inspector & Debt Analyzer
**Target:** Scans codebases for technical debt, security vulnerabilities, performance bottlenecks, and architectural anti-patterns.
**Core Protocol:** Does not modify code. It extracts findings and optionally pipes them into a new `/wbPlan`.

| Scenario | System Behavior |
|---|---|
| Target is Git Root | **[HALT]** Protocol forbids executing an unaudited wildcard sweep across the entire monorepo due to token limits. Scoping required. |
| Target is Sub-Package | **[PROCEED]** Analyzes `package.json`, source code, and configurations. Generates specific debt metrics. |
| Target is Specific File | **[PROCEED]** Performs deep AST analysis and line-by-line profiling. |

---

## 2. Argument & Criteria Resolution Matrix
The `/wbAudit` command relies heavily on path criteria and natural language fuzzing.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbAudit src/utils/auth.js` | Locks onto a single file. | Generates a focused, line-by-line security and performance review of `auth.js`. |
| Directory Path | `Command: /wbAudit packages/wb-core` | Deep scans all files within the directory bounds. | Generates a macroscopic technical debt report for the core package. |
| Comma-Separated Paths | `Command: /wbAudit src/auth.js,src/state.js` | Parses the array and concatenates findings. | Generates a unified audit highlighting cross-file vulnerabilities. |
| Wildcard Glob | `Command: /wbAudit src/**/*.js` | Extracts all matching files. Filters out `.test.js` automatically. | Initiates a massive sweep of all logic files. |
| Natural Language | `Command: /wbAudit "check our auth flow"` | Fuzzy matches to authentication-related modules. | Resolves to `wb-core/src/auth.js` and `wbc-ui.com/src/login.vue`. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--profile="<prof>"`| `-p` | Emulates a specific auditor persona (`security`, `performance`, `accessibility`, `seo`). | `Command: /wbAudit packages/wb-core -p="security"` | `[PROFILE: SEC] Flagging all eval() and innerHTML usage. Ignoring CSS/SEO debt.` |
| `--depth="<level>"` | `-d` | Controls scan depth (`shallow`, `deep`). Shallow checks signatures, deep checks logic. | `Command: /wbAudit -d="shallow"` | `[DEPTH] Running shallow signature check. Skipping AST loop analysis.` |
| `--act` | `-a` | Auto-generates a `/wbPlan` directly from the critical audit findings. | `Command: /wbAudit src/ -a` | `[ACT] Found 3 P0 issues. Piping directly to plan_audit_2026.md.` |
| `--wbPlan` | `-P` | Merges audit results directly into the *existing* active plan. | `Command: /wbAudit -P` | `[SYNC] Appending 2 new tasks to plan_wb-core_2026.md based on findings.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Security Sweep" (`src/**/*.js -p="security" -a`)
**Context:** User wants to scan all javascript files for security holes and instantly create an actionable plan to fix them.
**Command Executed:** `/wbAudit src/**/*.js -p="security" -a`
**Simulated Protocol Chain:**
1. Resolves glob pattern to 45 `.js` files.
2. Applies strict `security` profile. Disregards performance warnings.
3. Extracts 2 critical vulnerabilities.
4. Activates `-a` (Auto-Plan) logic to generate tasks.
**Simulated Output:**
```markdown
> Command: /wbAudit src/**/*.js -p="security" -a

[SYSTEM] Glob resolved to 45 files.
[PROFILE] Engaging strict Security matrix.
[AUDIT] Scanning...
[ALERT] Found P0 Vulnerability: Client-side token exposure in auth.js.
[ALERT] Found P1 Vulnerability: Missing CSRF token in fetch utils.
[ACT] Auto-generating remediation plan...
[SUCCESS] Created plan_security_remediation_2026.md.
```

### 💠 The "Surgical Perf Check" (`src/render.js,src/state.js -p="performance"`)
**Context:** Auditing two specific core files exclusively for rendering bottlenecks.
**Command Executed:** `/wbAudit src/render.js,src/state.js -p="performance"`
**Simulated Output:**
```markdown
> Command: /wbAudit src/render.js,src/state.js -p="performance"

[SYSTEM] Queued 2 specific files.
[PROFILE] Engaging Performance matrix.
[AUDIT] Found O(n^2) loop in render.js. State.js is clean.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Glob Explosion | User runs `/wbAudit **/*`. File count exceeds 10,000. | `❌ Error: Glob explosion detected. Halting to prevent token exhaustion. Refine scope.` |
| Profile Conflict | User provides invalid profile (`-p="magic"`). | `⚠️ Warning: Unknown profile 'magic'. Defaulting to 'general' audit.` |
| Auto-Plan Collision| User uses `-a` but an active plan already exists for that namespace. | `⚠️ Warning: Active plan exists. Using Smart Merge instead of overwriting.` |
| Dead Links | Comma-separated array includes a file that was deleted. | `⚠️ Warning: src/old.js not found. Skipping and auditing remaining files.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

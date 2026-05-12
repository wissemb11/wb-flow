# wb-flow Protocol: /wbCheck Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbCheck` command. It serves as the definitive reference for how the agent performs rigorous static analysis, type checking, dead-link resolution in documentation, and grammar compliance.

---

## 1. Role & Definition Matrix
**Role:** The Static Analyzer & Compliance Checker
**Target:** Validates code health (TypeScript/JSDoc types) and documentation integrity (broken links, markdown linting, spell check).
**Core Protocol:** Strict "Zero Tolerance" reporting. Unlike `/wbAudit` (which finds logic/security flaws) or `/wbValid` (which runs dynamic CI tests), `/wbCheck` is entirely static. It verifies that the codebase conforms to strict syntactic and referential contracts.

| Scenario | System Behavior |
|---|---|
| Target is Source Code | **[PROCEED]** Analyzes JSDoc/TypeScript interfaces. Flags `any` types, missing returns, and signature mismatches. |
| Target is Markdown Docs | **[PROCEED]** Scans all relative and absolute links. Pings URLs to ensure 200 OK. Lints for structural errors. |
| Target is JSON/Config | **[PROCEED]** Validates schema adherence (e.g., ensuring `tsconfig.json` matches strict mode constraints). |

---

## 2. Argument & Criteria Resolution Matrix
`/wbCheck` uses strict file extensions to determine which static analysis engine to engage.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbCheck docs/readme.md` | Locks onto file. Runs Markdown Link Checker. | Outputs list of 404 broken links and spelling errors. |
| Directory Path | `Command: /wbCheck src/` | Scans directory. Runs Type Checker. | Generates a report of all type inconsistencies in `src/`. |
| Comma-Separated | `Command: /wbCheck src/app.js,docs/app.md` | Correlates files. | Checks if the documentation matches the actual exported types in the code. |
| Wildcard Glob | `Command: /wbCheck **/*.md` | Massive sweep. | Audits the entire monorepo documentation ecosystem for broken links. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--types` | `-t` | Forces execution of the strict TypeScript/JSDoc type checker. | `Command: /wbCheck src/ -t` | `[TYPES] Found 4 instances of implicit 'any'.` |
| `--links` | `-l` | Forces execution of the Markdown Link Checker. | `Command: /wbCheck docs/ -l` | `[LINKS] Scanned 140 links. 3 returned 404 Not Found.` |
| `--grammar` | `-g` | Runs a spelling and grammar compliance check on markdown files. | `Command: /wbCheck docs/ -g` | `[GRAMMAR] Found 2 misspelled words: 'teh', 'implementatoin'.` |
| `--fix` | `-f` | Auto-corrects trivial errors (e.g., spelling, basic type casting). | `Command: /wbCheck docs/ -g -f` | `[FIX] Auto-corrected 2 typos. Saved files.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Documentation Integrity Sweep" (`**/*.md -l -g -f`)
**Context:** The technical writer just finished a massive overhaul of the `frontEnd/wbc-ui/core2/packages/wb-flow/templates` directory and wants to ensure there are no dead links or typos before pushing to the `main` branch.
**Command Executed:** `/wbCheck **/*.md -l -g -f`
**Simulated Protocol Chain:**
1. Resolves glob to 50+ markdown files.
2. Extracts 400+ internal and external URLs.
3. Pings all URLs in parallel (`-l`).
4. Runs grammar engine (`-g`).
5. Auto-fixes the spelling errors (`-f`).
**Simulated Output:**
```markdown
> Command: /wbCheck **/*.md -l -g -f

[SYSTEM] Initiating Documentation Integrity Sweep...
[LINKS] Pinging 412 URLs...
[LINKS] 🚨 ERROR: `[WBC.js](../../../../../frontEnd/wbc-ui/core2/packages/wb-core/src/WBC.js)` is broken (File moved to src/core/WBC.js).
[GRAMMAR] Scanning 20,000 words... Found 4 typos.
[FIX] Auto-corrected typos.
[REPORT] Run `/wbCheck -l` again after fixing the broken WBC.js link manually.
```

### 💠 The "Strict Type Gate" (`src/**/*.js -t`)
**Context:** The team is migrating from vanilla JS to JSDoc-typed JS. They want a report of all remaining loose types.
**Command Executed:** `/wbCheck src/**/*.js -t`
**Simulated Output:**
```markdown
> Command: /wbCheck src/**/*.js -t

[SYSTEM] Engaging Static Type Analyzer...
[TYPES] Scanning AST for missing JSDoc contracts.
[REPORT] `src/utils/math.js:L12` - Parameter `x` implicitly has an 'any' type.
[REPORT] `src/auth.js:L45` - Function `login()` lacks a @returns annotation.
[SUCCESS] Static analysis complete. 2 violations found.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Timeout on Link Check | External server (e.g., GitHub) is rate-limiting the URL ping. | `⚠️ Warning: 5 links timed out (HTTP 429). Cannot verify integrity.` |
| Auto-Fix Collision | Type inference is ambiguous; `-f` cannot guess the type. | `⚠️ Warning: Cannot auto-fix implicit 'any'. Manual casting required.` |
| Logic File Grammar | User runs `-g` on a `.js` file. | `❌ Error: Grammar checking is only supported for Markdown or TXT files.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

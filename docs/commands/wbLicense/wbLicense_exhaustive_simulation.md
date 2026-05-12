# wb-flow Protocol: /wbLicense Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbLicense` command. It serves as the definitive reference for how the agent scans dependencies for compliance conflicts, injects corporate license headers into source files, and generates `LICENSE` files.

---

## 1. Role & Definition Matrix
**Role:** The Open-Source Compliance & IP Guardian
**Target:** Enforces copyright headers across the codebase and prevents the introduction of restrictive licenses (e.g., GPL) into proprietary code.
**Core Protocol:** Strict "No-Copyleft" enforcement. The agent must halt if a viral open-source license is detected in the dependency tree of a closed-source package.

| Scenario | System Behavior |
|---|---|
| Target is Source File | **[PROCEED]** Analyzes file header. Injects or updates the copyright boilerplate without altering the AST. |
| Target is Dependency Tree | **[PROCEED]** Scans `node_modules` and `package.json`. Extracts the license of every installed package. |
| Compliance Conflict | **[HALT]** Protocol forbids executing a build or release if a GPL/AGPL dependency is found in a proprietary workspace. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbLicense` scopes its scanning logic based on the provided path type.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific Logic File | `Command: /wbLicense src/WBC.js` | Locks onto file. | Prepends the standardized corporate license header to line 1. |
| Directory Path | `Command: /wbLicense packages/wb-core` | Sweeps the package. | Scans `wb-core`'s dependency tree for license conflicts. |
| Comma-Separated | `Command: /wbLicense src/app.js,src/index.css` | Targets specific files. | Injects headers in multiple files using the correct comment syntax (e.g., `/* ... */` vs `// ...`). |
| Workspace Glob | `Command: /wbLicense apps/*` | Massive sweep. | Generates a unified Compliance Report across all frontend consumers. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--audit` | `-a` | Analyzes the `node_modules` tree without altering source file headers. | `Command: /wbLicense . -a` | `[AUDIT] Scanned 402 packages. Found 1 GPL violation.` |
| `--inject="<type>"`| `-i` | Automatically prepends the chosen license header (`MIT`, `proprietary`, `apache`) to all source files. | `Command: /wbLicense src/ -i="MIT"` | `[INJECT] Added MIT header to 14 files.` |
| `--generate` | `-g` | Creates a global `LICENSE` and `NOTICE` file in the target directory root. | `Command: /wbLicense . -g` | `[GENERATE] Created LICENSE.md with MIT text.` |
| `--dry-run` | `-d` | Simulates injection or generation without writing to disk. | `Command: /wbLicense src/ -i="MIT" -d` | `[DRY-RUN] Would inject header into 14 files. Disk untouched.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Pre-Release Compliance Gate" (`apps/* -a`)
**Context:** Before pushing code to production, the tech lead wants to ensure no developer accidentally installed a restrictive package that would compromise their proprietary IP.
**Command Executed:** `/wbLicense apps/* -a`
**Simulated Protocol Chain:**
1. Resolves all consumer apps.
2. Engages NPM dependency tree crawler (`-a`).
3. Extracts license metadata from 1,200 nested packages.
4. Validates against the proprietary allow-list (MIT, Apache, BSD allowed. GPL, AGPL rejected).
**Simulated Output:**
```markdown
> Command: /wbLicense apps/* -a

[SYSTEM] Initiating Pre-Release Compliance Gate...
[AUDIT] Crawling 1,200 nested dependencies across 3 apps...
[ALERT] Found compliance violation in `wbc-ui.com`.
[VIOLATION] Package `cool-pdf-generator` is licensed under GNU GPL v3.
[SUCCESS] Audit complete. Deployment blocked. Please remove the package.
```

### 💠 The "Massive Header Injection" (`src/**/*.js -i="proprietary"`)
**Context:** The company updated its legal entity name. All source files in the core package need their copyright headers updated.
**Command Executed:** `/wbLicense src/**/*.js -i="proprietary"`
**Simulated Output:**
```markdown
> Command: /wbLicense src/**/*.js -i="proprietary"

[SYSTEM] Resolving glob pattern to 45 js files.
[INJECT] Engaging Proprietary Template (Year: 2026, Entity: WBC Inc).
[SYNC] Found existing outdated headers in 12 files. Overwriting...
[SYNC] Injected fresh headers into 33 files.
[SUCCESS] Workspace IP secured.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Unlicensed Dependency | `node_modules` contains a package with no declared license. | `⚠️ Warning: Package 'mystery-lib' has no license. Human review required.` |
| Header Syntax Error | Injecting header into a `.json` file (JSON does not support comments). | `⚠️ Warning: Cannot inject comments into JSON format. Skipping config.json.` |
| Missing Template | User requests `-i="custom"`, but no custom template is defined in `.wb/`. | `❌ Error: License template 'custom' not found. Defaulting to 'proprietary'.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

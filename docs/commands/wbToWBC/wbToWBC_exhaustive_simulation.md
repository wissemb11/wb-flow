# wb-flow Protocol: /wbToWBC Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbToWBC` command. It serves as the definitive reference for how the agent automatically refactors generic code into the proprietary architecture and design patterns required by the `wbc-ui.com` ecosystem.

---

## 1. Role & Definition Matrix
**Role:** The Pattern Enforcer & Architectural Translator
**Target:** Transforms generic code (e.g., standard React/Vue, raw CSS) into `wbc-ui.com` compliant code (e.g., using `@wbc-ui2/wb-core` imports, custom hooks, and strict theming tokens).
**Core Protocol:** Strict "Framework Adherence". The agent must parse the source code, identify generic patterns, and replace them with the highly specific, proprietary equivalents defined in the `core2` monorepo.

| Scenario | System Behavior |
|---|---|
| Target is Generic Component | **[PROCEED]** Analyzes AST. Swaps generic `useState` for proprietary state management. Converts raw CSS into WBC Design Tokens. |
| Target is 3rd-Party Code | **[PROCEED]** Wraps 3rd-party logic in a `wb-core` compatibility layer (Facade pattern) to isolate external dependencies. |
| Code is Already Compliant | **[PROCEED]** Scans silently and returns an "All Clear" validation without modifying the disk. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbToWBC` relies on deep AST traversal to map generic syntax to proprietary syntax.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbToWBC src/components/Button.jsx` | Locks onto the specific component. | Rewrites the file to use `WbcButton` base classes. |
| Directory Path | `Command: /wbToWBC src/legacy/` | Sweeps the directory. | Mass-migrates an entire legacy folder to the new architecture. |
| Comma-Separated | `Command: /wbToWBC src/Auth.js,src/Login.js` | Parses multiple files. | Migrates both files to use the proprietary `useWbcAuth()` hook. |
| Wildcard Glob | `Command: /wbToWBC **/*.css` | Extracts all CSS. | Replaces all hardcoded HEX colors with `var(--wbc-primary)`. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--css` | `-c` | Forces strict CSS-to-Token translation. Ignores JavaScript logic. | `Command: /wbToWBC src/ -c` | `[CSS] Replaced 14 instances of '#FF0000' with 'var(--wbc-error)'.` |
| `--hooks` | `-h` | Forces migration from standard React hooks to WBC proprietary hooks. | `Command: /wbToWBC src/ -h` | `[HOOKS] Swapped 5 `useEffect` with `useWbcLifecycle`.` |
| `--dry-run` | `-d` | Simulates the transformation and displays a git-style diff without saving. | `Command: /wbToWBC src/App.jsx -d` | `[DRY-RUN] Would alter 45 lines of code. Disk untouched.` |
| `--strict` | `-s` | Aborts the transformation if the agent cannot find a 1:1 proprietary equivalent for a piece of code. | `Command: /wbToWBC src/ -s` | `[STRICT] Failed. No WBC equivalent found for `indexedDB` native API.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Component Migration" (`src/components/**/*.jsx -h -c`)
**Context:** A developer copy-pasted a generic open-source dashboard component. They need to instantly translate it into the `wbc-ui.com` proprietary standard before committing.
**Command Executed:** `/wbToWBC src/components/**/*.jsx -h -c`
**Simulated Protocol Chain:**
1. Resolves glob to 12 generic React components.
2. Engages CSS Translation (`-c`): Replaces generic Tailwind classes with proprietary WBC utility classes.
3. Engages Hook Translation (`-h`): Swaps native data fetching for proprietary `useWbcQuery()`.
4. Updates all import statements to pull from `@wbc-ui2/wb-core`.
**Simulated Output:**
```markdown
> Command: /wbToWBC src/components/**/*.jsx -h -c

[SYSTEM] Initiating Massive WBC Architecture Migration...
[CSS] Transpiling 140 utility classes into WBC tokens.
[HOOKS] Migrating data layer to WBC standards.
[IMPORTS] Injecting `@wbc-ui2/wb-core` dependencies.
[SYNC] Rewriting ASTs...
[SUCCESS] 12 components are now fully WBC-compliant.
```

### 💠 The "Strict Architectural Audit" (`src/legacy/ -s -d`)
**Context:** The team wants to see if an old legacy folder *can* be migrated to the new standard without manually rewriting business logic.
**Command Executed:** `/wbToWBC src/legacy/ -s -d`
**Simulated Output:**
```markdown
> Command: /wbToWBC src/legacy/ -s -d

[SYSTEM] Executing Strict Architectural Audit...
[DRY-RUN] Parsing legacy ASTs...
[STRICT] ALERT: File `src/legacy/customCanvas.js` uses raw DOM manipulation.
[STRICT] Resolution: No proprietary WBC wrapper exists for Canvas API.
[SUCCESS] Dry-run complete. Manual intervention required for Canvas logic.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Unrecognized Pattern | Code uses an obscure library that has no WBC equivalent. | `⚠️ Warning: Cannot translate 'lodash.debounce'. Left intact.` |
| Version Mismatch | Target package is using an older, incompatible version of React. | `❌ Error: Package must be upgraded to React 18+ before running /wbToWBC.` |
| CSS Extraction Failure | CSS is heavily obfuscated or minified. | `⚠️ Warning: Cannot parse minified CSS. Skipping token translation.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

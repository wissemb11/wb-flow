# wb-flow Protocol: /wbPublish Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbPublish` command. It serves as the definitive reference for how the agent compiles packages, orchestrates NPM registry pushes, and manages `@latest` vs `@beta` distribution tags.

---

## 1. Role & Definition Matrix
**Role:** The Package Distributor & NPM Publisher
**Target:** Pushes compiled libraries and utility packages to public or private NPM registries.
**Core Protocol:** Differs from `/wbDeploy` (which pushes *apps* to the cloud). `/wbPublish` distributes *reusable code packages*. It enforces strict pre-publish compilation (`npm run build`).

| Scenario | System Behavior |
|---|---|
| Target is Library Package | **[PROCEED]** Compiles `/dist`. Validates `package.json` exports. Pushes to NPM registry. |
| Target is App (Next/Vite) | **[HALT]** Protocol forbids publishing consumer apps to NPM. Suggests `/wbDeploy` instead. |
| Missing Authentication | **[HALT]** If `npm whoami` fails, execution halts to prevent silent pipeline drops. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbPublish` requires exact scoping to prevent accidental publication of internal/private workspace tools.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific Package | `Command: /wbPublish packages/wb-core` | Locks onto `wb-core`. | Executes `npm publish` specifically within the `wb-core` directory. |
| Current Directory | `Command: /wbPublish .` | Checks `package.json` in CWD. | Executes localized publish logic. |
| Comma-Separated | `Command: /wbPublish packages/core,packages/utils` | Parses multiple scopes. | Compiles and publishes both packages sequentially to respect dependency trees. |
| Workspace Glob | `Command: /wbPublish packages/*` | Extracts all public packages. Filters out `"private": true`. | Massive sweep pushing all updated libraries to the registry. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--tag="<name>"` | `-t` | Appends an NPM distribution tag (`latest`, `beta`, `next`). | `Command: /wbPublish . -t="beta"` | `[TAG] Pushing package under the @beta dist-tag.` |
| `--access="<scope>"`| `-a` | Sets the package visibility (`public`, `restricted`). | `Command: /wbPublish . -a="public"` | `[ACCESS] Enforcing public visibility for scoped package.` |
| `--skip-build` | `-s` | Bypasses the pre-publish compilation step (dangerous, use for hotfixes). | `Command: /wbPublish . -s` | `[BUILD] Bypassed. Pushing current /dist folder as-is.` |
| `--dry-run` | `-d` | Simulates the NPM tarball generation and output without contacting the registry. | `Command: /wbPublish . -d` | `[DRY-RUN] Tarball size: 24KB. Includes 14 files. Registry untouched.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Registry Push" (`packages/* -t="latest" -a="public"`)
**Context:** An epic affecting multiple core libraries is complete. The user wants to compile and publish all of them to the public registry simultaneously.
**Command Executed:** `/wbPublish packages/* -t="latest" -a="public"`
**Simulated Protocol Chain:**
1. Validates NPM registry authentication.
2. Glob resolves. Ignores `packages/internal-tools` because `"private": true`.
3. Compiles `wb-core` -> Publishes to NPM `@latest`.
4. Compiles `wb-dataviewer` -> Publishes to NPM `@latest`.
**Simulated Output:**
```markdown
> Command: /wbPublish packages/* -t="latest" -a="public"

[SYSTEM] Initiating Massive Registry Push...
[AUTH] Confirmed logged in as @wbc-ui2.
[BUILD] Compiling wb-core... Done.
[PUBLISH] Pushed @wbc-ui2/wb-core@4.6.0 (Tag: latest, Access: public).
[BUILD] Compiling wb-dataviewer... Done.
[PUBLISH] Pushed @wbc-ui2/wb-dataviewer@2.1.0.
[SUCCESS] All public packages synced to NPM.
```

### 💠 The "Beta Dry-Run" (`. -t="beta" -d`)
**Context:** Developer wants to see exactly what files will be included in the NPM tarball for a new beta release before committing to it.
**Command Executed:** `/wbPublish . -t="beta" -d`
**Simulated Output:**
```markdown
> Command: /wbPublish . -t="beta" -d

[SYSTEM] Executing NPM dry-run...
[BUILD] Compiling current state...
[DRY-RUN] Tarball generated.
[DRY-RUN] Included files: `dist/index.js`, `package.json`, `README.md`.
[DRY-RUN] Skipped files: `src/`, `.env`, `tests/`.
[SUCCESS] Dry-run complete. Run without -d to publish to @beta.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Private Package | User attempts to publish a package marked `"private": true`. | `❌ Error: Package is marked private. Remove flag in package.json to proceed.` |
| Version Conflict | The version in `package.json` already exists on the registry. | `❌ Error: EPUBLISHCONFLICT. Run /wbRelease to bump the version first.` |
| Build Failure | `npm run build` fails during pre-publish hook. | `❌ Error: Compilation failed. Tarball generation aborted.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

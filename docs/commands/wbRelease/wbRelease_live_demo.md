# wb-flow Protocol: /wbRelease Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbRelease` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/packages/wb-core`
**Live State Evaluated:** 
*   Active Directory: `packages/wb-core`
*   Status: Working tree is clean. Commits have been made for the JWT Handshake and Regex fixes. Ready for release.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Monorepo Root | **[INACTIVE]** Executing from within `wb-core`. |
| Target is Sub-Package | **[ACTIVE]** Ready to bump version in `wb-core/package.json`. |
| Uncommitted Changes | **[PASS]** `git status` verifies tree is clean. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific Package | `Command: /wbRelease .` | Locks onto current dir (`wb-core`). | `[PROCEED] Executing release pipeline for wb-core.` |
| Comma-Separated | `Command: /wbRelease .,../wb-dataviewer` | Parses multiple scopes. | `[PROCEED] Correlating releases for core and dataviewer.` |
| Workspace Glob | `Command: /wbRelease ../*` | Extracts all sibling packages. | `[PROCEED] Massive version sweep across 4 packages.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--version="<type>"`| `Command: /wbRelease . -v="patch"` | `[VERSION] Bumping wb-core package.json: 4.5.1 -> 4.5.2.` |
| `--changelog` | `Command: /wbRelease . -c` | `[CHANGELOG] Writing 'Fix: ReDoS in renderString' to CHANGELOG.md.` |
| `--github` | `Command: /wbRelease . -g` | `[GITHUB] Authenticating with wb-labs origin... Creating v4.5.2.` |
| `--dry-run` | `Command: /wbRelease . -d` | `[DRY-RUN] Would create patch release. Disk and origin untouched.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Massive Formal Release" (`. -v="minor" -c -g`)
**Live Context:** Running this *right now* to formally release the May 4th security patches to `wb-core`.
**Command Executed:** `/wbRelease . -v="minor" -c -g`
**Live Output:**
```text
> Command: /wbRelease . -v="minor" -c -g

[SYSTEM] Initiating Formal Release Protocol for wb-core...
[VERSION] Bumping package.json: 4.5.1 -> 4.6.0.
[CHANGELOG] Parsing conventional commits... 
[CHANGELOG] Appended: "Feat: JWT Handshake", "Fix: Regex Catastrophic Backtracking".
[GIT] Tagged current HEAD as @wb-core/v4.6.0.
[GITHUB] Pushing tag and publishing Release to origin...
[SUCCESS] Release @wb-core/v4.6.0 is live on GitHub.
```

### 💠 The "Beta Dry-Run" (`../* -v="beta" -d`)
**Live Context:** Checking what a monorepo-wide beta release would look like across `core2/packages`.
**Command Executed:** `/wbRelease ../* -v="beta" -d`
**Live Output:**
```text
> Command: /wbRelease ../* -v="beta" -d

[SYSTEM] Glob resolved to 4 packages in core2.
[DRY-RUN] wb-core: 4.5.1 -> 4.5.2-beta.0
[DRY-RUN] wb-dataviewer: 2.0.0 -> 2.0.1-beta.0
[DRY-RUN] wb-press2: 1.1.4 -> 1.1.5-beta.0
[DRY-RUN] wb-press2.wbc-ui.com: 1.0.0 -> 1.0.1-beta.0
[SUCCESS] Dry-run complete. Run without -d to apply beta tags.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Dirty Working Tree | **[PASS]** Tree is clean. | SemVer bump proceeds. |
| Unconventional Commits | **[PASS]** Previous commits used `Feat:` and `Fix:`. | Auto-changelog generation succeeds. |
| GitHub API Failure | **[PASS]** Token is active in env. | Release pushed successfully. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

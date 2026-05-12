# wb-flow Protocol: /wbRelease Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbRelease` command. It serves as the definitive reference for how the agent manages semantic versioning, automated changelog generation, git tagging, and GitHub Releases.

---

## 1. Role & Definition Matrix
**Role:** The Release Manager & Versioning Agent
**Target:** Finalizes an epic or sprint by bumping package versions, generating public changelogs, and creating formal release points in Git.
**Core Protocol:** Strict adherence to Semantic Versioning (SemVer). The agent must read commit history and active plans to determine if the bump should be `major`, `minor`, or `patch`.

| Scenario | System Behavior |
|---|---|
| Target is Monorepo Root | **[PROCEED]** Analyzes all packages. Performs a synchronized, unified version bump across the workspace. |
| Target is Sub-Package | **[PROCEED]** Bumps version only for the specified package. Isolates the changelog to that package's commit history. |
| Uncommitted Changes | **[HALT]** Protocol forbids cutting a release if the working tree is dirty. Prompts user to run `/wbGit` first. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbRelease` uses explicit pathing to determine the scope of the semantic bump.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific Package | `Command: /wbRelease packages/wb-core` | Locks onto `wb-core`. Parses its commit history. | Bumps `wb-core` `package.json` and generates isolated changelog. |
| Comma-Separated | `Command: /wbRelease apps/wbc-ui.com,packages/wb-core` | Parses multiple scopes. | Creates a joint release note for both the UI and Core packages. |
| Current Directory | `Command: /wbRelease .` | Checks `package.json` in CWD. | Executes localized release logic for the active folder. |
| Workspace Glob | `Command: /wbRelease packages/*` | Extracts all packages. | Bumps all packages independently based on their individual commit histories. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--version="<type>"`| `-v` | Explicitly forces the semantic bump type (`major`, `minor`, `patch`, `beta`). | `Command: /wbRelease . -v="major"` | `[VERSION] Forced MAJOR bump. Version updated: 4.5.2 -> 5.0.0.` |
| `--changelog` | `-c` | Auto-generates `CHANGELOG.md` based on conventional commits since last tag. | `Command: /wbRelease . -c` | `[CHANGELOG] Generated notes: 3 Features, 1 Bug Fix.` |
| `--github` | `-g` | Automatically pushes the tag and creates a GitHub Release with the changelog. | `Command: /wbRelease . -g` | `[GITHUB] Created Release v5.0.0 on remote repository.` |
| `--dry-run` | `-d` | Simulates the release process. Displays proposed version and changelog without writing. | `Command: /wbRelease . -d` | `[DRY-RUN] Would bump to v5.0.0. Disk untouched.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Formal Release" (`. -v="minor" -c -g`)
**Context:** The epic is fully tested. The developer wants to cut a formal minor release, update the changelog, and push it straight to GitHub.
**Command Executed:** `/wbRelease . -v="minor" -c -g`
**Simulated Protocol Chain:**
1. Validates working tree is clean.
2. Updates `package.json` version from `1.2.4` -> `1.3.0`.
3. Parses git history (`-c`). Generates markdown changelog.
4. Creates git tag `v1.3.0`.
5. Pushes to origin (`-g`). Triggers GitHub API to create a public release.
**Simulated Output:**
```markdown
> Command: /wbRelease . -v="minor" -c -g

[SYSTEM] Initiating Formal Release Protocol...
[VERSION] Bumping package.json: 1.2.4 -> 1.3.0.
[CHANGELOG] Parsing conventional commits... Generated CHANGELOG.md.
[GIT] Tagged current HEAD as v1.3.0.
[GITHUB] Pushing tag and publishing Release to origin...
[SUCCESS] Release v1.3.0 is live on GitHub.
```

### 💠 The "Beta Dry-Run" (`packages/* -v="beta" -d`)
**Context:** Developer wants to see what the version matrix would look like if they cut a beta release for all packages.
**Command Executed:** `/wbRelease packages/* -v="beta" -d`
**Simulated Output:**
```markdown
> Command: /wbRelease packages/* -v="beta" -d

[SYSTEM] Glob resolved to 4 packages.
[DRY-RUN] wb-core: 2.1.0 -> 2.1.1-beta.0
[DRY-RUN] wb-dataviewer: 1.0.5 -> 1.0.6-beta.0
[DRY-RUN] wb-press2: 3.4.0 -> 3.4.1-beta.0
[SUCCESS] Dry-run complete. Run without -d to apply beta tags.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Dirty Working Tree | `git status` shows uncommitted modifications. | `❌ Error: Working tree is dirty. Run /wbGit to commit changes first.` |
| Unconventional Commits | `git log` lacks `feat:` or `fix:` prefixes for auto-bumping. | `⚠️ Warning: Cannot determine SemVer automatically. Use -v to force.` |
| GitHub API Failure | Token expired or repository unreachable. | `⚠️ Warning: Local tag created, but GitHub Release failed (HTTP 401).` |
| Missing package.json | Target directory lacks a manifest. | `❌ Error: No package.json found. Cannot determine version.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

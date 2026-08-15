# /wbRelease — Exhaustive Simulation ()

`/wbRelease` is the release engineer. Its job is **monorepo-wide version coordination** — bumping versions across packages that depend on each other, generating changelogs, creating git tags, and producing the release commit. It does not publish to npm (that's `/wbPublish`), does not deploy apps (that's `/wbDeploy`). It coordinates the *version state* of the repository.

Read this if you want to know how the four flags compose, why `--restore` exists, and where release coordination ends and the actual ship operations begin.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Release Engineer — version coordination across packages. |
| **Target** | The whole monorepo (default), or a specific package via free-text/path. |
| **Cell scope** | None directly. |
| **Side effects allowed** | Editing `package.json` files (version bumps); generating CHANGELOG.md entries; creating git tags (via `/wbGit -A` chaining or direct git invocation under explicit user gate); producing release notes. |
| **Side effects forbidden** | Publishing to npm; deploying apps; modifying source code beyond version fields; running tests (that's `/wbTest`). |

The "doesn't publish, doesn't deploy" rule is what keeps the seam clean. The full release flow is: `/wbRelease` (versions + tags) → `/wbPublish` (npm) → `/wbDeploy` (apps). Three commands, three concerns, three checkpoints. Compressing them into one command is tempting but loses the per-step rollback story.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbRelease` does |
|---|---|---|
| No argument | `Command: /wbRelease` | Coordinates a release across all packages with changes since the last release. |
| Specific package | `Command: /wbRelease core2/packages/wb-core` | Releases just one package. Cascades version bumps to dependents. |
| `--restore` | `Command: /wbRelease --restore` | Reverts the most recent in-progress release if it was halted partway (uncommitted version bumps, half-tagged state). |

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--dry-run` | `-d` | Plans the release; doesn't write. Reports what versions would bump, what changelog entries would be added, what tags would be created. |
| `--prerelease` | `-p` | Releases as `1.2.3-beta.0` (or `-rc`, `-alpha`) instead of `1.2.3`. Useful for pre-release stabilization. |
| `--restore` | `-r` | Recover from a halted in-progress release. Reverts version bumps and any partial tags. |
| `--tag="<name>"` | `-t` | Custom tag name override (default: `v<version>`). Rare; for projects with non-standard tag conventions. |

### How the four flags compose

| Combination | Result |
|---|---|
| `--dry-run` alone | Full report, no writes. |
| `--prerelease` alone | Pre-release version bump committed + tagged. |
| `--prerelease --dry-run` | Pre-release planned, no writes. |
| `--restore` alone | Recovery; not a normal release shape. |
| `--tag="custom"` | Override tag name only; everything else normal. |

`--restore` is incompatible with the others. If `--restore` is present, the agent ignores `-d`/`-p`/`-t` and runs recovery mode.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbReleaseSimPipelines = [
  {
    "title": "The dry-run first (always)",
    "cmd": "/wbRelease --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run \u2014 no writes will occur.",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading package.json files across core2/packages/...",
        "type": "gen"
      },
      {
        "text": "[SCAN] Reading git log since last tag (v1.2.0)...",
        "type": "gen"
      },
      {
        "text": "[ANALYSIS] Changes since v1.2.0:",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-core: 12 commits (3 feat, 5 fix, 4 chore).",
        "type": "gen"
      },
      {
        "text": "Recommended bump: minor. v1.2.0 \u2192 v1.3.0.",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-dataviewer: 3 commits (1 fix, 2 chore).",
        "type": "gen"
      },
      {
        "text": "Recommended bump: patch. v1.2.0 \u2192 v1.2.1.",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wbc-ui2-cdn: 0 commits since v1.2.0.",
        "type": "gen"
      },
      {
        "text": "No release needed.",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wbc-ui2: 1 commit (1 chore).",
        "type": "gen"
      },
      {
        "text": "Recommended bump: none (chore-only changes don't trigger release).",
        "type": "gen"
      },
      {
        "text": "[CASCADE] wb-core version bump propagates to:",
        "type": "gen"
      },
      {
        "text": "- wb-dataviewer (depends on wb-core via @wbc-ui2/wb-core ^1.2.0)",
        "type": "gen"
      },
      {
        "text": "No additional bump needed; semver-compatible.",
        "type": "gen"
      },
      {
        "text": "[CHANGELOG PREVIEW]",
        "type": "gen"
      },
      {
        "text": "## v1.3.0 (wb-core)",
        "type": "sys"
      },
      {
        "text": "### Features",
        "type": "gen"
      },
      {
        "text": "- Add JWT handshake with alg denylist (commit a1b2c3d)",
        "type": "gen"
      },
      {
        "text": "- Add escape pass for renderString (commit b2c3d4e)",
        "type": "gen"
      },
      {
        "text": "- <feat 3>",
        "type": "gen"
      },
      {
        "text": "### Fixes",
        "type": "gen"
      },
      {
        "text": "- <5 fixes>",
        "type": "gen"
      },
      {
        "text": "## v1.2.1 (wb-dataviewer)",
        "type": "sys"
      },
      {
        "text": "### Fixes",
        "type": "gen"
      },
      {
        "text": "- <1 fix>",
        "type": "gen"
      },
      {
        "text": "[TAG PREVIEW] Would create tags: wb-core@v1.3.0, wb-dataviewer@v1.2.1",
        "type": "gen"
      },
      {
        "text": "[NO WRITES] Dry-run complete. Run without --dry-run to actually release.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The actual release",
    "cmd": "/wbRelease",
    "logs": [
      {
        "text": "[SYSTEM] Release coordination starting.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Working tree clean? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] On main branch? Yes.",
        "type": "gen"
      },
      {
        "text": "[ANALYSIS] Same as dry-run.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Apply 2 version bumps and create 2 tags?",
        "type": "gen"
      },
      {
        "text": "- wb-core: v1.2.0 \u2192 v1.3.0",
        "type": "gen"
      },
      {
        "text": "- wb-dataviewer: v1.2.0 \u2192 v1.2.1",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] core2/packages/wb-core/package.json: version 1.3.0.",
        "type": "gen"
      },
      {
        "text": "[EDIT] core2/packages/wb-dataviewer/package.json: version 1.2.1.",
        "type": "gen"
      },
      {
        "text": "[EDIT] CHANGELOG.md: added v1.3.0 (wb-core), v1.2.1 (wb-dataviewer) entries.",
        "type": "gen"
      },
      {
        "text": "[COMMIT] Creating release commit via /wbGit (under-the-hood):",
        "type": "gen"
      },
      {
        "text": "\"release: wb-core@v1.3.0, wb-dataviewer@v1.2.1\"",
        "type": "gen"
      },
      {
        "text": "(uses /wbGit -e to gate the commit; user confirms.)",
        "type": "gen"
      },
      {
        "text": "[TAG] git tag wb-core@v1.3.0",
        "type": "gen"
      },
      {
        "text": "[TAG] git tag wb-dataviewer@v1.2.1",
        "type": "gen"
      },
      {
        "text": "[OK] Release coordinated. Two tags created locally.",
        "type": "ok"
      },
      {
        "text": "[NEXT STEPS]",
        "type": "gen"
      },
      {
        "text": "1. Push tags: git push origin --tags (manual; `/wbRelease` doesn't push by design)",
        "type": "gen"
      },
      {
        "text": "2. Publish to npm: /wbPublish (will read the new tags)",
        "type": "gen"
      },
      {
        "text": "3. Deploy apps: /wbDeploy --prod (if app changes warrant it)",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The pre-release",
    "cmd": "/wbRelease core2/packages/wb-core --prerelease",
    "logs": [
      {
        "text": "[SYSTEM] Pre-release for wb-core only.",
        "type": "sys"
      },
      {
        "text": "[ANALYSIS] Current version: 1.3.0. Most recent prerelease: none.",
        "type": "gen"
      },
      {
        "text": "[PROPOSAL] Bump to 1.4.0-beta.0.",
        "type": "gen"
      },
      {
        "text": "[CHANGELOG] Pre-release notes generated.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Bump wb-core to 1.4.0-beta.0 + tag wb-core@v1.4.0-beta.0?",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] package.json updated.",
        "type": "gen"
      },
      {
        "text": "[COMMIT] release: wb-core@v1.4.0-beta.0",
        "type": "gen"
      },
      {
        "text": "[TAG] wb-core@v1.4.0-beta.0",
        "type": "gen"
      },
      {
        "text": "[OK] Pre-release coordinated. Use /wbPublish --prerelease to ship.",
        "type": "ok"
      },
      {
        "text": "[NOTE] Pre-releases are intended for testing \u2014 npm consumers using",
        "type": "gen"
      },
      {
        "text": "`^1.3.0` won't pick up the beta automatically; they'd need to",
        "type": "gen"
      },
      {
        "text": "opt in with `1.4.0-beta.0` explicitly.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The `--restore` recovery",
    "cmd": "/wbRelease --restore",
    "logs": [
      {
        "text": "[SYSTEM] Recovery mode.",
        "type": "sys"
      },
      {
        "text": "[SCAN] Looking for in-progress release state...",
        "type": "gen"
      },
      {
        "text": "[FOUND] Uncommitted version bumps in:",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-core/package.json (1.3.0 \u2192 1.4.0, uncommitted)",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wb-dataviewer/package.json (1.2.0 \u2192 1.2.1, uncommitted)",
        "type": "gen"
      },
      {
        "text": "[FOUND] No tags created yet (release was interrupted before tag step).",
        "type": "gen"
      },
      {
        "text": "[FOUND] CHANGELOG.md has uncommitted v1.4.0 entry.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Revert all in-progress release edits?",
        "type": "gen"
      },
      {
        "text": "- 2 package.json files reverted to last-committed state.",
        "type": "gen"
      },
      {
        "text": "- CHANGELOG.md reverted.",
        "type": "gen"
      },
      {
        "text": "- No tags to remove.",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[REVERT] core2/packages/wb-core/package.json restored.",
        "type": "gen"
      },
      {
        "text": "[REVERT] core2/packages/wb-dataviewer/package.json restored.",
        "type": "gen"
      },
      {
        "text": "[REVERT] CHANGELOG.md restored.",
        "type": "gen"
      },
      {
        "text": "[OK] Repository back to pre-release state. Re-run /wbRelease when ready.",
        "type": "ok"
      }
    ],
    "note": "A `/wbRelease` run was interrupted (Ctrl-C, network error, terminal closed) after some package.json edits but before tagging. The state is messy. `--restore` undoes it:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbRelease" titleSuffix="Exhaustive Simulation" :pipelines="wbReleaseSimPipelines" />


### 💠 Pipeline The dry-run first (always)


### 💠 Pipeline The actual release


### 💠 Pipeline The pre-release


### 💠 Pipeline The `--restore` recovery

A `/wbRelease` run was interrupted (Ctrl-C, network error, terminal closed) after some package.json edits but before tagging. The state is messy. `--restore` undoes it:

---

## 5. Edge cases & refusals

| Trigger | What `/wbRelease` does |
|---|---|
| Working tree dirty | Halt. Releases require a clean tree. |
| Not on main branch | Halt. |
| `--restore` with no in-progress state | Honest "nothing to restore." Exit 0. |
| Conflict between `--restore` and other flags | `--restore` wins; others ignored with notice. |
| No commits since last tag | Halt — nothing to release. |
| All commits are chore-only | Halt — chore-only commits don't trigger release. Suggests `--prerelease` if explicitly desired. |
| Cross-package dependency cycle (rare) | Halt. The version cascade can't resolve cycles deterministically. |
| `--tag="<name>"` that already exists | Halt — won't overwrite tags. |
| `/wbRelease` while another release is in progress (mid-run elsewhere) | Halt — single-release-at-a-time. |

The pattern: **`/wbRelease` is version coordination, not shipping.** It refuses dirty trees, refuses to push tags or publish, treats `--restore` as a recovery primitive, and stays narrow on its responsibility (versions + tags + changelog). The full ship flow is `/wbRelease` → `/wbPublish` → `/wbDeploy` — each command its own gate, each its own concern.

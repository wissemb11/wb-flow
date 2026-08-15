# /wbPublish — Live Demo ()

What `/wbPublish` would actually do on `wb-labs` right now. The package state, dist-folder issues, and registry assumptions below reflect the live workspace.

---

<CommandLiveDemoAnimation command="wbPublish" />

## 1. Live target

| Field | Live value |
|---|---|
| Working tree | Heavily dirty (docs sync uncommitted) |
| Recent tags | Unknown without `git tag` inspection — assume some |
| Memory blockers | `project_pkg_dist_mismatch.md` (wbc-ui2-cdn dist-folder mismatch — would fail manifest validation); `wbc-ui2-tech-debt.md` (untested apps) |
| Most likely candidate for publish | `core2/packages/wb-core/` if it has a current tag and a working build |
| Known publish blocker | `core2/packages/wbc-ui2-cdn/` — dist-folder mismatch refuses to publish |

The wbc-ui2-cdn issue is the *interesting* live case: this is a real publish blocker grounded in a memory-tracked decision, and `/wbPublish` would surface it even before any registry call.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbPublish` (default — most-recent tagged) | Would attempt to publish whichever package has the most recent tag. Halts on dirty tree first. |
| `/wbPublish core2/packages/wb-core` | Halts on dirty tree. With a clean tree, would proceed to manifest check; likely OK. |
| `/wbPublish core2/packages/wbc-ui2-cdn` | Halts on dirty tree first. Even with clean tree, would refuse on manifest validation due to dist-folder mismatch. |
| `/wbPublish --all` | Halts on dirty tree. Otherwise would attempt all; would succeed for wb-core, fail for wbc-ui2-cdn → partial publish state. |
| `/wbPublish --dry-run` | Permitted on dirty tree (no registry calls). Useful for surfacing what *would* happen. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| (no flag) | Halt — dirty tree. |
| `--dry-run` | Permitted; surfaces blockers including the dist-folder mismatch. |
| `--all --dry-run` | Permitted; surfaces all blockers across packages. |
| `--all` (no dry-run) | Halt — dirty tree, plus strong suggestion to dry-run. |
| `--prerelease` | Halt — dirty tree. |
| `--restore` | Honest "no failed publish to restore." |

---

## 4. Pipelines

<script setup>
const wbPublishPipelines = [
  {
    "title": "`--all --dry-run` to see what would happen",
    "cmd": "/wbPublish --all --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Multi-package dry run.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Working tree clean? NO (warning, not blocking in dry-run).",
        "type": "gen"
      },
      {
        "text": "[NOTE] Dry-run analyzes the *committed* state; uncommitted work",
        "type": "gen"
      },
      {
        "text": "isn't part of the analysis.",
        "type": "gen"
      },
      {
        "text": "[SCAN] Packages in core2/packages/* with version fields...",
        "type": "gen"
      },
      {
        "text": "[ANALYSIS]",
        "type": "gen"
      },
      {
        "text": "- @wbc-ui2/wb-core (assume v1.3.0 if tagged):",
        "type": "gen"
      },
      {
        "text": "Tag exists? Assumed yes. Already on registry? Assumed no.",
        "type": "gen"
      },
      {
        "text": "Manifest validation: main, exports \u2014 assumed OK.",
        "type": "gen"
      },
      {
        "text": "\u2192 Would publish.",
        "type": "gen"
      },
      {
        "text": "- @wbc-ui2/wb-dataviewer (assume v1.2.1 if tagged):",
        "type": "gen"
      },
      {
        "text": "Tag exists? Assumed yes. On registry? Assumed no.",
        "type": "gen"
      },
      {
        "text": "Manifest validation: assumed OK.",
        "type": "gen"
      },
      {
        "text": "\u2192 Would publish.",
        "type": "gen"
      },
      {
        "text": "- @wbc-ui2/wbc-ui2-cdn (assume v1.0.0):",
        "type": "gen"
      },
      {
        "text": "Tag exists? Assumed yes. On registry? Unknown.",
        "type": "gen"
      },
      {
        "text": "Manifest validation: **FAIL**",
        "type": "gen"
      },
      {
        "text": "main: \"./dist/index.js\" \u2014 does not exist.",
        "type": "gen"
      },
      {
        "text": "Build output goes to ./dist-dev/ per vite config.",
        "type": "gen"
      },
      {
        "text": "[MEMORY] project_pkg_dist_mismatch.md flags this as parked.",
        "type": "ctx"
      },
      {
        "text": "\u2192 **WOULD NOT PUBLISH**. /wbPublish refuses bad manifests.",
        "type": "gen"
      },
      {
        "text": "- @wbc-ui2/wbc-ui2 (assume v1.0.0):",
        "type": "gen"
      },
      {
        "text": "Tag exists? Assumed yes. On registry? Unknown.",
        "type": "gen"
      },
      {
        "text": "[MEMORY] wbc-ui2-tech-debt.md flags untested apps + vuepress crash.",
        "type": "ctx"
      },
      {
        "text": "Manifest validation: depends on actual state.",
        "type": "gen"
      },
      {
        "text": "\u2192 Likely refusal due to test-and-build issues.",
        "type": "gen"
      },
      {
        "text": "[SUMMARY]",
        "type": "gen"
      },
      {
        "text": "Would publish: 2 packages (wb-core, wb-dataviewer).",
        "type": "gen"
      },
      {
        "text": "Would refuse: 2 packages (wbc-ui2-cdn, wbc-ui2 \u2014 both for parked",
        "type": "gen"
      },
      {
        "text": "tech-debt reasons surfaced via memory).",
        "type": "gen"
      },
      {
        "text": "[OK] Dry-run complete. To proceed:",
        "type": "ok"
      },
      {
        "text": "- Commit the working tree first: /wbGit -r -e -p",
        "type": "gen"
      },
      {
        "text": "- Then: /wbPublish core2/packages/wb-core (or wb-dataviewer)",
        "type": "gen"
      },
      {
        "text": "individually \u2014 `--all` would partial-fail.",
        "type": "gen"
      },
      {
        "text": "- Address the parked items (architectural conversations) before",
        "type": "gen"
      },
      {
        "text": "publishing wbc-ui2-cdn or wbc-ui2.",
        "type": "gen"
      }
    ],
    "note": "The most informative invocation today (no writes, surfaces blockers):",
    "noteType": "info"
  },
  {
    "title": "A clean single-package publish (after the dirty tree is committed)",
    "cmd": "/wbPublish core2/packages/wb-core --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Tree clean? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] @wbc-ui2/wb-core@<version>: tagged? Yes. On registry? No.",
        "type": "gen"
      },
      {
        "text": "[BUILD] pnpm --filter wb-core build... success.",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] main: dist/index.js \u2192 exists.",
        "type": "gen"
      },
      {
        "text": "[PACK] 28KB tarball.",
        "type": "gen"
      },
      {
        "text": "[OK] Dry-run passes.",
        "type": "ok"
      }
    ],
    "note": "Hypothetical, post-`/wbGit`:",
    "noteType": "info"
  },
  {
    "title": "The wbc-ui2-cdn refusal (memory-aware)",
    "cmd": "/wbPublish core2/packages/wbc-ui2-cdn --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Tree clean? (assume yes for this scenario)",
        "type": "gen"
      },
      {
        "text": "[CHECK] @wbc-ui2/wbc-ui2-cdn@<version>: tagged? Yes. On registry? No.",
        "type": "gen"
      },
      {
        "text": "[BUILD] pnpm --filter wbc-ui2-cdn build...",
        "type": "gen"
      },
      {
        "text": "Output: dist-dev/index.js (per vite outDir).",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] Manifest:",
        "type": "gen"
      },
      {
        "text": "- main: \"./dist/index.js\"",
        "type": "gen"
      },
      {
        "text": "- dist/ \u2192 does not exist",
        "type": "gen"
      },
      {
        "text": "[**FAIL**] main file missing.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Memory project_pkg_dist_mismatch.md records this as parked",
        "type": "ctx"
      },
      {
        "text": "tech debt. Both candidate fixes have unresolved trade-offs.",
        "type": "gen"
      },
      {
        "text": "[REFUSE] Refusing to publish a package whose main file doesn't exist.",
        "type": "error"
      },
      {
        "text": "[NEXT]",
        "type": "gen"
      },
      {
        "text": "- Architectural decision needed (parked).",
        "type": "gen"
      },
      {
        "text": "- Workaround for emergency only: pnpm --filter wbc-ui2-cdn build",
        "type": "gen"
      },
      {
        "text": "via the dist-writing path, then re-validate.",
        "type": "gen"
      },
      {
        "text": "[NO REGISTRY CALL]",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "`--restore` on a clean state",
    "cmd": "/wbPublish --restore",
    "logs": [
      {
        "text": "[SYSTEM] Recovery mode.",
        "type": "sys"
      },
      {
        "text": "[SCAN] Looking for failed publishes (packed tarballs cached locally",
        "type": "gen"
      },
      {
        "text": "with no corresponding registry version)...",
        "type": "gen"
      },
      {
        "text": "[FOUND] None.",
        "type": "gen"
      },
      {
        "text": "[OK] No failed publish to restore. Exit 0.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbPublish" :pipelines="wbPublishPipelines" />


### 💠 Pipeline `--all --dry-run` to see what would happen

The most informative invocation today (no writes, surfaces blockers):


### 💠 Pipeline A clean single-package publish (after the dirty tree is committed)

Hypothetical, post-`/wbGit`:


### 💠 Pipeline The wbc-ui2-cdn refusal (memory-aware)


### 💠 Pipeline `--restore` on a clean state

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbPublish` | Halt — dirty tree. |
| `/wbPublish --all` | Halt — dirty tree + dangerous-by-default warning. |
| `/wbPublish core2/packages/wbc-ui2-cdn` | Halt — dirty tree first; even clean, refuses on manifest validation. |
| `/wbPublish core2/packages/wb-core` | Halt — dirty tree first. |
| `/wbPublish "the wbcode package"` | Halt — free-text. |
| `/wbPublish --restore` | Exit 0 — nothing to recover. |
| `/wbPublish --prerelease <pkg>` for a non-prerelease version | Halt — flag/version mismatch. |
| `/wbPublish` "unpublish please" via NL | Refuse — unpublish is destructive and policy-implicating; tell user to use npm directly. |

The pattern: **`/wbPublish` is narrow, manifest-validating, memory-aware.** It refuses dirty trees, refuses bad manifests (the dist-folder mismatch is the live example), refuses to silently overwrite `latest` with pre-releases. The recommended path on this exact workspace today: commit first via `/wbGit -r -e -p`, then `/wbPublish --all --dry-run` to confirm the landscape, then `/wbPublish <pkg>` per package — explicitly, not via `--all`, until the parked items are addressed.

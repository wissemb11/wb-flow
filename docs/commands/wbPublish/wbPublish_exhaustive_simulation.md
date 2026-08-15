# /wbPublish — Exhaustive Simulation ()

`/wbPublish` is the shipper of **packages** to npm. Its job is the narrow segment between "tagged release" and "consumers can install it": run the build, validate the manifest, push to the registry, verify the published version is reachable. It does not coordinate versions (that's `/wbRelease`) and does not deploy apps (that's `/wbDeploy`).

Read this if you want to know what the four flags do, why `--all` is dangerous-by-default, and how the publish step interacts with the dist-folder mismatch parked in this workspace's memory.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Shipper — pushes packages to npm. |
| **Target** | A specific package (default: the one whose tag was most recently created) or `--all` for every package with a current tag awaiting publish. |
| **Cell scope** | None directly. |
| **Side effects allowed** | Running `npm publish` (or pnpm equivalent); reading the registry to verify post-publish; warning on dist-folder mismatches. |
| **Side effects forbidden** | Modifying source code; bumping versions (already done by `/wbRelease`); creating tags; deploying apps. |

The "narrow segment" framing is the design center. The full ship flow has three commands — `/wbRelease` produces the version state, `/wbPublish` puts the package on npm, `/wbDeploy` puts apps on the web. Each command's failure mode is independent: a publish failure doesn't mean rollback the version; a deploy failure doesn't mean unpublish. The seams hold.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbPublish` does |
|---|---|---|
| No argument | `Command: /wbPublish` | Publishes the package whose latest tag was most recently created and not yet on the registry. |
| Specific package | `Command: /wbPublish core2/packages/wb-core` | Publishes that one package. Most explicit. |
| `--all` | `Command: /wbPublish --all` | Publishes every package whose current version isn't on the registry. Sequential; halts on first failure. |
| Free-text | `Command: /wbPublish "the auth package"` | Refused — path required. |

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--all` | `-A` | Publishes every package in the monorepo whose tag-version isn't already on the registry. |
| `--dry-run` | `-d` | Validates manifest, runs build, reports what *would* publish. Does not call npm. |
| `--prerelease` | `-p` | Publishes with the `next` (or pre-release) dist-tag instead of `latest`. Required for pre-release versions like `1.4.0-beta.0`. |
| `--restore` | `-r` | Re-publishes a previously-failed publish attempt (same version) using the same artifacts. Useful when a registry hiccup caused the first attempt to fail mid-upload. |

### Why `--all` is dangerous-by-default

Publishing everything in one command means: if the registry is having issues partway through, you might be left with packages 1-3 published and packages 4-6 not — a half-shipped state. The agent treats `--all` as needing extra caution:

| Without `--all` | With `--all` |
|---|---|
| Single package; one decision. | Multi-package; cascading decisions. |
| Failure stops one publish. | Failure stops the chain at whatever point. |
| Confirmation prompt: 1 | Confirmation prompts: per-package + summary. |
| Rollback: `--restore` re-runs the failed publish. | Rollback: `--restore` per failed publish. |

The agent always recommends *not* using `--all` unless the user is intentionally publishing a coordinated multi-package release.

### How `--dry-run` validates

| Step | Live | Dry-run |
|---|---|---|
| Read package.json + check version is tagged | Yes | Yes |
| Build (if needed) | Yes | Yes |
| Validate manifest (files field, main field, exports field) | Yes | Yes |
| Check dist-folder reality (does the file `main` points at exist?) | Yes | Yes |
| Pack tarball | Yes | Yes (cached locally) |
| Push to registry | Yes | Skipped; logs what would push |
| Verify post-push | Yes | Skipped |

The manifest validation is where the dist-folder mismatch surfaces. If `main` points at `dist/index.js` but the build wrote to `dist-dev/index.js`, dry-run catches it before any registry call.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbPublishSimPipelines = [
  {
    "title": "The dry-run that catches the dist-folder mismatch",
    "cmd": "/wbPublish core2/packages/wbc-ui2-cdn --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Reading package.json...",
        "type": "gen"
      },
      {
        "text": "name: @wbc-ui2/wbc-ui2-cdn",
        "type": "gen"
      },
      {
        "text": "version: 1.0.0",
        "type": "gen"
      },
      {
        "text": "main: ./dist/index.js",
        "type": "gen"
      },
      {
        "text": "[CHECK] Tag for v1.0.0 exists? Yes.",
        "type": "gen"
      },
      {
        "text": "[BUILD] Running build...",
        "type": "gen"
      },
      {
        "text": "Output: dist-dev/index.js (vite outDir = dist-dev)",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] Manifest sanity:",
        "type": "gen"
      },
      {
        "text": "- main: ./dist/index.js",
        "type": "gen"
      },
      {
        "text": "- dist/ exists? **NO**",
        "type": "gen"
      },
      {
        "text": "- dist-dev/index.js exists? Yes.",
        "type": "gen"
      },
      {
        "text": "[**FAIL**] Manifest claims main is at ./dist/index.js but the file",
        "type": "gen"
      },
      {
        "text": "does not exist at that path.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Memory: project_pkg_dist_mismatch.md records this as",
        "type": "ctx"
      },
      {
        "text": "parked tech debt \u2014 both candidate fixes (update main, or",
        "type": "gen"
      },
      {
        "text": "reconfigure vite) have unresolved trade-offs.",
        "type": "gen"
      },
      {
        "text": "[REFUSE] /wbPublish will not publish a package whose `main` field",
        "type": "error"
      },
      {
        "text": "points at a non-existent file. Consumers would resolve the",
        "type": "gen"
      },
      {
        "text": "module and find nothing.",
        "type": "gen"
      },
      {
        "text": "[NEXT STEPS]",
        "type": "gen"
      },
      {
        "text": "Option A: Decide the parked dist-folder question first.",
        "type": "gen"
      },
      {
        "text": "Open the architecture conversation; pick one of the two fixes;",
        "type": "gen"
      },
      {
        "text": "then re-run /wbPublish.",
        "type": "gen"
      },
      {
        "text": "Option B: Manual workaround for an emergency publish:",
        "type": "gen"
      },
      {
        "text": "pnpm --filter wbc-ui2-cdn build (writes to dist/ via different path)",
        "type": "gen"
      },
      {
        "text": "Then re-run /wbPublish --dry-run to verify before publish.",
        "type": "gen"
      },
      {
        "text": "[NO REGISTRY CALL] Dry-run halted at validation.",
        "type": "gen"
      }
    ],
    "note": "A real situation in this workspace: `core2/packages/wbc-ui2-cdn/` has a parked dist-folder mismatch (per `project_pkg_dist_mismatch.md`). What happens when someone tries to publish it?",
    "noteType": "info"
  },
  {
    "title": "A clean single-package publish",
    "cmd": "/wbPublish core2/packages/wb-core --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run.",
        "type": "sys"
      },
      {
        "text": "[CHECK] package.json: @wbc-ui2/wb-core@1.3.0",
        "type": "gen"
      },
      {
        "text": "[CHECK] Tag wb-core@v1.3.0 exists? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Already on registry? No.",
        "type": "gen"
      },
      {
        "text": "[BUILD] pnpm --filter wb-core build... success. dist/index.js (47KB).",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] main: dist/index.js \u2192 exists. exports map \u2192 all targets exist.",
        "type": "gen"
      },
      {
        "text": "[PACK] Tarball: 28KB.",
        "type": "gen"
      },
      {
        "text": "[OK] Dry-run passes. Live publish would succeed.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "`--all` with a partial failure",
    "cmd": "/wbPublish --all",
    "logs": [
      {
        "text": "[SYSTEM] Multi-package publish.",
        "type": "sys"
      },
      {
        "text": "[SCAN] Packages with tag-versions not yet on registry:",
        "type": "gen"
      },
      {
        "text": "- @wbc-ui2/wb-core@1.3.0",
        "type": "gen"
      },
      {
        "text": "- @wbc-ui2/wb-dataviewer@1.2.1",
        "type": "gen"
      },
      {
        "text": "- @wbc-ui2/wbc-ui2-cdn@1.0.0 (parked dist mismatch \u2014 dry-run would fail)",
        "type": "gen"
      },
      {
        "text": "[STRONG SUGGESTION] Run --dry-run first. /wbPublish --all without",
        "type": "gen"
      },
      {
        "text": "a dry-run is risky \u2014 multi-package failures are",
        "type": "gen"
      },
      {
        "text": "harder to recover from than single failures.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM 1/N] Proceed without dry-run? [y/N] >",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The pre-release path",
    "cmd": "/wbPublish core2/packages/wb-core --prerelease",
    "logs": [
      {
        "text": "[SYSTEM] Pre-release publish.",
        "type": "sys"
      },
      {
        "text": "[CHECK] package.json: @wbc-ui2/wb-core@1.4.0-beta.0",
        "type": "gen"
      },
      {
        "text": "[CHECK] Tag wb-core@v1.4.0-beta.0 exists? Yes.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Already on registry? No.",
        "type": "gen"
      },
      {
        "text": "[VALIDATE] Manifest OK.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Publish @wbc-ui2/wb-core@1.4.0-beta.0 with dist-tag `next`?",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[PUBLISH] npm publish --tag=next... success.",
        "type": "gen"
      },
      {
        "text": "[VERIFY] Registry shows 1.4.0-beta.0 under `next` dist-tag.",
        "type": "gen"
      },
      {
        "text": "[OK] Pre-release published.",
        "type": "ok"
      },
      {
        "text": "[NOTE] Default `latest` dist-tag still points at 1.3.0. Consumers",
        "type": "gen"
      },
      {
        "text": "need to opt in: pnpm add @wbc-ui2/wb-core@next",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbPublish" titleSuffix="Exhaustive Simulation" :pipelines="wbPublishSimPipelines" />


### 💠 Pipeline The dry-run that catches the dist-folder mismatch

A real situation in this workspace: `core2/packages/wbc-ui2-cdn/` has a parked dist-folder mismatch (per `project_pkg_dist_mismatch.md`). What happens when someone tries to publish it?


### 💠 Pipeline A clean single-package publish


### 💠 Pipeline `--all` with a partial failure


### 💠 Pipeline The pre-release path

---

## 5. Edge cases & refusals

| Trigger | What `/wbPublish` does |
|---|---|
| No tag for the version | Halt. Says "run /wbRelease first." |
| Already on registry | Halt. Says "this version is published. Bump first." |
| Dirty working tree | Halt. Same as `/wbRelease` — clean tree required. |
| Manifest mismatch (main file doesn't exist) | Halt. Suggests the parked-decision conversation if memory flags it. |
| `--dry-run` + `--all` | Permitted and recommended pattern. |
| `--restore` for a publish that succeeded | Honest "already on registry; nothing to restore." |
| Free-text target | Halt. |
| `--prerelease` for a non-prerelease version (no `-beta`/`-rc` suffix) | Halt. The flag and the version must agree. |
| Network/registry failure mid-publish | Reports clearly. `--restore` re-attempts using the same packed tarball. |
| User asks to *unpublish* | Refuse. Unpublish is a destructive npm op with policy implications; not in `/wbPublish`'s lane. Tells the user to use `npm unpublish` directly with full understanding. |

The pattern: **`/wbPublish` is the npm registry interface — narrow, manifest-validating, dist-folder-aware.** It refuses to publish bad manifests, refuses to bypass the parked-decision conversation, refuses to silently overwrite `latest` with pre-releases. The dry-run is the recommended first step, especially for `--all` which is dangerous-by-default. Memory awareness shows up most clearly here: the dist-folder mismatch parked in `project_pkg_dist_mismatch.md` is a publish-blocker, and `/wbPublish` won't paper over it.

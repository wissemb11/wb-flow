# /wbRelease — Live Demo ()

What `/wbRelease` would actually do on `wb-labs` right now. The package versions, recent commits, and tree state below reflect the live workspace.

---

<CommandLiveDemoAnimation command="wbRelease" />

## 1. Live target

| Field | Live value |
|---|---|
| Working tree | Heavily dirty (large docs sync uncommitted) |
| Branch | `main` |
| Recent commits | `e07bb93 chore(core2): root cleanup`, `d3c4abd feat(ai-workflow): standardise 4D tracking`, `a8a3cf0 docs(agents)` |
| Most recent tag | Unknown without git tag inspection — likely several |
| Packages with versionable changes | `core2/packages/wb-core/`, others have shipped commits since the last tag (best guess: small bump candidates) |
| Memory rule | `feedback_no_git.md` — no git ops; `/wbRelease` is part of the deliberate `/wbGit` exception family |

The first row dominates: the dirty tree blocks any real release. Today's only honest invocation is `--dry-run` (which doesn't write) — but even dry-run requires the tree to settle eventually.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbRelease` | Halt — dirty tree. |
| `/wbRelease --dry-run` | Permitted — surfaces what *would* happen if tree were clean. Useful for planning. |
| `/wbRelease core2/packages/wb-core` | Halt — same dirty-tree refusal. |
| `/wbRelease --restore` | Honest "nothing to restore" (no in-progress release). Exit 0. |
| `/wbRelease --prerelease` | Halt — dirty tree. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| `--dry-run` | Reports proposed bumps based on commits since last tag. Does not write. Tolerates dirty tree. |
| `--prerelease` | Halt — dirty tree. |
| `--restore` | Exit 0 — nothing to recover. |
| `--tag="<custom>"` | Halt — dirty tree blocks first. |
| (no flag) | Halt — dirty tree. |

---

## 4. Pipelines

<script setup>
const wbReleasePipelines = [
  {
    "title": "The dry-run that surfaces what's queued",
    "cmd": "/wbRelease --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run \u2014 no writes.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Working tree clean? **NO** \u2014 uncommitted docs sync detected.",
        "type": "gen"
      },
      {
        "text": "[NOTE] Dry-run tolerates dirty tree but the analysis ignores",
        "type": "gen"
      },
      {
        "text": "uncommitted changes (only committed history counts).",
        "type": "gen"
      },
      {
        "text": "[SCAN] git log since last tag in core2/packages/wb-core/...",
        "type": "gen"
      },
      {
        "text": "(assume last tag was wb-core@v1.2.0)",
        "type": "gen"
      },
      {
        "text": "[FOUND] 5 commits since wb-core@v1.2.0 (committed):",
        "type": "gen"
      },
      {
        "text": "- e07bb93 chore(core2): root cleanup",
        "type": "gen"
      },
      {
        "text": "- d3c4abd feat(ai-workflow): standardise 4D tracking",
        "type": "gen"
      },
      {
        "text": "- a8a3cf0 docs(agents)",
        "type": "gen"
      },
      {
        "text": "- 6b9c499 docs(ai-agents)",
        "type": "gen"
      },
      {
        "text": "- f0cb23a docs(ai-agents)",
        "type": "gen"
      },
      {
        "text": "[ANALYSIS]",
        "type": "gen"
      },
      {
        "text": "- 1 feat commit \u2192 minor bump candidate.",
        "type": "gen"
      },
      {
        "text": "- Multiple chore/docs commits \u2192 no bump on their own.",
        "type": "gen"
      },
      {
        "text": "- **Recommended:** wb-core v1.2.0 \u2192 v1.3.0 (minor).",
        "type": "gen"
      },
      {
        "text": "- But: feat commit is in `ai-workflow`, not in core2/wb-core source.",
        "type": "gen"
      },
      {
        "text": "Worth questioning whether wb-core itself changed.",
        "type": "gen"
      },
      {
        "text": "[NOTICE] The /wbRelease analysis is conservative: if the diff in the",
        "type": "gen"
      },
      {
        "text": "feat commit doesn't touch core2/packages/wb-core/src/, the",
        "type": "gen"
      },
      {
        "text": "minor bump is NOT recommended for wb-core specifically.",
        "type": "gen"
      },
      {
        "text": "The bump might apply to a different package (the frontEnd/wbc-ui/core2/packages/wb-flow/templates",
        "type": "gen"
      },
      {
        "text": "framework? \u2014 but that's not a versioned package).",
        "type": "gen"
      },
      {
        "text": "[NO RELEASE RECOMMENDED]",
        "type": "gen"
      },
      {
        "text": "- Without source changes in core2/packages/wb-core/, no bump.",
        "type": "gen"
      },
      {
        "text": "- Other core2 packages (wb-dataviewer, wbc-ui2-cdn, wbc-ui2):",
        "type": "gen"
      },
      {
        "text": "no commits touching their source either. No bumps.",
        "type": "gen"
      },
      {
        "text": "[OK] Dry-run analysis complete. Conclusion: no release needed today.",
        "type": "ok"
      },
      {
        "text": "[NEXT] Continue with the docs sync work; release becomes relevant",
        "type": "gen"
      },
      {
        "text": "when actual code changes accumulate.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The \"what if we did need to release\" case",
    "cmd": "/wbRelease --dry-run --prerelease",
    "logs": [
      {
        "text": "[SYSTEM] Dry run, pre-release variant.",
        "type": "sys"
      },
      {
        "text": "[SCAN] core2/packages/* \u2014 same as Pipeline A: no source changes.",
        "type": "gen"
      },
      {
        "text": "[NOTE] frontEnd/wbc-ui/core2/packages/wb-flow/templates/ is not a versioned package (no package.json with",
        "type": "gen"
      },
      {
        "text": "a version field). /wbRelease cannot version it.",
        "type": "gen"
      },
      {
        "text": "[OK] Nothing to pre-release. /wbRelease is for npm-shape packages.",
        "type": "ok"
      },
      {
        "text": "[SUGGEST] If you want to mark the docs sync as a release-worthy",
        "type": "gen"
      },
      {
        "text": "milestone, that's a /wbBroadcast operation (announce milestone)",
        "type": "gen"
      },
      {
        "text": "or a manual git tag, not /wbRelease.",
        "type": "gen"
      }
    ],
    "note": "A hypothetical: imagine the docs sync work were already committed and we wanted to tag the docs framework as a versioned artifact (it's not, but suppose). The dry-run would still say:",
    "noteType": "info"
  },
  {
    "title": "`--restore` on a clean state",
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
        "text": "[FOUND] No uncommitted version bumps in any package.json.",
        "type": "gen"
      },
      {
        "text": "[FOUND] No half-tagged state (recent commits don't include uncommitted",
        "type": "gen"
      },
      {
        "text": "version-bump indicators).",
        "type": "gen"
      },
      {
        "text": "[FOUND] CHANGELOG.md is in committed state.",
        "type": "gen"
      },
      {
        "text": "[OK] Nothing to restore. Repository is in a clean release state.",
        "type": "ok"
      },
      {
        "text": "[EXIT] 0.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The \"after I commit the docs sync, then what?\"",
    "cmd": "/wbRelease --dry-run",
    "logs": [
      {
        "text": "[SYSTEM] Dry run.",
        "type": "sys"
      },
      {
        "text": "[CHECK] Working tree clean? Yes (post-commit).",
        "type": "gen"
      },
      {
        "text": "[SCAN] git log since last tag in core2/packages/wb-core/...",
        "type": "gen"
      },
      {
        "text": "[FOUND] 6 commits including the new docs sync commit.",
        "type": "gen"
      },
      {
        "text": "[ANALYSIS]",
        "type": "gen"
      },
      {
        "text": "- 1 feat commit (ai-workflow change, not core2 source).",
        "type": "gen"
      },
      {
        "text": "- Multiple docs commits (none touch core2 source).",
        "type": "gen"
      },
      {
        "text": "- **Recommended:** No bump for any core2 package.",
        "type": "gen"
      },
      {
        "text": "[NOTICE] The new docs commit is also docs-only. /wbRelease still",
        "type": "gen"
      },
      {
        "text": "doesn't see anything that warrants a versioned release.",
        "type": "gen"
      },
      {
        "text": "[OK] No release action needed. Continue building features.",
        "type": "ok"
      }
    ],
    "note": "The user runs `/wbGit -r -e -p` first to commit the docs work, then explores release readiness:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbRelease" :pipelines="wbReleasePipelines" />


### 💠 Pipeline The dry-run that surfaces what's queued


### 💠 Pipeline The "what if we did need to release" case

A hypothetical: imagine the docs sync work were already committed and we wanted to tag the docs framework as a versioned artifact (it's not, but suppose). The dry-run would still say:


### 💠 Pipeline `--restore` on a clean state


### 💠 Pipeline The "after I commit the docs sync, then what?"

The user runs `/wbGit -r -e -p` first to commit the docs work, then explores release readiness:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbRelease` | Halt — dirty tree. |
| `/wbRelease --prerelease` | Halt — dirty tree. |
| `/wbRelease core2/packages/wb-core` | Halt — dirty tree. |
| `/wbRelease --dry-run` | Permitted; useful even with dirty tree (analyzes committed history). |
| `/wbRelease --restore` | Exit 0 — nothing to recover. |
| `/wbRelease --tag="snapshot-2026"` | Halt — dirty tree. |
| `/wbRelease frontEnd/wbc-ui/core2/packages/wb-flow/templates/` (after speculative version-field add) | Halt — `frontEnd/wbc-ui/core2/packages/wb-flow/templates/` isn't an npm-shape package. |
| Real release attempt with no commits since last tag | Halt — nothing to release. |
| Cycle in cross-package deps | Halt — version cascade undefined. |

The pattern: **`/wbRelease` is the version coordination engine and refuses to invent releases.** It's gated by clean-tree, sees only committed history, won't version non-package directories, and treats `--restore` as a no-op when there's nothing to recover. In this exact workspace today, it correctly says "no release needed" because recent commits are workflow/docs changes — not the kind of work that warrants bumping a published version.

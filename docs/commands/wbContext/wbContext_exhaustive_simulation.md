# /wbContext — Exhaustive Simulation ()

`/wbContext` is the synchronizer. Its job is to **catch the agent up on a package's current state** without requiring the user to re-explain everything every session. It produces a `context.md` (or focused variants) that captures: what the package is, what it depends on, what conventions apply, what's been recently touched, and what *not* to touch (parked tech debt, intentional non-fixes).

Read this if you want to know what `--focus` actually scopes to, why `--scope=global` is rare and intentional, and where context ends and explanation (`/wbExplain`) begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Synchronizer — produces an agent-readable state snapshot of a package. |
| **Target** | A directory (default: CWD), with optional `--focus` to narrow to a sub-system. |
| **Cell scope** | None. `/wbContext` writes to `.agents/workflows/context.md` (or focused variants), not to plan cells. |
| **Side effects allowed** | Reading code, reading `package.json`, reading vite/build configs, reading memory, writing context files. |
| **Side effects forbidden** | Editing source code, mutating plans, running tests, fetching external resources. |

The "no external fetch" rule matters: context should be reproducible from the workspace + memory alone. If a context file claims something that can't be verified by reading the workspace, the next session can't trust it. The agent's read of the package is the source of truth; external links are *cited* but not depended on.

`/wbContext` is also the only QA-group command that primarily *writes a file* as its output (versus reports, plan rows, or stdout prose). The context file is meant to be re-read by the agent on subsequent sessions.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbContext` does |
|---|---|---|
| No argument | `Command: /wbContext` | Uses CWD. Refuses if CWD is the monorepo root (too coarse) or a non-package directory. |
| Directory | `Command: /wbContext core2/packages/wb-core/` | Scopes to one package. Most common usage. |
| Free-text scope | `Command: /wbContext "the auth subsystem"` | Triggers focused mode — searches for auth-related files across packages. |
| `--focus="<topic>"` | `Command: /wbContext --focus="state management"` | Same as free-text but more explicit. Produces `context_state-management_<date>.md`. |
| `--refresh` | `Command: /wbContext --refresh` | Force re-read; ignores cached `context.md` and rebuilds from scratch. |

The "refuse at monorepo root" behavior is intentional. A `wb-labs`-wide context.md would be enormous and immediately stale; `/wbContext` insists on package-level granularity. Cross-package context is the `--scope="cross-package"` job — which is also rare and warns about staleness.

---

## 3. Flag matrix

`/wbContext` has three flags, each shaping a different axis of the output.

| Flag | Shortcut | Purpose |
|---|---|---|
| `--focus="<topic>"` | `-f` | Scopes the context file to one sub-system. Output filename includes the focus. |
| `--scope="<level>"` | `-s` | `local` (default — one package), `cross-package` (multiple packages, single concern), `global` (rare; whole monorepo, lightweight only). |
| `--refresh` | (none) | Force re-scan, ignoring cached context. |

### How `--focus` shapes the output

Without `--focus`, `/wbContext` produces a *broad* context file: package identity, dependencies, key conventions, recent activity. With `--focus`, it produces a *narrow* file scoped to that topic — and *also* writes to a different filename (`context_<focus>_<date>.md`) so the broad context.md isn't overwritten.

The two outputs are complementary, not competing. Onboarding readers get the broad file; deep-dive readers get the focused file. Both can coexist.

### How `--scope` interacts with `--focus`

| `--scope` | `--focus` | Output |
|---|---|---|
| `local` (default) | none | `context.md` for one package. |
| `local` | `auth` | `context_auth_<date>.md` scoped to auth-related code in one package. |
| `cross-package` | `auth` | Same focus, but reads auth-related code across multiple packages. Includes a warning header about staleness. |
| `global` | (any) | Lightweight only — links between packages, key entry points, top-level conventions. **Never** the full code analysis of `local` mode. |

The `global` scope is intentionally lightweight because a deep global context is wrong: it'd be 10× bigger and 10× more stale than a single-package one. Global is for "where is what" navigation, not "how does it work" understanding.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbContextSimPipelines = [
  {
    "title": "First-time context for wb-core",
    "cmd": "/wbContext core2/packages/wb-core/",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading package.json, vite.config.js, src/, tests/...",
        "type": "gen"
      },
      {
        "text": "[MEMORY] Cross-referencing memory entries:",
        "type": "ctx"
      },
      {
        "text": "- feedback_wbCode_dev_only.md (3-mode gating pattern)",
        "type": "gen"
      },
      {
        "text": "- feedback_model_selection.md (the agent/the agent declaration rule)",
        "type": "gen"
      },
      {
        "text": "- wbc-ui2-tech-debt.md (parked items affecting siblings)",
        "type": "gen"
      },
      {
        "text": "[WRITE] core2/packages/wb-core/.agents/workflows/context.md",
        "type": "gen"
      },
      {
        "text": "# Context: core2/packages/wb-core/",
        "type": "gen"
      },
      {
        "text": "## Identity",
        "type": "sys"
      },
      {
        "text": "Package: @wbc-ui2/wb-core",
        "type": "gen"
      },
      {
        "text": "Role: Core component library \u2014 exports WBCode, WBCodeSlot, WBC.js",
        "type": "gen"
      },
      {
        "text": "orchestrator, tier-enforcement utilities.",
        "type": "gen"
      },
      {
        "text": "Position in monorepo: foundational; consumed by every other core2/",
        "type": "gen"
      },
      {
        "text": "package.",
        "type": "gen"
      },
      {
        "text": "## Tech stack",
        "type": "sys"
      },
      {
        "text": "- Vue 3 (composition API)",
        "type": "gen"
      },
      {
        "text": "- Vite (dev + build)",
        "type": "gen"
      },
      {
        "text": "- Vitest (unit tests)",
        "type": "gen"
      },
      {
        "text": "- TypeScript (where present; pragmatic, not strict)",
        "type": "gen"
      },
      {
        "text": "## Dependencies",
        "type": "sys"
      },
      {
        "text": "- @wbc-ui2/* sibling packages (none \u2014 wb-core is the foundation)",
        "type": "gen"
      },
      {
        "text": "- vue ^3.4",
        "type": "gen"
      },
      {
        "text": "- (full list in package.json)",
        "type": "gen"
      },
      {
        "text": "## Conventions (from memory)",
        "type": "sys"
      },
      {
        "text": "- **Dev gating**: `__WBC_DEV__` 3-mode pattern (full / dev / hidden).",
        "type": "gen"
      },
      {
        "text": "Never expose dev-mode props to end users.",
        "type": "gen"
      },
      {
        "text": "- **wbCode rule**: every example uses `:wbCode=\"false\"` (collapsed",
        "type": "gen"
      },
      {
        "text": "by default).",
        "type": "gen"
      },
      {
        "text": "- **Model selection**: declare the agent 4 (simple) or the agent 4 (complex)",
        "type": "gen"
      },
      {
        "text": "before acting. JWT/auth work is the agent.",
        "type": "gen"
      },
      {
        "text": "## Recent activity (last 7 days)",
        "type": "sys"
      },
      {
        "text": "- 2 plan rows actively in flight (JWT handshake, renderString escape).",
        "type": "gen"
      },
      {
        "text": "- 1 row deferred (WBC.js decomposition).",
        "type": "gen"
      },
      {
        "text": "## What NOT to touch",
        "type": "sys"
      },
      {
        "text": "- WBC.js decomposition is deferred \u2014 needs architectural conversation",
        "type": "gen"
      },
      {
        "text": "before action. Do not attempt to refactor blindly.",
        "type": "gen"
      },
      {
        "text": "- Sibling package wbc-ui2-cdn has parked dist-folder mismatch",
        "type": "gen"
      },
      {
        "text": "(project_pkg_dist_mismatch.md). Don't propagate fixes here.",
        "type": "gen"
      },
      {
        "text": "## Entry points",
        "type": "sys"
      },
      {
        "text": "- src/index.js: re-exports central components",
        "type": "gen"
      },
      {
        "text": "- src/components/WBCodeSlot.vue: dev-gated slot component",
        "type": "gen"
      },
      {
        "text": "- src/tierEnforcement.js: gatekeeper for privileged ops",
        "type": "gen"
      },
      {
        "text": "[OK] Context written. /wbExplain can now produce focused",
        "type": "ok"
      },
      {
        "text": "explanations using this as the substrate.",
        "type": "gen"
      }
    ],
    "note": "A new agent session needs to come up to speed on `core2/packages/wb-core/`. No prior `context.md` exists.",
    "noteType": "info"
  },
  {
    "title": "Focused context for an active investigation",
    "cmd": "/wbContext --focus=\"dev gating __WBC_DEV__\"",
    "logs": [
      {
        "text": "[SYSTEM] Focus: dev gating __WBC_DEV__",
        "type": "sys"
      },
      {
        "text": "[SCAN] Cross-referencing __WBC_DEV__ across the workspace...",
        "type": "gen"
      },
      {
        "text": "[FOUND] 14 references in 8 files.",
        "type": "gen"
      },
      {
        "text": "[MEMORY] feedback_wbCode_dev_only.md, feedback_wbCode_rule.md",
        "type": "ctx"
      },
      {
        "text": "[WRITE] core2/packages/wb-core/.agents/workflows/context_dev-gating_<date>.md",
        "type": "gen"
      },
      {
        "text": "# Focused Context: dev gating (__WBC_DEV__)",
        "type": "gen"
      },
      {
        "text": "## The pattern (3 modes)",
        "type": "sys"
      },
      {
        "text": "- `__WBC_DEV__ === undefined` (production): wbCode UI hidden entirely.",
        "type": "gen"
      },
      {
        "text": "- `__WBC_DEV__ === false`: wbCode collapsed by default, toggle exposed.",
        "type": "gen"
      },
      {
        "text": "- `__WBC_DEV__ === true`: wbCode expanded by default, full inspector",
        "type": "gen"
      },
      {
        "text": "visible.",
        "type": "gen"
      },
      {
        "text": "## Memory rules",
        "type": "sys"
      },
      {
        "text": "- Never expose wbCode prop to end users (feedback_wbCode_dev_only.md)",
        "type": "gen"
      },
      {
        "text": "- Every example uses :wbCode=\"false\" (feedback_wbCode_rule.md)",
        "type": "gen"
      },
      {
        "text": "## Where it's read",
        "type": "sys"
      },
      {
        "text": "1. core2/packages/wb-core/src/components/WBCodeSlot.vue:14 \u2014 captured",
        "type": "gen"
      },
      {
        "text": "at setup. **Known issue:** captured-once means re-evaluation on",
        "type": "gen"
      },
      {
        "text": "__WBC_DEV__ flip requires re-mount. Consider computed for new code.",
        "type": "gen"
      },
      {
        "text": "2. core2/packages/wb-core/src/components/WBCode.vue:22 \u2014 same pattern.",
        "type": "gen"
      },
      {
        "text": "3. core2/packages/wb-dataviewer/src/WBDataViewer.vue:38 \u2014 reads but",
        "type": "gen"
      },
      {
        "text": "doesn't gate UI; gates an internal cache flag.",
        "type": "gen"
      },
      {
        "text": "... (5 more)",
        "type": "gen"
      },
      {
        "text": "## What this means for new work",
        "type": "sys"
      },
      {
        "text": "If you add a new dev-gated component, follow the 3-mode pattern.",
        "type": "gen"
      },
      {
        "text": "Don't invent a new gating mechanism. Don't expose the prop to",
        "type": "gen"
      },
      {
        "text": "end-user APIs.",
        "type": "gen"
      },
      {
        "text": "[OK] Focused context written. Don't overwrite the broad context.md;",
        "type": "ok"
      },
      {
        "text": "this file is a complement, not a replacement.",
        "type": "gen"
      }
    ],
    "note": "Mid-session, the user realizes they need a focused snapshot of \"everything related to dev gating\" before continuing:",
    "noteType": "info"
  },
  {
    "title": "The cross-package warning",
    "cmd": "/wbContext --focus=\"auth\" --scope=\"cross-package\"",
    "logs": [
      {
        "text": "[SYSTEM] Cross-package context for \"auth\".",
        "type": "sys"
      },
      {
        "text": "[WARN] Cross-package context is staleness-prone. The last edit in",
        "type": "warn"
      },
      {
        "text": "any of these files invalidates the file at write-time. Treat",
        "type": "gen"
      },
      {
        "text": "output as a snapshot, not a contract.",
        "type": "gen"
      },
      {
        "text": "[SCAN] Reading auth-relevant code across core2/packages/wb-core/,",
        "type": "gen"
      },
      {
        "text": "core2/packages/wb-dataviewer/...",
        "type": "gen"
      },
      {
        "text": "[FOUND] 6 files across 2 packages.",
        "type": "gen"
      },
      {
        "text": "[WRITE] context_auth_cross-package_<date>.md",
        "type": "gen"
      },
      {
        "text": "# Cross-Package Context: auth",
        "type": "gen"
      },
      {
        "text": "\u26a0\ufe0f STALENESS WARNING: This file was generated at <date> <time>.",
        "type": "gen"
      },
      {
        "text": "Any commit to the underlying files invalidates these claims. Re-run",
        "type": "gen"
      },
      {
        "text": "/wbContext --focus=\"auth\" --scope=\"cross-package\" --refresh if",
        "type": "gen"
      },
      {
        "text": "you've been away from the workspace for more than a few days.",
        "type": "gen"
      },
      {
        "text": "[... content ...]",
        "type": "gen"
      },
      {
        "text": "[OK] Cross-package context written. Use /wbExplain for narrative",
        "type": "ok"
      },
      {
        "text": "understanding; this file is for navigation.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbContext" titleSuffix="Exhaustive Simulation" :pipelines="wbContextSimPipelines" />


### 💠 Pipeline First-time context for wb-core

A new agent session needs to come up to speed on `core2/packages/wb-core/`. No prior `context.md` exists.


### 💠 Pipeline Focused context for an active investigation

Mid-session, the user realizes they need a focused snapshot of "everything related to dev gating" before continuing:


### 💠 Pipeline The cross-package warning

---

## 5. Edge cases & refusals

| Trigger | What `/wbContext` does |
|---|---|
| Run from monorepo root | Halt. `❌ /wbContext is package-level. Run from a package directory or pass an explicit path.` |
| Run from a non-package directory | Halt. `❌ Target has no package.json; cannot derive identity.` |
| `--scope="global"` | Permitted but produces a *lightweight* navigation file, not deep analysis. Includes warning. |
| Existing `context.md` is more recent than any code change | Warns "context appears current" and offers to skip; user can `--refresh` to force. |
| Free-text focus with no matches in workspace | Honest "no relevant code found for that focus." Suggests checking spelling or running `/wbContext` (broad) first. |
| `--focus` without a value | Halt. Empty focus is meaningless. |
| Memory contradicts derived context (e.g., code says X but memory says X is being removed) | Both surfaced. Memory's contradiction recorded as a "watch this" note in the context. |
| Multiple sub-packages within target | Refuses; asks user to pick one. Each sub-package needs its own context. |

The pattern: **`/wbContext` produces an agent-readable state snapshot scoped to package-level by default.** It refuses coarse-grained scopes that produce fragile context, refuses to invent content not verifiable from the workspace, and treats memory as a first-class input — surfacing not just *what's there* but *what's deliberately left alone*. The output is a file the next session reads; everything in it should still be true a week from now or be flagged as time-sensitive.

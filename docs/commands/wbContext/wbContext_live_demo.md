# /wbContext — Live Demo ()

What `/wbContext` would actually produce on `wb-labs` right now. The packages, conventions, and parked items below are real.

---

<CommandLiveDemoAnimation command="wbContext" />

## 1. Live target

| Field | Live value |
|---|---|
| Workspace root | `/home/wissemb11/Allprojects/wb-labs/` (not a package — would refuse direct `/wbContext`) |
| Most-mature package | `core2/packages/wb-core/` (would produce richest context) |
| Untested / parked packages | `core2/packages/wbc-ui2-cdn/`, others (per `wbc-ui2-tech-debt.md`) |
| Sibling packages | `core2/packages/wb-dataviewer/`, `core2/packages/wbc-ui2-cdn/`, `core2/packages/wbc-ui2/`, others |
| Existing context.md files | None obvious in `core2/packages/*/.agents/workflows/` (would be created on first `/wbContext` per package) |
| Memory available | 12 leaf files, including the conventions and parked-items entries |

The fourth row is the key one: the workspace has *multiple* packages, none with a current context.md. `/wbContext` is most useful at the start of a session that's going to dig into a specific package.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbContext` (from wb-labs root) | Halt. Refuses; suggests `/wbContext core2/packages/wb-core/` or similar. |
| `/wbContext core2/packages/wb-core/` | Produces full broad context. ~200 lines. |
| `/wbContext core2/packages/wbc-ui2-cdn/` | Produces context with a prominent "PARKED TECH DEBT" section per memory. |
| `/wbContext core2/packages/wb-dataviewer/` | Includes the apiResponse_ memory note + flagging the no-invalidation gap. |
| `/wbContext --focus="docs_v4_sync"` | Cross-references the transmission spec + project_docs_edition.md. Useful for the current session. |
| `/wbContext --scope="global"` | Lightweight navigation file: where each package lives, which depends on which, top-level conventions. |
| `/wbContext --focus="dev gating __WBC_DEV__" --scope="cross-package"` | Cross-references __WBC_DEV__ across all packages. Includes staleness warning. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| (no flag) | Broad context for the target package. |
| `--focus="X"` | Focused context file (`context_X_<date>.md`) alongside any existing broad context. |
| `--scope="cross-package"` | Multi-package read; staleness warning header. |
| `--scope="global"` | Lightweight; navigation only. |
| `--refresh` | Force re-scan even if existing context.md looks current. |
| `--refresh --focus="X"` | Force re-build of the focused file. |

---

## 4. Pipelines

<script setup>
const wbContextPipelines = [
  {
    "title": "First context for wb-core (the most useful invocation right now)",
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
        "text": "[MEMORY] Cross-referencing: feedback_wbCode_dev_only.md,",
        "type": "ctx"
      },
      {
        "text": "feedback_wbCode_rule.md, feedback_model_selection.md,",
        "type": "gen"
      },
      {
        "text": "wbc-ui2-tech-debt.md (sibling parked items),",
        "type": "gen"
      },
      {
        "text": "project_pkg_dist_mismatch.md (sibling parked items)",
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
        "text": "orchestrator, tier-enforcement utilities, renderString.",
        "type": "gen"
      },
      {
        "text": "Position: foundational. Consumed by every other core2/ package.",
        "type": "gen"
      },
      {
        "text": "Owner conventions: @wbc-ui2 npm ecosystem maintained by Wissem.",
        "type": "gen"
      },
      {
        "text": "## Tech stack",
        "type": "sys"
      },
      {
        "text": "- Vue 3 (composition API, no Options API in new code)",
        "type": "gen"
      },
      {
        "text": "- Vite for dev + build",
        "type": "gen"
      },
      {
        "text": "- Vitest for unit tests",
        "type": "gen"
      },
      {
        "text": "- TypeScript pragmatically; not strict-mode",
        "type": "gen"
      },
      {
        "text": "## Dependencies",
        "type": "sys"
      },
      {
        "text": "- vue ^3.4",
        "type": "gen"
      },
      {
        "text": "- (no sibling @wbc-ui2/* deps \u2014 wb-core is the foundation)",
        "type": "gen"
      },
      {
        "text": "## Conventions",
        "type": "sys"
      },
      {
        "text": "- **Dev gating**: __WBC_DEV__ 3-mode pattern (full / dev / hidden).",
        "type": "gen"
      },
      {
        "text": "Source: feedback_wbCode_dev_only.md.",
        "type": "gen"
      },
      {
        "text": "- **wbCode rule in examples**: every example uses :wbCode=\"false\"",
        "type": "gen"
      },
      {
        "text": "(collapsed by default; toggle exposed).",
        "type": "gen"
      },
      {
        "text": "Source: feedback_wbCode_rule.md.",
        "type": "gen"
      },
      {
        "text": "- **Model declaration**: the agent 4 (simple) or the agent 4 (complex)",
        "type": "gen"
      },
      {
        "text": "declared before action. JWT/auth work is the agent.",
        "type": "gen"
      },
      {
        "text": "Source: feedback_model_selection.md.",
        "type": "gen"
      },
      {
        "text": "## Active plan",
        "type": "sys"
      },
      {
        "text": "- reports/<date>/plans/plan_wb-core_20260504.md",
        "type": "gen"
      },
      {
        "text": "- Row 1: JWT handshake in tierEnforcement.js \u2014 \u2b1c",
        "type": "gen"
      },
      {
        "text": "- Row 2: renderString escape pass \u2014 \u2b1c",
        "type": "gen"
      },
      {
        "text": "- Row 3: WBC.js decomposition \u2014 \u2b1c (DAG-blocked by 1, 2)",
        "type": "gen"
      },
      {
        "text": "## Recent activity",
        "type": "sys"
      },
      {
        "text": "None this session \u2014 current work is in frontEnd/wbc-ui/core2/packages/wb-flow/templates/, not in this",
        "type": "gen"
      },
      {
        "text": "package.",
        "type": "gen"
      },
      {
        "text": "## What NOT to touch",
        "type": "sys"
      },
      {
        "text": "- WBC.js decomposition (row 3 of plan): DAG-blocked AND awaits",
        "type": "gen"
      },
      {
        "text": "architectural conversation. Don't refactor blindly.",
        "type": "gen"
      },
      {
        "text": "- Sibling packages have parked items that should NOT propagate here:",
        "type": "gen"
      },
      {
        "text": "- wbc-ui2-cdn: dist-folder mismatch (don't mirror the convention).",
        "type": "gen"
      },
      {
        "text": "- wbc-ui2: vuepress crash, untested apps (don't add untested code",
        "type": "gen"
      },
      {
        "text": "here as \"consistent\").",
        "type": "gen"
      },
      {
        "text": "## Entry points",
        "type": "sys"
      },
      {
        "text": "- src/index.js: central re-exports",
        "type": "gen"
      },
      {
        "text": "- src/components/WBCode.vue: code-display component (dev-gated)",
        "type": "gen"
      },
      {
        "text": "- src/components/WBCodeSlot.vue: slot-based variant (dev-gated)",
        "type": "gen"
      },
      {
        "text": "- src/tierEnforcement.js: gatekeeper for privileged ops",
        "type": "gen"
      },
      {
        "text": "- src/renderString.js: HTML-escape utility (subject of plan row 2)",
        "type": "gen"
      },
      {
        "text": "[OK] Context written. /wbExplain can now use this as substrate.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "A focused context for the current docs work",
    "cmd": "/wbContext --focus=\"docs_v4_sync\"",
    "logs": [
      {
        "text": "[SYSTEM] Focus: docs_v4_sync (the current session's work)",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/claude_transmission_sync_v4.md",
        "type": "gen"
      },
      {
        "text": "and project_docs_edition.md (memory)...",
        "type": "gen"
      },
      {
        "text": "[WRITE] core2/packages/wb-core/.agents/workflows/context_docs_v4_sync_<date>.md",
        "type": "gen"
      },
      {
        "text": "# Focused Context: docs v4 sync",
        "type": "gen"
      },
      {
        "text": "## The transmission spec (source of truth)",
        "type": "sys"
      },
      {
        "text": "frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/claude_transmission_sync_v4.md",
        "type": "gen"
      },
      {
        "text": "Two parts:",
        "type": "gen"
      },
      {
        "text": "- Part 1: wbGit 10-flag update + Pro Combinations + NL Pipes,",
        "type": "gen"
      },
      {
        "text": "flags_and_shortcuts update.",
        "type": "gen"
      },
      {
        "text": "- Part 2: dual-file v4 generation for 30 commands (exhaustive_simulation",
        "type": "gen"
      },
      {
        "text": "+ live_demo per command).",
        "type": "gen"
      },
      {
        "text": "## Structural rules (from project_docs_edition.md memory)",
        "type": "sys"
      },
      {
        "text": "- 33 commands \u00d7 6 reading layers",
        "type": "gen"
      },
      {
        "text": "- No hub files",
        "type": "gen"
      },
      {
        "text": "- English only (per OBJECTIVE.md \u2014 earlier FR/AR appendices were removed wholesale on 2026-05-09)",
        "type": "gen"
      },
      {
        "text": "- Voice: principle-first, terse, \"what's worth noticing\" callouts",
        "type": "gen"
      },
      {
        "text": "- File naming: <command>_<artifact>.md",
        "type": "gen"
      },
      {
        "text": "## Verification checklist (Part 2 spec)",
        "type": "sys"
      },
      {
        "text": "6 groups:",
        "type": "gen"
      },
      {
        "text": "1. Execution & QA (10): wbWork, wbValid, wbExplain, wbAudit, wbDebug,",
        "type": "gen"
      },
      {
        "text": "wbTest, wbReview, wbPlan, wbGit, wbContext",
        "type": "gen"
      },
      {
        "text": "2. Refactoring & Transformation (4): wbRefactor, wbClean, wbSecure,",
        "type": "gen"
      },
      {
        "text": "wbTranslate",
        "type": "gen"
      },
      {
        "text": "3. Deployment & Release (4): wbDeploy, wbRelease, wbPublish, wbSetup",
        "type": "gen"
      },
      {
        "text": "4. Orchestration & Workflow (4): wbTrack, wbStandup, wbNext, wbActOn",
        "type": "gen"
      },
      {
        "text": "5. Compliance & Documentation (4): wbDoc, wbLicense, wbHelp, wbCheck",
        "type": "gen"
      },
      {
        "text": "6. Special Ops & Conversion (4): wbBroadcast, wbMonetize, wbToWBC,",
        "type": "gen"
      },
      {
        "text": "wbVision",
        "type": "gen"
      },
      {
        "text": "## Current progress",
        "type": "sys"
      },
      {
        "text": "- Part 1: complete.",
        "type": "gen"
      },
      {
        "text": "- Part 2: 10 of 30 commands (Execution & QA group complete with",
        "type": "gen"
      },
      {
        "text": "this commit).",
        "type": "gen"
      },
      {
        "text": "## Open decisions",
        "type": "sys"
      },
      {
        "text": "- Whether to commit Part 2 in 6 chunks (per group) or 1 large chunk.",
        "type": "gen"
      },
      {
        "text": "- Whether to update memory project_docs_edition.md to reflect",
        "type": "gen"
      },
      {
        "text": "v4 standard at the end.",
        "type": "gen"
      },
      {
        "text": "[OK] Focused context written. Reference it before continuing",
        "type": "ok"
      },
      {
        "text": "Part 2 work.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The \"global\" navigation snapshot",
    "cmd": "/wbContext --scope=\"global\"",
    "logs": [
      {
        "text": "[SYSTEM] Global scope (lightweight). Producing navigation file only.",
        "type": "sys"
      },
      {
        "text": "[WARN] Global context is intentionally shallow. For deep",
        "type": "warn"
      },
      {
        "text": "understanding of any single package, use local scope.",
        "type": "gen"
      },
      {
        "text": "[WRITE] /home/wissemb11/Allprojects/wb-labs/.agents/workflows/context_global_<date>.md",
        "type": "gen"
      },
      {
        "text": "# Global Context: wb-labs monorepo (lightweight)",
        "type": "gen"
      },
      {
        "text": "## Top-level layout",
        "type": "sys"
      },
      {
        "text": "wb-labs/",
        "type": "gen"
      },
      {
        "text": "\u251c\u2500\u2500 core2/packages/ # @wbc-ui2 npm ecosystem (8+ packages)",
        "type": "gen"
      },
      {
        "text": "\u2502 \u251c\u2500\u2500 wb-core/ # foundation (most active)",
        "type": "gen"
      },
      {
        "text": "\u2502 \u251c\u2500\u2500 wb-dataviewer/ # apiResponse_ pattern; parked invalidation gap",
        "type": "gen"
      },
      {
        "text": "\u2502 \u251c\u2500\u2500 wbc-ui2-cdn/ # parked dist-folder mismatch",
        "type": "gen"
      },
      {
        "text": "\u2502 \u251c\u2500\u2500 wbc-ui2/ # parked items (vuepress crash, untested apps)",
        "type": "gen"
      },
      {
        "text": "\u2502 \u2514\u2500\u2500 ...",
        "type": "gen"
      },
      {
        "text": "\u251c\u2500\u2500 frontEnd/wbc-ui/ # consumer apps (legacy + current)",
        "type": "gen"
      },
      {
        "text": "\u251c\u2500\u2500 frontEnd/wbc-ui/core2/packages/wb-flow/templates/ # agentic framework docs + commands",
        "type": "gen"
      },
      {
        "text": "\u2502 \u251c\u2500\u2500 commands/ # /wb* command templates",
        "type": "gen"
      },
      {
        "text": "\u2502 \u251c\u2500\u2500 docs/docs/ # the agent-edition docs (structural source)",
        "type": "gen"
      },
      {
        "text": "\u251c\u2500\u2500 reports/ # 4D Temporal: plans, audits, reviews, etc.",
        "type": "gen"
      },
      {
        "text": "\u2502 \u2514\u2500\u2500 <YYYY>/<MM>/<DD>/",
        "type": "gen"
      },
      {
        "text": "\u2514\u2500\u2500 .claude/, .config/opencode/ # /wb* command wrappers",
        "type": "gen"
      },
      {
        "text": "## Top-level conventions",
        "type": "sys"
      },
      {
        "text": "- 4D Temporal: reports go to reports/<YYYY>/<MM>/<DD>/",
        "type": "gen"
      },
      {
        "text": "- Memory authority: /home/wissemb11/.claude/projects/-home-wissemb11-Allprojects-wb-labs/memory/",
        "type": "gen"
      },
      {
        "text": "## Active foci",
        "type": "sys"
      },
      {
        "text": "- core2/packages/wb-core: 3-row plan in flight",
        "type": "gen"
      },
      {
        "text": "- frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/docs: v4 sync in progress",
        "type": "gen"
      },
      {
        "text": "## Parked tech debt",
        "type": "sys"
      },
      {
        "text": "- core2/packages/wbc-ui2-cdn: dist-folder mismatch",
        "type": "gen"
      },
      {
        "text": "- core2/packages/wbc-ui2: vuepress crash + untested apps + cache-loader",
        "type": "gen"
      },
      {
        "text": "[OK] Global navigation written. Use local-scope /wbContext for any",
        "type": "ok"
      },
      {
        "text": "deep work in a specific package.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbContext" :pipelines="wbContextPipelines" />


### 💠 Pipeline First context for wb-core (the most useful invocation right now)


### 💠 Pipeline A focused context for the current docs work


### 💠 Pipeline The "global" navigation snapshot

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbContext` from wb-labs root | Halt. Suggests pointing at a package. |
| `/wbContext frontEnd/wbc-ui/core2/packages/wb-flow/templates/` | Halt. `frontEnd/wbc-ui/core2/packages/wb-flow/templates/` is documentation, not a package. Suggests `/wbContext --focus="docs_v4_sync"` or similar. |
| `/wbContext core2/packages/some-nonexistent/` | Halt. No package.json. |
| `/wbContext --focus=""` | Halt. Empty focus is meaningless. |
| `/wbContext core2/` | Halt — multiple packages inside. Asks user to pick one. |
| `/wbContext --scope="global"` (re-run) | Permitted; would write a fresh global file with a more recent date. |
| `/wbContext core2/packages/wb-core/` re-run with no changes since last context | Notice: "context appears current; re-running anyway with --refresh? [y/N]" |

The pattern: **`/wbContext` produces a state snapshot scoped narrowly by default and refuses coarse scopes that produce fragile output.** It cross-references memory for parked items and conventions, surfaces "what NOT to touch" as a first-class section, and treats global scope as navigation-only. The output is a file the next session reads — everything in it should still be true tomorrow or be marked as time-sensitive.

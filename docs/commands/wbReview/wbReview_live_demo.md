# /wbReview — Live Demo ()

What `/wbReview` would actually surface on `wb-labs` right now. The uncommitted state of the workspace as of the current session is large — a docs synchronization run with dozens of new files in `frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/`. That uncommitted state is the most realistic review target available.

---

<CommandLiveDemoAnimation command="wbReview" />

## 1. Live target

| Field | Live value |
|---|---|
| Uncommitted state | Many new files under `frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/` (the v4 generation in progress) plus a few modified the agent files |
| Active plan | `reports/<date>/plans/plan_wb-core_20260504.md` (3 rows, all about `wb-core` code work) |
| Closest "plan of record" for this session | `frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/claude_transmission_sync_v4.md` (the transmission spec — used as a quasi-plan) |
| What memory says about docs scope | `project_docs_edition.md` records the structural rules for docs/ |

There's an interesting tension to surface: the *active plan* is about wb-core code, but the *uncommitted work* is documentation generation. A naive review would flag every new docs file as "scope creep" against the wb-core plan. A smart review reads the transmission spec and recognizes the docs work as a separate, well-defined session.

---

## 2. What each target form would resolve to today

| Target | Live resolution |
|---|---|
| `/wbReview` (no arg) | Reviews ~17+ uncommitted .md files. Maps them against the transmission spec, not the wb-core plan. |
| `/wbReview --plan` | Strict mode against the wb-core plan → would fail every docs file as scope creep. *Wrong tool for this session.* |
| `/wbReview frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/` | Scoped review of just the new docs. Realistic. |
| `/wbReview "the docs sync"` | Refused — free-text. Suggests the path. |
| `/wbReview HEAD~1` | Reviews the last commit (`e07bb93 chore(core2): root cleanup, context integration, and daily reporting`). |

The first two cells are the most instructive. The `--plan` flag is the **wrong choice for this session** — the active plan is about a different scope. The agent surfaces this rather than mechanically running strict mode against a mismatched plan.

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| `/wbReview` (advisory) | Reviews docs files, treats `claude_transmission_sync_v4.md` as the de-facto plan, flags any divergences from its 6 verification-checklist groups. |
| `/wbReview --plan` against `plan_wb-core_20260504.md` | Halts with "this plan does not cover the current work — review this session against the transmission spec instead." |
| `/wbReview frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/ --act` | Ranked action file: which generated docs are weakest and most need revision. |
| `/wbReview frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/ --wbPlan` | Adds plan rows for revision work. *Risky here* — would flood the wb-core plan with docs-revision work. The agent surfaces this as a warning. |

That last cell is the interesting one. `--wbPlan` mutates the *active* plan, which currently covers wb-core. Adding 17 docs-revision rows to a 3-row code plan is a memory-aware misuse. The agent will produce a refuse-with-suggestion: *"The active plan is wb-core code work. Run `/wbPlan --focus="docs"` first to create a docs-specific plan, then re-run `/wbReview --wbPlan`."*

---

## 4. Pipelines

<script setup>
const wbReviewPipelines = [
  {
    "title": "Advisory review of the docs sync in progress",
    "cmd": "/wbReview frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/",
    "logs": [
      {
        "text": "[SYSTEM] Target: frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/ (uncommitted changes).",
        "type": "sys"
      },
      {
        "text": "[CONTEXT] No matching active plan (plan_wb-core_20260504.md is for code).",
        "type": "ctx"
      },
      {
        "text": "Falling back to: claude_transmission_sync_v4.md as quasi-plan.",
        "type": "gen"
      },
      {
        "text": "[MAP] Touched files \u2192 spec sections:",
        "type": "gen"
      },
      {
        "text": "commands/wbWork/{exhaustive_simulation,live_demo}.md \u2192 Part 2",
        "type": "gen"
      },
      {
        "text": "commands/wbValid/{...}.md \u2192 Part 2",
        "type": "gen"
      },
      {
        "text": "commands/wbExplain/{...}.md \u2192 Part 2",
        "type": "gen"
      },
      {
        "text": "commands/wbAudit/{...}.md \u2192 Part 2",
        "type": "gen"
      },
      {
        "text": "commands/wbDebug/{...}.md \u2192 Part 2",
        "type": "gen"
      },
      {
        "text": "commands/wbTest/{...}.md \u2192 Part 2",
        "type": "gen"
      },
      {
        "text": "commands/wbReview/{...}.md \u2192 Part 2 (THIS FILE)",
        "type": "gen"
      },
      {
        "text": "commands/wbGit/wbGit_practical.md (modified) \u2192 Part 1",
        "type": "gen"
      },
      {
        "text": "commands/wbGit/wbGit_examples.md (modified) \u2192 Part 1",
        "type": "gen"
      },
      {
        "text": "concepts/flags_and_shortcuts.md (modified) \u2192 Part 1",
        "type": "gen"
      },
      {
        "text": "## Findings (advisory)",
        "type": "sys"
      },
      {
        "text": "### 1 \u2014 Part 1 done, Part 2 in progress",
        "type": "gen"
      },
      {
        "text": "**Severity:** Informational",
        "type": "sys"
      },
      {
        "text": "**Status vs spec:** Part 1 (wbGit + flags) \u2014 complete. Part 2",
        "type": "sys"
      },
      {
        "text": "(dual-file v4) \u2014 7 of 30 commands so far (Execution & QA group",
        "type": "gen"
      },
      {
        "text": "mid-run).",
        "type": "gen"
      },
      {
        "text": "**Comment:** Progress matches spec ordering (QA group declared first",
        "type": "sys"
      },
      {
        "text": "in section 3 verification checklist). No drift.",
        "type": "gen"
      },
      {
        "text": "### 2 \u2014 wbGit dual files not yet generated",
        "type": "gen"
      },
      {
        "text": "**Severity:** P2",
        "type": "sys"
      },
      {
        "text": "**Files missing:** commands/wbGit/wbGit_exhaustive_simulation.md",
        "type": "sys"
      },
      {
        "text": "commands/wbGit/wbGit_live_demo.md",
        "type": "gen"
      },
      {
        "text": "**Why:** Spec Part 2 verification checklist lists wbGit in the",
        "type": "sys"
      },
      {
        "text": "Execution & QA group. The two updated wbGit files (practical,",
        "type": "gen"
      },
      {
        "text": "examples) are Part 1 artifacts, not Part 2.",
        "type": "gen"
      },
      {
        "text": "**Recommendation:** Don't skip these. They belong in this batch.",
        "type": "sys"
      },
      {
        "text": "### 3 \u2014 flags_and_shortcuts.md edits look right",
        "type": "gen"
      },
      {
        "text": "**Severity:** \u2705 pass",
        "type": "sys"
      },
      {
        "text": "**Comment:** Rule 5 added (`-L` mnemonic). wbGit row updated to",
        "type": "sys"
      },
      {
        "text": "10 flags. Matches spec Part 1 section 3.",
        "type": "gen"
      },
      {
        "text": "[OK] 3 findings, advisory. 1 informational, 1 P2 actionable, 1 pass.",
        "type": "ok"
      },
      {
        "text": "[OK] No mutation. Mid-session review \u2014 keep going.",
        "type": "ok"
      }
    ],
    "note": "Running `/wbReview` against the live uncommitted state right now:",
    "noteType": "info"
  },
  {
    "title": "The misuse the agent should refuse",
    "cmd": "/wbReview --plan",
    "logs": [
      {
        "text": "[SYSTEM] Target: uncommitted changes.",
        "type": "sys"
      },
      {
        "text": "[MODE] strict \u2014 would gate on any finding.",
        "type": "gen"
      },
      {
        "text": "[REFUSE] The active plan (plan_wb-core_20260504.md) does not cover",
        "type": "error"
      },
      {
        "text": "the current work (docs generation).",
        "type": "gen"
      },
      {
        "text": "[REASON] Strict mode against a mismatched plan would fail every",
        "type": "gen"
      },
      {
        "text": "touched file as scope creep, producing a misleading verdict.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] Two paths:",
        "type": "gen"
      },
      {
        "text": "1. Advisory review against the transmission spec (no flag):",
        "type": "gen"
      },
      {
        "text": "/wbReview frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/",
        "type": "gen"
      },
      {
        "text": "2. Create a matching plan first:",
        "type": "gen"
      },
      {
        "text": "/wbPlan --focus=\"docs_v4_sync\"",
        "type": "gen"
      },
      {
        "text": "Then: /wbReview --plan",
        "type": "gen"
      }
    ],
    "note": "A user, mid-session, runs `/wbReview --plan` thinking it'll gate the docs work:",
    "noteType": "info"
  },
  {
    "title": "Reviewing the last committed change",
    "cmd": "/wbReview HEAD~1",
    "logs": [
      {
        "text": "[SYSTEM] Target: commit e07bb93 (chore(core2): root cleanup, context",
        "type": "sys"
      },
      {
        "text": "integration, and daily reporting).",
        "type": "gen"
      },
      {
        "text": "[MAP] Touched files \u2192 ... (commit body lists scope)",
        "type": "gen"
      },
      {
        "text": "[MODE] advisory (no --plan flag).",
        "type": "gen"
      },
      {
        "text": "## Findings",
        "type": "sys"
      },
      {
        "text": "### 1 \u2014 Commit body describes \"context integration\" but no `.agents/`",
        "type": "gen"
      },
      {
        "text": "changes are visible",
        "type": "gen"
      },
      {
        "text": "**Severity:** P3 (informational)",
        "type": "sys"
      },
      {
        "text": "**Why:** The body claims context integration as one of three changes.",
        "type": "sys"
      },
      {
        "text": "The diff includes root cleanup and daily reporting, but no",
        "type": "gen"
      },
      {
        "text": "`.agents/` or `context.md` updates I can locate.",
        "type": "gen"
      },
      {
        "text": "**Recommendation:** Either the context integration happened in a",
        "type": "sys"
      },
      {
        "text": "sibling commit, or the body overpromises. Worth a quick check",
        "type": "gen"
      },
      {
        "text": "before relying on this commit's message in audits.",
        "type": "gen"
      },
      {
        "text": "### 2 \u2014 Daily reporting structure aligns with reports/<YYYY>/<MM>/<DD>",
        "type": "gen"
      },
      {
        "text": "**Severity:** \u2705 pass",
        "type": "sys"
      },
      {
        "text": "**Comment:** New report files follow the 4D Temporal Navigation",
        "type": "sys"
      },
      {
        "text": "convention. Consistent with the rest of the codebase.",
        "type": "gen"
      },
      {
        "text": "[OK] 2 findings on this commit. 1 pass, 1 informational.",
        "type": "ok"
      },
      {
        "text": "[OK] No mutation; reviewing a committed change is read-only.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbReview" :pipelines="wbReviewPipelines" />


### 💠 Pipeline Advisory review of the docs sync in progress

Running `/wbReview` against the live uncommitted state right now:


### 💠 Pipeline The misuse the agent should refuse

A user, mid-session, runs `/wbReview --plan` thinking it'll gate the docs work:


### 💠 Pipeline Reviewing the last committed change

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbReview` with no uncommitted changes and no commit ref | Halt. `❌ Nothing to review.` |
| `/wbReview "the docs work"` | Refused with disambiguation; suggests the path. |
| `/wbReview --plan` against the wrong plan | Refuses with explanation; suggests advisory mode or making a matching plan first. |
| `/wbReview --plan --wbPlan` mutating into a mismatched plan | Refuses with same logic; suggests `/wbPlan --focus=...` first. |
| `/wbReview` on a diff that's only generated files | One-line notice. Skips generated files. |
| `/wbReview` on the docs corpus, repeatedly within a session | Each run re-evaluates against current uncommitted state. No state cached. |

The pattern: **`/wbReview` is a plan-aware critic and refuses to run strict mode against the wrong plan.** It reads the active plan, compares to the transmission spec when one exists, and surfaces drift advisorily by default. When `--plan` is misused (mismatched scope), it refuses with a constructive next step. The chaining flags (`--act`, `--wbPlan`) become useful only after the right plan is in place — until then, the advisory output is the negotiation surface.

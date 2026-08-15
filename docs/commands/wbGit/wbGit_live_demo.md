# /wbGit — Live Demo ()

What `/wbGit` would actually do on `wb-labs` in the live state of the workspace right now. The git state, branch, and uncommitted file count below are real.

---

<CommandLiveDemoAnimation command="wbGit" />

## 1. Live target

| Field | Live value |
|---|---|
| Git branch | `main` (also the default base for PRs) |
| Recent commits | `e07bb93 chore(core2): root cleanup`, `d3c4abd feat(ai-workflow): standardise 4D tracking and implement /wbExplain`, `a8a3cf0 docs(agents)` |
| Uncommitted state | Many new files in `frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/` (the v4 sync); modified the agent files; some untracked files in `.understand-anything/` |
| Active plan | `reports/<date>/plans/plan_wb-core_20260504.md` (3 rows, none `✅ Done`) |
| Memory rule | "Never use git commands" — memory `feedback_no_git.md`. `/wbGit` is the single exception. |

**The implication for `--from-plan`:** the active plan has zero `✅ Done` rows. Running `/wbGit -P` right now would honestly report "no done rows" rather than fabricate a commit body. The relevant flag for this session is `-r` (scan-recent), since the docs work is the actual delta.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbGit` | Reads current diff. Would refuse as "mixed change" — docs sync touches multiple sub-areas (commands/, concepts/). Would propose splitting or override. |
| `/wbGit -P` | Honest "0 ✅ Done rows in active plan." Suggests `-r` instead. |
| `/wbGit -r` | Scans files modified in last 2h. Would draft a `docs(claude):` message reflecting the v4 sync. |
| `/wbGit -L` | Captures the active Understand-Anything graph URL if running. Embeds in provenance notes. |
| `/wbGit -A` | Refuses — current HEAD is `e07bb93`, already pushed (or assumed pushed for safety). Would require `-F` to amend. |
| `/wbGit "commit as mixed change" -e` | Forces `chore:` prefix. Would commit the entire current diff with explicit acknowledgment. |
| `/wbGit -e -p` (no info-extraction flag) | Drafts from current diff, gates through add → commit → push. Refused as mixed change unless overridden. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| `-r` | Cross-references files modified in last 2h. Captures the docs/ generation perfectly — produces a coherent docs commit body. |
| `-r -L` | Same + embeds graph URL if dashboard is up. |
| `-r -i="DOCS-V4"` | Same + appends `Refs: DOCS-V4` footer. |
| `-r -e -p` | Drafts → gates through add → commit → push. Three confirmation prompts. |
| `-A` | Refuses — last commit considered pushed. |
| `-F` (alone) | Refuses — main is the default branch and treated as protected by convention. |
| `-n` | Halts with explicit override required. |

---

## 4. Pipelines

<script setup>
const wbGitPipelines = [
  {
    "title": "The right way to commit this session's docs work",
    "cmd": "/wbGit -r",
    "logs": [
      {
        "text": "[SYSTEM] Scanning files modified in last 2 hours...",
        "type": "sys"
      },
      {
        "text": "[FOUND] 17 new files in frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/commands/",
        "type": "gen"
      },
      {
        "text": "3 modified files (wbGit_practical, wbGit_examples, flags_and_shortcuts)",
        "type": "gen"
      },
      {
        "text": "[ANALYZE] All changes are documentation. Sub-area: docs v4 sync.",
        "type": "gen"
      },
      {
        "text": "[GENERATE] Drafting message...",
        "type": "gen"
      },
      {
        "text": "docs(claude): generate v4 dual-file documentation for QA group",
        "type": "gen"
      },
      {
        "text": "<!-- wbGit",
        "type": "gen"
      },
      {
        "text": "date: <date> <time>",
        "type": "gen"
      },
      {
        "text": "model: claude-opus-4-7",
        "type": "gen"
      },
      {
        "text": "session: claude",
        "type": "gen"
      },
      {
        "text": "plan: \u2014",
        "type": "gen"
      },
      {
        "text": "notes: Part 1 (wbGit + flags) and Part 2 (QA group dual files)",
        "type": "gen"
      },
      {
        "text": "per frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/claude_transmission_sync_v4.md",
        "type": "gen"
      },
      {
        "text": "-->",
        "type": "gen"
      },
      {
        "text": "Part 1 \u2014 wbGit pro combinations and flags update:",
        "type": "gen"
      },
      {
        "text": "- Update wbGit_practical.md with 10-flag surface, Pro Combinations,",
        "type": "gen"
      },
      {
        "text": "Natural-Language Pipes",
        "type": "gen"
      },
      {
        "text": "- Update wbGit_examples.md with six high-level v4 scenarios",
        "type": "gen"
      },
      {
        "text": "- Update concepts/flags_and_shortcuts.md (10-flag wbGit row,",
        "type": "gen"
      },
      {
        "text": "Rule 5 for -L mnemonic)",
        "type": "gen"
      },
      {
        "text": "Part 2 \u2014 QA group dual-file generation (10 of 30 commands):",
        "type": "gen"
      },
      {
        "text": "- wbWork, wbValid, wbExplain, wbAudit, wbDebug, wbTest, wbReview,",
        "type": "gen"
      },
      {
        "text": "wbPlan, wbGit, wbContext: each with exhaustive_simulation +",
        "type": "gen"
      },
      {
        "text": "live_demo files",
        "type": "gen"
      },
      {
        "text": "[NO EXECUTION] Print only. Add -e to commit. Add -p for push.",
        "type": "gen"
      }
    ],
    "note": "The current session has produced ~17 new docs files. The plan-driven path doesn't apply (no `\u2705` rows). The recent-scan path is the right tool:",
    "noteType": "info"
  },
  {
    "title": "The mixed-change refusal in this exact workspace",
    "cmd": "/wbGit",
    "logs": [
      {
        "text": "[SYSTEM] git status + diff analysis:",
        "type": "sys"
      },
      {
        "text": "Group A (16 files): frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/commands/",
        "type": "gen"
      },
      {
        "text": "\u2192 docs: dual-file v4 generation",
        "type": "gen"
      },
      {
        "text": "Group B (3 files): frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/commands/wbGit/, concepts/",
        "type": "gen"
      },
      {
        "text": "\u2192 docs: wbGit + flags Part 1 update",
        "type": "gen"
      },
      {
        "text": "Group C (untracked): frontEnd/wbc-ui/core2/packages/wb-flow/templates/.understand-anything/",
        "type": "gen"
      },
      {
        "text": "\u2192 unknown content; possibly tooling artifact",
        "type": "gen"
      },
      {
        "text": "[FLAG] Group C is untracked and the description \".understand-anything/\"",
        "type": "gen"
      },
      {
        "text": "suggests tooling output, not source. Likely .gitignore candidate",
        "type": "gen"
      },
      {
        "text": "rather than commit material.",
        "type": "gen"
      },
      {
        "text": "[QUESTION] Should I:",
        "type": "gen"
      },
      {
        "text": "(a) Commit only A + B as \"docs(claude): v4 sync\" (same scope, clean message)",
        "type": "gen"
      },
      {
        "text": "(b) Commit A + B + C and accept the mix",
        "type": "gen"
      },
      {
        "text": "(c) Show me each candidate file in C before deciding",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Waiting for direction.",
        "type": "gen"
      }
    ],
    "note": "If the diff *also* included an untracked file in `.understand-anything/` (as the live state shows), a naive `/wbGit` (no flag) would catch it:",
    "noteType": "info"
  },
  {
    "title": "The Pro chain, scoped tightly",
    "cmd": "/wbGit \"commit just the wbGit and flags edits, defer the rest\"",
    "logs": [
      {
        "text": "[NL] Subset commit detected. Will stage only:",
        "type": "gen"
      },
      {
        "text": "- frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/commands/wbGit/wbGit_practical.md",
        "type": "gen"
      },
      {
        "text": "- frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/commands/wbGit/wbGit_examples.md",
        "type": "gen"
      },
      {
        "text": "- frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/concepts/flags_and_shortcuts.md",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Stage these 3 files only? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "docs(claude): wbGit 10-flag pro combinations and flags shortcut grammar",
        "type": "gen"
      },
      {
        "text": "<!-- wbGit ... notes: Part 1 of v4 sync per claude_transmission_sync_v4.md -->",
        "type": "gen"
      },
      {
        "text": "- wbGit_practical: 10-flag surface, Pro Combinations table,",
        "type": "gen"
      },
      {
        "text": "Natural-Language Pipes table",
        "type": "gen"
      },
      {
        "text": "- wbGit_examples: six high-level v4 scenarios prepended to existing",
        "type": "gen"
      },
      {
        "text": "transcripts",
        "type": "gen"
      },
      {
        "text": "- flags_and_shortcuts: wbGit row updated to 10 flags;",
        "type": "gen"
      },
      {
        "text": "Rule 5 added for -L mnemonic",
        "type": "gen"
      },
      {
        "text": "[GATE 1: add] [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[GATE 2: commit] [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[OK] Commit b2c3d4e created. Part 2 work remains uncommitted for later.",
        "type": "ok"
      }
    ],
    "note": "If the user wants to commit *just* the Part 1 (wbGit + flags) edits and leave the Part 2 dual files for a later commit, the current `/wbGit` doesn't have a \"stage subset\" flag \u2014 but the workflow handles it through CSV-style targeting at the message level:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbGit" :pipelines="wbGitPipelines" />


### 💠 Pipeline The right way to commit this session's docs work

The current session has produced ~17 new docs files. The plan-driven path doesn't apply (no `✅` rows). The recent-scan path is the right tool:


### 💠 Pipeline The mixed-change refusal in this exact workspace

If the diff *also* included an untracked file in `.understand-anything/` (as the live state shows), a naive `/wbGit` (no flag) would catch it:


### 💠 Pipeline The Pro chain, scoped tightly

If the user wants to commit *just* the Part 1 (wbGit + flags) edits and leave the Part 2 dual files for a later commit, the current `/wbGit` doesn't have a "stage subset" flag — but the workflow handles it through CSV-style targeting at the message level:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbGit -P` | Honest "0 ✅ Done rows." Suggests `-r`. |
| `/wbGit -A` | Refuses — last commit is treated as pushed. Override path: `/wbGit -A -F` with two confirmations. |
| `/wbGit -F` (alone) | Refuses unconditionally — main is protected. |
| `/wbGit -n` | Halts; explicit override required. |
| `/wbGit -e -p` (no flag) | Refuses on mixed change unless first split or overridden. |
| `/wbGit "delete last commit"` via NL | Refuses. Destructive ops need explicit git knowledge from the user. |
| `/wbGit` with no diff at all | Honest "nothing to commit." |
| `/wbGit -d="missing.diff"` | Halt — patch file not found. |

The pattern: **`/wbGit` is the single git command in this system, with multiple confirmation gates and a strong refusal posture.** It refuses to bundle silently, refuses to skip hooks, refuses to amend pushed commits, refuses to force-push to protected branches. Every override is explicit and recorded in the provenance header. In this exact workspace right now — main branch, large uncommitted docs sync, no `✅` plan rows — the right invocation is `/wbGit -r -e -p` (or split via NL), and the wrong one is `/wbGit -P` (would correctly produce nothing).

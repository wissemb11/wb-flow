# /wbActOn — Exhaustive Simulation ()

`/wbActOn` is the triage officer. It takes a diagnostic document (an audit, plan, review, standup, or any structured markdown) and converts it into a ranked execution order. The central design principle: **annotate, never author.** `/wbActOn` doesn't invent findings — it reads the source, applies a 5-color decision tree to every section, and produces an ordered thread of what to do first.

Read this if you want to know how the 5-color system works, why the `--wbPlan` flag exists separately from `/wbPlan`, and what "Smart Merge" means when multiple models triage the same source.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Triage Officer. Ranks and annotates; never invents. |
| **Target** | Any markdown file — typically a `/wb*` report output, but works on third-party docs, design memos, competitor analyses. |
| **Cell scope** | None. `/wbActOn` never touches plan cells or source code. |
| **Side effects allowed** | Writing the action file. With `--wbPlan`: also writing a companion plan file. |
| **Side effects forbidden** | Modifying the source document. Editing code. Mutating plan state. |

The "annotate, never author" rule is the hardest constraint. When the source says "there's a caching bug," `/wbActOn` annotates it with `🔴 /wbDebug "apiResponse_ cache invalidation"` — it doesn't describe the bug itself, and it doesn't propose a fix. It points to the command that *would* fix it. The user decides whether to follow.

---

## 2. Argument resolution

| Form | Example | What `/wbActOn` does |
|---|---|---|
| File path (under reports/) | `Command: /wbActOn audit_wb-core_20260504.md` | **Mirror mode.** Reads the audit, writes action file to the same target's `reports/<date>/actions/`. |
| File path (elsewhere) | `Command: /wbActOn competitor_analysis.md` | **Side-car mode.** Anchors to monorepo root: `core2/.agents/workflows/reports/<date>/actions/`. |
| Folder path | `Command: /wbActOn packages/wb-core` | **Pick mode.** Lists recent `*.md` under the folder's `reports/`, asks which to process. If only one exists, proceeds without asking. |

The three modes are detected from input type, not from a flag. File → process directly. Folder → pick from candidates. This keeps the invocation simple while handling the common case (act on the latest audit) and the edge case (act on an arbitrary document).

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--act` | `-a` | On upstream commands (`/wbAudit`, `/wbReview`, `/wbStandup`): chain the command's output through `/wbActOn` automatically. |
| `--wbPlan` | `-P` | Also produce a companion plan file with one task table per 🔵 finding. |

The flags are **independent and composable**:

| Combination | Result |
|---|---|
| `/wbAudit packages/wb-core` | Audit only |
| `/wbAudit packages/wb-core --act` | Audit + action file |
| `/wbAudit packages/wb-core --wbPlan` | Audit + plan file |
| `/wbAudit packages/wb-core --act --wbPlan` | Audit + action + plan (chain of three) |

Why both flags instead of one? `--act` alone is the cheap path — triage without committing to a multi-section plan. `--wbPlan` alone skips triage when you already know what needs planning. Together is the full chain. The separation matches how work actually flows: sometimes you just want to prioritize, sometimes you want a plan, sometimes both.

---

## 4. The 5-color decision tree

This is the core engine. For every finding in the source, `/wbActOn` walks this tree:

| Decision | Color | Output |
|---|---|---|
| Console is red? (error, failing build) | 🔴 | `/wbDebug "<exact error message>"` |
| Work fits one sentence? | 🟢 | Exact one-shot prompt to paste |
| File-level mess? (>1000 LOC, dead code) | 🟡 | `/wbClean <pkg>` then `/wbRefactor <file>` |
| Strategic/business decision? | 🟣 | No command. Human decides; agent advises. |
| Multi-step coordinated work? | 🔵 | `/wbPlan <target>` with goal/constraints/scope |

Each color also carries a **recommended model**:

| Color | Default model | Why |
|---|---|---|
| 🟢 (simple) | the agent 4 / Qwen3 Coder | Fast, cheap, sufficient |
| 🟢 (subtle) | the agent 4 | Correctness on tricky one-liners |
| 🔴 | the agent 4 | Root-cause analysis needs reasoning |
| 🟡 (sweep) | Qwen3 Coder / the agent Flash | Repetitive, high-throughput |
| 🟡 (refactor) | the agent 4 | Cross-file judgment |
| 🟣 | the agent 4 / the AI agent | Long-form synthesis |
| 🔵 | the agent 4 | Coordination + dependency reasoning |

The recommendation is advisory — the user can override. But it's always stated explicitly. "You decide" is not acceptable.

---

## 5. Pipelines (the agent-native scenarios)

<script setup>
const wbActOnSimPipelines = [
  {
    "title": "Post-audit triage on wb-core",
    "cmd": "/wbActOn audit_wb-core_20260504.md",
    "logs": [
      {
        "text": "[SYSTEM] Ingesting audit_wb-core_20260504.md...",
        "type": "sys"
      },
      {
        "text": "[TYPE] Detected: audit (from filename + headers).",
        "type": "gen"
      },
      {
        "text": "[INVENTORY] 23 findings across 8 sections. 4 tables, 12 prose blocks.",
        "type": "gen"
      },
      {
        "text": "# 7. If I Were At Your Place \u2014 Action Walkthrough for wb-core",
        "type": "gen"
      },
      {
        "text": "## \ud83d\udea6 \u00a70 \u2014 If I Were You: The Execution Order",
        "type": "sys"
      },
      {
        "text": "| Rank | Finding | Color | Time Window | Recommended Model |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 1\ufe0f\u20e3 | tierEnforcement.js \u2014 `alg: \"none\"` bypass | \ud83d\udd34 | TODAY | the agent 4 |",
        "type": "sys"
      },
      {
        "text": "| 2\ufe0f\u20e3 | renderString XSS vector | \ud83d\udd34 | TODAY | the agent 4 |",
        "type": "sys"
      },
      {
        "text": "| 3\ufe0f\u20e3 | Dead handlers in WBC.js | \ud83d\udfe1 | THIS WEEK | Qwen3 Coder |",
        "type": "sys"
      },
      {
        "text": "| 4\ufe0f\u20e3 | dist-folder mismatch in wbc-ui2-cdn | \ud83d\udd35 | THIS WEEK | the agent 4 |",
        "type": "sys"
      },
      {
        "text": "| 5\ufe0f\u20e3 | apiResponse_ cache scope review | \ud83d\udfe3 | THIS MONTH | the agent 4 |",
        "type": "sys"
      },
      {
        "text": "...",
        "type": "gen"
      },
      {
        "text": "### What I would NOT touch",
        "type": "gen"
      },
      {
        "text": "- wb-press2 VuePress integration (explicitly accepted as-is)",
        "type": "gen"
      },
      {
        "text": "- __WBC_DEV__ 3-mode gating (working, no symptoms)",
        "type": "gen"
      },
      {
        "text": "### 60-second mental model",
        "type": "gen"
      },
      {
        "text": "Rank 1-2 (today) \u2192 STOP THE BLEEDING \u2192 ~3 hours",
        "type": "gen"
      },
      {
        "text": "Rank 3-4 (this week) \u2192 CLEAR THE TABLE \u2192 ~6 hours",
        "type": "gen"
      },
      {
        "text": "Rank 5 (this month) \u2192 ONE BIG THING \u2192 pick one",
        "type": "gen"
      },
      {
        "text": "Rank 6-23 (later) \u2192 ONLY IF AHEAD OF PLAN \u2192 defer freely",
        "type": "gen"
      }
    ],
    "note": "The canonical use case. `/wbAudit` produced 23 findings. Now rank them:",
    "noteType": "info"
  },
  {
    "title": "Chained audit with plan generation",
    "cmd": "/wbAudit packages/wb-core --act --wbPlan",
    "logs": [
      {
        "text": "[CHAIN 1/3] /wbAudit... audit_wb-core_20260505.md created.",
        "type": "gen"
      },
      {
        "text": "[CHAIN 2/3] /wbActOn... action_wb-core_20260505.md created.",
        "type": "gen"
      },
      {
        "text": "[CHAIN 3/3] --wbPlan... Extracting \ud83d\udd35 findings...",
        "type": "gen"
      },
      {
        "text": "# Plan \u2014 wb-core (recommended by the AI agent)",
        "type": "gen"
      },
      {
        "text": "## Plan \u00a71 \u2014 dist-folder mismatch resolution",
        "type": "sys"
      },
      {
        "text": "| Task # | Task | Worker Model | Validator Model | \u2610 Done | \u2610 Valid |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 1 | Audit current dist/ structure | the agent 4 | the agent Flash | \u2b1c | \u2b1c |",
        "type": "sys"
      },
      {
        "text": "| 2 | Align package.json \"files\" field | the agent 4 | the agent 4 | \u2b1c | \u2b1c |",
        "type": "sys"
      },
      {
        "text": "| 3 | Verify CDN consumers post-fix | the agent Flash | the agent 4 | \u2b1c | \u2b1c |",
        "type": "sys"
      }
    ],
    "note": "The full chain: audit \u2192 triage \u2192 plan, in one invocation:",
    "noteType": "info"
  },
  {
    "title": "Multi-model Smart Merge",
    "cmd": "/wbActOn audit_wb-core_20260505.md",
    "logs": [
      {
        "text": "(run by the AI agent, 4 hours after the AI agent)",
        "type": "gen"
      },
      {
        "text": "[SYSTEM] action_wb-core_20260505.md already exists (Entry #1 by the AI agent).",
        "type": "sys"
      },
      {
        "text": "[MERGE] Reading existing entries...",
        "type": "gen"
      },
      {
        "text": "[MERGE] Matching findings:",
        "type": "gen"
      },
      {
        "text": "- \"tierEnforcement.js bypass\" \u2192 match (same file, same function)",
        "type": "gen"
      },
      {
        "text": "- \"dist-folder mismatch\" \u2192 match (same package ref)",
        "type": "gen"
      },
      {
        "text": "- \"apiResponse_ cache scope\" \u2192 match (token overlap 85%)",
        "type": "gen"
      },
      {
        "text": "- NEW: \"docs edition gap\" \u2192 no match, adding.",
        "type": "gen"
      },
      {
        "text": "[CONSENSUS TABLE]",
        "type": "gen"
      },
      {
        "text": "| # | Finding | Confidence | Models | Consensus Color |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 1 | tierEnforcement.js bypass | \ud83d\udfe2 2/2 | the AI agent, the AI agent | \ud83d\udd34 |",
        "type": "sys"
      },
      {
        "text": "| 2 | dist-folder mismatch | \ud83d\udfe1 1/2 | the agent: \ud83d\udd35, the agent: \ud83d\udfe1 | \ud83d\udd35 (more actionable wins) |",
        "type": "sys"
      },
      {
        "text": "| 3 | docs edition gap | \u2014 | the agent only | \ud83d\udfe2 |",
        "type": "sys"
      },
      {
        "text": "> *Merged by the AI agent \u2014 18:30 \u2014 3 duplicates enriched, 1 new finding added*",
        "type": "gen"
      }
    ],
    "note": "Two models triage the same source. The second model's run triggers Smart Merge:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbActOn" titleSuffix="Exhaustive Simulation" :pipelines="wbActOnSimPipelines" />


### 💠 Pipeline Post-audit triage on wb-core

The canonical use case. `/wbAudit` produced 23 findings. Now rank them:


### 💠 Pipeline Chained audit with plan generation

The full chain: audit → triage → plan, in one invocation:


### 💠 Pipeline Multi-model Smart Merge

Two models triage the same source. The second model's run triggers Smart Merge:

---

## 6. Edge cases & refusals

| Trigger | What `/wbActOn` does |
|---|---|
| Source has no structure (free-form notes) | Halt. `❌ Cannot triage unstructured content. Fix the source — /wbActOn needs sections, tables, or numbered items.` |
| Source has no actionable findings (pure state report) | §0 says: `ℹ️ No actions — this is a state snapshot. Use it as input to a future command.` |
| `--wbPlan` but zero 🔵 findings | `ℹ️ No multi-step findings to plan. All actions are inline (🟢) or immediate (🔴/🟡).` |
| Callout says "you should refactor this" without the command | Self-correction: always include the exact prompt or `/wb*` command. A callout without a pasteable command violates the hard rules. |
| Source explicitly says something is working and shouldn't be touched | "What I would NOT touch" section lists it. Prevents reactive over-refactoring. |
| `/wbActOn plan_wb-core_20260504.md --wbPlan` | `❌ Error: source is already a plan. Use --act alone to re-rank it.` |

The unifying principle: **`/wbActOn` is the theory-to-practice bridge.** It takes a diagnostic document and produces an execution order. It never invents findings, never modifies the source, always justifies the rank, and always states which model should do the work. The user acts on the output — the triage officer just sets the priorities.

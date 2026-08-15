# /wbActOn — Live Demo ()

This is what `/wbActOn` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](./wbActOn_exhaustive_simulation), but every cell is filled from the *live* state of the repo — real audit findings, real model recommendations, real memory items.

---

<CommandLiveDemoAnimation command="wbActOn" />

## 1. Live target

| Field | Live value |
|---|---|
| Most recent audit | `packages/wb-core/.agents/workflows/reports/2026/05/04/audits/audit_wb-core_20260504.md` |
| Audit findings | 23 items across 8 sections |
| Active triage model | the AI agent via Antigravity |
| Existing action files | None for today (would be Entry #1) |
| Parked memory items | `project_pkg_dist_mismatch.md`, `project_wbdataviewer_apiResponse.md`, `project_docs_edition.md` |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbActOn audit_wb-core_20260504.md` | Mirror mode. Reads the audit, writes action to `reports/2026/05/05/actions/action_wb-core_20260505.md`. |
| `/wbActOn packages/wb-core` | Pick mode. Lists recent reports → finds the 20260504 audit → asks to confirm. |
| `/wbActOn competitor_analysis.md` | Side-car mode. Anchors to `core2/.agents/workflows/reports/2026/05/05/actions/`. |
| `/wbAudit packages/wb-core --act` | Chained: runs a fresh audit *then* pipes it through `/wbActOn`. |

---

## 3. Per-flag behavior, applied live

| Flag | If invoked now |
|---|---|
| `/wbActOn audit_wb-core_20260504.md` | Creates action file (Entry #1). §0 ranked thread + per-section annotations. |
| `/wbActOn audit_wb-core_20260504.md --wbPlan` | Action file + companion plan with task tables for each 🔵 finding. |
| `/wbAudit packages/wb-core --act --wbPlan` | Fresh audit → action → plan. Three files in one invocation. |

---

## 4. Pipelines on this exact workspace

<script setup>
const actonPipelines = [
  {
    title: "Pipeline A — Triage yesterday's audit",
    cmd: "/wbActOn audit_wb-core_20260504.md",
    logs: [
      { text: "[SYSTEM] Ingesting audit_wb-core_20260504.md...", type: "sys" },
      { text: "[TYPE] Audit (23 findings, 8 sections).", type: "sys" },
      { text: "[CHECK] action_wb-core_20260505.md → does not exist. Creating Entry #1.", type: "ok" },
      { text: "[WROTE] reports/2026/05/05/actions/action_wb-core_20260505.md", type: "ok" }
    ],
    tableHeaders: ["Rank", "Finding", "Color", "Time", "Model", "Justification"],
    table: [
      { cells: ["1️⃣", "tierEnforcement.js alg: \"none\" bypass", "🔴", "TODAY", "the agent 4", "Security — any JWT with \"none\" alg passes the gate"], _cssClass: "error" },
      { cells: ["2️⃣", "renderString XSS vector", "🔴", "TODAY", "the agent 4", "Input sanitization — user-facing risk"], _cssClass: "error" },
      { cells: ["3️⃣", "Dead handlers in WBC.js (3 unused)", "🟡", "THIS WEEK", "Qwen3 Coder", "Clean sweep, low risk"], _cssClass: "deferred" },
      { cells: ["4️⃣", "dist-folder mismatch in wbc-ui2-cdn", "🔵", "THIS WEEK", "the agent 4", "Multi-step — package.json + CDN consumers"], _cssClass: "carried" }
    ],
    note: "Focus on ranks 1-2 today. ROI estimate: Today's 2 ranks move the audit security score from ~60 → ~85 with ~3 hours of effort.",
    noteType: "info"
  },
  {
    title: "Pipeline B — Full chain with plan generation",
    cmd: "/wbAudit packages/wb-core --act --wbPlan",
    logs: [
      { text: "[CHAIN 1/3] /wbAudit...", type: "gen" },
      { text: "[WROTE] reports/2026/05/05/audits/audit_wb-core_20260505.md", type: "ok" },
      { text: "[CHAIN 2/3] /wbActOn (internal)...", type: "gen" },
      { text: "[WROTE] reports/2026/05/05/actions/action_wb-core_20260505.md", type: "ok" },
      { text: "[CHAIN 3/3] --wbPlan...", type: "gen" },
      { text: "[EXTRACT] 6 🔵 findings from action file.", type: "sys" },
      { text: "[WROTE] reports/2026/05/05/plans/plan_wb-core_20260505.md", type: "ok" }
    ],
    tableHeaders: ["Task #", "Task", "Worker", "Validator", "Done", "Valid"],
    table: [
      { cells: ["1", "Map current dist/ vs package.json", "the agent 4", "Flash", "⬜", "⬜"] },
      { cells: ["2", "Fix package.json \"files\" field", "the agent 4", "the agent 4", "⬜", "⬜"] },
      { cells: ["3", "Verify wbc-ui2-cdn consumers post-fix", "Flash", "the agent 4", "⬜", "⬜"] }
    ],
    note: "Fresh audit → action → plan. Three files in one invocation.",
    noteType: "warning"
  },
  {
    title: "Pipeline C — Second model Smart Merges",
    cmd: "/wbActOn audit_wb-core_20260505.md",
    logs: [
      { text: "(run by the AI agent, 6 hours after the agent)", type: "sys" },
      { text: "[SYSTEM] action_wb-core_20260505.md exists (Entry #1 by the AI agent).", type: "sys" },
      { text: "[MERGE] Reading Entry #1...", type: "gen" },
      { text: "[MERGE] 21/23 findings match. 2 new findings from the agent.", type: "ok" }
    ],
    note: "Merged by the AI agent — 20:15 — 21 duplicates enriched, 2 new findings",
    noteType: "info"
  }
];
</script>

<LiveDemoAnimation command="wbActOn" :pipelines="actonPipelines" />

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbActOn` with no argument | `❌ Provide a file or folder path.` |
| `/wbActOn freeform_notes.txt` (unstructured) | `❌ Cannot triage unstructured content. Source needs sections, tables, or numbered items.` |
| `/wbActOn plan_wb-core_20260504.md --wbPlan` | `❌ Source is already a plan. Use --act alone to re-rank.` |
| Callout without pasteable command | Self-correction violation. Every annotation must include the exact `/wb*` command or one-shot prompt. |
| `/wbActOn` on a pure context.md | `ℹ️ No actions — this is a state snapshot. Use it as input to /wbAudit or /wbPlan, not as a task list.` |

The pattern: **`/wbActOn` converts diagnosis into execution order.** It's the bridge between "what's wrong" (audit/review/standup) and "what to do about it" (/wbWork, /wbDebug, /wbPlan). It never invents, always annotates, and always tells you which model should do the work.

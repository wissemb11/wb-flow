# /wbAudit — Live Demo ()

What `/wbAudit` would actually surface on `wb-labs` today (2026-05-04). Targets, citations, and severity levels in this matrix are real for the workspace as it stands.

---

<CommandLiveDemoAnimation command="wbAudit" />

## 1. Live target

| Field | Live value |
|---|---|
| Most-audited package recently | `core2/packages/wbc-ui2-cdn/` (parked tech debt) |
| Most-recently-edited tree | `frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/` (this docs sync) |
| Active plan | `reports/20260504/plans/plan_wb-core_20260504.md` |
| Memory-flagged audit candidates | `core2/packages/*/package.json` (dist-folder mismatch); `core2/packages/wb-dataviewer/` (apiResponse_ pattern documented but no invalidation API) |

The audit-worthy zones in this workspace are concentrated in `core2/`, not in `frontEnd/wbc-ui/core2/packages/wb-flow/templates/`. Documentation drift is `/wbReview` territory; structural code debt is `/wbAudit`'s.

---

## 2. What each target form would resolve to today

| Target | Live resolution |
|---|---|
| `core2/packages/wbc-ui2-cdn/` | 14 files. Will surface the dist-folder mismatch + at least one cache-loader concern (per `wbc-ui2-tech-debt.md` memory). |
| `core2/packages/wb-core/` | ~22 files. Tightest surface in core2. |
| `core2/packages/wb-dataviewer/` | ~18 files. Will surface the `apiResponse_` no-invalidation note. |
| `"core2/packages/*/package.json"` | 9 files (per package). Tight scope; perfect for the dist-mismatch profile. |
| `"frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/"` | Refused — `/wbAudit` is for code, not docs. Suggestion to use `/wbReview` instead. |
| `"the auth path"` | 3+ candidates (wb-core/tierEnforcement.js, wbc-ui2-cdn login flow, hypothetical wbc-ui.com). Halts with disambiguation. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| `core2/packages/wb-core/ --profile="security"` | ~3-5 findings expected. tierEnforcement.js + token-handling code. |
| `core2/packages/wb-core/ --profile="performance"` | ~1-2 findings. wb-core is small; perf surface is shallow. |
| `core2/packages/wbc-ui2-cdn/ --profile="correctness"` | 1 P1 guaranteed (dist mismatch) + likely 2-3 more from build-config drift. |
| `core2/packages/ --scope="cross-package"` | Refused — too broad. Halt with "run per-package audits and stack findings." |
| `core2/packages/wb-dataviewer/ -p="correctness" --act` | Audit + ranked action file. Action file would suggest: document apiResponse_ key scope; consider invalidation API. |
| `core2/packages/wbc-ui2-cdn/ -p="correctness" --wbPlan` | Refused for now — memory note `project_pkg_dist_mismatch.md` says this is *parked*, not unresolved. Auditing would just re-surface the parked decision. |

That last cell is the interesting one. The agent reads memory before adding plan rows. If the memory note records "this is parked, both fixes have downsides," the audit emits the finding but **declines to add a plan row** — because the row would be ignored or cancelled within a day. Memory-aware refusal.

---

## 4. Pipelines on this exact workspace

<script setup>
const auditPipelines = [
  {
    title: "Pipeline A — Informational Audit",
    cmd: '/wbAudit core2/packages/wbc-ui2-cdn/ --profile="correctness"',
    file: "audit_wbc-ui2-cdn_correctness_20260504.md",
    logs: [
      { text: "[SYSTEM] Target: core2/packages/wbc-ui2-cdn/", type: "sys" },
      { text: "[PROFILE] correctness", type: "sys" },
      { text: "[MEMORY] Note found: project_pkg_dist_mismatch.md (parked tech debt). Will cite but not auto-promote to plan rows.", type: "ctx" },
      { text: "[SCAN] 14 files inspected.", type: "gen" },
      { text: "## Finding 1 — main field points at non-existent dist/", type: "error" },
      { text: "**Severity:** P1\n**File:** core2/packages/wbc-ui2-cdn/package.json:6\n**Symbol:** \"main\"\n**Citation:** \"main\": \"./dist/index.js\"\n**Evidence:**\n- core2/packages/wbc-ui2-cdn/vite.config.js:18 sets build.outDir=\"dist-dev\"\n- ls core2/packages/wbc-ui2-cdn/dist/ → does not exist\n- ls core2/packages/wbc-ui2-cdn/dist-dev/index.js → exists, 47KB", type: "sys" },
      { text: "**Memory cross-reference:** project_pkg_dist_mismatch.md records this as a known mismatch parked because both candidate fixes have unresolved trade-offs. Do not auto-fix.", type: "ctx" },
      { text: "## Finding 2 — cache-loader still referenced post-restructure", type: "warn" },
      { text: "**Severity:** P2\n**File:** core2/packages/wbc-ui2-cdn/vite.config.js:31", type: "sys" },
      { text: "[OK] 3 findings. 0 promoted to plan (memory-aware skip).", type: "ok" },
      { text: "[OK] Report saved: reports/20260504/audits/audit_wbc-ui2-cdn_correctness_20260504.md", type: "ok" }
    ],
    note: "The 'memory-aware skip' is what makes this agent-native. The audit finds the problems but defers mutating the plan because the memory record says these are parked.",
    noteType: "info"
  },
  {
    title: "Pipeline B — Audit + Action File (--act)",
    cmd: '/wbAudit core2/packages/wb-core/ --profile="security" --act',
    file: "action_wb-core_security_20260504.md",
    logs: [
      { text: "[SYSTEM] Target: core2/packages/wb-core/", type: "sys" },
      { text: "[PROFILE] security", type: "sys" },
      { text: "[SCAN] 22 files. 2 findings (1 P0, 1 P1).", type: "warn" },
      { text: "[CHAIN] --act: producing ranked action file.", type: "gen" },
      { text: "## Findings summary\nP0 — tierEnforcement.js:42 — JWT verify accepts `alg:\"none\"`.\nP1 — fetcher.js:87 — token persisted to localStorage.", type: "error" },
      { text: "[OK] Action file is a *draft* of plan rows. Promote with: /wbAudit core2/packages/wb-core/ --profile=\"security\" --wbPlan", type: "ok" }
    ],
    tableHeaders: ["Rank", "Finding", "Severity", "Effort", "Recommended next"],
    table: [
      { cells: ["1", "Add alg denylist", "P0", "S (10 lines)", "Promote to plan row immediately."], _cssClass: "error" },
      { cells: ["2", "localStorage → httpOnly cookie", "P1", "M (cross-cutting refactor)", "Discuss before promoting; affects all consumers."], _cssClass: "deferred" }
    ],
    note: "The two-stage funnel (audit → action file → plan rows) exists because not every finding deserves a plan row. The action file is the negotiation layer.",
    noteType: "warning"
  },
  {
    title: "Pipeline C — Refusal (Wrong Scope)",
    cmd: "/wbAudit frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/",
    logs: [
      { text: "[SYSTEM] Target: frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/", type: "sys" },
      { text: "[REFUSE] /wbAudit is for code, not documentation.\n Documentation drift, voice consistency, structural parity → use /wbReview --plan instead.", type: "error" },
      { text: "[SUGGEST] Try: /wbReview frontEnd/wbc-ui/core2/apps/wb-flow/flow.wbc-ui.com/ --plan", type: "ok" }
    ],
    note: "This refusal exists because audit profiles (security, performance) are categorically wrong for prose. The refusal is more honest than the attempt.",
    noteType: "warning"
  }
];
</script>

<LiveDemoAnimation command="wbAudit" :pipelines="auditPipelines" />

### 💠 Pipeline A — Audit the wbc-ui2-cdn dist-folder mismatch (informational only)

By running `/wbAudit` without mutating flags, the agent inspects the code but checks `.wb/memory` first. If memory flags tech debt as "parked," it surfaces the finding but **skips adding it to the plan**, preventing noisy rows that get instantly cancelled.

### 💠 Pipeline B — Audit + action file before deciding to plan

Using `--act` creates a safer workflow: it produces a ranked Markdown action file (a draft of plan rows). You review this file and decide which findings deserve immediate promotion via `--wbPlan`.

### 💠 Pipeline C — Why `/wbAudit` won't audit the docs

`/wbAudit` profiles (`security`, `performance`, `correctness`) are built for ASTs and code execution, not prose. Attempting to run it on documentation automatically halts with a suggestion to use `/wbReview --plan` instead.

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbAudit` with no target | Halt. Selector-required. |
| `/wbAudit core2/` (whole monorepo) | Halt. >200 files; refuse and ask for narrower scope. |
| `/wbAudit "the auth path"` | Halt with disambiguation: 3+ matches across packages. |
| `/wbAudit core2/packages/wb-core/ --profile="security" --profile="performance"` | Halt — conflicting profiles. (The agent rejects rather than picks one.) |
| `/wbAudit core2/packages/wbc-ui2-cdn/ --wbPlan` | Memory-aware partial refusal — runs the audit, prints findings, **does not** add plan rows because memory records the work as parked. |
| Audit of `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/` | Refused. Wrong tool; suggests `/wbReview`. |
| Audit triggers on `dist-dev/` build output | Skipped silently. Auto-gen files are excluded. |

The pattern: **`/wbAudit` is opinionated, evidence-based, and memory-aware.** It refuses to spread thin, refuses to invent unsourced findings, refuses to mutate the plan when memory says doing so wastes effort. The right output is a citable report that respects what the team has already decided to leave alone.

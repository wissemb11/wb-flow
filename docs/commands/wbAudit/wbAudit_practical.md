# wbAudit — Practical Walkthrough

> Step-by-step guide to auditing a project, interpreting findings, and acting on results.

---

## 1. Basic Audit

```bash
/wbAudit packages/my-project
```

The command scans the folder and produces a report:

```text
[AI] Reading .wb/workflows/context.md...
[AI] Scanning 47 source files...
[AI]
[AI] === Audit Report: my-project ===
[AI] Score: 7/10
[AI]
[AI] Findings:
[AI]   F1. [HIGH] No unit tests (0% coverage)
[AI]   F2. [MEDIUM] 3 unused exports in src/utils.js
[AI]   F3. [LOW] Missing "description" in package.json
```

---

## 2. Choosing a Profile

```bash
# Default — architecture and structure
/wbAudit packages/my-project

# Security focus
/wbAudit packages/my-project --profile=security

# Performance focus
/wbAudit packages/my-project --profile=performance
```

Each profile scans different aspects:

| Profile | Looks For |
|---|---|
| Architecture | Missing files, unused exports, dependency issues, structure |
| Security | Exposed secrets, unvalidated inputs, vulnerable deps |
| Performance | Bundle size, render cycles, lazy loading, memory |

---

## 3. Reading the Report

The report is saved to `.wb/workflows/reports/YYYY/MM/DD/audits/`:

```
reports/2026/05/11/audits/audit_my-project_20260511.md
```

**Key sections to check:**
1. **Score** — overall health (10 = perfect, 1 = critical issues)
2. **Findings table** — each issue with severity and fix recommendation
3. **Recommendations** — prioritized action list

---

## 4. Acting on Findings

After reviewing the audit, the natural next step is to create a plan:

```bash
# Generate a plan from audit findings
/wbPlan packages/my-project
```

The planner reads the most recent audit report and creates tasks to address each finding. Alternatively, create a plan directly from the audit:

```bash
/wbAudit packages/my-project --plan
```

This runs the audit AND generates a plan in one step.

---

## 5. Re-Auditing After Fixes

After completing plan tasks, re-audit to measure improvement:

```bash
/wbAudit packages/my-project
```

The new report shows delta comparisons:

```text
[AI] Score: 9/10 (was 7/10 on 2026-05-10)
[AI]   F1. [RESOLVED] Unit tests added (85% coverage)
[AI]   F2. [RESOLVED] Unused exports removed
[AI]   F3. [LOW] Missing "description" — still open
```

---

## 6. Common Patterns

| Pattern | Command |
|---|---|
| Quick health check | `/wbAudit .` |
| Pre-release audit | `/wbAudit packages/my-lib --profile=security` |
| Audit + auto-plan | `/wbAudit packages/my-lib --plan` |
| Re-audit after fixes | `/wbAudit packages/my-lib` (shows deltas) |
| Dry-run (no file writes) | `/wbAudit packages/my-lib --dry-run` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

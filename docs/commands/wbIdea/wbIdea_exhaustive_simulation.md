# /wbIdea — Exhaustive Simulation

This document provides a comprehensive operational breakdown of `/wbIdea`, the engine driving the wb-flow Ideas Pipeline. It details argument resolution, flag interactions, and edge-case handling logic.

---

## 1. Operational Parameters

| Parameter | Specification |
|---|---|
| **Designation** | The Ideator — Responsible for capturing, scoring, and staging concepts. |
| **Valid Targets** | Package paths, specific folders, or direct paths to existing `idea_*.md` artifacts. |
| **Execution Scope** | Strictly constrained. `/wbIdea` operates entirely within the `.wb/workflows/reports/` architecture. |
| **Permitted Actions** | Creation and modification of `idea_*.md` files. Execution of the Promotion Protocol into `plan_*.md`. |
| **Restricted Actions** | Direct modification of source code. Execution of plan tasks. |

---

## 2. Argument Resolution Matrix

| Invocation | Target | System Action |
|---|---|---|
| `/wbIdea apps/saas-dashboard` | Folder Path | Contextual scan resulting in the generation of 3-5 newly scored ideas. |
| `/wbIdea apps/saas-dashboard --task="Add MFA"` | Folder Path + Flag | Direct registration of a manual idea, accompanied by an AI-calculated score. |
| `/wbIdea apps/saas-dashboard --resume` | Folder Path + Flag | Locates today's idea file, recalculates scores against current context, and normalizes formatting. |
| `/wbIdea apps/saas-dashboard --id=3 --promote` | Folder Path + Flags | Bypasses standard validation and immediately executes the Promotion Protocol for Idea #3. |
| `/wbIdea apps/saas-dashboard --id=1,2 --reject` | Folder Path + Flags | Applies the `🚫 Rejected` verdict to Ideas #1 and #2. |
| `/wbIdea apps/saas-dashboard --id=4 --defer` | Folder Path + Flags | Applies the `⏸️ Deferred` verdict to Idea #4. |
| `/wbIdea idea_saas-dashboard_20260508.md` | Direct File | Engages Self-Correct Mode: Audits the file structure, heals broken links, and synchronizes states. |

---

## 3. Flag Infrastructure

| Flag | Shortcut | Operational Effect |
|---|---|---|
| `--task="<string>"` | `-t` | Injects a specific, human-defined idea into the pipeline. |
| `--resume` | `-r` | Triggers a re-evaluation of the active idea artifact. |
| `--id=<X,Y>` | `-i` | Targets specific row indices within the idea matrix. |
| `--promote` | `-p` | Administrative override to instantly elevate an idea to a plan task. |
| `--reject` | `-x` | Designates an idea as permanently unviable. |
| `--defer` | `-d` | Designates an idea as temporarily unviable. |
| `--scope` | `-s` | Overrides standard contextual scope detection. |

---

## 4. Pipeline Execution Protocols

### Protocol Alpha: Autonomous Ideation

```text
> Input: /wbIdea apps/metrics-api

[SYSTEM] Initializing context graph...
[SYSTEM] Scanning active dependencies and recent execution reports...
[EVALUATION] Applying heuristic (Impact × 0.4 + Feasibility × 0.3 + Urgency × 0.3)

[OUTPUT] Generated 3 strategic propositions:
  Index 1: [Score 8] Implement GraphQL endpoint for bulk metric retrieval
  Index 2: [Score 6] Add Redis caching layer to /v1/stats
  Index 3: [Score 4] Refactor logging middleware

[WRITE] Artifact idea_metrics-api_20260508.md created successfully.
```

### Protocol Beta: The Promotion Engine

```text
> Input: /wbIdea apps/metrics-api --id=1 --promote

[SYSTEM] Validating Idea #1 status... (Score: 8, Current Verdict: ⬜)
[EXECUTE] Forcing verdict state to: 🎯 Promoted 8/10
[ROUTING] Locating active execution plan: plan_metrics-api_20260508.md
[INGEST] Appending Idea #1 to the plan matrix as Task #5.
[LINK] Establishing bidirectional trace: → Task = [→ Plan #5](../plans/plan_metrics-api_20260508.md)

[SUCCESS] Promotion Protocol finalized.
```

### Protocol Gamma: Self-Correction

```text
> Input: /wbIdea idea_metrics-api_20260508.md

[SYSTEM] Target verified as Idea Artifact. Engaging Self-Correct routines...
[AUDIT] Analyzing 3 active rows...
[CORRECTION] Idea #2: Exploration report detected at /ideas_reports/idea_2/, but ☐ Done state is ⬜. Healing state to ✅.
[CORRECTION] Idea #3: Context shift detected. Recalculating score from 4 to 3 based on newly reduced urgency.
[WRITE] Modifications committed. Self-correction complete.
```

---

## 5. Constraint & Refusal Logic

The system is designed with strict guardrails to maintain pipeline integrity.

| Trigger Condition | System Response |
|---|---|
| `context.md` is missing | Proceeds with a warning: "Context absent. Output quality degraded. Recommend running `/wbSetup`." |
| `--promote` invoked on an idea already linked to a plan | Halts execution: "Redundant action. Idea #N is already linked to Plan #M." |
| `--promote` invoked on a `🚫 Rejected` idea | Refuses execution: "Policy violation. Idea #N holds a Rejected verdict. Use `--open` to reset state prior to promotion." |
| Target index (`--id=99`) exceeds matrix bounds | Halts execution: "Index out of bounds. Matrix contains 3 active rows." |
| `--resume` invoked without an existing `idea_*.md` file | Gracefully falls back to Protocol Alpha (Autonomous Ideation), generating a fresh artifact. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wb-flow — Visual Overview & Animated Walkthrough

> A visual tour of wb-flow: how it bootstraps, how it schedules parallel multi-agent waves, and how it guards against model failures.

---

## 1. The Core Demo

wb-flow turns AI coding into a planned, parallel, validated, and traceable engineering workflow.

![wb-flow demo](../assets/hero.gif)
*wb-flow demo: interactive planning and parallel execution*

### The Core Engineering Ladder
```
Plan ➔ Decompose ➔ Parallelize ➔ Execute ➔ Validate ➔ Trace
```

- **The Five-Layer Stack:**
  - **Composable planning:** Structured definition and decomposition of tasks.
  - **`--as` cognition:** Pre-flight explanations and step-by-step blueprints.
  - **Waves:** Orchestrated, parallel execution scheduling.
  - **Artifact graph:** A concrete trail of evidence connecting requirement to validation.
  - **Model routing:** Dispatching the right model for the right job.

- **Verbs Over Personas:**
  We orchestrate *what* needs to happen (plan, execute, validate), not *who* does it. The command *is* the contract.

---

## 2. Interactive Installation & Assistant Wiring

`wb-flow init` detects installed coding assistants, configures model rosters, and writes native wrapper commands.

![npm install → wb-flow init → agent detection → wiring complete](../assets/InstallationAnimation.gif)
*One command detects your agents (Claude Code, OpenCode, Gemini CLI, Antigravity, Cursor) and wires templates automatically.*

---

## 3. The First Workflow Loop

Developer ↔ AI Assistant ↔ wb-flow core working across the plan/execute/validate cycle:

![Your first workflow: Developer ↔ AI assistant ↔ wb-flow core](../assets/FirstWorkflowAnimation.gif)
*Full cycle: `/wbSetup` → `/wbPlan` → `/wbWork` → `/wbValid`, traced to files on disk.*

---

## 4. Local Error Guarding & Fallback Failovers

Every background cell spawned by `wb-flow wave` runs through `wbRun`, intercepting stdout/stderr for API quotas, model errors, or exit 0 failures.

![A model fallback chain failing over when a provider hits its quota](../assets/FallbackFailoverAnimation.gif)
*When a provider hits rate limits or quota, wb-flow automatically advances along the fallback chain.*

### The Three-Gate Verdict Contract

Every cell dispatched by `wb-flow wave` is classified by three gates — never by output text:

| Gate | Question | Signal |
|---|---|---|
| **1 · Infra** | Did the agent run at all? | CLI exit code, plus anchored fatal patterns (`^Error: Model not found`, quota) |
| **2 · Artifact** | Did it write what it was required to write? | `tasks/task_<ID>/task_<ID>_report_*.md` exists |
| **3 · Oracle** | Does the task's own `Verify` command pass? | `exit 0` |

| G1 | G2 | G3 | Verdict | Done box |
|:---:|:---:|:---:|---|:---:|
| ✗ | — | — | **INFRA** — never ran | `⬜` |
| ✓ | ✗ | — | **NO-OP** — ran, produced nothing | `⬜` |
| ✓ | ✓ | ✗ | **ATTEMPTED** — needs a validator | `⬜` |
| ✓ | ✓ | ✓ | **DONE** | `✅` |

---

## 📚 Related References

* **[README.md](../README.md)** — Quick start & landing page
* **[Full Documentation](README.md)** — All 33 commands and patterns
* **[Architecture](architecture.md)** — Core components & CLI dispatcher flow

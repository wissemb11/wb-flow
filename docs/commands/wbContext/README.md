# /wbContext — Command Hub

`/wbContext` reads actual source code — `package.json`, entry points, configs — to produce accurate, code-aware `context.md` files that describe a folder's identity, dependencies, and rules. It is the foundational command for establishing agent awareness: before any planning or execution, the agent needs to understand what the folder is, what it depends on, and what conventions it follows.

## 🎯 Strategic Position

Every agent session starts from zero context. Without `/wbContext`, the agent guesses — and guesses wrong about framework versions, package boundaries, and local conventions. With it, the first minute of every session loads a verified, code-derived understanding of the package.

- **Start of a fresh AI session** — load the current package's identity.
- **After pulling changes** — surface drift between stored understanding and current code.
- **Before touching a complex subsystem** — generate a focused sidecar.
- **Monthly sanity check** — monorepo-wide survey to catch stale context.
- **After rewriting a lot of a package** — re-run, don't `/wbSetup`.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Standard** | `/wbContext <path>` | Per-package context report (identity, dependencies, constraints) |
| **Focused** | `/wbContext <path> --focus="<subsystem>"` | Standard context + focused sidecar on one subsystem |
| **Global survey** | `/wbContext <monorepo-root>/ --scope=global` | Monorepo-wide context survey |

## ✅ What a useful context report contains

1. **Baseline load** — age of stored `context.md` / `dev.md`. Flagged if >30 days on an active package.
2. **Drift report** — what changed between stored understanding and current code.
3. **Questions** — if drift requires a decision (e.g., "did you rename this on purpose?"), the AI asks before updating.
4. **Recent report ingestion** — audits and debug reports surfaced into working memory.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Create context for a brand-new package | [`/wbSetup`](../wbSetup/README.md) |
| Plan or execute work | [`/wbPlan`](../wbPlan/README.md) |
| Modify source code | Read-only — it only reads and documents |
| Show what others have been doing | [`/wbStandup`](../wbStandup/README.md) |
| Verify release-readiness | [`/wbAudit`](../wbAudit/README.md) |

## 📚 Reading Order

1. **[ELI5](wbContext_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbContext_practical.md)** — step-by-step context generation walkthrough.
3. **[Expert](wbContext_expert.md)** — drift detection, stale-baseline flagging, and answer-key management.
4. **[Examples](wbContext_examples.md)** — annotated context report transcripts.
5. **[Exhaustive simulation](wbContext_exhaustive_simulation.md)** · **[Live demo](wbContext_live_demo.md)**.

## 🔗 Related

- [`wbContext.md`](wbContext.md) — the command reference this hub orients you around.
- [`/wbSetup`](../wbSetup/README.md) — initializes a brand-new package (create from scratch).
- [`/wbPlan`](../wbPlan/README.md) — plan work after understanding context.
- [`/wbNext`](../wbNext/README.md) — ranked next actions after context is established.

## Quick Reference

```bash
/wbContext packages/wb-core                         # standard per-package context
/wbContext packages/wb-core --focus="src/auth"      # focused subsystem sidecar
/wbContext . --scope=global                         # monorepo-wide survey
```

---
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

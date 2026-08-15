# /wbClean — Command Hub

`/wbClean` scans a package for unused exports, orphan files, stale reports, dead code, and forgotten dev artifacts. It produces a cleanup report grouped by confidence — but it never deletes. The two-step discipline (detect, then remove) prevents silent loss of code the AI misclassified.

## 🎯 Strategic Position

Dead code accumulates silently. Every `console.log` left in production, every commented-out block from three weeks ago, every file with zero import references — they each cost a reader a moment of confusion. `/wbClean` surfaces that entropy so you can delete it intentionally, not accidentally.

- **End of day / end of a work session** — catches what you left behind while still fresh.
- **Before `/wbAudit`** — clean first, then audit the clean result.
- **Before `/wbRelease`** — confirm no debug code leaking to npm.
- **After inheriting a package** — baseline the debt.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Standard scan** | `/wbClean <pkg-or-app>` | Cleanup report grouped by priority |
| **Preview** | `--dry-run` | Shows what would be deleted without touching anything |

## ✅ What a useful clean report contains

1. **Forgotten dev artifacts** — `console.log`, `debugger`, `TODO: hack` comments. HIGH confidence.
2. **Dead files** — 0 import references detected. MEDIUM confidence (could be dynamic).
3. **Unused imports** — imported, never referenced. HIGH confidence.
4. **Commented-out blocks** — still there from weeks ago. MEDIUM confidence.
5. **TODOs** — informational, not a delete candidate.
6. **"What this clean did NOT check"** — declaring coverage gaps.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Refactor live code | [`/wbRefactor`](../wbRefactor/README.md) |
| Audit code quality or design flaws | [`/wbAudit`](../wbAudit/README.md) |
| Delete files without confirmation | Two-step: the report surfaces candidates; you approve deletion separately |
| Find a specific bug | [`/wbDebug`](../wbDebug/README.md) |
| Verify release-readiness | [`/wbAudit`](../wbAudit/README.md) |

## 📚 Reading Order

1. **[ELI5](wbClean_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbClean_practical.md)** — step-by-step cleanup walkthrough.
3. **[Expert](wbClean_expert.md)** — confidence levels, dynamic imports, and edge cases.
4. **[Examples](wbClean_examples.md)** — annotated cleanup transcripts.
5. **[Exhaustive simulation](wbClean_exhaustive_simulation.md)** · **[Live demo](wbClean_live_demo.md)**.

## 🔗 Related

- [`wbClean.md`](wbClean.md) — the command reference this hub orients you around.
- [`/wbAudit`](../wbAudit/README.md) — finds design flaws, not debris.
- [`/wbRefactor`](../wbRefactor/README.md) — restructures live code without changing behaviour.
- [`/wbPlan`](../wbPlan/README.md) — generate a safe execution matrix for deletions.

## Quick Reference

```bash
/wbClean packages/wb-dataviewer     # scan a package for entropy
wbClean --dry-run                    # preview what would be deleted

```

---
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wbRefactor — Practical Walkthrough

> Step-by-step guide to analyzing code for refactoring opportunities and executing safe changes.

---

## 1. Analyze a Package

```bash
/wbRefactor packages/my-lib
```

```text
[AI] Scanning packages/my-lib (47 files)...
[AI]
[AI] Refactoring opportunities:
[AI]   1. [SAFE] src/utils.js: processData() is 85 lines — extract helper
[AI]   2. [SAFE] src/store.js: 3 duplicated validation blocks — extract
[AI]   3. [MEDIUM] src/api.js: move to shared package (used by 2 consumers)
[AI]
[AI] Risk: MEDIUM (65% test coverage, 3 consumers)
[AI] Writing: refactor_my-lib_20260511.md
```

---

## 2. Review the Plan

Open the refactoring plan and review each step:

| Step | Risk | Change |
|---|---|---|
| 1 | SAFE | Extract `validateInput()` from `processData()` |
| 2 | SAFE | Deduplicate validation into `validate.js` |
| 3 | MEDIUM | Move `api.js` to `packages/shared/` |

---

## 3. Execute via /wbWork

```bash
# Convert to executable plan
/wbPlan packages/my-lib --ingest refactor_my-lib_20260511.md

# Execute step by step (safest approach)
/wbWork plan_*.md --task=1   # SAFE — extract helper
/wbWork plan_*.md --task=2   # SAFE — deduplicate
/wbWork plan_*.md --task=3   # MEDIUM — move file (review carefully)
```

---

## 4. Validate After Refactoring

```bash
/wbValid plan_*.md --task=*    # validate all steps
/wbTest packages/my-lib        # run tests to confirm behavior preserved
/wbAudit packages/my-lib       # re-audit for score improvement
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Quick analysis | `/wbRefactor .` |
| Safe-only changes | `/wbRefactor . --risk=safe` |
| Single file focus | `/wbRefactor src/utils.js` |
| Full cycle | `/wbRefactor .` → `/wbPlan --ingest` → `/wbWork` → `/wbTest` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

---
title: "wbAudit — Examples"
description: "If the audit report says \"everything looks good\" on the first pass, the audit is lying."
---

# /wbAudit — Examples

> Self-help. `/wbAudit` is the command you run before shipping. This file shows what a *useful* audit looks like vs. what a rubber-stamp audit looks like, and how to tell the difference.

---

## The core rule for using /wbAudit

**If the audit report says "everything looks good" on the first pass, the audit is lying.** Not because your code is bad — because default-LLM agreeableness overpowers the "be critical" framing. Always follow up with: *"harsher. Assume this is going to a paying customer who hates this codebase."*

---

## Example 1 — `/wbAudit packages/wb-core` (folder audit, pre-release)

The big one. Run this before `/wbRelease`.

```text
$ /wbAudit packages/wb-core

[AI] Loading context.md + dev.md for wb-core...
[AI] Loading monorepo_rules.md...
[AI] Scanning reports/20260418..20260423/ for prior audits of this pkg...
[AI] → 1 audit 2026-04-15 (score: 7.0/10)
[AI] → 2 issues flagged there: extractSubObject test gap, dist-dev leak
[AI]
[AI] Evaluating against Pro-tier standards...
[AI] Writing reports/20260423/audits/audit_wb-core_202604231900.md:
```

```markdown
# Audit: @wbc/wb-core (2026-04-23)

## Score: 6.5 / 10 — SHIP WITH CAVEATS

## Findings, ranked by severity

### 1. [BLOCKER] dist/ vs dist-dev/ mismatch persists
package.json main: "dist/index.js"
vite.config.js outDir: "dist-dev/"
Consumers will fail to resolve if dist-dev is the current build.
**Status**: unresolved since 2026-04-15 audit.
**Fix**: align before /wbRelease. Dev.md rule exists; enforce it.

### 2. [MAJOR] extractSubObject test coverage incomplete
Array-handling branch untested (leaves vs structural decision
is open, so tests can't be committed, but current branch has
a coverage cliff at line 47).
**Fix**: either close the decision or mark the test as
intentionally pending with an xit() + TODO.

### 3. [MAJOR] WBCode and WBC.js __WBC_DEV__ gating has subtle divergence
WBC.js uses: if (__WBC_DEV__ === true)
WBCode.vue uses: if (__WBC_DEV__)
Behaviorally identical for bools, not for truthy non-bools.
Dev.md says the pattern must be identical. It isn't.
**Fix**: standardize on the stricter === true check.

### 4. [MINOR] No JSDoc on extractSubObject
Function has 4 call sites across the monorepo. Signature stability
matters. JSDoc would act as a contract.

### 5. [MINOR] README references a "WBCodeSlot" export that doesn't exist
Looks like a planned-but-not-shipped feature leaked into docs.
**Fix**: remove from README or add the export (see plan_wbCodeSlot).

## What this audit did NOT check
- Performance. Run /wbTest with --profile for that.
- Security. Run /wbReview --security for that.
- Bundle size. No tooling hooked up in wb-core for this.

## Recommendation
Do not /wbRelease until #1 and #3 are resolved. #2 can ship as
known debt if tracked. #4 and #5 are polish; don't block on them.
```

```text
[AI] Audit complete. Score: 6.5/10. 2 blockers for release.
[AI] Resume with: /wbPlan packages/wb-core --task="fix audit blockers"
```

**What's worth noticing:**

- The "What this audit did NOT check" section is the most important part. It names the boundary of the audit. Without it, you might think a 6.5/10 means "pass" — but this audit didn't cover perf, security, or bundle size.
- #1 is marked BLOCKER and references the prior audit that also flagged it. Closed-loop visible — the issue is being tracked across dates.
- #3 is the kind of finding you'd miss on manual review. Subtle divergence between two copies of the same pattern. This is where AI audit earns its keep.
- The audit produces a concrete next command (`/wbPlan`). Don't leave the audit orphaned — turn it into work.

---

## Example 2 — `/wbAudit packages/wb-core/src/utils/extractSubObject.js` (file audit)

File audits are different from folder audits. They produce side-by-side "existing vs. suggested" content.

```text
$ /wbAudit packages/wb-core/src/utils/extractSubObject.js

[AI] Loading context_extractSubObject.md (focused context)...
[AI] Reading the file + its 4 call sites...
[AI] Writing reports/20260423/audits/audit_extractSubObject_202604232000.md:
```

```markdown
# File Audit: extractSubObject.js

## Score: 7.0 / 10 — SOLID, WITH OPEN ARCHITECTURAL QUESTION

## Existing code (summary)
- 1 function, 42 lines
- Traverses object by dot-path
- Returns undefined on null/missing path
- Arrays: currently treated as leaves

## Flaws

### [ARCHITECTURAL] Array handling is undecided
This is not a bug but a documented open decision (see context file).
The audit surfaces it because any consumer extension today bakes in
the current behavior. Defer resolution; don't let consumers accumulate
undocumented assumptions.

### [MINOR] No input validation on path
extractSubObject(obj, path) silently returns undefined if path is
not a string. Consumers might pass null by accident.

### [MINOR] No JSDoc
4 call sites, no contract.

## Existing vs. Suggested (JSDoc)

| Existing | Suggested |
|---|---|
| *(no JSDoc)* | ```/** @param {object} obj ... @returns {*} ... */``` |

## Existing vs. Suggested (input guard)

Existing:
```js
function extractSubObject(obj, path, opts) {
 const keys = path.split('.');
 ...
}
```

Suggested:
```js
function extractSubObject(obj, path, opts) {
 if (typeof path !== 'string') return undefined;
 const keys = path.split('.');
 ...
}
```

## What this audit did NOT check
- The array-handling redesign. That's /wbPlan territory, not /wbAudit.
```

**What's worth noticing:**

- File audits give you a concrete diff you can copy-paste. Folder audits give you a list of issues to plan against.
- The "architectural" flaw (array handling) is *documented as open* — audit notes it but doesn't resolve it. Matches the "don't silently resolve open decisions" rule from `dev.md`.
- Minor fixes are ready-to-ship; the architectural question is explicitly deferred to a plan.

---

## Example 3 — `/wbAudit apps/wb-dataviewer/wbdataviewer2.wbc-ui.com` (app, not package)

Apps have different audit criteria. Pre-deploy, not pre-publish.

```text
$ /wbAudit apps/wb-dataviewer/wbdataviewer2.wbc-ui.com
```

```markdown
# Audit: wbdataviewer2.wbc-ui.com (2026-04-23)

## Score: 7.5 / 10 — DEPLOYABLE

## Findings

### 1. [MAJOR] One example uses :wbCode="true" against dev.md rule
src/examples/Example_wbPress.vue: the rule says all examples default
to false. This one is true. Two possibilities:
 a. Oversight — fix to false.
 b. Intentional demo of the toggle — if so, codify the exception
 in dev.md as "Example_wbPress may use true because it demos
 the toggle."
Ambiguity is the issue, not the value. Resolve one way.

### 2. [MAJOR] Deployment script assumes dist/ but vite writes dist-dev/ in dev mode
Same wbc-ui2 pattern. The deploy script should run a prod build
explicitly, not whatever is currently in the folder.

### 3. [MINOR] API base URL hardcoded in src/App.vue
Should be in .env or vite config. Not a blocker but makes
staging vs prod fragile.

### 4. [MINOR] Commented-out examples in src/examples/
4 files with `// TODO` or `// broken, skip`. Either fix or delete.

## What this audit did NOT check
- SEO / lighthouse score
- Accessibility (run lighthouse separately)
- Actual user-facing correctness (audit reads code, not behavior)

## Recommendation
Deploy after resolving #1 and #2. #3 and #4 can ship as debt.
```

**What's worth noticing:**

- #1 is interesting — the audit doesn't rule between options (a) and (b). It names the ambiguity and demands resolution. This is correct: the audit isn't supposed to decide; it surfaces decisions.
- Apps get checked against deploy concerns (hardcoded URLs, example cleanliness) that packages don't care about.
- Every audit explicitly names what it *didn't* check. Mandatory discipline — otherwise you start treating audit as a complete review, which it never is.

---

## Example 4 — rubber-stamp audit (what to reject)

Sometimes the audit comes back bland. Here's what that looks like and how to push back.

```text
$ /wbAudit packages/wb-core

[AI] ...
[AI] Score: 8.5 / 10 — LOOKS GOOD
[AI] Minor suggestions:
[AI] - Consider adding more comments
[AI] - JSDoc could be improved
[AI] - Bundle size monitoring would be nice
```

**This is a bad audit.** Three signs:

1. No blockers or majors. A real pre-release audit on a package with open decisions will always have at least one MAJOR.
2. Suggestions are generic ("add comments"). Not tied to specific files or functions.
3. No "what this audit did NOT check" section. The AI is claiming coverage it doesn't have.

**Push back:**

```
"Re-run harsher. Assume this is shipping to a paying customer who
hates the codebase. What would they complain about? Read reports/
for prior audits of this package — anything unresolved is by
definition a finding. Flag subtle divergences like gating patterns
that should be identical but aren't. Don't produce generic advice;
name specific files, functions, line numbers."
```

The re-run usually produces the real audit. Rubber-stamping is a first-pass failure mode, not a terminal one.

---

## The pattern across examples

Every good audit has:

1. **A score with a recommendation** (ship / don't ship / ship with caveats).
2. **Findings ranked by severity** (BLOCKER > MAJOR > MINOR).
3. **Specific file + line references**, not vague suggestions.
4. **An explicit "what this did NOT check" section**.
5. **A concrete next command** (usually `/wbPlan` to fix blockers).

If any of these are missing, the audit is incomplete. Re-run it.

---

---

## Basic Usage

```bash
# Standard command execution
/wbAudit frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbAudit deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbAudit` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbAudit target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbAudit target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbAudit target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbAudit packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbAudit apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbAudit` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbAudit frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

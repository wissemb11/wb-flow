# wb-flow Protocol: /wbReview Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbReview` command. It serves as the definitive reference for peer-review simulations, strict architectural linters, ID targeting, and auto-correction (Act) logic.

---

## 1. Role & Definition Matrix
**Role:** The Senior Peer Reviewer & Code Linter
**Target:** Evaluates uncommitted changes (`git diff`) or specifically implemented tasks against the architecture guidelines.
**Core Protocol:** Prevents messy, out-of-scope, or un-architectural code from being merged. Differs from `/wbValid` (which runs tests); `/wbReview` reads the code qualitatively.

| Scenario | System Behavior |
|---|---|
| Target is UI Component | **[PROCEED]** Enforces aesthetic guidelines. Checks for Vanilla CSS usage instead of Tailwind. Rejects inline styles. |
| Target is Core Logic | **[PROCEED]** Checks cyclomatic complexity, missing docstrings, and ensures no global state mutation. |
| Code is Perfect | **[PROCEED]** Emits an "Approval" stamp and optionally syncs with active plan or Git hooks. |

---

## 2. Argument & Criteria Resolution Matrix
The `/wbReview` command analyzes code dynamically based on strict targeting.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| No Argument | `Command: /wbReview` | Analyzes all uncommitted changes in `git diff`. | Generates a global code-review report. |
| Single Task ID | `Command: /wbReview -i="2"` | Cross-references changes made against the requirements of Task #2. | Reviews only the logic intended for Task 2. |
| Multi-Task Array | `Command: /wbReview -i="1,3"` | Reviews the interaction between implementations of Task 1 and 3. | Generates a unified peer review. |
| Specific File Path | `Command: /wbReview src/utils/auth.js` | Locks review onto a single file regardless of plan. | Deep qualitative review of `auth.js`. |
| Wildcard Glob | `Command: /wbReview src/**/*.css` | Evaluates all CSS files. | Checks aesthetic standard compliance across all stylesheets. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--id="<id>"` | `-i` | Explicit task targeting (Supports singular, CSV arrays, and `*` wildcards). | `Command: /wbReview -i="*"` | `[REVIEW] Wildcard detected. Reviewing all implemented tasks.` |
| `--plan` | `-p` | Strict mode. Automatically fails the review if the code introduces features NOT asked for in the plan (Scope Creep). | `Command: /wbReview -p` | `[SCOPE CREEP] FAILED. You added a caching layer not specified in the plan.` |
| `--act` | `-a` | Auto-corrects minor issues (e.g., removing `console.log`, fixing indentation) without prompting. | `Command: /wbReview src/app.js -a` | `[ACT] Fixed trailing whitespace. Removed orphaned console.log.` |
| `--wbPlan` | `-P` | Updates the active plan file with the review results. | `Command: /wbReview -i="1,2" -P` | `[SYNC] Writing ✅ Reviewed to plan_*.md for Tasks 1 and 2.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Anti-Scope-Creep Gate" (`-i="*" -p -a`)
**Context:** The developer claims to have finished all tasks. The Senior Agent reviews the code, automatically fixes minor typos, but strictly blocks any unapproved features.
**Command Executed:** `/wbReview -i="*" -p -a`
**Simulated Protocol Chain:**
1. System reads `git diff` for all files touched by Tasks 1, 2, 3.
2. Auto-fixes (`-a`) indentation and unused imports.
3. Validates against plan (`-p`). Detects an unauthorized UI component in Task 2.
4. Fails review. Demands rollback.
**Simulated Output:**
```markdown
> Command: /wbReview -i="*" -p -a

[SYSTEM] Wildcard detected. Reviewing 3 tasks.
[ACT] Fixed 12 trailing whitespace errors automatically.
[REVIEW] Task 1: PASS. Code is clean.
[REVIEW] Task 2: FAIL. Scope Creep detected.
[REASON] The plan asked for regex escaping, but you added a new CSS button class.
[SYNC] Task 2 review failed. Please remove the CSS class.
```

### 💠 The "Aesthetic Enforcer" (`src/**/*.css -a`)
**Context:** Ensuring the CSS follows the "Rich Aesthetics" monorepo rule.
**Command Executed:** `/wbReview src/**/*.css -a`
**Simulated Output:**
```markdown
> Command: /wbReview src/**/*.css -a

[SYSTEM] Glob resolved to 8 CSS files.
[REVIEW] Found generic colors (red, blue).
[ACT] Auto-correcting generic colors to HSL palette tokens.
[SUCCESS] Aesthetic compliance reached.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Uncommitted Mess | `git diff` is over 1,000 lines across 50 files. | `⚠️ Warning: Diff is massive. Splitting review into chunks to avoid context limits.` |
| Scope Creep Conflict | Task logic is correct, but introduces unauthorized libraries. | `❌ Error: Unapproved dependency added to package.json. Rejecting review.` |
| Act Failure | `-a` flag encounters complex logical rewrite. | `⚠️ Warning: Fix too complex for auto-act. Please fix manually.` |
| Invalid ID | User runs `-i="99"` (Task doesn't exist). | `❌ Error: Task ID 99 not found in active plan.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

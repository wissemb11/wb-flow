# /wbToWBC — Expert

## What `/wbToWBC` architecturally is

A **structural transformation command** that rewrites legacy components into wbc-ui2 equivalents. Distinct from `/wbRefactor` (behavior-preserving structural changes within the same paradigm) — `/wbToWBC` changes paradigm entirely (template-driven → config-driven).

the agent's version calls this "an AST transformation engine designed specifically for the WBC ecosystem." The framing overstates formal rigor — the transformation is LLM-driven semantic understanding plus pattern matching, not formal AST rewriting. But the spirit is right: this is a paradigm-specific migration tool, not a generic refactor.

## The "rewrite, not refactor" distinction

Worth being explicit:

- **`/wbRefactor`** changes structure within a paradigm. Same Vue, same components, cleaner code. Behavior preserved + tests prove it.
- **`/wbToWBC`** changes paradigm. Template-driven Vue → config-driven wbc-ui2. Behavior preserved + you verify visually because tests written against the legacy structure no longer apply directly.

The distinction matters because:
- Refactor is small-diff, low-risk, reversible easily.
- Migration is large-diff, medium-risk, hard to reverse without manual work.

Treating them as the same command would conflate small fixes with paradigm shifts, and users would either over-migrate (using `/wbToWBC` for small cleanups) or under-migrate (using `/wbRefactor` to fix paradigm mismatches that need a real rewrite).

## The "UI as data" philosophy this command enforces

wbc-ui2 components express UI as JSON-like configuration:

```js
// template-driven (legacy):
<table>
 <tr v-for="user in sortedUsers">
 <td>{{ user.name }}</td>
 ...
 </tr>
</table>

// config-driven (wbc-ui2):
<WBDataViewer :data="users" :config="{ columns: [...] }" />
```

The config-driven form enables:
- Server-pushed configurations (the server can change the UI).
- Easier serialization (the entire UI fits in a database row).
- Consistent behavior (sorting, filtering, pagination all happen in one place).

But it also costs:
- Less custom UI control. You opt into the wbc-ui2 styling and behavior.
- Less imperative escape hatch. You configure rather than code.

`/wbToWBC` is the on-ramp to this philosophy. The "what you lose" section of every migration is the user-facing acknowledgment of the trade.

## Three design decisions worth naming

### 1. Refusal when no equivalent exists
Not every legacy component has a wbc-ui2 migration target. Drag-drop interfaces, animation-heavy components, niche widgets — these don't fit the data-display-oriented wbc-ui2 vocabulary.

The command refuses honestly rather than force-fitting. Force-fits produce broken or worse-than-original code.

### 2. Per-component analysis in folder mode
A folder migration isn't all-or-nothing. Some files migrate cleanly; some have no equivalent; some get deleted as orphans. The command surfaces this granularly, lets the user decide per-component.

This is correct because folder boundaries don't match migration boundaries — a single folder may contain different paradigms.

### 3. Honest tradeoff disclosure
Every migration includes "what was preserved / changed / lost." The "lost" section is the most important. A migration that pretends nothing was lost is hiding the trade-off; the user discovers the loss months later when they need a feature wbc-ui2 doesn't support.

Naming losses up front makes migration a deliberate choice, not a default.

## Where the command leaks

1. **wbc-ui2 component coverage is incomplete.** As wbc-ui2 grows (new packages, new primitives), the command's understanding of "what's available" needs to grow with it. Stale knowledge means missed migration opportunities or wrong target selection.

2. **Behavior preservation is approximate.** Custom event handlers, edge-case interactions, and CSS-driven behavior may not survive cleanly. The command catches the obvious cases; subtle ones can drift.

3. **Test invalidation.** Tests written against the legacy structure (unit tests of internal functions, snapshot tests of specific markup) no longer apply. The user must re-test. The command can't auto-write replacement tests.

4. **Performance characteristics shift.** Config-driven wbc-ui2 components may render differently — more or less re-render churn, different memoization. Performance regressions can surface only at runtime.

5. **One-direction-only.** No `/wbFromWBC` to undo a migration. If the migration was wrong, you reverse-engineer manually or restore from git history.

## The interaction with `/wbAudit` and `/wbRefactor`

Common mistake: running `/wbToWBC` when `/wbRefactor` was the right call. Heuristic:

- If the legacy code does what wbc-ui2 components do (table render, layout, code display), `/wbToWBC` is right.
- If the legacy code is just messy but doesn't map to a wbc-ui2 primitive, `/wbAudit` + `/wbRefactor` is right.

A pre-migration `/wbAudit` is good practice. If audit says "use wbc-ui2 here," migration is appropriate. If audit says "this is unique; refactor in place," migration is wrong.

What `wb-flow-docs`'s playbook gets wrong about `/wbToWBC`: treating it as a general migration tool, when the actual scope is specifically legacy HTML/Vuetify to wbc-ui2 component conversion. Marketing it as a general migration tool would invite misuse for refactors that should go through /wbRefactor instead.

## One-paragraph verdict

A paradigm-shift migration command whose architectural contribution is the *honest tradeoff disclosure* — every migration names what's preserved, changed, and lost. Correct in distinguishing itself from `/wbRefactor` (paradigm shift vs. in-paradigm structural change), in refusing when no wbc-ui2 equivalent exists, and in per-component analysis for folder migrations. The "AST transformation engine" framing from gemini overstates formal rigor; the engine is LLM-driven semantic transformation. Weakest in coverage staleness as wbc-ui2 evolves, behavior-preservation approximation, test invalidation gap, performance regression risk, and one-direction-only nature. Correct for solo monorepo modernization when paired with `/wbAudit` for migration appropriateness; wrong as a default-cleanup tool.

---

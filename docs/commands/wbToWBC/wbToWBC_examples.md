---
title: "wbToWBC — Examples"
description: "A targeted migration: takes a legacy component and rewrites it to use WBDataViewer, wb-press layouts, WBCode, etc."
---

# /wbToWBC — Examples

> Self-help. `/wbToWBC` rewrites legacy code (raw HTML tables, Vuetify components, vanilla Vue) into wbc-ui2 equivalents. This is a structural rewrite, not a refactor — the *behavior* stays the same but the *code* is fundamentally different.

---

## What /wbToWBC actually does

A targeted migration: takes a legacy component and rewrites it to use `WBDataViewer`, `wb-press` layouts, `WBCode`, etc. The output is significantly shorter than the input (typically 60-80% reduction) because wbc-ui2 components are configuration-driven ("UI as data"), not template-driven.

Two possible outcomes:
- **Migration**: legacy → wbc-ui2 (the common case).
- **Refusal**: the legacy code's pattern doesn't have a wbc-ui2 equivalent, OR the legacy code is fine and shouldn't be migrated.

---

## Example 1 — `/wbToWBC src/views/OldDashboard.vue` (table migration)

```text
$ /wbToWBC src/views/OldDashboard.vue

[AI] Reading the file (842 lines)...
[AI] Analyzing structure:
[AI] - Main pattern: HTML table with manual row rendering
[AI] - 6 columns, 3 of which have custom formatters
[AI] - Sorting via custom click handlers (per column)
[AI] - Filtering via separate component (FilterPanel.vue)
[AI] - Pagination via mounted `ref` and `v-for(slice)`
[AI]
[AI] Identifying wbc-ui2 equivalent:
[AI] ✅ WBDataViewer covers: table render, sorting, filtering, pagination
[AI] ✅ Custom formatters → WBDataViewer column.format functions
[AI]
[AI] Loading wb-dataviewer/.agents/workflows/context.md...
[AI] apiResponse_ caching convention noted
[AI] :wbCode="false" default rule noted
[AI]
[AI] Proposed rewrite:
```

```vue
<!-- Before: 842 lines (omitted for brevity) -->

<!-- After: 87 lines -->
<template>
 <WBDataViewer
 :data="users"
 :config="dataViewerConfig"
 :wbCode="false"
 />
</template>

<script setup>
import { WBDataViewer } from '@wbc/wb-dataviewer';
import { ref, onMounted } from 'vue';

const users = ref([]);

const dataViewerConfig = {
 columns: [
 { key: 'id', label: 'ID', sortable: true },
 { key: 'name', label: 'Name', sortable: true, searchable: true },
 { key: 'email', label: 'Email', searchable: true },
 {
 key: 'status',
 label: 'Status',
 format: (val) => val === 'active' ? '🟢 Active' : '⚪ Inactive'
 },
 {
 key: 'created_at',
 label: 'Created',
 format: (val) => new Date(val).toLocaleDateString()
 },
 {
 key: 'lastLogin',
 label: 'Last Login',
 format: (val) => val ? formatRelative(val) : 'Never'
 },
 ],
 pagination: { perPage: 25 },
 defaultSort: { key: 'created_at', direction: 'desc' },
};

onMounted(async () => {
 const res = await fetch('/api/users');
 users.value = await res.json();
});
</script>
```

```text
[AI] Migration summary:
[AI] - 842 lines → 87 lines (90% reduction)
[AI] - Manual sorting/filter/pagination → WBDataViewer config
[AI] - 3 custom formatters preserved as column.format functions
[AI] - apiResponse_ pattern: NOT applied here (this is one-shot fetch,
[AI] not cached). If you want caching, wrap in apiResponse_.
[AI] - :wbCode="false" applied per dev.md rule.
[AI]
[AI] What was preserved:
[AI] - Same columns, same labels, same sort defaults
[AI] - Same data source (/api/users)
[AI] - Custom formatting logic (status, dates, lastLogin)
[AI]
[AI] What changed (intentionally):
[AI] - Code is config-driven, not template-driven
[AI] - FilterPanel.vue is no longer needed (WBDataViewer handles it)
[AI] - Pagination handling moved from manual to declarative
[AI]
[AI] What you lose:
[AI] - The custom click handlers for sorting (replaced by built-in)
[AI] - Any specific UI tweaks in the table (now follow WBDataViewer styling)
[AI]
[AI] Writing reports/20260425/migrations/migration_OldDashboard_202604250300.md
[AI]
[AI] NEXT:
[AI] 1. Visually verify (colors, spacing, behavior).
[AI] 2. Delete src/components/FilterPanel.vue (no longer used).
[AI] 3. Delete the now-unused sort/filter/paginate utility functions.
[AI] 4. /wbAudit to confirm no regressions.
[AI] 5. /wbGit to commit.
```

**What's worth noticing:**

- The "what you lose" section is honest about the tradeoff. Migration to wbc-ui2 is opinionated; some custom UI choices don't survive.
- The "what was preserved" section gives the user a checklist for verification. Same data source, same columns, same defaults — but new rendering.
- Follow-ups include cleanup steps. Migration leaves orphans (FilterPanel.vue, utility functions); they need removal.
- `apiResponse_` caching is *not* applied automatically. The AI flags it as available but doesn't impose it. User-controlled.

---

## Example 2 — `/wbToWBC src/components/UserList.vue` (refused — already uses wbc-ui2)

```text
$ /wbToWBC src/components/UserList.vue

[AI] Reading the file...
[AI] Detected: this component already uses WBDataViewer.
[AI]
[AI] REFUSING migration. Component is already wbc-ui2.
[AI]
[AI] Possible intent:
[AI] - You wanted to migrate a *different* file. Check the path.
[AI] - You want to refactor existing wbc-ui2 usage. Use /wbRefactor
[AI] after /wbAudit, not /wbToWBC.
[AI] - You want to change the component to use a different wbc-ui2
[AI] primitive (e.g., WBChart instead of WBDataViewer). Describe
[AI] that explicitly; /wbToWBC doesn't switch between wbc-ui2
[AI] components.
```

**What's worth noticing:**

- Detection prevents accidental re-migration. Re-running on already-migrated code can produce broken output.
- Possible intents listed help the user figure out what they actually meant.

---

## Example 3 — `/wbToWBC src/components/AnimatedHero.vue` (refused — no equivalent)

```text
$ /wbToWBC src/components/AnimatedHero.vue

[AI] Reading the file...
[AI] Analyzing structure:
[AI] - Custom CSS animations (keyframes, transforms)
[AI] - Three.js canvas for particle background
[AI] - Specific to this app's marketing landing page
[AI]
[AI] Looking for wbc-ui2 equivalent...
[AI] ❌ No wbc-ui2 component covers animated marketing heroes.
[AI] ❌ wbc-ui2 is data-display oriented, not animation-oriented.
[AI]
[AI] REFUSING migration. There's no good target.
[AI]
[AI] Verdict: this component is fine as-is. wbc-ui2 isn't the right
[AI] tool for this surface area. Don't force-fit.
[AI]
[AI] If the component has issues unrelated to wbc-ui2 (perf, bugs):
[AI] - /wbAudit for code quality
[AI] - /wbDebug for specific bugs
[AI] - /wbRefactor for structural cleanup
```

**What's worth noticing:**

- Honest refusal. Not every legacy component has a wbc-ui2 migration path. The command says so.
- The verdict explicitly says "this component is fine." This is the right posture — migrate when migration helps, not as a religious exercise.

---

## Example 4 — `/wbToWBC src/components/blog/` (folder migration with caveats)

```text
$ /wbToWBC src/components/blog/

[AI] Reading folder (4 components, 1280 lines total)...
[AI] - PostList.vue: list of blog posts (table-like)
[AI] - PostDetail.vue: single post rendering with markdown
[AI] - PostEditor.vue: rich-text editor (CKEditor wrapper)
[AI] - PostFilter.vue: filter sidebar
[AI]
[AI] Per-component analysis:
[AI] PostList.vue: ✅ → WBDataViewer (clean migration)
[AI] PostDetail.vue: ✅ → wb-press layout (markdown + sidebar)
[AI] PostEditor.vue: ❌ wbc-ui2 has no rich-text editor primitive.
[AI] Keep as-is.
[AI] PostFilter.vue: ⚠ → can be folded INTO WBDataViewer config,
[AI] making this file unnecessary.
[AI]
[AI] Proposed migration:
[AI] - Migrate PostList + PostDetail + PostFilter → WBDataViewer
[AI] and wb-press
[AI] - Leave PostEditor untouched
[AI] - Delete PostFilter (folded into WBDataViewer config)
[AI]
[AI] Net change:
[AI] - 4 files → 2 files (PostList migrated, PostDetail migrated,
[AI] PostFilter deleted, PostEditor unchanged)
[AI] - 1280 lines → ~280 lines (~78% reduction)
[AI]
[AI] Caveats:
[AI] - PostList migration is straightforward.
[AI] - PostDetail migration requires confirming wb-press handles
[AI] your specific markdown extensions (footnotes, math?).
[AI] - Delete-PostFilter is correct only if no other component
[AI] imports from it. Verify before deleting.
[AI]
[AI] Proceed? (y/n) — answer per-component or all-at-once.
```

**What's worth noticing:**

- Folder migration is per-component, not all-or-nothing. Some files migrate; some don't; some get deleted.
- Caveats name what the user should verify before proceeding (markdown extensions, no other consumers of PostFilter).
- The AI lets the user decide all-at-once or per-component. Granular control.

---

## The pattern

Every `/wbToWBC` run has:

1. **Read source structure** — what kind of component is this?
2. **Identify wbc-ui2 equivalent** — does one exist? if not, refuse.
3. **Detect already-migrated code** — refuse re-processing.
4. **Compute migration** — config-driven rewrite that preserves behavior.
5. **List preserved + changed + lost** — honest tradeoff disclosure.
6. **Identify orphaned files** — cleanup work that follows migration.
7. **Pointer to verification** — `/wbAudit` and visual check.

Migration is a one-shot per target. Re-running on the same file is almost always wrong.

---

---

## Basic Usage

```bash
# Standard command execution
/wbToWBC frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbToWBC deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbToWBC` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbToWBC target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbToWBC target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbToWBC target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbToWBC packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbToWBC apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbToWBC` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbToWBC frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

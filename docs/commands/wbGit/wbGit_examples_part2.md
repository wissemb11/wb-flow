# /wbGit — Examples: Multi-Scope & Edge Cases

> Part 2 covers advanced `/wbGit` scenarios: multi-scope commits in a monorepo, conventional-commit edge cases, and the interaction between `/wbGit` and other wb-flow commands.
> *Context: We are operating within the `core2/` monorepo root.*

---

## Example 4: Multi-Scope Monorepo Commit

When changes span multiple packages, `/wbGit` must decide on a single commit scope or split into multiple suggested commits.

```text
$ /wbGit core2/

[AI] Reading .wb/workflows/context.md for core2...
[AI] Analyzing staged changes...
[AI]   - Modified: packages/wb-core/src/WBC.js (5 lines)
[AI]   - Modified: packages/wb-press2/src/components/WBTable.vue (12 lines)
[AI]   - Modified: apps/wb-flow/wb-flow-docs/src/README.md (3 lines)
[AI] Detecting: 3 distinct scopes with no shared change theme.
[AI] ⚠️ Recommending split commits...
```

**Generated Output:**

```markdown
## ⚠️ Multi-scope detected — recommending 3 separate commits:

### Commit 1:
fix(wb-core): guard against undefined slot resolution

### Commit 2:
refactor(wb-press2): extract table header rendering to composable

### Commit 3:
docs(wb-flow-docs): update README command index links

---
To combine into a single commit instead, re-run:
/wbGit core2/ --force-single
```

**Annotations:**
- When changes touch 3+ scopes with unrelated themes, `/wbGit` recommends splitting rather than forcing a vague combined message.
- The `--force-single` escape hatch exists for when the user knows the changes are logically related despite crossing scope boundaries.

---

## Example 5: Breaking Change Detection

```text
$ /wbGit packages/wb-core

[AI] Reading .wb/workflows/context.md for wb-core...
[AI] Analyzing staged changes...
[AI]   - Modified: src/WBC.js — public method signature changed
[AI]   - Deleted: src/utils/legacyHelper.js
[AI] Detecting change type: breaking (public API altered + file deleted)
[AI] Generating commit message...
```

**Generated Output:**

```
feat(wb-core)!: restructure WBC.register to accept options object

BREAKING CHANGE: WBC.register() now takes a single options object
instead of positional arguments. The old signature
`register(name, component, tier)` is no longer supported.

Migration: Replace `WBC.register('MyComp', comp, 2)` with
`WBC.register({ name: 'MyComp', component: comp, tier: 2 })`.

Also removes src/utils/legacyHelper.js which was only used
by the old positional API.
```

**Annotations:**
- The `!` after the scope signals a breaking change per the [Conventional Commits spec](https://www.conventionalcommits.org/).
- The `BREAKING CHANGE:` footer is always generated when public API signatures change or files are deleted from exported paths.
- A migration guide is automatically included when the AI can infer the old → new transformation.

---

## Example 6: Post-Plan Commit (with `/wbTrack` context)

After executing a plan's tasks, `/wbGit` can reference the plan file for richer commit context.

```text
$ /wbGit packages/wb-core --plan

[AI] Reading .wb/workflows/context.md for wb-core...
[AI] Found active plan: plan_wb-core_20260510.md
[AI]   - Tasks completed this session: #1 (fix prop types), #3 (add tests)
[AI] Analyzing staged changes against plan tasks...
[AI] Generating commit message...
```

**Generated Output:**

```
fix(wb-core): resolve prop type mismatches and add unit tests

Completes Plan #1 and #3 from plan_wb-core_20260510.md:
- Task #1: Fixed 14 prop type declarations across 6 components
- Task #3: Added 22 unit tests for WBC.register and WBC.resolve

Ref: plan_wb-core_20260510.md
Validated-by: AI (10/10)
```

**Annotations:**
- The `--plan` flag enriches the commit body with plan task references.
- `Ref:` and `Validated-by:` are custom trailers that integrate with the wb-flow audit trail.
- This creates a complete chain: plan → task report → commit → audit.

---

## Edge Case Matrix

| Scenario | Behavior |
|---|---|
| No staged changes | `❌ Error: No staged changes. Run git add first.` |
| Only deleted files | Type defaults to `chore` unless deletions are in `src/` (then `refactor`). |
| Binary files staged | Mentioned in body but excluded from diff analysis. |
| Merge commit | `/wbGit` refuses — merge commits should use git's auto-generated message. |
| `--amend` flag | Reads the previous commit message and suggests an updated version. |
| Empty `context.md` | Falls back to folder basename for scope. Warns: `⚠️ No context.md found.` |

---

## Command Integration Chain

```
/wbWork --task=N  →  (code changes)  →  /wbClean src/  →  /wbGit target/  →  git commit
```

`/wbGit` is always the **last wb-flow command** before the user interacts with git directly. It never executes git commands — it only produces text.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

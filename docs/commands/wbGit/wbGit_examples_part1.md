# /wbGit — Examples: Simple Commit Messages

> `/wbGit` generates structured, conventional-commit-format commit messages by analyzing staged changes. These annotated transcripts demonstrate the most common use case: generating a commit message for a single-scope change.
> *Context: We are operating within `packages/wb-core`.*

---

## Example 1: Single-File Fix

```text
$ /wbGit packages/wb-core

[AI] Reading .wb/workflows/context.md for wb-core...
[AI] Analyzing staged changes...
[AI]   - Modified: src/WBC.js (3 lines changed)
[AI] Detecting change type: bugfix (conditional guard added)
[AI] Generating commit message...
```

**Generated Output:**

```
fix(wb-core): add null guard to WBC.resolveSlot

The resolveSlot method crashed when invoked with an undefined
slot name during SSR hydration. Added an early return with a
console.warn for debugging.

Affects: WBC.js L127-L129
```

**Annotations:**
- `/wbGit` correctly identified the change type as `fix` (not `feat` or `refactor`) by detecting the added conditional guard pattern.
- The scope `(wb-core)` was derived from the target folder's `context.md` identity.
- The body references the exact line range for traceability.

---

## Example 2: Multi-File Feature Addition

```text
$ /wbGit packages/wb-press2

[AI] Reading .wb/workflows/context.md for wb-press2...
[AI] Analyzing staged changes...
[AI]   - Added: src/components/WBSearch.vue (142 lines)
[AI]   - Modified: src/index.js (1 line — new export)
[AI]   - Modified: package.json (1 line — version bump)
[AI] Detecting change type: feature (new component + export)
[AI] Generating commit message...
```

**Generated Output:**

```
feat(wb-press2): add WBSearch component with fuzzy matching

Introduces a new search component that supports multi-color
highlighting and fuzzy matching via Fuse.js. The component
is registered globally and exported from the package root.

- New file: src/components/WBSearch.vue
- Updated: src/index.js (added WBSearch export)
- Bumped: package.json 1.4.0 → 1.5.0
```

**Annotations:**
- Multi-file changes are automatically grouped into a coherent narrative.
- The version bump was detected and included in the bullet list rather than the subject line — this follows the conventional-commit convention of keeping the subject focused on *what* changed, not *how* it was versioned.

---

## Example 3: Documentation-Only Change

```text
$ /wbGit apps/wb-flow/wb-flow-docs

[AI] Reading .wb/workflows/context.md for wb-flow-docs...
[AI] Analyzing staged changes...
[AI]   - Modified: src/commands/wbClean/wbClean_exhaustive_simulation.md
[AI]   - Modified: src/commands/wbGit/wbGit_examples_part1.md
[AI]   - Modified: src/commands/wbGit/wbGit_examples_part2.md
[AI] Detecting change type: docs (all .md files, no source code)
[AI] Generating commit message...
```

**Generated Output:**

```
docs(wb-flow-docs): rewrite wbClean simulation and wbGit examples

Completed the exhaustive simulation spec for /wbClean (added
flag conflict matrix and cross-reference table). Rewrote the
wbGit examples layer with annotated transcripts covering
single-file, multi-file, and documentation-only scenarios.
```

**Annotations:**
- When all staged files are `.md`, the type is automatically set to `docs`.
- The scope is derived from the deepest common ancestor directory that has a `context.md`.

---

## Key Rules Demonstrated

| Rule | Example Above |
|---|---|
| **Type detection** | `fix` for guards, `feat` for new files, `docs` for `.md`-only |
| **Scope derivation** | Always from `context.md` identity, never from file path |
| **Subject line** | Imperative mood, ≤72 chars, no period |
| **Body** | Explains *why*, not just *what* |
| **No git execution** | `/wbGit` outputs text only — the user runs `git commit` themselves |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

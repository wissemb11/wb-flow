# wbClean — Expert Architecture

## System Role
Scans for dead code, unused files, and obsolete dependencies across the entire source tree.

## Detection Strategies

### Static Analysis (Language-Agnostic)
- **Unreferenced exports:** Scans all `.js`, `.ts`, `.vue`, `.py` files for exported symbols that no other file imports. Uses regex-based cross-reference matching — maps all `import`/`require`/`from` statements, then flags orphans.
- **Dead files:** Files not reachable from any entry point (`main.js`, `index.ts`, `app.vue`, `setup.py`). Builds a dependency graph from root entry points using import resolution. Any `.md` or source file not in the graph is flagged.
- **Orphaned assets:** Images, fonts, JSON blobs in `src/assets/` or `public/` not referenced by any source file.

### Dependency Analysis
- **package.json:** Compares `dependencies`/`devDependencies` against actual `import`/`require` usage across the tree. Flags unused packages (`lodash` installed but never imported).
- **Unused configs:** Files like `.eslintrc.js`, `tsconfig.json`, `babel.config.js` that reference plugins no longer in `node_modules/`.

### Heuristic Scoring
Each finding gets a confidence score:

| Score | Meaning | Action |
|---|---|---|
| 90-100% | Symbol confirmed unreachable (no imports, no re-exports) | Safe to delete |
| 50-89% | Symbol imported but never used in any function body | Manual review |
| 10-49% | Weak signal (similar name, different module) | Needs human judgment |

## Execution Flow

```
/wbClean
  ├─ 1. Parse entry points from package.json "main"/"bin"
  ├─ 2. Walk import graph (BFS, max depth = 50)
  ├─ 3. Collect all referenced files + symbols
  ├─ 4. Diff against filesystem → dead files
  ├─ 5. Diff symbols per file → dead exports
  ├─ 6. Check package.json deps vs actual imports
  └─ 7. Output report with confidence scores
```

The command does **not** delete anything. It produces a ranked report. Deletion is always manual or via `/wbWork --task=clean`.

## Edge Cases & Failure Modes

| Scenario | Behavior |
|---|---|
| Dynamic imports (`import(pathVar)`) | Flagged as "uncertain" — reports the pattern, doesn't auto-classify |
| Re-export chains (`export * from`) | Followed through 3 levels max to avoid infinite cycles |
| Monorepo workspace dependencies | Treated as external (not flagged even if unused locally) |
| Binary/data files (`.wasm`, `.blob`) | Checked by filename reference only — no content parse |
| Minified/compiled output (`dist/`) | Excluded from scan entirely |

## Output Format

```
wbClean Report — 2026-05-12
  Files scanned: 342
  Entry points:  3 (src/main.js, src/index.ts, bin/cli.js)

  ┌──────────────────────────────────────────────────────┐
  │ 🔴 DEAD FILES (2)                                     │
  ├──────────────────────────────────────────────────────┤
  │ src/legacy/utils.js     — 0 imports from any entry    │
  │ src/mocks/test-data.json — unreferenced                │
  ├──────────────────────────────────────────────────────┤
  │ 🟡 UNUSED DEPENDENCIES (3)                            │
  ├──────────────────────────────────────────────────────┤
  │ lodash (^4.17.21)       — no import found             │
  │ moment (^2.29.4)        — replaced by date-fns        │
  └──────────────────────────────────────────────────────┘

  Estimated cleanup: ~2.4 MB freed
```

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

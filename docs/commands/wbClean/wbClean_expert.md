# /wbClean — Expert

## What `/wbClean` architecturally is

A **debris-detection reporter** that performs static analysis on a package to surface cleanup candidates: forgotten dev artifacts, dead files, unused imports, commented-out blocks, stale TODOs. Outputs a structured report with per-finding confidence levels. Does not mutate code.

The architectural contribution is the **detection/action separation** — the command deliberately refuses to delete things itself. This is the inverse of linter auto-fix tooling, and it matters because "unused" is heuristic in ways that auto-deletion cannot recover from.

## Why detect-without-delete

Three classes of false positive make auto-delete dangerous:

1. **Dynamic references.** `const mod = await import(someComputedPath)` — static analysis can't prove `someComputedPath` points to a "dead" file.
2. **Build-time / config references.** A file referenced only from `vite.config.js` externals lists or from a string concatenation in a build script looks dead to source-level scanning.
3. **Intentional future-state.** Code commented out because you'll re-enable it in two weeks looks the same as code commented out three years ago and forgotten.

An auto-delete tool either ships those false positives (silent data loss) or narrows the filter so aggressively that it misses most real debris. `/wbClean` picks the third option: surface candidates with confidence levels, let the human decide.

## Three design decisions worth naming

### 1. Confidence levels as first-class signal
HIGH vs. MEDIUM isn't decoration — it drives triage. HIGH candidates (unused imports, `console.log`) are machine-verifiable; MEDIUM candidates (dead files, commented blocks) depend on context the command can't see. Reporting both with the same weight would make the user either trust everything or trust nothing.

### 2. Five-category taxonomy
Not "cleanup issues" — five named categories (dev artifacts, dead files, unused imports, commented-out, TODOs). Each has a different semantics and a different recommended action. Collapsing them into one bucket loses that distinction.

### 3. The "did NOT check" section
Same mandatory discipline as `/wbAudit`. Prevents users from treating the report as complete. Examples of explicit gaps: dynamic imports, reflection-based references, build-time string manipulation, intentional-but-old comments.

## Where the command leaks

1. **False negatives on subtle references.** Any code that constructs an import path at runtime (`import('./renderers/' + type + '.js')`) will cause the target files to be flagged as dead. `/wbClean` has no way to resolve the concatenation.

2. **No git-age signal.** A file that was deleted, re-added, and is now unused looks the same as a file that's been unused for two years. Git history would be a useful signal — it isn't used.

3. **Unused exports vs. unused files.** A file might have 5 exports, 4 of which are unused and 1 of which is heavily used. The file is not dead, but 80% of its content is. `/wbClean` reports "unused imports" but not "unused exports" — it misses the second half.

4. **No cycle detection.** Two files that only import each other and are imported by nothing else are collectively dead, but each points to the other, so neither looks dead in isolation. Not detected.

5. **TODO staleness is not measured.** A 3-year-old TODO has the same priority as a TODO from yesterday. `git blame` would fix this; not wired up.

What `wb-flow-docs`'s playbook gets wrong about `/wbClean`: framing it as a general-purpose cleanup command, when the actual strength is targeted dead-code detection via usage analysis, not blanket file deletion. The 'dry-run first' discipline is structural, not optional.

## One-paragraph verdict

A debris-detection reporter whose architectural contribution is refusing to auto-delete — a correct inversion given that heuristic "unused" detection is fundamentally imprecise in dynamic languages. The five-category taxonomy + confidence-level discipline + mandatory "did NOT check" section are all right design choices. Weakest in dynamic-path analysis, git-age signal, unused-exports-within-files, cycle detection, and TODO staleness. Correct for solo pre-release cleanup; would need cycle analysis and git integration to become a serious monorepo hygiene tool. The detect-don't-delete posture is the design choice that separates this from lint-autofix culture, and it should not be reversed.

---

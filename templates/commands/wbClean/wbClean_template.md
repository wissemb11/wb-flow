# /wbClean: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbClean`

## One form

```
/wbClean <pkg-or-app>
```

No flags. The command is narrow: scan, report, done.

## When to run

- End of day / end of a work session — catches what you left behind while still fresh.
- Before `/wbAudit` in the afternoon polish phase — clean first, then audit the clean result.
- Before `/wbRelease` — confirm no `console.log` or debug code leaking to npm.
- After inheriting a package — baseline the debt.

## When *not* to run

- Before starting work — nothing to clean.
- On a package you rarely touch — low signal, wastes a report slot in `reports/`.
- As a substitute for `/wbAudit` — clean finds debris; audit finds design flaws. Different problems.

## Reading the output

Five report sections:

1. **Forgotten dev artifacts** — `console.log`, `debugger`, `TODO: hack` comments. Almost always safe to delete. HIGH confidence.
2. **Dead files** — 0 import references detected. MEDIUM confidence (could be dynamic).
3. **Unused imports** — imported, never referenced. HIGH confidence.
4. **Commented-out blocks** — still there from weeks ago. MEDIUM confidence — sometimes intentional.
5. **TODOs** — informational. Not a delete candidate; just a visibility surface.

Also mandatory: **"What this clean did NOT check"** section declaring coverage gaps (dynamic refs, build-time includes, historical context).

## The deletion step

`/wbClean` doesn't delete. To actually remove things, follow up with an explicit instruction in the same session:

```
"Delete all HIGH-confidence items from the last clean report."
```

The two-step discipline (detect, then remove) prevents silent loss of code the AI misclassified.

## The one mistake to avoid

**Auto-deleting everything the report flags.** `/wbClean` can be wrong about dead files (dynamic imports, reflective code, build-time string references). HIGH-confidence items are nearly always safe; MEDIUM items need a human glance. A 10-second sanity check per MEDIUM item is cheap.

## When /wbClean is the wrong command

- Restructuring code without changing behavior → `/wbRefactor`.
- Finding a specific bug → `/wbDebug`.
- Verifying release-readiness → `/wbAudit`.
- Checking tests pass → `/wbTest`.

`/wbClean` answers one question: *"what debris should I delete?"*

> For deeper reading: [`docs_claude/commands/wbClean/wbClean_practical_claude.md`](../../docs/docs_claude/commands/wbClean/wbClean_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).
## Self-correct mode (dual-mode invocation)

```
/wbClean <scope_folder>           # normal mode — produce a fresh output file
/wbClean <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbClean` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- HELP_GATE_END -->

**ROLE:** The Entropy Auditor
**TARGET:** The provided directory path.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the report (relative links, full-syntax commands, self-correct mode).

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# Clean: <scope> — <YYYY-MM-DD>` *(or the legacy `# Clean Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Clean-specific gap-fills:

- Plain-text candidate file paths → relative markdown links per §1.
- Bare `/wbPlan` reference at the bottom → full-syntax `/wbPlan <target>` per §2.

## ━━━ OBJECTIVE ━━━
Your job is to scan the target directory for "Entropy" (dead code, unused files, empty folders, and obsolete dependencies) and generate a cleanup report. **DO NOT DELETE ANY FILES YOURSELF.** 

## ━━━ PHASE 1: RECONNAISSANCE ━━━
1. Read the `.wb/workflows/context.md` to understand what is actually important.
2. Search for:
   - Components or functions that are never imported.
   - Files with `.bak`, `.old`, or commented-out massive blocks of code.
   - Folders that are entirely empty or only contain useless wrappers.

## ━━━ PHASE 2: REPORT GENERATION ━━━
Create a report detailing your findings. 
- **Path:** `.wb/workflows/reports/<YYYY>/<MM>/<DD>/cleans/clean_<target>_<YYYYMMDD>.md`
- **No `<model>/` subfolder.** Create-or-append: if the file exists, append your clean report as the next Entry #N tagged `*(ModelName — HH:MM)*`.
- **Smart Merge:** When appending, READ existing entries first. If you found the same dead-code candidate as a previous model (same file/function), add your vote to a **Model Votes** section and update the **Consensus Table** (`# | Candidate | Confidence | Models | Priority`) instead of duplicating. New unique findings get added as new rows. Add a merge log at the bottom.
- **First model?** Just write normally as Entry #1. Consensus Table will be created by the second model.
- **Format:** Group findings into categories: [High Priority (Breaking Debt)], [Medium (Clutter)], [Low (Cosmetic)]. Apply output_conventions.md §1 (relative links for every file path) and §2 (full-syntax for any /wb* command cited).
- **Next Steps:** End the report with a `## 🧭 What's Next?` section: *"Run `/wbPlan <target>` to generate a safe execution matrix for these deletions, then `/wbNext <target>` for the broader picture."*

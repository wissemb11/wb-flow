# /wbRefactor: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbRefactor`

## One form

```
/wbRefactor <file-or-folder>
```

## When to run

Only when all of these are true:
- A recent `/wbAudit` flagged this target as needing restructure.
- Tests exist and currently pass.
- No open `/wbDebug` report on this target.
- You're in the polish phase, not the feature phase.

If any of these aren't true, don't run it. The command will likely refuse; you save time by not trying.

## When *not* to run

- Response to a bug → `/wbDebug` first, then fix, then audit.
- Code you just wrote and haven't tested → write tests first.
- Code that works but "looks old" without audit backing → wait for audit.
- Entire package refactors in one go → split into file-level refactors.

## The audit-refactor sequence

```
/wbAudit <pkg>                    # identifies what needs restructure
# review the audit findings
/wbRefactor <specific-file>       # restructure one file at a time
/wbTest <pkg>                     # confirm tests still pass
/wbAudit <pkg>                    # confirm refactor improved things
/wbGit                            # commit the refactor
```

Note the *bracketing audits*. The first says "needs refactor." The second confirms "refactor helped." Without the second audit, you might ship a refactor that cleaned one thing while making another worse.

## What /wbRefactor preserves

- **Public signatures.** Exported functions keep their arguments and return types.
- **Error behavior.** Same throws for same inputs.
- **Observable side effects.** Network calls, storage writes, events emitted.
- **Performance characteristics.** Approximately — refactor shouldn't make things 10× slower.

## What /wbRefactor changes

- Internal structure (file splits, function extractions).
- Internal naming (private function names can change).
- Dead code removal (if clearly dead and tests confirm).
- Formatting and comments.

## The mistake to avoid

**Using `/wbRefactor` to "improve" code that isn't broken.** If there's no audit finding, don't refactor. Every refactor carries non-zero risk of introducing subtle behavior changes. Random cleanup of working code is pure downside.

## When /wbRefactor is the wrong command

- Bug fix → `/wbDebug` then describe the fix.
- New feature → just describe the feature.
- Renaming a function used across the monorepo → the blast radius is too big; use `/wbPlan` to coordinate.
- Converting legacy Vuetify to wbc-ui2 components → `/wbToWBC` (the specialized version of this).

> For deeper reading: [`docs_claude/commands/wbRefactor/wbRefactor_practical_claude.md`](../../docs/docs_claude/commands/wbRefactor/wbRefactor_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).
## Self-correct mode (dual-mode invocation)

```
/wbRefactor <scope_folder>           # normal mode — produce a fresh output file
/wbRefactor <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbRefactor` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- HELP_GATE_END -->

**ROLE:** The Surgeon
**TARGET:** The provided component, function, or path.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the summary report (relative links, full-syntax commands, self-correct mode).

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# Refactor: <scope> — <YYYY-MM-DD>` *(if a report file is produced).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Refactor-specific gap-fills:

- Plain-text "before/after" file references → relative markdown links per §1.
- Bare `/wbTest` cited as verification → full-syntax `/wbTest <target>` per §2.

---

## ━━━ OBJECTIVE ━━━
Your job is to restructure, optimize, or upgrade the target code (e.g., migrating Vue 2 Options API to Vue 3 Composition API). **CRITICAL RULE:** You must not change the component's visual behavior, its props, or its emit signatures unless explicitly instructed. No new features allowed.

## ━━━ PHASE 1: CONSTRAINT SYNC ━━━
1. Read the local `context.md` to understand the framework version and styling rules.
2. Analyze the target file to map all Inputs (props/args) and Outputs (emits/returns/visuals).

## ━━━ PHASE 2: SURGICAL TRANSFORMATION ━━━
1. Rewrite the logic cleanly, modernizing syntax and improving performance.
2. Remove redundant logic or duplicate states.
3. Ensure absolute parity with the original Inputs and Outputs.

## ━━━ PHASE 3: VERIFICATION ━━━
Provide a short summary report confirming what structural changes were made and explicitly stating that the external API remains identical. Apply output_conventions.md §1 (relative links for every file changed) and §2 (full-syntax for any /wb* command cited).

End the report with:

## 🧭 What's Next?

Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically `/wbTest <target>` to verify behavior parity, then `/wbReview <target>` to validate the refactor).

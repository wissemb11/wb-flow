# /wbDoc: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbDoc`

## Two forms

```
/wbDoc <file>        # JSDoc on functions + inline comments
/wbDoc <folder>      # README + JSDoc across the folder
```

## When to run

- Before `/wbRelease` + `/wbPublish` — so npm users get current docs.
- When adding a new public export (document it immediately, before consumers depend on undocumented behavior).
- When `/wbAudit` flags missing JSDoc.
- Monthly-ish on actively-edited packages — docs drift fast.

## When *not* to run

- On a file that `/wbAudit` flagged for refactor — docs will be stale in a week.
- On internal helpers that aren't exported — documenting private is noise.
- On boilerplate — `package.json`, `vite.config.js`, etc. don't need generated docs.

## What good output looks like

- JSDoc with `@param`, `@returns`, `@example`, and `@remarks` for gotchas.
- Examples drawn from actual call sites, not invented.
- Explicit mention of open architectural decisions when relevant.
- Conventions from `dev.md` surfaced in the README (the `:wbCode="false"` rule, the `apiResponse_` cache, the `__WBC_PRO__` gate).

## What bad output looks like

- "This function takes a parameter" — restatement.
- "Use this carefully" — vague warning without specifics.
- Invented examples that don't match any real usage.
- Examples missing the `:wbCode="false"` you always apply.

If you see any of these, re-prompt: *"ground examples in actual call sites. Name the project-specific conventions. Drop generic prose."*

## The context.md sync

After `/wbDoc`, check that `context.md` API section matches what you just documented. If they disagree, pick one and fix the other — they should always agree.

## When /wbDoc is the wrong command

- Code review → `/wbAudit`.
- Finding dead code → `/wbClean`.
- Understanding how something works → read the code or `/wbContext --focus=<x>`.
- Writing user-facing marketing copy → `/wbBroadcast`, not `/wbDoc`.

> For deeper reading: [`docs_claude/commands/wbDoc/wbDoc_practical_claude.md`](../../docs/docs_claude/commands/wbDoc/wbDoc_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbDoc <scope_folder>           # normal mode — produce a fresh output file
/wbDoc <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbDoc` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-f` → `--focus`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Scribe
**TARGET:** The provided file or folder.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the summary report (relative links, full-syntax commands, self-correct mode).

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# Doc: <scope> — <YYYY-MM-DD>` *(if a report file is produced).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Doc-specific gap-fills:

- Plain-text mentions of documented files → relative markdown links per §1.
- Bare `/wbReview` cited → full-syntax `/wbReview <target>` per §2.

---

## ━━━ OBJECTIVE ━━━
Your job is to document the code beautifully. **CRITICAL RULE:** You are forbidden from modifying any functional logic, variable names, or architecture. Your only output must be comments and markdown files.

## ━━━ PHASE 1: DISCOVERY ━━━
1. Read the target code to understand its purpose, inputs, and outputs.
2. Cross-reference with `context.md` to understand the broader package context.

## ━━━ PHASE 2: INJECTION ━━━
1. **For Files:** Inject professional JSDoc/TSDoc comments above every major class, function, and complex logic block. Explain *why* it does something, not just *what* it does.
2. **For Folders:** Generate or update a comprehensive `README.md` explaining the module's purpose, usage examples, and API surface.

## ━━━ PHASE 3: REPORT ━━━
Provide a brief summary of what files were documented. Apply output_conventions.md §1 (relative links for every documented file) and §2 (full-syntax for any /wb* command cited).

End the report with:

## 🧭 What's Next?

Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically `/wbReview <target>` to validate doc accuracy, or `/wbDeploy` if the docs are user-facing).

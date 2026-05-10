# /wbDebug: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbDebug`

## Two forms

```
/wbDebug "<error message>"        # start from the symptom
/wbDebug <file-path>              # investigate a specific file
```

Both produce a hypothesis first, fix second. If you get a fix without a hypothesis, the command was run wrong.

## When to run

- First response to any error you don't immediately recognize.
- When tests fail in ways that aren't obviously test-wrong or code-wrong.
- When behavior is "off" but no error is thrown.
- When inheriting bug reports you haven't investigated yet.

## When *not* to run

- Typo or syntax error you can see at a glance. Just fix it.
- Bug you already know the cause of. Describe the fix directly.
- "Is this code good?" — that's `/wbAudit`, not debug.

## Reading the output

Every run produces:

1. **Hypothesis** — the AI's best guess, specific.
2. **Evidence to check** — steps you can run to verify.
3. **Pause** — waiting for your feedback.
4. **Fix proposal or refusal** — only after hypothesis is confirmed.

## The pause is non-negotiable

If the AI proposes a fix without waiting for you to verify, push back:

```
"You skipped the pause. First tell me why you think this is the cause.
Then I'll check. Then we fix."
```

The pause exists because:
- Wrong hypothesis + fix = new bug introduced, original still there.
- Right hypothesis + fix = clean debugging.
- Unverified hypothesis = gamble.

## When the hypothesis is wrong

Tell the AI directly: "hypothesis is wrong because X." The AI should explicitly acknowledge and reform. If it defends the original hypothesis, re-prompt harder: *"I just told you the hypothesis is wrong. Accept that and reform based on my new information."*

## The interaction with open decisions

If `context.md` has an open architectural decision, and the bug symptom maps to that decision, the AI should **refuse to fix**. Example: `extractSubObject` array handling is open; a bug that comes from this is not a bug — it's a design question.

Surface the decision. Don't silently fix.

## When /wbDebug is the wrong command

- Code quality review → `/wbAudit`.
- Plan verification → `/wbReview`.
- Finding dead code → `/wbClean`.
- Rewriting working code → `/wbRefactor`.

`/wbDebug` answers one question: *"why is this broken?"*

> For deeper reading: [`docs_claude/commands/wbDebug/wbDebug_practical_claude.md`](../../docs/docs_claude/commands/wbDebug/wbDebug_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).
## Self-correct mode (dual-mode invocation)

```
/wbDebug <scope_folder>           # normal mode — produce a fresh output file
/wbDebug <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbDebug` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- HELP_GATE_END -->

**ROLE:** The Detective
**TARGET:** The provided stack trace, error message, or broken file.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the debug report (relative links, full-syntax commands, self-correct mode).

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# Debug: <scope> — <YYYY-MM-DD>` *(or the legacy `# Debug Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Debug-specific gap-fills:

- Plain-text file paths in the Root Cause / Solution sections → relative markdown links per §1.
- Bare `/wbTest` cited as regression check → full-syntax `/wbTest <target>` per §2.

---

## ━━━ OBJECTIVE ━━━
Your job is to fix errors. Do not guess. You must follow the Scientific Method to isolate the root cause before applying a patch.

## ━━━ PHASE 1: INGEST & HYPOTHESIS ━━━
1. Analyze the provided error message or broken behavior.
2. State your Hypothesis clearly: *Why is this failing?* (e.g., "The reactivity loop is triggering because `watch` is mutating its own dependency.")

## ━━━ PHASE 2: ISOLATION ━━━
1. If the root cause is unclear, inject `console.log` tracers or debug points to capture the state.
2. Trace the data flow back to the origin of the mutation.

## ━━━ PHASE 3: RESOLUTION & REPORT ━━━
1. Apply the minimal necessary fix to resolve the error.
2. Generate a report: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/debugs/debug_<target>_<YYYYMMDD>.md` (create-or-append; tag your entry `*(ModelName — HH:MM)*`).
3. The report must explain the Root Cause and the Solution applied. Apply output_conventions.md §1 (relative links for every file referenced) and §2 (full-syntax for any /wb* command cited).
4. End the report with:

## 🧭 What's Next?

Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically `/wbTest <target>` to verify the fix didn't regress anything else).

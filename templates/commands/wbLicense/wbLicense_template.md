# /wbLicense: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbLicense`

## Two modes

```
/wbLicense <file>        # inject __WBC_PRO__ gate + emit pro-required event
/wbLicense <folder>      # audit package for tier leaks and pattern drift
```

## When to run each

**File mode:** immediately after shipping a new premium feature. Before `/wbGit`. Before any consumer imports the unguarded export.

**Folder mode:** periodically (monthly is fine) and always before `/wbRelease` on packages that have Pro features.

## The gate pattern this project uses

```js
if (typeof __WBC_PRO__ === 'undefined' || !__WBC_PRO__) {
  this.$emit('pro-required', { feature: '<name>' });
  return;
}
// premium logic here
```

Always `typeof` check first — `__WBC_PRO__` is undefined in dev without the define plugin, and ReferenceError kills the flow. The `pro-required` event is the project's convention for surfacing upgrade CTAs to the parent.

If you find a different pattern in existing code (global `window.__WBC_PRO__`, env var `VITE_WBC_PRO`, silent fallback), it's drift. Audit mode flags this.

## The security caveat

`__WBC_PRO__` is **client-side**. Anyone with DevTools can flip it. This is by design — the wbc-ui2 model is:

- **Client gate** (`__WBC_PRO__`) = convenience barrier. Stops honest users from wandering into Pro features by accident.
- **Server gate** (in your API) = actual security. Stops adversarial users.

`/wbLicense` handles the first. `/wbSecure` + your backend handle the second. Don't confuse them.

## Reading the audit output

Three finding classes, ranked:

- **LEAK** = Pro code runs for Free users. High priority.
- **INCONSISTENT** = gate works but pattern differs from convention. Medium priority.
- **OK** = correctly gated. Just reassurance.

Every audit also names what it didn't check (notably: runtime bypass, server-side enforcement, business logic).

## The one mistake to avoid

**Treating `/wbLicense` as security.** It's not. If someone bypasses the gate and accesses a Pro feature, the worst case should be: they use a nice-to-have for free. The *data* should never be at risk because the server should enforce the same tier check independently. If your Pro feature leaks sensitive data when the client gate is bypassed, the feature is designed wrong, not the gate.

## When /wbLicense is the wrong command

- Pure security / vulnerability scan → `/wbSecure`.
- Generic code quality review → `/wbAudit`.
- Finding leaks in existing ungated code you haven't tier-decided yet → `/wbVision` first (what's Pro?), then `/wbLicense`.

> For deeper reading: [`docs_claude/commands/wbLicense/wbLicense_practical_claude.md`](../../docs/docs_claude/commands/wbLicense/wbLicense_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--scope` | `-s` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbLicense <scope_folder>           # normal mode — produce a fresh output file
/wbLicense <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbLicense` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-s` → `--scope`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Gatekeeper
**TARGET:** The provided component or application path.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the verification report (relative links, full-syntax commands, self-correct mode).

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# License: <scope> — <YYYY-MM-DD>` *(if a report file is produced).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

License-specific gap-fills:

- Plain-text component file references → relative markdown links per §1.
- Missing tier coverage (Free / Pro / Dev) in the verification table → fill from current `monorepo_rules.md`.

---

## ━━━ OBJECTIVE ━━━
Your job is to enforce the business logic of the monorepo. Ensure that premium components are properly gated behind Pro/Dev tier checks and that licensing mock mechanisms are safely implemented.

## ━━━ PHASE 1: CONTEXT SYNC ━━━
1. Read the local `context.md`.
2. Strictly review the global `core2/.wb/workflows/monorepo_rules.md` (specifically the Licensing and Tier logic section).

## ━━━ PHASE 2: IMPLEMENTATION ━━━
1. Analyze the target component. Does it expose premium features to Free users?
2. Inject the standard licensing wrapper or API key simulation logic as defined in the monorepo rules.
3. Ensure there is a graceful fallback UI for users who do not have the Pro license (e.g., a "Upgrade to Pro" overlay).

## ━━━ PHASE 3: VERIFICATION ━━━
Provide a short summary report confirming that the component now correctly handles `Free`, `Pro`, and `Dev` environments. Apply output_conventions.md §1 (relative links to every file changed) and §2 (full-syntax for any /wb* command cited).

End the report with:

## 🧭 What's Next?

Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically `/wbTest <target> --scope=licensing` to verify the gate works in all 3 tiers).

# /wbAudit — Practical

## The two modes

```
/wbAudit <folder> # strategic: score + findings + recommendation
/wbAudit <file> # surgical: flaws + existing-vs-suggested diff
```

The folder mode is what you run before `/wbRelease`. The file mode is what you run when you're about to refactor something or got a bug report on a specific file.

## When to audit

- **Before `/wbRelease`** — folder audit on the package being released.
- **Before `/wbDeploy`** — folder audit on the app being deployed.
- **After inheriting code** — folder audit on the package to baseline the debt.
- **Before refactoring a specific file** — file audit on that file.
- **After `/wbDebug` finds a root cause** — file audit to see if similar patterns exist elsewhere.

Do NOT audit:
- Work in progress. Audit the *finished* thing.
- Third-party code you can't fix. Audit only code you control.
- Files you already know are broken (you don't need a score; you need `/wbDebug`).

## Reading the audit

A useful audit has five things. A useless audit is missing at least one:

1. **Score** with a ship/don't-ship recommendation.
2. **Findings ranked by severity** (BLOCKER / MAJOR / MINOR).
3. **Specific file + line references**.
4. **"What this audit did NOT check"** section.
5. **Next command** (usually `/wbPlan` to fix blockers).

If any of these are missing, re-run with "harsher."

## The rubber-stamp failure mode

Default LLM agreeableness produces audits that say "looks good overall, minor improvements possible." This is always wrong for non-trivial packages. Every active package has at least one MAJOR finding.

Counter-prompt: *"Re-audit. Assume a paying customer who hates this codebase is about to file a bug report. Read reports/ for prior audits — unresolved findings are by definition current findings. Flag subtle divergences, not generic advice. Name files, functions, line numbers."*

## The "don't resolve open decisions" rule

If `context.md` contains an open architectural decision (e.g., "extractSubObject array handling: undecided"), the audit must **surface** that decision, not resolve it. A good audit says "this is open; don't let new consumers lock it in." A bad audit says "you should probably go with structural."

Audits are for describing reality, not deciding architecture.

## What /wbAudit cannot do

- **Performance.** Audit reads code, not runtime. Use `/wbTest --profile`.
- **Security.** Audit is general-purpose. Use `/wbReview --security` for adversarial checks.
- **Business logic correctness.** Audit can't tell if your feature *should* exist.
- **User experience.** Audit reads code, not UX.

Every good audit names these limits in its "did NOT check" section.

## When /wbAudit is the wrong command

- You want to verify a specific change is correct → `/wbReview` (surgical, scoped to a change).
- You want to run tests → `/wbTest` (mechanical verification).
- You want to find *why* something's broken → `/wbDebug`.
- You want to clean up dead code → `/wbClean`.

`/wbAudit` answers one question: *"Is this code ready to ship?"*

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Documented shortcuts are listed below.

| Long form | Shortcut |
|---|---|
| `--profile` | `-p` |
| `--scope` | `-s` |
| `--security` | `-S` |
| `--act` | `-a` |
| `--wbPlan` | `-P` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

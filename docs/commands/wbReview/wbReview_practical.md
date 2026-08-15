# /wbReview — Practical

## When to use it (and when you'd mistakenly reach for /wbAudit)

```
/wbReview <target> --plan=<path-to-plan>
```

Required: `--plan`. If you don't have a plan file, you're at the wrong command. Use `/wbAudit`.

### Good fits for /wbReview

- AI worker finished a plan's tasks; you want to verify before merging.
- You finished executing a plan yourself and want a second pass.
- A quick hotfix went out under pressure; you want a post-hoc check against the (brief) plan that was written.
- Docs rewrite followed a plan; want to verify nothing hallucinated.

### Bad fits for /wbReview

- Pre-release sanity check → `/wbAudit`
- "Is this file good?" → `/wbAudit <file>`
- Tests failing? → `/wbTest`, then `/wbDebug`
- You never wrote a plan → doesn't apply

## Reading the review output

Three possible verdicts:

- **🟢 PASS** — every plan task confirmed, no regression, no rule violations.
- **🟡 PASS WITH DEBT** — most tasks confirmed; minor issues tracked for later. Safe to merge if debt is logged.
- **🔴 FAIL** — at least one task claimed complete but actually incomplete, or a rule was violated. Don't merge.

A good review is specific about which tasks failed and why. "Task 3 incomplete: test coverage is dev-mode only, prod-mode branch untested." Not "some issues remain."

## The key check

**Did the worker mark tasks complete without actually finishing them?** This is the single failure mode `/wbReview` is best at catching. Checkbox state is aspirational; code state is real. Review verifies code state against checkbox claims.

If checkboxes ✅ but code ❌, the review fails that task and re-opens it in the plan file.

## The "what the review found that the plan missed" section

A good review doesn't just verify — it catches side effects the plan author didn't anticipate:

- New dependencies introduced.
- Related files modified but not mentioned.
- Rules violated that the plan didn't explicitly invoke.
- Tests that stopped passing (discovered during review).

This is where `/wbReview` earns its keep beyond checkbox verification.

## The mistake to avoid

**Skipping `/wbReview` because you're the one who executed the plan.** Your own work is the work you're least qualified to judge. If the plan was big enough to need a plan, it's big enough to review. Use an adversarial prompt: *"assume the worker was lazy. Where did they cut corners?"*

## When /wbReview refuses

If the plan file is missing, malformed, or if the current code state has no detectable relationship to the plan, `/wbReview` will refuse and tell you why. Don't work around it — fix the plan-to-code linkage first. The review is only useful if there's something to review against.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbReview --execute` and `/wbReview -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--plan` | `-p` |
| `--act` | `-a` |
| `--wbPlan` | `-P` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

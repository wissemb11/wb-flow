# /wbDebug — Practical

## Two forms

```
/wbDebug "<error message>" # start from the symptom
/wbDebug <file-path> # investigate a specific file
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

---

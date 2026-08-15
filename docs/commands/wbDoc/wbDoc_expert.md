# /wbDoc — Expert

## What `/wbDoc` architecturally is

A **comment-and-markdown emitter** that reads source + context + call sites and writes JSDoc annotations and README sections. AST-safe in the sense that it only mutates comment nodes and markdown files — never executable code.

the agent's version calls this "AST-safe annotation pass." That's accurate but limited. The interesting design decision is not the AST safety (trivial if you scope mutations to comments); it's the *grounding requirement* — that docs must be traceable to actual code + actual conventions, not invented.

## The grounding requirement

Most AI-generated docs suffer from confabulation: plausible-sounding prose about what a function does, based on pattern-matching the function name. This is worse than no docs, because it looks authoritative.

`/wbDoc` defends against this by reading:

- **The function body.** Actual behavior, not inferred.
- **The call sites.** Actual usage, for examples.
- **`context.md` and `dev.md`.** Project-specific conventions that should show up in docs.
- **Prior audit reports.** Known gotchas, open decisions.

A doc that contradicts any of these is hallucinated. A doc that omits conventions (`:wbCode="false"`, `apiResponse_` caching) is incomplete. The command's prompt is structured to check all four before emitting.

## Three design decisions worth naming

### 1. Refusal to document pre-refactor targets
If an audit flagged a file as refactor-bound, documenting it produces stale docs within a week. The command refuses. This is correct — negative-value work is still work; skip it.

### 2. Examples from real call sites, not invented
JSDoc examples are drawn from existing consumer code, not synthesized. This means the examples actually work (they're copies of code that runs). Invented examples sometimes don't compile; grounded examples always do.

### 3. `context.md` sync as follow-up, not baked-in
After generating docs, the command suggests updating `context.md` to match. It doesn't do this automatically — the user decides. Rationale: context.md is often hand-curated with information beyond what docs capture; automatic overwrite would lose nuance.

## The README vs. JSDoc distinction

Two output formats, different purposes:

- **JSDoc** — in-file, function-level, consumed by IDE tooling. Must be accurate to the signature.
- **README** — package-level, human-readable, consumed when deciding whether to use the package. Must explain *why* you'd want this, not just *how* it works.

Good JSDoc tells you how to call it correctly. Good README tells you whether to bother. The command produces both but with different prompt structures for each.

## Where the command leaks

1. **Confabulation is not perfectly prevented.** Despite grounding, the AI can still produce plausible-sounding `@remarks` that aren't quite accurate. User verification is required; the command makes it easier, not certain.

2. **Examples can be copied verbatim including bugs.** If the consumer code has a bug, and that code is the source of the JSDoc example, the example propagates the bug. `/wbDoc` doesn't cross-reference examples against tests.

3. **No doc-drift detection.** Six months after `/wbDoc` runs, the code might have changed but the JSDoc hasn't. Nothing flags this automatically. You'd need a periodic `/wbDoc --audit` mode; not implemented.

4. **README templates are implicit.** The command's sense of "what a good README looks like" is prompt-level, not schema-level. Two runs on the same package might produce structurally different READMEs. Not critical, but not consistent either.

5. **No versioned examples.** If an API changes, the README's examples show the new API. Old versions of the README (on old npm versions) show outdated examples. This is a problem of versioned documentation that `/wbDoc` doesn't address.

What `wb-flow-docs`'s playbook gets wrong about `/wbDoc`: framing it as API documentation generation, when the Claude edition generates docs from actual call-site usage, not from type annotations. This produces more useful examples but less comprehensive coverage — a deliberate tradeoff the sibling edition doesn't acknowledge.

## One-paragraph verdict

A comment-and-markdown emitter whose architectural contribution is *grounding* — forcing docs to be traceable to source + context + conventions rather than confabulated. The "AST-safe annotation" framing from gemini understates what's really a discipline against hallucination. Correct in refusing to document pre-refactor targets, in drawing examples from real call sites, and in treating JSDoc and README as separately-prompted outputs. Weakest in confabulation prevention (mitigation, not elimination), bug-propagation in examples, doc-drift detection, README schema consistency, and versioned-docs handling. Correct for solo monorepo work; would benefit from drift detection and schema-driven README generation for larger-scale use.

---

# /wbLicense — Expert

## What `/wbLicense` architecturally is

A **tier-gate standardizer** that operates in two modes: inject (on files) and audit (on folders). Binds tier definitions from `monorepo_rules.md` to enforcement patterns in source code. Its job is *consistency and completeness*, not security.

The architectural contribution: centralizing tier-gate patterns in a single command so that cross-package pattern drift is detected and fixable. Without it, each package would evolve its own gate convention, and the monorepo-wide "is this feature Pro?" question would have 20 different answers.

## The gate pattern convention

The project standardizes on:

```js
if (typeof __WBC_PRO__ === 'undefined' || !__WBC_PRO__) {
 emit('pro-required', { feature: '...' });
 return;
}
```

Two choices worth naming:

1. **`typeof` guard.** Defends against dev environments where `__WBC_PRO__` is never defined. Without it, ReferenceError kills the fallback path.
2. **Event-emitting fallback.** Pro-required actions emit `pro-required`, not throw or silent-fail. Parent components catch this and show upgrade CTAs. The gate is *non-blocking* from the component's perspective — it communicates to the parent rather than erroring out.

These are conventions, not protections. `/wbLicense` standardizes them; gemini's "AuthZ middleware injector" framing overstates what's really a code-pattern normalizer.

## The security boundary, honestly

`__WBC_PRO__` is client-side. Any user with DevTools can flip it. This is not a bug — it's the explicit design:

- **Client gate** = convenience. Stops 99% of users from stumbling into Pro features.
- **Server gate** = security. Stops the 1% of adversarial users.

`/wbLicense` only addresses the first. If your architecture relies on client-side gating for actual security, `/wbLicense` cannot save you. The audit explicitly names this limitation in every report.

## Three design decisions worth naming

### 1. Two modes with different outputs
File mode produces mutations (diff-style Existing/Suggested). Folder mode produces reports (findings with severity). Collapsing them into one mode ("check and optionally fix") would blur the decision: folder-level Pro audits are about *consistency*, file-level injection is about *specific code*. Different problems, different outputs.

### 2. Pattern drift as a first-class finding
Not just "this is ungated" but also "this is gated inconsistently." Three gate patterns (`global`, `env`, `strict boolean`) are all functionally equivalent but produce pattern drift. A package with three patterns is harder to audit and harder to change later.

### 3. Reference to `monorepo_rules.md` for tier definitions
Tier semantics live in one place. `/wbLicense` reads them rather than inferring what "Pro" means for each package. This forces product-level tier decisions to be made once and then referenced, not re-derived per package.

## Where the command leaks

1. **No runtime detection.** The audit reads source. It cannot detect a Pro feature that's hidden in a minified chunk but reachable via route or prop mutation.

2. **Emit event is a convention, not enforced.** If a new component's Pro gate throws instead of emitting, `/wbLicense` audit will mark it OK (it has *some* gate). The "emit pro-required" specificity is only enforced in inject mode, not audit mode.

3. **No tier-promotion detection.** If a Free feature gets upgraded to Pro, `/wbLicense` won't flag that existing consumers were using it for free. The change is invisible to the audit until someone specifically asks.

4. **Business logic vs. license logic blur.** Some features should be Pro on some plans but Free on others (volume-based, customer-specific). `/wbLicense` has no way to express conditional tier logic. It only supports binary gate/no-gate.

5. **Silent drift if `monorepo_rules.md` ages.** Tier definitions from 6 months ago still drive today's audit. If the product redefined Pro and forgot to update the rules file, the audit is authoritative about a wrong truth.

What `wb-flow-docs`'s playbook gets wrong about `/wbLicense`: treating it as legal boilerplate injection, when the actual mechanism is tier-gating enforcement: the command reads WBC_PRO flags and generates license checks that integrate with the existing vuex store-based tier system. Runtime gating, not license text.

## One-paragraph verdict

A tier-gate standardizer whose real value is centralizing *pattern consistency* across a monorepo — the "AuthZ middleware injector" framing from gemini is grandiose. Correct in the two-mode split (inject/audit), in treating pattern drift as its own finding class, and in binding tier definitions to a single reference file. Weakest in runtime detection, tier-promotion handling, conditional logic, and `monorepo_rules.md` freshness. The security caveat — client-side only, convenience barrier not protection — is the most important thing users must internalize about this command. Correct for solo monorepo work with a flat free/Pro dichotomy; would need conditional tier support and server-gate cross-reference for real enterprise use.

---

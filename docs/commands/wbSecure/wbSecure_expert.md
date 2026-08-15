# /wbSecure — Expert

## What `/wbSecure` architecturally is

A **vulnerability-pattern scanner** with structured severity classification. Reads source against a fixed checklist (secrets, XSS, IDOR, dep CVEs, tier-check completeness), classifies findings, and gates `/wbDeploy` on CRITICAL.

the agent's version frames this as "taint analysis tracing through the component tree." That's directionally true for some of the checks (especially XSS detection), but the scope is broader. The command isn't pure taint analysis — it's pattern matching plus AI-driven semantic understanding plus dep-list comparison.

## The scanner's checklist

Fixed scope, not freeform:

1. **Hardcoded secrets**: regex match against API key formats, token patterns, password literals.
2. **XSS vectors**: `v-html`, `innerHTML`, `dangerouslySetInnerHTML`, raw render of user-controlled data.
3. **IDOR (Insecure Direct Object References)**: missing tier checks before sensitive operations, missing user-ID validation.
4. **Outdated dependencies**: cross-reference `package.json` against known-vulnerable versions.
5. **Tier-check completeness**: cross-reference with `monorepo_rules.md`; flag Pro features without `__WBC_PRO__` gate.

Findings outside this checklist are surfaced as observations, not classified findings. The fixed scope is what makes the scan reproducible.

## The "taint analysis" claim, honestly

Real taint analysis requires:
- Source identification (what data is "tainted"?)
- Sink identification (what operations are dangerous?)
- Flow analysis (does taint reach a sink?)

`/wbSecure` does this informally:
- Sources: API responses, props, route params, user input fields.
- Sinks: `v-html`, `eval`, `new Function`, DOM injection points.
- Flow: LLM reads code and reasons about whether the source reaches the sink.

This is *LLM-mediated semi-formal taint analysis*. Real taint analysis (deterministic, AST-based) is more rigorous. The LLM version misses subtle flows; it also catches flows that AST tools miss because the LLM understands semantics. Tradeoff.

Calling this "taint analysis" without qualification overstates the formal rigor. Calling it "pattern matching" understates the semantic reasoning. It's somewhere in between.

## Three design decisions worth naming

### 1. CRITICAL/WARNING/SAFE as a fixed three-bucket classification
Not an N-point scale, not a subjective verdict. Three buckets with explicit definitions:
- CRITICAL = immediate action required, blocks deploy.
- WARNING = should fix, doesn't block.
- SAFE = no finding under checklist scope.

The discreteness makes the scan output gateable — `/wbDeploy` reads it and decides, no human interpretation in the loop.

### 2. Refusal-recording as a `/wbDeploy` gate
A CRITICAL finding writes a refusal record that `/wbDeploy` reads. This is closed-loop integration: security findings have automatic downstream consequences, not just informational output. Without this gate, security audits would be advisory and frequently ignored.

### 3. Mandatory "did NOT check" section
Same discipline as `/wbAudit` and `/wbClean`. Names the scope boundaries:
- Server-side anything
- Supply chain (transitive deps)
- Runtime tampering
- Authentication design
- Zero-days

This prevents users from treating SAFE as "secure" — the section explicitly enumerates what wasn't part of the scan.

## Where the command leaks

1. **Scanner is checklist-bound.** Novel vulnerability patterns (new JS framework features, recent attack types) don't get caught until the checklist is updated. The list is static; threats evolve.

2. **Hardcoded-secret detection is regex-based.** A novel API key format or a deliberately-obscured secret can slip past. Counter-balance: most real leaks are sloppy, not clever.

3. **Dependency CVE check uses a snapshot.** The CVE database the AI knows about has a knowledge cutoff. Recently-disclosed vulnerabilities may not surface. `npm audit` should run alongside.

4. **No data-flow tracking across files.** Source-in-A → sink-in-B might be missed if the analysis stays single-file. Mitigated by LLM context, not solved.

5. **False positives in tier-check completeness.** A function might be Pro-gated by its caller, not by itself; `/wbSecure` looking at the function in isolation may flag it. Counter: the AI understands consumer context for popular packages, but coverage is uneven.

## The interaction with `/wbLicense`

Both commands check tier-gate completeness, but with different framing:

- `/wbLicense` checks consistency: "are gates applied uniformly?"
- `/wbSecure` checks security: "could a missing gate let an attacker access Pro features?"

The overlap is real. The distinction is intent. License is about product hygiene; secure is about adversarial exploit. A package might have consistent gates (license OK) but those gates might be bypassed by a specific attack pattern (secure not OK). Run both.

What `wb-flow-docs`'s playbook gets wrong about `/wbSecure`: treating it as a general security scanner, when the Claude edition adds tier-enforcement checks (is the premium feature properly gated?) and the soft-fail vs hard-fail distinction. A secrets scan without tier-gating verification is incomplete for this monorepo's architecture.

## One-paragraph verdict

A vulnerability-pattern scanner whose architectural contribution is the *closed-loop integration with deploy* — security findings have automatic consequences via `/wbDeploy` refusal, not just advisory reporting. The "taint analysis" framing from gemini is partially accurate but overstates formal rigor; the command is LLM-mediated semi-formal pattern + flow reasoning. Correct in fixed three-bucket severity, in mandatory "did NOT check" discipline, and in the refusal-record integration. Weakest in checklist staleness, regex-based secret detection, CVE snapshot lag, cross-file flow tracking, and tier-check false positives. Correct for solo monorepo pre-deploy hygiene; should always be paired with `npm audit`, server-side validation, and periodic real pentests for production-class security.

---

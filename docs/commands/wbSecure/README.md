# /wbSecure — Command Hub

`/wbSecure` performs adversarial security analysis on code, dependencies, and configurations. It takes an attacker's perspective, looking specifically for exploitable weaknesses: known CVEs in dependencies, injection risks in application code, and hardcoded secrets. Unlike `/wbAudit` which evaluates general code quality, `/wbSecure` answers one question: *"can this be exploited?"*

## 🎯 Strategic Position

Security is not quality assurance. `/wbSecure` is the *cheap layer* of security work — a scanner's checklist — not the *complete* one. A SAFE result means no obvious findings under that checklist. It does not mean nothing is wrong. Real-world security still requires human judgment, threat modeling, and ongoing pentests.

- **Before `/wbDeploy`** — mandatory if the app handles user input.
- **Before `/wbPublish`** — for any package that handles untrusted input.
- **After dependency updates** — `npm update` can introduce vulnerable transitive deps.
- **Periodically** (monthly) on production apps.
- **After any security-adjacent code change** — auth, sessions, input handling.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Full scan** | `/wbSecure <target>` | All vulnerability checks across code, deps, and config |
| **Focused** | `/wbSecure <target> --focus="<area>"` | Narrowed to auth, xss, deps, or another domain |

## ✅ What a useful security report contains

1. Findings categorized as 🔴 CRITICAL, 🟡 WARNING, or 🟢 SAFE.
2. **Immediate action items** for CRITICAL findings (revoke this token, sanitize this v-html).
3. CVE references from dependency audits.
4. A **"what this scan did NOT check"** section — server-side logic, zero-days, supply chain.
5. Integration with `/wbDeploy` — CRITICAL findings block deployment automatically.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Server-side vulnerability detection | Threat modeling, backend pentest |
| Supply-chain attack detection | `npm audit` directly |
| Authentication design review | Human security review |
| Generic code quality | [`/wbAudit`](../wbAudit/README.md) |
| Licensing compliance | [`/wbLicense`](../wbLicense/README.md) |
| Dead code removal | [`/wbClean`](../wbClean/README.md) |

It names these limits in every report's "did NOT check" section.

## 📚 Reading Order

1. **[ELI5](wbSecure_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbSecure_practical.md)** — step-by-step on a real project.
3. **[Expert](wbSecure_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbSecure_examples.md)** · **[Part 1](wbSecure_examples.md)** · **[Part 2](wbSecure_examples.md)** — annotated transcripts.
5. **[Exhaustive simulation](wbSecure_exhaustive_simulation.md)** · **[Live demo](wbSecure_live_demo.md)**.

## 🔗 Related

- [`wbSecure.md`](wbSecure.md) — the command reference this hub orients you around.
- [`/wbDeploy`](../wbDeploy/README.md) — reads the latest security report and refuses on CRITICAL.
- [`/wbAudit`](../wbAudit/README.md) — general code quality (not adversarial).
- [`/wbLicense`](../wbLicense/README.md) — compliance and tier-gate checks.

## Quick Reference

```bash
/wbSecure <target>                       # full security scan
/wbSecure <target> --focus="auth"        # narrowed to authentication
/wbSecure <target> --focus="deps"        # dependency-only scan
/wbSecure <target> --focus="xss"         # cross-site scripting
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

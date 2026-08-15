# /wbSecure — Practical

## Two forms

```
/wbSecure <target> # full security scan
/wbSecure <target> --focus="<area>" # narrowed (e.g., auth, xss, deps)
```

## When to run

- **Before `/wbDeploy`** of any user-facing app. Mandatory if the app handles user input.
- **Before `/wbPublish`** of a package that handles untrusted input.
- **After dependency updates** — `npm update` can introduce vulnerable transitive deps.
- **Periodically** (monthly) on production apps.
- **After any security-adjacent code change** — auth, sessions, input handling, anything user-controlled.

## When *not* to run

- On a feature branch you'll throw away.
- Mid-development before the surface is stable.
- As a substitute for proper backend security (server-side validation, real pentests).
- Without server-side equivalent — `/wbSecure` only checks client; real security is server.

## Reading the output

Three severity levels:

- **🔴 CRITICAL** — fix before any further deploy. Blocks `/wbDeploy`.
- **🟡 WARNING** — fix soon. Doesn't block deploy but should be tracked.
- **🟢 SAFE** — verified clean.

CRITICAL findings include immediate action items (revoke this token NOW, sanitize this v-html before next deploy).

## The integration with /wbDeploy

`/wbDeploy` reads the latest `/wbSecure` report and refuses if CRITICAL findings exist. This is automatic. To override (rare, dangerous), you'd need to run `/wbDeploy --force-past-security`, which requires explicit user override.

WARNING findings don't block. They show in the deploy preview as advisory.

## What /wbSecure cannot detect

- **Server-side vulnerabilities** — out of scope; client scan only.
- **Logic bugs that allow privilege escalation** — these need domain understanding.
- **Supply-chain attacks** — `npm audit` is the right tool.
- **Runtime tampering** — DevTools can flip flags; client gating is convenience, not security.
- **Zero-days not yet in CVE databases** — the scanner only knows public vulnerabilities.
- **Authentication design flaws** — needs human security review.

Every report names these limits in its "did NOT check" section.

## When /wbSecure is the wrong command

- Generic code quality → `/wbAudit`.
- Tier-gate consistency → `/wbLicense`.
- Dead code / leftovers → `/wbClean`.
- Pure dep CVE check → `npm audit` directly.

`/wbSecure` answers: *"can this be exploited?"* Specifically.

## The mistake to avoid

**Treating `/wbSecure` SAFE as "secure."** A SAFE result means: no obvious findings under the scanner's checklist. It does not mean: nothing is wrong. Real-world security requires human judgment, threat modeling, and ongoing pentests. `/wbSecure` is the *cheap* layer of security work, not the *complete* one.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbSecure --execute` and `/wbSecure -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |
| `--force-past-security` | `-F` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

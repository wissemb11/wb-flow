# wbSecure — Expert Architecture

> How `/wbSecure` performs adversarial security analysis on code and dependencies.

---

## 1. System Role

`/wbSecure` is a **security analyzer**. It performs adversarial analysis of code for vulnerabilities, dependency risks, and data exposure patterns.

| Property | Value |
|---|---|
| **Role** | ✅ Validator (security) |
| **Input** | Folder or file path |
| **Output** | Security report in `reports/YYYY/MM/DD/security/` |
| **Mutates files** | Never |

---

## 2. Scan Categories

| Category | What It Checks |
|---|---|
| **Secrets** | API keys, tokens, passwords in source |
| **Dependencies** | Known CVEs in npm packages |
| **Input validation** | SQL injection, XSS, path traversal vectors |
| **Data exposure** | Sensitive data in logs, error messages, responses |
| **Authentication** | Weak auth patterns, missing CSRF protection |
| **Configuration** | Insecure defaults, debug mode in production |

---

## 3. Severity Levels

| Level | Example | Action |
|---|---|---|
| **CRITICAL** | Exposed API key in source | Block release immediately |
| **HIGH** | Dependency with known CVE | Update before next release |
| **MEDIUM** | Missing input sanitization | Fix in next sprint |
| **LOW** | Verbose error messages | Track for improvement |

---

## 4. Scan Pipeline

```
Source scan → Dependency audit → Pattern matching → Vulnerability correlation → Report
```

| Stage | Tool Equivalent |
|---|---|
| Source scan | grep for secrets patterns |
| Dependency audit | `npm audit` equivalent |
| Pattern matching | OWASP rule set |
| Correlation | CVE database lookup |

---

## 5. Secure vs. Audit

| Aspect | /wbSecure | /wbAudit --profile=security |
|---|---|---|
| Depth | Adversarial, comprehensive | Surface-level security check |
| Time | 60s+ | 10s |
| Output | Dedicated security report | Section in audit report |
| When | Before public release | Regular development |

---

## 6. What wbSecure Does NOT Do

| Action | Use Instead |
|---|---|
| Fix vulnerabilities | `/wbWork` |
| Penetration testing | External tools |
| Runtime security monitoring | External tools |
| Compliance certification | Manual process |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

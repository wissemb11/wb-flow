# wbSecure — Practical Walkthrough

> How to run security scans and act on findings.

---

## 1. Basic Security Scan

```bash
/wbSecure packages/my-lib
```

```text
[AI] Security scan: packages/my-lib
[AI]
[AI] Findings:
[AI]   [CRITICAL] src/config.js:12 — API key hardcoded
[AI]   [HIGH] lodash@4.17.15 — CVE-2021-23337
[AI]   [MEDIUM] src/api.js:45 — No input sanitization
[AI]
[AI] Score: 4/10 (FAIL — do not release)
```

---

## 2. Dependency-Only Scan

```bash
/wbSecure packages/my-lib --deps-only
```

Scans only `node_modules` for known vulnerabilities.

---

## 3. Acting on Findings

| Severity | Action |
|---|---|
| CRITICAL | Fix immediately — do not commit |
| HIGH | Fix before next release |
| MEDIUM | Add to plan as P2 task |
| LOW | Track in backlog |

```bash
# Fix critical issues
/wbWork . --focus="fix security findings"

# Re-scan
/wbSecure packages/my-lib
```

---

## 4. Pre-Release Security Gate

```bash
/wbTest . --coverage         # tests pass?
/wbSecure .                  # no critical findings?
/wbRelease . --minor         # safe to release
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Full scan | `/wbSecure .` |
| Dependencies only | `/wbSecure . --deps-only` |
| Pre-release gate | `/wbSecure .` then `/wbRelease .` |
| Single file | `/wbSecure src/auth.js` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# wbRelease — Practical Walkthrough

> Step-by-step guide to creating a release with version bump, changelog, and tag.

---

## 1. Basic Release

```bash
/wbRelease packages/my-lib --minor
```

```text
[AI] Pre-flight checks...
[AI]   ✓ Working tree clean
[AI]   ✓ Tests passing (12/12)
[AI]   ✓ No TODOs in src/
[AI]
[AI] Version: 1.0.0 → 1.1.0
[AI] Updating package.json...
[AI] Generating CHANGELOG.md entry...
[AI]
[AI] ## [1.1.0] — 2026-05-11
[AI]   - feat: new validation engine
[AI]   - fix: dropdown alignment
[AI]
[AI] Git tag command (run manually):
[AI]   git tag -a v1.1.0 -m "Release v1.1.0"
[AI]
[AI] Report: reports/2026/05/11/releases/release_my-lib_20260511.md
```

---

## 2. Pre-Release (Beta)

```bash
/wbRelease packages/my-lib --pre=beta
```

Produces version `1.1.0-beta.0`. Subsequent beta bumps increment: `beta.1`, `beta.2`, etc.

---

## 3. After Release

```bash
# Publish to npm
/wbPublish packages/my-lib

# Announce
/wbBroadcast packages/my-lib

# Deploy docs
/wbDeploy packages/my-lib
```

---

## 4. Release Checklist

| Step | Command | Required? |
|---|---|---|
| Run tests | `/wbTest .` | Recommended |
| Audit | `/wbAudit .` | Recommended |
| Release | `/wbRelease . --minor` | Required |
| Tag (manual) | `git tag -a v1.1.0 -m "..."` | Required |
| Publish | `/wbPublish .` | If npm package |
| Broadcast | `/wbBroadcast .` | Optional |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

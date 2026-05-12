# Release Report: my-new-app v1.0.0 — 2026-05-06

> This is a **sample release report** demonstrating the output format of the `/wbRelease` command. It shows how wb-flow documents a version bump, changelog generation, and tag creation for a demo application.

---

## Release Summary

| Field | Value |
|---|---|
| **Package** | `@demo/my-new-app` |
| **Version** | `0.9.0` → `1.0.0` |
| **Type** | Major (breaking changes) |
| **Date** | 2026-05-06 |
| **Released by** | AI via `/wbRelease` |
| **Plan ref** | [plan_my-new-app_20260506.md](../plans/plan_my-new-app_20260506.md) |

---

## Changelog (Auto-Generated)

```markdown
# Changelog — my-new-app

## [1.0.0] — 2026-05-06

### ⚠️ BREAKING CHANGES
- Renamed `initApp()` to `createApp()` for Vue 3 alignment
- Removed deprecated `legacyRouter` export

### ✨ Features
- Added dark mode support with system preference detection
- Implemented `/wbClean` auto-scheduling on pre-commit hook
- New `WBDashboard` component with real-time metrics

### 🐛 Bug Fixes
- Fixed hydration mismatch in SSR mode (#12)
- Resolved CSS specificity conflict in `WBHeader` (#15)

### 📦 Dependencies
- Upgraded `vue` from 2.7.14 to 2.7.16
- Added `@vueuse/core` ^10.0.0
```

---

## Version Bump Details

| File | Change |
|---|---|
| `package.json` | `"version": "0.9.0"` → `"version": "1.0.0"` |
| `CHANGELOG.md` | Prepended v1.0.0 entry (see above) |
| `src/version.js` | `export const VERSION = '1.0.0'` |

---

## Git Tag

```text
$ git tag -a v1.0.0 -m "release: my-new-app v1.0.0"
$ git push origin v1.0.0

Tag: v1.0.0
Commit: a1b2c3d (HEAD -> main)
Date: 2026-05-06T14:30:00Z
```

---

## Pre-Release Checklist

| Check | Status | Notes |
|---|---|---|
| All plan tasks ✅ Done | ✅ | 7/7 tasks complete |
| All validations ≥ 8/10 | ✅ | Lowest: 8/10 (Task #4) |
| `/wbAudit` score ≥ 9/10 | ✅ | 9.5/10 |
| `/wbClean` — no dead code | ✅ | 0 orphans found |
| Tests pass | ✅ | 42/42 passing |
| README updated | ✅ | Installation instructions updated for v1.0 |
| Breaking changes documented | ✅ | Migration guide in CHANGELOG |

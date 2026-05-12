# Release Report: my-new-app v1.0.0 — Post-Release

> Part 2 covers the post-release activities: npm publish output, broadcast notification template, and the verification steps confirming the release was successful.

---

## npm Publish Output

```text
$ npm publish --access public

npm notice
npm notice 📦  @demo/my-new-app@1.0.0
npm notice === Tarball Contents ===
npm notice 1.2kB  package.json
npm notice 3.4kB  README.md
npm notice 856B   CHANGELOG.md
npm notice 12.5kB dist/my-new-app.umd.js
npm notice 8.1kB  dist/my-new-app.es.js
npm notice 2.3kB  dist/my-new-app.css
npm notice === Tarball Details ===
npm notice name:          @demo/my-new-app
npm notice version:       1.0.0
npm notice filename:      demo-my-new-app-1.0.0.tgz
npm notice package size:  9.8 kB
npm notice unpacked size: 28.3 kB
npm notice shasum:        a1b2c3d4e5f6...
npm notice integrity:     sha512-AbCdEf...
npm notice total files:   6
npm notice
+ @demo/my-new-app@1.0.0
```

---

## Post-Release Verification

| Check | Command | Expected | Actual |
|---|---|---|---|
| Package visible on npm | `npm view @demo/my-new-app version` | `1.0.0` | ✅ `1.0.0` |
| Installable | `npm install @demo/my-new-app@1.0.0` | Success | ✅ Installed |
| Git tag exists | `git tag -l v1.0.0` | `v1.0.0` | ✅ Found |
| CHANGELOG entry | `head -20 CHANGELOG.md` | v1.0.0 header | ✅ Present |
| CI/CD green | GitHub Actions | All checks pass | ✅ Green |

---

## Broadcast Template

The release broadcast is a pre-formatted notification for team channels:

```markdown
## 🚀 Release: @demo/my-new-app v1.0.0

**What's new:**
- Dark mode support with system preference detection
- `WBDashboard` component with real-time metrics
- Auto-scheduled `/wbClean` on pre-commit

**⚠️ Breaking Changes:**
- `initApp()` → `createApp()`
- Removed `legacyRouter` export
- See [migration guide](CHANGELOG.md#100---2026-05-06)

**Install:**
```bash
npm install @demo/my-new-app@1.0.0
```

**Full changelog:** [CHANGELOG.md](CHANGELOG.md)
```

---

## Release Artifacts

| Artifact | Location | Size |
|---|---|---|
| npm tarball | `npmjs.com/@demo/my-new-app` | 9.8 kB |
| Git tag | `v1.0.0` on `main` | — |
| Release report (this file) | `.wb/workflows/reports/2026/05/06/releases/` | — |
| Plan file | `reports/2026/05/06/plans/plan_my-new-app_20260506.md` | — |
| Standup | `reports/2026/05/06/standups/standup_my-new-app_20260506.md` | — |

---

## Lessons Learned

| Observation | Action |
|---|---|
| Breaking change in `initApp()` was caught late (Task #6) | Add breaking-change lint to `/wbAudit` profile |
| CSS specificity issue required 3 iterations | Consider adopting CSS Modules for next major |
| Release took 2 hours end-to-end | Target: under 1 hour with `/wbRelease --auto` |

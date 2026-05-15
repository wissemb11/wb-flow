# wbPublish — Practical Walkthrough

> Step-by-step guide to preparing and publishing an npm package.

---

## 1. Basic Publish

```bash
/wbPublish packages/my-lib
```

```text
[AI] Validating package.json...
[AI]   ✓ name: @scope/my-lib
[AI]   ✓ version: 1.1.0
[AI]   ✓ files: ["dist/", "README.md"]
[AI]   ✓ main: dist/index.js
[AI]
[AI] Dry-run contents (npm pack):
[AI]   dist/index.js (2.1 kB)
[AI]   dist/utils.js (1.3 kB)
[AI]   README.md (0.8 kB)
[AI]   package.json (0.4 kB)
[AI]   Total: 4.6 kB
[AI]
[AI] Publish command (run manually):
[AI]   npm publish --tag latest --access public
```

---

## 2. Beta Publish

```bash
/wbPublish packages/my-lib   # version is 1.1.0-beta.0
```

Auto-detects the pre-release tag:
```text
[AI] Publish command:
[AI]   npm publish --tag beta --access public
```

---

## 3. Post-Publish Verification

```bash
# Verify the package is on npm
npm view @scope/my-lib version

# Install in a test project
npm install @scope/my-lib@latest
```

---

## 4. The Release → Publish Flow

```bash
/wbRelease packages/my-lib --minor    # 1. Bump version + changelog
# git tag -a v1.1.0 -m "Release"     # 2. Tag (manual)
# git push --tags                      # 3. Push (manual)
/wbPublish packages/my-lib            # 4. Publish to npm
```

---

## 5. Common Patterns

| Pattern | Command |
|---|---|
| Stable release | `/wbPublish .` (tag: latest) |
| Beta release | `/wbPublish .` (auto-detects beta tag) |
| Dry-run only | `/wbPublish . --dry-run` |
| GitHub Packages | `/wbPublish . --registry=github` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

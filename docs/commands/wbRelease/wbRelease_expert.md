# wbRelease — Expert Architecture

> How `/wbRelease` orchestrates version bumps, changelog generation, and tag creation.

---

## 1. System Role

`/wbRelease` is a **release orchestrator**. It coordinates the version bump, changelog update, and git tag creation into a single deterministic workflow.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker (multi-step) |
| **Input** | Folder path + version strategy |
| **Output** | Release report in `reports/YYYY/MM/DD/releases/` |
| **Mutates files** | Yes — `package.json` (version), `CHANGELOG.md` |

---

## 2. Release Pipeline

```
Scope → Pre-flight checks → Version bump → Changelog generation → Tag text → Report
```

| Stage | Action |
|---|---|
| **Pre-flight** | Verify clean git state, no TODOs, tests pass |
| **Version bump** | Update `package.json` version field |
| **Changelog** | Generate entry from commits since last tag |
| **Tag text** | Produce `git tag -a` command (user runs manually) |
| **Report** | Write release report with all artifacts |

---

## 3. Version Strategies

| Strategy | Flag | Example |
|---|---|---|
| **Patch** | `--patch` | 1.0.0 → 1.0.1 |
| **Minor** | `--minor` | 1.0.0 → 1.1.0 |
| **Major** | `--major` | 1.0.0 → 2.0.0 |
| **Pre-release** | `--pre=beta` | 1.0.0 → 1.1.0-beta.0 |
| **Explicit** | `--version=1.2.3` | Any → 1.2.3 |

---

## 4. Changelog Format

```markdown
## [1.1.0] — 2026-05-11

### Added
- feat(core): new validation engine (#45)

### Fixed
- fix(ui): dropdown alignment on mobile (#42)

### Changed
- refactor(api): simplify auth flow (#41)
```

Entries are categorized by conventional commit prefix (`feat:`, `fix:`, `refactor:`, etc.).

---

## 5. Pre-Flight Checks

| Check | Failure Action |
|---|---|
| Uncommitted changes | `Error: working tree not clean` |
| Failing tests | `Warning: tests not passing` |
| TODO markers in src/ | `Warning: N TODOs found` |
| Missing CHANGELOG.md | Auto-create with initial entry |

---

## 6. What wbRelease Does NOT Do

| Action | Use Instead |
|---|---|
| Run `git tag` | User runs manually (no git commands policy) |
| Publish to npm | `/wbPublish` |
| Deploy to servers | `/wbDeploy` |
| Run tests | `/wbTest` (pre-flight only warns) |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

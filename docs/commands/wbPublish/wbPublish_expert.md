# wbPublish — Expert Architecture

> How `/wbPublish` prepares and executes npm package publication.

---

## 1. System Role

`/wbPublish` is a **publication orchestrator**. It prepares a package for npm distribution by validating the `package.json`, running pre-publish checks, and generating the `npm publish` command.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker |
| **Input** | Folder path |
| **Output** | Publish report in `reports/YYYY/MM/DD/publishes/` |
| **Mutates files** | No — generates commands for user to run |

---

## 2. Publication Pipeline

```
Scope → package.json validation → files whitelist check → dry-run → publish command → report
```

| Stage | Action |
|---|---|
| **Validation** | Verify `name`, `version`, `main`/`exports`, `files` |
| **Whitelist** | Ensure `files` array only includes intended artifacts |
| **Dry-run** | Generate `npm pack --dry-run` output showing package contents |
| **Command** | Produce `npm publish` command with correct tag |
| **Report** | Document what was published, to which registry, at what version |

---

## 3. Registry Targets

| Target | Flag | Registry |
|---|---|---|
| **npm public** (default) | — | `https://registry.npmjs.org` |
| **GitHub Packages** | `--registry=github` | `https://npm.pkg.github.com` |
| **Private** | `--registry=<url>` | Custom registry URL |

---

## 4. Tag Strategy

| Version Pattern | npm Tag |
|---|---|
| `1.0.0` (stable) | `latest` |
| `1.0.0-beta.0` | `beta` |
| `1.0.0-alpha.0` | `alpha` |
| `1.0.0-rc.0` | `next` |

---

## 5. Pre-Publish Checks

| Check | Severity |
|---|---|
| Missing `name` | CRITICAL — cannot publish |
| Missing `version` | CRITICAL — cannot publish |
| Missing `files` array | HIGH — may publish unwanted files |
| Missing `main` or `exports` | MEDIUM — consumers can't import |
| Missing `README.md` | LOW — poor discoverability |

---

## 6. What wbPublish Does NOT Do

| Action | Use Instead |
|---|---|
| Run `npm publish` | User runs manually |
| Bump version | `/wbRelease` |
| Create git tags | User runs manually |
| Deploy to servers | `/wbDeploy` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

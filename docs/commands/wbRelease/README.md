# /wbRelease — Command Hub

`/wbRelease` manages the full release workflow: version bumping, changelog generation, git tagging, and pre-publish validation. It coordinates the transition from development HEAD to a versioned artifact so that everything `/wbPublish` and `/wbBroadcast` depend on is in place before a single package hits npm.

## 🎯 Strategic Position

`/wbRelease` sits between verification and publication. It is the gate you pass *after* the audit says "ship" and *before* you actually push. Unlike `/wbPublish` which executes the final npm publish, `/wbRelease` prepares the entire monorepo — unpicking workspace protocols, bumping versions across the dependency graph, and generating the changelog — so that what goes out is internally coherent.

- **When an audit and test suite pass** — run `/wbRelease --dry-run` to preview, then `/wbRelease` for real.
- **After `/wbPublish` succeeds** — run `/wbRelease --restore` to restore workspace protocols.
- **For pre-release experiments** — use `--prerelease=beta` for 1.5.0-beta.0 style bumps.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Dry-run** | `/wbRelease <monorepo-root>/ --dry-run` | Full preview of what will change, no mutations |
| **Standard** | `/wbRelease <monorepo-root>/` | Version bumps, changelog, git tag, workspace protocol unpick |
| **Restore** | `/wbRelease <monorepo-root>/ --restore` | Restores workspace: protocols after publish |
| **Pre-release** | `/wbRelease <monorepo-root>/ --prerelease=beta` | Beta/alpha/rc version with pre-release tag |

## ✅ What a useful release contains

1. A **dry-run preview first** — never release blind.
2. A **version bump calculated from conventional commits** — `fix:` → patch, `feat:` → minor, `feat!:` / `BREAKING CHANGE:` → major.
3. A **full changelog** synthesized from recent reports.
4. The **topological publish order** for all sub-packages.
5. A **restore instruction** so the next `pnpm install` uses local packages, not npm.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Publish to npm | [`/wbPublish`](../wbPublish/README.md) |
| Deploy to production | [`/wbDeploy`](../wbDeploy/README.md) |
| Announce a release | [`/wbBroadcast`](../wbBroadcast/README.md) |
| Verify code quality before release | [`/wbAudit`](../wbAudit/README.md) |
| Test before release | [`/wbTest`](../wbTest/README.md) |

It refuses when: audit has BLOCKER findings, tests fail, no packages have changes since last release, the working tree is dirty, or the current branch is not the release branch.

## 📚 Reading Order

1. **[ELI5](wbRelease_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbRelease_practical.md)** — step-by-step on a real project.
3. **[Expert](wbRelease_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbRelease_examples.md)** · **[Part 1](wbRelease_examples.md)** · **[Part 2](wbRelease_examples.md)** — annotated transcripts.
5. **[Exhaustive simulation](wbRelease_exhaustive_simulation.md)** · **[Live demo](wbRelease_live_demo.md)**.

## 🔗 Related

- [`wbRelease.md`](wbRelease.md) — the command reference this hub orients you around.
- [`/wbPublish`](../wbPublish/README.md) — publishes the prepared release to npm.
- [`/wbBroadcast`](../wbBroadcast/README.md) — announces the release.
- [`/wbDeploy`](../wbDeploy/README.md) — deploys apps (not packages).
- [`/wbAudit`](../wbAudit/README.md) — the gate you must pass before releasing.

## Quick Reference

```bash
/wbRelease <monorepo-root>/ --dry-run            # preview everything first
/wbRelease <monorepo-root>/                       # real release
/wbRelease <monorepo-root>/ --prerelease=beta     # pre-release
/wbRelease <monorepo-root>/ --restore             # restore after publish
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

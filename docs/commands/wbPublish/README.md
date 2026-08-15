# /wbPublish — Command Hub

`/wbPublish` is the WB-Labs npm publication pipeline. It handles the full publish workflow — version bump validation, pre-publish checks, registry configuration, and topological publish ordering — turning a tested and audited codebase into a publicly installable npm module. It runs only after `/wbRelease` and refuses otherwise.

## 🎯 Strategic Position

`/wbPublish` is the final gate in the package distribution pipeline. Every other command ensures the package is correct; `/wbPublish` ensures it's deliverable. It runs a five-point pre-check automatically (recent release report exists, version matches, `workspace:*` unpicked, `dist/` aligned, version not already on npm) and refuses with specific fixes if any fail. After publish, it demands a `/wbRelease --restore` — skipping this leaves your dev tree with pinned versions instead of `workspace:*`, breaking local package linking.

- **After `/wbRelease` has run** — in the same cycle, not days later.
- **Not before** — the command refuses without a recent release report.
- **Never for quick tests** — use `pnpm link` or local tarball install instead.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Publish** | `/wbPublish <pkg>` | Build, verify, and publish to npm registry |
| **Dry run** | `/wbPublish <pkg> --dry-run` | Shows what would publish without pushing |
| **Prerelease** | `/wbPublish <pkg> --prerelease=<tag>` | Publish under a tag like `@beta` or `@canary` |

## ✅ What a useful publish report contains

1. The **release plan** it read — topological publish order.
2. **Build verification** — `build-info.json` inspected, version and tier metadata confirmed.
3. **Per-package publish status** — success, failure, or skipped with reason.
4. The **restore reminder** — `--restore` must be run after publish.
5. The **next command** — typically `/wbDeploy <consumer-app>`.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Run tests before publish | [`/wbTest`](../wbTest/README.md) — run before `/wbRelease` |
| Create changelogs or bump versions | [`/wbRelease`](../wbRelease/README.md) |
| Deploy an application | [`/wbDeploy`](../wbDeploy/README.md) |
| Announce the release | [`/wbBroadcast`](../wbBroadcast/README.md) |
| Re-publish the same version | `npm publish` directly (check registry first) |

## 📚 Reading Order

1. **[ELI5](wbPublish_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbPublish_practical.md)** — step-by-step on a real project.
3. **[Expert](wbPublish_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbPublish_examples.md)** — annotated transcripts from actual sessions.
5. **[Exhaustive simulation](wbPublish_exhaustive_simulation.md)** · **[Live demo](wbPublish_live_demo.md)**.

## 🔗 Related

- [`wbPublish.md`](wbPublish.md) — the command reference this hub orients you around.
- [`/wbRelease`](../wbRelease/README.md) — must run first; required gate for `/wbPublish`.
- [`/wbDeploy`](../wbDeploy/README.md) — deploy an application (not an npm package).
- [`/wbTest`](../wbTest/README.md) — run tests before the release cycle begins.
- [`/wbNext`](../wbNext/README.md) — ranked next action after publish.

## Quick Reference

```bash
/wbPublish <pkg>              # build + publish to npm
/wbPublish <pkg> --dry-run    # show what would publish, don't push
/wbPublish <pkg> --prerelease=beta  # publish under a prerelease tag
```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

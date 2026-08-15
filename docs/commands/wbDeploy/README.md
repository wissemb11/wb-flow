# /wbDeploy — Command Hub

`/wbDeploy` is the app-to-production bridge. It generates deployment configuration, runs pre-flight gate checks, builds in production mode, and pushes to the target environment. It handles environment-specific settings and deployment strategy selection — producing the artifacts needed for a safe, repeatable deploy. It does not ship packages (that's `/wbPublish`); it ships apps with URLs users visit.

## 🎯 Strategic Position

`/wbDeploy` sits at the end of the verification chain. It refuses to deploy when tests fail and warns when audit findings exist. The command's value is in the gate check — catching issues *before* they reach production — not in the push itself.

- **After testing** — `/wbTest` must pass before deploy.
- **With a dry-run first** — always preview with `--dry-run` before a risky deploy.
- **Local prod-preview** — `--target=local` serves the prod build locally; catches deploy-specific bugs that dev mode hides.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Standard** | `/wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com` | Build + push to target + live URL |
| **Dry-run** | `/wbDeploy ... --dry-run` | Full gate report without pushing |
| **Local preview** | `/wbDeploy ... --target=local` | Prod build served on localhost for manual verification |

## ✅ What a useful deploy contains

1. **Gate results** — `/wbTest` pass/fail + `/wbAudit` findings with severity.
2. **Build summary** — output size, asset count, mode confirmation.
3. **Target routing** — where it's going (GitHub Pages, local, etc.).
4. **Live URL** (or local URL) — where to verify.
5. **"What would NOT be deployed"** section (in dry-run) — catches accidental inclusion bugs.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Ship packages to npm | [`/wbPublish`](../wbPublish/README.md) |
| Audit code quality pre-deploy | [`/wbAudit`](../wbAudit/README.md) |
| Verify the live site works | Manual verification (AI can't see the URL) |
| Monitor post-deploy health | [`/wbCheck`](../wbCheck/README.md) |
| Release versioning | [`/wbRelease`](../wbRelease/README.md) |

Test failures are blockers — the command refuses cleanly. Audit MAJOR findings are advisory (user decides); BLOCKER findings stop the deploy.

## 📚 Reading Order

1. **[ELI5](wbDeploy_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbDeploy_practical.md)** — step-by-step walkthrough on a real project.
3. **[Expert](wbDeploy_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbDeploy_examples.md)** — annotated deploy transcripts (part [1](wbDeploy_examples.md) · [2](wbDeploy_examples.md)).
5. **[Exhaustive simulation](wbDeploy_exhaustive_simulation.md)** · **[Live demo](wbDeploy_live_demo.md)**.

## 🔗 Related

- [`wbDeploy.md`](wbDeploy.md) — the command reference this hub orients you around.
- [`/wbPublish`](../wbPublish/README.md) — ship packages to npm (not apps).
- [`/wbAudit`](../wbAudit/README.md) — pre-deploy quality check.
- [`/wbTest`](../wbTest/README.md) — pre-deploy test validation.

## Quick Reference

```bash
/wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com            # standard deploy
/wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com --dry-run  # preview
/wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com --target=local  # local preview
/wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com --prod     # production
```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

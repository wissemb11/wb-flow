# AI Workflows — Practical

For when you know *what* you want to do but not *which commands*.

## Three concrete scenarios

### Scenario 1: "I want to ship a new feature to wbdataviewer2"

```
/wbStandup core2/ # morning orientation
/wbContext apps/wb-dataviewer/wbdataviewer2.wbc-ui.com # sync the demo app's brain
# ... describe the feature in one sentence, let the AI implement ...
/wbAudit apps/wb-dataviewer/wbdataviewer2.wbc-ui.com # brutal review
/wbTest apps/wb-dataviewer/wbdataviewer2.wbc-ui.com # must pass
/wbDeploy apps/wb-dataviewer/wbdataviewer2.wbc-ui.com # ship to GitHub Pages
```

*Gotchas on this path:*
- If you're editing the `apiResponse_` cache path, mention it explicitly — the AI should preserve the "don't re-fetch on project change" rule.
- `/wbDeploy` on an app is correct; `/wbPublish` would be wrong (apps aren't npm packages).

### Scenario 2: "I want to publish a new version of @wbc/wb-core"

```
/wbStandup core2/
/wbContext packages/wb-core
/wbAudit packages/wb-core --compare="vue 3 idioms"
# ... fix whatever audit flagged ...
/wbTest packages/wb-core # must pass
/wbDoc packages/wb-core # regen JSDoc + README
/wbRelease core2/ # monorepo-wide version bump
/wbPublish packages/wb-core # push to npm
```

*Gotchas on this path:*
- `/wbRelease core2/` not `/wbRelease packages/wb-core` — release is coordinated, not per-package.
- Check `dist/` vs `dist-dev/` before `/wbPublish`. This is the wbc-ui2 footgun — `package.json` points at `dist/` but vite writes to `dist-dev/`. Ship the wrong one and consumers can't resolve.
- If `/wbAudit` flags unresolved issues, **don't proceed**. The whole point of audit is that it gates release.

### Scenario 3: "Something is broken and I don't know why"

```
/wbContext packages/<pkg> # refresh the AI's brain
/wbDebug "<paste the error>" # form hypothesis FIRST
# ... read the hypothesis, don't jump to fixing ...
# if hypothesis confirmed, either:
# small fix → describe the fix, let AI implement
# big fix → /wbPlan packages/<pkg>/ with the hypothesis as context
/wbAudit packages/<pkg> # after the fix
/wbTest packages/<pkg> # regression check
```

*Gotchas on this path:*
- `/wbDebug` before anything else. The instinct to grep manually first is what costs hours.
- Don't `/wbRefactor` in response to a bug. Refactoring changes structure; bugs live in logic. Mixing them is how you silently delete a feature.

## The pattern across all three

Every flow has the same shape: **orient → work → review → ship**. The commands change; the shape doesn't. If you're about to ship something you haven't reviewed, the shape is broken. Stop and audit first.

## One useful shortcut

`reports/` is your external memory. If you're halfway through a task and switch context (meeting, lunch, another branch), running `/wbStandup` when you come back is cheaper than trying to remember. It reads what you wrote yesterday and gives it back to you.

---

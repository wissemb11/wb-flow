# /wbMonetize — Command Hub

`/wbMonetize` is the WB-Labs freemium bootstrapper. It converts a tier-unaware package into a tier-aware one — injecting the full gating system (simulation keys, cookie persistence, Pro getter consumption, free-fallback UI) on first run, then verifying and repairing that plumbing on subsequent runs. It bridges product strategy and technical implementation.

## 🎯 Strategic Position

`/wbMonetize` is the one-time architectural decision command for monetization. Bootstrap happens once per package — after that, feature movement between tiers is a manual product call. The command's job is to set up the plumbing correctly and keep it aligned with evolving monorepo rules, not to decide what belongs in Free vs Pro vs Dev.

- **First run on a new package** — bootstrap the full tier system before consumers depend on tier assumptions.
- **After `monorepo_rules.md` changes** — maintenance mode repairs drift in plumbing only.
- **Monthly** — verify that gating constants, cookie names, and hooks still match the canonical forms.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Bootstrap** | First run on a tier-unaware package | Full tier system injection (gates, sim keys, cookies, UI scaffolding) |
| **Maintenance** | Subsequent runs on a monetized package | Plumbing verification, drift repair, advisory suggestions |
| **Abort** | Heuristic finds partial gating without a marker | Asks user to resolve the mismatch before proceeding |

The mode is **auto-detected**, not flagged. The command reads the `wbMonetize` marker in `package.json` as authoritative, then cross-checks source heuristics.

## ✅ What a useful monetize report contains

1. The **detected mode** (bootstrap / maintenance) and rationale.
2. A **feature split table** — which features landed in Free, Pro, and Dev.
3. A **plumbing checklist** — gates, sim keys, cookie persistence, `created()` hook, free-fallback UI.
4. **Test-impact list** — which existing tests will break and need manual updates.
5. **Advisory suggestions** (maintenance only) — features that *could* be promoted to Pro.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Inject per-component gates on an already-monetized package | [`/wbLicense`](../wbLicense/README.md) |
| Move a single feature between tiers after bootstrap | Manual edit |
| Produce tier-specific build artifacts | Build config (not yet a command) |
| Code quality audit | [`/wbAudit`](../wbAudit/README.md) |
| License compliance | [`/wbLicense`](../wbLicense/README.md) |

## 📚 Reading Order

1. **[ELI5](wbMonetize_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbMonetize_practical.md)** — step-by-step on a real project.
3. **[Expert](wbMonetize_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbMonetize_examples.md)** — annotated transcripts from actual sessions.
5. **[Exhaustive simulation](wbMonetize_exhaustive_simulation.md)** · **[Live demo](wbMonetize_live_demo.md)**.

## 🔗 Related

- [`wbMonetize.md`](wbMonetize.md) — the command reference this hub orients you around.
- [`/wbLicense`](../wbLicense/README.md) — per-component gate injection on monetized packages.
- [`/wbRelease`](../wbRelease/README.md) — release after monetization is in place.
- [`/wbTest`](../wbTest/README.md) — verify tests after bootstrap-induced breakage.
- [`/wbNext`](../wbNext/README.md) — ranked next action after monetization work.

## Quick Reference

```bash
/wbMonetize <package-path>                  # auto-detect → bootstrap or maintenance
/wbMonetize <package-path> "<split spec>"   # bootstrap with explicit split, no prompt
```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# /wbMonetize — Practical

## One command, three verdicts (auto-detected)

```
/wbMonetize <package-path> # detect → bootstrap or maintenance
/wbMonetize <package-path> "<split spec>" # bootstrap with explicit split, no prompt
```

The mode is **detected**, not flagged. The detection is hybrid:

- **Marker:** `package.json::wbMonetize` — authoritative.
- **Heuristic:** scan source for `__WBC_DEV__`, `isWb[Pkg]Pro`, `_wb_[pkg]_auth`, the `created()` hook.

| Marker | Heuristic | Verdict |
|---|---|---|
| absent | no gating | **BOOTSTRAP** — inject full tier system once |
| present | gating present | **MAINTENANCE** — verify & repair plumbing |
| absent | partial gating | **ABORT** — ask user; manual gating exists outside the convention |

## When to run each

**Bootstrap** is one-shot per package, ideally on a feature branch with a clean working tree, before the package has any consumers depending on tier assumptions.

**Maintenance** can run periodically — monthly is fine, or after any change to `monorepo_rules.md`. It will not move features between tiers; that's your manual call after bootstrap.

## What bootstrap touches

- Source: injects `__WBC_DEV__` reads, `isWb[Pkg]Pro` getter consumption, simulation-key support, cookie persistence (`_wb_[pkg]_auth`), the `created()` license hook from monorepo_rules.md §4, and free-fallback slots.
- `package.json`: writes the `wbMonetize` marker with `version`, `tier`, `bootstrappedAt`, `rulesVersion`, `lastVerifiedAt`.
- Tests: **flagged but not fixed.** Existing tests written against the open API will break. Fix them manually or via `/wbTest`.

## What maintenance touches

- Plumbing only (cookie names, hook structure, getter wiring) when `rulesVersion` shows drift.
- Marker (`lastVerifiedAt`, `rulesVersion`).
- **Never** feature placement. Never moves a feature from Free to Pro or vice versa. That's your call.

## The advisory section

Maintenance runs include an advisory pass: "feature X could be promoted to Pro", "feature Y might be over-gated". These are suggestions, never patches. The whole point of the bootstrap-once design is that you control the monetization surface after the initial setup.

## When `/wbMonetize` is the wrong command

- Per-component gate injection on an already-monetized package → `/wbLicense`.
- Producing dev/free/pro **build artifacts** → not yet a command; for now, handled by your build config.
- Coverage report across the whole monorepo → not yet a command; consider running `/wbMonetize` per-package and aggregating manually.
- Moving a single feature between tiers → manual edit. Not in scope.

## The one mistake to avoid

**Re-running bootstrap by editing the marker out.** If you want to re-bootstrap a package (rare), do it intentionally: revert the package, delete the marker, run `/wbMonetize` again. Don't half-strip the marker and hope the heuristic catches it — that's the abort case, and you'll have to confirm the override anyway.

---

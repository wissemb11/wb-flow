# /wbMonetize: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbMonetize`

## One command, three verdicts (auto-detected)

```
/wbMonetize <package-path>                  # detect → bootstrap or maintenance
/wbMonetize <package-path> "<split spec>"   # bootstrap with explicit split, no prompt
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

> For deeper reading: [`docs_claude/commands/wbMonetize/wbMonetize_practical_claude.md`](../../docs/docs_claude/commands/wbMonetize/wbMonetize_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).
<!-- HELP_GATE_END -->

**ROLE:** The Monetization Bootstrapper
**TARGET:** A package path (e.g., `packages/wb-dataviewer`).

## ━━━ OBJECTIVE ━━━
Convert a tier-unaware package into a tier-aware one (first run), or verify and repair the monetization plumbing of an already-monetized package (subsequent runs). This command sets up keys, simulation logic, cookie persistence, and the initial Free / Pro / Dev split — once. After bootstrap, feature movement between tiers is the user's manual decision; this command only maintains the verification logic.

## ━━━ PHASE 1: CONTEXT SYNC ━━━
1. Read the local `context.md` and `dev.md` of the target package.
2. Strictly review the global `core2/.wb/workflows/monorepo_rules.md` — sections 3 (Tier System) and 4 (Licensing Flow).
3. Detect the package's monetization state using **the hybrid mechanism (option 3)**:
   - **Authoritative marker:** look for `wbMonetize` field in the package's `package.json` (or `.wb-monetized.json` in the package root). If present, package is monetized.
   - **Heuristic safety check:** independently scan the source for any of `__WBC_DEV__`, `isWb[Pkg]Pro`, `userTier`, `WB[Pkg]_SIMULATE_PRO`, the `created()` license hook, or `_wb_[pkg]_auth` cookies.
   - **Reconcile:** marker present + heuristic finds gating → MAINTENANCE mode. Marker absent + heuristic finds no gating → BOOTSTRAP mode. Marker absent + heuristic finds gating → ABORT and ask the user (manual gating exists; bootstrapping would corrupt it).

## ━━━ PHASE 2: BOOTSTRAP MODE (first run) ━━━
Run only if Phase 1 detected a tier-unaware package.

1. **Propose the feature split.** Read the package's source. Categorize each public-facing feature/component/composable as Free, Pro, or Dev candidate. Surface the proposal in a table and pause for user confirmation. If the user passed a description argument, use it to govern the split and skip the prompt.
2. **Inject the gating constants.** Add `__WBC_DEV__` reads, `isWb[Pkg]Pro` store-getter consumption, and `userTier` resolution per monorepo_rules.md §3.
3. **Wire simulation keys.** Implement support for `WB[Pkg]_SIMULATE_PRO` and `WBC_SIMULATE_PRO` per monorepo_rules.md §3.
4. **Set up cookie persistence.** Use `_wb_[pkg]_auth` per the established convention.
5. **Implement the `created()` license hook** in the appropriate root component(s), copied from monorepo_rules.md §4.
6. **Add free-fallback UI scaffolding** for premium features (e.g., "Upgrade to Pro" overlay slot).
7. **Update `package.json`** — add the `wbMonetize` field with `{ "version": "1.0", "tier": "premium", "bootstrappedAt": "<ISO date>", "rulesVersion": "<monorepo_rules.md version or hash>" }`.
8. **Flag test impact.** List existing tests that will break; do not fix them — surface them so the user can update tests intentionally.

## ━━━ PHASE 3: MAINTENANCE MODE (subsequent runs) ━━━
Run only if Phase 1 detected an already-monetized package.

1. **Report current state.** Output the existing Free / Pro / Dev split as a table. No changes proposed to feature placement.
2. **Verify plumbing.** Check each of: gating constants present and named per current monorepo_rules.md, simulation keys wired to current store shape, cookie name matches `_wb_[pkg]_auth` convention, `created()` hook matches canonical form, free-fallback UI hooks intact.
3. **Repair drift.** If monorepo_rules.md has evolved since the bootstrap (the marker's `rulesVersion` is older than current), patch the verification logic to match. Do **not** touch feature placement.
4. **Advisory pass on features.** Optionally suggest moves ("feature X is heavy and could be promoted to Pro"; "feature Y has minimal value, consider keeping Free"). Output as advice; do not patch.
5. **Update marker.** Refresh `bootstrappedAt` (no — keep this immutable) but update `lastVerifiedAt` and `rulesVersion`.

## ━━━ PHASE 4: VERIFICATION & REPORT ━━━
Write a report at `reports/<YYYY>/<MM>/<DD>/monetize/monetize_<pkg>_<HHMMSS>.md` with: mode (bootstrap/maintenance), feature split, plumbing checklist, drift repairs applied, advisory suggestions, test-impact list, and the final state of the marker. End with recommended next commands (`/wbLicense` per-component, `/wbTest` for the breakage, `/wbRelease` if shipping).

## ━━━ ABORT CONDITIONS ━━━
- Marker absent but heuristic finds partial gating → abort, ask user.
- Working tree dirty → abort, ask user to commit or stash first (bootstrap rewrites source).
- Target is not a package directory (no `package.json`) → abort.
- Target is on `main` branch and bootstrap mode → abort, recommend a feature branch.

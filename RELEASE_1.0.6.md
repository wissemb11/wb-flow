---
title: "What's New in wb-flow 1.0.6"
description: "Closed-row audit visibility, V7/V8 vacuous oracle prevention, packaging hygiene, and security/verification hardening."
---

# What's New in `wb-flow` 1.0.6

> Released 2026-09-20 · previous: [1.0.5](RELEASE_1.0.5.md) · full log: [CHANGELOG.md](CHANGELOG.md)
>
> Built from `plan_wb-flow_20260912.md`.

---

## 1 · ⚠️ BREAKING: `model --set` validation

- **`model --set` now refuses an unroutable model instead of writing a partial chain.** Previously `--set worker=good,bogus` exited **0**, printed `✅ Roster written`, and persisted only the resolvable links. It now exits **1** and writes nothing.
- **Migration:** scripts that called `--set` and ignored the exit code will now fail loudly on a bad slug. Use `--force` to write a slug the catalog has not learned — it is recorded in the roster as `⚠️ unvalidated (--force)`.

---

## 2 · Closed-Row Audit Visibility & Fleet Sweeps

- `/wbAudit` plan-file mode now explicitly runs `wb-flow lint --include-closed <plan-file>` and names `wb-flow lint --all --include-closed <scope>` as the historical fleet sweep.
- Closed vacuous-oracle debt is now fully observable without changing routine prevention defaults.

---

## 3 · Vacuous Oracle Linting (V7 & V8)

- **V7 Detection & Rule:** Quiet and invert `grep`/`rg` cells (`cmd | grep -qv 'X'`) are flagged and forbidden in Column Rule 5 of `wbPlan_template.md`. Re-spelled as `! ( cmd | grep -q 'X' )` except for provably single-line inputs.
- **V8 Detection:** Catches allowlisted exit-code-bearing commands (`node test/*.js`, `npm test`, `bin/lint.js`) piped into a final `grep`, where the grep stage masks command failures.

---

## 4 · Packaging Hygiene & Security

- **Release Documentation Alignment:** Added `RELEASE_1.0.6.md` matching `package.json` version 1.0.6 and `files[]` glob `RELEASE_*.md`.
- **Backup File Sweep:** Removed stray backup artifacts `bin/lint.js.orig` and `templates/commands/_shared/sync_check.sh.orig`.
- **Security & Verification:** Documented execution boundaries in `SECURITY.md` and added regression tests for release-gate tools (`verify-release-file.js` and `verify-wrappers.js`).

---

## 5 · Three New `lint` Steps (9, 10, 11)

Expanding the plan-file verifier from 8 to 11 structural checks that reject previously-passing plans:
- **step-9** (Verify-clause soundness): Rejects the V1–V9 vacuous-Verify forms, unrunnable oracles, absence assertions that mask true failures, and open-oracle checks that time out.
- **step-10** (Plan Budget Estimate consistency): Rejects plans where the Budget Estimate section is missing or mathematically inconsistent with the task table.
- **step-11** (Done row task reports): Rejects checked `☐ Done` rows that lack a corresponding task report link.

## 6 · Isolated Oracle Replay (`--replay-closed`)

- Added `--replay-closed` to `wb-flow lint`. It re-runs the `Verify` cell of every closed task row in a child shell, so a later change that
  silently breaks an earlier row's oracle is reported rather than missed. Opt-in, because a full replay re-executes every closed oracle and
  can take several minutes; mark a row's Verify `# point-in-time` to exclude an oracle that asserts a moment rather than an invariant.

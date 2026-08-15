# /wbRelease — Expert

## What `/wbRelease` architecturally is

A **workspace-protocol translator + version coordinator** that solves the structural mismatch between monorepo development (`workspace:*`) and npm publishing (semver). It computes a release plan (which packages change, what versions, what dep updates propagate), unpicks workspace protocols, and leaves the tree ready for `/wbPublish`.

The hard problem it solves: if you publish `wb-dataviewer` while its `package.json` says `"@wbc/wb-core": "workspace:*"`, npm consumers get a broken install. They can't resolve `workspace:*`. The release command handles the translation, then `--restore` flips it back after publish succeeds.

## The structural tension, precisely

- pnpm/yarn/npm workspaces use `workspace:*` to mean "the local version in this monorepo."
- The npm registry has no concept of `workspace:*`. Published manifests must use semver.
- Without a release-time translation, you either publish broken packages (workspace refs in public manifest) or you give up workspaces (pin versions everywhere in dev).

`/wbRelease` picks the third option: live with workspaces in dev, translate at release time.

## Three design decisions worth naming

### 1. Monorepo-wide scope, not per-package
The scope is forced because dependency graph reasoning is inherently cross-package. Releasing wb-dataviewer without updating its reference to wb-core (if wb-core also bumped) would ship broken deps. Per-package release cannot coordinate; monorepo-wide can.

### 2. Unpick + restore as separate steps
Unpicking and restoring are not fused into `/wbPublish`. They're flanking operations. Rationale: `/wbPublish` can fail partway. If unpick-publish-restore were atomic, a partial failure could leave the tree in an unrecoverable state. Keeping them separate means `--restore` is idempotent and can be run explicitly once you've confirmed publish succeeded.

### 3. Gate on /wbTest + /wbAudit reports
Release refuses if recent tests failed or recent audits have unresolved blockers. This binds release quality to the closed-loop reports rather than re-running tests itself. The command trusts `reports/` as truth. Stale reports (>24h) trigger a warning; very stale (>7d) trigger a refusal.

## Conventional commits as the bump source

Version bumps are driven by commit message prefixes (`fix:`, `feat:`, `feat!:`). Not by AI guessing.

Trade-off: this requires discipline in commit writing. The upside is deterministic version bumps — same commits produce same bumps every time. An AI-inferred bump would be non-deterministic and could disagree with your intent.

If commits don't follow the convention, the AI asks rather than inferring. Correct posture.

## Where the command leaks

1. **Atomicity is partial.** Unpick writes changes to disk; if the session dies between unpick and restore, the tree is in an intermediate state. `--restore` can fix it, but the user has to remember to run it.

2. **No lockfile handling.** pnpm/yarn lockfiles reference workspace protocols. After unpick, the lockfile is temporarily inconsistent. `/wbPublish` works anyway because it uses the package.json directly, but `pnpm install` during this window does weird things.

3. **Cross-package dep updates are computed, not validated.** If wb-core bumps from 1.4.2 to 1.4.3, wb-dataviewer's manifest gets `^1.4.3`. Nothing verifies that wb-dataviewer's code actually works with wb-core 1.4.3 — the assumption is that testing caught that. For breaking changes, this assumption is fragile.

4. **No release notes generation.** The command bumps versions but doesn't write CHANGELOG entries. If your convention is conventional-commits-to-changelog, you need a separate step.

5. **Prerelease tags are flag-driven, not automated.** You specify `--prerelease=beta`. Forgetting to specify re-uses the normal release channel. Error-prone for teams that frequently do prereleases.

What `wb-flow-docs`'s playbook gets wrong about `/wbRelease`: treating it as version bumping only, when the actual scope includes workspace:* dependency unpicking, changelog generation from conventional commits, and the pre-release audit checklist. Bumping versions is the easy part — dependency resolution is where the risk lives.

## One-paragraph verdict

A workspace-protocol translator whose architectural contribution is correctly separating the three phases (gate-check, version-compute, workspace-unpick) and not fusing them with `/wbPublish`. The separation is what makes the system recoverable from partial failures. Version computation via conventional commits is the right discipline — deterministic, auditable, resistant to AI hallucination. Weakest in lockfile coherence during the unpick window, cross-package compatibility validation, and changelog generation. The monorepo-wide scope is correct and should not be weakened to per-package for "convenience." Correct for solo monorepo work; would need stronger atomicity guarantees and lockfile-aware tooling for team-scale.

---

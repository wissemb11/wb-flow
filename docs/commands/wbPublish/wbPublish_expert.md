# /wbPublish — Expert

## What `/wbPublish` architecturally is

A **narrow-scope build-and-push command**. Runs the project's configured build script, then invokes `npm publish` with the computed registry access level. Pre-gated on `/wbRelease` having run in the same cycle.

The architectural contribution is what it *doesn't* do: it does not bump versions, restore workspace protocols, or handle release coordination. By refusing to blur responsibilities with `/wbRelease`, each command stays auditable and recoverable.

## The separation from /wbRelease

Many release tools fuse version-bumping and publishing into one step. `/wbPublish` deliberately splits them because:

1. **Recovery clarity.** If publish fails after release ran, you know exactly where you are — version bumped in git, tarball not on registry. Fused tools leave state ambiguity.
2. **Dry-run separability.** You can dry-run a publish without dry-running a release. Different questions.
3. **Idempotency boundary.** `/wbPublish` can retry. `/wbRelease` can't (version was already bumped). Keeping them separate makes this asymmetry explicit.

## The pre-check discipline

`/wbPublish` verifies five things before building:
1. Recent release report.
2. Version consistency (package.json vs report).
3. Protocols unpicked.
4. Build-output alignment (dist/ vs dist-dev/).
5. Registry version availability.

Each check is a refusal criterion. None are "warnings that can be ignored." The command's correctness depends on not proceeding past a failed check — a warn-but-continue posture would invite silent bugs.

## Three design decisions worth naming

### 1. Refusal as a feature, not a failure
The command refuses publish more often than it proceeds. This is correct. The cost of a wrong-state publish (republishing an older version, publishing with workspace: refs in manifest, publishing to wrong registry) is high. The cost of refusing is a re-check. Asymmetry favors refusal.

### 2. Dry-run shows tarball contents
Not just "this version would publish." Actual file listing of what npm would see. Catches the most common accidental-inclusion bugs — source files, test files, `.agents/` metadata leaking into public packages.

### 3. Registry version-conflict check
The AI queries npm for the current published version before attempting publish. If the computed new version already exists on npm, refusal happens client-side rather than waiting for the server to reject. Faster, clearer error.

## Where the command leaks

1. **Auth state is opaque.** The command relies on `npm login` / `NPM_TOKEN` being correct in the environment. No way to test auth without attempting a real publish (or `npm whoami`). Failures manifest late.

2. **No retry queue.** If publish fails mid-way (e.g., network cut during tarball upload), retry is manual. No persistent queue to resume.

3. **Tarball-contents check is heuristic.** The dry-run reads `files` field, `.npmignore`, `package.json`. It doesn't run the actual `npm pack` and inspect the tarball bitmap. Edge cases (symlinks, case-sensitivity differences) can slip past.

4. **Registry targeting is implicit.** Publishing to a private registry vs. npmjs is controlled by `.npmrc` + `publishConfig`. The command trusts these. Wrong configuration = wrong registry. No explicit "publishing to X" confirmation.

5. **Post-publish restoration is not automatic.** The command ends with a pointer to `--restore` but doesn't run it. Rationale: `--restore` should only run after publish is *confirmed* successful, and confirmation takes a separate round-trip. Automating it would risk restoring protocols while the publish is still in flight.

What `wb-flow-docs`'s playbook gets wrong about `/wbPublish`: treating it as npm publish automation, when the Claude edition includes the dual distribution split (npmjs for runtime installs, github for source inspection) and the pre-publish audit gate. Publishing without the gate is the mistake the sibling edition doesn't warn about.

## One-paragraph verdict

A narrow-scope build-and-push command whose architectural contribution is *not doing* release coordination. The pre-check discipline (five refusal criteria), the dry-run tarball listing, and the registry version-conflict check all work correctly. Weakest in auth opacity, retry mechanics, tarball-contents heuristics, and implicit registry targeting. The separation from `/wbRelease` is the right design choice — fusing them would lose recovery clarity. Correct for solo monorepo work; would need auth validation and a retry queue for high-frequency release workflows.

---

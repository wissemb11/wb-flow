# wbPublish Template v2.1


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbPublish`

## Two forms

```
/wbPublish <pkg>              # build + publish to npm
/wbPublish <pkg> --dry-run    # show what would publish, don't push
```

## When to run

Only after `/wbRelease core2/` has run in the same cycle. If `/wbRelease` wasn't run, `/wbPublish` refuses.

## The pre-check the AI does automatically

1. Recent `/wbRelease` report exists.
2. `package.json` version matches release report version.
3. `workspace:*` protocols already unpicked.
4. `dist/` vs `dist-dev/` aligned (wbc-ui2 footgun).
5. Version not already on npm registry.

If any fail, you get a refusal with a specific fix.

## After publish

**Always** run `/wbRelease core2/ --restore`. Skipping leaves your dev tree with pinned versions instead of `workspace:*`, which breaks local package linking. Your next `pnpm install` will fetch from npm instead of using the monorepo's live copies.

## When publish fails

Auth failures, rate limits, registry outages. The AI's recovery output gives specific options. Do *not* run a fresh `/wbRelease` — version is already bumped. Fix the underlying issue and retry the `/wbPublish`, or abandon with `/wbRelease --restore` (but the version bump stays in git).

## When /wbPublish is not the right command

- App → `/wbDeploy`.
- Re-publish same version → `npm publish` directly (but check registry first).
- Pre-release tag (`@beta`, `@canary`) → `/wbRelease --prerelease=<tag>` first, then `/wbPublish`.
- Quick test → don't publish. Use `pnpm link` or local tarball install.

> For deeper reading: [`docs_claude/commands/wbPublish/wbPublish_practical_claude.md`](../../docs/docs_claude/commands/wbPublish/wbPublish_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--all` | `-A` |
| `--dry-run` | `-d` |
| `--prerelease` | `-p` |
| `--restore` | `-r` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbPublish <scope_folder>           # normal mode — produce a fresh output file
/wbPublish <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbPublish` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-A` → `--all`
- `-d` → `--dry-run`
- `-p` → `--prerelease`
- `-r` → `--restore`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: This is the manual template for executing the final build and NPM deployment. It MUST be run after `/wbRelease`.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output (relative links, full-syntax commands, self-correct mode).

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Publish: <scope> — <YYYY-MM-DD>` *(or the legacy `# Publish Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Publish-specific gap-fills:

- Plain-text `dist-*` folder mentions → relative markdown links per §1.
- Bare commands referenced (e.g., "/wbDeploy") → full-syntax form per §2.
- Missing publish-status per package → infer from `npm view` output if available.

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/publishes/publish_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE publish file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your publish log as Entry #1.
- **File ALREADY exists →** READ it, then APPEND as the next Entry #N.
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

---

## The Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbPublish ━━━━━━━━━━━━━

📁 TARGET: __TARGET_MONOREPO_OR_PACKAGE_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__

━━━ CONTEXT & GOAL ━━━
The repository has been staged for release via a prior `/wbRelease` command. The `package.json` files have correct NPM versions and local `file:` links have been removed.

Your goal is to safely Build, Verify, and Publish the packages to NPM, respecting Freemium tiers and topographical order.

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


1. **Read Release Plan**: Read the most recent `release_*.md` file in `.wb/workflows/reports/` to understand the required topological publish order.
2. **Build All Tiers**: Execute the global build script (e.g., `node tools/pkg_cli/build_libs.js --all`). This guarantees `dist-dev`, `dist-free`, and `dist-pro` are generated.
3. **Verify Signatures**: Inspect the generated `build-info.json` inside the `dist-*` folders. Ensure the version matches the `package.json` and the tier metadata is correct.
4. **Publish Sequence**: Execute `npm publish` iteratively according to the topological order defined in the release plan. Handle circular dependencies carefully by publishing `peerDependency` providers first.
5. SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/publishes/publish___NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your publish log as Entry #1
   - If it ALREADY exists → APPEND as the next Entry #N

6. APPLY OUTPUT CONVENTIONS (see ../_shared/output_conventions.md):
   - All file/folder references (dist-*, package.json, build-info.json) → relative markdown links (§1).
   - Any /wb* commands cited → full-syntax form (§2).

7. END THE FILE WITH:

   ## 🧭 What's Next?

   Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically `/wbDeploy <consumer-app>`).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
━━━ AUTO-APPEND FOOTER ━━━

At the VERY END of the file (after "What's Next?"), you MUST append the `## 📂 Generated Files (__YYYYMMDD__)` cross-link footer. Do NOT use simple tables. You MUST use the rich "Tier 1" layout from `_shared/output_conventions.md` §5.

Format required:
```markdown
---
## 📂 Generated Files (__YYYYMMDD__)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files
| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`core2/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```
```

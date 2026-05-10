# wbRelease Template v2.1


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbRelease`

## Four forms

```
/wbRelease core2/                           # standard flow
/wbRelease core2/ --dry-run                 # preview, no changes
/wbRelease core2/ --restore                 # after /wbPublish succeeds
/wbRelease core2/ --prerelease=beta         # 1.5.0-beta.0 style
```

Always `core2/` as the target. Never a sub-package.

## The full release workflow

```
/wbAudit <pkg>     # must pass
/wbTest <pkg>      # must pass
/wbRelease core2/ --dry-run         # preview
/wbRelease core2/                    # real release (unpicks workspace:)
/wbPublish <pkg>                     # actually push to npm
/wbRelease core2/ --restore          # restore workspace: protocols
```

Each step checks the previous. Skipping `--restore` is the most common mistake — your next `pnpm install` will start fetching from npm instead of using local packages.

## What triggers a version bump

The AI uses conventional commits:
- `fix:` → patch (1.4.2 → 1.4.3)
- `feat:` → minor (1.4.3 → 1.5.0)
- `feat!:` or `BREAKING CHANGE:` in commit body → major (1.5.0 → 2.0.0)

If your commits don't use conventional prefixes, the AI will ask. Don't let it guess.

## When `/wbRelease` refuses

- `/wbTest` report shows failures → fix tests first.
- `/wbAudit` report has BLOCKER findings → fix blockers first.
- No packages have changes since last release → nothing to release.
- Git working tree is dirty → commit or stash first.
- Current branch is not the one configured for releases → switch or override.

Don't bypass the refusal. Each one represents a real failure mode.

## The `--restore` discipline

**Always run `--restore` after `/wbPublish` succeeds.** Not doing this means:
- Next `pnpm install` fetches newly-published versions from npm.
- Your local dev stops using live workspace code.
- You'll be confused when a local code change doesn't show up in a downstream package.

Consider adding `--restore` to your end-of-day routine even if you're not sure you published — it's a no-op if protocols are already restored.

## When /wbRelease is *not* the right command

- App (not package) → `/wbDeploy`.
- Just want to publish without bumping → edit version manually, use `/wbPublish`.
- Just want to commit changes → `git commit`. Release is for consumer-visible versions.
- Pre-release experimental version → `--prerelease=...` flag, or manual `npm publish --tag=canary`.

> For deeper reading: [`docs_claude/commands/wbRelease/wbRelease_practical_claude.md`](../../docs/docs_claude/commands/wbRelease/wbRelease_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--dry-run` | `-d` |
| `--prerelease` | `-p` |
| `--restore` | `-r` |
| `--tag` | `-t` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbRelease <scope_folder>           # normal mode — produce a fresh output file
/wbRelease <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbRelease` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-d` → `--dry-run`
- `-p` → `--prerelease`
- `-r` → `--restore`
- `-t` → `--tag`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: This is the manual template for generating a release orchestration plan. It is specifically designed to solve monorepo circular dependencies and automate NPM publishing.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output (relative links, full-syntax commands, self-correct mode).

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Release: <scope> — <YYYY-MM-DD>` *(or the legacy `# Release Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Release-specific gap-fills:

- Plain-text `package.json` paths → relative markdown links per §1.
- Bare `/wbPublish` references → full-syntax `/wbPublish <target>` per §2.
- Missing version bumps in the topological order table → infer from current `package.json` files.

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/releases/release_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE release file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your release plan as Entry #1.
- **File ALREADY exists →** READ it, then APPEND as the next Entry #N.
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

---

## The Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbRelease ━━━━━━━━━━━━━

📁 TARGET: __TARGET_MONOREPO_OR_PACKAGE_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__
🎯 NEW VERSION: __e.g._v1.0.0-r02__

━━━ CONTEXT & GOAL ━━━
The user wants to publish the monorepo packages to NPM. The monorepo has complex, sometimes circular dependencies (e.g. `wb-core` uses `wb-code`, but `wb-code` uses `wb-core`). Currently, packages rely on `file:../../` or workspace aliases. 

Your goal is to act as the Release Orchestrator. You must untangle the dependency graph, replace local links with real NPM versions, build the changelog, and define the exact sequence of NPM publishes.

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


1. **History Aggregation**: Scan `.wb/workflows/reports/` for recent `plan_*.md` and `audit_*.md` files. Synthesize a professional `CHANGELOG.md` for the target release.
2. **Topological Graphing**: Analyze the `package.json` of all sub-packages in the target. Identify the dependency tree (who uses who?). Define the topological order for building and publishing.
3. **The Unlinking Strategy**: Replace `"dependencies": "file:../../..."` or workspace aliases with the target `NEW VERSION` in every `package.json`.
4. **Handoff**: Conclude the release plan by instructing the user to run `/wbPublish` to execute the actual builds and NPM publishes.
5. SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/releases/release___NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your release plan as Entry #1
   - If it ALREADY exists → APPEND as the next Entry #N

6. APPLY OUTPUT CONVENTIONS (see ../_shared/output_conventions.md):
   - All `package.json`, file, and folder references → relative markdown links from the output file's directory (§1).
   - Any /wb* commands cited (e.g., "run /wbPublish") → full-syntax form (§2).

7. END THE FILE WITH:

   ## 🧭 What's Next?

   Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically `/wbPublish <target>`).

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

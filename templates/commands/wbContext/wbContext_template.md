# wbContext Template v2.1


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbContext`

## Three invocation forms

```
/wbContext <path>                          # standard — per-package
/wbContext <path> --focus="<subsystem>"    # + focused sidecar file
/wbContext core2/ --scope=global           # monorepo-wide survey
```

## When to run each

| Situation | Form |
|---|---|
| Start of a fresh AI session | `/wbContext <current-pkg>` |
| After pulling changes from git (if applicable) | `/wbContext <touched-pkgs>` |
| Before touching a complex subsystem | `/wbContext <pkg> --focus="<subsystem>"` |
| Monthly sanity check across the monorepo | `/wbContext core2/ --scope=global` |
| You rewrote a lot of a package | `/wbContext <pkg>` (re-run, not `/wbSetup`) |

## What you'll see in the output

1. **Baseline load** — age of stored context.md / dev.md. If > 30 days and the package is active, flag it.
2. **Drift report** — what changed between stored understanding and current code.
3. **Questions** — if drift requires a decision (e.g., "did you rename this on purpose?"), AI asks before updating.
4. **Report ingestion** — recent audits / debug reports surfaced into working memory.

## The one mistake to avoid

**Not answering the drift questions.** If the AI asks "was the rename intentional?" and you ignore it, `context.md` stays out of date. Every future session starts with the same stale baseline until you answer. Answer once, save yourself later.

## When /wbContext is *not* the right command

- You want to create context for a brand-new package → `/wbSetup`, not `/wbContext`.
- You want to know what everyone else has been doing → `/wbStandup`, not `/wbContext`.
- You want to verify everything is release-ready → `/wbAudit`, not `/wbContext`.

`/wbContext` answers one question only: *"Is my stored understanding of this package still correct?"* Use it for that. Don't overload it.

> For deeper reading: [`docs_claude/commands/wbContext/wbContext_practical_claude.md`](../../docs/docs_claude/commands/wbContext/wbContext_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |
| `--scope` | `-s` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbContext <scope_folder>           # normal mode — produce a fresh output file
/wbContext <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbContext` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-f` → `--focus`
- `-s` → `--scope`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: This is the manual template for generating a context file if you are not using the automated `/wbSetup` workflow. Paste this to an AI to have it generate a context report.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output (relative links, full-syntax commands, self-correct mode).

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Context: <scope> — <YYYY-MM-DD>` *(or the legacy `# Context Entry #N` header for entry-N append mode).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Context-specific gap-fills:

- Plain-text mentions of files (`package.json`, `index.js`, dependencies) → relative markdown links per §1.
- Bare commands referenced in narrative (e.g. "run `/wbAudit`") → full-syntax form per §2.

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/contexts/context_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE context file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your context analysis as Entry #1.
- **File ALREADY exists →** READ it, then APPEND your context as the next Entry #N. You SHOULD correct or enrich previous entries if you see inaccuracies.
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

**Example (v2):**
If Claude Opus runs `/wbContext` on `packages/wb-core` on April 22, 2026:
```
packages/wb-core/.wb/workflows/reports/20260422/contexts/context_wb-core_20260422.md
```

---

## The Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbContext ━━━━━━━━━━━━━

📁 TARGET: __TARGET_FOLDER_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


1. Scan the target folder's `package.json`, `index.js`, or any configuration files to understand its architecture and purpose.
2. Generate a comprehensive Context Report containing:
   - **Identity:** What this package is and its role in the monorepo.
   - **Dependencies:** What other monorepo packages it relies on.
   - **Constraints:** Specific rules, frameworks, and linters applied here.

3. SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `__TARGET_FOLDER_PATH__/.wb/workflows/reports/__YYYY__/__MM__/__DD__/contexts/context___FOLDER_NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your context as Entry #1
   - If it ALREADY exists → APPEND your context as the next Entry #N

   Entry header format (use `---` only when appending, NEVER as the very first line of the file):
   # Context Entry #N — *(__YOUR_MODEL_NAME__ via __YOUR_CLIENT__ — __CURRENT_TIME__)*
   > **Model:** __YOUR_MODEL_NAME__
   > **Client:** __YOUR_CLIENT__
   > **Time:** __TODAY__ __CURRENT_TIME__
   [... your full context analysis ...]

4. If this is the active context, ensure it is also reflected in the main `.wb/workflows/context.md` file for daily use.

5. APPLY OUTPUT CONVENTIONS (see ../_shared/output_conventions.md):
   - All file/folder references in the report → relative markdown links from the output file's directory (§1).
   - Any /wb* commands cited → full-syntax form (§2).

6. END THE FILE WITH:

   ## 🧭 What's Next?

   Run `/wbNext <target_folder>` to get a current, ranked list of next actions for this scope.

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

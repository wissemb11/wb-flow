# wbSetup Template v2.0


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbSetup`

## When to run it

- **New package** — run immediately after `mkdir`, before writing any code.
- **Acquired package** — if you inherited something that never had `/wbSetup`, run it now.
- **Big rename/restructure** — if you moved the folder, re-run so context.md reflects the new reality.

Do NOT run it "to refresh" an existing, working package. That's `/wbContext`, not `/wbSetup`. Running `/wbSetup` on a package that already has a tuned `dev.md` risks overwriting hand-authored rules.

## The three forms

```
/wbSetup <pkg-path>                          # standard: context.md + dev.md
/wbSetup <pkg-path> --focus="<subsystem>"    # + focused deep-dive file
/wbSetup core2/ --scope=global               # monorepo_rules.md only
```

## What to check after it runs

1. Open `context.md` — does it actually match what the package is? Fix misreads.
2. Open `dev.md` — every rule should be a *refusal* ("never X", "do not Y"). Prose descriptions = rewrite.
3. Check the `dist/` vs `dist-dev/` rule is there if the package publishes. If not, add it.
4. If this is wb-press (Vue 2) — check that `dev.md` forbids Vue 3 syntax.

## The mistake to avoid

Running `/wbSetup` and not reading the output. The AI's inferences are fallible. A 2-minute read of `dev.md` catches 90% of mistaken rules before they cause damage.

> For deeper reading: [`docs_claude/commands/wbSetup/wbSetup_practical_claude.md`](../../docs/docs_claude/commands/wbSetup/wbSetup_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

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
/wbSetup <scope_folder>           # normal mode — produce a fresh output file
/wbSetup <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbSetup` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-f` → `--focus`
- `-s` → `--scope`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: Copy the prompt below, replace `__TARGET_PATH__`, and paste to your AI Agent (Cline, OpenCode, or Antigravity). 
> This is the "Day 0" command that breathes life into a new directory by establishing its agentic identity.

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_path>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/setup/setup_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE setup file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your setup log as Entry #1.
- **File ALREADY exists →** READ it, then APPEND your setup corrections/additions as Entry #N.
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Setup Report: <scope> — <YYYY-MM-DD>`

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.
Setup-specific gap-fills:
- Broken relative links → recompute from the file's actual directory depth (common error: using `../../../../` when the file is deeper than 4 levels from target).
- Plain-text file references (`context.md`, `dev.md`, `dev_reference.md`) → convert to relative markdown links per §1.
- Missing `dev_reference.md` mention → add if the file exists.
- Missing or stale `## 📂 Generated Files` footer → regenerate per §5.
- Missing `> _Self-corrected:` timestamp → append at bottom.

---

## 🚀 The Initialization Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbSetup ━━━━━━━━━━━━━

📁 TARGET: __TARGET_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


You are the **Lead Architect Agent**. Your task is to initialize the "Agentic Brain" for the target folder. This folder currently lacks standardized context.

1. **Environmental Discovery**:
   - Perform a `list_dir` on `__TARGET_PATH__`.
   - Read `package.json` (if present) to extract:
     - Package Name & Version
     - Dependencies (Internal @wbc-ui2 vs External)
     - Build/Dev Scripts
   - Identify the primary language (Vue 2.7, TypeScript, Node.js).

2. **Generate Core Workflow Files**:
   - Create `__TARGET_PATH__/.wb/workflows/context.md`:
     - **Identity**: 1-sentence purpose of this folder.
     - **API Surface**: List key exported functions or components.
     - **Dependencies**: Explicitly list monorepo peers this folder depends on.
   - Create `__TARGET_PATH__/.wb/workflows/dev.md`:
     - Define 3-5 specific coding rules for this folder (e.g., "Use Vuetify colors", "No direct DOM access").
   - Create `__TARGET_PATH__/.wb/workflows/dev_reference.md`:
     - List the exact terminal commands for `build`, `test`, and `serve` based on your discovery.

3. **Sub-Contexts & Planning (Focus Mode)**:
   - If the user provides a focus (e.g., `--focus="renderer"`):
     - Analyze the specific sub-system code deeply.
     - Create specialized context files (e.g., `context_renderer.md`).
     - Automatically generate a `/wbPlan` blueprint (`wbplan_setup.md`) so Worker agents can validate and refine the architecture.

4. **Global Synchronization**:
   - Read `core2/.wb/workflows/monorepo_rules.md`.
   - Ensure local `dev.md` rules align with the monorepo's shared standards.

5. **Audit Trail** — SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `__TARGET_PATH__/.wb/workflows/reports/__YYYY__/__MM__/__DD__/setup/setup___FOLDER_NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your setup log as Entry #1
   - If it ALREADY exists → APPEND your setup as the next Entry #N

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

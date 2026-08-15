# wbAudit Template v3.1 — Sends to Unified Backlog

> Conforms to output_conventions v1.12 · template v3.1


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbAudit`

## The two modes

```
/wbAudit <folder>     # strategic: score + findings + recommendation
/wbAudit <file>       # surgical: flaws + existing-vs-suggested diff
```

The folder mode is what you run before `/wbRelease`. The file mode is what you run when you're about to refactor something or got a bug report on a specific file.

## When to audit

- **Before `/wbRelease`** — folder audit on the package being released.
- **Before `/wbDeploy`** — folder audit on the app being deployed.
- **After inheriting code** — folder audit on the package to baseline the debt.
- **Before refactoring a specific file** — file audit on that file.
- **After `/wbDebug` finds a root cause** — file audit to see if similar patterns exist elsewhere.

Do NOT audit:
- Work in progress. Audit the *finished* thing.
- Third-party code you can't fix. Audit only code you control.
- Files you already know are broken (you don't need a score; you need `/wbDebug`).

## Reading the audit

A useful audit has five things. A useless audit is missing at least one:

1. **Score** with a ship/don't-ship recommendation.
2. **Findings ranked by severity** (BLOCKER / MAJOR / MINOR).
3. **Specific file + line references**.
4. **"What this audit did NOT check"** section.
5. **Next command** (usually `/wbPlan` to fix blockers).

If any of these are missing, re-run with "harsher."

## The rubber-stamp failure mode

Default LLM agreeableness produces audits that say "looks good overall, minor improvements possible." This is always wrong for non-trivial packages. Every active package has at least one MAJOR finding.

Counter-prompt: *"Re-audit. Assume a paying customer who hates this codebase is about to file a bug report. Read reports/ for prior audits — unresolved findings are by definition current findings. Flag subtle divergences, not generic advice. Name files, functions, line numbers."*

## The "don't resolve open decisions" rule

If `context.md` contains an open architectural decision (e.g., "extractSubObject array handling: undecided"), the audit must **surface** that decision, not resolve it. A good audit says "this is open; don't let new consumers lock it in." A bad audit says "you should probably go with structural."

Audits are for describing reality, not deciding architecture.

## What /wbAudit cannot do

- **Performance.** Audit reads code, not runtime. Use `/wbTest --profile`.
- **Security.** Audit is general-purpose. Use `/wbReview --security` for adversarial checks.
- **Business logic correctness.** Audit can't tell if your feature *should* exist.
- **User experience.** Audit reads code, not UX.

Every good audit names these limits in its "did NOT check" section.

## When /wbAudit is the wrong command

- You want to verify a specific change is correct → `/wbReview` (surgical, scoped to a change).
- You want to run tests → `/wbTest` (mechanical verification).
- You want to find *why* something's broken → `/wbDebug`.
- You want to clean up dead code → `/wbClean`.

`/wbAudit` answers one question: *"Is this code ready to ship?"*

> For deeper reading: [`wbAudit_practical.md`](https://flow.wbc-ui.com/commands/wbAudit/wbAudit_practical) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--profile` | `-p` |
| `--scope` | `-s` |
| `--security` | `-S` |
| `--act` | `-a` |
| `--wbPlan` | `-P` |
| `--ideas` | `-I` | Routes P3/cosmetic findings as ideas to `idea_*.md` instead of discarding them. |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |
| `--archive` | `-A` | **Universal** (`_shared/output_conventions.md` §13). Consolidate first, then retire every superseded `<DD>/audits/` folder into `.wb/workflows/archives/` at the same depth. `--archive=all` sweeps every category; `--dry-run` previews. Shell out to `wb-flow archive` — never `mv` by hand. Never implied by another flag. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbAudit <scope_folder>           # normal mode — produce a fresh output file
/wbAudit <previous_output_file>   # consolidate mode — absorb every still-open item from older audits/ files, then repair in place
/wbAudit <previous_output_file> --archive   # …and then retire the audits/ folders it just superseded
```

When the first arg is an existing output file from a prior `/wbAudit` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

**Consolidation (§13.2) runs first, before any repair.** Sweep this scope's whole `reports/` tree for other `audit_<scope>_*.md` files and absorb every item still open into THIS file — de-duplicated on the item's text (never its ID, which restarts per file), each carrying a relative `Origin` link back to the oldest file that raised it. Sources are read, never modified.

**Archiving is opt-in and never implied.** With `--archive`, and only once consolidation has completed, retire the superseded folders by shelling out to the CLI — `wb-flow archive <this file> --dry-run` first, read the move list, then apply. Without the flag, merely offer it in `What's Next?`. Archiving before consolidating does not delete an open item; it makes it invisible, which is worse. Full contract: [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §13.


<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-p` → `--profile`
- `-s` → `--scope`
- `-S` → `--security`
- `-a` → `--act`
- `-P` → `--wbPlan`
- `-I` → `--ideas`
- `-A` → `--archive`   *(universal — consolidate-then-sweep, §13)*
- `-n` → `--dry-run`   *(universal — preview a sweep)*

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: This is the manual template for generating an audit report. Paste this to an AI to have it perform a deep, honest, code-based technical audit.
>
> **v3 change:** After creating the audit report, findings are **auto-sent to the plan file** as backlog rows.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output (relative links, full-syntax commands, self-correct mode, **§9 Action Type Tagging** — declare `type:` + `emits:` in YAML front-matter, add a plain-text `Requires` column to every findings/Top-N-actions table, include a `## 🔗 Action Types` legend).

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Audit Report: <scope> — <YYYY-MM-DD>` *(or the legacy `# Audit Entry #N` header for entry-N append mode).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Audit-specific gap-fills:

- Bare `Origin: /wbAudit` or `Verify: /wbTest` in the sent-to-plan table → expand to full syntax `/wbAudit <target>` / `/wbTest <target>` per §2.
- Plain-text file references in findings (file paths, line numbers) → relative markdown links per §1.
- Missing severity tier (P0–P3) on findings → infer from the existing Consensus Table or score.

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE audit file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your audit as Entry #1.
- **File ALREADY exists →** READ it, then APPEND your audit as the next Entry #N. You SHOULD reference and respond to previous entries (agree/disagree with scores, add missed findings).
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

**Example (v2):**
If Gemini Pro runs `/wbAudit` on `packages/wb-core` on April 22, 2026 at 16:00:
```
packages/wb-core/.wb/workflows/reports/20260422/audits/audit_wb-core_20260422.md
```
If Claude runs it later the same day, it appends Entry #2 to the same file — but with **Smart Merge** (see below).

### Smart Merge Protocol (finding-based commands only)

When you are the **second (or Nth) model** appending to an existing audit file, you MUST:

1. **READ** the entire existing file before writing.
2. **EXTRACT** all findings from previous entries.
3. **For each finding you identified**, check if it matches an existing finding:
   - **Match criteria:** ≥2 of: same file referenced, same function/method, >70% title token overlap.
   - **MATCH FOUND →** Do NOT create a duplicate finding. Instead:
     - Add your severity/evidence/recommendation to a **Model Votes** detail section under that finding.
     - Update the **Consensus Table** (if one exists) with your vote, or promote the flat findings to a Consensus Table.
   - **NO MATCH →** Add as a new finding (genuinely new discovery).
4. **Build/update the Consensus Table** at the top with columns: `# | Finding | Confidence | Models | Severity (consensus) | Status`
   - Confidence: `🟢 N/N` (all models agree), `🟡 K/N` (partial).
   - Severity: when models disagree, use the **higher** severity (conservative).
5. **Add a merge log** at the bottom: `> *Merged by <ModelName> — HH:MM — X duplicates enriched, Y new findings added*`

> **First model?** Just write normally as Entry #1. No Consensus Table needed — it will be created by the second model.

### Consolidate & Archive (`/wbAudit <audit_file.md>` · `--archive`)

```
/wbAudit <audit_file.md>              # consolidate: repair this file + absorb every unresolved older finding
/wbAudit <audit_file.md> --archive    # …then retire the emptied audits/ folders
/wbAudit <scope>/ --archive           # fresh audit, then the same sweep
```

Full contract: [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §13. Audit-specific:

1. **Absorb first.** Walk this scope's whole `reports/` tree for other `audit_<scope>_*.md`. A finding is **still open** when it is 🔴/🟡 and no later audit, review or task report records it as resolved. Carry each one into today's file through the **Smart Merge Protocol above** — the same ≥2-of-3 match criteria — so a finding raised on three consecutive days lands as one row with three votes, not three rows. Each absorbed finding keeps a relative `Origin` link to the **oldest** file that raised it; that date is what makes "this has been open 8 days" visible, and it is the single most useful number in a consolidated audit.
2. **Resolved findings do not come forward.** They stay in the file that closed them. Consolidation carries debt, not history.
3. **Then, and only with `--archive`,** sweep:

   ```bash
   wb-flow archive <audit_file.md> --dry-run    # the file pins itself as the keeper
   wb-flow archive <audit_file.md>
   ```

   Never `mv` by hand. Never sweep if step 1 did not complete — an unresolved finding whose only record just moved out of the scanned tree is a finding that has been silently dropped.

**Without `--archive`,** end with the offer instead: `📋 Mechanical — N superseded audit folders hold no unresolved findings. → /wbAudit <this file> --archive`.

---

## The Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbAudit ━━━━━━━━━━━━━

📁 TARGET: __TARGET_FOLDER_OR_FILE_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__

━━━ CONTEXT & GOAL ━━━
Perform a deep, honest, code-based technical audit of the target.
User is the sole developer of a Vue 2 monorepo UI engine with 12 sub-packages, freemium tiering, and demo apps. Wants brutal, evidence-based evaluation.

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


1. Inspect actual codebase/content — base everything on what EXISTS, not plans.
2. DYNAMIC SCOPING:
   - **If TARGET is a FOLDER (Project Level):** Evaluate the local content and compare it against the broader tech community (e.g., Vue ecosystem, data analysis tools, competitors). Assess the real implementation status, business viability of the freemium model, security vulnerabilities, and architectural debt.
   - **If TARGET is a FILE (e.g., dev.md):** Analyze what the file is used for, identify missing points or logical flaws, and provide a fully enhanced, inspired suggestion for the file content. Ensure you include a comparison table showing the differences between the existent file and the new suggestion.
3. Suggest enhancements, new ideas, or structural improvements.
4. Deliver a score out of 10 with status classification.
5. Structure the output as a 9-section audit report with tables, concrete evidence, and actionable conclusions.

6. SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/audits/audit___NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your audit as Entry #1
   - If it ALREADY exists → APPEND your audit as the next Entry #N

   Entry header format (use `---` only when appending, NEVER as the very first line of the file):
   # Audit Entry #N — *(__YOUR_MODEL_NAME__ via __YOUR_CLIENT__ — __CURRENT_TIME__)*
   > **Model:** __YOUR_MODEL_NAME__
   > **Client:** __YOUR_CLIENT__
   > **Time:** __TODAY__ __CURRENT_TIME__
   [... your full audit content ...]
7. SEND TO PLAN (Unified Backlog):

   After writing the audit report, ALSO append your findings to the plan file:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/plans/plan___NAME_____YYYYMMDD__.md`

   - If the plan file does NOT exist → CREATE it with a header, then add the section below
   - If it ALREADY exists → APPEND the section below

   Section format (apply output_conventions.md §1 + §2 — Source link is RELATIVE, Origin/Verify are FULL-SYNTAX):
   ---
   ## 🔍 Audit Findings — /wbAudit *(__YOUR_MODEL_NAME__ — __CURRENT_TIME__)*
   > **Source:** [audit___NAME_____YYYYMMDD__.md](../audits/audit___NAME_____YYYYMMDD__.md) Entry #N
   > **Findings sent:** X (Y atomic, Z recursive)

   | # | Origin | Task | Verify | P | Worker | Validator | ☐ Done | ☐ Valid |
   |---|---|---|---|---|---|---|---|---|
   | 1 | `/wbAudit <target>` | [finding description or /wb* command for complex items] | `/wbTest <target> --scope=task-1` | P0-P3 | [recommended model] | [validator model] | ⬜ | ⬜ |

   Rules:
   - Send findings with severity ≥ P2 to the plan (skip P3/cosmetic unless `--ideas` is set)
   - Simple findings → Task = plain text description (with relative links to referenced files per §1)
   - Complex findings → Task = `/wbPlan <target> "problem description"` (recursive)
   - **Origin** & **Verify** MUST be full-syntax invocable commands per output_conventions.md §2 (e.g., `/wbAudit apps/wb-core/md.wbc-ui.com/`, not bare `/wbAudit`)
   - Verify = the command to run to confirm the issue is resolved (e.g., `/wbTest <target> --scope=...`, `/wbAudit <target>`, `/wbSecure <target>`)

8b. **SEND IDEAS (if `--ideas` flag is set, OR always for P3/improvement findings):**

   When `--ideas` is passed, P3/cosmetic findings that represent **improvements** (not bugs) are routed to the idea pipeline:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/ideas/idea___NAME_____YYYYMMDD__.md`

   - If the idea file does NOT exist → CREATE it with the standard `# Idea Backlog:` header.
   - If it ALREADY exists → APPEND the section below.

   Section format:
   ---
   ## 💡 Ideas — /wbAudit improvements *(__YOUR_MODEL_NAME__ — __CURRENT_TIME__)*
   > **Source:** [audit___NAME_____YYYYMMDD__.md](../audits/audit___NAME_____YYYYMMDD__.md) Entry #N
   > **Origin Command:** `/wbAudit <target>`
   > **Ideas registered:** X

   | # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
   |---|---|---|---|---|---|---|---|---|---|
   | N | <score> | <span title="Run: /wbExplain idea_<scope>_<date>.md --id=<N> --scope=idea">📄</span> | [finding as improvement idea] | P2-P3 | <est> | <ModelName> via /wbAudit | ⬜ | ⬜ | — |

   Score is computed per `wbIdea_template.md` scoring heuristic. Only improvements and suggestions are routed here — actual bugs/defects stay in the plan.

8. END THE AUDIT FILE WITH:

   **Before "What's Next?", append the 🌊 Next Executable Sequence** — the wave × role matrix defined in `_shared/output_conventions.md` §10 (canonical: rows = parallel-safe waves, columns = the four `Requires` roles, each cell a full invocable command + `→ *Model · ~$cost*`, mandatory collision check, required Wave notes). Source rows: the 🔵 findings that need a follow-up command; a finding whose fix is gated on another finding lands in a later wave. Emit it only when there are **2 or more** actionable items; for a single one, print `Next: <command> → *Model*` instead. Also print the matrix in the chat response. On a self-correct pass, insert it if absent and recompute it in place if present (§10.5).

   ## 🧭 What's Next?

   Run `/wbNext <target_folder>` to get a current, ranked list of next actions based on this audit + any other recent reports.

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
| Foundational | [context.md](../../../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`<monorepo-root>/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit <monorepo-root>/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan <monorepo-root>/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack <monorepo-root>/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```
```

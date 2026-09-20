# wbReview Template v2.1

> Conforms to output_conventions v1.12 · template v2.1


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbReview`

## When to use it (and when you'd mistakenly reach for /wbAudit)

```
/wbReview <target> --plan=<path-to-plan>
```

Required: `--plan`. If you don't have a plan file, you're at the wrong command. Use `/wbAudit`.

### Good fits for /wbReview

- AI worker finished a plan's tasks; you want to verify before merging.
- You finished executing a plan yourself and want a second pass.
- A quick hotfix went out under pressure; you want a post-hoc check against the (brief) plan that was written.
- Docs rewrite followed a plan; want to verify nothing hallucinated.

### Bad fits for /wbReview

- Pre-release sanity check → `/wbAudit`
- "Is this file good?" → `/wbAudit <file>`
- Tests failing? → `/wbTest`, then `/wbDebug`
- You never wrote a plan → doesn't apply

## Reading the review output

Three possible verdicts:

- **🟢 PASS** — every plan task confirmed, no regression, no rule violations.
- **🟡 PASS WITH DEBT** — most tasks confirmed; minor issues tracked for later. Safe to merge if debt is logged.
- **🔴 FAIL** — at least one task claimed complete but actually incomplete, or a rule was violated. Don't merge.

A good review is specific about which tasks failed and why. "Task 3 incomplete: test coverage is dev-mode only, prod-mode branch untested." Not "some issues remain."

## The key check

**Did the worker mark tasks complete without actually finishing them?** This is the single failure mode `/wbReview` is best at catching. Checkbox state is aspirational; code state is real. Review verifies code state against checkbox claims.

If checkboxes ✅ but code ❌, the review fails that task and re-opens it in the plan file.

## The "what the review found that the plan missed" section

A good review doesn't just verify — it catches side effects the plan author didn't anticipate:

- New dependencies introduced.
- Related files modified but not mentioned.
- Rules violated that the plan didn't explicitly invoke.
- Tests that stopped passing (discovered during review).

This is where `/wbReview` earns its keep beyond checkbox verification.

## The mistake to avoid

**Skipping `/wbReview` because you're the one who executed the plan.** Your own work is the work you're least qualified to judge. If the plan was big enough to need a plan, it's big enough to review. Use an adversarial prompt: *"assume the worker was lazy. Where did they cut corners?"*

## When /wbReview refuses

If the plan file is missing, malformed, or if the current code state has no detectable relationship to the plan, `/wbReview` will refuse and tell you why. Don't work around it — fix the plan-to-code linkage first. The review is only useful if there's something to review against.

> For deeper reading: [`wbReview_practical.md`](https://flow.wbc-ui.com/commands/wbReview/wbReview_practical) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--plan` | `-p` |
| `--act` | `-a` |
| `--wbPlan` | `-P` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |
| `--archive` | `-A` | **Universal** (`_shared/output_conventions.md` §13). Consolidate first, then retire every superseded `<DD>/reviews/` folder into `.wb/workflows/archives/` at the same depth. `--archive=all` sweeps every category; `--dry-run` previews. Shell out to `wb-flow archive` — never `mv` by hand. Never implied by another flag. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbReview <scope_folder>           # normal mode — produce a fresh output file
/wbReview <previous_output_file>   # consolidate mode — absorb every still-open item from older reviews/ files, then repair in place
/wbReview <previous_output_file> --archive   # …and then retire the reviews/ folders it just superseded
```

When the first arg is an existing output file from a prior `/wbReview` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

**Consolidation (§13.2) runs first, before any repair.** Sweep this scope's whole `reports/` tree for other `review_<scope>_*.md` files and absorb every item still open into THIS file — de-duplicated on the item's text (never its ID, which restarts per file), each carrying a relative `Origin` link back to the oldest file that raised it. Sources are read, never modified.

**Archiving is opt-in and never implied.** With `--archive`, and only once consolidation has completed, retire the superseded folders by shelling out to the CLI — `wb-flow archive <this file> --dry-run` first, read the move list, then apply. Without the flag, merely offer it in `What's Next?`. Archiving before consolidating does not delete an open item; it makes it invisible, which is worse. Full contract: [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §13.


<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-p` → `--plan`
- `-a` → `--act`
- `-P` → `--wbPlan`
- `-A` → `--archive`   *(universal — consolidate-then-sweep, §13)*
- `-n` → `--dry-run`   *(universal — preview a sweep)*

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: This is the manual template for performing a formal quality review of an executed task. Use this AFTER a task has been completed via `/wbPlan`.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output (relative links, full-syntax commands, self-correct mode, **§9 Action Type Tagging** — declare `type:` + `emits:` in YAML front-matter, add a plain-text `Requires` column to every recommendations table, include a `## 🔗 Action Types` legend).

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Review: <scope> — <YYYY-MM-DD>` *(or the legacy `# Review Entry #N` header for entry-N append mode).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Review-specific gap-fills:

- Missing PASS/FAIL status on a finding → infer from the worker's task report.
- Plain-text file references → relative markdown links per §1.
- Plain-text plan reference → link to the actual plan file per §1.

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/reviews/review_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE review file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your review as Entry #1.
- **File ALREADY exists →** READ it, then APPEND your review as the next Entry #N. Multiple reviewers in one file — like a PR with multiple reviewers.
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

### Smart Merge Protocol (finding-based commands only)

When you are the **second (or Nth) model** appending to an existing review file, you MUST:

1. **READ** the entire existing file before writing.
2. **EXTRACT** all review findings/comments from previous entries.
3. **For each finding you identified**, check if it matches an existing finding:
   - **Match criteria:** ≥2 of: same file referenced, same function/method, >70% title token overlap.
   - **MATCH FOUND →** Do NOT create a duplicate. Instead add your perspective to a **Model Votes** section and update the **Consensus Table**.
   - **NO MATCH →** Add as a new finding.
4. **Build/update the Consensus Table** at the top with columns: `# | Finding | Confidence | Models | Severity (consensus) | PASS/FAIL`
5. **Add a merge log** at the bottom: `> *Merged by <ModelName> — HH:MM — X duplicates enriched, Y new findings added*`

> **First model?** Just write normally as Entry #1. No Consensus Table needed — it will be created by the second model.

### Consolidate & Archive (`/wbReview <review_file.md>` · `--archive`)

```
/wbReview <review_file.md>              # consolidate: repair + absorb every unaddressed older comment
/wbReview <review_file.md> --archive    # …then retire the emptied reviews/ folders
```

Full contract: [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §13. Review-specific:

1. **Absorb first.** Scan this scope's `reports/` tree for other `review_<scope>_*.md`. A comment is **still open** when it is 🔴/🟡 and no later review or task report shows it addressed. Merge through the Smart Merge Protocol above so a repeated comment becomes one row with N votes. Keep an `Origin` link to the oldest review that raised it.
2. **A FAIL verdict never gets absorbed as a comment.** If a prior review's overall verdict was FAIL and nothing since re-reviewed that work, say so at the top of today's file — carrying its individual comments forward while dropping the verdict turns a rejection into a to-do list.
3. **Then, with `--archive` only:** `wb-flow archive <review_file.md> --dry-run`, read it, then apply. Never before step 1 completes; never by hand.

**Without `--archive`,** offer it: `📋 Mechanical — N superseded review folders hold no open comments. → /wbReview <this file> --archive`.

---

## The Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbReview ━━━━━━━━━━━━━

📁 TARGET: __TARGET_PATH__
📝 ORIGINAL PLAN: __PATH_TO_PLAN_FILE__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__

━━━ CONTEXT & GOAL ━━━
Act as a Senior Code Auditor and Quality Assurance Lead. Your goal is to verify that the work executed in the TARGET matches the ORIGINAL PLAN perfectly. 

You must be critical, meticulous, and evidence-based. If a feature works but is "sloppy," you must flag it.

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


1. **Plan vs. Reality Check**: Read the ORIGINAL PLAN and inspect the current codebase. Verify that EVERY checkbox (✅) marked by the worker is actually implemented correctly.
2. **Technical Integrity**: Check for regressions, linting errors, and architectural consistency. Does the new code follow the monorepo's "UI as Data" philosophy?
3. **Performance & Security**: Is the new code efficient? Are there any obvious security holes or resource leaks?
4. **Scoring**: Deliver a Review Score (1-10) and a final status:
   - 🟢 **PASS**: Plan completed, code is elite.
   - 🟡 **PASS WITH DEBT**: Functional, but needs cleanup.
   - 🔴 **FAIL**: Plan not completed or regressions introduced.

5. SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/reviews/review___NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your review as Entry #1
   - If it ALREADY exists → APPEND your review as the next Entry #N

   Entry header format (use `---` only when appending, NEVER as the very first line of the file, apply output_conventions.md §1 — link the original plan):
   # Review Entry #N — *(__YOUR_MODEL_NAME__ via __YOUR_CLIENT__ — __CURRENT_TIME__)*
   > **Model:** __YOUR_MODEL_NAME__
   > **Client:** __YOUR_CLIENT__
   > **Time:** __TODAY__ __CURRENT_TIME__
   > **Original plan:** [plan_<name>_<date>.md](../plans/plan_<name>_<date>.md)
   [... your full review content; all file references as relative links per §1 ...]

6. APPLY OUTPUT CONVENTIONS:
   - All file/folder references → relative markdown links from the output file's directory (§1).
   - Any /wb* commands cited (e.g., "re-run /wbTest") → full-syntax form (§2).

7. END THE FILE WITH:

   **Before "What's Next?", append the 🌊 Next Executable Sequence** — the wave × role matrix defined in `_shared/output_conventions.md` §10 (canonical: rows = parallel-safe waves, columns = the four `Requires` roles, each cell a full invocable command + `→ *Model · ~$cost*`, mandatory collision check, required Wave notes). Source rows: the findings that need a follow-up command, plus any failed-validation fix-ups. Also print the matrix in the chat response. On a self-correct pass, insert it if absent and recompute it in place if present (§10.5).

   ## 🧭 What's Next?

   Run `/wbNext <target_folder>` to get a current, ranked list of next actions based on this review.

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


## ━━━ Active Model Roster ━━━

This command emits a `## 🌊 Next Executable Sequence`, so **`../_shared/output_conventions.md`
§10 rules 5, 5b and 12 apply to its output in full.**

**Read them there.** Nothing about them is restated, summarised or exemplified here — ten copies of
one rule are ten things to keep in step, which is the duplication rule 5 exists to remove. Even the
one-line gloss this block used to carry was a summary, and a summary drifts from what it summarises.
`wb-flow lint` **step-7** gates this command's output on rules 5b and 12.

---

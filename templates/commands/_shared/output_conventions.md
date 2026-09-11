# Output Conventions — Shared Across All `/wb*` Commands

> **Single source of truth** for cross-cutting rules that apply to every command's output file.
> Each `wbX_template.md` references this file rather than duplicating the rules.

---

## 1. Relative Links for Local File References

Whenever a command's output mentions a local file or folder, render it as a **clickable markdown link with a relative path** computed from the **output file's own directory**.

**Why relative (not absolute):** The output file's parent folder may be moved (e.g. archived, renamed, copied to another monorepo). Relative links survive moves; absolute links do not.

**Applies to:**
- `Source: ...` lines (e.g. audit feeding into a plan)
- `Target: ...` lines (the folder/file the command operated on)
- `Note: ...` blocks pointing to sibling folders (e.g. `tasks/`)
- Any inline mention of a file in tables, prose, or callouts

**Examples** — assuming output file is at
`apps/wb-core/md.wbc-ui.com/.wb/workflows/reports/20260501/plans/plan_md.wbc-ui.com_20260501.md`:

| Before (plain text)                                  | After (relative markdown link)                                       |
|------------------------------------------------------|----------------------------------------------------------------------|
| `Source: audit_md.wbc-ui.com_20260501.md`            | `Source: [audit_md.wbc-ui.com_20260501.md](../audits/audit_md.wbc-ui.com_20260501.md)` |
| `Target: apps/wb-core/md.wbc-ui.com/`                | `Target: [apps/wb-core/md.wbc-ui.com/](../../../../../)`             |
| `All task reports must be externalized to tasks/.` | `All task reports must be externalized to [tasks/](tasks/).` |

**Rule of thumb:** if the reader could click the path and want to open it, it must be a link.

### 1.1 Link beautification — short label, full relative href

Long, verbose link labels hurt readability. Render every link as **basename label + full relative href**.

**Mechanical detection rule — a link label is "verbose" and MUST be rewritten if ANY of these are true:**

1. The label is **identical to the href** (e.g. `[../../05/09/plans/plan_wb-flow_20260509.md](../../05/09/plans/plan_wb-flow_20260509.md)`).
2. The label **contains a path separator `/`** other than a single trailing `/` for folders (e.g. `[../audits/audit_X.md](...)`, `[apps/wb-core/md.wbc-ui.com/](...)`, `[plans/plan_X.md](...)`).
3. The label **contains parent-directory tokens** (`..`, `…`) or starts with `./`.
4. The label **starts with a leading `/`** or a drive letter (it's an absolute path posing as a label).

If any of the above match, **the label MUST be rewritten to the basename only** (the last `/`-separated segment of the path — filename for files, or last folder name with a trailing `/` for folders).

| ❌ Don't (verbose label) | ✅ Do (basename label, full relative href) |
|---|---|
| `[../../05/09/plans/plan_wb-flow_20260509.md](../../05/09/plans/plan_wb-flow_20260509.md)` | `[plan_wb-flow_20260509.md](../../05/09/plans/plan_wb-flow_20260509.md)` |
| `[…/…/05/09/plans/plan_wb-flow_20260509.md](../../../../05/09/plans/plan_wb-flow_20260509.md)` | `[plan_wb-flow_20260509.md](../../../../05/09/plans/plan_wb-flow_20260509.md)` |
| `[../audits/audit_md.wbc-ui.com_20260501.md](../audits/audit_md.wbc-ui.com_20260501.md)` | `[audit_md.wbc-ui.com_20260501.md](../audits/audit_md.wbc-ui.com_20260501.md)` |
| `[apps/wb-core/md.wbc-ui.com/](../../../../../)` (folder) | `[md.wbc-ui.com/](../../../../../)` |
| `[../../../../package.json](../../../../package.json)` | `[package.json](../../../../package.json)` |

**Rules:**
- **Label = basename only.** Compute the basename from the *href* (not the prose around the link). For files, take everything after the last `/`. For folders ending in `/`, take the second-to-last segment + `/`.
- **Href = full relative path** computed from the output file's directory (per §1). Never collapse the href to just the basename — that breaks the link.
- **Exception — prose-flow links.** When the natural sentence structure already names the file (e.g. `"Read [the package.json](../../package.json) for details"`) and rewriting would force the basename, leave human-authored prose labels alone. The rule targets *file references*, not narrative phrases. A reference is "file-style" if the label is, or could be replaced by, a path/filename (the four detection cases above all qualify).
- **Optional tooltip:** for ambiguous basenames (e.g. two `context.md` at different scopes), add a `"<short scope hint>"` tooltip — `[context.md](../../../../../../../context.md "core2 root")`.
- **Self-correct mode (§3) MUST run the four-rule detection on every link** in the file and rewrite every match. This is non-optional — it's how legacy files written before v1.9 get cleaned up.

**Quick mental check before writing a link:** *"If I strip everything before the last `/` from my label, does the meaning survive?"* If yes, you should have written that shortened form to begin with.

### 1.2 Canonical relative-path patterns (don't count slashes by hand)

Every report file lives at a **fixed depth** under its scope:

```
<scope>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/<category>/<file>.md
        └─ 0 ─┘└─ 1 ─┘└─ 2 ─┘└─ 3 ─┘└─ 4 ─┘└─ 5 ─┘└─ 6 ───┘└─ 7 ──┘
                                                             ↑ this file
```

The href from `<file>.md` to anything else is therefore **mechanically derivable** — there is no judgment call. Always use this lookup table instead of counting `../` segments by hand.

**`<category>` ∈ {`plans`, `audits`, `ideas`, `contexts`, `nexts`, `standups`, `visions`, `tracks` (under `tracks/<YYYY>/<MM>/<DD>/`, not `reports/`)}.**

| What you want to link to | Canonical href (from a report `.md` file) |
|---|---|
| **Same-day sibling category file** (e.g. plan → audit) | `../<category>/<file>.md` |
| **Same-day sibling category folder** | `../<category>/` |
| **Prev/next-day same category, same month** | `../../<DD>/<category>/<file>.md` |
| **Prev/next-day same category, different month** | `../../../<MM>/<DD>/<category>/<file>.md` |
| **Prev/next-day different category, same month** | `../../<DD>/<other-category>/<file>.md` |
| **Up to scope root** (where `package.json` / `.wb/` live) | `../../../../../../../` *(exactly **7** up: `<cat>` → `<DD>` → `<MM>` → `<YYYY>` → `reports` → `workflows` → `.wb` → scope)* |
| **Up to scope's `context.md` / `dev.md`** | `../../../../../../../context.md` · `../../../../../../../dev.md` |
| **Up to monorepo root `<monorepo-root>/` from a sub-package** | `../../../../../../../../../../` *(10 up — 5 to leave the sub-package + 5 to leave `<monorepo-root>/.wb/...`; alternative form: `../../../../../../../../../../<sibling-scope>/`)* |
| **Up to monorepo root's `<monorepo-root>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/<category>/<file>.md`** | `../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/<category>/<file>.md` |
| **Sibling task report** (from a `plans/<file>.md` to its `tasks/task_<N>/...`) | `tasks/task_<N>/task_<N>_report_<scope>_<date>.md` *(no `../`)* |
| **From a task report up to its parent plan** | `../../<file>.md` *(2 up: leave `task_<N>/`, leave `tasks/`)* |
| **Templates folder from a report file** (rare, prefer doc links) | `../../../../../../../../../../packages/wb-flow/templates/commands/<wbX>/<wbX>_template.md` |

> ⚠️ **Scope-root depth corrected in v1.12 — it was wrong here for a year.** The row above used to read `../../../../../` ("always exactly 5 up — depth 7 minus depth 2"), which mis-read the diagram: `7` numbers the **file**, not its directory, so subtracting anything from it is meaningless. Count the arrows instead — there are seven directories between a report file and its scope root, and the correct href is `../../../../../../../`. Every file written from the old row is off by two levels; a self-correct pass (§3) on such a file MUST rewrite the href, and must not "verify" it by reproducing the old arithmetic.

**How to use this table:**

1. Identify what you're linking to and which row of the table it matches.
2. Substitute the placeholders (`<DD>`, `<MM>`, `<category>`, `<scope>`, `<file>`, `<date>`).
3. Apply §1.1 link beautification (label = basename of the resulting href).
4. **Do not invent your own path.** If your link doesn't match any row above, you are linking to something this convention doesn't cover — flag it (in `What's Next?`) rather than guess.

**Why this exists:** the recurring "broken-link" failure mode is an agent counting `../` by hand and getting it wrong (e.g. `../../05/09/plans/...` when crossing a month, where the correct form is `../../../05/09/plans/...`). The structure is fixed, so the *answers* are fixed — there is nothing to count.

**Self-correct mode (§3) MUST verify** every relative href against this table: if the link matches one of the patterns above (same-day sibling, prev-day, etc.) the href MUST equal the canonical form. Mismatches → rewrite.

---

## 2. Full-Syntax `Origin` / `Verify` Columns

In any backlog/task table, the `Origin` and `Verify` columns must contain an **invocable command** — one a human (or another AI agent) can copy, paste, and run as-is.

**Format:** `/<command> <target-path> [<flags>]`

| ❌ Don't (bare command, ambiguous) | ✅ Do (full invocable form)                              |
|-----------------------------------|----------------------------------------------------------|
| `/wbAudit`                        | `/wbAudit apps/wb-core/md.wbc-ui.com/`                   |
| `/wbTest`                         | `/wbTest apps/wb-core/md.wbc-ui.com/ --scope=task-1`     |
| `/wbRefactor`                     | `/wbRefactor packages/wb-core/src/renderString.js`       |
| `/wbPlan`                         | `/wbPlan packages/wb-core "extract WBC.js helpers"`      |

**When there is no meaningful target** (rare — e.g. a self-correct rerun on the same file), fall back to:
`/<command> <this-file-path>` — still invocable, still unambiguous.

**Bare-command exception:** allowed *only* in the recursive-task pattern where the row's `Task` column already contains the full invocation (e.g. `Task: "/wbPlan packages/wb-core WBC.js"`). In that case `Verify` may stay short. Avoid otherwise.

---

## 3. Self-Correct Mode

Every command whose template defines an output file supports **self-correct mode**, triggered automatically when the input passed to the command **matches that command's output schema** (detected by frontmatter, header markers, or table shape — *not* by filename).

**What self-correct does:**
1. Read the input file.
2. Compare it against the template's required schema (columns, sections, link style, full-syntax commands, etc.).
3. **Fill missing fields** without changing existing valid content:
   - blank `☐ Valid` → add validator name + score if a validation report exists in `tasks_reports/`
   - bare `/wbAudit` in `Origin` → expand to full syntax `/wbAudit <target>`
   - plain-text file references → convert to relative markdown links
   - missing `Worker (Suggested)` / `Validator (Suggested)` → infer from [`model_recommendations.md`](../model_recommendations.md)
   - **column completeness check (per §9 Action Type Tagging):** every Suggested Tasks / findings / ideas / next-actions table MUST include a `Requires` column populated with a plain-text 🧠/✅/🔨/📋 tag, AND the file MUST contain a `## 🔗 Action Types` legend section before the Generated Files footer. If the column is missing, insert it after the `#` (or first identifier) column, infer each row's tag from existing wording, and append the legend block (template in §9.3). If the legend is missing, add it.
   - **link beautification (per §1.1):** apply the **four-rule detection** to every markdown link in the file: rewrite if (1) label == href, (2) label contains a `/` other than a single trailing slash, (3) label has `..`/`…`/`./`, or (4) label is absolute. The rewrite keeps the href intact and replaces the label with the basename of the href. Examples that MUST be normalized: `[../../05/09/plans/plan_X.md](../../05/09/plans/plan_X.md)` → `[plan_X.md](../../05/09/plans/plan_X.md)`; `[../audits/audit_X.md](../audits/audit_X.md)` → `[audit_X.md](../audits/audit_X.md)`. Walk the entire file (front-matter included), not just the main table — `Source:`, `Target:`, `Mode:`, callouts, footer rows, and ANY prose link all qualify.
   - **path correctness (per §1.2):** for every link whose target is another report file (plan/audit/idea/context/next/standup/vision/track) or a scope-root file (`context.md`, `dev.md`, `package.json`), match the link against the §1.2 canonical-path table. If the href doesn't equal the canonical form for that row (most commonly: missing one `../` when crossing a month, or counting depth from the wrong starting point), **rewrite the href to the canonical form**. Do not "fix" the path by trial-and-error — derive it from the table.
   - **next-sequence presence check (per §10.4):** if the file was emitted by one of the §10.3 commands and has **no** `## 🌊 Next Executable Sequence` section, build the wave × role matrix from the file's own actionable items and insert it in canonical §10.4 order (matrix → `▶️ How to run this plan` → `## 🧭 What's Next?`). If the section already exists, recompute it in place against the current Done/Valid state (never leave two).
   - **consolidation backlog check (per §13.2):** scan the scope's `reports/` tree for prior files of this same category holding still-open items. Merge them in (de-duplicated on item text, each carrying an `Origin:` link back to the file it came from), and note the count in `## 🧭 What's Next?` alongside the `--archive` command that would retire the emptied folders. Self-correct **never moves a folder** — see §13.6.
   - any other field the template requires but the file lacks
4. **Do not alter the file's structure** — same sections, same columns, same task rows. Only fill gaps and normalize.
5. **Append or Update "What Next" section** — even if the template usually delegates this to `/wbNext`, in self-correct mode you MUST add a section `## 🧭 What's Next?` with either a list of suggested commands or a **Suggested Tasks Table** if the findings warrant it.
6. **Re-resolve the Active Model Roster block.** If the file carries a `## 🌊 Next Executable Sequence` matrix, re-read the roster file `resolveRosterFile()` picks and rewrite each role's chain in the roster block to match it. **Keyed on "the file carries a matrix", not on "the file is a plan"** — `--wbPlan` on `/wbActOn`, `/wbAudit`, `/wbReview` and `/wbStandup` all write plans, `/wbIdea` promotes rows into them, and `/wbWork` + `/wbValid` write their state columns.

   *Why this is a self-correct duty and not a nicety:* nothing else refreshes it. A plan written in August proposes an August lineup in September, every `--embed` regenerates the staleness, and `wb-flow lint` **step-7** now fails on the divergence — so a file that skips this step no longer passes.

6. **Checklist & Validator Update**:
   - blank `☐ Done` for a task whose `tasks/task_<N>/task_<N>_report_*.md` exists → check it (`✅<br><worker>`).
   - blank `☐ Valid` for a task whose worker report has a validator score appended → fill `✅ <Score>/10<br><validator>`.
   - add missing validator names or scores to the table based on recent task reports.

**What self-correct does NOT do:**
- Does not re-run the underlying analysis (no new audit, no new plan, no new tests).
- Does not delete or rewrite content the user has authored.
- Does not change task IDs, dependencies, or priorities.
- Does not append timestamps for every gap-fill — at most one `> _Self-corrected: <YYYY-MM-DD HH:MM> by <model>_` line at the bottom.

**Detection cheatsheet** (per command, the marker that triggers self-correct):

| Command       | Detection marker (in the input file)                                  |
|---------------|------------------------------------------------------------------------|
| `/wbPlan`     | First H1 matches `# Plan Backlog: <scope> — <date>`                   |
| `/wbIdea`     | First H1 matches `# Idea Backlog: <scope> — <date>`                   |
| `/wbAudit`    | First H1 matches `# Audit Report: <scope> — <date>`                   |
| `/wbReview`   | First H1 matches `# Review: <scope> — <date>`                         |
| `/wbTest`     | First H1 matches `# Test Report: <scope> — <date>`                    |
| `/wbContext`  | First H1 matches `# Context: <scope> — <date>`                        |
| `/wbNext`     | First H1 matches `# Next: <scope> — <date>`                           |
| `/wbTrack`    | First H1 matches `# Track: <scope> — <date>` *(limited self-correct — gap-fill only, never rewrites §N bodies)* |
| (others)      | Each `wbX_template.md` defines its own marker in its **Detection** section. |

If no marker is found, the command runs in normal (fresh-output) mode.

---

## 4. Suggested Tasks Table — Canonical Column Shape

The `🧭 What's Next?` section's **Suggested Tasks Table** is owned by `/wbNext` (and produced inline by self-correct mode, §3.5). Its canonical column shape is:

| # | Suggestion | Target | Why now | Copy-paste | Verify | Est. Time | Suggested Worker |
| - | ---------- | ------ | ------- | ---------- | ------ | --------- | ---------------- |

Column semantics:

- **Suggestion** — short prose: what to do, and (when relevant) which upstream finding/task it descends from. Origin context, when it adds value, lives here as narrative — not as a separate column.
- **Target** — relative markdown link to the file/folder the suggestion operates on (per §1).
- **Why now** — one-sentence rationale tying it to current state (a Done task, a deferred finding, a sibling-app drift, etc.).
- **Copy-paste** — the **full invocable command to *do* the task**, in the format `/<command> <target> [<flags>]` (per §2). This is the click-to-run cell — a reader copies it verbatim into their next prompt. Use `human` (no slash) only when the action is not a `/wb*` command.
- **Verify** — the post-hoc check command that confirms the task was correctly executed. May equal `Copy-paste` for read-only tasks (audit, test) but is distinct for code-edit tasks (where Copy-paste is `/wbRefactor …` and Verify is `/wbTest …` or a `grep`/`ls`).
- **Est. Time** — `<N>m` or `<N>h`.
- **Suggested Worker** — model name(s) per [`../model_recommendations.md`](../model_recommendations.md), or `human`.

**Note — superseded column:** prior table versions exposed an `Origin` column carrying the upstream command that surfaced the suggestion. It was mostly `—` for forward-looking suggestions and added little signal. Origin information now belongs in the **Suggestion** prose. Self-correct mode (§3) MUST migrate any legacy `Origin` column into a `Copy-paste` column when normalizing a file.

---

## 5. "Generated Files" Footer (4D Navigation)

Every output file written under a `.wb/workflows/{reports,tracks}/<YYYY>/<MM>/<DD>/` tree MUST end with a footer block listing **every sibling output file generated under that same date folder** (across `reports/` and `tracks/`). It SHOULD also include a temporal link back to the **Previous Day's Files**.

**Why:** a daily folder typically contains an audit, a plan, a next, possibly a standup and tracks. Without a cross-link footer, each file is an island. With it, any single file is a launchpad to the whole day.

**Discovery rule (same-level / sibling scope):**

Each file's footer lists only its **siblings at the same folder scope** — not every file under the daily tree. Two tiers:

1. **Top-level command outputs** — files directly under a category folder (e.g. `reports/<date>/audits/audit_*.md`, `reports/<date>/plans/plan_*.md`, `reports/<date>/contexts/context_<scope>_<date>.md`, `reports/<date>/nexts/next_*.md`, `tracks/<date>/track_*.md`). Their footer lists the **cross-folder day inventory** of *other top-level command outputs* under `reports/<date>/{audits,contexts,plans,nexts,standups}/` and `tracks/<date>/`. It does **not** list nested task reports or explanation files.
2. **Nested per-task reports** — files under a `tasks/task_<N>/` subfolder (e.g. `reports/<date>/plans/tasks/task_1/task_1_report_*.md` or `task_1_details_*.md`). Their footer lists **only other files in the same `task_<N>/` folder** — siblings (report + details), not the parent plan or audit. Use a single `### Task Files` group instead of `### Reports` / `### Tracks`.

**Why same-level:** a task report is part of a plan's working set; from inside `tasks_reports/`, the relevant navigation is "what other task reports were produced under this same plan." Pulling in the audit/track adds noise. Conversely, the plan itself benefits from cross-folder links to the audit and track that bracket the day's work, but listing every individual task report in every top-level file would bloat the footer.

**Resolution algorithm:**

- Compute the file's date folder: nearest ancestor matching `.wb/workflows/{reports,tracks}/<YYYY>/<MM>/<DD>/`.
- If the file's path contains `tasks/task_<N>/`, apply Tier 2: glob `<parent>/*` only (report + details files for that task).
- Otherwise apply Tier 1: glob `<date>/{audits,contexts,plans,nexts,standups}/*.md` and `<date-track>/*.md` (where `<date-track>` is the matching `tracks/<date>/` folder under the same `.wb/workflows/`). Exclude any `tasks/` subfolder and `explanations/` subfolder from the glob.
- The file being written is always listed, with a trailing `*(this file)*` marker.
- Group by command (audit, plan, next, standup, track, task report, …) inferred from filename prefix (`audit_*`, `plan_*`, `next_*`, `standup_*`, `track_*`, `task_*`).

**Footer format — Tier 1 (top-level command outputs):**

```markdown
---

## 📂 Generated Files (<YYYY-MM-DD>)

> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files

| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Foundational | [dev.md](../../../../../../../dev.md) | Permanent Development Commands and Status |
| Active Plan | [plan_<scope>_<date>.md](../plans/plan_<scope>_<date>.md) | Current executable backlog |
| Active Track | [track_<scope>_<date>.md](../../../../../tracks/<YYYY>/<MM>/<DD>/track_<scope>_<date>.md) | Current session narrative |
| Last Plan | [plan_<scope>_<prev-date>.md](../../<prev-DD>/plans/plan_<scope>_<prev-date>.md) | Previous execution plan |
| Last Track | [track_<scope>_<prev-date>.md](../../../../../tracks/<YYYY>/<MM>/<prev-DD>/track_<scope>_<prev-date>.md) | Previous session narrative |
| Last Audit | [audit_<scope>_<prev-date>.md](../../<prev-DD>/audits/audit_<scope>_<prev-date>.md) | Previous system audit |
| Last Standup | [standup_<scope>_<prev-date>.md](../../<prev-DD>/standups/standup_<scope>_<prev-date>.md) | Previous daily standup |
| Last Vision | [vision_<scope>_<prev-date>.md](../../<prev-DD>/visions/vision_<scope>_<prev-date>.md) | Previous strategic vision |
| Last Next | [next_<scope>_<prev-date>.md](../../<prev-DD>/nexts/next_<scope>_<prev-date>.md) | Previous next actions |

<details>
  <summary>📄 Local Reports</summary>

| Category | File (<next-date>)* | File (<date>) | File (<prev-date>) | Source Command |
|---|---|---|---|---|
| Reports | [audit_<scope>_<next-date>.md](../../<next-DD>/audits/audit_<scope>_<next-date>.md) | [audit_<scope>_<date>.md](../audits/audit_<scope>_<date>.md) | [audit_<scope>_<prev-date>.md](../../<prev-DD>/audits/audit_<scope>_<prev-date>.md) | `/wbAudit` |
| Reports | [context_<scope>_<next-date>.md](../../<next-DD>/contexts/context_<scope>_<next-date>.md) | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | [context_<scope>_<prev-date>.md](../../<prev-DD>/contexts/context_<scope>_<prev-date>.md) | `/wbContext` (Snapshot) |
| Reports | [plan_<scope>_<next-date>.md](../../<next-DD>/plans/plan_<scope>_<next-date>.md) | **plan_<scope>_<date>.md** *(this file)* | [plan_<scope>_<prev-date>.md](../../<prev-DD>/plans/plan_<scope>_<prev-date>.md) | `/wbPlan` |
| Reports | [standup_<scope>_<next-date>.md](../../<next-DD>/standups/standup_<scope>_<next-date>.md) | [standup_<scope>_<date>.md](../standups/standup_<scope>_<date>.md) | [standup_<scope>_<prev-date>.md](../../<prev-DD>/standups/standup_<scope>_<prev-date>.md) | `/wbStandup` |
| Reports | [vision_<scope>_<next-date>.md](../../<next-DD>/visions/vision_<scope>_<next-date>.md) | [vision_<scope>_<date>.md](../visions/vision_<scope>_<date>.md) | [vision_<scope>_<prev-date>.md](../../<prev-DD>/visions/vision_<scope>_<prev-date>.md) | `/wbVision` |
| Reports | [next_<scope>_<next-date>.md](../../<next-DD>/nexts/next_<scope>_<next-date>.md) | [next_<scope>_<date>.md](../nexts/next_<scope>_<date>.md) | [next_<scope>_<prev-date>.md](../../<prev-DD>/nexts/next_<scope>_<prev-date>.md) | `/wbNext` |
| Reports | [audit_core2_<next-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<next-DD>/audits/audit_core2_<next-date>.md) | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | [audit_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/audits/audit_core2_<prev-date>.md) | `/wbAudit <monorepo-root>/` |
| Reports | [plan_core2_<next-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<next-DD>/plans/plan_core2_<next-date>.md) | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | [plan_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/plans/plan_core2_<prev-date>.md) | `/wbPlan <monorepo-root>/` |

</details>

<details>
  <summary>📂 Sub-Package: wbc-ui.com</summary>

### 📚 Base Reference Files
*(Follow identical Pattern A structure above, pointing to `wbc-ui.com` files)*

<details>
  <summary>📄 Local Reports</summary>
*(Follow identical Pattern A structure above, pointing to `wbc-ui.com` reports, EXCLUDING `<monorepo-root>/` reports)*
</details>

</details>
```

> **The Universal Cross-Linking Rule (4D Navigation):**
> - **Physical Existence Check:** Before adding ANY file link (from today, the previous day, or the next day) to the footer tables, the agent MUST verify that the file physically exists on the filesystem. Do not blindly assume files exist. If a specific report was not generated in the `Local Reports` table, replace its cell with `—`.
> - **Omit Missing Base References:** If a snapshot file in the `Base Reference Files` table (e.g. `Last Standup`, `Last Vision`) does not exist for the target date, **completely remove the row** from the table instead of printing `—`.
> - **Pattern A Application:** Every package (the root and every active sub-package) must follow the exact same Pattern A footer structure: a `Base Reference Files` block holding the active/last snapshot links, and a collapsed `Local Reports` block holding the temporal matrix of reports.
> - **Context-Relative Hierarchy:** The uncollapsed, primary footer tables ALWAYS belong to the package where the current file is located. 
>   - If the file is in `<monorepo-root>/`, then `core2` is uncollapsed at the top, and sub-packages are in `<details>` below it. 
>   - If the file is in `wb-core/`, then `wb-core` is uncollapsed at the top, and `core2` is pushed into a `<details><summary>📂 Monorepo Root: <monorepo-root>/</summary>` below it, followed by any other sub-packages. Do NOT merge global reports into the local reports table.
> - **No Explanations in Local Reports:** The `Local Reports` table should ONLY contain high-level command reports (audit, plan, track, context, next, vision, standup). Do NOT include task details or explanation files in the temporal tracking tables.
> - **Descending Chronological Order:** The columns MUST be ordered from newest to oldest: `| Category | File (<next-date>)* | File (<date>) | File (<prev-date>) | Source Command |`
> - **Exact Date Headers:** Do not use the generic "File (day N)" string in the headers. Use the literal date in `YYYY-MM-DD` format (e.g. `File (2026-05-04)* | File (2026-05-03)`).

**Footer format — Tier 2 (per-task files under `tasks/task_<N>/`):**

```markdown
---

## 📂 Sibling Task Files (<YYYY-MM-DD>)

> Auto-appended per `_shared/output_conventions.md` §5. Same-folder snapshot of task files at write time.

| Category | File | Source Command |
|---|---|---|
| Task Report | **task_1_report_<slug>_<date>.md** *(this file)* | `/wbWork` task report |
| Task Details | [task_1_details_<slug>_<date>.md](task_1_details_<slug>_<date>.md) | `/wbExplain` task details |
```

Rules:

- Links are **relative** to the output file's directory (per §1).
- The file currently being written is marked with a trailing `*(this file)*` and MUST NOT be a hyperlink (render as bold plain text, e.g., `**filename.md**`).
- Empty groups render as `- _(none today)_` rather than being omitted, so a reader can tell "no tracks today" from "tracks section forgot to render."
- Order within each group: alphabetical by filename.

**Staleness caveat:** the footer is a write-time snapshot. If a later command on the same day adds a new file, earlier files' footers will be out of date until they are touched (re-run, self-corrected, or hand-edited). This is acceptable: self-correct mode (§3) MUST re-emit the footer when it runs, and `/wbNext` always emits a fresh one.

**Self-correct mode interaction:** when self-correct runs on a file lacking the footer, it MUST append it. When self-correct runs on a file with a stale footer, it MUST replace the footer block in place (do not duplicate).

---

## 6. Where to Find What

- **Model recommendations** for `Worker (Suggested)` / `Validator (Suggested)` columns: [`../model_recommendations.md`](../model_recommendations.md)
- **`/wbNext` command** (dynamic "what should I do next?" suggestions): [`../wbNext/wbNext_template.md`](../wbNext/wbNext_template.md)
- **Each command's template:** `../<NN>_<wbX>/<wbX>_template.md`

---

## 7. Versioning

This file is the contract. When a rule here changes, every dependent template must be re-verified. Bump the version below and note the change.

- **v1.0** (2026-05-01) — initial: relative links, full-syntax Origin/Verify, self-correct mode, `/wbNext` extracted.
- **v1.1** (2026-05-01) — Suggested Tasks Table canonical column shape (§4): renamed `Origin` → `Copy-paste`; added "Today's Generated Files" footer rule (§5) with two-tier same-level scope (top-level command outputs cross-link audit/context/plan/next/standup/track; nested `tasks_reports/*.md` link only their own siblings). Dependent templates: `wbNext/wbNext_template.md` (column list at line ~84) — must be updated to match §4.
- **v1.2** (2026-05-02) — Updated §5 "Generated Files" Footer to "4D Navigation" architecture, requiring `<details>` accordions for all sub-packages, mandatory Global Files table in all files, and a `⏪ Previous Day's Files` section for temporal historical traceability.
- **v1.3** (2026-05-02) — Refined §5 "Base Reference Files" table to explicitly distinguish between **Foundational** (permanent) and **Snapshot** (daily) identity/dev files, following user feedback on cross-linking clarity.
- **v1.4** (2026-05-02) — Extended §5 "Local Files" table to include an **Identity** category, mirroring the Foundational files (context.md, dev.md) for direct local accessibility alongside generated reports.
- **v1.5** (2026-05-03) — Added explicit **Physical Existence Check** requirement to §5 (Universal Cross-Linking Rule), mandating that agents verify a file actually exists on disk before including it in the previous day's (or current day's) table.
- **v1.6** (2026-05-05) — Added §8 **Target Resolution & Initialization Protocol**, requiring autonomous generation of `.wb/workflows/` architecture for standalone folders.
- **v1.7** (2026-05-06) — **Plan consolidation:** enforced single `plan_<folder>_<YYYYMMDD>.md` per day per scope (no extra suffixes). **Task folder restructure:** replaced flat `tasks_reports/` with nested `plans/tasks/task_<N>/` folders containing `task_<N>_report_<scope>_<YYYYMMDD>.md` and `task_<N>_details_<scope>_<YYYYMMDD>.md`. **Explanation restructure:** task-mode explanations moved to `tasks/task_<N>/`; free-text explanations moved to `plans/explanations/`. Updated Tier 2 footer to reflect per-task folder scope. Dependent templates: `wbPlan`, `wbWork`, `wbValid`, `wbExplain`, `wbActOn`.
- **v1.8** (2026-05-09) — Added §9 **Action Type Tagging**, requiring every suggested action / task / idea in any output to carry an explicit role tag (🧠 Planner / ✅ Validator / 🔨 Worker / 📋 Mechanical) drawn from `model_recommendations.md`. Two layers: file-level tag in YAML front-matter for files that emit suggestions; per-line tag in a new **`Requires`** column inside Suggested Tasks tables, recommendation lists, and "What's Next?" sections. Cells are **plain text** (e.g. `🔨 Worker`) — a single mandatory `## 🔗 Action Types` legend section near the file's footer carries the only outbound link to `model_recommendations.md#the-logic`. Per-row links are optional and discouraged. Dependent templates: `wbNext`, `wbVision`, `wbAudit`, `wbReview`, `wbStandup`, `wbIdea`, `wbPlan`, `wbActOn`.
- **v1.9** (2026-05-10) — Added §1.1 **Link beautification** (short basename label + full relative href). Defines a **four-rule mechanical detection** for verbose labels: (1) label == href, (2) label contains `/` other than trailing, (3) label has `..`/`…`/`./`, (4) label is absolute — any match → rewrite to basename. Extended §3 self-correct to apply the four-rule detection to every link in the file (front-matter, callouts, prose, tables, footer), to verify the `Requires` column + `## 🔗 Action Types` legend on every emitter file. Wired the `Requires` column into the canonical example tables of `wbPlan`, `wbIdea`, `wbNext`, `wbStandup`, `wbActOn`. **Lesson learned (mid-day patch):** the original v1.9 wording ("verbose / ellipsized") wasn't mechanical enough — Gemini 3.1 Pro left `[../../05/09/plans/plan_X.md](../../05/09/plans/plan_X.md)` untouched because the label had no `…`. Tightened to the four explicit detection cases and embedded them in `wbPlan` / `wbIdea` self-correct gap-fills directly (not just by reference) so any agent reading only one template still gets the rule.
- **v1.11** (2026-07-31) — **§10.1 corrected to Standard Mode.** The canonical format's header line claimed *"every dispatch is a triplet: `/wbExplain` → `/wbWork` → `/wbValid`"* and its example matrix showed explain-prefixed cells unconditionally — contradicting §10.2 rule 11, which has always made the blueprint conditional on `--as`. Because that header sits inside the quoted format block, every matrix-emitting command was reprinting the wrong contract into its own output files. Header now reads *"every dispatch is a pair"* with the `--as` promotion noted; the example is Standard Mode; an Explanation-Mode variant is shown beneath it. **§10.2 rule 5 gained the sanctioned per-command extension clause**: `/wbPlan` v5.3+ appends `*(⏱️ N min)*` because its task table owns an `Est. Time (mins)` column; no other command may add or synthesize a duration. Dependent templates re-verified: `wbPlan/wbPlan_template.md` (same two defects fixed in its own copies of the example, plus its duration rule now cites this clause). `wbAudit`, `wbReview`, `wbSecure`, `wbStandup`, `wbNext`, `wbIdea`, `wbActOn` carry no local matrix example — they inherit §10.1 and needed no edit. **Lesson learned:** a rule stated correctly in prose is still wrong if the adjacent example contradicts it — agents copy the example.
- **v1.12** (2026-08-09) — Added §13 **Consolidate & Archive**: the daily-history commands (§13.1) gain a no-extra-args *consolidation* form (repair the file, then absorb every still-open item from every prior file of the same category into today's) and a universal `--archive` flag that retires the superseded `<DD>/<category>/` folders into `.wb/workflows/archives/` at **identical depth**, so relative hrefs inside the moved files keep resolving. Whole-folder moves only (a plan's `tasks/` are its siblings); original date preserved; every move banner-stamped, logged in `archives/archive_log.md`, and individually reversible. `/wbStandup` and `/wbTrack` are exempt — they *are* the log — and `/wbStandup --archive` instead becomes the fleet-wide sweep (§13.5). Implemented as `wb-flow archive` (`bin/archive.js`); templates MUST shell out to it rather than hand-rolling `mv`, per the §11 precedent. **The ordering invariant is the whole safety story:** consolidate, *then* archive — the reverse leaves open work with nothing live pointing at it. **Also fixed a year-old defect in §1.2:** the scope-root row read `../../../../../` (5 up) from arithmetic that mis-read the depth diagram; the correct href is `../../../../../../../` (7 up). Corrected in the table, in §1.1's tooltip example, in the §5 footer example, and in the 15 command templates that had copied it. Dependent templates: `wbPlan`, `wbAudit`, `wbReview`, `wbIdea`, `wbVision`, `wbStandup`.
- **v1.13** (2026-09-10) — Added §8 rule 0: target resolution now walks up to the nearest existing `.wb/` before creating a new workflow scope. This prevents nested report roots such as `core/.wb/` when the package scope already owns `.wb/`; a command creates `<target>/.wb/` only when no ancestor scope exists, and must say so.
- **v1.10** (2026-05-10) — Added §1.2 **Canonical relative-path patterns**: a lookup table of every recurring cross-file link shape (same-day siblings, prev/next day same/different month, scope-root, sub-package → core2, task-report → parent plan). Reports live at a fixed depth so href shapes are mechanically derivable — agents must read these off the table instead of counting `../` segments by hand. Extended §3 self-correct to verify every report-to-report and scope-root link against the table and rewrite mismatches to the canonical form. **Why this matters:** the user reported recurring broken cross-day links (e.g. an agent writing `../../05/09/plans/...` when the correct form across a month boundary is `../../../05/09/plans/...`); a fixed-shape lookup eliminates the source of the error.

---

## 8. Target Resolution & Initialization Protocol

Before ANY `/wb*` command generates an output report, it MUST verify the structural integrity of its `<target>`. 

**Target Scope Resolution:**
0. **Nearest Existing `.wb/` Wins:** Resolve the literal target by walking up its ancestors to the nearest existing `.wb/`. If one is found, reports route to that scope's `.wb/workflows/reports/`. Create a new `.wb/` at the literal target only when no ancestor has one, and state that a new sovereign scope was initialized.
1. **Monorepo Root:** If the target is the root of a known monorepo (e.g., `<monorepo-root>/`), reports route to the resolved scope's `.wb/workflows/reports/`.
2. **Sub-Package:** If the target is a registered child of a monorepo (e.g., `packages/wb-core`), reports route to the resolved scope's `.wb/workflows/reports/`.
3. **Standalone Folder:** If the target is a normal, independent folder (e.g., a brand new end-user project), it MUST be treated as a sovereign monorepo. Reports route to the resolved scope's `.wb/workflows/reports/`.

**The Autonomous Initialization Check (Mandatory for Standalone Folders):**
If the target falls under **Rule 3** (Standalone Folder), the agent MUST perform a pre-flight structural check before generating any reports.
1. Check for the existence of `<target>/.wb/workflows/context.md` and `<target>/.wb/workflows/dev.md`.
2. If they are missing, the agent MUST temporarily suspend the command execution.
3. The agent MUST read the folder's contents, infer its purpose, and **auto-generate** both `context.md` and `dev.md`.
4. Once the foundational architecture is established, the agent resumes normal command execution. This guarantees that the Generated Files Footer (§5) never creates dead links and the folder immediately benefits from permanent AI memory.

---

## 9. Action Type Tagging (Planner / Validator / Worker / Mechanical)

Every suggested action, task, idea, or follow-up emitted by a `/wb*` command MUST carry an explicit **action-type tag** drawn from [`../model_recommendations.md`](../model_recommendations.md) → "The Logic" table. This lets a downstream agent (or the user) pick the right model for the suggestion without re-reading the whole report.

### 9.1 The four canonical tags

| Tag | Use when the action is… | Example |
|---|---|---|
| 🧠 **Planner** | Strategy, multi-step decomposition, "should we?" calls | "Decide whether to drop the `main` field in `package.json`" |
| ✅ **Validator** | Deep-judgment review, scoring, "is this safe / correct?" | "Audit the new auth middleware for token-storage compliance" |
| 🔨 **Worker** | Code generation, file edits, refactors, surgical execution | "Convert `WBDataViewer` examples to use `:wbCode='false'`" |
| 📋 **Mechanical** | Run command, parse output, format report, no judgment | "Run `vuepress build` and capture the link-checker output" |

**Hybrid actions** (e.g. "investigate then fix") MUST be split into two tagged lines, not collapsed into one. If you can't decide between two tags, the action is too vague — refine it first.

### 9.2 Layer 1 — File-level tag (front-matter)

Files that exist primarily **to emit suggestions** (`/wbPlan`, `/wbAudit`, `/wbReview`, `/wbVision`, `/wbIdea`, `/wbStandup`, `/wbNext`, `/wbActOn`) MUST declare their dominant action type in YAML front-matter at the very top of the file:

```yaml
---
type: 🧠 Planner    # or ✅ Validator | 🔨 Worker | 📋 Mechanical
emits: mixed         # one of: pure | mixed
---
```

- `type` = the **dominant** role of the suggestions inside (the role most rows of the file's main table belong to).
- `emits: pure` = every action in the file shares the dominant `type`. `emits: mixed` = the file lists actions of multiple types (common for `/wbPlan`, `/wbAudit`, `/wbStandup`); per-line tagging (Layer 2) becomes mandatory.

### 9.3 Layer 2 — Per-line tag (inside tables and lists)

Wherever a file lists **individual** suggestions, each row/bullet MUST carry its own tag. This applies to:

- Suggested Tasks tables (the canonical column shape from §4) — add a **`Requires`** column right after the task ID. Read it as: *"task #N requires a [tag]"*. Cells are **plain text** (e.g. `🔨 Worker`) — no markdown links per row.

  **Why plain text:** the legend (see below) sits in the same file, a few lines below the table; a per-row link to it adds source-code noise without improving readability. The 🔧/🧠/✅/📋 emoji is the visual cue.

  **Mandatory legend:** every file using a `Requires` column MUST include one `## 🔗 Action Types` legend section (typically just before the Generated Files footer) so the meaning of each tag is one scroll away. The legend itself is the *only* place that links out to the canonical source:

  ```markdown
  ## 🔗 Action Types
  > Tags used in the `Requires` column. See [The Logic](../path/to/model_recommendations.md#the-logic) for canonical definitions and current model picks.
  - 🧠 **Planner** — Deep reasoning, strategy, multi-step
  - ✅ **Validator** — Big-thinker code-quality judgment, scoring
  - 🔨 **Worker** — Coder/executor: code generation, file edits
  - 📋 **Mechanical** — Run command, read output, format report
  ```

  **Optional link styles** *(only if your renderer benefits — e.g. an internal viewer that resolves backlinks specially)*: a row may use `[🔨 Worker](../model_recommendations.md#the-logic)` directly, or `[🔨 Worker](#-action-types)` to jump to the in-file legend. Default is plain text.

- "What's Next?" sections (every bullet starts with the emoji tag).
- Audit findings, review comments, ideation candidates — same rule.

**Example — Suggested Tasks table with the `Requires` column:**

| # | Requires | Task | Worker Model | Validator Model | Copy-paste |
|---|---|---|---|---|---|
| T01 | 🔨 Worker | Refactor `bin/install.js` to read from `templates/` | Claude Sonnet 4.7 | DeepSeek V4 Pro | `/wbWork --plan=… --id=T01` |
| T02 | ✅ Validator | Verify the refactor preserves `npx` install flow | DeepSeek V4 Pro | Claude Opus 4.7 | `/wbValid --plan=… --id=T02` |
| T03 | 📋 Mechanical | Run `npm pack --dry-run` and capture file list | Gemini 3 Flash | — | `/wbTest --check=pack` |

**Example — "What's Next?" bullets:**

> ## What's Next?
> - 🧠 **Planner** — Decide on a versioning scheme for the dual `npmjs/` + `github/` distribution split. → `/wbPlan --scope=versioning`
> - ✅ **Validator** — Audit the install-overwrite warning for shipping safety. → `/wbAudit --focus=install`
> - 🔨 **Worker** — Move `templates/` to be the single source of truth. → `/wbWork --plan=…`

### 9.4 Where tagging is NOT required

Pure-mechanical commands that don't emit suggestions are exempt: `/wbSetup`, `/wbTest`, `/wbClean`, `/wbLicense`, `/wbBroadcast`, `/wbGit`, `/wbCheck`, `/wbHelp`, `/wbPublish`, `/wbDeploy`, `/wbRelease`, `/wbDoc`, `/wbTrack`, `/wbStopTrack`, `/wbWork`, `/wbValid`, `/wbExplain`, `/wbContext`, `/wbDebug`, `/wbRefactor`, `/wbSecure`, `/wbToWBC`, `/wbMonetize`, `/wbTranslate`. These produce status reports, conversion artifacts, or single-purpose outputs — no follow-up actions to tag. (If one of these starts emitting a "What's Next?" section, it joins the tagging requirement.)

### 9.5 Why tags are role names, not model names

Models change (Sonnet 4.7 → 4.8 → …). **Roles don't.** The tag tells you *what kind of thinking the action needs*; `model_recommendations.md` tells you *which current model fills that role best*. Decoupling the two means model rotations don't churn every old plan/audit/idea file.

### 9.6 Self-correct mode

When a `/wb*` command runs in self-correct mode (§3) on a file written before v1.8, it MUST:
1. Add the YAML front-matter `type:` and `emits:` keys (if the file is one of the suggestion-emitters from §9.2).
2. Add a `Requires` column to any Suggested Tasks table found, with plain-text emoji tags.
3. Tag every "What's Next?" bullet.
4. Never rewrite authored content — only insert tags inferred from existing wording.

---

## 10. Next Executable Sequence (wave × role matrix)

§9 tags *what kind of thinking* each action needs. This section turns those tagged actions into **a dispatch schedule**: what to run next, in what order, and what can run at the same time. It is the last section before `## 🧭 What's Next?` and the part readers actually copy from.

### 10.1 Canonical format

> ## 🌊 Next Executable Sequence
>
> > **Rows are waves, each split into a `work` row and a `validate` row.** Everything in one row is collision-free and may be launched **in parallel**; the `validate` row runs after the `work` row above it lands.
> > **Columns are roles** — an action sits in the column named by its `Requires` tag (§9.1).
> > **Every dispatch is a pair:** `/wbWork` (execute) → `/wbValid` (a *different* agent checks it). With `--as` it becomes a triplet — `/wbExplain` writes the blueprint first (rule 11).
>
> | Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
> |---|---|---|---|---|
> | **A · 🔨 work** | — | — | `/wbWork <plan.md> --id=B23`<br>→ *Sonnet 4.7 · ~$0.30*<br><br>`/wbWork <plan.md> --id=B26`<br>→ *DS V4 Pro · ~$0.12* | — |
> | **A · ✅ validate** | — | `/wbValid <plan.md> --id=B23`<br>→ *Opus 4.7 · ~$0.20*<br><sub>pairs A · B23</sub><br><br>`/wbValid <plan.md> --id=B26`<br>→ *Gemini 3.1 Pro · ~$0.18*<br><sub>pairs A · B26</sub> | — | — |
> | **B · 🔨 work** | `/wbPlan <target>/wb-latex "port the renderer"`<br>→ *Opus 4.7 · ~$0.45* | — | — | `/wbTest <target> --scope=task-B26`<br>→ *Haiku 4.5 · ~$0.01* |
> | **B · ✅ validate** | — | `/wbValid <plan.md> --id=C1`<br>→ *Gemini 3.1 Pro · ~$0.25*<br><sub>pairs B · C1</sub> | — | — |
>
> ### Wave notes
> - ⚠️ **B23 is the priority** — `npm test` is still broken in wb-code, wb-latex and wb-press.
> - B25's own tests pass, but its `packaging.imports` suite stays red until B23 lands.
> - **No collision in A · work:** B23 edits the 7 `tests/packaging.imports.test.js` files; B26 edits wb-code's `README.md` + `ADR-011`. Disjoint.

**The example above is Standard Mode** — the default, when no `--as` was passed to the invocation. Under **Explanation Mode** (`--as="<style_tokens>"`) every 🧠 / 🔨 / 📋 cell gains a blueprint line above its work command, the two running sequentially in one lane:

```
`/wbExplain <plan.md> --id=B23 --as="expert,steps,graphs"`<br>`/wbWork <plan.md> --id=B23`<br>→ *Sonnet 4.7 · ~$0.30*
```

✅ validate cells never take a blueprint line, in either mode. Rule 11 below is the authoritative statement of the gate.

### 10.2 Rules

1. **Rows = waves, each split in two.** Every wave emits exactly two rows, in this order:
   - `**<label> · 🔨 work**` — the dispatches. Collision-free, launched in parallel.
   - `**<label> · ✅ validate**` — the paired validations of the row directly above. Runs only after that row lands.

   Label waves `A`, `B`, `C`. Cap at 3 waves (6 rows); the rest goes in one `| **later** | … |` row or is omitted (the source table stays the backlog of record). A `validate` row populates only the ✅ column — the other three are `—`, because validation is one role no matter what it validates. Omit a wave's `validate` row only when its `work` row dispatched nothing.
2. **Columns = the four canonical roles** (§9.1), always all four, always in this order: `🧠 Planner` · `✅ Validator` · `🔨 Worker` · `📋 Mechanical`. An action's column is **its existing `Requires` tag** — never re-derived, never a fifth column. This is what makes the matrix delegable: hand one whole column to one agent.
3. **Waves come from the dependency graph, not from priority.** Wave A = every unfinished action whose blockers are all resolved; Wave B = those unblocked by A. A `P1` item with an unmet dependency is **not** in Wave A — priority orders work *within* a wave, it never jumps the DAG. Commands without an explicit `Dep` column derive blocking from their findings' stated prerequisites.
4. **Cells hold full invocable commands** (§2): target path present, `--id=`/`--scope=` present where the command takes one. A bare `/wbWork` is forbidden. Multiple commands in a cell are separated by `<br><br>`. An empty cell is `—`, never blank.
5. **Every command names a ROLE VARIABLE, never a single model.** A cell carries `-M="$WORKER"` (or `$PLANNER` / `$VALIDATOR` / `$MECHANICAL`), and the four variables are declared once in the **Active Model Roster** block — see rule 5b. The annotation stays: `<br>→ *$WORKER · ~$cost*`, where the cost is quoted **at the chain's first pick** and must say so.

   **Why a role variable and not a model name.** A cell naming one model is wrong the moment a subscription changes, and the matrix is *regenerated* on every `--embed`, so the staleness returns as fast as it is fixed. Measured 2026-09-02: a plan whose cells named `opencode-go/*` for two roles kept naming them for ten days — including a month in which that subscription had lapsed — while the active roster routed those roles somewhere else entirely. A role variable holds the roster's full `||` fallback chain, so **a lapsed subscription costs one roster edit instead of every cell in the file.**

   Role → tier is unchanged and still binding: 🧠 Planner → a big thinker (never cheap out on decomposition); ✅ Validator → a big thinker (its failures are *silent*, which is why the best model belongs here rather than on the code); 🔨 Worker → a coder-tier model (its failures are loud and cheap — the oracle catches them in minutes); 📋 Mechanical → the cheapest fast model (there is no judgment to buy). Never "any model" or a bare tier name.

   **A per-row `Worker (Suggested)` / `Validator (Suggested)` cell is now an OVERRIDE, not a copy.** It means *"this row deliberately departs from the role"*. Re-typing the role's chain there creates a second copy of one fact, and the copy a reader meets first is the one nothing regenerates.

5b. **The Active Model Roster block is a top-level section, above the Task Table.** Not inside `## 🌊 Next Executable Sequence`: the task table's `Suggested` columns consume it too, and a definition placed ~60 lines *below* its first use is a definition nobody reads. Shape:

   ```markdown
   ## 🎛️ Active Model Roster

   > 🧠 **Planner:** `a || b || c`
   > ✅ **Validator:** `d || e || f`
   > 🔨 **Worker:** `g || h || i`
   > 📋 **Mechanical:** `j || k || l`
   ```

   Copy/paste blocks declare the same four beside the `P=` line, **comma-separated and unquoted — the same shape as `P=` itself**:

   ```bash
   P=<plan path>
   WORKER=g,h,i
   /wbWork $P --id=1 -M=$WORKER
   ```

   **Why a comma and not the `||` the roster prose uses.** `||` is a shell OR operator, so `WORKER=g||h||i` unquoted is *not* an assignment: bash reads `WORKER=g`, then `|| h`, then `|| i`, leaving the variable holding **only the first model** — and exiting 0, which is the direction that hides the failure. Quoting fixes it but makes the roster lines look unlike every other variable in the block, and the block's whole value is that it can be pasted without thinking. A comma has no meaning to the shell: the value survives unquoted, `-M=$WORKER` needs no quotes either, and the form already matches `wb-flow model --set <role>=a,b,c`, which has always used commas. **`-M` accepts either separator on input**; only the emitted form is normalized to commas.

   ⚠️ A cell writing `-M=$WORKER` is a **reference to the role's chain**, not a per-cell override. Only a literal model name in `-M=` is an override.

   **Self-correct (§3) MUST re-resolve this block** from the roster file `resolveRosterFile()` picks, rewriting each role's chain. A plan written in August otherwise proposes an August lineup in September with nothing objecting.

   **Sanctioned per-command extension — duration.** `/wbPlan` (template v5.3+) appends an estimate to every cell: `→ *ModelName · ~$cost* *(⏱️ <N> min)*`. It may do this because a plan's task table owns an `Est. Time (mins)` column to read the value from. **No other command adds ⏱️**, and none may synthesize one: an audit finding, review comment or idea has no duration column, and a guessed minute-count reads as measured data. If a future command grows a real duration column, extend it here rather than inventing a local convention.
6. **Collision check — mandatory before publishing a row.** Two commands may share a wave ONLY if their file sets are disjoint, *including* files one writes that another reads as a fixture. If they collide, demote one to the next wave and say why in Wave notes. A row that claims parallelism it doesn't have is worse than no matrix at all.
7. **Wave notes are externalized into `tasks/waves.md`**: Detailed wave notes, blocking priority, gate reasons, and file collision analysis are written to `<plan_dir>/tasks/waves.md`. The main plan file contains a concise callout: `> 📝 **Wave Notes & Collision Analysis:** See [`tasks/waves.md`](tasks/waves.md)`.
8. **Only unfinished work appears.** Never list an item already `✅ Done` + `✅ Valid`. If nothing is schedulable, replace the matrix with one line: `**All actions complete — nothing to schedule.**` Never emit an empty grid.
9. **Also print the matrix in the chat response**, not only in the file — copy/paste is the whole point.
10. **Every dispatch gets a paired validation in its own wave's `validate` row.** For each 🧠 / 🔨 / 📋 command in `<label> · 🔨 work`, emit a `✅ Validator` cell in `<label> · ✅ validate` holding `/wbValid <same file> --id=<same id>`, assigned to a **different agent than the executor**. The pairing sits directly under the work it checks, so a wave is a complete unit — dispatch, then verdict — rather than a promise redeemed a wave later. This is the worker≠validator invariant — a model validating its own work is an echo chamber, and it is the single most common way a hollow pass reaches a plan file.
    - Pair **every** role, not just 🔨 Worker. Mechanical rows carry a `☐ Valid` column too, and a "run the command and report" task can still report the wrong thing.
    - Mark paired cells so they're distinguishable from tasks whose own `Requires` tag is `✅ Validator`: append `<br><sub>pairs Wave <N> · <id></sub>`. A `✅ Validator`-tagged *task* is scheduled by its own dependencies; a *paired* validation is auto-generated by this rule.
    - Choose the validator by flipping tier **and provider**, not by rotating names: if a fast model executed, a big thinker validates; if a big thinker executed, a *different-provider* big thinker validates. Two models from one provider are not independent. Resolve pools through `poolOf()` and choose the first validator-chain entry whose pool differs from the executor's. Only when the chain offers no alternative may it fall back to the same provider, and the dispatch line MUST say `same-provider validation — chain offers no alternative`. Never the same model string on both sides of one id — **except on 🧠 Planner rows**, see next bullet.
    - **🧠 Planner rows are exempt: they may be validated by the model that executed them**, and their pairing stays in-session. The invariant protects *edits* — a model re-reading a diff it just wrote will call it correct. A Planner row produces a **decision**, and its validation is a re-read of reasoning already in the orchestrator's context; handing that to a second model buys a spawn and a cold re-read, not independence. 🔨 Worker and 📋 Mechanical rows — the ones that touch files — keep the rule with no exception. Assign a different model to a Planner pairing when you *want* an outside opinion on the decision; that is now a choice, not a requirement.
    - **Not paired:** rows that were never dispatched — `⏸️ HELD`, human-gated, or blocked. They get their pairing when they actually run.
    - If the executor is the user's choice rather than a named model, write the validator as `any agent ≠ executor`.
11. **Conditional pre-flight `/wbExplain` via `--as` flag.** When `--as="<style_tokens>"` is passed to `/wbWork` (e.g. `/wbWork <plan.md> --id=<N> --as="expert,steps,graphs"`), a 🧠 / 🔨 / 📋 cell holds two commands in order:

    ```
    /wbExplain <plan.md> --id=<N> --as="expert,steps,graphs"
    /wbWork    <plan.md> --id=<N>
    ```

    They run **sequentially in one lane** (the explain must finish before the work starts), while cells still run in parallel with each other. The explain writes `tasks/task_<N>/task_<N>_details_<scope>_<YYYYMMDD>.md` and upgrades the plan's `🔗` column from the inactive `<span title="…">📄</span>` placeholder to a live `[📄 expert,steps,graphs](…)` link — so the blueprint is a durable artifact, not a thought the agent had once.
    - **When `--as` is omitted:** `/wbWork <plan.md> --id=<N>` executes the task directly without running `/wbExplain` beforehand.
    - **Why before and not after:** when explanation is requested, it forces the agent to state its approach, in steps, before touching a file — giving the paired validator something to check the work *against* beyond the one-line task description.
    - **Same lane as the work by default.** The agent briefs itself, which keeps the wave parallel and costs one extra call. To brief with a strong model and execute with a cheap one — often the best quality-per-dollar — name the explain's model separately in the cell.
    - **Style tokens:** `expert,steps,graphs` is the standard trio (`graphs`, not "diagrams"). Add `fr`, `ar`, `eli5` etc. only when requested by the user.
12. **Multi-ID Merged Dispatches (`--id=X,Y,...`)**: Whenever multiple task dispatches or paired validations within the same wave row share the **same target plan/scope**, the **same action role** (e.g. `Worker`, `Validator`), and the **same routed model**, they **MUST be merged into a single multi-ID dispatch** (e.g. `/wbWork <plan> --id=5,6 -M="..."` or `/wbValid <plan> --id=4,5,6 -M="..."`). Merging same-scope, same-model dispatches reuses startup context once per model per wave, optimizing context overhead, execution time, and token costs while maintaining independent per-ID report checking and gate verification.
13. **Dual-Pass Wave Execution (`--wave=<label>`)**: Running `--wave=A` sequentially executes `--wave=A.work` followed by `--wave=A.valid` (or `A.validate`). Explicit subrow flags `--wave=A.work` and `--wave=A.valid` allow running work or validation independently.
14. **4-Scenario Copy/Paste Block Structure**: Below the matrix table, render 4 explicit non-overlapping scenario headers:
    - **Scenario 1**: Next wave execution (with `--wave` flag: work + valid)
    - **Scenario 2**: Next wave individual/grouped dispatches (without `--wave` flag, grouped by model)
    - **Scenario 3**: All remaining waves execution (with `--wave` flag)
    - **Scenario 4**: All remaining waves dispatches (without `--wave` flag)
15. **Mandatory Post-Action Matrix Recomputation**: After **ANY action or modification** to a plan file (e.g. task execution via `/wbWork`, task validation via `/wbValid`, self-correct via `/wbPlan`, idea promotion via `/wbIdea`, task addition/editing), the agent **MUST immediately recompute and update `## 🌊 Next Executable Sequence` in place**:
    - Remove completed tasks (`✅ Done` + `✅ Valid`) from the matrix.
    - Shift the next unblocked wave to become `Wave A` (or top active wave).
    - Batch same-role, same-model dispatches into `--id=X,Y`.
    - Externalize wave notes into `tasks/waves.md` and keep the callout link `> 📝 **Wave Notes & Collision Analysis:** See [tasks/waves.md](tasks/waves.md)`.
    - Run `node <core>/bin/next.js <plan.md> --embed` to re-generate the `## ▶️ How to run this plan` 4-scenario copy/paste block directly below the matrix table.
    - **Never leave a plan file with stale or closed tasks inside `## 🌊 Next Executable Sequence`.**

### 10.3 Which commands MUST emit it

| Command | Source of the actions |
|---|---|
| `/wbPlan` | the plan task table (`Requires` + `Dep` columns) — reference implementation |
| `/wbActOn` | the ranked execution thread it just produced |
| `/wbStandup` | the consolidated agenda of unfinished work |
| `/wbAudit` | 🔵 findings that need follow-up commands |
| `/wbReview` | findings that need follow-up commands |
| `/wbSecure` | findings that need follow-up commands |
| `/wbNext` | the Suggested Tasks Table (§4) |
| `/wbIdea` | ideas marked `🎯 Promoted` |

**Threshold:** emit the matrix only when the output holds **2 or more** actionable items. For a single action, one line (`Next: /wbWork <target> --id=3 → *Sonnet 4.7*`) is clearer than a grid.

**Exempt:** every command in §9.4 that emits no suggestions. A status report, conversion artifact or single-purpose output has nothing to schedule.

### 10.4 The THREE derived blocks — one sync, one order, one oracle

A plan file contains exactly **three derived blocks plus a status callout**. None of them is authored content; all four are projections of the task table, and all four go stale the moment any `☐ Done` / `☐ Valid` cell changes — including when the command that changed it is not the command that emits them.

| # | Block | Derived from | Regenerated by |
|---|---|---|---|
| 0 | `> **Status:** …` callout | the task table | recompute by hand (counts) |
| 1 | `## 🌊 Next Executable Sequence` | the task table (`Dep`, `Requires`, `☐ Done`, `☐ Valid`) | rebuilt whole, never cell-edited |
| 2 | `## ▶️ How to run this plan` | **block 1** | `wb-flow next <plan.md> --embed` |
| 3 | `## 🧭 What's Next?` | blocks 0–2 | recompute by hand |

**The order is not optional: 0 → 1 → 2 → 3.** Block 2 is derived from block 1, and block 3 summarises both. Regenerating block 3 before block 1 publishes a confident summary of a schedule that has already moved — which is worse than leaving it stale, because it *looks* current.

> ⚠️ **This is a whole-file sync, not four independent chores.** Updating one and not the others is the most common way these files start lying. In a single session on 2026-08-09 the matrix and What's Next were hand-updated repeatedly while the how-to-run block silently drifted; the drift was invisible until the oracle below was written.

#### The sync oracle — run it after EVERY edit to a plan file

A documented checklist that nothing executes is worth nothing: a `/wbPlan` self-correct checklist existed for weeks while plans still shipped literal `<placeholder>` matrix cells and broken links. **This block is the enforcement.**

**Shipped as a script — prefer it over hand-rolling:**

```bash
bash <core>/templates/commands/_shared/sync_check.sh <plan.md>
# ✓ SYNC OK — table 10/12 done, 4/12 valid; matrix, how-to-run and What's Next agree
```

It exits non-zero and names the block that drifted. Mutant-verified in both directions on 2026-08-09: ticking one extra `☐ Done` and deleting the how-to-run marker each turn it red; restoring turns it green. The inline equivalent below needs nothing beyond `awk` and `grep` if the script is unavailable.

```bash
P=<plan.md>
read -r T D V < <(awk -F'|' '/^\| \[?[0-9]+\]?[( ]/ { t++; d=$(NF-2); v=$(NF-1);
    if (d ~ /✅/) dn++; if (v ~ /✅/) vn++ } END { printf "%d %d %d\n", t, dn, vn }' "$P")

# 1 · a row that is Done AND Valid must not still be scheduled in the matrix
# 2 · the What's Next progress line must read exactly  <D>/<T> tasks completed, <V>/<T> validated
grep -qE "Progress:[^0-9]*${D}/${T} tasks completed, ${V}/${T} validated" "$P" || echo "✗ What's Next ≠ table"
# 3 · the how-to-run block must exist between its markers
grep -q '<!-- HOW_TO_RUN_START -->' "$P" || echo "✗ re-embed: wb-flow next $P --embed"
# 4 · status callout must agree: all-closed ⇒ ✅ CLOSED, otherwise 🟢 OPEN
# 5 · no matrix cell may contain a <placeholder> — wave.js interpolates it LITERALLY
grep -qE '^\| \*\*[A-Z][^|]*<[a-z ]+>' "$P" && echo "✗ placeholder in a matrix cell"
```

Check 5 exists because a matrix cell written as `` `/wbWork <this plan> --id=4` `` was passed to a spawned agent verbatim as the string `<this plan>`, so the cell dispatched an agent at a nonexistent file. Check 1 exists because a stale matrix sends an agent at work that is already finished.

**A plan file that fails this oracle is not "slightly out of date" — it is actively misleading**, and every downstream dispatch inherits the error.

---

The matrix is a **projection** of the source table, not authored content. It is therefore stale the moment any `☐ Done` / `☐ Valid` cell changes — and the commands that change those cells are not the commands that emit it.

**So: any command that mutates a `☐ Done` or `☐ Valid` cell MUST recompute the `## 🌊 Next Executable Sequence` of that same file, in the same pass.** This is what makes the section dynamic instead of a snapshot that rots.

| Command | Mutation | Required follow-through |
|---|---|---|
| `/wbWork` | checks `☐ Done` (`✅<br><worker>`) | recompute: the executed id leaves its wave, and its paired `/wbValid` (§10.2 rule 10) becomes dispatchable **now** rather than next wave |
| `/wbValid` | fills `☐ Valid` (`✅ <score>/10<br><validator>`) | recompute: a row that is now Done **and** Valid disappears entirely (rule 8), which usually promotes a whole downstream wave |
| `/wbPlan --id=… --open/--def/--can` | state override | recompute: re-opened rows re-enter the waves; deferred/cancelled rows leave them |
| `/wbPlan` (self-correct) | gap-fills Done/Valid from task reports | recompute — see §10.5 |
| `/wbIdea --promote` | flips an idea to `🎯 Promoted` | recompute the idea file's matrix |

**Four** invariants for that recompute — and all four are checked by the §10.4 oracle above:

1. **Never hand-edit a single cell of the matrix.** Rebuild the whole section from the current table state. Partial edits are how a matrix ends up claiming a wave that no longer exists.
2. **Update Top-Level Plan Status Callout:** Update the callout at the top of the plan file (under H1):
   - If any task is open (`☐ Done` or `☐ Valid` is `⬜`): `> **Status:** 🟢 OPEN (<N> open tasks)`
   - If all tasks are completed & validated: `> **Status:** ✅ CLOSED (All tasks completed & validated)`
3. **Recompute & Update Dynamic `## 🧭 What's Next?` Section:**
   - Update progress metrics (`X/Y tasks completed, Z/Y validated`).
   - If status is `🟢 OPEN`: recommend immediate next wave actions (`/wbWork`, `/wbValid`) and re-embed the `▶️ How to run this plan` block (`wb-flow next <plan.md> --embed`).
   - If status is `✅ CLOSED`: recommend the formal plan closure pass `/wbReview <target> --plan=<plan.md>` for quality sign-off.
4. **Re-run the collision check** (rule 6) on every parallel row you emit, even if the row looks unchanged — a promoted task may now share a file with an existing one.

If a command finds no `🌊 Next Executable Sequence` in a file it just mutated, and that file was emitted by a §10.3 command, it **adds** one (§10.5) rather than leaving the file without a schedule.

### 10.4.1 `--wave=all` — never offer it and refuse it in the same breath

The how-to-run block used to emit a bare `/wbWork $P --wave=all -y` under *"Scenario 3: All remaining waves"* while the **Why not `--wave=all`** section immediately below argued against running it. A reader was handed a command and then told not to use it, with no third option — so the practical outcomes were "ignore the warning" or "run the waves by hand".

**The rule: Scenario 3 is conditional, and a refusal must carry its alternative.**

- **Plan has no derived blocker** → emit the real thing, annotated:
  ```bash
  /wbWork $P --wave=all -y      # no derived blocker in this plan
  ```
- **Plan has a blocker** → emit the **closest safe equivalent**: every remaining wave, in order, **one command per wave**, with a `⏸` pause line before each wave that needs a human:
  ```bash
  # ⚠️ --wave=all is NOT advised here (see "Why not --wave=all" below).
  # Closest safe equivalent — same waves, in order, paused where a human is needed:
  /wbWork $P --wave=A -y
  /wbWork $P --wave=B -y
  #   ⏸ REVIEW — wave C holds a 🧠 Planner decision. Read its output before continuing.
  /wbWork $P --wave=C -y
  /wbWork $P --wave=D -y
  #   ⏸ GATE — wave E is a go/no-go gate. Read its output before continuing.
  /wbWork $P --wave=E -y
  ```

**The pauses and the bullets come from the same analysis.** A wave gets a `⏸` line **iff** it contributed a bullet to *Why not `--wave=all`* — gate, 🧠 Planner judgment, or serial dependency. They cannot drift apart, because emitting one without the other is the contradiction this section exists to remove.

> ⚠️ **One command per wave — `--wave=C,D` does not exist.** `wave.js` splits `--wave=` on `:` for role-narrowing only and takes a **single** label; a comma list is read as the literal label `C,D`, matches no row, and exits non-zero. Do not invent multi-label syntax to shorten the list.

Generated by `bin/next.js` (`segmentedRunbook()`); the *Why not* section closes by pointing back at it, so neither half reads as a dead end.

### 10.5 Self-correct mode

On any self-correct pass (§3) over a file emitted by a §10.3 command:

1. **If `## 🌊 Next Executable Sequence` is absent** — true of every file written before this convention — **build it and insert it**, then place the three derived blocks in their canonical order (§10.4): `🌊 Next Executable Sequence` → `▶️ How to run this plan` → `🧭 What's Next?` → Generated Files footer. This is a required gap-fill, not an optional improvement.
   > 📌 Earlier revisions of this section said the matrix goes *"immediately before `## 🧭 What's Next?`"*. That predates the how-to-run block, which now sits **between** them — the two statements were mutually exclusive and the older one is superseded here.
2. **If it is present, recompute and replace it in place:** drop rows whose items are now `✅ Done` + `✅ Valid`, promote items whose blockers cleared, re-check every parallel row for collisions, and refresh the agent/cost picks. Never leave two matrices in one file.
3. **Never carry a wave forward unverified.** A stale sequence is the single most misleading thing one of these files can contain — it sends an agent at work that is already finished or still blocked.
4. This is a *derived* section, so recomputing it is **not** a violation of §3's "do not rewrite authored content" rule. The Wave notes are the one part that may contain human-authored nuance: preserve any bullet that is still true, and keep it if you cannot verify it either way.

### 10.6 Executing a wave (`--wave=<label>` / `--wave=all`)

`/wbWork <scope> --wave=A` runs **every cell in row A** — dispatches and pairings alike; a row is a row. It is an *orchestration* mode: the invoking assistant is the orchestrator, and the cells are farmed out to CLIs by role.

**Supported Wave Targets:**
- Single wave: `--wave=A`, `--wave=B`, `--wave=C`, etc.
- All waves wildcard: `--wave=all`, `--wave="all"`, `--wave=*`, `--wave="*"` — iteratively loops through all waves sequentially until all tasks in the plan are completed.

**Explanation Gate (`--as` flag):**
- Without `--as`: Each work cell executes directly via `/wbWork` without pre-flight `/wbExplain` blueprint generation.
- With `--as="..."`: Each work cell is preceded by `/wbExplain <plan.md> --id=<N> --as="..."` to generate `task_<N>_details_*.md` and update the task table link before running `/wbWork`.

**Routing.** Each role maps to one lane. The matrix's `→ *Model*` annotation is the *recommendation*; the lane is what actually runs:

| Role | Lane | Why |
|---|---|---|
| 🧠 Planner | the orchestrator itself, **in-session** | decomposition is the one thing never delegated to a cheap model |
| 🔨 Worker | `opencode run -m <worker-model>` | code edits at volume |
| 📋 Mechanical | `opencode run -m <fast-model>` | no judgment to buy |
| ✅ Validator | **in-session**, unless it pairs a non-Planner row the orchestrator itself executed — then a *different* model via `opencode run` | rule 10: never validate your own **edits**; 🧠 Planner rows are exempt |

That last row is the whole point: a paired validation must resolve *which agent executed the id it pairs*, and — for 🔨 Worker and 📋 Mechanical rows — pick a different one. A 🧠 Planner pairing may keep the same model and stay in-session. `wb-flow wave --list` prints the resolved routing, and its reason line names the exemption when it fires, before anything runs.

**The orchestrator owns the plan file.** Every spawned command is passed `--no-plan-update`: sub-agents write **only** their task report and must not touch the plan's table or matrix. A wave launches its cells in parallel, and *N* agents doing read-modify-write on one markdown table is how a plan gets a corrupted row or two rival matrices. So after the wave settles the orchestrator — and only the orchestrator — reads the reports, checks the boxes of the cells that **succeeded**, and recomputes the matrix **once** (§10.4).

**You run the wave — the user does not.** `--wave` is not "print a script and hand it over": the assistant executes it in its own terminal. "Parallel" means *you* launch each spawned cell as a **backgrounded shell** and keep working; when a cell is slow, or the next cell depends on it, *you* wait for it. The user watches one command produce a whole wave.

**Procedure:**

1. `wb-flow wave <plan.md> --wave=A --list` → resolve the routing. Show the user the table of what will run, where, and with which model.
2. **Confirm before spawning.** These are real agent runs with permissions bypassed and real cost. State the cell count and the models, and get a go. This is the one gate in the loop.
3. `wb-flow wave <plan.md> --wave=A` → writes `plans/waves/wave_A_<scope>.sh`. Two ways to run it, both in your terminal:
   - **One background shell for the whole wave** (preferred): run the script itself in the background. It already fans out, `wait`s, writes one log per cell under `.wb/workflows/reports/waves/<label>_<ts>/`, and exits with the failed-cell count. One thing to track, and the parallelism is inside it.
   - **One background shell per cell** — when you need to react to each cell as it lands (e.g. start a dependent step the moment its blocker finishes). Copy each `opencode run …` invocation out of the generated script rather than retyping it; the script is the source of truth for the exact flags.
4. **Wait for completion, don't poll blindly.** While cells run you may do your own 🧠 Planner and in-session ✅ Validator cells — that's free parallelism, since they're your work and don't collide by the matrix's own check.
5. **Classify each cell by three gates, in order — never by matching strings in its output.**
   1. **Infra** — CLI exit code, plus *anchored* fatal patterns (`^Error: Model not found`, insufficient credits, rate limit, quota, authentication). Answers "did the agent run at all?"
   2. **Artifact** — does `tasks/task_<ID>/task_<ID>_report_<scope>_<date>.md` exist? Answers "did it produce what it owed?"
   3. **Oracle** — run the row's own `Verify` cell. Exit 0 = pass. This is the task's own definition of done, and it is already in the plan table.

   Neither channel is sufficient alone: an unusable model can exit **0** having produced nothing, and a fully successful cell can print `Error:` many times — especially in this system, where tasks are routinely *about* error handling. Output string-matching is therefore forbidden as a success signal.
6. Check the Done box **only when all three gates pass**. Anything else stays `⬜`, labelled with its verdict — **INFRA** (never ran) / **NO-OP** (ran, produced nothing) / **ATTEMPTED** (ran, oracle failed) — and the reason goes in Wave notes.
   **Model fallback fires on Gate 1 only.** Gate 2/3 failures are reported, never auto-retried with the next model in the chain: the blocker is the task, so a second agent meets the same wall at twice the cost.
7. Recompute the matrix once (§10.4). Report per-cell outcomes to the user. If `--wave=all` or `--wave=*` was passed, proceed automatically to the next wave; otherwise stop.

**Multi-Wave vs. Single Wave:** Do not auto-advance to the next wave unless `--wave=all` or `--wave=*` was explicitly requested. When running a single wave, Wave B's pairings validate Wave A's work; if A half-failed, B is validating nothing.

**If a cell hangs**, kill it, log it as failed, and leave its box unchecked. A wave that never returns is worse than one that returns partial: give every spawned cell a wall-clock bound.

**Progress reporting is a stated orchestrator duty.** The wave generator (`wb-flow wave`) emits a script that embeds the plan's `Est. Time (mins)` column, starts a **background heartbeat** (every ~30 s naming still-running ids with elapsed, % of estimate, ETA, and an explicit `OVER est by Nm` state), and **streams every cell's output in real time** via `tee` rather than capturing to a temp file and dumping at the end. The orchestrator reads this stream and reacts to hung cells — the generator provides the signal; the orchestrator acts on it.

---

## 11. `--snap` — pinning an output (universal flag)

**Every `/wb*` command that writes into `.wb/workflows/reports/` accepts `--snap`.** It pins the
file(s) that invocation produced into `.wb/snaps/<YYYYMMDD>_<label>/`, so an output stays findable
after the reports tree has grown another hundred files.

```
/wbPlan <target> --task="…" --snap                 # label from the output's basename
/wbExplain <plan.md> --id=3 --as=expert --snap=gis-decision
/wbWork <plan.md> --wave=A --snap=wave-a --snap-copy
```

| Form | Effect |
|---|---|
| `--snap` | pin this run's outputs, label derived from each file's basename |
| `--snap=<label>` | pin with an explicit label (the `<YYYYMMDD>_` prefix is always added) |
| `--snap-copy` | **copy** instead of symlink — freezes the content as of now |

### Do not hand-roll the symlink

Shell out to the CLI. It resolves the `.wb/` root, writes a **relative** link so the repo stays
portable, refuses to clobber an existing pin, and reports dangling links on `--list`:

```bash
wb-flow snap <path> --label=<label>          # pin (symlink)
wb-flow snap <path> --label=<label> --copy   # pin (frozen copy)
wb-flow snap --list                          # what is pinned
```

### A symlink is a pin, not a snapshot

This is the distinction that decides which form to use:

| Output | Use | Why |
|---|---|---|
| `/wbExplain` blueprints, task reports | `--snap` (symlink) | written once, never edited — the link is always correct |
| A plan mid-execution | `--snap-copy` | a plan mutates constantly (Done boxes, matrix recompute); a symlink shows its *future* state, not the state you pinned |
| A report you are about to supersede | `--snap-copy` | the point is to keep the superseded version |

A symlinked plan is not wrong — it is a bookmark, and bookmarks track. Just do not read one
expecting to see how the file looked on the day you pinned it.

---

## 12. `--next` — what to run after this (universal flag)

**Every `/wb*` command accepts `--next`.** After its own output, it prints what to do next:

1. the `/wbNext <scope>` recommendation — the forward-looking ranked action, and
2. when a plan is in play, the derived **▶️ How to run this plan** block.

```
/wbWork <plan.md> --wave=B --next
/wbPlan <target> --task="…" --next
/wbStandup <scope>/ --next
```

### The block is generated, never authored

```bash
wb-flow next <plan.md>            # print it
wb-flow next <plan.md> --embed    # write it into the plan between the markers
wb-flow next <plan.md> --json     # machine-readable
```

It contains four parts, all **derived from the plan itself**:

| Part | Derived from |
|---|---|
| Wave inventory (cells · spawned · est. · nature) | the 🌊 matrix, routed through `route()` |
| The ordered command list, with a `/wbValid` after each spawning wave | work cells per wave, minus rows already `✅ Valid` |
| Why not `--wave=all` | 🧠 Planner rows (judgment) · `✅ Validator`-**tagged tasks** (gates) · `Dep` chains across waves (serial) |
| Flags | which wave spawns enough cells to make `--sessions` worth measuring |

**Nothing in it is written by hand, and that is the point.** A run-book authored once goes stale the
moment a task changes wave — and a stale one is worse than none, because it tells you to dispatch
something that is now blocked. If no risk is derivable, the block says `--wave=all` is defensible
rather than inventing caution.

### Regeneration is mandatory, same pass as the matrix

`§10.4` already requires recomputing the 🌊 matrix in the same pass as any Done/Valid change.
**The `--next` block is derived from that matrix, so it is recomputed in the same pass.** Any command
that ticks a box, cancels a row, or moves a task between waves MUST re-run:

```bash
wb-flow next <plan.md> --embed
```

A plan whose matrix is current but whose how-to-run block predates it is lying in a more convincing
way than one with no block at all.

---

## 13. Consolidate & Archive — one live file per category

A scope that has been worked for a month holds thirty plan files, twenty audits and a dozen idea
files, of which **exactly one of each is live**. Everything else is a decoy: a reader (human or
agent) that opens the wrong one works from a backlog whose tasks were closed a week ago.

This section defines the two halves of the fix, and the order they must happen in.

| Half | What it does | Reversible? |
|---|---|---|
| **Consolidate** | Sweeps every prior file of this category for still-open items, merges them into **today's** file, repairs the file's own structure and links | n/a — additive |
| **Archive** | Moves the now-superseded `<DD>/<category>/` folders out of `reports/` and into `archives/` | yes — `wb-flow archive --restore=` |

> 🔴 **Consolidate ALWAYS runs before archive, in the same invocation, and archive is skipped if
> consolidation did not complete.** Archiving first — or archiving without consolidating — silently
> deletes open work from the reader's field of view: the task is not gone, but nothing live points at
> it any more, and the next `/wbStandup` will not find it because it no longer scans that tree. This
> is the single destructive failure mode of this feature, and it is the reason archive is opt-in
> (`--archive`) rather than automatic.

### 13.1 Which commands participate

Every `/wb*` command that writes **one dated file per day per scope** under a category folder:

`/wbPlan` · `/wbAudit` · `/wbReview` · `/wbIdea` · `/wbVision` · `/wbContext` · `/wbNext` ·
`/wbTest` · `/wbSecure` · `/wbClean` · `/wbDebug` · `/wbDeploy` · `/wbPublish` · `/wbRelease` ·
`/wbBroadcast` · `/wbActOn`

**Exempt — `/wbStandup` and `/wbTrack`.** A standup *is* the "what we did yesterday / what today"
log, and a track *is* the session narrative; both derive their entire value from the series. Deleting
the series to keep the newest entry would archive the thing the archive exists to preserve. Their
folders (`standups/`, `tracks/`) are skipped by the tooling unless explicitly named.

`/wbStandup` instead gets the **inverse** role — see §13.5.

### 13.2 Consolidation (the no-extra-args form)

```
/wbPlan  <plan_file.md>       # repair this file, absorb every older open task into it
/wbAudit <audit_file.md>      # repair this file, absorb every unresolved older finding
/wbIdea  <idea_file.md>       # repair this file, absorb every unpromoted older idea
```

Passing an existing output file with no other flags means **"make this the one file I have to
read."** Three things happen, in order:

1. **Repair in place** — the full self-correct pass of §3: link beautification (§1.1), canonical
   hrefs (§1.2), missing mandatory sections inserted in canonical order, `Requires` column and
   `## 🔗 Action Types` legend present, derived blocks re-synced (§10.4) and the sync oracle run.
2. **Absorb** — scan **the whole `reports/` tree of this scope** for prior files of the same
   category, extract every item that is still open, and merge it into this file, preserving each
   item's original wording, dependencies, priority and a relative link back to the file it came from
   (`Origin: [plan_x_20260805.md](../../05/plans/plan_x_20260805.md)`). "Still open" per category:

   | Category | An item is still open when… |
   |---|---|
   | plans | `☐ Done` or `☐ Valid` is `⬜` or `🔨` (never `⏸️ Deferred` / `🚫 Cancelled` — those are decided) |
   | audits / reviews / security | the finding is 🔴/🟡 and no later file records it as resolved |
   | ideas | status is not `🎯 Promoted`, `🚫 Rejected` or `✅ Shipped` |
   | visions | the proposal has not been promoted to an idea or plan |
   | tests | the case is failing or skipped |

   **Merge, don't concatenate.** The same task carried forward for four days must appear **once**,
   with the oldest origin link — not four times. De-duplicate on the item's text, not its ID:
   IDs are per-file and collide across days.
3. **Recompute** the derived blocks (§10.4) over the merged set, because the absorb step almost
   always adds schedulable rows.

**If today's file does not exist yet**, the command creates it first (the MERGE-OR-CREATE rule its
own template already defines) and consolidates into that.

### 13.3 The archive tree

```
<scope>/.wb/workflows/
├── reports/<YYYY>/<MM>/<DD>/<category>/     ← live: newest date per category only
└── archives/<YYYY>/<MM>/<DD>/<category>/    ← history: same path, same depth
```

Three properties, each load-bearing:

- **Same depth as `reports/`.** `archives/` is a sibling of `reports/` under `.wb/workflows/`, and
  the `<YYYY>/<MM>/<DD>/<category>/` path below it is **identical** to the one the folder had while
  live. Every relative href inside a moved file that pointed at something moving with it — a task
  report, a sibling in the same day — **still resolves after the move, unchanged**. This is the only
  reason the archive root is where it is; a shorter or prettier location would break every link in
  every file it stores.
- **The unit is the folder, never the file.** A plan's `tasks/`, `waves/` and `explanations/` are
  siblings *inside* `<DD>/plans/`. Move the `.md` alone and every task report it links to is
  orphaned. So `<DD>/<category>/` moves whole, or not at all.
- **The original date is preserved.** A plan dated `20260807` archives to `archives/2026/08/07/`,
  **not** to today's date. The archive is a record of when the work happened, not of when someone
  got round to tidying.

Each archived `.md` is stamped, once, immediately below its front-matter:

```markdown
> 🗄️ **ARCHIVED 2026-08-09** — this file is history, not live state.
> Superseded by [plan_wb-latex_20260809.md](../../../../../reports/2026/08/09/plans/plan_wb-latex_20260809.md).
> Moved from `.wb/workflows/reports/2026/08/07/plans` by `wb-flow archive`. …
```

and one row is appended to `archives/archive_log.md` — source, destination, keeper — so the sweep is
auditable and every move is individually reversible.

### 13.4 `--archive` — the universal flag, and the CLI behind it

**Every command in §13.1 accepts `--archive`.** It runs the consolidation above and *then* sweeps.

```
/wbPlan  <plan_file.md>  --archive          # consolidate, then retire older plans/
/wbAudit <scope>/        --archive          # fresh audit, then retire older audits/
/wbIdea  <idea_file.md>  --archive --dry-run   # show what would move, move nothing
```

| Form | Effect |
|---|---|
| `--archive` | after consolidating, archive superseded folders **of this command's category only** |
| `--archive=all` | archive every non-exempt category in the scope (`/wbStandup`'s default — §13.5) |
| `--archive --keep=<N>` | keep the N newest dates instead of 1 |
| `--archive --dry-run` | print the move list, write nothing |

#### Do not hand-roll the move

Shell out to the CLI, for the same reason §11 forbids hand-rolling the snap symlink — except the
stakes are higher here, because this one moves work product rather than creating a link:

```bash
wb-flow archive <scope> --type=plans --dry-run     # always preview first
wb-flow archive <scope> --type=plans               # apply
wb-flow archive <scope> --recursive --all          # every scope below <scope>, every category
wb-flow archive --list                             # what is already archived
wb-flow archive --restore=<archived-folder>        # undo one move
```

It resolves the `.wb/` root, refuses to touch the newest folder in each category, refuses to clobber
an existing archive entry, skips the exempt categories, prunes the empty `<YYYY>/<MM>/<DD>` shells it
leaves behind, writes the banner and the log, and exits non-zero on a bad target. An agent
reimplementing this with `mv` gets none of that, and its first mistake costs a plan.

**Preview before you sweep.** Run `--dry-run` and *read the output* — specifically the `(kept: …)`
column. A category showing `⚠️ no current file in this category` means the sweep found nothing live
to supersede it; that is almost always a sign consolidation has not run yet, and archiving anyway is
exactly the destructive case §13 opens with.

### 13.5 `/wbStandup` — the inverse role

`/wbStandup` keeps its existing behaviour unchanged: scan, consolidate the agenda, recommend. Its
own file is never archived. On top of that it becomes the **fleet-wide sweep** — the one command
that answers *"what is the current state of everything, and nothing else?"*:

```
/wbStandup <scope>/            # unchanged — the daily agenda
/wbStandup <scope>/ --archive  # …then leave exactly one live file per category, per scope
```

With `--archive`, after PHASE 3 it:

1. For each scope and each non-exempt category, identifies the newest file — the keeper.
2. **Consolidates into each keeper first** (§13.2), so no open item is left pointing only at a file
   about to move.
3. Runs `wb-flow archive <scope> --recursive --all --dry-run`, prints the move list, and — because
   this sweep spans every scope in the tree, not one — **asks for confirmation before applying**.
4. Reports the result in the standup file under `## 🗄️ Archive Sweep`: one row per moved folder, its
   keeper, and a link to `archives/archive_log.md`.

The standup file is thereby the index of the sweep, which is the right place for it: the standup is
already the document whose job is "here is where everything stands."

### 13.6 Self-correct interaction

A self-correct pass (§3) **never archives.** Repair is safe to run unattended and is expected to run
often; moving folders is not, and is expected to run deliberately. `--archive` is the only way a
sweep happens, and it is never implied by any other flag.

What a self-correct pass MUST do is notice the mess: when it finds prior files of its own category
carrying open items, it adds a line to `## 🧭 What's Next?` naming the count and the command —
`📋 Mechanical — 4 superseded plan folders hold no open tasks. → /wbPlan <this file> --archive`.

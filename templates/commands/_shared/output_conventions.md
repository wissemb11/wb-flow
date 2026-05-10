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
- **Optional tooltip:** for ambiguous basenames (e.g. two `context.md` at different scopes), add a `"<short scope hint>"` tooltip — `[context.md](../../../../../context.md "core2 root")`.
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
| **Up to scope root** (where `package.json` / `.wb/` live) | `../../../../../` *(always exactly 5 up — depth 7 minus depth 2 for `<scope>/.wb/`)* |
| **Up to scope's `context.md` / `dev.md`** | `../../../../../context.md` · `../../../../../dev.md` |
| **Up to monorepo root `core2/` from a sub-package** | `../../../../../../../../../../` *(10 up — 5 to leave the sub-package + 5 to leave `core2/.wb/...`; alternative form: `../../../../../../../../../../<sibling-scope>/`)* |
| **Up to monorepo root's `core2/.wb/workflows/reports/<YYYY>/<MM>/<DD>/<category>/<file>.md`** | `../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/<category>/<file>.md` |
| **Sibling task report** (from a `plans/<file>.md` to its `tasks/task_<N>/...`) | `tasks/task_<N>/task_<N>_report_<scope>_<date>.md` *(no `../`)* |
| **From a task report up to its parent plan** | `../../<file>.md` *(2 up: leave `task_<N>/`, leave `tasks/`)* |
| **Templates folder from a report file** (rare, prefer doc links) | `../../../../../../../../../../packages/wb-flow/templates/commands/<wbX>/<wbX>_template.md` |

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
   - any other field the template requires but the file lacks
4. **Do not alter the file's structure** — same sections, same columns, same task rows. Only fill gaps and normalize.
5. **Append or Update "What Next" section** — even if the template usually delegates this to `/wbNext`, in self-correct mode you MUST add a section `## 🧭 What's Next?` with either a list of suggested commands or a **Suggested Tasks Table** if the findings warrant it.
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
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |
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
| Reports | [audit_core2_<next-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<next-DD>/audits/audit_core2_<next-date>.md) | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | [audit_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/audits/audit_core2_<prev-date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<next-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<next-DD>/plans/plan_core2_<next-date>.md) | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | [plan_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/plans/plan_core2_<prev-date>.md) | `/wbPlan core2/` |

</details>

<details>
  <summary>📂 Sub-Package: wbc-ui.com</summary>

### 📚 Base Reference Files
*(Follow identical Pattern A structure above, pointing to `wbc-ui.com` files)*

<details>
  <summary>📄 Local Reports</summary>
*(Follow identical Pattern A structure above, pointing to `wbc-ui.com` reports, EXCLUDING `core2/` reports)*
</details>

</details>
```

> **The Universal Cross-Linking Rule (4D Navigation):**
> - **Physical Existence Check:** Before adding ANY file link (from today, the previous day, or the next day) to the footer tables, the agent MUST verify that the file physically exists on the filesystem. Do not blindly assume files exist. If a specific report was not generated in the `Local Reports` table, replace its cell with `—`.
> - **Omit Missing Base References:** If a snapshot file in the `Base Reference Files` table (e.g. `Last Standup`, `Last Vision`) does not exist for the target date, **completely remove the row** from the table instead of printing `—`.
> - **Pattern A Application:** Every package (the root and every active sub-package) must follow the exact same Pattern A footer structure: a `Base Reference Files` block holding the active/last snapshot links, and a collapsed `Local Reports` block holding the temporal matrix of reports.
> - **Context-Relative Hierarchy:** The uncollapsed, primary footer tables ALWAYS belong to the package where the current file is located. 
>   - If the file is in `core2/`, then `core2` is uncollapsed at the top, and sub-packages are in `<details>` below it. 
>   - If the file is in `wb-core/`, then `wb-core` is uncollapsed at the top, and `core2` is pushed into a `<details><summary>📂 Monorepo Root: core2/</summary>` below it, followed by any other sub-packages. Do NOT merge global reports into the local reports table.
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
- **v1.10** (2026-05-10) — Added §1.2 **Canonical relative-path patterns**: a lookup table of every recurring cross-file link shape (same-day siblings, prev/next day same/different month, scope-root, sub-package → core2, task-report → parent plan). Reports live at a fixed depth so href shapes are mechanically derivable — agents must read these off the table instead of counting `../` segments by hand. Extended §3 self-correct to verify every report-to-report and scope-root link against the table and rewrite mismatches to the canonical form. **Why this matters:** the user reported recurring broken cross-day links (e.g. an agent writing `../../05/09/plans/...` when the correct form across a month boundary is `../../../05/09/plans/...`); a fixed-shape lookup eliminates the source of the error.

---

## 8. Target Resolution & Initialization Protocol

Before ANY `/wb*` command generates an output report, it MUST verify the structural integrity of its `<target>`. 

**Target Scope Resolution:**
1. **Monorepo Root:** If the target is the root of a known monorepo (e.g., `core2/`), reports route to `<target>/.wb/workflows/reports/`.
2. **Sub-Package:** If the target is a registered child of a monorepo (e.g., `packages/wb-core`), reports route to `<target>/.wb/workflows/reports/`.
3. **Standalone Folder:** If the target is a normal, independent folder (e.g., a brand new end-user project), it MUST be treated as a sovereign monorepo. Reports route to `<target>/.wb/workflows/reports/`.

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

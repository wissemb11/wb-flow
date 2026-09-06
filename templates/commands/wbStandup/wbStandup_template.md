# /wbStandup: Execution Template

> Conforms to output_conventions v1.12 · template v1.0


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbStandup`

## Two forms

```
/wbStandup <monorepo-root>/              # monorepo-wide — morning default
/wbStandup <package>/          # package-scoped — afternoon re-orient
/wbStandup <monorepo-root>/ --archive    # …and leave exactly ONE live file per category, per scope
```

## Why the standup is never itself archived

Every other daily-history command (`/wbPlan`, `/wbAudit`, `/wbIdea`, `/wbVision`, …) keeps one live
file and retires the rest — see `_shared/output_conventions.md` §13. **`/wbStandup` and `/wbTrack`
are exempt**, and the reason is not an oversight worth "fixing":

A standup's entire content is *"here is what was open yesterday, here is today."* A track is the
session narrative. Both derive their value from **the series** — the eighth consecutive standup
listing the same blocker is the signal. Keep only the newest and you have thrown away the thing that
made it worth reading, while keeping the one entry that says least.

So the standup series stays whole. Instead `/wbStandup --archive` takes the **inverse** role: it is
the one command that sweeps *everything else* (§13.5).

## When to run

- **Every morning.** Literally first thing. Before `/wbContext`.
- **After interruptions.** Back from lunch, back from a meeting, returning to a branch you haven't touched in a week.
- **Before starting a new feature.** Clear the backlog view first, so you don't forget an open blocker.

## When *not* to run

- Multiple times per hour. It's a fresh-pair-of-eyes command; reading the same standup twice adds no value.
- Right after you've done 10 commits. Your memory is still hot; you don't need the standup to remind you.

## Reading the output

Four sections, ranked by what should grab your attention:

1. **Unresolved findings** (BLOCKERs / CRITICAL) — top priority
2. **Stale reports** (🔨 in progress > 24h) — verify before continuing
3. **Open plans** — ongoing work you can resume
4. **Suggested next action** — AI opinion, you decide

## The value is in the surface

`/wbStandup` doesn't add information. Every finding it lists already exists in `reports/`. Its value is making you *see* it, at the moment you're choosing what to do next. Without the standup, you'd probably forget the 8-day-old security finding.

## The `/wbStandup` → `/wbContext` handoff

Standup is *breadth*. Context is *depth*. Sequence:

1. `/wbStandup <monorepo-root>/` — tells you which package needs attention.
2. `/wbContext <that-package>` — loads the AI's detailed knowledge of that package.
3. Execute.

Skipping the first → you work on the wrong package. Skipping the second → the AI works on the right package with stale context.

## When /wbStandup is the wrong command

- "What does package X do?" → `/wbContext <x>`.
- "Is package X good?" → `/wbAudit <x>`.
- "What should I build next?" → `/wbVision`, not standup (standup reconciles existing work).
- "Did the AI finish its plan?" → `/wbReview <plan>`.

> For deeper reading: [`wbStandup_practical.md`](https://flow.wbc-ui.com/commands/wbStandup/wbStandup_practical) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--act` | `-a` |
| `--wbPlan` | `-P` |
| `--archive` | `-A` | **Universal, and here it means the fleet-wide sweep** (`_shared/output_conventions.md` §13.5). Consolidate into every scope's newest file per category, then retire all the superseded folders across every scope below the target. Defaults to `--archive=all` — the whole point of running it here rather than per-command. The standup's own `standups/` folder and every `tracks/` folder are never swept. Always previews first, and asks before applying. |
| `--dry-run` | `-n` | With `--archive`: print the move list for every scope, move nothing. |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbStandup <scope_folder>           # normal mode — produce a fresh output file
/wbStandup <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbStandup` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.


<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-a` → `--act`
- `-P` → `--wbPlan`
- `-A` → `--archive`   *(universal — here: the fleet-wide sweep, §13.5)*
- `-n` → `--dry-run`   *(universal — preview a sweep)*

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Scrum Master
**TARGET:** The entire monorepo or a specific package.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the standup file (relative links, full-syntax commands, self-correct mode, **§9 Action Type Tagging** — declare `type:` + `emits:` in YAML front-matter, add a plain-text `Requires` column to every "next actions" table, include a `## 🔗 Action Types` legend; standups are typically `emits: mixed`).

---


## ━━━ Active Model Roster ━━━

This command emits a `## 🌊 Next Executable Sequence`, so **`../_shared/output_conventions.md`
§10 rules 5, 5b and 12 apply to its output in full.**

**Read them there.** Nothing about them is restated, summarised or exemplified here — ten copies of
one rule are ten things to keep in step, which is the duplication rule 5 exists to remove. Even the
one-line gloss this block used to carry was a summary, and a summary drifts from what it summarises.
`wb-flow lint` **step-7** gates this command's output on rules 5b and 12.

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# Standup: <scope> — <YYYY-MM-DD>` *(or the legacy `# Standup Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Standup-specific gap-fills:

- Plain-text mentions of plan/audit files → relative markdown links per §1.
- Bare `/wbXxx` in the recommendation table → full-syntax `/wbXxx <target>` per §2.
- Missing `Recommended Models` cells → fill from [`../model_recommendations.md`](../model_recommendations.md).

---

## ━━━ OBJECTIVE ━━━
Your job is to cure "Choice Paralysis." Scan the monorepo for unfinished work, consolidate it into a single agenda, and explicitly tell the human developer what command they should run next — **including which model to use**.

## ━━━ PHASE 1: THE GLOBAL SCAN ━━━
1. Perform a recursive scan of the target directory looking for `reports/<YYYY>/<MM>/<DD>/plans/plan_*.md` and `reports/<YYYY>/<MM>/<DD>/audits/audit_*.md`.
2. Extract all tasks that have an empty checkbox (`⬜`) or audits marked as `FAIL`. Ignore anything marked with `✅`.
   > **Note (v2):** Report files are now at `reports/<date>/<type>/<type>_<target>_<date>.md` — no `<model>/` subfolder.

## ━━━ PHASE 2: AGGREGATION ━━━

### Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `.wb/workflows/reports/<YYYY>/<MM>/<DD>/standups/standup_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE standup file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your standup entry as Entry #1.
- **File ALREADY exists →** READ it, then APPEND your standup as the next Entry #N.
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

**Entry header format (use `---` only when appending, NEVER as the very first line of the file):**
```markdown
# Standup Entry #N — *(ModelName via Client — HH:MM)*

> **Model:** ModelName
> **Client:** Cline / Antigravity / OpenCode / Gemini CLI
> **Time:** YYYY-MM-DD HH:MM

[... standup content: open plans, unresolved findings, resolved findings, audit trajectory, suggested next action ...]
```

**Format:** Group the open tickets by Package/Folder. Order them by priority (e.g., Audit Debt comes before Feature tasks).

## ━━━ PHASE 3: THE RECOMMENDATION ━━━
At the bottom of the report, you MUST provide a definitive recommendation with **model suggestions**.

**For each suggested next action, recommend 2-3 models** from `commands/model_recommendations.md`, ordered best → budget.

Use a table format:

| Priority | Requires | Action | Recommended Models (ordered) | Why |
|----------|---|--------|------------------------------|-----|
| 🔴 1st | 🔨 Worker | `/wbXxx target` — [what to do] | 💻 Model1 / Model2 / Model3 | [reason + why this model] |
| 🟡 2nd | 📋 Mechanical | `/wbYyy target` — [what to do] | ⚡ Model1 / Model2 | [reason] |
| 🟢 3rd | 🧠 Planner | `/wbZzz target` — [what to do] | 🧠 Model1 / Model2 | [reason] |

> **`Requires` column** (mandatory per `_shared/output_conventions.md` §9.3): plain-text action-type tag (`🧠 Planner` / `✅ Validator` / `🔨 Worker` / `📋 Mechanical`). The file MUST also include a `## 🔗 Action Types` legend before the Generated Files footer.

**Role → Model mapping (quick reference):**

| Role | 🏆 1st Pick | 🥈 2nd Pick | 💰 Budget |
|---|---|---|---|
| 🧠 Planning/Audit | Claude Opus 4.6 | DeepSeek V4 Pro (free) | Gemini 3.1 Pro |
| 💻 Code Worker | DeepSeek V4 Pro (free) | Claude Sonnet 4.6 ($3) | GLM-5.1 (free) |
| ✅ Validator | Claude Sonnet 4.6 ($3) | DeepSeek V4 Pro (free) | — |
| ⚡ Mechanical | Gemini 3 Flash ($0.50) | DeepSeek V4 Flash (free) | GPT 5 Nano (free) |

*Example: "You have 3 open P0 tickets in wb-core. I recommend running `/wbRefactor packages/wb-core §1` with **💻 DeepSeek V4 Pro** (free, strong coder) or **Claude Sonnet 4.6** ($3, better for security reasoning)."*

**Apply output conventions to every cell:**

- All file/folder references in the standup → relative markdown links from the standup file's directory (output_conventions.md §1).
- Action column: full-syntax invocable command per §2 (e.g., `/wbRefactor packages/wb-core/src/WBC.js`, not bare `/wbRefactor`).

---

## ━━━ PHASE 4: WHAT'S NEXT ━━━

End the standup file with:

**Before "What's Next?", append the 🌊 Next Executable Sequence** — the wave × role matrix defined in `_shared/output_conventions.md` §10 (canonical: rows = parallel-safe waves, columns = the four `Requires` roles, each cell a full invocable command + `→ *Model · ~$cost*`, mandatory collision check, required Wave notes). Source rows: the consolidated agenda — every unfinished item you just gathered, waved by what blocks what. Emit it only when there are **2 or more** actionable items; for a single one, print `Next: <command> → *Model*` instead. Also print the matrix in the chat response. On a self-correct pass, insert it if absent and recompute it in place if present (§10.5).

## 🧭 What's Next?

Run `/wbNext <target_folder>` to get a current, ranked, dynamic list of next actions. The standup is a *snapshot* of where things stand; `/wbNext` is the *forward-looking* recommendation.

---

## ━━━ PHASE 5: THE FLEET-WIDE ARCHIVE SWEEP (`--archive` only) ━━━

**Skip this phase entirely unless `--archive` was passed.** Nothing below is implied by `--act`,
`--wbPlan`, or a bare invocation. Contract: [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §13.5.

You have just built, in PHASE 1–3, the complete inventory of what is still open across every scope.
That inventory is exactly what makes the sweep safe — you already know which items must survive it.

### 5.1 · Consolidate first, every scope, every category

For each scope discovered in PHASE 1, and each non-exempt category (`plans`, `audits`, `ideas`,
`visions`, `reviews`, `contexts`, `nexts`, `tests`, …):

1. Identify the **newest** file — the keeper. If a category has no file dated today, the newest one
   *is* the keeper; do not create an empty file just to have one.
2. Carry every still-open item from that category's older files into the keeper (§13.2 — the
   per-category "still open" table lives there). De-duplicate on item text, not ID.
3. Cross-check against your PHASE 1 scan: **every open item you listed in the agenda must now appear
   in exactly one live file.** An item in the agenda with no live home means consolidation missed it
   — stop and fix that before going near step 5.2. This cross-check is the whole reason the sweep
   belongs in the standup rather than in a standalone command.

### 5.2 · Preview the sweep, then ask

```bash
wb-flow archive <target> --recursive --all --dry-run
```

Print the move list **in the chat**, grouped by scope, with each keeper named. Then **stop and ask
for confirmation.**

> ⚠️ **This is the one gate.** A per-command `--archive` moves a handful of folders in one scope; this
> moves every superseded folder in every scope below the target, which in a monorepo is easily a
> hundred. It is reversible one folder at a time, which is no comfort at that volume. Ask, show the
> count, and wait — the same rule the wave runner applies before spawning agents.

Do not proceed if any scope's dry-run row reads `⚠️ no current file in this category` — that means
5.1 did not land for that scope.

### 5.3 · Apply and report

```bash
wb-flow archive <target> --recursive --all
```

Then add a section to the standup file, immediately before `## 🔗 Action Types`:

```markdown
## 🗄️ Archive Sweep

> Ran `wb-flow archive <target> --recursive --all` at <HH:MM>. Every open item below was carried
> into its scope's live file first (PHASE 5.1). Reversible per row: `wb-flow archive --restore=<path>`.

| Scope | Category | Folders archived | Kept (live file) |
|---|---|---|---|
| [wb-latex/](../../../../../../../packages/wb-latex/) | `plans` | 6 | [plan_wb-latex_20260809.md](…) |
| [wb-core/](../../../../../../../packages/wb-core/) | `audits` | 3 | [audit_wb-core_20260808.md](…) |

**Full log:** [archive_log.md](../../../../../archives/archive_log.md)
```

Links per §1.1 (basename labels) and §1.2 (canonical hrefs — scope root is **7** up from a report
file, not 5; see the correction note in §1.2).

**The standup file is the index of the sweep**, and that is the right home for it: the standup is
already the document whose job is to say where everything stands.

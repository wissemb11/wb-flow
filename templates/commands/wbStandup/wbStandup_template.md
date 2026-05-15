# /wbStandup: Execution Template


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
/wbStandup core2/              # monorepo-wide — morning default
/wbStandup <package>/          # package-scoped — afternoon re-orient
```

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

1. `/wbStandup core2/` — tells you which package needs attention.
2. `/wbContext <that-package>` — loads the AI's detailed knowledge of that package.
3. Execute.

Skipping the first → you work on the wrong package. Skipping the second → the AI works on the right package with stale context.

## When /wbStandup is the wrong command

- "What does package X do?" → `/wbContext <x>`.
- "Is package X good?" → `/wbAudit <x>`.
- "What should I build next?" → `/wbVision`, not standup (standup reconciles existing work).
- "Did the AI finish its plan?" → `/wbReview <plan>`.

> For deeper reading: [`docs_claude/commands/wbStandup/wbStandup_practical_claude.md`](../../docs/docs_claude/commands/wbStandup/wbStandup_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--act` | `-a` |
| `--wbPlan` | `-P` |

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

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Scrum Master
**TARGET:** The entire monorepo or a specific package.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the standup file (relative links, full-syntax commands, self-correct mode, **§9 Action Type Tagging** — declare `type:` + `emits:` in YAML front-matter, add a plain-text `Requires` column to every "next actions" table, include a `## 🔗 Action Types` legend; standups are typically `emits: mixed`).

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

## 🧭 What's Next?

Run `/wbNext <target_folder>` to get a current, ranked, dynamic list of next actions. The standup is a *snapshot* of where things stand; `/wbNext` is the *forward-looking* recommendation.

# /wbVision: Execution Template

> Conforms to output_conventions v1.12 · template v1.0


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbVision`

## Two forms

```
/wbVision <package>            # package-specific feature ideas
/wbVision <monorepo-root>/               # cross-package / monorepo-wide ideas
```

The cross-package form is generally more useful than the per-package form.

## When to run

- Occasionally (monthly or less). Daily use flattens your own judgment.
- After a major release cycle closed, when queue is genuinely empty.
- Before `/wbSetup` on a new package — ask what this package *should* contain.

## When *not* to run

- Daily. Brainstorming on a clock dulls intuition.
- As a substitute for `/wbStandup` ("what should I do today?"). Standup reconciles existing work; vision invents new work. Different questions.
- When you already have a plan. The plan is the answer; don't re-brainstorm.

## Reading the output

Each idea should have:

- **Premise** — one-sentence description.
- **Value** — why it matters.
- **Risk** — what could go wrong.
- **Effort** — SMALL / MEDIUM / LARGE.

If any field is missing, the idea is underspecified. Push back: *"re-run but put all 4 fields on every idea."*

## The filtering step is the command's actual value

You read 6 ideas. You discard 4 as obvious or generic. You discard 1 more as "interesting but wrong timing." The 1 that remains is the vision output. If all 6 survive, you haven't filtered hard enough.

## The anti-pattern

**Running `/wbVision` on a package that has open work.** If `/wbStandup` shows open plans and unresolved findings, the "what next?" question has an answer already. Vision is for when the answer is genuinely empty.

## The most useful invocation

Cross-package (`/wbVision <monorepo-root>/`) with a focus on integration ideas — things that couldn't be seen at package scope. This is where `/wbVision` earns its place over "just brainstorm with an AI."

## When /wbVision is the wrong command

- Reconcile state → `/wbStandup`.
- Execute on committed work → `/wbPlan`.
- Fix a bug → `/wbDebug`.
- Business / market / user research → `/wbVision` can't see these; do it yourself.

> For deeper reading: [`wbVision_practical.md`](https://flow.wbc-ui.com/commands/wbVision/wbVision_practical) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

| Long form | Shortcut | Meaning |
|---|---|---|
| `--depth="<N>"` | `-d` | Limit recursive dependency or import tracing before proposing strategic ideas. |
| `--diff` | — | Compare current work against the latest vision and report trajectory alignment instead of generating only fresh ideas. |
| `--archive` | `-A` | Consolidate current vision output, then retire superseded vision folders via `wb-flow archive`. |

`-h` / `--help` / `--h` prints this help block instead of executing.

<!-- FLAGS_TABLE_END -->

## Self-correct mode (dual-mode invocation)

```
/wbVision <scope_folder>           # normal mode — produce a fresh output file
/wbVision <previous_output_file>   # consolidate mode — absorb every still-open item from older visions/ files, then repair in place
/wbVision <previous_output_file> --archive   # …and then retire the visions/ folders it just superseded
```

When the first arg is an existing output file from a prior `/wbVision` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

**Consolidation (§13.2) runs first, before any repair.** Sweep this scope's whole `reports/` tree for other `vision_<scope>_*.md` files and absorb every item still open into THIS file — de-duplicated on the item's text (never its ID, which restarts per file), each carrying a relative `Origin` link back to the oldest file that raised it. Sources are read, never modified.

**Archiving is opt-in and never implied.** With `--archive`, and only once consolidation has completed, retire the superseded folders by shelling out to the CLI — `wb-flow archive <this file> --dry-run` first, read the move list, then apply. Without the flag, merely offer it in `What's Next?`. Archiving before consolidating does not delete an open item; it makes it invisible, which is worse. Full contract: [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §13.

<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

- `-d` → `--depth`
- `-A` → `--archive`

<!-- FLAG_NORMALIZE_END -->

**ROLE:** The Strategist
**TARGET:** The provided component, package, or monorepo root.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the proposal file (relative links, full-syntax commands, self-correct mode, **§9 Action Type Tagging** — declare `type:` + `emits:` in YAML front-matter, add a plain-text `Requires` column to every suggestion table, include a `## 🔗 Action Types` legend).

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# Vision: <scope> — <YYYY-MM-DD>` *(or the legacy `# Vision Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Vision-specific gap-fills:

- Plain-text references to existing components/packages → relative markdown links per §1.
- Bare `/wbPlan` reference at the bottom → full-syntax `/wbPlan <target> "<idea>"` per §2.

---

## ━━━ OBJECTIVE ━━━
The project has a blank slate. There is no tech debt and no pending tasks. Your job is to analyze what the project currently is, and propose 3 highly innovative, strategic features to build next to increase its value.

## ━━━ PHASE 1: INGEST IDENTITY ━━━
1. Read the local `context.md` to understand what this package does.
2. Read the global `ecosystem_urls.md` to understand where this package fits in the broader market.
3. If `--depth="<N>"` is present, cap recursive dependency/import tracing at that depth and state the cap in the output.
4. If `--diff` is present, read the latest prior vision output and compare recent plans/tasks against it before deciding whether to write fresh proposals.

## ━━━ PHASE 2: STRATEGIC BRAINSTORMING ━━━
Do not suggest bug fixes or minor refactors. Propose major architectural leaps, premium features, or integrations that would "Wow" the users.

## ━━━ PHASE 3: THE PROPOSAL ━━━
Generate a proposal file:
- **Path:** `.wb/workflows/reports/<YYYY>/<MM>/<DD>/visions/vision_<target>_<YYYYMMDD>.md`
- **No `<model>/` subfolder.** Create-or-append: if the file exists, append your vision as the next Entry #N tagged `*(ModelName — HH:MM)*`.
- **Format:** Present 3 distinct feature ideas. For each, explain *Why it matters* and *How complex it would be*. Apply output_conventions.md §1 (relative links for every existing-component reference) and §2 (full-syntax for any /wb* command cited).
- **Next Steps:** End the file with a `## 🧭 What's Next?` section: *"If you like one of these ideas, run `/wbPlan <target> "<idea>"` to begin execution. Run `/wbNext <target>` to see how it ranks against current debt."*

### Consolidate & Archive (`/wbVision <vision_file.md>` · `--archive`)

```
/wbVision <vision_file.md>              # consolidate: repair + absorb every un-acted older proposal
/wbVision <vision_file.md> --archive    # …then retire the emptied visions/ folders
```

Full contract: [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §13. Vision-specific:

1. **Absorb first.** Scan this scope's `reports/` tree for other `vision_<scope>_*.md`. A proposal is **still live** when it was never promoted to an idea (PHASE 4) or a plan task. De-duplicate on the premise, keep an `Origin` link to the oldest file, and carry its original *Why it matters* wording verbatim — a strategic proposal paraphrased three times becomes a different proposal.
2. **Say how old it is.** A vision carried forward for a month without being promoted is telling you something; surface the age next to the premise rather than letting it blend in with today's three fresh ideas.
3. **Then, with `--archive` only:** `wb-flow archive <vision_file.md> --dry-run`, read it, apply.

**Without `--archive`,** offer it in `What's Next?`.

## ━━━ PHASE 4: AUTO-REGISTER IDEAS ━━━

After writing the vision proposal, you MUST ALSO register each idea in the Ideas Pipeline:

1. **Locate or create** today's idea file: `<target>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/ideas/idea_<target>_<YYYYMMDD>.md`
2. **For each idea** in the vision proposal:
   - Compute a **Score** (1–10) using the scoring heuristic from `wbIdea_template.md` (impact × feasibility × urgency).
   - Append a row to the idea table:
     - `Score` = computed score
     - `Idea` = the idea's Premise (one-line)
     - `P` = inferred priority (P1 for SMALL/MEDIUM, P2 for LARGE)
     - `Est. Time` = inferred from Effort (SMALL=30, MEDIUM=120, LARGE=480)
     - `Suggested By` = `<ModelName> via /wbVision`
     - `☐ Done` = `⬜`
     - `☐ Valid` = `⬜`
     - `→ Task` = `—`
3. **Add an entry header** in the idea file:
   ```
   ## 💡 Ideas — /wbVision proposals *(<ModelName> via <Client> — <HH:MM>)*
   > **Source:** [vision_<target>_<YYYYMMDD>.md](../visions/vision_<target>_<YYYYMMDD>.md)
   > **Origin Command:** `/wbVision <target>/`
   > **Ideas registered:** N
   ```
4. **Both files coexist**: The vision file remains the free-form brainstorming artifact. The idea file is the trackable, actionable pipeline. The vision file is the source; the idea file is the tracker.

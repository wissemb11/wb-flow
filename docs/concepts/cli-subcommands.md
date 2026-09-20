---
title: "CLI Subcommands — wb-flow model, wb-flow snap, wb-flow wave"
description: "The single writer of templates/commands/modelrecommendations."
---
# CLI Subcommands — `model`, `snap`, `wave`, `watch`, `archive`, `next`, `init`

> Beyond the 33 `/wb*` slash-commands, `wb-flow` ships CLI subcommands that manage the runtime
> infrastructure: the model roster, output pinning, wave orchestration, watching what a wave left
> running, and retiring superseded reports. They are invoked directly in the terminal and are the
> plumbing that `/wb*` templates delegate to.
>
> **Why templates delegate rather than hand-roll.** One implementation beats 33 copies of the same
> shell snippet, each subtly wrong in its own way. `wb-flow model` is the single writer of the roster;
> `wb-flow snap` the only creator of pin symlinks; `wb-flow archive` the only mover of report folders;
> `wb-flow next` the only author of the how-to-run block. A template that improvises one of these gets
> none of their guardrails.

---

## 1. `wb-flow model` — The Model Roster

The single writer of `templates/commands/model_recommendations.md`. Every model-aware dispatch —
`/wbModel`, `wb-flow init`, `wb-flow wave` — routes through here. One writer, one source of truth,
one place the `\|\|` escaping is correct: a GFM table cell containing the bash OR operator must
escape it, and every hand-maintained copy of that file has eventually got it wrong.

### Detection vs. reachability

| Step | What it proves | Command |
|---|---|---|
| Catalogued | the CLI can *list* this model | `opencode models` (instant) |
| Credentialed | a valid credential exists for its provider | matched from `opencode providers list` |
| Reachable | the model actually **answers** | `--probe` only — one dispatch per model, real cost |

Catalogued + credentialed is not enough. On 2026-08-02 every `opencode-go/*` model appeared in the
catalog and matched a credential yet timed out at 150s on every probe. `--detect` cannot see that;
`--probe` can.

### Flags

| Flag | Alias | Effect |
|---|---|---|
| `--detect` | `--reset` | Re-read installed CLIs' catalogs and propose a roster from what is credentialed |
| `--pick` | `-i` | Interactive picker — shows detected models annotated with billing pool, asks you to rank up to 3 per role |
| `--set <role>=<slug>` | | Pin one role, e.g. `--set worker=deepseek/deepseek-v4-pro` (repeatable) |
| `--probe` | | Dispatch one trivial prompt per selected model — the only check that proves a model answers |
| `--all` | `-a` | With `--probe`: sweep the whole `models.json` catalog, grouped by role, unreachable hidden |
| `--all=raw` | | …stream everything instead, failures included |
| `--all=<provider>` | | …restrict to one provider (`anthropic`, `openai`, `antigravity`, …) |
| `--all=<role>` | | …restrict to one role (`planner`, `validator`, `worker`, `mechanical`) |
| `--timeout=<ms>` | | Per-model probe timeout (default 45000) |
| `--file=<path>` | | Roster file to read/write (default: resolved from cwd) |
| `--json` | | Machine-readable output; implies no write |
| `--dry-run` | `-n` | Show the roster that would be written, write nothing |
| `--yes` | `-y` | Write without confirming |
| `--help` | `-h` | Show help |

### Worked examples

```bash
# First run — derive a roster from what you actually have
wb-flow model --detect

# Prove the picks answer (real calls, ~45s each)
wb-flow model --probe

# Pin one role by hand
wb-flow model --set worker=gemini-3.1-pro-high

# Pin a whole chain (1st / 2nd / 3rd, tried left to right)
wb-flow model --set worker=gemini-3.1-pro-high,opencode/deepseek-v4-pro,opencode/kimi-k2.7-code

# Show the roster without touching it
wb-flow model

# Machine-readable, writes nothing
wb-flow model --json
```

### How the picker builds a chain

The picker ranks candidates by **capability** first (opus > gemini-pro > sonnet > kimi, etc.),
then applies three passes to keep the chain diverse:

| Pass | Rule |
|---|---|
| 1 | **New pool AND new family.** Maximum diversity — three models, three subscriptions, three families. |
| 2 | **New pool, family may repeat.** The same model on a *different* subscription is the ideal fallback: identical capability, independent rate limits (e.g. Opus via Claude Pro, then Opus via Google One). |
| 3 | **Anything unused.** Fill the slot rather than leave it short. |

A chain whose three entries all draw from one subscription is one point of failure wearing three hats.

### Model-name shapes

The shape of a model name decides which CLI runs it:

```bash
opencode/deepseek-v4-pro      # → opencode run -m opencode/deepseek-v4-pro …
opencode-go/qwen3.7-plus      # → opencode run -m opencode-go/qwen3.7-plus …
gemini-3.1-pro-high           # → agy --model gemini-3.1-pro-high -p …
claude-sonnet-4-6             # → agy       (bare name, agy lane)
opencode/claude-sonnet-4-6    # → opencode  (provider-prefixed — NOT agy)
gpt-5.6-terra                 # → codex exec -m gpt-5.6-terra …
```

A provider-prefixed slug (`opencode/*`, `opencode-go/*`) always routes to opencode. A bare name that
matches the `agy` roster routes to agy. A bare `gpt-5.*` name routes to codex. The prefix IS the
routing decision.

---

## 2. `wb-flow snap` — Pin an Output

Pins a file or folder into `.wb/snaps/<YYYYMMDD>_<label>/` so it stays findable after the reports
tree has grown another hundred files.

**A symlink is a PIN, not a snapshot.** It points at the live file, so a pinned plan shows its
*current* Done boxes and matrix — not the state it had when you pinned it. That is the right default
for explanation files (written once, never edited) and for bookmarks. When you need the content
frozen as of today, pass `--copy`.

### Flags

| Flag | Effect |
|---|---|
| `--label=<name>` | Folder label (default: the target's basename, sanitized). The `YYYYMMDD_` prefix is always added. |
| `--copy` | Copy instead of symlink — freezes the content as-of now |
| `--root=<dir>` | Where `.wb/` lives (default: nearest `.wb/` walking up, else cwd) |
| `--list` | List existing snaps and exit |
| `--json` | Machine-readable output |
| `--dry-run` | `-n` | Show what would happen, write nothing |
| `--help` | `-h` | Show help |

### When to use `--copy` vs a symlink

| Output | Use | Why |
|---|---|---|
| `/wbExplain` blueprints, task reports | symlink (default) | written once, never edited — the link is always correct |
| A plan mid-execution | `--copy` | a plan mutates constantly; a symlink shows its *future* state |
| A report you are about to supersede | `--copy` | the point is to keep the superseded version |

### Examples

```bash
wb-flow snap .wb/workflows/reports/2026/08/02/plans/plan_x_20260802.md
wb-flow snap tasks/task_1/ --label=retirement --copy
wb-flow snap --list
```

Symlinks are always **relative**, so the repo stays portable if moved or cloned.

---

## 3. `wb-flow wave` — Orchestrate a Wave

Reads one row of a plan's `## 🌊 Next Executable Sequence` matrix and emits a bash script that
launches every cell in the row — each routed to a CLI by its role — in parallel.

### The wave is generated, not authored

```bash
wb-flow wave <plan.md> --wave=A          # emit the script for Wave A
wb-flow wave <plan.md> --wave=A --print  # print it to stdout
wb-flow wave <plan.md> --wave=A:W        # ONLY the Worker column of Wave A
wb-flow wave <plan.md> --wave=A --list   # resolve routing without spawning
```

The script never touches the plan file. Every spawned command gets `--no-plan-update`, so
sub-agents write only their task reports. Checking Done boxes and recomputing the matrix is the
orchestrator's job, once, after the wave settles.

### Flags

| Flag | Effect |
|---|---|
| `--wave=<label>` | Which wave to run (A, B, C…). Required. |
| `--wave=<L>:<R>` | Narrow to ONE cell by role: `P` Planner, `V` Validator, `W` Worker, `M` Mechanical |
| `--validate` | Run the wave's `✅ validate` sub-row instead of its `🔨 work` sub-row |
| `--summary` | Stream only decision lines (dispatch marker, gate verdicts, PER-ID) to the terminal. Each cell's full output still goes to its log file. **(Default in wave mode.)** |
| `--no-summary` | Stream the raw output — use only when debugging one cell's behaviour |
| `--sessions` | Reuse one warm opencode session per (scope, model), resumed and forked so parallel cells don't share a conversation. Opt-in — a resumed session replays its history. |
| `--jobs=<n>` | Max parallel jobs (default: 4; use 0 for unlimited) |
| `--out=<path>` | Where to write the script |
| `--print` | Print the script to stdout instead of writing it |
| `--list` | Show the parsed cells and their routing, then exit |
| `--help` | `-h` | Show help |

### Model overrides

| Flag | Effect |
|---|---|
| `--planner=<m>` | Override the 🧠 Planner model |
| `--worker=<m>` | Override the 🔨 Worker model |
| `--validator=<m>` | Override the ✅ Validator model |
| `--mechanical=<m>` | Override the 📋 Mechanical model |
| `--model=<m>` | `-M` | Delegate THIS run to one model — highest priority, outranks role routing and executor≠validator |

**Note:** A `--wave=` dispatch is EXEMPT from the `-M=` requirement: it runs a whole matrix row and each cell's model comes from the matrix.

### Routing

Each role maps to one lane:

| Role | Lane |
|---|---|
| 🧠 Planner | the orchestrator itself, **in-session** — decomposition is never delegated |
| 🔨 Worker | `opencode run -m <worker-model>` (or `agy`, or `codex` — resolved by model-name shape) |
| 📋 Mechanical | `opencode run -m <fast-model>` (or `agy`/`codex`) |
| ✅ Validator | **in-session**, unless it pairs a non-Planner row the orchestrator itself executed — then a *different* model via `opencode run` |

The executor≠validator rule: a model must never validate its own **edits**. 🧠 Planner rows are
exempt — they produce a decision, not a diff, and the reasoning is already in the orchestrator's
context.

### Generated script behavior

The emitted script:
- Launches all cells in parallel (collision-free by the matrix's own check)
- Embeds the plan's `Est. Time (mins)` column for the heartbeat
- Runs a background heartbeat every ~30s: still-running ids, elapsed, % of estimate, ETA
- Reports `OVER est by Nm` when a cell exceeds its budget
- Streams every cell's output in real time via `tee`
- Exits with the failed-cell count

With `--summary` (the default), the orchestrator sees only decision lines; each cell's full output
goes to its log file under `.wb/workflows/reports/waves/<label>_<ts>/`.

---

## 4. `wb-flow watch` — See What Is Running

A wave dispatches agents into the background and returns. `wb-flow watch` is how you find out what
they are doing without reading raw logs.

```bash
wb-flow watch              # follow the newest run, refresh every 5s
wb-flow watch -1           # one-shot snapshot (scriptable)
wb-flow watch --list       # recent runs, newest first
wb-flow watch --run=<name> # a specific run
```

```
🌊 G_20260803_022205
   ✅ 1 done · 🔄 2 running · ETA ≲ 18m (slowest cell)   02:31:07

  10,12  ✅ DONE   (est 35m)
  11     🔄 ███████··· 68% of 30m   idle 42s   19KB
  18     🔄 ██████████ OVER est 45m by 6m   idle 91s   31KB
```

### Flags

| Flag | Effect |
|---|---|
| `-1`, `--once` | One-shot snapshot, no refresh. Use in scripts and status reports. |
| `--list` | List recent runs with cell counts and times, then exit |
| `--run=<name\|dir>` | Watch a named run instead of the newest |
| `--plan=<file>` | Plan to read `Est. Time (mins)` from (default: the newest plan found) |
| `--interval=<s>` | Refresh seconds in follow mode (default `5`) |

### `OVER est` is the signal, not elapsed time

Progress and ETA come from the plan's own **`Est. Time (mins)`** column — the same number the 🌊
matrix prints as *(⏱️ N min)*. Nothing else in the system reads that column, which is why populating
it on every row matters.

A cell past its estimate renders `OVER est Nm by Mm`. **That**, not raw elapsed time, is what
separates *slow* from *hung*.

### Liveness is read from the process table, never from log mtime

`idle` (time since the log last grew) is shown, but it is **informational only**. Agents buffer while
composing, so a thinking cell and a dead one look identical by idle time — ten concurrently-running
validators once all reported `idle ≈ 230s` while every one was healthy.

`watch` therefore decides liveness with `pgrep -f -- "--id=<ids> "`. Three states, never two:

| State | Meaning |
|---|---|
| `✅` / `❌` | Finished — the cell printed a `VERDICT:` line and no process holds it |
| `🔄` | Running — a live process holds it |
| `⚠️ ENDED` | **No verdict and no process** — killed, crashed or OOM-ed |

The third state matters: a killed cell never prints a verdict and would otherwise appear to run
forever.

> ⚠️ **`watch` reports verdicts, it does not judge them.** It surfaces what `wave.js` recorded. If the
> harness misclassifies a cell, `watch` repeats the misclassification faithfully. Treat it as a
> progress view; confirm outcomes with the row's own `Verify` oracle, run from the plan's directory.

### Where runs are stored

Logs land in `<repo>/.wb/workflows/reports/waves/<label>_<YYYYMMDD>_<HHMMSS>/`, one `.log` per cell.
Note this resolves to the **git repo root**, not the plan's own scope — a plan under
`packages/x/.wb/` still logs to the monorepo root. `watch` searches both and merges, newest first,
so you do not have to know which applies.

---

## 5. `wb-flow archive` — Retire Superseded Reports

A scope worked for a month holds thirty plan files, of which one is live. `wb-flow archive` moves
every superseded `<YYYY>/<MM>/<DD>/<category>/` folder out of `reports/` and into `archives/`, at the
**same depth**, so relative links inside the moved files keep resolving.

```bash
wb-flow archive <scope> --type=plans --dry-run   # always preview first
wb-flow archive <scope> --type=plans             # apply
wb-flow archive <plan_file.md>                   # a FILE pins itself as the keeper
wb-flow archive <scope> --recursive --all        # every scope below, every category
wb-flow archive --list                           # what is already archived
wb-flow archive --restore=<folder>               # undo one move
```

> 🔴 **Consolidate before you archive.** The CLI moves folders; it does not check whether their open
> items were carried forward. That is the calling command's job (`/wbPlan <plan.md>` and friends —
> see [report_lifecycle.md](report_lifecycle.md)). Archiving an un-consolidated folder does not delete
> an open task, it makes it invisible: nothing live references it, and the next `/wbStandup` no longer
> scans the tree it sits in.

### Flags

| Flag | Effect |
|---|---|
| `--type=<a,b>` | Categories to sweep (default: every non-exempt one found) |
| `--keep=<N>` | Keep the N newest dates per category (default `1`) |
| `--before=<YYYYMMDD>` | Only archive dates strictly before this one |
| `--recursive` | `-R` | Sweep every scope with a `.wb/` below the target (fleet mode) |
| `--include-standups` | Also sweep `standups/` — exempt by default, it IS the log |
| `--include-tracks` | Also sweep `tracks/` — same reason |
| `--all` | Sweep every category, exempt ones included |
| `--no-banner` · `--no-log` | Skip the 🗄️ stamp / the `archive_log.md` row |
| `--restore=<path>` | Move an archived folder back under `reports/` and exit |
| `--list` | Show what is already archived and exit |
| `--root=<dir>` | Where `.wb/` lives (default: nearest `.wb/` walking up) |
| `--dry-run` | `-n` | Print the plan, move nothing |
| `--json` | Machine-readable output |

### Three rules it enforces that a hand-rolled `mv` does not

| Rule | Why |
|---|---|
| **The newest folder per category is never a candidate** — and keepers are resolved **per category** | `audits/` having no recent activity must not drag it out just because `plans/` moved on |
| **The unit is the folder, never the file** | a plan's `tasks/`, `waves/` and `explanations/` are its siblings; moving the `.md` alone orphans every task report it links to |
| **The original date is preserved** | `plan_x_20260807.md` → `archives/2026/08/07/`, not today — the archive records when work happened, not when someone tidied |

It also refuses to clobber an existing archive entry, prunes the empty `<YYYY>/<MM>/<DD>` shells it
leaves behind, stamps each moved `.md` with a banner linking to its replacement, appends a reversible
row to `archives/archive_log.md`, and exits non-zero on a bad target.

### Reading a dry run

```
📋 DRY RUN — nothing will move

  packages/wb-core/
   audits      .wb/workflows/reports/2026/08/04/audits
               → .wb/workflows/archives/2026/08/04/audits   (kept: audit_wb-core_20260807.md)
   plans       .wb/workflows/reports/2026/08/07/plans
               → .wb/workflows/archives/2026/08/07/plans   (kept: plan_wb-core_20260809.md)
   · standups: exempt — it is the log (use --include-standups or --all)

   2 folder(s) would move.
```

Check the `(kept: …)` name is the file you expect to be live, and that **no row reads
`⚠️ no current file in this category`** — that means nothing live supersedes the folder, which
almost always means consolidation has not run.

Full model, including the `/wbStandup --archive` fleet sweep: **[report_lifecycle.md](report_lifecycle.md)**.

---

## 6. `--snap` / `--snap-copy` — The Universal Pin Flag

**Every `/wb*` command that writes into `.wb/workflows/reports/` accepts `--snap`.** Under the hood
it shells out to `wb-flow snap`, so one implementation serves 23 slash-command templates — no
template ever hand-rolls `ln -s`.

| Form | Effect |
|---|---|
| `--snap` | pin this run's outputs, label from each file's basename |
| `--snap=<label>` | pin with an explicit label (`YYYYMMDD_` prefix always added) |
| `--snap-copy` | **copy** instead of symlink — freezes the content as of now |

### In practice

```bash
/wbPlan <target> --task="…" --snap
/wbExplain <plan.md> --id=3 --as=expert --snap=gis-decision
/wbWork <plan.md> --wave=A --snap-copy
```

There is no `--snap` on a command that reads-only (like `/wbStandup` that emits no file). On a
command that writes, `--snap` pins whatever was produced — no extra invocation needed.

---

## 7. `wb-flow init` — Interactive Setup & Assistant Registration

Bootstraps `.wb/` templates and registers `/wb*` slash-commands directly into installed AI coding assistants (Claude Code, OpenCode, Gemini CLI, Antigravity, Cursor, Codex).

```bash
wb-flow init                     # interactive registration across all detected assistants
wb-flow init --force             # force re-registration and template overwrite
wb-flow init --dry-run           # preview registration actions without modifying config
```

### Flags

| Flag | Alias | Effect |
|---|---|---|
| `--force` | `-f` | Force re-registration & overwrite existing templates |
| `--dry-run` | `-n` | Show what files/configs would be updated without writing |
| `--scope=<dir>` | | Target a specific workspace subdirectory |
| `--help` | `-h` | Show help for init |

---

## 8. `wb-flow next` — Derived Execution & Run-Book Generator

Analyzes a plan file to derive wave inventories, task state breakdowns, cross-wave dependencies, and autopilot risk factors. Serves as the engine behind `--next` and `--embed`.

```bash
wb-flow next <plan.md>           # output human-readable execution overview to stdout
wb-flow next <plan.md> --embed   # write/update ## ▶️ How to run this plan directly in the plan file
wb-flow next <plan.md> --json    # output machine-readable JSON representation
```

### Flags

| Flag | Effect |
|---|---|
| `--embed` | Embed or replace the `## ▶️ How to run this plan` block directly in the target plan file. Note: `wb-flow next --embed` emits the four `#### N.` scenario headings and the `### Recommended Next Execution Command(s)` section even for a fully closed plan. |
| `--json` | Return JSON object containing wave summaries, task counts, and risk objects |
| `--help` · `-h` | Show help for next |

---

## 9. `wb-flow lint` — Static Analysis for Plan Files

Performs automated checks on plan files to catch broken relative links, structural deviations from `wbPlan_template.md`, missing sections, and table formatting defects.

```bash
wb-flow lint <plan.md>           # lint a single plan file
wb-flow lint .                   # lint all plan files under current directory
wb-flow lint --all [<scope-dir>] # sweeps every plan in a scope; prints PASS / FAIL / 'SKIPPED — pre-v5 format' per plan plus a summary; exits non-zero if any current-format plan fails.
```

### Flags

| Flag | Effect |
|---|---|
| `--json` | Machine-readable lint failure output |
| `--help` · `-h` | Show help for lint |

**Note on step 4:** lint step-4 scans for dispatch commands only inside FENCED CODE BLOCKS — a command mentioned in prose is no longer treated as a dispatch.

---

← [Concepts Hub](README.md) · [Home](../README.md)

### `wb-flow model --sync-catalog`

Fills `models.json` from what this machine can actually reach — enumerating each installed CLI,
curating the result, and three-way-merging it into the existing catalog.

| Flag | Effect |
|---|---|
| `--sync-catalog` (`--sync`) | refresh every provider already in the catalog |
| `--add=<a,b,c>` | scoped sync over named providers; aliases accepted (`codex`=openai, `zen`=opencode-zen, `go`=opencode-go, `agy`=antigravity, `grok`=xai) |
| `--remove=<a,b,c>` | drop providers; refuses one the live roster names without `--force` |
| `--strict` | with `--add`, fail if any named provider could not be filled (default: partial success exits 0) |
| `--from-picker` / `--from-file=<p>` | fill a non-enumerable provider from its own interactive picker text |
| `--probe` | confirm entitlements by dispatching one call per candidate — **real API calls**, never under a plain sync |
| `--prune` | delete retired models instead of marking them |
| `--force` | allow `--prune`/`--remove` to touch a roster-referenced slug |
| `--dry-run` / `--json` | both write nothing |

Writes atomically (`.tmp` + rename) keeping the previous file as `.bak`, and refuses to overwrite a
catalog it cannot parse.

### Model chains on any dispatch flag

`-M` / `--model=` and the per-role `--planner=` `--validator=` `--worker=` `--mech=` (short: `-p= -v=
-w= -m=`) all accept a **fallback chain**:

```bash
-M=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high   # commas — the emitted form
-M=$WORKER                                                        # a role variable
```

Links are tried left to right, advancing only on a Gate-1/INFRA failure, and **every link is
validated at parse time** — a typo in position 3 is reported immediately, not hours later when the
head rate-limits. See [`model-fallback-chains.md`](../concepts/model-fallback-chains.md).

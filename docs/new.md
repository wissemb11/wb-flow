---
title: "What's New in wb-flow (v1.0.2 / next)"
description: "Compared to `v1.0.1`, `wb-flow` (`next/core`) introduces native local error guarding, autonomous wave execution, per-role model override flags, persistent plan "
---
# What's New in `wb-flow` (v1.0.2 / `next`)

Compared to `v1.0.1`, `wb-flow` (`next/core`) introduces native local error guarding, autonomous wave execution, per-role model override flags, persistent plan model rosters, matrix auto-correction, and a standardized 9-file documentation suite across all 34 agentic commands.

---

### 🗄️ Consolidate & Archive — one live file per category *(2026-08-09)*

A scope worked for a month holds thirty plan files, twenty audits and a dozen idea files, of which
**exactly one of each is live**. Every other is a decoy: open the wrong one and you work from a
backlog that was closed a week ago. A stale file is more dangerous than a missing one — a missing
file makes you go looking; a stale one answers confidently and wrongly.

The daily-history commands now have a two-half answer, and **the order between the halves is the
whole safety story**.

| Half | What it does | Trigger |
|---|---|---|
| **Consolidate** | absorb every still-open item from older files of this category into today's file, then repair its structure and links | passing an existing output file with no other flags |
| **Archive** | move the now-superseded `<DD>/<category>/` folders into `.wb/workflows/archives/` | `--archive`, never implied |

```bash
/wbPlan  <plan_file.md>                  # consolidate: absorb every older open task, repair in place
/wbPlan  <plan_file.md> --archive        # …then retire the plan folders it just emptied
/wbAudit <audit_file.md> --archive       # same shape for audits, reviews, ideas, visions, …
/wbStandup <monorepo-root>/ --archive    # fleet-wide: one live file per category, per scope
```

> 🔴 **Consolidate always runs before archive.** Archiving first does not delete an open task — it
> makes it *invisible*: nothing live references it, and the next `/wbStandup` no longer scans the tree
> it sits in. That is why archiving is opt-in rather than automatic, why no other flag implies it, and
> why a failed consolidation aborts the sweep.

**The archive tree — three load-bearing properties:**

- **Same depth as `reports/`.** `archives/<YYYY>/<MM>/<DD>/<category>/` mirrors the live path exactly,
  so every relative href inside a moved file that pointed at something moving with it still resolves,
  unchanged. That is the only reason the archive root sits where it does.
- **The unit is the folder, never the file.** A plan's `tasks/`, `waves/` and `explanations/` are its
  siblings; moving the `.md` alone orphans every task report it links to.
- **The original date is preserved.** A plan dated `20260807` archives to `archives/2026/08/07/`, not
  to today — the archive records when the work happened, not when someone tidied.

Each moved file is stamped with a `🗄️ ARCHIVED` banner linking to what superseded it, one row is
appended to `archives/archive_log.md`, and every move is individually reversible.

**`/wbStandup` and `/wbTrack` are exempt.** A standup *is* the "yesterday / today" log and a track *is*
the session narrative; both derive their value from the series, so keeping only the newest destroys the
thing that made them worth reading. `/wbStandup --archive` instead takes the **inverse** role — the one
command that sweeps everything *else*, across every scope, gated behind a preview and a confirmation.
It is the right owner because its PHASE 1–3 scan already knows what is open everywhere, and that
inventory is the cross-check that makes the sweep safe.

New: the `wb-flow archive` subcommand, `_shared/output_conventions.md` §13, and a 42-assertion
regression suite. Templates shell out to the CLI rather than hand-rolling `mv` — the same rule that
makes `wb-flow snap` the only writer of pin symlinks, except this one moves work product.

Full model: **[concepts/report_lifecycle.md](concepts/report_lifecycle.md)**.

### 🧱 Lighter, self-repairing plan files *(2026-08-04—2026-08-09)*

A plan file is **one authored table plus four derived projections of it**. Several changes make that
explicit and keep the projections honest.

| Change | What it means |
|---|---|
| **Wave notes externalized** | Collision analysis and gate reasons move to `tasks/waves.md`; the plan keeps a one-line pointer. Wave notes grow every wave — inline, they push the task table below a screen of prose about waves that already ran. |
| **How-to-run block relocated** | `## ▶️ How to run this plan` now sits **directly beneath the 🌊 matrix table** it is computed from, not below unrelated prose. |
| **Multi-ID merged dispatches** | Cells sharing a wave, scope, role and model merge into `--id=X,Y` — one context read instead of N, with per-ID gating preserved. Validators merge on *their own* model and scope, not on how the work was grouped. |
| **`--wave=A` = work then validate** | Running a label runs `A.work` then `A.valid`. A wave is a complete unit — dispatch, then verdict — rather than a promise redeemed a wave later. `A.work` / `A.valid` still address one sub-row. |
| **Four copy/paste scenarios** | Next wave orchestrated · next wave as individual dispatches · all remaining waves orchestrated · all remaining as dispatches. Individual dispatches always carry their explicit `-M="…"`. |
| **`/wbPlan <plan_file.md>` repairs everything** | Links, section order, missing sections, checkbox gap-fill, cell batching, matrix recompute, how-to-run re-embed — and now open-task absorption from older plans. |
| **The sync oracle** | `sync_check.sh` exits non-zero and names the derived block that drifted. Run it after **every** edit to a plan file. |

> ⚠️ **Batching yields to executor≠validator, never the reverse.** Two `/wbValid` cells sharing a
> model must NOT merge if their ids had different executors — routing classifies a merged validate
> cell from one id and applies that verdict to the whole batch, silently producing a self-validation.

> ⚠️ **`--wave=C,D` does not exist.** A comma list is read as the literal label `C,D`, matches no row,
> and exits non-zero. One label per invocation, or `--wave=all`.

**Scenario 3 no longer offers and refuses in one breath.** It used to print `--wave=all` while the
section beneath argued against running it. Now: no derived blocker → emit the real thing, annotated;
a blocker exists → emit the closest safe equivalent, one command per wave, with a `⏸` pause line
before each wave that needs a human. A wave gets a `⏸` line **iff** it contributed a bullet to
*Why not `--wave=all`* — so the two cannot drift apart.

### 👀 `wb-flow watch` shows the task, not just the model *(2026-08-04)*

A watch line used to name the model and nothing else, which tells you *who* is working but not *on
what*. Cells now render their **task `#id` and description**, so a glance at the watch output answers
"which of the four things I dispatched is the slow one."

And because a wave dispatches into the background and returns, `/wbWork` now closes its reply with
an explicit **continuation signoff** — `(To be continued…)` / `(Please stand by while background
tasks execute…)` — so the orchestrator screen shows that work is live rather than appearing idle
until a `watch` snapshot happens to be pasted. `wb-flow watch` is a **mandatory** entry in every
"While you wait" list, and every other suggestion there must be read-only or touch files disjoint
from every running cell — a suggestion that races the wave is worse than no suggestion.

### 🔧 Fixed: scope-root link depth was wrong everywhere *(2026-08-09)*

`output_conventions` §1.2 gave the scope root as `../../../../../` (5 up), derived from arithmetic
that mis-read its own depth diagram — the `7` in that diagram numbers the **file**, not its
directory. There are seven directories between a report file and its scope root, so every
`context.md` / `dev.md` / `package.json` link written from the old row lands two levels short.

Corrected in the §1.2 table, in §1.1's tooltip example, in the §5 footer example, and in the 15
command templates that had copied it. A self-correct pass must now **rewrite** these hrefs rather
than "verify" them by reproducing the old arithmetic.

---

### 🎛️ Universal Model Flags & Cell-Level Wave Targeting *(2026-08-01)*

**Four role flags, one delegation flag, one cell selector — accepted by every `/wb*` command that dispatches work.**

| Flag | Alias | Effect |
|---|---|---|
| `--planner=` | `-p` | Set the 🧠 Planner chain |
| `--validator=` | `-v` | Set the ✅ Validator chain |
| `--worker=` | `-w` | Set the 🔨 Worker chain |
| `--mechanical=` | `-m` | Set the 📋 Mechanical chain |
| `--model=` | `-M` | **Delegate this one run** — highest priority |
| `--wave=<L>:<R>` | `-W` | Run **one cell**: `:P` `:V` `:W` `:M` |

**Role flags persist.** Passing one is exactly equivalent to running `/wbModel` first — the choice is written to `templates/commands/model_recommendations.md` and survives into every later dispatch:

```bash
/wbValid <folder>/ --id="<i>" -v="go:ds4pro" -p="gemini 3.6:"
# ≡  /wbModel -v="go:ds4pro" -p="gemini 3.6:"
#    /wbValid <folder>/ --id="<i>"
```

**`-M` delegates a single invocation** and outranks role routing, the roster, *and* the executor≠validator rule. Run from the Claude CLI, it means Claude dispatches instead of executing:

```bash
/wbWork <folder>/ --id="<i>" -M="go:DSV4pro"
# → opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions "/wbWork …"
```

Because `-M` can override the executor≠validator rule, the override is **printed in the routing line** (`[--model=… — explicitly delegated by the operator]`) so a self-validation can never happen invisibly.

**Cell targeting** addresses one matrix cell by row × column:

```bash
/wbWork <folder>/ --wave="A:W"                      # only A's Worker cell
/wbWork <folder>/ --wave="A:W" -M="claude:opus 5"   # …delegated
/wbWork <folder>/ --wave="A:V" -v="go:ds4pro"       # …and persist the roster
```

An unrecognised role letter **exits non-zero** rather than falling back to the whole row — a typo that quietly runs four cells instead of one is worse than an error.

> ⚠️ **Breaking:** `-w` now means `--worker`, not `--wave`. The four role flags must be symmetrical; a set where three mean *model* and one means *wave* is a trap. **`--wave` takes `-W`.**

**Precedence, highest first:** `-M` → explicit role flag → plan-header roster → `model_recommendations.md` → built-in defaults.

### 📋 Copy/Paste Command Block *(2026-08-01)*

`/wbWork` and `/wbPlan` now print, directly below the `## 🌊 Next Executable Sequence` table, a fenced block of the same commands as **bare runnable lines** — no table markup, no `<br>`, no `*(⏱️ N min)*` annotations, execution order, dispatchable rows only. The matrix is for reading; this block is for running.

---

## 🚀 Key Innovations & New Features

### 1. Local Subshell Output-Error Guarding (`.wb/bin/wbRun`)
- **Zero Global Dependencies**: Sits locally at `.wb/bin/wbRun` within the workspace directory without requiring shell alias modifications or global `~/.bashrc` edits.
- **Stdout & Stderr Error Inspection**: Unlike standard `||` shell fallback chaining (which only checks exit code `? != 0`), `wbRun` inspects subshell output text for fatal strings (e.g. `"Error: Insufficient credits..."`, `"Error:"`).
- **Visual Banners & Fallbacks**: Displays clean, high-visibility terminal banners (`▶ Executing: <cmd>`) and automatically fails over to the next model in the `||` chain upon error detection.
- **Native Wave Integration**: Updated `bin/wave.js` to automatically wrap all background worker dispatches with `.wb/bin/wbRun`.

---

### 2. Wave Execution Engine & Autonomous Auto-Pilot (`bin/wave.js`)
- **Wave Orchestration Mode (`--wave=<label>`)**: Converts the plan's `## 🌊 Next Executable Sequence` DAG matrix into collision-free parallel background worker dispatches (`wave_A.sh`).
- **Autonomous Flag (`--yes` / `-y`)**: Non-interactive mode for `wbWork` and `wbPlan`. Auto-resolves plan ambiguities and held choices using orchestrator recommendations, immediately spawning wave execution scripts without pausing for user confirmation.
- **Pre-Flight Explanation Blueprint (`--as="<style>"`)**: Executes `/wbExplain` blueprint generation before task execution, creating `task_<i>_details_*.md` artifacts and linking them in the `🔗 Details` column.

---

### 3. Per-Role Model Override Flags
Dynamic CLI flags introduced across `/wbWork`, `/wbPlan`, and `/wbModel`:
- **`--planner="<models>"` (`-p`)**: Set/override **Planner** model fallback chain (`1st,2nd`).
- **`--validator="<models>"` (`-v`)**: Set/override **Validator** model fallback chain (`1st,2nd`).
- **`--worker="<models>"` (`-w`)**: Set/override **Worker** model fallback chain (`1st,2nd`) (e.g. `--worker="DeepSeek V4 Pro,Kimi K3"`).
- **`--mechanical="<models>"` (`-m`)**: Set/override **Mechanical** helper model fallback chain (`1st,2nd`).

---

### 4. Plan Model Roster Header Persistence & Matrix Auto-Correction
- **Header Metadata Block**: When generating or updating a plan file, `wb-flow` writes/embeds the configured model roster block under `## 🌊 Next Executable Sequence`:
  ```markdown
  ## 🌊 Next Executable Sequence

  > **Active Model Roster for this Plan:**
  > 🧠 **Planner:** `Claude Opus 5`
  > ✅ **Validator:** `DeepSeek V4 Pro`
  > 🔨 **Worker:** `DeepSeek V4 Pro || Kimi K3`
  > 📋 **Mechanical:** `Gemini 3 Flash`
  ```
- **Matrix Auto-Correction**: If a target plan file is missing the `## 🌊 Next Executable Sequence` matrix section, `/wbPlan` and `/wbWork` automatically repair and generate the wave matrix section before execution.

---

### 5. `/{cmd}` Command Catalog Expansion & 9-File Documentation Suite
- **Added `/wbModel` Command**: Command for viewing and overriding role model rosters (`/wbModel --validator="DSV4 pro"`).
- **Standardized Documentation Suites**: Every command directory under `docs/commands/wb<Command>/` now features the complete **9-file documentation suite** (306 files total):
  1. `README.md` — Hub & Overview
  2. `wb<Command>.md` — Specification & Syntax
  3. `wb<Command>_eli5.md` — Plain-language ELI5 Guide
  4. `wb<Command>_examples_part1.md` — Standard Examples
  5. `wb<Command>_examples_part2.md` — Advanced Dispatches & Role Overrides
  6. `wb<Command>_exhaustive_simulation.md` — Execution Simulation & Traces
  7. `wb<Command>_expert.md` — Architecture & Subshell Guarding
  8. `wb<Command>_live_demo.md` — Terminal Logs & Banners
  9. `wb<Command>_practical.md` — Production Recipes & CI/CD Workflows

---

### 6. ~80% Context Window Token Reduction
- Offloading mechanical and worker tasks to background sub-agent subshells preserves Claude Pro context window memory.
- Claude context reads compact markdown task reports (`task_report.md`), reducing token usage by ~80% while preserving high-level architectural focus.

---

### 7. Six `wb-flow` CLI Subcommands *(2026-08-01—2026-08-03)*

`wb-flow` ships six native subcommands that operate on plan files, model rosters, and the wave execution engine directly — no `/` prefix, no AI context needed:

| Subcommand | Purpose |
|---|---|
| `wb-flow init <dir>` | Initialize a project with the 33 command templates, `model_recommendations.md`, and a wrapper scaffold. Read-only preview with `--dry --json`. |
| `wb-flow model <scope>` | Read or write the role-model roster. View the active chain with no flags; set any role with `--planner="…"`, `--worker="…"`, etc. Persists to `templates/commands/model_recommendations.md`. |
| `wb-flow wave <plan> --wave=A --list` | Preview the wave routing (one line per cell: lane, CLI, model, reason) before spawning. `--summary` streams only `▶ / G1 / G2 / G3 / VERDICT / PER-ID` lines per cell — full logs are `tee`'d to `tasks/…/` and a per-wave log directory. |
| `wb-flow watch` | Monitor running wave executions. Lists cells by state (`✅ done`, `🔄 running`, `⚠️ ENDED`) with progress bars, ETA, and `OVER est` detection. `-1` exits after one cycle; `--run=<dir>` targets a specific log directory. |
| `wb-flow snap <plan>` | Freeze the current state into `.wb/snaps/<YYYYMMDD>_<label>/`. `--copy` copies the content; default is a symlink. Pinned runs survive plan recomputes. |
| `wb-flow next <plan>` | Print what to dispatch next — the wave inventory, ordered command list, and the `▶️ How to run this plan` block. Shells out to `wb-flow next --embed` to update the plan's own derived-state block in place. |

**`--summary` (wave mode only).** Passed through to `wb-flow wave`, it keeps every cell's full transcript in its log file but streams only the decision lines (`▶ / G1 / G2 / G3 / VERDICT / PER-ID`) into the orchestrator's context. Measured on a real 10-cell wave: 63,002 tokens when unsummarised, of which none changed a single Done box. Drop the flag only to debug one cell.

**`--sessions` (wave mode only).** Reuses one warm opencode session per (scope, model), resumed **and forked** so parallel cells don't share a conversation. Off by default: a resumed session replays its history, trading a cold re-read for a growing transcript. Measure with `opencode stats --days 1 --models` before adopting it. **Until bug 5 is fixed (session key omits the plan), `--sessions` is unsafe in any scope holding more than one plan.**

### 8. The Three-Gate Wave Correctness Contract *(2026-08-03)*

Every wave cell is classified by **three gates**, never by output text alone. A `/wbWork` log can legitimately contain `Error:` a dozen times — and an unusable model can exit 0 having done nothing. Neither is a reliable signal on its own.

| Gate | Question | Signal |
|---|---|---|
| **1 · Infra** | Did the agent run at all? | CLI exit code + anchored fatal patterns (`^Error: Model not found`, rate limit, quota, authentication) |
| **2 · Artifact** | Did it write what it was required to write? | The task report (`tasks/task_<ID>/task_<ID>_report_*.md`) exists |
| **3 · Oracle** | Does the task's own `Verify` command pass? | Run the row's Verify cell; exit 0 = pass |

| G1 | G2 | G3 | Verdict | Done box |
|---|---|---|---|---|
| ✗ | — | — | **INFRA** — never ran | `⬜` |
| ✓ | ✗ | — | **NO-OP** — ran, produced nothing | `⬜` |
| ✓ | ✓ | ✗ | **ATTEMPTED** — needs a validator or the user | `⬜` |
| ✓ | ✓ | ✓ | **DONE** | `✅` |

**Output string-matching is forbidden as a success signal.** A bug in the identical guard (unanchored `grep -qi "error:"`) once classified its own fix as a failure. On 2026-07-31, of four cells the old harness called "failed", three had done nothing and one had fully succeeded. The three-gate rule makes that outcome impossible — no gate inspects the log text for `Error:`.

---

### 9. Catalog-Authoritative Model Routing *(2026-08-14)*

`models.json` groups every model under a `{ provider, pool }` entry — but nothing read it. Routing was re-derived from the slug string in three places, each guarded by `slug.indexOf('/') === -1 && CODEX_ONLY.test(tail)`. Every **namespaced** catalog entry failed that guard and fell through to `opencode`, which cannot bill it:

```bash
codex  exec -m gpt-5.6-terra "hi. how are you?"                 # → answers instantly
claude -p --model claude-opus-5 --permission-mode auto "hi…"    # → answers instantly
opencode run -m openai/gpt-5.6-terra                            # → ❌ Insufficient balance
```

So `wb-flow model --probe --all` reported **"Insufficient balance"** for every Anthropic and OpenAI model in the catalog — a phantom billing failure that was really a misroute. It was never probe-only: `dispatchFor`, `laneOf` and `wave_router.cliFor` carried the same guard, so a *selected* model would also have been dispatched to the wrong CLI in a live wave.

- **`bin/cli_registry.js`** — one table mapping `provider → CLI` and `CLI → argv`, imported by both the picker/probe and the wave dispatcher. A model can no longer be probed through one CLI and dispatched through another.
- Native CLIs receive the **bare** model name; only `opencode` keeps the namespaced slug.
- Uncatalogued slugs fall back to the old heuristics, and the probe marks them `?` so a guessed route stays attributable.

| `provider` | CLI | Model argument |
|---|---|---|
| `anthropic` | `claude` | bare — `claude-opus-5` |
| `openai` | `codex` | bare — `gpt-5.6-terra` |
| `antigravity` | `agy` | bare — `gemini-3.1-pro-high` |
| `google` | `gemini` | bare |
| `github-copilot` | `copilot` | `--model auto` |
| `openrouter` · `opencode-go` · `opencode-zen` | `opencode` | namespaced |

---

### 10. Filtered, Role-Grouped Catalog Probing *(2026-08-14)*

`--probe --all` used to stream all 36 catalog models, failures included, in catalog order. It now buffers, groups reachable models by role, and hides the noise — with filters so you stop paying for probes you did not ask for.

| Form | Probes | Output |
|---|---|---|
| `--all` | whole catalog | reachable only, grouped by role |
| `--all=raw` | whole catalog | everything streamed, failures included *(pre-1.0.2 behaviour)* |
| `--all=<provider>` | one provider | grouped by role |
| `--all=<role>` | one role | grouped by role |

```
   MODEL                          PROVIDER                CLI
   ✅ openai/gpt-5.6-terra        openai/chatgpt          codex
   ✅ gemini-3.1-pro-high         antigravity/google-one  agy
   ⚠️  gpt-oss-120b-medium         antigravity/google-one  agy  — substituted: using Gemini 3.1 Pro
   ❌ opencode-go/deepseek-v4-pro opencode-go/opencode-go opencode  — (no valid probe response)
```

- **Provider and CLI are now named on every line.** A bare `gemini-3.6-flash-high` reads as Google's API but is Antigravity over `agy` on a `google-one` pool; `claude-opus-4-6-thinking` is Anthropic-branded yet Google-billed. Without the columns, a misroute is indistinguishable from a billing failure.
- **New `⚠️ substituted` state** for a provider that silently answers as a *different* model. These are excluded from the reachable count instead of being scored ✅ or ❌ — a model that can never be dispatched must not enter the roster.
- **Both `--probe` paths behave identically.** `--all` was implemented twice, once under `--pick` and once without, and the two drifted: the headless path ignored every filter *and* the catalog routing. Both now share one `selectProbeTargets()`.

---

## 📊 Feature Comparison Matrix: v1.0.1 vs. Next (v1.0.2)

| Feature / Subsystem | `v1.0.1` | `next` (v1.0.2) |
|---|---|---|
| **Subshell Error Guarding** | Basic Exit Code check (`? != 0`) | Output-Inspected Guarding via `.wb/bin/wbRun` |
| **Wave Script Generation** | Manual / Interactive confirmation | Automated with Autonomous `-y` / `--yes` Flag |
| **Per-Role Model Overrides** | Fixed table in `model_recommendations.md` | Dynamic CLI flags (`--planner`, `--worker`, etc.) |
| **Plan Model Header** | Implicit / Untracked | Embedded `> **Active Model Roster**` Block |
| **Model → CLI routing** | Re-derived from the slug; namespaced entries fell to `opencode` | Catalog-authoritative via `bin/cli_registry.js`, shared by probe + dispatch |
| **`--probe --all` output** | Every model streamed in catalog order, failures included | Grouped by role, unreachable hidden; `--all=raw` restores the stream |
| **Probe filtering** | None — always the whole catalog | `--all=<provider>` / `--all=<role>` |
| **Probe attribution** | Model name only | Model + provider + pool + CLI, with `?` for guessed routes |
| **Silent model substitution** | Reported as a plain ❌ | Distinct `⚠️ substituted`, excluded from the reachable count |
| **Matrix Auto-Correction** | Manual creation required | Auto-generated if missing on `/wbPlan` / `/wbWork` |
| **Command Catalog Count** | 33 commands | 33 commands (added `/wbModel`, removed `/wbLog`) |
| **Docs Structure per Command** | Non-uniform (3-7 files) | Uniform 9-File Documentation Suite (306 files) |
| **`wb-flow` CLI Subcommands** | `init` only | Seven: `init`, `model`, `wave`, `watch`, `snap`, `next`, `archive` |
| **Report tree hygiene** | Every day's file kept forever in `reports/` — N decoys per category | Consolidate into one live file, `--archive` retires the rest to `archives/` at identical depth |
| **Plan file weight** | Wave notes inline; how-to-run adrift from its matrix | Notes externalized to `tasks/waves.md`; how-to-run directly beneath the matrix |
| **Parallel dispatch** | One command per id — same model re-reads context N times | Multi-ID merged dispatches (`--id=5,6`) with per-ID gating preserved |
| **`--wave=A`** | Work row only; validation a separate decision | Dual-pass — `A.work` then `A.valid`, a wave is a complete unit |
| **`--wave=` -M requirement** | Required `-M=` like individual dispatches | Exempt from `-M=` requirement (runs whole row, model from matrix) |
| **`--summary` (wave mode)** | N/A — every cell's full 16k-token log streamed inline | Decision-only stream per cell; full logs `tee`'d to `tasks/` |
| **`--sessions` (wave mode)** | N/A | Warm session reuse per (scope, model), forked for parallelism |
| **Wave Correctness Gating** | Output-text grep — false negatives and false positives routine | Three-gate contract (Infra / Artifact / Oracle) — output never a signal |
| **Task table scoping** | Unrelated tables could inflate T/D/V counts | Counts (T/D/V) are scoped strictly to the task table |
| **`wb-flow lint` scope** | Single files only | `wb-flow lint --all [<scope-dir>]` sweeps every plan, exits non-zero if current-format fails |
| **`wb-flow lint` step 4** | Scans all prose for dispatch commands | Scans for dispatch commands only inside FENCED CODE BLOCKS |
| **`sync_check` empty table** | Guessed 'all rows closed' (called it finished) | Refuses: '✗ SYNC: no task rows parsed — refusing to judge completeness' |
| **`sync_check` check #6** | Unenforced narrative | 'Status is …' must agree with table; What's Next bullet may not name a done+validated row |
| **`wb-flow next --embed`** | Handled closed plans differently | Emits the four '#### N.' scenario headings and '### Recommended...' section even for a fully closed plan |


### ⏱️ Wave Execution Session Tracking (`/wbTrack`)
Whenever `/wbWork` or `/wbPlan` is executed with the `--wave=<label>` flag, the execution pipeline automatically wraps the wave dispatches with session tracking:

```bash
# Executing /wbWork <path_scope> --wave=A follows this sequence:
1. /wbTrack <path_scope>   # Starts/joins today's session tracking log
2. wave_A.sh dispatches     # Executes parallel wave tasks
3. /wbTrack --stop          # Stops and finalizes session tracking log
```


### 🚀 Next Wave Execution Command Suggestions
Below the `## 🌊 Next Executable Sequence` matrix and Wave notes, `/wbPlan` and `/wbWork` output a dedicated recommendation block calculating total estimated duration (`Est. Time`) and offering ready-to-run CLI commands tailored for time and cost considerations:

- **Option 1 (Next Wave)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A -y"`
- **Option 2 (With `--as`)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A --as="expert,steps" -y"`
- **Option 3 (All Waves)**: `.wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=all -y"`

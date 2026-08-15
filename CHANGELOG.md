# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-08-14

### Added — orchestrator rules and token-budget guidance

New `docs/concepts/orchestrator_and_tokens.md`, registered in the concepts index and the site sidebar,
cross-linked from `wbWork/README.md` and `model-fallback-chains.md`:

- **Who may root a run.** Claude Code, because two checks in `bin/wave.js` ask *"is it Claude?"* rather
  than *"is it the orchestrator?"* — the 🧠 Planner lane runs in-session, and validation of non-Claude
  work also routes in-session, which inverts into self-validation when the root executed the row. Plus
  the mechanical limit: only `claude` and `opencode` expand `/wb*` at all, so an `agy` or `codex`
  terminal reads the command as literal text.
- **A temporary fallback when Claude is limited** — drop a Claude tier first; if unavailable, root on
  `codex` with the template inlined (`< /dev/null` required), using a big thinker that does **not**
  also appear in the roster as a leaf executor.
- **Token budget for the root**, ordered by evidence: `--summary` (measured — 63,002 tokens on one
  10-cell wave), task reports over transcripts (the ~80% figure), then merged dispatches, leaf
  delegation, `--list`/`--print` previews, narrowing with `--wave=A:W`, skipping `--as`, and
  `--sessions` — which replays session history and is **not** automatically cheaper.
- A closing table separating what is **measured** from what is **structural reasoning**, so the two are
  not read as equally certain.

### Added — `wave --list` reports the roster in effect

`wb-flow wave <plan.md> --wave=<L> --list` now prints, above the per-cell routing:

- **`📋 Roster in effect:`** — the absolute path of the `model_recommendations.md` the wave resolved
- the **full chain per role**, so `model1 || model2 || model3` is visible without diffing files by hand
- a per-cell `fallback:` line whenever a cell has more than one model

Previously `--list` showed only each cell's *first* model and never named the file it came from, so
there was no way to answer "which models are set for each role" without reading candidate roster files
manually.

**Documented alongside it: `wb-flow model --show` and `wave` can report different rosters.** `--show`
takes the first roster file found in the current directory; `wave` takes the most recently written one
across the package root, repo root and `~/.wb-flow/`. Running `--show` inside a sub-package that carries
its own older roster reports that stale file while the wave dispatches from the fresher one — observed
2026-08-14 naming completely different planner chains. `wave --list` is authoritative for wave dispatch;
the divergence is documented rather than unified because `--show` shares its resolver with the **write**
path used by `--pick`, so changing it would move where the roster is saved.

### Changed — `--pick --probe --all` pre-selects from the probe, one tier per model

Step 1 used to pre-check whatever `proposeRoster()` derived from CLI *detection*, which knows a model is
credentialed but not whether it answers. When a probe has run its result now drives the defaults: the
models listed under a role become that role's pre-checked chain.

- **Service tiers collapse to one entry, preferring `-high`.** `gemini-3.6-flash-{high,medium,low}` is
  one model at three tiers; offering all three as fallback links is a chain of one model wearing three
  hats. Different releases are unaffected — `gemini-3.6-flash-high` and `gemini-3.5-flash-high` both
  remain eligible. Non-tier suffixes (`-thinking`) and `(auto)` sentinels are untouched.
- ❌ unreachable, ⚠️ substituted, and models outside the Step 0 subscriptions are never pre-checked.
- Chains are topped up to span more than one billing pool. `pickForRole()` only returns models matched
  by a `ROLE_PREFERENCE` pattern, so a reachable model nobody wrote a pattern for was dropped entirely —
  observed collapsing a worker chain onto a single pool while `Antigravity (auto)` sat reachable and
  unused.

### Fixed — `--wave` ignored the roster you had just picked

`wb-flow model --pick` writes `selected.json` and `commands/model_recommendations.md` into the **current
directory's** `.wb/`. `resolveModelsFromRoster()` then took the *first* candidate root that happened to
hold a roster file, so a scope carrying an older roster of its own shadowed the fresh one by position
alone. Measured 2026-08-14: a plan inside `next/core` resolved core's 08-02 roster
(`Claude (auto)` → `claude-opus-4-6-thinking` → `kimi-k3`) while `selected.json` and the repo roster,
both written 08-13, said `Codex (auto)` → `gemini-3.1-pro-high`. Every wave dispatched to models the
user had not chosen, silently.

- Across candidate roots the **freshest** roster now wins, not the first found.
- **Within** a root the order is unchanged and still deliberate: `.wb/commands/` (your install) outranks
  `templates/commands/` (the neutral shipped seed), regardless of mtime.
- A plan's own `> **Active Model Roster for this Plan:**` header still overrides both — explicit beats
  implicit.
- Verified end to end: the resolved `planner`/`validator`/`worker`/`mechanical` chains now match
  `selected.json` exactly, in order.

### Added — documentation for the three model files

`models.json` (the shipped catalog), `selected.json` (your picked roster) and
`commands/model_recommendations.md` (what the dispatcher reads) are now documented together, including
their resolution order, how to hand-edit each, and why the `provider` field — not the model name —
decides the CLI. Added to `wbModel/README.md`, `wbModel.md` and the picker tutorial, in both the package
docs and the published site.

### Fixed — model→CLI routing read the slug instead of the catalog

`models.json` groups every model under a `{ provider, pool }` entry, but routing was
re-derived from the slug string in three separate places, each guarded by
`slug.indexOf('/') === -1 && CODEX_ONLY.test(tail)`. Every namespaced catalog entry
failed that guard and fell through to `opencode`, which cannot bill them — so
`wb-flow model --probe --all` reported **"Insufficient balance"** for models that
answer instantly under their own CLI:

```
codex  exec -m gpt-5.6-terra "hi. how are you?"               → answers
claude -p --model claude-opus-5 --permission-mode auto "…"    → answers
opencode run -m openai/gpt-5.6-terra                          → Insufficient balance
```

It was never a probe-only bug: `dispatchFor`, `laneOf` and `wave_router.cliFor`
carried the same guard, so a *selected* model would also have been dispatched
through the wrong CLI in real waves.

- **New `bin/cli_registry.js`** — one table mapping provider → CLI and CLI → argv,
  imported by both the picker/probe (`bin/model.js`) and the wave dispatcher
  (`bin/wave_router.js`). A model can no longer be probed through one CLI and
  dispatched through another.
- Covers `anthropic` → `claude`, `openai` → `codex`, `antigravity` → `agy`,
  `google` → `gemini`, `github-copilot` → `copilot`, and `openrouter` /
  `opencode-go` / `opencode-zen` → `opencode`. Native CLIs receive the **bare**
  model name; only opencode keeps the namespaced slug.
- Slugs absent from the catalog fall back to the previous regex heuristics, and the
  probe output marks them with `?` so a guessed route is attributable.

### Added — `wb-flow model --probe --all[=<what>]`

| Form | Probes | Output |
|---|---|---|
| `--all` | whole catalog | reachable only, grouped by role |
| `--all=raw` | whole catalog | everything streamed, failures included (pre-1.0.2 behaviour) |
| `--all=<provider>` | one provider | grouped by role |
| `--all=<role>` | one role | grouped by role |

- Probe output now names the **provider, pool and CLI** for every model. A bare
  `gemini-3.6-flash-high` reads as Google's API but is Antigravity over `agy` on a
  `google-one` pool, and `claude-opus-4-6-thinking` is Anthropic-branded yet
  Google-billed — a misroute was previously indistinguishable from a billing failure.
- New `⚠️ substituted` state for a provider that silently answers as a *different*
  model (observed: `gpt-oss-120b-medium` answering as Gemini 3.1 Pro). These are
  excluded from the reachable count rather than being reported as ✅ or ❌.
- `--all` was implemented twice — once under `--pick`, once without — and the two
  drifted. Both now share one `selectProbeTargets()`, so the headless path honours
  the filters and the catalog routing it previously ignored.

### Added — generated invocation matrix

`templates/commands/model_reference_manual.md` gained an **Invocation matrix**
section generated from `bin/cli_registry.js` by `node bin/gen_cli_matrix.js --write`,
covering every provider in bash, python and node. `--check` runs first in `npm test`,
so the manual cannot drift from the dispatcher. Example prompts throughout the manual
are now `hi. how are you?` rather than `<prompt>`.


### `wb-flow lint --all` — corpus sweep mode

Added a `--all [<scope-dir>]` flag to `wb-flow lint`. It walks the plan tree, skipping any plans inside `tasks/` directories, and runs all static analysis checks against every plan it finds. Reports a one-line pass/fail verdict per plan and a summary at the end. Older plans missing the v5 `Task Table` structure are explicitly marked `SKIPPED` instead of failing the sweep, making it safe for CI.

### `wb-flow lint` — discoverable plan validation

`wb-flow lint` is now advertised in `--help`, unknown subcommand errors, and documentation. It runs static analysis checks on plan files to catch structural and data consistency errors.

### `wb-flow archive` — one live file per category

A scope worked for a month accumulates thirty plan files, of which one is live. Every other is a
decoy: open the wrong one and you work from a backlog closed a week ago. The daily-history commands
now have a two-half answer, and **the order between the halves is the whole safety story**.

| Half | What it does | Trigger |
|---|---|---|
| **Consolidate** | absorb every still-open item from older files of this category into today's file, then repair its structure and links | passing an existing output file with no other flags |
| **Archive** | move the now-superseded `<DD>/<category>/` folders into `.wb/workflows/archives/` | `--archive`, never implied |

```bash
/wbPlan  <plan_file.md>            # consolidate: absorb every older open task, repair in place
/wbPlan  <plan_file.md> --archive  # …then retire the plan folders it just emptied
/wbAudit <audit_file.md> --archive # same shape for audits, reviews, ideas, visions, …
/wbStandup <monorepo-root>/ --archive   # fleet-wide: one live file per category, per scope
```

**Consolidate always runs before archive.** Archiving first does not delete an open task — it makes
it invisible: nothing live references it, and the next `/wbStandup` no longer scans the tree it sits
in. That is why archiving is opt-in rather than automatic, and why a failed consolidation aborts the
sweep.

Three properties of the archive tree, each load-bearing:

- **Same depth as `reports/`.** `archives/<YYYY>/<MM>/<DD>/<category>/` mirrors the live path exactly,
  so every relative href inside a moved file that pointed at something moving with it still resolves,
  unchanged. This is the only reason the archive root sits where it does.
- **The unit is the folder, never the file.** A plan's `tasks/`, `waves/` and `explanations/` are its
  siblings; moving the `.md` alone orphans every task report it links to.
- **The original date is preserved.** A plan dated `20260807` archives to `archives/2026/08/07/`, not
  to today — the archive records when the work happened, not when someone tidied.

Each moved file is stamped with a `🗄️ ARCHIVED` banner linking to what superseded it, one row is
appended to `archives/archive_log.md`, and every move is individually reversible with
`wb-flow archive --restore=<path>`.

**`/wbStandup` and `/wbTrack` are exempt.** A standup *is* the "yesterday / today" log and a track
*is* the session narrative; both derive their value from the series, so keeping only the newest
destroys the thing that made them worth reading. `/wbStandup --archive` instead takes the inverse
role — the one command that sweeps everything *else*, across every scope, gated behind a preview and
a confirmation.

New: `bin/archive.js`, `test/archive.js` (42 assertions), `_shared/output_conventions.md` §13.
Templates must shell out to the CLI rather than hand-rolling `mv` — the same rule §11 applies to
snap symlinks, except this one moves work product.

### Fixed — scope-root link depth was wrong everywhere (`output_conventions` §1.2)

The canonical-path table gave the scope root as `../../../../../` (5 up), derived from arithmetic
that mis-read its own depth diagram: the `7` in that diagram numbers the **file**, not its directory.
There are seven directories between a report file and its scope root. Every `context.md` / `dev.md` /
`package.json` link written from the old row lands two levels short.

Corrected in the §1.2 table, in §1.1's tooltip example, in the §5 footer example, and in the 15
command templates that had copied it. A self-correct pass must now rewrite these hrefs rather than
"verify" them by reproducing the old arithmetic.



### `wb-flow wave` — the three-gate verdict contract

Every dispatched cell is now classified by three gates — never by its output text. A wave cell whose
task is *about* error handling legitimately contains `Error:` and `failed`, so output string-matching
is not a success signal.

| Gate | Question | Signal |
|---|---|---|
| **1 · Infra** | did the agent run at all? | CLI exit code, plus anchored fatal patterns |
| **2 · Artifact** | did it write what it was required to write? | task report file exists |
| **3 · Oracle** | does the task's own `Verify` command pass? | `exit 0` |

| G1 | G2 | G3 | Verdict |
|---|---|---|---|
| ✗ | — | — | **INFRA** — never ran |
| ✓ | ✗ | — | **NO-OP** — ran, produced nothing |
| ✓ | ✓ | ✗ | **ATTEMPTED** — needs a validator |
| ✓ | ✓ | ✓ | **DONE** |

#### 🐛 Fixed

- **G2 could never pass.** The artifact check emitted `ls 'tasks/task_3/task_3_report_*.md'`
  — fully quoted, so the shell passed a literal `*` to `ls` instead of globbing.
  Every gated dispatch was classified `NO-OP` regardless of what the agent wrote.
  The `*` now sits outside the quotes. Covered by a test that runs the emitted
  `ls` against a real report file, not just `bash -n`.
- **The wave died at line 15 when `wbRun` was absent.** The "not installed"
  warning interpolated `$WB_RUN` under `set -u`, aborting the whole script
  before a single cell spawned. The `$` is escaped now.
- **G2/G3 gated only `ids[0]`.** A merged dispatch (`--id=3,8` — one agent over
  several rows, paying the start-up context once) checked the first id's report,
  ran the first id's `Verify` oracle, and let every later id land `DONE`
  unverified.

#### 🔌 Added — agent routing

- **`agy` is now a first-class dispatch lane.** `buildScript` emitted `opencode run`
  for every spawned cell, so an `agy` model resolved and then died at G1 with
  `Model not found` — and the code merely *warned* about it. New `cliFor(model)`
  picks the CLI from the slug shape and emits agy's real syntax:
  `agy -p --model <name> --dangerously-skip-permissions '<slash-command>'`
  (agy has no `--command` flag; the invocation rides in the prompt).
  - `--dangerously-skip-permissions` is **mandatory** on that lane: without it
    headless agy auto-denies every tool and returns *empty output with exit 0* —
    a silent success that did nothing.
  - `AGY_ONLY_SLUGS` widened from 3 hand-picked names to the full 11-model
    `agy models` roster.
  - A **prefixed** slug is never agy: `opencode/claude-sonnet-4-6` and the bare
    agy `claude-sonnet-4-6` are different providers serving a same-named model.
  - `--list` now names the real CLI instead of hardcoding `opencode`.
  - `wb-flow model --detect` merges `agy models` into the candidate pool, and no
    longer excludes agy by default.
  - Context: on 2026-08-02 `opencode-go` timed out and `opencode` returned
    `Insufficient balance` — **agy was the only working delegated executor**, and
    the generator could not dispatch it.

#### 🔌 Added — `wb-flow model`

- **`wb-flow model`** — a new subcommand, and the **single writer** of
  `commands/model_recommendations.md`. `wb-flow init` and `/wbModel` both route
  through it, so the roster has one implementation instead of three that drift.
  - `--detect` derives a roster from the CLIs you actually have **credentialed**
    (`opencode providers list` + `opencode models`, `agy models`, `claude`).
  - `--set <role>=<slug>`, `--probe`, `--json`, `--dry-run`, `--file=`.
  - `--probe` is the only check that proves a model answers. Catalogued *and*
    credentialed still does not imply reachable — on 2026-08-02 every
    `opencode-go/*` inference probe timed out at 150 s while the catalog
    answered instantly. Off by default: it dispatches real calls.
  - Ranking is pattern-based, newest-version-first, and family-collapsed, so a
    three-slot fallback chain can't fill up with `sonnet-4`, `sonnet-4-5` and
    `sonnet-4-6`. Worker/Mechanical lead with the cheap tier by design; an
    in-session lead (`Claude (auto)`) gets **non-Claude** escapes, or the chain
    has no fallback. `agy`-only and aliased (`~`) slugs are never offered —
    `wave` spawns with `opencode run` and cannot dispatch them.
- **`wb-flow model --pick` (`-i`)** — interactive picker. Lists what *this
  machine* detected, annotated with **billing pool** and probe result, and asks
  you to rank up to 3 per role. Enter keeps the suggested chain, so it is a
  review step rather than data entry; out-of-range input falls back to the
  suggestion rather than writing an empty roster; a non-TTY refuses with a
  pointer to `--detect` / `--set` instead of hanging.
  - The list is built from **detection, never from `model_reference_manual.md`**
    — that file is hand-maintained and goes stale (`wb-flow-pro` still ships
    `opencode-go/qwen-3.7-plus`, a slug that has never existed). A picker driven
    by a stale list offers models you cannot reach.
  - The **pool column is the point**: it makes visible that picking `1,2,3` can
    be three names for one point of failure. A same-pool chain warns rather than
    blocks — sometimes you do want it.
  - `wb-flow init` now offers it from its roster step (`Customize the picks?`).
- **`bin/prompt.js`** — the readline prompter extracted from `init.js` so `init`
  and `model` ask questions through one implementation instead of two copies
  that drift. Keeps the Ctrl-D handling that stops a closed stdin looking like
  a silent success.
- **`wb-flow model --reset`** — alias for `--detect`. The shipped roster is
  neutral by design, so there is no packaged baseline to restore *to*; a reset
  re-derives from what the machine can actually reach. `/wbModel --reset` updated
  to match (it previously promised a restore from a `The Logic` section that the
  neutral default no longer carries).
- **`templates/commands/model_reference_manual.md`** — the pre-neutralization
  roster restored as a **human** bench reference: `The Logic` baseline, Annexes
  A–E, verified per-CLI syntax, and a measured provider-status table. Nothing
  reads it automatically.
- **`wb-flow init` now fills the roster.** New step: detect → propose → confirm →
  write, with an optional probe. A fresh install seeds from the neutral default.
- **`templates/commands/model_recommendations.default.md`** — a provider-neutral
  shipped roster that names no models.
- **`bin/verify-roster.js`** — prepublish guard (wired into `prepublishOnly`, not
  `npm test`). Publishing a populated roster hands every user the packager's own
  subscriptions; that failure is invisible at install and surfaces much later as
  a wave cell dying at G1. The guard refuses the publish and prints the fix.

#### 🔌 Added — `wb-flow wave --summary`

- **`wb-flow wave --summary`** — stream only the decision lines (`▶` dispatch
  marker, `G1/G2/G3`, `VERDICT`, `PER-ID`, `session`) to the terminal. Each
  cell's full output still goes to its log file via `tee`; only what reaches the
  orchestrator's context is filtered. Measured on a real 10-cell validation wave
  in this repo: **63,002 tokens streamed**, of which one cell alone was 16,824 —
  `ls -la` dumps, ANSI escapes and file reads that no Done box depends on.
  - The filter is `grep --line-buffered`, so a wave still reports as it runs.
  - Wrapped in `|| true` so grep can never set the pipeline's exit status —
    under `set -o pipefail` a non-matching grep would otherwise mark a passing
    cell failed. Verified: exit codes and ❌ counts are identical in both modes.

#### 🔌 Added — `wb-flow wave --sessions`

- **`wb-flow wave --sessions`** — reuse one opencode session per (scope, model,
  plan) so a dispatch skips the cold re-read of its command template and scope
  files. Ids live beside the wave logs in
  `.wb/workflows/reports/waves/sessions/<key>.id` (override:
  `WB_WAVE_SESSION_DIR`), outliving any single timestamped run.
  - A saved session is **resumed and forked** (`-s <id> --fork`). Cells in a
    wave run concurrently, and N cells appending to one conversation would
    interleave their messages; forking gives each its own branch off the warm
    base.
  - A cold dispatch is tagged with `--title <key>` and its id resolved
    afterwards **by that title** — "the newest session" is not reliably this
    cell's when four are starting at once. Requires `jq`; its absence is
    reported, not swallowed.
  - **Opt-in on purpose.** Resuming replays the whole conversation as input, so
    it is not automatically cheaper than re-reading — it trades a re-read for a
    growing history. Measure a wave both ways with `opencode stats --days 1`
    before making it habit.

#### 🔌 Added — `wb-flow watch`

- **`wb-flow watch`** — live status of the cells a wave left running in the
  background. Renders per-cell progress as a share of the plan's own
  `Est. Time (mins)` column, and marks a cell `OVER est Nm by Mm` once it passes
  that budget — **that**, not raw elapsed time, is what separates *slow* from
  *hung*. Liveness is read from the process table (`pgrep`), never from log
  mtime alone: agents buffer while composing, so an idle log does not mean a
  dead cell. Three states, never two — `✅/❌` finished, `🔄` running,
  `⚠️ ENDED` for a cell with no verdict **and** no process (killed or crashed).
  `-1` for a one-shot snapshot, `--list` for past runs, `--run=` to pick one.
  Covered by a dedicated test suite (`test/watch.js`).

#### 🐛 Fixed — five wave.js harness bugs

Measured in a real 2026-08-02 session where 7 of 11 spawned cells were
misclassified by the harness:

- **Pipeline PID** — `PIDS+=($!)` after `... \| tee \| grep &` captured the
  **grep**, not the agent. `--summary` and `wait` returned before agents
  finished, so the wave reported "all cells finished" while cells still ran.
- **Oracle cwd** — G3 verify cells use paths relative to the plan file, but the
  script `cd`'d to the repo root first. Every oracle escaped the plan tree,
  producing 7 false negatives (`exit 2` from the wrong directory, `exit 0` from
  the right one).
- **Ungated validators** — `gated = (isWbWork || isWbExplain)` excluded
  `wbValid`, so every validator cell reported `VERDICT: DONE` on G1 alone
  regardless of what it did or did not write.
- **Routing divergence** — `--list` and the generator called different routing
  functions. `--list` reported `opencode/kimi`; the emitted script ran `agy
  --model claude-opus-4-6-thinking`. Routing is now one pure function called by
  both.
- **Session key omitted the plan** — `sessionKeyFor(scope, model)` did not
  include the plan filename, so `--sessions` resumed an 08-02 conversation for
  an 08-03 dispatch: two cells executed the **wrong plan's** tasks and a third
  **overwrote a validated task report**. The plan's basename is now part of the
  session key, making `--sessions` safe in scopes holding more than one plan.

#### 🐛 Fixed — roster

- **`wave` and `model` read different roster files on every real install.**
  `parseModelRecommendations` looked in `<root>/templates/commands/` and
  `<root>/commands/` but never `<root>/.wb/commands/` — which is exactly where
  `wb-flow init` installs it and `wb-flow model` writes it. Wave silently used
  `DEFAULT_MODELS` while `wb-flow model` displayed a roster that looked live.
  `.wb/commands/` is now first, and package templates are searched **last** (the
  shipped file is a neutral seed, not a roster to route on).
- **A generated roster read as "unrecognised model".** `resolveDisplayName` only
  knew the hand-written display names (`Kimi K2.7 Code`); `wb-flow model` writes
  dispatchable slugs (`opencode/deepseek-v4-pro`). Slugs and bare `agy` names now
  pass through untouched, so both roster dialects resolve.
- **An unconfigured roster routed on prose.** With `_not configured_` rows
  skipped, the parser never hit its break condition and walked into the *next*
  table, reading "Deep reasoning, decomposition, strategy" as a model name. The
  scan is now bounded to the first table under the heading, and an unconfigured
  roster parses as `null` so the lookup falls through to the user's real install.
- **G1 missed the whole billing family.** `INFRA_GREP_PATTERN` matched
  `Insufficient credits`, but opencode returns **`Error: Insufficient balance.`**
  Observed live on 2026-08-02: two wave cells whose agents never ran scored
  `G1: PASS` and were classified **NO-OP** ("ran, produced nothing") instead of
  **INFRA** ("never ran"). Those demand opposite responses — NO-OP means
  re-dispatch is pointless, INFRA means fix the account and re-dispatch. The
  pattern now covers `Insufficient (credits|balance|funds)` and `Payment`, with
  seven assertions including the exact observed message.
- **`parseHeaderRoster` split model lists on `/` too** — the same defect in a
  second function. A plan-header roster naming `opencode/deepseek-v4-pro`
  yielded the bare provider `"opencode"`, which resolves to nothing, so the
  whole header roster was silently discarded and the wave fell back to
  `DEFAULT_MODELS` — routing to the *unreachable* `opencode-go` tier. It now
  splits on `||` and on the ` / ` separator only. Both roster dialects parse.
- **`readRoster` split model lists on `/`**, shredding every provider-prefixed
  slug (`opencode-go/deepseek-v4-pro` → two bogus entries). It now splits on the
  ` / ` separator and drops `_italic_` placeholder cells.
- **`model_recommendations.md` rendered as garbage.** Both tables carry the bash
  fallback operator `||` inside their cells, and GFM splits table cells on any
  unescaped `|` — including inside backticks. The 4-column table parsed as 8
  cells per row, the 5-column one as 9. Pipes are now escaped (`\|\|`), and the
  file says so where an editor will see it.
- **The roster was unreachable from every scope but wb-flow itself.**
  `findPackageRoot` walks up to the nearest `.wb/`, then the roster was looked
  for at `<that>/templates/commands/model_recommendations.md` — which exists
  only in a wb-flow checkout. Every other project silently fell back to
  `DEFAULT_MODELS`, so `/wbModel` changes never reached `wb-flow wave`. The
  lookup now also tries the repo root, wb-flow's own package root, and the
  installed `~/.wb-flow/`, and accepts the installed `commands/…` layout as well
  as the source `templates/commands/…` one.
- **An `agy`-only model in the roster now warns instead of failing at G1.**
  Spawned cells are dispatched with `opencode run`; a roster naming
  `gemini-3.1-pro-high` / `gemini-3.6-flash-high` / `claude-sonnet-4-6` resolved
  cleanly and then died with `Error: Model not found`. Routing prints which role
  is affected and why.

#### 🔄 Changed

- **🧠 Planner rows are exempt from executor≠validator.** A Planner row may now
  be validated by the model that executed it, and its pairing stays in-session
  instead of being forced onto `selfValidator`. The invariant protects *edits* —
  a Planner row produces a decision, and its validation is a re-read of
  reasoning already in the orchestrator's context, so a second model there buys
  a spawn and a cold re-read rather than independence. 🔨 Worker and
  📋 Mechanical rows keep the rule with no exception. Assign a different model
  to a Planner pairing when you want an outside opinion — that is now a choice.
  (§10.2 rule 10, `wbWork`/`wbValid` templates, `bin/wave.js` `route()`.)
- **New `parseRequiresColumn(text)`** — reads the plan table's `Requires` column
  into `{id: role}`, so routing can tell a Planner row from a Worker row after
  the dispatch has left the matrix. `route()` takes it as a 6th argument.
- Merged dispatches emit a verdict **per id** plus a `PER-ID:` roll-up
  (`DONE=[3] … NO-OP=[8]`), so the orchestrator can check each row's Done box
  independently from one log. The cell exits on its worst id
  (NO-OP > ATTEMPTED > UNVERIFIED > DONE) and names which ids failed.
- A merged cell's heartbeat budget is the **sum** of its rows' `Est. Time`,
  keyed on the joined id (`3,8`) — the value `OVER est` is measured against, and
  the string `pgrep -f -- "--id=3,8"` matches.

### `wb-flow init` — assistant wiring, no longer by hand

Until now the CLI copied the command *templates* and stopped there. Registering
`/wbPlan` in an assistant was undocumented manual work — a wrapper file per
command per assistant, in each one's own format and location. `wb-flow init`
does it.

#### 🔌 Added

- **`wb-flow init`** — interactive setup (zero-dep `readline` prompts) that asks
  for a scope and which assistants to wire, then copies the templates *and*
  writes the command files.
  - **Claude Code** / **OpenCode** / **Cursor** → `<cmd>.md` with `description`
    frontmatter and `$ARGUMENTS`.
  - **Gemini CLI** → `<cmd>.toml` with `description` + `prompt` and `{{args}}`.
  - **Antigravity (`agy`)** → one `wb-flow/SKILL.md` dispatcher. Antigravity has
    no user-definable slash-commands (only Rules, Skills, Plugins, Hooks, MCP),
    so its commands are invoked in natural language: `run wbPlan on src/`.
  - Scopes: `global` copies templates to `~/.wb-flow/` and embeds absolute paths;
    `project` copies to `./.wb/` and embeds relative paths so the wiring can be
    committed and shared with a team.
  - Installed assistants are auto-detected and default to Yes.
  - Flags: `--scope=`, `--agents=` (list / `all` / `detected` / `none`),
    `--templates=`, `--yes`, `--force`, `--dry-run`, `--help`. Non-destructive by
    default; in a non-TTY `--yes` is required so CI can never hang on a prompt.
- **`bin/wrappers.js`** — the emitters as importable pure functions, driven by
  `wb_commands_reference.claude.json` (description, recommended model, real flag
  lists, `--act`/`--wbPlan` chaining). Normalizes the three different flag shapes
  the manifest uses. Alias commands (`wbStopTrack`) resolve to their target
  template.
- **`--version` / `-v`** on the main CLI.
- 40 new assertions covering the emitters and init end-to-end (dry-run writes
  nothing, both scopes, idempotent re-runs, TOML structure, non-TTY refusal,
  unknown-agent rejection). Suite: 71 → 111.

#### 🌊 Added — wave scheduling

- **`## 🌊 Next Executable Sequence`** — every plan (and audit / review / standup /
  secure / next / idea / actOn output) now ends with a **wave × role matrix**:
  rows are parallel-safe waves, columns are the four `Requires` roles, each cell
  a copy/paste command with a recommended agent and cost. Canonical spec in
  `_shared/output_conventions.md` §10; `/wbPlan` is the reference implementation
  (template v5.3).
  - **Waves come from the dependency DAG, not priority** — a P1 task with an
    unmet dependency is not in wave A.
  - **Every dispatch is auto-paired** with `/wbValid <same id>` in the next wave,
    assigned to a **different agent than the executor** (§10.2 rule 10). A model
    validating its own work is the main way a hollow pass reaches a plan file.
  - **Mandatory collision check** per parallel row, including files one cell
    writes and another reads as a fixture.
  - **The matrix is derived state** (§10.4): `/wbWork`, `/wbValid` and
    `/wbPlan --id=… --open/--def/--can` each recompute it in the same pass they
    touch a Done/Valid box. A matrix older than the last `/wbWork` run is lying.
- **`wb-flow wave <plan.md> --wave=A`** — compiles one row of the matrix into a
  bash script: one background job per cell, per-cell logs, exit code = number of
  failed cells. `--list` shows the resolved routing first; `--print` dumps the
  script without writing it. Routing: 🧠 Planner → the orchestrator in-session ·
  🔨 Worker → `opencode-go/deepseek-v4-pro` · 📋 Mechanical →
  `opencode-go/deepseek-v4-flash` · ✅ Validator → in-session, or
  `opencode-go/kimi-k2.7-code` when it pairs a row the orchestrator itself ran.
- **`/wbWork --wave=<label>`** — the orchestration mode that drives the above.
- **`--no-plan-update`** on `/wbWork` and `/wbValid` — execute and write the task
  report, but never touch the plan file. Set automatically for every spawned
  agent, because *N* parallel agents doing read-modify-write on one markdown
  table corrupts it. The orchestrator checks the boxes and recomputes the matrix
  once, after the wave settles, and only for cells that actually succeeded.

#### 🏃 Added — `wbRun` subshell error guard

- **`.wb/bin/wbRun`** — zero-dependency subshell wrapper that inspects stdout/stderr
  for fatal patterns (`^Error: Insufficient credits`, `^Error: Model not found`,
  etc.) instead of relying on exit codes alone. Displays `▶ Executing: <cmd>`
  banners and fails over to the next model in a `||` chain. Installed by
  `bin/init.js` into the consumer project's `.wb/bin/`.
- **Native wave integration** — `bin/wave.js` wraps every background worker
  dispatch with `$WB_RUN`, so a `Model not found` or credit exhaustion in any
  cell triggers fallback instead of silently succeeding on a zero exit code.

#### 🎛️ Added — per-role model override flags

- **`--planner="<models>"` / `--validator="<models>"` / `--worker="<models>"` /
  `--mechanical="<models>"`** — dynamic CLI flags on `/wbWork`, `/wbPlan`, and
  `/wbModel` that set the model fallback chain (`1st,2nd`) for each role.
  Precedence: explicit flag > plan-header roster > `model_recommendations.md` >
  `DEFAULT_MODELS`. `--list` reports the resolved source.

#### 📋 Added — plan model roster & matrix auto-correction

- **`> **Active Model Roster for this Plan:**`** header block under
  `## 🌊 Next Executable Sequence` — persists the configured model roster in
  every plan file so the wave generator resolves models from the plan itself
  before falling back to the manifest or built-in defaults.
- **Matrix auto-correction** — if a plan file is missing the
  `## 🌊 Next Executable Sequence` section, `/wbPlan` and `/wbWork` automatically
  repair/generate it before execution.

#### 🧰 Added — `/wbModel` command, 9-file documentation suite, docs-site search & Command Glossary

- **`/wbModel`** — view and override role model rosters
  (e.g. `/wbModel --validator="DSV4 pro"`). Joins the catalog as command 27.
- **Standardized 9-file documentation suite** — every command directory under
  `docs/commands/wb<Command>/` now carries the same 9-file set (README, spec,
  ELI5, examples ×2, exhaustive simulation, expert, live demo, practical):
  33 commands × 9 files = 297 doc files + 33 READMEs.
- **Docs-site search** — local search index for the `flow.wbc-ui.com`
  documentation site, built during the VitePress build and embedded in every
  page so users can search across all 297+ command docs without leaving the site.
- **Command Glossary** — a comprehensive reference covering all 33 wb-flow
  commands, their roles, and their relationships, available on the docs site and
  in the GitHub repository.

#### 🔧 Changed

- `--help` now documents the `init` subcommand and states plainly that a bare
  `wb-flow` run does **not** register slash-commands in any assistant.
- **Unknown positional arguments now error** instead of being silently ignored.
  Previously `wb-flow init` (and any typo) fell through to a plain install; that
  also meant `wb-flow --version`, which the docs recommended as a verification
  step, quietly installed templates into the current directory.

## [1.0.1] - 2026-05-14

### Official Stable Release

This release marks the transition from beta (`1.0.0-r01`) to the first official stable version. The CLI itself is unchanged — the focus is on documentation, discoverability, and developer experience.

#### 🚀 Documentation Website Launched
- **`flow.wbc-ui.com`** — Full VitePress-powered documentation site deployed.
- Per-page SEO metadata (title, description, Open Graph, Twitter Cards) for every doc page.
- Static workflow diagrams + 16 interactive Mermaid diagram equivalents embedded in GitHub docs.
- Google Analytics 4 (`G-RDGRR88KJH`) + Umami (ready) for traffic tracking.

#### 📚 GitHub Documentation Overhaul
- Added per-page frontmatter (title + description) to 60+ markdown files.
- Copied wb-flow logo and static workflow diagrams for native GitHub rendering.
- Added **Live Reports Snapshot** (`concepts/live_reports_snapshot.md`) showing real `.wb/workflows/` output.
- Added 16 Mermaid.js diagrams matching the Vue animation color palette (Plan/Work/Valid/Teal roles).
- Wrapped all diagrams in width-constrained containers for clean mobile rendering.
- Fixed 7 broken internal links; verified all 1,637 internal links clean.
- Added demo apps section with `python-etl` worked example.

#### 🔍 Analytics & SEO
- GA4 stream configured (`G-RDGRR88KJH`) for website traffic monitoring.
- SEO metadata: Open Graph, Twitter Cards, canonical URLs, favicons.
- Umami self-hosted analytics (VPS) ready for deployment alongside GA4.

#### 📋 Full Demo Apps Added
- `demo_apps/python-etl/README.md` — Complete end-to-end ETL workflow example with real `/wbAudit`, `/wbPlan`, and `/wbSetup` outputs.

## [1.0.0-r01] - 2026-05-12

### Initial Release
- **Zero-Dependency CLI:** Instant bootstrap via `npx wb-flow` without polluting your node_modules.
- **33 `wb*` Command Templates:** Full suite of workflow templates injected directly into your `.wb/` directory.
- **Multi-AI-Host Support:** Built-in parity for Claude Code, OpenCode, Gemini, and Cursor agents.
- **Ideas Pipeline:** Enforces deterministic multi-step processes via `/wbAudit` → `/wbPlan` → `/wbWork` → `/wbValid`.
- **Four Install Paths:** Supports global, local (npx), and offline/git-clone installation methods.
- **Agentic Documentation Suite:** Includes a complete 250+ file documentation system covering all 33 commands, session tracking, and workflow concepts (shipped in `docs/`).

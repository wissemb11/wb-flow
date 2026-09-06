# `wb-flow` CLI Reference Annex

The `wb-flow` command line interface acts as the backbone for the slash-command ecosystem, providing infrastructure orchestration, linting, model discovery, and archiving capabilities.

Below is a comprehensive list of all native `wb-flow` subcommands and their supported flags.

<CliCommandsAnimation />

---

## 1. `wb-flow init`
**Role:** Wires the `/wb*` slash-commands into your installed AI assistants and seeds the model roster.

| Flag | Shortcut | Description |
|---|---|---|
| `--scope=<val>` | | `global` (machine-wide) or `project` (local to `.wb/`) |
| `--agents=<val>` | | Comma-separated list of agents to wire (e.g., `claude,opencode`) |
| `--templates=<path>` | | Reuse an existing templates root directory |
| `--yes` | `-y` | Run unattended, accepting defaults |
| `--force` | `-f` | Overwrite existing wrappers/files |
| `--dry-run` | `-n` | Preview changes without writing |
| `--help` | `-h` | Show usage |

---

## 2. `wb-flow model`
**Role:** The single writer of the model roster. Pre-probes catalogs, manages default AI selections via interactive pickers, and supports `.env` credential loading.

| Flag | Shortcut | Description |
|---|---|---|
| `--pick` | `-i` | Opens an interactive tree-picker annotated with qualification badges |
| `--probe` | | Dispatches real inference calls to verify balance and reachability |
| `--all` | `-a` | Pre-probes catalog. Default orders by Role (reachable only). |
| `--all=raw` | | Streams all models as probed (including unreachable). |
| `--all=<provider>` | | Filters pre-probe to a specific provider, grouped by role (same as `--all=<role>`). |
| `--all=<role>` | | Filters pre-probe to a specific role. |
| `--detect` | `--reset` | Re-derive available models from installed CLIs |
| `--set <role>=<slug>` | | Manually set a model for a specific role (planner, worker, etc.) |
| `--timeout=<ms>` | | Max timeout for model probe requests (default 45000) |
| `--file=<path>` | | Custom output file for the roster (default `commands/model_recommendations.md`) |
| `--models=<path>` | | Custom path to the JSON catalog (`models.json`) |
| `--json` | | Print the model roster in JSON format |
| `--yes` | `-y` | Autonomous execution mode |
| `--dry-run` | `-n` | Preview changes without writing |
| `--help` | `-h` | Show usage |
> **Both `--probe` paths behave identically.** `wb-flow model --probe --all[=…]` works the same with or without `--pick`: the same catalog-authoritative routing (so `anthropic/*` probes via `claude` and `openai/*` via `codex`, not opencode) and the same filters. `--all=` with an empty value means `--all`, and an unrecognised filter reports an error rather than probing nothing.

---

## 3. `wb-flow wave`
**Role:** The wave orchestration engine. Converts a plan file's `## 🌊 Next Executable Sequence` DAG matrix into collision-free parallel background dispatches.

| Flag | Shortcut | Description |
|---|---|---|
| `--validate` | | Runs the wave in validation mode |
| `--sessions` | | Reuses one warm opencode session per model for speed |
| `--summary` | | Streams only decision lines (G1/G2/G3, VERDICT) to the terminal |
| `--no-summary` | | Streams full raw output to terminal for debugging |
| `--print` | | Prints the wave evaluation state |
| `--list` | | Dry-run the routing: prints `📋 Roster in effect:` (the resolved roster file), the full model chain per role, and the model each cell would dispatch to. Read-only — spawns nothing. **This, not `wb-flow model --show`, is authoritative for what a wave will run.** |
| `--self-test-gates` | | Internal testing flag for wave gating |
| `--self-test-oracle` | | Internal testing flag for wave oracles |
| `--help` | `-h` | Show usage |

---

## 4. `wb-flow watch`
**Role:** Live dashboard of background cells. Renders progress as a share of the plan's budget, marking cells as hung, running, or ended.

| Flag | Shortcut | Description |
|---|---|---|
| `--run=<name>` | | Watch a specific running wave |
| `--plan=<path>` | | Watch waves tied to a specific plan |
| `--interval=<sec>` | | Refresh interval in seconds (default 5) |
| `--once` | `-1` | Print a single static snapshot and exit |
| `--list` | | List the recent wave runs |
| `--help` | `-h` | Show usage |

---

## 5. `wb-flow archive`
**Role:** Retires superseded daily reports so a scope's `reports/` tree holds only the current file per category, keeping paths intact.

| Flag | Shortcut | Description |
|---|---|---|
| `--recursive` | `-R` | Archive files across a whole monorepo |
| `--keep=<num>` | | Number of newest reports to keep (default 1) |
| `--before=<date>` | | Archive reports older than YYYYMMDD |
| `--type=<val>` | | Comma-separated list of types to target |
| `--include-standups` | | Exempts `standups` from the ignore list (danger) |
| `--include-tracks` | | Exempts `tracks` from the ignore list (danger) |
| `--no-banner` | | Suppresses the archive stamp injected into files |
| `--no-log` | | Suppresses archive logging |
| `--list` | | Prints candidate files without moving them |
| `--all` | | Target everything |
| `--json` | | Output JSON array of targeted files |
| `--dry-run` | `-n` | Preview changes without moving |
| `--help` | `-h` | Show usage |

---

## 6. `wb-flow snap`
**Role:** Snapshots and pins the output of a run into a static reference folder (`.wb/snaps/`).

| Flag | Shortcut | Description |
|---|---|---|
| `--label=<val>` | | Names the snapshot folder |
| `--copy` | | Freezes the content physically (instead of a symlink) |
| `--root=<path>` | | Explicit path to project root |
| `--list` | | List available snapshots |
| `--json` | | Output in JSON format |
| `--dry-run` | `-n` | Preview without creating |
| `--help` | `-h` | Show usage |

---

## 7. `wb-flow lint`
**Role:** Checks plan files against the output conventions and sync rules to catch structural errors before closing a plan.

| Flag | Shortcut | Description |
|---|---|---|
| `--help` | `-h` | Show usage |

---

## 8. `wb-flow next`
**Role:** Calculates the `## 🌊 Next Executable Sequence` matrix and determines the next logical dispatch.

| Flag | Shortcut | Description |
|---|---|---|
| `<plan.md>` | | Path to the plan file to evaluate |
| `--embed` | | Modifies the target `plan.md` in place to embed the block |
| `--json` | | Outputs the calculated next state in JSON |
| `--help` | `-h` | Show usage |

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

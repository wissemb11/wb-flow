---
title: "Command Glossary — every /wb*, every wb-flow flag"
description: "Every `/wb*` command, every `wb-flow` subcommand and flag, and what each looks like from bash, Python"
---

# Command Glossary — every `/wb*`, every `wb-flow` flag

Every `/wb*` command, every `wb-flow` subcommand and flag, and what each looks like from bash, Python
and Node. Rows with no equivalent are listed anyway and say so — **an absent alternative is
information.**

> Adapted from the internal `model_reference_manual.md`. That manual also carries the per-provider
> model rosters and subscription inventory, which are environment-specific and stay internal; this
> page is the part that describes the shipped surface.

### The distinction that runs through this whole table

**28 of the 33 `/wb*` commands are agent-only. 5 have a deterministic CLI behind them.**

| | Agent-only | CLI-backed |
|---|---|---|
| What it is | a **prompt** an agent reads and acts on | **code** with tests |
| Reproducible? | no — same input can yield different output | yes — same input, same output |
| Callable from Python/Node? | only by *dispatching an agent* (see the universal shape below) | directly |
| Fails how? | silently, in prose | non-zero exit |

This is why `wb-flow model`, `wave`, `next` and `snap` exist at all: each replaced a step a template
used to ask an agent to improvise, and improvisation is where the drift came from — a hand-rolled
`ln -s`, a mis-escaped `\|\|`, a slug that never existed.

### The universal programmatic shape

Any `/wb*` command — agent-only included — can be invoked programmatically by dispatching it to an
agent CLI. This is the shape referenced as **“dispatch”** throughout the table:

```bash
wbRun opencode run -m <slug> --dangerously-skip-permissions --command wbAudit "<target>"
wbRun agy --model <name> --dangerously-skip-permissions -p "/wbAudit <target>"
```

```python
subprocess.run(["opencode", "run", "-m", slug, "--dangerously-skip-permissions",
                "--command", "wbAudit", target], capture_output=True, text=True, timeout=600)
```

```javascript
spawnSync("opencode", ["run", "-m", slug, "--dangerously-skip-permissions",
          "--command", "wbAudit", target], { encoding: "utf8", timeout: 600000 });
```

> **`agy` differs**: it has no `--command` flag — the slash-command rides inside the prompt string,
> and `--dangerously-skip-permissions` is mandatory or headless mode auto-denies every tool and
> returns empty output with exit 0. See the `agy` note below.

### 1 · The 33 `/wb*` commands

| `/wb*` command | What it does | Deterministic CLI equivalent |
|---|---|---|
| `/wbActOn` | Turns a diagnostic document (audit, plan, review) into a ranked executi… | — *agent-only* |
| `/wbAudit` | Performs a deep, honest, code-based technical audit. | — *agent-only* |
| `/wbBroadcast` | Generates an Announcement Kit and manages version lifecycle status. | — *agent-only* |
| `/wbCheck` | Pre-Flight Context Quiz to verify worker model understanding. | — *agent-only* |
| `/wbClean` | Scans for dead code, unused files, and obsolete dependencies. | — *agent-only* |
| `/wbContext` | Generates a comprehensive Context Report containing identity, dependenc… | — *agent-only* |
| `/wbDebug` | Isolates and fixes errors following the Scientific Method. | — *agent-only* |
| `/wbDeploy` | Orchestrates deployment of consumer apps to web hosts (Vercel, AWS, VPS). | — *agent-only* |
| `/wbDoc` | Injects JSDoc/TSDoc comments and generates README files without modifyi… | — *agent-only* |
| `/wbExplain` | Generate persistent, formatted explanations for a specific task ID, a c… | — *agent-only* |
| `/wbGit` | Analyzes current file changes and generates Conventional Commits. | — *agent-only* |
| `/wbHelp` | Meta-command that catalogs all /wb* commands (no args) or shows the per… | `wb-flow --help` · `wb-flow --list` |
| `/wbIdea` | Tracks, scores, and validates ideas before promoting them to active plans. | — *agent-only* |
| `/wbLicense` | Enforces business logic by injecting premium gating and license checks. | — *agent-only* |
| `/wbModel` | Dynamically updates or displays the active model selections (Planner, V… | `wb-flow model` — `--detect` `--reset` `--pick` `--probe` `--set` `--json` |
| `/wbMonetize` | Bootstraps or maintains the Free/Pro/Dev tier splitting plumbing. | — *agent-only* |
| `/wbNext` | Analyzes the current project state (recent reports, git status, stale T… | `wb-flow next <plan>` — `--embed` `--json` |
| `/wbPlan` | Creates a structured multi-agent task plan for a given problem or objec… | — *agent-only* |
| `/wbPublish` | Executes the final build and NPM deployment based on the wbRelease plan. | — *agent-only* |
| `/wbRefactor` | Restructures and optimizes target code without changing visual behavior… | — *agent-only* |
| `/wbRelease` | Orchestrates the release by resolving circular dependencies and updatin… | — *agent-only* |
| `/wbReview` | Performs a formal quality review of an executed task against an origina… | — *agent-only* |
| `/wbSecure` | Scans for vulnerabilities (secrets, XSS, insecure deps). | — *agent-only* |
| `/wbSetup` | Initializes the Agentic Brain for the target folder by establishing its… | `wb-flow init` — `--scope` `--agents` `--yes` *(wiring only)* |
| `/wbStandup` | Consolidates unfinished work (open tickets, failing audits) into a sing… | — *agent-only* |
| `/wbStopTrack` | Stop session tracking, write final §END section, extract derivative files. | — *agent-only* |
| `/wbTest` | Executes dynamic tests (UNIT, E2E, MANUAL, PERF) to verify code behavior. | — *agent-only* |
| `/wbToWBC` | Rewrites legacy bulky HTML/Vuetify into proprietary WBC-UI2 JSON compon… | — *agent-only* |
| `/wbTrack` | Toggles session tracking ON so every /wb* command produces its normal r… | — *agent-only* |
| `/wbTranslate` | Extracts hardcoded strings and generates localized JSON files (EN, FR,… | — *agent-only* |
| `/wbValid` | Validates a worker's output by running an adversarial review — a second… | — *agent-only* |
| `/wbVision` | Proposes 3 highly innovative, strategic features to build next. | — *agent-only* |
| `/wbWork` | Executes one or more tasks from a plan file as the Worker model, produc… | `wb-flow wave <plan> --wave=<L>` *(only the `--wave` path)* |

*Everything marked agent-only takes the **dispatch** shape above; substitute its own name for
`wbAudit`. Python and Node differ only in `subprocess.run` vs `spawnSync` — see the Python/Node shapes above.*

### 2 · The `wb-flow` CLI surface

| Subcommand | Flags | bash | Python / Node |
|---|---|---|---|
| *(none)* | `--force` `--dry-run` `--list` `--version` `--help` | `wb-flow` | `subprocess.run(["wb-flow"])` / `spawnSync("wb-flow", [])` |
| `init` | `--scope=` `--agents=` `--templates=` `--yes` `--force` `--dry-run` | `wb-flow init --scope=project --agents=detected --yes` | same argv as a list/array |
| `model` | `--detect` `--reset` `--pick`/`-i` `--probe` `--set <role>=<slug>` `--timeout=` `--file=` `--json` `--dry-run` | `wb-flow model --detect --probe` | `subprocess.run(["wb-flow","model","--detect","--json"])` → parse stdout |
| `next` | `--embed` `--json` | `wb-flow next <plan.md> --embed` | `json.loads(...)` / `JSON.parse(...)` on `--json` |
| `snap` | `--label=` `--copy` `--root=` `--list` `--json` `--dry-run` | `wb-flow snap <path> --label=x --copy` | same argv; `--json` returns `{snap,target,kind,label}` |
| `wave` | `--wave=<L>[:<R>]` `--validate` `--summary` / `--no-summary` `--sessions` `--jobs=` `--out=` `--print` `--list` · model overrides `--model=` `--planner=` `--worker=` `--validator=` `--mechanical=` (and `--worker-model=` `--mech-model=` `--validator-model=`) | `wb-flow wave <plan> --wave=A --summary` | `--print` to stdout, then run the script yourself. `--list` dry-runs the routing and prints the roster file + per-role chains — authoritative over `model --show` |

> **Short flags on `wave` take `=`, never a space.** `-W=` `-M=` `-p=` `-v=` `-w=` `-m=` are the only
> accepted forms — `-w=zai/glm-4.7` works, **`-w zai/glm-4.7` does not.** A space-separated short flag
> doesn't error: `-w` is dropped and the slug falls into positionals, where it is taken as the *plan
> path*. Note also that `-w=` is `--worker=`; `--wave=` is `-W=`.
>
> `-i` is `--pick` (on `model`), `-n` is `--dry-run` (on `snap` and `init`), and `-M=` is `--model=`.

### 3 · Universal `/wb*` flags

| Flag | Applies to | Deterministic backing |
|---|---|---|
| `--snap` / `--snap-copy` | every command writing under `.wb/workflows/reports/` | `wb-flow snap <path> [--copy]` |
| `--next` | every command | `wb-flow next <plan.md>` |
| `--help` / `-h` | every command | `wb-flow <sub> --help` |
| `--wave=<L>[:<R>]` | `/wbWork` | `wb-flow wave <plan> --wave=<L>[:<R>]` |
| `--summary` / `--no-summary` · `--sessions` | `/wbWork --wave` only | pass-through to `wb-flow wave` |
| `-p=` `-v=` `-w=` `-m=` (per-role model) · `-M=` | dispatching commands | `wb-flow wave … -w=<slug>`; persist with `wb-flow model --set <role>=<slug>` |
| `--id` `--p` `--est` `--done` `--valid` (column filters) | plan-table commands | — *agent-only* |
| `--open` `--def` `--can` (state overrides) | `/wbWork` `/wbValid` `/wbPlan` | — *agent-only* |
| `--as="<styles>"` | `/wbWork` `/wbExplain` | — *agent-only* |
| `--yes` / `-y` | most | `--yes` on `wb-flow init` / `model` |
| `--act` · `--wbPlan` (chaining) | `/wbAudit` `/wbReview` `/wbStandup` `/wbActOn` | — *agent-only* |
| `--no-plan-update` | `/wbWork` `/wbValid` | set automatically by `wb-flow wave` |

### 4 · Discovery commands (not wb-flow, but you need them)

| Task | bash | Python | Node |
|---|---|---|---|
| List opencode models | `opencode models` | `subprocess.run([...]).stdout.splitlines()` | `execFileSync(...).split("\n")` |
| Which providers are credentialed | `opencode providers list` | same, parse the `●` lines | same |
| List agy models | `agy models` | same | same |
| List codex models | **— none.** codex cannot enumerate; use `wb-flow model --detect --probe` | — | — |
| Sessions as JSON | `opencode session list --format json` | `json.loads(...)` | `JSON.parse(...)` |
| Token/cost stats | `opencode stats --days 1 --models` | dispatch + parse | dispatch + parse |

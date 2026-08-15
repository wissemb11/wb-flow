# /wbHelp — Exhaustive Simulation ()

`/wbHelp` is the internal documentation router. It reads the `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/` directory and command schemas to provide usage guides, flag definitions, and scenario recommendations. The hard constraint: **meta-awareness without hallucination.** The agent dynamically parses the documentation source of truth rather than relying on memorized knowledge of its own commands.

Read this if you want to know what happens with no arguments, how the search flag works across the docs tree, and why `/wbHelp` refuses to describe commands that don't exist.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Capability Router. Answers "what can I do?" and "how does X work?" |
| **Target** | `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/`, command templates, `wb_commands_reference.json`. |
| **Cell scope** | None. `/wbHelp` is read-only and meta-level. |
| **Side effects allowed** | None. Pure read + render to stdout. |
| **Side effects forbidden** | Everything. `/wbHelp` produces prose and stops. |

The "no hallucination" rule is what separates `/wbHelp` from a generic "help" command. When `/wbHelp wbPlan` runs, it doesn't recall what `/wbPlan` does from training data — it reads `wbPlan_template.md` and the exhaustive simulation file, then summarizes what it finds. If the template changed since training, the help output reflects the current version.

---

## 2. Argument resolution

| Form | Example | What `/wbHelp` does |
|---|---|---|
| No argument | `Command: /wbHelp` | Outputs the full command catalog: all 27 commands, grouped by role (Execution, QA, Orchestration, etc.). |
| Specific command | `Command: /wbHelp wbPlan` | Extracts usage guide, flags, and edge cases for `/wbPlan`. |
| Comma-separated | `Command: /wbHelp wbWork,wbValid` | Comparative guide showing how the two commands chain together (worker/validator). |
| Natural language | `Command: /wbHelp "how do I fix a bug?"` | Fuzzy-matches to Diagnostic commands. Suggests `/wbDebug` and `/wbAudit`. |

The comma-separated form is the non-obvious value. `/wbHelp wbWork,wbValid` doesn't just concatenate two help pages — it explains the **relationship**: worker writes `Done`, validator writes `Valid`, they run from different model pools, the separation prevents self-approval.

---

## 3. Flag matrix

`/wbHelp` declares no flags of its own. Its entire interface is positional:

| Form | Purpose |
|---|---|
| `/wbHelp` | Prints the role-grouped catalog of every command. |
| `/wbHelp <wbX>` | Prints one command's manual — identical to `/<wbX> -h`. |

`-h` / `--help` is accepted, as it is on every command, and prints the same
catalog. Any other argument is treated as a command name.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbHelpSimPipelines = [
  {
    "title": "Full catalog (no arguments)",
    "cmd": "/wbHelp",
    "logs": [
      {
        "text": "[SYSTEM] Loading command catalog from wb_commands_reference.json...",
        "type": "sys"
      },
      {
        "text": "# wb-flow Command Arsenal (27 commands)",
        "type": "gen"
      },
      {
        "text": "## Execution & QA",
        "type": "sys"
      },
      {
        "text": "| Command | Role | Quick Description |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| `/wbWork` | Worker | Implements plan rows. Writes to Done. |",
        "type": "sys"
      },
      {
        "text": "| `/wbValid` | Validator | Validates completed rows. Writes to Valid. |",
        "type": "sys"
      },
      {
        "text": "| `/wbExplain` | Teacher | Explains code/plans in any style. Read-only. |",
        "type": "sys"
      },
      {
        "text": "| `/wbTest` | Tester | Runs test suites and reports results. |",
        "type": "sys"
      },
      {
        "text": "| `/wbAudit` | Auditor | Scans for technical debt and security issues. |",
        "type": "sys"
      },
      {
        "text": "| `/wbReview` | Reviewer | Code review with approval/rejection. |",
        "type": "sys"
      },
      {
        "text": "| `/wbDebug` | Debugger | Root-cause analysis for errors. |",
        "type": "sys"
      },
      {
        "text": "| `/wbContext` | Mapper | Generates context.md files from source. |",
        "type": "sys"
      },
      {
        "text": "| `/wbPlan` | Planner | Creates task plans with DAG dependencies. |",
        "type": "sys"
      },
      {
        "text": "| `/wbGit` | Committer | Generates commit messages (no git execution). |",
        "type": "sys"
      },
      {
        "text": "## Orchestration & Workflow",
        "type": "sys"
      },
      {
        "text": "| `/wbTrack` | Logger | Session tracking toggle. |",
        "type": "sys"
      },
      {
        "text": "| `/wbStandup` | Briefer | Morning status report. Read-only. |",
        "type": "sys"
      },
      {
        "text": "| `/wbNext` | Navigator | Returns the next unblocked task. |",
        "type": "sys"
      },
      {
        "text": "| `/wbActOn` | Triage | Ranks findings into execution order. |",
        "type": "sys"
      },
      {
        "text": "## Refactoring & Transformation",
        "type": "sys"
      },
      {
        "text": "| `/wbRefactor` | Refactorer | Restructures code preserving behavior. |",
        "type": "sys"
      },
      {
        "text": "| `/wbClean` | Cleaner | Removes dead code and organizes files. |",
        "type": "sys"
      },
      {
        "text": "| `/wbSecure` | Hardener | Security-focused code hardening. |",
        "type": "sys"
      },
      {
        "text": "| `/wbTranslate` | Translator | i18n and locale management. |",
        "type": "sys"
      },
      {
        "text": "## Deployment & Release",
        "type": "sys"
      },
      {
        "text": "| `/wbDeploy` | Deployer | Deployment configuration and execution. |",
        "type": "sys"
      },
      {
        "text": "| `/wbRelease` | Releaser | Version bumps and changelog generation. |",
        "type": "sys"
      },
      {
        "text": "| `/wbPublish` | Publisher | npm publish workflows. |",
        "type": "sys"
      },
      {
        "text": "| `/wbSetup` | Bootstrapper | Project initialization and scaffolding. |",
        "type": "sys"
      },
      {
        "text": "## Compliance & Documentation",
        "type": "sys"
      },
      {
        "text": "| `/wbDoc` | Writer | JSDoc, README, API spec generation. |",
        "type": "sys"
      },
      {
        "text": "| `/wbLicense` | Guardian | IP compliance and header injection. |",
        "type": "sys"
      },
      {
        "text": "| `/wbHelp` | Router | This command. Documentation lookup. |",
        "type": "sys"
      },
      {
        "text": "| `/wbCheck` | Checker | Static analysis and link verification. |",
        "type": "sys"
      },
      {
        "text": "## Special Ops & Conversion",
        "type": "sys"
      },
      {
        "text": "| `/wbBroadcast` | Dispatcher | Cross-system notifications. |",
        "type": "sys"
      },
      {
        "text": "| `/wbMonetize` | Commercializer | Paywall and tier gating. |",
        "type": "sys"
      },
      {
        "text": "| `/wbToWBC` | Migrator | Converts generic code to WBC patterns. |",
        "type": "sys"
      },
      {
        "text": "| `/wbVision` | Cartographer | Architecture visualization (Mermaid). |",
        "type": "sys"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Deep capability search",
    "cmd": "/wbHelp -s=\"worker validator\" -e",
    "logs": [
      {
        "text": "[SYSTEM] Searching frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/ for \"worker validator\"...",
        "type": "sys"
      },
      {
        "text": "[MATCH] 4 commands reference the worker/validator pattern:",
        "type": "gen"
      },
      {
        "text": "1. **wbWork** \u2014 The worker side. Implements rows, writes Done.",
        "type": "gen"
      },
      {
        "text": "Example: `/wbWork --id=\"2\"` \u2192 edits code, runs verify, marks \u2705.",
        "type": "gen"
      },
      {
        "text": "2. **wbValid** \u2014 The validator side. Checks work, writes Valid.",
        "type": "gen"
      },
      {
        "text": "Example: `/wbValid --id=\"2\"` \u2192 reads implementation, runs checks, marks \u2705.",
        "type": "gen"
      },
      {
        "text": "3. **wbPlan** \u2014 Plans include Worker Model / Validator Model columns.",
        "type": "gen"
      },
      {
        "text": "Example: Row has `Worker: the agent 4`, `Validator: the agent 4`.",
        "type": "gen"
      },
      {
        "text": "4. **wbActOn** \u2014 --wbPlan generates task tables with worker/validator assignments.",
        "type": "gen"
      },
      {
        "text": "[PRINCIPLE] Worker and validator always run from different model pools.",
        "type": "gen"
      },
      {
        "text": "A model cannot validate its own work (feedback_model_selection.md).",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Concise flag reference",
    "cmd": "/wbHelp wbWork -f -v=\"concise\"",
    "logs": [
      {
        "text": "[FLAGS] /wbWork has 4 flags:",
        "type": "gen"
      },
      {
        "text": "--id=\"<filter>\" (-i) : Required. Row selector (single, CSV, wildcard, range, negation, boolean).",
        "type": "gen"
      },
      {
        "text": "--open (-o) : State-only. Resets Done to \u2b1c.",
        "type": "gen"
      },
      {
        "text": "--def (-d) : State-only. Marks Done as \u23f8\ufe0f Deferred.",
        "type": "gen"
      },
      {
        "text": "--can (-c) : State-only. Marks Done as \ud83d\udeab Cancelled.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbHelp" titleSuffix="Exhaustive Simulation" :pipelines="wbHelpSimPipelines" />


### 💠 Pipeline Full catalog (no arguments)


### 💠 Pipeline Deep capability search


### 💠 Pipeline Concise flag reference

---

## 5. Edge cases & refusals

| Trigger | What `/wbHelp` does |
|---|---|
| `/wbHelp wbMagic` (nonexistent command) | `❌ 'wbMagic' is not a recognized command. Did you mean: wbMonetize, wbTrack?` |
| `/wbHelp -s="the"` (too broad) | `⚠️ Search too broad (10,000+ matches). Truncating to top 5 commands. Narrow your query.` |
| Corrupt/missing `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/` | `❌ Documentation directory not found. Agent capabilities may be limited.` |
| `/wbHelp wbGit -h` | Meta-inception: outputs the help block from `wbGit_template.md` (the `-h` intercept defined in every template). |
| `/wbHelp wbWork,wbValid,wbExplain,wbTest,wbAudit,...` (too many) | Truncates to first 3 and suggests separate queries for the rest. |

The unifying principle: **`/wbHelp` is the only command that reads its own documentation.** Every other command *does* something; `/wbHelp` describes what they do by parsing the docs tree, not by recalling training data. This self-referential design means the help output is always current — if a template gets a new flag, `/wbHelp` surfaces it automatically.

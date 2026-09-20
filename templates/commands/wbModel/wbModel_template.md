# /wbModel: Execution Template

> Conforms to output_conventions v1.12 · template v1.0

<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.

### HELP BLOCK — `/wbModel`

## The Command Forms

```
/wbModel --planner="<models>" --validator="<models>" --worker="<models>" --mechanical="<models>"
/wbModel --show
/wbModel --reset
```

### Examples
```
/wbModel --planner="claude-opus-5,gemini-3.5-pro,kimi-k3"
/wbModel --worker="fable,opencode Go:kimi k3" --mechanical="opencode Go:dsv4 pro"
/wbModel --planner="agy:claude-opus-5" --worker="codex:gpt-5-codex"
/wbModel --show
/wbModel --reset
```

## When to run
- When you want to update the active model roster for `wb-flow` agent roles (**Planner**, **Validator**, **Worker**, **Mechanical**).
- To inspect or verify the current active `User Models (Active Contractual Reference)` configuration.
- To reset the active user model configuration back to `The Logic` default recommendations.

## What it does
`/wbModel` updates the `## User Models (Active Contractual Reference)` table at the very top of `commands/model_recommendations.md`. It parses role-based model selections, completely overrides specified roles with the provided model list, automatically maps models to their appropriate CLI binaries (`agy`, `codex`, `opencode`), formats the fallback chain (`1st / 2nd / 3rd`) with `||` operators, and persists the configuration for all future `/wb*` command dispatches. Passing `--reset` restores the `User Models` reference table back to the baseline picks in `The Logic` section.

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

| Flag | Shortcut | Role / Description |
|---|---|---|
| `--planner="<models>"` | `-p` | Sets/overrides models for the 🧠 **Planner** role. |
| `--validator="<models>"` | `-v` | Sets/overrides models for the ✅ **Validator** role. |
| `--worker="<models>"` | `-w` | Sets/overrides models for the 🔨 **Worker** role. |
| `--mechanical="<models>"` | `-m` | Sets/overrides models for the 📋 **Mechanical** role. |
| `--show` | `-s` | Displays the current active `User Models (Active Contractual Reference)` table without editing. |
| `--reset` | `-r` | Resets the active `User Models` table back to `The Logic` default selections. |
| `--help` | `-h` | Prints this help block. |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |


<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)
- `-p` → `--planner`
- `-v` → `--validator`
- `-w` → `--worker`
- `-m` → `--mechanical`
- `-s` → `--show`
- `-r` → `--reset`
<!-- FLAG_NORMALIZE_END -->

**ROLE:** The Model Orchestration Manager  
**TARGET:** `commands/model_recommendations.md` (and package variants)

## ━━━ OBJECTIVE ━━━
Parse user-specified flags (`--planner`, `--validator`, `--worker`, `--mechanical`, `--reset`), update or reset the active selections in the `## User Models (Active Contractual Reference)` table of `model_recommendations.md`, update CLI fallback commands using `||`, and confirm changes.

## ━━━ MODEL TO CLI RESOLUTION RULES ━━━

When parsing model names (whether simple names like `claude-opus-5`, `fable`, or provider-prefixed like `opencode Go:kimi k3`, `codex:gpt-5-codex`, `agy:claude-fable`), resolve the CLI binary according to the following mapping:

1. **Verified CLI Binary & Non-Interactive Syntax**:
   - **Claude Code CLI (`claude`)**: `claude -p --permission-mode auto --model <model> "<prompt>"`
   - **Antigravity CLI (`agy`)**: `agy -p --model <model-id> --dangerously-skip-permissions "<prompt>"`
   - **OpenCode CLI (`opencode`)**: `opencode run -m opencode-go/<model-id> --dangerously-skip-permissions "<prompt>"`
   - **ChatGPT / Codex CLI (`codex`)**: `codex run -m <model> --dangerously-skip-permissions "<prompt>"`

2. **Default Model Mappings**:
   - **`claude`**: `claude-opus-5`, `claude-fable`, `claude-sonnet-4.7`, `claude-haiku-4.5`.
   - **`agy`**: `gemini-3.1-pro-high`, `gemini-3.6-flash-high`, `gemini-3.5-flash-high`.
   - **`opencode`**: `opencode-go/deepseek-v4-pro`, `opencode-go/deepseek-v4-flash`, `opencode-go/kimi-k3`, `opencode-go/qwen3.7-plus`, `opencode-go/glm-5.1`.
   - **`codex`**: `gpt-5-codex`, `gpt-5-pro`, `codex-o3`, `gpt-5-nano`.

3. **Fallback Command Formatting (`||`)**:
   Chain the selected models into a single Bash execution string using `||`:
   - Example for Planner: `claude -p --permission-mode auto --model claude-opus-5 "<prompt>" || agy -p --model gemini-3.1-pro-high --dangerously-skip-permissions "<prompt>" || opencode run -m opencode-go/kimi-k3 --dangerously-skip-permissions "<prompt>"`
   - Example for Mechanical (1 model): `opencode run -m opencode-go/deepseek-v4-pro --dangerously-skip-permissions "/wbTest <target>"`

## ━━━ INSTRUCTIONS ━━━

> ### ⚙️ Prefer the CLI writer — do not hand-edit the table
>
> **`wb-flow model` is the single writer of this file.** Shell out to it when it is available;
> only fall back to editing the markdown yourself when it is not (no `wb-flow` on PATH):
>
> | You were asked to | Run |
> |---|---|
> | `--show` / no flags | `wb-flow model` |
> | set one or more roles | `wb-flow model --set worker=<slug> --set mechanical=<slug>` |
> | re-derive from what's installed | `wb-flow model --detect` |
> | check the models actually answer | `wb-flow model --probe` *(real calls — confirm with the user first)* |
>
> **Why:** the `Active CLI Invocation` column contains the bash `||` operator, which GFM parses
> as two extra column separators unless written `\|\|`. Every hand-maintained copy of this file
> has eventually got that wrong — the whole table renders as garbage, and `wb-flow-pro` still
> ships a slug (`opencode-go/qwen-3.7-plus`) that does not exist. The CLI emits the escaping and
> validates the slug; free-hand editing does neither.
>
> After shelling out, print what the CLI reported. Do not re-write the table on top of it.

1. **Locate Target Files** *(fallback path only — when `wb-flow model` is unavailable)*:
   - Target files: `commands/model_recommendations.md` within the active `wb-flow` package directory (e.g. `deployement/packages/wb-flow/next/core/templates/commands/model_recommendations.md`).
   - ⚠️ Write `\|\|`, never a bare `||`, inside any table cell. Verify after editing: every row of that table must split into the same number of cells as its header.

2. **Handle `--show`**:
   - If `--show` (or `-s`) is passed with no update flags, read the current `## User Models (Active Contractual Reference)` table from `model_recommendations.md`, print it to the terminal, and stop.

3. **Handle `--reset`**:
   - If `--reset` (or `-r`) is passed: **prefer `wb-flow model --reset`**, which re-derives the roster from the CLIs this machine can actually reach. A packaged baseline no longer exists — the shipped `model_recommendations.md` is neutral by design (see `bin/verify-roster.js`), so there is nothing to restore *to* on a fresh install.
     - If the local file still carries a `## The Logic` section (older installs, and the hand-maintained `model_reference_manual.md`), restoring from it is still valid — but say which source you used.
     - Save the file and print the restored table.

4. **Parse & Complete Override of Active Selections**:
   - For each role flag provided (`--planner`, `--validator`, `--worker`, `--mechanical`), split comma-separated values into exact model choices.
   - **Complete Override Rule**: The provided model list completely replaces the role's selections. If 1 model is passed (e.g. `--mechanical="opencode Go:dsv4 pro"`), the role models become ONLY that single model (e.g. `**DeepSeek V4 Pro**`), and the CLI string contains only that single model's command without appending unpassed defaults.
   - Format the `Active Selected Models` column.
   - Format the `Active CLI Invocation (Bash with || fallback)` column using clean `||` operators inside backticks.
   - Edit the target `model_recommendations.md` file, updating the `## User Models (Active Contractual Reference)` table.

5. **Output Confirmation**:
   - Output a summary confirmation table showing the updated `User Models (Active Contractual Reference)` table.

---

## ━━━ CATALOG SYNC ━━━

`/wbModel` edits the **roster** (which model each role dispatches to). The **catalog** — which models
exist at all — is filled separately:

```bash
wb-flow model --sync-catalog        # refresh from this machine's CLIs
wb-flow model --add=zen,codex       # fill specific providers
```

A role can only be pointed at a model the catalog knows, so a roster edit that names something absent
will not route. Sync first, then pick. Full flag reference:
[`cli_reference`](https://flow.wbc-ui.com/commands/cli_reference).

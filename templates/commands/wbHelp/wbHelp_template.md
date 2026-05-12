# /wbHelp: Catalog & Per-Command Help

`/wbHelp` is a META-command. It does NOT generate a report. It prints help text and stops.

---

## Mode dispatch

Inspect `$ARGUMENTS` and pick exactly one mode:

| Args | Mode | Behavior |
|---|---|---|
| empty (no args) | **Catalog mode** | Print the role-grouped table of all `/wb*` commands |
| `<wbX>` (one token, starts with `wb`) | **Per-command mode** | Output the HELP_GATE block of `wbX_template.md` (identical to `/wbX -h`) |
| `<wbX> --help` / `<wbX> -h` | **Per-command mode** | Same as above; redundant flags ignored |
| anything else | **Catalog mode** + a one-line note: *"Unrecognized form. Showing catalog. Use `/wbHelp <wbX>` for one command."* |

**Normalization first**: strip a leading `/` from the command name (`/wbHelp wbAudit` and `/wbHelp /wbAudit` both work). Case-sensitive (`wbAudit`, not `wbaudit`).

---

## CATALOG MODE — render the table

1. Read `../wb_commands_reference.claude.json`.
2. Group commands by **role family** using the first noun of each command's `role` field. Map each `role` value to one of four families:
   - 🧠 **Strategy / Planning** — `Architect`, `General`, `Product Manager`, `Navigator`, `Scrum Master`
   - ✅ **Validation / Critique** — `Critic`, `Inspector`, `Diagnostician`, `Red Team`, `Quizmaster`, `Triage Officer`, `Synchronizer`
   - 🔨 **Worker / Execution** — `Surgeon`, `Modernizer`, `Licensor`, `Tier Architect`, `Translator`, `Scribe`, `Release Engineer`, `Shipper`
   - 📋 **Mechanical / Reporting** — `Tester`, `Janitor`, `Marketer`, `Stenographer`
   
   If a role doesn't fit any family cleanly, drop it under **🔨 Worker** by default.

3. Output exactly this structure:

```markdown
# /wb* Command Catalog

> 30 template-driven commands. Pass `--help` (or `-h`) to any command for its manual, or `/wbHelp <wbX>`.

## 🧠 Strategy / Planning

| # | Command | Role | Flags | What it does |
|---|---|---|---|---|
| 03 | `/wbPlan` | The General — coordinates workers and validators. | `--resume` (`-r`), `--scope` (`-s`), `--task` (`-t`) | Creates a structured task plan with worker/validator assignments. |
| ...

## ✅ Validation / Critique

| # | Command | Role | Flags | What it does |
| ...

## 🔨 Worker / Execution

| # | Command | Role | Flags | What it does |
| ...

## 📋 Mechanical / Reporting

| # | Command | Role | Flags | What it does |
| ...

---

**Need details on one command?** Run `/wbHelp <command>` (or `/<command> -h`).
**Model picks per command:** see [`flow.wbc-ui.com/concepts/model_recommendations_claude.md`](../../../../../apps/wb-flow/flow.wbc-ui.com/concepts/model_recommendations_claude.md).
```

4. The `#` column uses the catalog's natural order (1, 2, 3 …) — read the JSON keys in their order of appearance and number sequentially. Don't invent positional numbers.

5. The `What it does` column uses the JSON's `description` field, trimmed to a single sentence.

6. The `Flags` column uses the JSON's `flags` array (each entry is `{"long": "--xxx", "short": "-x"}`). Render as comma-separated `` `--long` (`-short`) `` pairs. If the array is missing or empty, render `—` (em-dash). All commands also accept `-h` / `--help`; do NOT list that in this column — it's universal and would just be visual noise.

7. **Do not** include the JSON's `phase`, `belt`, `recommendedModel`, or `references` fields in the table. Those belong in per-command help, not the catalog.

8. Stop after printing. No file writes. No reports.

---

## PER-COMMAND MODE — delegate to the target template

1. Compute `target = <wbX>` (the cleaned arg).
2. Verify the file exists: `../<target>/<target>_template.md`. If not, output: *"Unknown command: `/<target>`. Run `/wbHelp` for the full catalog."* and stop.
3. Read **only** the content between `<!-- HELP_GATE_START -->` and `<!-- HELP_GATE_END -->` in that template.
4. Output it verbatim. No file writes. No reports.

This is functionally identical to running `/<target> -h`. Same content, different invocation path.

---

## What `/wbHelp` will refuse to do

- Generate any `.wb/workflows/reports/` file. This is a print-and-stop command.
- Resolve flags or args meaningful to other commands. `/wbHelp wbGit --execute` shows the wbGit help; the `--execute` is ignored.
- Run more than one mode in a single invocation.

## When `/wbHelp` is the wrong command

- You want the model-pick recommendations → `model_recommendations_claude.md`, not here.
- You want to actually execute a command → drop the `wbHelp` prefix, just run `/wbX <args>`.
- You want the full prose docs → `docs_claude/commands/<wbX>/<wbX>_practical_claude.md`.

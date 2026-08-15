# /wbHelp — Command Hub

`/wbHelp` is the WB-Labs command discovery and self-documentation engine. It is a **meta-command** in the truest sense — it does not produce reports, does not modify files, and does not generate state. It serves a single purpose: surface accurate, up-to-date documentation for the entire `/wb*` command suite.

## 🎯 Strategic Position

In a 28-command ecosystem, knowledge of which command to invoke for a given goal is the single largest barrier to onboarding and the most common source of friction in daily use. `/wbHelp` exists to flatten that barrier:

- **For new users**: a single command reveals the entire system architecture, grouped by purpose.
- **For existing users**: instant per-command reference without leaving the terminal.
- **For automation**: a stable, JSON-backed source of truth.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Catalog** | `/wbHelp` (no args) | Role-grouped Markdown table, 5 columns: `#`, Command, Role, Flags, Description |
| **Per-Command** | `/wbHelp <wbX>` | The HELP_GATE block extracted from `<wbX>_template.md`. Equivalent to `/<wbX> -h`. |
| **Graceful Failure** | `/wbHelp <unknown>` | Error message with redirect to catalog. |

## 📚 Reading Order

1. **[ELI5](wbHelp_eli5.md)** — The single-paragraph mental model.
2. **[Practical](wbHelp_practical.md)** — The two forms, when to use each.
3. **[Expert](wbHelp_expert.md)** — Why the JSON-driven render is the right architecture.
4. **[Examples](wbHelp_examples.md)** — Five annotated transcripts.

## 🔗 Related

- `wb_commands_reference.json` — The data source `/wbHelp` renders.
- [`concepts/flags_and_shortcuts.md`](../../concepts/flags_and_shortcuts.md) — The system-wide flag→shortcut grammar that the catalog's `Flags` column documents.
- [`concepts/model_recommendations.md`](../../concepts/model_recommendations.md) — Per-command model picks (orthogonal to `/wbHelp`).

## Quick Reference

`/wbHelp` lists all commands. `/wbHelp <cmd>` shows detailed help.


---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


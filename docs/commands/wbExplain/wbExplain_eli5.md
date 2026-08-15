# /wbExplain — ELI5

`/wbExplain` is the *teacher* command. `/wbWork` does the task; `/wbExplain` tells you what the task means before you do it (or instead of doing it, if it's not really a task — just a question).

You point it at one of two things:

- A **plan row** (`--id=N` against a plan file) → it explains that specific task.
- A **folder + question** (`<path>/ "<question>"`) → it explains that part of the codebase.

Add `--as=eli5`, `--as=expert`, `--as=advanced` (or any persona token from `shortcuts.md`) to set the depth. Default is "practical."

The output is a markdown file in `explanations/`, not a chat reply. That matters: explanations get re-read days later, when the chat is gone.

It does **not** modify code. Ever. If you want code changed, use `/wbWork`.

---

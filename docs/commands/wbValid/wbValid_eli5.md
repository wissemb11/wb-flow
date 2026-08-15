# /wbValid — ELI5

`/wbValid` is the auditor. `/wbWork` did the tasks; `/wbValid` checks whether the work matches what the plan said.

You point it at the same plan file with `--id=2` (or `*` for all done-but-not-yet-validated tasks). It reads the worker's report, opens the actual code, and decides PASS or FAIL.

PASS → the plan's `Valid` cell flips to ✅. FAIL → the plan's `Done` cell resets to ⬜ and you're told to re-run `/wbWork`. The failure history stays visible in the task report.

Use a **different model** for `/wbValid` than you used for `/wbWork`. Otherwise the same model rubber-stamps its own work and the validation is theater.

---

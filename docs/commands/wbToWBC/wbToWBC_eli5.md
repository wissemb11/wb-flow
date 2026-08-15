# /wbToWBC — ELI5

You have an old, messy component (1000 lines of HTML table + custom sorting). You wish it were a wbc-ui2 component (`WBDataViewer` with config) instead.

`/wbToWBC` does the rewrite. Same behavior, dramatically less code.

**Important:**
- It's a *rewrite*, not a *refactor*. The code is different. Tests must still pass — verify.
- Some custom UI tweaks won't survive (you trade them for wbc-ui2 styling).
- Some components have no wbc-ui2 equivalent. The command will refuse and say so.
- One-shot per file. Don't re-run on already-migrated code.

After migration, often you can delete other files (filter panels, utility helpers) that wbc-ui2 makes redundant.

---

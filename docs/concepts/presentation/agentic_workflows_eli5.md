# AI Workflows — ELI5

Imagine the monorepo is a kitchen with 23 cookbooks on a shelf (one per package) and a messy pile of recipe notes on the counter (the `reports/` folder).

The AI is a chef who walks in every morning and doesn't remember yesterday. If you just tell the chef "cook dinner," you get chaos. So we give the chef a small set of **routines** to follow — each routine starts by reading the notes and ends by adding a new note.

The 16 slash-commands are those routines. You don't need to know all of them.

- **Forgot what's going on?** → `/wbStandup` — the chef reads the notes out loud.
- **Opening a specific cookbook today?** → `/wbContext <package>` — the chef re-reads that cookbook.
- **Big recipe to cook?** → `/wbPlan` — the chef writes a checklist first.
- **Little recipe?** → just ask.
- **Something burned?** → `/wbDebug` — the chef investigates before guessing.
- **Done cooking?** → `/wbAudit` — a second chef tastes the dish and complains loudly.
- **Good enough?** → `/wbDeploy` (for apps) or `/wbRelease` + `/wbPublish` (for packages).

The reason this works is not that the chef is smarter — it's that the notes on the counter are never erased. The next AI session reads them and inherits what yesterday's session figured out. That's it. That's the whole trick.

---

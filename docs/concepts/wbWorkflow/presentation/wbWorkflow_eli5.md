# /wbWorkflow — ELI5

Think of a toll booth on a highway.

Every time an AI session starts, it arrives at the toll booth. Before it can drive anywhere in the monorepo, it has to:

1. **Show its ticket** — the global shortcuts / preferences it was trained on.
2. **Say where it's going** — the `/wbContext <package>` call.
3. **Read the notice board** — whatever is currently in the `reports/` folder.
4. **Pick a lane:**
 - **Small job lane** (bug fix, small feature) — quick, one-AI, follow `dev.md`.
 - **Big job lane** (`/wbPlan`) — slower, multiple AIs, writes a plan table first.

The toll booth isn't a rule someone invented to be annoying. It exists because **without it, the AI drives off in random directions.** Every time it stops at the booth, the AI remembers: *oh right, this is a Vue 3 project, and yesterday someone failed a test I should know about.*

The `reports/` folder is the notice board. It's the only thing that stays between sessions. Without it, the AI would forget everything overnight.

---

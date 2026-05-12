# /wbPlan — Practical Guide

## Step-by-Step Walkthrough

### Scenario: Plan a dark mode feature

```bash
/wbPlan "Add dark mode support to the dashboard"
```

### Expected Output

| ID | Task | Priority | Estimate | Depends On |
|---|---|---|---|---|
| T1 | Define color tokens and theme variables | P0 | 2h | — |
| T2 | Create ThemeProvider context component | P0 | 3h | T1 |
| T3 | Update existing components to use theme | P1 | 4h | T2 |
| T4 | Add theme toggle to settings | P1 | 2h | T3 |
| T5 | Write tests for theme switching | P2 | 2h | T2 |

### Practical Tips

- Be specific: "Support WCAG AA contrast in dark mode" yields better plans than "Improve UI"
- Use `--deadline` to get a reality check on your timeline
- Review the plan and reorder tasks before starting — the plan is a draft, not a contract


### Advanced Example: Time-Constrained Planning

```bash
/wbPlan "Add user dashboard with charts" --deadline "2026-06-01" --team-size 2
```

When the deadline is tight, the planner will suggest:
- Parallelizing independent tasks across the two team members
- Reducing scope (e.g., deferring chart animations to a follow-up)
- Flagging dependencies that could block the timeline


### Tips for Better Plans

- Include acceptance criteria in your goal description
- Review the generated plan before starting — reorder tasks if needed
- Use `--deadline` to let the planner flag impossible timelines


---

---


← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

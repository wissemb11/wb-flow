# /wbIdea — Practical: Capturing Ideas

> This walkthrough guides you through capturing, reviewing, and exploring ideas using `/wbIdea`.

---

## When to Use `/wbIdea`

| Situation | Use `/wbIdea`? |
|---|---|
| Starting a new feature brainstorm | ✅ Yes |
| After an audit reveals multiple issues | ✅ Yes (but `/wbPlan` may be more direct) |
| Want to improve an existing package | ✅ Yes |
| Need to fix a specific bug | ❌ No — use `/wbDebug` or `/wbWork` directly |

---

## Step 1: Generate Ideas

```bash
/wbIdea packages/auth-service
```

The AI reads your project's context and generates scored ideas:

```markdown
| # | Score | Idea | P | Est. Time |
|---|---|---|---|---|
| 1 | 9 | Implement distributed rate limiting | P1 | 180 min |
| 2 | 7 | Standardize JWT error payloads | P2 | 60 min |
| 3 | 5 | Add WebAuthn support | P2 | 360 min |
| 4 | 3 | Create admin dashboard | P3 | 240 min |
```

**What to look for:**
- High scores (8+) indicate urgent, high-impact improvements
- The `P` column maps directly to priority (P1 = do first)
- Time estimates are rough — use them for relative comparison

---

## Step 2: Review and Triage

Not every idea needs action. Review the list and decide:

| Score Range | Recommended Action |
|---|---|
| 8–10 | Explore immediately |
| 5–7 | Explore when bandwidth allows |
| 1–4 | Consider deferring or discarding |

### Manual Adjustments

You can manually add, remove, or re-score ideas by editing the file directly:

```markdown
| 5 | 8 | Custom auth middleware for microservices | P1 | 120 | User (manual) | ⬜ | ⬜ | — |
```

Manual entries use `User (manual)` in the Suggested By column.

---

## Step 3: Explore a High-Priority Idea

```bash
/wbWork idea_auth-service_20260511.md --idea=1
```

This triggers a feasibility study:
- The AI analyzes the codebase for implementation complexity
- Generates an implementation sketch with code snippets
- Identifies risks and dependencies
- Writes an exploration report

The idea's `☐ Done` column updates to `✅`.

---

## Step 4: Validate the Exploration

```bash
/wbValid idea_auth-service_20260511.md --idea=1
```

A validator (different model recommended) reviews the exploration:

| Verdict | What Happens |
|---|---|
| 🎯 Promote | Idea graduates into the active plan |
| ❌ Reject | Idea is marked as not viable |
| ⏸️ Defer | Idea is shelved for later |
| 🔄 Rework | Exploration was insufficient — re-explore |

---

## Common Patterns

### Pattern A: Quick Brainstorm (5 minutes)

```bash
/wbIdea packages/my-pkg            # generate ideas
# Review the output, pick the top 1-2
/wbWork idea_*.md --idea=1          # explore the best one
```

### Pattern B: Full Pipeline (30 minutes)

```bash
/wbIdea packages/my-pkg            # generate
/wbWork idea_*.md --idea=1          # explore top idea
/wbValid idea_*.md --idea=1         # validate
# If promoted → automatically added to plan
/wbWork plan_*.md --task=N          # execute the promoted idea
```

### Pattern C: Strategic Session (with /wbVision)

```bash
/wbVision packages/my-pkg          # generate strategic vision
# Vision auto-registers ideas into the pipeline
/wbIdea packages/my-pkg            # review combined backlog
```

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# /wbIdea — Practical: Promotion & Pipeline Management

> Part 2 covers promoting validated ideas into the plan, managing the idea backlog over time, and integrating `/wbIdea` with your daily workflow.

---

## Step 5: The Promotion Moment

When `/wbValid` returns 🎯 Promote, the system automatically:

1. Creates a new task in your active plan
2. Links the idea to the task (bidirectional)
3. Updates the idea file's `→ Task` and `☐ Valid` columns

### Before

```markdown
| 1 | 9 | 📄 | Distributed rate limiting | P1 | 180 | AI | ✅ | ⬜ | — |
```

### After

```markdown
| [1](...) | 9 | 📄 | Distributed rate limiting | P1 | 180 | AI | ✅ | 🎯 8/10 AI | [→ Plan #4](...) |
```

From this point, the idea is no longer in the pipeline — it's in the execution pipeline as a plan task.

---

## Managing the Backlog

### Reviewing Old Ideas

```bash
/wbIdea packages/auth-service   # re-run on a scope with existing ideas
```

The AI enters self-correct mode:
- Adds new ideas that weren't captured before
- Re-scores existing ideas based on updated context
- Does NOT remove or demote existing ideas

### Cleaning Up

Periodically review your idea files and manually update:

| Action | When |
|---|---|
| Mark as 🚫 Cancelled | Idea is no longer relevant |
| Bump score manually | Urgency has increased since capture |
| Add cross-reference | Two ideas are related |
| Split into multiple | One idea is actually two separate tasks |

---

## Integrating with Daily Workflow

### Morning: Check for New Ideas

```bash
/wbTrack packages/auth-service     # see what happened recently
/wbIdea packages/auth-service      # any new improvement opportunities?
```

### After an Audit: Auto-Capture

```bash
/wbAudit packages/auth-service     # finds 5 issues
/wbIdea packages/auth-service      # AI incorporates audit findings into ideas
```

The AI reads the audit report and generates ideas that address the findings. These ideas score higher on Urgency because they're backed by concrete audit evidence.

### Before a Sprint: Batch Promotion

```bash
# Explore and validate top 3 ideas
for i in 1 2 3; do
  /wbWork idea_auth-service_20260511.md --idea=$i
  /wbValid idea_auth-service_20260511.md --idea=$i
done
# Promoted ideas are now plan tasks, ready for sprint planning
```

---

## Tips

1. **Don't over-explore** — If an idea scores < 5, it probably isn't worth exploring. Let it sit.
2. **Use different models** — Generate ideas with one model, validate with another. Different perspectives catch blind spots.
3. **Ideas are cheap** — Running `/wbIdea` costs ~$0.04 with Sonnet. Generate freely.
4. **Manual ideas are fine** — Not everything needs AI generation. Add rows directly.
5. **The pipeline is a funnel** — Expect 30–50% of ideas to be promoted. The rest are filtered by design.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

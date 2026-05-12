# /wbIdea — Expert: Promotion Flow & Edge Cases

> Part 2 covers the promotion flow from idea to plan task, the `/wbIdea` → `/wbPlan` handoff protocol, and architectural edge cases.

---

## 7. The Promotion Protocol

When `/wbValid` issues a 🎯 Promote verdict on an explored idea:

### Automatic Steps

| Step | System Action |
|---|---|
| 1 | Read the active plan file for the scope |
| 2 | Append a new task row with `💡 [/wbIdea #N]` in the Requires column |
| 3 | Copy the idea's title, priority, and time estimate into the task |
| 4 | Update the idea's `→ Task` column with a link to the new plan task |
| 5 | Update the idea's `☐ Valid` column with the verdict and score |

### The Resulting Links

```
Idea file:   | [1](...) | 9 | ... | ✅ | 🎯 8/10 | [→ Plan #4](...) |
Plan file:   | 4 | 💡 [/wbIdea #1](...) | Rate limiting | ... | ⬜ | ⬜ |
```

Bidirectional links ensure full traceability.

---

## 8. Self-Correct Mode for Idea Files

When `/wbIdea` is run on an existing idea file (re-run), it enters self-correct mode:

| Detection | Trigger |
|---|---|
| H1 matches `# Idea Backlog:` | Self-correct mode activated |

### Self-Correct Actions

| Action | Description |
|---|---|
| **Gap-fill** | Add new ideas that weren't present in the original run |
| **Score refresh** | Re-score existing ideas based on updated context |
| **Link fix** | Repair broken `→ Task` links |
| **State sync** | Sync `☐ Done` and `☐ Valid` columns with actual report files |
| **No deletion** | Never remove existing ideas — only add or update |

---

## 9. Edge Cases

### 9.1: Idea File Already Exists for Today

```bash
/wbIdea packages/wb-core   # already ran today at 09:15
```

**Behavior:** Appends a new `## 💡 Ideas — Entry #2` section. Does NOT overwrite Entry #1.

### 9.2: No context.md Exists

```bash
/wbIdea packages/unknown-pkg
```

**Behavior:** `⚠️ Warning: No context.md found. Ideas will be generic.` The AI proceeds but produces lower-quality ideas without context signals.

### 9.3: All Ideas Already Promoted

```bash
/wbIdea packages/wb-core   # all previous ideas have → Task links
```

**Behavior:** Generates fresh ideas. Promoted ideas are excluded from deduplication since they've graduated to the plan.

### 9.4: Conflicting Scores from Re-Run

Original: `| 1 | 7 | ... | Rate limiting |`
Re-run:  `| 1 | 9 | ... | Rate limiting |` (urgency increased)

**Behavior:** The higher score wins. Scores only go up during self-correct — they never decrease, because the original context that justified the score may still be valid.

---

## 10. Performance Characteristics

| Metric | Typical Value |
|---|---|
| Token usage | ~3,000 input + ~2,000 output |
| Execution time | 15–30 seconds |
| Ideas generated | 4–8 per run |
| Cost (Sonnet 4.6) | ~$0.04 |
| Cost (AI) | ~$0.15 |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

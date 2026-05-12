# Self-Correct Mode — Guardrails & When NOT to Self-Correct

> Part 2 covers the safety guardrails of self-correct mode, what it explicitly does NOT do, and how to manually trigger or suppress corrections.

---

## 7. What Self-Correct Does NOT Do

Self-correct mode has strict boundaries:

| Action | Does it? | Why |
|---|---|---|
| **Delete tasks** | ❌ Never | Tasks are immutable once created — only state changes |
| **Rewrite content** | ❌ Never | Self-correct fixes metadata, not prose |
| **Change priorities** | ❌ Never | Priority is a human/planner decision |
| **Re-score ideas** | ❌ Never | Scores are set at capture time |
| **Modify source code** | ❌ Never | Self-correct only touches `.wb/` files |
| **Create new tasks** | ❌ Never | That's the job of `/wbPlan` in normal mode |

### The One Rule

> Self-correct only **repairs metadata and structural integrity**. It never changes **semantic content**.

---

## 8. Guardrails

### Maximum Change Limit

Self-correct will refuse to continue if too many issues are detected:

```text
[AI] Self-correct found 15+ issues. This may indicate a
[AI] corrupted file rather than minor inconsistencies.
[AI]
[AI] ⚠️ Aborting self-correct. Recommend:
[AI]   1. Review the file manually
[AI]   2. Run /wbPlan <scope> to regenerate from scratch
```

| Threshold | Behavior |
|---|---|
| 1–5 issues | Fix silently, report summary |
| 6–14 issues | Fix with detailed warning for each |
| 15+ issues | Abort and recommend manual review or regeneration |

### Idempotency

Self-correct is **idempotent** — running it twice on the same file produces no additional changes:

```bash
/wbPlan plan_*.md    # first run: fixes 3 issues
/wbPlan plan_*.md    # second run: "✅ No issues found. Plan is consistent."
```

### Dry-Run Mode

```bash
/wbPlan plan_*.md --dry-run
```

Shows what would be corrected without making any changes:

```text
[AI] DRY RUN — no changes will be made.
[AI] Would fix:
[AI]   - Task #3: reset Done ✅ → ⬜ (missing report)
[AI]   - Link: audit_wb-core_20260509.md → repair path
```

---

## 9. Self-Correct vs. Regeneration

| Scenario | Use Self-Correct | Use Regeneration |
|---|---|---|
| A few broken links | ✅ `/wbPlan plan_*.md` | ❌ Overkill |
| Task state inconsistency | ✅ `/wbPlan plan_*.md` | ❌ Overkill |
| Plan is >7 days old | ❌ Stale beyond repair | ✅ `/wbPlan <scope>` |
| Plan is fundamentally wrong | ❌ Can't fix semantic issues | ✅ `/wbPlan <scope>` |
| File is corrupted | ❌ Aborts at 15+ issues | ✅ Delete and regenerate |

---

## 10. When to Manually Trigger Self-Correct

| Situation | Trigger Command |
|---|---|
| After resuming a stale session | `/wbPlan plan_*.md` (self-correct before resuming) |
| After manually editing a plan file | `/wbPlan plan_*.md` (validate your edits) |
| After a model crash mid-execution | `/wbPlan plan_*.md` (reset stuck 🔨 states) |
| After merging plan files from branches | `/wbPlan plan_*.md` (resolve merge artifacts) |

---

## 11. Self-Correct Log Format

Every self-correct run appends a log entry to the file's footer:

```markdown
---
### 🔧 Self-Correct Log
| Date | Issues Found | Fixed | Model |
|---|---|---|---|
| 2026-05-11 03:35 | 3 | 3 | AI |
| 2026-05-12 09:10 | 0 | 0 | AI |
```

This log provides an audit trail of all corrections applied to the file.

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

# Self-Correct Mode — Detection & Actions

> Self-correct mode is an automatic behavior that activates when a `/wb*` command receives an existing report file as input instead of a folder path. It repairs inconsistencies, fills gaps, and synchronizes state.

---

## 1. What Is Self-Correct Mode?

When you run a command like `/wbPlan` and pass it an existing plan file, the system doesn't create a new plan — it **corrects** the existing one:

```bash
/wbPlan packages/wb-core              # NORMAL: creates a new plan
/wbPlan plan_wb-core_20260511.md      # SELF-CORRECT: fixes the existing plan
```

Self-correct mode is **automatic** — there is no flag to enable or disable it.

---

## 2. Detection: How It Triggers

The system detects self-correct mode by matching the H1 heading of the input file:

| H1 Pattern | Detected Type | Self-Correct Actions |
|---|---|---|
| `# Plan: <scope>` | Plan file | Plan-specific corrections |
| `# Audit: <scope>` | Audit report | Audit-specific corrections |
| `# Idea Backlog: <scope>` | Idea file | Idea-specific corrections |
| `# Standup: <scope>` | Standup report | No self-correct (read-only) |
| (no match) | Unknown file | `❌ Error: Unrecognized file format` |

---

## 3. Universal Self-Correct Actions

These actions apply to all file types:

| Action | Description | Example |
|---|---|---|
| **Link fix** | Repair broken relative links | `../audits/audit_*.md` → actual path |
| **Date sync** | Update stale dates in headers | `2026-05-09` → `2026-05-11` (today) |
| **Format repair** | Fix malformed markdown tables | Missing `|` separators, misaligned columns |
| **Encoding fix** | Replace broken Unicode characters | `â€"` → `—` |

---

## 4. Plan-Specific Self-Correct

When self-correcting a plan file:

| Check | Detection | Fix |
|---|---|---|
| Done=✅ but no report file | Report file doesn't exist at linked path | Reset Done to ⬜ |
| Valid=✅ but Done=⬜ | Validation before completion (invalid state) | Reset Valid to ⬜ |
| Dep references non-existent task | Task #N doesn't exist in table | Remove dependency |
| Missing budget section | No `### 💰 Budget` found | Generate from task estimates |
| Stale worker model | Model name doesn't match current roster | Add `⚠️ Stale model` note |
| Orphan sub-plan section | Sub-plan header exists but no tasks | Remove empty section |

### Self-Correct Simulation

```text
$ /wbPlan plan_wb-core_20260511.md

[AI] Detected existing plan (H1: "Plan: wb-core")
[AI] Entering self-correct mode...
[AI]
[AI] Checking task table integrity (7 tasks)...
[AI]   ⚠️ Task #3: Done=✅ but report missing → resetting to ⬜
[AI]   ⚠️ Task #5: Valid=✅ but Done=⬜ → resetting Valid to ⬜
[AI]   ✅ Task #1: consistent
[AI]   ✅ Task #2: consistent
[AI]   ✅ Task #4: consistent
[AI]   ✅ Task #6: consistent
[AI]   ✅ Task #7: consistent
[AI]
[AI] Checking links (12 links)...
[AI]   ⚠️ Link to audit_wb-core_20260509.md broken → repaired
[AI]   ✅ 11 links valid
[AI]
[AI] Self-correct complete. 3 issues fixed.
```

---

## 5. Audit-Specific Self-Correct

When self-correcting an audit report:

| Check | Detection | Fix |
|---|---|---|
| Finding already resolved | Source file no longer contains the issue | Mark as `✅ Resolved` |
| New findings since last audit | Source files changed after audit date | Add `⚠️ New issues detected` |
| Score inconsistency | Finding count doesn't match score | Recalculate score |
| Missing severity | Finding has no severity tag | Assign based on category defaults |

---

## 6. Idea-Specific Self-Correct

When self-correcting an idea file:

| Check | Detection | Fix |
|---|---|---|
| Promoted idea missing link | `→ Task` says promoted but link is broken | Search for matching plan task and repair |
| Done=✅ but no exploration report | Report file doesn't exist | Reset Done to ⬜ |
| Score out of range | Score > 10 or < 1 | Clamp to 1–10 |
| Duplicate idea entries | Two rows with identical titles | Merge into one (keep higher score) |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

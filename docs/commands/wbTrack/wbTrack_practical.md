# wbTrack — Practical Walkthrough

> How to use `/wbTrack` to maintain continuity across sessions and model switches.

---

## 1. Starting a New Session

```bash
/wbTrack packages/my-project
```

```text
[AI] Last track: 2026-05-10 18:30
[AI]   Plan: plan_my-project_20260510.md
[AI]   Progress: 5/10 done, 3/10 validated
[AI]   Last model: AI
[AI]   Open: Task #6 was in progress
[AI]
[AI] Recommended: /wbWork plan_*.md --task=6
```

---

## 2. Saving Mid-Session

Before switching models or taking a break:

```bash
/wbTrack packages/my-project --save
```

This writes a snapshot of the current state.

---

## 3. Cross-Model Handoff

```bash
# In Claude session:
/wbTrack . --save          # save state

# In another session:
/wbTrack .                 # reads Claude's track file
# Full context is restored — continue working
```

---

## 4. End of Session

```bash
/wbStopTrack packages/my-project
```

Writes a closing track with session duration and final state.

---

## 5. The Morning Trifecta

```bash
/wbTrack .                     # 1. Resume context
/wbPlan plan_*.md --resume     # 2. Check plan state
/wbWork plan_*.md --task=N     # 3. Start working
```

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

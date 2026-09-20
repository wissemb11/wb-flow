---
title: "Wave Gating — The Three-Gate Contract"
description: "On 2026-07-31 a wave cell fixing wbRun's unanchored grep -qi \"error:\" was marked ❌ by the identical guard still inlined in wave."
---

# Wave Gating — The Three-Gate Contract

> When a wave cell runs, its output is a stream of text. Judging success from that text alone —
> grepping for "error" or checking the exit code — is how a fully successful cell gets marked failed
> and a cell that never ran gets marked done. The three-gate contract replaces string-matching with
> three concrete, independent checks applied in order.

---

## Why output text is never a success signal

On 2026-07-31 a wave cell fixing `wbRun`'s unanchored `grep -qi "error:"` was marked ❌ by the
identical guard still inlined in `wave.js` — the bug classified its own fix as a failure. In the
same run, three cells that never started were indistinguishable from it by output alone.

A `/wbWork` log legitimately contains `Error:`, `failed` and `cannot` whenever the task is *about*
error handling — and those are exactly the rows where a false verdict costs most. Neither channel
(exit code or output text) is sufficient alone: an unusable model can exit **0** having done nothing,
and a fully successful cell can print `Error:` a dozen times.

---

## The three gates

Classify every cell by its **three gates in order** — never by matching strings in its output.

| Gate | Question | Signal |
|---|---|---|
| **1 · Infra** | Did the agent run at all? | CLI exit code, plus *anchored* fatal patterns (`^Error: Model not found`, insufficient credits, rate limit, quota, authentication) |
| **2 · Artifact** | Did it write what it was required to write? | `tasks/task_<ID>/task_<ID>_report_<scope>_<date>.md` exists |
| **3 · Oracle** | Does the task's own `Verify` command pass? | Run the row's `Verify` cell; exit 0 = pass |

These gates are **per id**, never per dispatch. A merged cell (`--id=3,8`) runs **one** agent over
two rows: each id gets its own G2 (its own task report) and its own G3 (its own oracle). The cell's
verdict is the **worst** id's verdict.

### The verdict table

| G1 | G2 | G3 | Verdict | Done box |
|---|---|---|---|---|
| ✗ | — | — | **INFRA** — never ran | `⬜` |
| ✓ | ✗ | — | **NO-OP** — ran, produced nothing | `⬜` |
| ✓ | ✓ | ✗ | **ATTEMPTED** — ran, produced a report, oracle failed | `⬜` |
| ✓ | ✓ | ✓ | **DONE** | `✅<br><model>` |

Done boxes are checked **only on 1-2-3 green**. Everything else stays `⬜` with its verdict and the
reason in Wave notes.

---

## Per-id gating for merged cells

When two rows share a plan file, a model, and a role column — and both are small enough that losing
the parallelism costs less than paying the agent's start-up context twice — they merge into one
dispatch. The generated script runs **one** agent over both rows and prints a verdict per id:

```
G2 [3]: PASS          G3 [3]: PASS          VERDICT [3]: DONE
G2 [8]: NO-OP — no task report at tasks/task_8/task_8_report_*.md
                                               VERDICT [8]: NO-OP
PER-ID: DONE=[3] UNVERIFIED=[] ATTEMPTED=[] NO-OP=[8]
VERDICT: NO-OP — 8
```

The **cell** exits on its worst id, but the orchestrator reads the `PER-ID:` line: check `3`'s Done
box, leave `8` at `⬜` with its verdict. Do not fail a merged cell wholesale — a red exit code there
routinely carries a genuinely green id.

---

## Gating a `/wbExplain` prelude

A dispatch cell that holds both `/wbExplain <plan.md> --id=<N> --as="…"` and `/wbWork <plan.md> --id=<N>`
runs them sequentially in one lane. The gates still fire **once** — after the work command. The
explain is a prelude: it writes `task_<N>_details_*.md` and upgrades the plan's explanation link,
but its success is measured by whether the work that followed it produced a task report and passed
its oracle.

---

## Human-verified rows

A task whose `Verify` column starts with `human:` has no runnable oracle. The wave script reports
**G3: SKIPPED — human-verified row** and sets the verdict to **UNVERIFIED**. This is not a failure —
the plan author deliberately wrote a non-machine-checkable assertion — but it is also not a DONE.
Only a human can close it.

---

## Model fallback fires on Gate 1 only

When a cell fails at G1 (the agent never ran), the model fallback chain advances to the next model.
A different provider and a different rate-limit window might succeed.

When a cell fails at G2 or G3, the fallback **stops**. The blocker is the task, not the agent — a
second model meets the same wall at double the cost. G2 means the task produced nothing; G3 means it
failed its own definition of done. Neither is a credential problem. Re-dispatch after a G2/G3
failure is a human decision.

---

## Progress reporting and liveness

The generated script embeds the plan's `Est. Time (mins)` column and runs a heartbeat every ~30s:

```
── ⏱️  12m30s elapsed ──
  🔄 5      ~28% of 45m (12m elapsed, CPU 34s)
  🔄 7          OVER est 60m by 2m (CPU 112s)
```

`idle` (time since the log last grew) is **not** a kill signal. Agents buffer while composing — a
thinking cell looks identical to a dead one by idle alone. Use a composite:
- **Live process** (`pgrep -f -- "--id=<id> "`)
- **Advancing CPU time** between samples (`ps -o times=`)

A cell that is **`OVER est` and has flat CPU across two samples** is the real kill signal. Either
alone is not. And a third case the composite still misses: a cell that delegates to sub-agents. Its
parent shows low CPU and a static log while children do the real work. **When both signals look dead,
read the log's last lines before concluding anything** — a delegating agent usually names what it
dispatched.

---

← [Concepts Hub](README.md) · [Home](../README.md)

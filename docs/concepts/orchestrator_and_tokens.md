# The orchestrator — who roots a run, and what it costs

Two questions that turn out to be the same question: **who should type `/wbWork … --wave=A`**, and
**how much of your context does that spend**. The root agent is the one paying, so the answers are
linked.

---

## Who may be the root

**Use Claude Code.** Not because other big thinkers are weak at the job, but because two checks in
`bin/wave.js` are written as *"is it Claude?"* rather than *"is it the orchestrator?"*:

| Coupling | With Claude as root | With another model as root |
|---|---|---|
| 🧠 **Planner cells run in-session** | a big thinker decomposes — correct | that model does it, whatever tier it is |
| **Validation of non-Claude work routes to in-session** | independent — Claude ≠ the executor | inverts to **self-validation** when the root also executed the row |

There is also a blunt mechanical limit: **the root must be able to expand `/wb*` slash-commands.**

| CLI | Expands `/wb*`? |
|---|---|
| `claude` | ✅ |
| `opencode` | ✅ |
| `codex` · `agy` · `gemini` · `copilot` | ❌ — the command is read as literal text |

So a `gemini-3.6-flash-high` terminal is `agy`, and `/wbWork … --wave=A` there does nothing at all.

> **Roles and root are different questions.** `gpt-5.6-terra` as your 🧠 Planner *role* is expected and
> fine — that is what `wb-flow model --pick` is for. `gpt-5.6-terra` as the terminal you launch from is
> not. Delegating a leaf to a cheap model is the design; rooting the tree on one is not.

<!-- ROOT_FALLBACK_TIP_START -->
> [!TIP]
> ### If you hit your Claude limit — a temporary root
>
> **First, drop a tier rather than switching root:**
>
> ```bash
> claude --model sonnet     # or haiku
> ```
>
> Still the `claude` CLI, so slash-commands work and both couplings hold as designed. Claude limits are
> usually per-tier, so Opus running out often does not mean Sonnet has.
>
> **If Claude is fully unavailable**, the only workable alternative is **`codex`, with the template
> inlined** — because codex cannot expand `/wb*`. This is exactly what the wave script already does for
> codex leaf cells:
>
> ```bash
> codex exec -m gpt-5.6-terra \
>   --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
>   "Read .wb/commands/wbWork/wbWork_template.md and execute the procedure described there.
>    Arguments / target: <scope_path> --wave=A -y" \
>   < /dev/null
> ```
>
> `< /dev/null` is **required** — codex reads stdin even when given a prompt argument, and inside a
> script it will otherwise hang.
>
> **Two conditions:**
>
> 1. **Use a big thinker.** The root runs 🧠 Planner and ✅ Validator cells itself — `gpt-5.6-terra` or
>    `gpt-5.6-sol`, never `luna` or a flash tier.
> 2. **The root model must not also appear in your roster as a leaf executor.** The self-validation flip
>    only bites when the root validates a row *it also executed*. Check with `wb-flow model --show`
>    before you start.
>
> **And watch the gates.** The root's real job is classifying cells as INFRA / NO-OP / ATTEMPTED / DONE.
> Re-run each row's `Verify` yourself before ticking a Done box — a gate verdict is a hypothesis, not a
> result.
>
> Fine for a day. Not a new default. Nothing in the code enforces any of this, so the discipline is
> yours.
<!-- ROOT_FALLBACK_TIP_END -->

---

<!-- TOKEN_BUDGET_START -->
## Spending the root's context well

Everything a sub-agent prints can land in the root's context. The levers below are ordered by measured
or structural impact — the first is the only one with a hard number behind it, and it is by far the
largest.

### 1. `--summary` — measured, ~63k tokens on one wave

**Already the default in wave mode.** Without it, every cell streams its whole transcript — template
reads, `ls -la` dumps, ANSI escapes — into the root's context, once per cell.

> Measured on a real 10-cell wave: **63,002 tokens**, of which a single cell was 16,824 — and none of it
> changed a single Done box.

With it, the root sees only `▶ / G1 / G2 / G3 / VERDICT / PER-ID`; full output still goes to one log
file per cell. **Read only the log of a cell that failed.** Drop the flag only while debugging one
specific cell.

### 2. Merge dispatches — one startup context per model, not per cell

When several rows in the same wave share a plan, a role and a routed model, merge them:

```bash
/wbWork <plan> --id=10,13 -M="gemini-3.1-pro-high"     # one agent, two rows
```

instead of two dispatches. The agent pays its start-up context **once**. Gates are still evaluated
per id (`PER-ID: DONE=[10] NO-OP=[13]`), so you lose no verdict granularity — only the parallelism
between those two rows.

### 3. Delegate the leaves

🔨 Worker and 📋 Mechanical rows exist to run *outside* the root. A row you execute in-session spends
root context on work a leaf could have done for none of it. Keep in-session for 🧠 Planner and
✅ Validator, which is what the routing already does.

### 4. Read task reports, not transcripts

Spawned agents get `--no-plan-update` automatically and write a compact
`tasks/task_<N>/task_<N>_report_*.md`. That report — not the run log — is the interface. This is where
the "~80% reduction" figure comes from: the root reads a summary artifact instead of a transcript.

### 5. Preview before you spend

```bash
wb-flow wave <plan.md> --wave=A --list      # resolved routing, roster in effect — dispatches nothing
wb-flow wave <plan.md> --wave=A --print     # the script itself, to stdout
```

Both are read-only. Catching a wrong model or a bad target here costs nothing; catching it after a
10-cell wave costs the wave.

### 6. Narrow the blast radius

```bash
/wbWork <plan> --wave=A:W        # one cell — the Worker column only
/wbWork <plan> --id=5            # one row
```

A full wave when you needed one row is the cheapest mistake to avoid.

### 7. Skip `--as` unless you want the blueprint

`--as="expert,steps"` runs `/wbExplain` **before** each cell, adding one call per cell. It buys a
durable blueprint for the validator to check against — worth it on a hard row, waste on a mechanical
one.

### 8. `--sessions` is *not* automatically cheaper

It reuses a warm opencode session per (scope, model), resumed **and** forked. But a resumed session
**replays its history**, trading a cold re-read for a growing transcript. It can win when the same model
is dispatched repeatedly against one scope, and lose otherwise.

```bash
opencode stats --days 1 --models     # measure before making it habit
```

### What actually drives the bill

| Lever | Basis |
|---|---|
| `--summary` | **measured** — 63,002 tokens on a 10-cell wave |
| Task reports over transcripts | **measured** — the ~80% figure |
| Merged dispatches · leaf delegation · `--list` first · narrowing | **structural** — fewer/shorter agent startups, no measured number |
| `--sessions` | **unknown until you measure it** — can go either way |

Everything below the first two is reasoning about where tokens go, not a benchmark. Treat them as sound
defaults, and measure if a wave surprises you.
<!-- TOKEN_BUDGET_END -->

---

## See also

- [`wave-gating`](wave-gating) — the three-gate verdict contract the root applies
- [`model-fallback-chains`](model-fallback-chains) — how each role's chain is built
- [`cli-subcommands`](cli-subcommands) — `wave`, `model`, `watch` and the rest

---
title: "What's New in wb-flow 1.0.5"
description: "A self-maintaining model catalog, fallback chains on every dispatch flag, and wave matrices that name a role instead of a model."
---

# What's New in `wb-flow` 1.0.5

> Released 2026-09-04 · previous: [1.0.4](_deploy_/release_body_v1.0.4.md) · full log: [CHANGELOG.md](CHANGELOG.md)
>
> Built from [`plan_next_20260902.md`](.wb/workflows/reports/2026/09/02/plans/plan_next_20260902.md)
> (26 rows), [`plan_next_20260903.md`](.wb/workflows/reports/2026/09/03/plans/plan_next_20260903.md)
> (13 rows), and [`plan_next_20260904.md`](.wb/workflows/reports/2026/09/04/plans/plan_next_20260904.md)
> (2 rows). Every row was validated by a **different provider** than the one that wrote it.

---

## Why this release exists

Two subscriptions were added — **opencode Zen** and **Codex Plus** — and both had to be installed by
hand-editing `~/.wb/models.json`.

The reason turned out to be structural. `bin/model.js` **already** enumerated every installed CLI —
691 slugs from `opencode models`, 11 credentialed providers, `agy models`, `grok models` — and used
that only to propose a roster. **Nothing ever wrote it back.** The catalog was a hand-maintained
snapshot with no refresh path, and five hard-coded lists had quietly gone stale around it.

1.0.5 gives the catalog a writer, and removes the lists.

---

## 1 · The catalog maintains itself

```bash
wb-flow model --sync-catalog            # fill from what THIS machine can reach
wb-flow model --sync-catalog --dry-run  # see the diff, write nothing
wb-flow model --add=zen,codex,grok      # fill specific providers
wb-flow model --remove=openrouter       # drop one
```

A run prints what changed and why:

```
| Verdict | Count |
|---|---|
| add | 50 |   keep | 18 |   retire | 15 |   refused | 5 |   reported | 6 |

ℹ️  Credentialed but not in your catalog — add explicitly if you want them:
     wb-flow model --add=nvidia
⚠️  openai: codex models is interactive-only — use --add codex --from-picker
```

**Four guarantees, each there because its absence caused a real failure:**

- **`retire` marks, it does not delete.** A model missing from one enumeration is more often a CLI
  hiccup than a removal, so the entry stays with a `retired` date. `--prune` deletes for real.
- **`refused` protects routing.** A slug your live roster dispatches to is never removed without
  `--force` — deleting one breaks the next wave hours after the sync that caused it.
- **`reported` is consent.** Holding a credential is not wanting work sent there. On a developer
  machine `opencode providers list` shows **11** credentialed providers including `nvidia`, `ollama`
  and `openrouter`; syncing without this would have silently absorbed **520 slugs from 7 providers
  nobody asked for.**
- **`--add` is per-provider transactional.** `--add=zen,codex` fills Zen, reports that codex cannot
  enumerate itself, and exits 0. One provider failing never aborts the others.

### Curation, not a dump

691 slugs is not a picker. Each provider is filtered (`NOT_A_CHAT_MODEL` → family dedupe → tier
collapse → **flat-rate dedupe** → role ranking → cap 12).

The flat-rate rule is the one with money attached: **a metered model whose family a flat-rate pool you
hold already serves is dropped.** Metered marketplaces resell the subscriptions you already pay for —
`claude-fable-5` at $10/$50 per Mtok, `gpt-5.5` at $5/$30 — and routing there is identical capability
at a per-token price. Measured on one machine, that collapsed a 62-slug marketplace to **5**.

It is derived from *your* held pools, never a blocklist: a user **without** a Claude subscription
keeps the metered Claude, because for them it is the only route to it.

### Codex, which cannot enumerate itself

`codex models` exists but is interactive-only — piped it exits *"stdin is not a terminal"*; through a
pty it renders nothing. So its own picker text is the source of truth:

```bash
codex models                                  # copy what it prints
wb-flow model --add codex --from-picker       # paste on stdin, then Ctrl-D
```

Each model is stamped `verified` + `checkedAt`, and `detect()` prefers that over the built-in seed
from then on. `--add codex --probe` is the alternative and **costs real API calls**, so it never runs
under a plain `--sync-catalog`.

---

## 2 · Dispatch flags take a fallback chain

```bash
/wbWork $P --id=1 -M=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high
```

Links are tried left to right, advancing **only on a Gate-1/INFRA failure** — the agent never ran, so
another is worth trying. A Gate-2/Gate-3 failure is the *task* failing, and a second model meets the
same wall at double the spend. The executed model is reported per attempt.

**Every link is validated when the flag is parsed**, not when it is reached. A chain whose third entry
is a typo used to look healthy until the head rate-limited, hours in, and the fallback died on a name
nobody had checked.

> **This fired for real during development.** A SuperGrok balance hit `402 Payment Required`
> mid-plan; the chain's next entry was on a different provider and the work continued. Before this
> release, `-M` held one opaque string and that dispatch would simply have ended.

---

## 3 · Wave matrices name a role, not a model

```bash
P=path/to/plan.md
WORKER=openai/gpt-5.5,anthropic/claude-fable-5,gemini-3.1-pro-high
/wbWork $P --id=1,2 -M=$WORKER
```

The four roles are declared once in a plan's `## 🎛️ Active Model Roster` section, above the task
table — because the table's `Suggested` columns consume it too.

**A cell naming one model is wrong the moment a subscription changes**, and the matrix is regenerated
on every `--embed`, so the staleness returns as fast as it is fixed. One plan named a provider's
models for two roles for **ten days**, including a month in which that subscription had lapsed.

`wb-flow lint` gains **step-7**, which fails on roster drift and on cells sharing a wave, role and
routed model that were not merged into one `--id=X,Y` dispatch.

---

## 4 · The shipped catalog is now a skeleton

`templates/models.json` ships providers, pools and `(auto)` aliases — **zero concrete model names.**

It was previously byte-identical to a developer's personal catalog, so every install inherited someone
else's subscriptions. That does not fail at install; it fails much later as a wave cell dying at
Gate 1 with `Model not found`. `wb-flow init` now fills the catalog from your own CLIs, reusing the
enumeration it already runs for the roster.

---

## 5 · Validation crosses the provider boundary

The executor≠validator rule used to compare **model names**. That is not enough: two models from one
house share a trainer, a tokenizer and a family of failure modes, so `claude-opus-5` graded by
`claude-sonnet-5` is an echo chamber that has only changed its voice.

The rule now compares **billing pools**. When a validation is routed, `crossProviderPick()` resolves
the executor's pool through the same `poolOf()` classifier everything else uses and walks the
validator's chain for the first entry from a different pool:

```
executor anthropic/claude-opus-5  (claude-pro)  ->  validator openai/gpt-5.6-terra     (chatgpt)
executor openai/gpt-5.5           (chatgpt)     ->  validator anthropic/claude-sonnet-5 (claude-pro)
```

The choice is made **per executor**, so your roster does not need four heads from four pools — which
matters, because with a lapsed subscription there are usually fewer usable pools than roles.

When the chain offers no alternative the head runs anyway, and the dispatch line says so:
`same-provider validation — chain offers no alternative`. An unavoidable exception is fine; a silent
one is the defect, because afterwards it reads exactly like an independent pass.

> **An explicit `-M=` is still honoured verbatim and is not pool-checked** — it is an operator
> override, and overrides are taken as given. If you pass a chain whose head shares the executor's
> pool, `wave_router.js`'s `sameProviderWarning()` now says so in the routing reason rather than
> letting it pass silently — but the dispatch still runs. Check the pool yourself when you pass
> `-M=`.

---

## 6 · A written plan trust model, a sandboxed dispatch mode, and a real no-op gate

Every dispatch this tool generates hands a plan file's task text and its `Verify` cell — both
executable — to a model running with approvals and sandbox explicitly disabled, then judges the
result with an oracle taken from that same file. Two things demonstrated why that needed a decision:
a task description containing a shell payload produced a wave script that executed it, and separately
a bare `Verify` cell proved to be a deterministic shell-execution sink with no model in the loop at
all — its side effect gets scored as its own proof of success.

**[The plan trust model](docs/concepts/plan-trust-model.md)** writes down the contract: plan text and
the `Verify` column are untrusted, executable input, judged by the same file that supplies the work
order. Two mitigations implement it:

```bash
wb-flow wave <plan.md> --wave=A --sandbox      # dispatch without permission/sandbox bypass flags
```

- **`--sandbox`** omits the bypass flags (`--dangerously-skip-permissions`,
  `--dangerously-bypass-approvals-and-sandbox`, and their equivalents) across all seven lanes. A
  refusal under `--sandbox` is reported as `REFUSED`, never scored `PASS` — `agy` in particular
  auto-denies every tool headlessly without the bypass and would otherwise silently no-op.
- **A real content-hash no-op gate** replaces the old check, which compared `bin/`-only file mtimes
  and only printed a line nothing consumed. It now diffs workspace content — excluding each task's
  own report folder, so a written report can never masquerade as real work — and feeds a `NO-OP`
  verdict into the wave's own scoring.

---

## Fixed

- **`CODEX_VERIFIED` was missing `gpt-5.6-sol`** — Codex's own *default* model — and `gpt-5.4`, while
  the shipped catalog advertised `gpt-5.3-codex`, which Codex Plus does not serve.
- **`agy models` output was stored with its display name attached**, so rosters written by `init`
  could name a model that does not exist.
- **`familyOf()` did not strip `lite` or `spark`**, letting metered duplicates of `gemini` and `gpt`
  survive a curated list that had just dropped their siblings.
- **`sync_docs.js` reported 30 permanent conflicts** on generated command indexes — a comparison of
  derived output against its own source, which could never be resolved.
- **`wb-flow model --pick` could not start**: a local variable shadowed the `activeProviders()`
  helper, so Step 0 threw `TypeError`.
- **`poolOf()` had no `openai` prefix rule**, so `openai/*` slugs fell through to a phantom pool
  `openai` that no catalog entry uses — while the catalog's own `openai` provider carries
  `pool: "chatgpt"` and holds exactly those slugs. Cross-provider validation therefore treated an
  `openai/*` executor and `Codex (auto)` as two independent houses when they are one ChatGPT
  subscription, and `--sync-catalog` would have written `pool: "openai"` back over the correct
  `chatgpt`.
- **`bin/model.js.bak` was shipping to every user** — an 86 KB, 1 902-line backup artifact, twelve
  days stale and referenced by nothing, packed into the tarball at ~12% of its unpacked size.
  `files[]` allowed all of `bin/` with two hand-written negations, neither covering `*.bak`. It is
  gone, and `prepublishOnly` now refuses a tarball containing `*.bak`, `*.orig`, `*.rej` or `*~` —
  a negation list is what let this through, so the fix is an assertion, not another negation.

---

## Upgrading

Nothing is required. On first run after upgrading:

```bash
wb-flow model --sync-catalog --dry-run   # see what would change
wb-flow model --sync-catalog             # apply it
```

Your existing `~/.wb/models.json` is **merged, never replaced**: models you added by hand are kept,
models the CLIs no longer serve are **marked** `retired` rather than deleted, and anything your live
roster dispatches to is refused removal without `--force`. The write is atomic and keeps the previous
file as `.bak`.

**New to the roster?** [`docs/start_here/tutorial_setting_the_roster.md`](docs/start_here/tutorial_setting_the_roster.md)
covers building a chain by hand — what the model tiers mean, and why the best model belongs on the
Validator rather than on the code.

---

## How this release was built

Worth stating, because it shaped the result: **every row was validated by a different provider than
the one that wrote it.** That caught defects a same-provider review would likely have passed —
a hollow duplicate-detector that could not see its own defect, a curated list keeping the models it
was written to drop, a `--json` flag emitting non-JSON, and a `TypeError` that made the interactive
picker unreachable.

It also produced two false findings, both traced to the validator's sandbox being unable to spawn the
CLIs it was measuring. Cross-provider validation buys independence; it does not buy an identical
environment, and an acceptance check has to say which environment it needs.

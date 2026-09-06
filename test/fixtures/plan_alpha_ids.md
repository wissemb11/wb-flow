---
type: plan
emits: mixed
scope: deployement/packages/wb-flow/next/
date: 2026-08-03
---

> 🗄️ **ARCHIVED 2026-09-06** — this file is history, not live state.
> Superseded by [plan_next_20260905.md](../../../../../reports/2026/09/05/plans/plan_next_20260905.md).
> Moved from `.wb/workflows/reports/2026/08/03/plans` by `wb-flow archive`. Links to files that moved with it still resolve (`archives/` mirrors `reports/` depth); links to still-live reports do not.

# Plan Backlog: wb-flow-next — 2026-08-03

> [!IMPORTANT]
> ## 📑 This file holds TWO entries. The live one is Entry #2.
>
> | Entry | Rows | State |
> |---|---|---|
> | **#1 — 1.0.2 release** (below) | `1`–`30` | ✅ **CLOSED** — 30/30 done, 30/30 validated |
> | **[#2 — `core/docs` repair](#-plan-entry-2--coredocs-repair-claude-opus-5--1916)** | **`D0`–`D7`** | 🔄 **OPEN** — D0, D3, D7 done; D1, D2, D4, D5, D6 remain |
>
> **If you were dispatched with `--id=D<n>` or `--wave=D/E/F/G`, your row is in Entry #2**, near the
> end of this file — not in the `1`–`30` table below. Entry #1's completion text applies to Entry #1
> only. *(Added 2026-08-03 after two wave-E cells read the first table, concluded "there is no task
> D4 in this plan", and returned NO-OP.)*

> **Target:** [deployement/packages/wb-flow/next/](../../../../../../../)
> **Source:** deferred findings from [plan_wb-flow-next_20260802.md](../../../08/02/plans/plan_wb-flow-next_20260802.md) (20/20 done, 17/20 valid)
> **Origin Command:** `/wbPlan deployement/packages/wb-flow/next/core/ --task="fix the 4 wave.js harness bugs, task 7 §1 idempotence, and add tests for wb-flow watch"`
> **Model:** Claude Opus 5 · **Client:** Claude Code · **Time:** 2026-08-03

> [!IMPORTANT]
> **Scope correction — `core/` → `next/`.** The command named `core/`, but one of the three requested
> items lives outside it: `sync_docs.js` is at
> `documentation/flow.wbc-ui.com/scripts/`. A `core/`-scoped plan cannot own a task that writes to a
> sibling tree — the exact cross-tree problem [task 1 of the 08-02 plan](../../../08/02/plans/tasks/task_1/task_1_report_wb-flow-next_20260802.md)
> was created to resolve. Scoped at `next/` instead, which contains both. Tasks 1–6 and 8–9 are
> `core/`-only; **task 7 is the sole `documentation/` row.**

## 🎯 Goal

**One plan, three workstreams, in dependency order.** Merged 2026-08-03 from three separate files so
the release cannot drift from the harness work that justifies it, and the broadcast cannot drift from
the release it announces.

| Workstream | Tasks | State |
|---|---|---|
| **1 · Harness correctness** — make wave verdicts trustworthy, then prove it with tests | **1–10** | ✅ **CLOSED** (10/10 done, 10/10 valid) |
| **2 · Release 1.0.2** — drop `-r01`, complete the CHANGELOG and release notes, retire the stale banner | **11–19** | ✅ **9/9 done** — 🚦 gate 18 passed; workstream 2 **complete** |
| **3 · Publish & announce** — `_deploy_` runbooks, npm/GitHub/site prep, LinkedIn carousel + post | **20–30** | ✅ **COMPLETE** — 11/11 done and validated |

## 🚦 Who runs what

**Agents prepare. You publish.** Four steps are irreversible, outward-facing, or need credentials no
agent has — and **no task below runs any of them**:

| Step | Why it is yours |
|---|---|
| `npm publish` | your credentials; **unpublish is impossible after 72 h** |
| GitHub release / tag | **git commands are forbidden in this project** — text is prepared for you |
| VPS deploy | your SSH to the host |
| LinkedIn post | your account, your voice, public and permanent |

## 📊 Measured baseline (2026-08-03)

| Signal | Value |
|---|---|
| Spawned cells in the 08-02 session | **11** |
| …misclassified by the harness | **7 false negatives + every validator cell** |
| `wbValid` cells emitting any `G2`/`G3` gate | **0** (worker cells emit 7) |
| `wave.js` writes `_meta` / `__EXIT__` | **neither** — both mandated by `output_conventions` |
| `wb-flow watch` test coverage | **0** |
| Site topics served twice (merged + `_partN`) | **18** |
| `core/` test setup | `test/smoke.js`, hand-rolled asserts, **zero devDeps** |

**The four bugs, each located:**

| Bug | Site | Effect |
|---|---|---|
| 1 · pipeline PID | [`wave.js:1175`](../../../../../../../core/bin/wave.js#L1175) — `PIDS+=($!)` after `… \| tee \| grep &` captures the **grep**, not the agent | wave prints "all cells finished" while agents still run |
| 2 · oracle cwd | [`wave.js:1058`](../../../../../../../core/bin/wave.js#L1058) — `cd "$REPO"`, then G3 runs plan-relative paths | **false negatives**: `exit 2` from repo root, `exit 0` from the plan dir |
| 3 · ungated validators | [`wave.js:891`](../../../../../../../core/bin/wave.js#L891) — `gated = (isWbWork \|\| isWbExplain)` | **false positives**: `wbValid` passes on G1 alone |
| 4 · routing divergence | `--list` vs the generator | `--list` said `opencode/kimi`; the script ran `agy --model claude-opus-4-6-thinking`, which then ran **Gemini 3.1 Pro** |

---

## ━━━ TASK LIST ━━━

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [1](tasks/task_1/task_1_report_wb-flow-next_20260803.md) | 🧠 Planner | — | <span title="Run: /wbExplain --id=1 --as=expert">📄</span> | **Write the harness regression-test scaffold spec.** Bugs 1–4 are all *generator output* defects, so they are testable without spawning a single agent: generate a script from a fixture plan and assert on its text. Define `test/fixtures/plan_fixture.md` (one row per role, plan-relative Verify cells, populated `Est. Time`), the assertion helper shape, and which of the four bugs each assertion pins. Zero devDeps — match `test/smoke.js` style. | `human: spec names the fixture, the helper API, and one assertion per bug` | P0 | 40 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5 | ✅ 8/10<br>kimi-k2.7-code<br><sub>scaffold files not yet materialised — by design, task 2 creates them</sub> |
| [2](tasks/task_2/task_2_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=2 --as=expert">📄</span> | **Fix bug 1 — capture the agent PID, not the pipeline tail.** `PIDS+=($!)` records the last stage of `( … ) \| tee \| { grep …; } &`. Restructure so the dispatch subshell's own PID is recorded (e.g. redirect through process substitution — `( … ) > >(tee "$log" \| grep …) &` — or capture `$!` from the subshell and tee inside it). **Regression guard:** the generated script must `wait` on a PID whose process is the `wbRun`/`opencode` dispatch. | `node ../../../../../../../core/test/wave_gates.js --only=bug1` | P0 | 50 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>kimi-k2.7-code |
| [3](tasks/task_3/task_3_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=3 --as=expert">📄</span> | **Fix bug 2 — run each G3 oracle from the plan's own directory.** Verify cells use paths relative to the plan file; the script `cd "$REPO"` first, so every oracle escapes the tree. Emit the G3 invocation with an explicit `cd <planDirRel>` (the value is already computed as `planDirRel`). Measured proof of the bug: task 5's oracle exits **2** from repo root, **0** from the plan dir. | `node ../../../../../../../core/test/wave_gates.js --only=bug2` | P0 | 45 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>kimi-k2.7-code |
| [4](tasks/task_4/task_4_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=4 --as=expert">📄</span> | **Fix bug 3 — gate `wbValid` cells.** `gated = (isWbWork \|\| isWbExplain)` excludes `wbValid`, so a validator that writes nothing still reports `VERDICT: DONE` (observed twice). Extend gating: **G2** = the row's task report gained a `## ✅ Validation` section (or a `<scope>` validation artifact exists); **G3** = the plan's `☐ Valid` cell for that id is non-`⬜`. A validator that no-ops must land `NO-OP`, never `DONE`. | `node ../../../../../../../core/test/wave_gates.js --only=bug3` | P0 | 60 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 10/10<br>kimi-k2.7-code |
| [5](tasks/task_5/task_5_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=5 --as=expert">📄</span> | **Fix bug 4 — make `--list` and the generator share one routing function.** They diverge today: `--list` reported `opencode opencode-go/kimi-k2.7-code`, the emitted script ran `agy -p --model claude-opus-4-6-thinking`. Extract the routing decision into a single pure function returning `{lane, cli, model, reason}`; have both call it. `--list` must become a faithful preview. | `node ../../../../../../../core/test/wave_gates.js --only=bug4` | P0 | 55 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro<br><sub>assertion strengthened by orchestrator</sub> | ✅ 9/10<br>kimi-k2.7-code |
| [6](tasks/task_6/task_6_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=6 --as=expert">📄</span> | **Emit `_meta` and `__EXIT__`, which `output_conventions` mandates and `wave.js` never wrote.** `_meta` (COMMAND / WAVE / KIND / EXECUTOR / DISPATCH / PLAN) makes a status snapshot self-describing; `__EXIT__=<rc>` per cell is the only unambiguous completion marker — without it a killed cell is indistinguishable from a running one. `wb-flow watch` already reads both when present. | `node ../../../../../../../core/test/wave_gates.js --only=meta` | P1 | 35 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>kimi-k2.7-code |
| [7](tasks/task_7/task_7_report_wb-flow-next_20260803.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=7 --as=expert">📄</span> | **Implement transform-spec §1 idempotence in `sync_docs.js`** *(the one `documentation/` row)*. Spec §1 requires: if `<T>.md` exists **and** `<T>_partN.md` exists, the parts are stale residue → delete them. Only 12 of 48 were dropped, and the run **created** a new duplicate (`_specs/command_composition_spec_v1.md`), leaving **18 topics served twice**. The transform is also non-idempotent (`update` 47 → 68 after one pass), so re-running compounds it. Fix both: emit-merge implies drop-parts, and a second run must be a no-op. | `cd ../../../../../../../documentation/flow.wbc-ui.com && node scripts/sync_docs.js --dry-run --json \| node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);process.exit(r.add===0&&r['orphan-drop']===0&&r.update===0?0:1)})"` | P1 | 70 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro<br><sub>2 regressions repaired by orchestrator</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>−1: 248-file conflict bucket unexplained</sub> |
| [8](tasks/task_8/task_8_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=8 --as=expert">📄</span> | **Add `test/watch.js` — `wb-flow watch` currently has zero tests.** Its plan-table parse is the same unescaped-pipe read that broke `watch.sh`'s predecessor. Cover: `Est. Time` parsed correctly from a row whose **Verify cell contains `\|`** (the regression that matters), run-dir discovery + newest-first ordering, the three cell states incl. `⚠️ ENDED`, `--list` and `-1` exiting 0, and `--run=` on a missing run exiting non-zero. Hand-rolled asserts, zero devDeps. | `node ../../../../../../../core/test/watch.js` | P1 | 60 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>3 dispatch failures — see report</sub> | ✅ 9/10<br>kimi-k2.7-code |
| [9](tasks/task_9/task_9_report_wb-flow-next_20260803.md) | 📋 Mechanical | 2, 3, 4, 5, 6, 8 | <span title="Run: /wbExplain --id=9 --as=expert">📄</span> | **Wire the new suites into `npm test`** so they run in `prepublishOnly`. Today `test` is `node test/smoke.js && node bin/verify-wrappers.js`; append `wave_gates.js` and `watch.js`. A harness-correctness test that nothing runs is decoration. | `cd ../../../../../../../core && npm test` | P2 | 20 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Claude Opus 5 | ✅ 10/10<br>kimi-k2.7-code |
| [10](tasks/task_10/task_10_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=10 --as=expert">📄</span> | **Fix bug 5 — put the plan in the session key.** `sessionKeyFor(scope, model)` omits the plan, so `--sessions` resumed an 08-02 conversation for an 08-03 dispatch: two cells executed the **wrong plan's** tasks and a third **overwrote a validated task report**. Add `path.basename(planPath, ".md")` to the key. Until this lands, `--sessions` is unsafe in any scope holding more than one plan. | `node ../../../../../../../core/test/wave_gates.js --only=bug5` | P0 | 30 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>383 tests green; a test that pinned the bug was updated</sub> | ✅ 10/10<br>kimi-k2.7-code |
| [11](tasks/task_11/task_11_report_wb-flow-next_20260803.md) | 🧠 Planner | — | <span title="Run: /wbExplain --id=1 --as=expert">📄</span> | **Decide the CHANGELOG shape for a `1.0.2` that had a `1.0.2-r01` prerelease.** In semver `1.0.2-r01` *precedes* `1.0.2`, so its entries are part of what 1.0.2 ships — they are not a separate past release. Choose: (a) fold `[Unreleased]` **and** `[1.0.2-r01]` into one `## [1.0.2] - 2026-08-03`, or (b) keep `[1.0.2-r01]` as history and open `[1.0.2]` above it. Decide once, in writing; tasks 2 and 3 both depend on the answer. | `human: the report states the chosen shape and the reason` | P0 | 25 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5 | ✅ 9/10<br>Claude Opus 5<br><sub>🧠 Planner self-validation (exemption)</sub> |
| [12](tasks/task_12/task_12_report_wb-flow-next_20260803.md) | 📋 Mechanical | 11 | <span title="Run: /wbExplain --id=2 --as=expert">📄</span> | **Drop `-r01` across the 4 files.** `core/package.json` (the `version` field), `core/README.md`, `core/CHANGELOG.md`, `core/docs/README.md` — one occurrence each. `package.json` is the only one that changes publish behaviour; the other three are prose that would contradict it. | `[ "$(node -p "require('../../../../../../../core/package.json').version")" = "1.0.2" ] && [ "$(grep -rl '1\.0\.2-r01' ../../../../../../../core/README.md ../../../../../../../core/docs/README.md 2>/dev/null \| wc -l)" -eq 0 ]` | P0 | 15 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5<br><sub>−1: report self-attributes to "Claude Sonnet 4"; the cell ran on deepseek-v4-pro</sub> |
| [13](tasks/task_13/task_13_report_wb-flow-next_20260803.md) | 🔨 Worker | 11 | <span title="Run: /wbExplain --id=3 --as=expert">📄</span> | **Add this session's work to the CHANGELOG — the gap the request did not name.** Currently **zero** entries for: the **`wb-flow watch`** subcommand (new), and the five `wave.js` harness fixes — pipeline-PID (`--summary` returned before agents finished), G3 oracle cwd (7 false negatives), ungated `wbValid` cells (every validator reported DONE), `--list`↔generator routing divergence, and the `(scope, model)` session key that made two plans share one conversation. Also the docs-site search and the Command Glossary. Follow the existing `#### 🔌 Added / 🐛 Fixed / 🔄 Changed` structure. | `for k in "wb-flow watch" "session key" "three-gate"; do grep -qiF -- "$k" ../../../../../../../core/CHANGELOG.md \|\| exit 1; done` | P0 | 55 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5<br><sub>−1: no pre-edit copy survives, so the full-file rewrite is verified structurally, not byte-for-byte</sub> |
| [14](tasks/task_14/task_14_report_wb-flow-next_20260803.md) | 🔨 Worker | 11 | <span title="Run: /wbExplain --id=4 --as=expert">📄</span> | **Add the 9 missing features to `core/docs/new.md`** — edit **upstream**, never the site copy (both files are `skip`/byte-identical, so a site-side edit is reverted by the next `sync_docs.js`). Cover the six `wb-flow` subcommands **by name**, `--summary`, `--sessions`, and the three-gate contract. Then extend the **v1.0.1 vs v1.0.2 comparison matrix** — it has 7 rows and none mention a subcommand. | `for k in "wb-flow init" "wb-flow model" "wb-flow wave" "wb-flow watch" "wb-flow snap" "wb-flow next" "--summary" "--sessions" "three-gate"; do grep -qF -- "$k" ../../../../../../../core/docs/new.md \|\| { echo "missing: $k"; exit 1; }; done` | P0 | 65 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro<br><sub>⚠️ harness credited `gemini-3.1-pro-high` — see wave note 9</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>−1: the **worker** wrote a `## ✅ Validation` heading into its own report — the exact artifact bug 3's G2 gate reads</sub> |
| [15](tasks/task_15/task_15_report_wb-flow-next_20260803.md) | 🔨 Worker | 14 | <span title="Run: /wbExplain --id=5 --as=expert">📄</span> | **Mirror the 9 into `core/docs/detailed_news.md` at technical depth.** `new.md` is the announcement; this is the reference — flags, exit codes, and the *reason* each exists. The three-gate section must state why output text is never a success signal, and the `--sessions` section must carry the bug-5 warning (a resumed session's history outranks the command line). | `for k in "wb-flow watch" "wb-flow snap" "--sessions" "three-gate"; do grep -qF -- "$k" ../../../../../../../core/docs/detailed_news.md \|\| exit 1; done` | P1 | 55 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro<br><sub>⚠️ harness credited `gemini-3.1-pro-high` — see wave note 12</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>bug-5 warning + "output text is never a success signal" both present as the row demanded</sub> |
| [16](tasks/task_16/task_16_report_wb-flow-next_20260803.md) | 📋 Mechanical | — | <span title="Run: /wbExplain --id=6 --as=expert">📄</span> | **Remove the stale v1.0.1 banner** from the site's `docs/index.md`. It reads *"These docs describe wb-flow v1.0.1 · has not yet been resynced to v1.0.2"* — false since the sync landed (`wbModel/` has its 9 pages; the r01 concept pages are live). **This file is `skip`-class and site-authored: edit it in place, not upstream.** Removing it also retires task 3 of the 08-02 plan, whose oracle pins the banner's *sentence* and would then fail — update that row to `🚫 Cancelled` with a pointer here. | `! grep -q "has not yet been resynced" ../../../../../../../documentation/flow.wbc-ui.com/docs/index.md` | P0 | 20 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus<br><sub>2nd half completed by orchestrator</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>3rd party as required; all 4 checks re-measured</sub> |
| [17](tasks/task_17/task_17_report_wb-flow-next_20260803.md) | 📋 Mechanical | 14, 15, 16 | <span title="Run: /wbExplain --id=7 --as=expert">📄</span> | **Sync upstream edits to the site and rebuild.** `node scripts/sync_docs.js` (idempotent since 08-03), then `npm run build`. Link checking is **live** via the scoped `ignoreDeadLinks` allowlist, so a broken anchor fails the build rather than passing silently. | `cd ../../../../../../../documentation/flow.wbc-ui.com && node scripts/sync_docs.js >/dev/null && npm run build` | P0 | 25 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 9/10<br>Claude Opus 5<br><sub>build verified by content, not exit code: sections 9–11 live in `detailed_news.html`, 7–8 in `new.html`</sub> |
| [18](tasks/task_18/task_18_report_wb-flow-next_20260803.md) | ✅ Validator | 12, 13, 17 | <span title="Run: /wbExplain --id=8 --as=expert">📄</span> | **Pre-publish gate.** Assert together: version is exactly `1.0.2` everywhere; `npm test` green (435 assertions); `npm pack --dry-run` leaks no `src/`, `pro/`, `test/` or `.wb/`; `prepublishOnly` runs `verify-roster`; the shipped roster is neutral (no personal model slugs). **This is the last point at which a mistake is cheap** — npm publishes are not retractable after 72 h. | `cd ../../../../../../../core && npm test >/dev/null 2>&1 && npm pack --dry-run 2>&1 \| grep -qE 'npm notice.*(src/\|/pro/\|test/\|\.wb/)' && exit 1 \|\| true` | P0 | 30 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>🟢 clear to publish · 1 judgment call for the owner (roster prose)</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>⚠️ cell scored INFRA by the `wbRun` guard **after** it finished — see task 20 report</sub> |
| [19](tasks/task_19/task_19_report_wb-flow-next_20260803.md) | 📋 Mechanical | 12 | <span title="Run: /wbExplain --id=9 --as=expert">📄</span> | **Three low-cost positioning fixes** (from an external README review; the reviewer's wholesale rewrite was **rejected** — see Wave notes). **(a)** Add npm keywords `cursor-rules`, `prompt-engineering`, `ai-coding`, `llm-cli` — discovery terms devs actually search; the existing 15 already cover `claude-code`/`cursor`. **(b)** Move the framework-agnostic disclaimer from **line 251 of 266** to above the fold — with the package named `wb-flow`, docs at `flow.wbc-ui.com`, and a shared author with `wbc-ui`, *"is this locked to a Vue ecosystem?"* deserves an answer before the About section. **(c)** Add `CONTRIBUTING.md` — absent, and expected on a public repo. **Dep 2: both write `README.md` + `package.json`.** | `node -p "require('../../../../../../../core/package.json').keywords.includes('cursor-rules')" \| grep -q true && [ -f ../../../../../../../core/CONTRIBUTING.md ] && [ "$(grep -in 'framework-agnostic' ../../../../../../../core/README.md \| head -1 \| cut -d: -f1)" -lt 40 ]` | P2 | 25 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 8/10<br>Claude Opus 5<br><sub>−2: reported PASS against an oracle it had widened itself; the plan's oracle was genuinely defective (case-sensitive) and is now repaired — see wave note 13</sub> |
| [20](tasks/task_20/task_20_report_wb-flow-next_20260803.md) | ✅ Validator | 12, 13, 16 | <span title="Run: /wbExplain --id=1 --as=expert">📄</span> | **🚦 Gate: confirm the release workstream (tasks 11–19) is finished.** Assert `package.json` is exactly `1.0.2`, `npm test` is green, the CHANGELOG has a `[1.0.2]` heading and mentions `wb-flow watch`, and the site banner is gone. **Tasks 21–30 may not start until this passes.** | `[ "$(node -p "require('../../../../../../../core/package.json').version")" = "1.0.2" ] && grep -q '\[1\.0\.2\]' ../../../../../../../core/CHANGELOG.md && grep -qF 'wb-flow watch' ../../../../../../../core/CHANGELOG.md && ! grep -q 'has not yet been resynced' ../../../../../../../documentation/flow.wbc-ui.com/docs/index.md` | P0 | 15 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>🟢 PASS — workstream 3 open; 9/9 rows done+valid</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>⚠️ cell scored INFRA by the guard after finishing — see note 20</sub> |
| [21](tasks/task_21/task_21_report_wb-flow-next_20260803.md) | 🧠 Planner | 20 | <span title="Run: /wbExplain --id=2 --as=expert">📄</span> | **Decide the `_deploy_/` refresh strategy.** The request says "update the file names", but 3 of 4 files carry **1.0.1-specific content** — `release_roadmap_v1.0.1.md` alone is 1,217 lines of "Previous: 1.0.0-r01 · Target: 1.0.1", VPS setup steps already done once, and dated procedures. **Renaming without rewriting produces a file that lies about itself.** Classify each of the 4: *version-scoped* (rewrite + rename) vs *evergreen* (keep, maybe touch up). State which parts of the 1,217-line roadmap are one-time setup already completed and should NOT be repeated. | `human: the report classifies all 4 files and says which roadmap sections are one-time-only` | P0 | 40 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>split by lifetime, not version — ~950 of 1 217 lines are one-time infra</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>🧠 Planner self-validation (exemption)</sub> |
| [22](tasks/task_22/task_22_report_wb-flow-next_20260803.md) | 🔨 Worker | 21 | <span title="Run: /wbExplain --id=3 --as=expert">📄</span> | **Refresh `_deploy_/` per task 2.** Produce a `1.0.2` publish guide and roadmap that reflect what is *actually* true now: the package is `wb-flow` on npm, `files[]` is set, `prepublishOnly` runs 435 assertions + `verify-roster`, the VPS and Docker stack already exist. Drop steps that were one-time 1.0.1 setup. | `[ -f ../../../../../../../core/_deploy_/infrastructure_setup_DONE.md ] && [ ! -f ../../../../../../../core/_deploy_/release_roadmap_v1.0.1.md ] && [ ! -f ../../../../../../../core/_deploy_/session_resume.md ] && ! grep -rqF 'Target: 1.0.1' ../../../../../../../core/_deploy_/`<br><sub>🔧 **repaired 2026-08-03** — the original required a `1.0.2`-named file in `_deploy_/`, which **task 21's decision explicitly forbade** (task 24 owns the publish guide). It also could not see the `session_resume.md` deletion task 21 ordered. See note 22.</sub> | P1 | 60 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5<br><sub>executed task 21's decision exactly; scored ATTEMPTED by an oracle **I** left contradicting it</sub> |
| [23](tasks/task_23/task_23_report_wb-flow-next_20260803.md) | ✅ Validator | 20 | <span title="Run: /wbExplain --id=4 --as=expert">📄</span> | **npm pre-flight — the last cheap moment.** `npm pack --dry-run`: assert no `src/`, `/pro/`, `test/`, `.wb/` in the tarball; `files[]` present; `LICENSE` + `README.md` + `CHANGELOG.md` included; version `1.0.2`; `npm view wb-flow version` to confirm 1.0.2 is not already taken. **Does not publish.** | `cd ../../../../../../../core && npm pack --dry-run 2>&1 \| grep -qE 'npm notice.*(src/\|/pro/\|test/\|\.wb/)' && exit 1 \|\| npm test >/dev/null 2>&1` | P0 | 30 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>🟢 10/10 assertions; `1.0.2` unclaimed on npm (E404)</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>3rd party via `wave_M2`; all 10 assertions re-measured</sub> |
| [24](tasks/task_24/task_24_report_wb-flow-next_20260803.md) | 📋 Mechanical | 22, 23 | <span title="Run: /wbExplain --id=5 --as=expert">📄</span> | **Write the publish runbook — commands for *you* to run.** One file: the exact `npm publish` invocation, the GitHub release steps (**as text — this project forbids running git**), the tag name, and a rollback note (`npm deprecate`, since unpublish dies at 72 h). Every command copy-pasteable, each with its expected output so a wrong result is recognisable. | `[ -f ../../../../../../../core/_deploy_/publish_wb-flow_20260803.md ] && grep -qF 'npm publish' ../../../../../../../core/_deploy_/publish_wb-flow_20260803.md` | P0 | 35 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 9/10<br>Claude Opus 5<br><sub>6 read-only pre-flight steps; git steps as human text per the row</sub> |
| [25](tasks/task_25/task_25_report_wb-flow-next_20260803.md) | 📋 Mechanical | 20 | <span title="Run: /wbExplain --id=6 --as=expert">📄</span> | **Build the site and verify the artifact locally.** `npm run build` in `documentation/flow.wbc-ui.com/`, assert exit 0 with **live dead-link checking** (the scoped `ignoreDeadLinks` allowlist), the search index is emitted and non-empty, and `dist/` contains the 1.0.2 release-notes pages. Deploy itself is yours — this proves the artifact is good before it leaves the machine. | `cd ../../../../../../../documentation/flow.wbc-ui.com && npm run build >/dev/null 2>&1 && [ -f docs/.vitepress/dist/index.html ] && ls docs/.vitepress/dist/assets/chunks/@localSearchIndexroot*.js >/dev/null 2>&1` | P1 | 25 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 9/10<br>Claude Opus 5<br><sub>build 16.6 s, search index emitted, oracle re-run green</sub> |
| [26](tasks/task_26/task_26_report_wb-flow-next_20260803.md) | 📋 Mechanical | 25 | <span title="Run: /wbExplain --id=7 --as=expert">📄</span> | **Write the website deploy runbook.** The VPS (194.163.135.30), the 3 Docker containers (`flow-nginx`, `flow-umami`, `flow-umami-db`), the rsync/copy of `dist/`, and a post-deploy check list — including "does the version banner say 1.0.2" and "does search work in a browser", the one thing no local check covers. | `grep -qF '194.163.135.30' ../../../../../../../core/_deploy_/ * 2>/dev/null \|\| grep -rqF 'flow-nginx' ../../../../../../../core/_deploy_/` | P2 | 25 | `opencode-go/qwen3.7-plus` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Qwen 3.7 Plus | ✅ 9/10<br>Claude Opus 5<br><sub>35 host/container refs; post-deploy banner + browser-search checks</sub> |
| [27](tasks/task_27/task_27_report_wb-flow-next_20260803.md) | 🧠 Planner | 20 | <span title="Run: /wbExplain --id=8 --as=expert">📄</span> | ⚠️ **OUT-OF-TREE.** **Decide the carousel approach — no generator exists.** The 13 v1.0.1 slides (2400×1900 PNG) have **no committed script**. Choose: (a) write a reusable generator (HTML→PNG or SVG→PNG) and regenerate all slides, (b) hand-author only the *changed* slides and splice the PDF, or (c) a shorter 1.0.2-delta carousel (6–8 slides) rather than a full 13. Also decide **the story**: 1.0.2's headline is the CLI surface (`wave`, `model`, `watch`, `snap`) and the three-gate contract — a different pitch from 1.0.1's "the missing row". | `human: the report picks an approach with its reason, and states the 1.0.1→1.0.2 delta story` | P0 | 45 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>premise corrected — a generator **does** exist in wb-jobs; port it, 8-slide delta deck</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>🧠 Planner self-validation (exemption)</sub> |
| [28](tasks/task_28/task_28_report_wb-flow-next_20260803.md) | 🔨 Worker | 27 | <span title="Run: /wbExplain --id=9 --as=expert">📄</span> | ⚠️ **OUT-OF-TREE.** **Write the LinkedIn post** at `…/linkedinProfile/wb-flow/1.0.2/wb-flow_followup_post_1.0.2.md`. **LinkedIn does not render Markdown** — the 1.0.1 file's front-matter says so explicitly. Plain text only: no `**bold**`, no backticks, no `#` headers; emphasis via line breaks, `•`, `→` and emoji. Lead with the 1.0.1→1.0.2 delta from task 8. Match the 1.0.1 post's register (~770 words). | `P=../../../../../../../../../../../wissemCareer/career_by_claude/linkedinProfile/wb-flow/1.0.2/wb-flow_followup_post_1.0.2.md; [ -f "$P" ] && [ "$(awk '/COPY FROM HERE/{f=1;next} /TO HERE/{f=0} f' "$P" \| grep -cP '\*\*\|\x60\|^# ')" -eq 0 ]`<br><sub>🔧 **repaired 2026-08-03** — the original forbade any `^#`, but **every LinkedIn post ends in hashtags**; the 1.0.1 reference post fails it identically. Now checks the COPY block only. See note 23.</sub> | P1 | 50 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5<br><sub>571-word body, 0 markdown, matches 1.0.1 register; oracle forbade the medium's own hashtags</sub> |
| [29](tasks/task_29/task_29_report_wb-flow-next_20260803.md) | 🔨 Worker | 27 | <span title="Run: /wbExplain --id=10 --as=expert">📄</span> | ⚠️ **OUT-OF-TREE.** **Write the launch article** (long-form, Markdown is fine here — LinkedIn articles do render it, unlike posts). The 1.0.1 article was *"The Missing Row"* (13 KB) — a single narrative idea, not a feature list. Find 1.0.2's equivalent: the strongest candidate is **"the harness that lied"** — five bugs where the tooling reported false verdicts in both directions, and what it took to make a green check mean something. | `[ -f ../../../../../../../../../../../wissemCareer/career_by_claude/linkedinProfile/wb-flow/1.0.2/wb-flow_article_1.0.2.md ] && [ "$(wc -w < ../../../../../../../../../../../wissemCareer/career_by_claude/linkedinProfile/wb-flow/1.0.2/wb-flow_article_1.0.2.md)" -ge 900 ]` | P2 | 70 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5<br><sub>1 585 words, titled *The Harness That Lied* — one idea, not a feature list</sub> |
| [30](tasks/task_30/task_30_report_wb-flow-next_20260803.md) | 🔨 Worker | 27, 28 | <span title="Run: /wbExplain --id=11 --as=expert">📄</span> | ⚠️ **OUT-OF-TREE.** **Produce the carousel slides + PDF** per task 8's approach, into `…/1.0.2/wb-flow_imgs/` and `wb-flow_Custom_Carousel.1.0.2.pdf`. **Render at 1080×1350** (LinkedIn's native 4:5 document ratio, matching the July `wb-jobs` campaign) — resolved 2026-08-03 per [task 27](tasks/task_27/task_27_report_wb-flow-next_20260803.md); supersedes this row's original 2400×1900. **Reversible in ~2 min** by editing `@page`/`.slide` in the committed generator and re-rendering — which is why this did not block the wave. If task 8 chose a generator, commit it — the absence of one is why this task is expensive. | `[ -f ../../../../../../../../../../../wissemCareer/career_by_claude/linkedinProfile/wb-flow/1.0.2/wb-flow_Custom_Carousel.1.0.2.pdf ] && [ "$(ls ../../../../../../../../../../../wissemCareer/career_by_claude/linkedinProfile/wb-flow/1.0.2/wb-flow_imgs/slide_*.png 2>/dev/null \| wc -l)" -ge 6 ]` | P1 | 90 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 10/10<br>Claude Opus 5<br><sub>**generator committed** (oracle can't see it) · 8 slides @ 1080×1350 verified in CSS, PDF pts and PNG px</sub> |

### 💰 Plan Budget Estimate

| Metric | Value |
|---|---|
| **Total tasks** | 30 |
| **Total estimated time** | 1 265 min (~21.1 h) · **0 min remaining** — all 30 rows done and validated<br><sub>the previous `1 235 / 465` was arithmetically wrong — recomputed from the Est. column on 2026-08-03</sub> |
| **Total estimated tokens** | ~210 kt |
| **Est. cost (fast model worker)** | ~$0.85 *(billed as $0 — `opencode-go/*` is flat-rate)* |
| **Est. cost (big thinker worker)** | ~$3.10 |

*The in-session Planner/Validator cells cost orchestrator context, not provider spend.*

---

## 🌊 Wave History — Entry #1 (all waves ✅ CLOSED)

> **Not the live matrix.** Entry #1 finished 30/30 done · 30/30 validated; every wave A–O is
> closed. The single live schedule is [**🌊 Next Executable Sequence**](#-next-executable-sequence) (Entry #2)
> at the end of this file. Demoted 2026-08-03 19:2x — two sections with the identical heading made
> `wb-flow wave` read only this one, so Entry #2's D/E/F waves were invisible to the tooling.


> **Active Model Roster for this Plan:**
> 🧠 **Planner:** `Claude (in-session) || claude-opus-4-6-thinking`
> ✅ **Validator:** `Claude (in-session) || opencode-go/kimi-k2.7-code`
> 🔨 **Worker:** `opencode-go/deepseek-v4-pro || gemini-3.1-pro-high`
> 📋 **Mechanical:** `opencode-go/qwen3.7-plus || gemini-3.6-flash-high`
>
> ⚠️ **Do not route validators through `agy`.** It ignored `--model` and silently substituted
> Gemini 3.1 Pro twice on 2026-08-02, while the harness logged the *requested* name.

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A–E** — ✅ **CLOSED** | ✅ 1 — test scaffold spec | ✅ 1–10 validated (8s, 9s, 10s) | ✅ 2, 3, 4, 5, 6, 7, 8, 10 — all five harness bugs fixed | ✅ 9 — suites wired into `npm test` |
| **F** — ✅ **CLOSED** | `/wbWork deployement/packages/wb-flow/next/.wb/workflows/reports/2026/08/03/plans/plan_wb-flow-next_20260803.md --id=11`<br>→ *Claude (in-session)* *(⏱️ 25 min)*<br><sub>CHANGELOG shape for a 1.0.2 that had an r01 prerelease</sub> | — | — | `/wbWork deployement/packages/wb-flow/next/.wb/workflows/reports/2026/08/03/plans/plan_wb-flow-next_20260803.md --id=16`<br>→ *opencode-go/qwen3.7-plus · ~$0* *(⏱️ 20 min)*<br><sub>dep-free — retires the stale v1.0.1 banner</sub> |
| **G** — ✅ **CLOSED** | — | ✅ 11 (in-session, Planner exemption) · 16 (`kimi-k2.7-code`, third party) · 12, 13, 14 (in-session) | ✅ **12, 13** — `-r01` dropped, CHANGELOG folded into one `[1.0.2]`<br><br>✅ **14** — 9 features + 4 matrix rows in `core/docs/new.md` | — |
| **H** — ✅ **CLOSED** | — | ✅ 12, 13, 14 discharged in-session at the wave-G close | ✅ **15** — `detailed_news.md` 290 → 583 lines, sections 9–11 | ✅ **19** — 4 npm keywords · disclaimer moved to line 12 · `CONTRIBUTING.md`<br><sub>scored ATTEMPTED by a case-sensitive oracle; oracle repaired, work was complete</sub> |
| **I** — ✅ **CLOSED** | — | — | — | ✅ **17** — sync + build; site now serves tasks 14/15/19<br><sub>⚠️ `detailed_news.md` reached the site only via a pre-dispatch manual repair — sync had it in the conflict bucket (note 15)</sub> |
| **J** — ✅ **CLOSED** | — | ✅ **18** — 🚦 pre-publish gate: 443 tests green · 0 tarball leaks · version 1.0.2<br><sub>⚠️ 2 items for the owner — roster prose (note 17) and the gate's own oracle (note 16)</sub> | — | — |
| **K** — ✅ **CLOSED** | — | ✅ **20** — 🚦 release gate PASS, **workstream 3 open** · ✅ **18** validated by kimi (9/10)<br><sub>⚠️ the kimi cell was scored INFRA by the guard after finishing — note 18</sub> | — | — |
| **L** — ✅ **CLOSED** | ✅ **21** `_deploy_` strategy · ✅ **27** carousel approach | ✅ **23** npm pre-flight 10/10 · ✅ **20** validated by kimi (9/10) | — | ✅ **25** site build verified |
| **M** — ✅ **CLOSED** | — | ✅ **21, 25, 27** in-session · ✅ **23** by kimi (9/10) | ✅ **22** `_deploy_` refreshed · ✅ **28** LinkedIn post<br><sub>⚠️ both scored ATTEMPTED by **defective oracles**, both now repaired — notes 22, 23</sub> | — |
| **N** — ✅ **CLOSED** | — | — | ✅ **29** article *The Harness That Lied* (1 585 w) · ✅ **30** carousel — **generator committed**, 8 slides @ 1080×1350 | ✅ **24** publish runbook · ✅ **26** website deploy runbook |
| **O** — ✅ **CLOSED** | — | ✅ **22, 24, 26, 28, 29, 30** — 2nd opinion by `kimi-k2.7-code`: **9/9/9/9/9/10, all PASS**, converging exactly with the in-session scores | — | — |


### Wave notes

> **Full notes: [`tasks/wave_notes_wb-flow-next_20260803.md`](tasks/wave_notes_wb-flow-next_20260803.md)** —
> now carries all three workstreams, with a **+10 / +19 renumbering map** for the folded sections.

| # | Open risk | Status |
|---|---|---|
| 1 | **CHANGELOG omits `wb-flow watch` + the 5 harness fixes** — not in the original request | ✅ **closed** by task 13 |
| 2 | Site banner asserts a falsehood on the homepage | ✅ **closed** by task 16 |
| 3 | **No carousel generator exists** — "inspired by 1.0.1" has nothing to re-run | 🔴 task 27 decides |
| 4 | `_deploy_` "rename" is really a rewrite — 1 217 lines of 1.0.1 content | 🟠 task 21 classifies |
| 5 | npm unpublish impossible after 72 h | 🟡 tasks 18 + 23; **you** publish |
| 6 | `agy` ignores `--model` (bug 3b) | 🟡 out of scope, unfixed |
| 7 | `wb-flow watch` UI never exercised in a browser | 🟡 retrieval proven; UI not |
| 8 | README hero still leads with "33 commands" — the "Daily 4" reframe | 🟡 **deferred** post-release |
| 9 | **`wbRun`'s error guard trips *after* a successful run** — wave G cell 2: DeepSeek finished task 14, wrote the file and its report, then the guard fired, spawned the `gemini-3.1-pro-high` fallback (which answered *"I am currently using Gemini 3.1 Pro"* and did nothing), and G1 recorded **`ran on gemini-3.1-pro-high`**. The verdict was right; **the executor attribution was wrong**, and a wasted fallback was paid for | 🟠 **new 2026-08-03** — bug 6 candidate |
| 10 | **A worker can forge bug 3's G2 artifact.** Task 14's own report contains a `## ✅ Validation` heading written by the *worker*. That heading is exactly what bug 3's new G2 gate reads to decide a `wbValid` cell did work — so a validator that no-ops on task 14 would pass G2 on the worker's text | 🟠 **new 2026-08-03** — gate needs a validator-authored marker |
| 11 | **Agents sign reports with the wrong model.** All three wave-G sub-agents named an identity they were not: DeepSeek signed reports 12 and 13 as *"Claude Sonnet 4 (in-session)"*, and kimi headed its task-16 validation *"Claude Opus 5 (in-session)"* with an identity disclosure that would have voided the third-party guarantee the cell existed to provide. `_meta` records the truth; **the report body is not a trustworthy executor record** | 🟠 **new 2026-08-03** — corrected by hand in all three reports |
| 12 | **The guard fired on the prose the agent wrote.** Task 15's cell documents the three-gate contract, so DeepSeek's own output necessarily contains `Error:` — and `wbRun`'s guard matched it **after the work was complete**. Fallback went to `agy` → *"I am Antigravity… How can I help you today?"* → nothing done, yet G1 recorded `ran on gemini-3.1-pro-high`. The doc explaining why output-grep is forbidden was failed by an output-grep | 🔴 **2nd occurrence** — note 9 was the 1st; this is now a release blocker for the guard |
| 13 | **Task 19's oracle tested casing, not the requirement.** `grep -n 'framework-agnostic'` is case-sensitive; moving the disclaimer to the top naturally capitalises it (`**Framework-agnostic.**`), so 0 matches → `[ "" -lt 40 ]` → error. The work was fully correct and scored ATTEMPTED. **4th oracle defect in this lineage** | ✅ repaired 2026-08-03 (`grep -in`) |
| 14 | **The fallback lane routes to Antigravity, whose trust was revoked 2026-07-25.** Both wave-G and wave-H fallbacks dispatched `agy`. It has now burned two cells doing nothing — consistent with why it was revoked. **The roster's 2nd-choice worker should not be a tool under a standing do-not-assign rule** | 🔴 **new** — roster fix needed before the next wave |
| 15 | **`sync_docs.js` refuses to ship large doc improvements.** Its conflict heuristic is an *overlap ratio*: task 15 doubled `detailed_news.md` (290 → 583 lines), overlap fell to **50%**, and the file was classed `⚠️ conflict — needs review` and skipped. The better the upstream improvement, the likelier the sync refuses it. **There is no `--force`/`--accept-upstream` flag**, so all **249** conflict-bucket files are permanently unshippable — this is the *"248-file conflict bucket unexplained"* from task 7's validation, now explained | 🔴 **new** — `detailed_news.md` unblocked by hand (provably lossless: 0 site-only lines); the other 248 need a decision |
| 16 | **The pre-publish gate's own oracle cannot fail on a broken test suite.** Task 18's Verify is `npm test … && … grep … && exit 1 \|\| true`; when `npm test` fails the `&&` chain short-circuits into `\|\| true` and the cell exits **0**. The `\|\| true` that keeps a no-match `grep` from failing the cell also swallows the test result. **7th oracle defect, and the only one guarding an irreversible action** | 🔴 **new** — fix before publish; the suite is green today, so the verdict is right by luck, not by construction |
| 17 | **The shipped roster file carries the owner's personal tooling.** `verify-roster.js` checks only the *structured* roster block (empty ✅), but `model_recommendations.md` ships 9.7 kB whose prose names `agy` ×7, `opencode-go/*` ×4, and — line 60 — **which AI subscriptions the owner holds**. Row 18 says *"no personal model slugs"*; the guard enforces something narrower | 🟠 **owner's call** — keep the CLI examples, rewrite lines 45–60 |
| 18 | **The `wbRun` guard now fires on ordinary self-correction.** Wave K's kimi cell was scored `INFRA — every model in the chain failed to run` **after** it had re-measured all six of gate 18's conditions and appended a PASS 9/10 validation. Trigger: `Error: Could not find oldString` from an Edit it then **retried successfully**. Notes 9 and 12 at least required the task to be *about* errors; **this fires on any agent that retries a failed edit** | 🔴 **3rd occurrence — worst yet.** Publish blocker |
| 19 | **The wave heartbeat has never run.** `heartbeat &` is forked at script line 67 while `PIDS` is still empty; a backgrounded bash function gets a *copy*, so `any_running` is 0 on the first tick and it prints `── all cells finished ──` **30 s into every wave** and exits. No `🔄` line, no `% of est`, no `OVER est` has appeared in any wave today. The collect loop is fine (parent scope), which is why final verdicts still print | 🔴 **new** — `wb-flow watch` is currently the only working progress view |
| 20 | 🔴 **The test that proves the guard, trips the guard.** `test/wave_gates.js` asserts G1 recognises fatal strings, so `npm test` prints `✓ G1 classifies as INFRA: "Error: Model not found"` — the exact strings `wbRun`'s **unanchored** `grep -qi "error:"` hunts for. **Any cell that runs `npm test` is scored INFRA**, which is every release gate (18, 20, 23) and `prepublishOnly` itself. 4th false verdict today | 🔴 **PUBLISH BLOCKER.** One-line fix: give `wbRun` the anchored pattern `wave.js` already uses — retires notes 9, 12, 18, 20 together |
| 21 | **A carousel generator exists after all.** The plan's premise for task 27 (*"no committed script"*) is true for wb-flow but false for the ecosystem: `wb-jobs`, `wb-cli` and `haddad.wi-bg.com` each ship a self-contained `<name>_carousel.html`, and the render toolchain (Chrome 150 headless, `pdftoppm`) is installed. Task 30 drops from ~90 min to ~55 | ✅ **resolved by task 27** — port it, and **commit it this time** |
| 22 | **A Planner decision can invalidate a downstream oracle, and nothing notices.** Task 21 ruled that no `1.0.2`-named file goes in `_deploy_/` (task 24 owns the publish guide); task 22's oracle **required** one. The row could not satisfy its dependency and its oracle at once. DeepSeek did the right thing and was scored ATTEMPTED | ✅ oracle repaired — **8th defect, my error**: I wrote task 21, validated it 9/10, and missed the contradiction I had created |
| 23 | **Task 28's oracle forbade the medium's own syntax.** It rejected any `^#` line, but every LinkedIn post ends in hashtags. **The 1.0.1 reference post fails it identically** — no correctly-formed post file could ever have passed | ✅ oracle repaired to check only the COPY block; verified against the delivery, the 1.0.1 reference, and a negative control. **9th defect** |
| 24 | **Wave N ran clean — the first wave today with no false verdict.** 4/4 ids DONE, no `wbRun` fallback, no INFRA, both oracles honest. The difference: **no cell ran `npm test`** (note 20's trigger) and neither oracle over-specified. It is the control case showing the harness works when its two known defects are not exercised | ✅ informational — strengthens the note-20 diagnosis |
| 25 | **The Planner self-validation exemption fires on merged validator cells that contain no Planner row.** Wave O's `--id=22,24,26,28,29,30` (4 🔨 Worker + 2 📋 Mechanical, **zero** 🧠 Planner) was kept in-session with the reason *"pairs a 🧠 Planner row"*. Third occurrence — wave G `--id=11,16` and wave M `--id=21,23,25,27` leaked one id's exemption to the others; **here nothing in the merge qualifies at all**, so the check is not reading the merged ids' `Requires` tags | 🟠 **new** — harmless in O (all six ran on sub-agents) but it produced a real mis-route in wave M (task 23) |
| 26 | **Merged validator cells inherit the summed *execution* budget of the rows they review.** Wave O's cell shows `0% of 330m` — the sum of tasks 22/24/26/28/29/30's Est. Time (60+35+25+50+70+90). Reviewing six finished reports is not 5½ hours of work, so `OVER est` could never fire meaningfully for a validator cell. Moot while the heartbeat is dead (note 19), live again once it is fixed | 🟡 minor — a validator cell needs its own budget, not its subjects' |

- 🔒 **Tasks 12 + 13 both write `core/CHANGELOG.md`** — merge as `--id=12,13`, never parallel.
- 🔒 **Tasks 24 + 26 both write `_deploy_/`**; **29 + 30 both write `1.0.2/`** — merged in the matrix.
- ⚠️ **Tasks 27–30 write OUTSIDE this plan's scope** (`wissemCareer/career_by_claude/…`, 11 levels up).
  Deliberate: the broadcast is downstream of the release, and a separate plan would hide that.
- 🚦 **Two gates, both for a human**: task 18 (pre-publish) and task 20 (release → opens workstream 3).
- **Merged 2026-08-03** from `plan_release-1.0.2_20260803.md` and `plan_publish-1.0.2_20260803.md`.
  Frozen pre-merge copies: `.wb/snaps/20260803_premerge-*/`.
---

## 🚀 Recommended Next Execution Command(s)

> **Regenerate after every plan edit.** Derived state. Last regenerated: **2026-08-03** (post-wave-N).

*State — **Entry #1 only**: **30 / 30 done · 30 / 30 validated**, all three workstreams complete.
**This is not the file's state.** [Entry #2](#-plan-entry-2--coredocs-repair-claude-opus-5--1916) is open
with rows `D0`–`D7`; its schedule is the live matrix at the end of this file.*

```bash
P=deployement/packages/wb-flow/next/.wb/workflows/reports/2026/08/03/plans/plan_wb-flow-next_20260803.md
```

- **Option 1 — Second opinion before you publish (optional)** — every row is already validated
  in-session, so wave O is a review, not a gate
  ```bash
  /wbWork $P --wave=O --summary
  ```
- **Option 2 — Fix the two harness defects first (recommended)** — both affect verdicts you rely on
  ```bash
  grep -n 'error:' .wb/bin/wbRun          # note 20 — anchor it, as wave.js already does
  ```
- **Option 3 — Publish** — the runbook is written and every pre-flight has passed
  ```bash
  less deployement/packages/wb-flow/next/core/_deploy_/publish_wb-flow_20260803.md
  ```

## 🚦 The four steps no agent ran, and none can

| Step | Prepared for you |
|---|---|
| `npm publish` | `_deploy_/publish_wb-flow_20260803.md` — 6 read-only pre-flight checks, then the one irreversible command, then a smoke-test of the published package |
| GitHub release + tag | same file, §Step 2 — commands **as text**; git is forbidden to agents here |
| VPS deploy of `dist/` | `_deploy_/website_deploy_runbook_20260803.md` — 3 containers, `dist/` transfer, post-deploy checks |
| LinkedIn post + carousel | `linkedinProfile/wb-flow/1.0.2/` — post, article, 8-slide deck, **and the generator** |

> 🔴 **Two things to settle before `npm publish`, both found by the gates:**
> **(1)** `wbRun`'s unanchored guard scores any cell that runs `npm test` as INFRA — four false
> verdicts today, and it makes every release gate unreliable (note 20).
> **(2)** `model_recommendations.md` ships prose naming your models and your subscriptions (note 17).
> Neither is a code defect in the published package; both are things you would rather fix now.

> 📋 **Also cheap:** delete the stale `core/wb-flow-1.0.2-r01.tgz` — it cannot ship (`files[]` is a
> whitelist) but it sits next to the real artifact while you follow the runbook.

- ⚠️ **Not `--wave=all`.** Entry #1 has no agent waves left. **Entry #2 does** — see the live matrix.

---

## 🔗 Action Types

| Tag | Meaning | Lane |
|---|---|---|
| 🧠 **Planner** | Decomposition, strategy, judgment calls | the orchestrator, **in-session** — never delegated |
| ✅ **Validator** | Verify work against its plan; score it | in-session, unless it pairs a non-Planner row the orchestrator executed |
| 🔨 **Worker** | Code generation and file edits | `opencode run -m opencode-go/deepseek-v4-pro` |
| 📋 **Mechanical** | Run a command, read output, format a report | `opencode run -m opencode-go/qwen3.7-plus` |

---

## ▶️ How to run this plan

```bash
P=deployement/packages/wb-flow/next/.wb/workflows/reports/2026/08/03/plans/plan_wb-flow-next_20260803.md

wb-flow wave $P --wave=F --list          # 0 — preview routing, free

/wbWork $P --wave=F --summary --snap     # 1 — release: decisions      (2 cells, ~25 min)
/wbWork $P --wave=G --summary --snap     # 2 — ⚠️ merge --id=12,13     (4 cells, ~65 min)
/wbWork $P --wave=H --summary --snap     # 3 —                          (3 cells, ~55 min)
/wbWork $P --wave=I --summary --snap     # 4 — sync + build            (1 cell,  ~25 min)
/wbWork $P --wave=J --summary --snap     # 5 — 🚦 pre-publish gate
/wbWork $P --wave=K --summary --snap     # 6 — 🚦 release gate → opens workstream 3
/wbWork $P --wave=L --summary --snap     # 7 — publish prep + carousel decision
/wbWork $P --wave=M --summary --snap     # 8 —
/wbWork $P --wave=N --summary --snap     # 9 — 2 merged cells (~160 min)
/wbWork $P --wave=O --summary --snap     # 10 — final review

# THEN, by hand — no agent runs these:
#   npm publish              (your credentials; irreversible after 72 h)
#   GitHub release + tag     (git is forbidden here — text prepared for you)
#   deploy dist/ to the VPS  (your SSH)
#   post to LinkedIn         (your account, your voice)
```

### Why not `--wave=all`

- **Tasks 18 and 20 are gates** that exist for a human to read.
- **Tasks 11, 21 and 27 are judgment calls** — 27 especially, where no carousel generator exists and
  the wrong choice costs ~90 minutes of slide work.
- **Tasks 12 + 13 collide** on `CHANGELOG.md` and need merging, which autopilot will not do.

---

## 📂 Generated Files (20260803)

### 📚 Base Reference Files
- [plan_wb-flow-next_20260802.md](../../../08/02/plans/plan_wb-flow-next_20260802.md) — the plan whose deferred findings became this one
- [task_7 report](../../../08/02/plans/tasks/task_7/task_7_report_wb-flow-next_20260803.md) · [task_13 report](../../../08/02/plans/tasks/task_13/task_13_report_wb-flow-next_20260803.md)

- [core/README.md](../../../../../../../core/README.md) § *What's New* — source of the 9 missing release-note features (tasks 14–15)
- [core/_deploy_/](../../../../../../../core/_deploy_/) — the 4 v1.0.1-era runbooks (tasks 21–22)
- `wissemCareer/career_by_claude/linkedinProfile/wb-flow/1.0.1/` — article · post · 13-slide carousel (tasks 27–30)

### Local Files
- this plan — `plan_wb-flow-next_20260803.md` — **the single plan for this scope**
- [wave notes](tasks/wave_notes_wb-flow-next_20260803.md) — all three workstreams, with the +10/+19 renumbering map
- task reports land under [tasks/](tasks/)

### 🗂️ Merge provenance (2026-08-03)

This file absorbed two plans; **both originals were removed after the merge verified clean.**

| Original | Tasks became | Frozen copy |
|---|---|---|
| `plan_release-1.0.2_20260803.md` | 1–9 → **11–19** (+10) | `.wb/snaps/20260803_premerge-release-1.0.2/` |
| `plan_publish-1.0.2_20260803.md` | 1–11 → **20–30** (+19) | `.wb/snaps/20260803_premerge-publish-1.0.2/` |
| *(this plan, pre-merge)* | 1–10 unchanged | `.wb/snaps/20260803_premerge-wb-flow-next/` |

The snaps are `--copy` (frozen content), not symlinks — the originals were new and untracked, so
deletion would not have been git-recoverable.

**One dependency became a task dep instead of a file reference:** the publish gate (now **task 20**)
previously asserted "the release plan is finished" by pointing at another file. It now depends on
**12, 13, 16** — the version drop, the CHANGELOG, and the banner — which is what its oracle checks.

---

## 🔍 Audit Findings — /wbAudit *(Claude Opus 5 — 18:22)*

> **Source:** [audit_wb-flow-next_20260803.md](../audits/audit_wb-flow-next_20260803.md) Entry #1 — **7.5/10**
> **Findings sent:** 5 (4 atomic, 1 recursive) · P3 cosmetics held back (no `--ideas`)
> **Scope audited:** `core/` **and** `documentation/flow.wbc-ui.com/` — the docs app had not been audited in **82 days**

| # | Requires | Origin | Task | Verify | P | Worker | Validator | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|
| [A1](tasks/task_A1/task_A1_report_wb-flow-next_20260803.md) | 🔨 Worker | `/wbAudit deployement/packages/wb-flow/next/` | 🔴 **BLOCKER — anchor the `wbRun` output guard.** [`core/templates/_shared/wbRun`](../../../../../../../core/templates/_shared/wbRun) line 13 has 5 **unanchored** alternatives (`Insufficient credits`, `API key`, `rate limit`, `quota exceeded`, `authentication failed`) and an over-broad `^Error:`. Measured: **4 of 5 realistic strings false-positive**, incl. the package's own passing test output and a CHANGELOG line. **It ships** — `templates/` is in `files[]`. Mirror the anchored list already in [`core/bin/wave.js:51`](../../../../../../../core/bin/wave.js#L51). **Gates `npm publish`.** | `printf 'The fallback fires on rate limit errors.\n' \| grep -qE "$(sed -n 13p ../../../../../../../core/templates/_shared/wbRun \| grep -oE '"[^"]+"' \| tr -d '"')" && exit 1 \|\| exit 0` | P0 | `opencode-go/deepseek-v4-pro` | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>root cause was *divergence*, not anchoring — `wbRun` now uses `wave.js`'s canonical pattern; parity asserted by test</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>guard fix confirmed **in the wild**: this cell ran `npm test` — note 20's exact trigger — and the guard fired 0 times</sub> |
| [A2](tasks/task_A2/task_A2_report_wb-flow-next_20260803.md) | 🔨 Worker | `/wbAudit deployement/packages/wb-flow/next/` | **Fork the wave heartbeat after dispatch.** `heartbeat &` runs while `PIDS` is empty, so the forked copy sees no cells, prints `── all cells finished ──` at the 30 s tick and exits — in **every wave today**. No `🔄`, `% of est` or `OVER est` has ever rendered. | `node ../../../../../../../core/test/wave_gates.js --only=heartbeat` | P1 | `opencode-go/deepseek-v4-pro` | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>heartbeat forked after dispatch; ordering asserted in generated output</sub> | ✅ 10/10<br>kimi-k2.7-code<br><sub>6/6 ordering assertions; 459 suite green</sub> |
| [A3](tasks/task_A3/task_A3_report_wb-flow-next_20260803.md) | 📋 Mechanical | `/wbAudit deployement/packages/wb-flow/next/` | **Retire three stale assertions.** (a) [`documentation/flow.wbc-ui.com/docs/dev.md:24`](../../../../../../../documentation/flow.wbc-ui.com/docs/dev.md#L24) + its `.wb/workflows/dev.md:19` twin claim a **VuePress** rule about **WBDataViewer** — wrong stack, wrong project. (b) `.wb/workflows/dev.md` expects **54** packed files; real count is **61**. (c) `.wb/workflows/context.md` still says version `1.0.2-r01`. **Keep** `README.md:71,134` — those correctly describe the migration *from* VuePress. | `! grep -q 'VuePress' ../../../../../../../documentation/flow.wbc-ui.com/docs/dev.md && ! grep -qE '(\*\*Version:\*\*\|package\.json is\|wb-flow) [^.]*1\.0\.2-r01' ../../../../../../../core/.wb/workflows/context.md && grep -q '61 files' ../../../../../../../core/.wb/workflows/dev.md`<br><sub>🔧 **repaired 2026-08-03** — the original banned *any* mention of `1.0.2-r01`, so it failed on a line explaining why `--tag next` is now wrong. Tests the **claim**, not the string; verified to reject a reinstated claim.</sub> | P2 | `opencode-go/qwen3.7-plus` | Claude (in-session) | ✅<br>Claude Opus 5<br><sub>incl. the `--tag next` instruction task 11 superseded</sub> | ✅ 10/10<br>kimi-k2.7-code<br><sub>oracle refinement verified bidirectionally</sub> |
| [B1](tasks/task_B1/task_B1_report_wb-flow-next_20260803.md) | 🧠 Planner | `/wbAudit deployement/packages/wb-flow/next/` | **Decide how to repair `core/docs/`** — *recursive*. **v2 (2026-08-03 19:09, after `--open`)**: the genre question is **settled by evidence**, not owner preference — `wbModel`/`wbStopTrack` are the two unbroken pairs and show `README.md` = authored prose hub, `index.md` = generated nav. **Two corruptions, not one:** P1 = 27 upstream hubs overwritten with example content; P2′ = **29 site hubs overwritten with a copy of their own `index.md`**. **0 of the 27 have prose surviving anywhere**, so repair is *authoring*, not copying. 🔴 **Do not run `sync_docs.js` on these files today** — it would push 27 corrupted hubs onto the live site. | `human: the report states repair direction and confirms no content loss` | P1 | Claude (in-session) | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5 (v2)<br><sub>v1 withdrawn; every figure re-measured in one pass</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>ran the 4 supplied checks — 93/16 · 50/55 · 29 · **0** — all matched. Independent this time: commands, not framing</sub> |
| C1 | 🔨 Worker | `/wbAudit deployement/packages/wb-flow/next/` | **Repair `core/docs/` + the site hubs.** ⛔ **Not mechanical, and the sync must NOT be run on these files today** — it would copy 27 corrupted upstream hubs onto the site. Per [B1](tasks/task_B1/task_B1_report_wb-flow-next_20260803.md)'s RESOLUTION: **C1-i** reconstruct 27 upstream prose hubs (~3–4 h, authoring — 0 of 27 survive anywhere); **C1-ii** re-sync to restore the 29 duplicated site READMEs (mechanical, gated on C1-i); **C1-iii** the 94-file `_partN` merge (~6–8 h). **Belongs in its own `/wbPlan`.** | `node ../../../../../../../core/test/docs_repair_invariants.js`<br><sub>✅ **superseded 2026-08-04** — repair complete through D0–D8 (plan_next_20260804 task 4). The old `-eq 1` oracle was a marker count that D6 invalidated by removing all 4 markers; the new zero-state invariant (`docs_repair_invariants.js`) asserts no markers, no `_partN` files, no `_partN` links, and no duplicated site command READMEs.</sub> | P1 | `opencode-go/deepseek-v4-pro` | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro<br><sub>completed by D0–D8 (plan_next_20260804 Entry #2); see supersession note</sub> | ✅ 9/10<br>anthropic/claude-sonnet-5<br><sub>reconciled 2026-09-05 — `docs_repair_invariants.js` 4/4 (no markers, no `_partN` files/links, no duplicate READMEs); supersession by D0–D8 independently confirmed</sub> |

> **Dependency:** C1 requires B1. A1–A3 are mutually disjoint and independent of both.
> **Not sent (P3, no `--ideas`):** stale `wb-flow-1.0.2-r01.tgz`; validator cells inheriting summed
> execution budgets; carousel slide naming.


---
---

# 🔄 Plan Entry #2 — `core/docs` repair *(Claude Opus 5 — 19:16)*

> **Origin Command:** `/wbPlan deployement/packages/wb-flow/next/ --task="repair core/docs: reconstruct 27 command hubs, restore 29 duplicated site READMEs, merge 94 _partN files"`
> **Source:** [audit_wb-flow-next_20260803.md](../audits/audit_wb-flow-next_20260803.md) M1 · decision in [task_B1 report](tasks/task_B1/task_B1_report_wb-flow-next_20260803.md) **v2** (validated ✅ 9/10 by `kimi-k2.7-code`, which ran the four supplied checks)
> **Appended, not created** — the ONE-FILE-PER-DAY rule; Entry #1 is the 1.0.2 release plan above (30/30 done).

## Why this is a separate entry rather than more rows on Entry #1

Entry #1 shipped a release. This is repair of damage that **predates it**: `1.0.1/` carries 29 corrupted
hubs against `next/`'s 27, so the corruption is older than the transform task 7 fixed. Task 7 stopped
it recurring; nothing ever undid it.

## The measured state this plan acts on

```
P1   upstream command hubs overwritten with example content        27
     upstream prose hubs surviving                                  6   ← the models to rebuild from
P2′  site hubs byte-identical to their own index.md                29  of 33
R2   _partN files upstream (commands 66 · concepts 16 · start_here 6 · other 6)   94
     …holding lines the site has never served                      87
     …of the 27 P1 commands, with prose surviving ANYWHERE           0   ← so repair is authoring
```

> [!IMPORTANT]
> 🔴 **Do not run `sync_docs.js` on command hubs until D1 is Done.** Today it would push 27 corrupted
> upstream hubs onto the live site — turning a harmless duplicate into merge residue on
> `flow.wbc-ui.com`. **D2 is hard-gated on D1 for this reason, not for tidiness.**

> [!NOTE]
> No npm impact. `files[]` is a whitelist (`bin/ templates/ assets/demo.gif README.md LICENSE CHANGELOG.md`),
> so `docs/` has never shipped — **no user has ever seen a corrupted hub.** This is a website and
> repository problem. Weigh it against publishing accordingly.

## ━━━ TASK LIST (Entry #2) ━━━

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [D0](tasks/task_D0/task_D0_report_wb-flow-next_20260803.md) | 🧠 Planner | — | <span title="Run: /wbExplain --id=D0 --as=expert">📄</span> | **Fix the hub shape, and build one model hub.** ⛔ **Owner input required:** reconstruct all 27 at `wbPlan`'s 93-line depth, or a shorter uniform hub for all 33 (trims the 6 survivors for consistency). Decide, then hand-write **one** complete hub (suggest `wbAudit`) as the template D1 copies structure from. State the required sections and what each pulls from the command's own `<cmd>.md`. | `human: the report states the chosen depth and ships one complete model hub` | P0 | 45 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>chose the orientation genre (~50–75 ln) for the 27; survivors untouched. Model hub shipped — corrupted 27→26</sub> | ✅ 9/10<br>kimi-k2.7-code<br><sub>−1: the model hub ships a temporary dead link to `wbAudit_examples.md` — anticipated and justified by the dep correction</sub> |
| [D1](tasks/task_D1/task_D1_report_wb-flow-next_20260803.md) | 🔨 Worker | D0, D4, D5 | <span title="Run: /wbExplain --id=D1 --as=expert">📄</span> | **Reconstruct the 27 corrupted upstream command hubs** in `core/docs/commands/<cmd>/README.md`, following D0's model. Source material is each command's own `<cmd>.md` + layer files — **not** the site copy, which is a 16-line nav index. Do not touch the 6 surviving hubs. **⚠️ Dep corrected by D0:** a hub's Reading Order links to layer filenames, which D4/D5 rename (`<cmd>_examples_part1.md` → `<cmd>_examples.md`). Written before the merge, all 27 link at names that change underneath them. | `[ "$(grep -rl 'MERGED CONTENT FROM' ../../../../../../../core/docs/commands/wb*/README.md 2>/dev/null \| wc -l)" -eq 0 ]` | P0 | 200 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro<br><sub>26 hubs reconstructed · 147 links resolve · 6 survivors untouched</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>−1: `--ideas` attributed to `/wbIdea`; it is a `/wbAudit` flag</sub> |
| [D2](tasks/task_D2/task_D2_report_wb-flow-next_20260803.md) | 📋 Mechanical | D1 | <span title="Run: /wbExplain --id=D2 --as=expert">📄</span> | **Re-sync, restoring the 29 duplicated site READMEs.** Only safe once D1 lands. Then `npm run build` and confirm the site still serves every command hub. | `cd ../../../../../../../documentation/flow.wbc-ui.com && node scripts/sync_docs.js >/dev/null && c=0; for d in docs/commands/wb*/; do diff -q "$d/index.md" "$d/README.md" >/dev/null 2>&1 && c=$((c+1)); done; [ "$c" -eq 0 ]` | P0 | 15 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 9/10<br>Claude Opus 5<br><sub>sync *refused* the restore (conflict heuristic); worker diagnosed it and copied manually instead of reporting the no-op as success</sub> |
| [D3](tasks/task_D3/task_D3_report_wb-flow-next_20260803.md) | 🧠 Planner | — | <span title="Run: /wbExplain --id=D3 --as=expert">📄</span> | **Write the `_partN` merge spec.** Base = the site's `<T>.md` (253 lines for wbActOn); overlay = the parts' unique sections (25 lines there). Define the heading-collision rule, section ordering, and the **containment check** every merged file must pass before its parts may be deleted. A mechanical concat produces duplicated sections and contradictory examples — say exactly how to avoid that. | `human: the spec defines heading-collision handling and a containment check` | P1 | 40 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5<br><sub>**40 of 47 groups are clean appends, not merges** — only 7 collide; D4/D5 re-estimated 360→210 min</sub> | ✅ 10/10<br>kimi-k2.7-code<br><sub>collision census re-measured independently</sub> |
| [D4](tasks/task_D4/task_D4_report_wb-flow-next_20260803.md) | 🔨 Worker | D3 | <span title="Run: /wbExplain --id=D4 --as=expert">📄</span> | **Merge the 66 `commands/` parts** into upstream `<T>.md` per D3. Write the merged file; **do not delete any part yet** — D6 owns deletion, after containment is proven. **Per D3:** most are verbatim appends; only `wbHelp`, `wbModel`, `wbStopTrack` examples collide and need the exception path. | `cd ../../../../../../../core/docs/commands && ok=1; for p in */*_part[0-9].md; do m="${p%_part[0-9].md}.md"; [ -f "$m" ] \|\| { ok=0; break; }; done; [ "$ok" -eq 1 ]` | P1 | 150 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro<br><sub>47/47 merged · 0 parts deleted · 0 content lost</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>−1: demoted headings (correctly, matching `sync_docs.js`) without disclosing the divergence from D3 §rule 2</sub> |
| [D5](tasks/task_D5/task_D5_report_wb-flow-next_20260803.md) | 🔨 Worker | D3 | <span title="Run: /wbExplain --id=D5 --as=expert">📄</span> | **Merge the remaining 28 parts** — `concepts/` 16, `start_here/` 6, `_specs/` 2, `daily_use/` 2, `demo_apps/` 2 — same spec. Disjoint from D4's tree, so the two run in parallel. **Per D3:** 4 of the 7 collision groups live here — `start_here/bootstrapping` (9 collisions) is the hardest file in the plan; do it first and slowest. | `cd ../../../../../../../core/docs && ok=1; for p in $(find concepts start_here _specs daily_use demo_apps -name '*_part[0-9].md' 2>/dev/null); do m="${p%_part[0-9].md}.md"; [ -f "$m" ] \|\| { ok=0; break; }; done; [ "$ok" -eq 1 ]` | P1 | 60 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro<br><sub>47/47 merged · 0 parts deleted · 0 content lost</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>−1: demoted headings (correctly, matching `sync_docs.js`) without disclosing the divergence from D3 §rule 2</sub> |
| [D6](tasks/task_D6/task_D6_report_wb-flow-next_20260803.md) | 📋 Mechanical | D1, D4, D5 | <span title="Run: /wbExplain --id=D6 --as=expert">📄</span> | **Prove containment, then delete the 94 parts, then re-sync + rebuild.** For every part, assert each non-blank line exists in its merged `<T>.md`; delete only on a clean pass. **87 of 94 hold unique content — a deletion before this check loses it.** **Also (per D7 validation):** tighten `--only=syncguard` assertion 6 from *site ≤1* to **upstream == 0 && site == 0** — a ratchet that only counts down. **⚠️ Dep corrected on self-correct:** D6 re-syncs and rebuilds, so it carries the same hazard D2 was gated against — run before D1 and it pushes the 26 corrupted hubs to the live site. **⚠️ Containment gate corrected (D4/D5 validation):** compare lines with heading level **normalised** (`sed -E 's/^#+[[:space:]]*//'`) and exclude the part's H1, its `(Part N)` intro and the per-file nav footer. D3 §rule 2 said *keep verbatim*; the merge correctly **demoted** headings, so a literal check rejects all 47 groups. | `[ "$(find ../../../../../../../core/docs -name '*_part[0-9].md' \| wc -l)" -eq 0 ] && cd ../../../../../../../documentation/flow.wbc-ui.com && npm run build >/dev/null 2>&1` | P1 | 30 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 7/10<br>Claude Opus 5<br><sub>−2: deleting the 94 parts left **41 broken links** in 9 upstream files; the row's own oracle cannot see it — deletion *is* what satisfies the check. Filed as D8</sub> |
| D8 | 📋 Mechanical | D6 | <span title="Run: /wbExplain --id=D8 --as=expert">📄</span> | **Repair the 41 links D6's deletion broke.** Deleting the 94 `_partN` files left **41 markdown links with missing targets** across 9 upstream files — `README.md`, `concepts/{README,wbPlan_flag,command_composition}.md`, `daily_use/README.md`, `start_here/{README,getting_started,first_run_walkthrough,tutorial_zero_to_app}.md`. D2 already fixed the 20 `commands/wb*/README.md` hubs the same way (`sed -E 's/_part[0-9]+\.md/.md/g'`), so the mechanical shape is proven — but ⛔ **a target-only `sed` is NOT sufficient here**, for two measured reasons: **(a)** most links use the *filename as link text* — `[flags_and_shortcuts_part1.md](flags_and_shortcuts_part1.md)` — so rewriting only the target leaves the label naming a file that no longer exists; **(b)** `command_classification`, `command_composition` and `flags_and_shortcuts` each have **both** a `_part1` and a `_part2` link, which collapse to one file, producing two differently-labelled links to the same target. Fix **text and target together**, and de-duplicate the collapsed pairs into a single link. A few link at a *section* of a merged file and need an anchor, not just a filename — verify each. ⚠️ **Currently masked:** all 9 files sit in the sync conflict bucket (note 15), so they never reach the site and VitePress never link-checks them. **The masking ends the day the bucket is resolved.** | `cd ../../../../../../../core/docs && [ "$(grep -rhoE '\[[^]]*_part[0-9]\.md[^]]*\]\([^)]*\)\|\[[^]]*\]\([^)]*_part[0-9]\.md\)' . 2>/dev/null \| wc -l)" -eq 0 ]`<br><sub>🔧 **strengthened before dispatch 2026-08-04** — the original checked only *target existence*, so a target-only `sed` would have scored PASS while leaving 41 mislabelled links. Same defect class as D6's. Measured at **41** today; passes only when text **and** target are both clean.</sub> | P1 | 25 | `opencode-go/qwen3.7-plus` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 9/10<br>Codex |
| [D7](tasks/task_D7/task_D7_report_wb-flow-next_20260803.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=D7 --as=expert">📄</span> | **Guard the regression.** Add a test asserting `sync_docs.js` never writes merged content into a `README.md`, and that no tracked file gains a `MERGED CONTENT FROM` marker. This corruption survived two version lineages undetected — the repair is worthless without a tripwire. | `node ../../../../../../../core/test/wave_gates.js --only=syncguard` | P1 | 45 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro<br><sub>behavioural fixture, not a state count; added a `--test-root=` seam to `sync_docs.js`</sub> | ✅ 8/10<br>Claude Opus 5<br><sub>−1 undisclosed prod-code change · −1 guards the site but not the 26 upstream markers → tighten in D6</sub> |

### 💰 Plan Budget Estimate (Entry #2)

| Metric | Value |
|---|---|
| **Total tasks** | 8 |
| **Total estimated time** | ~585 min (~9.8 h)<br><sub>revised by D0 (D1 200) and D3 (D4 150 · D5 60) — measurement, not re-estimation</sub> |
| **Total estimated tokens** | ~230 kt |
| **Est. cost (fast model worker)** | ~$0.92 *(billed as $0 — `opencode-go/*` is flat-rate)* |
| **Est. cost (big thinker worker)** | ~$3.45 |

*D0 and D3 are in-session Planner cells — orchestrator context, not provider spend.*

## 🌊 Next Executable Sequence

> **Active Model Roster for this Plan:**
> 🧠 **Planner:** `Claude (in-session)`
> ✅ **Validator:** `opencode-go/kimi-k2.7-code`
> 🔨 **Worker:** `opencode-go/deepseek-v4-pro`
> 📋 **Mechanical:** `opencode-go/qwen3.7-plus`

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **D–F** — ✅ **CLOSED** | ✅ D0 hub shape + model hub · ✅ D3 merge spec | ✅ D0, D3, D7 (kimi) · D1, D4, D5 (in-session) — 8–10/10, all PASS | ✅ **D1** 26 hubs reconstructed · **D4** 66 parts merged · **D5** 28 parts merged · **D7** syncguard tripwire | — |
| **G** — ✅ **CLOSED** | — | ✅ **D2** 9/10 · ✅ **D6** 7/10 (in-session)<br><sub>merged cell ran 11 min against a 45 min estimate</sub> | — | ✅ **D2** 29 site hubs restored · ✅ **D6** 94 parts deleted (provably lossless), syncguard ratcheted |
| **H** — ✅ **CLOSED** | — | ✅ **D8** 9/10 · Codex | — | ✅ **D8** 41 Markdown links repaired |

### Wave notes

- ✅ **Waves D, E and F are all closed** — D0, D1, D3, D4, D5, D7 are Done **and** Valid.
  *(Matrix recomputed 2026-08-03 22:2x: it still showed E as `▶ now` and F as upcoming after all three
  had landed — a schedule pointing at finished work. **6 of this plan's rows had moved since it was
  last derived.**)*
- ✅ **Wave H is closed on reconciliation (2026-08-04).** D8's worker report existed before this
  dispatch attempt and its strengthened oracle now measures **0** broken Markdown `_partN` links.
  The newly generated Wave-H runner could not start either configured worker (Qwen: OpenCode SQLite
  checkpoint error; Gemini fallback: sandbox filesystem/socket denial), so this close is based on the
  pre-existing artifact plus independent oracle re-run, not on that failed re-dispatch.
- 🔒 **Wave G's two cells are MERGED, not parallel — the generator got this wrong.**
  `wb-flow wave --wave=G` emits D2 and D6 as two concurrent dispatches, but they are **not**
  collision-free: both run `node scripts/sync_docs.js` **and** `npm run build` inside
  `documentation/flow.wbc-ui.com/`. Two concurrent syncs plus two VitePress builds writing one `dist/`
  is the corruption the collision check exists to prevent. Merging also forces the only correct order —
  D2 restores the 29 site READMEs, D6 then deletes parts and re-syncs on top. Run
  [`waves/wave_G_merged_wb-flow-next.sh`](waves/wave_G_merged_wb-flow-next.sh), not the generated
  `wave_G_wb-flow-next.sh`. **This is a `wb-flow wave` collision-check gap, not a plan defect** — the
  checker does not model two rows invoking the same build in a tree neither row's path column names.
- 🔒 **D1 moved from wave E to wave F.** Its `Dep` became `D0, D4, D5` when D0 found that a hub's
  Reading Order links to layer *filenames*, which D4/D5 rename. Written first, all 27 hubs would link
  at names that change underneath them — and the site's live dead-link check would catch it only after
  ~4 h of authoring.
- 🔒 **D6 moved from wave F to wave G.** Its `Dep` became `D1, D4, D5` on the self-correct pass: D6
  re-syncs and rebuilds, so it carries the identical hazard D2 was already gated against — run it
  before the hubs are rebuilt and it publishes the 26 corrupted hubs to the live site. **Three of this
  plan's dependency edges have now needed correction, every one involving the sync.**
- 📉 **D4/D5 shrank from 360 to 210 min** after D3 measured the collision rate: **40 of 47 part-groups
  are clean appends**, only 7 collide — different genres, not competing versions.
- **No collision in wave E:** D4 writes `core/docs/commands/*/<T>.md`; D5 writes `concepts/`,
  `start_here/`, `_specs/`, `daily_use/`, `demo_apps/`. Disjoint trees.
- ⚠️ **`start_here/bootstrapping` (9 heading collisions) is the hardest file in the plan** — D5 takes
  it first and slowest, and escalates rather than improvises if it needs a rewrite.
- 🔴 **An oracle satisfied *by* the act that caused the damage. (10th oracle defect in this lineage.)**
  D6's Verify is `find core/docs -name '*_part[0-9].md' | wc -l` == 0. Deleting the 94 parts sets it to
  0 — and the same deletion orphaned **41 markdown links** across 9 upstream files. **The check passes
  because the damage was done.** Neither `npm run build` nor `wbValid` would have caught it either:
  all 9 files sit in the sync conflict bucket (note 15), so they never reach the site and VitePress
  never link-checks them. Found only by re-measuring link targets by hand during validation.
  **The masking is temporary — resolving the conflict bucket ships all 41.** Filed as **D8**.
  *Pattern worth naming: a deletion oracle should assert what still points at the deleted thing, not
  merely that the thing is gone.*
- 🟡 → 🟢 **D6 invalidated Entry #1 row C1's oracle** — reconciled 2026-08-04. C1's oracle is now `docs_repair_invariants.js` (zero-state invariant), the Done box is ✅, and the work was completed through D0–D8 (plan_next_20260804 Entry #2, tasks 4–8). ~~The old `-eq 1` oracle needed `-eq 0` before running~~ — resolved.
- ✅ **The anchored guard held under live fire.** D2/D6's cell logged `Error: File not found` while
  reading a template path. Under the old unanchored `grep -qi "error:"` that alone would have scored
  the cell INFRA and spawned a wasted fallback — notes 9, 12, 18, 20, four times on 2026-08-03. Task
  A1's anchored pattern ignored it and the cell ran to a correct verdict. **Second in-the-wild
  confirmation** after A1's own validation.
- 📏 **D6's containment was pre-measured independently by the orchestrator, before dispatch**, because
  D6 both performs the deletion *and* grades the check that authorises it. Applying D6's own three
  stated exclusions (part H1 · `(Part N)` intro · per-file nav footer) across all **94** parts:

  | Result | Count |
  |---|---|
  | parts whose merged `<T>.md` exists | 94 / 94 |
  | **substantive lines not contained in the merge** | **0** |
  | per-part scoping intros dropped (first 6 lines) | 62 |
  | nav-footer lines dropped (D6 excludes by name) | 6 |

  **Deletion is safe: no example, command or code block is lost.** The 62 dropped intros are the
  per-part descriptors (*"This guide covers baseline invocations…"* / *"…role model overrides…"*),
  which the merged files correctly replace with one unified conceptual intro — verified by reading
  `wbActOn_examples.md` and `wbGit_examples.md`. **This is an intended loss, not residue.**
  ⚠️ **Note for D6's validator:** a naive literal containment check reports **59 of 94 parts failing**.
  That is the exclusion rules being applied too narrowly, *not* a real content loss — D6 must be scored
  on the normalised check the row specifies, and a report claiming a clean literal pass has not run it.
  Script: `waves/containment_precheck.js`.
- ⚠️ **The D0/D3 pairing goes to kimi, not in-session.** Both are 🧠 Planner rows so the exemption
  technically applies — but B1 v1 was passed 9/10 by its own author *and* by a validator that
  inherited its framing. On this plan, Planner rows get a third party.

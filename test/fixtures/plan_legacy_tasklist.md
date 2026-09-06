---
type: plan
emits: mixed
scope: deployement/packages/wb-flow/next/
date: 2026-08-02
---

> 🗄️ **ARCHIVED 2026-09-06** — this file is history, not live state.
> Superseded by [plan_next_20260905.md](../../../../../reports/2026/09/05/plans/plan_next_20260905.md).
> Moved from `.wb/workflows/reports/2026/08/02/plans` by `wb-flow archive`. Links to files that moved with it still resolve (`archives/` mirrors `reports/` depth); links to still-live reports do not.

# Plan Backlog: wb-flow-next — 2026-08-02

> **Target:** [deployement/packages/wb-flow/next/](../../../../../../../)
> **Source:** [standup_wb-flow-next_20260802.md](../standups/standup_wb-flow-next_20260802.md) Entry #1
> **Origin Command:** `/wbPlan deployement/packages/wb-flow/next/ --task="execute the Main Goal…"`
> **Model:** Claude Opus 5 · **Client:** Claude Code · **Time:** 2026-08-02 10:42

## 🎯 Goal

Bring all three wb-flow resource trees up to **v1.0.2-r01**:

1. **[core/](../../../../../../../core/)** — especially [`README.md`](../../../../../../../core/README.md) (222 lines)
2. **[core/docs/](../../../../../../../core/docs/)** — the internal static docs for GitHub (364 `.md` files)
3. **[documentation/flow.wbc-ui.com/](../../../../../../../documentation/flow.wbc-ui.com/)** — especially [`README.md`](../../../../../../../documentation/flow.wbc-ui.com/README.md) (**31 lines**)

> [!IMPORTANT]
> **Scope correction.** The Main Goal named `next/docs/`. **That path does not exist** — `next/` contains only `core/` and `documentation/`. The internal GitHub docs are **`core/docs/`**, the only candidate under `next/`. This plan reads target #2 that way. If you meant a *new* top-level `next/docs/`, say so — tasks 9–12 change scope.

## 📊 Measured baseline (2026-08-02)

| Signal | Value |
|---|---|
| Shared doc files, `core/docs` ↔ site | **1 identical · 256 differ · 67 missing on site** |
| Site files mentioning `wb-flow wave` or `wb-flow model` | **0** |
| `wbModel` doc files | `core/docs` **9** · site **0** |
| `core/README.md` mentions of `wave` / `model` / `--summary` / `--sessions` | **0 / 0 / 0 / 0** |
| Command folders | templates **33** · `core/docs` **33** · site **33** (structure aligned, content drifted) |

**The docs describe a CLI that no longer matches the shipped one.** v1.0.2-r01 added `wb-flow wave`, `wb-flow model`, `--summary`, `--sessions`, `wbRun` dispatch protection and the three-gate contract. None of it is documented anywhere public.

## 🔴 The blocker this plan resolves first

The same 8-step site sync is planned **twice**:

| File | Rows |
|---|---|
| [core plan 07-31](../../../../../../../core/.wb/workflows/reports/2026/07/31/plans/plan_wb-flow_20260731.md) §2 | `2.0 … 2.7` |
| [site plan 07-31](../../../../../../../documentation/flow.wbc-ui.com/.wb/workflows/reports/2026/07/31/plans/plan_flow.wbc-ui.com_20260731.md) | `S0 … S7` |

Row-for-row identical. Executing both double-writes ~323 files. **Task 1 retires one before anything else runs.**

---

## ━━━ TASK LIST ━━━

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [1](tasks/task_1/task_1_report_wb-flow-next_20260802.md) | 🧠 Planner | — | <span title="Run: /wbExplain --id=1 --as=expert">📄</span> | **Make this plan the single home for `next/`.** The 8-step site sync exists in *three* places once this file lands. Cancel both older copies — core §2 (`2.0–2.7`) and the site plan (`S0–S8`) — each row marked `🚫 Cancelled` with a pointer here. A per-tree plan cannot express this goal's cross-tree dependencies (task 5 rewrites `core/README.md`, task 11 the site README, one wave). **Superseded 2026-08-03 — both older plan files were subsequently *deleted* outright rather than left cancelled (operator decision, deliberate). Deletion is a strictly stronger retirement than cancellation, so the row stays ✅; the oracle below was widened to `absent OR fully cancelled` because the original could only express the weaker form.** | `A=../../../../../../../core/.wb/workflows/reports/2026/07/31/plans/plan_wb-flow_20260731.md; B=../../../../../../../documentation/flow.wbc-ui.com/.wb/workflows/reports/2026/07/31/plans/plan_flow.wbc-ui.com_20260731.md; { [ ! -f "$A" ] \|\| [ "$(grep -cE '^\| *2\.[0-7].*🚫' "$A")" -eq 8 ]; } && { [ ! -f "$B" ] \|\| [ "$(grep -cE '^\| *S[0-8].*🚫' "$B")" -eq 9 ]; }` | P0 | 20 | Claude (in-session) · ~$0 | — | ✅<br>Claude Opus 5 | ✅ 9/10<br>Claude Opus 5 |
| [2](tasks/task_2/task_2_report_wb-flow-next_20260802.md) | ✅ Validator | — | <span title="Run: /wbExplain --id=2 --as=expert">📄</span> | **Close the stale §1 rows.** Verify `1.1–1.6` (wbRun helper, `$WB_RUN` prefix, roster parsers, precedence, tests, `new.md` reconcile) are implemented, then tick them. Code says done; plan says open. | `node -e "const s=require('fs').readFileSync('../../../../../../../core/bin/wave.js','utf8');process.exit(/function resolveWbRun/.test(s)&&/function resolveModelsFromRoster/.test(s)?0:1)"` | P1 | 25 | Claude (in-session) · ~$0 | `opencode/kimi-k2.7-code` | ✅<br>Claude Opus 5 | ✅ 9/10<br>Claude Opus 5 |
| 3 | 📋 Mechanical | — | <span title="Run: /wbExplain --id=3 --as=expert">📄</span> | ~~**Ship the version-disclosure banner** (site plan S0).~~ **ALREADY DONE** — [index.md](../../../../../../../documentation/flow.wbc-ui.com/docs/index.md) lines 13–14 already carry the disclosure + CHANGELOG link. The original oracle (`grep -q "1.0.2"`) was a **false positive**: satisfied by pre-existing text, so it could never distinguish done from not-done. Replaced with one that matches the banner's actual sentence. **🚫 RETIRED 2026-08-03** — the banner this row shipped was **removed** by task 16 of `plan_wb-flow-next_20260803.md`: it claimed the site was "not yet resynced to v1.0.2", which stopped being true once task 8 synced the tree. This row's oracle pins the banner's *sentence*, so it is now permanently unsatisfiable — a third instance of an oracle that asserts a fact frozen at authoring time. The work was real; the assertion outlived it. | `grep -q "has not yet been resynced to v1\.0\.2" ../../../../../../../documentation/flow.wbc-ui.com/docs/index.md` | P0 | 0 | `opencode/deepseek-v4-flash` · ~$0 | Claude (in-session) | 🚫 Cancelled<br><sub>banner removed 2026-08-03</sub> | 🚫 Cancelled |
| 4 | 🔨 Worker | — | <span title="Run: /wbExplain --id=4 --as=expert">📄</span> | ~~**Reconcile the two command manifests** (core plan F11).~~ **ALREADY DONE** — both hold the same **33** commands. The original oracle compared *raw* key sets, but `.claude.json` carries 13 extra `$`-prefixed schema keys (`$schema_version`, `$purpose`, …), so it could **never** pass regardless of the data. Oracle now filters `$`-keys before comparing. | `node -e "const c=o=>Object.keys(o).filter(k=>!k.startsWith('$')).sort().join();const a=require('../../../../../../../core/templates/commands/wb_commands_reference.json'),b=require('../../../../../../../core/templates/commands/wb_commands_reference.claude.json');process.exit(c(a)===c(b)?0:1)"` | P1 | 0 | `opencode/deepseek-v4-pro` · ~$0 | `opencode/kimi-k2.7-code` | ✅<br>pre-existing | ✅ 10/10<br>oracle |
| [5](tasks/task_5/task_5_report_wb-flow-next_20260803.md) | 🔨 Worker | 1 | <span title="Run: /wbExplain --id=5 --as=expert">📄</span> | **Rewrite `core/README.md` for v1.0.2-r01.** Add the three subcommands (`init`, `model`, `wave`), `--summary` / `--sessions`, `wbRun` dispatch protection, the three-gate contract. Currently mentions none of them. | `for k in "wb-flow wave" "wb-flow model" "--summary" "--sessions"; do grep -q -- "$k" ../../../../../../../core/README.md \|\| exit 1; done` | P0 | 45 | `opencode/deepseek-v4-pro` · ~$0 / `opencode/kimi-k2.7-code` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5 |
| [6](tasks/task_6/task_6_report_wb-flow-next_20260802.md) | 🧠 Planner | 1 | <span title="Run: /wbExplain --id=6 --as=expert">📄</span> | **Write the transform spec** (S1): the `_part1`/`_part2` → `_examples.md` merge rule, per-folder `index.md` generation, front-matter mapping, and the orphan policy for the 67 site-only files. | `human: spec covers merge rule, index generation, front-matter, and orphan policy` | P0 | 40 | Claude (in-session) · ~$0 | `opencode/kimi-k3` | ✅<br>Claude Opus 5 | ✅ 9/10<br>Claude Opus 5<br><sub>🧠 Planner self-validation</sub> |
| [7](tasks/task_7/task_7_report_wb-flow-next_20260803.md) | 🔨 Worker | 6 | <span title="Run: /wbExplain --id=7 --as=expert">📄</span> | **Build the *classifying* sync script** per [task 6 §5](tasks/task_6/task_6_report_wb-flow-next_20260802.md) — **re-scoped 2026-08-03, this is no longer a copier.** Every candidate file gets exactly one of seven actions: `add` (69) · `update` (66, ≥60% line overlap) · **`conflict` (225, <60% — REPORT ONLY, never written)** · `skip` (4 identical) · `orphan-keep` (40 genuine site-only) · `orphan-drop` (12 stale `_partN`) · `excluded` (`node_modules/`, `wbLog/`). Implements the merge rule (§1, incl. heading demotion for parts 2..N), per-folder `index.md` generation (§2, extensionless links, never overwrite hand-authored section roots), and front-matter mapping (§3, only where absent). `--dry-run` prints the table and exits 0; `--json` emits the per-class counts. | `node ../../../../../../../documentation/flow.wbc-ui.com/scripts/sync_docs.js --dry-run >/dev/null && node ../../../../../../../documentation/flow.wbc-ui.com/scripts/sync_docs.js --dry-run --json \| node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);process.exit(r.duplicates===0&&r.duplicateDetail.length===0?0:1)})"`<br><sub>oracle repaired 2026-09-05 — see task_7 report re-validation</sub> | P0 | 75 | `opencode-go/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro<br><sub>`--json` added by Claude Opus 5</sub> | ✅ 9/10<br>anthropic/claude-sonnet-5<br><sub>re-scored 2026-09-05 — §1 idempotence fixed by 08-03 row 7, duplicates:0 confirmed on today's tree</sub> |
| [8](tasks/task_8/task_8_report_wb-flow-next_20260803.md) | 🔨 Worker | 7 | <span title="Run: /wbExplain --id=8 --as=expert">📄</span> | **Run the sync — `add` + `update` only. Re-scoped 2026-08-03: NOT "~323 files".** Write the **69** `add` and **66** `update` files, drop the **12** stale `_partN`, and **leave all 225 `conflict` files untouched** — they are independently authored public pages, not stale copies (task 6 §0). Emit the conflict list as an artifact for a later human pass. Then **regenerate `docs/.vitepress/sidebar.js`** (79 entries today) from the result — synced pages the sidebar doesn't list are unreachable. | `node ../../../../../../../documentation/flow.wbc-ui.com/scripts/sync_docs.js --dry-run --json \| node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);process.exit(r.add===0&&r['orphan-drop']===0?0:1)})" && grep -q wbModel ../../../../../../../documentation/flow.wbc-ui.com/docs/.vitepress/sidebar.js` | P0 | 45 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5<br><sub>0/249 conflicts touched; −1 for inherited task-7 §1 duplicates</sub> |
| 9 | 🔨 Worker | 8 | <span title="Run: /wbExplain --id=9 --as=expert">📄</span> | ~~**Port the v1.0.2-only pages** the site has never had: `wbModel/` (9 files, site has 0) plus every `wave` / `Next Executable Sequence` / `wbRun` / `--planner` concept page.~~ **DELIVERED BY TASK 8 — verified 2026-08-03, never separately dispatched.** The sync ported all of it: `wbModel/` **9 files** · `wb-flow wave` 2 · `wb-flow model` 2 · `Next Executable Sequence` 6 · `wbRun` 9 · `--planner` 9. The plan's baseline recorded **0** for every one of these. The original oracle (`grep -rq "wb-flow wave" && grep -rq "wb-flow model"`) became satisfiable the moment task 8 ran, so it could not distinguish "task 9 did the work" from "task 8 already had" — the 4th such false-positive oracle in this plan (see 3, 4, 18). Replaced with a file-existence assertion that would have failed before task 8. | `D=../../../../../../../documentation/flow.wbc-ui.com/docs; [ "$(ls $D/commands/wbModel/*.md 2>/dev/null \| wc -l)" -ge 9 ] && [ -f $D/concepts/wave-gating.md ] && [ -f $D/concepts/cli-subcommands.md ] && [ -f $D/concepts/model-fallback-chains.md ]` | P0 | 90 | `opencode/deepseek-v4-pro` · ~$0 / `opencode/kimi-k2.7-code` · ~$0 | Claude (in-session) | ✅<br>via task 8 | ✅ 9/10<br>Claude Opus 5 |
| [10](tasks/task_10/task_10_report_wb-flow-next_20260803.md) | 📋 Mechanical | 8 | <span title="Run: /wbExplain --id=10 --as=expert">📄</span> | **Remove the phantom** (S5): delete `docs/commands/wbLog/` from the site **and repoint the 4 links that pointed at it**. ~~drop the committed `demo_apps/my-finance-app/node_modules/`~~ — **premise corrected 2026-08-03: `node_modules/` is gitignored (`.gitignore:10`), so it was never committed and is not repo ballast.** The old oracle's `[ ! -d node_modules ]` clause tested the *local disk*, not the repository, and deleting 1,250 gitignored files would have been unrecoverable. Operator decision: treat that half as already satisfied. Oracle now asserts the phantom is gone, **no dead `wbLog` links remain**, and `node_modules` is ignored. | `[ ! -d ../../../../../../../documentation/flow.wbc-ui.com/docs/commands/wbLog ] && ! grep -rq -- '](commands/wbLog' ../../../../../../../documentation/flow.wbc-ui.com/docs/ && grep -qE '^node_modules/?$' ../../../../../../../../../../../.gitignore` | P1 | 15 | `opencode/deepseek-v4-flash` · ~$0 | `opencode/kimi-k2.7-code` | ✅<br>Claude Opus 5 | ✅ 9/10<br>kimi-k2.7-code |
| [11](tasks/task_11/task_11_report_wb-flow-next_20260803.md) | 🔨 Worker | 8 | <span title="Run: /wbExplain --id=11 --as=expert">📄</span> | **Rewrite `flow.wbc-ui.com/README.md`** — 31 lines is a stub for a published package's public docs site. Cover what the site is, how to build/deploy it, and its relationship to `core/docs/`. | `[ "$(wc -l < ../../../../../../../documentation/flow.wbc-ui.com/README.md)" -ge 80 ]` | P1 | 30 | `opencode/deepseek-v4-pro` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5<br><sub>31→148 lines; _deploy_/ + npm scripts verified</sub> |
| [12](tasks/task_12/task_12_report_wb-flow-next_20260803.md) | 📋 Mechanical | 8 | <span title="Run: /wbExplain --id=12 --as=expert">📄</span> | **Refresh `core/docs/README.md`** so the internal-docs index reflects the post-sync tree and the new v1.0.2 pages. | `grep -q "commands/wbModel/wbModel.md" ../../../../../../../core/docs/README.md && ! grep -q "commands/wbLog" ../../../../../../../core/docs/README.md && [ "$(grep -c "^. [0-9][0-9] . .\/wb" ../../../../../../../core/docs/README.md)" -eq 33 ]` | P2 | 20 | `opencode/deepseek-v4-flash` · ~$0 | `opencode/kimi-k2.7-code` | ✅<br>Claude Opus 5 | ✅ 8/10<br>kimi-k2.7-code<br><sub>−2 reason disputed — see report</sub> |
| [13](tasks/task_13/task_13_report_wb-flow-next_20260803.md) | ✅ Validator | 9, 10, 11, 12 | <span title="Run: /wbExplain --id=13 --as=expert">📄</span> | **Build and verify** (S6): `npm run build` the site, assert no dead internal links, and confirm `wbModel` + `wave` render in the nav. | `cd ../../../../../../../documentation/flow.wbc-ui.com && npm run build` | P0 | 30 | Claude (in-session) · ~$0 | `opencode/kimi-k3` | ✅<br>DeepSeek V4 Pro<br><sub>resolved by Claude Opus 5 — scoped ignore</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>negative control: injected link fails the build</sub> |
| [14](tasks/task_14/task_14_report_wb-flow-next_20260802.md) | 📋 Mechanical | 13 | <span title="Run: /wbExplain --id=14 --as=expert">📄</span> | **Unblock F6** — repoint the 29 dead `docs_claude/…_practical_claude.md` links in 28 templates to the now-live absolute URLs. | `! grep -rq "docs_claude/" ../../../../../../../core/templates/commands/` | P1 | 15 | `opencode/deepseek-v4-flash` · ~$0 | `opencode/kimi-k2.7-code` | ✅<br>Qwen 3.7 Plus | ✅ 10/10<br>Claude Opus 5<br><sub>29/29 links verified against live site pages</sub> |
| [15](tasks/task_15/task_15_report_wb-flow-next_20260802.md) | 📋 Mechanical | 13 | <span title="Run: /wbExplain --id=15 --as=expert">📄</span> | **Refresh the scope baselines** (S7): the site's [context.md] still claims **31 commands** and the obsolete `_eli5_claude` naming — correct it to the current count and naming, and re-run `/wbContext` on both scopes so each reflects the synced state. | `! grep -qE "31 commands\|_eli5_claude" ../../../../../../../documentation/flow.wbc-ui.com/.wb/workflows/context.md` | P2 | 20 | `opencode/deepseek-v4-flash` · ~$0 | Claude (in-session) | ✅<br>Qwen 3.7 Plus | ✅ 9/10<br>Claude Opus 5<br><sub>corrected 31→33 + naming, not deleted</sub> |
| [16](tasks/task_16/task_16_report_wb-flow-next_20260802.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=16 --as=expert">📄</span> | **Document the new CLI surface in [`core/docs/`](../../../../../../../core/docs/).** Three subcommands — `wb-flow model` (`--detect` `--reset` `--pick` `--probe` `--set` `--json` `--dry-run` `--file`), `wb-flow snap` (`--label` `--copy` `--list` `--json` `--root`), `wb-flow wave` (`--summary` / `--no-summary` `--sessions` `--wave=<L>:<R>` `--jobs` `--validate`) — plus the universal `--snap` / `--snap-copy` on 23 `/wb*` templates. **Independent of the site sync: this is `core/docs/` only.** | `for k in "wb-flow model" "wb-flow snap" "wb-flow wave" "--sessions" "--summary" "--snap" "--pick" "--probe"; do grep -rqF -- "$k" ../../../../../../../core/docs/ \|\| { echo "missing: $k"; exit 1; }; done` | P0 | 60 | `opencode-go/deepseek-v4-pro` · ~$0 / `gemini-3.1-pro-high` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 8/10<br>Claude Opus 5<br><sub>gap: `--worker-model` `--validator-model` `--mech-model` undocumented</sub> |
| [17](tasks/task_17/task_17_report_wb-flow-next_20260802.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=17 --as=expert">📄</span> | **Document the new *concepts*, not just the flags** — the three-gate contract (G1 INFRA / G2 NO-OP / G3 ATTEMPTED / DONE) and why output text is never a success signal; per-id gating for merged `--id=3,8`; the **model fallback chain** (advances on G1 only — a G2/G3 retry meets the same wall at double spend); the `agy` lane and its mandatory `--dangerously-skip-permissions`; roster **pool alternation** and why a 3-model chain on one subscription is one point of failure; the 🧠 Planner exemption from executor≠validator; the no-self-delegation rule; the neutral shipped roster + prepublish guard. | `for k in "three-gate" "NO-OP" "fallback chain" "pool" "agy"; do grep -rqiF -- "$k" ../../../../../../../core/docs/ \|\| { echo "missing: $k"; exit 1; }; done` | P0 | 75 | `opencode-go/deepseek-v4-pro` · ~$0 / `gemini-3.1-pro-high` · ~$0 | Claude (in-session) | ✅<br>DeepSeek V4 Pro | ✅ 9/10<br>Claude Opus 5 |
| [18](tasks/task_18/task_18_report_wb-flow-next_20260803.md) | 🔨 Worker | 8, 16, 17 | <span title="Run: /wbExplain --id=18 --as=expert">📄</span> | **Mirror 16 + 17 onto the site.** Runs after the sync (task 8) so it does not fight the transform, and after the source pages exist. | `for k in "wb-flow snap" "wb-flow model" "--sessions"; do grep -rqF -- "$k" ../../../../../../../documentation/flow.wbc-ui.com/docs/ \|\| exit 1; done` | P1 | 45 | `opencode-go/deepseek-v4-pro` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>DeepSeek V4 Pro<br><sub>pre-satisfied by task 8; honestly reported</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>correct no-op, accurately self-reported</sub> |
| [19](tasks/task_19/task_19_report_wb-flow-next_20260803.md) | 📋 Mechanical | 16 | <span title="Run: /wbExplain --id=19 --as=expert">📄</span> | **Regenerate the per-command flag reference** so each template's flag table is reflected in `core/docs/commands/<cmd>/`. `--snap` alone landed in 23 templates this session and appears in no doc. | `[ "$(grep -rlF -- '--snap' ../../../../../../../core/docs/commands/ \| wc -l)" -ge 20 ]` | P1 | 30 | `opencode-go/qwen3.7-plus` · ~$0 / `gemini-3.6-flash-high` · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Qwen 3.7 Plus<br><sub>report reconstructed by Claude Opus 5</sub> | ✅ 9/10<br>Claude Opus 5<br><sub>23/23 coverage, 0 missing, 0 over-applied</sub> |
| [20](tasks/task_20/task_20_report_wb-flow-next_20260803.md) | 🔨 Worker | — | <span title="Run: /wbExplain --id=20 --as=expert">📄</span> | **Document `wb-flow watch` in both doc trees.** Added 2026-08-03 as an inline task. New §4 in `concepts/cli-subcommands.md` (old §4 `--snap` renumbered to §5), plus the `concepts/README.md` index row and `docs/README.md` v1.0.2-r01 block ("Three CLI subcommands" → **Four**). Site copy landed via `sync_docs.js --only=` — the file classifies as `update` (78% overlap), so it was safe to sync; site `concepts/README.md` is a **conflict** (44%) and was left alone. | `C=../../../../../../../core/docs; S=../../../../../../../documentation/flow.wbc-ui.com/docs; grep -q "wb-flow watch" $C/concepts/cli-subcommands.md && grep -q "wb-flow watch" $S/concepts/cli-subcommands.md && grep -q "wb-flow watch" $C/README.md && grep -q "four CLI subcommands" $C/concepts/README.md` | P1 | 35 | Claude (in-session) · ~$0 | `opencode-go/kimi-k2.7-code` | ✅<br>Claude Opus 5 | ✅ 8/10<br>kimi-k2.7-code<br><sub>found + fixed: intro still said "three"</sub> |
### 💰 Plan Budget Estimate

| Metric | Value |
|---|---|
| **Total tasks** | 19 |
| **Total estimated time** | 695 min (~11.6 h) |
| **Total estimated tokens** | ~370 kt |
| **Est. cost (fast model worker)** | ~$1.48 *(billed as $0 — the `opencode/*` tier is flat-rate)* |
| **Est. cost (big thinker worker)** | ~$5.55 |

*Validation adds ~30% to worker tokens. The in-session Planner/Validator cells cost orchestrator context, not provider spend.*

---

## 🌊 Next Executable Sequence

> **Active Model Roster for this Plan:**
> 🧠 **Planner:** `Claude (in-session) || claude-opus-4-6-thinking || opencode-go/kimi-k3`
> ✅ **Validator:** `Claude (in-session) || claude-opus-4-6-thinking || opencode-go/kimi-k2.7-code`
> 🔨 **Worker:** `opencode-go/deepseek-v4-pro || gemini-3.1-pro-high || Claude (in-session)`
> 📋 **Mechanical:** `opencode-go/qwen3.7-plus || gemini-3.6-flash-high || Claude (in-session)`
>
> Each chain walks **three different billing pools** — Claude Pro → Google One → opencode Go — so one
> rate-limit window or billing lapse cannot take out a whole chain. `wb-flow wave` now honours the
> `||` fallback, advancing **only on a G1/INFRA failure**.
>
> ⚠️ `opencode-go/*` was rate-limited on 2026-08-02 (resets ~16:00). That no longer blocks: the chain
> falls through to `agy` (Google One), which answered every probe. `opencode/*` (Zen) is **deliberately
> absent** — that subscription is not being renewed.

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A–I** — ✅ **ALL CLOSED** | ✅ 1, 6 · re-scopes of 7+8 and 9 | ✅ 1, 2, 5, 6, 8, 9, 11, 14, 15, 16, 17, 18, 19 | ✅ 5, 7, 8, 11, 16, 17, 18 | ✅ 3, 10, 12, 14, 15, 19 |
| **J** — ✅ **CLOSED** | — | ✅ task 13 validated 9/10 | ✅ **task 13 resolved** — 2 real bugs fixed, ignore scoped to 4 documented external patterns, link-checking proven live by negative control. | — |

### Wave notes

> **Full notes live in [`tasks/wave_notes_wb-flow-next_20260802.md`](tasks/wave_notes_wb-flow-next_20260802.md).**
> They accumulate every `/wb*` run and had reached ~60% of this file. Only the open findings stay here;
> append new detail to that file, not to this section.

| # | Open finding | Status |
|---|---|---|
| 1 | **Task 13**: build green **only** because `ignoreDeadLinks: true` masks **73 dead links** | 🔴 operator decision |
| 2 | **Task 7 §1**: idempotence unimplemented → **18 duplicate topics** served by the site | 🔴 open |
| 3 | **Four `wave.js` bugs** — 7 false negatives + every validator a false positive this session | 🔴 unfixed |
| 4 | `--worker-model` / `--validator-model` / `--mech-model` undocumented | 🟡 open |

- **Waves A–I are closed**; 18/19 done, 15/19 validated. Only task 13 remains.
- **Every verdict in this plan was hand-verified**, because bugs 2 and 3 make the harness's own
  verdicts unreliable in both directions. `wb-flow watch` inherits the same limitation.

---

## 🚀 Recommended Next Execution Command(s)

> **Regenerate this block after every plan edit.** It is derived state — a stale copy tells you to
> dispatch a wave that closed hours ago. Last regenerated: **2026-08-03** (after task 20).

*State: **20 / 20 done · 19 / 20 validated**. Waves **A–I are closed**. The plan is complete.
Three rows remain uncertified — 7 (scored 6/10, §1 unimplemented), 10 and 12 (executed in-session,
so the orchestrator cannot self-certify them).*

- **Option 1 — Resolve task 13 (the only thing left)** — *the 73 dead links*
  ```
  # scope the ignore instead of suppressing globally (recommended), then:
  cd deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com && npm run build
  ```
- **Option 2 — Certify the open rows** — *task 13 (after the links call) + task 20*
  ```
  /wbValid deployement/packages/wb-flow/next/.wb/workflows/reports/2026/08/02/plans/plan_wb-flow-next_20260802.md --id=20
  ```
- **Option 2b — Certify task 13 once resolved** — *Est: 10 min*
  ```
  /wbValid deployement/packages/wb-flow/next/.wb/workflows/reports/2026/08/02/plans/plan_wb-flow-next_20260802.md --id=13
  ```
- **Option 3 — Watch anything still running** — *read-only, no cost*
  ```
  wb-flow watch            # follow the newest run
  wb-flow watch -1         # one-shot snapshot
  wb-flow watch --list     # past runs
  ```
- **Option 4 — Open the deferred work** ⚠️ *needs a new plan; not rows on this one*
  ```
  /wbPlan deployement/packages/wb-flow/next/core/ --task="fix the 4 wave.js harness bugs + task 7 §1 idempotence"
  ```

---
## 🔗 Action Types

| Tag | Meaning | Lane |
|---|---|---|
| 🧠 **Planner** | Decomposition, strategy, judgment calls | the orchestrator, **in-session** — never delegated |
| ✅ **Validator** | Verify work against its plan; score it | in-session, unless it pairs a non-Planner row the orchestrator executed |
| 🔨 **Worker** | Code generation and file edits | `opencode run -m opencode-go/deepseek-v4-pro` |
| 📋 **Mechanical** | Run a command, read output, format a report | `opencode run -m opencode-go/qwen3.7-plus` |

<!-- HOW_TO_RUN_START -->


## ▶️ How to run this plan

> Generated by `wb-flow next` — **derived from this plan**, not authored. Regenerate after
> every edit: a hand-written run-book goes stale the moment a task changes wave, and a stale
> one tells you to dispatch something that is now blocked.

| Wave | Cells | Spawned | Est. | Nature |
|---|---|---|---|---|
| A–I | 0 | — | — | ✅ closed |
| J | 0 | — | — | ✅ closed |

### The list

```bash
P=plan_wb-flow-next_20260802.md

# 0 — look before dispatching. Free, and it type-checks the matrix.
wb-flow wave $P --wave=A --list
```

### Why not `--wave=all`

No derived blocker in this plan — every wave is mechanical and dependency-clean. `--wave=all` is defensible here. Still watch the first dispatch: a half-failed wave makes the next one meaningless regardless.

### Flags

- `--summary` is **already the default** in wave mode. Add `--no-summary` only when
  debugging one cell — the full stream costs orchestrator context, once per cell.
- `--sessions` buys little here — no wave spawns enough cells to amortise a warm session.
- `--snap` / `--snap-copy` on any run you want to find again.


<!-- HOW_TO_RUN_END -->

---

## 📂 Generated Files (20260802)

### 📚 Base Reference Files
- [standup_wb-flow-next_20260802.md](../standups/standup_wb-flow-next_20260802.md) — the standup this plan was built from
- [core context.md](../../../../../../../core/.wb/workflows/context.md) · [site context.md](../../../../../../../documentation/flow.wbc-ui.com/.wb/workflows/context.md)

### Local Files
- this plan — `plan_wb-flow-next_20260802.md`
- task reports will land under [tasks/](tasks/)

---


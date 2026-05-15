# wb-flow Protocol: /wbGit Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbGit` command, applying the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs` (Root Monorepo)
**Current State Check:** Valid Git Repository. `.git` exists.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is Git Root | **[ACTIVE]** Scans 14k+ files. Detects recent activity in `frontEnd/wbc-ui/core2/packages/wb-flow/templates/`. |
| Target is Sub-Package | **[INACTIVE]** Command invoked at root. |
| Target is Uninitialized | **[INACTIVE]** Repo is valid. |

---

## 2. Argument Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State | Live Output Generation |
|---|---|---|---|
| No Argument | `Command: /wbGit` | Changes found in `frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/`. | `docs: expand wbGit documentation suite` |
| Directory Path | `Command: /wbGit frontEnd/wbc-ui/core2/packages/wb-flow/templates` | Changes found. | `docs(ai_reference): update wbGit templates` |
| File Path | `Command: /wbGit package.json` | No changes found in this file. | `❌ Error: No changes detected in package.json.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

### Information Extraction Flags
| Flag | Target Source (Live) | Live Output (Subject Line) |
|---|---|---|
| `--from-plan` (`-P`) | `plan_wb-core_20260504.md` | `⚠️ Warning: 0 tasks marked ✅ Done.` |
| `--scan-recent` (`-r`) | Files modified < 2h in workspace | `docs: generate massive exhaustive simulations` |
| `--diff-file="<p>"` (`-d`) | N/A (No patch provided) | `❌ Error: Patch file not found.` |

### Execution Flags (Dry-Run Simulation on Live Data)
| Flag | Terminal Action Prepared | Live Interactive Prompt Prepared |
|---|---|---|
| `--execute` (`-e`) | `git add frontEnd/wbc-ui/core2/packages/wb-flow/templates/... && git commit` | "Confirm to commit 58 new simulation files? [Y/n]" |
| `--push` (`-p`) | `git push origin HEAD` | "Confirm to push branch 'main' to origin? [Y/n]" |

### Architectural Context Flags (Live Data)
| Flag | Live Metadata Injection | Live Provenance Header Note |
|---|---|---|
| `--dashboard` (`-L`) | Local Vite Server Active | `notes: Graph: http://127.0.0.1:5173?token=d98f31b5a13688e5ebc162cb27ca4b36` |
| `--amend` (`-A`) | `git commit --amend` | `[AMENDING PREVIOUS: feat(plugin): understand-anything]` |
| `--issue="<ID>"` (`-i`) | `Refs: WB-LABS-CORE` | `Refs: WB-LABS-CORE` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### Chain A: The "Daily Sync" (`-P -e -p`)
**Live Context:** Running against `plan_wb-core_20260504.md`.
**Live Output:**
```text
[SYSTEM] Parsing plan... 
[WARNING] 0 tasks ✅ Done. 
[HALT] Daily sync aborted. Please complete tasks or use -r to commit filesystem changes.
```

### Chain B: The "Deep Context Graph" (`-r -L -i="DOCS-UPDATE"`)
**Live Context:** Running against current uncommitted docs overhaul.
**Live Output:**
```text
docs: massive expansion of simulation specifications

- Auto-generate exhaustive and live demo files for 26 commands
- Update README.md central routing table
- Overhaul /wbGit flag combinations matrix

<!-- wbGit
date:    2026-05-04 21:20
model:   <MODEL_NAME>
session: antigravity-63d91a5a
plan:    —
notes:   Graph: http://127.0.0.1:5173?token=d98f31b5a13688e5ebc162cb27ca4b36
-->

Refs: DOCS-UPDATE
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Empty Diff | **[FAIL]** Diff contains 58+ uncommitted files. | N/A (Proceeds to commit generation). |
| Conflict Detected | **[PASS]** No unmerged paths in `git status`. | N/A (Safe to commit). |
| Plan Missing `✅` | **[TRIGGERED]** `plan_wb-core_20260504.md` has no ✅. | Halts execution for `-P` flag. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

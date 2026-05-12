# wb-flow Protocol: /wbGit Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbGit` command within the `wb-flow` framework. It serves as the definitive reference for architectural traceability, contextual inference logic, and multi-agent synchronization protocols.

---

## 1. Role & Definition Matrix
**Role:** The Archivist
**Target:** Current Working Directory / Repository
**Constraint:** Must produce Conventional Commits with standard `<!-- wbGit -->` provenance headers. Never execute terminal git commands without explicit flags.

| Scenario | System Behavior |
|---|---|
| Target is Git Root | Scans all tracked files. Generates global commit. |
| Target is Sub-Package | Scans only files within the sub-package. Scopes commit type (e.g., `feat(wb-core):`). |
| Target is Uninitialized | Protocol Fault: Halts execution. "Not a git repository." |

---

## 2. Argument Resolution Matrix
| Argument Type | Example | Parsing Logic | Simulated Output |
|---|---|---|---|
| No Argument | `Command: /wbGit` | Analyzes `git diff` of CWD. | `feat: update workspace` |
| Directory Path | `Command: /wbGit packages/wb-core` | Analyzes diff scoped to directory. | `fix(wb-core): resolve types` |
| File Path | `Command: /wbGit src/index.js` | Analyzes diff of specific file. | `refactor(index): optimize init` |
| Invalid Path | `Command: /wbGit /fake/path` | Protocol Fault. | `❌ Error: Path does not exist.` |

---

## 3. Flag Processing Matrix (Isolated)

### Information Extraction Flags
| Flag | Target Source | Example | Simulated Output (Subject Line) |
|---|---|---|---|
| `--from-plan` (`-P`) | Latest `plan_*.md` (`✅ Done` tasks) | `Command: /wbGit -P` | `feat(api): implement JWT handshake` |
| `--scan-recent` (`-r`) | Files modified < 2h | `Command: /wbGit -r` | `docs: update wbGit reference` |
| `--diff-file="<p>"` (`-d`) | Provided patch file | `Command: /wbGit -d="patch.diff"` | `chore: apply user-provided patch` |

### Execution Flags
| Flag | Terminal Action | Example | Interactive Prompt |
|---|---|---|---|
| `--execute` (`-e`) | `git add . && git commit -m` | `Command: /wbGit -e` | "Confirm to run git add & commit? [Y/n]" |
| `--push` (`-p`) | `git push origin HEAD` | `Command: /wbGit -p` | "Confirm to push to remote? [Y/n]" |
| `--force` (`-F`) | `git push --force` | `Command: /wbGit -F` | "⚠️ Force push detected. Proceed? [Y/n]" |
| `--no-verify` (`-n`) | `git commit --no-verify` | `Command: /wbGit -n` | "⚠️ Hooks bypassed. Proceed? [Y/n]" |

### Architectural Context Flags
| Flag | Metadata Injection | Example | Simulated Provenance Header Note |
|---|---|---|---|
| `--dashboard` (`-L`) | Active Understand-Anything graph URL | `Command: /wbGit -L` | `notes: Graph: http://127.0.0.1:5173?token=abc` |
| `--amend` (`-A`) | `git commit --amend` | `Command: /wbGit -A` | `[AMENDING PREVIOUS COMMIT]` |
| `--issue="<ID>"` (`-i`) | Conventional Commit Footer | `Command: /wbGit -i="123"` | `Refs: <ID>` at end of message. |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### Chain A: The "Daily Sync" (`-P -e -p`)
**Context:** Infer from plan + execute commit + push.
**Simulated Output:**
```text
[SYSTEM] Parsing plan... 3 tasks ✅ Done.
[SYSTEM] Drafting message: 'feat: daily sync from plan'
[SYSTEM] Executing git add & commit.
[SYSTEM] Executing git push.
[OK] Sequence complete.
```

### Chain B: The "Deep Context Graph" (`-r -L -i="WB-10"`)
**Context:** Scan recent files + append graph link + append issue tracker.
**Simulated Output:**
```text
docs(infra): setup knowledge graph architecture

- Add .understandignore
- Initialize dashboard script

<!-- wbGit
notes: Graph: http://127.0.0.1:5173?token=xyz
-->

Refs: WB-10
```

### Chain C: The "Dangerous Override" (`"mixed" -F -e -p -n`)
**Context:** Natural language override + force push + bypass hooks.
**Simulated Output:**
```text
chore: urgent mixed fix and deployment override

⚠️ Note: Hooks bypassed via -n. Force-pushing via -F.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Empty Diff | `git diff` returns length 0 | `❌ Error: No changes detected. Nothing to commit.` |
| Conflict Detected | `git status` shows unmerged paths | `❌ Stop: Merge conflicts detected. Resolve manually.` |
| Plan Missing `✅` | Regex fails to find done tasks | `⚠️ Warning: No completed tasks found in current plan.` |
| Detached HEAD | Branch parsing fails | `⚠️ Warning: Detached HEAD state. Commits will not attach to a branch.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

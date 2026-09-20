# wb-flow

[![npm version](https://badge.fury.io/js/wb-flow.svg)](https://badge.fury.io/js/wb-flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

## The problem

Your coding agent redoes work it already did, loses track of why one task came before another, and when you ask it to check its own output it says "looks good" — because the check *is* the output.

## What wb-flow is

**A zero-dependency CLI that gives any AI coding agent a planned, parallel, validated, and traceable workflow** — task tables with dependency waves, a different model checking each piece, and a file-level evidence trail you can read after the session is over.

![wb-flow demo](assets/hero.gif)
*wb-flow demo*

## 30-second demo

```bash
npx wb-flow                        # bootstrap into your project
```

```bash
/wbPlan "add dark mode"            # → a ranked task table with dependencies
/wbWork --wave=A -y                # → executes wave A in parallel, writes reports
/wbValid --id=1                    # → a different model scores the work
```

![Your first workflow: Developer ↔ AI assistant ↔ wb-flow core](assets/FirstWorkflowAnimation.gif)

That's one cycle: **plan → execute → validate**, traced to files on disk.

## What a plan file actually looks like

This is a real task table from a real project — not a screenshot, not terminal output:

```markdown
| # | Requires | Dep | Task                              | Verify                    | P  | Est. | ☐ Done | ☐ Valid     |
|---|----------|-----|-----------------------------------|---------------------------|----|------|--------|-------------|
| 1 | 🔨 Worker | —   | Fix the prop types in WBCode      | /wbTest --scope=task-1    | P1 | 15m  | ✅     | ✅ 9/10     |
| 2 | 🔨 Worker | 1   | Extract helpers into wbc-utils    | npm test                  | P1 | 30m  | ✅     | ✅ 8/10     |
| 3 | ✅ Valid  | 2   | Audit the new exports for safety  | /wbAudit --focus=exports  | P0 | 20m  | ⬜     | ⬜          |
| 4 | 🧠 Plan  | 2   | /wbPlan wb-latex "port renderer"  | /wbAudit wb-latex         | P2 | 45m  | ⬜     | ⬜          |
```

Every row is a contract: **what** to do, **how** to verify it, **who** checks, and **whether it happened**. The `Dep` column is a DAG — wave A runs rows 1–2 in parallel; wave B waits for them.

## Works with

| Agent | How |
|---|---|
| **Claude Code** | `/wbPlan`, `/wbWork` — native slash commands via `wb-flow init` |
| **Codex** | same slash commands, same templates |
| **Gemini CLI** | same templates, TOML wrappers |
| **OpenCode** | `wb-flow wave` dispatches to `opencode run` |
| **Antigravity (agy)** | natural language — "run wbPlan on src/api" |
| **Cursor** | project-level command files |
| **Any agent** | "read `.wb/commands/wbPlan/wbPlan_template.md` and execute it on `src/api`" |

## Install

wb-flow requires a POSIX shell and is supported on Linux and macOS; Windows users should run it inside WSL.

```bash
npx wb-flow                  # one-shot, recommended
# or
npm install -g wb-flow && wb-flow
# or
git clone https://github.com/wissemb11/wb-flow.git ~/.wb-flow && node ~/.wb-flow/bin/install.js
```

```bash
wb-flow init                 # wire /wb* commands into your assistant
```

---

## 📚 Documentation

* **[What's New in v1.0.6](RELEASE_1.0.6.md)** — Closed-row audit visibility, V7/V8 vacuous oracle prevention, packaging hygiene, and security/verification hardening.
* **[Full Docs](https://flow.wbc-ui.com/)** — all 33 commands, concepts, workflow patterns
* **[Security Model](SECURITY.md)** — why plan files and `Verify` cells must be treated as executable code
* **[flow.wbc-ui.com](https://flow.wbc-ui.com)** — the documentation website

## 👨‍💻 About

**wb-flow** is created and maintained by [Wissem Boughamoura](https://github.com/wissemb11).

* 🐙 [GitHub](https://github.com/wissemb11/wb-flow) · 📦 [npm](https://www.npmjs.com/package/wb-flow) · 📬 [wissemb11@gmail.com](mailto:wissemb11@gmail.com)
* Bugs / features → [GitHub Issues](https://github.com/wissemb11/wb-flow/issues)

*License: MIT © 2026 Wissem Boughamoura. See [LICENSE](LICENSE).*

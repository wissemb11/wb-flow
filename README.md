# 🌊 WB-Flow: The Agentic AI Workflow Engine

[![npm version](https://badge.fury.io/js/wb-flow.svg)](https://badge.fury.io/js/wb-flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

> **WB-Flow** is a zero-dependency CLI tool that instantly bootstraps a powerful, standardized Agentic AI workflow system into any repository.

By copying a highly tuned set of 31 `/wb*` slash-command templates into your project, **WB-Flow** transforms generic AI coding assistants (like Claude Code, OpenCode, Gemini CLI, or Cursor) into disciplined, structured engineering teams.

![wb-flow demo](assets/demo.gif)

> *30-second tour: `npx wb-flow` materializes the full agentic workflow into your repo.*

---

## 🧐 What is it?
WB-Flow provides a definitive "contract" between you and your AI coding agents. It installs a `.wb/` directory containing markdown templates that instruct the AI exactly **how** to behave when performing complex software engineering tasks.

Instead of typing long, repetitive prompts, you simply type a command like `/wbAudit src/` or `/wbPlan`, and the AI reads the corresponding template to execute a deterministic, multi-step Standard Operating Procedure (SOP).

**Universal:** WB-Flow is framework-agnostic. It works with Vue, React, Python, Go, Rust, or any codebase — the templates are pure Markdown and the bootstrapper has zero runtime dependencies beyond Node.

## 🎯 What is it for?
Unconstrained AI agents often hallucinate, drift off-task, or write "spaghetti" code when given large objectives. WB-Flow solves this by enforcing an **Ideas Pipeline**:
1. **Audit:** Assess the codebase and identify technical debt (`/wbAudit`).
2. **Plan:** Break down the work into a structured task backlog (`/wbPlan`).
3. **Execute:** Work on atomic tasks one by one (`/wbWork`).
4. **Validate:** Perform an adversarial QA review of the work (`/wbValid`).

It ensures your AI follows strict monorepo conventions, maintains deep architectural context (`/wbContext`), and never goes rogue.

## 🥊 Compared With...
- **Raw AI Prompts / Chat:** You are at the mercy of the model's mood. With WB-Flow, the output format, reasoning steps, and constraints are rigidly defined in templates.
- **Heavy Frameworks (e.g., LangChain, AutoGen):** Those require python environments, API keys, and complex orchestration. WB-Flow is **pure Markdown**. It requires zero dependencies and works locally with your existing IDE or CLI AI assistant.
- **Persona-based agentic frameworks (e.g., BMAD-Method):** Those simulate a Scrum team — PM agent, Architect agent, Dev agent. WB-Flow inverts the model: **verbs over personas.** You don't ask "the QA agent" to audit code; you run `/wbAudit`. Tighter, more honest, less roleplay.

---

## 🚀 Installation

WB-Flow supports **four install paths** — pick whichever fits your environment. All four invoke the same `bin/install.js` underneath, so behavior is identical.

### Path 1 — One-shot via `npx` (Recommended)

Zero-install, zero-pollution. Run it once to bootstrap your repo:
```bash
cd my-project/
npx wb-flow
```

### Path 2 — Global install via npm

For repeat use across many projects:
```bash
npm install -g wb-flow
cd my-project/
wb-flow
```

### Path 3 — Git clone + direct invocation (no npm needed)

If you can't or don't want to use npm (air-gapped, restricted CI, offline dev):
```bash
git clone https://github.com/wissemb11/wb-flow.git ~/.wb-flow
cd my-project/
node ~/.wb-flow/bin/install.js
```

### Path 4 — Git clone + `npm link` (for contributors / local hacking)

Same global `wb-flow` command as Path 2, but sourced from a local clone you can edit:
```bash
git clone https://github.com/wissemb11/wb-flow.git
cd wb-flow
npm link
cd ~/my-project/
wb-flow         # uses your local clone — edit templates and re-run instantly
```

### Bootstrap flags

Once invoked, the bootstrapper accepts:

- `--force` / `-f` — overwrite existing files (default: skip existing)
- `--dry-run` / `-n` — preview without writing
- `--list` / `-l` — print the bundled command roster (31 entries) and exit
- `--help` / `-h` — show usage

### Re-running on an existing project

By default, `wb-flow` is **non-destructive** — it skips files that already exist in `.wb/`. Pass `--force` to overwrite, or `--dry-run` first to preview the diff. Your customizations to existing template copies are safe.

---

## ⚡ Quick Examples

Once WB-Flow is installed, your AI assistant will understand the following commands (and 27 others!):

* **Initialize the project AI identity:**
  > `/wbSetup src/`
* **Deep dive and score the code quality:**
  > `/wbAudit src/components/`
* **Create a task plan based on the audit:**
  > `/wbPlan src/components/`
* **Execute the tasks autonomously:**
  > `/wbWork .wb/workflows/reports/.../plan_xyz.md *`

> *Documentation site at [flow.wb-ui.com](https://flow.wb-ui.com) — coming soon. For now, the canonical reference is each `wbX/wbX_template.md` inside `.wb/commands/`.*

---

## 👨‍💻 About the Owner & Resources

**WB-Flow** is created and maintained by **Wissem Boughamoura** as a standalone, framework-agnostic dev tool. It is independent of the Vue-based `wbc-ui` ecosystem (despite the shared author) and is free to use with any AI coding assistant.

* 🐙 **GitHub:** [@wissemb11/wb-flow](https://github.com/wissemb11/wb-flow)
* 📚 **Documentation (planned):** [flow.wb-ui.com](https://flow.wb-ui.com)
* 👤 **Author:** [Wissem Boughamoura](https://github.com/wissemb11) — `wissemb11@gmail.com`

### 📬 Contact & Support

* Bugs / feature requests → [GitHub Issues](https://github.com/wissemb11/wb-flow/issues)
* General questions → email `wissemb11@gmail.com`

---
*License: MIT © 2026 Wissem Boughamoura. See [LICENSE](LICENSE).*
*Changelog: see [CHANGELOG.md](CHANGELOG.md).*

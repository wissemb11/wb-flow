# wb-flow

[![npm version](https://badge.fury.io/js/wb-flow.svg)](https://badge.fury.io/js/wb-flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

> **Your AI assistant is brilliant. It's just undisciplined.**
> wb-flow gives it a spine — 33 strict, verb-driven command templates that turn vague requests into structured, traceable, verifiable work.

![wb-flow demo](assets/demo.gif)

---

## The Problem

You give your AI a 3-hour task. Two hours in, it's rewriting files you didn't ask it to touch, skipped the part where it should have audited the codebase first, and committed with `git commit -m "fix stuff"`.

It didn't fail because it's not smart enough. It failed because **nobody gave it a process**.

## The Solution: Verbs, Not Personas

Most AI workflow tools solve this with *personas* — "ask the QA Agent", "invoke the Architect". wb-flow takes a different approach: **verbs over personas.**

You don't ask a role to review your code. You run `/wbAudit`. You don't ask a planner to break down a feature. You run `/wbPlan`. The command *is* the contract.

```
/wbAudit  →  /wbPlan  →  /wbWork  →  /wbValid
  Audit        Plan        Execute     Validate
```

**Audit before you plan. Plan before you execute. Validate before you ship.**

## 🧐 What is it?

wb-flow is a **zero-dependency CLI** that copies 33 structured `/wb*` slash-command templates into your project — pure Markdown files your AI reads and follows as operating procedures.

- **Zero runtime.** No server, no daemon, no Python environment. The tool installs itself and then disappears.
- **Zero lock-in.** Works with Claude Code, Cursor, OpenCode, Gemini CLI, or any assistant that reads a prompt.
- **Zero ambiguity.** Every command has a defined input contract, a defined output format, and a defined handoff to the next step.
- **Universal.** Works with Vue, React, Python, Go, Rust, Terraform — anything with source files.

## 🥊 Compared With...

| Approach | Limitation | wb-flow Advantage |
|---|---|---|
| **Raw AI prompts** | Output depends on the model's mood | Templates rigidly define format, steps, and constraints |
| **Heavy frameworks** (LangChain, AutoGen) | Require Python, API keys, orchestration | Pure Markdown, zero dependencies |
| **Persona-based agents** (BMAD-Method) | Simulate a Scrum team with roleplay | Verbs over personas — tighter, more honest, less drift |

---

## 🚀 Installation

### Path 1 — One-shot via `npx` (Recommended)

```bash
cd my-project/
npx wb-flow
```

### Path 2 — Global install via npm

```bash
npm install -g wb-flow
cd my-project/
wb-flow
```

### Path 3 — Git clone (no npm needed)

```bash
git clone https://github.com/wissemb11/wb-flow.git ~/.wb-flow
cd my-project/
node ~/.wb-flow/bin/install.js
```

### Path 4 — Git clone + `npm link` (for contributors)

```bash
git clone https://github.com/wissemb11/wb-flow.git
cd wb-flow && npm link
cd ~/my-project/
wb-flow         # uses your local clone
```

### Bootstrap flags

- `--force` / `-f` — overwrite existing files (default: skip existing)
- `--dry-run` / `-n` — preview without writing
- `--list` / `-l` — print the bundled command roster and exit
- `--help` / `-h` — show usage

By default, `wb-flow` is **non-destructive** — it skips files that already exist. Pass `--force` to overwrite, or `--dry-run` first to preview.

---

## ⚡ Quick Start

```bash
/wbSetup .                   # Read the codebase — generates context.md + dev.md
/wbPlan "add dark mode"      # Break the goal into a ranked task table
/wbWork --id=1               # Execute the first task, fully traced
/wbValid                     # Verify: does the work match the plan?
```

That's a full cycle: **plan → execute → validate**, guided by your AI assistant.

---

## 📚 Full Documentation

The complete reference — all 33 commands, workflow concepts, daily use patterns, and session lifecycle — is available in two places:

* **[→ GitHub Docs](https://github.com/wissemb11/wb-flow/tree/main/docs)** — browse the full documentation on GitHub
* **[→ flow.wbc-ui.com](https://flow.wbc-ui.com)** — the dedicated documentation website

---

## 🐕 Built With wb-flow

This documentation — all 250+ files, 33 command references, and concept pages — was itself planned, audited, and validated using `wb-flow`. Every task was tracked via `/wbPlan`, every page was scored via `/wbAudit`, and every commit was generated via `/wbGit`. The tool eats its own cooking.

---

## 👨‍💻 About the Owner & Resources

**wb-flow** is created and maintained by **Wissem Boughamoura** as a standalone, framework-agnostic dev tool. It is independent of the Vue-based `wbc-ui` ecosystem (despite the shared author) and is free to use with any AI coding assistant.

* 🐙 **GitHub:** [@wissemb11/wb-flow](https://github.com/wissemb11/wb-flow)
* 📦 **npm:** [wb-flow](https://www.npmjs.com/package/wb-flow)
* 📚 **Documentation:** [flow.wbc-ui.com](https://flow.wbc-ui.com) · [GitHub Docs](https://github.com/wissemb11/wb-flow/tree/main/docs)
* 👤 **Author:** [Wissem Boughamoura](https://github.com/wissemb11) — `wissemb11@gmail.com`

### 📬 Contact & Support

* Bugs / feature requests → [GitHub Issues](https://github.com/wissemb11/wb-flow/issues)
* General questions → email `wissemb11@gmail.com`

---

*License: MIT © 2026 Wissem Boughamoura. See [LICENSE](LICENSE).*
*Changelog: see [CHANGELOG.md](CHANGELOG.md).*

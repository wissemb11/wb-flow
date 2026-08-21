<!-- synced from ../../README.md -->
# wb-flow

[![npm version](https://badge.fury.io/js/wb-flow.svg)](https://badge.fury.io/js/wb-flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

## wb-flow turns AI coding into a planned, parallel, validated, and traceable engineering workflow.

It is a zero-dependency CLI that bootstraps an agentic AI control plane into any repo.
It works with Vue, React, Python, and any other codebase.
It is compatible with Claude Code, OpenCode, Gemini CLI, Cursor, and other coding agents.

![wb-flow demo](assets/demo.gif)
*Current demo* <!-- HERO: swap when thought 02 ships hero.gif -->

---

## Why wb-flow

Our workflow follows this core engineering ladder: Plan → Decompose → Parallelize → Execute → Validate → Trace.

### The Five-Layer Stack
- **Composable planning:** Structured definition and decomposition of tasks.
- **`--as` cognition:** Pre-flight explanations and step-by-step blueprints.
- **Waves:** Orchestrated, parallel execution scheduling.
- **Artifact graph:** A concrete trail of evidence connecting requirement to validation.
- **Model routing:** Dispatching the right model for the right job.

### Verbs Over Personas
We orchestrate *what* needs to happen (plan, execute, validate), not *who* does it. The command *is* the contract.

## 🚀 Installation

![npm install → wb-flow init → agent detection → wiring complete](assets/InstallationAnimation.gif)

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
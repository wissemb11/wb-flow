---
title: Installation Guide
description: "Four primary ways to install wb-flow into a project: NPM, NPX, Git clone, or manual ZIP."
---

# Installation Guide — 

Before you can start using the `wb-flow` commands, you need to bring the framework into your project or environment. This guide covers the four primary ways to get set up.

---

## 🛠️ Choose Your Installation Method

| Method | Best For... | Command / Action |
|---|---|---|
| **1. NPM (Permanent)** | Standard web projects & monorepos | `npm install @wb-labs/wb-flow` |
| **2. NPX (Scaffolding)** | One-off project initialization | `npx @wb-labs/wb-flow init` |
| **3. Git Clone** | Contributors or air-gapped environments | `git clone ...` then copy `packages/wb-flow/` |
| **4. Manual ZIP** | No Node/NPM access | Download `.zip` from GitHub Releases |

---

## Method 1: The Modern Way (NPM / Yarn / PNPM)

If you are working in a Node.js project, this is the recommended way. It ensures all dependencies are managed correctly and you can easily update the framework.

### Steps:
1. Open your terminal in the project root.
2. Run the install command:
 ```bash
 npm install @wb-labs/wb-flow --save-dev
 ```
3. Verify the installation:
 ```bash
 npx wb-flow --version
 ```

---

## Method 2: The Fast Track (NPX)

Want to start a brand new project without installing anything permanently first? Use `npx`.

### Steps:
1. Create your new project folder: `mkdir my-app && cd my-app`
2. Run the initializer:
 ```bash
 npx @wb-labs/wb-flow init
 ```
 *This will scaffold the `.wb/` directory and basic configuration for you.*

---

## Method 3: The Traditional Way (Git Clone / Copy-Paste)

If you prefer to keep the framework source directly in your codebase or don't want to use a package manager for the installation.

### Steps:
1. Clone the repository:
 ```bash
 git clone https://github.com/wb-labs/wb-flow-monorepo.git
 ```
2. Copy the contents of the `packages/wb-flow/` directory into a `.wb/` or `tools/wb-flow/` folder in your project.
3. If you use an AI Agent (like the agent Code or Cline), update your agent's configuration to point to these local command templates.

---

## Method 4: The Restricted Way (Manual Download)

For environments with strict firewall rules or no internet access for NPM.

### Steps:
1. Download the latest release from the [GitHub Releases](#) page.
2. Extract the ZIP file.
3. Move the files into your project directory.

---

## ✅ Post-Installation Verification

Once installed, run this to ensure the environment is ready for the agent:

```bash
# If installed via NPM
npx wb-flow --check-env

# Or manually check for the core folder
ls -d .wb/workflows/
```

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher.
- **AI Environment**: A compatible agentic environment (the agent Code, Antigravity, Cline, or OpenCode).
- **Permissions**: Read/Write access to the project directory.

---

> **Next Step:** Once installed, proceed to [**Getting Started**](getting_started) to begin your 30-day onboarding.

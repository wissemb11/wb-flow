# Bootstrapping wb-flow — Prerequisites & Setup

> This guide walks you through the prerequisites and initial setup needed before using wb-flow in a project.

---

## 1. Prerequisites

| Requirement | Version | Check Command |
|---|---|---|
| **Node.js** | ≥16.0.0 | `node --version` |
| **npm** | ≥8.0.0 | `npm --version` |
| **Git** | ≥2.30 | `git --version` |
| **AI model access** | Any supported model | (varies by provider) |

---

## 2. What wb-flow Expects

wb-flow works on any folder that has a `package.json`. It creates a `.wb/workflows/` directory structure to store its configuration and reports:

```
your-project/
├── package.json               ← required
├── src/                       ← your source code
├── .wb/                       ← wb-flow creates this
│   ├── commands/              ← command templates
│   │   ├── wbAudit/
│   │   ├── wbPlan/
│   │   ├── wbWork/
│   │   └── ...
│   ├── shortcuts/
│   │   └── shortcuts.md       ← shortcut definitions
│   └── workflows/
│       ├── context.md          ← project identity
│       ├── dev.md              ← development guide
│       ├── dev_reference.md    ← reference card
│       └── reports/            ← all generated reports
│           └── 2026/
│               └── 05/
│                   └── 11/
│                       ├── audits/
│                       ├── plans/
│                       ├── standups/
│                       └── tracks/
```

---

## 3. Installation

### Option A: Install from npm

```bash
npx @wbc-ui2/wb-flow init
```

This scaffolds the `.wb/` directory with all command templates and workflow files.

### Option B: Manual Setup

If you prefer manual setup:

```bash
# Create the directory structure
mkdir -p .wb/workflows/reports
mkdir -p .wb/commands

# Create the identity file
touch .wb/workflows/context.md
```

Then populate `context.md` using `/wbContext`:

```bash
/wbContext .
```

---

## 4. The context.md File

This is the most important file in wb-flow. It tells every command who you are and what your project does:

```markdown
# Context: my-project

## Identity
- **Package:** @scope/my-project
- **Version:** 1.0.0
- **Type:** Vue 2.7 component library
- **Tier:** Core (depended on by 4 packages)

## Dependencies
- vue: ^2.7.14
- @vueuse/core: ^10.0.0

## Goals
- Migrate from Options API to Composition API
- Improve test coverage from 45% to 80%
- Prepare for Vue 3 migration

## Rules
- All components must use <script setup> syntax
- No direct DOM manipulation
- Follow conventional commit format
```

Without `context.md`, wb-flow commands still work but produce lower-quality output because they lack context about your project.

---

## 5. Verifying the Setup

After installation, verify everything is working:

```bash
# Check the directory structure
ls -la .wb/workflows/

# Expected output:
# context.md
# dev.md
# dev_reference.md
# reports/

# Run a quick audit to test
/wbAudit .

# Expected: AI analyzes your project and produces an audit report
```

If the audit produces output, your setup is complete.

---

← [Start Here Hub](README.md) · [Home](../README.md)

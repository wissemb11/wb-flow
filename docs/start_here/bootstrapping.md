---
title: "Bootstrapping wb-flow — Prerequisites & Setup"
description: "---"
---

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
npx wb-flow init
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


## Bootstrapping wb-flow — npx init Walkthrough

> Part 2 provides a step-by-step walkthrough of `npx wb-flow init`, showing the expected output and the resulting file tree.

---

### 6. The `npx wb-flow init` Walkthrough

```text
$ npx wb-flow init

wb-flow v1.0.2-beta.0
Initializing wb-flow in current directory...

[1/4] Creating .wb/ directory structure...
  ✓ .wb/commands/ (14 command templates)
  ✓ .wb/shortcuts/ (shortcut definitions)
  ✓ .wb/workflows/ (workflow files)
  ✓ .wb/workflows/reports/ (report output directory)

[2/4] Detecting project type...
  ✓ Found package.json
  ✓ Type: Node.js project
  ✓ Framework: Vue 2.7 (detected from dependencies)

[3/4] Generating context.md...
  ✓ Reading package.json for identity
  ✓ Scanning src/ for file patterns
  ✓ Writing .wb/workflows/context.md

[4/4] Writing development guides...
  ✓ .wb/workflows/dev.md
  ✓ .wb/workflows/dev_reference.md

✅ wb-flow initialized successfully!

Next steps:
  1. Review .wb/workflows/context.md (your project identity)
  2. Run /wbAudit to get your first audit report
  3. Run /wbPlan to create your first task plan
```

---

### 7. What Was Created

After init, the complete file tree looks like:

```
.wb/
├── commands/
│   ├── wbAudit/
│   │   └── wbAudit_template.md
│   ├── wbClean/
│   │   └── wbClean_template.md
│   ├── wbContext/
│   │   └── wbContext_template.md
│   ├── wbGit/
│   │   └── wbGit_template.md
│   ├── wbHelp/
│   │   └── wbHelp_template.md
│   ├── wbIdea/
│   │   └── wbIdea_template.md
│   ├── wbNext/
│   │   └── wbNext_template.md
│   ├── wbPlan/
│   │   └── wbPlan_template.md
│   ├── wbRefactor/
│   │   └── wbRefactor_template.md
│   ├── wbStandup/
│   │   └── wbStandup_template.md
│   ├── wbTrack/
│   │   └── wbTrack_template.md
│   ├── wbValid/
│   │   └── wbValid_template.md
│   ├── wbVision/
│   │   └── wbVision_template.md
│   └── wbWork/
│       └── wbWork_template.md
├── shortcuts/
│   └── shortcuts.md
└── workflows/
    ├── context.md
    ├── dev.md
    ├── dev_reference.md
    └── reports/
        └── (empty — reports will be created here)
```

---

### 8. Existing Projects vs. New Projects

| Scenario | Behavior |
|---|---|
| `.wb/` doesn't exist | Full init — everything is created |
| `.wb/` already exists | `⚠️ .wb/ exists. Use --force to overwrite.` |
| `.wb/` exists + `--force` | Overwrites templates, preserves reports |
| `.wb/` exists + `--dry-run` | Shows what would be created/overwritten |

#### Preserving Reports

The `--force` flag never deletes the `reports/` directory. Your audit reports, plans, and task reports are always safe:

```bash
npx wb-flow init --force
## Templates: overwritten ✅
## Shortcuts: overwritten ✅
## context.md: preserved (use /wbContext to update)
## reports/: untouched ✅
```

---

### 9. Monorepo Setup

In a monorepo, each package gets its own `.wb/` directory:

```
monorepo/
├── packages/
│   ├── core/
│   │   └── .wb/workflows/context.md    ← core's identity
│   ├── ui/
│   │   └── .wb/workflows/context.md    ← ui's identity
│   └── api/
│       └── .wb/workflows/context.md    ← api's identity
└── .wb/workflows/context.md            ← monorepo root identity
```

Initialize each package separately:

```bash
cd packages/core && npx wb-flow init
cd packages/ui && npx wb-flow init
cd packages/api && npx wb-flow init
```

---

### 10. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `command not found: wb-flow` | Not installed globally | Use `npx wb-flow` |
| `No package.json found` | Running in wrong directory | `cd` to your project root |
| `Permission denied` | File system permissions | Check directory ownership |
| `context.md is empty` | No `package.json` to read | Create `package.json` first |

---

← [Start Here Hub](README.md) · [Home](../README.md)

---


> Part 2 provides a step-by-step walkthrough of `npx wb-flow init`, showing the expected output and the resulting file tree.

---

## 6. The `npx wb-flow init` Walkthrough

```text
$ npx wb-flow init

wb-flow v1.0.2-beta.0
Initializing wb-flow in current directory...

[1/4] Creating .wb/ directory structure...
  ✓ .wb/commands/ (14 command templates)
  ✓ .wb/shortcuts/ (shortcut definitions)
  ✓ .wb/workflows/ (workflow files)
  ✓ .wb/workflows/reports/ (report output directory)

[2/4] Detecting project type...
  ✓ Found package.json
  ✓ Type: Node.js project
  ✓ Framework: Vue 2.7 (detected from dependencies)

[3/4] Generating context.md...
  ✓ Reading package.json for identity
  ✓ Scanning src/ for file patterns
  ✓ Writing .wb/workflows/context.md

[4/4] Writing development guides...
  ✓ .wb/workflows/dev.md
  ✓ .wb/workflows/dev_reference.md

✅ wb-flow initialized successfully!

Next steps:
  1. Review .wb/workflows/context.md (your project identity)
  2. Run /wbAudit to get your first audit report
  3. Run /wbPlan to create your first task plan
```

---

## 7. What Was Created

After init, the complete file tree looks like:

```
.wb/
├── commands/
│   ├── wbAudit/
│   │   └── wbAudit_template.md
│   ├── wbClean/
│   │   └── wbClean_template.md
│   ├── wbContext/
│   │   └── wbContext_template.md
│   ├── wbGit/
│   │   └── wbGit_template.md
│   ├── wbHelp/
│   │   └── wbHelp_template.md
│   ├── wbIdea/
│   │   └── wbIdea_template.md
│   ├── wbNext/
│   │   └── wbNext_template.md
│   ├── wbPlan/
│   │   └── wbPlan_template.md
│   ├── wbRefactor/
│   │   └── wbRefactor_template.md
│   ├── wbStandup/
│   │   └── wbStandup_template.md
│   ├── wbTrack/
│   │   └── wbTrack_template.md
│   ├── wbValid/
│   │   └── wbValid_template.md
│   ├── wbVision/
│   │   └── wbVision_template.md
│   └── wbWork/
│       └── wbWork_template.md
├── shortcuts/
│   └── shortcuts.md
└── workflows/
    ├── context.md
    ├── dev.md
    ├── dev_reference.md
    └── reports/
        └── (empty — reports will be created here)
```

---

## 8. Existing Projects vs. New Projects

| Scenario | Behavior |
|---|---|
| `.wb/` doesn't exist | Full init — everything is created |
| `.wb/` already exists | `⚠️ .wb/ exists. Use --force to overwrite.` |
| `.wb/` exists + `--force` | Overwrites templates, preserves reports |
| `.wb/` exists + `--dry-run` | Shows what would be created/overwritten |

### Preserving Reports

The `--force` flag never deletes the `reports/` directory. Your audit reports, plans, and task reports are always safe:

```bash
npx wb-flow init --force
# Templates: overwritten ✅
# Shortcuts: overwritten ✅
# context.md: preserved (use /wbContext to update)
# reports/: untouched ✅
```

---

## 9. Monorepo Setup

In a monorepo, each package gets its own `.wb/` directory:

```
monorepo/
├── packages/
│   ├── core/
│   │   └── .wb/workflows/context.md    ← core's identity
│   ├── ui/
│   │   └── .wb/workflows/context.md    ← ui's identity
│   └── api/
│       └── .wb/workflows/context.md    ← api's identity
└── .wb/workflows/context.md            ← monorepo root identity
```

Initialize each package separately:

```bash
cd packages/core && npx wb-flow init
cd packages/ui && npx wb-flow init
cd packages/api && npx wb-flow init
```

---

## 10. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `command not found: wb-flow` | Not installed globally | Use `npx wb-flow` |
| `No package.json found` | Running in wrong directory | `cd` to your project root |
| `Permission denied` | File system permissions | Check directory ownership |
| `context.md is empty` | No `package.json` to read | Create `package.json` first |

---

← [Start Here Hub](README.md) · [Home](../README.md)

# Bootstrapping wb-flow — npx init Walkthrough

> Part 2 provides a step-by-step walkthrough of `npx @wbc-ui2/wb-flow init`, showing the expected output and the resulting file tree.

---

## 6. The `npx wb-flow init` Walkthrough

```text
$ npx @wbc-ui2/wb-flow init

@wbc-ui2/wb-flow v1.1.0-beta.0
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
npx @wbc-ui2/wb-flow init --force
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
cd packages/core && npx @wbc-ui2/wb-flow init
cd packages/ui && npx @wbc-ui2/wb-flow init
cd packages/api && npx @wbc-ui2/wb-flow init
```

---

## 10. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `command not found: wb-flow` | Not installed globally | Use `npx @wbc-ui2/wb-flow` |
| `No package.json found` | Running in wrong directory | `cd` to your project root |
| `Permission denied` | File system permissions | Check directory ownership |
| `context.md is empty` | No `package.json` to read | Create `package.json` first |

---

← [Start Here Hub](README.md) · [Home](../README.md)

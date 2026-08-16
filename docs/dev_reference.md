---
title: Developer Reference — flow.wbc-ui.com/ (Claude Edition)
description: Terminal commands and workflows for building and maintaining the VitePress Claude-edition documentation site.
---

# Developer Reference — `flow.wbc-ui.com/` (Claude Edition)

> **Scope:** Terminal commands and workflows for the VitePress Claude-edition documentation site.
> **Last generated:** 2026-05-13 (updated 21:49) by DeepSeek V4 Flash via opencode.

---

## Prerequisites

- VitePress scaffolding must be wired (`docs/.vitepress/config.js`, `package.json`, navbar/sidebar).
- The current plan lives in the local `.wb/workflows/reports/` tree; do not use the retired 20260513 site-root link.

## Build Environment

Run VitePress operations from the site package root:

```bash
# Dev server
npm run dev

# Build (production)
npm run build
```

The `package.json` scripts proxy to `vitepress dev docs` and `vitepress build docs`. No `NODE_PATH` or `npx --no-install` is needed — VitePress bundles its own Vite dev server and uses ESM natively.

---

## Commands

| Action | Command | Notes |
|---|---|---|
| **Dev server** | `npm run dev` (from `deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/`) | VitePress dev server on port 5173 |
| **Build** | `npm run build` (from `deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/`) | Produces `docs/.vitepress/dist/` |
| **Preview build** | `npm run preview` (from `deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/`) | Serves the built site locally for inspection |
| **Dry-run install** | `npm install --dry-run` (from `deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/`) | Verify this package's lockfile resolves |

---

## `/wb*` Agentic Commands

| Action | Command |
|---|---|---|
| **Setup** | `/wbSetup deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/` |
| **Context snapshot** | `/wbContext deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/` |
| **Plan** | `/wbPlan deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/` |
| **Work** | `/wbWork deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/.wb/workflows/reports/2026/08/13/plans/plan_flow.wbc-ui.com_20260813.md` |
| **Audit** | `/wbAudit deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/` |
| **Test** | `/wbTest deployement/packages/wb-flow/next/documentation/flow.wbc-ui.com/` |

---

## Key File Locations

| File | Purpose |
|---|---|
| `core/README.md` | Active package brief and architecture overview |
| [`context.md`](context.md) | This folder's identity and architecture |
| [`dev.md`](dev.md) | This folder's refusal rules |
| `.wb/workflows/reports/2026/08/13/plans/` | Active plan reports for this scope |
| `core/templates/` | Upstream template source of truth |

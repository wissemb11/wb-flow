---
title: Context — flow.wbc-ui.com/ (Claude Edition)
description: Project context and identity for the Claude-edition VitePress documentation site for the /wb* command system.
---

# Context — `flow.wbc-ui.com/` (Claude Edition)

> **Scope:** Claude-edition documentation distribution layer for the `/wb*` agentic command system. VitePress 1.x application source tree.
> **Last generated:** 2026-05-13 (updated 21:49) by DeepSeek V4 Flash via opencode.

---

## Identity

`flow.wbc-ui.com/` is the **Claude edition** of the wb-flow documentation — a VitePress 1.x application that publishes to `flow.wbc-ui.com`. It documents 33 `/wb*` commands across 7 reading files per command (hub + 6 layers), using a self-help field manual register. This is the source tree for the documentation site.

**Edition voice:** Self-help / field-manual register. Opinionated, "you"-addressed, names weak commands. No cheerleading, no marketing framing.

---

## API Surface (Content Tree)

Each of the 33 commands has exactly 7 reading files:
hub (`wbX.md`), `_eli5_claude`, `_practical_claude`, `_expert_claude`, `_examples_claude`, `_exhaustive_simulation_claude`, `_live_demo_claude`

| Subfolder | Purpose |
|---|---|
| `commands/` | 33 command directories, each with 7 reading files |
| `concepts/` | Cross-cutting topics (model recommendations, 4D navigation, Smart Merge, etc.) |
| `daily_use/` | Day-to-day workflow guides |
| `start_here/` | Onboarding entry points |
| `session_lifecycle/` | Session management guides (`/wbTrack`, `/wbStopTrack`) |
| `demo_apps_claude/` | Standalone demo applications (Claude-edition only — no mirror in sibling) |

**Edition-only content (not mirrored in `wb-flow-docs/`):**
- `demo_apps_claude/` — standalone demo applications

---

## Dependencies

| Dependency | Type | Relationship |
|---|---|---|
| `core/templates/` | **Upstream source of truth** | The runtime command templates. This site documents *about* those templates — it is NOT a fork. |
| `core/README.md` | **Package brief** | The maintained package README for the active `next` development line. |
| `core/.wb/workflows/context.md` | **Package context** | The active CLI identity, API surface, content topology, and release state. |
| `core/.wb/workflows/dev.md` | **Development rules** | The active package-level editing and verification rules. |

---

## Sibling Comparison

| Aspect | This (Claude) | `wb-flow-docs/` (Gemini) |
|---|---|---|
| **Target** | VitePress → `flow.wbc-ui.com` | GitHub Pages |
| **Voice** | Self-help field manual | Publication-ready professional reference |
| **Layers per command** | 7 (hub file + 6 layers) | 7 (hub file + 6 layers) |
| **Filenames** | `_claude` suffix | `_gemini` suffix |
| **Edition-only** | `demo_apps_claude/` | `_specs/`, `demo_apps_gemini/`, sync files |

---

## Conventions

- Both editions parallel-track 33 commands. The earlier "25 × 4" claim (2026-05-02) is obsolete.
- Cross-edition links use `../<sibling>/` — never absolute URLs.
- `src/` content is FROZEN during VitePress scaffolding. `docs/` is the working copy.
- `wbDeploy` has 1 supplementary guide (`wbDeploy_local_test_guide.md`) beyond the standard 6-layer structure — intentional, not a gap. The former `wbDeploy_github_pages_guide.md` was folded into the standard layers on 2026-08-15 (practical: config + first-deploy checklist; expert: branch-replacement mechanics + target fit; exhaustive_simulation: post-deploy symptom table).
- `demo_apps_claude/` currently contains 3 demo apps (`my-finance-app`, `my-new-app`, `python-etl`). Each demo is a full standalone app, not a snippet. Expect 3–5 demos at maturity.

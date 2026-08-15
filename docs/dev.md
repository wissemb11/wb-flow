---
title: Development Rules — flow.wbc-ui.com/ (Claude Edition)
description: Development rules and conventions for the Claude-edition documentation distribution layer of flow.wbc-ui.com.
---

# Development Rules — `flow.wbc-ui.com/` (Claude Edition)

> **Scope:** Claude-edition documentation distribution layer.
> **Last generated:** 2026-05-13 (updated 21:49) by DeepSeek V4 Flash via opencode.

---

## 🛑 1. Filename & Suffix Rules

1.  **Never strip `_claude` suffixes ad-hoc.** The suffix-strip rename touches ~370 files × cross-edition links and is deferred to a tracked `/wbWork`. Partial renames break navigation.
2.  **Never re-introduce 🇫🇷 French or 🇸🇦 Arabic appendices.** The wholesale removal on 2026-05-09 was deliberate. Documentation is English-only.
3.  **Never collapse the file count.** Exactly 7 files per command: hub (`wbX.md`) overview + 6 layer files (`eli5`, `practical`, `expert`, `examples`, `exhaustive`, `live_demo`). The sidebar links to the hub as the entry point; all 6 layer files are accessible from there.

---

## 🛑 2. Voice & Content Rules

1. **Never switch away from the self-help field-manual register.** "You" + opinionated. No cheerleading, no "magic" framing.
2. **Edit docs upstream in `core/docs/`, never the site copy.** `sync_docs.js` treats most site files as derived; a site-side edit to a synced file is reverted by the next sync. Site-*authored* files (`docs/index.md`, the command hub `README.md`s) are the exception — those are edited in place and the sync deliberately leaves them alone.
3. **Claude edition `expert` layer files** must end with a "one-paragraph verdict" naming weak points — never a hype summary.
4. **Claude edition `examples` files** must use realistic transcripts on actual monorepo packages (`wb-core`, `wb-press`, `wbdataviewer2.wbc-ui.com`). No invented scenarios.
5. **Claude edition commands** must include "direct comparison callouts" when the sibling's framing diverges: "What `wb-flow-docs`'s playbook gets wrong about X."

---

## 🛑 3. Cross-Link Rules

1. **Always use path-relative links** between editions: `../<sibling>/`. Never absolute URLs, never `file:///` URIs.
2. **README cross-links to the sibling edition** via `../wb-flow-docs/`. Keep path-relative.
3. **Upstream template references** must point to `core/templates/`, not duplicated inline.

---

## 🛑 4. VitePress / Build Rules

1. **Run npm operations from the site package root.** The active VitePress app owns its `package.json` and lockfile; do not install from an unrelated monorepo root.
2. **Never embed WBDataViewer** in VitePress `.md` pages (see §2.2).
3. **`src/` content is FROZEN** during scaffolding — no worker may modify files under `src/` or `docs/`. Only publish scaffolding (files outside `docs/` or under `docs/.vitepress/`) is modified.

---

## 🛑 5. Canon Split Rules

1. **`concepts/model_recommendations_claude.md`** is the publishing edition with per-command gold picks. It is NOT the runtime canon.
2. **The runtime canon** lives at `core/templates/commands/model_recommendations.md`. These are separate files and must never be merged.


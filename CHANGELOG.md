# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-05-14

### Official Stable Release

This release marks the transition from beta (`1.0.0-r01`) to the first official stable version. The CLI itself is unchanged — the focus is on documentation, discoverability, and developer experience.

#### 🚀 Documentation Website Launched
- **`flow.wbc-ui.com`** — Full VitePress-powered documentation site deployed.
- Per-page SEO metadata (title, description, Open Graph, Twitter Cards) for every doc page.
- Static workflow diagrams + 16 interactive Mermaid diagram equivalents embedded in GitHub docs.
- Google Analytics 4 (`G-RDGRR88KJH`) + Umami (ready) for traffic tracking.

#### 📚 GitHub Documentation Overhaul
- Added per-page frontmatter (title + description) to 60+ markdown files.
- Copied wb-flow logo and static workflow diagrams for native GitHub rendering.
- Added **Live Reports Snapshot** (`concepts/live_reports_snapshot.md`) showing real `.wb/workflows/` output.
- Added 16 Mermaid.js diagrams matching the Vue animation color palette (Plan/Work/Valid/Teal roles).
- Wrapped all diagrams in width-constrained containers for clean mobile rendering.
- Fixed 7 broken internal links; verified all 1,637 internal links clean.
- Added demo apps section with `python-etl` worked example.

#### 🔍 Analytics & SEO
- GA4 stream configured (`G-RDGRR88KJH`) for website traffic monitoring.
- SEO metadata: Open Graph, Twitter Cards, canonical URLs, favicons.
- Umami self-hosted analytics (VPS) ready for deployment alongside GA4.

#### 📋 Full Demo Apps Added
- `demo_apps/python-etl/README.md` — Complete end-to-end ETL workflow example with real `/wbAudit`, `/wbPlan`, and `/wbSetup` outputs.

## [1.0.0-r01] - 2026-05-12

### Initial Release
- **Zero-Dependency CLI:** Instant bootstrap via `npx wb-flow` without polluting your node_modules.
- **33 `wb*` Command Templates:** Full suite of workflow templates injected directly into your `.wb/` directory.
- **Multi-AI-Host Support:** Built-in parity for Claude Code, OpenCode, Gemini, and Cursor agents.
- **Ideas Pipeline:** Enforces deterministic multi-step processes via `/wbAudit` → `/wbPlan` → `/wbWork` → `/wbValid`.
- **Four Install Paths:** Supports global, local (npx), and offline/git-clone installation methods.
- **Agentic Documentation Suite:** Includes a complete 250+ file documentation system covering all 33 commands, session tracking, and workflow concepts (shipped in `docs/`).

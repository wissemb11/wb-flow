# Getting Started with the Agentic Workflow

Welcome to the WB-Labs Agentic Workflow system. This framework transforms standard AI assistants into autonomous, coordinated agents operating within a highly structured monorepo.

## The 26-Command Ecosystem
You have access to 26 specialized `/wb*` commands. Think of them as precise operational functions rather than prompt shortcuts.

### Core Loop (The Essentials)
- **/wbContext**: Reads source code to rebuild the foundational `context.md` file. Always run this first to establish a baseline.
- **/wbPlan**: Generates a multi-agent Task Plan with worker/validator assignments.
- **/wbAudit**: Executes a brutal, evidence-based code review resulting in a scored report.
- **/wbTrack**: Toggles the universal session logging protocol to record your reasoning process.
- **/wbCheck**: A strict pre-flight quiz to verify you actually understand the codebase before acting.

### Secondary Tools
- **/wbReview**: Formal validation of executed work against the original `/wbPlan`.
- **/wbActOn**: Transforms diagnostic documents (like Audits) into a ranked execution thread.
- **/wbSecure, /wbClean, /wbRefactor**: Surgical intervention tools for specific technical debt.

## First Steps
1. Navigate to a package (e.g., `packages/wb-core`).
2. Run `/wbCheck wb-core` to verify your understanding.
3. Run `/wbContext packages/wb-core` to establish the daily baseline.
4. Run `/wbStandup packages/wb-core` to review pending work from yesterday.

Once grounded, proceed to [The Daily Playbook](../daily_use/the_daily_playbook_part1.md) for execution.


## Prerequisites

- **Node.js 18+** — Required for the wb-flow CLI tools
- **Git** — Required for version control integration
- **A project** — Any codebase you want to use wb-flow with

## Next Steps

1. Configure your project conventions in `AGENTS.md`
2. Explore the [Commands](../commands/README.md) catalog to find the right tool for your task
3. Check the [Daily Use](../daily_use/README.md) guide for recurring workflows
4. Review [Session Lifecycle](../session_lifecycle/README.md) for managing agent sessions


## Troubleshooting

If commands don't work as expected, run `wbValid --quick` to check your setup, then review the `.wb/workflows/` directory for workflow files.


---

← [Start Here Hub](README.md) · [Home](../README.md)

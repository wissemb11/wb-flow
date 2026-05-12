# Concepts —

Deep-dive documentation of the architectural pillars that underpin the WB-Labs agentic workflow. Each file covers one concept end-to-end, from principle to practice.

## Index

| File | Coverage |
|---|---|
| [agentic_vs_manual.md](agentic_vs_manual.md) | Side-by-side comparison of the Agentic vs Manual release cycle |
| [overview_agentic_workflows.md](overview_agentic_workflows.md) | 4D Temporal Navigation, Smart Merge Protocol, and the Central JSON Registry |
| [model_recommendations_part1.md](model_recommendations_part1.md) | Per-command gold/silver/bronze model picks and budget-tier strategy |
| [flags_and_shortcuts_part1.md](flags_and_shortcuts_part1.md) | System-wide flag→shortcut grammar and the four generation rules |
| [command_classification_part1.md](command_classification_part1.md) | Taxonomy of all 33 commands by target and output type |
| [command_classification_part2.md](command_classification_part2.md) | Role interactions in multi-command workflows and edge cases |
| [command_composition_part1.md](command_composition_part1.md) | Chaining and self-application logic for command pipelines |
| [command_composition_part2.md](command_composition_part2.md) | Complete annotated chain examples from real wb-flow usage |
| [flags_and_shortcuts_part2.md](flags_and_shortcuts_part2.md) | The user shortcut grammar system for response style and format control |
| [plan_state_management_part1.md](plan_state_management_part1.md) | The `⬜`→`✅`→`⏸️`→`🚫` state machine and CLI overrides (`--open`, `--def`, `--can`) |
| [plan_state_management_part2.md](plan_state_management_part2.md) | Re-execution flows, validator conflicts, stale state detection |
| [ideas_pipeline_part1.md](ideas_pipeline_part1.md) | The Ideas Pipeline architecture: from capture to execution |
| [ideas_pipeline_part2.md](ideas_pipeline_part2.md) | Scoring algorithm internals and the promotion-to-plan handoff protocol |
| [model_recommendations_part2.md](model_recommendations_part2.md) | Model-specific strengths, cross-model validation strategies |
| [self_correct_mode_part1.md](self_correct_mode_part1.md) | Detection, gap-filling, link-fixing, and state synchronization |
| [self_correct_mode_part2.md](self_correct_mode_part2.md) | Safety guardrails, manual suppression, and when NOT to self-correct |
| [wbPlan_flag.md](wbPlan_flag.md) | The complete `/wbPlan` flag reference: column filters, state overrides, and chaining |
| [universal_flags_exhaustive_simulation.md](universal_flags_exhaustive_simulation.md) | Full walkthrough simulation of every universal (Super) flag in action |
| [wbWorkflow/README.md](wbWorkflow/README.md) | The lifecycle of a work item: from Audit → Plan → Work → Valid → Release |

## How to use this section

- **New to the system?** Start with [overview_agentic_workflows.md](overview_agentic_workflows.md) for the 20,000-foot view.
- **Need to pick a model?** Jump to [model_recommendations_part1.md](model_recommendations_part1.md).
- **Understand how ideas flow from capture to execution?** Read [ideas_pipeline_part1.md](ideas_pipeline_part1.md).
- **Debugging a stuck plan?** See [plan_state_management_part1.md](plan_state_management_part1.md) and [wbPlan_flag.md](wbPlan_flag.md).

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concepts in a self-help, opinionated register.


## Related Concept Pages

- **[wbWorkflow](wbWorkflow/README.md)** — Lifecycle of a work item from audit to release
- **[Model Recommendations](model_recommendations_part1.md)** — Per-command model picks and budget strategy
- **[Flags & Shortcuts](flags_and_shortcuts_part1.md)** — System-wide flag grammar and conventions
- **[Command Classification](command_classification_part1.md)** — Taxonomy of all 33 commands by type
- **[Plan State Management](plan_state_management_part1.md)** — State machine for task tracking
- **[Ideas Pipeline](ideas_pipeline_part1.md)** — From capture to execution

## Cross-Reference

These concept pages connect to the [Commands](../commands/README.md) directory and the [Session Lifecycle](../session_lifecycle/README.md) guide. For daily operating procedures, see [Daily Use](../daily_use/README.md).
---

← [Home](../README.md) · [Commands](../README.md#the-command-catalog) · [Install](../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

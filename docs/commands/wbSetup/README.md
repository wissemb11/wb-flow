# /wbSetup — Command Hub

`/wbSetup` scaffolds the initial file structure, configuration, and workflow files for a new project or package. It creates the `.wb/workflows/` directory tree, generates starter `context.md` and `dev.md` files, and sets up the report folder structure. It is the Day-0 command that establishes the conventions all subsequent `/wb*` commands will follow.

## 🎯 Strategic Position

Every package in the monorepo needs an "agentic brain" — a set of rules and context files that tell AI agents what the package is, how to build it, and what not to do. `/wbSetup` creates that brain. It is idempotent and framework-aware, but it is not a refresh tool: re-running it on an existing tuned package risks overwriting hand-authored rules.

- **New package** — run immediately after `mkdir`, before writing any code.
- **Acquired package** — if you inherited something that never had `/wbSetup`, run it now.
- **Big rename/restructure** — if you moved the folder, re-run so `context.md` reflects the new reality.
- **Do NOT run** to "refresh" an existing working package — that's `/wbContext`.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Standard** | `/wbSetup <pkg-path>` | `context.md` + `dev.md` for the package |
| **Focused** | `/wbSetup <pkg-path> --focus="<subsystem>"` | Standard files plus a focused deep-dive file |
| **Global** | `/wbSetup <monorepo-root>/ --scope=global` | `monorepo_rules.md` only |

## ✅ What a useful setup contains

1. A `context.md` that accurately reflects what the package *is* — identity, API surface, dependency map.
2. A `dev.md` where every rule is a *refusal* ("never X", "do not Y") — not prose descriptions.
3. A `dev_reference.md` with exact terminal commands for build, test, and serve.
4. The `dist/` vs `dist-dev/` rule if the package publishes.
5. **Sync with `monorepo_rules.md`** — local rules aligned with shared standards.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Generate content or code | Manual creation after setup |
| Configure CI/CD | [`/wbDeploy`](../wbDeploy/README.md) |
| Plan work | [`/wbPlan`](../wbPlan/README.md) after setup |
| Refresh an existing package's context | [`/wbContext`](../wbContext/README.md) |
| Guess the correct rules | **Read the output.** A 2-minute read of `dev.md` catches 90% of mistaken rules before they cause damage. |

## 📚 Reading Order

1. **[ELI5](wbSetup_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbSetup_practical.md)** — step-by-step on a real project.
3. **[Expert](wbSetup_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbSetup_examples.md)** · **[Part 1](wbSetup_examples.md)** · **[Part 2](wbSetup_examples.md)** — annotated transcripts.
5. **[Exhaustive simulation](wbSetup_exhaustive_simulation.md)** · **[Live demo](wbSetup_live_demo.md)**.

## 🔗 Related

- [`wbSetup.md`](wbSetup.md) — the command reference this hub orients you around.
- [`/wbContext`](../wbContext/README.md) — load existing context (don't overwrite).
- [`/wbValid`](../wbValid/README.md) — verify the setup after running.
- [`/wbPlan`](../wbPlan/README.md) — plan work once the structure exists.

## Quick Reference

```bash
/wbSetup <pkg-path>                              # standard: context.md + dev.md
/wbSetup <pkg-path> --focus="<subsystem>"        # plus focused deep-dive
/wbSetup <monorepo-root>/ --scope=global          # monorepo_rules.md only
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

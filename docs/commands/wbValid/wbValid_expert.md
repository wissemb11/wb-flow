# /wbValid — Expert Guide

Welcome to the advanced capabilities of the `/wbValid` command! As an architect of the `wb-labs` monorepo, you understand that validation isn't just about syntax—it's about ensuring architectural integrity and intent. 

## 🏗️ Architectural Validation Protocols

`/wbValid` operates on a dual-axis verification system:
1. **The Contract Axis:** Did the code fulfill the requirements outlined in the `Task` description of the plan file?
2. **The Environment Axis:** Did the code compile? Did tests pass? Did it respect the monorepo's existing architectural patterns (e.g., using `@wbc-ui2/wb-core` imports instead of raw implementations)?

### The Cross-Model Paradigm
The most powerful feature of `/wbValid` is its role in cross-model verification. We highly recommend configuring your pipeline so that the model executing `/wbValid` is structurally different from the model that executed `/wbWork`. 

For example, if a Gemini model generates the code, a Claude or DeepSeek model should validate it. This prevents "model blindness" where an LLM inadvertently approves its own logical fallacies.

## ⚙️ Template Customization

If you need to adjust the stringency of the validation, you can edit the `/wbValid` template located at `frontEnd/wbc-ui/core2/packages/wb-flow/templates/commands/wbValid/wbValid_template.md`.

**Key areas to tweak:**
- **The Rejection Threshold:** By default, `/wbValid` requires a 100% match. You can introduce "soft warnings" for minor linting issues that don't warrant a full task rejection.
- **Automated Revert Hooks:** You can extend the template to automatically run a `git stash` or code revert if a validation fails, ensuring the workspace remains pristine.

## 🛑 Failure Modes & The "Agreeableness" Trap

Be cautious of the "Agreeableness Trap." Some LLMs are overly eager to please and might pass a validation even if edge cases are unhandled. To combat this, the implementation of `/wbValid` explicitly prompts the model to adopt a "brutal review" persona, prioritizing strict compliance over politeness.

If you find `/wbValid` passing incomplete code, check the validation prompt instructions in the template and reinforce the strictness constraints!

## 🎛️ Universal Column Filtering & Recursive Parent Logic

As of the v5.1 protocol update, the `--id` flag has been expanded into **Universal Column Filtering**. You can now validate tasks using ANY column in the plan table (e.g., `--est<=30`, `--p=P1`, `--done=true`, `--worker=Gemini`). This allows for dynamic, highly specific validation queues based on metadata rather than static task numbers.

Additionally, **Recursive Parent Logic** fundamentally changes how nested tasks are handled. When `/wbValid` targets a parent task ID (e.g., `--id=5`) that has been expanded into children (`5.1`, `5.2`, `5.3`), the system will sequentially validate ALL child tasks under that parent in a single workflow. The parent task's `☐ Valid` column remains unchecked but retains the expansion hint (e.g., `⬜ Expanded → 5.1, 5.2, 5.3`) until every last child task is fully validated.

## ➕ Cumulative Validation (The Double-Check)

Unlike the `☐ Done` column (where a new execution completely overwrites the previous worker), the `☐ Valid` column is **cumulative**. If a task has already been validated by `Claude 3.7 Sonnet`, and you are asked to validate it again as `AI`, you must **APPEND** your signature using a horizontal rule (`<hr>`). 

This creates an irrefutable chain of trust for critical P1 tasks: `✅ 10/10<br>Claude<hr>✅ 10/10<br>Gemini`.


## Related Resources

- [wbValid ELI5](wbValid_eli5.md) — Beginner-friendly overview
- [wbValid Practical](wbValid_practical.md) — Step-by-step walkthrough
- [wbValid Reference](wbValid_ref.md) — Full option reference
- [Commands Overview](../README.md) — Full command catalog

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

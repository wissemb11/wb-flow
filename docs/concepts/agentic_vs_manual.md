# Agentic vs Manual Workflow

When evaluating whether to adopt `wb-flow`, the most common question is: *Why do I need a CLI tool for this? Why can't I just tell the AI what to do?*

The answer comes down to **cognitive load** and **hygiene**. Below is a side-by-side comparison of a standard release cycle executed via `wb-flow`'s strict agentic commands versus doing it manually.

## The Release Cycle Comparison

| Step | Agentic Workflow (`wb-flow`) | Manual Workflow | Why Agentic Wins |
|---|---|---|---|
| **1. Verification** | `/wbCheck` or `/wbAudit` | Run test suite, check coverage, manually review code quality. | **Comprehensive.** The AI catches logical flaws, technical debt, and architectural drift that standard automated tests miss. It guarantees a human-grade review before every release. |
| **2. Prep Release** | `/wbRelease` | Manually edit `package.json` version, read `git log`, manually write `CHANGELOG.md`. | **Zero Cognitive Load.** The AI perfectly parses the commit history to draft Conventional Changelogs. It eliminates human error and forgotten version bumps. |
| **3. Commit & Push** | `/wbGit --execute --push` | `git add .` <br> `git commit -m "release"` <br> `git push` | **Hygiene.** The AI analyzes the actual diff to write a highly descriptive Conventional Commit message. It prevents lazy `wip` commits and enforces strict git history hygiene. |
| **4. NPM Publish** | `/wbPublish` | `npm publish --access public` | **Safety.** For simple packages, the manual command is just as fast. For complex packages, `/wbPublish` is safer because the AI can verify the build artifacts before publishing. |
| **5. Monorepo Sync** | `/wbGit --execute` | `git commit -m "bump version"` | **Traceability.** The AI writes a context-rich commit message linking back to the release operation automatically, creating a perfect audit trail in the monorepo. |

## Beyond Release: Daily Development

The pattern extends beyond releases to everyday tasks:

| Scenario | Agentic | Manual |
|---|---|---|
| **Debug a failing test** | `/wbDebug` — hypothesizes root cause, suggests fix | Scroll through stack traces, manually bisect |
| **Restructure a module** | `/wbRefactor` — preserves behavior, updates imports | Manual find-and-replace, risk of missed references |
| **Add a feature** | `/wbPlan` → `/wbWork` — structured breakdown, traced execution | Single vague prompt, unpredictable scope drift |
| **Audit code quality** | `/wbAudit` — scored report across 5 dimensions | Subjective manual review, no repeatable metric |

The agentic path is **repeatable, measurable, and traceable**. The manual path depends entirely on the developer's current context and energy level.

## The Philosophy: Verbs over Personas

If you simply prompt your AI assistant with *"prepare a release"*, it might do steps 2 and 3, skip step 1, and hallucinate step 4. This is the danger of conversational AI—it is undisciplined.

By using explicit commands (`/wbAudit`, `/wbRelease`), you enforce a **deterministic contract**. The AI knows exactly what regime it is in, what file formats to read, and what output to generate. It turns the AI from a chatty assistant into a rigorous, pipeline-driven coworker.

## When Manual Still Wins

Agentic workflows are not always better. Cases where manual prompting is preferable:

- **Exploratory research** — "What's the best way to handle auth in this framework?" needs conversation, not a pipeline
- **One-off scripts** — A 5-line Python script doesn't need a full plan-work-valid cycle
- **Learning a new codebase** — Browsing and asking questions is more natural than running commands
- **When speed matters more than rigor** — Sometimes `git commit -m "fix"` is fine for a solo dev at 2 AM

The art is knowing which mode to use. wb-flow gives you the option; it doesn't force it.

---

<div align="center">

← [Home](../README.md) · [Commands](../README.md#the-command-catalog) · [Install](../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

</div>

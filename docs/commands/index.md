---
title: Commands
description: Per-command deep-dives across 33 commands with 7 reading files forming the reference body of this documentation.
---

# Commands

> Per-command deep-dives. 33 commands × 7 reading files (hub + 6 layers) = the reference body of this documentation.

Each command lives in its own folder (`wbSetup/`, `wbContext/`, …, `wbStopTrack/`). Inside each folder you'll find up to seven files: a hub summary (`wbX.md`) and six layer files.

<PlanWorkValid/>

---

## The seven files per command

| File | Length | Read when |
|---|---|---|
| **hub** (`wbX.md`) | 1 page | You want a quick overview: purpose, invocation, what happens |
| **eli5** | 1–2 paragraphs | You want a one-line mental model |
| **practical** | ~1 page | You're about to run the command and need the trade-offs |
| **expert** | 2–3 pages | You're considering modifying the command's runtime template |
| **examples** | 3–5 pages | You forgot what the command's output actually looks like |
| **exhaustive_simulation** | Full transcript | Complete behavior matrix for every input scenario |
| **live_demo** | Interactive | Real-time walkthrough of the command applied to an actual workspace |

---

<CommandDocsNavigationAnimation />

---

## Quick lookup — which command for which job?

| You want to... | Command | Folder |
|---|---|---|
| Bootstrap a new package's `context.md` + `dev.md` | `/wbSetup` | [wbSetup/](wbSetup/README.md) |
| Sync the AI's understanding of a package | `/wbContext` | [wbContext/](wbContext/README.md) |
| Monorepo-wide scan: what's in-flight? | `/wbStandup` | [wbStandup/](wbStandup/README.md) |
| Break a goal into a worker/validator task plan | `/wbPlan` | [wbPlan/](wbPlan/README.md) |
| Brainstorm features when the queue is empty | `/wbVision` | [wbVision/](wbVision/README.md) |
| Capture and score speculative ideas | `/wbIdea` | [wbIdea/](wbIdea/README.md) |
| Pick the next optimal command based on repo state | `/wbNext` | [wbNext/](wbNext/README.md) |
| Print the command catalog or per-command help | `/wbHelp` | [wbHelp/](wbHelp/README.md) |
| Triage a diagnostic doc into ranked actions | `/wbActOn` | [wbActOn/](wbActOn/README.md) |
| Generate a persistent explanation of code or a task | `/wbExplain` | [wbExplain/](wbExplain/README.md) |
| Execute tasks defined in a plan file | `/wbWork` | [wbWork/](wbWork/README.md) |
| Validate `/wbWork` output against the plan | `/wbValid` | [wbValid/](wbValid/README.md) |
| Get a brutal review of code quality | `/wbAudit` | [wbAudit/](wbAudit/README.md) |
| PR-style review of a specific change vs. its plan | `/wbReview` | [wbReview/](wbReview/README.md) |
| Run tests and triage failures | `/wbTest` | [wbTest/](wbTest/README.md) |
| Pre-flight quiz to verify the AI understands the code | `/wbCheck` | [wbCheck/](wbCheck/README.md) |
| Find dead code and forgotten `console.log` | `/wbClean` | [wbClean/](wbClean/README.md) |
| Restructure code without changing behavior | `/wbRefactor` | [wbRefactor/](wbRefactor/README.md) |
| Hypothesize then investigate an error | `/wbDebug` | [wbDebug/](wbDebug/README.md) |
| Generate JSDoc + READMEs from code | `/wbDoc` | [wbDoc/](wbDoc/README.md) |
| Bump versions, unpick `workspace:*` | `/wbRelease` | [wbRelease/](wbRelease/README.md) |
| Push a package to npm | `/wbPublish` | [wbPublish/](wbPublish/README.md) |
| Deploy an app to a web host | `/wbDeploy` | [wbDeploy/](wbDeploy/README.md) |
| Inject premium gating | `/wbLicense` | [wbLicense/](wbLicense/README.md) |
| Generate release announcement kit | `/wbBroadcast` | [wbBroadcast/](wbBroadcast/README.md) |
| Bootstrap Free/Pro/Dev tier plumbing | `/wbMonetize` | [wbMonetize/](wbMonetize/README.md) |
| Commit code with Conventional Commits | `/wbGit` | [wbGit/](wbGit/README.md) |
| Set or show the active model roster | `/wbModel` | [wbModel/](wbModel/README.md) |
| Red-team scan: secrets, XSS, insecure deps | `/wbSecure` | [wbSecure/](wbSecure/README.md) |
| Pull hardcoded strings to i18n keys | `/wbTranslate` | [wbTranslate/](wbTranslate/README.md) |
| Rewrite legacy/Vuetify into wbc-ui2 | `/wbToWBC` | [wbToWBC/](wbToWBC/README.md) |
| Toggle session-wide logging of `/wb*` invocations | `/wbTrack` | [wbTrack/](wbTrack/README.md) |
| Finalize a session and archive the tracker | `/wbStopTrack` | [wbStopTrack/](wbStopTrack/README.md) |

---

## How to navigate to a command's docs

Select **Pattern A** (by scenario) or **Pattern B** (by concept) in the interactive **Command Documentation Explorer** above to animate the exact path.

If you're already in a command's folder and want to switch layers (e.g., you read `practical` and want examples), the files are siblings — no navigation needed.

---

## Recommended reading order for first-time encounters

When you're about to run a command for the first time:

```
hub (wbX.md) → eli5 → practical → (run it once) → examples → (run it again)
```

Skip `expert` unless you're modifying the command's runtime template.

---

## The machine-readable catalog

[`wb_commands_reference.json`](wb_commands_reference.json) is the same 33-command catalog in JSON form, suitable for tooling that needs to introspect the command surface programmatically.

---

## What this folder is NOT

- Not a tutorial. For first-time onboarding, go to [`../start_here/`](../start_here/README.md).
- Not a daily playbook. For "what to run at 10am vs. 4pm," go to [`../daily_use/`](../daily_use/README.md).
- Not the runtime templates. The source-of-truth `_template.md` files that define what each command actually does live in `packages/wb-flow/templates/commands/`. This folder documents *how to use* them.

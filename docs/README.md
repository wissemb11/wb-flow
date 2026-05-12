# wb-flow

> **Your AI assistant is brilliant. It's just undisciplined.**  
> wb-flow gives it a spine — a strict verb-driven pipeline that turns vague requests into structured, traceable, verifiable work.

[Quickstart](start_here/README.md) · [Command Reference](#the-command-catalog) · [Concepts](concepts/README.md) · [Daily Use](daily_use/README.md) · [Session Lifecycle](session_lifecycle/README.md)

---

## The Problem

You give your AI a 3-hour task. Two hours in, it's rewriting files you didn't ask it to touch, skipped the part where it should have audited the codebase first, and committed with `git commit -m "fix stuff"`.

It didn't fail because it's not smart enough. It failed because **nobody gave it a process**.

---

## The Solution: Verbs, Not Personas

Most AI workflow tools solve this with *personas* — "ask the QA Agent", "invoke the Architect". wb-flow takes a different approach: **verbs over personas**.

You don't ask a role to review your code. You run `/wbAudit`. You don't ask a planner to break down a feature. You run `/wbPlan`. The command *is* the contract — explicit, named, deterministic, and impossible to drift from.

The result is a four-stage **Ideas Pipeline** that every task flows through:

```
/wbAudit  →  /wbPlan  →  /wbWork  →  /wbValid
  Audit        Plan        Execute     Validate
```

**Audit before you plan. Plan before you execute. Validate before you ship.**  
The AI cannot skip steps because you haven't given it the next command yet.

---

## What is wb-flow?

wb-flow is a **prompt-based command system** that runs inside your AI assistant. Install it once and it drops 33 structured slash-command templates into your repo — pure Markdown files your AI reads and follows as operating procedures.

- **Zero runtime.** No server, no daemon, no Python environment. The tool installs itself and then disappears — all that's left are the Markdown files.
- **Zero lock-in.** Works with Claude Code, Cursor, OpenCode, Gemini CLI, or any assistant that reads a prompt. Works with Vue, Python, Go, Rust, SQL, Terraform — anything with source files.
- **Zero ambiguity.** Every command has a defined input contract, a defined output format, and a defined handoff to the next step. The AI knows exactly what regime it is in.

```bash
npm install -g wb-flow
cd my-project
wb-flow init
```

That's it. No config files. No framework registration. No API keys.

---

## A Full Cycle in 4 Commands

```bash
/wbSetup .                   # Read the codebase — generates context.md + dev.md
/wbPlan "add dark mode"      # Break the goal into a ranked task table
/wbWork --id=1               # Execute the first task, fully traced
/wbValid                     # Verify: does the work match the plan?
```

Every output is a Markdown file. Every file carries YAML front-matter tagging it as **Planner**, **Validator**, **Worker**, or **Mechanical** — so you can route each piece of work to whichever AI model excels at that role.

---

## Works Everywhere — Not Just Frontend

wb-flow operates on source trees, `package.json`, and report folders. It doesn't know or care which framework wrote the code it's reading.

| Domain | Representative Stacks |
|---|---|
| Frontend | Vue, React, Svelte, Solid, Astro |
| Backend | Node.js, Python, Go, Rust, Java, Ruby |
| Mobile | React Native, Flutter, native iOS/Android |
| Data / ML | Python notebooks, MLOps pipelines |
| Infrastructure | Terraform, Docker, CI/CD configs |

### Ship an npm Package — 5 Commands

```bash
/wbAudit   packages/my-lib   # Is it shippable? Scores + blockers
/wbTest    packages/my-lib   # All tests green
/wbRelease packages/my-lib   # Bump version, update CHANGELOG, unpin workspace:*
/wbPublish packages/my-lib   # Publish to npm
/wbBroadcast packages/my-lib # Generate release notes + social posts
```

No manual version bumping. No forgotten changelog entries.

### Ship a Commit — 3 Commands

```bash
/wbGit                                          # Analyze diff, classify by Conventional Commits
/wbGit --commit="feat(api): add rate limiting"  # Draft and commit with a proper message
/wbGit --push                                   # Push to remote
```

Stops lazy `git commit -m "wip"`. Every commit follows [Conventional Commits](https://www.conventionalcommits.org/) with zero effort.

### Debug a Data Pipeline — 4 Commands

```bash
/wbSetup data-pipeline/        # Initialize wb-flow on your Python project
/wbAudit src/etl/transform.py  # Score + find issues in the ETL logic
/wbDebug src/ml/train.py       # Hypothesize → pinpoint why accuracy dropped
/wbTest  data-pipeline/        # Run pytest, classify failures, suggest fixes
```

`/wbAudit` reads `.py` the same way it reads `.vue`.

### Why Agentic over Manual?

*Why do I need a CLI tool for this? Why can't I just tell the AI what to do?*  
Because conversational prompting is undisciplined, but `/wb*` commands enforce a strict, repeatable contract. See our side-by-side [Agentic vs Manual Release Cycle](concepts/agentic_vs_manual.md) to understand how the pipeline eliminates cognitive load and guarantees hygiene.

---

## A Day With wb-flow

| Time | Command | What It Does |
|------|---------|-------------|
| Morning | `/wbStandup` | Scan the monorepo for stale work, open PRs, in-flight tasks |
| Planning | `/wbPlan "<goal>"` | Break a feature into a task table with worker/validator tags |
| Executing | `/wbWork --id=3` | Execute one task with full traceability |
| Afternoon | `/wbTest` | Run tests, classify failures (code-wrong vs. test-wrong) |
| Before PR | `/wbAudit` | Deep audit — catch issues before the reviewer does |
| Shipping | `/wbRelease` | Bump versions, generate changelog, prepare for npm |

---

## How Outputs Are Tagged

Every output file from a suggestion-emitting command carries YAML front-matter that classifies the recommended work type — so you can predictably route work to the right model.

| Tag | Role | Best Used For |
|-----|------|---------------|
| 🧠 **Planner** | Deep reasoning, strategy, multi-step decomposition | Architecture decisions, feature scoping |
| ✅ **Validator** | Code-quality judgment and scoring | Reviews, audits, test analysis |
| 🔨 **Worker** | Surgical code edits and refactors | Implementation, bug fixes |
| 📋 **Mechanical** | Run command, parse output, format report — no judgment | CI steps, changelog formatting |

Commands that emit tagged output: `/wbPlan`, `/wbAudit`, `/wbReview`, `/wbVision`, `/wbIdea`, `/wbStandup`, `/wbNext`, `/wbActOn`.

---

## 🐕 Built With wb-flow

This documentation suite — 250+ files across 33 command references, concept deep-dives, and workflow guides — was itself built entirely using `wb-flow`. The project used its own pipeline at every stage:

- **`/wbPlan`** broke the documentation into a 22-task backlog with worker/validator assignments
- **`/wbWork`** executed each task atomically, one page at a time
- **`/wbAudit`** scored the suite after every batch (starting at 5.2/10, finishing at 10/10)
- **`/wbValid`** verified each completed task against its plan before marking it done
- **`/wbGit`** generated every commit message from the actual diff

The tool eats its own cooking. If you want proof that the pipeline works, you're reading it.

---

## Prerequisites

- A folder with source files (any language)
- An AI assistant — Claude Code, Cursor, OpenCode, Antigravity, or any surface that accepts a prompt

Nothing else.

---

<a name="the-command-catalog"></a>

## The Command Catalog

| # | Command | What It Does | Guides |
|---|---------|--------------|--------|
| 01 | `/wbSetup` | Initialize agentic identity for a folder | [Ref](commands/wbSetup/wbSetup.md) · [Expert](commands/wbSetup/wbSetup_expert.md) · [Practical](commands/wbSetup/wbSetup_practical.md) |
| 02 | `/wbContext` | Generate context report (identity, deps, constraints) | [Ref](commands/wbContext/wbContext.md) · [Expert](commands/wbContext/wbContext_expert.md) · [Practical](commands/wbContext/wbContext_practical.md) |
| 03 | `/wbPlan` | Break a goal into a task table | [Ref](commands/wbPlan/wbPlan.md) · [Expert](commands/wbPlan/wbPlan_expert.md) · [Practical](commands/wbPlan/wbPlan_practical.md) |
| 04 | `/wbAudit` | Deep technical audit with scoring | [Ref](commands/wbAudit/wbAudit.md) · [Expert](commands/wbAudit/wbAudit_expert.md) · [Practical](commands/wbAudit/wbAudit_practical.md) |
| 05 | `/wbReview` | Formal quality review of changes | [Ref](commands/wbReview/wbReview.md) · [Expert](commands/wbReview/wbReview_expert.md) · [Practical](commands/wbReview/wbReview_practical.md) |
| 06 | `/wbTest` | Execute tests and classify failures | [Ref](commands/wbTest/wbTest.md) · [Expert](commands/wbTest/wbTest_expert.md) · [Practical](commands/wbTest/wbTest_practical.md) |
| 07 | `/wbRelease` | Bump versions, prepare changelog | [Ref](commands/wbRelease/wbRelease.md) · [Expert](commands/wbRelease/wbRelease_expert.md) · [Practical](commands/wbRelease/wbRelease_practical.md) |
| 08 | `/wbPublish` | Build and publish to npm | [Ref](commands/wbPublish/wbPublish.md) · [Expert](commands/wbPublish/wbPublish_expert.md) · [Practical](commands/wbPublish/wbPublish_practical.md) |
| 09 | `/wbDeploy` | Deploy app to web host | [Ref](commands/wbDeploy/wbDeploy.md) · [Expert](commands/wbDeploy/wbDeploy_expert.md) · [Practical](commands/wbDeploy/wbDeploy_practical.md) |
| 10 | `/wbClean` | Find dead code and stale files | [Ref](commands/wbClean/wbClean.md) · [Expert](commands/wbClean/wbClean_expert.md) · [Practical](commands/wbClean/wbClean_practical.md) |
| 11 | `/wbLicense` | License compliance and gating | [Ref](commands/wbLicense/wbLicense.md) · [Expert](commands/wbLicense/wbLicense_expert.md) · [Practical](commands/wbLicense/wbLicense_practical.md) |
| 12 | `/wbRefactor` | Restructure code, preserve behavior | [Ref](commands/wbRefactor/wbRefactor.md) · [Expert](commands/wbRefactor/wbRefactor_expert.md) · [Practical](commands/wbRefactor/wbRefactor_practical.md) |
| 13 | `/wbDebug` | Diagnose errors with hypothesis testing | [Ref](commands/wbDebug/wbDebug.md) · [Expert](commands/wbDebug/wbDebug_expert.md) · [Practical](commands/wbDebug/wbDebug_practical.md) |
| 14 | `/wbDoc` | Generate documentation from source code | [Ref](commands/wbDoc/wbDoc.md) · [Expert](commands/wbDoc/wbDoc_expert.md) · [Practical](commands/wbDoc/wbDoc_practical.md) |
| 15 | `/wbStandup` | Scan for unfinished work across projects | [Ref](commands/wbStandup/wbStandup.md) · [Expert](commands/wbStandup/wbStandup_expert.md) · [Practical](commands/wbStandup/wbStandup_practical.md) |
| 16 | `/wbVision` | Propose strategic features to build next | [Ref](commands/wbVision/wbVision.md) · [Expert](commands/wbVision/wbVision_expert.md) · [Practical](commands/wbVision/wbVision_practical.md) |
| 17 | `/wbBroadcast` | Generate release announcements | [Ref](commands/wbBroadcast/wbBroadcast.md) · [Expert](commands/wbBroadcast/wbBroadcast_expert.md) · [Practical](commands/wbBroadcast/wbBroadcast_practical.md) |
| 18 | `/wbGit` | Generate conventional commits from diffs | [Ref](commands/wbGit/wbGit.md) · [Expert](commands/wbGit/wbGit_expert.md) · [Practical](commands/wbGit/wbGit_practical.md) |
| 19 | `/wbSecure` | Scan for vulnerabilities and secrets | [Ref](commands/wbSecure/wbSecure.md) · [Expert](commands/wbSecure/wbSecure_expert.md) · [Practical](commands/wbSecure/wbSecure_practical.md) |
| 20 | `/wbTranslate` | Extract strings and generate locale files | [Ref](commands/wbTranslate/wbTranslate.md) · [Expert](commands/wbTranslate/wbTranslate_expert.md) · [Practical](commands/wbTranslate/wbTranslate_practical.md) |
| 21 | `/wbToWBC` | Convert legacy code to WBC components | [Ref](commands/wbToWBC/wbToWBC.md) · [Expert](commands/wbToWBC/wbToWBC_expert.md) · [Practical](commands/wbToWBC/wbToWBC_practical.md) |
| 22 | `/wbMonetize` | Bootstrap free/pro tier plumbing | [Ref](commands/wbMonetize/wbMonetize.md) · [Expert](commands/wbMonetize/wbMonetize_expert.md) · [Practical](commands/wbMonetize/wbMonetize_practical.md) |
| 23 | `/wbActOn` | Turn diagnostics into ranked actions | [Ref](commands/wbActOn/wbActOn.md) · [Expert](commands/wbActOn/wbActOn_expert.md) · [Practical](commands/wbActOn/wbActOn_practical.md) |
| 24 | `/wbCheck` | Pre-flight quality check | [Ref](commands/wbCheck/wbCheck.md) · [Expert](commands/wbCheck/wbCheck_expert.md) · [Practical](commands/wbCheck/wbCheck_practical.md) |
| 25 | `/wbTrack` | Session logging and tracking | [Ref](commands/wbTrack/wbTrack.md) · [Expert](commands/wbTrack/wbTrack_expert.md) · [Practical](commands/wbTrack/wbTrack_practical.md) |
| 26 | `/wbStopTrack` | End session tracking and produce summary | [Ref](commands/wbStopTrack/wbStopTrack.md) |
| 27 | `/wbLog` | Append structured log entries to session track | [Ref](commands/wbLog/wbLog.md) |
| 28 | `/wbNext` | Determine the optimal next command | [Ref](commands/wbNext/wbNext.md) · [Expert](commands/wbNext/wbNext_expert.md) · [Practical](commands/wbNext/wbNext_practical.md) |
| 29 | `/wbExplain` | Generate plain-language explanations of code or tasks | [Ref](commands/wbExplain/wbExplain.md) · [Expert](commands/wbExplain/wbExplain_expert.md) · [Practical](commands/wbExplain/wbExplain_practical.md) |
| 30 | `/wbHelp` | Command catalog and per-command help | [Ref](commands/wbHelp/wbHelp.md) · [Expert](commands/wbHelp/wbHelp_expert_part1.md) · [Practical](commands/wbHelp/wbHelp_practical_part1.md) |
| 31 | `/wbValid` | Validate executed work against its plan | [Ref](commands/wbValid/wbValid_ref.md) · [Expert](commands/wbValid/wbValid_expert.md) · [Practical](commands/wbValid/wbValid_practical.md) |
| 32 | `/wbWork` | Execute tasks from a plan file | [Ref](commands/wbWork/wbWork.md) · [Expert](commands/wbWork/wbWork_expert.md) · [Practical](commands/wbWork/wbWork_practical.md) |
| 33 | `/wbIdea` | Capture, score, and promote ideas | [Ref](commands/wbIdea/wbIdea.md) · [Expert](commands/wbIdea/wbIdea_expert_part1.md) · [Practical](commands/wbIdea/wbIdea_practical_part1.md) |

---

## Explore by Topic

| Section | Best For | Entry Point |
|---------|----------|-------------|
| **Start Here** | New to wb-flow? Start here | [start_here/README.md](start_here/README.md) |
| **Daily Use** | Day-to-day workflow patterns | [daily_use/README.md](daily_use/README.md) |
| **Concepts** | Architecture & philosophy | [concepts/README.md](concepts/README.md) |
| **Session Lifecycle** | Tracking, logging, session flow | [session_lifecycle/README.md](session_lifecycle/README.md) |

---

## 👨‍💻 About the Owner & Resources

**wb-flow** is created and maintained by **Wissem Boughamoura** as a standalone, framework-agnostic dev tool. It is independent of the Vue-based `wbc-ui` ecosystem (despite the shared author) and is free to use with any AI coding assistant.

* 🐙 **GitHub:** [@wissemb11/wb-flow](https://github.com/wissemb11/wb-flow)
* 📦 **npm:** [@wbc-ui2/wb-flow](https://www.npmjs.com/package/@wbc-ui2/wb-flow)
* 📚 **Documentation site:** [flow.wbc-ui.com](https://flow.wbc-ui.com)
* 👤 **Author:** [Wissem Boughamoura](https://github.com/wissemb11) — `wissemb11@gmail.com`

### 📬 Contact & Support

* Bugs / feature requests → [GitHub Issues](https://github.com/wissemb11/wb-flow/issues)
* General questions → email `wissemb11@gmail.com`

---

*License: MIT © 2026 Wissem Boughamoura. See [LICENSE](../LICENSE).*
*Changelog: see [CHANGELOG.md](../CHANGELOG.md).*

---

<div align="center">

← Home · [Start Here →](start_here/README.md) · [Install](../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

</div>
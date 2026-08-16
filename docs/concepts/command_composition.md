---
title: "Command Composition: Self-Application & Chaining"
description: "Guides developers on chaining /wb* commands and feeding output back into commands, listing which chains make sense."
---

# Command Composition: Self-Application & Chaining

> **Audience:** Developers who want to chain `/wb*` commands or feed a command's output back into itself.
> **Related:** [Command Classification](command_classification.md) · [wbPlan Flags](wbPlan_flag.md) · [Overview](overview_agentic_workflows.md)

## Why this matters

Most `/wb*` commands produce a markdown file; many of those files can be fed back into the same or a different `/wb*` command. This page tells you which chains make sense and which don't.

*Prerequisite: [Command Classification](command_classification.md) — you need to know what each command produces before you can chain them.*

<TripletAnimation />

---

## Notation

Two equivalent forms:

| Form | Example | How to read it |
|---|---|---|
| **Pipe form** (recommended) | `/wbNext folder/ &#124; /wbPlan` | "Run `/wbNext` on `folder/`, then feed the output file to `/wbPlan`" |
| **Nested form** | `/wbPlan /wbNext folder/` | Same meaning — inner command's output feeds the outer command |

Use parentheses when flags make things ambiguous: `/wbPlan(/wbNext folder/ --recent)`. Otherwise the bare nested form is fine.

---

## Three ways a command "feeds itself"

| Pattern | What it means | Example |
|---|---|---|
| **Temporal memory (implicit)** | A single invocation reads its own past outputs from `reports/` before writing. Automatic. | `/wbAudit` Smart-Merge appends Entry #N |
| **Self-application (explicit)** | Two invocations of the SAME command — second one takes the first's output file as input. | `/wbAudit audit_*.md` — audit the audit |
| **Chaining (explicit)** | Two invocations of DIFFERENT commands — second consumes first's output file. | `/wbNext folder/ &#124; /wbPlan` |

- **Temporal memory** happens automatically. You don't invoke anything twice.
- **Self-application** is deliberate: you point a command at its own report.
- **Chaining** moves a work artifact from one lifecycle stage to the next.

---

## Self-application table — all 30 commands

Can each command run on its own output file? What happens if it does?

**Outcome classes:**
- 🟢 **Meaningful** — second run produces real new value
- 🟡 **No-op** — type-valid but produces nothing useful
- 🔴 **Cannot** — command's invariants forbid it

| # | Command | Can self-apply? | What the second run does |
|---|---|---|---|
| 01 | `/wbStandup` | 🟡 No-op | Summarizing a summary yields nothing new |
| 02 | `/wbPlan` | 🟢 Meaningful | Re-plans an existing plan (`--resume` mode appends tasks) |
| 03 | `/wbNext` | 🟡 No-op | Ranking a ranked recommendation adds nothing |
| 04 | `/wbVision` | 🟡 No-op | Proposing features from a proposal = meta-features |
| 05 | `/wbExplain` | 🟢 Meaningful | Explains an existing explanation at a different layer (ELI5 vs Expert) |
| 06 | `/wbAudit` | 🟢 Meaningful | Cross-model audit-of-the-audit (verifies auditor's work) |
| 07 | `/wbSecure` | 🟡 No-op | Scanning a markdown report for code vulns finds nothing |
| 08 | `/wbDebug` | 🟡 No-op | Debugging a debug report won't fix the code |
| 09 | `/wbReview` | 🟢 Meaningful | Reviews a prior review — sanity-checks the reviewer |
| 10 | `/wbValid` | 🟢 Meaningful | Cumulative multi-model QA (appends validation signature) |
| 11 | `/wbTest` | 🟡 No-op | Test reports aren't executable test suites |
| 12 | `/wbCheck` | 🔴 Cannot | Console output only; no persistent file |
| 13 | `/wbWork` | 🔴 Cannot | Once done, re-running on the task report doesn't re-execute |
| 14 | `/wbRefactor` | 🔴 Cannot | Requires source code, not markdown reports |
| 15 | `/wbClean` | 🟡 No-op | "Cleaning the cleanup report" — type-valid, useless |
| 16 | `/wbTranslate` | 🔴 Cannot | Requires UI components, not reports |
| 17 | `/wbToWBC` | 🔴 Cannot | Requires legacy HTML/Vuetify, not migration reports |
| 18 | `/wbSetup` | 🔴 Cannot | Once-only bootstrap; re-running on output is a no-op |
| 19 | `/wbContext` | 🟢 Meaningful | Refreshes an existing context file with current state |
| 20 | `/wbDoc` | 🟡 No-op | Generates docs about docs — semantically thin |
| 21 | `/wbHelp` | 🔴 Cannot | Console output only; no file produced |
| 22 | `/wbRelease` | 🔴 Cannot | Requires codebase state, not release logs |
| 23 | `/wbPublish` | 🔴 Cannot | Publish log records a past NPM push; can't re-publish |
| 24 | `/wbDeploy` | 🔴 Cannot | Deploy log describes a past event, not a deployable artifact |
| 25 | `/wbBroadcast` | 🟡 No-op | Announcing an announcement kit = no new reach |
| 26 | `/wbGit` | 🔴 Cannot | Console only; commit string has no persistent file |
| 27 | `/wbMonetize` | 🔴 Cannot | Scaffolds in `package.json`; can't run on its own report |
| 28 | `/wbLicense` | 🔴 Cannot | Injects code into components; needs source files |
| 29 | `/wbActOn` | 🟢 Meaningful | Re-ranks with different priority criteria |
| 30 | `/wbTrack` | 🟢 Meaningful | Appends to itself natively (temporal memory per session) |

---

## The core rule: stateless vs stateful

| Category | Commands | Rule |
|---|---|---|
| **Stateless analyses** | `/wbAudit`, `/wbReview`, `/wbExplain`, `/wbContext`, `/wbDoc`, `/wbVision`, `/wbDebug`, `/wbSecure`, `/wbTest`, `/wbStandup`, `/wbNext` | They observe; they don't advance any lifecycle. Almost always self-applicable (🟢 or 🟡). |
| **Stateful transitions** | `/wbDeploy`, `/wbPublish`, `/wbWork`, `/wbSetup`, `/wbMonetize`, `/wbLicense`, `/wbRelease`, `/wbRefactor`, `/wbClean`, `/wbToWBC` | They advance an artifact along a lifecycle (built→deployed). The output records the *post-state*. Re-running on the post-state is a category error. |

**You cannot "deploy what is already deployed."** The deploy log is a receipt of a past event, not a deployable artifact.

---

## Chaining — useful command pairs

~10 chains that provide real workflow value. Not all 900 possible pairs.

| Chain (pipe form) | Nested form | What it does | Already wired as a flag? |
|---|---|---|---|
| `/wbNext folder/ &#124; /wbPlan` | `/wbPlan /wbNext folder/` | Turn next-recommendation into a plan | No — manual chain |
| `/wbAudit folder/ &#124; /wbActOn` | `/wbActOn /wbAudit folder/` | Rank audit findings by severity | Yes — `/wbAudit --act` |
| `/wbReview --plan=plan.md &#124; /wbActOn` | `/wbActOn /wbReview --plan=plan.md` | Rank review findings | Yes — `/wbReview --act` |
| `/wbAudit folder/ &#124; /wbPlan` | `/wbPlan /wbAudit folder/` | Build plan from audit findings | Partial — `/wbAudit --wbPlan` |
| `/wbStandup monorepo/ &#124; /wbActOn` | `/wbActOn /wbStandup monorepo/` | Rank standup items by priority | Yes — `/wbStandup --act` |
| `/wbVision folder/ &#124; /wbPlan` | `/wbPlan /wbVision folder/` | Plan one of the vision proposals | No — manual chain |
| `/wbExplain plan.md --id=N &#124; /wbCheck` | `/wbCheck /wbExplain plan.md --id=N` | Pre-flight quiz the worker before execution | No — manual chain |
| `/wbAudit folder/ &#124; /wbAudit` | `/wbAudit /wbAudit folder/` | Cross-model audit-of-the-audit | No — manual chain |
| `/wbRelease monorepo/ &#124; /wbBroadcast` | `/wbBroadcast /wbRelease monorepo/` | Generate announcement from release | Yes — `/wbBroadcast` reads release logs |
| `/wbAudit folder/ &#124; /wbActOn &#124; /wbPlan` | `/wbPlan /wbActOn /wbAudit folder/` | Three-step: audit → rank → plan | Yes — `/wbAudit --act --wbPlan` |


<div align="center">
<FlagChaining />
*The `--act --wbPlan` flag chain: one command produces audit, action items, and a plan in sequence.*
</div>

---

## Worked examples

### Example 1: The 3-Step Chain
`/wbAudit folder/ | /wbActOn | /wbPlan`

1. `/wbAudit` produces `audit_*.md`.
2. `/wbActOn` consumes the audit → `action_audit_*.md` (ranked list).
3. `/wbPlan` converts the ranked list → `plan_action_*.md` (task table).

*Shortcut:* `/wbAudit folder/ --act --wbPlan` does the same thing in one invocation.

### Example 2: Meaningful Self-Application
`/wbAudit /wbAudit folder/`

You ran an audit on Tuesday using the agent the agent. On Wednesday, you run `/wbAudit` again on the `audit_*.md` file using the agent Pro. Cross-model "audit of the audit" catches blind spots. New findings append as Entry #2.

### Example 3: Chaining with an Explicit Plan
`/wbPlan /wbNext folder/`

`/wbNext` reads codebase + reports → `next_*.md` recommending a new API endpoint. `/wbPlan` reads that recommendation → structured worker plan with task IDs.

### Counter-example: Stateful Violation
`/wbDeploy /wbDeploy app/`

**Why it fails:** `app/` is "built but not deployed." First `/wbDeploy` → "deployed" + `deploy_<date>.md` (URL/logs). Feeding `deploy_<date>.md` back to `/wbDeploy` fails: the file describes a past event, not a deployable artifact. The command needs an undeployed input. This is a state-machine violation.

---

## Quick reference — common chains

| I want to... | Chain | Notes |
|---|---|---|
| turn audit findings into a TODO list | `/wbAudit folder/ &#124; /wbActOn` | or use `/wbAudit --act` |
| turn audit findings into a full plan | `/wbAudit folder/ &#124; /wbActOn &#124; /wbPlan` | or use `/wbAudit --act --wbPlan` |
| second-pass an audit by a different model | `/wbAudit audit_*.md` | smart-merge appends Entry #N |
| extend an existing plan | `/wbPlan plan_*.md` | triggers `--resume` mode |
| turn a next-rec into a plan | `/wbPlan /wbNext folder/` | manual chain |
| verify a completed plan | `/wbReview --plan=plan_*.md folder/` | adversarial check |
| rank standup agenda | `/wbStandup monorepo/ &#124; /wbActOn` | or use `/wbStandup --act` |

---

* — companion to [Command Classification](command_classification.md).*

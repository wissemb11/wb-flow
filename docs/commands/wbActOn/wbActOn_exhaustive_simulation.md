# wb-flow Protocol: /wbActOn Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbActOn` command. It serves as the definitive reference for initiating fully autonomous, multi-step agent chains based on specific triggers, webhooks, or natural language prompts.

---

## 1. Role & Definition Matrix
**Role:** The Trigger Operator & Autonomous Initiator
**Target:** Accepts raw inputs (Jira tickets, Slack webhooks, error logs) and converts them into a sequence of agentic commands.
**Core Protocol:** Strict "Chain of Thought". The agent parses the input, determines the required sequence of commands (e.g., `/wbContext` -> `/wbPlan` -> `/wbWork`), and executes them iteratively without human intervention.

| Scenario | System Behavior |
|---|---|
| Target is a Bug Ticket | **[PROCEED]** Analyzes ticket. Executes `/wbDebug` -> `/wbPlan -a` -> `/wbWork` -> `/wbValid`. |
| Target is a Feature Request | **[PROCEED]** Analyzes request. Executes `/wbContext` -> `/wbPlan` -> `/wbWork`. |
| Target is Ambiguous | **[HALT]** Protocol forbids executing destructive chains based on vague inputs. Prompts user for clarification. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbActOn` acts as a universal router, parsing external context formats.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Natural Language String | `Command: /wbActOn "Update the footer to 2026"` | Parses string into actionable intent. | Generates a micro-plan and immediately updates the footer code. |
| External URL (Jira/GitHub) | `Command: /wbActOn "https://github.com/issue/42"` | Fetches issue payload (Title, Description). | Translates issue requirements into a `plan_*.md` and begins work. |
| File Path (Logs/JSON) | `Command: /wbActOn crash_report.json` | Parses structured data. | Extracts stack trace, triggers `/wbDebug -t="<trace>" -a`. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--chain="<cmds>"`| `-c` | Hardcodes the exact sequence of commands the agent should run. | `Command: /wbActOn "Fix CSS" -c="wbWork,wbValid"` | `[CHAIN] Bypassing inference. Forcing /wbWork then /wbValid.` |
| `--supervisor` | `-s` | Runs in supervised mode. Halts and asks for human approval between every command in the chain. | `Command: /wbActOn "Refactor API" -s` | `[SUPERVISOR] /wbPlan generated. Do you approve before I run /wbWork? [Y/n]` |
| `--timeout="<min>"`| `-t` | Enforces a strict time limit on the autonomous chain to prevent infinite loops. | `Command: /wbActOn "Build App" -t="30"` | `[TIMEOUT] Setting 30m hard limit on autonomous execution.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Autonomous Bug Resolution" (`<url> -c="wbDebug,wbWork,wbValid,wbGit"`)
**Context:** A critical bug was reported on GitHub. The tech lead pastes the issue URL and demands the agent fix it, validate it, and commit it autonomously.
**Command Executed:** `/wbActOn "https://github.com/wbc-ui2/issues/402" -c="wbDebug,wbWork,wbValid,wbGit"`
**Simulated Protocol Chain:**
1. Fetches issue #402: "Login button disappears on mobile."
2. Runs `/wbDebug` to find the CSS media query fault.
3. Runs `/wbWork` to implement the fix.
4. Runs `/wbValid` to ensure no visual regressions.
5. Runs `/wbGit` to generate the commit message "Fix: Mobile login button visibility (#402)".
**Simulated Output:**
```markdown
> Command: /wbActOn "https://github.com/wbc-ui2/issues/402" -c="wbDebug,wbWork,wbValid,wbGit"

[SYSTEM] Initiating Autonomous Chain for Issue #402...
[CHAIN 1/4] Executing /wbDebug... Found fault in auth.css.
[CHAIN 2/4] Executing /wbWork... Applied flexbox fix.
[CHAIN 3/4] Executing /wbValid... VRT passed.
[CHAIN 4/4] Executing /wbGit... Commit generated.
[SUCCESS] Chain complete. Issue #402 resolved.
```

### 💠 The "Supervised Feature Extraction" (`<file> -s`)
**Context:** A product manager uploads a raw spec document (`feature.txt`). They want the agent to handle it but want to review the plan before code is written.
**Command Executed:** `/wbActOn spec.txt -s`
**Simulated Output:**
```markdown
> Command: /wbActOn spec.txt -s

[SYSTEM] Parsing spec.txt...
[INFERENCE] Deduced optimal chain: /wbPlan -> /wbWork -> /wbExplain.
[CHAIN 1/3] Executing /wbPlan... Generated 4 tasks.
[SUPERVISOR] Halting. Do you approve plan_feature_2026.md before proceeding to /wbWork? [Y/n]
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Infinite Loop | Agent fails validation 3 times in a row during an autonomous chain. | `❌ Error: Autonomous loop detected. Aborting chain to prevent token exhaustion.` |
| URL Fetch Failed | Provided GitHub/Jira link is private or returns 404. | `❌ Error: Cannot fetch external context. Please provide a raw text string.` |
| Chain Break | `wbWork` fails due to syntax error. | `⚠️ Warning: Chain broken at step 2. Execution halted. Manual intervention required.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

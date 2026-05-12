# wb-flow Protocol: /wbHelp Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbHelp` command. It serves as the definitive reference for how the agent parses its own capabilities, queries the documentation matrix, and delivers context-aware usage instructions to the developer.

---

## 1. Role & Definition Matrix
**Role:** The Internal Documentation & Capability Router
**Target:** Reads `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/` and internal command schemas to provide usage guides, flag definitions, and scenario recommendations.
**Core Protocol:** Strict "Meta-Awareness". The agent must dynamically parse the documentation source of truth rather than relying on hallucinated knowledge of its own commands.

| Scenario | System Behavior |
|---|---|
| No Argument Provided | **[PROCEED]** Outputs the massive 26-Command Arsenal matrix, categorized by operational group (e.g., Execution, Diagnostics). |
| Specific Command Queried | **[PROCEED]** Extracts and summarizes the Exhaustive Simulation documentation for the requested command. |
| Unknown Command Queried | **[HALT]** Protocol forbids hallucinating commands. Returns a "Command Not Found" error and suggests similar valid commands. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbHelp` parses command names and natural language to resolve documentation queries.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| No Argument | `Command: /wbHelp` | Defaults to global index. | Displays the table of all 26 commands and their short descriptions. |
| Specific Command | `Command: /wbHelp wbPlan` | Locks onto `wbPlan` docs. | Outputs the usage guide, flags, and edge cases specifically for `/wbPlan`. |
| Comma-Separated | `Command: /wbHelp wbWork,wbValid` | Parses both queries. | Outputs a comparative guide on how `/wbWork` and `/wbValid` chain together. |
| Natural Language | `Command: /wbHelp "how do I fix a bug?"` | Fuzzily matches intent to Diagnostic commands. | Suggests using `/wbDebug` and `/wbAudit`. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--examples` | `-e` | Forces the output to focus heavily on practical code examples and scenarios rather than theory. | `Command: /wbHelp wbSetup -e` | `[EXAMPLES] Displaying 3 concrete scenarios for running wbSetup.` |
| `--flags` | `-f` | Forces the output to print only the argument resolution matrix and flag table for the command. | `Command: /wbHelp wbWork -f` | `[FLAGS] Displaying the 4 specific flags available for /wbWork.` |
| `--search="<term>"`| `-s` | Deep searches the entire `frontEnd/wbc-ui/core2/packages/wb-flow/templates` docs directory for a specific keyword. | `Command: /wbHelp -s="Smart Merge"` | `[SEARCH] Found references to 'Smart Merge' in wbTrack and wbPlan.` |
| `--voice="<tone>"` | `-v` | Adjusts output verbosity (`concise`, `verbose`, `eli5`). | `Command: /wbHelp wbGit -v="concise"` | `[VOICE] Outputting 2-line summary of wbGit. Skipping edge cases.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Deep Capability Search" (`-s="wildcard" -e`)
**Context:** The developer forgets which commands support wildcard (`*`) arrays and wants practical examples of how to use them.
**Command Executed:** `/wbHelp -s="wildcard" -e`
**Simulated Protocol Chain:**
1. Deep scans `frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/commands/`.
2. Matches "Wildcard" in `wbWork`, `wbValid`, `wbExplain`, and `wbAudit`.
3. Filters content to show only the specific `Example` columns (`-e`).
**Simulated Output:**
```markdown
> Command: /wbHelp -s="wildcard" -e

[SYSTEM] Initiating Deep Capability Search for "wildcard"...
[MATCH] Found support in 4 core commands.
[EXAMPLES] 
- /wbWork -i="*" (Executes all unblocked tasks)
- /wbValid -i="*" (Validates all implemented tasks)
- /wbExplain -i="*" (Generates epic onboarding guide)
- /wbAudit src/**/*.js (Massive glob security sweep)
[SUCCESS] Search complete.
```

### 💠 The "Command Deep Dive" (`wbRelease -f -e`)
**Context:** Developer is about to cut a release but wants a quick refresher on exactly what flags are available and how to chain them for a beta release.
**Command Executed:** `/wbHelp wbRelease -f -e`
**Simulated Output:**
```markdown
> Command: /wbHelp wbRelease -f -e

[SYSTEM] Extracting wbRelease documentation...
[FLAGS] 
-v="<type>" : Force SemVer (major, minor, patch, beta)
-c          : Auto-generate changelog
-g          : Push to GitHub
-d          : Dry-Run
[EXAMPLES]
Beta Run: `/wbRelease packages/* -v="beta" -d`
[SUCCESS] Help delivered.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Hallucinated Command | User queries `/wbHelp wbMagic`. | `❌ Error: 'wbMagic' is not recognized. Did you mean 'wbMake'?` |
| Search Timeout | User searches for a term like "the", resulting in 10,000 matches. | `⚠️ Warning: Search too broad. Truncating results to top 5 commands.` |
| Corrupt Documentation| System cannot locate `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs/`. | `❌ Error: Protocol Fault. Documentation missing. Agent amnesic.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

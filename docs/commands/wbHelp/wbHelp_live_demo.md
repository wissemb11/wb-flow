# wb-flow Protocol: /wbHelp Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbHelp` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/commands`
**Live State Evaluated:** 
*   Active Directory: `wb-labs`
*   Status: The `v4` Massive Documentation update is actively happening. 26 commands are fully documented in the `docs` and `docs` ecosystem.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| No Argument Provided | **[ACTIVE]** System is primed to return the index of all 26 `wbX` commands. |
| Specific Command Queried | **[ACTIVE]** Ready to dynamically parse `wbWork_exhaustive_simulation.md`. |
| Unknown Command Queried | **[ACTIVE]** Will reject hallucinated AI shortcuts. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| No Argument | `Command: /wbHelp` | Locks onto root README. | `[PROCEED] Outputting the 26-Command Arsenal matrix.` |
| Specific Command | `Command: /wbHelp wbSecure` | Locks onto `wbSecure` docs. | `[PROCEED] Extracting Token and XSS scanning instructions.` |
| Comma-Separated | `Command: /wbHelp wbAudit,wbReview` | Correlates both. | `[PROCEED] Outputting differences between pre-audit and post-code review.` |
| Natural Language | `Command: /wbHelp "how to deploy"` | Fuzzily matches intent. | `[PROCEED] Suggesting /wbDeploy and /wbPublish based on context.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--examples` | `Command: /wbHelp wbSetup -e` | `[EXAMPLES] Displaying 'Massive Monorepo Reset' chaining example.` |
| `--flags` | `Command: /wbHelp wbRelease -f` | `[FLAGS] Outputting the 4 semantic release flags (-v, -c, -g, -d).` |
| `--search="<term>"`| `Command: /wbHelp -s="Smart Merge"` | `[SEARCH] Searching frontEnd/wbc-ui/core2/packages/wb-flow/templates/... Found in wbTrack and wbPlan.` |
| `--voice="<tone>"` | `Command: /wbHelp wbWork -v="eli5"` | `[VOICE] Explaining /wbWork using LEGO building block analogies.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Deep Capability Search" (`-s="wildcard" -e`)
**Live Context:** Running this *right now* to verify that the newly injected wildcard documentation in the v4 Massive update is actually discoverable by the AI itself.
**Command Executed:** `/wbHelp -s="wildcard" -e`
**Live Output:**
```text
> Command: /wbHelp -s="wildcard" -e

[SYSTEM] Initiating Deep Capability Search in frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs...
[MATCH] Successfully parsed `wbWork`, `wbValid`, `wbExplain`, and `wbAudit`.
[EXAMPLES] 
- /wbWork -i="*" (Extracts all tasks marked ⬜ Done)
- /wbValid -i="*" (Initiates CI-style regression suite)
- /wbAudit src/**/*.js (Extracts all matching files)
[SUCCESS] Capability search verified against v4 documentation.
```

### 💠 The "Command Deep Dive" (`wbPlan -f -e`)
**Live Context:** A new developer joined `wb-labs` and wants to know exactly how to generate a plan without reading the 100-line markdown document.
**Command Executed:** `/wbHelp wbPlan -f -e`
**Live Output:**
```text
> Command: /wbHelp wbPlan -f -e

[SYSTEM] Extracting wbPlan documentation...
[FLAGS] 
-i="<id>" : Attach Jira/Linear ticket ID.
-m        : Execute Smart Merge (Appends instead of overwriting).
-a        : Auto-handoff to /wbWork immediately.
[EXAMPLES]
Merge existing context: `/wbPlan -m -i="WBC-402"`
[SUCCESS] Help delivered.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Hallucinated Command | **[TRIGGERED]** User queries `/wbHelp wbFix`. | `❌ Error: 'wbFix' not found. Did you mean /wbDebug or /wbReview?` |
| Search Timeout | **[PASS]** Searching for "DAG" yields precise results in `wbNext`. | Results returned under 1s. |
| Corrupt Documentation| **[PASS]** `frontEnd/wbc-ui/core2/packages/wb-flow/templates/docs` is fully intact and formatted. | Parsing succeeds. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

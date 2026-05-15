# wb-flow Protocol: Universal Super-Flags Exhaustive Simulation

This document defines the **exhaustive behavior matrix** for the Universal Super-Flags (Global AI Orchestration). These flags control the AI's "Brain" (memory, tokens, and context) and are reserved across all 30 `/wb*` commands.

---

## 1. The Brain Control Matrix (Definition)
**Role:** The AI Orchestrator & Memory Governor
**Target:** Modifies the agent's perception of history, persistent knowledge, and resource allocation.
**Core Protocol:** Strict "Isolation & Hardening". These flags override the standard context-loading sequence to ensure deterministic behavior in complex monorepo sessions.

| Flag | Shortcut | Logic | System Impact |
|---|---|---|---|
| `--stat` | `-st` | **Token Telemetry** | Calculates and displays raw token counts for the request/response. |
| `--stat-p` | `-sp` | **Capacity Telemetry** | Displays token usage as a percentage of the total context window. |
| `--fresh` | `-cl` | **Context Purge** | Temporarily ignores the current session history for the duration of the turn. |
| `--no-ki` | `-nk` | **Knowledge Isolation** | Prevents the agent from reading global Knowledge Items (KIs). |
| `--mem-sync` | `-ms` | **Memory Hardening** | Commits the result of the command to the permanent Knowledge Base. |
| `--budget` | `-bt` | **Resource Cap** | Enforces a hard stop if the operation exceeds `<N>` tokens. |
| `--budget-p`| `-bp` | **Capacity Cap** | Enforces a hard stop if the operation exceeds `<N>%` of the context window. |

---

## 2. Omni-Channel Execution Pipeline (Pro Scenarios)

### 💠 Scenario A: The "Context-Pure" Deep Refactor
**Context:** After 4 hours of debugging an unrelated UI bug, the developer wants to refactor the core `WBC.js` logic without any "chatter" from the UI session affecting the AI's logic.
**Command Executed:** `/wbRefactor packages/wb-core/src/WBC.js -cl -st`
**Simulated Protocol Chain:**
1. **[MEMORY]** Purging 150 previous turns from the immediate context window (`-cl`).
2. **[SYSTEM]** Reading `WBC.js` AST.
3. **[LOGIC]** Applying DRY principles to the monolith exports.
4. **[TELEMETRY]** Calculating turn cost (`-st`).
**Simulated Output:**
```markdown
> Command: /wbRefactor packages/wb-core/src/WBC.js -cl -st

[MEMORY] Clean Context engaged. Session history (142 turns) ignored for this operation.
[SYSTEM] Refactoring WBC.js exports...
[SUCCESS] Applied Facade pattern to 4 internal methods.
[TOKEN] Turn Cost: 12,402 tokens. Remaining Window: 1,987,598 tokens.
```

### 💠 Scenario B: The "Budget-Capped" Global Audit
**Context:** Running a massive security sweep across the entire monorepo, but the developer is on a strict API budget and wants to prevent an expensive 100k+ token explosion.
**Command Executed:** `/wbAudit . -S -bp="5%" -sp`
**Simulated Protocol Chain:**
1. **[RESOLVE]** Sweeping all folders in `frontEnd/wbc-ui/core2`.
2. **[CHECK]** Calculating potential file sizes... 120k tokens detected.
3. **[BUDGET]** Triggering Hard Stop: 120k tokens = 6% of window. Requested limit is 5% (`-bp="5%"`).
**Simulated Output:**
```markdown
> Command: /wbAudit . -S -bp="5%" -sp

[SYSTEM] Initiating Global Security Audit...
[TOKEN] ERROR: Budget exceeded. 
[TOKEN] Estimated operation size: 6.1% of context window.
[TOKEN] Requested Budget: 5.0% (-bp="5%").
[HALT] Audit aborted to preserve token capacity. 
[TIP] Scope the audit to a specific package or increase budget to -bp="7%".
```

### 💠 Scenario C: The "Permanent Fix" Memory Hardening
**Context:** You just fixed a critical, recurring circular dependency bug. You want to ensure the agent "remembers" this solution across every future chat session forever.
**Command Executed:** `/wbTrack -ms`
**Simulated Protocol Chain:**
1. **[SYSTEM]** Generating today's track report.
2. **[MEMORY]** Extracting the "Circular Dependency" solution from the session log.
3. **[SYNC]** Writing a new Knowledge Item (KI) to `frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/concepts/circular_dep_fix.md` (`-ms`).
**Simulated Output:**
```markdown
> Command: /wbTrack -ms

[SYSTEM] Finalizing track report for 2026-05-05...
[MEMORY] Syncing discovery to Long-Term Knowledge Base...
[SYNC] SUCCESS: Created KI "circular_dep_fix". 
[SYNC] This knowledge will now be inherited by all fresh sessions.
```

---

## 3. Flag Interaction & Precedence Matrix

| Combined Flags | Interaction Logic | Final Result |
|---|---|---|
| `-cl -nk` | **Double Isolation** | The AI becomes "Amnesic & Isolated". It knows ONLY the files it reads in this exact turn. No history, no cached docs. |
| `-st -sp` | **Telemetry Overlay** | Displays both the raw number (Count) and the relative impact (Percentage). |
| `-bt -bp` | **Conflicting Budgets** | The system enforces the **stricter** of the two limits. |
| `-cl -ms` | **Paradox Handling** | AI "forgets" history during execution, but "saves" the output of the execution to memory afterward. |

---

## 4. Operational Edge Cases (Protocol Faults)

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Amnesia Loop | Developer runs `-cl` while referencing a variable discussed only in chat history. | `❌ Error: Variable 'user_auth_fix' not found in current files. (Context was purged via -cl).` |
| Sync Collision | `-ms` attempts to write to a KI file that is currently read-only. | `⚠️ Warning: Memory sync failed (Permission Denied). Result saved to local scratch only.` |
| Over-Budget | Command is mid-execution and hits the token limit. | `⚠️ Warning: Budget reached. Truncating response. Partial results provided below.` |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

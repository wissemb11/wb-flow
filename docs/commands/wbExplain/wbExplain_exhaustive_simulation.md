# wb-flow Protocol: /wbExplain Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbExplain` command. It serves as the definitive reference for how the agent synthesizes pedagogical documentation, adapts explanation tones, and utilizes wildcards to generate massive onboarding guides.

---

## 1. Role & Definition Matrix
**Role:** The Technical Pedagogue & Onboarding Guide
**Target:** Translates complex source code, architecture, or active plan tasks into human-readable documentation.
**Core Protocol:** Explanations must be saved persistently using the Smart Merge protocol to avoid redundant generation.

| Scenario | System Behavior |
|---|---|
| Target is Code File | **[PROCEED]** Analyzes AST, exports, and logic. Generates line-by-line breakdown or conceptual summary based on flags. |
| Target is Plan Task | **[PROCEED]** Reads the `plan_*.md` file. Translates the technical task requirement into a conceptual explanation. |
| Missing Context | **[HALT]** If asked to explain a non-existent file or unmapped domain, protocol demands running `/wbContext` first. |

---

## 2. Argument & Criteria Resolution Matrix
The `/wbExplain` command is highly versatile, supporting natural language, specific paths, and plan task IDs.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Single Task ID | `Command: /wbExplain -i="2"` | Locks onto Task #2 in the active plan. | Generates a conceptual breakdown of *why* Task 2 is needed. |
| Multi-Task Array | `Command: /wbExplain -i="1,3,4"` | Parses comma-separated IDs. | Generates a unified document explaining the relationship between Tasks 1, 3, and 4. |
| Wildcard (All Tasks) | `Command: /wbExplain -i="*"` | Extracts all tasks from the active plan. | Generates a massive "Epic Overview" explaining the entire planned feature. |
| File Path | `Command: /wbExplain packages/wb-core/src/index.js` | Analyzes specific file architecture. | Creates `explanation_index.md`. |
| Natural Language | `Command: /wbExplain "how does auth work"` | Fuzzy matches across `context.md` and codebase. | Synthesizes a broad architectural overview of authentication. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--id="<id>"` | `-i` | Explicit task targeting (Supports singular, CSV arrays, and `*` wildcards). | `Command: /wbExplain -i="*"` | `[EXPLAIN] Wildcard detected. Generating massive overview for all planned tasks.` |
| `--tone="<type>"` | `-t` | Adjusts the pedagogical level (`eli5`, `expert`, `business`). | `Command: /wbExplain -i="1" -t="eli5"` | `[TONE] Explaining JWT Handshake using analogies of bouncers and VIP clubs.` |
| `--language="<lang>"`| `-l` | Outputs explanation in specific language (`en`, `fr`, `ar`). | `Command: /wbExplain -i="1" -l="fr"` | `[LANG] Generating explanation in French: "Explication de l'architecture..."` |
| `--diagram` | `-d` | Forces the inclusion of a Mermaid.js dependency graph or sequence diagram. | `Command: /wbExplain -i="1,2" -d` | `[DIAGRAM] Injecting Mermaid.js sequence diagram showing interaction between tasks.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Onboarding Guide" (`-i="*" -t="eli5" -d`)
**Context:** A junior developer joined the team and needs a simple, diagram-heavy explanation of every single task planned for the current Epic.
**Command Executed:** `/wbExplain -i="*" -t="eli5" -d`
**Simulated Protocol Chain:**
1. System reads active plan. Finds Tasks 1, 2, 3.
2. Synthesizes a unified narrative connecting all three tasks.
3. Applies ELI5 (Explain Like I'm 5) tone.
4. Generates a Mermaid sequence diagram.
**Simulated Output:**
```markdown
> Command: /wbExplain -i="*" -t="eli5" -d

[SYSTEM] Wildcard detected. Processing all plan tasks...
[TONE] Applying ELI5 pedagogy.
[DIAGRAM] Rendering Mermaid sequence flow.
[SUCCESS] Saved massive onboarding guide to plans/explanations/onboarding_epic_2026.md.
```

### 💠 The "Multilingual Deep Dive" (`packages/wb-core -t="expert" -l="ar"`)
**Context:** Senior architect needs a highly technical breakdown of the core package, written in Arabic.
**Command Executed:** `/wbExplain packages/wb-core -t="expert" -l="ar"`
**Simulated Output:**
```markdown
> Command: /wbExplain packages/wb-core -t="expert" -l="ar"

[SYSTEM] Scanning packages/wb-core...
[TONE] Applying Expert pedagogy (AST analysis, memory pointers).
[LANG] Translating to Arabic.
[SUCCESS] Generated explanation_core_expert_ar.md.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Translation Failure | Unsupported language code requested. | `⚠️ Warning: Language 'xx' unknown. Defaulting to English ('en').` |
| Diagram Complexity | Wildcard array spans too many disconnected modules for a single diagram. | `⚠️ Warning: Graph too complex. Generating 3 separate Mermaid diagrams instead of 1.` |
| Invalid ID | User runs `-i="99"` (Task doesn't exist). | `❌ Error: Task ID 99 not found in active plan.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

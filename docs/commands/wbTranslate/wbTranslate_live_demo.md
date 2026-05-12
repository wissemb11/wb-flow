# wb-flow Protocol: /wbTranslate Live Workspace Demo

This document is the **Real-Time Execution Log** of the `/wbTranslate` command. It applies the exact structural matrix from the Exhaustive Simulation to the *current, live state* of the `wb-labs` workspace as of 2026-05-04.

---

## 1. Role & Definition Matrix (Live Application)
**Target:** `wb-labs/frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/commands`
**Live State Evaluated:** 
*   Active Directory: `frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/commands`
*   Status: Contains massive markdown documentation in English that needs localization for international teams.

| Scenario | Live System Behavior (wb-labs) |
|---|---|
| Target is JSON/i18n File | **[INACTIVE]** No locale JSON files are currently active in the documentation folder. |
| Target is Markdown Doc | **[ACTIVE]** System is primed to translate `wbPlan_exhaustive_simulation.md` while preserving markdown tables. |
| Unrecognized Format | **[ACTIVE]** System will explicitly block translating Python scripts located in `/scratch/`. |

---

## 2. Argument & Criteria Resolution Matrix (Live Application)
| Argument Type | Input Executed | Live Parsed State (wb-labs) | Live Output Generation |
|---|---|---|---|
| Specific File Path | `Command: /wbTranslate wbPlan/wbPlan.md` | Locks onto specific doc. | `[PROCEED] Generating localized copies of wbPlan documentation.` |
| Directory Path | `Command: /wbTranslate wbWork/` | Scans the folder. | `[PROCEED] Translating all markdown files in wbWork/.` |
| Comma-Separated | `Command: /wbTranslate wbAudit/wbAudit.md,wbDebug/wbDebug.md` | Extracts two specific files. | `[PROCEED] Translating Audit and Debug docs sequentially.` |
| Wildcard Glob | `Command: /wbTranslate **/*.md` | Extracts all 52 markdown files. | `[PROCEED] Massive localization sweep across all docs.` |

---

## 3. Flag Processing Matrix (Isolated Live Runs)

| Flag | Live Executed Command | Live Output Impact |
|---|---|---|
| `--lang="<array>"`| `Command: /wbTranslate wbWork/wbWork.md -l="fr,ar"` | `[LANG] Created wbWork_fr.md and wbWork_ar.md.` |
| `--tone="<type>"` | `Command: /wbTranslate wbHelp/wbHelp.md -t="formal"` | `[TONE] Enforcing strict, corporate terminology in translated docs.` |
| `--overwrite` | `Command: /wbTranslate README.md -O -l="es"` | `[OVERWRITE] English README replaced with Spanish.` |
| `--sync` | `Command: /wbTranslate locales/ -s -l="fr"` | `[SYNC] Failed. No JSON locales directory found in current path.` |

---

## 4. Omni-Channel Execution Pipeline (Live Chaining)

### 💠 The "Multilingual Documentation Generator" (`**/*.md -l="fr,ar"`)
**Live Context:** Running this *right now* to translate the newly generated v4 Massive documents into French and Arabic for international contributors.
**Command Executed:** `/wbTranslate **/*.md -l="fr,ar"`
**Live Output:**
```text
> Command: /wbTranslate **/*.md -l="fr,ar"

[SYSTEM] Glob resolved to 52 markdown files in docs/.
[LANG] Engaging French and Arabic translation matrices.
[RULE] Strict syntax preservation active. Skipping code blocks and table headers.
[PROCESSING] Translating wbPlan_exhaustive_simulation.md...
[PROCESSING] Translating wbWork_exhaustive_simulation.md...
[SUCCESS] Generated 104 new localized markdown files safely.
```

### 💠 The "Deep Tone Localization" (`wbExplain/wbExplain.md -l="fr" -t="casual"`)
**Live Context:** Translating the Explain command docs into a highly casual, friendly French tone for junior devs.
**Command Executed:** `/wbTranslate wbExplain/wbExplain.md -l="fr" -t="casual"`
**Live Output:**
```text
> Command: /wbTranslate wbExplain/wbExplain.md -l="fr" -t="casual"

[SYSTEM] Locked onto wbExplain documentation.
[TONE] Applying 'casual' ruleset (tutoiement, simplified tech terms).
[LANG] Processing French translation...
[SUCCESS] Created wbExplain/wbExplain_fr.md.
```

---

## 5. Operational Edge Cases (Live Workspace Check)

| Fault Trigger | Live System State | Live Resolution |
|---|---|---|
| Logic File Block | **[PASS]** Only `.md` files exist in current glob. | Execution proceeds. |
| Markdown Corruption | **[PASS]** Table boundaries parsed and masked before translation. | Markdown tables remain structurally intact. |
| Unsupported Language | **[TRIGGERED]** If user attempts `-l="xx"`. | `❌ Error: Language code 'xx' unrecognized.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

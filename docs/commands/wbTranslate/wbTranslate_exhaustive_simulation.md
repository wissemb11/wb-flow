# wb-flow Protocol: /wbTranslate Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbTranslate` command. It serves as the definitive reference for i18n localization, markdown documentation translation, and multi-language array routing.

---

## 1. Role & Definition Matrix
**Role:** The Localization & i18n Agent
**Target:** Translates UI strings, configuration files, and `.md` documentation into target languages while preserving code structure and markdown syntax.
**Core Protocol:** Strict "Syntax Preservation". The agent must never translate object keys, HTML tags, or markdown structural elements (like table boundaries).

| Scenario | System Behavior |
|---|---|
| Target is JSON/i18n File | **[PROCEED]** Parses object tree. Translates values only. Preserves all keys and nesting structures. |
| Target is Markdown Doc | **[PROCEED]** Translates prose. Preserves code blocks, table formats, and links exactly as they are. |
| Unrecognized Format | **[HALT]** Protocol forbids translating raw logic files (`.js`, `.py`) to avoid breaking compilation. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbTranslate` utilizes precise targeting to avoid breaking application logic.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Specific File Path | `Command: /wbTranslate docs/readme.md` | Locks onto the markdown file. | Generates translated copies (e.g., `readme_fr.md`). |
| Directory Path | `Command: /wbTranslate locales/en/` | Scans the language directory. | Translates all JSON files to the target language folder. |
| Comma-Separated | `Command: /wbTranslate locales/en/auth.json,locales/en/cart.json` | Parses specific files. | Translates only auth and cart namespaces. |
| Wildcard Glob | `Command: /wbTranslate docs/**/*.md` | Extracts all documentation. | Massive translation sweep of the entire docs folder. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--lang="<array>"`| `-l` | Target language(s). Supports comma-separated arrays. | `Command: /wbTranslate docs/readme.md -l="fr,ar"` | `[LANG] Generating readme_fr.md and readme_ar.md.` |
| `--tone="<type>"` | `-t` | Adjusts localization tone (e.g., `formal`, `casual`). | `Command: /wbTranslate locales/en/ -t="casual"` | `[TONE] Using familiar pronouns (e.g., 'tu' instead of 'vous' in FR).` |
| `--overwrite` | `-O` | Replaces the original file instead of creating a suffixed copy. | `Command: /wbTranslate README.md -O -l="fr"` | `[OVERWRITE] Destructively replacing English README with French.` |
| `--sync` | `-s` | Only translates *missing* keys by comparing source to target JSON. | `Command: /wbTranslate locales/en/ -s -l="fr"` | `[SYNC] Found 3 missing keys in fr.json. Translating only the diff.` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive i18n Sync" (`locales/en/ -l="fr,ar,es" -s`)
**Context:** The developer added 5 new English strings to the UI. They want to instantly push these 5 strings to French, Arabic, and Spanish without re-translating the entire 500-line JSON files.
**Command Executed:** `/wbTranslate locales/en/ -l="fr,ar,es" -s`
**Simulated Protocol Chain:**
1. System reads `locales/en/` JSON files.
2. Compares keys against `locales/fr/`, `locales/ar/`, and `locales/es/`.
3. Isolates the 5 missing keys.
4. Translates those 5 keys into 3 languages.
5. Injects them safely back into the target JSON files.
**Simulated Output:**
```markdown
> Command: /wbTranslate locales/en/ -l="fr,ar,es" -s

[SYSTEM] Initiating Delta Sync for locales...
[SYNC] Found 5 missing keys in target languages.
[LANG: FR] Translating 5 keys... Injected to locales/fr/
[LANG: AR] Translating 5 keys... Injected to locales/ar/
[LANG: ES] Translating 5 keys... Injected to locales/es/
[SUCCESS] Multi-language sync complete. 15 total keys localized.
```

### 💠 The "Multilingual Documentation Generator" (`docs/**/*.md -l="fr"`)
**Context:** Translating the entire documentation suite to French for a new regional team.
**Command Executed:** `/wbTranslate docs/**/*.md -l="fr"`
**Simulated Output:**
```markdown
> Command: /wbTranslate docs/**/*.md -l="fr"

[SYSTEM] Glob resolved to 12 markdown files.
[LANG] Engaging French translation matrix.
[RULE] Strict syntax preservation active (skipping codeblocks).
[SUCCESS] Generated 12 new files with `_fr.md` suffix.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Logic File Block | User attempts `/wbTranslate src/index.js`. | `❌ Error: Cannot translate logic files. Only .md, .json, .yml allowed.` |
| Markdown Corruption | Translation engine accidentally translates a `div` tag. | `⚠️ Warning: AST validation failed. Retrying chunk to preserve HTML tags.` |
| Unsupported Language | User requests `-l="klingon"`. | `❌ Error: Unsupported language code. Please use ISO 639-1 standards.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

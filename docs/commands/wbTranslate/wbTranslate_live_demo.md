# /wbTranslate — Live Demo ()

What `/wbTranslate` would actually do on `wb-labs` right now. The candidate components and locale-file state below reflect the live workspace.

---

<CommandLiveDemoAnimation command="wbTranslate" />

## 1. Live target

| Field | Live value |
|---|---|
| Components with user-facing strings | Various Vue components in `core2/packages/wb-core/src/components/` and consumer apps |
| Existing i18n setup | None obvious in workspace — first run would bootstrap from scratch |
| English-only convention | Per `project_docs_edition.md`: docs are english-only. UI components likely follow once i18n bootstrap happens. |
| Untested-apps note | wbc-ui2-cdn is parked; cleanup before bootstrap there is risky |
| Most-likely first target | `core2/packages/wb-core/src/components/WBCode.vue` or sibling — small, contained, has user-facing labels |

The "no existing i18n" state means the first `/wbTranslate` run is a true bootstrap — populating en.json from scratch. The english-only memory rule is informational; `/wbTranslate` would create only en.json, leaving fr.json and ar.json for later content work.

---

## 2. What each input form would resolve to today

| Input | Live resolution |
|---|---|
| `/wbTranslate core2/packages/wb-core/src/components/WBCode.vue` | Standard bootstrap. Likely 5-10 user-facing strings. |
| `/wbTranslate core2/packages/wb-core/src/components/` | Directory pass; aggregated en.json. |
| `/wbTranslate core2/packages/wbc-ui2-cdn/` | Permitted but cautious — memory flags package as parked; would scan but warn that bootstrap during parked state could create churn. |
| `/wbTranslate "the login form"` | Halt — free-text. |
| `/wbTranslate core2/packages/wb-core/src/tierEnforcement.js` | One-line "no user-facing strings" (the file throws internal errors only). Exit 0. |
| `/wbTranslate <component> --new-only` | Refuse on first run — `-n` requires existing extractions. Suggests running without `-n` first. |

---

## 3. Per-flag behavior, applied live

| Flag combination | Live result |
|---|---|
| (no flag, file target) | Bootstrap pass; populates en.json from scratch. |
| (no flag, directory target) | Walks; aggregated en.json. |
| `--new-only` on first run | Refuse — nothing to "preserve." |
| `--new-only` after a prior bootstrap | Maintenance pass; only adds new keys. |

---

## 4. Pipelines

<script setup>
const wbTranslatePipelines = [
  {
    "title": "First bootstrap of WBCode.vue",
    "cmd": "/wbTranslate core2/packages/wb-core/src/components/WBCode.vue",
    "logs": [
      {
        "text": "[SYSTEM] Target: WBCode.vue",
        "type": "sys"
      },
      {
        "text": "[CONTEXT] Reading project_docs_edition.md... (english-only rule",
        "type": "ctx"
      },
      {
        "text": "informational only \u2014 bootstrap creates en.json; fr/ar later).",
        "type": "gen"
      },
      {
        "text": "[SCAN] Reading file...",
        "type": "gen"
      },
      {
        "text": "[CANDIDATES IDENTIFIED]",
        "type": "gen"
      },
      {
        "text": "Template (4 user-facing strings):",
        "type": "gen"
      },
      {
        "text": "- Line 12: \"View source\" (button label, conditional on dev mode)",
        "type": "gen"
      },
      {
        "text": "- Line 17: \"Copy\" (button label)",
        "type": "gen"
      },
      {
        "text": "- Line 18: \"Copied!\" (transient feedback text)",
        "type": "gen"
      },
      {
        "text": "- Line 22: \"Toggle code\" (aria-label)",
        "type": "gen"
      },
      {
        "text": "[NOT EXTRACTED] (heuristic: not user-facing)",
        "type": "gen"
      },
      {
        "text": "- Line 8: __WBC_DEV__ identifier \u2014 JS, not user-visible.",
        "type": "gen"
      },
      {
        "text": "- Line 14: 'aria-expanded' attribute name \u2014 DOM identifier, not value text.",
        "type": "gen"
      },
      {
        "text": "[GENERATING KEYS]",
        "type": "gen"
      },
      {
        "text": "wbCode.actions.viewSource: \"View source\"",
        "type": "gen"
      },
      {
        "text": "wbCode.actions.copy: \"Copy\"",
        "type": "gen"
      },
      {
        "text": "wbCode.actions.copied: \"Copied!\"",
        "type": "gen"
      },
      {
        "text": "wbCode.aria.toggle: \"Toggle code\"",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Bootstrap (4 strings; WBCode.vue updated; i18n/en.json",
        "type": "gen"
      },
      {
        "text": "created)? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] core2/packages/wb-core/src/components/WBCode.vue:",
        "type": "gen"
      },
      {
        "text": "4 lines updated to t('wbCode.<key>') calls.",
        "type": "gen"
      },
      {
        "text": "[NEW FILE] core2/packages/wb-core/i18n/en.json:",
        "type": "gen"
      },
      {
        "text": "{",
        "type": "gen"
      },
      {
        "text": "\"wbCode\": {",
        "type": "gen"
      },
      {
        "text": "\"actions\": { \"viewSource\": \"View source\", \"copy\": \"Copy\", \"copied\": \"Copied!\" },",
        "type": "gen"
      },
      {
        "text": "\"aria\": { \"toggle\": \"Toggle code\" }",
        "type": "gen"
      },
      {
        "text": "}",
        "type": "gen"
      },
      {
        "text": "}",
        "type": "gen"
      },
      {
        "text": "[NEW FILE] core2/packages/wb-core/i18n/glossary.md:",
        "type": "gen"
      },
      {
        "text": "Translator notes:",
        "type": "gen"
      },
      {
        "text": "- wbCode.actions.viewSource: button label, verb form (action),",
        "type": "gen"
      },
      {
        "text": "only appears in dev mode.",
        "type": "gen"
      },
      {
        "text": "- wbCode.actions.copy: button label.",
        "type": "gen"
      },
      {
        "text": "- wbCode.actions.copied: transient text shown 2s after copy",
        "type": "gen"
      },
      {
        "text": "click; past tense.",
        "type": "gen"
      },
      {
        "text": "- wbCode.aria.toggle: accessibility label for the expand/collapse",
        "type": "gen"
      },
      {
        "text": "button; verb form.",
        "type": "gen"
      },
      {
        "text": "[OK] Bootstrap complete. en.json created with 4 keys.",
        "type": "ok"
      },
      {
        "text": "[NEXT STEPS]",
        "type": "gen"
      },
      {
        "text": "- For French/Arabic per the english-only memory rule:",
        "type": "gen"
      },
      {
        "text": "1. Copy en.json \u2192 fr.json, ar.json.",
        "type": "gen"
      },
      {
        "text": "2. Translate values in each (human work or separate model run).",
        "type": "gen"
      },
      {
        "text": "3. Wire i18n provider in core2/packages/wb-core/src/index.js",
        "type": "gen"
      },
      {
        "text": "(out of scope for /wbTranslate \u2014 that's setup work).",
        "type": "gen"
      },
      {
        "text": "[NO TRANSLATION CONTENT] /wbTranslate did NOT translate any strings.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "A \"no strings\" file",
    "cmd": "/wbTranslate core2/packages/wb-core/src/tierEnforcement.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: tierEnforcement.js",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading file (78 lines, 1 export, 0 templates)...",
        "type": "gen"
      },
      {
        "text": "[ANALYSIS] No template/JSX. Throws are caught internally and not",
        "type": "gen"
      },
      {
        "text": "re-emitted to user UI per consumer code analysis.",
        "type": "gen"
      },
      {
        "text": "[NO USER-FACING STRINGS FOUND]",
        "type": "gen"
      },
      {
        "text": "[OK] Nothing to translate. Exit 0.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Refuse `--new-only` on first run",
    "cmd": "/wbTranslate core2/packages/wb-core/src/components/WBCode.vue --new-only",
    "logs": [
      {
        "text": "[SYSTEM] Target: WBCode.vue",
        "type": "sys"
      },
      {
        "text": "[MODE] new-only \u2014 preserve existing extractions.",
        "type": "gen"
      },
      {
        "text": "[CHECK] Looking for existing i18n/en.json... not found.",
        "type": "gen"
      },
      {
        "text": "[REFUSE] --new-only requires existing extractions. There's nothing",
        "type": "error"
      },
      {
        "text": "to preserve.",
        "type": "gen"
      },
      {
        "text": "[SUGGEST] Run without --new-only first to bootstrap en.json:",
        "type": "gen"
      },
      {
        "text": "/wbTranslate core2/packages/wb-core/src/components/WBCode.vue",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Halted.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Maintenance after Pipeline A",
    "cmd": "/wbTranslate core2/packages/wb-core/src/components/WBCode.vue --new-only",
    "logs": [
      {
        "text": "[SYSTEM] Target: WBCode.vue",
        "type": "sys"
      },
      {
        "text": "[MODE] new-only.",
        "type": "gen"
      },
      {
        "text": "[SCAN] ...",
        "type": "gen"
      },
      {
        "text": "[CANDIDATES] 6 strings found.",
        "type": "gen"
      },
      {
        "text": "[ALREADY-EXTRACTED] 4 strings match existing keys.",
        "type": "gen"
      },
      {
        "text": "[NEW] 2 strings:",
        "type": "gen"
      },
      {
        "text": "- Line 24: \"Show language\" (new toggle label)",
        "type": "gen"
      },
      {
        "text": "- Line 30: \"Format JSON\" (new action button)",
        "type": "gen"
      },
      {
        "text": "[GENERATING KEYS]",
        "type": "gen"
      },
      {
        "text": "wbCode.actions.showLanguage: \"Show language\"",
        "type": "gen"
      },
      {
        "text": "wbCode.actions.formatJSON: \"Format JSON\"",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Add 2 new keys? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] WBCode.vue: 2 t() calls added.",
        "type": "gen"
      },
      {
        "text": "[EDIT] i18n/en.json: +2 keys.",
        "type": "gen"
      },
      {
        "text": "[EDIT] i18n/glossary.md: +2 entries.",
        "type": "gen"
      },
      {
        "text": "[OK] Maintenance pass complete. Existing 4 translations untouched.",
        "type": "ok"
      }
    ],
    "note": "A week later, WBCode.vue gets two new strings added:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbTranslate" :pipelines="wbTranslatePipelines" />


### 💠 Pipeline First bootstrap of WBCode.vue


### 💠 Pipeline A "no strings" file


### 💠 Pipeline Refuse `--new-only` on first run


### 💠 Pipeline Maintenance after Pipeline A

A week later, WBCode.vue gets two new strings added:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbTranslate` (no target) | Halt. |
| `/wbTranslate "the login form"` | Halt — free-text. |
| `/wbTranslate <new-component> --new-only` | Refuse — nothing to preserve. |
| `/wbTranslate <file with only error throws>` | Exit 0 — no user-facing strings. |
| `/wbTranslate core2/packages/wbc-ui2-cdn/` | Permitted but warns about parked package. Asks confirmation. |
| `/wbTranslate <test file>` | Skip — test files don't translate. |
| User asks for fr.json / ar.json *content* | Refuse politely — `/wbTranslate` doesn't translate. Suggests human or separate model pass with translator-quality prompts. |
| Existing locale file is corrupted JSON | Halt — refuses to act on broken state. |

The pattern: **`/wbTranslate` is i18n bootstrap, not i18n content.** It produces scaffolding (key extraction, en.json population, glossary file) and explicitly does *not* invent translations. The single flag (`--new-only`) addresses the maintenance case; first-run is flag-free. Memory awareness shows up in caution around parked packages and english-only rule informational notes. The boundary with content work is hard and clearly named — every report ends with "did NOT translate" so the user knows where the seam is.

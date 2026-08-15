# /wbTranslate — Exhaustive Simulation ()

`/wbTranslate` is the i18n bootstrap. Its job is to **lift hardcoded user-facing strings into a translation file**, leaving placeholders in the original code, and producing a localization-ready scaffold. It does not invent translations; it does not produce localized variants; it sets up the *infrastructure* for translation work.

Read this if you want to know what counts as a "user-facing string," why `/wbTranslate` has only one flag, and where translation bootstrap ends and translation *content* begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Translator — i18n scaffolding, not localized content. |
| **Target** | A file or directory containing user-facing strings. |
| **Cell scope** | None. |
| **Side effects allowed** | Editing source code (replace hardcoded strings with `t('key')` calls); creating/updating `i18n/<locale>.json` or equivalent; producing a glossary file for the translation team. |
| **Side effects forbidden** | Inventing translations; producing localized variants without explicit `--new-only` opt-in; modifying tests; touching code that isn't user-facing. |

The "no invented translations" rule is the contract. The tooling job is mechanical: find strings, key them, replace with calls. The *content* job (translating "Submit" to "Soumettre") is human work, or a different model run with the right context. Mixing the two produces fake-looking localizations that nobody trusts.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbTranslate` does |
|---|---|---|
| File | `Command: /wbTranslate src/components/LoginForm.vue` | Scans for user-facing strings; lifts them into the locale file; replaces with t() calls. |
| Directory | `Command: /wbTranslate src/components/` | Walks the directory; one locale file aggregating all keys. |
| Free-text | `Command: /wbTranslate "the login flow"` | Refused. Translation is path-required (string-extraction needs file scope). |

### What counts as a "user-facing string"

A heuristic, applied per file type:

| Context | String is user-facing if... |
|---|---|
| Vue/React component template | It appears as text content of a DOM element, or as a `placeholder` / `aria-label` / `title` attribute. |
| Vue/React script section | It's passed to a known UI emitter (toast, alert, error throw with user-visible message). |
| Form labels, button text | Always user-facing. |
| Console.log / debug | Never user-facing — left alone. |
| Error messages thrown to internal callers | Not user-facing — left alone. |
| URLs, regex patterns, technical constants | Never user-facing — left alone. |

The heuristic is conservative: when uncertain, leave the string alone and surface it as a "candidate?" question rather than auto-extracting.

---

## 3. Flag matrix

`/wbTranslate` has one flag.

| Flag | Shortcut | Purpose |
|---|---|---|
| `--new-only` | `-n` | Only extract strings that *aren't already* in the locale file. Skip already-keyed content. |

Without `--new-only`, every user-facing string in the target gets re-keyed (with collision handling — same string maps to same key). With `--new-only`, the agent assumes existing keys are correct and only adds new ones.

The `-n` flag is for the maintenance case: someone added 3 new strings to a component that's already partially translated. You don't want to re-key the existing 20; you want only the 3 new ones.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbTranslateSimPipelines = [
  {
    "title": "First-time bootstrap of a component",
    "cmd": "/wbTranslate core2/packages/wb-core/src/components/LoginForm.vue",
    "logs": [
      {
        "text": "[SYSTEM] Target: LoginForm.vue",
        "type": "sys"
      },
      {
        "text": "[SCAN] Reading file (94 lines)...",
        "type": "gen"
      },
      {
        "text": "[CANDIDATES IDENTIFIED]",
        "type": "gen"
      },
      {
        "text": "Template (8 user-facing strings):",
        "type": "gen"
      },
      {
        "text": "- Line 4: \"Sign in to your account\"",
        "type": "gen"
      },
      {
        "text": "- Line 7: \"Email address\" (label)",
        "type": "gen"
      },
      {
        "text": "- Line 8: \"Enter your email\" (placeholder)",
        "type": "gen"
      },
      {
        "text": "- Line 12: \"Password\" (label)",
        "type": "gen"
      },
      {
        "text": "- Line 13: \"Enter your password\" (placeholder)",
        "type": "gen"
      },
      {
        "text": "- Line 17: \"Sign in\" (button text)",
        "type": "gen"
      },
      {
        "text": "- Line 21: \"Forgot password?\" (link text)",
        "type": "gen"
      },
      {
        "text": "- Line 25: \"Don't have an account? Sign up\" (link text)",
        "type": "gen"
      },
      {
        "text": "Script (2 user-facing strings):",
        "type": "gen"
      },
      {
        "text": "- Line 41: throw new Error(\"Invalid credentials\") \u2014 visible",
        "type": "gen"
      },
      {
        "text": "to user via toast.",
        "type": "gen"
      },
      {
        "text": "- Line 47: emit('toast', \"Welcome back\") \u2014 toast text.",
        "type": "gen"
      },
      {
        "text": "[NOT EXTRACTED] (heuristic: not user-facing)",
        "type": "gen"
      },
      {
        "text": "- Line 23: 'tabindex=\"0\"' \u2014 DOM attribute value.",
        "type": "gen"
      },
      {
        "text": "- Line 33: console.log('LoginForm mounted') \u2014 debug.",
        "type": "gen"
      },
      {
        "text": "[GENERATING KEYS]",
        "type": "gen"
      },
      {
        "text": "loginForm.heading: \"Sign in to your account\"",
        "type": "gen"
      },
      {
        "text": "loginForm.email.label: \"Email address\"",
        "type": "gen"
      },
      {
        "text": "loginForm.email.placeholder: \"Enter your email\"",
        "type": "gen"
      },
      {
        "text": "loginForm.password.label: \"Password\"",
        "type": "gen"
      },
      {
        "text": "loginForm.password.placeholder: \"Enter your password\"",
        "type": "gen"
      },
      {
        "text": "loginForm.submit: \"Sign in\"",
        "type": "gen"
      },
      {
        "text": "loginForm.forgotPassword: \"Forgot password?\"",
        "type": "gen"
      },
      {
        "text": "loginForm.signUp: \"Don't have an account? Sign up\"",
        "type": "gen"
      },
      {
        "text": "loginForm.errors.invalidCredentials: \"Invalid credentials\"",
        "type": "gen"
      },
      {
        "text": "loginForm.toast.welcome: \"Welcome back\"",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Proceed with extraction (10 strings \u2192 10 keys; LoginForm.vue",
        "type": "gen"
      },
      {
        "text": "updated; i18n/en.json populated)? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] LoginForm.vue: replaced literals with t('loginForm.<key>') calls.",
        "type": "gen"
      },
      {
        "text": "[EDIT] i18n/en.json: added 10 keys.",
        "type": "gen"
      },
      {
        "text": "[NEW FILE] i18n/glossary.md: scaffolded with the 10 new entries +",
        "type": "gen"
      },
      {
        "text": "context notes for translators (e.g., \"loginForm.submit",
        "type": "gen"
      },
      {
        "text": "appears as a button on the login page; verb form\").",
        "type": "gen"
      },
      {
        "text": "[OK] Bootstrap complete. en.json is the only locale; create fr.json,",
        "type": "ok"
      },
      {
        "text": "ar.json, etc. by copying en.json and translating values.",
        "type": "gen"
      },
      {
        "text": "[NOTE] /wbTranslate did NOT translate any strings. en.json contains",
        "type": "gen"
      },
      {
        "text": "the original English. Other locales are empty until human",
        "type": "gen"
      },
      {
        "text": "translators or a later pass fill them in.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Maintenance pass with `--new-only`",
    "cmd": "/wbTranslate core2/packages/wb-core/src/components/LoginForm.vue --new-only",
    "logs": [
      {
        "text": "[SYSTEM] Target: LoginForm.vue",
        "type": "sys"
      },
      {
        "text": "[MODE] new-only \u2014 preserving existing extractions.",
        "type": "gen"
      },
      {
        "text": "[SCAN] Reading file...",
        "type": "gen"
      },
      {
        "text": "[CANDIDATES] 12 user-facing strings found.",
        "type": "gen"
      },
      {
        "text": "[ALREADY-EXTRACTED] 10 strings match existing keys in i18n/en.json.",
        "type": "gen"
      },
      {
        "text": "[NEW] 2 strings:",
        "type": "gen"
      },
      {
        "text": "- Line 18: \"Remember me\" (new checkbox label)",
        "type": "gen"
      },
      {
        "text": "- Line 19: \"Stay signed in for 30 days\" (new helper text)",
        "type": "gen"
      },
      {
        "text": "[GENERATING KEYS]",
        "type": "gen"
      },
      {
        "text": "loginForm.rememberMe.label: \"Remember me\"",
        "type": "gen"
      },
      {
        "text": "loginForm.rememberMe.helper: \"Stay signed in for 30 days\"",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Add 2 new keys? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[EDIT] LoginForm.vue: 2 lines updated to t() calls.",
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
        "text": "[OK] Maintenance pass complete. Existing translations untouched.",
        "type": "ok"
      }
    ],
    "note": "After Pipeline A, the developer adds 2 new strings to LoginForm.vue. Running again:",
    "noteType": "info"
  },
  {
    "title": "Refusal on ambiguous case",
    "cmd": "/wbTranslate core2/packages/wb-core/src/errors.js",
    "logs": [
      {
        "text": "[SYSTEM] Target: errors.js (74 lines, 28 throw statements)",
        "type": "sys"
      },
      {
        "text": "[SCAN] ...",
        "type": "gen"
      },
      {
        "text": "[ANALYSIS]",
        "type": "gen"
      },
      {
        "text": "Of 28 throw statements:",
        "type": "gen"
      },
      {
        "text": "- 6 throw user-visible errors (caught and toast'd in consumers).",
        "type": "gen"
      },
      {
        "text": "- 22 throw internal-only errors (caught and rethrown with",
        "type": "gen"
      },
      {
        "text": "different messages).",
        "type": "gen"
      },
      {
        "text": "[CANDIDATES IDENTIFIED] 6 strings.",
        "type": "gen"
      },
      {
        "text": "[CAUTION] The split between user-visible and internal errors is",
        "type": "gen"
      },
      {
        "text": "inferred from consumer code. If you've added new throw",
        "type": "gen"
      },
      {
        "text": "statements that the heuristic doesn't recognize, those",
        "type": "gen"
      },
      {
        "text": "strings won't be extracted.",
        "type": "gen"
      },
      {
        "text": "[CONFIRM] Extract 6 user-visible error strings? [y/N] > y",
        "type": "gen"
      },
      {
        "text": "[... extraction proceeds ...]",
        "type": "gen"
      },
      {
        "text": "[FOLLOW-UP] Surfaced for human review:",
        "type": "gen"
      },
      {
        "text": "Line 33: throw new Error(\"Tier check failed: \" + tier) \u2014 the",
        "type": "gen"
      },
      {
        "text": "prefix \"Tier check failed: \" might be user-visible or might be",
        "type": "gen"
      },
      {
        "text": "internal. Consumer behavior is ambiguous. Did NOT extract;",
        "type": "gen"
      },
      {
        "text": "recommend deciding manually.",
        "type": "gen"
      }
    ],
    "note": "A user runs `/wbTranslate` on a file mostly full of error strings:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbTranslate" titleSuffix="Exhaustive Simulation" :pipelines="wbTranslateSimPipelines" />


### 💠 Pipeline First-time bootstrap of a component


### 💠 Pipeline Maintenance pass with `--new-only`

After Pipeline A, the developer adds 2 new strings to LoginForm.vue. Running again:


### 💠 Pipeline Refusal on ambiguous case

A user runs `/wbTranslate` on a file mostly full of error strings:

---

## 5. Edge cases & refusals

| Trigger | What `/wbTranslate` does |
|---|---|
| No target | Halt. |
| Free-text target | Halt — file/directory required. |
| Target has no user-facing strings | One-line "nothing to translate." Exit 0. |
| Target with mixed locales already | Refuse — running `/wbTranslate` on a partially-translated file is risky without `-n`. Suggests re-running with `--new-only`. |
| String contains placeholders / interpolations | Lift the *template*, not the interpolated values: `t('key', { name: user.name })`. |
| Same string appears multiple times | Generate one key, reuse across call sites. |
| `--new-only` and the existing locale file is corrupted | Halt — needs human inspection of the locale file before maintenance can proceed. |
| Test files in target | Skip — test strings aren't user-facing. |
| User asks for translation *content* | Refuse politely. `/wbTranslate` produces scaffolding; content is human or a separate model run. |

The pattern: **`/wbTranslate` is i18n bootstrap, not i18n content.** It identifies user-facing strings via a conservative heuristic, replaces them with key calls, populates the source-locale file, generates a translator-facing glossary. It refuses to invent translations, refuses to act on ambiguous targets, refuses scope shapes that don't produce reliable extraction. The output is a foundation that humans (or follow-on translation processes) can build on.

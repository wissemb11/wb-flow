---
title: "wbTranslate — Examples"
description: "Examples illustrating string extraction and i18n key replacement using wbTranslate."
---

# /wbTranslate — Examples

> Self-help. `/wbTranslate` extracts hardcoded strings from a Vue component, replaces them with i18n keys, and writes locale JSON. This file shows what good extraction looks like vs. mechanical replacement.

---

## What /wbTranslate refuses to do

- Translate strings that are *not* user-facing (CSS class names, event names, internal log messages).
- Invent a translation when context is ambiguous.
- Run on a component that doesn't have i18n setup (would create dangling `$t()` calls).
- Re-translate a component already wired to i18n (would double-process keys).

---

## Example 1 — `/wbTranslate src/components/NavBar.vue`

```text
$ /wbTranslate src/components/NavBar.vue

[AI] Reading the file...
[AI] Verifying i18n setup in this app...
[AI] ✅ vue-i18n configured (src/i18n.js)
[AI] ✅ Existing keys: 23 (en coverage 100%)
[AI]
[AI] Identifying user-facing strings...
[AI] "Home" — line 12, in <a> text
[AI] "About" — line 13, in <a> text
[AI] "Sign In" — line 18, in <button> text
[AI] "Loading..." — line 22, in conditional render
[AI]
[AI] Skipping non-user-facing strings:
[AI] "nav-link active" — CSS class
[AI] "click" — event name
[AI] "/api/auth/login" — URL
[AI]
[AI] Proposed extraction:
```

```vue
<!-- Before -->
<template>
 <nav>
 <a href="/">Home</a>
 <a href="/about">About</a>
 <button>Sign In</button>
 <span v-if="loading">Loading...</span>
 </nav>
</template>

<!-- After -->
<template>
 <nav>
 <a href="/">{{ $t('navbar.home') }}</a>
 <a href="/about">{{ $t('navbar.about') }}</a>
 <button>{{ $t('navbar.signIn') }}</button>
 <span v-if="loading">{{ $t('navbar.loading') }}</span>
 </nav>
</template>
```

```text
[AI] Generated translations:
```

```json
// src/i18n/en.json (additions)
{
 "navbar": {
 "home": "Home",
 "about": "About",
 "signIn": "Sign In",
 "loading": "Loading..."
 }
}

// src/i18n/fr.json (additions)
{
 "navbar": {
 "home": "Accueil",
 "about": "À propos",
 "signIn": "Connexion",
 "loading": "Chargement..."
 }
}

// src/i18n/ar.json (additions)
{
 "navbar": {
 "home": "الرئيسية",
 "about": "حول",
 "signIn": "تسجيل الدخول",
 "loading": "جارٍ التحميل..."
 }
}
```

```text
[AI] RTL note for Arabic:
[AI] The "Sign In" button has an icon. Confirm icon mirrors in RTL
[AI] layout. CSS should use logical properties (margin-inline-start)
[AI] not directional (margin-left).
[AI]
[AI] Writing reports/20260425/translations/translate_NavBar_202604250200.md
[AI]
[AI] NEXT:
[AI] 1. Review translations (especially FR/AR for tone/correctness).
[AI] 2. Verify NavBar still renders in all 3 languages.
[AI] 3. /wbGit to commit.
```

**What's worth noticing:**

- The AI distinguishes user-facing from non-user-facing strings explicitly. CSS class names are NOT translated (common AI mistake).
- Translations include cultural awareness (Arabic uses standard navigation terms, not literal Google Translate).
- RTL note for Arabic flags layout concerns. This isn't translation per se — it's about the *layout* that translation will surface.
- Suggested next step is human review. AI translations are starting points; native-speaker review is the real test.

---

## Example 2 — `/wbTranslate` refused (no i18n setup)

```text
$ /wbTranslate src/components/StandalonePage.vue

[AI] Verifying i18n setup...
[AI] ❌ No vue-i18n configured in this app
[AI] ❌ No src/i18n/ directory exists
[AI]
[AI] REFUSING.
[AI] Reason: extracting `$t()` calls into a component that doesn't
[AI] have $t() configured would break rendering. The strings would
[AI] render as `[object Object]` or throw.
[AI]
[AI] To proceed:
[AI] 1. Set up vue-i18n in this app:
[AI] - npm install vue-i18n
[AI] - Create src/i18n/index.js with createI18n()
[AI] - Register with app.use(i18n)
[AI] - Create src/i18n/{en,fr,ar}.json
[AI] 2. THEN run /wbTranslate.
```

**What's worth noticing:**

- Refusal is specific. "Set up i18n first" — not a vague "configure your app."
- The setup steps are listed because they're standard for vue-i18n. The AI knows the pattern.

---

## Example 3 — `/wbTranslate` ambiguous strings flagged

```text
$ /wbTranslate src/components/UserProfile.vue

[AI] Identifying user-facing strings...
[AI]
[AI] ⚠ Ambiguous strings — need your input:
[AI]
[AI] "Profile" (line 8)
[AI] Could be: page title, section header, or button label
[AI] French would differ: "Profil" (page) vs "Profil" (header) vs
[AI] "Le profil" (when in a sentence)
[AI]
[AI] "Save" (line 24)
[AI] Could be: action button, menu item, status indicator
[AI] French: "Enregistrer" (button) vs "Enregistrer" (menu) vs
[AI] "Sauvegardé" (status)
[AI]
[AI] Please clarify:
[AI] - "Profile" usage:
[AI] - "Save" usage:
[AI]
[AI] Will not generate translations until clarified.
```

**What's worth noticing:**

- Translation context matters more than translation itself. "Save" the verb vs "Saved" the past participle is the kind of thing that tools get wrong silently.
- The AI lists possible interpretations and asks. Better than guessing.

---

## Example 4 — `/wbTranslate` already-translated component (refused)

```text
$ /wbTranslate src/components/NavBar.vue

[AI] Reading file...
[AI] Detected $t() calls already present:
[AI] $t('navbar.home') — line 12
[AI] $t('navbar.about') — line 13
[AI] ...
[AI]
[AI] This component is already wired to i18n.
[AI]
[AI] REFUSING re-translation. Re-running would either:
[AI] - Double-wrap existing keys (broken)
[AI] - Generate duplicate keys (e.g., navbar.home and navbar.home2)
[AI] - Silently overwrite existing translations
[AI]
[AI] If you want to:
[AI] - Add missing translations → tell me which language is missing.
[AI] - Refine existing translations → edit src/i18n/*.json directly.
[AI] - Translate NEW strings only → /wbTranslate <file> --new-only
[AI] (this skips already-keyed strings).
```

**What's worth noticing:**

- The command refuses re-processing because re-processing is destructive. Different fix paths for different intents.
- `--new-only` is the right tool when you've added new strings to a previously-translated component.

---

## The pattern

Every `/wbTranslate` run has:

1. **Verify i18n setup** — refuses if absent.
2. **Identify user-facing strings** — distinguishes from CSS, events, URLs, internal text.
3. **Detect already-translated components** — refuses re-processing.
4. **Flag ambiguous strings** — requires user disambiguation.
5. **Generate context-aware translations** — three languages with cultural awareness.
6. **Note RTL concerns** — for Arabic specifically.
7. **Suggest human review** — AI translations are drafts, not ground truth.

---

---

## Basic Usage

```bash
# Standard command execution
/wbTranslate frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbTranslate deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbTranslate` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbTranslate target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbTranslate target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbTranslate target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbTranslate packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbTranslate apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbTranslate` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbTranslate frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```

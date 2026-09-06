# /wbTranslate — Practical

## Two forms

```
/wbTranslate <file> # extract + translate all hardcoded strings
/wbTranslate <file> --new-only # only handle strings not yet keyed
```

## When to run

- After the component's UI is stable (post-design, post-iteration).
- Before shipping a user-facing release that needs FR/AR coverage.
- When adding new user-facing strings to an already-translated component (use `--new-only`).

## When *not* to run

- Mid-iteration, when copy is still changing. You'll re-translate every iteration.
- On a component without i18n setup. Command will refuse.
- On a component already fully translated (use `--new-only` instead).
- On developer-facing components that won't be shipped to users.

## Prerequisites

- vue-i18n (or equivalent) configured in the app.
- `src/i18n/{en,fr,ar}.json` (or equivalent) exist.
- The component imports `useI18n` or has access to `$t`.

If any prerequisite is missing, the command refuses with setup steps.

## Reading the output

- **Extracted strings list** — exactly what will become i18n keys.
- **Skipped strings list** — what was deliberately not extracted (CSS classes, events, URLs).
- **Ambiguous strings** — requires your disambiguation before proceeding.
- **Three JSON additions** — en, fr, ar. Each with cultural awareness.
- **RTL note** — Arabic-specific layout flags.

## The translation review step

AI-generated translations are drafts. Review especially:

- **Tone**: formal vs. informal "you" (vous/tu, anta/anti).
- **Brand voice**: action verbs may differ ("Save" → "Enregistrer" vs. "Sauvegarder").
- **RTL layout**: Arabic strings may overflow; layout may need adjustment.
- **Date/number formatting**: not handled by `/wbTranslate`; uses i18n built-ins.

If you don't speak FR/AR, defer to native speakers before shipping. AI translations of common UI strings are decent; AI translations of nuanced messaging are guesses.

## When /wbTranslate is the wrong command

- Pluralization rules → vue-i18n's plural syntax; AI can't fully infer.
- Locale-aware formatting (dates, currency) → use Intl APIs, not strings.
- Server-rendered text → translate server-side.
- A11y attributes (`aria-label` etc.) → these *are* user-facing; `/wbTranslate` should handle them. If it skips them, re-prompt.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Documented shortcuts are listed below.

| Long form | Shortcut |
|---|---|
| `--new-only` | `-n` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---

# /wbTranslate: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbTranslate`

## Two forms

```
/wbTranslate <file>                  # extract + translate all hardcoded strings
/wbTranslate <file> --new-only       # only handle strings not yet keyed
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

> For deeper reading: [`docs_claude/commands/wbTranslate/wbTranslate_practical_claude.md`](../../docs/docs_claude/commands/wbTranslate/wbTranslate_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--new-only` | `-n` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-n` → `--new-only`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Linguist
**TARGET:** The provided UI component or translation directory.

## ━━━ OBJECTIVE ━━━
Your job is to ensure the monorepo remains fully multilingual (EN, FR, AR). You must extract hardcoded strings and generate localized JSON files.

## ━━━ PHASE 1: EXTRACTION ━━━
1. Scan the target UI component (e.g., `.vue` files).
2. Identify any hardcoded human-readable strings (e.g., `<button>Submit</button>`).
3. Replace them with the appropriate i18n translation key (e.g., `<button>{{ $t('buttons.submit') }}</button>`).

## ━━━ PHASE 2: TRANSLATION GENERATION ━━━
1. Take the extracted strings and generate perfect context-aware translations for French (`fr.json`) and Arabic (`ar.json`).
2. Ensure RTL (Right-to-Left) UI considerations are respected for Arabic.

## ━━━ PHASE 3: REPORTING ━━━
Summarize the translation keys added.

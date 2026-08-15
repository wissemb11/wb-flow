# /wbTranslate — Expert

## What `/wbTranslate` architecturally is

A **string-extraction-and-localization command** that operates on Vue templates: identifies user-facing literal strings, replaces them with i18n keys, generates translations into EN/FR/AR JSON files. Refuses if i18n infrastructure isn't present.

the agent's version mentions "AST-level text extraction." The framing is partially accurate — extraction does require parsing structure to distinguish text from attributes from event names — but "AST-level" overstates the formal rigor. The command is doing LLM-mediated semantic understanding plus pattern matching, not formal AST analysis.

## The user-facing-string identification problem

This is harder than it looks. A naive approach extracts every string literal, producing garbage:

```vue
<button class="primary">Save</button>
<!-- naive: keys for "primary" and "Save" -->
<!-- correct: only "Save" -->
```

`/wbTranslate` distinguishes by context:

- Text content of elements → user-facing.
- Element attributes that render to user (`title`, `placeholder`, `aria-label`) → user-facing.
- Element attributes that don't (`class`, `id`, `data-*`, `:href`) → not user-facing.
- Event names (`@click`) → never.
- Computed bindings (`:value="something"`) → only the literal parts, if any.
- URLs (`/api/...`, `https://...`) → not user-facing.

This classification is heuristic, not formal. Edge cases exist (e.g., a `data-tooltip` attribute that *is* user-facing). The command surfaces these as "ambiguous" rather than guessing.

## The translation-quality problem

LLM translation is good at:
- Common UI vocabulary (Login, Save, Cancel).
- Short phrases with clear intent.
- Direct word-for-word equivalents.

LLM translation is mediocre at:
- Brand-specific terminology that should stay English.
- Idiomatic phrases (translation often goes literal).
- Ambiguous source text (the same English word maps to different target words by context).
- Domain-specific jargon (legal, medical, technical).

The command mitigates by flagging ambiguous strings for user disambiguation. It doesn't claim to produce ship-ready translations — they're drafts. The output's "review step" framing is essential, not optional.

## Three design decisions worth naming

### 1. EN/FR/AR as fixed target set
The project commits to three languages. The command doesn't add languages dynamically. Adding a fourth (say, Spanish) would require updating prompts. This bounds the work and keeps translations consistent.

If the project grows multi-language, the command would need redesign — but for the current scope, fixed-three is correct.

### 2. RTL awareness for Arabic specifically
Arabic isn't just a translation; it's a layout shift. The command includes RTL-specific notes in output (logical CSS properties, icon mirroring, text alignment). This is the difference between "translates correctly" and "renders correctly in the target locale."

LTR-only translation tools (most of them) skip this. The command's value-add is naming the layout concerns.

### 3. Refusal to re-process already-translated components
Re-running `/wbTranslate` on a component that already has `$t()` calls would either double-process keys or silently overwrite translations. The command refuses.

`--new-only` is the workflow for incremental translation: the user adds new strings to an existing component, then runs `/wbTranslate <file> --new-only` to handle just those. This is the case that should work; full re-processing is the case that should refuse.

## Where the command leaks

1. **Pluralization is unhandled.** "1 item" vs. "2 items" requires vue-i18n plural syntax. The command extracts both as separate keys, which is wrong. User must consolidate manually.

2. **Locale-aware formatting is out of scope.** Dates, currencies, numbers — these need Intl APIs, not string translations. The command doesn't enforce or check.

3. **Translation reviewed by AI, not by native speakers.** The command's "review step" pointer is correct but the command can't verify reviews happened. Bad translations can ship.

4. **No translation memory.** Across components, the same source string ("Save") might get slightly different translations ("Enregistrer" vs. "Sauvegarder"). The command doesn't reference prior translations to enforce consistency.

5. **A11y attributes inconsistent coverage.** `aria-label` is sometimes extracted, sometimes not. Coverage depends on whether the component pattern was in the LLM's training set.

## The handoff to wbDeploy

Translated components ship as part of normal deploy. `/wbTranslate` doesn't have a deploy gate. But:

- If a component has i18n calls but `fr.json` is missing keys, `vue-i18n` will fall back to a key-name display ("navbar.signIn" instead of "Connexion"). Ugly but not broken.
- `/wbDeploy` could in principle check translation completeness, but currently doesn't.

This is a coverage gap; running `/wbTranslate` on every new component is the manual workflow.

What `wb-flow-docs`'s playbook gets wrong about `/wbTranslate`: framing it as full i18n, when the Claude edition explicitly draws the boundary: it extracts keys and generates translation scaffolding but refuses to produce final translations. The 'did NOT translate' disclaimer at the end of every report is the safety rail the sibling edition misses.

## One-paragraph verdict

A string-extraction-and-localization command whose architectural contributions are *user-facing-string classification* and *RTL-aware Arabic output*. Correct in refusing on missing i18n setup, in flagging ambiguous strings rather than guessing, and in treating translations as drafts requiring review. The "AST-level" framing from gemini overstates what's really LLM-mediated semantic understanding plus pattern matching. Weakest in pluralization handling, locale-formatting scope, lack of native-speaker verification, no translation memory, and inconsistent A11y attribute coverage. Correct for solo monorepo localization at the EN/FR/AR scope; would need redesign for dynamic language sets and translation-memory integration for serious i18n operations.

---

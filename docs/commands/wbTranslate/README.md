# /wbTranslate — Command Hub

`/wbTranslate` produces translations of documentation files while preserving markdown structure, code blocks, and technical terminology. It handles the mechanical work of converting content between languages at the AST level, keeping formatting and semantics intact. Quality review of the output remains a human responsibility.

## 🎯 Strategic Position

`/wbTranslate` handles the mechanical part of multi-language documentation — the part that is tedious, error-prone, and easy to get wrong manually. It is not a human translator and does not replace one; it preserves structure and technical terms while converting content, so the reviewer can focus on quality rather than formatting.

- **Before a release** — translate docs into supported languages.
- **After a doc update** — `--new-only` targets only changed sections.
- **Never** — use it without a manual review pass.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|

| **Incremental** | `/wbTranslate <file> --new-only` / `-n` | Only sections not yet translated in the target language |

## ✅ What a useful translation contains

A useful translation includes at minimum:

1. **Preserved markdown structure** — headings, lists, links, and formatting intact.
2. **Untouched code blocks** — no translation applied to code fences.
3. **Technical terminology** either left untranslated or consistently mapped.
4. **Output file** placed next to the source with the appropriate language suffix.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Generate original documentation | [`/wbDoc`](../wbDoc/README.md) |
| Verify translation quality | Manual review required |

It also does not handle RTL layout — only content translation is supported.

## 📚 Reading Order

1. **[ELI5](wbTranslate_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbTranslate_practical.md)** — step-by-step walkthrough on a real project.
3. **[Expert](wbTranslate_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbTranslate_examples.md)** — annotated transcripts ([Part 1](wbTranslate_examples.md), [Part 2](wbTranslate_examples.md)).
5. **[Exhaustive simulation](wbTranslate_exhaustive_simulation.md)** · **[Live demo](wbTranslate_live_demo.md)**.

## 🔗 Related

- [`wbTranslate.md`](wbTranslate.md) — the command reference this hub orients you around.
- [`/wbDoc`](../wbDoc/README.md) — generate new documentation (before translating it).

## Quick Reference

```bash

/wbTranslate docs/ --new-only -n        # translate only new/changed sections

```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

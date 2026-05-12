
<!-- MERGED CONTENT FROM commands/wbTranslate/wbTranslate_examples.md -->

# wbTranslate — Canonical Examples

Below are the optimal invocation patterns for `/wbTranslate`.

### Translates strings in Banner.vue.
```bash
/wbTranslate packages/wb-core/src/components/Banner.vue
```

### Translates documentation to French.
```bash
wbTranslate README.md --lang fr
```

### Converts JS project to TypeScript.
```bash
wbTranslate src/ --from js --to ts --in-place
```

## Related Commands

`wbTranslate` belongs to the **Surgeons** family. Sibling commands in this family:

- **[WbClean](../wbClean/README.md)** — [WbClean Hub](../wbClean/README.md)
- **[WbSecure](../wbSecure/README.md)** — [WbSecure Hub](../wbSecure/README.md)

## See Also

- [Commands Overview](../README.md#the-command-catalog)
- [Concepts: Agentic Workflows](../../concepts/overview_agentic_workflows.md)
- [Session Lifecycle](../../session_lifecycle/README.md)
- [Start Here](../../start_here/README.md)


## Common Workflow

Review output carefully. Always run `wbTest` after language translation.


## Key Options

AST-level translation preserves semantics. Supports programming and human language pairs.

- Use `--help` or `/wbHelp wbTranslate` for the full option reference
- Combine with pipeline commands using `|` for multi-step workflows

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

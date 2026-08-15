# /wbToWBC — Command Hub

`/wbToWBC` transforms standard Vue/JS code into the WBC (Web Component) format used by the `wb-core` engine. It analyzes the source component's structure — props, data, methods, lifecycle hooks — and maps them to WBC declarative primitives, preserving behavior while adapting the implementation to the `@wbc-ui2` ecosystem. It is the only Vue-specific command in the suite.

## 🎯 Strategic Position

`/wbToWBC` is the bridge between standard Vue and the WBC ecosystem. Every other command in the suite works with any codebase — this one is specialized for component migration. Use it when moving existing components into `@wbc-ui2`; do not use it to create new components from scratch.

- **Migrating a component** — convert `.vue` to WBC format.
- **After a framework change** — adapt loader and plugin config.
- **Before validation** — run `/wbValid` on the output.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Convert** | `/wbToWBC <component.vue>` | WBC component with auto-detected framework, behavior preserved |

## ✅ What a useful conversion contains

A useful conversion includes at minimum:

1. **Framework auto-detection** — correctly identified source framework.
2. **Behavior preservation** — props, data, methods, and lifecycle hooks mapped faithfully.
3. **Loader and plugin configuration** generated for the target bundler.
4. **Optimization config** applied for the target environment.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Validate the result | [`/wbValid`](../wbValid/README.md) |
| Audit conversion quality | [`/wbAudit`](../wbAudit/README.md) |

It also only converts existing components — it does not create new ones from scratch.

## 📚 Reading Order

1. **[ELI5](wbToWBC_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbToWBC_practical.md)** — step-by-step walkthrough on a real project.
3. **[Expert](wbToWBC_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbToWBC_examples.md)** — annotated transcripts ([Part 1](wbToWBC_examples.md), [Part 2](wbToWBC_examples.md)).
5. **[Exhaustive simulation](wbToWBC_exhaustive_simulation.md)** · **[Live demo](wbToWBC_live_demo.md)**.

## 🔗 Related

- [`wbToWBC.md`](wbToWBC.md) — the command reference this hub orients you around.
- [`/wbValid`](../wbValid/README.md) — validate the conversion output.
- [`/wbAudit`](../wbAudit/README.md) — scored quality assessment of the result.

## Quick Reference

```bash
/wbToWBC src/MyComponent.vue            # convert a Vue component to WBC

/wbToWBC <file> --snap=<label>           # pin output to .wb/snaps/
```

---
---
← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

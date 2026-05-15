# wbMonetize — Practical Walkthrough

> How to generate monetization strategies for your project.

---

## 1. Analyze Monetization Options

```bash
/wbMonetize packages/my-lib
```

```text
[AI] Project: my-lib (Vue component library)
[AI] Audience: Enterprise frontend teams
[AI]
[AI] Recommended models:
[AI]   1. Open-core (score: 8/10) — free base + paid enterprise features
[AI]   2. Consulting (score: 7/10) — implementation services
[AI]   3. SaaS (score: 5/10) — hosted component playground
```

---

## 2. Deep-Dive on a Model

```bash
/wbMonetize packages/my-lib --model=open-core
```

Produces detailed pricing tiers, feature split, and implementation roadmap.

---

## 3. Competitive Pricing

```bash
/wbMonetize packages/my-lib --competitive
```

Compares against similar tools' pricing and positioning.

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| Full analysis | `/wbMonetize .` |
| Model deep-dive | `/wbMonetize . --model=saas` |
| Pricing research | `/wbMonetize . --competitive` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

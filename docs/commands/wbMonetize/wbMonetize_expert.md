# wbMonetize — Expert Architecture

> How `/wbMonetize` analyzes a project for monetization opportunities and generates revenue strategy documents.

---

## 1. System Role

`/wbMonetize` is a **strategy generator**. It reads the project's capabilities, audience, and competitive landscape to suggest monetization models.

| Property | Value |
|---|---|
| **Role** | 🧠 Planner (strategic) |
| **Input** | Folder path or project description |
| **Output** | Monetization strategy report |
| **Mutates files** | No (creates report only) |

---

## 2. Monetization Models

| Model | When Applicable |
|---|---|
| **Open-core** | Core OSS + paid premium features |
| **SaaS** | Hosted version of the tool |
| **Consulting** | Expert services around the tool |
| **Sponsorship** | Community-supported development |
| **Marketplace** | Plugin/theme ecosystem |
| **Dual license** | Free for OSS, paid for commercial |

---

## 3. Analysis Pipeline

```
Project scan → Audience analysis → Model fit → Revenue estimation → Strategy report
```

| Stage | Action |
|---|---|
| **Scan** | Read capabilities, user base, dependencies |
| **Audience** | Identify target segments |
| **Model fit** | Score each model for the project |
| **Revenue** | Estimate potential revenue per model |
| **Report** | Ranked recommendations with action items |

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| Full analysis | `/wbMonetize .` |
| Specific model | `/wbMonetize . --model=open-core` |
| Competitive pricing | `/wbMonetize . --competitive` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

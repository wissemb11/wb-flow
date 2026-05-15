# wbVision — Expert Architecture

> How `/wbVision` generates product vision documents and strategic roadmaps.

---

## 1. System Role

`/wbVision` is a **strategic planner**. It reads the current project state and generates a high-level product vision, feature roadmap, or competitive positioning document.

| Property | Value |
|---|---|
| **Role** | 🧠 Planner (strategic) |
| **Input** | Folder path or topic |
| **Output** | Vision report in `reports/YYYY/MM/DD/visions/` |
| **Mutates files** | No (creates report only) |

---

## 2. Vision Types

| Type | Flag | Output |
|---|---|---|
| **Product vision** | `--type=product` | Mission, goals, target audience |
| **Feature roadmap** | `--type=roadmap` | Prioritized feature list with timelines |
| **Competitive analysis** | `--type=competitive` | Market positioning, differentiators |

---

## 3. Input Sources

| Source | What It Reads |
|---|---|
| `context.md` | Project identity and goals |
| `package.json` | Current version and capabilities |
| Audit reports | Known gaps and opportunities |
| Idea registry | Captured ideas for prioritization |

---

## 4. Output Structure

```markdown
# Vision: <project>

## Mission
One-sentence purpose statement

## Target Audience
Who benefits and how

## Key Differentiators
What makes this unique

## Roadmap
Phase 1 → Phase 2 → Phase 3

## Success Metrics
How to measure progress
```

---

## 5. Integration

| Flow | Commands |
|---|---|
| Vision → Plan | `/wbVision .` then `/wbPlan . --from-vision` |
| Idea → Vision | `/wbIdea .` then `/wbVision . --type=roadmap` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

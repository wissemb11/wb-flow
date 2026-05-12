# Model Recommendations — Cross-Model Validation & Strategies

> Part 2 covers model-specific strengths, cross-model validation strategies, and how to override model suggestions in plan tables.

---

## 6. Model-Specific Strengths

### AI
| Strength | Description |
|---|---|
| **Complex reasoning** | Multi-step logical chains, architectural analysis |
| **Code generation** | Large, coherent code blocks with correct imports |
| **Instruction following** | Strict adherence to templates and formats |
| **Long output** | Can produce 4,000+ line outputs reliably |

### AI
| Strength | Description |
|---|---|
| **Large context window** | 1M+ tokens — can read entire codebases |
| **Multi-file analysis** | Excellent at cross-file dependency tracking |
| **Summarization** | Produces clear, structured summaries |
| **Cost efficiency** | Lower per-token cost than Opus for similar quality |

### Claude Sonnet 4.6
| Strength | Description |
|---|---|
| **Speed** | 2–3x faster than Opus for similar input sizes |
| **Formatting** | Clean markdown output, consistent tables |
| **Pattern following** | Excellent at reproducing established formats |
| **Cost** | 5x cheaper than Opus per token |

### DeepSeek V4
| Strength | Description |
|---|---|
| **Extreme cost efficiency** | 50–100x cheaper than Tier 1 models |
| **Code completion** | Strong at filling in well-defined patterns |
| **Translation** | Effective for mechanical content transformation |
| **Throughput** | High token-per-second rate |

---

## 7. Cross-Model Validation

The strongest quality signal comes from cross-model validation:

```
Worker: AI  →  Validator: AI
Worker: AI   →  Validator: AI
Worker: Sonnet 4.6       →  Validator: AI
```

### Why Cross-Model Works

| Factor | Same-Model | Cross-Model |
|---|---|---|
| **Blind spots** | Shared — same biases | Different — complementary perspectives |
| **Confidence** | May over-validate own patterns | Independent assessment |
| **Error detection** | Misses systematic errors | Catches model-specific mistakes |
| **Cost** | N/A | Adds ~$0.10 per validation |

### Recommended Pairings

| Worker | Validator | Why |
|---|---|---|
| AI | Gemini Pro | Different provider = maximum independence |
| Gemini Pro | AI | Same rationale, reversed |
| Sonnet 4.6 | Gemini Pro | Cost-effective worker + strong validator |
| DeepSeek V4 | Sonnet 4.6 | Budget pair for low-stakes tasks |

---

## 8. Overriding Model Suggestions

Plan tables include model suggestions, but they're not binding:

```markdown
| Worker (Suggested) | Validator (Suggested) |
|---|---|
| AI · ~$0.23 | AI |
```

To override, simply use a different model when executing:

```bash
# Plan suggests Opus, but you use Sonnet (to save cost)
/wbWork plan_*.md --task=5 --model="Sonnet 4.6"

# Plan suggests Gemini for validation, but you use Opus (for rigor)
/wbValid plan_*.md --task=5 --model="AI"
```

The plan table records which model **actually** executed the task, not which was suggested.

---

## 9. Model Selection Decision Tree

```
Is the task creating plans or analyzing architecture?
  YES → Tier 1 (Opus or Gemini Pro)
  NO  → Is the task modifying critical production code?
          YES → Tier 1
          NO  → Is the task documentation, formatting, or summaries?
                  YES → Tier 2 (Sonnet or DeepSeek)
                  NO  → Tier 2 (Sonnet for safety)
```

---

## 10. Budget Planning

When estimating plan budgets:

| Approach | Formula |
|---|---|
| **Conservative** | All tasks at Tier 1 prices |
| **Realistic** | 20% Tier 1 + 80% Tier 2 |
| **Aggressive** | All tasks at Tier 2 prices |

The plan table shows both options:
```markdown
| Worker (Suggested) |
| AI · ~$0.23 / Sonnet 4.6 · ~$0.06 |
```

Use the first (Tier 1) for critical tasks, the second (Tier 2) for routine work.

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)

# /wbDebug — Command Hub

`/wbDebug` is the root-cause engine. It investigates bugs by reading code, tracing data flow backward from the symptom, and identifying where reality diverged from intent. It produces a diagnosis with a fix recommendation — not the fix itself. The command exists to prevent the "try random things until the error goes away" pattern: every run must form an explicit hypothesis before touching any code.

## 🎯 Strategic Position

Most debugging commands guess. `/wbDebug` hypothesizes, then waits. The pause between hypothesis and fix is non-negotiable: the AI must state what + where + why, give you evidence to verify, and then wait for your confirmation before proposing a change.

- **After a crash** — paste the stack trace and get a root-cause hypothesis.
- **Before touching a file** — point at a suspect file and get a diagnosis grounded in recent reports.
- **When the hypothesis is wrong** — it reforms based on your evidence, no face-saving.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **Stack trace** | `/wbDebug "TypeError: Cannot read..."` | Hypothesis + location + evidence checklist |
| **File-scoped** | `/wbDebug packages/wb-core/src/App.vue` | Symptom hypothesis drawn from reports and code |
| **Description** | `/wbDebug "Form submits duplicate entries"` | Best-guess hypothesis (lower confidence) |

## ✅ What a useful debug contains

1. An **explicit hypothesis** — what + where + why. Specific. No hedging.
2. An **evidence-to-check list** — how you can verify or refute it.
3. A **wait gate** — no fix proposed until hypothesis is confirmed.
4. A **diagnosis report** written to `reports/`, not left in chat.
5. The **next command** to run (usually `/wbWork` to apply the fix).

If the AI skips hypothesis and jumps to fix, re-prompt: *"first tell me what you think is wrong and why."*

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Apply the fix | [`/wbWork`](../wbWork/README.md) |
| Verify the fix works | [`/wbTest`](../wbTest/README.md) |
| Audit overall quality | [`/wbAudit`](../wbAudit/README.md) |
| Test with runtime profiling | [`/wbTest --profile`](../wbTest/README.md) |

It also surfaces open architectural decisions rather than silently resolving them. A symptom that maps to an open decision gets a refusal, not a hack.

## 📚 Reading Order

1. **[ELI5](wbDebug_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbDebug_practical.md)** — step-by-step walkthrough on a real project.
3. **[Expert](wbDebug_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbDebug_examples.md)** — annotated debug transcripts (part [1](wbDebug_examples.md) · [2](wbDebug_examples.md)).
5. **[Exhaustive simulation](wbDebug_exhaustive_simulation.md)** · **[Live demo](wbDebug_live_demo.md)**.

## 🔗 Related

- [`wbDebug.md`](wbDebug.md) — the command reference this hub orients you around.
- [`/wbWork`](../wbWork/README.md) — applies the fix after diagnosis.
- [`/wbTest`](../wbTest/README.md) — verifies the fix resolves the bug.
- [`/wbAudit`](../wbAudit/README.md) — assesses overall code quality.

## Quick Reference

```bash
/wbDebug "TypeError: Cannot read property 'map' of undefined"  # stack trace
/wbDebug packages/wb-core/src/App.vue                            # file-scoped
/wbDebug "Form submits duplicate entries"                        # natural language

```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

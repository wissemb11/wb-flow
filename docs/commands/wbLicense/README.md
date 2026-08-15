# /wbLicense — Command Hub

`/wbLicense` is the WB-Labs licensing and compliance scanner. It reads project dependencies for license compatibility, generates SPDX headers for source files, and produces compliance reports — flagging incompatible combinations before they become legal liabilities. It also enforces the internal `__WBC_PRO__` tier-gating pattern across premium components.

## 🎯 Strategic Position

`/wbLicense` sits at the boundary between legal and technical. On the OSS side, it prevents you from shipping a package whose dependency tree contains a conflicting license. On the monorepo side, it ensures premium features are properly gated behind Pro/Dev tier checks — preventing free-tier users from wandering into paid functionality by accident.

- **After shipping a premium feature** — inject the gate on the new file before it reaches consumers.
- **Periodically (monthly)** — audit a package for tier leaks and pattern drift.
- **Before `/wbRelease`** — verify license compatibility across all dependencies.

## 🛠️ Operating Modes

| Mode | Trigger | Output |
|---|---|---|
| **File gate** | `/wbLicense <file>` | Injected `__WBC_PRO__` guard + `pro-required` event emission |
| **Folder audit** | `/wbLicense <folder>` | Tier-leak audit with findings ranked LEAK / INCONSISTENT / OK |
| **Self-correct** | `/wbLicense <previous_output_file>` | Verifies and repairs a prior compliance report in place |

## ✅ What a useful compliance report contains

1. Findings **ranked by severity** — LEAK (Pro code runs for Free users), INCONSISTENT (gate works but pattern differs), OK (correctly gated).
2. A **"what this audit did NOT check"** section — notably runtime bypass, server-side enforcement, business logic.
3. Specific **file and line references** for every gating issue found.
4. The **next command** to run.

## 🚫 What it cannot do

| Not this | Use instead |
|---|---|
| Runtime security enforcement | [`/wbSecure`](../wbSecure/README.md) |
| Code quality review | [`/wbAudit`](../wbAudit/README.md) |
| Decide which features are Pro | [`/wbVision`](../wbVision/README.md) |
| Change actual dependency licenses | Manual — `/wbLicense` only reports incompatible combinations |

`__WBC_PRO__` is a client-side convenience barrier. The server must enforce the same tier check independently for actual security. Do not confuse the two.

## 📚 Reading Order

1. **[ELI5](wbLicense_eli5.md)** — the one-paragraph mental model.
2. **[Practical](wbLicense_practical.md)** — step-by-step on a real project.
3. **[Expert](wbLicense_expert.md)** — architecture, edge cases, and when NOT to use.
4. **[Examples](wbLicense_examples.md)** — annotated transcripts from actual sessions.
5. **[Exhaustive simulation](wbLicense_exhaustive_simulation.md)** · **[Live demo](wbLicense_live_demo.md)**.

## 🔗 Related

- [`wbLicense.md`](wbLicense.md) — the command reference this hub orients you around.
- [`/wbSecure`](../wbSecure/README.md) — server-side security enforcement.
- [`/wbAudit`](../wbAudit/README.md) — code quality and ship-readiness.
- [`/wbVision`](../wbVision/README.md) — tier-level feature decisions.
- [`/wbNext`](../wbNext/README.md) — ranked next action after compliance work.

## Quick Reference

```bash
/wbLicense <file>          # inject __WBC_PRO__ gate on one file
/wbLicense <folder>        # audit a package for tier leaks
/wbLicense --scope <path>  # narrow the scan
```

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

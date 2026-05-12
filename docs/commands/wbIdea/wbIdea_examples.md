# /wbIdea — Examples

> `/wbIdea` is the system's structured incubator. These annotated transcripts demonstrate its application across three distinct scenarios: native ideation, automated intake from `/wbVision`, and the complete lifecycle from conception to execution planning. 
> *Context: We are operating within `packages/auth-service`.*

---

## Scenario 1: Native Ideation

```text
$ /wbIdea packages/auth-service

[AI] Analyzing context.md for auth-service...
[AI] Reviewing recent audit reports...
[AI]   - Note: Recent rate-limiting issues highlighted in last review.
[AI]
[AI] Generating scored ideas...
[AI] Writing reports/2026/05/08/ideas/idea_auth-service_20260508.md:
```

```markdown
# Idea Backlog: auth-service — 2026-05-08

## 💡 Ideas — AI-generated for auth-service *(AI via wb-flow — 09:15)*
> **Model:** AI
> **Date:** 2026-05-08

| # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 9 | 📄 | Implement Redis-based distributed rate limiting | P1 | 180 | AI via /wbIdea | ⬜ | ⬜ | — |
| 2 | 5 | 📄 | Add WebAuthn / Passkey support | P2 | 360 | AI via /wbIdea | ⬜ | ⬜ | — |
| 3 | 7 | 📄 | Standardize JWT error payload formats | P2 | 60 | AI via /wbIdea | ⬜ | ⬜ | — |
| 4 | 3 | 📄 | Create an admin dashboard for active sessions | P3 | 240 | AI via /wbIdea | ⬜ | ⬜ | — |
```

**Strategic Observations:**
- The AI correctly identified the rate-limiting weakness from context and scored Idea #1 exceptionally high (9) due to its immediate impact and urgency.
- Idea #2 (Passkeys) is high-value but complex, resulting in a moderate score (5). It's a great feature, but not an immediate priority.

---

## Scenario 2: Automated Intake via `/wbVision`

```text
$ /wbVision packages/payment-gateway

[AI] Generating strategic vision document...
[AI] Vision complete.
[AI] Auto-registering 3 concepts into the Ideas Pipeline...
[AI] Updated idea_payment-gateway_20260508.md
```

The resulting `idea_*.md` file immediately reflects the brainstormed concepts:

```markdown
## 💡 Ideas — /wbVision proposals *(AI via wb-flow — 11:30)*
> **Source:** [vision_payment-gateway_20260508.md](../visions/vision_payment-gateway_20260508.md)
> **Origin Command:** `/wbVision packages/payment-gateway/`
> **Ideas registered:** 3

| # | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 8 | 📄 | Seamless retry mechanism for transient gateway timeouts | P1 | 120 | AI via /wbVision | ⬜ | ⬜ | — |
| 2 | 6 | 📄 | Multi-currency dynamic conversion at checkout | P2 | 300 | AI via /wbVision | ⬜ | ⬜ | — |
| 3 | 4 | 📄 | Webhook delivery dashboard for merchants | P3 | 180 | AI via /wbVision | ⬜ | ⬜ | — |
```

**Strategic Observations:**
- Brainstorming is no longer ethereal. Every concept from `/wbVision` is instantly quantified and staged for validation, ensuring no strategic value is lost.

---

## Scenario 3: The Complete Lifecycle (Explore → Validate → Promote)

*Continuing with Idea #1 from the `payment-gateway`.*

### Phase A: Exploration

```text
$ /wbWork idea_payment-gateway_20260508.md --id=1

[AI] Analyzing Idea #1: "Seamless retry mechanism for transient gateway timeouts"
[AI] Conducting feasibility study...
[AI] Generating implementation sketch...
[AI] Writing ideas_reports/idea_1/idea_1_report_payment-gateway_20260508.md
[AI] Flagging ☐ Done as ✅
```

### Phase B: Strategic Validation

```text
$ /wbValid idea_payment-gateway_20260508.md --id=1

[AI] Reviewing exploration report for Idea #1...
[AI] Calculating Verdict...
[AI] Verdict Reached: 🎯 Promote (8/10)
[AI] Rationale: "Timeouts are currently causing a 2% drop in conversions. The proposed exponential backoff strategy is low-risk and high-reward."
[AI] Updating idea file... ☐ Valid set to: 🎯 Promoted 8/10
[AI] Initiating Promotion Protocol...
[AI]   → Ingesting into plan_payment-gateway_20260508.md as Task #4
[AI]   → Linking → Task column: [→ Plan #4](../plans/plan_payment-gateway_20260508.md)
```

### The Transformed Idea File:

```markdown
| [1](ideas_reports/idea_1/idea_1_report_payment-gateway_20260508.md) | 8 | 📄 | Seamless retry mechanism for transient gateway timeouts | P1 | 120 | AI via /wbVision | ✅<br>AI | 🎯 Promoted 8/10<br>AI | [→ Plan #4](../plans/plan_payment-gateway_20260508.md) |
```

### The Active Plan File (Auto-Ingested):

```markdown
| 4 | 💡 [/wbIdea #1](../ideas/idea_payment-gateway_20260508.md) | Seamless retry mechanism for transient gateway timeouts | /wbTest packages/payment-gateway --scope=task-4 | P1 | 120 | AI · ~$0.15 | AI | ⬜ | ⬜ |
```

**Strategic Observations:**
- The process is deterministic and highly disciplined. Ideas are not blindly executed; they are rigorously explored, validated, and *then* promoted into the execution pipeline, completely automating the transition from strategy to tactics.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

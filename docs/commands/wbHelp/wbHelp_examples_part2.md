# /wbHelp — Examples: Advanced Queries

> Part 2 covers advanced `/wbHelp` scenarios: help with flags, contextual help, and the `--help` intercept rule.

---

## Example 3: Help with `--help` Flag Intercept

Any `/wb*` command with `--help` or `-h` triggers the help router instead of executing:

```text
$ /wbPlan packages/wb-core --help

[AI] HELP INTERCEPT: Displaying help for /wbPlan instead of executing.
```

**Generated Output:** (same as `/wbHelp wbPlan`)

**Annotations:**
- This is the **HELP GATE** — documented in every command template between `<!-- HELP_GATE_START -->` and `<!-- HELP_GATE_END -->`.
- When intercepted, NO file reads, writes, or report generation occur.
- The intercept applies to `--help`, `-h`, and `--h` uniformly.

---

## Example 4: Contextual Help (Command + Scope)

```text
$ /wbHelp wbAudit packages/wb-core

[AI] Loading help for /wbAudit...
[AI] Enriching with context from packages/wb-core...
```

**Generated Output:**

```markdown
## /wbAudit — Help (scoped to wb-core)

### Context-Aware Suggestions
Based on `wb-core/context.md`:
- **Recommended profile:** `architecture` (wb-core is a foundational package)
- **Last audit:** 2026-05-09 (2 days ago, score: 8.5/10)
- **Known issues:** 3 open findings from previous audit

### Suggested Commands
/wbAudit packages/wb-core -p architecture    # re-audit architecture
/wbAudit packages/wb-core --plan             # audit + auto-plan for open findings
```

**Annotations:**
- Adding a scope to `/wbHelp` triggers **contextual help** — the output includes scope-specific suggestions.
- This reads `context.md` and recent reports to provide actionable recommendations.

---

## Example 5: Unknown Command

```text
$ /wbHelp wbDeploy

[AI] ❌ Unknown command: /wbDeploy
[AI] Did you mean one of these?
[AI]   /wbDebug — The Debugger & Root Cause Analyst
[AI]   /wbClean — The Janitor & Sanitization Agent
[AI] 
[AI] Type /wbHelp for the full command catalog.
```

**Annotations:**
- Fuzzy matching suggests the closest commands by Levenshtein distance.
- The error is non-fatal — help is always a safe operation.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

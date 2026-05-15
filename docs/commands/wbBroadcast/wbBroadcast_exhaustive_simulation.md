# wb-flow Protocol: /wbBroadcast Execution & Simulation Specification

This document defines the **exhaustive behavior matrix** for the `/wbBroadcast` command. It serves as the definitive reference for how the agent triggers cross-package notifications, dispatches multi-repository events, and fires webhooks.

---

## 1. Role & Definition Matrix
**Role:** The Event Dispatcher & Notification Agent
**Target:** Distributes messages, build statuses, and semantic events across external systems (Slack, Discord) and internal micro-frontends.
**Core Protocol:** Strict "Asynchronous Execution". The agent must fire and forget, ensuring that broadcasting never blocks the primary CI/CD pipeline or active development loop.

| Scenario | System Behavior |
|---|---|
| Target is Webhook | **[PROCEED]** Pings the specified external URL with a JSON payload of the event. |
| Target is Internal PubSub | **[PROCEED]** Dispatches a custom event to the `window` or internal message bus for other micro-frontends to consume. |
| Missing Payload | **[HALT]** Protocol forbids broadcasting empty messages. Command must contain `-m` or pipe input. |

---

## 2. Argument & Criteria Resolution Matrix
`/wbBroadcast` uses channel targeting to route payloads.

| Argument Type | Example | Parsing Logic | Simulated Output Profile |
|---|---|---|---|
| Natural Language String | `Command: /wbBroadcast "Deployment Successful"` | Parses string into a basic text payload. | Sends a generic notification to the default channel. |
| Specific Channel | `Command: /wbBroadcast "#engineering"` | Targets a specific Slack/Discord channel. | Routes the message to the specified team. |
| Comma-Separated | `Command: /wbBroadcast #ops,#dev` | Parses multiple channels. | Multicasts the payload to multiple destinations simultaneously. |
| Event Type | `Command: /wbBroadcast event:cache_invalidation` | Parses formal event syntax. | Triggers an internal architectural event across the monorepo. |

---

## 3. Flag Processing Matrix (Isolated Capabilities)

| Flag | Shortcut | Purpose | Example | Simulated Output Impact |
|---|---|---|---|---|
| `--message="<str>"`| `-m` | Explicitly defines the text payload of the broadcast. | `Command: /wbBroadcast #ops -m="Build Failed"` | `[MESSAGE] Formatting payload: { text: "Build Failed" }.` |
| `--data="<json>"` | `-d` | Attaches structured JSON data to the event (crucial for webhooks). | `Command: /wbBroadcast webhook -d='{"id": 402}'` | `[DATA] Attaching nested JSON payload to POST request.` |
| `--silent` | `-s` | Executes the broadcast without cluttering the agent's console output. | `Command: /wbBroadcast #dev -m="Ping" -s` | `[SILENT] (No output generated in terminal).` |
| `--dry-run` | `-D` | Formats the payload and lists targets without actually firing the network request. | `Command: /wbBroadcast #all -m="Test" -D` | `[DRY-RUN] Would send POST to https://hooks.slack.com/...` |

---

## 4. Omni-Channel Execution Pipeline (Flag Chaining)

### 💠 The "Massive Post-Release Broadcast" (`#dev,#ops,#product -m="..." -d="..."`)
**Context:** The tech lead has just successfully deployed `wbc-ui.com` to production. They want to notify all relevant teams simultaneously with structured release data.
**Command Executed:** `/wbBroadcast #dev,#ops,#product -m="Release v4.6.0 is Live" -d='{"version": "4.6.0", "status": "success"}'`
**Simulated Protocol Chain:**
1. Parses 3 distinct target channels.
2. Constructs the primary message string (`-m`).
3. Attaches structured metadata (`-d`).
4. Fires parallel asynchronous HTTP requests to Slack/Discord webhooks.
**Simulated Output:**
```markdown
> Command: /wbBroadcast #dev,#ops,#product -m="Release v4.6.0 is Live" -d='{...}'

[SYSTEM] Initiating Massive Cross-Channel Broadcast...
[PAYLOAD] Formatted JSON with message and metadata.
[DISPATCH] Firing webhook for #dev... 200 OK.
[DISPATCH] Firing webhook for #ops... 200 OK.
[DISPATCH] Firing webhook for #product... 200 OK.
[SUCCESS] Multi-channel broadcast complete.
```

### 💠 The "Internal Cache Invalidation" (`event:purge_cache -D`)
**Context:** An architect is testing an event that will force all micro-frontends to drop their local caches when the core library updates.
**Command Executed:** `/wbBroadcast event:purge_cache -D`
**Simulated Output:**
```markdown
> Command: /wbBroadcast event:purge_cache -D

[SYSTEM] Formatting internal PubSub event...
[DRY-RUN] Event Name: `wb:purge_cache`.
[DRY-RUN] Target: Global `window` and WebSocket message bus.
[DRY-RUN] Payload: `{ timestamp: 1714856000 }`
[SUCCESS] Dry-run complete. Run without -D to fire event.
```

---

## 5. Operational Edge Cases & Protocol Faults

| Fault Trigger | System Detection | Resolution / Output |
|---|---|---|
| Dead Webhook | HTTP request returns 404 or 401 Unauthorized. | `⚠️ Warning: Broadcast to #dev failed (HTTP 401). Check webhook URL.` |
| Malformed JSON | User passes invalid JSON to the `-d` flag. | `❌ Error: Cannot parse JSON payload. Escaping error at position 12.` |
| Network Timeout | API is unreachable after 5 seconds. | `⚠️ Warning: Broadcast timed out. Executed as fire-and-forget; pipeline continues.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

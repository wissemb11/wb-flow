# /wbBroadcast — Exhaustive Simulation ()

`/wbBroadcast` is the event dispatcher. It fires notifications across external systems (Slack, Discord, webhooks) and internal micro-frontends (PubSub events). The central constraint: **asynchronous, non-blocking.** Broadcasting never halts the CI/CD pipeline or the active development loop. It fires and reports, but a failed broadcast doesn't cascade into a build failure.

Read this if you want to know how channel targeting works, what the `-d` (data) flag carries versus the `-m` (message) flag, and why `/wbBroadcast` is the only command that makes external HTTP requests.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Event Dispatcher. Sends messages to external and internal systems. |
| **Target** | Webhook URLs, Slack/Discord channels, or internal PubSub event bus. |
| **Cell scope** | None. `/wbBroadcast` doesn't interact with plans or code. |
| **Side effects allowed** | HTTP POST requests to external services. Internal event dispatch. |
| **Side effects forbidden** | Modifying code, editing plans, altering local state. |

The "fire-and-forget" principle is deliberate. A Slack notification failing shouldn't break a release pipeline. `/wbBroadcast` reports the HTTP status (200, 401, 429) but never blocks on failure. The caller decides whether to retry.

---

## 2. Argument resolution

| Form | Example | What `/wbBroadcast` does |
|---|---|---|
| Natural language string | `Command: /wbBroadcast "Deployment Successful"` | Sends text to the default notification channel. |
| Channel target | `Command: /wbBroadcast "#engineering"` | Routes the message to a specific Slack/Discord channel. |
| Comma-separated | `Command: /wbBroadcast #ops,#dev` | Multicasts to multiple destinations simultaneously. |
| Event type | `Command: /wbBroadcast event:cache_invalidation` | Fires an internal architectural event across the micro-frontend bus. |

The `event:` prefix is the mode switch. Without it, `/wbBroadcast` sends a human-readable message to a chat channel. With it, it dispatches a machine-readable event to the internal PubSub system — consumed by `window.addEventListener('wb:cache_invalidation', ...)` in the micro-frontends.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--dry-run` | `-D` | Formats the payload and lists targets without firing the request. |

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbBroadcastSimPipelines = [
  {
    "title": "Post-release notification to all teams",
    "cmd": "/wbBroadcast #dev,#ops,#product -m=\"Release v4.6.0 is Live\" -d='{\"version\": \"4.6.0\", \"packages\": [\"wb-core\", \"wb-dataviewer\"], \"status\": \"success\"}'",
    "logs": [
      {
        "text": "[SYSTEM] Multicasting to 3 channels...",
        "type": "sys"
      },
      {
        "text": "[PAYLOAD] Message: \"Release v4.6.0 is Live\"",
        "type": "gen"
      },
      {
        "text": "Data: {\"version\": \"4.6.0\", \"packages\": [...], \"status\": \"success\"}",
        "type": "gen"
      },
      {
        "text": "[DISPATCH] #dev \u2192 200 OK (0.3s)",
        "type": "gen"
      },
      {
        "text": "[DISPATCH] #ops \u2192 200 OK (0.4s)",
        "type": "gen"
      },
      {
        "text": "[DISPATCH] #product \u2192 200 OK (0.2s)",
        "type": "gen"
      },
      {
        "text": "[OK] 3/3 channels notified successfully.",
        "type": "ok"
      }
    ],
    "note": "After a successful `/wbRelease`, notify engineering, ops, and product:",
    "noteType": "info"
  },
  {
    "title": "Internal cache purge event (dry-run first)",
    "cmd": "/wbBroadcast event:purge_cache -d='{\"scope\": \"wb-core\", \"reason\": \"v4.6.0 export surface changed\"}' -D",
    "logs": [
      {
        "text": "[DRY-RUN] Event: wb:purge_cache",
        "type": "warn"
      },
      {
        "text": "[DRY-RUN] Target: Global window + WebSocket message bus",
        "type": "warn"
      },
      {
        "text": "[DRY-RUN] Payload: {",
        "type": "warn"
      },
      {
        "text": "\"scope\": \"wb-core\",",
        "type": "gen"
      },
      {
        "text": "\"reason\": \"v4.6.0 export surface changed\",",
        "type": "gen"
      },
      {
        "text": "\"timestamp\": 1746403200",
        "type": "gen"
      },
      {
        "text": "}",
        "type": "gen"
      },
      {
        "text": "[DRY-RUN] Would dispatch to 4 registered listeners.",
        "type": "warn"
      },
      {
        "text": "[DRY-RUN] No requests fired. Run without -D to dispatch.",
        "type": "warn"
      }
    ],
    "note": "The core library updated. All micro-frontends need to drop their local caches. Test the event payload first:",
    "noteType": "info"
  },
  {
    "title": "Silent CI notification",
    "cmd": "/wbBroadcast #ci-notifications -m=\"wb-core build passed\" -s",
    "logs": [
      {
        "text": "(no console output \u2014 silent mode)",
        "type": "gen"
      },
      {
        "text": "[Internal: HTTP 200 to #ci-notifications]",
        "type": "gen"
      }
    ],
    "note": "In a CI pipeline, broadcast the build status without cluttering logs:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbBroadcast" titleSuffix="Exhaustive Simulation" :pipelines="wbBroadcastSimPipelines" />


### 💠 Pipeline Post-release notification to all teams

After a successful `/wbRelease`, notify engineering, ops, and product:


### 💠 Pipeline Internal cache purge event (dry-run first)

The core library updated. All micro-frontends need to drop their local caches. Test the event payload first:


### 💠 Pipeline Silent CI notification

In a CI pipeline, broadcast the build status without cluttering logs:

---

## 5. Edge cases & refusals

| Trigger | What `/wbBroadcast` does |
|---|---|
| No message and no data (`/wbBroadcast #dev`) | `❌ Empty payload. Use -m for text or -d for structured data.` |
| Dead webhook (HTTP 404) | `⚠️ Broadcast to #dev failed (HTTP 404). Check webhook URL. Pipeline continues.` |
| Malformed JSON in `-d` | `❌ Cannot parse JSON payload. Check escaping at position N.` |
| Network timeout (5s) | `⚠️ Broadcast timed out. Fire-and-forget — pipeline continues.` |
| Event type without `event:` prefix | Treated as a channel name. `/wbBroadcast cache_invalidation` → sends to `#cache_invalidation` channel, not the PubSub bus. |

The unifying principle: **`/wbBroadcast` is the only command that reaches outside the workspace.** Every other `/wb*` command operates on local files and local state. Broadcasting is the exit point — it tells the world what happened. That external scope is why it defaults to fire-and-forget: the workspace shouldn't depend on Slack being up.

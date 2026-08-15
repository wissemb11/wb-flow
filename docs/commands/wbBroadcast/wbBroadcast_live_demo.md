# /wbBroadcast — Live Demo ()

This is what `/wbBroadcast` actually does on `wb-labs` as the workspace stands today (2026-05-05). The matrix below mirrors the [exhaustive simulation](./wbBroadcast_exhaustive_simulation), but every cell is filled from the *live* state of the repo.

---

<CommandLiveDemoAnimation command="wbBroadcast" />

## 1. Live target

| Field | Live value |
|---|---|
| Configured channels | `#dev`, `#ops`, `#ci-notifications` (Slack webhooks in `.agents/config/`) |
| Internal PubSub | 4 micro-frontends listening: demo.wbc-ui.com, md.wbc-ui.com, wbc-ui.com, wb-press2.wbc-ui.com |
| Last broadcast | `wb-core v4.5.2 published` (2026-05-03, to #dev) |
| Pending events | wb-core WBC.js decomposition completed → cache purge needed |

---

## 2. What each argument resolves to today

| Argument | Live resolution |
|---|---|
| `/wbBroadcast #dev -m="wb-core row 3 complete"` | Sends text to #dev Slack channel. |
| `/wbBroadcast event:purge_cache -d='{"scope":"wb-core"}'` | Fires internal PubSub event to 4 micro-frontends. |
| `/wbBroadcast #dev,#ops -m="Plan complete"` | Multicast to both channels simultaneously. |

---

## 3. Pipelines on this exact workspace

<script setup>
const wbBroadcastPipelines = [
  {
    "title": "Notify team after completing wb-core plan",
    "cmd": "/wbBroadcast #dev -m=\"wb-core plan complete: JWT handshake, renderString escape, WBC.js decomposition all done. Pending validation on row 3.\"",
    "logs": [
      {
        "text": "[SYSTEM] Single-channel broadcast to #dev.",
        "type": "sys"
      },
      {
        "text": "[PAYLOAD] Text: \"wb-core plan complete: JWT handshake, renderString escape, WBC.js decomposition all done. Pending validation on row 3.\"",
        "type": "gen"
      },
      {
        "text": "[DISPATCH] #dev \u2192 200 OK (0.3s)",
        "type": "gen"
      },
      {
        "text": "[OK] Broadcast sent.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Cache purge after WBC.js decomposition",
    "cmd": "/wbBroadcast event:purge_cache -d='{\"scope\": \"wb-core\", \"reason\": \"WBC.js decomposed into WBC.core.js + WBC.events.js\", \"affected_exports\": [\"initWBC\", \"delegateEvent\"]}'",
    "logs": [
      {
        "text": "[SYSTEM] Internal PubSub event dispatch.",
        "type": "sys"
      },
      {
        "text": "[EVENT] wb:purge_cache",
        "type": "gen"
      },
      {
        "text": "[TARGETS] 4 registered listeners:",
        "type": "gen"
      },
      {
        "text": "- demo.wbc-ui.com \u2192 dispatched",
        "type": "gen"
      },
      {
        "text": "- md.wbc-ui.com \u2192 dispatched",
        "type": "gen"
      },
      {
        "text": "- wbc-ui.com \u2192 dispatched",
        "type": "gen"
      },
      {
        "text": "- wb-press2.wbc-ui.com \u2192 dispatched",
        "type": "gen"
      },
      {
        "text": "[OK] Event fired to 4 consumers.",
        "type": "ok"
      }
    ],
    "note": "The WBC.js decomposition changed the export surface. Micro-frontends that import from `wb-core` need to drop their caches:",
    "noteType": "info"
  },
  {
    "title": "Dry-run before multicast",
    "cmd": "/wbBroadcast #dev,#ops,#ci-notifications -m=\"wb-core v4.6.0 ready for release\" -D",
    "logs": [
      {
        "text": "[DRY-RUN] Targets: #dev, #ops, #ci-notifications",
        "type": "warn"
      },
      {
        "text": "[DRY-RUN] Payload: { text: \"wb-core v4.6.0 ready for release\" }",
        "type": "warn"
      },
      {
        "text": "[DRY-RUN] Would fire 3 HTTP POST requests.",
        "type": "warn"
      },
      {
        "text": "[DRY-RUN] No requests sent. Run without -D to broadcast.",
        "type": "warn"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbBroadcast" :pipelines="wbBroadcastPipelines" />


### 💠 Pipeline Notify team after completing wb-core plan


### 💠 Pipeline Cache purge after WBC.js decomposition

The WBC.js decomposition changed the export surface. Micro-frontends that import from `wb-core` need to drop their caches:


### 💠 Pipeline Dry-run before multicast

---

## 4. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbBroadcast #dev` (no message) | `❌ Empty payload. Use -m or -d.` |
| `/wbBroadcast #unknown-channel -m="test"` | `⚠️ Channel #unknown-channel not configured. Available: #dev, #ops, #ci-notifications.` |
| `/wbBroadcast event:purge_cache` (no -d) | Proceeds with empty data payload. Event fires with just the timestamp. Not a refusal — events can be signals without data. |

The pattern: **`/wbBroadcast` is the workspace's outward voice.** It tells external systems and internal consumers what happened. Fire-and-forget by design — a failed broadcast never blocks work.
